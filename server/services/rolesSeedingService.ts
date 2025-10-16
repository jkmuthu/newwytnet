import { db } from "../db";
import { 
  roles, 
  permissions, 
  rolePermissions,
  type InsertRole,
  type InsertPermission,
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

// Display ID Sequences for Roles & Permissions
const ROLE_SEQUENCE = "RL";
const PERMISSION_SEQUENCE = "PM";

// Generate Display ID for Roles
async function generateRoleDisplayId(): Promise<string> {
  const sequenceName = `${ROLE_SEQUENCE.toLowerCase()}_seq`;
  const result = await db.execute(sql`
    SELECT nextval('${sql.raw(sequenceName)}') as next_id
  `);
  const nextId = Number(result.rows[0]?.next_id || 1);
  return `${ROLE_SEQUENCE}${String(nextId).padStart(7, '0')}`;
}

// Generate Display ID for Permissions
async function generatePermissionDisplayId(): Promise<string> {
  const sequenceName = `${PERMISSION_SEQUENCE.toLowerCase()}_seq`;
  const result = await db.execute(sql`
    SELECT nextval('${sql.raw(sequenceName)}') as next_id
  `);
  const nextId = Number(result.rows[0]?.next_id || 1);
  return `${PERMISSION_SEQUENCE}${String(nextId).padStart(7, '0')}`;
}

// Define permission resources and actions
const PERMISSION_DEFINITIONS = [
  // Tenant Management
  { resource: "tenants", action: "view" as const, description: "View tenant information" },
  { resource: "tenants", action: "create" as const, description: "Create new tenants" },
  { resource: "tenants", action: "edit" as const, description: "Edit tenant details" },
  { resource: "tenants", action: "delete" as const, description: "Delete tenants" },
  { resource: "tenants", action: "manage" as const, description: "Full tenant management access" },
  
  // User Management
  { resource: "users", action: "view" as const, description: "View user information" },
  { resource: "users", action: "create" as const, description: "Create new users" },
  { resource: "users", action: "edit" as const, description: "Edit user details" },
  { resource: "users", action: "delete" as const, description: "Delete users" },
  { resource: "users", action: "manage" as const, description: "Full user management access" },
  
  // Role & Permission Management
  { resource: "roles", action: "view" as const, description: "View roles and permissions" },
  { resource: "roles", action: "create" as const, description: "Create new roles" },
  { resource: "roles", action: "edit" as const, description: "Edit roles and assign permissions" },
  { resource: "roles", action: "delete" as const, description: "Delete roles" },
  { resource: "roles", action: "manage" as const, description: "Full role management access" },
  
  // Module Management
  { resource: "modules", action: "view" as const, description: "View platform modules" },
  { resource: "modules", action: "create" as const, description: "Create new modules" },
  { resource: "modules", action: "edit" as const, description: "Edit module configurations" },
  { resource: "modules", action: "delete" as const, description: "Delete modules" },
  { resource: "modules", action: "manage" as const, description: "Full module management access" },
  
  // Application Management
  { resource: "applications", action: "view" as const, description: "View applications" },
  { resource: "applications", action: "create" as const, description: "Create new applications" },
  { resource: "applications", action: "edit" as const, description: "Edit application details" },
  { resource: "applications", action: "delete" as const, description: "Delete applications" },
  { resource: "applications", action: "manage" as const, description: "Full application management" },
  
  // Platform Hub Management
  { resource: "platform_hubs", action: "view" as const, description: "View platform hubs" },
  { resource: "platform_hubs", action: "create" as const, description: "Create new platform hubs" },
  { resource: "platform_hubs", action: "edit" as const, description: "Edit platform hub settings" },
  { resource: "platform_hubs", action: "delete" as const, description: "Delete platform hubs" },
  { resource: "platform_hubs", action: "manage" as const, description: "Full platform hub management" },
  
  // Content Management
  { resource: "content", action: "view" as const, description: "View content items" },
  { resource: "content", action: "create" as const, description: "Create new content" },
  { resource: "content", action: "edit" as const, description: "Edit content" },
  { resource: "content", action: "delete" as const, description: "Delete content" },
  
  // Settings & Configuration
  { resource: "settings", action: "view" as const, description: "View platform settings" },
  { resource: "settings", action: "edit" as const, description: "Edit platform settings" },
  { resource: "settings", action: "configure" as const, description: "Configure advanced settings" },
  
  // Analytics & Reports
  { resource: "analytics", action: "view" as const, description: "View analytics and reports" },
];

// Define default role configurations
const DEFAULT_ROLES = [
  {
    name: "Super Admin",
    description: "Full system access with all permissions across the platform",
    scope: "engine" as const,
    isSystem: true,
    permissions: ["*"], // All permissions
  },
  {
    name: "Platform Manager",
    description: "Manage tenants, users, and platform-level resources",
    scope: "engine" as const,
    isSystem: true,
    permissions: [
      "tenants:view", "tenants:create", "tenants:edit",
      "users:view", "users:create", "users:edit",
      "modules:view", "modules:edit",
      "applications:view",
      "platform_hubs:view", "platform_hubs:edit",
      "analytics:view",
    ],
  },
  {
    name: "Content Manager",
    description: "Manage content across the platform",
    scope: "engine" as const,
    isSystem: true,
    permissions: [
      "content:view", "content:create", "content:edit", "content:delete",
      "modules:view",
      "applications:view",
      "analytics:view",
    ],
  },
  {
    name: "Support Admin",
    description: "View-only access for support and troubleshooting",
    scope: "engine" as const,
    isSystem: true,
    permissions: [
      "tenants:view",
      "users:view",
      "modules:view",
      "applications:view",
      "content:view",
      "settings:view",
      "analytics:view",
    ],
  },
  {
    name: "Hub Admin",
    description: "Full access to manage a specific hub",
    scope: "hub" as const,
    isSystem: true,
    permissions: [
      "users:view", "users:create", "users:edit",
      "content:view", "content:create", "content:edit", "content:delete",
      "modules:view", "modules:edit",
      "applications:view", "applications:create", "applications:edit",
      "settings:view", "settings:edit",
      "analytics:view",
    ],
  },
];

// Seed permissions
export async function seedPermissions() {
  console.log("🌱 Seeding permissions...");
  
  // Create sequence for permissions if it doesn't exist
  await db.execute(sql`
    CREATE SEQUENCE IF NOT EXISTS pm_seq START WITH 1;
  `);
  
  const createdPermissions: Record<string, any> = {};
  
  for (const permDef of PERMISSION_DEFINITIONS) {
    // Check if permission already exists
    const existing = await db
      .select()
      .from(permissions)
      .where(
        and(
          eq(permissions.resource, permDef.resource),
          eq(permissions.action, permDef.action),
          eq(permissions.scope, "engine")
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      createdPermissions[`${permDef.resource}:${permDef.action}`] = existing[0];
      continue;
    }
    
    // Create new permission
    const displayId = await generatePermissionDisplayId();
    const [newPermission] = await db
      .insert(permissions)
      .values({
        displayId,
        resource: permDef.resource,
        action: permDef.action,
        scope: "engine",
        description: permDef.description,
        isActive: true,
      })
      .returning();
    
    createdPermissions[`${permDef.resource}:${permDef.action}`] = newPermission;
    console.log(`  ✓ Created permission: ${permDef.resource}:${permDef.action}`);
  }
  
  return createdPermissions;
}

// Seed roles
export async function seedRoles(permissionsMap: Record<string, any>) {
  console.log("🌱 Seeding roles...");
  
  // Create sequence for roles if it doesn't exist
  await db.execute(sql`
    CREATE SEQUENCE IF NOT EXISTS rl_seq START WITH 1;
  `);
  
  const createdRoles = [];
  
  for (const roleDef of DEFAULT_ROLES) {
    // Check if role already exists
    const existing = await db
      .select()
      .from(roles)
      .where(
        and(
          eq(roles.name, roleDef.name),
          eq(roles.scope, roleDef.scope)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      console.log(`  ⚠ Role already exists: ${roleDef.name}`);
      createdRoles.push(existing[0]);
      continue;
    }
    
    // Create new role
    const displayId = await generateRoleDisplayId();
    const [newRole] = await db
      .insert(roles)
      .values({
        displayId,
        name: roleDef.name,
        description: roleDef.description,
        scope: roleDef.scope,
        isSystem: roleDef.isSystem,
        isActive: true,
      })
      .returning();
    
    console.log(`  ✓ Created role: ${roleDef.name} (${displayId})`);
    
    // Assign permissions to role
    if (roleDef.permissions.includes("*")) {
      // Super Admin gets all permissions
      const allPermissions = Object.values(permissionsMap);
      for (const permission of allPermissions) {
        await db.insert(rolePermissions).values({
          roleId: newRole.id,
          permissionId: permission.id,
        });
      }
      console.log(`    → Assigned ALL permissions to ${roleDef.name}`);
    } else {
      // Assign specific permissions
      for (const permKey of roleDef.permissions) {
        const permission = permissionsMap[permKey];
        if (permission) {
          await db.insert(rolePermissions).values({
            roleId: newRole.id,
            permissionId: permission.id,
          });
        }
      }
      console.log(`    → Assigned ${roleDef.permissions.length} permissions to ${roleDef.name}`);
    }
    
    createdRoles.push(newRole);
  }
  
  return createdRoles;
}

// Main seeding function
export async function seedRolesAndPermissions() {
  try {
    console.log("\n========================================");
    console.log("🚀 Starting Roles & Permissions Seeding");
    console.log("========================================\n");
    
    const permissionsMap = await seedPermissions();
    const rolesData = await seedRoles(permissionsMap);
    
    console.log("\n========================================");
    console.log("✅ Seeding completed successfully!");
    console.log("========================================\n");
    
    return { permissions: permissionsMap, roles: rolesData };
  } catch (error) {
    console.error("❌ Error seeding roles and permissions:", error);
    throw error;
  }
}
