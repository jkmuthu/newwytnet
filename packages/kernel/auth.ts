// Authentication and authorization utilities for WytNet
import { z } from "zod";

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  EDITOR = 'editor',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum Permission {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  PUBLISH = 'publish',
}

export interface AuthContext {
  userId: string;
  tenantId?: string;
  roles: UserRole[];
  permissions: Permission[];
}

export const authContextSchema = z.object({
  userId: z.string(),
  tenantId: z.string().optional(),
  roles: z.array(z.nativeEnum(UserRole)),
  permissions: z.array(z.nativeEnum(Permission)),
});

// Role hierarchy and default permissions
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE, Permission.MANAGE],
  [UserRole.MANAGER]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.PUBLISH],
  [UserRole.EDITOR]: [Permission.CREATE, Permission.READ, Permission.UPDATE],
  [UserRole.MEMBER]: [Permission.CREATE, Permission.READ],
  [UserRole.VIEWER]: [Permission.READ],
};

export class AuthService {
  static hasPermission(context: AuthContext, permission: Permission): boolean {
    return context.permissions.includes(permission);
  }

  static hasRole(context: AuthContext, role: UserRole): boolean {
    return context.roles.includes(role);
  }

  static getPermissionsForRole(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  static createContext(userId: string, roles: UserRole[], tenantId?: string): AuthContext {
    const permissions = roles.reduce<Permission[]>((acc, role) => {
      const rolePermissions = this.getPermissionsForRole(role);
      return [...acc, ...rolePermissions.filter(p => !acc.includes(p))];
    }, []);

    return {
      userId,
      tenantId,
      roles,
      permissions,
    };
  }

  static canAccessResource(
    context: AuthContext, 
    resource: { tenantId?: string; createdBy?: string },
    permission: Permission
  ): boolean {
    // Super admin can access everything
    if (context.roles.includes(UserRole.SUPER_ADMIN)) {
      return true;
    }

    // Check basic permission
    if (!this.hasPermission(context, permission)) {
      return false;
    }

    // Multi-tenant access control
    if (resource.tenantId && context.tenantId && resource.tenantId !== context.tenantId) {
      return false;
    }

    // Owner access
    if (resource.createdBy === context.userId) {
      return true;
    }

    return true;
  }
}

// Decorator for protecting routes with permissions
export function RequirePermission(permission: Permission) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const context: AuthContext = this.getAuthContext();
      if (!AuthService.hasPermission(context, permission)) {
        throw new Error(`Insufficient permissions. Required: ${permission}`);
      }
      return method.apply(this, args);
    };
  };
}

// Decorator for protecting routes with roles
export function RequireRole(role: UserRole) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const context: AuthContext = this.getAuthContext();
      if (!AuthService.hasRole(context, role)) {
        throw new Error(`Insufficient role. Required: ${role}`);
      }
      return method.apply(this, args);
    };
  };
}
