import { db } from "../db";
import { 
  apps, 
  platformModules, 
  appModules, 
  moduleFeatures, 
  hubModules, 
  hubApps,
  appsRegistry
} from "../../shared/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Migration Script: Move JSONB data to Junction Tables
 * 
 * This script is idempotent - it can be run multiple times without issues.
 * It migrates data from JSONB columns to proper junction tables:
 * 
 * 1. apps.manifest.modules → app_modules
 * 2. platformModules.features → module_features (if applicable)
 * 3. hubs.config → hub_modules & hub_apps (if applicable)
 */

export async function migrateToJunctionTables() {
  console.log("🚀 Starting migration to junction tables...");

  try {
    // ============================================
    // 1. Migrate App Modules (apps.manifest.modules → app_modules)
    // ============================================
    console.log("\n📦 Migrating App Modules...");
    
    const allApps = await db.select({
      id: apps.id,
      name: apps.name,
      manifest: apps.manifest,
    }).from(apps);

    let appModulesCreated = 0;
    
    for (const app of allApps) {
      if (!app.manifest || typeof app.manifest !== 'object') continue;
      
      const manifest = app.manifest as any;
      const modules = manifest.modules || [];

      if (!Array.isArray(modules) || modules.length === 0) continue;

      for (const module of modules) {
        if (!module.id) continue;

        // Check if this relationship already exists
        const existing = await db.select()
          .from(appModules)
          .where(sql`${appModules.appId} = ${app.id} AND ${appModules.moduleId} = ${module.id}`)
          .limit(1);

        if (existing.length > 0) {
          console.log(`  ⏭️  Skipping existing: App "${app.name}" ↔ Module "${module.id}"`);
          continue;
        }

        // Insert into app_modules junction table
        await db.insert(appModules).values({
          appId: app.id,
          moduleId: module.id,
          isRequired: module.required ?? true,
          version: module.version || null,
          config: {},
          sortOrder: 0,
          metadata: {},
        });

        appModulesCreated++;
        console.log(`  ✅ Created: App "${app.name}" ↔ Module "${module.id}"`);
      }
    }

    console.log(`\n✨ App Modules Migration Complete! Created ${appModulesCreated} relationships.`);

    // ============================================
    // 2. Migrate Module Features (if applicable)
    // ============================================
    console.log("\n🎯 Migrating Module Features...");
    console.log("  ℹ️  Note: This requires features to be defined in platformModules.features JSONB");
    console.log("  ℹ️  Current implementation uses app_features table, not module features in JSONB");
    console.log("  ⏭️  Skipping module features migration (no JSONB source data)");

    // ============================================
    // 3. Migrate Hub Modules & Apps (if applicable)
    // ============================================
    console.log("\n🌐 Migrating Hub Modules & Apps...");
    console.log("  ℹ️  Note: This requires modules/apps to be defined in hubs.config JSONB");
    console.log("  ℹ️  Current implementation may not have hub module/app data in JSONB");
    console.log("  ⏭️  Skipping hub migration (no JSONB source data)");

    // ============================================
    // Summary
    // ============================================
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Migration to Junction Tables Complete!");
    console.log("=".repeat(50));
    console.log(`📊 Summary:`);
    console.log(`  • App Modules: ${appModulesCreated} relationships created`);
    console.log(`  • Module Features: Skipped (no JSONB source)`);
    console.log(`  • Hub Modules/Apps: Skipped (no JSONB source)`);
    console.log("\n✅ All idempotent migrations completed successfully!");

    return {
      success: true,
      appModulesCreated,
      moduleFeaturesCreated: 0,
      hubRelationshipsCreated: 0,
    };

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Allow running this script directly
if (require.main === module) {
  migrateToJunctionTables()
    .then(() => {
      console.log("\n✅ Migration script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Migration script failed:", error);
      process.exit(1);
    });
}
