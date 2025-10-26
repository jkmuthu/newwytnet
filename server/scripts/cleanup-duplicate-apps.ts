
import { db } from "../db";
import { apps } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Cleanup script to remove duplicate apps
 * Keeps the oldest app of each duplicate set
 */
async function cleanupDuplicateApps() {
  console.log('🧹 Starting duplicate apps cleanup...');

  try {
    // Find duplicate app names
    const duplicates = await db.execute(sql`
      SELECT name, COUNT(*) as count
      FROM ${apps}
      GROUP BY LOWER(name)
      HAVING COUNT(*) > 1
    `);

    if (duplicates.rows.length === 0) {
      console.log('✅ No duplicate apps found');
      return;
    }

    console.log(`Found ${duplicates.rows.length} duplicate app name(s)`);

    for (const dup of duplicates.rows) {
      const dupName = dup.name as string;
      console.log(`\n📝 Processing duplicates for: "${dupName}"`);

      // Get all apps with this name
      const matchingApps = await db
        .select()
        .from(apps)
        .where(sql`LOWER(${apps.name}) = LOWER(${dupName})`)
        .orderBy(apps.createdAt); // Oldest first

      if (matchingApps.length > 1) {
        const keepApp = matchingApps[0]; // Keep the oldest
        const removeApps = matchingApps.slice(1); // Remove the rest

        console.log(`  ✓ Keeping: ${keepApp.name} (ID: ${keepApp.id}, Created: ${keepApp.createdAt})`);
        
        for (const removeApp of removeApps) {
          console.log(`  ✗ Removing: ${removeApp.name} (ID: ${removeApp.id}, Created: ${removeApp.createdAt})`);
          await db.delete(apps).where(eq(apps.id, removeApp.id));
        }
      }
    }

    console.log('\n✅ Duplicate apps cleanup completed');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  cleanupDuplicateApps()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { cleanupDuplicateApps };
