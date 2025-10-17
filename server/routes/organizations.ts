import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { 
  organizations,
  organizationMembers,
} from "@shared/schema";
import { eq, desc, sql, ilike, or } from "drizzle-orm";
import { adminAuthMiddleware } from "../customAuth";
import { requirePermission } from "../permission-middleware";

const router = Router();

// GET /api/admin/organizations - Get all organizations
router.get("/admin/organizations", adminAuthMiddleware, requirePermission('organizations', 'view'), async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = db
      .select({
        id: organizations.id,
        displayId: organizations.displayId,
        name: organizations.name,
        slug: organizations.slug,
        status: organizations.status,
        industry: organizations.industry,
        employees: organizations.employees,
        website: organizations.website,
        email: organizations.email,
        phone: organizations.phone,
        location: organizations.location,
        createdAt: organizations.createdAt,
        ownerId: organizations.ownerId,
        tenantId: organizations.tenantId,
      })
      .from(organizations);

    if (search && typeof search === 'string') {
      query = query.where(
        or(
          ilike(organizations.name, `%${search}%`),
          ilike(organizations.email, `%${search}%`),
          ilike(organizations.industry, `%${search}%`)
        )
      ) as any;
    }

    const allOrgs = await query.orderBy(desc(organizations.createdAt));

    // Get member counts for each org
    const orgsWithCounts = await Promise.all(
      allOrgs.map(async (org) => {
        const memberCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(organizationMembers)
          .where(eq(organizationMembers.organizationId, org.id));
        
        return {
          ...org,
          teamMembers: Number(memberCount[0]?.count || 0),
        };
      })
    );

    res.json({ success: true, organizations: orgsWithCounts });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ success: false, error: "Failed to fetch organizations" });
  }
});

// GET /api/admin/organizations/:id - Get organization by ID
router.get("/admin/organizations/:id", adminAuthMiddleware, requirePermission('organizations', 'view'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    if (!org) {
      return res.status(404).json({ success: false, error: "Organization not found" });
    }

    // Get members
    const members = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, id));

    res.json({ success: true, organization: { ...org, members } });
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ success: false, error: "Failed to fetch organization" });
  }
});

// POST /api/admin/organizations - Create new organization
router.post("/admin/organizations", adminAuthMiddleware, requirePermission('organizations', 'create'), async (req, res) => {
  try {
    const { name, slug, industry, employees, website, email, phone, location, ownerId } = req.body;
    
    // Generate display ID
    const result = await db.execute(sql`SELECT nextval('or_seq') as next_id`);
    const nextId = Number(result.rows[0]?.next_id || 1);
    const displayId = `OR${String(nextId).padStart(5, '0')}`;

    const [newOrg] = await db
      .insert(organizations)
      .values({
        displayId,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        industry,
        employees,
        website,
        email,
        phone,
        location,
        ownerId,
        tenantId: (req.user as any)?.tenantId || null,
        status: 'active',
      })
      .returning();

    res.json({ success: true, organization: newOrg });
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({ success: false, error: "Failed to create organization" });
  }
});

// PUT /api/admin/organizations/:id - Update organization
router.put("/admin/organizations/:id", adminAuthMiddleware, requirePermission('organizations', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, industry, employees, website, email, phone, location, status } = req.body;
    
    const [updated] = await db
      .update(organizations)
      .set({
        name,
        industry,
        employees,
        website,
        email,
        phone,
        location,
        status,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, error: "Organization not found" });
    }

    res.json({ success: true, organization: updated });
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({ success: false, error: "Failed to update organization" });
  }
});

// DELETE /api/admin/organizations/:id - Delete organization
router.delete("/admin/organizations/:id", adminAuthMiddleware, requirePermission('organizations', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.delete(organizations).where(eq(organizations.id, id));

    res.json({ success: true, message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({ success: false, error: "Failed to delete organization" });
  }
});

export default router;
