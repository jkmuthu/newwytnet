import { db } from "../db";
import { permissions, roles, rolePermissions } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

// Define engine-level resources/sections - aligned with menu structure
const ENGINE_RESOURCES = [
  { key: "users", label: "Users", description: "Manage all platform users" },
  { key: "organizations", label: "Organizations", description: "Manage all organizations" },
  { key: "entities", label: "Entities", description: "Manage all entities" },
  { key: "datasets", label: "DataSets", description: "Manage all datasets" },
  { key: "media", label: "Media", description: "Manage all media files" },
  { key: "modules", label: "Modules", description: "Manage module library" },
  { key: "apps", label: "Apps", description: "Manage all applications" },
  { key: "hubs", label: "Hubs", description: "Manage platform hubs" },
  { key: "cms", label: "CMS", description: "Manage CMS content" },
  { key: "themes", label: "Themes", description: "Manage all themes" },
  { key: "integrations", label: "Integrations", description: "Manage all integrations" },
  { key: "pricing", label: "Pricing", description: "Manage pricing and plans" },
  { key: "help-support", label: "Help & Support", description: "Manage help centre content" },
  { key: "analytics", label: "Analytics", description: "View and manage analytics" },
  { key: "roles-permissions", label: "Roles & Permissions", description: "Manage roles and permissions" },
  { key: "system-security", label: "System & Security", description: "Manage system and security settings" },
];

// CRUD actions to seed
const CRUD_ACTIONS = ["view", "create", "edit", "delete"] as const;

export async function seedEnginePermissions() {
  console.log("\n🔐 Seeding engine-level permissions...");
  
  let newCount = 0;
  let updatedCount = 0;
  
  // Ensure sequence exists for permission display IDs
  await db.execute(sql`
    CREATE SEQUENCE IF NOT EXISTS pm_seq START 1;
  `);
  
  for (const resource of ENGINE_RESOURCES) {
    for (const action of CRUD_ACTIONS) {
      // Check if permission already exists
      const existing = await db
        .select()
        .from(permissions)
        .where(
          and(
            eq(permissions.resource, resource.key),
            eq(permissions.action, action),
            eq(permissions.scope, "engine")
          )
        )
        .limit(1);
      
      if (existing.length === 0) {
        // Generate display ID
        const displayId = `PM${String(
          (await db.execute(sql`SELECT nextval('pm_seq')`)).rows[0].nextval
        ).padStart(5, "0")}`;
        
        // Create new permission
        await db.insert(permissions).values({
          displayId,
          resource: resource.key,
          action,
          scope: "engine",
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource.label}`,
          isActive: true,
        });
        
        newCount++;
      } else {
        // Update existing permission description
        await db
          .update(permissions)
          .set({
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource.label}`,
            isActive: true,
          })
          .where(eq(permissions.id, existing[0].id));
        
        updatedCount++;
      }
    }
  }
  
  console.log(`  ✓ Permissions: ${newCount} new, ${updatedCount} updated`);
}

export async function seedDefaultEngineRoles() {
  console.log("\n👥 Seeding default engine roles...");
  
  // Ensure sequence exists for role display IDs
  await db.execute(sql`
    CREATE SEQUENCE IF NOT EXISTS rl_seq START 1;
  `);
  
  const defaultRoles = [
    {
      name: "Super Admin",
      description: "Full access to all engine features and settings",
      displayId: "RL00001",
      scope: "engine" as const,
      isSystem: true,
      allPermissions: true,
    },
    {
      name: "Admin",
      description: "Administrative access with limited system-level permissions",
      displayId: "RL00002",
      scope: "engine" as const,
      isSystem: true,
      allPermissions: false,
    },
    {
      name: "Viewer",
      description: "Read-only access to engine resources",
      displayId: "RL00003",
      scope: "engine" as const,
      isSystem: true,
      allPermissions: false,
    },
    {
      name: "Developer",
      description: "Access to modules, apps, themes, and integrations for development",
      displayId: "RL00004",
      scope: "engine" as const,
      isSystem: true,
      allPermissions: false,
      permissionResources: ["modules", "apps", "themes", "integrations"],
    },
    {
      name: "Data Manager",
      description: "Access to datasets, entities, and media management",
      displayId: "RL00005",
      scope: "engine" as const,
      isSystem: true,
      allPermissions: false,
      permissionResources: ["datasets", "entities", "media"],
    },
    {
      name: "Finance Manager",
      description: "Access to finance, billing, pricing, and analytics",
      displayId: "RL00006",
      scope: "engine" as const,
      isSystem: true,
      allPermissions: false,
      permissionResources: ["pricing", "analytics"],
      viewOnlyResources: ["users", "organizations"],
    },
    {
      name: "Hub Manager",
      description: "Access to platform hubs and CMS management",
      displayId: "RL00007",
      scope: "engine" as const,
      isSystem: true,
      allPermissions: false,
      permissionResources: ["hubs", "cms"],
    },
    {
      name: "Analyst",
      description: "View-only access to analytics and reporting across all resources",
      displayId: "RL00008",
      scope: "engine" as const,
      isSystem: true,
      allPermissions: false,
      viewOnly: true,
    },
  ];
  
  for (const roleData of defaultRoles) {
    // Check if role already exists
    const existing = await db
      .select()
      .from(roles)
      .where(
        and(
          eq(roles.name, roleData.name),
          eq(roles.scope, "engine")
        )
      )
      .limit(1);
    
    let roleId: string;
    
    if (existing.length === 0) {
      // Ensure sequence is at least at the expected number
      const expectedNumber = parseInt(roleData.displayId.substring(2));
      await db.execute(sql`
        SELECT setval('rl_seq', GREATEST((SELECT COALESCE(MAX(CAST(SUBSTRING(display_id FROM 3) AS INTEGER)), 0) FROM roles WHERE display_id LIKE 'RL%'), ${expectedNumber}))
      `);
      
      // Create new role
      const [newRole] = await db
        .insert(roles)
        .values({
          displayId: roleData.displayId,
          name: roleData.name,
          description: roleData.description,
          scope: roleData.scope,
          isSystem: roleData.isSystem,
          isActive: true,
        })
        .returning();
      
      roleId = newRole.id;
      console.log(`  ✓ Created role: ${roleData.name} (${roleData.displayId})`);
      
      // Assign permissions to Super Admin
      if (roleData.allPermissions) {
        const allPermissions = await db
          .select()
          .from(permissions)
          .where(eq(permissions.scope, "engine"));
        
        for (const perm of allPermissions) {
          // Check if role-permission relationship exists
          const existingRP = await db
            .select()
            .from(rolePermissions)
            .where(
              and(
                eq(rolePermissions.roleId, roleId),
                eq(rolePermissions.permissionId, perm.id)
              )
            )
            .limit(1);
          
          if (existingRP.length === 0) {
            await db.insert(rolePermissions).values({
              roleId,
              permissionId: perm.id,
            });
          }
        }
        
        console.log(`    ✓ Assigned all ${allPermissions.length} permissions to ${roleData.name}`);
      }
      
      // Assign view permissions to Viewer
      if (roleData.name === "Viewer") {
        const viewPermissions = await db
          .select()
          .from(permissions)
          .where(
            and(
              eq(permissions.scope, "engine"),
              eq(permissions.action, "view")
            )
          );
        
        for (const perm of viewPermissions) {
          const existingRP = await db
            .select()
            .from(rolePermissions)
            .where(
              and(
                eq(rolePermissions.roleId, roleId),
                eq(rolePermissions.permissionId, perm.id)
              )
            )
            .limit(1);
          
          if (existingRP.length === 0) {
            await db.insert(rolePermissions).values({
              roleId,
              permissionId: perm.id,
            });
          }
        }
        
        console.log(`    ✓ Assigned ${viewPermissions.length} view permissions to ${roleData.name}`);
      }
      
      // Assign resource-specific permissions to custom roles
      if (roleData.permissionResources) {
        const resourcePerms = await db
          .select()
          .from(permissions)
          .where(eq(permissions.scope, "engine"));
        
        const filteredPerms = resourcePerms.filter(p => 
          roleData.permissionResources?.includes(p.resource)
        );
        
        for (const perm of filteredPerms) {
          const existingRP = await db
            .select()
            .from(rolePermissions)
            .where(
              and(
                eq(rolePermissions.roleId, roleId),
                eq(rolePermissions.permissionId, perm.id)
              )
            )
            .limit(1);
          
          if (existingRP.length === 0) {
            await db.insert(rolePermissions).values({
              roleId,
              permissionId: perm.id,
            });
          }
        }
        
        console.log(`    ✓ Assigned ${filteredPerms.length} permissions to ${roleData.name}`);
      }
      
      // Assign view-only permissions for specific resources
      if (roleData.viewOnlyResources) {
        const resourcePerms = await db
          .select()
          .from(permissions)
          .where(
            and(
              eq(permissions.scope, "engine"),
              eq(permissions.action, "view")
            )
          );
        
        const filteredPerms = resourcePerms.filter(p => 
          roleData.viewOnlyResources?.includes(p.resource)
        );
        
        for (const perm of filteredPerms) {
          const existingRP = await db
            .select()
            .from(rolePermissions)
            .where(
              and(
                eq(rolePermissions.roleId, roleId),
                eq(rolePermissions.permissionId, perm.id)
              )
            )
            .limit(1);
          
          if (existingRP.length === 0) {
            await db.insert(rolePermissions).values({
              roleId,
              permissionId: perm.id,
            });
          }
        }
        
        console.log(`    ✓ Assigned ${filteredPerms.length} view-only permissions to ${roleData.name}`);
      }
      
      // Assign all view permissions to Analyst
      if (roleData.viewOnly && roleData.name === "Analyst") {
        const viewPermissions = await db
          .select()
          .from(permissions)
          .where(
            and(
              eq(permissions.scope, "engine"),
              eq(permissions.action, "view")
            )
          );
        
        for (const perm of viewPermissions) {
          const existingRP = await db
            .select()
            .from(rolePermissions)
            .where(
              and(
                eq(rolePermissions.roleId, roleId),
                eq(rolePermissions.permissionId, perm.id)
              )
            )
            .limit(1);
          
          if (existingRP.length === 0) {
            await db.insert(rolePermissions).values({
              roleId,
              permissionId: perm.id,
            });
          }
        }
        
        console.log(`    ✓ Assigned ${viewPermissions.length} view permissions to ${roleData.name}`);
      }
    } else {
      roleId = existing[0].id;
      
      // Update existing role
      await db
        .update(roles)
        .set({
          description: roleData.description,
          isActive: true,
        })
        .where(eq(roles.id, roleId));
      
      console.log(`  ✓ Updated role: ${roleData.name} (${existing[0].displayId})`);
    }
  }
  
  console.log("✅ Default engine roles seeded");
}
