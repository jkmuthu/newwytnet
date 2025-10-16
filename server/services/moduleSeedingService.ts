/**
 * Module Catalog Seeding Service
 * Seeds platform_modules table from MODULE_CATALOG definitions
 */

import { db } from "../db";
import { platformModules } from "@shared/schema";
import { MODULE_CATALOG } from "../modules-catalog";
import { eq } from "drizzle-orm";

export class ModuleSeedingService {
  /**
   * Seed all modules from MODULE_CATALOG into platform_modules table
   */
  async seedModules() {
    console.log('🔌 Seeding platform modules from catalog...');
    
    try {
      let seededCount = 0;
      let skippedCount = 0;

      for (const module of MODULE_CATALOG) {
        try {
          // Check if module already exists
          const existing = await db.select()
            .from(platformModules)
            .where(eq(platformModules.id, module.id))
            .limit(1);

          if (existing.length > 0) {
            // Update existing module
            await db.update(platformModules)
              .set({
                name: module.name,
                description: module.description,
                category: module.category,
                type: module.type || 'native',
                contexts: module.contexts,
                dependencies: module.dependencies || [],
                apiEndpoints: module.apiEndpoints,
                settings: module.settings || {},
                compatibilityMatrix: module.compatibilityMatrix || {},
                status: 'active',
                pricing: module.pricing || 'free',
                price: module.price?.toString() || null,
                icon: module.icon,
                color: module.color
              })
              .where(eq(platformModules.id, module.id));
            
            skippedCount++;
          } else {
            // Insert new module
            await db.insert(platformModules)
              .values({
                id: module.id,
                name: module.name,
                description: module.description,
                category: module.category,
                type: module.type || 'native',
                contexts: module.contexts,
                dependencies: module.dependencies || [],
                apiEndpoints: module.apiEndpoints,
                settings: module.settings || {},
                compatibilityMatrix: module.compatibilityMatrix || {},
                status: 'active',
                pricing: module.pricing || 'free',
                price: module.price?.toString() || null,
                icon: module.icon,
                color: module.color,
                route: `/modules/${module.id}` // Default route based on module ID
              });
            
            seededCount++;
          }
        } catch (error: any) {
          console.error(`  ❌ Failed to seed module "${module.name}":`, error.message);
        }
      }

      console.log(`✅ Module seeding complete: ${seededCount} new, ${skippedCount} updated`);
    } catch (error) {
      console.error('❌ Module seeding failed:', error);
    }
  }
}

export const moduleSeedingService = new ModuleSeedingService();
