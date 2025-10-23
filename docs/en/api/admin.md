# Admin API Reference

:::danger PRODUCTION API STANDARDS  
All admin endpoints MUST implement:
- ✅ **Authentication Check** - Verify valid session exists
- 🔒 **Permission Verification** - Check user has required permission BEFORE operation
- 📊 **Audit Logging** - Log ALL admin actions to audit_logs table
- ⚠️ **Input Validation** - Validate all inputs with Zod schemas
- 🎯 **Error Handling** - Return appropriate HTTP codes with clear messages

See [Production Standards](/en/production-standards/) for complete requirements.
:::

## Overview

The Admin API provides comprehensive endpoints for managing the WytNet platform at the Engine level. These endpoints are protected by role-based access control (RBAC) and require Super Admin or specific admin permissions.

---

## Base URL

```
Production: https://wytnet.com
Development: https://your-replit-dev-domain.replit.dev
```

---

## Authentication

All admin endpoints require:

1. **Session Authentication**: Valid WytPass session cookie
2. **Admin Role**: User must have admin or super_admin role
3. **Specific Permission**: Most endpoints require resource-specific permissions

```http
Cookie: wytpass.sid=<session-id>
```

**Required Headers**

```http
Content-Type: application/json
Cookie: wytpass.sid=<session-id>
```

---

## Permission System

The RBAC system has 64 permissions across 16 resources:

| Resource | Permissions |
|----------|-------------|
| users | view, create, edit, delete |
| organizations | view, create, edit, delete |
| entities | view, create, edit, delete |
| datasets | view, create, edit, delete |
| media | view, create, edit, delete |
| modules | view, create, edit, delete |
| apps | view, create, edit, delete |
| hubs | view, create, edit, delete |
| cms | view, create, edit, delete |
| themes | view, create, edit, delete |
| integrations | view, create, edit, delete |
| pricing | view, create, edit, delete |
| help-support | view, create, edit, delete |
| analytics | view, create, edit, delete |
| roles-permissions | view, create, edit, delete |
| system-security | view, create, edit, delete |

---

## Middleware & Security

### Required Middleware Stack

All admin endpoints use this middleware stack:

```typescript
import { requireAuth } from './wytpass-auth';
import { requirePermission } from './rbac-middleware';
import { auditLog } from './audit-middleware';

// Example: Module management endpoint
app.get('/api/admin/modules',
  requireAuth,                    // 1. Check authentication
  requirePermission('modules:view'), // 2. Check permission
  auditLog('modules', 'list'),    // 3. Log action
  async (req, res) => {
    // Implementation...
  }
);
```

### Authentication Middleware

```typescript
export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      message: 'Authentication required' 
    });
  }
  next();
};
```

### Permission Middleware

```typescript
export const requirePermission = (permission: string) => {
  return async (req, res, next) => {
    const userId = req.session.userId;
    
    // Check if user has permission
    const hasPermission = await checkUserPermission(userId, permission);
    
    if (!hasPermission) {
      // Log permission denial
      await logAudit({
        userId,
        action: 'permission_denied',
        permission,
        ip: req.ip
      });
      
      return res.status(403).json({ 
        message: 'Permission denied',
        required: permission
      });
    }
    
    next();
  };
};
```

### Audit Logging Middleware

```typescript
export const auditLog = (resourceType: string, action: string) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(body) {
      // Log after successful operation
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAuditEntry({
          userId: req.session.userId,
          action,
          resourceType,
          resourceId: req.params.id || null,
          details: {
            method: req.method,
            path: req.path,
            body: req.body
          },
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }).catch(err => {
          logger.error('Audit logging failed', { error: err });
        });
      }
      
      return originalJson(body);
    };
    
    next();
  };
};
```

---

## Module Management APIs

### GET /api/admin/modules

Get all platform modules.

**Permission**: `modules:view`

**Request**

```http
GET /api/admin/modules?category=all&status=all&page=1&limit=50
```

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| category | string | 'all' | Filter by category: 'all', 'platform', 'payment', 'communication', 'analytics' |
| status | string | 'all' | 'all', 'enabled', 'disabled' |
| context | string | - | Filter by context: 'platform', 'hub', 'app', 'game' |
| search | string | - | Search in name and description |
| page | number | 1 | Page number |
| limit | number | 50 | Items per page |

**Success Response (200 OK)**

```typescript
{
  modules: Array<{
    id: string;                    // Module ID (e.g., 'razorpay-payment')
    displayId: string;             // MD0001
    name: string;
    description: string;
    category: string;
    type: string;
    status: 'enabled' | 'disabled';
    
    // Context Support
    contexts: string[];            // ['platform', 'hub', 'app']
    
    // Dependencies
    dependencies: string[];        // Required modules
    
    // API Endpoints exposed by module
    apiEndpoints: Array<{
      method: string;              // 'GET', 'POST', etc.
      path: string;
      auth: boolean;
    }>;
    
    // Settings Schema
    settings: Record<string, any>;
    
    // Compatibility
    compatibilityMatrix: {
      minVersion: string;
      conflicts: string[];         // Conflicting modules
    };
    
    // Pricing
    pricing: 'free' | 'paid' | 'freemium';
    price?: number;
    currency?: string;
    
    // UI
    icon: string;
    color: string;
    route?: string;
    
    // Version
    version: string;
    versionHistory: Array<{
      version: string;
      changes: string;
      date: string;
    }>;
    changelog?: string;
    
    // Access Restrictions
    restrictedTo: string[];        // ['engine-only', 'hub-only']
    
    // Metadata
    usage: number;
    installs: number;
    creator?: string;
    order: number;
    
    createdAt: string;
    updatedAt: string;
  }>;
  
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  statistics: {
    totalModules: number;
    enabledModules: number;
    categoriesBreakdown: Record<string, number>;
  };
}
```

---

### GET /api/admin/modules/:id

Get a specific module by ID.

**Permission**: `modules:view`

**Success Response (200 OK)**

```typescript
{
  module: {
    // All module fields from GET /api/admin/modules
    id: string;
    displayId: string;
    name: string;
    // ... (all fields)
    
    // Additional details
    activations: {
      platform: boolean;
      hubs: number;
      apps: number;
    };
    
    editHistory: Array<{
      field: string;
      oldValue: string;
      newValue: string;
      editedBy: string;
      editedByName: string;
      editedAt: string;
    }>;
  };
}
```

---

### POST /api/admin/modules

Create a new module.

**Permission**: `modules:create`

**Request**

```typescript
POST /api/admin/modules
Content-Type: application/json

{
  id: string;                      // Unique module ID (e.g., 'stripe-payment')
  name: string;                    // Display name
  description: string;
  category: string;
  type: string;
  contexts: string[];              // ['platform', 'hub', 'app', 'game']
  dependencies?: string[];
  apiEndpoints?: Array<{
    method: string;
    path: string;
    auth: boolean;
  }>;
  settings?: Record<string, any>;
  pricing?: 'free' | 'paid' | 'freemium';
  price?: number;
  currency?: string;
  icon?: string;
  color?: string;
  route?: string;
  version?: string;
  changelog?: string;
  restrictedTo?: string[];
}
```

**Success Response (201 Created)**

```typescript
{
  success: true;
  message: "Module created successfully";
  module: {
    id: string;
    displayId: string;
    name: string;
    // ... all fields
  };
}
```

---

### PUT /api/admin/modules/:id

Update a module.

**Permission**: `modules:edit`

**Request**

```typescript
PUT /api/admin/modules/:id
Content-Type: application/json

{
  // All fields optional
  name?: string;
  description?: string;
  category?: string;
  contexts?: string[];
  dependencies?: string[];
  settings?: Record<string, any>;
  version?: string;
  changelog?: string;
  status?: 'enabled' | 'disabled';
}
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Module updated successfully";
  module: {
    // Updated module object
  };
}
```

**Note**: Changes are tracked in `moduleEditHistory` table.

---

### DELETE /api/admin/modules/:id

Delete a module (soft delete).

**Permission**: `modules:delete`

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Module deleted successfully";
}
```

---

### POST /api/admin/modules/:id/activate

Activate a module at platform level.

**Permission**: `modules:edit`

**Request**

```typescript
POST /api/admin/modules/:id/activate
Content-Type: application/json

{
  context: 'platform' | 'hub' | 'app' | 'game';
  settings?: Record<string, any>;
}
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Module activated successfully";
  activation: {
    id: string;
    moduleId: string;
    context: string;
    isActive: true;
    activatedBy: string;
    activatedAt: string;
  };
}
```

---

### POST /api/admin/modules/:id/deactivate

Deactivate a module at platform level.

**Permission**: `modules:edit`

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Module deactivated successfully";
}
```

---

## App Management APIs

### GET /api/admin/apps

Get all apps.

**Permission**: `apps:view`

**Request**

```http
GET /api/admin/apps?status=all&page=1&limit=50
```

**Success Response (200 OK)**

```typescript
{
  apps: Array<{
    id: string;
    displayId: string;              // AP0001
    key: string;                    // Unique app key
    name: string;
    description: string;
    version: string;
    manifest: Record<string, any>;
    icon?: string;
    categories: string[];
    status: 'draft' | 'published' | 'unpublished';
    isPublic: boolean;
    pricing: {
      model: 'free' | 'paid' | 'freemium';
      price?: number;
      currency?: string;
    };
    route?: string;
    contexts: string[];
    restrictedTo: string[];
    versionHistory: Array<{
      version: string;
      changes: string;
      date: string;
    }>;
    changelog?: string;
    
    // Statistics
    installs: number;
    activeInstalls: number;
    
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }>;
  
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

---

### POST /api/admin/apps

Create a new app.

**Permission**: `apps:create`

**Request**

```typescript
POST /api/admin/apps
Content-Type: application/json

{
  key: string;                     // Unique app key
  name: string;
  description: string;
  version: string;
  manifest: Record<string, any>;   // App configuration
  icon?: string;
  categories?: string[];
  status?: 'draft' | 'published';
  isPublic?: boolean;
  pricing?: {
    model: 'free' | 'paid' | 'freemium';
    price?: number;
    currency?: string;
  };
  route?: string;
  contexts?: string[];
  restrictedTo?: string[];
}
```

**Success Response (201 Created)**

```typescript
{
  success: true;
  message: "App created successfully";
  app: {
    id: string;
    displayId: string;
    key: string;
    // ... all fields
  };
}
```

---

### PUT /api/admin/apps/:id

Update an app.

**Permission**: `apps:edit`

**Request**

```typescript
PUT /api/admin/apps/:id
Content-Type: application/json

{
  // All fields optional
  name?: string;
  description?: string;
  version?: string;
  manifest?: Record<string, any>;
  categories?: string[];
  status?: 'draft' | 'published' | 'unpublished';
  isPublic?: boolean;
  changelog?: string;
}
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "App updated successfully";
  app: {
    // Updated app object
  };
}
```

---

### DELETE /api/admin/apps/:id

Delete an app (soft delete).

**Permission**: `apps:delete`

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "App deleted successfully";
}
```

---

## Hub Management APIs

### GET /api/admin/platform-hubs

Get all platform hubs.

**Permission**: `hubs:view`

**Request**

```http
GET /api/admin/platform-hubs?status=all&page=1&limit=50
```

**Success Response (200 OK)**

```typescript
{
  hubs: Array<{
    id: string;
    displayId: string;              // PH0001
    slug: string;
    name: string;
    description: string;
    tagline?: string;
    
    // Domain Configuration
    subdomain?: string;             // 'ownernet.wytnet.com'
    customDomain?: string;          // 'ownernet.com'
    domainVerified: boolean;
    
    // Branding
    logoUrl?: string;
    faviconUrl?: string;
    brandColors: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    
    // Settings
    theme?: string;
    locale?: string;
    timezone?: string;
    
    // Features
    enabledModules: string[];       // Module IDs
    features: {
      enableWytWall: boolean;
      enableWytMatch: boolean;
      enableMarketplace: boolean;
      // ... other features
    };
    
    // Membership
    visibility: 'public' | 'private' | 'unlisted';
    requireApproval: boolean;
    allowSelfSignup: boolean;
    
    // Admins
    adminCount: number;
    memberCount: number;
    
    // Status
    status: 'active' | 'inactive' | 'suspended';
    isVerified: boolean;
    
    // Metadata
    metadata: Record<string, any>;
    
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }>;
  
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  
  statistics: {
    totalHubs: number;
    activeHubs: number;
    verifiedHubs: number;
    customDomains: number;
  };
}
```

---

### GET /api/admin/platform-hubs/:id

Get a specific hub with full details.

**Permission**: `hubs:view`

**Success Response (200 OK)**

```typescript
{
  hub: {
    // All hub fields from GET /api/admin/platform-hubs
    id: string;
    displayId: string;
    // ... all fields
    
    // Additional details
    admins: Array<{
      userId: string;
      userName: string;
      userEmail: string;
      userAvatar?: string;
      roleId?: string;
      roleName?: string;
      assignedAt: string;
      assignedBy: string;
    }>;
    
    activatedModules: Array<{
      moduleId: string;
      moduleName: string;
      isActive: boolean;
      activatedAt: string;
      settings: Record<string, any>;
    }>;
    
    analytics: {
      totalMembers: number;
      activeMembers: number;
      totalPosts: number;
      monthlyActivity: number;
    };
  };
}
```

---

### POST /api/admin/platform-hubs

Create a new hub.

**Permission**: `hubs:create`

**Request**

```typescript
POST /api/admin/platform-hubs
Content-Type: application/json

{
  slug: string;                    // Unique slug
  name: string;
  description: string;
  tagline?: string;
  subdomain?: string;
  customDomain?: string;
  logoUrl?: string;
  brandColors?: {
    primary?: string;
    secondary?: string;
  };
  theme?: string;
  locale?: string;
  timezone?: string;
  visibility?: 'public' | 'private';
  requireApproval?: boolean;
  allowSelfSignup?: boolean;
  metadata?: Record<string, any>;
}
```

**Success Response (201 Created)**

```typescript
{
  success: true;
  message: "Hub created successfully";
  hub: {
    id: string;
    displayId: string;
    slug: string;
    name: string;
    // ... all fields
  };
}
```

---

### PUT /api/admin/platform-hubs/:id

Update a hub.

**Permission**: `hubs:edit`

**Request**

```typescript
PUT /api/admin/platform-hubs/:id
Content-Type: application/json

{
  // All fields optional
  name?: string;
  description?: string;
  tagline?: string;
  customDomain?: string;
  logoUrl?: string;
  brandColors?: {
    primary?: string;
    secondary?: string;
  };
  theme?: string;
  features?: Record<string, boolean>;
  visibility?: 'public' | 'private';
  status?: 'active' | 'inactive' | 'suspended';
}
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Hub updated successfully";
  hub: {
    // Updated hub object
  };
}
```

---

### DELETE /api/admin/platform-hubs/:id

Delete a hub (soft delete).

**Permission**: `hubs:delete`

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Hub deleted successfully";
}
```

---

### POST /api/admin/platform-hubs/:hubId/admins

Assign an admin to a hub.

**Permission**: `hubs:edit`

**Request**

```typescript
POST /api/admin/platform-hubs/:hubId/admins
Content-Type: application/json

{
  userId: string;
  roleId?: string;                 // Optional role assignment
}
```

**Success Response (201 Created)**

```typescript
{
  success: true;
  message: "Admin assigned successfully";
  assignment: {
    hubId: string;
    userId: string;
    roleId?: string;
    assignedAt: string;
  };
}
```

---

### DELETE /api/admin/platform-hubs/:hubId/admins/:userId

Remove an admin from a hub.

**Permission**: `hubs:edit`

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Admin removed successfully";
}
```

---

## User Management APIs

### GET /api/admin/users

Get all users.

**Permission**: `users:view`

**Request**

```http
GET /api/admin/users?role=all&status=active&page=1&limit=50&search=john
```

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| role | string | 'all' | Filter by role: 'all', 'user', 'admin', 'super_admin' |
| status | string | 'all' | 'all', 'active', 'inactive', 'banned' |
| verified | boolean | - | Filter by verification status |
| search | string | - | Search in name, email, display ID |
| page | number | 1 | Page number |
| limit | number | 50 | Items per page |

**Success Response (200 OK)**

```typescript
{
  users: Array<{
    id: string;
    displayId: string;              // UR0000001
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    whatsappNumber?: string;
    
    // Status
    role: string;
    isSuperAdmin: boolean;
    isVerified: boolean;
    profileComplete: boolean;
    
    // Authentication
    authMethods: string[];         // ['password', 'google']
    socialProviders: string[];     // ['google', 'linkedin']
    
    // Roles & Permissions (RBAC)
    assignedRoles: Array<{
      roleId: string;
      roleName: string;
      scope: string;
    }>;
    
    // Activity
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  
  statistics: {
    totalUsers: number;
    verifiedUsers: number;
    activeToday: number;
    newThisMonth: number;
  };
}
```

---

### GET /api/admin/users/:id

Get a specific user with full details.

**Permission**: `users:view`

**Success Response (200 OK)**

```typescript
{
  user: {
    // Basic Info (same as GET /api/admin/users)
    id: string;
    displayId: string;
    // ... all fields
    
    // Profile Details
    profile: {
      username?: string;
      bio?: string;
      location?: string;
      website?: string;
      company?: string;
      jobTitle?: string;
      skills: string[];
      interests: string[];
    };
    
    // Roles & Permissions
    roles: Array<{
      roleId: string;
      roleName: string;
      roleDescription: string;
      scope: string;
      assignedAt: string;
      expiresAt?: string;
    }>;
    
    permissions: {
      [resource: string]: string[];  // { "users": ["view", "create"] }
    };
    
    // Hub Memberships
    hubMemberships: Array<{
      hubId: string;
      hubName: string;
      role: string;
      joinedAt: string;
    }>;
    
    // Activity Log (recent 10)
    recentActivity: Array<{
      action: string;
      resource: string;
      timestamp: string;
    }>;
    
    // Statistics
    statistics: {
      totalPosts: number;
      wytPoints: number;
      wytStars: number;
    };
  };
}
```

---

### PUT /api/admin/users/:id

Update a user.

**Permission**: `users:edit`

**Request**

```typescript
PUT /api/admin/users/:id
Content-Type: application/json

{
  // All fields optional
  name?: string;
  email?: string;
  role?: string;
  isSuperAdmin?: boolean;
  isVerified?: boolean;
}
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "User updated successfully";
  user: {
    // Updated user object
  };
}
```

---

### DELETE /api/admin/users/:id

Delete a user (soft delete).

**Permission**: `users:delete`

**Request**

```typescript
DELETE /api/admin/users/:id
Content-Type: application/json

{
  reason?: string;                 // Deletion reason
  permanent?: boolean;             // Hard delete (default: false)
}
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "User deleted successfully";
}
```

---

## Role & Permission Management APIs

### GET /api/admin/roles

Get all roles.

**Permission**: `roles-permissions:view`

**Success Response (200 OK)**

```typescript
{
  roles: Array<{
    id: string;
    displayId: string;              // RL00001
    name: string;
    description: string;
    scope: 'engine' | 'hub' | 'app';
    isSystem: boolean;             // Protected system role
    isActive: boolean;
    
    // Permissions
    permissions: Array<{
      id: string;
      displayId: string;           // PM00001
      resource: string;
      action: string;
      description: string;
    }>;
    
    // Usage
    userCount: number;             // Users with this role
    
    createdAt: string;
    updatedAt: string;
  }>;
}
```

---

### GET /api/admin/roles/:id

Get a specific role with full details.

**Permission**: `roles-permissions:view`

**Success Response (200 OK)**

```typescript
{
  role: {
    id: string;
    displayId: string;
    name: string;
    description: string;
    scope: string;
    isSystem: boolean;
    isActive: boolean;
    
    // Permissions
    permissions: Array<{
      id: string;
      displayId: string;
      resource: string;
      action: string;
      description: string;
    }>;
    
    // Users with this role
    users: Array<{
      userId: string;
      assignedAt: string;
      expiresAt?: string;
    }>;
  };
}
```

---

### POST /api/admin/roles

Create a new role.

**Permission**: `roles-permissions:create`

**Request**

```typescript
POST /api/admin/roles
Content-Type: application/json

{
  name: string;
  description: string;
  scope: 'engine' | 'hub' | 'app';
  permissionIds?: string[];        // Initial permissions
}
```

**Success Response (201 Created)**

```typescript
{
  success: true;
  message: "Role created successfully";
  role: {
    id: string;
    displayId: string;
    name: string;
    // ... all fields
  };
}
```

---

### PUT /api/admin/roles/:id

Update a role.

**Permission**: `roles-permissions:edit`

**Request**

```typescript
PUT /api/admin/roles/:id
Content-Type: application/json

{
  name?: string;
  description?: string;
  isActive?: boolean;
}
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Role updated successfully";
  role: {
    // Updated role object
  };
}
```

**Note**: System roles (isSystem: true) cannot be deleted or have their name changed.

---

### DELETE /api/admin/roles/:id

Delete a role.

**Permission**: `roles-permissions:delete`

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Role deleted successfully";
}
```

**Error**:
- Cannot delete system roles
- Cannot delete roles assigned to users (must reassign first)

---

### POST /api/admin/roles/:roleId/permissions

Assign permissions to a role.

**Permission**: `roles-permissions:edit`

**Request**

```typescript
POST /api/admin/roles/:roleId/permissions
Content-Type: application/json

{
  permissionIds: string[];         // Array of permission IDs
}
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Assigned 15 permissions to role";
}
```

**Note**: This replaces all existing permissions with the new set.

---

### DELETE /api/admin/roles/:roleId/permissions/:permissionId

Remove a specific permission from a role.

**Permission**: `roles-permissions:edit`

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Permission removed successfully";
}
```

---

### GET /api/admin/permissions

Get all available permissions.

**Permission**: `roles-permissions:view`

**Success Response (200 OK)**

```typescript
{
  permissions: Array<{
    id: string;
    displayId: string;              // PM00001
    resource: string;               // 'users', 'apps', 'hubs'
    action: string;                 // 'view', 'create', 'edit', 'delete'
    scope: 'engine' | 'hub' | 'app';
    description: string;
    isActive: boolean;
  }>;
  
  // Grouped by resource
  groupedByResource: Record<string, Array<Permission>>;
}
```

---

### POST /api/admin/users/:userId/roles

Assign roles to a user.

**Permission**: `users:edit`

**Request**

```typescript
POST /api/admin/users/:userId/roles
Content-Type: application/json

{
  roleIds: string[];               // Array of role IDs
  expiresAt?: string;              // Optional expiration (ISO 8601)
}
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Assigned 3 roles to user";
}
```

---

### GET /api/admin/users/:userId/roles

Get roles assigned to a user.

**Permission**: `users:view`

**Success Response (200 OK)**

```typescript
{
  roles: Array<{
    role: {
      id: string;
      name: string;
      description: string;
      scope: string;
    };
    assignedAt: string;
    expiresAt?: string;
  }>;
  
  // Computed permissions from all roles
  permissions: Array<{
    id: string;
    resource: string;
    action: string;
    description: string;
  }>;
}
```

---

## Audit Logs API

### GET /api/admin/audit-logs

Get platform audit logs.

**Permission**: `system-security:view`

**Request**

```http
GET /api/admin/audit-logs?userId=&action=&resource=&startDate=&endDate=&page=1&limit=50
```

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | Filter by user ID |
| action | string | Filter by action (e.g., 'create', 'update', 'delete') |
| resource | string | Filter by resource (e.g., 'users', 'modules') |
| startDate | string | ISO 8601 date |
| endDate | string | ISO 8601 date |
| search | string | Search in details |
| page | number | Page number |
| limit | number | Items per page (max 100) |

**Success Response (200 OK)**

```typescript
{
  logs: Array<{
    id: string;
    userId?: string;
    userName?: string;
    action: string;                // 'create', 'update', 'delete', 'login', etc.
    resource: string;              // 'users', 'modules', 'hubs', 'roles'
    resourceId?: string;
    details: Record<string, any>;  // Additional context
    ipAddress?: string;
    userAgent?: string;
    
    createdAt: string;
  }>;
  
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  
  statistics: {
    totalLogs: number;
    actionsToday: number;
    topActions: Array<{
      action: string;
      count: number;
    }>;
    topUsers: Array<{
      userId: string;
      userName: string;
      count: number;
    }>;
  };
}
```

---

## Platform Settings API

### GET /api/admin/platform-settings

Get all platform settings.

**Permission**: `system-security:view`

**Success Response (200 OK)**

```typescript
{
  settings: Record<string, {
    key: string;
    value: any;
    type: string;                  // 'string', 'number', 'boolean', 'json'
    category: string;              // 'general', 'security', 'email', 'payment'
    description: string;
    isPublic: boolean;
    updatedAt: string;
    updatedBy?: string;
  }>;
  
  categories: string[];
}
```

---

### PUT /api/admin/platform-settings/:key

Update a specific setting.

**Permission**: `system-security:edit`

**Request**

```typescript
PUT /api/admin/platform-settings/:key
Content-Type: application/json

{
  value: any;                      // New value (type must match setting type)
}
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Setting updated successfully";
  setting: {
    key: string;
    value: any;
    updatedAt: string;
  };
}
```

---

## Statistics & Analytics

### GET /api/admin/statistics

Get platform-wide statistics.

**Permission**: `analytics:view`

**Request**

```http
GET /api/admin/statistics?period=month&metric=all
```

**Success Response (200 OK)**

```typescript
{
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalHubs: number;
    totalApps: number;
    totalModules: number;
    totalPosts: number;
  };
  
  growth: {
    usersGrowth: number;           // Percentage
    hubsGrowth: number;
    postsGrowth: number;
  };
  
  activity: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
  
  engagement: {
    avgSessionDuration: number;    // Minutes
    avgPostsPerUser: number;
    avgCommentsPerPost: number;
  };
  
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;         // Percentage
  };
  
  topResources: {
    topHubs: Array<{
      id: string;
      name: string;
      members: number;
    }>;
    topModules: Array<{
      id: string;
      name: string;
      installs: number;
    }>;
  };
}
```

---

## Testing

### cURL Examples

**Get Modules**

```bash
curl -X GET "https://wytnet.com/api/admin/modules?category=payment" \
  -H "Cookie: wytpass.sid=<session-id>"
```

**Create Hub**

```bash
curl -X POST https://wytnet.com/api/admin/platform-hubs \
  -H "Content-Type: application/json" \
  -H "Cookie: wytpass.sid=<session-id>" \
  -d '{
    "slug": "techcommunity",
    "name": "Tech Community",
    "description": "A hub for tech enthusiasts",
    "subdomain": "tech",
    "visibility": "public"
  }'
```

**Assign Role to User**

```bash
curl -X POST https://wytnet.com/api/admin/users/UR0000123/roles \
  -H "Content-Type: application/json" \
  -H "Cookie: wytpass.sid=<session-id>" \
  -d '{
    "roleIds": ["RL00001", "RL00002"]
  }'
```

**Get Audit Logs**

```bash
curl -X GET "https://wytnet.com/api/admin/audit-logs?action=create&resource=users&page=1" \
  -H "Cookie: wytpass.sid=<session-id>"
```

---

## Error Handling

### Common Error Codes

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate slug/key, resource in use |
| 422 | Unprocessable Entity | Invalid data format |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limiting

Admin endpoints have higher rate limits than user endpoints:

| Endpoint Pattern | Limit | Window |
|------------------|-------|--------|
| GET endpoints | 100 requests | 1 minute |
| POST/PUT endpoints | 30 requests | 1 minute |
| DELETE endpoints | 10 requests | 1 minute |

---

## Best Practices

1. **Always check permissions** before attempting operations
2. **Use pagination** for large datasets
3. **Filter and search** to reduce payload size
4. **Monitor audit logs** regularly
5. **Use soft deletes** instead of hard deletes when possible
6. **Test in development** before applying to production
7. **Backup before** mass operations
8. **Validate input** on client-side before API calls
