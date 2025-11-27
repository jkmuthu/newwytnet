import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { 
  organizations,
  organizationMembers,
  users,
} from "@shared/schema";
import { eq, desc, sql, ilike, or, and } from "drizzle-orm";
import { adminAuthMiddleware, isAuthenticatedUnified } from "../customAuth";
import { requirePermission } from "../permission-middleware";

const router = Router();

// Schema for organization creation/update
const createOrganizationSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  orgType: z.enum(['Proprietorship', 'Partnership', 'LLP', 'Pvt Ltd', 'Public Ltd', 'Trust / NGO']),
  businessTypes: z.array(z.enum(['Manufacturer', 'Retail Outlet', 'Merchant / Trader', 'Exporter', 'Service Provider'])).min(1),
  location: z.string().min(1),
  locationDetails: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    address: z.string().optional(),
    placeId: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
  email: z.string().email(),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.string().optional(),
});

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// ========================================
// USER ORGANIZATION ROUTES (Panel)
// ========================================

// GET /api/user/organizations - Get organizations for logged in user
router.get("/user/organizations", isAuthenticatedUnified, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    // Get organizations where user is owner
    const ownedOrgs = await db
      .select({
        id: organizations.id,
        displayId: organizations.displayId,
        name: organizations.name,
        slug: organizations.slug,
        description: organizations.description,
        logo: organizations.logo,
        status: organizations.status,
        orgType: organizations.orgType,
        businessTypes: organizations.businessTypes,
        email: organizations.email,
        website: organizations.website,
        location: organizations.location,
        locationDetails: organizations.locationDetails,
        createdAt: organizations.createdAt,
        ownerId: organizations.ownerId,
      })
      .from(organizations)
      .where(eq(organizations.ownerId, userId))
      .orderBy(desc(organizations.createdAt));

    // Get organizations where user is a member
    const memberOrgs = await db
      .select({
        id: organizations.id,
        displayId: organizations.displayId,
        name: organizations.name,
        slug: organizations.slug,
        description: organizations.description,
        logo: organizations.logo,
        status: organizations.status,
        orgType: organizations.orgType,
        businessTypes: organizations.businessTypes,
        email: organizations.email,
        website: organizations.website,
        location: organizations.location,
        locationDetails: organizations.locationDetails,
        createdAt: organizations.createdAt,
        ownerId: organizations.ownerId,
        role: organizationMembers.role,
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
      .where(and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.isActive, true)
      ))
      .orderBy(desc(organizations.createdAt));

    // Combine and mark roles
    const allOrgs = [
      ...ownedOrgs.map(org => ({ ...org, role: 'owner' as const, memberCount: 1 })),
      ...memberOrgs.filter(org => org.ownerId !== userId).map(org => ({ ...org, memberCount: 1 }))
    ];

    res.json({ success: true, organizations: allOrgs });
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    res.status(500).json({ success: false, error: "Failed to fetch organizations" });
  }
});

// GET /api/user/organizations/:id - Get specific organization for user
router.get("/user/organizations/:id", isAuthenticatedUnified, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    if (!org) {
      return res.status(404).json({ success: false, error: "Organization not found" });
    }

    // Check if user has access (owner or member)
    const isOwner = org.ownerId === userId;
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, id),
        eq(organizationMembers.userId, userId)
      ))
      .limit(1);

    if (!isOwner && !membership) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    res.json({ 
      success: true, 
      organization: {
        ...org,
        role: isOwner ? 'owner' : membership?.role || 'member'
      }
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ success: false, error: "Failed to fetch organization" });
  }
});

// POST /api/user/organizations - Create new organization for user
router.post("/user/organizations", isAuthenticatedUnified, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    // Validate request body
    const validationResult = createOrganizationSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        error: "Validation failed",
        details: validationResult.error.errors
      });
    }

    const data = validationResult.data;
    
    // Generate slug
    let slug = generateSlug(data.name);
    
    // Check if slug exists, append number if needed
    const existingSlugs = await db
      .select({ slug: organizations.slug })
      .from(organizations)
      .where(ilike(organizations.slug, `${slug}%`));
    
    if (existingSlugs.length > 0) {
      const slugSet = new Set(existingSlugs.map(o => o.slug));
      let counter = 1;
      while (slugSet.has(slug)) {
        slug = `${generateSlug(data.name)}-${counter}`;
        counter++;
      }
    }

    // Generate display ID
    let displayId = 'OR00001';
    try {
      const result = await db.execute(sql`SELECT nextval('or_seq') as next_id`);
      const nextId = Number(result.rows[0]?.next_id || 1);
      displayId = `OR${String(nextId).padStart(5, '0')}`;
    } catch (e) {
      // Sequence might not exist, create a fallback
      const orgCount = await db.select({ count: sql<number>`count(*)` }).from(organizations);
      displayId = `OR${String((orgCount[0]?.count || 0) + 1).padStart(5, '0')}`;
    }

    const [newOrg] = await db
      .insert(organizations)
      .values({
        displayId,
        name: data.name,
        slug,
        description: data.description || null,
        logo: data.logo || null,
        orgType: data.orgType,
        businessTypes: data.businessTypes,
        email: data.email,
        website: data.website || null,
        location: data.location,
        locationDetails: data.locationDetails || {},
        ownerId: userId,
        status: 'active',
        isActive: true,
      })
      .returning();

    // Add owner as organization member
    await db.insert(organizationMembers).values({
      organizationId: newOrg.id,
      userId,
      role: 'owner',
      isActive: true,
    });

    res.json({ success: true, organization: { ...newOrg, role: 'owner' } });
  } catch (error: any) {
    console.error("Error creating organization:", error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ success: false, error: "Organization name already exists" });
    }
    res.status(500).json({ success: false, error: "Failed to create organization" });
  }
});

// PUT /api/user/organizations/:id - Update organization for user
router.put("/user/organizations/:id", isAuthenticatedUnified, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    // Check if user is owner
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    if (!org) {
      return res.status(404).json({ success: false, error: "Organization not found" });
    }

    if (org.ownerId !== userId) {
      return res.status(403).json({ success: false, error: "Only the owner can update this organization" });
    }

    // Validate request body
    const validationResult = createOrganizationSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        error: "Validation failed",
        details: validationResult.error.errors
      });
    }

    const data = validationResult.data;

    const [updated] = await db
      .update(organizations)
      .set({
        name: data.name ?? org.name,
        description: data.description ?? org.description,
        logo: data.logo ?? org.logo,
        orgType: data.orgType ?? org.orgType,
        businessTypes: data.businessTypes ?? org.businessTypes,
        email: data.email ?? org.email,
        website: data.website ?? org.website,
        location: data.location ?? org.location,
        locationDetails: data.locationDetails ?? org.locationDetails,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, id))
      .returning();

    res.json({ success: true, organization: { ...updated, role: 'owner' } });
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({ success: false, error: "Failed to update organization" });
  }
});

// DELETE /api/user/organizations/:id - Delete organization for user
router.delete("/user/organizations/:id", isAuthenticatedUnified, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    // Check if user is owner
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    if (!org) {
      return res.status(404).json({ success: false, error: "Organization not found" });
    }

    if (org.ownerId !== userId) {
      return res.status(403).json({ success: false, error: "Only the owner can delete this organization" });
    }

    await db.delete(organizations).where(eq(organizations.id, id));

    res.json({ success: true, message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({ success: false, error: "Failed to delete organization" });
  }
});

// ========================================
// ADMIN ORGANIZATION ROUTES
// ========================================

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
        orgType: organizations.orgType,
        businessTypes: organizations.businessTypes,
        industry: organizations.industry,
        employees: organizations.employees,
        website: organizations.website,
        email: organizations.email,
        phone: organizations.phone,
        location: organizations.location,
        locationDetails: organizations.locationDetails,
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
    const { name, slug, industry, employees, website, email, phone, location, ownerId, orgType, businessTypes, locationDetails } = req.body;
    
    // Generate display ID
    let displayId = 'OR00001';
    try {
      const result = await db.execute(sql`SELECT nextval('or_seq') as next_id`);
      const nextId = Number(result.rows[0]?.next_id || 1);
      displayId = `OR${String(nextId).padStart(5, '0')}`;
    } catch (e) {
      const orgCount = await db.select({ count: sql<number>`count(*)` }).from(organizations);
      displayId = `OR${String((orgCount[0]?.count || 0) + 1).padStart(5, '0')}`;
    }

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
        locationDetails: locationDetails || {},
        orgType,
        businessTypes: businessTypes || [],
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
    const { name, industry, employees, website, email, phone, location, status, orgType, businessTypes, locationDetails } = req.body;
    
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
        locationDetails,
        orgType,
        businessTypes,
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
