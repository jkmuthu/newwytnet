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
  displayId: varchar("display_id", { length: 20 }).unique(), // TN00001
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }).unique(),
  subdomain: varchar("subdomain", { length: 100 }).unique(),
  status: varchar("status", { length: 20 }).notNull().default('active'),
  settings: jsonb("settings").default({}),
  
  // Soft delete support for trash/recovery system
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deleteReason: text("delete_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_tenants_display_id").on(table.displayId),
  index("idx_tenants_deleted_at").on(table.deletedAt),
]);

// Enums - must be defined before they are used
export const genderEnum = pgEnum("gender", ["male", "female", "other", "prefer_not_to_say"]);
export const userRoleEnum = pgEnum("user_role", ["super_admin", "admin", "manager", "user", "guest"]);

// Users table with RLS support - unified for all authentication methods
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  displayId: varchar("display_id", { length: 20 }).unique(), // UR0000001
  email: varchar("email").unique(),
  name: varchar("name", { length: 255 }),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).unique(),
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
  
  // Soft delete support for trash/recovery system
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deleteReason: text("delete_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_users_display_id").on(table.displayId),
  index("idx_users_deleted_at").on(table.deletedAt),
]);


// User Profiles - Detailed user information
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  username: varchar("username", { length: 50 }).unique(),
  
  // Personal Information (Personal Tab)
  fullName: varchar("full_name", { length: 255 }),
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

// Wish List - User goals and aspirations that can be matched with opportunities (renamed from bucket_list)
export const wishList = pgTable("wish_list", {
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

// User Education - Educational background (like LinkedIn)
export const userEducation = pgTable("user_education", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  institution: varchar("institution", { length: 255 }).notNull(),
  degree: varchar("degree", { length: 100 }), // e.g., Bachelor's, Master's, PhD - from dataset
  fieldOfStudy: varchar("field_of_study", { length: 255 }), // e.g., Computer Science - from dataset
  startYear: integer("start_year"),
  endYear: integer("end_year"), // null if currently studying
  isCurrent: boolean("is_current").default(false),
  grade: varchar("grade", { length: 50 }), // e.g., First Class, 3.8 GPA
  activities: text("activities"), // Extracurricular activities, societies
  description: text("description"),
  location: varchar("location", { length: 255 }),
  country: varchar("country", { length: 10 }).default('IN'), // Country code from dataset
  isVerified: boolean("is_verified").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Works - Work experience (like LinkedIn)
export const userWorks = pgTable("user_works", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  company: varchar("company", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  employmentType: varchar("employment_type", { length: 50 }), // Full-time, Part-time, Contract, etc. - from dataset
  industry: varchar("industry", { length: 100 }), // Industry category - from dataset
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"), // null if current
  isCurrent: boolean("is_current").default(false),
  location: varchar("location", { length: 255 }),
  country: varchar("country", { length: 10 }).default('IN'),
  description: text("description"),
  skills: jsonb("skills").default([]), // Array of skills used in this role
  achievements: jsonb("achievements").default([]), // Key achievements
  isVerified: boolean("is_verified").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Socials - Social media profiles (like Linktree)
export const userSocials = pgTable("user_socials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform", { length: 50 }).notNull(), // e.g., linkedin, twitter, instagram - from dataset
  username: varchar("username", { length: 255 }), // Username on the platform
  profileUrl: varchar("profile_url", { length: 500 }).notNull(),
  isVerified: boolean("is_verified").default(false),
  isPublic: boolean("is_public").default(true),
  followerCount: integer("follower_count"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniquePlatformPerUser: unique().on(table.userId, table.platform),
}));

// User Interests - Hobbies and interests (like social profiles)
export const userInterests = pgTable("user_interests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: varchar("category", { length: 100 }).notNull(), // e.g., Sports, Music, Travel - from dataset
  interest: varchar("interest", { length: 255 }).notNull(), // Specific interest
  level: varchar("level", { length: 50 }), // Beginner, Intermediate, Expert
  yearsOfExperience: integer("years_of_experience"),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Needs - Marketplace needs
export const userNeeds = pgTable("user_needs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
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
  userId: varchar("user_id").notNull().references(() => users.id),
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

// Dynamic Modules — Engine-level CRUD Form Builder
export const dynamicModules = pgTable("dynamic_modules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default('draft'), // draft | active | archived
  fields: jsonb("fields").notNull().default([]),    // FieldDefinition[]
  settings: jsonb("settings").notNull().default({}), // ModuleSettings
  entryCount: integer("entry_count").notNull().default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dynamic Module Entries — submitted data per module
export const dynamicModuleEntries = pgTable("dynamic_module_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: uuid("module_id").notNull().references(() => dynamicModules.id, { onDelete: 'cascade' }),
  data: jsonb("data").notNull().default({}), // submitted field values keyed by field name
  status: varchar("status", { length: 20 }).notNull().default('new'), // new | read | replied
  submitterIp: varchar("submitter_ip", { length: 45 }),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
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
  
  // Soft delete support for trash/recovery system
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deleteReason: text("delete_reason"),
  
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
  
  // Soft delete support for trash/recovery system
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deleteReason: text("delete_reason"),
  
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Navigation Menus - For Engine Admin Panel
export const navigationMenus = pgTable("navigation_menus", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  route: varchar("route", { length: 500 }).notNull(),
  icon: varchar("icon", { length: 100 }),
  order: integer("order").notNull().default(0),
  scope: varchar("scope", { length: 50 }).notNull().default('engine'), // 'engine' or 'hub'
  parentId: uuid("parent_id"), // For nested menus
  pageId: uuid("page_id").references(() => pages.id), // Link to CMS page
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Apps
export const apps = pgTable("apps", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // AP0001
  tenantId: uuid("tenant_id").references(() => tenants.id),
  key: varchar("key", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).unique(), // URL-friendly identifier for routing
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  version: varchar("version", { length: 20 }).notNull(),
  manifest: jsonb("manifest").notNull(),
  icon: varchar("icon", { length: 500 }),
  categories: jsonb("categories").default([]),
  status: varchar("status", { length: 20 }).notNull().default('draft'),
  isPublic: boolean("is_public").default(false),
  pricing: jsonb("pricing").default({}),
  
  // App Classification & Auto-Assignment
  appType: varchar("app_type", { length: 20 }).default('premium'), // 'mandatory', 'premium', 'standard'
  isCoreApp: boolean("is_core_app").default(false), // Platform-level core apps (WytPass, WytWall)
  isAutoAssigned: boolean("is_auto_assigned").default(false), // Auto-assign to new users
  
  // Route & Context Support (like Modules)
  route: varchar("route", { length: 255 }), // App route/URL
  contexts: jsonb("contexts").default(['hub', 'app']), // Where app can be activated
  
  // Wizard: Visibility & Access Control
  visibilityMode: varchar("visibility_mode", { length: 50 }).default('engine_only'), // 'engine_only', 'wytnet_hub', 'all_hubs', 'selected_hubs', 'public'
  selectedHubs: jsonb("selected_hubs").default([]), // Hub IDs when visibility_mode = 'selected_hubs'
  accessPanels: jsonb("access_panels").default([]), // ['user_panel', 'org_panel']
  customRoutes: jsonb("custom_routes").default({}), // { hub_route: '/custom', user_panel_route: '/my-custom' }
  
  // Wizard: Features & Pricing
  features: jsonb("features").default([]), // [{ name: 'Feature 1', description: '...', enabled: true }]
  pricingModel: varchar("pricing_model", { length: 50 }).default('free'), // 'free', 'one_time', 'subscription', 'pay_per_use', 'custom'
  pricingDetails: jsonb("pricing_details").default({}), // Model-specific pricing data
  
  // Wizard: State Management
  wizardCompleted: boolean("wizard_completed").default(false),
  wizardStep: integer("wizard_step").default(1), // Current wizard step (1-6)
  
  // Version Control & History
  versionHistory: jsonb("version_history").default([]), // [{ version: '1.0.0', changes: '...', date: '...' }]
  changelog: text("changelog"), // Latest version changelog
  
  // Access Restrictions - Granular control (deprecated - use visibilityMode instead)
  restrictedTo: jsonb("restricted_to").default([]), // ['engine-only', 'hub-only', 'specific-tenant']
  
  // Soft delete support for trash/recovery system
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deleteReason: text("delete_reason"),
  
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

// Plan Tier Types - Standard tiers available for all apps
export const planTierEnum = pgEnum("plan_tier", [
  "free",        // Always free, no billing
  "per_use",     // Pay per use, no subscription
  "basic",       // Entry-level subscription
  "standard",    // Standard tier
  "pro",         // Professional tier  
  "plus",        // Enhanced tier
  "ultimate"     // Top tier
]);

// Billing Cycle Types
export const billingCycleEnum = pgEnum("billing_cycle", [
  "none",        // For Free tier
  "per_use",     // Pay per use
  "monthly",     // Monthly subscription
  "yearly",      // Annual subscription
  "custom"       // Custom billing period
]);

// App Pricing Plans - Dynamic pricing per app (fully configurable, no hardcoding)
export const appPricingPlans = pgTable("app_pricing_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // PP00001
  appId: uuid("app_id").notNull().references(() => apps.id, { onDelete: 'cascade' }),
  
  // Plan Tier & Billing Cycle (NEW: structured tier system)
  planTier: varchar("plan_tier", { length: 30 }).notNull().default('free'), // 'free', 'per_use', 'basic', 'standard', 'pro', 'plus', 'ultimate'
  billingCycle: varchar("billing_cycle", { length: 30 }).default('none'), // 'none', 'per_use', 'monthly', 'yearly', 'custom'
  
  // Plan Identification (display name, can be customized)
  planName: varchar("plan_name", { length: 100 }).notNull(), // 'Free', 'Starter', 'Pro', 'Enterprise', custom names
  planSlug: varchar("plan_slug", { length: 100 }).notNull(), // 'free', 'basic-monthly', 'pro-yearly'
  description: text("description"),
  
  // Pricing Type & Amount (legacy - keep for compatibility)
  planType: varchar("plan_type", { length: 30 }).notNull().default('free'), // 'free', 'monthly', 'yearly', 'one_time', 'pay_per_use'
  price: decimal("price", { precision: 10, scale: 2 }).default('0'), // e.g., 10.00, 100.00
  currency: varchar("currency", { length: 3 }).default('INR'),
  
  // Custom billing period (for custom billing cycle)
  customBillingDays: integer("custom_billing_days"), // e.g., 90 for quarterly
  
  // Usage Limits (for pay-per-use or tiered limits)
  usageLimit: integer("usage_limit"), // null = unlimited, e.g., 10 for "10 QR codes"
  usageUnit: varchar("usage_unit", { length: 50 }), // 'qr_codes', 'assessments', 'api_calls', etc.
  
  // Features included in this plan (legacy JSONB, kept for compatibility)
  features: jsonb("features").default([]), // [{ name: 'Branding', included: true }, { name: 'Analytics', included: false }]
  limits: jsonb("limits").default({}), // { maxUsers: 5, maxStorage: '1GB', etc. }
  
  // Plan Availability
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false), // Default plan for new users
  sortOrder: integer("sort_order").default(0),
  
  // Tier order for display (1=lowest, 7=highest)
  tierOrder: integer("tier_order").default(0),
  
  // Effective Dates (for time-limited pricing or promotions)
  effectiveFrom: timestamp("effective_from").defaultNow(),
  effectiveTo: timestamp("effective_to"), // null = no expiry
  
  // Audit
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  appIdx: index("app_pricing_plans_app_idx").on(table.appId),
  activeIdx: index("app_pricing_plans_active_idx").on(table.isActive),
  tierIdx: index("app_pricing_plans_tier_idx").on(table.planTier),
  uniqueAppPlan: unique("unique_app_plan_slug").on(table.appId, table.planSlug),
  uniqueAppTierCycle: unique("unique_app_tier_cycle").on(table.appId, table.planTier, table.billingCycle),
}));

// App Plan Features - Feature definitions that can be attached to plans
export const appPlanFeatures = pgTable("app_plan_features", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: uuid("app_id").notNull().references(() => apps.id, { onDelete: 'cascade' }),
  
  // Feature Definition
  featureName: varchar("feature_name", { length: 200 }).notNull(), // 'Unlimited QR Codes', 'Custom Branding'
  featureSlug: varchar("feature_slug", { length: 100 }).notNull(), // 'unlimited_qr', 'custom_branding'
  featureDescription: text("feature_description"),
  featureCategory: varchar("feature_category", { length: 100 }), // 'core', 'advanced', 'enterprise'
  
  // Feature Type
  featureType: varchar("feature_type", { length: 30 }).default('boolean'), // 'boolean', 'limit', 'text'
  
  // Sort order for display
  sortOrder: integer("sort_order").default(0),
  
  // Active/Inactive
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  appIdx: index("app_plan_features_app_idx").on(table.appId),
  uniqueAppFeature: unique("unique_app_feature_slug").on(table.appId, table.featureSlug),
}));

// Plan Feature Mapping - Links features to specific plans with values
export const planFeatureMapping = pgTable("plan_feature_mapping", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: uuid("plan_id").notNull().references(() => appPricingPlans.id, { onDelete: 'cascade' }),
  featureId: uuid("feature_id").notNull().references(() => appPlanFeatures.id, { onDelete: 'cascade' }),
  
  // Feature value for this plan
  isIncluded: boolean("is_included").default(false), // Is this feature included in the plan?
  limitValue: integer("limit_value"), // For 'limit' type features (e.g., 10 QR codes)
  textValue: varchar("text_value", { length: 255 }), // For 'text' type features (e.g., 'Basic Support')
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  planIdx: index("plan_feature_mapping_plan_idx").on(table.planId),
  featureIdx: index("plan_feature_mapping_feature_idx").on(table.featureId),
  uniquePlanFeature: unique("unique_plan_feature").on(table.planId, table.featureId),
}));

// App Pricing History - Audit trail for all price changes
export const appPricingHistory = pgTable("app_pricing_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: uuid("app_id").notNull().references(() => apps.id, { onDelete: 'cascade' }),
  planId: uuid("plan_id").references(() => appPricingPlans.id, { onDelete: 'set null' }),
  
  // Change Details
  changeType: varchar("change_type", { length: 30 }).notNull(), // 'created', 'price_updated', 'features_updated', 'deactivated', 'reactivated'
  previousPrice: decimal("previous_price", { precision: 10, scale: 2 }),
  newPrice: decimal("new_price", { precision: 10, scale: 2 }),
  previousData: jsonb("previous_data").default({}), // Full snapshot of previous state
  newData: jsonb("new_data").default({}), // Full snapshot of new state
  
  // Audit
  changedBy: varchar("changed_by").notNull().references(() => users.id),
  changeReason: text("change_reason"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
}, (table) => ({
  appIdx: index("app_pricing_history_app_idx").on(table.appId),
  planIdx: index("app_pricing_history_plan_idx").on(table.planId),
  changedAtIdx: index("app_pricing_history_date_idx").on(table.changedAt),
}));

// App Plan Subscriptions - Track user's active plan subscriptions per WytApp
export const appPlanSubscriptions = pgTable("app_plan_subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  appId: uuid("app_id").notNull().references(() => apps.id, { onDelete: 'cascade' }),
  planId: uuid("plan_id").notNull().references(() => appPricingPlans.id),
  
  // Subscription Status
  status: varchar("status", { length: 20 }).notNull().default('active'), // 'active', 'expired', 'cancelled', 'suspended'
  
  // Billing Cycle
  billingCycle: varchar("billing_cycle", { length: 20 }), // 'monthly', 'yearly', 'one_time', 'pay_per_use'
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"), // null for lifetime/pay-per-use
  
  // Usage Tracking (for pay-per-use plans)
  usageBalance: integer("usage_balance").default(0), // Remaining uses for pay-per-use
  totalUsed: integer("total_used").default(0), // Total usage count
  lastUsedAt: timestamp("last_used_at"),
  
  // Payment Info
  lastPaymentAt: timestamp("last_payment_at"),
  nextPaymentAt: timestamp("next_payment_at"),
  
  // Auto-assignment tracking
  isAutoAssigned: boolean("is_auto_assigned").default(false), // Was this auto-assigned on registration?
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("app_plan_subs_user_idx").on(table.userId),
  appIdx: index("app_plan_subs_app_idx").on(table.appId),
  statusIdx: index("app_plan_subs_status_idx").on(table.status),
  uniqueUserAppPlanSub: unique("unique_user_app_plan_subscription").on(table.userId, table.appId),
}));

// App Usage Logs - Audit trail for all app usage (pay-per-use tracking)
export const appUsageLogs = pgTable("app_usage_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  appId: uuid("app_id").notNull().references(() => apps.id),
  subscriptionId: uuid("subscription_id").references(() => appPlanSubscriptions.id),
  
  // Usage Details
  action: varchar("action", { length: 100 }).notNull(), // 'qr_generate', 'assessment_submit', 'api_call'
  pointsDeducted: integer("points_deducted").default(0),
  status: varchar("status", { length: 20 }).notNull(), // 'success', 'failed', 'insufficient_funds'
  
  // Context
  metadata: jsonb("metadata").default({}), // { qrType: 'url', content: '...', etc. }
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("app_usage_logs_user_idx").on(table.userId),
  appIdx: index("app_usage_logs_app_idx").on(table.appId),
  actionIdx: index("app_usage_logs_action_idx").on(table.action),
  statusIdx: index("app_usage_logs_status_idx").on(table.status),
  createdAtIdx: index("app_usage_logs_created_at_idx").on(table.createdAt),
}));

// Hubs
export const hubs = pgTable("hubs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // HB001
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(),
  config: jsonb("config").notNull(),
  aggregationRules: jsonb("aggregation_rules").default([]),
  moderationSettings: jsonb("moderation_settings").default({}),
  revenueModel: jsonb("revenue_model").default({}),
  status: varchar("status", { length: 20 }).notNull().default('draft'),
  
  // Soft delete support for trash/recovery system
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deleteReason: text("delete_reason"),
  
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_hubs_display_id").on(table.displayId),
  index("idx_hubs_deleted_at").on(table.deletedAt),
]);

// Hub Templates - Pre-built configurations for creating new hubs
export const hubTemplates = pgTable("hub_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // HT00001
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull().default('general'), // 'general', 'community', 'marketplace', 'directory', 'learning', 'event'
  
  // Template Content
  thumbnail: varchar("thumbnail", { length: 500 }), // Preview image URL
  previewImages: jsonb("preview_images").default([]), // Multiple preview screenshots
  
  // Default Configurations
  defaultModules: jsonb("default_modules").default([]), // ['wytpass-auth', 'wytwall', 'notifications'] - Module IDs to auto-activate
  defaultTheme: jsonb("default_theme").default({}), // { primaryColor: '#...', favicon: '...', etc. }
  defaultSettings: jsonb("default_settings").default({}), // Hub-specific settings
  defaultPages: jsonb("default_pages").default([]), // Pre-built pages like ['home', 'about', 'contact']
  
  // Feature Flags
  features: jsonb("features").default([]), // ['user-profiles', 'posts', 'marketplace', 'events']
  
  // Access Control
  isPublic: boolean("is_public").default(true), // Show in public template gallery
  requiresWytDev: boolean("requires_wyt_dev").default(true), // Requires WytDev app to use
  allowedPlans: jsonb("allowed_plans").default(['free', 'pro', 'enterprise']), // Which subscription plans can use
  
  // Metadata
  usageCount: integer("usage_count").default(0), // How many hubs created from this template
  rating: decimal("rating", { precision: 2, scale: 1 }).default('0.0'),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  // Audit
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_hub_templates_slug").on(table.slug),
  index("idx_hub_templates_category").on(table.category),
  index("idx_hub_templates_is_active").on(table.isActive),
  index("idx_hub_templates_sort_order").on(table.sortOrder),
]);

// WytSite - User Created Websites
export const userSites = pgTable("user_sites", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // WS00001
  userId: varchar("user_id").notNull().references(() => users.id),
  templateId: uuid("template_id").references(() => hubTemplates.id),
  
  // Site Identity
  name: varchar("name", { length: 255 }).notNull(),
  subdomain: varchar("subdomain", { length: 100 }).notNull().unique(), // subdomain.wytsite.com
  customDomain: varchar("custom_domain", { length: 255 }).unique(), // user's custom domain
  
  // Site Settings
  settings: jsonb("settings").default({}), // { favicon, logo, colors, fonts, analytics }
  theme: jsonb("theme").default({}), // { primaryColor, secondaryColor, fontFamily, etc. }
  seoSettings: jsonb("seo_settings").default({}), // { title, description, keywords, ogImage }
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default('draft'), // draft, published, suspended
  publishedAt: timestamp("published_at"),
  
  // Analytics
  viewCount: integer("view_count").default(0),
  
  // Soft delete
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deleteReason: text("delete_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_user_sites_user_id").on(table.userId),
  index("idx_user_sites_subdomain").on(table.subdomain),
  index("idx_user_sites_status").on(table.status),
  index("idx_user_sites_deleted_at").on(table.deletedAt),
]);

// WytSite Pages - Individual pages within user sites
export const sitePages = pgTable("site_pages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: uuid("site_id").notNull().references(() => userSites.id, { onDelete: 'cascade' }),
  
  // Page Identity
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(), // 'about', 'contact', 'services'
  path: varchar("path", { length: 500 }).notNull(), // '/about', '/services/web-design'
  
  // Page Content (JSONB for block-based editing)
  content: jsonb("content").notNull().default([]), // Array of blocks: [{ type: 'hero', data: {...} }, ...]
  
  // Page Settings
  isHomePage: boolean("is_home_page").default(false),
  showInNav: boolean("show_in_nav").default(true),
  navOrder: integer("nav_order").default(0),
  
  // SEO
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default('draft'), // draft, published
  publishedAt: timestamp("published_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_site_pages_site_id").on(table.siteId),
  index("idx_site_pages_slug").on(table.slug),
  index("idx_site_pages_status").on(table.status),
  unique("unique_site_page_slug").on(table.siteId, table.slug),
]);

// Platform Modules - Context-Aware Plugins (like WordPress plugins)
// Modules are small, focused plugins that can be activated in different contexts
export const platformModules = pgTable("platform_modules", {
  id: varchar("id").primaryKey(), // 'razorpay-payment', 'calendar', 'wytpass-auth', etc.
  displayId: varchar("display_id", { length: 20 }).unique(), // MD0001
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull().default('platform'),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default('enabled'),
  
  // Context Support - Where can this module be activated?
  contexts: jsonb("contexts").notNull().default(['platform', 'hub', 'app', 'game']), // ['platform', 'hub', 'app', 'game']
  
  // Dependencies - Required modules that must be enabled first
  dependencies: jsonb("dependencies").default([]), // ['payment-core', 'user-auth']
  
  // API Endpoints - Exposed APIs when module is activated
  apiEndpoints: jsonb("api_endpoints").default([]), // [{ method: 'POST', path: '/api/razorpay/create-order', auth: true }]
  
  // Module Settings Schema
  settings: jsonb("settings").default({}), // { apiKeyRequired: true, webhookUrl: string }
  
  // Compatibility Matrix
  compatibilityMatrix: jsonb("compatibility_matrix").default({}), // { minVersion: '1.0.0', conflicts: ['stripe-payment'] }
  
  // Pricing & Monetization
  pricing: varchar("pricing", { length: 20 }).notNull().default('free'),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default('INR'),
  
  // UI & Display
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 50 }).default('blue'),
  route: varchar("route", { length: 255 }),
  
  // Version Control & History
  version: varchar("version", { length: 20 }).notNull().default('1.0.0'),
  versionHistory: jsonb("version_history").default([]), // [{ version: '1.0.0', changes: '...', date: '...' }]
  changelog: text("changelog"), // Latest version changelog
  
  // Access Restrictions - Granular control beyond contexts
  restrictedTo: jsonb("restricted_to").default([]), // ['engine-only', 'hub-only', 'app-only', 'game-only']
  
  // Legacy fields (kept for backward compatibility)
  features: jsonb("features").default([]),
  metadata: jsonb("metadata").default({}),
  usage: integer("usage").default(0),
  installs: integer("installs").default(0),
  creator: varchar("creator", { length: 255 }),
  order: integer("order").default(0),
  
  // Soft delete support for trash/recovery system
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deleteReason: text("delete_reason"),
  
  tenantId: uuid("tenant_id").references(() => tenants.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Module Activation Tables - Track where modules are activated

// Platform-level module activations (Global super admin control)
export const platformModuleActivations = pgTable("platform_module_activations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id", { length: 255 }).notNull().references(() => platformModules.id),
  context: varchar("context", { length: 20 }).notNull().default('platform'), // 'platform', 'hub', 'app', 'game'
  isActive: boolean("is_active").notNull().default(true),
  settings: jsonb("settings").default({}), // Module-specific configuration
  activatedBy: varchar("activated_by").references(() => users.id),
  activatedAt: timestamp("activated_at").defaultNow().notNull(),
  deactivatedAt: timestamp("deactivated_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  moduleContextIdx: index("platform_module_context_idx").on(table.moduleId, table.context),
  uniqueModuleContext: unique("unique_platform_module_context").on(table.moduleId, table.context),
}));

// Hub-level module activations (Hub-specific plugins)
export const hubModuleActivations = pgTable("hub_module_activations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hubId: uuid("hub_id").notNull().references(() => hubs.id, { onDelete: 'cascade' }),
  moduleId: varchar("module_id", { length: 255 }).notNull().references(() => platformModules.id),
  isActive: boolean("is_active").notNull().default(true),
  settings: jsonb("settings").default({}),
  activatedBy: varchar("activated_by").references(() => users.id),
  activatedAt: timestamp("activated_at").defaultNow().notNull(),
  deactivatedAt: timestamp("deactivated_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  hubModuleIdx: index("hub_module_idx").on(table.hubId, table.moduleId),
  uniqueHubModule: unique("unique_hub_module").on(table.hubId, table.moduleId),
}));

// App-level module activations (App-specific plugins)
export const appModuleActivations = pgTable("app_module_activations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: uuid("app_id").notNull().references(() => apps.id, { onDelete: 'cascade' }),
  moduleId: varchar("module_id", { length: 255 }).notNull().references(() => platformModules.id),
  isActive: boolean("is_active").notNull().default(true),
  settings: jsonb("settings").default({}),
  activatedBy: varchar("activated_by").references(() => users.id),
  activatedAt: timestamp("activated_at").defaultNow().notNull(),
  deactivatedAt: timestamp("deactivated_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  appModuleIdx: index("app_module_idx").on(table.appId, table.moduleId),
  uniqueAppModule: unique("unique_app_module").on(table.appId, table.moduleId),
}));

// Module Edit History - Track all title/description/route/category changes for modules
export const moduleEditHistory = pgTable("module_edit_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id", { length: 255 }).notNull().references(() => platformModules.id, { onDelete: 'cascade' }),
  field: varchar("field", { length: 50 }).notNull(), // 'name', 'description', 'route', 'category', 'contexts', 'restrictedTo'
  oldValue: text("old_value"),
  newValue: text("new_value"),
  editedBy: varchar("edited_by").notNull().references(() => users.id),
  editedAt: timestamp("edited_at").defaultNow().notNull(),
}, (table) => ({
  moduleFieldIdx: index("module_edit_field_idx").on(table.moduleId, table.field),
}));

// App Edit History - Track all title/description/route/category changes for apps
export const appEditHistory = pgTable("app_edit_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: uuid("app_id").notNull().references(() => apps.id, { onDelete: 'cascade' }),
  field: varchar("field", { length: 50 }).notNull(), // 'name', 'description', 'route', 'categories', 'contexts', 'restrictedTo'
  oldValue: text("old_value"),
  newValue: text("new_value"),
  editedBy: varchar("edited_by").notNull().references(() => users.id),
  editedAt: timestamp("edited_at").defaultNow().notNull(),
}, (table) => ({
  appFieldIdx: index("app_edit_field_idx").on(table.appId, table.field),
}));

// Geo-Regulatory Control Tables - Multi-country compliance and data sovereignty

// Geo-Regulatory Rules - Define country/state-specific rules and restrictions
export const geoRegulatoryRules = pgTable("geo_regulatory_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Multi-tenant Scoping - At least one must be set
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: 'cascade' }), // Tenant-specific rule
  hubId: uuid("hub_id").references(() => hubs.id, { onDelete: 'cascade' }), // Hub-specific rule
  appId: uuid("app_id").references(() => apps.id, { onDelete: 'cascade' }), // App-specific rule
  // null for all = platform-wide default rule
  
  // Geographic Scope
  countryCode: varchar("country_code", { length: 2 }).notNull(), // ISO 3166-1 alpha-2 (IN, US, GB, etc.)
  stateCode: varchar("state_code", { length: 10 }), // Optional state/province code (TN, CA, etc.)
  regionName: varchar("region_name", { length: 255 }).notNull(), // Display name (India, Tamil Nadu, etc.)
  
  // Compliance Framework
  complianceTemplate: varchar("compliance_template", { length: 50 }), // 'GDPR', 'CCPA', 'PDPA', 'IT_ACT_2000', 'custom'
  complianceLevel: varchar("compliance_level", { length: 20 }).notNull().default('basic'), // 'basic', 'detailed', 'strict'
  legalBasis: text("legal_basis"), // Legal reference/justification for this rule
  
  // Lifecycle Management
  effectiveDate: timestamp("effective_date").notNull().defaultNow(), // When rule becomes active
  expiryDate: timestamp("expiry_date"), // null = permanent, or specific end date
  
  // Module & Feature Restrictions
  restrictedModules: jsonb("restricted_modules").default([]), // ['module-id-1', 'module-id-2'] - modules not allowed
  restrictedFeatures: jsonb("restricted_features").default([]), // ['ai-chat', 'payments', 'exports'] - features blocked
  allowedModules: jsonb("allowed_modules").default([]), // If set, ONLY these modules allowed (whitelist mode)
  
  // Content Moderation
  contentFilters: jsonb("content_filters").default({}), // { keywords: ['word1', 'word2'], categories: ['adult'] }
  ageRestrictions: jsonb("age_restrictions").default({}), // { minimumAge: 18, requireVerification: true }
  
  // Data Handling Rules
  dataResidency: boolean("data_residency").default(false), // Must store data in local region
  dataExportAllowed: boolean("data_export_allowed").default(true), // Can export data outside region
  dataRetentionDays: integer("data_retention_days"), // null = unlimited, or specific days
  
  // Government Access
  governmentMonitoringEnabled: boolean("government_monitoring_enabled").default(false),
  governmentAccessLevel: varchar("government_access_level", { length: 20 }), // 'none', 'read_only', 'analytics_only'
  governmentContactEmail: varchar("government_contact_email", { length: 255 }),
  governmentConsentCaptured: boolean("government_consent_captured").default(false), // User consent for monitoring
  
  // Rule Status & Metadata
  isActive: boolean("is_active").notNull().default(true),
  enforcementLevel: varchar("enforcement_level", { length: 20 }).notNull().default('warn'), // 'block', 'warn', 'log'
  notes: text("notes"), // Internal notes about this rule
  
  createdBy: varchar("created_by").references(() => users.id),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  countryIdx: index("geo_rule_country_idx").on(table.countryCode),
  stateIdx: index("geo_rule_state_idx").on(table.countryCode, table.stateCode),
  tenantIdx: index("geo_rule_tenant_idx").on(table.tenantId),
  hubIdx: index("geo_rule_hub_idx").on(table.hubId),
  appIdx: index("geo_rule_app_idx").on(table.appId),
  activeIdx: index("geo_rule_active_idx").on(table.isActive, table.effectiveDate, table.expiryDate),
}));

// Geo-Compliance Logs - Audit trail for regulatory compliance and government access
export const geoComplianceLogs = pgTable("geo_compliance_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: uuid("rule_id").references(() => geoRegulatoryRules.id, { onDelete: 'set null' }),
  
  // Event Details
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'access_blocked', 'module_restricted', 'content_filtered', 'data_export', 'government_access'
  severity: varchar("severity", { length: 20 }).notNull().default('info'), // 'info', 'warning', 'critical'
  
  // Geographic Context
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  stateCode: varchar("state_code", { length: 10 }),
  
  // Multi-tenant Context
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: 'set null' }),
  hubId: uuid("hub_id").references(() => hubs.id, { onDelete: 'set null' }),
  appId: uuid("app_id").references(() => apps.id, { onDelete: 'set null' }),
  
  // User & Resource Context
  userId: varchar("user_id").references(() => users.id, { onDelete: 'set null' }),
  resourceType: varchar("resource_type", { length: 50 }), // 'module', 'feature', 'content', 'data'
  resourceId: varchar("resource_id", { length: 255 }),
  
  // Request Context - Critical for audit trail
  requestId: varchar("request_id", { length: 100 }), // Unique request identifier for tracing
  sessionId: varchar("session_id", { length: 255 }), // User session ID
  
  // Action & Result
  action: varchar("action", { length: 100 }).notNull(), // 'access_attempt', 'module_load', 'data_export_request'
  result: varchar("result", { length: 50 }).notNull(), // 'allowed', 'blocked', 'warned', 'filtered'
  
  // Network & Client Context
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4 or IPv6
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").default({}), // Additional event-specific data
  
  // Government Access Tracking
  governmentAccess: boolean("government_access").default(false),
  governmentOfficer: varchar("government_officer", { length: 255 }), // If government accessed
  accessReason: text("access_reason"), // Legal/warrant reason for access
  warrantNumber: varchar("warrant_number", { length: 100 }), // Legal warrant reference
  
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  eventTypeIdx: index("geo_log_event_type_idx").on(table.eventType),
  timestampIdx: index("geo_log_timestamp_idx").on(table.timestamp),
  userIdx: index("geo_log_user_idx").on(table.userId),
  tenantIdx: index("geo_log_tenant_idx").on(table.tenantId),
  hubIdx: index("geo_log_hub_idx").on(table.hubId),
  appIdx: index("geo_log_app_idx").on(table.appId),
  governmentIdx: index("geo_log_government_idx").on(table.governmentAccess),
  requestIdx: index("geo_log_request_idx").on(table.requestId),
}));

// =============================================================================
// WYTENTITIES - Meta-Entity Layer for Knowledge Graph & Tag Prevention
// =============================================================================

// Entity Types - Defines categories of entities (User, Location, Business, etc.)
export const entityTypes = pgTable("entity_types", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(), // 'User', 'Location', 'Business'
  slug: varchar("slug", { length: 100 }).notNull().unique(), // 'user', 'location', 'business'
  description: text("description"),
  icon: varchar("icon", { length: 50 }), // Lucide icon name
  color: varchar("color", { length: 20 }), // UI color theme
  
  // Schema Definition
  schema: jsonb("schema").default({}), // JSON schema for entity fields
  requiredFields: jsonb("required_fields").default([]), // ['title', 'description']
  
  // Behavior & Settings
  allowsChildren: boolean("allows_children").default(true),
  allowsFriends: boolean("allows_friends").default(true),
  maxAliases: integer("max_aliases").default(10),
  
  // Meta
  isActive: boolean("is_active").default(true),
  isSystem: boolean("is_system").default(false), // System types can't be deleted
  displayOrder: integer("display_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("entity_type_slug_idx").on(table.slug),
  activeIdx: index("entity_type_active_idx").on(table.isActive),
}));

// Entities - Main entity data (the "Objects" from original concept)
export const entities = pgTable("entities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // EN00001
  
  // Core Identity
  title: varchar("title", { length: 255 }).notNull(), // Primary name
  aliases: jsonb("aliases").default([]), // Alternative names/spellings
  slug: varchar("slug", { length: 255 }).notNull(),
  
  // Type & Classification
  entityTypeId: uuid("entity_type_id").notNull().references(() => entityTypes.id, { onDelete: 'restrict' }),
  
  // Content
  shortDescription: text("short_description"),
  description: text("description"),
  metadata: jsonb("metadata").default({}), // Type-specific fields
  
  // Media
  imageUrl: varchar("image_url", { length: 500 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  
  // SEO & Discovery
  keywords: jsonb("keywords").default([]), // Search keywords
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  
  // Multi-tenant Context (optional)
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: 'set null' }),
  hubId: uuid("hub_id").references(() => hubs.id, { onDelete: 'set null' }),
  
  // Visibility & Access
  isPublic: boolean("is_public").default(true),
  isVerified: boolean("is_verified").default(false), // Admin verified
  isActive: boolean("is_active").default(true),
  
  // Statistics
  tagCount: integer("tag_count").default(0), // How many times tagged
  viewCount: integer("view_count").default(0),
  
  // Audit
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }),
  updatedBy: varchar("updated_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("entity_type_idx").on(table.entityTypeId),
  slugIdx: index("entity_slug_idx").on(table.slug),
  titleIdx: index("entity_title_idx").on(table.title),
  tenantIdx: index("entity_tenant_idx").on(table.tenantId),
  hubIdx: index("entity_hub_idx").on(table.hubId),
  activeIdx: index("entity_active_idx").on(table.isActive),
  publicIdx: index("entity_public_idx").on(table.isPublic),
  verifiedIdx: index("entity_verified_idx").on(table.isVerified),
  tagCountIdx: index("entity_tag_count_idx").on(table.tagCount),
  uniqueTypeSlug: unique("entity_unique_type_slug").on(table.entityTypeId, table.slug),
}));

// Entity Relationships - Parent/Child/Friend connections
export const entityRelationships = pgTable("entity_relationships", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Source & Target
  sourceEntityId: uuid("source_entity_id").notNull().references(() => entities.id, { onDelete: 'cascade' }),
  targetEntityId: uuid("target_entity_id").notNull().references(() => entities.id, { onDelete: 'cascade' }),
  
  // Relationship Type
  relationshipType: varchar("relationship_type", { length: 50 }).notNull(), // 'parent', 'child', 'friend', 'related', 'synonym'
  
  // Bidirectional Support
  isBidirectional: boolean("is_bidirectional").default(false), // For 'friend' relationships
  
  // Context & Metadata
  context: varchar("context", { length: 100 }), // Why this relationship exists
  metadata: jsonb("metadata").default({}), // Additional relationship data
  strength: integer("strength").default(1), // Relationship weight (1-10)
  
  // Visibility
  isActive: boolean("is_active").default(true),
  
  // Audit
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  sourceIdx: index("entity_rel_source_idx").on(table.sourceEntityId),
  targetIdx: index("entity_rel_target_idx").on(table.targetEntityId),
  typeIdx: index("entity_rel_type_idx").on(table.relationshipType),
  activeIdx: index("entity_rel_active_idx").on(table.isActive),
  uniqueRelationship: unique("entity_unique_relationship").on(table.sourceEntityId, table.targetEntityId, table.relationshipType),
}));

// Entity Tags - Tracks which modules/resources tag entities
export const entityTags = pgTable("entity_tags", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Entity Being Tagged
  entityId: uuid("entity_id").notNull().references(() => entities.id, { onDelete: 'cascade' }),
  
  // Resource That Uses This Entity
  resourceType: varchar("resource_type", { length: 50 }).notNull(), // 'module', 'app', 'content', 'job', 'event'
  resourceId: varchar("resource_id", { length: 255 }).notNull(),
  
  // Context
  tagContext: varchar("tag_context", { length: 100 }), // 'location', 'industry', 'skill', 'category'
  
  // Multi-tenant Context
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: 'set null' }),
  hubId: uuid("hub_id").references(() => hubs.id, { onDelete: 'set null' }),
  appId: uuid("app_id").references(() => apps.id, { onDelete: 'set null' }),
  
  // Metadata
  metadata: jsonb("metadata").default({}),
  
  // Audit
  taggedBy: varchar("tagged_by").references(() => users.id, { onDelete: 'set null' }),
  taggedAt: timestamp("tagged_at").defaultNow().notNull(),
}, (table) => ({
  entityIdx: index("entity_tag_entity_idx").on(table.entityId),
  resourceIdx: index("entity_tag_resource_idx").on(table.resourceType, table.resourceId),
  tenantIdx: index("entity_tag_tenant_idx").on(table.tenantId),
  hubIdx: index("entity_tag_hub_idx").on(table.hubId),
  appIdx: index("entity_tag_app_idx").on(table.appId),
  contextIdx: index("entity_tag_context_idx").on(table.tagContext),
  uniqueTag: unique("entity_unique_tag").on(table.entityId, table.resourceType, table.resourceId),
}));

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
  userId: varchar("user_id").references(() => users.id),
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
  userId: varchar("user_id").references(() => users.id),
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
  userId: varchar("user_id").references(() => users.id),
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
  displayId: varchar("display_id", { length: 20 }).unique(), // ME00001
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  metadata: jsonb("metadata").default({}),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_media_display_id").on(table.displayId),
]);

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

// WytAI Usage Tracking
export const wytaiUsage = pgTable("wytai_usage", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  model: varchar("model", { length: 100 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  promptTokens: integer("prompt_tokens").notNull().default(0),
  completionTokens: integer("completion_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  requestData: jsonb("request_data").default({}),
  responseData: jsonb("response_data").default({}),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_wytai_usage_user_id").on(table.userId),
  index("idx_wytai_usage_created_at").on(table.createdAt),
  index("idx_wytai_usage_provider").on(table.provider),
]);

// WytAI Chat Conversations - Enum defined first
export const wytaiMessageRoleEnum = pgEnum('wytai_message_role', ['user', 'assistant']);

export const wytaiConversations = pgTable("wytai_conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // CN0000001
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull().default('New Conversation'),
  model: varchar("model", { length: 100 }).notNull().default('gpt-4o'),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_wytai_conversations_display_id").on(table.displayId),
  index("idx_wytai_conversations_user_id").on(table.userId),
  index("idx_wytai_conversations_created_at").on(table.createdAt),
]);

// WytAI Chat Messages
export const wytaiMessages = pgTable("wytai_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id").notNull().references(() => wytaiConversations.id, { onDelete: 'cascade' }),
  role: wytaiMessageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  attachments: jsonb("attachments").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_wytai_messages_conversation_id").on(table.conversationId),
  index("idx_wytai_messages_created_at").on(table.createdAt),
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
  displayId: varchar("display_id", { length: 20 }).unique(), // WI00001
  type: wytidEntityTypeEnum("type").notNull(),
  identifier: varchar("identifier", { length: 100 }).notNull().unique(),
  meta: jsonb("meta").notNull().default({}),
  ownerUserId: varchar("owner_user_id").notNull().references(() => users.id),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_wytid_entities_display_id").on(table.displayId),
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

// Schema types
export type Tenant = typeof tenants.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Model = typeof models.$inferSelect;
export type DynamicModule = typeof dynamicModules.$inferSelect;
export type DynamicModuleEntry = typeof dynamicModuleEntries.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Block = typeof blocks.$inferSelect;
export type App = typeof apps.$inferSelect;
export type AppInstall = typeof appInstalls.$inferSelect;
export type Hub = typeof hubs.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Media = typeof media.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type WytaiUsage = typeof wytaiUsage.$inferSelect;
export type WytaiConversation = typeof wytaiConversations.$inferSelect;
export type WytaiMessage = typeof wytaiMessages.$inferSelect;
export type SeoSetting = typeof seoSettings.$inferSelect;

// Insert schemas
export const insertTenantSchema = createInsertSchema(tenants);
export const insertUserSchema = createInsertSchema(users);
export const insertMembershipSchema = createInsertSchema(memberships);
export const insertModelSchema = createInsertSchema(models);
export const insertDynamicModuleSchema = createInsertSchema(dynamicModules).omit({ id: true, createdAt: true, updatedAt: true, entryCount: true });
export const insertDynamicModuleEntrySchema = createInsertSchema(dynamicModuleEntries).omit({ id: true, submittedAt: true });
export type InsertDynamicModule = z.infer<typeof insertDynamicModuleSchema>;
export type InsertDynamicModuleEntry = z.infer<typeof insertDynamicModuleEntrySchema>;
export const insertPageSchema = createInsertSchema(pages);
export const insertBlockSchema = createInsertSchema(blocks);
export const insertNavigationMenuSchema = createInsertSchema(navigationMenus).omit({ id: true, createdAt: true, updatedAt: true });
export const selectNavigationMenuSchema = navigationMenus;
export type InsertNavigationMenu = z.infer<typeof insertNavigationMenuSchema>;
export type SelectNavigationMenu = typeof navigationMenus.$inferSelect;
export const insertAppSchema = createInsertSchema(apps);
export const insertAppInstallSchema = createInsertSchema(appInstalls);

// App Pricing Plans schemas
export const insertAppPricingPlanSchema = createInsertSchema(appPricingPlans).omit({ id: true, displayId: true, createdAt: true, updatedAt: true });
export const selectAppPricingPlanSchema = createSelectSchema(appPricingPlans);
export type AppPricingPlan = typeof appPricingPlans.$inferSelect;
export type InsertAppPricingPlan = z.infer<typeof insertAppPricingPlanSchema>;

// App Plan Features schemas
export const insertAppPlanFeatureSchema = createInsertSchema(appPlanFeatures).omit({ id: true, createdAt: true, updatedAt: true });
export const selectAppPlanFeatureSchema = createSelectSchema(appPlanFeatures);
export type AppPlanFeature = typeof appPlanFeatures.$inferSelect;
export type InsertAppPlanFeature = z.infer<typeof insertAppPlanFeatureSchema>;

// Plan Feature Mapping schemas
export const insertPlanFeatureMappingSchema = createInsertSchema(planFeatureMapping).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPlanFeatureMappingSchema = createSelectSchema(planFeatureMapping);
export type PlanFeatureMapping = typeof planFeatureMapping.$inferSelect;
export type InsertPlanFeatureMapping = z.infer<typeof insertPlanFeatureMappingSchema>;

// Plan Tier Constants (for UI and seeding)
export const PLAN_TIERS = [
  { key: 'free', name: 'Free', order: 1, hasBillingCycle: false },
  { key: 'per_use', name: 'Per Use', order: 2, hasBillingCycle: false },
  { key: 'basic', name: 'Basic', order: 3, hasBillingCycle: true },
  { key: 'standard', name: 'Standard', order: 4, hasBillingCycle: true },
  { key: 'pro', name: 'Pro', order: 5, hasBillingCycle: true },
  { key: 'plus', name: 'Plus', order: 6, hasBillingCycle: true },
  { key: 'ultimate', name: 'Ultimate', order: 7, hasBillingCycle: true },
] as const;

export const BILLING_CYCLES = [
  { key: 'none', name: 'N/A', forTiers: ['free'] },
  { key: 'per_use', name: 'Pay Per Use', forTiers: ['per_use'] },
  { key: 'monthly', name: 'Monthly', forTiers: ['basic', 'standard', 'pro', 'plus', 'ultimate'] },
  { key: 'yearly', name: 'Yearly', forTiers: ['basic', 'standard', 'pro', 'plus', 'ultimate'] },
  { key: 'custom', name: 'Custom', forTiers: ['basic', 'standard', 'pro', 'plus', 'ultimate'] },
] as const;

// App Pricing History schemas
export const insertAppPricingHistorySchema = createInsertSchema(appPricingHistory).omit({ id: true, changedAt: true });
export const selectAppPricingHistorySchema = createSelectSchema(appPricingHistory);
export type AppPricingHistoryRecord = typeof appPricingHistory.$inferSelect;
export type InsertAppPricingHistory = z.infer<typeof insertAppPricingHistorySchema>;

// App Plan Subscriptions schemas
export const insertAppPlanSubscriptionSchema = createInsertSchema(appPlanSubscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const selectAppPlanSubscriptionSchema = createSelectSchema(appPlanSubscriptions);
export type AppPlanSubscription = typeof appPlanSubscriptions.$inferSelect;
export type InsertAppPlanSubscription = z.infer<typeof insertAppPlanSubscriptionSchema>;

// App Usage Logs schemas
export const insertAppUsageLogSchema = createInsertSchema(appUsageLogs).omit({ id: true, createdAt: true });
export const selectAppUsageLogSchema = createSelectSchema(appUsageLogs);
export type AppUsageLog = typeof appUsageLogs.$inferSelect;
export type InsertAppUsageLog = z.infer<typeof insertAppUsageLogSchema>;

export const insertHubSchema = createInsertSchema(hubs);
export const insertHubTemplateSchema = createInsertSchema(hubTemplates).omit({ id: true, displayId: true, createdAt: true, updatedAt: true });
export const selectHubTemplateSchema = createSelectSchema(hubTemplates);
export type HubTemplate = typeof hubTemplates.$inferSelect;
export type InsertHubTemplate = z.infer<typeof insertHubTemplateSchema>;

// WytSite - User Sites schemas
export const insertUserSiteSchema = createInsertSchema(userSites).omit({ id: true, displayId: true, createdAt: true, updatedAt: true, viewCount: true, publishedAt: true, deletedAt: true, deletedBy: true, deleteReason: true });
export const selectUserSiteSchema = createSelectSchema(userSites);
export type UserSite = typeof userSites.$inferSelect;
export type InsertUserSite = z.infer<typeof insertUserSiteSchema>;

// WytSite - Site Pages schemas
export const insertSitePageSchema = createInsertSchema(sitePages).omit({ id: true, createdAt: true, updatedAt: true, publishedAt: true });
export const selectSitePageSchema = createSelectSchema(sitePages);
export type SitePage = typeof sitePages.$inferSelect;
export type InsertSitePage = z.infer<typeof insertSitePageSchema>;

export const insertPlanSchema = createInsertSchema(plans);

// Payment schemas
export const insertOrderSchema = createInsertSchema(orders);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);

export const insertMediaSchema = createInsertSchema(media);
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const insertWytaiUsageSchema = createInsertSchema(wytaiUsage);
export const insertWytaiConversationSchema = createInsertSchema(wytaiConversations).omit({ id: true, displayId: true, userId: true, createdAt: true, updatedAt: true });
export const insertWytaiMessageSchema = createInsertSchema(wytaiMessages).omit({ id: true, conversationId: true, createdAt: true });
export const insertSeoSettingSchema = createInsertSchema(seoSettings);

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

// Wish List schemas (renamed from Bucket List)
export const insertWishListSchema = createInsertSchema(wishList).omit({ id: true, createdAt: true, updatedAt: true }).extend({
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
export const selectWishListSchema = createSelectSchema(wishList);
export type WishListItem = typeof wishList.$inferSelect;
export type InsertWishListItem = z.infer<typeof insertWishListSchema>;

// User Education schemas
export const insertUserEducationSchema = createInsertSchema(userEducation).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  institution: z.string().min(1, "Institution name is required").max(255),
  startYear: z.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
  endYear: z.number().int().min(1900).max(new Date().getFullYear() + 10).optional().nullable(),
});
export const selectUserEducationSchema = createSelectSchema(userEducation);
export type UserEducationItem = typeof userEducation.$inferSelect;
export type InsertUserEducationItem = z.infer<typeof insertUserEducationSchema>;

// User Works schemas
export const insertUserWorksSchema = createInsertSchema(userWorks).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  company: z.string().min(1, "Company name is required").max(255),
  role: z.string().min(1, "Role is required").max(255),
});
export const selectUserWorksSchema = createSelectSchema(userWorks);
export type UserWorksItem = typeof userWorks.$inferSelect;
export type InsertUserWorksItem = z.infer<typeof insertUserWorksSchema>;

// User Socials schemas
export const insertUserSocialsSchema = createInsertSchema(userSocials).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  platform: z.string().min(1, "Platform is required"),
  profileUrl: z.string().url("Please enter a valid URL"),
});
export const selectUserSocialsSchema = createSelectSchema(userSocials);
export type UserSocialsItem = typeof userSocials.$inferSelect;
export type InsertUserSocialsItem = z.infer<typeof insertUserSocialsSchema>;

// User Interests schemas
export const insertUserInterestsSchema = createInsertSchema(userInterests).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  category: z.string().min(1, "Category is required"),
  interest: z.string().min(1, "Interest is required"),
});
export const selectUserInterestsSchema = createSelectSchema(userInterests);
export type UserInterestsItem = typeof userInterests.$inferSelect;
export type InsertUserInterestsItem = z.infer<typeof insertUserInterestsSchema>;

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
export const selectWytaiUsageSchema = createSelectSchema(wytaiUsage);
export const selectWytaiConversationSchema = createSelectSchema(wytaiConversations);
export const selectWytaiMessageSchema = createSelectSchema(wytaiMessages);
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
export type InsertWytaiUsage = z.infer<typeof insertWytaiUsageSchema>;
export type InsertWytaiConversation = z.infer<typeof insertWytaiConversationSchema>;
export type InsertWytaiMessage = z.infer<typeof insertWytaiMessageSchema>;
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

// WytAi Trademark Engine - Proprietary AI-Powered Indian Trademark Intelligence
export const trademarkStatusEnum = pgEnum('trademark_status', ['pending', 'registered', 'opposed', 'abandoned', 'expired', 'renewal_due']);
export const trademarkClassificationEnum = pgEnum('trademark_classification', ['class_1', 'class_2', 'class_3', 'class_4', 'class_5', 'class_6', 'class_7', 'class_8', 'class_9', 'class_10', 'class_11', 'class_12', 'class_13', 'class_14', 'class_15', 'class_16', 'class_17', 'class_18', 'class_19', 'class_20', 'class_21', 'class_22', 'class_23', 'class_24', 'class_25', 'class_26', 'class_27', 'class_28', 'class_29', 'class_30', 'class_31', 'class_32', 'class_33', 'class_34', 'class_35', 'class_36', 'class_37', 'class_38', 'class_39', 'class_40', 'class_41', 'class_42', 'class_43', 'class_44', 'class_45']);
export const trademarkTypeEnum = pgEnum('trademark_type', ['word', 'logo', 'device', 'combined', 'sound', 'shape', 'color', 'movement']);
export const similarityAlgorithmEnum = pgEnum('similarity_algorithm', ['wytai_semantic', 'wytai_phonetic', 'wytai_visual', 'wytai_combined', 'levenshtein', 'soundex']);

// Core trademark records from Indian Patent Office
export const trademarks = pgTable("trademarks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // TM00001
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
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
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
  user: one(users, {
    fields: [socialAuthTokens.userId],
    references: [users.id],
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
  displayId: varchar("display_id", { length: 20 }).unique(), // AS0001
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
  displayId: varchar("display_id", { length: 50 }).notNull().unique(),
  filename: varchar("filename", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }),
  fileSize: integer("file_size").notNull(),
  backupType: varchar("backup_type", { length: 50 }).notNull().$type<'full' | 'database' | 'files' | 'credentials'>().default('full'),
  status: varchar("status", { length: 50 }).notNull().$type<'pending' | 'in_progress' | 'completed' | 'failed'>().default('pending'),
  metadata: jsonb("metadata").default({}),
  errorMessage: text("error_message"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
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
  lastUpdatedBy: varchar("last_updated_by").references(() => users.id),
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
  createdBy: one(users, {
    fields: [backups.createdBy],
    references: [users.id],
  }),
}));

export const apiIntegrationsRelations = relations(apiIntegrations, ({ one }) => ({
  lastUpdatedBy: one(users, {
    fields: [apiIntegrations.lastUpdatedBy],
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

// Module Edit History Types
export type ModuleEditHistory = typeof moduleEditHistory.$inferSelect;
export type InsertModuleEditHistory = typeof moduleEditHistory.$inferInsert;

// Zod schemas for module edit history
export const insertModuleEditHistorySchema = createInsertSchema(moduleEditHistory).omit({ id: true });
export const selectModuleEditHistorySchema = createSelectSchema(moduleEditHistory);
export type InsertModuleEditHistoryType = z.infer<typeof insertModuleEditHistorySchema>;
export type SelectModuleEditHistoryType = z.infer<typeof selectModuleEditHistorySchema>;

// App Edit History Types
export type AppEditHistory = typeof appEditHistory.$inferSelect;
export type InsertAppEditHistory = typeof appEditHistory.$inferInsert;

// Zod schemas for app edit history
export const insertAppEditHistorySchema = createInsertSchema(appEditHistory).omit({ id: true });
export const selectAppEditHistorySchema = createSelectSchema(appEditHistory);
export type InsertAppEditHistoryType = z.infer<typeof insertAppEditHistorySchema>;
export type SelectAppEditHistoryType = z.infer<typeof selectAppEditHistorySchema>;

// Geo-Regulatory Control Types
export type GeoRegulatoryRule = typeof geoRegulatoryRules.$inferSelect;
export type InsertGeoRegulatoryRule = typeof geoRegulatoryRules.$inferInsert;

// Zod schemas for geo-regulatory rules
export const insertGeoRegulatoryRuleSchema = createInsertSchema(geoRegulatoryRules).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  createdBy: true,
  updatedBy: true 
});

export const selectGeoRegulatoryRuleSchema = createSelectSchema(geoRegulatoryRules);
export type InsertGeoRegulatoryRuleType = z.infer<typeof insertGeoRegulatoryRuleSchema>;
export type SelectGeoRegulatoryRuleType = z.infer<typeof selectGeoRegulatoryRuleSchema>;

// API validation schemas for geo-regulatory rules - Whitelisted fields only
export const createGeoRegulatoryRuleSchema = z.object({
  tenantId: z.string().uuid().optional(),
  hubId: z.string().uuid().optional(),
  appId: z.string().uuid().optional(),
  countryCode: z.string().length(2).toUpperCase(),
  stateCode: z.string().max(10).optional(),
  regionName: z.string().min(1).max(255),
  complianceTemplate: z.enum(['GDPR', 'CCPA', 'PDPA', 'IT_ACT_2000', 'custom']).optional(),
  complianceLevel: z.enum(['basic', 'detailed', 'strict']).default('basic'),
  legalBasis: z.string().optional(),
  effectiveDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  restrictedModules: z.array(z.string()).default([]),
  restrictedFeatures: z.array(z.string()).default([]),
  allowedModules: z.array(z.string()).default([]),
  contentFilters: z.record(z.any()).default({}),
  ageRestrictions: z.record(z.any()).default({}),
  dataResidency: z.boolean().default(false),
  dataExportAllowed: z.boolean().default(true),
  dataRetentionDays: z.number().int().positive().optional(),
  governmentMonitoringEnabled: z.boolean().default(false),
  governmentAccessLevel: z.enum(['none', 'read_only', 'analytics_only']).optional(),
  governmentContactEmail: z.string().email().optional(),
  governmentConsentCaptured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  enforcementLevel: z.enum(['block', 'warn', 'log']).default('warn'),
  notes: z.string().optional(),
});

export const updateGeoRegulatoryRuleSchema = createGeoRegulatoryRuleSchema.partial();

export type CreateGeoRegulatoryRuleType = z.infer<typeof createGeoRegulatoryRuleSchema>;
export type UpdateGeoRegulatoryRuleType = z.infer<typeof updateGeoRegulatoryRuleSchema>;

// Geo-Compliance Logs Types
export type GeoComplianceLog = typeof geoComplianceLogs.$inferSelect;
export type InsertGeoComplianceLog = typeof geoComplianceLogs.$inferInsert;

// Zod schemas for geo-compliance logs
export const insertGeoComplianceLogSchema = createInsertSchema(geoComplianceLogs).omit({ id: true, timestamp: true });
export const selectGeoComplianceLogSchema = createSelectSchema(geoComplianceLogs);
export type InsertGeoComplianceLogType = z.infer<typeof insertGeoComplianceLogSchema>;
export type SelectGeoComplianceLogType = z.infer<typeof selectGeoComplianceLogSchema>;

// API validation schema for creating compliance logs - Whitelisted fields only
export const createGeoComplianceLogSchema = z.object({
  ruleId: z.string().uuid().optional(),
  eventType: z.enum(['access_blocked', 'module_restricted', 'content_filtered', 'data_export', 'government_access', 'rule_triggered']),
  severity: z.enum(['info', 'warning', 'critical']).default('info'),
  countryCode: z.string().length(2).toUpperCase(),
  stateCode: z.string().max(10).optional(),
  tenantId: z.string().uuid().optional(),
  hubId: z.string().uuid().optional(),
  appId: z.string().uuid().optional(),
  userId: z.string().optional(),
  resourceType: z.enum(['module', 'feature', 'content', 'data', 'api']).optional(),
  resourceId: z.string().max(255).optional(),
  requestId: z.string().max(100).optional(),
  sessionId: z.string().max(255).optional(),
  action: z.string().min(1).max(100),
  result: z.enum(['allowed', 'blocked', 'warned', 'filtered']),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.any()).default({}),
  governmentAccess: z.boolean().default(false),
  governmentOfficer: z.string().max(255).optional(),
  accessReason: z.string().optional(),
  warrantNumber: z.string().max(100).optional(),
});

export type CreateGeoComplianceLogType = z.infer<typeof createGeoComplianceLogSchema>;

// =============================================================================
// WYTENTITIES - Zod Schemas & Types
// =============================================================================

// Entity Types
export type EntityType = typeof entityTypes.$inferSelect;
export type InsertEntityTypeModel = typeof entityTypes.$inferInsert;

export const insertEntityTypeSchema = createInsertSchema(entityTypes).omit({ id: true, createdAt: true, updatedAt: true });
export const selectEntityTypeSchema = createSelectSchema(entityTypes);
export type InsertEntityTypeType = z.infer<typeof insertEntityTypeSchema>;
export type SelectEntityTypeType = z.infer<typeof selectEntityTypeSchema>;

// API validation schema for creating entity types - Whitelisted fields only
export const createEntityTypeSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  schema: z.record(z.any()).default({}),
  requiredFields: z.array(z.string()).default([]),
  allowsChildren: z.boolean().default(true),
  allowsFriends: z.boolean().default(true),
  maxAliases: z.number().int().min(1).max(100).default(10),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export const updateEntityTypeSchema = createEntityTypeSchema.partial();
export type CreateEntityTypeType = z.infer<typeof createEntityTypeSchema>;
export type UpdateEntityTypeType = z.infer<typeof updateEntityTypeSchema>;

// Entities
export type Entity = typeof entities.$inferSelect;
export type InsertEntity = typeof entities.$inferInsert;

export const insertEntitySchema = createInsertSchema(entities).omit({ id: true, createdAt: true, updatedAt: true });
export const selectEntitySchema = createSelectSchema(entities);
export type InsertEntityType = z.infer<typeof insertEntitySchema>;
export type SelectEntityType = z.infer<typeof selectEntitySchema>;

// API validation schema for creating entities - Whitelisted fields only
export const createEntitySchema = z.object({
  title: z.string().min(1).max(255),
  aliases: z.array(z.string()).default([]),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  entityTypeId: z.string().uuid(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).default({}),
  imageUrl: z.string().url().max(500).optional(),
  thumbnailUrl: z.string().url().max(500).optional(),
  keywords: z.array(z.string()).default([]),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().optional(),
  tenantId: z.string().uuid().optional(),
  hubId: z.string().uuid().optional(),
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const updateEntitySchema = createEntitySchema.partial();
export type CreateEntityType = z.infer<typeof createEntitySchema>;
export type UpdateEntityType = z.infer<typeof updateEntitySchema>;

// Entity Relationships
export type EntityRelationship = typeof entityRelationships.$inferSelect;
export type InsertEntityRelationship = typeof entityRelationships.$inferInsert;

export const insertEntityRelationshipSchema = createInsertSchema(entityRelationships).omit({ id: true, createdAt: true, updatedAt: true });
export const selectEntityRelationshipSchema = createSelectSchema(entityRelationships);
export type InsertEntityRelationshipType = z.infer<typeof insertEntityRelationshipSchema>;
export type SelectEntityRelationshipType = z.infer<typeof selectEntityRelationshipSchema>;

// API validation schema for creating entity relationships - Whitelisted fields only
export const createEntityRelationshipSchema = z.object({
  sourceEntityId: z.string().uuid(),
  targetEntityId: z.string().uuid(),
  relationshipType: z.enum(['parent', 'child', 'friend', 'related', 'synonym']),
  isBidirectional: z.boolean().default(false),
  context: z.string().max(100).optional(),
  metadata: z.record(z.any()).default({}),
  strength: z.number().int().min(1).max(10).default(1),
  isActive: z.boolean().default(true),
});

export const updateEntityRelationshipSchema = createEntityRelationshipSchema.partial();
export type CreateEntityRelationshipType = z.infer<typeof createEntityRelationshipSchema>;
export type UpdateEntityRelationshipType = z.infer<typeof updateEntityRelationshipSchema>;

// Entity Tags
export type EntityTag = typeof entityTags.$inferSelect;
export type InsertEntityTag = typeof entityTags.$inferInsert;

export const insertEntityTagSchema = createInsertSchema(entityTags).omit({ id: true, taggedAt: true });
export const selectEntityTagSchema = createSelectSchema(entityTags);
export type InsertEntityTagType = z.infer<typeof insertEntityTagSchema>;
export type SelectEntityTagType = z.infer<typeof selectEntityTagSchema>;

// API validation schema for creating entity tags - Whitelisted fields only
export const createEntityTagSchema = z.object({
  entityId: z.string().uuid(),
  resourceType: z.enum(['module', 'app', 'content', 'job', 'event', 'offer', 'need', 'business']),
  resourceId: z.string().min(1).max(255),
  tagContext: z.string().max(100).optional(),
  tenantId: z.string().uuid().optional(),
  hubId: z.string().uuid().optional(),
  appId: z.string().uuid().optional(),
  metadata: z.record(z.any()).default({}),
});

export const updateEntityTagSchema = createEntityTagSchema.partial();
export type CreateEntityTagType = z.infer<typeof createEntityTagSchema>;
export type UpdateEntityTagType = z.infer<typeof updateEntityTagSchema>;

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
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
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
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  appId: uuid("app_id").notNull().references(() => marketplaceApps.id),
  subscriptionId: uuid("subscription_id").notNull().references(() => userAppSubscriptions.id),
  usageType: varchar("usage_type", { length: 50 }).notNull(), // generation, scan, assessment, etc.
  metadata: jsonb("metadata"), // App-specific data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User App Data - Multi-tenant storage for user-specific app data
export const userAppData = pgTable("user_app_data", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
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
  createdBy: varchar("created_by").references(() => users.id),
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
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  balance: integer("balance").notNull().default(0),
  lifetimeEarned: integer("lifetime_earned").notNull().default(0),
  lifetimeSpent: integer("lifetime_spent").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Points Transactions - Complete audit trail
export const pointsTransactions = pgTable("points_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // Positive for credits, negative for debits
  balanceAfter: integer("balance_after").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'registration', 'login', 'purchase', 'recharge', 'referral', 'admin_adjustment', etc.
  description: text("description"),
  metadata: jsonb("metadata").default({}), // Additional context (order_id, app_id, etc.)
  createdBy: varchar("created_by").references(() => users.id), // For admin adjustments
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Entitlements - App access control (uses existing orders table for purchases)
export const entitlements = pgTable("entitlements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
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
  updatedBy: varchar("updated_by").references(() => users.id),
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
  displayId: varchar("display_id", { length: 20 }).unique(), // ND00001
  userId: varchar("user_id").notNull().references(() => users.id),
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
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Offers - Standalone marketplace offers posted by users
export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // OF00001
  userId: varchar("user_id").notNull().references(() => users.id),
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
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WytWall Posts - Simplified unified needs/offers stream
export const wytWallPostTypeEnum = pgEnum("wytwall_post_type", ["need", "offer"]);

export const wytWallPostForEnum = pgEnum("wytwall_post_for", ["personal", "organization"]);

export const wytWallPosts = pgTable("wytwall_posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // WP00001 - Short ID for URLs
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  postType: wytWallPostTypeEnum("post_type").notNull(), // "need" or "offer"
  postFor: wytWallPostForEnum("post_for").notNull().default("personal"), // "personal" or "organization"
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: 'set null' }), // Only if postFor = "organization"
  category: varchar("category", { length: 100 }).notNull(), // Dynamic based on postType
  description: varchar("description", { length: 500 }).notNull(), // Increased from 200 to 500
  location: varchar("location", { length: 500 }), // Location field
  locationDetails: jsonb("location_details").default({}), // Mappls location data
  validityDays: integer("validity_days").notNull().default(7), // 7, 15, 60, or 90 days
  expiresAt: timestamp("expires_at"), // Calculated: createdAt + validityDays
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, inactive, expired, closed
  isPublic: boolean("is_public").default(true), // All posts are public by default (visible on WytWall marketplace)
  isActive: boolean("is_active").default(true), // User can enable/disable their post
  moderationStatus: varchar("moderation_status", { length: 20 }).default("approved"), // approved, pending, rejected
  moderationReason: text("moderation_reason"), // Reason if rejected by admin
  closedAt: timestamp("closed_at"), // When the post was closed by user
  closedReason: varchar("closed_reason", { length: 50 }), // done_wytnet, done_elsewhere, dropped, fulfilled
  renewedCount: integer("renewed_count").default(0), // How many times the post has been renewed
  renewedAt: timestamp("renewed_at"), // Last renewal timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WytWall Post Offers - Offers made on public wytwall posts
export const wytWallPostOffers = pgTable("wytwall_post_offers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: uuid("post_id").notNull().references(() => wytWallPosts.id, { onDelete: 'cascade' }),
  offererId: varchar("offerer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text("message").notNull(),
  proposedPrice: varchar("proposed_price", { length: 50 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, accepted, rejected, withdrawn
  responseMessage: text("response_message"), // Post owner's response
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WytWall Offer Comments - Private conversation thread between post author and offerer (like Facebook comments)
export const wytWallOfferComments = pgTable("wytwall_offer_comments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: uuid("offer_id").notNull().references(() => wytWallPostOffers.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// WytWall Reactions - Like/reaction system for social engagement (like Facebook)
export const wytWallReactionTypeEnum = pgEnum("wytwall_reaction_type", ["like", "love", "helpful", "interested"]);

export const wytWallReactions = pgTable("wytwall_reactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: uuid("post_id").notNull().references(() => wytWallPosts.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  reactionType: wytWallReactionTypeEnum("reaction_type").notNull().default("like"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique("unique_user_post_reaction").on(table.postId, table.userId),
]);

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
  userId: varchar("user_id").notNull().references(() => users.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  type: contributionTypeEnum("type").notNull(),
  entityType: varchar("entity_type", { length: 50 }), // 'need', 'offer', 'listing'
  entityId: uuid("entity_id"),
  pointsEarned: integer("points_earned").notNull().default(0),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// WytStar Levels - User star levels and rankings
export const wytstarLevels = pgTable("wytstar_levels", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
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
  userId: varchar("user_id").notNull().unique().references(() => users.id),
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
  userId: varchar("user_id").notNull().references(() => users.id), // User who sees the match
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
  displayId: varchar("display_id", { length: 20 }).unique(), // OR00001
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  description: text("description"),
  logo: varchar("logo", { length: 500 }),
  status: varchar("status", { length: 20 }).default('active'),
  orgType: varchar("org_type", { length: 50 }), // Proprietorship, Partnership, LLP, Pvt Ltd, Public Ltd, Trust / NGO
  businessTypes: jsonb("business_types").default([]), // Array: Manufacturer, Retail Outlet, Merchant / Trader, Exporter, Service Provider
  industry: varchar("industry", { length: 100 }),
  employees: integer("employees"),
  website: varchar("website", { length: 500 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  location: varchar("location", { length: 255 }),
  locationDetails: jsonb("location_details").default({}), // Mappls location data: lat, lng, address, placeId, etc.
  settings: jsonb("settings").default({}),
  isPublic: boolean("is_public").default(false), // If true, public page at /o/orgslug; if false, only visible when authenticated
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_organizations_display_id").on(table.displayId),
  index("idx_organizations_slug").on(table.slug),
  index("idx_organizations_is_public").on(table.isPublic),
]);

// Organization Members - Team members in organizations
export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").default(sql`gen_random_uuid()`),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).notNull().default('member'), // owner, admin, analyst, custom
  permissions: jsonb("permissions").default({}),
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.organizationId, table.userId] }),
}));

// Organization App Permissions - Per-user, per-app permissions within organizations
// Roles: owner (all permissions), admin, analyst, custom
// Permissions: view, add, edit, delete per WytApp
export const organizationAppPermissions = pgTable("organization_app_permissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  appId: uuid("app_id").notNull().references(() => apps.id, { onDelete: 'cascade' }),
  canView: boolean("can_view").default(true).notNull(),
  canAdd: boolean("can_add").default(false).notNull(),
  canEdit: boolean("can_edit").default(false).notNull(),
  canDelete: boolean("can_delete").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_org_app_perms_org").on(table.organizationId),
  index("idx_org_app_perms_user").on(table.userId),
  index("idx_org_app_perms_app").on(table.appId),
  unique("unique_org_user_app_permission").on(table.organizationId, table.userId, table.appId),
]);

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
  userId: varchar("user_id").references(() => users.id), // If application is from logged-in user
  pointsAwarded: integer("points_awarded").default(0), // WytPoints bonus (e.g., 25 pts)
  tenantId: uuid("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ========================================
// DATASET MANAGEMENT SYSTEM
// ========================================

// Dataset Hubs - Logical grouping of related datasets
export const datasetHubs = pgTable("dataset_hubs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(), // e.g., 'geo', 'localization', 'business'
  name: varchar("name", { length: 255 }).notNull(), // e.g., 'Geographic Data', 'Localization'
  description: text("description"),
  icon: varchar("icon", { length: 10 }).default('📊'), // Emoji or icon identifier
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata").default({}), // { color: '#3B82F6', category: 'reference' }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Data Sources - External APIs for syncing datasets
export const dataSources = pgTable("data_sources", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(), // e.g., 'rest_countries_api', 'geonames_api'
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  baseUrl: varchar("base_url", { length: 500 }).notNull(), // API endpoint base URL
  apiType: varchar("api_type", { length: 50 }).default('rest'), // 'rest', 'graphql', 'soap', 'scraper'
  authType: varchar("auth_type", { length: 50 }).default('none'), // 'none', 'api_key', 'oauth', 'basic'
  authConfig: jsonb("auth_config").default({}), // { headerName: 'X-API-Key', envVar: 'GEONAMES_API_KEY' }
  isActive: boolean("is_active").default(true),
  isFree: boolean("is_free").default(true),
  rateLimitPerHour: integer("rate_limit_per_hour").default(100),
  metadata: jsonb("metadata").default({}), // { documentation: 'https://...', refreshInterval: 'weekly' }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dataset Collections - Reference data collections (Countries, Languages, etc.)
export const datasetCollections = pgTable("dataset_collections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hubId: uuid("hub_id").references(() => datasetHubs.id), // Link to parent hub
  dataSourceId: uuid("data_source_id").references(() => dataSources.id), // External data source
  key: varchar("key", { length: 100 }).notNull().unique(), // e.g., 'countries', 'languages', 'currencies'
  name: varchar("name", { length: 255 }).notNull(), // Display name
  description: text("description"),
  scope: varchar("scope", { length: 20 }).notNull().default('global'), // 'global' or 'tenant'
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  // Sync configuration
  syncEnabled: boolean("sync_enabled").default(false),
  syncFrequency: varchar("sync_frequency", { length: 50 }).default('manual'), // 'manual', 'hourly', 'daily', 'weekly', 'monthly'
  lastSyncedAt: timestamp("last_synced_at"),
  lastSyncStatus: varchar("last_sync_status", { length: 50 }).default('never'), // 'never', 'success', 'failed', 'in_progress'
  lastSyncError: text("last_sync_error"),
  syncCount: integer("sync_count").default(0),
  
  metadata: jsonb("metadata").default({}), // { immutable: true, icon: '🌍', dataMapping: {...} }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dataset Items - Individual items within a collection
export const datasetItems = pgTable("dataset_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: uuid("collection_id").notNull().references(() => datasetCollections.id, { onDelete: 'cascade' }),
  parentId: uuid("parent_id"), // For hierarchical data (e.g., state -> country, city -> state)
  code: varchar("code", { length: 100 }).notNull(), // ISO code or unique identifier
  label: varchar("label", { length: 255 }).notNull(), // Display label
  locale: varchar("locale", { length: 10 }).default('en'), // Language/locale for label
  isDefault: boolean("is_default").default(false),
  sortOrder: integer("sort_order").default(0),
  metadata: jsonb("metadata").default({}), // Additional properties (phonePrefix, symbol, countryCode, etc.)
  tenantId: uuid("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueCodePerCollection: unique().on(table.collectionId, table.code, table.locale),
}));

// Dataset Sync Logs - Track all sync operations for datasets
export const datasetSyncLogs = pgTable("dataset_sync_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: uuid("collection_id").notNull().references(() => datasetCollections.id, { onDelete: 'cascade' }),
  syncType: varchar("sync_type", { length: 50 }).notNull(), // 'full', 'incremental', 'manual'
  status: varchar("status", { length: 50 }).notNull(), // 'in_progress', 'success', 'failed', 'partial'
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // in seconds
  recordsProcessed: integer("records_processed").default(0),
  recordsInserted: integer("records_inserted").default(0),
  recordsUpdated: integer("records_updated").default(0),
  recordsDuplicated: integer("records_duplicated").default(0),
  recordsFailed: integer("records_failed").default(0),
  errorMessage: text("error_message"),
  errorDetails: jsonb("error_details").default({}),
  metadata: jsonb("metadata").default({}), // { source: 'TMView', triggeredBy: 'auto', page: 1-100 }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dataset Audit Trail - Track all changes to dataset items
export const datasetAuditTrail = pgTable("dataset_audit_trail", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: uuid("collection_id").notNull().references(() => datasetCollections.id, { onDelete: 'cascade' }),
  itemId: uuid("item_id"), // null for collection-level changes
  action: varchar("action", { length: 50 }).notNull(), // 'create', 'update', 'delete', 'sync'
  userId: varchar("user_id").references(() => users.id), // null for automated sync
  changedFields: jsonb("changed_fields").default({}), // { field: { old: 'value', new: 'value' } }
  oldValues: jsonb("old_values").default({}),
  newValues: jsonb("new_values").default({}),
  source: varchar("source", { length: 100 }).default('manual'), // 'manual', 'sync', 'import', 'api'
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dataset Validation Rules - Define validation rules for datasets
export const datasetValidationRules = pgTable("dataset_validation_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: uuid("collection_id").notNull().references(() => datasetCollections.id, { onDelete: 'cascade' }),
  fieldName: varchar("field_name", { length: 100 }).notNull(), // 'code', 'label', metadata field
  ruleType: varchar("rule_type", { length: 50 }).notNull(), // 'required', 'unique', 'format', 'range', 'enum'
  ruleConfig: jsonb("rule_config").default({}), // { pattern: '^[0-9]{7}$', min: 1, max: 45, values: [...] }
  errorMessage: text("error_message"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0), // execution order
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ========================================
// TRADEMARK DATASET SYSTEM (India)
// ========================================

// Trademark Master Records - Main trademark data (2.4M+ India trademarks)
export const trademarkMaster = pgTable("trademark_master", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tmNumber: varchar("tm_number", { length: 20 }).notNull().unique(), // Application Number (7 digits)
  brandName: varchar("brand_name", { length: 500 }), // Word Mark
  brandImage: text("brand_image"), // Logo URL
  classes: jsonb("classes").default([]), // [1, 3, 9] - Nice Classification classes
  goodsServices: text("goods_services"), // Description of goods/services
  applicationDate: timestamp("application_date"),
  registrationDate: timestamp("registration_date"),
  status: varchar("status", { length: 50 }).notNull().default('Filed'), // Filed, Examined, Accepted, Registered, Objected, Opposed, Abandoned, Removed, Expired
  office: varchar("office", { length: 100 }), // MUMBAI, DELHI, CHENNAI, AHMEDABAD, KOLKATA
  owner: varchar("owner", { length: 500 }), // Applicant/Owner name
  ownerAddress: text("owner_address"),
  country: varchar("country", { length: 10 }).default('IN'), // Always India
  source: varchar("source", { length: 50 }).default('TMView'), // TMView, IPIndia, Gazette, Manual
  sourcePriority: integer("source_priority").default(2), // Gazette:1, TMView:2, Crawled:3
  dataQuality: varchar("data_quality", { length: 20 }).default('good'), // excellent, good, fair, poor
  isVerified: boolean("is_verified").default(false),
  lastSyncedAt: timestamp("last_synced_at"),
  metadata: jsonb("metadata").default({}), // { attorney: '', vienna_codes: [], disclaimer: '' }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tmNumberIdx: index("tm_number_idx").on(table.tmNumber),
  statusIdx: index("trademark_status_idx").on(table.status),
  classesIdx: index("trademark_classes_idx").on(table.classes),
  ownerIdx: index("trademark_owner_idx").on(table.owner),
}));

// Trademark Lifecycle Events - Track all events for each trademark
export const trademarkLifecycle = pgTable("trademark_lifecycle", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tmNumber: varchar("tm_number", { length: 20 }).notNull(), // Links to trademark_master
  eventType: varchar("event_type", { length: 100 }).notNull(), // Filing, Examination, Hearing, Registration, Renewal, Opposition, Rectification, Withdrawal
  eventDate: timestamp("event_date").notNull(),
  eventDetails: text("event_details"),
  documentUrl: text("document_url"),
  source: varchar("source", { length: 50 }).default('TMView'), // IPIndia, Gazette, TMView
  metadata: jsonb("metadata").default({}), // { hearing_officer: '', opposition_number: '' }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tmNumberIdx: index("lifecycle_tm_number_idx").on(table.tmNumber),
  eventTypeIdx: index("lifecycle_event_type_idx").on(table.eventType),
  eventDateIdx: index("lifecycle_event_date_idx").on(table.eventDate),
}));

// ========================================
// END TRADEMARK DATASET SYSTEM
// ========================================

// ========================================
// WYTAPI - API ACCESS MANAGEMENT SYSTEM
// ========================================

export const apiTierEnum = pgEnum("api_tier", [
  "free",
  "starter", 
  "pro",
  "enterprise"
]);

export const apiKeyStatusEnum = pgEnum("api_key_status", [
  "active",
  "revoked",
  "expired"
]);

export const apiPricingTiers = pgTable("api_pricing_tiers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tier: apiTierEnum("tier").notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  
  priceMonthly: integer("price_monthly").notNull().default(0),
  priceYearly: integer("price_yearly").notNull().default(0),
  
  requestsPerMonth: integer("requests_per_month").notNull(),
  requestsPerMinute: integer("requests_per_minute").notNull(),
  maxApiKeys: integer("max_api_keys").notNull().default(1),
  
  features: jsonb("features").default([]),
  
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  keyPrefix: varchar("key_prefix", { length: 10 }).notNull(),
  keyHash: varchar("key_hash", { length: 255 }).notNull(),
  
  name: varchar("name", { length: 100 }).notNull(),
  tier: apiTierEnum("tier").notNull().default('free'),
  status: apiKeyStatusEnum("status").notNull().default('active'),
  
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("api_keys_user_id_idx").on(table.userId),
  keyPrefixIdx: index("api_keys_prefix_idx").on(table.keyPrefix),
  statusIdx: index("api_keys_status_idx").on(table.status),
}));

export const apiUsageLogs = pgTable("api_usage_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  apiKeyId: uuid("api_key_id").notNull().references(() => apiKeys.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  
  statusCode: integer("status_code"),
  responseTime: integer("response_time"),
  
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  
  requestParams: jsonb("request_params").default({}),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  apiKeyIdIdx: index("api_usage_api_key_id_idx").on(table.apiKeyId),
  userIdIdx: index("api_usage_user_id_idx").on(table.userId),
  endpointIdx: index("api_usage_endpoint_idx").on(table.endpoint),
  createdAtIdx: index("api_usage_created_at_idx").on(table.createdAt),
}));

// ========================================
// END WYTAPI SYSTEM
// ========================================

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
  ownerId: varchar("owner_id").notNull().references(() => users.id), // Who created this app
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
  userId: varchar("user_id").notNull().references(() => users.id),
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
  userId: varchar("user_id").notNull().references(() => users.id),
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
  
  // App Lifecycle Management
  route: varchar("route", { length: 255 }), // App route/URL (e.g., /assessment)
  status: varchar("status", { length: 20 }).notNull().default('draft'), // draft, configured, validated, tested, priced, active, private, public
  
  // Lifecycle Workflow State
  configStatus: varchar("config_status", { length: 20 }).default('pending'), // pending, completed
  validationStatus: varchar("validation_status", { length: 20 }).default('pending'), // pending, passed, failed
  testStatus: varchar("test_status", { length: 20 }).default('pending'), // pending, passed, failed
  pricingStatus: varchar("pricing_status", { length: 20 }).default('pending'), // pending, configured
  activationStatus: varchar("activation_status", { length: 20 }).default('inactive'), // inactive, active
  visibility: varchar("visibility", { length: 20 }).default('private'), // private, public
  
  // Configuration Data
  configData: jsonb("config_data").default({}), // App-specific configuration
  validationResults: jsonb("validation_results").default({}), // Validation test results
  testResults: jsonb("test_results").default({}), // Testing results and logs
  
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  
  // Soft delete support for trash/recovery system
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deleteReason: text("delete_reason"),
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

// Pricing Plan Edit History - Track all changes to pricing plans
export const pricingPlanEditHistory = pgTable("pricing_plan_edit_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: uuid("plan_id").notNull().references(() => pricingPlans.id, { onDelete: 'cascade' }),
  field: varchar("field", { length: 50 }).notNull(), // 'planName', 'basePrice', 'isActive', 'features', 'limits'
  oldValue: text("old_value"),
  newValue: text("new_value"),
  editedBy: varchar("edited_by").notNull().references(() => users.id),
  editedAt: timestamp("edited_at").defaultNow().notNull(),
}, (table) => ({
  planFieldIdx: index("pricing_plan_edit_field_idx").on(table.planId, table.field),
}));

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
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
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
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
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
  userId: varchar("user_id").notNull().references(() => users.id),
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

// Junction Table Schema Exports
export const insertModuleFeatureSchema = createInsertSchema(moduleFeatures).omit({ id: true, createdAt: true, updatedAt: true });
export const selectModuleFeatureSchema = createSelectSchema(moduleFeatures);

export const insertAppModuleSchema = createInsertSchema(appModules).omit({ id: true, createdAt: true, updatedAt: true });
export const selectAppModuleSchema = createSelectSchema(appModules);

export const insertHubModuleSchema = createInsertSchema(hubModules).omit({ id: true, createdAt: true, updatedAt: true });
export const selectHubModuleSchema = createSelectSchema(hubModules);

export const insertHubAppSchema = createInsertSchema(hubApps).omit({ id: true, createdAt: true, updatedAt: true });
export const selectHubAppSchema = createSelectSchema(hubApps);

// Junction Table Type Exports
export type ModuleFeature = typeof moduleFeatures.$inferSelect;
export type InsertModuleFeature = z.infer<typeof insertModuleFeatureSchema>;

export type AppModule = typeof appModules.$inferSelect;
export type InsertAppModule = z.infer<typeof insertAppModuleSchema>;

export type HubModule = typeof hubModules.$inferSelect;
export type InsertHubModule = z.infer<typeof insertHubModuleSchema>;

export type HubApp = typeof hubApps.$inferSelect;
export type InsertHubApp = z.infer<typeof insertHubAppSchema>;

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
export const insertOrganizationAppPermissionSchema = createInsertSchema(organizationAppPermissions).omit({ id: true, createdAt: true, updatedAt: true });
export const selectOrganizationAppPermissionSchema = createSelectSchema(organizationAppPermissions);

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
export type OrganizationAppPermission = typeof organizationAppPermissions.$inferSelect;
export type InsertOrganizationAppPermission = z.infer<typeof insertOrganizationAppPermissionSchema>;

// Dataset Management schema exports
export const insertDatasetHubSchema = createInsertSchema(datasetHubs).omit({ id: true, createdAt: true, updatedAt: true });
export const selectDatasetHubSchema = createSelectSchema(datasetHubs);
export const insertDataSourceSchema = createInsertSchema(dataSources).omit({ id: true, createdAt: true, updatedAt: true });
export const selectDataSourceSchema = createSelectSchema(dataSources);
export const insertDatasetCollectionSchema = createInsertSchema(datasetCollections).omit({ id: true, createdAt: true, updatedAt: true });
export const selectDatasetCollectionSchema = createSelectSchema(datasetCollections);
export const insertDatasetItemSchema = createInsertSchema(datasetItems).omit({ id: true, createdAt: true, updatedAt: true });
export const selectDatasetItemSchema = createSelectSchema(datasetItems);

// Enhanced Dataset Infrastructure schema exports
export const insertDatasetSyncLogSchema = createInsertSchema(datasetSyncLogs).omit({ id: true, createdAt: true });
export const selectDatasetSyncLogSchema = createSelectSchema(datasetSyncLogs);
export const insertDatasetAuditTrailSchema = createInsertSchema(datasetAuditTrail).omit({ id: true, createdAt: true });
export const selectDatasetAuditTrailSchema = createSelectSchema(datasetAuditTrail);
export const insertDatasetValidationRuleSchema = createInsertSchema(datasetValidationRules).omit({ id: true, createdAt: true, updatedAt: true });
export const selectDatasetValidationRuleSchema = createSelectSchema(datasetValidationRules);

// Trademark Dataset schema exports
export const insertTrademarkMasterSchema = createInsertSchema(trademarkMaster).omit({ id: true, createdAt: true, updatedAt: true });
export const selectTrademarkMasterSchema = createSelectSchema(trademarkMaster);
export const insertTrademarkLifecycleSchema = createInsertSchema(trademarkLifecycle).omit({ id: true, createdAt: true, updatedAt: true });
export const selectTrademarkLifecycleSchema = createSelectSchema(trademarkLifecycle);

// Module Activation schema exports
export const insertPlatformModuleActivationSchema = createInsertSchema(platformModuleActivations).omit({ id: true, activatedAt: true, updatedAt: true });
export const selectPlatformModuleActivationSchema = createSelectSchema(platformModuleActivations);
export const insertHubModuleActivationSchema = createInsertSchema(hubModuleActivations).omit({ id: true, activatedAt: true, updatedAt: true });
export const selectHubModuleActivationSchema = createSelectSchema(hubModuleActivations);
export const insertAppModuleActivationSchema = createInsertSchema(appModuleActivations).omit({ id: true, activatedAt: true, updatedAt: true });
export const selectAppModuleActivationSchema = createSelectSchema(appModuleActivations);

// Module Activation type exports
export type PlatformModuleActivation = typeof platformModuleActivations.$inferSelect;
export type InsertPlatformModuleActivation = z.infer<typeof insertPlatformModuleActivationSchema>;
export type HubModuleActivation = typeof hubModuleActivations.$inferSelect;
export type InsertHubModuleActivation = z.infer<typeof insertHubModuleActivationSchema>;
export type AppModuleActivation = typeof appModuleActivations.$inferSelect;
export type InsertAppModuleActivation = z.infer<typeof insertAppModuleActivationSchema>;

// Dataset Management type exports
export type DatasetHub = typeof datasetHubs.$inferSelect;
export type InsertDatasetHub = z.infer<typeof insertDatasetHubSchema>;
export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type DatasetCollection = typeof datasetCollections.$inferSelect;
export type InsertDatasetCollection = z.infer<typeof insertDatasetCollectionSchema>;
export type DatasetItem = typeof datasetItems.$inferSelect;
export type InsertDatasetItem = z.infer<typeof insertDatasetItemSchema>;

// Enhanced Dataset Infrastructure type exports
export type DatasetSyncLog = typeof datasetSyncLogs.$inferSelect;
export type InsertDatasetSyncLog = z.infer<typeof insertDatasetSyncLogSchema>;
export type DatasetAuditTrail = typeof datasetAuditTrail.$inferSelect;
export type InsertDatasetAuditTrail = z.infer<typeof insertDatasetAuditTrailSchema>;
export type DatasetValidationRule = typeof datasetValidationRules.$inferSelect;
export type InsertDatasetValidationRule = z.infer<typeof insertDatasetValidationRuleSchema>;

// Trademark Dataset type exports
export type TrademarkMaster = typeof trademarkMaster.$inferSelect;
export type InsertTrademarkMaster = z.infer<typeof insertTrademarkMasterSchema>;
export type TrademarkLifecycle = typeof trademarkLifecycle.$inferSelect;
export type InsertTrademarkLifecycle = z.infer<typeof insertTrademarkLifecycleSchema>;

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
export const insertPricingPlanEditHistorySchema = createInsertSchema(pricingPlanEditHistory).omit({ id: true });
export const selectPricingPlanEditHistorySchema = createSelectSchema(pricingPlanEditHistory);
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
export type PricingPlanEditHistory = typeof pricingPlanEditHistory.$inferSelect;
export type InsertPricingPlanEditHistory = z.infer<typeof insertPricingPlanEditHistorySchema>;
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

// ============================================
// ROLES & PERMISSIONS MANAGEMENT SYSTEM
// ============================================

// Permission Scopes - where permissions apply
export const permissionScopeEnum = pgEnum("permission_scope", ["engine", "hub", "app", "global"]);

// Permission Actions
export const permissionActionEnum = pgEnum("permission_action", ["view", "create", "edit", "delete", "manage", "configure"]);

// Roles - Role definitions for the platform
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // RL00001
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  scope: permissionScopeEnum("scope").default("engine").notNull(),
  isSystem: boolean("is_system").default(false).notNull(), // System roles cannot be deleted
  isActive: boolean("is_active").default(true).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id), // null for engine-level roles
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_roles_display_id").on(table.displayId),
  index("idx_roles_scope").on(table.scope),
]);

// Permissions - Individual permission definitions
export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // PM00001
  resource: varchar("resource", { length: 100 }).notNull(), // e.g., "tenants", "users", "modules"
  action: permissionActionEnum("action").notNull(), // e.g., "view", "create", "edit", "delete"
  scope: permissionScopeEnum("scope").default("engine").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_permissions_display_id").on(table.displayId),
  index("idx_permissions_resource").on(table.resource),
  unique("unique_permission").on(table.resource, table.action, table.scope),
]);

// Role Permissions - Junction table for role-permission relationships
export const rolePermissions = pgTable("role_permissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_role_permissions_role").on(table.roleId),
  index("idx_role_permissions_permission").on(table.permissionId),
  unique("unique_role_permission").on(table.roleId, table.permissionId),
]);

// User Roles - Assigns roles to users
export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  assignedBy: varchar("assigned_by").references(() => users.id),
  expiresAt: timestamp("expires_at"), // Optional expiration for temporary access
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_user_roles_user").on(table.userId),
  index("idx_user_roles_role").on(table.roleId),
  unique("unique_user_role").on(table.userId, table.roleId),
]);

// ============================================
// PLATFORM HUB MANAGEMENT SYSTEM
// ============================================

// Platform Hub Status
export const platformHubStatusEnum = pgEnum("platform_hub_status", ["active", "inactive", "suspended", "archived"]);

// Platform Hubs - Manages platform-level hubs (e.g., WytNet.com, partner hubs)
export const platformHubs = pgTable("platform_hubs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // PH00001
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  
  // Domain Configuration
  domain: varchar("domain", { length: 255 }).unique(), // Custom domain (e.g., ownernet.com)
  subdomain: varchar("subdomain", { length: 100 }).unique(), // Subdomain (e.g., ownernet for ownernet.wytnet.com)
  customDomain: varchar("custom_domain", { length: 255 }).unique(), // User's custom domain
  domainVerified: boolean("domain_verified").default(false).notNull(),
  dnsConfiguration: jsonb("dns_configuration").default({}), // { aRecord, cname, txt, verified, verifiedAt }
  
  // Branding
  description: text("description"),
  logo: varchar("logo", { length: 500 }),
  favicon: varchar("favicon", { length: 500 }),
  ogImage: varchar("og_image", { length: 500 }),
  themeSettings: jsonb("theme_settings").default({}), // { primaryColor, secondaryColor, fontFamily, etc. }
  
  // SEO Configuration
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  seoRobots: varchar("seo_robots", { length: 50 }).default('index, follow'),
  
  // Status and Settings
  status: platformHubStatusEnum("status").default("active").notNull(),
  settings: jsonb("settings").default({}),
  metadata: jsonb("metadata").default({}),
  tenantId: uuid("tenant_id").references(() => tenants.id), // Associated tenant
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_platform_hubs_display_id").on(table.displayId),
  index("idx_platform_hubs_slug").on(table.slug),
  index("idx_platform_hubs_status").on(table.status),
  index("idx_platform_hubs_subdomain").on(table.subdomain),
  index("idx_platform_hubs_custom_domain").on(table.customDomain),
]);

// Platform Hub Admins - Assigns admin users to platform hubs
export const platformHubAdmins = pgTable("platform_hub_admins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hubId: uuid("hub_id").notNull().references(() => platformHubs.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid("role_id").references(() => roles.id), // Specific role for this hub
  assignedBy: varchar("assigned_by").references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_platform_hub_admins_hub").on(table.hubId),
  index("idx_platform_hub_admins_user").on(table.userId),
  unique("unique_platform_hub_admin").on(table.hubId, table.userId),
]);

// Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
  platformHubAdmins: many(platformHubAdmins),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const platformHubsRelations = relations(platformHubs, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [platformHubs.tenantId],
    references: [tenants.id],
  }),
  platformHubAdmins: many(platformHubAdmins),
}));

export const platformHubAdminsRelations = relations(platformHubAdmins, ({ one }) => ({
  hub: one(platformHubs, {
    fields: [platformHubAdmins.hubId],
    references: [platformHubs.id],
  }),
  user: one(users, {
    fields: [platformHubAdmins.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [platformHubAdmins.roleId],
    references: [roles.id],
  }),
}));

// Platform Themes table
export const platformThemes = pgTable("platform_themes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull().default('custom'), // 'system', 'custom', 'imported'
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  
  // Color scheme
  primaryColor: varchar("primary_color", { length: 50 }).default('#0066FF'),
  secondaryColor: varchar("secondary_color", { length: 50 }).default('#FF6B00'),
  accentColor: varchar("accent_color", { length: 50 }).default('#00D4FF'),
  backgroundColor: varchar("background_color", { length: 50 }).default('#FFFFFF'),
  textColor: varchar("text_color", { length: 50 }).default('#000000'),
  
  // Typography
  fontFamily: varchar("font_family", { length: 100 }).default('Inter'),
  headingFont: varchar("heading_font", { length: 100 }),
  bodyFont: varchar("body_font", { length: 100 }),
  
  // Theme mode
  mode: varchar("mode", { length: 20 }).default('light'), // 'light', 'dark', 'auto'
  
  // Advanced settings stored as JSON
  colorScheme: jsonb("color_scheme").default({}), // {success, error, warning, info, etc.}
  spacing: jsonb("spacing").default({}), // {xs, sm, md, lg, xl}
  borderRadius: jsonb("border_radius").default({}), // {sm, md, lg, full}
  shadows: jsonb("shadows").default({}), // {sm, md, lg, xl}
  customCSS: text("custom_css"),
  
  // Usage tracking
  usageCount: integer("usage_count").default(0),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_themes_display_id").on(table.displayId),
  index("idx_themes_slug").on(table.slug),
]);

export const platformThemesRelations = relations(platformThemes, ({ one }) => ({
  tenant: one(tenants, {
    fields: [platformThemes.tenantId],
    references: [tenants.id],
  }),
}));

// ========================================
// HELP & SUPPORT SYSTEM
// ========================================

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(),
  ticketNumber: varchar("ticket_number", { length: 50 }).notNull().unique(),
  userId: varchar("user_id").references(() => users.id),
  subject: varchar("subject", { length: 500 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }),
  priority: varchar("priority", { length: 20 }).default('medium'),
  status: varchar("status", { length: 20 }).default('open'),
  assignedTo: varchar("assigned_to").references(() => users.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  attachments: jsonb("attachments").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
}, (table) => [
  index("idx_support_tickets_user").on(table.userId),
  index("idx_support_tickets_assigned").on(table.assignedTo),
  index("idx_support_tickets_status").on(table.status),
]);

export const supportResponses = pgTable("support_responses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: uuid("ticket_id").notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isInternal: boolean("is_internal").default(false),
  attachments: jsonb("attachments").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_support_responses_ticket").on(table.ticketId),
  index("idx_support_responses_user").on(table.userId),
]);

export const knowledgeBaseArticles = pgTable("knowledge_base_articles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").default([]),
  isPublished: boolean("is_published").default(false),
  viewsCount: integer("views_count").default(0),
  helpful: integer("helpful").default(0),
  authorId: varchar("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
}, (table) => [
  index("idx_kb_category").on(table.category),
  index("idx_kb_published").on(table.isPublished),
  index("idx_kb_author").on(table.authorId),
]);

// ========================================
// INTEGRATIONS MANAGEMENT
// ========================================

export const platformIntegrations = pgTable("platform_integrations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  provider: varchar("provider", { length: 100 }),
  isActive: boolean("is_active").default(false),
  isConfigured: boolean("is_configured").default(false),
  configFields: jsonb("config_fields").default({}),
  credentials: jsonb("credentials").default({}),
  webhooks: jsonb("webhooks").default({}),
  rateLimits: jsonb("rate_limits").default({}),
  iconUrl: varchar("icon_url", { length: 500 }),
  documentationUrl: varchar("documentation_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_integrations_slug").on(table.slug),
  index("idx_integrations_category").on(table.category),
]);

// ========================================
// GLOBAL PLATFORM SETTINGS
// ========================================

export const platformSettings = pgTable("platform_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  type: varchar("type", { length: 50 }).notNull().default('string'), // 'string', 'number', 'boolean', 'json'
  category: varchar("category", { length: 100 }).notNull(), // 'general', 'email', 'payment', 'security', 'api'
  label: varchar("label", { length: 255 }),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  isEditable: boolean("is_editable").default(true),
  validationRules: jsonb("validation_rules").default({}),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_platform_settings_key").on(table.key),
  index("idx_platform_settings_category").on(table.category),
]);

export const insertPlatformSettingSchema = createInsertSchema(platformSettings, {
  key: z.string().min(1).max(255),
  type: z.enum(['string', 'number', 'boolean', 'json']),
  category: z.enum(['general', 'email', 'payment', 'security', 'api']),
  value: z.string().optional(),
  label: z.string().max(255).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  isEditable: z.boolean().optional(),
  validationRules: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true, updatedBy: true });

export const updatePlatformSettingSchema = z.object({
  value: z.string(),
});

export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type SelectPlatformSetting = typeof platformSettings.$inferSelect;
export type UpdatePlatformSetting = z.infer<typeof updatePlatformSettingSchema>;

// ========================================
// NOTIFICATIONS SYSTEM
// ========================================

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar("type", { length: 50 }).notNull(), // 'system', 'wytai', 'hub_invite', 'points', 'alert'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }), // Optional link to navigate to
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata").default({}), // Additional data related to notification
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_notifications_user").on(table.userId),
  index("idx_notifications_read").on(table.isRead),
  index("idx_notifications_created").on(table.createdAt),
]);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications, {
  userId: z.string(),
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  link: z.string().max(500).optional(),
  isRead: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true });

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Schema exports for Roles & Permissions
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true, updatedAt: true });
export const selectRoleSchema = createSelectSchema(roles);
export const insertPermissionSchema = createInsertSchema(permissions).omit({ id: true, createdAt: true });
export const selectPermissionSchema = createSelectSchema(permissions);
export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({ id: true, createdAt: true });
export const selectRolePermissionSchema = createSelectSchema(rolePermissions);
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ id: true, createdAt: true });
export const selectUserRoleSchema = createSelectSchema(userRoles);

// Type exports for Roles & Permissions
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

// Schema exports for Platform Hubs
export const insertPlatformHubSchema = createInsertSchema(platformHubs).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPlatformHubSchema = createSelectSchema(platformHubs);
export const insertPlatformHubAdminSchema = createInsertSchema(platformHubAdmins).omit({ id: true, createdAt: true });
export const selectPlatformHubAdminSchema = createSelectSchema(platformHubAdmins);

// Type exports for Platform Hubs
export type PlatformHub = typeof platformHubs.$inferSelect;
export type InsertPlatformHub = z.infer<typeof insertPlatformHubSchema>;
export type PlatformHubAdmin = typeof platformHubAdmins.$inferSelect;
export type InsertPlatformHubAdmin = z.infer<typeof insertPlatformHubAdminSchema>;

// Schema exports for Platform Themes
export const insertPlatformThemeSchema = createInsertSchema(platformThemes).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPlatformThemeSchema = createSelectSchema(platformThemes);

// Type exports for Platform Themes
export type PlatformTheme = typeof platformThemes.$inferSelect;
export type InsertPlatformTheme = z.infer<typeof insertPlatformThemeSchema>;

// =======================
// Features Checklist System
// =======================

// Features master list table
export const features = pgTable("features", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // FT00001
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // Authentication, UI/UX, Backend, etc.
  priority: varchar("priority", { length: 20 }).default('medium'), // low, medium, high, critical
  status: varchar("status", { length: 50 }).default('pending'), // pending, in_progress, completed, on_hold
  
  // Progress tracking
  totalTasks: integer("total_tasks").default(0),
  completedTasks: integer("completed_tasks").default(0),
  agentTestedTasks: integer("agent_tested_tasks").default(0),
  jkmTestedTasks: integer("jkm_tested_tasks").default(0),
  
  // Metadata
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_features_display_id").on(table.displayId),
  index("idx_features_status").on(table.status),
  index("idx_features_category").on(table.category),
]);

// Tasks table for each feature
export const featureTasks = pgTable("feature_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // TSK00001
  featureId: varchar("feature_id").notNull().references(() => features.id, { onDelete: 'cascade' }),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 500 }), // Direct link to test the feature
  expectedUrlPattern: varchar("expected_url_pattern", { length: 100 }), // /auth/*, /admin/*, etc.
  urlPatternValid: boolean("url_pattern_valid").default(true),
  
  // Testing status
  agentTested: boolean("agent_tested").default(false),
  agentTestedAt: timestamp("agent_tested_at"),
  agentTestedBy: varchar("agent_tested_by", { length: 255 }),
  agentTestComments: text("agent_test_comments"),
  
  jkmTested: boolean("jkm_tested").default(false),
  jkmTestedAt: timestamp("jkm_tested_at"),
  jkmTestComments: text("jkm_test_comments"),
  
  // Status and ordering
  status: varchar("status", { length: 50 }).default('pending'), // pending, agent_tested, jkm_tested, completed, blocked
  orderIndex: integer("order_index").default(0),
  isBlocked: boolean("is_blocked").default(false),
  blockedReason: text("blocked_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_feature_tasks_feature_id").on(table.featureId),
  index("idx_feature_tasks_status").on(table.status),
  index("idx_feature_tasks_display_id").on(table.displayId),
]);

// Relations
export const featuresRelations = relations(features, ({ many }) => ({
  tasks: many(featureTasks),
}));

export const featureTasksRelations = relations(featureTasks, ({ one }) => ({
  feature: one(features, {
    fields: [featureTasks.featureId],
    references: [features.id],
  }),
}));

// Insert/Select schemas
export const insertFeatureSchema = createInsertSchema(features, {
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'on_hold']).optional(),
}).omit({ id: true, displayId: true, createdAt: true, updatedAt: true });

export const updateFeatureSchema = insertFeatureSchema.partial();

export const insertFeatureTaskSchema = createInsertSchema(featureTasks, {
  featureId: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  url: z.string().url().max(500).optional().or(z.literal('')),
  expectedUrlPattern: z.string().max(100).optional(),
  agentTestComments: z.string().optional(),
  jkmTestComments: z.string().optional(),
}).omit({ id: true, displayId: true, createdAt: true, updatedAt: true });

export const updateFeatureTaskSchema = insertFeatureTaskSchema.partial();

export const updateTaskTestStatusSchema = z.object({
  testType: z.enum(['agent', 'jkm']),
  tested: z.boolean(),
  comments: z.string().optional(),
});

// Type exports
export type Feature = typeof features.$inferSelect;
export type InsertFeature = z.infer<typeof insertFeatureSchema>;
export type UpdateFeature = z.infer<typeof updateFeatureSchema>;
export type FeatureTask = typeof featureTasks.$inferSelect;
export type InsertFeatureTask = z.infer<typeof insertFeatureTaskSchema>;
export type UpdateFeatureTask = z.infer<typeof updateFeatureTaskSchema>;
export type UpdateTaskTestStatus = z.infer<typeof updateTaskTestStatusSchema>;

// =======================
// QA Testing Tracker
// =======================

// Simplified QA testing tracker with flat table structure
export const qaTestItems = pgTable("qa_test_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // QA00001
  
  // Core fields
  title: varchar("title", { length: 255 }).notNull(), // Checklist Title
  task: text("task").notNull(), // Task description
  category: varchar("category", { length: 100 }).notNull(), // Under (Engine, MyPanel, OrgPanel, etc.)
  status: varchar("status", { length: 50 }).default('pending'), // pending, in_progress, done, blocked
  
  // Testing tracking
  agentTested: boolean("agent_tested").default(false),
  agentTestedAt: timestamp("agent_tested_at"),
  agentTestedBy: varchar("agent_tested_by", { length: 255 }),
  
  jkmTested: boolean("jkm_tested").default(false),
  jkmTestedAt: timestamp("jkm_tested_at"),
  
  // Optional fields
  notes: text("notes"),
  priority: varchar("priority", { length: 20 }).default('medium'), // low, medium, high
  orderIndex: integer("order_index").default(0), // For custom ordering
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_qa_test_items_display_id").on(table.displayId),
  index("idx_qa_test_items_category").on(table.category),
  index("idx_qa_test_items_status").on(table.status),
]);

// Insert/Select schemas
export const insertQATestItemSchema = createInsertSchema(qaTestItems, {
  title: z.string().min(1).max(255),
  task: z.string().min(1),
  category: z.string().min(1).max(100),
  status: z.enum(['pending', 'in_progress', 'done', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  notes: z.string().optional(),
}).omit({ id: true, displayId: true, createdAt: true, updatedAt: true });

export const updateQATestItemSchema = insertQATestItemSchema.partial();

export const markJKMTestedSchema = z.object({
  jkmTested: z.boolean(),
});

// Type exports
export type QATestItem = typeof qaTestItems.$inferSelect;
export type InsertQATestItem = z.infer<typeof insertQATestItemSchema>;
export type UpdateQATestItem = z.infer<typeof updateQATestItemSchema>;
export type MarkJKMTested = z.infer<typeof markJKMTestedSchema>;

// =======================
// API Library - White-label API Management
// =======================

export const apiLibrary = pgTable("api_library", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // API00001
  
  // API Details
  name: varchar("name", { length: 255 }).notNull(), // e.g., "WytMap"
  originalName: varchar("original_name", { length: 255 }), // e.g., "Mappls"
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  
  // Type and Source
  type: varchar("type", { length: 50 }).notNull(), // 'wytmodule', 'wytapp', 'wytdataset', 'thirdparty'
  sourceId: varchar("source_id", { length: 255 }), // ID of the source module/app/dataset
  isWhiteLabeled: boolean("is_white_labeled").default(false),
  
  // API Configuration
  baseUrl: varchar("base_url", { length: 500 }),
  version: varchar("version", { length: 20 }).default('1.0.0'),
  authType: varchar("auth_type", { length: 50 }), // 'api_key', 'oauth', 'bearer', 'none'
  endpoints: jsonb("endpoints").default([]), // [{method: 'GET', path: '/api/route', description: '...'}]
  
  // Documentation
  docsUrl: varchar("docs_url", { length: 500 }),
  docsContent: jsonb("docs_content").default({}),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").default([]),
  
  // Usage & Status
  status: varchar("status", { length: 20 }).notNull().default('active'), // 'active', 'inactive', 'deprecated'
  isPublic: boolean("is_public").default(true),
  usageCount: integer("usage_count").default(0),
  
  // Metadata
  icon: varchar("icon", { length: 255 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  websiteUrl: varchar("website_url", { length: 500 }),
  
  createdBy: varchar("created_by"),
  updatedBy: varchar("updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_api_library_type").on(table.type),
  index("idx_api_library_status").on(table.status),
  index("idx_api_library_display_id").on(table.displayId),
]);

// Zod schemas for API Library
export const insertApiLibrarySchema = createInsertSchema(apiLibrary).omit({
  id: true,
  displayId: true,
  createdAt: true,
  updatedAt: true,
});

export const selectApiLibrarySchema = createSelectSchema(apiLibrary);
export type InsertApiLibrary = z.infer<typeof insertApiLibrarySchema>;
export type SelectApiLibrary = typeof apiLibrary.$inferSelect;

// ============================================
// HUB DOMAIN MANAGEMENT SYSTEM
// ============================================

// Domain verification status enum
export const domainStatusEnum = pgEnum("domain_status", ["pending", "verifying", "active", "failed", "expired"]);

// Hub Domains - Multiple custom domains per hub
export const hubDomains = pgTable("hub_domains", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hubId: uuid("hub_id").notNull().references(() => platformHubs.id, { onDelete: 'cascade' }),
  
  // Domain Configuration
  domain: varchar("domain", { length: 255 }).notNull().unique(), // e.g., 'clientbusiness.com', 'shop.example.org'
  domainType: varchar("domain_type", { length: 20 }).notNull().default('custom'), // 'subdomain', 'custom'
  isPrimary: boolean("is_primary").default(false), // Primary domain for this hub
  
  // Verification
  status: domainStatusEnum("status").default("pending").notNull(),
  verificationToken: varchar("verification_token", { length: 100 }), // TXT record value for DNS verification
  verifiedAt: timestamp("verified_at"),
  lastCheckedAt: timestamp("last_checked_at"),
  
  // SSL Status
  sslStatus: varchar("ssl_status", { length: 20 }).default('pending'), // 'pending', 'active', 'failed'
  sslExpiresAt: timestamp("ssl_expires_at"),
  
  // DNS Configuration Instructions
  dnsRecords: jsonb("dns_records").default([]), // [{type: 'A', name: '@', value: 'x.x.x.x'}, {type: 'CNAME', name: 'www', value: '...'}]
  
  // Metadata
  addedBy: varchar("added_by").references(() => users.id),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_hub_domains_hub").on(table.hubId),
  index("idx_hub_domains_domain").on(table.domain),
  index("idx_hub_domains_status").on(table.status),
]);

// Hub Domains Relations
export const hubDomainsRelations = relations(hubDomains, ({ one }) => ({
  hub: one(platformHubs, {
    fields: [hubDomains.hubId],
    references: [platformHubs.id],
  }),
  addedByUser: one(users, {
    fields: [hubDomains.addedBy],
    references: [users.id],
  }),
}));

// Zod schemas for Hub Domains
export const insertHubDomainSchema = createInsertSchema(hubDomains).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectHubDomainSchema = createSelectSchema(hubDomains);
export type InsertHubDomain = z.infer<typeof insertHubDomainSchema>;
export type SelectHubDomain = typeof hubDomains.$inferSelect;

// ============================================
// PRODUCTION DEPLOYMENT SYSTEM
// ============================================

// Deployment status enum
export const deploymentStatusEnum = pgEnum("deployment_status", ["pending", "building", "deploying", "success", "failed", "rolled_back"]);

// Production Deployments - Track deployments to production server
export const productionDeployments = pgTable("production_deployments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // DP00001
  
  // Deployment Info
  version: varchar("version", { length: 50 }).notNull(), // e.g., '1.0.45'
  commitHash: varchar("commit_hash", { length: 100 }), // Git commit if available
  description: text("description"),
  
  // Status
  status: deploymentStatusEnum("status").default("pending").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  // Logs and Output
  buildLogs: text("build_logs"),
  deployLogs: text("deploy_logs"),
  errorMessage: text("error_message"),
  
  // Server Info
  serverIp: varchar("server_ip", { length: 50 }),
  serverRegion: varchar("server_region", { length: 50 }),
  
  // Metadata
  deployedBy: varchar("deployed_by").notNull().references(() => users.id),
  rollbackOf: uuid("rollback_of"), // If this is a rollback, reference the original deployment
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_deployments_display_id").on(table.displayId),
  index("idx_deployments_status").on(table.status),
  index("idx_deployments_deployed_by").on(table.deployedBy),
  index("idx_deployments_created_at").on(table.createdAt),
]);

// Deployment Relations
export const productionDeploymentsRelations = relations(productionDeployments, ({ one }) => ({
  deployedByUser: one(users, {
    fields: [productionDeployments.deployedBy],
    references: [users.id],
  }),
}));

// Zod schemas for Deployments
export const insertDeploymentSchema = createInsertSchema(productionDeployments).omit({
  id: true,
  displayId: true,
  createdAt: true,
  updatedAt: true,
});
export const selectDeploymentSchema = createSelectSchema(productionDeployments);
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type SelectDeployment = typeof productionDeployments.$inferSelect;
