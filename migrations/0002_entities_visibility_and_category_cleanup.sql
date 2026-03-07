-- Entities cleanup after Object Visibility/Object Category UI removal
-- Safe to run multiple times.

-- 1) Remove obsolete indexes tied to removed visibility columns.
DROP INDEX IF EXISTS "entity_public_idx";
DROP INDEX IF EXISTS "entity_verified_idx";

-- 2) Remove obsolete visibility columns from entities.
ALTER TABLE "entities"
  DROP COLUMN IF EXISTS "is_public",
  DROP COLUMN IF EXISTS "is_verified";

-- 3) Remove legacy category array from entity metadata JSONB.
UPDATE "entities"
SET "metadata" = "metadata" - 'categories'
WHERE "metadata" ? 'categories';
