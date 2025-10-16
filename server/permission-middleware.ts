import { Request, Response, NextFunction } from "express";
import { WytPassPrincipal } from "./wytpass-identity";

/**
 * Permission Middleware - Protects routes by checking user permissions
 * 
 * Usage:
 * app.get('/api/admin/users', adminAuthMiddleware, requirePermission('users', 'view'), ...);
 * app.post('/api/admin/roles', adminAuthMiddleware, requirePermission('roles', 'create'), ...);
 * app.delete('/api/admin/tenants/:id', adminAuthMiddleware, requirePermission('tenants', 'delete'), ...);
 */

/**
 * Check if the authenticated user has the required permission
 * Must be used after adminAuthMiddleware
 */
export function requirePermission(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const principal = (req as any).principal as WytPassPrincipal | undefined;

    if (!principal) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Super admins have all permissions
    if (principal.isSuperAdmin) {
      return next();
    }

    // Check if user has the specific permission
    if (!principal.hasPermission || !principal.hasPermission(resource, action)) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        required: { resource, action },
      });
    }

    next();
  };
}

/**
 * Check if the user has ANY of the specified permissions
 * Useful for routes that allow multiple permission types
 * 
 * Usage:
 * app.get('/api/admin/content', adminAuthMiddleware, requireAnyPermission([
 *   { resource: 'content', action: 'view' },
 *   { resource: 'content', action: 'edit' }
 * ]), ...);
 */
export function requireAnyPermission(
  permissions: Array<{ resource: string; action: string }>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const principal = (req as any).principal as WytPassPrincipal | undefined;

    if (!principal) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Super admins have all permissions
    if (principal.isSuperAdmin) {
      return next();
    }

    // Check if user has ANY of the specified permissions
    if (!principal.hasPermission) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions - hasPermission not available",
        required: permissions,
      });
    }
    
    const hasAnyPermission = permissions.some((perm) =>
      principal.hasPermission!(perm.resource, perm.action)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        required: permissions,
      });
    }

    next();
  };
}

/**
 * Check if the user has ALL of the specified permissions
 * Useful for routes that require multiple permissions
 * 
 * Usage:
 * app.post('/api/admin/critical-action', adminAuthMiddleware, requireAllPermissions([
 *   { resource: 'system', action: 'edit' },
 *   { resource: 'security', action: 'manage' }
 * ]), ...);
 */
export function requireAllPermissions(
  permissions: Array<{ resource: string; action: string }>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const principal = (req as any).principal as WytPassPrincipal | undefined;

    if (!principal) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Super admins have all permissions
    if (principal.isSuperAdmin) {
      return next();
    }

    // Check if user has ALL of the specified permissions
    if (!principal.hasPermission) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions - hasPermission not available",
        required: permissions,
      });
    }

    const hasAllPermissions = permissions.every((perm) =>
      principal.hasPermission!(perm.resource, perm.action)
    );

    if (!hasAllPermissions) {
      const missingPermissions = permissions.filter(
        (perm) => !principal.hasPermission!(perm.resource, perm.action)
      );

      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        required: permissions,
        missing: missingPermissions,
      });
    }

    next();
  };
}

/**
 * Check if the user has a specific role
 * Useful for routes that should only be accessible by certain roles
 * 
 * Usage:
 * app.get('/api/admin/super-admin-only', adminAuthMiddleware, requireRole('Super Admin'), ...);
 */
export function requireRole(roleName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const principal = (req as any).principal as WytPassPrincipal | undefined;

    if (!principal) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Super admins have all roles
    if (principal.isSuperAdmin) {
      return next();
    }

    const hasRole = principal.systemRoles
      ? principal.systemRoles.some((role) => role.name === roleName)
      : false;

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: "Insufficient role",
        required: roleName,
      });
    }

    next();
  };
}
