import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { 
  roles, 
  permissions, 
  rolePermissions, 
  userRoles,
  insertRoleSchema,
  insertPermissionSchema,
  type Role,
  type Permission,
} from "@shared/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
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
// ROLES MANAGEMENT
// ============================================

// GET /api/admin/roles - Get all roles
router.get("/admin/roles", adminAuthMiddleware, requirePermission('roles-permissions', 'view'), async (req, res) => {
  try {
    const allRoles = await db
      .select()
      .from(roles)
      .orderBy(roles.createdAt);

    // Fetch permissions for each role
    const rolesWithPermissions = await Promise.all(
      allRoles.map(async (role) => {
        const rolePerms = await db
          .select({
            permission: permissions,
          })
          .from(rolePermissions)
          .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
          .where(eq(rolePermissions.roleId, role.id));

        return {
          ...role,
          permissions: rolePerms.map((rp) => rp.permission),
        };
      })
    );

    res.json({ success: true, roles: rolesWithPermissions });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ success: false, error: "Failed to fetch roles" });
  }
});

// GET /api/admin/roles/list - Get simplified list of engine roles (for dropdowns)
router.get("/admin/roles/list", adminAuthMiddleware, async (req, res) => {
  try {
    const engineRoles = await db
      .select({
        id: roles.id,
        displayId: roles.displayId,
        name: roles.name,
        description: roles.description,
        scope: roles.scope,
      })
      .from(roles)
      .where(eq(roles.scope, 'engine'))
      .orderBy(roles.name);

    res.json({
      success: true,
      roles: engineRoles
    });
  } catch (error) {
    console.error("Error fetching roles list:", error);
    res.status(500).json({ success: false, error: "Failed to fetch roles" });
  }
});

// GET /api/admin/roles/:id - Get role by ID
router.get("/admin/roles/:id", adminAuthMiddleware, requirePermission('roles-permissions', 'view'), async (req, res) => {
  try {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, req.params.id))
      .limit(1);

    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    // Fetch role permissions
    const rolePerms = await db
      .select({
        permission: permissions,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(eq(rolePermissions.roleId, role.id));

    // Fetch users with this role
    const usersWithRole = await db
      .select({
        userId: userRoles.userId,
        assignedAt: userRoles.createdAt,
        expiresAt: userRoles.expiresAt,
      })
      .from(userRoles)
      .where(eq(userRoles.roleId, role.id));

    res.json({
      success: true,
      role: {
        ...role,
        permissions: rolePerms.map((rp) => rp.permission),
        users: usersWithRole,
      },
    });
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ success: false, error: "Failed to fetch role" });
  }
});

// POST /api/admin/roles - Create new role
router.post("/admin/roles", adminAuthMiddleware, requirePermission('roles-permissions', 'create'), async (req, res) => {
  try {
    const validatedData = insertRoleSchema.parse(req.body);
    
    // Generate Display ID
    const displayId = await generateDisplayId("RL");

    const [newRole] = await db
      .insert(roles)
      .values({
        ...validatedData,
        displayId,
      })
      .returning();

    res.json({ success: true, role: newRole });
  } catch (error: any) {
    console.error("Error creating role:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to create role" });
  }
});

// PUT /api/admin/roles/:id - Update role
router.put("/admin/roles/:id", adminAuthMiddleware, requirePermission('roles-permissions', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = insertRoleSchema.partial().parse(req.body);

    const [updatedRole] = await db
      .update(roles)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();

    if (!updatedRole) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    res.json({ success: true, role: updatedRole });
  } catch (error: any) {
    console.error("Error updating role:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to update role" });
  }
});

// DELETE /api/admin/roles/:id - Delete role
router.delete("/admin/roles/:id", adminAuthMiddleware, requirePermission('roles-permissions', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role is system role
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    if (role.isSystem) {
      return res.status(403).json({ 
        success: false, 
        error: "Cannot delete system roles" 
      });
    }

    await db.delete(roles).where(eq(roles.id, id));

    res.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ success: false, error: "Failed to delete role" });
  }
});

// ============================================
// ROLE PERMISSIONS MANAGEMENT
// ============================================

// POST /api/admin/roles/:id/permissions - Assign permissions to role
router.post("/admin/roles/:roleId/permissions", adminAuthMiddleware, requirePermission('roles-permissions', 'edit'), async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = z.object({
      permissionIds: z.array(z.string().uuid()),
    }).parse(req.body);

    // Verify role exists
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    // Remove existing permissions for this role
    await db
      .delete(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));

    // Add new permissions
    if (permissionIds.length > 0) {
      const values = permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      }));

      await db.insert(rolePermissions).values(values);
    }

    res.json({ 
      success: true, 
      message: `Assigned ${permissionIds.length} permissions to role`,
    });
  } catch (error: any) {
    console.error("Error assigning permissions:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to assign permissions" });
  }
});

// ============================================
// PERMISSIONS MANAGEMENT
// ============================================

// GET /api/admin/permissions - Get all permissions
router.get("/admin/permissions", adminAuthMiddleware, async (req, res) => {
  try {
    const allPermissions = await db
      .select()
      .from(permissions)
      .orderBy(permissions.resource, permissions.action);

    // Group permissions by resource
    const groupedPermissions = allPermissions.reduce((acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);

    res.json({ 
      success: true, 
      permissions: allPermissions,
      grouped: groupedPermissions,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch permissions" });
  }
});

// POST /api/admin/permissions - Create new permission (rarely used)
router.post("/admin/permissions", adminAuthMiddleware, async (req, res) => {
  try {
    const validatedData = insertPermissionSchema.parse(req.body);
    
    // Generate Display ID
    const displayId = await generateDisplayId("PM");

    const [newPermission] = await db
      .insert(permissions)
      .values({
        ...validatedData,
        displayId,
      })
      .returning();

    res.json({ success: true, permission: newPermission });
  } catch (error: any) {
    console.error("Error creating permission:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to create permission" });
  }
});

// ============================================
// USER ROLES MANAGEMENT
// ============================================

// GET /api/admin/users/:userId/roles - Get user's roles
router.get("/admin/users/:userId/roles", adminAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const userRolesData = await db
      .select({
        role: roles,
        assignedAt: userRoles.createdAt,
        expiresAt: userRoles.expiresAt,
      })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(eq(userRoles.userId, userId));

    // Fetch all permissions for the user's roles
    const userPermissions = await db
      .select({
        permission: permissions,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(
        inArray(
          rolePermissions.roleId,
          userRolesData.map((ur) => ur.role.id)
        )
      );

    res.json({
      success: true,
      roles: userRolesData,
      permissions: userPermissions.map((up) => up.permission),
    });
  } catch (error) {
    console.error("Error fetching user roles:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user roles" });
  }
});

// POST /api/admin/users/:userId/roles - Assign roles to user
router.post("/admin/users/:userId/roles", adminAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleIds, expiresAt } = z.object({
      roleIds: z.array(z.string().uuid()),
      expiresAt: z.string().datetime().optional(),
    }).parse(req.body);

    const assignedBy = (req as any).user?.id || null;

    // Remove existing roles for this user
    await db
      .delete(userRoles)
      .where(eq(userRoles.userId, userId));

    // Add new roles
    if (roleIds.length > 0) {
      const values = roleIds.map((roleId) => ({
        userId,
        roleId,
        assignedBy,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }));

      await db.insert(userRoles).values(values);
    }

    res.json({ 
      success: true, 
      message: `Assigned ${roleIds.length} roles to user`,
    });
  } catch (error: any) {
    console.error("Error assigning roles to user:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to assign roles" });
  }
});

// DELETE /api/admin/users/:userId/roles/:roleId - Remove role from user
router.delete("/admin/users/:userId/roles/:roleId", adminAuthMiddleware, async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    await db
      .delete(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        )
      );

    res.json({ success: true, message: "Role removed from user" });
  } catch (error) {
    console.error("Error removing role from user:", error);
    res.status(500).json({ success: false, error: "Failed to remove role" });
  }
});

export default router;
