import { db } from "../db";
import { userAppInstallations, platformModules } from "@shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * Auto-install core free apps for new users
 * Core apps: WytScore, WytWallet, WytPoints, WytDuty
 */
export async function autoInstallCoreApps(userId: string): Promise<void> {
  try {
    // Core app IDs that should be auto-installed
    const coreAppIds = ['wytscore', 'wytwallet', 'wytpoints', 'wytduty'];

    // Fetch core apps from platform modules
    const coreApps = await db
      .select()
      .from(platformModules)
      .where(
        and(
          eq(platformModules.status, 'enabled'),
          eq(platformModules.pricing, 'free')
        )
      );

    // Filter to only core apps
    const appsToInstall = coreApps.filter(app => coreAppIds.includes(app.id));

    // Install each core app
    for (const app of appsToInstall as any[]) {
      try {
        // Check if already installed
        const [existing] = await db
          .select()
          .from(userAppInstallations)
          .where(
            and(
              eq(userAppInstallations.userId, userId),
              eq(userAppInstallations.appSlug, app.id)
            )
          )
          .limit(1);

        if (!existing) {
          await db.insert(userAppInstallations).values({
            userId,
            appSlug: app.id,
            status: 'active',
            subscriptionTier: 'free',
          });
          console.log(`✅ Auto-installed ${app.name} for user ${userId}`);
        }
      } catch (error) {
        console.error(`Failed to auto-install ${app.name}:`, error);
        // Continue with other apps even if one fails
      }
    }

    console.log(`✅ Core apps installation completed for user ${userId}`);
  } catch (error) {
    console.error('Error auto-installing core apps:', error);
    // Don't throw - user creation succeeded
  }
}
