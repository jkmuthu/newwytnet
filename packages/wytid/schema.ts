// WytID database schema definitions
import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for WytID
export const wytidEntityTypeEnum = pgEnum('wytid_entity_type', ['person', 'org', 'asset', 'document']);
export const wytidProofTypeEnum = pgEnum('wytid_proof_type', ['hash', 'signature', 'blockchain_anchor', 'notary']);
export const wytidTransferStatusEnum = pgEnum('wytid_transfer_status', ['pending', 'completed', 'failed', 'cancelled']);

// WytID Entities table
export const wytidEntities = pgTable("wytid_entities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  type: wytidEntityTypeEnum("type").notNull(),
  identifier: varchar("identifier", { length: 100 }).notNull().unique(),
  meta: jsonb("meta").notNull().default({}),
  ownerUserId: varchar("owner_user_id").notNull(),
  tenantId: uuid("tenant_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_wytid_entities_owner").on(table.ownerUserId),
  index("idx_wytid_entities_tenant").on(table.tenantId),
  index("idx_wytid_entities_type").on(table.type),
  index("idx_wytid_entities_identifier").on(table.identifier),
]);

// WytID Proofs table
export const wytidProofs = pgTable("wytid_proofs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityId: uuid("entity_id").notNull().references(() => wytidEntities.id, { onDelete: 'cascade' }),
  proofType: wytidProofTypeEnum("proof_type").notNull(),
  proofData: jsonb("proof_data").notNull().default({}),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isRevoked: boolean("is_revoked").default(false),
  tenantId: uuid("tenant_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_wytid_proofs_entity").on(table.entityId),
  index("idx_wytid_proofs_tenant").on(table.tenantId),
  index("idx_wytid_proofs_type").on(table.proofType),
  index("idx_wytid_proofs_issued").on(table.issuedAt),
]);

// WytID Transfers table
export const wytidTransfers = pgTable("wytid_transfers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityId: uuid("entity_id").notNull().references(() => wytidEntities.id, { onDelete: 'cascade' }),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id").notNull(),
  status: wytidTransferStatusEnum("status").notNull().default('pending'),
  txHash: varchar("tx_hash", { length: 255 }),
  transferNote: text("transfer_note"),
  transferredAt: timestamp("transferred_at"),
  tenantId: uuid("tenant_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_wytid_transfers_entity").on(table.entityId),
  index("idx_wytid_transfers_from").on(table.fromUserId),
  index("idx_wytid_transfers_to").on(table.toUserId),
  index("idx_wytid_transfers_tenant").on(table.tenantId),
  index("idx_wytid_transfers_status").on(table.status),
]);

// WytKey API keys for external verification
export const wytidApiKeys = pgTable("wytid_api_keys", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  apiKey: varchar("api_key", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  scopes: jsonb("scopes").notNull().default([]),
  tenantId: uuid("tenant_id"),
  isActive: boolean("is_active").default(true),
  rateLimit: varchar("rate_limit", { length: 50 }).default('100/minute'),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_wytid_api_keys_key").on(table.apiKey),
  index("idx_wytid_api_keys_tenant").on(table.tenantId),
  index("idx_wytid_api_keys_active").on(table.isActive),
]);

// Schema types
export type WytIDEntity = typeof wytidEntities.$inferSelect;
export type WytIDProof = typeof wytidProofs.$inferSelect;
export type WytIDTransfer = typeof wytidTransfers.$inferSelect;
export type WytIDApiKey = typeof wytidApiKeys.$inferSelect;

// Insert schemas
export const insertWytIDEntitySchema = createInsertSchema(wytidEntities);
export const insertWytIDProofSchema = createInsertSchema(wytidProofs);
export const insertWytIDTransferSchema = createInsertSchema(wytidTransfers);
export const insertWytIDApiKeySchema = createInsertSchema(wytidApiKeys);

// Select schemas
export const selectWytIDEntitySchema = createSelectSchema(wytidEntities);
export const selectWytIDProofSchema = createSelectSchema(wytidProofs);
export const selectWytIDTransferSchema = createSelectSchema(wytidTransfers);
export const selectWytIDApiKeySchema = createSelectSchema(wytidApiKeys);

// Insert types
export type InsertWytIDEntity = z.infer<typeof insertWytIDEntitySchema>;
export type InsertWytIDProof = z.infer<typeof insertWytIDProofSchema>;
export type InsertWytIDTransfer = z.infer<typeof insertWytIDTransferSchema>;
export type InsertWytIDApiKey = z.infer<typeof insertWytIDApiKeySchema>;

// Helper function to generate WytID identifier
export function generateWytIDIdentifier(): string {
  // Generate ULID-style identifier: WYT-{timestamp}{random}
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `WYT-${timestamp}${random}`;
}

// Validation helpers
export function isValidWytIDIdentifier(identifier: string): boolean {
  return /^WYT-[A-Z0-9]{12,}$/.test(identifier);
}

export function parseWytIDIdentifier(identifier: string): { timestamp: number; random: string } | null {
  if (!isValidWytIDIdentifier(identifier)) return null;
  
  const parts = identifier.replace('WYT-', '');
  const timestamp = parseInt(parts.substring(0, 8), 36);
  const random = parts.substring(8);
  
  return { timestamp, random };
}