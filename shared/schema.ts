import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
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
