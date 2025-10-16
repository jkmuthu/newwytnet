import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Display ID Generation Service
 * Generates human-readable, globally unique IDs with prefixes
 * Format: {PREFIX}-{SEQUENCE_NUMBER}
 * Examples: USR-0000001, ORG-00001, APP-0001, HUB-001
 */

// Prefix configuration for all entity types
export const DISPLAY_ID_CONFIG = {
  // Core Platform Entities (High Volume)
  users: { prefix: 'USR', padding: 7 },
  organizations: { prefix: 'ORG', padding: 5 },
  tenants: { prefix: 'TNT', padding: 5 },
  
  // Content & Structure
  entities: { prefix: 'ENT', padding: 5 },
  platformModules: { prefix: 'MOD', padding: 4 },
  apps: { prefix: 'APP', padding: 4 },
  hubs: { prefix: 'HUB', padding: 3 },
  
  // Media & Assets
  media: { prefix: 'MED', padding: 5 },
  
  // Identity & Validation
  wytidEntities: { prefix: 'WID', padding: 5 },
  
  // Business & Operations
  needs: { prefix: 'NED', padding: 5 },
  offers: { prefix: 'OFR', padding: 5 },
  assessmentQuestions: { prefix: 'ASM', padding: 4 },
  trademarks: { prefix: 'TMK', padding: 5 },
} as const;

export type EntityType = keyof typeof DISPLAY_ID_CONFIG;

/**
 * Creates or retrieves a sequence for the given entity type
 */
async function ensureSequence(entityType: EntityType): Promise<void> {
  const sequenceName = `${entityType}_display_id_seq`;
  
  try {
    // Check if sequence exists, create if not - use raw SQL string to avoid parameterization issues
    await db.execute(sql.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = '${sequenceName}') THEN
          CREATE SEQUENCE ${sequenceName} START WITH 1 INCREMENT BY 1;
        END IF;
      END
      $$;
    `));
  } catch (error) {
    console.error(`Error ensuring sequence for ${entityType}:`, error);
    throw error;
  }
}

/**
 * Generates the next display ID for the given entity type
 * This is concurrent-safe using database sequences
 */
export async function generateDisplayId(entityType: EntityType): Promise<string> {
  const config = DISPLAY_ID_CONFIG[entityType];
  if (!config) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }
  
  // Ensure sequence exists
  await ensureSequence(entityType);
  
  // Get next value from sequence
  const sequenceName = `${entityType}_display_id_seq`;
  const result = await db.execute(sql.raw(`SELECT nextval('${sequenceName}') as next_val`));
  const nextVal = (result.rows[0] as any).next_val;
  
  // Format with prefix and padding
  const paddedNumber = String(nextVal).padStart(config.padding, '0');
  const displayId = `${config.prefix}-${paddedNumber}`;
  
  return displayId;
}

/**
 * Batch generate multiple display IDs for the same entity type
 * More efficient than calling generateDisplayId multiple times
 */
export async function generateDisplayIds(entityType: EntityType, count: number): Promise<string[]> {
  if (count <= 0) {
    return [];
  }
  
  const config = DISPLAY_ID_CONFIG[entityType];
  if (!config) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }
  
  // Ensure sequence exists
  await ensureSequence(entityType);
  
  // Get next N values from sequence
  const sequenceName = `${entityType}_display_id_seq`;
  const result = await db.execute(sql.raw(
    `SELECT nextval('${sequenceName}') as next_val FROM generate_series(1, ${count})`
  ));
  
  // Format each ID
  return result.rows.map((row: any) => {
    const paddedNumber = String(row.next_val).padStart(config.padding, '0');
    return `${config.prefix}-${paddedNumber}`;
  });
}

/**
 * Get current sequence value without incrementing (for debugging/info)
 */
export async function getCurrentSequenceValue(entityType: EntityType): Promise<number> {
  const sequenceName = `${entityType}_display_id_seq`;
  
  try {
    const result = await db.execute(sql.raw(`SELECT last_value FROM ${sequenceName}`));
    return (result.rows[0] as any).last_value || 0;
  } catch (error) {
    // Sequence doesn't exist yet
    return 0;
  }
}

/**
 * Reset sequence to a specific value (ADMIN ONLY - use with caution!)
 */
export async function resetSequence(entityType: EntityType, value: number = 1): Promise<void> {
  const sequenceName = `${entityType}_display_id_seq`;
  await db.execute(sql.raw(`ALTER SEQUENCE ${sequenceName} RESTART WITH ${value}`));
}

/**
 * Get all sequence statuses (for admin dashboard)
 */
export async function getAllSequenceStatuses(): Promise<Record<EntityType, number>> {
  const statuses = {} as Record<EntityType, number>;
  
  for (const entityType of Object.keys(DISPLAY_ID_CONFIG) as EntityType[]) {
    statuses[entityType] = await getCurrentSequenceValue(entityType);
  }
  
  return statuses;
}

/**
 * Helper to add display ID to insert data
 * Use this when creating new records to automatically generate display IDs
 */
export async function withDisplayId<T extends Record<string, any>>(
  entityType: EntityType,
  data: T
): Promise<T & { displayId: string }> {
  const displayId = await generateDisplayId(entityType);
  return { ...data, displayId };
}

/**
 * Helper to add display IDs to multiple insert records
 */
export async function withDisplayIds<T extends Record<string, any>>(
  entityType: EntityType,
  dataArray: T[]
): Promise<Array<T & { displayId: string }>> {
  const displayIds = await generateDisplayIds(entityType, dataArray.length);
  return dataArray.map((data, index) => ({ ...data, displayId: displayIds[index] }));
}
