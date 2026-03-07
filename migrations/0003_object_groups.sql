-- Add Object Groups and group membership mapping

CREATE TABLE IF NOT EXISTS object_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  hub_id UUID REFERENCES hubs(id) ON DELETE SET NULL,
  created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  updated_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS object_group_slug_idx ON object_groups(slug);
CREATE INDEX IF NOT EXISTS object_group_active_idx ON object_groups(is_active);
CREATE INDEX IF NOT EXISTS object_group_tenant_idx ON object_groups(tenant_id);

CREATE TABLE IF NOT EXISTS object_group_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_group_id UUID NOT NULL REFERENCES object_groups(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT object_group_entities_unique UNIQUE (object_group_id, entity_id)
);

CREATE INDEX IF NOT EXISTS object_group_entities_group_idx ON object_group_entities(object_group_id);
CREATE INDEX IF NOT EXISTS object_group_entities_entity_idx ON object_group_entities(entity_id);
