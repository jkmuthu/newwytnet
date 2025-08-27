import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  uuid,
  decimal,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Core tenant table for multi-tenancy
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }).unique(),
  subdomain: varchar("subdomain", { length: 100 }).unique(),
  status: varchar("status", { length: 20 }).notNull().default('active'),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table with RLS support
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tenant memberships with roles
export const memberships = pgTable("memberships", {
  id: uuid("id").default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  role: varchar("role", { length: 50 }).notNull().default('member'),
  status: varchar("status", { length: 20 }).notNull().default('active'),
  permissions: jsonb("permissions").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.tenantId] }),
}));

// Models/Modules for CRUD builder
export const models = pgTable("models", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  schema: jsonb("schema").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('draft'),
  version: varchar("version", { length: 20 }).notNull().default('1.0.0'),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CMS Pages
export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  locale: varchar("locale", { length: 10 }).notNull().default('en-IN'),
  content: jsonb("content").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('draft'),
  publishedAt: timestamp("published_at"),
  themeRef: varchar("theme_ref", { length: 100 }),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CMS Blocks
export const blocks = pgTable("blocks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  type: varchar("type", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  content: jsonb("content").notNull(),
  settings: jsonb("settings").default({}),
  isGlobal: boolean("is_global").default(false),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Apps
export const apps = pgTable("apps", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  version: varchar("version", { length: 20 }).notNull(),
  manifest: jsonb("manifest").notNull(),
  icon: varchar("icon", { length: 500 }),
  categories: jsonb("categories").default([]),
  status: varchar("status", { length: 20 }).notNull().default('draft'),
  isPublic: boolean("is_public").default(false),
  pricing: jsonb("pricing").default({}),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// App Installs
export const appInstalls = pgTable("app_installs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: uuid("app_id").notNull().references(() => apps.id),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  installedBy: varchar("installed_by").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull().default('active'),
  settings: jsonb("settings").default({}),
  installedAt: timestamp("installed_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Hubs
export const hubs = pgTable("hubs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(),
  config: jsonb("config").notNull(),
  aggregationRules: jsonb("aggregation_rules").default([]),
  moderationSettings: jsonb("moderation_settings").default({}),
  revenueModel: jsonb("revenue_model").default({}),
  status: varchar("status", { length: 20 }).notNull().default('draft'),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Plans
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default('INR'),
  interval: varchar("interval", { length: 20 }).notNull().default('monthly'),
  features: jsonb("features").default([]),
  limits: jsonb("limits").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Media files
export const media = pgTable("media", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  metadata: jsonb("metadata").default({}),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  resourceId: varchar("resource_id", { length: 255 }),
  details: jsonb("details").default({}),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_audit_logs_tenant_id").on(table.tenantId),
  index("idx_audit_logs_user_id").on(table.userId),
  index("idx_audit_logs_action").on(table.action),
  index("idx_audit_logs_created_at").on(table.createdAt),
]);

// WytID - Universal Identity & Validation Kernel
export const wytidEntityTypeEnum = pgEnum('wytid_entity_type', ['person', 'org', 'asset', 'document']);
export const wytidProofTypeEnum = pgEnum('wytid_proof_type', ['hash', 'signature', 'blockchain_anchor', 'notary']);
export const wytidTransferStatusEnum = pgEnum('wytid_transfer_status', ['pending', 'completed', 'failed', 'cancelled']);

// WytID Entities
export const wytidEntities = pgTable("wytid_entities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  type: wytidEntityTypeEnum("type").notNull(),
  identifier: varchar("identifier", { length: 100 }).notNull().unique(),
  meta: jsonb("meta").notNull().default({}),
  ownerUserId: varchar("owner_user_id").notNull().references(() => users.id),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_wytid_entities_owner").on(table.ownerUserId),
  index("idx_wytid_entities_tenant").on(table.tenantId),
  index("idx_wytid_entities_type").on(table.type),
  index("idx_wytid_entities_identifier").on(table.identifier),
]);

// WytID Proofs
export const wytidProofs = pgTable("wytid_proofs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityId: uuid("entity_id").notNull().references(() => wytidEntities.id, { onDelete: 'cascade' }),
  proofType: wytidProofTypeEnum("proof_type").notNull(),
  proofData: jsonb("proof_data").notNull().default({}),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isRevoked: boolean("is_revoked").default(false),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_wytid_proofs_entity").on(table.entityId),
  index("idx_wytid_proofs_tenant").on(table.tenantId),
  index("idx_wytid_proofs_type").on(table.proofType),
  index("idx_wytid_proofs_issued").on(table.issuedAt),
]);

// WytID Transfers
export const wytidTransfers = pgTable("wytid_transfers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityId: uuid("entity_id").notNull().references(() => wytidEntities.id, { onDelete: 'cascade' }),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").notNull().references(() => users.id),
  status: wytidTransferStatusEnum("status").notNull().default('pending'),
  txHash: varchar("tx_hash", { length: 255 }),
  transferNote: text("transfer_note"),
  transferredAt: timestamp("transferred_at"),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_wytid_transfers_entity").on(table.entityId),
  index("idx_wytid_transfers_from").on(table.fromUserId),
  index("idx_wytid_transfers_to").on(table.toUserId),
  index("idx_wytid_transfers_tenant").on(table.tenantId),
  index("idx_wytid_transfers_status").on(table.status),
]);

// WytID API Keys for external verification
export const wytidApiKeys = pgTable("wytid_api_keys", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  apiKey: varchar("api_key", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  scopes: jsonb("scopes").notNull().default([]),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  isActive: boolean("is_active").default(true),
  rateLimit: varchar("rate_limit", { length: 50 }).default('100/minute'),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_wytid_api_keys_key").on(table.apiKey),
  index("idx_wytid_api_keys_tenant").on(table.tenantId),
  index("idx_wytid_api_keys_active").on(table.isActive),
]);

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  memberships: many(memberships),
  models: many(models),
  pages: many(pages),
  blocks: many(blocks),
  appInstalls: many(appInstalls),
  media: many(media),
  auditLogs: many(auditLogs),
  wytidEntities: many(wytidEntities),
  wytidProofs: many(wytidProofs),
  wytidTransfers: many(wytidTransfers),
  wytidApiKeys: many(wytidApiKeys),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  memberships: many(memberships),
  createdModels: many(models),
  createdPages: many(pages),
  createdBlocks: many(blocks),
  createdApps: many(apps),
  createdHubs: many(hubs),
  installedApps: many(appInstalls),
  uploadedMedia: many(media),
  auditLogs: many(auditLogs),
  ownedWytidEntities: many(wytidEntities),
  wytidTransfersFrom: many(wytidTransfers, { relationName: 'wytidTransferFrom' }),
  wytidTransfersTo: many(wytidTransfers, { relationName: 'wytidTransferTo' }),
  createdWytidApiKeys: many(wytidApiKeys),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [memberships.tenantId],
    references: [tenants.id],
  }),
}));

export const modelsRelations = relations(models, ({ one }) => ({
  tenant: one(tenants, {
    fields: [models.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [models.createdBy],
    references: [users.id],
  }),
}));

export const pagesRelations = relations(pages, ({ one }) => ({
  tenant: one(tenants, {
    fields: [pages.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [pages.createdBy],
    references: [users.id],
  }),
}));

export const blocksRelations = relations(blocks, ({ one }) => ({
  tenant: one(tenants, {
    fields: [blocks.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [blocks.createdBy],
    references: [users.id],
  }),
}));

export const appsRelations = relations(apps, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [apps.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [apps.createdBy],
    references: [users.id],
  }),
  installs: many(appInstalls),
}));

export const appInstallsRelations = relations(appInstalls, ({ one }) => ({
  app: one(apps, {
    fields: [appInstalls.appId],
    references: [apps.id],
  }),
  tenant: one(tenants, {
    fields: [appInstalls.tenantId],
    references: [tenants.id],
  }),
  installedBy: one(users, {
    fields: [appInstalls.installedBy],
    references: [users.id],
  }),
}));

export const hubsRelations = relations(hubs, ({ one }) => ({
  createdBy: one(users, {
    fields: [hubs.createdBy],
    references: [users.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  tenant: one(tenants, {
    fields: [media.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [media.createdBy],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [auditLogs.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// WytID Relations
export const wytidEntitiesRelations = relations(wytidEntities, ({ one, many }) => ({
  owner: one(users, {
    fields: [wytidEntities.ownerUserId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [wytidEntities.tenantId],
    references: [tenants.id],
  }),
  proofs: many(wytidProofs),
  transfers: many(wytidTransfers),
}));

export const wytidProofsRelations = relations(wytidProofs, ({ one }) => ({
  entity: one(wytidEntities, {
    fields: [wytidProofs.entityId],
    references: [wytidEntities.id],
  }),
  tenant: one(tenants, {
    fields: [wytidProofs.tenantId],
    references: [tenants.id],
  }),
}));

export const wytidTransfersRelations = relations(wytidTransfers, ({ one }) => ({
  entity: one(wytidEntities, {
    fields: [wytidTransfers.entityId],
    references: [wytidEntities.id],
  }),
  fromUser: one(users, {
    fields: [wytidTransfers.fromUserId],
    references: [users.id],
    relationName: 'wytidTransferFrom',
  }),
  toUser: one(users, {
    fields: [wytidTransfers.toUserId],
    references: [users.id],
    relationName: 'wytidTransferTo',
  }),
  tenant: one(tenants, {
    fields: [wytidTransfers.tenantId],
    references: [tenants.id],
  }),
}));

export const wytidApiKeysRelations = relations(wytidApiKeys, ({ one }) => ({
  tenant: one(tenants, {
    fields: [wytidApiKeys.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [wytidApiKeys.createdBy],
    references: [users.id],
  }),
}));

// Schema types
export type Tenant = typeof tenants.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Model = typeof models.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Block = typeof blocks.$inferSelect;
export type App = typeof apps.$inferSelect;
export type AppInstall = typeof appInstalls.$inferSelect;
export type Hub = typeof hubs.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Media = typeof media.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

// Insert schemas
export const insertTenantSchema = createInsertSchema(tenants);
export const insertUserSchema = createInsertSchema(users);
export const insertMembershipSchema = createInsertSchema(memberships);
export const insertModelSchema = createInsertSchema(models);
export const insertPageSchema = createInsertSchema(pages);
export const insertBlockSchema = createInsertSchema(blocks);
export const insertAppSchema = createInsertSchema(apps);
export const insertAppInstallSchema = createInsertSchema(appInstalls);
export const insertHubSchema = createInsertSchema(hubs);
export const insertPlanSchema = createInsertSchema(plans);
export const insertMediaSchema = createInsertSchema(media);
export const insertAuditLogSchema = createInsertSchema(auditLogs);

// Select schemas
export const selectTenantSchema = createSelectSchema(tenants);
export const selectUserSchema = createSelectSchema(users);
export const selectMembershipSchema = createSelectSchema(memberships);
export const selectModelSchema = createSelectSchema(models);
export const selectPageSchema = createSelectSchema(pages);
export const selectBlockSchema = createSelectSchema(blocks);
export const selectAppSchema = createSelectSchema(apps);
export const selectAppInstallSchema = createSelectSchema(appInstalls);
export const selectHubSchema = createSelectSchema(hubs);
export const selectPlanSchema = createSelectSchema(plans);
export const selectMediaSchema = createSelectSchema(media);
export const selectAuditLogSchema = createSelectSchema(auditLogs);

// Insert types
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type InsertModel = z.infer<typeof insertModelSchema>;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type InsertApp = z.infer<typeof insertAppSchema>;
export type InsertAppInstall = z.infer<typeof insertAppInstallSchema>;
export type InsertHub = z.infer<typeof insertHubSchema>;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// AssessDisc DISC Assessment Module Tables
export const assessmentCategories = pgTable("assessment_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assessmentQuestions = pgTable("assessment_questions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: uuid("category_id").references(() => assessmentCategories.id),
  questionNumber: integer("question_number").notNull(),
  questionText: text("question_text").notNull(),
  language: varchar("language", { length: 10 }).notNull().default('en'),
  discType: varchar("disc_type", { length: 1 }).notNull(), // D, I, S, C
  weight: decimal("weight", { precision: 3, scale: 2 }).default('1.00'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assessmentOptions = pgTable("assessment_options", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: uuid("question_id").notNull().references(() => assessmentQuestions.id),
  optionText: text("option_text").notNull(),
  optionValue: integer("option_value").notNull(), // 1-4 scale
  discType: varchar("disc_type", { length: 1 }).notNull(), // D, I, S, C
  language: varchar("language", { length: 10 }).notNull().default('en'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assessmentSessions = pgTable("assessment_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  participantName: varchar("participant_name", { length: 255 }).notNull(),
  participantEmail: varchar("participant_email", { length: 255 }),
  age: integer("age"),
  gender: varchar("gender", { length: 20 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  categoryId: uuid("category_id").references(() => assessmentCategories.id),
  language: varchar("language", { length: 10 }).notNull().default('en'),
  isCompleted: boolean("is_completed").default(false),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assessmentResponses = pgTable("assessment_responses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => assessmentSessions.id),
  questionId: uuid("question_id").notNull().references(() => assessmentQuestions.id),
  optionId: uuid("option_id").notNull().references(() => assessmentOptions.id),
  responseValue: integer("response_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assessmentResults = pgTable("assessment_results", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => assessmentSessions.id),
  dominanceScore: decimal("dominance_score", { precision: 5, scale: 2 }).notNull(),
  influenceScore: decimal("influence_score", { precision: 5, scale: 2 }).notNull(),
  steadinessScore: decimal("steadiness_score", { precision: 5, scale: 2 }).notNull(),
  conscientiousnessScore: decimal("conscientiousness_score", { precision: 5, scale: 2 }).notNull(),
  primaryType: varchar("primary_type", { length: 1 }).notNull(), // D, I, S, or C
  secondaryType: varchar("secondary_type", { length: 1 }),
  personalityProfile: jsonb("personality_profile"), // Detailed breakdown
  recommendations: jsonb("recommendations"), // Career insights and recommendations
  strengths: jsonb("strengths"),
  developmentAreas: jsonb("development_areas"),
  workStyle: jsonb("work_style"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports for AssessDisc
export type AssessmentCategory = typeof assessmentCategories.$inferSelect;
export type AssessmentQuestion = typeof assessmentQuestions.$inferSelect;
export type AssessmentOption = typeof assessmentOptions.$inferSelect;
export type AssessmentSession = typeof assessmentSessions.$inferSelect;
export type AssessmentResponse = typeof assessmentResponses.$inferSelect;
export type AssessmentResult = typeof assessmentResults.$inferSelect;

export type InsertAssessmentSession = typeof assessmentSessions.$inferInsert;
export type InsertAssessmentResponse = typeof assessmentResponses.$inferInsert;
export type InsertAssessmentResult = typeof assessmentResults.$inferInsert;

// Insert schemas for AssessDisc
export const insertAssessmentSessionSchema = createInsertSchema(assessmentSessions);
export const insertAssessmentResponseSchema = createInsertSchema(assessmentResponses);
export const insertAssessmentResultSchema = createInsertSchema(assessmentResults);

// RealBro Property Brother Module Schema
export const realbroUsers = pgTable("realbro_users", {
  id: varchar("id", { length: 10 }).primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  username: varchar("username", { length: 50 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 15 }).notNull(),
  email: varchar("email", { length: 100 }),
  district: varchar("district", { length: 50 }),
  role: varchar("role", { length: 20 }).$type<'broker' | 'admin'>().default('broker'),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  isDemo: boolean("is_demo").default(false),
});

export const realbroProperties = pgTable("realbro_properties", {
  id: varchar("id", { length: 20 }).primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  userId: varchar("user_id", { length: 10 }).notNull().references(() => realbroUsers.id),
  title: varchar("title", { length: 100 }).notNull(),
  sizeText: varchar("size_text", { length: 50 }),
  priceMax: integer("price_max"),
  priceMin: integer("price_min"),
  commissionType: varchar("commission_type", { length: 20 }).$type<'PERCENT' | 'FIXED'>(),
  commissionValue: decimal("commission_value", { precision: 10, scale: 2 }),
  lat: decimal("lat", { precision: 10, scale: 6 }),
  lng: decimal("lng", { precision: 10, scale: 6 }),
  status: varchar("status", { length: 20 }).$type<'AVAILABLE' | 'ON_HOLD' | 'SOLD'>().default('AVAILABLE'),
  shareSlug: varchar("share_slug", { length: 50 }),
  titleSlug: varchar("title_slug", { length: 100 }),
  notes: text("notes"),
  photos: jsonb("photos").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  creditUsed: boolean("credit_used").default(true),
});

export const realbroCredits = pgTable("realbro_credits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  userId: varchar("user_id", { length: 10 }).notNull().references(() => realbroUsers.id),
  amount: integer("amount").notNull(),
  type: varchar("type", { length: 20 }).$type<'PURCHASED' | 'USED' | 'FREE' | 'REFUNDED'>().notNull(),
  description: text("description"),
  pricePaid: integer("price_paid"),
  transactionId: varchar("transaction_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// RealBro Relations
export const realbroUsersRelations = relations(realbroUsers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [realbroUsers.tenantId],
    references: [tenants.id],
  }),
  properties: many(realbroProperties),
  credits: many(realbroCredits),
}));

export const realbroPropertiesRelations = relations(realbroProperties, ({ one }) => ({
  tenant: one(tenants, {
    fields: [realbroProperties.tenantId],
    references: [tenants.id],
  }),
  user: one(realbroUsers, {
    fields: [realbroProperties.userId],
    references: [realbroUsers.id],
  }),
}));

export const realbroCreditsRelations = relations(realbroCredits, ({ one }) => ({
  tenant: one(tenants, {
    fields: [realbroCredits.tenantId],
    references: [tenants.id],
  }),
  user: one(realbroUsers, {
    fields: [realbroCredits.userId],
    references: [realbroUsers.id],
  }),
}));

// RealBro Types
export type RealbroUser = typeof realbroUsers.$inferSelect;
export type InsertRealbroUser = typeof realbroUsers.$inferInsert;
export type RealbroProperty = typeof realbroProperties.$inferSelect;
export type InsertRealbroProperty = typeof realbroProperties.$inferInsert;
export type RealbroCredit = typeof realbroCredits.$inferSelect;
export type InsertRealbroCredit = typeof realbroCredits.$inferInsert;

// WytDuty Enterprise Productivity Module Schema
export const dutyUsers = pgTable("duty_users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  username: varchar("username", { length: 50 }).notNull(),
  role: varchar("role", { length: 20 }).$type<'admin' | 'member'>().default('member'),
  active: boolean("active").default(true),
  profileJson: jsonb("profile_json"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const duties = pgTable("duties", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  schedule: varchar("schedule", { length: 50 }).$type<'onetime' | 'daily_not_sun' | 'daily_not_sat_sun' | 'weekly_before_sat' | 'monthly_before_5' | 'monthly_before_28'>(),
  priority: varchar("priority", { length: 20 }).$type<'high' | 'medium' | 'low'>().default('medium'),
  status: varchar("status", { length: 20 }).$type<'pending' | 'for_approval' | 'completed'>().default('pending'),
  assignees: jsonb("assignees").$type<string[]>(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  needApproval: boolean("need_approval").default(false),
  dueAt: timestamp("due_at"),
  seriesId: varchar("series_id", { length: 100 }),
  occursOn: timestamp("occurs_on"),
  lastAction: varchar("last_action", { length: 100 }),
  lastActionAt: timestamp("last_action_at"),
  lastActionNote: text("last_action_note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const holidays = pgTable("holidays", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  date: timestamp("date").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  isOptional: boolean("is_optional").default(false),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  dutyId: uuid("duty_id").notNull().references(() => duties.id),
  requestedBy: varchar("requested_by").notNull().references(() => users.id),
  decidedBy: varchar("decided_by").references(() => users.id),
  decision: varchar("decision", { length: 20 }).$type<'approved' | 'rejected' | 'pending'>().default('pending'),
  decidedAt: timestamp("decided_at"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const backups = pgTable("backups", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  snapshotJson: jsonb("snapshot_json").notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// WytDuty Relations
export const dutyUsersRelations = relations(dutyUsers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [dutyUsers.tenantId],
    references: [tenants.id],
  }),
}));

export const dutiesRelations = relations(duties, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [duties.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [duties.createdBy],
    references: [users.id],
  }),
  approvals: many(approvals),
}));

export const holidaysRelations = relations(holidays, ({ one }) => ({
  tenant: one(tenants, {
    fields: [holidays.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [holidays.createdBy],
    references: [users.id],
  }),
}));

export const approvalsRelations = relations(approvals, ({ one }) => ({
  tenant: one(tenants, {
    fields: [approvals.tenantId],
    references: [tenants.id],
  }),
  duty: one(duties, {
    fields: [approvals.dutyId],
    references: [duties.id],
  }),
  requestedBy: one(users, {
    fields: [approvals.requestedBy],
    references: [users.id],
    relationName: 'approvalRequester',
  }),
  decidedBy: one(users, {
    fields: [approvals.decidedBy],
    references: [users.id],
    relationName: 'approvalDecider',
  }),
}));

export const backupsRelations = relations(backups, ({ one }) => ({
  tenant: one(tenants, {
    fields: [backups.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [backups.createdBy],
    references: [users.id],
  }),
}));

// WytDuty Types
export type DutyUser = typeof dutyUsers.$inferSelect;
export type InsertDutyUser = typeof dutyUsers.$inferInsert;
export type Duty = typeof duties.$inferSelect;
export type InsertDuty = typeof duties.$inferInsert;
export type Holiday = typeof holidays.$inferSelect;
export type InsertHoliday = typeof holidays.$inferInsert;
export type Approval = typeof approvals.$inferSelect;
export type InsertApproval = typeof approvals.$inferInsert;
export type Backup = typeof backups.$inferSelect;
export type InsertBackup = typeof backups.$inferInsert;
