/**
 * Migration Script: Generate Display IDs for Existing Records
 * Run this script once after deploying the display ID feature
 * 
 * Usage: tsx server/scripts/generateDisplayIds.ts
 */

import { db } from "../db";
import { 
  users, tenants, organizations, apps, hubs, platformModules,
  entities, media, wytidEntities, trademarks, needs, offers, assessmentQuestions
} from "../../shared/schema";
import { generateDisplayIds, EntityType } from "../displayIdService";
import { sql } from "drizzle-orm";

interface TableConfig {
  table: any;
  tableName: string;
  entityType: EntityType;
}

const TABLES_TO_MIGRATE: TableConfig[] = [
  { table: tenants, tableName: 'tenants', entityType: 'tenants' },
  { table: users, tableName: 'users', entityType: 'users' },
  { table: organizations, tableName: 'organizations', entityType: 'organizations' },
  { table: apps, tableName: 'apps', entityType: 'apps' },
  { table: hubs, tableName: 'hubs', entityType: 'hubs' },
  { table: platformModules, tableName: 'platform_modules', entityType: 'platformModules' },
  { table: entities, tableName: 'entities', entityType: 'entities' },
  { table: media, tableName: 'media', entityType: 'media' },
  { table: wytidEntities, tableName: 'wytid_entities', entityType: 'wytidEntities' },
  { table: trademarks, tableName: 'trademarks', entityType: 'trademarks' },
  { table: needs, tableName: 'needs', entityType: 'needs' },
  { table: offers, tableName: 'offers', entityType: 'offers' },
  { table: assessmentQuestions, tableName: 'assessment_questions', entityType: 'assessmentQuestions' },
];

async function migrateDisplayIds() {
  console.log('🔄 Starting Display ID migration...\n');
  
  let totalProcessed = 0;
  let totalUpdated = 0;
  
  for (const config of TABLES_TO_MIGRATE) {
    console.log(`📋 Processing table: ${config.tableName}`);
    
    try {
      // Get count of records without display_id
      const countResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM ${sql.raw(config.tableName)} WHERE display_id IS NULL`
      );
      const count = parseInt((countResult.rows[0] as any).count || '0');
      
      if (count === 0) {
        console.log(`   ✓ No records to update\n`);
        continue;
      }
      
      console.log(`   Found ${count} records without display_id`);
      
      // Get all IDs without display_id
      const recordsResult = await db.execute(
        sql`SELECT id FROM ${sql.raw(config.tableName)} WHERE display_id IS NULL ORDER BY id`
      );
      const records = recordsResult.rows as Array<{ id: string }>;
      
      // Generate display IDs in batch
      const displayIds = await generateDisplayIds(config.entityType, records.length);
      
      // Update each record
      for (let i = 0; i < records.length; i++) {
        const recordId = records[i].id;
        const displayId = displayIds[i];
        
        await db.execute(
          sql`UPDATE ${sql.raw(config.tableName)} SET display_id = ${displayId} WHERE id = ${recordId}`
        );
      }
      
      totalProcessed += count;
      totalUpdated += count;
      console.log(`   ✓ Updated ${count} records\n`);
      
    } catch (error) {
      console.error(`   ❌ Error processing ${config.tableName}:`, error);
    }
  }
  
  console.log('✅ Display ID migration complete!');
  console.log(`   Total records processed: ${totalProcessed}`);
  console.log(`   Total records updated: ${totalUpdated}`);
}

// Run migration
migrateDisplayIds()
  .then(() => {
    console.log('\n🎉 Migration finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
