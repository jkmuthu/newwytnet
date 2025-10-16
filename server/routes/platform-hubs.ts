import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { 
  platformHubs,
  platformHubAdmins,
  users,
  roles,
  insertPlatformHubSchema,
  type PlatformHub,
} from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { adminAuthMiddleware } from "../customAuth";
import { requirePermission } from "../permission-middleware";

const router = Router();

// Helper function to generate Display IDs
async function generateDisplayId(prefix: string): Promise<string> {
  const sequenceName = `${prefix.toLowerCase()}_seq`;
  const result = await db.execute(sql`
    SELECT nextval('${sql.raw(sequenceName)}') as next_id
  `);
  const nextId = Number(result.rows[0]?.next_id || 1);
  return `${prefix}${String(nextId).padStart(7, '0')}`;
}

// ============================================
// PLATFORM HUBS MANAGEMENT
// ============================================

// GET /api/admin/platform-hubs - Get all platform hubs
router.get("/admin/platform-hubs", adminAuthMiddleware, requirePermission('hubs', 'view'), async (req, res) => {
  try {
    const allHubs = await db
      .select()
      .from(platformHubs)
      .orderBy(desc(platformHubs.createdAt));

    // Fetch admins for each hub
    const hubsWithAdmins = await Promise.all(
      allHubs.map(async (hub) => {
        const admins = await db
          .select({
            id: platformHubAdmins.id,
            userId: platformHubAdmins.userId,
            userName: users.name,
            userEmail: users.email,
            roleId: platformHubAdmins.roleId,
            roleName: roles.name,
            isActive: platformHubAdmins.isActive,
            assignedAt: platformHubAdmins.createdAt,
          })
          .from(platformHubAdmins)
          .leftJoin(users, eq(users.id, platformHubAdmins.userId))
          .leftJoin(roles, eq(roles.id, platformHubAdmins.roleId))
          .where(eq(platformHubAdmins.hubId, hub.id));

        return {
          ...hub,
          admins,
          adminCount: admins.length,
        };
      })
    );

    res.json({ success: true, hubs: hubsWithAdmins });
  } catch (error) {
    console.error("Error fetching platform hubs:", error);
    res.status(500).json({ success: false, error: "Failed to fetch platform hubs" });
  }
});

// GET /api/admin/platform-hubs/:id - Get hub by ID
router.get("/admin/platform-hubs/:id", adminAuthMiddleware, requirePermission('hubs', 'view'), async (req, res) => {
  try {
    const [hub] = await db
      .select()
      .from(platformHubs)
      .where(eq(platformHubs.id, req.params.id))
      .limit(1);

    if (!hub) {
      return res.status(404).json({ success: false, error: "Hub not found" });
    }

    // Fetch hub admins with user details
    const admins = await db
      .select({
        id: platformHubAdmins.id,
        userId: platformHubAdmins.userId,
        userName: users.name,
        userEmail: users.email,
        userProfileImage: users.profileImageUrl,
        roleId: platformHubAdmins.roleId,
        roleName: roles.name,
        roleDescription: roles.description,
        isActive: platformHubAdmins.isActive,
        assignedBy: platformHubAdmins.assignedBy,
        assignedAt: platformHubAdmins.createdAt,
      })
      .from(platformHubAdmins)
      .leftJoin(users, eq(users.id, platformHubAdmins.userId))
      .leftJoin(roles, eq(roles.id, platformHubAdmins.roleId))
      .where(eq(platformHubAdmins.hubId, hub.id));

    res.json({
      success: true,
      hub: {
        ...hub,
        admins,
      },
    });
  } catch (error) {
    console.error("Error fetching hub:", error);
    res.status(500).json({ success: false, error: "Failed to fetch hub" });
  }
});

// POST /api/admin/platform-hubs - Create new hub
router.post("/admin/platform-hubs", adminAuthMiddleware, requirePermission('hubs', 'create'), async (req, res) => {
  try {
    const validatedData = insertPlatformHubSchema.parse(req.body);
    
    // Generate Display ID
    const displayId = await generateDisplayId("PH");

    const [newHub] = await db
      .insert(platformHubs)
      .values({
        ...validatedData,
        displayId,
      })
      .returning();

    res.json({ success: true, hub: newHub });
  } catch (error: any) {
    console.error("Error creating hub:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors });
    }
    if (error.code === "23505") {
      return res.status(409).json({ 
        success: false, 
        error: "Hub with this slug, domain, or subdomain already exists" 
      });
    }
    res.status(500).json({ success: false, error: "Failed to create hub" });
  }
});

// PUT /api/admin/platform-hubs/:id - Update hub
router.put("/admin/platform-hubs/:id", adminAuthMiddleware, requirePermission('hubs', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = insertPlatformHubSchema.partial().parse(req.body);

    const [updatedHub] = await db
      .update(platformHubs)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(platformHubs.id, id))
      .returning();

    if (!updatedHub) {
      return res.status(404).json({ success: false, error: "Hub not found" });
    }

    res.json({ success: true, hub: updatedHub });
  } catch (error: any) {
    console.error("Error updating hub:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors });
    }
    if (error.code === "23505") {
      return res.status(409).json({ 
        success: false, 
        error: "Hub with this slug, domain, or subdomain already exists" 
      });
    }
    res.status(500).json({ success: false, error: "Failed to update hub" });
  }
});

// DELETE /api/admin/platform-hubs/:id - Delete hub
router.delete("/admin/platform-hubs/:id", adminAuthMiddleware, requirePermission('hubs', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const [hub] = await db
      .select()
      .from(platformHubs)
      .where(eq(platformHubs.id, id))
      .limit(1);

    if (!hub) {
      return res.status(404).json({ success: false, error: "Hub not found" });
    }

    await db.delete(platformHubs).where(eq(platformHubs.id, id));

    res.json({ success: true, message: "Hub deleted successfully" });
  } catch (error) {
    console.error("Error deleting hub:", error);
    res.status(500).json({ success: false, error: "Failed to delete hub" });
  }
});

// ============================================
// PLATFORM HUB ADMINS MANAGEMENT
// ============================================

// POST /api/admin/platform-hubs/:hubId/admins - Assign admin to hub
router.post("/admin/platform-hubs/:hubId/admins", adminAuthMiddleware, requirePermission('hubs', 'configure'), async (req, res) => {
  try {
    const { hubId } = req.params;
    const { userId, roleId } = z.object({
      userId: z.string(),
      roleId: z.string().uuid().optional(),
    }).parse(req.body);

    const assignedBy = (req as any).user?.id || null;

    // Verify hub exists
    const [hub] = await db
      .select()
      .from(platformHubs)
      .where(eq(platformHubs.id, hubId))
      .limit(1);

    if (!hub) {
      return res.status(404).json({ success: false, error: "Hub not found" });
    }

    // Verify user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check if already assigned
    const existing = await db
      .select()
      .from(platformHubAdmins)
      .where(
        and(
          eq(platformHubAdmins.hubId, hubId),
          eq(platformHubAdmins.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: "User is already an admin of this hub" 
      });
    }

    // Assign admin
    const [newAdmin] = await db
      .insert(platformHubAdmins)
      .values({
        hubId,
        userId,
        roleId: roleId || null,
        assignedBy,
        isActive: true,
      })
      .returning();

    res.json({ 
      success: true, 
      admin: newAdmin,
      message: "Admin assigned to hub successfully",
    });
  } catch (error: any) {
    console.error("Error assigning admin:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to assign admin" });
  }
});

// PUT /api/admin/platform-hubs/:hubId/admins/:adminId - Update hub admin
router.put("/admin/platform-hubs/:hubId/admins/:adminId", adminAuthMiddleware, requirePermission('hubs', 'configure'), async (req, res) => {
  try {
    const { hubId, adminId } = req.params;
    const { roleId, isActive } = z.object({
      roleId: z.string().uuid().optional(),
      isActive: z.boolean().optional(),
    }).parse(req.body);

    const updateData: any = {};
    if (roleId !== undefined) updateData.roleId = roleId;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedAdmin] = await db
      .update(platformHubAdmins)
      .set(updateData)
      .where(
        and(
          eq(platformHubAdmins.id, adminId),
          eq(platformHubAdmins.hubId, hubId)
        )
      )
      .returning();

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, error: "Hub admin not found" });
    }

    res.json({ success: true, admin: updatedAdmin });
  } catch (error: any) {
    console.error("Error updating hub admin:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to update hub admin" });
  }
});

// DELETE /api/admin/platform-hubs/:hubId/admins/:adminId - Remove admin from hub
router.delete("/admin/platform-hubs/:hubId/admins/:adminId", adminAuthMiddleware, requirePermission('hubs', 'configure'), async (req, res) => {
  try {
    const { hubId, adminId } = req.params;

    await db
      .delete(platformHubAdmins)
      .where(
        and(
          eq(platformHubAdmins.id, adminId),
          eq(platformHubAdmins.hubId, hubId)
        )
      );

    res.json({ success: true, message: "Admin removed from hub" });
  } catch (error) {
    console.error("Error removing admin:", error);
    res.status(500).json({ success: false, error: "Failed to remove admin" });
  }
});

// GET /api/admin/users/:userId/platform-hubs - Get all hubs for a user
router.get("/admin/users/:userId/platform-hubs", adminAuthMiddleware, requirePermission('hubs', 'view'), async (req, res) => {
  try {
    const { userId } = req.params;

    const userHubs = await db
      .select({
        hub: platformHubs,
        roleId: platformHubAdmins.roleId,
        roleName: roles.name,
        isActive: platformHubAdmins.isActive,
        assignedAt: platformHubAdmins.createdAt,
      })
      .from(platformHubAdmins)
      .innerJoin(platformHubs, eq(platformHubs.id, platformHubAdmins.hubId))
      .leftJoin(roles, eq(roles.id, platformHubAdmins.roleId))
      .where(eq(platformHubAdmins.userId, userId));

    res.json({ success: true, hubs: userHubs });
  } catch (error) {
    console.error("Error fetching user hubs:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user hubs" });
  }
});

export default router;
