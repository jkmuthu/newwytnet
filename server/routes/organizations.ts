import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { 
  organizations,
  organizationMembers,
  organizationAppPermissions,
  users,
  apps,
} from "@shared/schema";
import { eq, desc, sql, ilike, or, and, inArray } from "drizzle-orm";
import { adminAuthMiddleware, isAuthenticatedUnified } from "../customAuth";
import { requirePermission } from "../permission-middleware";

const router = Router();

// Schema for organization creation/update
const createOrganizationSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens").optional(),
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
  isPublic: z.boolean().optional(),
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
// PUBLIC ORGANIZATION ROUTES (No Auth Required)
// ========================================

// GET /api/public/organizations/:slug - Get public organization by slug (no auth required)
router.get("/public/organizations/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(400).json({ success: false, error: "Slug is required" });
    }

    const [org] = await db
      .select({
        id: organizations.id,
        displayId: organizations.displayId,
        name: organizations.name,
        slug: organizations.slug,
        description: organizations.description,
        logo: organizations.logo,
        orgType: organizations.orgType,
        businessTypes: organizations.businessTypes,
        email: organizations.email,
        website: organizations.website,
        location: organizations.location,
        isPublic: organizations.isPublic,
        createdAt: organizations.createdAt,
      })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (!org) {
      return res.status(404).json({ success: false, error: "Organization not found" });
    }

    // If not public, return 403
    if (!org.isPublic) {
      return res.status(403).json({ 
        success: false, 
        error: "This organization is private",
        isPrivate: true 
      });
    }

    res.json({ 
      success: true, 
      organization: org
    });
  } catch (error) {
    console.error("Error fetching public organization:", error);
    res.status(500).json({ success: false, error: "Failed to fetch organization" });
  }
});

// ========================================
// USER ORGANIZATION ROUTES (Panel)
// ========================================

// GET /api/organizations/check-slug - Check if slug is available
router.get("/organizations/check-slug", async (req, res) => {
  try {
    const { slug, excludeId } = req.query;
    
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ success: false, error: "Slug is required" });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.json({ 
        success: true, 
        available: false, 
        message: "Only lowercase letters, numbers, and hyphens allowed" 
      });
    }

    if (slug.length < 3) {
      return res.json({ 
        success: true, 
        available: false, 
        message: "Slug must be at least 3 characters" 
      });
    }

    // Check if slug exists
    let query = db.select({ id: organizations.id }).from(organizations).where(eq(organizations.slug, slug));
    
    const existing = await query.limit(1);
    
    // If excludeId is provided, check if the existing slug belongs to that org (for editing)
    if (existing.length > 0 && excludeId && existing[0].id === excludeId) {
      return res.json({ success: true, available: true });
    }

    res.json({ 
      success: true, 
      available: existing.length === 0,
      message: existing.length > 0 ? "This URL is already taken" : undefined
    });
  } catch (error) {
    console.error("Error checking slug:", error);
    res.status(500).json({ success: false, error: "Failed to check slug availability" });
  }
});

// GET /api/user/organizations - Get organizations for logged in user
// Returns organizations with user's role and WytWall permissions
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
        isPublic: organizations.isPublic,
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
        isPublic: organizations.isPublic,
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

    // Get all org IDs to fetch permissions
    const allOrgIds = [
      ...ownedOrgs.map(o => o.id),
      ...memberOrgs.filter(org => org.ownerId !== userId).map(o => o.id)
    ];

    // Fetch WytWall app permissions for non-owner orgs
    // Find WytWall app first (by key)
    const [wytWallApp] = await db
      .select({ id: apps.id })
      .from(apps)
      .where(eq(apps.key, 'wytwall'))
      .limit(1);

    // Get app permissions for all member orgs
    let appPermsMap: Record<string, { canView: boolean; canAdd: boolean; canEdit: boolean; canDelete: boolean }> = {};
    
    if (wytWallApp && allOrgIds.length > 0) {
      const permissions = await db
        .select({
          organizationId: organizationAppPermissions.organizationId,
          canView: organizationAppPermissions.canView,
          canAdd: organizationAppPermissions.canAdd,
          canEdit: organizationAppPermissions.canEdit,
          canDelete: organizationAppPermissions.canDelete,
        })
        .from(organizationAppPermissions)
        .where(and(
          eq(organizationAppPermissions.userId, userId),
          eq(organizationAppPermissions.appId, wytWallApp.id),
          inArray(organizationAppPermissions.organizationId, allOrgIds)
        ));

      permissions.forEach(p => {
        appPermsMap[p.organizationId] = {
          canView: p.canView,
          canAdd: p.canAdd,
          canEdit: p.canEdit,
          canDelete: p.canDelete,
        };
      });
    }

    // Owner has all permissions by default
    const ownerPermissions = { canView: true, canAdd: true, canEdit: true, canDelete: true };
    
    // Default permissions for non-owner roles if not explicitly set
    const getDefaultPermissions = (role: string) => {
      switch (role) {
        case 'admin':
          return { canView: true, canAdd: true, canEdit: true, canDelete: false };
        case 'analyst':
          return { canView: true, canAdd: false, canEdit: false, canDelete: false };
        default:
          return { canView: true, canAdd: false, canEdit: false, canDelete: false };
      }
    };

    // Combine and mark roles with permissions
    const allOrgs = [
      ...ownedOrgs.map(org => ({ 
        ...org, 
        role: 'owner' as const, 
        memberCount: 1,
        wytWallPermissions: ownerPermissions 
      })),
      ...memberOrgs.filter(org => org.ownerId !== userId).map(org => ({ 
        ...org, 
        memberCount: 1,
        wytWallPermissions: appPermsMap[org.id] || getDefaultPermissions(org.role || 'member')
      }))
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

// GET /api/user/organizations/:id/members - Get organization members
router.get("/user/organizations/:id/members", isAuthenticatedUnified, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    // Get the organization
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

    // Get all members with user details
    const members = await db
      .select({
        id: organizationMembers.id,
        organizationId: organizationMembers.organizationId,
        userId: organizationMembers.userId,
        role: organizationMembers.role,
        isActive: organizationMembers.isActive,
        joinedAt: organizationMembers.joinedAt,
        createdAt: organizationMembers.createdAt,
        userName: users.name,
        userEmail: users.email,
        userDisplayId: users.displayId,
        userAvatar: users.profileImageUrl,
      })
      .from(organizationMembers)
      .leftJoin(users, eq(users.id, organizationMembers.userId))
      .where(eq(organizationMembers.organizationId, id));

    // Also include the owner in the member list
    const [owner] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        displayId: users.displayId,
        avatar: users.profileImageUrl,
      })
      .from(users)
      .where(eq(users.id, org.ownerId))
      .limit(1);

    // Check if owner is already in members list
    const ownerInMembers = members.some(m => m.userId === org.ownerId);
    
    const allMembers = ownerInMembers 
      ? members.map(m => ({
          ...m,
          role: m.userId === org.ownerId ? 'owner' : m.role
        }))
      : [
          {
            id: null,
            organizationId: org.id,
            userId: org.ownerId,
            role: 'owner',
            isActive: true,
            joinedAt: org.createdAt,
            createdAt: org.createdAt,
            userName: owner?.name || 'Unknown',
            userEmail: owner?.email || '',
            userDisplayId: owner?.displayId || '',
            userAvatar: owner?.avatar || null,
          },
          ...members
        ];

    // Current user's role
    const currentUserRole = isOwner ? 'owner' : membership?.role || 'member';

    res.json({ 
      success: true, 
      members: allMembers,
      currentUserRole,
      isOwner
    });
  } catch (error) {
    console.error("Error fetching organization members:", error);
    res.status(500).json({ success: false, error: "Failed to fetch organization members" });
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
    
    // Use provided slug or generate from name
    let slug = data.slug || generateSlug(data.name);
    
    // Check if provided slug is taken
    if (data.slug) {
      const existing = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.slug, data.slug))
        .limit(1);
      
      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: "This URL is already taken. Please choose a different one." 
        });
      }
    } else {
      // Auto-generate and ensure uniqueness
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
        isPublic: data.isPublic ?? false,
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

    // Check if slug is being changed and if the new slug is available
    if (data.slug && data.slug !== org.slug) {
      const existing = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.slug, data.slug))
        .limit(1);
      
      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: "This URL is already taken. Please choose a different one." 
        });
      }
    }

    const [updated] = await db
      .update(organizations)
      .set({
        name: data.name ?? org.name,
        slug: data.slug ?? org.slug,
        description: data.description ?? org.description,
        logo: data.logo ?? org.logo,
        orgType: data.orgType ?? org.orgType,
        businessTypes: data.businessTypes ?? org.businessTypes,
        email: data.email ?? org.email,
        website: data.website ?? org.website,
        location: data.location ?? org.location,
        locationDetails: data.locationDetails ?? org.locationDetails,
        isPublic: data.isPublic ?? org.isPublic,
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
