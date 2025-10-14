import { db } from '../db';
import { appsRegistry, pricingPlans } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { createDefaultPlansForApp } from '../utils/createDefaultPlans';

/**
 * Seeds default pricing plans for all existing apps in the registry
 * that don't already have the complete set of default plans
 */
async function seedDefaultPlans() {
  try {
    console.log('🚀 Starting default plans seeding...');

    // Get all apps from registry
    const apps = await db.select().from(appsRegistry);

    console.log(`📋 Found ${apps.length} apps in registry`);

    for (const app of apps) {
      // Check how many plans this app already has
      const existingPlansCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(pricingPlans)
        .where(eq(pricingPlans.appId, app.id));

      const planCount = existingPlansCount[0]?.count || 0;

      // If app has less than 5 plans, it needs default plans
      if (planCount < 5) {
        console.log(`  📦 Creating default plans for: ${app.name} (currently has ${planCount} plans)`);
        
        // Delete existing plans first to avoid duplicates
        if (planCount > 0) {
          await db.delete(pricingPlans)
            .where(eq(pricingPlans.appId, app.id));
          console.log(`  🗑️  Deleted ${planCount} existing plans`);
        }

        // Create default plans
        await createDefaultPlansForApp(app.id);
      } else {
        console.log(`  ✅ ${app.name} already has ${planCount} plans (skipping)`);
      }
    }

    console.log('✨ Default plans seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding default plans:', error);
    process.exit(1);
  }
}

// Run the seed script
seedDefaultPlans();
