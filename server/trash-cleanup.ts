/**
 * Trash Cleanup Job
 * 
 * Permanently deletes records that have been in trash for more than 90 days.
 * This job should be run daily via a cron job or scheduled task.
 * 
 * Retention Policy: 90 days from deletedAt timestamp
 */

import { db } from './db';
import { users, tenants, hubs, apps, platformModules, pages, blocks } from '@shared/schema';
import { lt, and, isNotNull, sql } from 'drizzle-orm';

const RETENTION_DAYS = 90;

export async function cleanupTrash() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  console.log(`[Trash Cleanup] Starting cleanup for items deleted before ${cutoffDate.toISOString()}`);

  try {
    const results = {
      users: 0,
      tenants: 0,
      hubs: 0,
      apps: 0,
      platformModules: 0,
      pages: 0,
      blocks: 0,
    };

    // Clean up users
    const deletedUsers = await db
      .delete(users)
      .where(
        and(
          isNotNull(users.deletedAt),
          lt(users.deletedAt, cutoffDate)
        )
      )
      .returning({ id: users.id });
    results.users = deletedUsers.length;

    // Clean up tenants/organizations
    const deletedTenants = await db
      .delete(tenants)
      .where(
        and(
          isNotNull(tenants.deletedAt),
          lt(tenants.deletedAt, cutoffDate)
        )
      )
      .returning({ id: tenants.id });
    results.tenants = deletedTenants.length;

    // Clean up hubs
    const deletedHubs = await db
      .delete(hubs)
      .where(
        and(
          isNotNull(hubs.deletedAt),
          lt(hubs.deletedAt, cutoffDate)
        )
      )
      .returning({ id: hubs.id });
    results.hubs = deletedHubs.length;

    // Clean up apps
    const deletedApps = await db
      .delete(apps)
      .where(
        and(
          isNotNull(apps.deletedAt),
          lt(apps.deletedAt, cutoffDate)
        )
      )
      .returning({ id: apps.id });
    results.apps = deletedApps.length;

    // Clean up platform modules
    const deletedModules = await db
      .delete(platformModules)
      .where(
        and(
          isNotNull(platformModules.deletedAt),
          lt(platformModules.deletedAt, cutoffDate)
        )
      )
      .returning({ id: platformModules.id });
    results.platformModules = deletedModules.length;

    // Clean up CMS pages
    const deletedPages = await db
      .delete(pages)
      .where(
        and(
          isNotNull(pages.deletedAt),
          lt(pages.deletedAt, cutoffDate)
        )
      )
      .returning({ id: pages.id });
    results.pages = deletedPages.length;

    // Clean up CMS blocks
    const deletedBlocks = await db
      .delete(blocks)
      .where(
        and(
          isNotNull(blocks.deletedAt),
          lt(blocks.deletedAt, cutoffDate)
        )
      )
      .returning({ id: blocks.id });
    results.blocks = deletedBlocks.length;

    const totalDeleted = Object.values(results).reduce((sum, count) => sum + count, 0);

    console.log('[Trash Cleanup] Cleanup completed successfully:');
    console.log(`  - Users: ${results.users}`);
    console.log(`  - Organizations: ${results.tenants}`);
    console.log(`  - Hubs: ${results.hubs}`);
    console.log(`  - Apps: ${results.apps}`);
    console.log(`  - Modules: ${results.platformModules}`);
    console.log(`  - Pages: ${results.pages}`);
    console.log(`  - Blocks: ${results.blocks}`);
    console.log(`  - Total: ${totalDeleted} records permanently deleted`);

    return results;
  } catch (error) {
    console.error('[Trash Cleanup] Error during cleanup:', error);
    throw error;
  }
}

// CLI execution support
if (require.main === module) {
  cleanupTrash()
    .then(() => {
      console.log('[Trash Cleanup] Job finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Trash Cleanup] Job failed:', error);
      process.exit(1);
    });
}
