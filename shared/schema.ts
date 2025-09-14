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
  passwordHash: varchar("password_hash", { length: 255 }),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Gender enum for WhatsApp users
export const genderEnum = pgEnum("gender", ["male", "female", "other", "prefer_not_to_say"]);

// User roles enum for WytPass system
export const userRoleEnum = pgEnum("user_role", ["super_admin", "admin", "manager", "user", "guest"]);

// Enhanced User Authentication System (supports mobile + social auth)
export const whatsappUsers = pgTable("whatsapp_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 10 }).notNull().default('IN'),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  gender: genderEnum("gender"),
  dateOfBirth: timestamp("date_of_birth"),
  role: userRoleEnum("role").notNull().default('user'),
  isVerified: boolean("is_verified").default(false),
  isSuperAdmin: boolean("is_super_admin").default(false),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  permissions: jsonb("permissions").default({}),
  
  // Social Auth Integration
  socialProviders: jsonb("social_providers").default([]), // ['google', 'facebook', 'linkedin']
  socialIds: jsonb("social_ids").default({}), // {google: 'id123', facebook: 'id456'}
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  
  // Authentication Methods
  authMethods: jsonb("auth_methods").default(['whatsapp']), // ['whatsapp', 'password', 'google', 'facebook']
  passwordHash: varchar("password_hash", { length: 255 }),
  
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const whatsappOtpSessions = pgTable("whatsapp_otp_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow(),
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

// Platform Modules (QR Generator, RealBro, WytDuty, etc.)
export const platformModules = pgTable("platform_modules", {
  id: varchar("id").primaryKey(), // 'qr-generator', 'realbro', etc.
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull().default('platform'),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default('enabled'),
  pricing: varchar("pricing", { length: 20 }).notNull().default('free'),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default('INR'),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 50 }).default('blue'),
  route: varchar("route", { length: 255 }).notNull(),
  features: jsonb("features").default([]),
  metadata: jsonb("metadata").default({}),
  usage: integer("usage").default(0),
  installs: integer("installs").default(0),
  creator: varchar("creator", { length: 255 }),
  order: integer("order").default(0),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  createdBy: varchar("created_by").references(() => whatsappUsers.id),
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
  whatsappUsers: many(whatsappUsers),
  whatsappOtpSessions: many(whatsappOtpSessions),
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

// WhatsApp OTP Relations
export const whatsappUsersRelations = relations(whatsappUsers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [whatsappUsers.tenantId],
    references: [tenants.id],
  }),
  otpSessions: many(whatsappOtpSessions),
  socialTokens: many(socialAuthTokens),
}));


export const whatsappOtpSessionsRelations = relations(whatsappOtpSessions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [whatsappOtpSessions.tenantId],
    references: [tenants.id],
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

// WhatsApp OTP schemas
export const insertWhatsAppUserSchema = createInsertSchema(whatsappUsers);
export const selectWhatsAppUserSchema = createSelectSchema(whatsappUsers);
export const insertWhatsAppOtpSessionSchema = createInsertSchema(whatsappOtpSessions);

// Social Auth types
export type SocialAuthToken = typeof socialAuthTokens.$inferSelect;
export type InsertSocialAuthToken = typeof socialAuthTokens.$inferInsert;
export const selectWhatsAppOtpSessionSchema = createSelectSchema(whatsappOtpSessions);

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

// WytAi Trademark types
export type Trademark = typeof trademarks.$inferSelect;
export type InsertTrademark = z.infer<typeof insertTrademarkSchema>;
export type TrademarkSearch = typeof trademarkSearches.$inferSelect;
export type InsertTrademarkSearch = z.infer<typeof insertTrademarkSearchSchema>;
export type TrademarkSimilarity = typeof trademarkSimilarities.$inferSelect;
export type InsertTrademarkSimilarity = z.infer<typeof insertTrademarkSimilaritySchema>;

// TMNumber11 types
export type TMNumber = typeof tmNumbers.$inferSelect;
export type InsertTMNumber = z.infer<typeof insertTmNumberSchema>;
export type NiceClassification = typeof niceClassifications.$inferSelect;
export type InsertNiceClassification = z.infer<typeof insertNiceClassificationSchema>;
export type IngestJob = typeof ingestJobs.$inferSelect;
export type InsertIngestJob = z.infer<typeof insertIngestJobSchema>;

// WhatsApp OTP Authentication types
export type WhatsAppUser = typeof whatsappUsers.$inferSelect;
export type InsertWhatsAppUser = typeof whatsappUsers.$inferInsert;
export type WhatsAppOtpSession = typeof whatsappOtpSessions.$inferSelect;
export type InsertWhatsAppOtpSession = typeof whatsappOtpSessions.$inferInsert;

// WytAi Trademark Engine - Proprietary AI-Powered Indian Trademark Intelligence
export const trademarkStatusEnum = pgEnum('trademark_status', ['pending', 'registered', 'opposed', 'abandoned', 'expired', 'renewal_due']);
export const trademarkClassificationEnum = pgEnum('trademark_classification', ['class_1', 'class_2', 'class_3', 'class_4', 'class_5', 'class_6', 'class_7', 'class_8', 'class_9', 'class_10', 'class_11', 'class_12', 'class_13', 'class_14', 'class_15', 'class_16', 'class_17', 'class_18', 'class_19', 'class_20', 'class_21', 'class_22', 'class_23', 'class_24', 'class_25', 'class_26', 'class_27', 'class_28', 'class_29', 'class_30', 'class_31', 'class_32', 'class_33', 'class_34', 'class_35', 'class_36', 'class_37', 'class_38', 'class_39', 'class_40', 'class_41', 'class_42', 'class_43', 'class_44', 'class_45']);
export const trademarkTypeEnum = pgEnum('trademark_type', ['word', 'logo', 'device', 'combined', 'sound', 'shape', 'color', 'movement']);
export const similarityAlgorithmEnum = pgEnum('similarity_algorithm', ['wytai_semantic', 'wytai_phonetic', 'wytai_visual', 'wytai_combined', 'levenshtein', 'soundex']);

// Core trademark records from Indian Patent Office
export const trademarks = pgTable("trademarks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  // Official trademark details
  applicationNumber: varchar("application_number", { length: 50 }).notNull().unique(),
  registrationNumber: varchar("registration_number", { length: 50 }),
  trademarkText: text("trademark_text").notNull(),
  trademarkType: trademarkTypeEnum("trademark_type").notNull(),
  applicantName: varchar("applicant_name", { length: 500 }).notNull(),
  applicantAddress: text("applicant_address"),
  applicantCountry: varchar("applicant_country", { length: 100 }),
  
  // Classification and status
  niceClassification: trademarkClassificationEnum("nice_classification").notNull(),
  goodsServices: text("goods_services").notNull(),
  status: trademarkStatusEnum("status").notNull(),
  filingDate: timestamp("filing_date").notNull(),
  registrationDate: timestamp("registration_date"),
  expiryDate: timestamp("expiry_date"),
  renewalDate: timestamp("renewal_date"),
  
  // Legal and procedural
  attorney: varchar("attorney", { length: 255 }),
  oppositions: jsonb("oppositions").default([]),
  legalProceedings: jsonb("legal_proceedings").default([]),
  
  // AI Enhancement metadata
  searchKeywords: jsonb("search_keywords").default([]), // AI-extracted keywords
  similarityVector: jsonb("similarity_vector").default([]), // ML vector representation
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 4 }).default('1.0000'),
  dataSource: varchar("data_source", { length: 100 }).notNull(), // 'ipo_official', 'court_records', 'web_crawl'
  dataQuality: integer("data_quality").default(100), // 0-100 quality score
  
  // System metadata
  tenantId: uuid("tenant_id").references(() => tenants.id),
  lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_trademarks_application").on(table.applicationNumber),
  index("idx_trademarks_text").on(table.trademarkText),
  index("idx_trademarks_applicant").on(table.applicantName),
  index("idx_trademarks_classification").on(table.niceClassification),
  index("idx_trademarks_status").on(table.status),
  index("idx_trademarks_filing_date").on(table.filingDate),
  index("idx_trademarks_tenant").on(table.tenantId),
]);

// User search queries and AI-powered results
export const trademarkSearches = pgTable("trademark_searches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  
  // Search parameters
  queryText: text("query_text").notNull(),
  searchType: varchar("search_type", { length: 50 }).notNull(), // 'exact', 'similar', 'phonetic', 'semantic'
  filters: jsonb("filters").default({}), // Classification, status, date ranges
  
  // AI Analysis results
  totalResults: integer("total_results").default(0),
  aiConfidenceScore: decimal("ai_confidence_score", { precision: 5, scale: 4 }),
  riskAssessment: varchar("risk_assessment", { length: 20 }), // 'low', 'medium', 'high', 'critical'
  recommendedActions: jsonb("recommended_actions").default([]),
  
  // Performance metrics
  searchDuration: integer("search_duration"), // milliseconds
  algorithmUsed: similarityAlgorithmEnum("algorithm_used").default('wytai_combined'),
  
  // Business context
  ipAddress: varchar("ip_address", { length: 45 }),
  apiKeyUsed: uuid("api_key_used").references(() => wytidApiKeys.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_trademark_searches_tenant").on(table.tenantId),
  index("idx_trademark_searches_user").on(table.userId),
  index("idx_trademark_searches_text").on(table.queryText),
  index("idx_trademark_searches_created").on(table.createdAt),
]);

// AI-powered similarity analysis between trademarks
export const trademarkSimilarities = pgTable("trademark_similarities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  searchId: uuid("search_id").notNull().references(() => trademarkSearches.id, { onDelete: 'cascade' }),
  trademarkId: uuid("trademark_id").notNull().references(() => trademarks.id),
  
  // Similarity scores (proprietary WytAi algorithms)
  overallSimilarity: decimal("overall_similarity", { precision: 5, scale: 4 }).notNull(),
  textSimilarity: decimal("text_similarity", { precision: 5, scale: 4 }),
  phoneticSimilarity: decimal("phonetic_similarity", { precision: 5, scale: 4 }),
  semanticSimilarity: decimal("semantic_similarity", { precision: 5, scale: 4 }),
  visualSimilarity: decimal("visual_similarity", { precision: 5, scale: 4 }),
  
  // Legal risk assessment
  conflictProbability: decimal("conflict_probability", { precision: 5, scale: 4 }),
  oppositionRisk: varchar("opposition_risk", { length: 20 }), // 'minimal', 'low', 'moderate', 'high', 'critical'
  legalPrecedents: jsonb("legal_precedents").default([]),
  
  // AI explanation
  similarityReasons: jsonb("similarity_reasons").default([]),
  algorithmBreakdown: jsonb("algorithm_breakdown").default({}),
  confidence: decimal("confidence", { precision: 5, scale: 4 }).default('1.0000'),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_trademark_similarities_search").on(table.searchId),
  index("idx_trademark_similarities_trademark").on(table.trademarkId),
  index("idx_trademark_similarities_overall").on(table.overallSimilarity),
  index("idx_trademark_similarities_conflict").on(table.conflictProbability),
]);

// API usage tracking for monitoring and billing
export const trademarkApiUsage = pgTable("trademark_api_usage", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  apiKeyId: uuid("api_key_id").references(() => wytidApiKeys.id),
  
  // Usage details
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  httpMethod: varchar("http_method", { length: 10 }).notNull(),
  requestSize: integer("request_size"), // bytes
  responseSize: integer("response_size"), // bytes
  processingTime: integer("processing_time"), // milliseconds
  
  // Business metrics
  searchesPerformed: integer("searches_performed").default(0),
  similaritiesCalculated: integer("similarities_calculated").default(0),
  aiOperations: integer("ai_operations").default(0),
  
  // Technical metrics
  statusCode: integer("status_code").notNull(),
  errorMessage: text("error_message"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  
  // Billing
  creditsCost: decimal("credits_cost", { precision: 10, scale: 4 }).default('0.0000'),
  billingTier: varchar("billing_tier", { length: 50 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_trademark_api_usage_tenant").on(table.tenantId),
  index("idx_trademark_api_usage_api_key").on(table.apiKeyId),
  index("idx_trademark_api_usage_endpoint").on(table.endpoint),
  index("idx_trademark_api_usage_created").on(table.createdAt),
]);

// TMNumber11 proprietary numbering system
export const tmNumbers = pgTable("tm_numbers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  // TMNumber11 format: CC + CCC + PPPPP + D (Class 2 + Country 3 + Product 5 + Check 1)
  classCc: varchar("class_cc", { length: 2 }).notNull(), // Nice classification (01-45)
  countryCcc: varchar("country_ccc", { length: 3 }).notNull(), // ISO numeric (356=India)
  productPpppp: varchar("product_ppppp", { length: 5 }).notNull(), // Product code
  checkD: varchar("check_d", { length: 1 }).notNull(), // Luhn check digit
  tmnumber11: varchar("tmnumber11", { length: 11 }).notNull().unique(), // Full 11-digit code
  
  // Product details
  title: varchar("title", { length: 255 }).notNull(),
  longDesc: text("long_desc"),
  keywords: jsonb("keywords").default([]),
  segmentKey: varchar("segment_key", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default('active'), // active/deprecated
  
  // Relationships and metadata  
  aliasOf: uuid("alias_of"), // For deprecation mapping - self-reference will be added later
  tenantId: uuid("tenant_id").references(() => tenants.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_tm_numbers_class").on(table.classCc),
  index("idx_tm_numbers_country").on(table.countryCcc),
  index("idx_tm_numbers_product").on(table.productPpppp),
  index("idx_tm_numbers_segment").on(table.segmentKey),
  index("idx_tm_numbers_status").on(table.status),
  index("idx_tm_numbers_tenant").on(table.tenantId),
]);

// Social Authentication Tokens
export const socialAuthTokens = pgTable("social_auth_tokens", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id, { onDelete: 'cascade' }),
  provider: varchar("provider", { length: 50 }).notNull(), // 'google', 'facebook', 'linkedin', 'instagram'
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  tokenMetadata: jsonb("token_metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_social_auth_user").on(table.userId),
  index("idx_social_auth_provider").on(table.provider),
]);

export const socialAuthTokensRelations = relations(socialAuthTokens, ({ one }) => ({
  user: one(whatsappUsers, {
    fields: [socialAuthTokens.userId],
    references: [whatsappUsers.id],
  }),
}));

// Social Auth schemas
export const insertSocialAuthTokenSchema = createInsertSchema(socialAuthTokens);
export const selectSocialAuthTokenSchema = createSelectSchema(socialAuthTokens);

// Enhanced search with classification categories
export const niceClassifications = pgTable("nice_classifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  classNumber: varchar("class_number", { length: 2 }).notNull().unique(), // 01-45
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // goods/services
  examples: jsonb("examples").default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_nice_class_number").on(table.classNumber),
  index("idx_nice_category").on(table.category),
]);

// Crawler and ETL job tracking
export const ingestJobs = pgTable("ingest_jobs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  
  // Job configuration
  adapter: varchar("adapter", { length: 100 }).notNull(), // ipindia, wipo, euipo, generic_html
  params: jsonb("params").default({}),
  status: varchar("status", { length: 20 }).notNull().default('queued'), // queued/running/success/failed
  
  // Execution details
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  stats: jsonb("stats").default({}), // records processed, errors, etc.
  logUrl: varchar("log_url", { length: 500 }),
  errorMessage: text("error_message"),
  
  // Metadata
  priority: integer("priority").default(5), // 1-10 scale
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_ingest_jobs_adapter").on(table.adapter),
  index("idx_ingest_jobs_status").on(table.status),
  index("idx_ingest_jobs_tenant").on(table.tenantId),
  index("idx_ingest_jobs_created").on(table.createdAt),
]);

// WytAi Trademark schemas (after table definitions)
export const insertTrademarkSchema = createInsertSchema(trademarks);
export const selectTrademarkSchema = createSelectSchema(trademarks);
export const insertTrademarkSearchSchema = createInsertSchema(trademarkSearches);
export const selectTrademarkSearchSchema = createSelectSchema(trademarkSearches);
export const insertTrademarkSimilaritySchema = createInsertSchema(trademarkSimilarities);
export const selectTrademarkSimilaritySchema = createSelectSchema(trademarkSimilarities);

// TMNumber11 schemas
export const insertTmNumberSchema = createInsertSchema(tmNumbers);
export const selectTmNumberSchema = createSelectSchema(tmNumbers);
export const insertNiceClassificationSchema = createInsertSchema(niceClassifications);
export const selectNiceClassificationSchema = createSelectSchema(niceClassifications);
export const insertIngestJobSchema = createInsertSchema(ingestJobs);
export const selectIngestJobSchema = createSelectSchema(ingestJobs);

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

// Platform Modules Types
export type PlatformModule = typeof platformModules.$inferSelect;
export type InsertPlatformModule = typeof platformModules.$inferInsert;

// Zod schemas for platform modules
export const insertPlatformModuleSchema = createInsertSchema(platformModules);
export const selectPlatformModuleSchema = createSelectSchema(platformModules);
export type InsertPlatformModuleType = z.infer<typeof insertPlatformModuleSchema>;
export type SelectPlatformModuleType = z.infer<typeof selectPlatformModuleSchema>;

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
