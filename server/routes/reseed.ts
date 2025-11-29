import { Router } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { adminAuthMiddleware } from "../customAuth";
import { requirePermission } from "../permission-middleware";

const router = Router();

interface SeedingResult {
  service: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  duration?: number;
}

interface HealthCheckResult {
  table: string;
  count: number;
  status: 'populated' | 'empty' | 'error';
}

async function runAllSeeding(): Promise<SeedingResult[]> {
  const results: SeedingResult[] = [];

  const seedingTasks = [
    {
      name: 'Modules',
      fn: async () => {
        const { moduleSeedingService } = await import('../services/moduleSeedingService');
        await moduleSeedingService.seedModules();
      }
    },
    {
      name: 'Entities',
      fn: async () => {
        const { entitySeedingService } = await import('../services/entitySeedingService');
        await entitySeedingService.seedAll();
      }
    },
    {
      name: 'Platform Hubs',
      fn: async () => {
        const { seedPlatformHubs } = await import('../services/platformHubsSeedingService');
        await seedPlatformHubs();
      }
    },
    {
      name: 'Permissions',
      fn: async () => {
        const { seedEnginePermissions, seedDefaultEngineRoles } = await import('../services/permissionsSeedingService');
        await seedEnginePermissions();
        await seedDefaultEngineRoles();
      }
    },
    {
      name: 'Navigation Menus',
      fn: async () => {
        const { seedNavigationMenus } = await import('../services/navigationMenusSeedingService');
        await seedNavigationMenus();
      }
    },
    {
      name: 'Platform Themes',
      fn: async () => {
        const { seedPlatformThemes } = await import('../services/themesSeedingService');
        await seedPlatformThemes();
      }
    },
    {
      name: 'Platform Integrations',
      fn: async () => {
        const { seedPlatformIntegrations } = await import('../services/integrationsSeedingService');
        await seedPlatformIntegrations();
      }
    },
    {
      name: 'Platform Settings',
      fn: async () => {
        const { seedPlatformSettings } = await import('../services/platformSettingsSeedingService');
        await seedPlatformSettings();
      }
    }
  ];

  for (const task of seedingTasks) {
    const startTime = Date.now();
    try {
      await task.fn();
      const duration = Date.now() - startTime;
      results.push({
        service: task.name,
        status: 'success',
        message: `Seeded successfully`,
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      results.push({
        service: task.name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
    }
  }

  return results;
}

async function checkDatabaseHealth(): Promise<HealthCheckResult[]> {
  const tables = [
    { name: 'navigation_menus', query: sql`SELECT COUNT(*) as count FROM navigation_menus` },
    { name: 'platform_settings', query: sql`SELECT COUNT(*) as count FROM platform_settings` },
    { name: 'platform_integrations', query: sql`SELECT COUNT(*) as count FROM platform_integrations` },
    { name: 'platform_themes', query: sql`SELECT COUNT(*) as count FROM platform_themes` },
    { name: 'platform_hubs', query: sql`SELECT COUNT(*) as count FROM platform_hubs` },
    { name: 'engine_permissions', query: sql`SELECT COUNT(*) as count FROM engine_permissions` },
    { name: 'engine_roles', query: sql`SELECT COUNT(*) as count FROM engine_roles` },
    { name: 'modules', query: sql`SELECT COUNT(*) as count FROM modules` },
    { name: 'apps', query: sql`SELECT COUNT(*) as count FROM apps` },
    { name: 'entity_types', query: sql`SELECT COUNT(*) as count FROM entity_types` },
    { name: 'users', query: sql`SELECT COUNT(*) as count FROM users` },
  ];

  const results: HealthCheckResult[] = [];

  for (const table of tables) {
    try {
      const result = await db.execute(table.query);
      const count = Number(result.rows[0]?.count || 0);
      results.push({
        table: table.name,
        count,
        status: count > 0 ? 'populated' : 'empty'
      });
    } catch (error) {
      results.push({
        table: table.name,
        count: 0,
        status: 'error'
      });
    }
  }

  return results;
}

router.get("/admin/reseed/health", adminAuthMiddleware, requirePermission('system-security', 'view'), async (req, res) => {
  try {
    console.log('🔍 Running database health check...');
    const healthResults = await checkDatabaseHealth();
    
    const populated = healthResults.filter(r => r.status === 'populated').length;
    const empty = healthResults.filter(r => r.status === 'empty').length;
    const errors = healthResults.filter(r => r.status === 'error').length;

    res.json({
      success: true,
      summary: {
        total: healthResults.length,
        populated,
        empty,
        errors,
        needsReseeding: empty > 0 || errors > 0
      },
      tables: healthResults
    });
  } catch (error) {
    console.error("Error checking database health:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to check database health",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post("/admin/reseed", adminAuthMiddleware, requirePermission('system-security', 'manage'), async (req, res) => {
  try {
    console.log('🌱 Starting force re-seed of all master data...');
    const startTime = Date.now();
    
    const results = await runAllSeeding();
    
    const totalDuration = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`✅ Re-seeding complete: ${successCount} success, ${errorCount} errors in ${totalDuration}ms`);

    res.json({
      success: errorCount === 0,
      message: errorCount === 0 
        ? `All ${successCount} seeding services completed successfully` 
        : `Completed with ${errorCount} errors`,
      summary: {
        total: results.length,
        success: successCount,
        errors: errorCount,
        totalDuration
      },
      results
    });
  } catch (error) {
    console.error("Error during force re-seed:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to complete re-seeding",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post("/admin/reseed/:service", adminAuthMiddleware, requirePermission('system-security', 'manage'), async (req, res) => {
  const { service } = req.params;
  
  const serviceMap: Record<string, () => Promise<void>> = {
    'modules': async () => {
      const { moduleSeedingService } = await import('../services/moduleSeedingService');
      await moduleSeedingService.seedModules();
    },
    'entities': async () => {
      const { entitySeedingService } = await import('../services/entitySeedingService');
      await entitySeedingService.seedAll();
    },
    'hubs': async () => {
      const { seedPlatformHubs } = await import('../services/platformHubsSeedingService');
      await seedPlatformHubs();
    },
    'permissions': async () => {
      const { seedEnginePermissions, seedDefaultEngineRoles } = await import('../services/permissionsSeedingService');
      await seedEnginePermissions();
      await seedDefaultEngineRoles();
    },
    'menus': async () => {
      const { seedNavigationMenus } = await import('../services/navigationMenusSeedingService');
      await seedNavigationMenus();
    },
    'themes': async () => {
      const { seedPlatformThemes } = await import('../services/themesSeedingService');
      await seedPlatformThemes();
    },
    'integrations': async () => {
      const { seedPlatformIntegrations } = await import('../services/integrationsSeedingService');
      await seedPlatformIntegrations();
    },
    'settings': async () => {
      const { seedPlatformSettings } = await import('../services/platformSettingsSeedingService');
      await seedPlatformSettings();
    }
  };

  if (!serviceMap[service]) {
    return res.status(400).json({ 
      success: false, 
      error: `Unknown service: ${service}`,
      availableServices: Object.keys(serviceMap)
    });
  }

  try {
    console.log(`🌱 Re-seeding ${service}...`);
    const startTime = Date.now();
    
    await serviceMap[service]();
    
    const duration = Date.now() - startTime;
    console.log(`✅ ${service} re-seeded successfully in ${duration}ms`);

    res.json({
      success: true,
      message: `${service} seeded successfully`,
      duration
    });
  } catch (error) {
    console.error(`Error re-seeding ${service}:`, error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to seed ${service}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
