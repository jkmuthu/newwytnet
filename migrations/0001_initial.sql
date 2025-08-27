-- WytNet Initial Migration
-- Creates all tables with RLS (Row Level Security) enabled

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Session storage table for authentication
CREATE TABLE "sessions" (
  "sid" VARCHAR NOT NULL,
  "sess" JSONB NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid")
);

-- Index for session expiry cleanup
CREATE INDEX "IDX_session_expire" ON "sessions" ("expire");

-- Core tenants table
CREATE TABLE "tenants" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(100) NOT NULL UNIQUE,
  "domain" VARCHAR(255) UNIQUE,
  "subdomain" VARCHAR(100) UNIQUE,
  "status" VARCHAR(20) NOT NULL DEFAULT 'active',
  "settings" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users table with RLS support
CREATE TABLE "users" (
  "id" VARCHAR PRIMARY KEY,
  "email" VARCHAR UNIQUE,
  "first_name" VARCHAR,
  "last_name" VARCHAR,
  "profile_image_url" VARCHAR,
  "tenant_id" UUID REFERENCES "tenants"("id"),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tenant memberships with roles
CREATE TABLE "memberships" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" VARCHAR NOT NULL REFERENCES "users"("id"),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id"),
  "role" VARCHAR(50) NOT NULL DEFAULT 'member',
  "status" VARCHAR(20) NOT NULL DEFAULT 'active',
  "permissions" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("user_id", "tenant_id")
);

-- Models for CRUD builder
CREATE TABLE "models" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id"),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "schema" JSONB NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
  "version" VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  "created_by" VARCHAR NOT NULL REFERENCES "users"("id"),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CMS Pages
CREATE TABLE "pages" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id"),
  "title" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "path" VARCHAR(500) NOT NULL,
  "locale" VARCHAR(10) NOT NULL DEFAULT 'en-IN',
  "content" JSONB NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
  "published_at" TIMESTAMP(3),
  "theme_ref" VARCHAR(100),
  "created_by" VARCHAR NOT NULL REFERENCES "users"("id"),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CMS Blocks
CREATE TABLE "blocks" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id"),
  "type" VARCHAR(100) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "content" JSONB NOT NULL,
  "settings" JSONB DEFAULT '{}',
  "is_global" BOOLEAN DEFAULT FALSE,
  "created_by" VARCHAR NOT NULL REFERENCES "users"("id"),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Apps
CREATE TABLE "apps" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID REFERENCES "tenants"("id"),
  "key" VARCHAR(100) NOT NULL UNIQUE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "version" VARCHAR(20) NOT NULL,
  "manifest" JSONB NOT NULL,
  "icon" VARCHAR(500),
  "categories" JSONB DEFAULT '[]',
  "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
  "is_public" BOOLEAN DEFAULT FALSE,
  "pricing" JSONB DEFAULT '{}',
  "created_by" VARCHAR NOT NULL REFERENCES "users"("id"),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- App Installs
CREATE TABLE "app_installs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "app_id" UUID NOT NULL REFERENCES "apps"("id"),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id"),
  "installed_by" VARCHAR NOT NULL REFERENCES "users"("id"),
  "status" VARCHAR(20) NOT NULL DEFAULT 'active',
  "settings" JSONB DEFAULT '{}',
  "installed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Hubs
CREATE TABLE "hubs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "key" VARCHAR(100) NOT NULL UNIQUE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "type" VARCHAR(50) NOT NULL,
  "config" JSONB NOT NULL,
  "aggregation_rules" JSONB DEFAULT '[]',
  "moderation_settings" JSONB DEFAULT '{}',
  "revenue_model" JSONB DEFAULT '{}',
  "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
  "created_by" VARCHAR NOT NULL REFERENCES "users"("id"),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Plans
CREATE TABLE "plans" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
  "interval" VARCHAR(20) NOT NULL DEFAULT 'monthly',
  "features" JSONB DEFAULT '[]',
  "limits" JSONB DEFAULT '{}',
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Media files
CREATE TABLE "media" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id"),
  "filename" VARCHAR(255) NOT NULL,
  "original_name" VARCHAR(255) NOT NULL,
  "mime_type" VARCHAR(100) NOT NULL,
  "size" INTEGER NOT NULL,
  "url" VARCHAR(1000) NOT NULL,
  "metadata" JSONB DEFAULT '{}',
  "created_by" VARCHAR NOT NULL REFERENCES "users"("id"),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs
CREATE TABLE "audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenant_id" UUID REFERENCES "tenants"("id"),
  "user_id" VARCHAR REFERENCES "users"("id"),
  "action" VARCHAR(100) NOT NULL,
  "resource" VARCHAR(100) NOT NULL,
  "resource_id" VARCHAR(255),
  "details" JSONB DEFAULT '{}',
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX "idx_tenants_slug" ON "tenants"("slug");
CREATE INDEX "idx_tenants_domain" ON "tenants"("domain");
CREATE INDEX "idx_tenants_subdomain" ON "tenants"("subdomain");

CREATE INDEX "idx_users_tenant_id" ON "users"("tenant_id");
CREATE INDEX "idx_users_email" ON "users"("email");

CREATE INDEX "idx_memberships_user_id" ON "memberships"("user_id");
CREATE INDEX "idx_memberships_tenant_id" ON "memberships"("tenant_id");

CREATE INDEX "idx_models_tenant_id" ON "models"("tenant_id");
CREATE INDEX "idx_models_created_by" ON "models"("created_by");
CREATE INDEX "idx_models_status" ON "models"("status");

CREATE INDEX "idx_pages_tenant_id" ON "pages"("tenant_id");
CREATE INDEX "idx_pages_slug" ON "pages"("slug");
CREATE INDEX "idx_pages_path" ON "pages"("path");
CREATE INDEX "idx_pages_status" ON "pages"("status");

CREATE INDEX "idx_blocks_tenant_id" ON "blocks"("tenant_id");
CREATE INDEX "idx_blocks_type" ON "blocks"("type");

CREATE INDEX "idx_apps_key" ON "apps"("key");
CREATE INDEX "idx_apps_tenant_id" ON "apps"("tenant_id");
CREATE INDEX "idx_apps_status" ON "apps"("status");
CREATE INDEX "idx_apps_is_public" ON "apps"("is_public");

CREATE INDEX "idx_app_installs_tenant_id" ON "app_installs"("tenant_id");
CREATE INDEX "idx_app_installs_app_id" ON "app_installs"("app_id");

CREATE INDEX "idx_hubs_key" ON "hubs"("key");
CREATE INDEX "idx_hubs_type" ON "hubs"("type");
CREATE INDEX "idx_hubs_status" ON "hubs"("status");

CREATE INDEX "idx_plans_is_active" ON "plans"("is_active");
CREATE INDEX "idx_plans_price" ON "plans"("price");

CREATE INDEX "idx_media_tenant_id" ON "media"("tenant_id");
CREATE INDEX "idx_media_created_by" ON "media"("created_by");

CREATE INDEX "idx_audit_logs_tenant_id" ON "audit_logs"("tenant_id");
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs"("user_id");
CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action");
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs"("created_at");

-- Enable Row Level Security (RLS)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "models" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blocks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app_installs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
-- Note: In a production environment, these policies would be more sophisticated
-- and would integrate with the actual session context

-- Users policy - can see users in their tenant
CREATE POLICY "users_tenant_isolation" ON "users"
  AS RESTRICTIVE FOR ALL
  TO authenticated
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid OR tenant_id IS NULL);

-- Models policy - can only see models in their tenant
CREATE POLICY "models_tenant_isolation" ON "models"
  AS RESTRICTIVE FOR ALL
  TO authenticated
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Pages policy - can only see pages in their tenant
CREATE POLICY "pages_tenant_isolation" ON "pages"
  AS RESTRICTIVE FOR ALL
  TO authenticated
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Blocks policy - can only see blocks in their tenant or global blocks
CREATE POLICY "blocks_tenant_isolation" ON "blocks"
  AS RESTRICTIVE FOR ALL
  TO authenticated
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid OR is_global = true);

-- App installs policy - can only see installs for their tenant
CREATE POLICY "app_installs_tenant_isolation" ON "app_installs"
  AS RESTRICTIVE FOR ALL
  TO authenticated
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Media policy - can only see media in their tenant
CREATE POLICY "media_tenant_isolation" ON "media"
  AS RESTRICTIVE FOR ALL
  TO authenticated
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Audit logs policy - can only see audit logs for their tenant
CREATE POLICY "audit_logs_tenant_isolation" ON "audit_logs"
  AS RESTRICTIVE FOR ALL
  TO authenticated
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid OR tenant_id IS NULL);

-- Create trigger functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers to tables with updated_at columns
CREATE TRIGGER "update_tenants_updated_at"
  BEFORE UPDATE ON "tenants"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER "update_users_updated_at"
  BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER "update_memberships_updated_at"
  BEFORE UPDATE ON "memberships"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER "update_models_updated_at"
  BEFORE UPDATE ON "models"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER "update_pages_updated_at"
  BEFORE UPDATE ON "pages"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER "update_blocks_updated_at"
  BEFORE UPDATE ON "blocks"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER "update_apps_updated_at"
  BEFORE UPDATE ON "apps"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER "update_app_installs_updated_at"
  BEFORE UPDATE ON "app_installs"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER "update_hubs_updated_at"
  BEFORE UPDATE ON "hubs"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER "update_plans_updated_at"
  BEFORE UPDATE ON "plans"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create full-text search indexes for searchable content
CREATE INDEX "idx_models_name_search" ON "models" USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX "idx_pages_content_search" ON "pages" USING gin(to_tsvector('english', title || ' ' || COALESCE(content::text, '')));
CREATE INDEX "idx_apps_search" ON "apps" USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX "idx_hubs_search" ON "hubs" USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Commit the transaction
COMMIT;
