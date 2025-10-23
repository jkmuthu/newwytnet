import { Router } from "express";
import { db } from "../db";
import { users, userRoles, rolePermissions, permissions, roles } from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";

const router = Router();

// Helper function to check if user has a specific DevDoc permission
async function getUserDevDocPermissions(userId: string): Promise<string[]> {
  try {
    // Get user's roles
    const userRolesList = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));

    if (userRolesList.length === 0) {
      return [];
    }

    const roleIds = userRolesList.map(ur => ur.roleId);

    // Check if user is Super Admin (gets all permissions automatically)
    const rolesData = await db
      .select()
      .from(roles)
      .where(inArray(roles.id, roleIds));

    const isSuperAdmin = rolesData.some(r => r.name === "Super Admin");

    if (isSuperAdmin) {
      // Super Admin gets all DevDoc levels
      return ['devdoc-public', 'devdoc-developer', 'devdoc-internal', 'devdoc-admin'];
    }

    // Get permissions for user's roles
    const rolePermsList = await db
      .select({
        permission: permissions,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(
        and(
          inArray(rolePermissions.roleId, roleIds),
          eq(permissions.action, 'view')
        )
      );

    // Filter DevDoc permissions
    const devdocPermissions = rolePermsList
      .map(rp => rp.permission.resource)
      .filter(resource => resource.startsWith('devdoc-'));

    // Return unique permissions
    return Array.from(new Set(devdocPermissions));
  } catch (error) {
    console.error('Error getting user DevDoc permissions:', error);
    return [];
  }
}

// GET /api/devdoc/check-access - Check user's DevDoc access
router.get("/api/devdoc/check-access", async (req, res) => {
  try {
    // Check if user is authenticated
    const principal = req.session.wytpassPrincipal;
    
    if (!principal) {
      return res.status(401).json({
        authenticated: false,
        message: "Not authenticated"
      });
    }

    const userId = principal.id;

    // Get user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        authenticated: false,
        message: "User not found"
      });
    }

    // Get DevDoc permissions
    const devdocPermissions = await getUserDevDocPermissions(userId);

    // Determine access levels
    const accessLevels = {
      public: devdocPermissions.includes('devdoc-public'),
      developer: devdocPermissions.includes('devdoc-developer'),
      internal: devdocPermissions.includes('devdoc-internal'),
      admin: devdocPermissions.includes('devdoc-admin'),
    };

    // Calculate highest access level
    let highestLevel = 'none';
    if (accessLevels.admin) highestLevel = 'admin';
    else if (accessLevels.internal) highestLevel = 'internal';
    else if (accessLevels.developer) highestLevel = 'developer';
    else if (accessLevels.public) highestLevel = 'public';

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      devdocAccess: accessLevels,
      highestLevel,
      permissions: devdocPermissions,
    });
  } catch (error) {
    console.error("Error checking DevDoc access:", error);
    res.status(500).json({
      authenticated: false,
      error: "Failed to check access"
    });
  }
});

// GET /api/devdoc/config - Get dynamic VitePress sidebar config based on permissions
router.get("/api/devdoc/config", async (req, res) => {
  try {
    // Check if user is authenticated
    const principal = req.session.wytpassPrincipal;
    
    if (!principal) {
      // Return public-only config
      return res.json({
        authenticated: false,
        sidebar: getPublicSidebar(),
      });
    }

    const userId = principal.id;

    // Get DevDoc permissions
    const devdocPermissions = await getUserDevDocPermissions(userId);

    // Generate sidebar based on permissions
    const sidebar = generateSidebarConfig(devdocPermissions);

    res.json({
      authenticated: true,
      sidebar,
      permissions: devdocPermissions,
    });
  } catch (error) {
    console.error("Error getting DevDoc config:", error);
    res.status(500).json({
      error: "Failed to get configuration"
    });
  }
});

// Helper function to generate sidebar config based on permissions
function generateSidebarConfig(permissions: string[]): any {
  const sidebar: any[] = [];

  // Public sections (always visible if user has any DevDoc access)
  if (permissions.length > 0) {
    sidebar.push({
      text: 'Introduction',
      collapsed: false,
      items: [
        { text: 'Platform Overview', link: '/en/overview' },
        { text: 'Core Concepts', link: '/en/core-concepts' },
      ]
    });
  }

  // Developer sections
  if (permissions.includes('devdoc-developer') || permissions.includes('devdoc-internal') || permissions.includes('devdoc-admin')) {
    sidebar.push({
      text: 'Architecture',
      collapsed: false,
      items: [
        { text: 'Database Schema', link: '/en/architecture/database-schema' },
        { text: 'Multi-tenancy & RLS', link: '/en/architecture/multi-tenancy' },
        { text: 'RBAC System', link: '/en/architecture/rbac' },
        { text: 'Frontend Architecture', link: '/en/architecture/frontend' },
        { text: 'Backend Architecture', link: '/en/architecture/backend' },
      ]
    });

    sidebar.push({
      text: 'API Reference',
      collapsed: false,
      items: [
        { text: 'Authentication APIs', link: '/en/api/authentication' },
        { text: 'User APIs', link: '/en/api/users' },
        { text: 'Admin APIs', link: '/en/api/admin' },
      ]
    });
  }

  // Internal sections
  if (permissions.includes('devdoc-internal') || permissions.includes('devdoc-admin')) {
    sidebar.push({
      text: 'Internal',
      collapsed: false,
      items: [
        { text: 'Engine Workflows', link: '/en/internal/engine-workflows' },
        { text: 'Testing Guidelines', link: '/en/internal/testing' },
        { text: 'Deployment Procedures', link: '/en/internal/deployment' },
      ]
    });
  }

  // Admin-only sections
  if (permissions.includes('devdoc-admin')) {
    sidebar.push({
      text: 'Business & Strategy',
      collapsed: false,
      items: [
        { text: 'Business Model', link: '/en/admin/business-model' },
        { text: 'Revenue Plans', link: '/en/admin/revenue-plans' },
        { text: 'Strategic Roadmap', link: '/en/admin/roadmap' },
      ]
    });
  }

  return sidebar;
}

// Helper function for public-only sidebar
function getPublicSidebar(): any[] {
  return [
    {
      text: 'Getting Started',
      collapsed: false,
      items: [
        { text: 'Welcome', link: '/en/welcome' },
        { text: 'Login Required', link: '/en/login-required' },
      ]
    }
  ];
}

export default router;
