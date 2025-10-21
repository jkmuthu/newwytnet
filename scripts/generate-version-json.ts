import { db } from "../server/db";
import { platformModules, apps, platformSettings } from "../shared/schema";
import { eq, inArray } from "drizzle-orm";
import { promises as fs } from "fs";
import path from "path";

async function generateVersionJson() {
  try {
    console.log('🔄 Generating version.json...');

    // Fetch platform settings from database
    const platformInfoKeys = ['platform_name', 'platform_version', 'platform_tagline', 'platform_mission'];
    const platformInfo = await db.select()
      .from(platformSettings)
      .where(inArray(platformSettings.key, platformInfoKeys));

    // Convert array to object for easy access
    const platformData: Record<string, string> = {};
    platformInfo.forEach(setting => {
      platformData[setting.key] = setting.value || '';
    });

    const modulesData = await db.select({
      id: platformModules.id,
      displayId: platformModules.displayId,
      name: platformModules.name,
      version: platformModules.version,
      changelog: platformModules.changelog,
      status: platformModules.status,
      category: platformModules.category,
    })
    .from(platformModules)
    .where(eq(platformModules.status, 'enabled'));

    const appsData = await db.select({
      id: apps.id,
      displayId: apps.displayId,
      key: apps.key,
      name: apps.name,
      version: apps.version,
      changelog: apps.changelog,
      status: apps.status,
    })
    .from(apps)
    .where(eq(apps.status, 'published'));

    const versionData = {
      platform: {
        name: platformData.platform_name || 'WytNet',
        version: platformData.platform_version || '1.0.0',
        tagline: platformData.platform_tagline || 'Get In. Get Done.',
        mission: platformData.platform_mission || 'Speed | Security | Scale',
        lastUpdated: new Date().toISOString(),
      },
      modules: modulesData,
      apps: appsData,
      summary: {
        totalModules: modulesData.length,
        totalApps: appsData.length,
      },
    };

    const outputPath = path.join(process.cwd(), 'version.json');
    
    await fs.writeFile(
      outputPath,
      JSON.stringify(versionData, null, 2),
      'utf-8'
    );

    console.log('✅ version.json generated successfully!');
    console.log(`📍 Location: ${outputPath}`);
    console.log(`📊 Summary:`);
    console.log(`   - Platform Version: ${versionData.platform.version}`);
    console.log(`   - Total Modules: ${versionData.summary.totalModules}`);
    console.log(`   - Total Apps: ${versionData.summary.totalApps}`);
    
    return versionData;
  } catch (error) {
    console.error('❌ Error generating version.json:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateVersionJson()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

export { generateVersionJson };
