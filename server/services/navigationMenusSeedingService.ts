import { db } from "../db";
import { navigationMenus } from "@shared/schema";
import { eq } from "drizzle-orm";

// Default Engine Admin navigation menus
const DEFAULT_ENGINE_MENUS = [
  { title: "Overview", route: "/engine", order: 1 },
  { title: "All Users", route: "/engine/users", order: 2 },
  { title: "All Orgs", route: "/engine/tenants", order: 3 },
  { title: "All Entities", route: "/engine/entities", order: 4 },
  { title: "DataSets", route: "/engine/datasets", order: 5 },
  { title: "Media", route: "/engine/media", order: 6 },
  { title: "Module Library", route: "/engine/modules", order: 7 },
  { title: "Apps", route: "/engine/apps", order: 8 },
  { title: "CMS", route: "/engine/cms", order: 9 },
  { title: "Themes", route: "/engine/themes", order: 10 },
  { title: "Plans & Prices", route: "/engine/plans-prices", order: 11 },
  { title: "Help & Support", route: "/engine/help-support", order: 12 },
  { title: "Finance", route: "/engine/finance", order: 13 },
  { title: "Analytics", route: "/engine/analytics", order: 14 },
  { title: "Platform Registry", route: "/engine/platform-registry", order: 15 },
  { title: "System & Security", route: "/engine/system-security", order: 16 },
  { title: "Integrations", route: "/engine/integrations", order: 17 },
  { title: "Global Settings", route: "/engine/global-settings", order: 18 },
  { title: "Platform Hubs", route: "/engine/platform-hubs", order: 19 },
  { title: "Roles & Permissions", route: "/engine/roles-permissions", order: 20 },
  { title: "Admin Users", route: "/engine/admin-users", order: 21 },
  { title: "Backups", route: "/engine/backups", order: 22 },
];

export async function seedNavigationMenus() {
  console.log('🧭 Seeding navigation menus...');
  
  try {
    let newCount = 0;
    let updatedCount = 0;

    for (const menu of DEFAULT_ENGINE_MENUS) {
      // Check if menu exists by route
      const existing = await db.select()
        .from(navigationMenus)
        .where(eq(navigationMenus.route, menu.route))
        .limit(1);

      if (existing.length === 0) {
        // Insert new menu
        await db.insert(navigationMenus).values({
          title: menu.title,
          route: menu.route,
          order: menu.order,
          scope: 'engine',
          isActive: true,
        });
        newCount++;
      } else {
        // Update existing menu
        await db.update(navigationMenus)
          .set({ 
            title: menu.title, 
            order: menu.order,
            updatedAt: new Date() 
          })
          .where(eq(navigationMenus.route, menu.route));
        updatedCount++;
      }
    }

    console.log(`✅ Navigation menus seeded: ${newCount} new, ${updatedCount} updated`);
  } catch (error) {
    console.error('Navigation menus seeding failed:', error);
    throw error;
  }
}
