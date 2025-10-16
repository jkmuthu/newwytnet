import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { users, userRoles, roles, rolePermissions, permissions } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

/**
 * WytPass Unified Identity System
 * 
 * One login, access to all authorized panels - similar to Google's SSO
 * Uses role-based claims instead of separate session tables
 */

export interface WytPassPrincipal {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  tenantId?: string;
  profileImageUrl?: string;
  
  // Role Claims - determines panel access
  roles: string[];  // ['super_admin', 'hub_admin', 'user']
  isSuperAdmin: boolean;
  isHubAdmin: boolean;
  
  // Database Roles & Permissions System
  systemRoles?: Array<{
    id: string;
    name: string;
    description: string | null;
    scope: string;
  }>;
  permissions?: {
    [resource: string]: string[]; // { "users": ["view", "create"], "tenants": ["view"] }
  };
  hasPermission?: (resource: string, action: string) => boolean;
  
  // Panel Access Map
  panels: {
    engine?: { access: boolean; role: string };
    hubAdmin?: { access: boolean; hubId: string; hubName: string };
    user?: { access: boolean };
  };
  
  // Metadata
  provider: string;
  lastLoginAt: string;
}

// Extend Express Session to include WytPass principal
declare module 'express-session' {
  interface SessionData {
    wytpassPrincipal?: WytPassPrincipal;
    // Legacy support
    user?: any;
    adminPrincipal?: any;
    hubAdminPrincipal?: any;
  }
}

/**
 * Create WytPass session middleware
 * Uses single unified session store with one cookie
 */
export function createWytPassSession() {
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: "sessions", // Reuse existing sessions table
  });

  return session({
    name: "wytpass.sid", // Unified cookie name
    secret: process.env.SESSION_SECRET || "wytpass-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: process.env.NODE_ENV === "production" ? ".wytnet.com" : undefined,
      sameSite: "lax",
    },
  });
}

/**
 * Helper: Create unified principal from user record
 */
export async function createWytPassPrincipal(user: any, loginType: 'engine_admin' | 'hub_admin' | 'user' = 'user'): Promise<WytPassPrincipal> {
  const rolesList: string[] = [];
  const panels: WytPassPrincipal['panels'] = {};
  
  // Determine roles based on user properties
  const isSuperAdmin = user.isSuperAdmin === true || user.email === 'jkm@jkmuthu.com';
  const isHubAdmin = user.role === 'admin' || user.role === 'hub_admin' || user.email === 'hubadmin@wytnet.com';
  
  // Add role claims
  if (isSuperAdmin) {
    rolesList.push('super_admin');
    panels.engine = { access: true, role: 'Super Admin' };
  }
  
  if (isHubAdmin || isSuperAdmin) {
    rolesList.push('hub_admin');
    panels.hubAdmin = { 
      access: true, 
      hubId: 'wytnet_hub',
      hubName: 'WytNet.com' 
    };
  }
  
  // All authenticated users have user panel access
  rolesList.push('user');
  panels.user = { access: true };
  
  // Fetch database roles and permissions for the user
  let systemRoles: Array<any> = [];
  let permissionsMap: { [resource: string]: string[] } = {};
  
  try {
    // Fetch user's roles from database
    const userRolesData = await db
      .select({
        roleId: userRoles.roleId,
        roleName: roles.name,
        roleDescription: roles.description,
        roleScope: roles.scope,
      })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(eq(userRoles.userId, user.id));
    
    if (userRolesData.length > 0) {
      const roleIds = userRolesData.map(r => r.roleId);
      
      // Format system roles
      systemRoles = userRolesData.map(r => ({
        id: r.roleId,
        name: r.roleName,
        description: r.roleDescription,
        scope: r.roleScope,
      }));
      
      // Fetch permissions for these roles
      const userPermissionsData = await db
        .select({
          resource: permissions.resource,
          action: permissions.action,
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
        .where(inArray(rolePermissions.roleId, roleIds));
      
      // Group permissions by resource
      userPermissionsData.forEach(perm => {
        if (!permissionsMap[perm.resource]) {
          permissionsMap[perm.resource] = [];
        }
        if (!permissionsMap[perm.resource].includes(perm.action)) {
          permissionsMap[perm.resource].push(perm.action);
        }
      });
    }
  } catch (error) {
    console.error("Error fetching user roles and permissions:", error);
    // Continue without database roles/permissions
  }
  
  // Helper function to check permissions
  const hasPermission = (resource: string, action: string): boolean => {
    return permissionsMap[resource]?.includes(action) || false;
  };
  
  return {
    id: user.id,
    email: user.email || '',
    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    tenantId: user.tenantId,
    profileImageUrl: user.profileImageUrl,
    roles: rolesList,
    isSuperAdmin,
    isHubAdmin,
    systemRoles,
    permissions: permissionsMap,
    hasPermission,
    panels,
    provider: loginType,
    lastLoginAt: new Date().toISOString(),
  };
}

/**
 * Middleware: Require WytPass authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const principal = req.session.wytpassPrincipal;
  
  if (!principal) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  (req as any).wytpassUser = principal;
  next();
}

/**
 * Middleware: Require Super Admin role
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const principal = req.session.wytpassPrincipal;
  
  if (!principal || !principal.isSuperAdmin) {
    return res.status(403).json({ error: "Super Admin access required" });
  }
  
  (req as any).wytpassUser = principal;
  next();
}

/**
 * Middleware: Require Hub Admin role
 */
export function requireHubAdmin(req: Request, res: Response, next: NextFunction) {
  const principal = req.session.wytpassPrincipal;
  
  if (!principal || !principal.isHubAdmin) {
    return res.status(403).json({ error: "Hub Admin access required" });
  }
  
  (req as any).wytpassUser = principal;
  next();
}

/**
 * Middleware: Optional auth (doesn't require login)
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const principal = req.session.wytpassPrincipal;
  
  if (principal) {
    (req as any).wytpassUser = principal;
  }
  
  next();
}

/**
 * Helper: Get principal from any legacy session format
 * Used for migration - checks old session formats and creates unified principal
 */
export async function getPrincipalFromLegacySession(req: Request): Promise<WytPassPrincipal | null> {
  // Check new WytPass format first
  if (req.session.wytpassPrincipal) {
    return req.session.wytpassPrincipal;
  }
  
  // Check Engine Admin session
  const adminPrincipal = (req.session as any).adminPrincipal;
  if (adminPrincipal && adminPrincipal.isSuperAdmin) {
    const [user] = await db.select().from(users).where(eq(users.email, adminPrincipal.email)).limit(1);
    if (user) {
      const principal = await createWytPassPrincipal(user, 'engine_admin');
      // Upgrade session
      req.session.wytpassPrincipal = principal;
      await new Promise<void>((resolve) => req.session.save(() => resolve()));
      return principal;
    }
  }
  
  // Check Hub Admin session
  const hubAdminPrincipal = (req.session as any).hubAdminPrincipal;
  if (hubAdminPrincipal) {
    const [user] = await db.select().from(users).where(eq(users.email, hubAdminPrincipal.email)).limit(1);
    if (user) {
      const principal = await createWytPassPrincipal(user, 'hub_admin');
      // Upgrade session
      req.session.wytpassPrincipal = principal;
      await new Promise<void>((resolve) => req.session.save(() => resolve()));
      return principal;
    }
  }
  
  // Check regular user session
  const sessionUser = (req.session as any).user;
  if (sessionUser) {
    const [user] = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1);
    if (user) {
      const principal = await createWytPassPrincipal(user, 'user');
      // Upgrade session
      req.session.wytpassPrincipal = principal;
      await new Promise<void>((resolve) => req.session.save(() => resolve()));
      return principal;
    }
  }
  
  return null;
}

/**
 * Setup WytPass unified authentication routes
 */
export function setupWytPassAuth(app: Express) {
  // Apply WytPass session middleware globally
  app.use(createWytPassSession());
  
  console.log("✅ WytPass Unified Identity System initialized");
}
