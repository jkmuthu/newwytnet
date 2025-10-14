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
  unique,
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

// Enums - must be defined before they are used
export const genderEnum = pgEnum("gender", ["male", "female", "other", "prefer_not_to_say"]);
export const userRoleEnum = pgEnum("user_role", ["super_admin", "admin", "manager", "user", "guest"]);

// Users table with RLS support - unified for all authentication methods
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash", { length: 255 }),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  // Role and permissions
  role: userRoleEnum("role").default('user'),
  isSuperAdmin: boolean("is_super_admin").default(false),
  isVerified: boolean("is_verified").default(false),
  permissions: jsonb("permissions").default({}),
  
  // Social Auth Integration
  socialProviders: jsonb("social_providers").default([]), // ['google', 'linkedin', 'facebook']
  socialIds: jsonb("social_ids").default({}), // {google: 'id123'}
  authMethods: jsonb("auth_methods").default(['password']), // ['password', 'google', 'email_otp']
  
  // Referral System
  referralCode: varchar("referral_code", { length: 20 }).unique(),
  referredBy: varchar("referred_by", { length: 20 }),
  
  // Profile tracking
  profileComplete: boolean("profile_complete").default(false),
  lastLoginAt: timestamp("last_login_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  
  // Referral System
  referralCode: varchar("referral_code", { length: 20 }).unique(),
  referredBy: varchar("referred_by", { length: 20 }),
  
  // Authentication Methods
  authMethods: jsonb("auth_methods").default(['whatsapp']), // ['whatsapp', 'password', 'google', 'facebook']
  passwordHash: varchar("password_hash", { length: 255 }),
  
  // Profile completion tracking
  profileComplete: boolean("profile_complete").default(false),
  
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

// User Profiles - Detailed user information
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id),
  username: varchar("username", { length: 50 }).unique(),
  
  // Personal Information (Personal Tab)
  profilePhoto: varchar("profile_photo", { length: 500 }),
  nickName: varchar("nick_name", { length: 100 }),
  bio: text("bio"),
  mobileNumber: varchar("mobile_number", { length: 20 }),
  gender: varchar("gender", { length: 50 }),
  dateOfBirth: timestamp("date_of_birth"),
  maritalStatus: varchar("marital_status", { length: 50 }),
  motherTongue: varchar("mother_tongue", { length: 50 }).default('Tamil'),
  homeLocation: varchar("home_location", { length: 255 }),
  livingIn: varchar("living_in", { length: 255 }),
  languagesKnown: jsonb("languages_known").default([]), // [{code: 'en', name: 'English', speak: true, write: true}]
  
  // Existing Professional Information
  location: varchar("location", { length: 255 }),
  website: varchar("website", { length: 500 }),
  company: varchar("company", { length: 255 }),
  jobTitle: varchar("job_title", { length: 255 }),
  skills: jsonb("skills").default([]),
  interests: jsonb("interests").default([]),
  socialLinks: jsonb("social_links").default({}),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).default('IN'),
  zipCode: varchar("zip_code", { length: 20 }),
  
  // Privacy Settings - controls public/private for each field
  privacySettings: jsonb("privacy_settings").default({}), // {email: 'private', mobileNumber: 'public', ...}
  
  // Profile Completion Tracking
  profileCompletionPercentage: integer("profile_completion_percentage").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profile Field Weights - Admin configuration for profile completion calculation
export const profileFieldWeights = pgTable("profile_field_weights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fieldName: varchar("field_name", { length: 100 }).notNull().unique(),
  fieldLabel: varchar("field_label", { length: 255 }).notNull(),
  weightPercentage: integer("weight_percentage").notNull().default(0), // 0-100
  isRequired: boolean("is_required").default(false),
  tabSection: varchar("tab_section", { length: 50 }).notNull().default('personal'), // personal, education, works, socials, interests
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bucket List - User goals and aspirations that can be matched with opportunities
export const bucketList = pgTable("bucket_list", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 100 }).notNull(),
  description: varchar("description", { length: 200 }),
  category: varchar("category", { length: 100 }),
  targetDate: timestamp("target_date"),
  isDone: boolean("is_done").default(false),
  isPublic: boolean("is_public").default(true), // For WytMatch matching
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Needs - Marketplace needs
export const userNeeds = pgTable("user_needs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default('USD'),
  status: varchar("status", { length: 20 }).notNull().default('active'),
  tags: jsonb("tags").default([]),
  location: varchar("location", { length: 255 }),
  responseCount: integer("response_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Offers - Marketplace offers
export const userOffers = pgTable("user_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default('USD'),
  status: varchar("status", { length: 20 }).notNull().default('active'),
  tags: jsonb("tags").default([]),
  location: varchar("location", { length: 255 }),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// User App Installations - Tracks which platform modules/apps users have installed
export const userAppInstallations = pgTable("user_app_installations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  appSlug: varchar("app_slug", { length: 255 }).notNull(), // References platformModules.id
  installedAt: timestamp("installed_at").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).notNull().default('active'), // active, suspended
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default('free'), // free, basic, pro, enterprise
  metadata: jsonb("metadata").default({}), // App-specific settings and data
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userAppIdx: index("user_app_idx").on(table.userId, table.appSlug),
  uniqueUserApp: unique("unique_user_app").on(table.userId, table.appSlug),
}));

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

// Payment Status Enum
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending", "processing", "completed", "failed", "cancelled", "refunded"
]);

// Order Status Enum  
export const orderStatusEnum = pgEnum("order_status", [
  "draft", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"
]);

// Orders table for payment processing
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => whatsappUsers.id),
  planId: uuid("plan_id").references(() => plans.id),
  
  // Order details
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  status: orderStatusEnum("status").notNull().default('draft'),
  
  // Pricing
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default('0'),
  discount: decimal("discount", { precision: 10, scale: 2 }).default('0'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default('INR'),
  
  // Metadata
  items: jsonb("items").default([]), // Array of order items
  billingAddress: jsonb("billing_address").default({}),
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_orders_user_id").on(table.userId),
  index("idx_orders_status").on(table.status),
  index("idx_orders_created_at").on(table.createdAt),
]);

// Payments table for transaction tracking
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => whatsappUsers.id),
  orderId: uuid("order_id").references(() => orders.id),
  
  // Payment gateway details
  provider: varchar("provider", { length: 50 }).notNull().default('razorpay'),
  providerPaymentId: varchar("provider_payment_id", { length: 100 }), // Razorpay payment ID
  providerOrderId: varchar("provider_order_id", { length: 100 }), // Razorpay order ID
  
  // Payment details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default('INR'),
  status: paymentStatusEnum("status").notNull().default('pending'),
  
  // Payment method
  method: varchar("method", { length: 50 }), // card, netbanking, wallet, upi
  paymentMethod: jsonb("payment_method").default({}), // Detailed payment method info
  
  // Timestamps
  paidAt: timestamp("paid_at"),
  failedAt: timestamp("failed_at"),
  refundedAt: timestamp("refunded_at"),
  
  // Additional details
  failureReason: text("failure_reason"),
  receipt: varchar("receipt", { length: 100 }),
  notes: jsonb("notes").default({}),
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_payments_user_id").on(table.userId),
  index("idx_payments_order_id").on(table.orderId),
  index("idx_payments_status").on(table.status),
  index("idx_payments_provider_payment_id").on(table.providerPaymentId),
  index("idx_payments_created_at").on(table.createdAt),
]);

// Subscriptions table for recurring payments
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => whatsappUsers.id),
  planId: uuid("plan_id").references(() => plans.id),
  
  // Subscription details
  status: varchar("status", { length: 20 }).notNull().default('active'), // active, cancelled, expired, paused
  
  // Billing
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  nextBillingDate: timestamp("next_billing_date"),
  
  // Pricing
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default('INR'),
  
  // Gateway details
  providerSubscriptionId: varchar("provider_subscription_id", { length: 100 }),
  
  // Metadata
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_subscriptions_user_id").on(table.userId),
  index("idx_subscriptions_plan_id").on(table.planId),
  index("idx_subscriptions_status").on(table.status),
  index("idx_subscriptions_next_billing").on(table.nextBillingDate),
]);

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

// SEO Settings
export const seoSettings = pgTable("seo_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: 'cascade' }),
  siteName: varchar("site_name", { length: 255 }),
  siteDescription: text("site_description"),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  faviconUrl: varchar("favicon_url", { length: 500 }),
  ogImageUrl: varchar("og_image_url", { length: 500 }),
  ogTitle: varchar("og_title", { length: 255 }),
  ogDescription: text("og_description"),
  twitterHandle: varchar("twitter_handle", { length: 100 }),
  twitterCardType: varchar("twitter_card_type", { length: 50 }).default('summary_large_image'),
  canonicalUrl: varchar("canonical_url", { length: 500 }),
  robotsMeta: varchar("robots_meta", { length: 200 }).default('index, follow'),
  structuredData: jsonb("structured_data").default({}),
  customHeadTags: text("custom_head_tags"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_seo_settings_tenant_id").on(table.tenantId),
  index("idx_seo_settings_is_active").on(table.isActive),
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

export const seoSettingsRelations = relations(seoSettings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [seoSettings.tenantId],
    references: [tenants.id],
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
export type SeoSetting = typeof seoSettings.$inferSelect;

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

// Payment schemas
export const insertOrderSchema = createInsertSchema(orders);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);

export const insertMediaSchema = createInsertSchema(media);
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const insertSeoSettingSchema = createInsertSchema(seoSettings);

// WhatsApp OTP schemas
export const insertWhatsAppUserSchema = createInsertSchema(whatsappUsers);
export const selectWhatsAppUserSchema = createSelectSchema(whatsappUsers);
export const insertWhatsAppOtpSessionSchema = createInsertSchema(whatsappOtpSessions);
export const selectWhatsAppOtpSessionSchema = createSelectSchema(whatsappOtpSessions);

// User Profile schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  dateOfBirth: z.union([z.date(), z.string()]).optional().transform(val => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  })
});
export const selectUserProfileSchema = createSelectSchema(userProfiles);
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

// Bucket List schemas
export const insertBucketListSchema = createInsertSchema(bucketList).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().max(200, "Description must be 200 characters or less").optional(),
  targetDate: z.string().refine((val) => {
    if (!val) return true; // Optional field
    const selectedDate = new Date(val + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, { message: "Target date must be today or in the future" }).optional(),
});
export const selectBucketListSchema = createSelectSchema(bucketList);
export type BucketListItem = typeof bucketList.$inferSelect;
export type InsertBucketListItem = z.infer<typeof insertBucketListSchema>;

// User Needs schemas
export const insertUserNeedSchema = createInsertSchema(userNeeds).omit({ id: true, createdAt: true, updatedAt: true, responseCount: true });
export const selectUserNeedSchema = createSelectSchema(userNeeds);
export type UserNeed = typeof userNeeds.$inferSelect;
export type InsertUserNeed = z.infer<typeof insertUserNeedSchema>;

// User Offers schemas
export const insertUserOfferSchema = createInsertSchema(userOffers).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });
export const selectUserOfferSchema = createSelectSchema(userOffers);
export type UserOffer = typeof userOffers.$inferSelect;
export type InsertUserOffer = z.infer<typeof insertUserOfferSchema>;

// Social Auth types
export type SocialAuthToken = typeof socialAuthTokens.$inferSelect;
export type InsertSocialAuthToken = typeof socialAuthTokens.$inferInsert;

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
export const selectSeoSettingSchema = createSelectSchema(seoSettings);


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
export type InsertSeoSetting = z.infer<typeof insertSeoSettingSchema>;

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
  reportPaid: boolean("report_paid").default(false),
  paymentOrderId: uuid("payment_order_id"),
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

// API Integration service provider enum
export const apiProviderEnum = pgEnum("api_provider", [
  "google_auth", "facebook_auth", "linkedin_auth", "whatsapp_auth", "sms_otp",
  "razorpay", "gpay_direct", "bhim_direct"
]);

// Platform API Integrations for Super Admin
export const apiIntegrations = pgTable("api_integrations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: apiProviderEnum("provider").notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 'auth' or 'payment'
  isEnabled: boolean("is_enabled").default(false),
  credentials: jsonb("credentials").notNull().default({}), // Encrypted JSON object
  settings: jsonb("settings").default({}),
  lastUpdatedBy: varchar("last_updated_by").references(() => whatsappUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const apiIntegrationsRelations = relations(apiIntegrations, ({ one }) => ({
  lastUpdatedBy: one(whatsappUsers, {
    fields: [apiIntegrations.lastUpdatedBy],
    references: [whatsappUsers.id],
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

// User App Installations Types
export type UserAppInstallation = typeof userAppInstallations.$inferSelect;
export type InsertUserAppInstallation = typeof userAppInstallations.$inferInsert;

// Zod schemas for user app installations
export const insertUserAppInstallationSchema = createInsertSchema(userAppInstallations).omit({ id: true });
export const selectUserAppInstallationSchema = createSelectSchema(userAppInstallations);
export type InsertUserAppInstallationType = z.infer<typeof insertUserAppInstallationSchema>;
export type SelectUserAppInstallationType = z.infer<typeof selectUserAppInstallationSchema>;

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

// API Integrations Types
export type ApiIntegration = typeof apiIntegrations.$inferSelect;
export type InsertApiIntegration = typeof apiIntegrations.$inferInsert;

// Zod schemas for API integrations
export const insertApiIntegrationSchema = createInsertSchema(apiIntegrations);
export const selectApiIntegrationSchema = createSelectSchema(apiIntegrations);
export type InsertApiIntegrationType = z.infer<typeof insertApiIntegrationSchema>;
export type SelectApiIntegrationType = z.infer<typeof selectApiIntegrationSchema>;

// ============================================
// MARKETPLACE SYSTEM - WytApps Marketplace with Multi-tenant Storage
// ============================================

// Marketplace Apps - Available apps in the platform
export const marketplaceApps = pgTable("marketplace_apps", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // qr-generator, disc-assessment, etc.
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // utilities, assessment, business, etc.
  icon: varchar("icon", { length: 50 }), // lucide icon name
  features: jsonb("features").default([]), // Array of feature strings
  rating: decimal("rating", { precision: 3, scale: 2 }).default('4.5'), // Average rating
  users: integer("users").default(0), // Total user count
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// App Pricing Models - Pricing for each app
export const appPricing = pgTable("app_pricing", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: uuid("app_id").notNull().references(() => marketplaceApps.id, { onDelete: 'cascade' }),
  pricingType: varchar("pricing_type", { length: 20 }).notNull(), // free, one_time, monthly, yearly, pay_per_use
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default('0.00'),
  currency: varchar("currency", { length: 3 }).notNull().default('INR'),
  usageLimit: integer("usage_limit"), // For pay-per-use, how many uses per purchase
  label: varchar("label", { length: 100 }).notNull(), // Display label like "Free - 5 uses"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User App Subscriptions - What apps users have access to
export const userAppSubscriptions = pgTable("user_app_subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id, { onDelete: 'cascade' }),
  appId: uuid("app_id").notNull().references(() => marketplaceApps.id),
  pricingId: uuid("pricing_id").notNull().references(() => appPricing.id),
  status: varchar("status", { length: 20 }).notNull().default('active'), // active, expired, cancelled
  usageRemaining: integer("usage_remaining"), // For pay-per-use apps
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"), // For time-based subscriptions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// App Usage Tracking - Track usage for pay-per-use apps
export const appUsage = pgTable("app_usage", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id, { onDelete: 'cascade' }),
  appId: uuid("app_id").notNull().references(() => marketplaceApps.id),
  subscriptionId: uuid("subscription_id").notNull().references(() => userAppSubscriptions.id),
  usageType: varchar("usage_type", { length: 50 }).notNull(), // generation, scan, assessment, etc.
  metadata: jsonb("metadata"), // App-specific data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User App Data - Multi-tenant storage for user-specific app data
export const userAppData = pgTable("user_app_data", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id, { onDelete: 'cascade' }),
  appId: uuid("app_id").notNull().references(() => marketplaceApps.id),
  dataType: varchar("data_type", { length: 50 }).notNull(), // qr_code, assessment_result, bookmark, etc.
  title: varchar("title", { length: 255 }), // User-friendly title
  data: jsonb("data").notNull(), // App-specific data structure
  metadata: jsonb("metadata"), // Additional metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// WYTHUBS SYSTEM - Curated Content Hubs
// ============================================

// Marketplace Hubs - Curated collections like AI Directory
export const marketplaceHubs = pgTable("marketplace_hubs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // ai-directory, design-resources, etc.
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // ai-tools, resources, directories, etc.
  icon: varchar("icon", { length: 50 }), // lucide icon name
  coverImage: varchar("cover_image", { length: 500 }), // Hub cover image URL
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").default(false),
  itemCount: integer("item_count").default(0), // Total items in hub
  createdBy: varchar("created_by").references(() => whatsappUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Hub Items - Individual items within hubs (external links, apps, resources)
export const hubItems = pgTable("hub_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hubId: uuid("hub_id").notNull().references(() => marketplaceHubs.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 1000 }), // External URL for hub items
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").default([]), // Array of tag strings
  metadata: jsonb("metadata").default({}), // Additional item data
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").default(0), // For sorting items
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ========================================
// WYTPOINTS ECONOMY SYSTEM
// ========================================

// Entitlement status enum
export const entitlementStatusEnum = pgEnum("entitlement_status", [
  "active",
  "expired",
  "cancelled",
  "suspended"
]);

// Points Wallets - User point balances
export const pointsWallets = pgTable("points_wallets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => whatsappUsers.id),
  balance: integer("balance").notNull().default(0),
  lifetimeEarned: integer("lifetime_earned").notNull().default(0),
  lifetimeSpent: integer("lifetime_spent").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Points Transactions - Complete audit trail
export const pointsTransactions = pgTable("points_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id),
  amount: integer("amount").notNull(), // Positive for credits, negative for debits
  balanceAfter: integer("balance_after").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'registration', 'login', 'purchase', 'recharge', 'referral', 'admin_adjustment', etc.
  description: text("description"),
  metadata: jsonb("metadata").default({}), // Additional context (order_id, app_id, etc.)
  createdBy: varchar("created_by").references(() => whatsappUsers.id), // For admin adjustments
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Entitlements - App access control (uses existing orders table for purchases)
export const entitlements = pgTable("entitlements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id),
  appId: varchar("app_id", { length: 255 }).notNull(), // App or module ID
  appName: varchar("app_name", { length: 255 }),
  orderId: uuid("order_id").references(() => orders.id),
  type: varchar("type", { length: 50 }).notNull(), // 'one_time', 'subscription', 'trial', 'lifetime'
  status: entitlementStatusEnum("status").notNull().default('active'),
  usageLimit: integer("usage_limit"), // For per-output models
  usageCount: integer("usage_count").default(0),
  startsAt: timestamp("starts_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Null for lifetime access
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Points Configuration - Admin-configurable point values for all actions
export const pointsConfig = pgTable("points_config", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  action: varchar("action", { length: 100 }).notNull().unique(), // 'registration', 'profile_complete', 'post_need', 'post_offer', 'daily_login', etc.
  points: integer("points").notNull(), // Positive for earn, negative for spend
  description: text("description"),
  isActive: boolean("is_active").default(true),
  category: varchar("category", { length: 50 }).default('general'), // 'onboarding', 'marketplace', 'engagement', etc.
  updatedBy: varchar("updated_by").references(() => whatsappUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WytPoints schema exports
export const insertPointsWalletSchema = createInsertSchema(pointsWallets);
export const selectPointsWalletSchema = createSelectSchema(pointsWallets);
export const insertPointsTransactionSchema = createInsertSchema(pointsTransactions);
export const selectPointsTransactionSchema = createSelectSchema(pointsTransactions);
export const insertEntitlementSchema = createInsertSchema(entitlements);
export const selectEntitlementSchema = createSelectSchema(entitlements);
export const insertPointsConfigSchema = createInsertSchema(pointsConfig);
export const selectPointsConfigSchema = createSelectSchema(pointsConfig);

// WytPoints type exports
export type PointsWallet = typeof pointsWallets.$inferSelect;
export type InsertPointsWallet = typeof pointsWallets.$inferInsert;
export type PointsTransaction = typeof pointsTransactions.$inferSelect;
export type InsertPointsTransaction = typeof pointsTransactions.$inferInsert;
export type Entitlement = typeof entitlements.$inferSelect;
export type InsertEntitlement = typeof entitlements.$inferInsert;
export type PointsConfig = typeof pointsConfig.$inferSelect;
export type InsertPointsConfig = typeof pointsConfig.$inferInsert;

// ========================================
// WYTWALL MARKETPLACE SYSTEM
// ========================================

// Need category enum
export const needCategoryEnum = pgEnum("need_category", [
  "jobs",
  "real_estate",
  "b2b_supply",
  "service",
  "other"
]);

// Need status enum
export const needStatusEnum = pgEnum("need_status", [
  "active",
  "closed",
  "fulfilled",
  "expired"
]);

// Approval status enum for admin moderation
export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected"
]);

// Needs - Marketplace needs posted by users
export const needs = pgTable("needs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: needCategoryEnum("category").notNull(),
  location: varchar("location", { length: 255 }),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default('INR'),
  status: needStatusEnum("status").notNull().default('active'),
  isPublic: boolean("is_public").default(true), // Public or circle-only
  isSponsored: boolean("is_sponsored").default(false),
  circles: jsonb("circles").default([]), // Array of circle IDs
  pointsCost: integer("points_cost").default(0), // Cost to make an offer
  metadata: jsonb("metadata").default({}),
  expiresAt: timestamp("expires_at"),
  approvalStatus: approvalStatusEnum("approval_status").notNull().default('pending'),
  approvedBy: varchar("approved_by").references(() => whatsappUsers.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Offers - Standalone marketplace offers posted by users
export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: needCategoryEnum("category").notNull(), // Reuse same categories as needs
  location: varchar("location", { length: 255 }),
  price: decimal("price", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default('INR'),
  status: needStatusEnum("status").notNull().default('active'), // Reuse same statuses as needs
  isPublic: boolean("is_public").default(true),
  isSponsored: boolean("is_sponsored").default(false),
  circles: jsonb("circles").default([]),
  pointsSpent: integer("points_spent").default(0), // Points deducted when posting
  metadata: jsonb("metadata").default({}),
  expiresAt: timestamp("expires_at"),
  approvalStatus: approvalStatusEnum("approval_status").notNull().default('pending'),
  approvedBy: varchar("approved_by").references(() => whatsappUsers.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WytWall Posts - Simplified unified needs/offers stream
export const wytWallPostTypeEnum = pgEnum("wytwall_post_type", ["need", "offer"]);

export const wytWallPosts = pgTable("wytwall_posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id, { onDelete: 'cascade' }),
  postType: wytWallPostTypeEnum("post_type").notNull(), // "need" or "offer"
  category: varchar("category", { length: 100 }).notNull(), // Dynamic based on postType
  description: varchar("description", { length: 200 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ========================================
// WYTSTAR GAMIFICATION SYSTEM
// ========================================

// WytStar contribution types enum
export const contributionTypeEnum = pgEnum("contribution_type", [
  "post_need",
  "make_offer",
  "verify_need",
  "verify_offer",
  "add_listing",
  "add_details",
  "upload_image"
]);

// WytStar level enum
export const wytstarLevelEnum = pgEnum("wytstar_level", [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond"
]);

// WytStar Contributions - Track all contributions for rewards
export const wytstarContributions = pgTable("wytstar_contributions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  type: contributionTypeEnum("type").notNull(),
  entityType: varchar("entity_type", { length: 50 }), // 'need', 'offer', 'listing'
  entityId: uuid("entity_id"),
  pointsEarned: integer("points_earned").notNull().default(0),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: varchar("verified_by").references(() => whatsappUsers.id),
  verifiedAt: timestamp("verified_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// WytStar Levels - User star levels and rankings
export const wytstarLevels = pgTable("wytstar_levels", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => whatsappUsers.id),
  level: wytstarLevelEnum("level").notNull().default('bronze'),
  totalPoints: integer("total_points").notNull().default(0),
  rank: integer("rank"), // Global ranking
  monthlyPoints: integer("monthly_points").default(0),
  monthlyRank: integer("monthly_rank"),
  streakDays: integer("streak_days").default(0),
  lastContributionAt: timestamp("last_contribution_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ========================================
// PROFILE COMPLETION ECONOMY
// ========================================

// Profile sections enum
export const profileSectionEnum = pgEnum("profile_section", [
  "basic_info",
  "demographics",
  "photo_upload",
  "first_need",
  "first_offer"
]);

// Profile Completion - Track user profile completion for rewards
export const profileCompletion = pgTable("profile_completion", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => whatsappUsers.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  completionPercentage: integer("completion_percentage").notNull().default(0),
  sectionsCompleted: jsonb("sections_completed").default([]), // Array of completed section IDs
  totalPointsEarned: integer("total_points_earned").default(0),
  completedAt: timestamp("completed_at"), // When 100% achieved
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ========================================
// WYTMATCH SYSTEM
// ========================================

// Match status enum
export const matchStatusEnum = pgEnum("match_status", [
  "pending",
  "unlocked",
  "contacted",
  "completed"
]);

// Matches - Need-Offer matchmaking
export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id), // User who sees the match
  tenantId: uuid("tenant_id").references(() => tenants.id),
  needId: uuid("need_id").notNull().references(() => needs.id),
  offerId: uuid("offer_id").references(() => offers.id),
  matchType: varchar("match_type", { length: 50 }).notNull(), // 'my_need_their_offer', 'my_offer_their_need'
  matchScore: integer("match_score").default(0), // Algorithm score 0-100
  status: matchStatusEnum("status").notNull().default('pending'),
  unlockCost: integer("unlock_cost").default(1), // Points to unlock
  isUnlocked: boolean("is_unlocked").default(false),
  unlockedAt: timestamp("unlocked_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ========================================
// DUAL PANEL SYSTEM (Organizations)
// ========================================

// Organizations - For OurPanel multi-user workspaces
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  ownerId: varchar("owner_id").notNull().references(() => whatsappUsers.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  description: text("description"),
  logo: varchar("logo", { length: 500 }),
  settings: jsonb("settings").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Organization Members - Team members in organizations
export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").default(sql`gen_random_uuid()`),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id),
  role: varchar("role", { length: 50 }).notNull().default('member'), // owner, admin, member
  permissions: jsonb("permissions").default({}),
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.organizationId, table.userId] }),
}));

// ========================================
// WYTLIFE APPLICATIONS
// ========================================

// WytLife Applications - For early member applications
export const wytLifeApplications = pgTable("wyt_life_applications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  occupation: varchar("occupation", { length: 255 }),
  organization: varchar("organization", { length: 255 }),
  whyJoin: text("why_join").notNull(),
  areasOfInterest: jsonb("areas_of_interest").default([]), // ['Leadership', 'Productivity', 'Wellness', 'Networking']
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, approved, rejected
  userId: varchar("user_id").references(() => whatsappUsers.id), // If application is from logged-in user
  pointsAwarded: integer("points_awarded").default(0), // WytPoints bonus (e.g., 25 pts)
  tenantId: uuid("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ========================================
// DATASET MANAGEMENT SYSTEM
// ========================================

// Dataset Collections - Reference data collections (Countries, Languages, etc.)
export const datasetCollections = pgTable("dataset_collections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(), // e.g., 'countries', 'languages', 'currencies'
  name: varchar("name", { length: 255 }).notNull(), // Display name
  description: text("description"),
  scope: varchar("scope", { length: 20 }).notNull().default('global'), // 'global' or 'tenant'
  tenantId: uuid("tenant_id").references(() => tenants.id),
  metadata: jsonb("metadata").default({}), // { immutable: true, icon: '🌍', category: 'system' }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dataset Items - Individual items within a collection
export const datasetItems = pgTable("dataset_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: uuid("collection_id").notNull().references(() => datasetCollections.id, { onDelete: 'cascade' }),
  code: varchar("code", { length: 100 }).notNull(), // ISO code or unique identifier
  label: varchar("label", { length: 255 }).notNull(), // Display label
  locale: varchar("locale", { length: 10 }).default('en'), // Language/locale for label
  isDefault: boolean("is_default").default(false),
  sortOrder: integer("sort_order").default(0),
  metadata: jsonb("metadata").default({}), // Additional properties (phonePrefix, symbol, etc.)
  tenantId: uuid("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueCodePerCollection: unique().on(table.collectionId, table.code, table.locale),
}));

// ========================================
// END DATASET MANAGEMENT SYSTEM
// ========================================

// ========================================
// AI APP BUILDER SYSTEM
// ========================================

// Access level enum for App Builder
export const appBuilderAccessLevelEnum = pgEnum("app_builder_access_level", [
  "super_admin",
  "developer", 
  "user"
]);

// App project status enum
export const appProjectStatusEnum = pgEnum("app_project_status", [
  "draft",
  "development",
  "testing",
  "production",
  "archived"
]);

// AI App Projects - Store apps created via App Builder
export const aiAppProjects = pgTable("ai_app_projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => whatsappUsers.id), // Who created this app
  tenantId: uuid("tenant_id").references(() => tenants.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL-friendly identifier
  description: text("description"),
  icon: varchar("icon", { length: 500 }), // App icon URL
  
  // Access control
  accessLevel: appBuilderAccessLevelEnum("access_level").notNull().default('super_admin'),
  isPublic: boolean("is_public").default(false), // Public in marketplace
  
  // Status and versioning
  status: appProjectStatusEnum("status").notNull().default('draft'),
  version: varchar("version", { length: 20 }).default('1.0.0'),
  
  // Schema and configuration
  schemaDefinition: jsonb("schema_definition").default({}), // Database schema JSON
  routesConfig: jsonb("routes_config").default({}), // API routes configuration
  uiConfig: jsonb("ui_config").default({}), // UI pages and components
  
  // URLs
  devUrl: varchar("dev_url", { length: 500 }), // Development URL
  productionUrl: varchar("production_url", { length: 500 }), // Production URL
  
  // Pricing (future)
  pricingPlanId: uuid("pricing_plan_id"), // Link to pricing plans
  
  // Resource quotas (for non-admin users)
  resourceQuota: jsonb("resource_quota").default({}), // {maxTables: 10, maxAPIs: 20}
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  tags: jsonb("tags").default([]), // ['inventory', 'crm', 'productivity']
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
});

// AI Chat Conversations - Store chat history for each app project
export const aiChatConversations = pgTable("ai_chat_conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => aiAppProjects.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  // Conversation data
  messages: jsonb("messages").default([]), // Array of {role, content, timestamp}
  context: jsonb("context").default({}), // WytNet framework context
  
  // Metadata
  title: varchar("title", { length: 255 }), // Auto-generated or user-defined
  totalMessages: integer("total_messages").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Generated Code - Store code snippets generated by AI
export const aiGeneratedCode = pgTable("ai_generated_code", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").notNull().references(() => aiAppProjects.id, { onDelete: 'cascade' }),
  conversationId: uuid("conversation_id").references(() => aiChatConversations.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  // Code details
  codeType: varchar("code_type", { length: 50 }).notNull(), // 'schema', 'api', 'component', 'full_app'
  fileName: varchar("file_name", { length: 255 }), // Suggested filename
  code: text("code").notNull(), // The actual generated code
  language: varchar("language", { length: 20 }).default('typescript'), // 'typescript', 'javascript', 'sql'
  
  // Version control
  version: integer("version").default(1),
  parentId: uuid("parent_id"), // For versioning/editing
  
  // Status
  isApplied: boolean("is_applied").default(false), // Whether code was applied to project
  appliedAt: timestamp("applied_at"),
  
  // Metadata
  prompt: text("prompt"), // Original user prompt
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ========================================
// END AI APP BUILDER SYSTEM
// ========================================

// ========================================
// PRICING PLANS SYSTEM
// ========================================

// Pricing plan types enum
export const pricingPlanTypeEnum = pgEnum("pricing_plan_type", [
  "free",
  "one_output",     // Pay per single use
  "onetime",        // One-time purchase
  "monthly",        // Monthly subscription
  "yearly",         // Yearly subscription
  "trial"           // Trial period
]);

// Subscription status enum
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "cancelled",
  "expired",
  "trial",
  "paused"
]);

// Apps Registry - All WytNet apps catalog
export const appsRegistry = pgTable("apps_registry", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 500 }),
  category: varchar("category", { length: 100 }), // 'productivity', 'utility', 'ai', etc.
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Pricing Plans - Main pricing configuration per app
export const pricingPlans = pgTable("pricing_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: uuid("app_id").notNull().references(() => appsRegistry.id, { onDelete: 'cascade' }),
  
  // Plan details
  planName: varchar("plan_name", { length: 255 }).notNull(), // 'Free', 'Plus', 'Pro'
  planBatch: varchar("plan_batch", { length: 50 }), // '₹', '+', '-' for grouping/tiering
  description: text("description"),
  
  // Pricing
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).default('0'),
  currency: varchar("currency", { length: 10 }).notNull().default('INR'),
  
  // Configuration
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  sortOrder: integer("sort_order").default(0), // Display order
  
  // Razorpay integration
  razorpayPlanId: varchar("razorpay_plan_id", { length: 255 }), // Sync with Razorpay
  
  // Features and limits
  features: jsonb("features").default([]), // Array of feature strings
  limits: jsonb("limits").default({}), // {maxRequests: 100, maxStorage: '1GB'}
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Pricing Plan Types - Multiple pricing models per plan
export const pricingPlanTypes = pgTable("pricing_plan_types", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pricingPlanId: uuid("pricing_plan_id").notNull().references(() => pricingPlans.id, { onDelete: 'cascade' }),
  
  // Type and pricing
  type: pricingPlanTypeEnum("type").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default('0'),
  
  // Billing configuration
  billingInterval: varchar("billing_interval", { length: 20 }), // 'monthly', 'yearly', 'onetime'
  trialDays: integer("trial_days").default(0), // Trial period in days
  
  // Quotas (for usage-based plans)
  usageLimit: integer("usage_limit"), // Max uses per billing cycle
  
  // Razorpay integration
  razorpayItemId: varchar("razorpay_item_id", { length: 255 }),
  
  // Configuration
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Subscriptions - Track user's active subscriptions
export const userSubscriptions = pgTable("user_subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id, { onDelete: 'cascade' }),
  appId: uuid("app_id").notNull().references(() => appsRegistry.id),
  pricingPlanId: uuid("pricing_plan_id").notNull().references(() => pricingPlans.id),
  pricingPlanTypeId: uuid("pricing_plan_type_id").references(() => pricingPlanTypes.id),
  
  // Subscription status
  status: subscriptionStatusEnum("status").notNull().default('active'),
  
  // Dates
  startedAt: timestamp("started_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  nextBillingDate: timestamp("next_billing_date"),
  cancelledAt: timestamp("cancelled_at"),
  
  // Razorpay integration
  razorpaySubscriptionId: varchar("razorpay_subscription_id", { length: 255 }),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  
  // Trial tracking
  isTrialUsed: boolean("is_trial_used").default(false),
  trialEndsAt: timestamp("trial_ends_at"),
  
  // Auto-renewal
  autoRenew: boolean("auto_renew").default(true),
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: One active subscription per user per app
  uniqueUserAppSubscription: unique().on(table.userId, table.appId, table.status),
}));

// Usage Tracking - Track usage for pay-per-use plans
export const usageTracking = pgTable("usage_tracking", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id, { onDelete: 'cascade' }),
  appId: uuid("app_id").notNull().references(() => appsRegistry.id),
  subscriptionId: uuid("subscription_id").references(() => userSubscriptions.id),
  
  // Usage data
  usageCount: integer("usage_count").default(0),
  usageDetails: jsonb("usage_details").default({}), // Detailed usage logs
  
  // Billing cycle
  billingPeriodStart: timestamp("billing_period_start").defaultNow().notNull(),
  billingPeriodEnd: timestamp("billing_period_end"),
  lastResetDate: timestamp("last_reset_date").defaultNow().notNull(),
  
  // Quota enforcement
  quotaLimit: integer("quota_limit"), // Max allowed uses
  quotaRemaining: integer("quota_remaining"),
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payment Transactions - Track all payment transactions
export const paymentTransactions = pgTable("payment_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => whatsappUsers.id),
  subscriptionId: uuid("subscription_id").references(() => userSubscriptions.id),
  
  // Transaction details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default('INR'),
  status: varchar("status", { length: 50 }).notNull(), // 'pending', 'success', 'failed'
  
  // Razorpay data
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  razorpaySignature: varchar("razorpay_signature", { length: 500 }),
  
  // Transaction metadata
  transactionType: varchar("transaction_type", { length: 50 }), // 'subscription', 'renewal', 'upgrade'
  description: text("description"),
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// App Features - Define features available per app
export const appFeatures = pgTable("app_features", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: uuid("app_id").notNull().references(() => appsRegistry.id, { onDelete: 'cascade' }),
  
  // Feature details
  name: varchar("name", { length: 255 }).notNull(), // 'API Access', 'Bulk QR Generation', etc.
  description: text("description"),
  featureKey: varchar("feature_key", { length: 100 }).notNull(), // 'api_access', 'bulk_qr', etc.
  category: varchar("category", { length: 100 }), // 'core', 'advanced', 'premium'
  
  // Default quota (if applicable)
  hasQuota: boolean("has_quota").default(false),
  defaultQuota: integer("default_quota"), // Default quota for this feature
  quotaUnit: varchar("quota_unit", { length: 50 }), // 'requests', 'QRs', 'GB', etc.
  
  // Configuration
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Unique feature key per app
  uniqueAppFeatureKey: unique().on(table.appId, table.featureKey),
}));

// Plan Feature Access - Map which features are included in each plan
export const planFeatureAccess = pgTable("plan_feature_access", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pricingPlanId: uuid("pricing_plan_id").notNull().references(() => pricingPlans.id, { onDelete: 'cascade' }),
  featureId: uuid("feature_id").notNull().references(() => appFeatures.id, { onDelete: 'cascade' }),
  
  // Access configuration
  isEnabled: boolean("is_enabled").default(true),
  
  // Quota override (overrides feature's default quota)
  hasCustomQuota: boolean("has_custom_quota").default(false),
  customQuota: integer("custom_quota"), // Plan-specific quota
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Unique feature per plan
  uniquePlanFeature: unique().on(table.pricingPlanId, table.featureId),
}));

// ========================================
// JUNCTION TABLES - Enterprise Architecture
// ========================================

// Module Features - Many-to-Many relationship between Modules and Features
export const moduleFeatures = pgTable("module_features", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id", { length: 255 }).notNull().references(() => platformModules.id, { onDelete: 'cascade' }),
  featureId: uuid("feature_id").notNull().references(() => appFeatures.id, { onDelete: 'cascade' }),
  
  // Configuration
  isRequired: boolean("is_required").default(false), // Is this feature required for the module?
  sortOrder: integer("sort_order").default(0), // Display order
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Unique feature per module
  uniqueModuleFeature: unique().on(table.moduleId, table.featureId),
  // Indexes for faster queries
  moduleIdIdx: index("module_features_module_id_idx").on(table.moduleId),
  featureIdIdx: index("module_features_feature_id_idx").on(table.featureId),
}));

// App Modules - Many-to-Many relationship between Apps and Modules
export const appModules = pgTable("app_modules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: uuid("app_id").notNull().references(() => appsRegistry.id, { onDelete: 'cascade' }),
  moduleId: varchar("module_id", { length: 255 }).notNull().references(() => platformModules.id, { onDelete: 'cascade' }),
  
  // Configuration
  isRequired: boolean("is_required").default(true), // Is this module required for the app?
  version: varchar("version", { length: 20 }), // Module version used in this app
  config: jsonb("config").default({}), // Module-specific configuration
  sortOrder: integer("sort_order").default(0),
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Unique module per app
  uniqueAppModule: unique().on(table.appId, table.moduleId),
  // Indexes for faster queries
  appIdIdx: index("app_modules_app_id_idx").on(table.appId),
  moduleIdIdx: index("app_modules_module_id_idx").on(table.moduleId),
}));

// Hub Modules - Many-to-Many relationship between Hubs and Modules
export const hubModules = pgTable("hub_modules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hubId: uuid("hub_id").notNull().references(() => hubs.id, { onDelete: 'cascade' }),
  moduleId: varchar("module_id", { length: 255 }).notNull().references(() => platformModules.id, { onDelete: 'cascade' }),
  
  // Configuration
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Unique module per hub
  uniqueHubModule: unique().on(table.hubId, table.moduleId),
  // Indexes for faster queries
  hubIdIdx: index("hub_modules_hub_id_idx").on(table.hubId),
  moduleIdIdx: index("hub_modules_module_id_idx").on(table.moduleId),
}));

// Hub Apps - Many-to-Many relationship between Hubs and Apps
export const hubApps = pgTable("hub_apps", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hubId: uuid("hub_id").notNull().references(() => hubs.id, { onDelete: 'cascade' }),
  appId: uuid("app_id").notNull().references(() => appsRegistry.id, { onDelete: 'cascade' }),
  
  // Configuration
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Unique app per hub
  uniqueHubApp: unique().on(table.hubId, table.appId),
  // Indexes for faster queries
  hubIdIdx: index("hub_apps_hub_id_idx").on(table.hubId),
  appIdIdx: index("hub_apps_app_id_idx").on(table.appId),
}));

// Junction Table Relations
export const moduleFeaturesRelations = relations(moduleFeatures, ({ one }) => ({
  module: one(platformModules, {
    fields: [moduleFeatures.moduleId],
    references: [platformModules.id],
  }),
  feature: one(appFeatures, {
    fields: [moduleFeatures.featureId],
    references: [appFeatures.id],
  }),
}));

export const appModulesRelations = relations(appModules, ({ one }) => ({
  app: one(appsRegistry, {
    fields: [appModules.appId],
    references: [appsRegistry.id],
  }),
  module: one(platformModules, {
    fields: [appModules.moduleId],
    references: [platformModules.id],
  }),
}));

export const hubModulesRelations = relations(hubModules, ({ one }) => ({
  hub: one(hubs, {
    fields: [hubModules.hubId],
    references: [hubs.id],
  }),
  module: one(platformModules, {
    fields: [hubModules.moduleId],
    references: [platformModules.id],
  }),
}));

export const hubAppsRelations = relations(hubApps, ({ one }) => ({
  hub: one(hubs, {
    fields: [hubApps.hubId],
    references: [hubs.id],
  }),
  app: one(appsRegistry, {
    fields: [hubApps.appId],
    references: [appsRegistry.id],
  }),
}));

// ========================================
// END JUNCTION TABLES
// ========================================

// ========================================
// END PRICING PLANS SYSTEM
// ========================================

// ========================================
// END WYTWALL MARKETPLACE SYSTEM
// ========================================

// Marketplace Apps schema exports
export const insertMarketplaceAppSchema = createInsertSchema(marketplaceApps);
export const selectMarketplaceAppSchema = createSelectSchema(marketplaceApps);
export const insertAppPricingSchema = createInsertSchema(appPricing);
export const selectAppPricingSchema = createSelectSchema(appPricing);
export const insertUserAppSubscriptionSchema = createInsertSchema(userAppSubscriptions);
export const selectUserAppSubscriptionSchema = createSelectSchema(userAppSubscriptions);
export const insertAppUsageSchema = createInsertSchema(appUsage);
export const selectAppUsageSchema = createSelectSchema(appUsage);
export const insertUserAppDataSchema = createInsertSchema(userAppData);
export const selectUserAppDataSchema = createSelectSchema(userAppData);

// Marketplace Hubs schema exports
export const insertMarketplaceHubSchema = createInsertSchema(marketplaceHubs);
export const selectMarketplaceHubSchema = createSelectSchema(marketplaceHubs);
export const insertHubItemSchema = createInsertSchema(hubItems);
export const selectHubItemSchema = createSelectSchema(hubItems);

// Type exports for marketplace apps
export type MarketplaceApp = typeof marketplaceApps.$inferSelect;
export type InsertMarketplaceApp = typeof marketplaceApps.$inferInsert;
export type AppPricing = typeof appPricing.$inferSelect;
export type InsertAppPricing = typeof appPricing.$inferInsert;
export type UserAppSubscription = typeof userAppSubscriptions.$inferSelect;
export type InsertUserAppSubscription = typeof userAppSubscriptions.$inferInsert;

// Type exports for marketplace hubs
export type MarketplaceHub = typeof marketplaceHubs.$inferSelect;
export type InsertMarketplaceHub = typeof marketplaceHubs.$inferInsert;
export type HubItem = typeof hubItems.$inferSelect;
export type InsertHubItem = typeof hubItems.$inferInsert;

// WytWall Marketplace schema exports
export const insertNeedSchema = createInsertSchema(needs);
export const selectNeedSchema = createSelectSchema(needs);
export const insertOfferSchema = createInsertSchema(offers);
export const selectOfferSchema = createSelectSchema(offers);
export const insertWytWallPostSchema = createInsertSchema(wytWallPosts).omit({ id: true, createdAt: true, updatedAt: true });
export const selectWytWallPostSchema = createSelectSchema(wytWallPosts);

// WytStar schema exports
export const insertWytstarContributionSchema = createInsertSchema(wytstarContributions);
export const selectWytstarContributionSchema = createSelectSchema(wytstarContributions);
export const insertWytstarLevelSchema = createInsertSchema(wytstarLevels);
export const selectWytstarLevelSchema = createSelectSchema(wytstarLevels);

// Profile Completion schema exports
export const insertProfileCompletionSchema = createInsertSchema(profileCompletion);
export const selectProfileCompletionSchema = createSelectSchema(profileCompletion);

// WytMatch schema exports
export const insertMatchSchema = createInsertSchema(matches);
export const selectMatchSchema = createSelectSchema(matches);

// Organizations schema exports
export const insertOrganizationSchema = createInsertSchema(organizations);
export const selectOrganizationSchema = createSelectSchema(organizations);
export const insertOrganizationMemberSchema = createInsertSchema(organizationMembers);
export const selectOrganizationMemberSchema = createSelectSchema(organizationMembers);

// WytWall Marketplace type exports
export type Need = typeof needs.$inferSelect;
export type InsertNeed = typeof needs.$inferInsert;
export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;
export type WytWallPost = typeof wytWallPosts.$inferSelect;
export type InsertWytWallPost = z.infer<typeof insertWytWallPostSchema>;

// WytStar type exports
export type WytstarContribution = typeof wytstarContributions.$inferSelect;
export type InsertWytstarContribution = typeof wytstarContributions.$inferInsert;
export type WytstarLevel = typeof wytstarLevels.$inferSelect;
export type InsertWytstarLevel = typeof wytstarLevels.$inferInsert;

// Profile Completion type exports
export type ProfileCompletion = typeof profileCompletion.$inferSelect;
export type InsertProfileCompletion = typeof profileCompletion.$inferInsert;

// WytMatch type exports
export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

// Organizations type exports
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type InsertOrganizationMember = typeof organizationMembers.$inferInsert;

// Dataset Management schema exports
export const insertDatasetCollectionSchema = createInsertSchema(datasetCollections).omit({ id: true, createdAt: true, updatedAt: true });
export const selectDatasetCollectionSchema = createSelectSchema(datasetCollections);
export const insertDatasetItemSchema = createInsertSchema(datasetItems).omit({ id: true, createdAt: true });
export const selectDatasetItemSchema = createSelectSchema(datasetItems);

// Dataset Management type exports
export type DatasetCollection = typeof datasetCollections.$inferSelect;
export type InsertDatasetCollection = z.infer<typeof insertDatasetCollectionSchema>;
export type DatasetItem = typeof datasetItems.$inferSelect;
export type InsertDatasetItem = z.infer<typeof insertDatasetItemSchema>;

// WytLife Applications schema exports
export const insertWytLifeApplicationSchema = createInsertSchema(wytLifeApplications).omit({ id: true, createdAt: true, updatedAt: true });
export const selectWytLifeApplicationSchema = createSelectSchema(wytLifeApplications);

// WytLife Applications type exports
export type WytLifeApplication = typeof wytLifeApplications.$inferSelect;
export type InsertWytLifeApplication = z.infer<typeof insertWytLifeApplicationSchema>;

// AI App Builder schema exports
export const insertAiAppProjectSchema = createInsertSchema(aiAppProjects).omit({ id: true, createdAt: true, updatedAt: true });
export const selectAiAppProjectSchema = createSelectSchema(aiAppProjects);
export const insertAiChatConversationSchema = createInsertSchema(aiChatConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const selectAiChatConversationSchema = createSelectSchema(aiChatConversations);
export const insertAiGeneratedCodeSchema = createInsertSchema(aiGeneratedCode).omit({ id: true, createdAt: true });
export const selectAiGeneratedCodeSchema = createSelectSchema(aiGeneratedCode);

// AI App Builder type exports
export type AiAppProject = typeof aiAppProjects.$inferSelect;
export type InsertAiAppProject = z.infer<typeof insertAiAppProjectSchema>;
export type AiChatConversation = typeof aiChatConversations.$inferSelect;
export type InsertAiChatConversation = z.infer<typeof insertAiChatConversationSchema>;
export type AiGeneratedCode = typeof aiGeneratedCode.$inferSelect;
export type InsertAiGeneratedCode = z.infer<typeof insertAiGeneratedCodeSchema>;

// Pricing Plans schema exports
export const insertAppRegistrySchema = createInsertSchema(appsRegistry).omit({ id: true, createdAt: true, updatedAt: true });
export const selectAppRegistrySchema = createSelectSchema(appsRegistry);
export const insertPricingPlanSchema = createInsertSchema(pricingPlans).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPricingPlanSchema = createSelectSchema(pricingPlans);
export const insertPricingPlanTypeSchema = createInsertSchema(pricingPlanTypes).omit({ id: true, createdAt: true });
export const selectPricingPlanTypeSchema = createSelectSchema(pricingPlanTypes);
export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const selectUserSubscriptionSchema = createSelectSchema(userSubscriptions);
export const insertUsageTrackingSchema = createInsertSchema(usageTracking).omit({ id: true, createdAt: true, updatedAt: true });
export const selectUsageTrackingSchema = createSelectSchema(usageTracking);
export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPaymentTransactionSchema = createSelectSchema(paymentTransactions);
export const insertAppFeatureSchema = createInsertSchema(appFeatures).omit({ id: true, createdAt: true, updatedAt: true });
export const selectAppFeatureSchema = createSelectSchema(appFeatures);
export const insertPlanFeatureAccessSchema = createInsertSchema(planFeatureAccess).omit({ id: true, createdAt: true });
export const selectPlanFeatureAccessSchema = createSelectSchema(planFeatureAccess);

// Pricing Plans type exports
export type AppRegistry = typeof appsRegistry.$inferSelect;
export type InsertAppRegistry = z.infer<typeof insertAppRegistrySchema>;
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type InsertPricingPlan = z.infer<typeof insertPricingPlanSchema>;
export type PricingPlanType = typeof pricingPlanTypes.$inferSelect;
export type InsertPricingPlanType = z.infer<typeof insertPricingPlanTypeSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UsageTracking = typeof usageTracking.$inferSelect;
export type InsertUsageTracking = z.infer<typeof insertUsageTrackingSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type AppFeature = typeof appFeatures.$inferSelect;
export type InsertAppFeature = z.infer<typeof insertAppFeatureSchema>;
export type PlanFeatureAccess = typeof planFeatureAccess.$inferSelect;
export type InsertPlanFeatureAccess = z.infer<typeof insertPlanFeatureAccessSchema>;
