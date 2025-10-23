import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { eq, inArray } from "drizzle-orm";
import { users, userRoles, rolePermissions, permissions, auditLogs } from "@shared/schema";

// Whitelist patterns for public assets
const PUBLIC_ASSETS = [
  /^\/devdoc\/assets\/.*/,
  /^\/devdoc\/.*\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2|ttf)$/,
  /^\/devdoc\/login$/,
  /^\/devdoc\/login\.html$/,
  /^\/devdoc\/403$/,
  /^\/devdoc\/403\.html$/,
  /^\/api\/devdoc\/.*/  // API endpoints
];

// Map of paths to required permission levels
const PATH_PERMISSION_MAP: Record<string, string[]> = {
  '/devdoc/en/production-standards': ['devdoc-admin', 'devdoc-internal', 'devdoc-developer'],
  '/devdoc/en/api-reference': ['devdoc-admin', 'devdoc-internal', 'devdoc-developer'],
  '/devdoc/en/api': ['devdoc-admin', 'devdoc-internal', 'devdoc-developer'],
  '/devdoc/en/architecture': ['devdoc-admin', 'devdoc-internal', 'devdoc-developer'],
  '/devdoc/en/implementation': ['devdoc-admin', 'devdoc-internal', 'devdoc-developer'],
  '/devdoc/en/workflows': ['devdoc-admin', 'devdoc-internal', 'devdoc-developer'],
  '/devdoc/en/use-case-flows': ['devdoc-admin', 'devdoc-internal', 'devdoc-developer'],
  '/devdoc/en/features': ['devdoc-admin', 'devdoc-internal', 'devdoc-developer'],
  '/devdoc/en/prd': ['devdoc-admin', 'devdoc-internal'],  // Internal team + Super Admin
  '/devdoc/en/business': ['devdoc-admin'],  // Super Admin only
  '/devdoc/en/admin': ['devdoc-admin', 'devdoc-internal'],  // Internal team only
  '/devdoc/en/project/chat-history': ['devdoc-admin'],  // Super Admin only
  '/devdoc/en/project/features-checklist': ['devdoc-admin', 'devdoc-internal'],  // Internal team only
  '/devdoc/en/project/documentation-status': ['devdoc-admin', 'devdoc-internal'],  // Internal team only
};

// Helper function to get user's DevDoc permissions
async function getUserDevDocPermissions(userId: string): Promise<string[]> {
  try {
    // Get user with their roles and permissions
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return [];

    // Get user's role assignments (can have multiple roles)
    const userRolesList = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));

    if (userRolesList.length === 0) return [];

    // Extract all roleIds
    const roleIds = userRolesList.map(ur => ur.roleId);

    // Get all permissions for ALL user's roles (not just first one)
    const rolePermsList = await db
      .select({
        permission: permissions
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(inArray(rolePermissions.roleId, roleIds));

    // Filter for DevDoc permissions
    const devdocPermissions = rolePermsList
      .map(rp => rp.permission.resource)
      .filter(resource => resource.startsWith('devdoc-'));

    return Array.from(new Set(devdocPermissions));
  } catch (error) {
    console.error('Error getting user DevDoc permissions:', error);
    return [];
  }
}

// Helper function to check if path requires specific permission
function getRequiredPermission(path: string): string[] | null {
  // Normalize path
  const normalizedPath = path.replace(/\.html$/, '').replace(/\/$/, '');
  
  // Check exact matches
  if (PATH_PERMISSION_MAP[normalizedPath]) {
    return PATH_PERMISSION_MAP[normalizedPath];
  }
  
  // Check prefix matches (e.g., /devdoc/en/api-reference/users should match /devdoc/en/api-reference)
  for (const [pathPrefix, requiredPerms] of Object.entries(PATH_PERMISSION_MAP)) {
    if (normalizedPath.startsWith(pathPrefix)) {
      return requiredPerms;
    }
  }
  
  // Default: public access
  return ['devdoc-public'];
}

// Helper function to check if user has any of the required permissions
function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(required => userPermissions.includes(required));
}

// Log audit trail for DevDoc access
async function logDevDocAccess(
  userId: string | null,
  path: string,
  granted: boolean,
  requiredPermissions: string[]
): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: userId || undefined,
      action: 'devdoc_access',
      resource: 'devdoc',
      resourceId: path,
      details: {
        path,
        granted,
        requiredPermissions,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error logging DevDoc access:', error);
  }
}

/**
 * DevDoc Authentication Middleware
 * 
 * Gates /devdoc/* requests with WytPass session-aware permission checking.
 * 
 * Features:
 * - Whitelists public assets (CSS, JS, images)
 * - Checks WytPass session for authenticated users
 * - Enforces permission-based access to documentation sections
 * - Logs all access attempts to audit trail
 * - Returns 403 for unauthorized access
 * - Redirects to login for unauthenticated users
 */
export async function devdocAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestPath = req.path;

  // Skip middleware if not a DevDoc request
  if (!requestPath.startsWith('/devdoc')) {
    return next();
  }

  // Allow public assets
  const isPublicAsset = PUBLIC_ASSETS.some(pattern => pattern.test(requestPath));
  if (isPublicAsset) {
    return next();
  }

  // Get WytPass principal from session
  const principal = req.session.wytpassPrincipal;
  
  // Check for password-based authentication (backward compatibility)
  const isPasswordAuth = (req.session as any).docsAuthenticated === true;
  
  // Check if user is authenticated via either WytPass or password
  if (!principal && !isPasswordAuth) {
    // Not authenticated at all
    await logDevDocAccess(null, requestPath, false, ['authentication_required']);
    
    // For API requests, return JSON
    if (requestPath.startsWith('/api/')) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access DevDoc'
      });
      return;
    }
    
    // For page requests, redirect to login
    res.redirect(`/devdoc-login`);
    return;
  }

  // Handle password-authenticated users (backward compatibility)
  // Grant them developer-level access by default
  if (isPasswordAuth && !principal) {
    const requiredPermissions = getRequiredPermission(requestPath);
    const defaultPasswordPermissions = ['devdoc-public', 'devdoc-developer'];
    
    // Check if password users can access this path
    if (requiredPermissions && !hasAnyPermission(defaultPasswordPermissions, requiredPermissions)) {
      await logDevDocAccess(null, requestPath, false, requiredPermissions);
      
      // For API requests, return JSON
      if (requestPath.startsWith('/api/')) {
        res.status(403).json({ 
          error: 'Access denied',
          message: 'This section requires WytPass authentication with appropriate role',
          requiredPermissions
        });
        return;
      }
      
      // For page requests, show 403
      res.redirect('/devdoc/403');
      return;
    }
    
    // Allow access for password users
    await logDevDocAccess(null, requestPath, true, requiredPermissions || ['public']);
    return next();
  }

  const userId = principal!.id;

  // Get user's DevDoc permissions
  const userPermissions = await getUserDevDocPermissions(userId);

  // Get required permissions for this path
  const requiredPermissions = getRequiredPermission(requestPath);

  if (!requiredPermissions) {
    // No specific permission required, allow access
    await logDevDocAccess(userId, requestPath, true, ['public']);
    return next();
  }

  // Check if user has required permission
  const hasPermission = hasAnyPermission(userPermissions, requiredPermissions);

  if (!hasPermission) {
    // User doesn't have permission
    await logDevDocAccess(userId, requestPath, false, requiredPermissions);
    
    // For API requests, return JSON
    if (requestPath.startsWith('/api/')) {
      res.status(403).json({ 
        error: 'Access denied',
        message: 'You do not have permission to access this section',
        requiredPermissions
      });
      return;
    }
    
    // For page requests, show 403 page
    res.redirect('/devdoc/403');
    return;
  }

  // User has permission, allow access
  await logDevDocAccess(userId, requestPath, true, requiredPermissions);
  next();
}
