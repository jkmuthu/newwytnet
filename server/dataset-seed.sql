-- ========================================
-- DATASET SYNC SYSTEM - SEED DATA
-- ========================================
-- This file contains seed data for Dataset Hubs, Data Sources, and initial collections
-- with external API sync configuration

-- ========================================
-- DATASET HUBS (Logical Groupings)
-- ========================================

INSERT INTO dataset_hubs (id, key, name, description, icon, sort_order, is_active, metadata)
VALUES
  -- Hub 1: Geographic Data
  (gen_random_uuid(), 'geo', 'Geographic Data', 'Countries, states, cities, timezones, and postal codes', '🌍', 1, true, '{"color": "#3B82F6", "category": "reference"}'),
  
  -- Hub 2: Localization
  (gen_random_uuid(), 'localization', 'Localization', 'Languages, currencies, date formats, and number formats', '🌐', 2, true, '{"color": "#10B981", "category": "reference"}'),
  
  -- Hub 3: Business Reference
  (gen_random_uuid(), 'business', 'Business Reference', 'Industries, job titles, company sizes, and business types', '💼', 3, true, '{"color": "#F59E0B", "category": "business"}'),
  
  -- Hub 4: App Configuration
  (gen_random_uuid(), 'config', 'App Configuration', 'App categories, pricing models, feature flags, and status types', '⚙️', 4, true, '{"color": "#8B5CF6", "category": "platform"}'),
  
  -- Hub 5: Education & Skills
  (gen_random_uuid(), 'education', 'Education & Skills', 'Education levels, degrees, skills, and certifications', '🎓', 5, true, '{"color": "#EF4444", "category": "reference"}'),
  
  -- Hub 6: Time & Calendar
  (gen_random_uuid(), 'time', 'Time & Calendar', 'Timezones, calendar types, holidays, and date ranges', '📅', 6, true, '{"color": "#EC4899", "category": "reference"}')
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  metadata = EXCLUDED.metadata;

-- ========================================
-- DATA SOURCES (External APIs)
-- ========================================

INSERT INTO data_sources (id, key, name, description, base_url, api_type, auth_type, auth_config, is_active, is_free, rate_limit_per_hour, metadata)
VALUES
  -- Geographic Data Sources
  (gen_random_uuid(), 'rest_countries', 'REST Countries API', 'Comprehensive country data including flags, currencies, languages', 'https://restcountries.com/v3.1', 'rest', 'none', '{}', true, true, 1000, '{"documentation": "https://restcountries.com", "refreshInterval": "monthly", "version": "v3.1"}'),
  
  (gen_random_uuid(), 'geonames', 'GeoNames API', 'Geographic database with cities, states, countries, postal codes', 'http://api.geonames.org', 'rest', 'api_key', '{"paramName": "username", "envVar": "GEONAMES_USERNAME"}', true, true, 20000, '{"documentation": "https://www.geonames.org/export/web-services.html", "refreshInterval": "monthly"}'),
  
  -- Currency Data
  (gen_random_uuid(), 'exchange_rates', 'Exchange Rates API', 'Real-time and historical currency exchange rates', 'https://api.exchangerate-api.com/v4', 'rest', 'api_key', '{"headerName": "apikey", "envVar": "EXCHANGE_RATES_API_KEY"}', true, false, 1500, '{"documentation": "https://www.exchangerate-api.com/docs", "refreshInterval": "daily", "paidTier": "Pro"}'),
  
  -- Language & Localization
  (gen_random_uuid(), 'google_translate', 'Google Translate API', 'Language detection and translation', 'https://translation.googleapis.com/language/translate/v2', 'rest', 'api_key', '{"paramName": "key", "envVar": "GOOGLE_TRANSLATE_API_KEY"}', false, false, 500, '{"documentation": "https://cloud.google.com/translate/docs", "refreshInterval": "monthly", "paidOnly": true}'),
  
  -- Timezone Data
  (gen_random_uuid(), 'timezonedb', 'TimezoneDB API', 'Timezone information and conversions', 'http://api.timezonedb.com/v2.1', 'rest', 'api_key', '{"paramName": "key", "envVar": "TIMEZONEDB_API_KEY"}', true, true, 1000, '{"documentation": "https://timezonedb.com/api", "refreshInterval": "quarterly"}'),
  
  -- Custom/Manual Entry
  (gen_random_uuid(), 'manual', 'Manual Entry', 'Manually curated data without external sync', '', 'manual', 'none', '{}', true, true, 0, '{"type": "manual"}')
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  base_url = EXCLUDED.base_url,
  metadata = EXCLUDED.metadata;

-- ========================================
-- LINK EXISTING COLLECTIONS TO HUBS
-- ========================================
-- Update existing collections to link them to appropriate hubs

-- Geographic Hub Collections
UPDATE dataset_collections
SET hub_id = (SELECT id FROM dataset_hubs WHERE key = 'geo' LIMIT 1),
    sync_enabled = true,
    sync_frequency = 'monthly',
    data_source_id = (SELECT id FROM data_sources WHERE key = 'rest_countries' LIMIT 1)
WHERE key = 'countries';

UPDATE dataset_collections
SET hub_id = (SELECT id FROM dataset_hubs WHERE key = 'geo' LIMIT 1),
    sync_enabled = true,
    sync_frequency = 'quarterly',
    data_source_id = (SELECT id FROM data_sources WHERE key = 'geonames' LIMIT 1)
WHERE key IN ('states', 'cities');

-- Localization Hub Collections
UPDATE dataset_collections
SET hub_id = (SELECT id FROM dataset_hubs WHERE key = 'localization' LIMIT 1),
    sync_enabled = false,
    data_source_id = (SELECT id FROM data_sources WHERE key = 'manual' LIMIT 1)
WHERE key IN ('languages', 'currencies');

-- ========================================
-- HELPER SQL FOR DATASET OPERATIONS
-- ========================================

-- Query to see all hubs with their collections count
-- SELECT 
--   h.name as hub_name,
--   h.icon,
--   COUNT(c.id) as collections_count,
--   h.is_active
-- FROM dataset_hubs h
-- LEFT JOIN dataset_collections c ON c.hub_id = h.id
-- GROUP BY h.id, h.name, h.icon, h.is_active
-- ORDER BY h.sort_order;

-- Query to see collections with sync status
-- SELECT 
--   h.name as hub,
--   c.name as collection,
--   c.sync_enabled,
--   c.last_sync_status,
--   c.last_synced_at,
--   ds.name as data_source
-- FROM dataset_collections c
-- LEFT JOIN dataset_hubs h ON c.hub_id = h.id
-- LEFT JOIN data_sources ds ON c.data_source_id = ds.id
-- ORDER BY h.sort_order, c.name;
