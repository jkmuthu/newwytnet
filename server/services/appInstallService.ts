import { db } from "../db";
import { userAppInstallations, apps } from "@shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * Auto-install mandatory/core apps for new users
 * Mandatory apps: WytPass, WytWall (apps with appType='mandatory' and isAutoAssigned=true)
 */
export async function autoInstallCoreApps(userId: string): Promise<void> {
  try {
    // Fetch mandatory apps from apps table (appType='mandatory' and isAutoAssigned=true)
    const mandatoryApps = await db
      .select()
      .from(apps)
      .where(
        and(
          eq(apps.appType, 'mandatory'),
          eq(apps.isAutoAssigned, true),
          eq(apps.status, 'active')
        )
      );

    console.log(`🔒 Found ${mandatoryApps.length} mandatory apps to auto-install for user ${userId}`);

    // Install each mandatory app
    for (const app of mandatoryApps) {
      try {
        // Check if already installed
        const [existing] = await db
          .select()
          .from(userAppInstallations)
          .where(
            and(
              eq(userAppInstallations.userId, userId),
              eq(userAppInstallations.appSlug, app.slug || app.key)
            )
          )
          .limit(1);

        if (!existing) {
          await db.insert(userAppInstallations).values({
            userId,
            appSlug: app.slug || app.key,
            status: 'active',
            subscriptionTier: 'free',
            installedAt: new Date(),
            updatedAt: new Date(),
          });
          console.log(`  ✓ Auto-installed ${app.name} for user ${userId}`);
        } else {
          console.log(`  ~ ${app.name} already installed for user ${userId}`);
        }
      } catch (error) {
        console.error(`Failed to auto-install ${app.name}:`, error);
      }
    }

    console.log(`✅ Mandatory apps installation completed for user ${userId}`);
  } catch (error) {
    console.error('Error auto-installing mandatory apps:', error);
  }
}

/**
 * Check if an app is mandatory/core (cannot be removed)
 */
export async function isMandatoryApp(appSlug: string): Promise<boolean> {
  const [app] = await db
    .select()
    .from(apps)
    .where(
      and(
        eq(apps.slug, appSlug),
        eq(apps.appType, 'mandatory'),
        eq(apps.isCoreApp, true)
      )
    )
    .limit(1);
  
  return !!app;
}
