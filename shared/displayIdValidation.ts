/**
 * Display ID Validation Utilities
 * Validates and parses human-readable display IDs
 */

export type DisplayIdPrefix = 
  | 'USR' // User
  | 'ORG' // Organization
  | 'TNT' // Tenant
  | 'ENT' // Entity
  | 'MOD' // Module
  | 'APP' // App
  | 'HUB' // Hub
  | 'MED' // Media
  | 'WID' // WytID Entity
  | 'NED' // Need
  | 'OFR' // Offer
  | 'ASM' // Assessment
  | 'TMK'; // Trademark

export interface ParsedDisplayId {
  prefix: DisplayIdPrefix;
  number: number;
  raw: string;
  entityType: string;
}

// Regex patterns for each display ID type
export const DISPLAY_ID_PATTERNS = {
  USR: /^USR-\d{7}$/,  // USR-0000001
  ORG: /^ORG-\d{5}$/,  // ORG-00001
  TNT: /^TNT-\d{5}$/,  // TNT-00001
  ENT: /^ENT-\d{5}$/,  // ENT-00001
  MOD: /^MOD-\d{4}$/,  // MOD-0001
  APP: /^APP-\d{4}$/,  // APP-0001
  HUB: /^HUB-\d{3}$/,  // HUB-001
  MED: /^MED-\d{5}$/,  // MED-00001
  WID: /^WID-\d{5}$/,  // WID-00001
  NED: /^NED-\d{5}$/,  // NED-00001
  OFR: /^OFR-\d{5}$/,  // OFR-00001
  ASM: /^ASM-\d{4}$/,  // ASM-0001
  TMK: /^TMK-\d{5}$/,  // TMK-00001
} as const;

// Combined pattern for any display ID
export const ANY_DISPLAY_ID_PATTERN = /^(USR|ORG|TNT|ENT|MOD|APP|HUB|MED|WID|NED|OFR|ASM|TMK)-\d+$/;

// Map prefix to entity type
export const PREFIX_TO_ENTITY_TYPE: Record<DisplayIdPrefix, string> = {
  USR: 'users',
  ORG: 'organizations',
  TNT: 'tenants',
  ENT: 'entities',
  MOD: 'platformModules',
  APP: 'apps',
  HUB: 'hubs',
  MED: 'media',
  WID: 'wytidEntities',
  NED: 'needs',
  OFR: 'offers',
  ASM: 'assessmentQuestions',
  TMK: 'trademarks',
};

// Map entity type to prefix
export const ENTITY_TYPE_TO_PREFIX: Record<string, DisplayIdPrefix> = {
  users: 'USR',
  organizations: 'ORG',
  tenants: 'TNT',
  entities: 'ENT',
  platformModules: 'MOD',
  apps: 'APP',
  hubs: 'HUB',
  media: 'MED',
  wytidEntities: 'WID',
  needs: 'NED',
  offers: 'OFR',
  assessmentQuestions: 'ASM',
  trademarks: 'TMK',
};

/**
 * Check if a string is a valid display ID
 */
export function isValidDisplayId(id: string): boolean {
  return ANY_DISPLAY_ID_PATTERN.test(id);
}

/**
 * Check if a string is a valid display ID for a specific prefix
 */
export function isValidDisplayIdForPrefix(id: string, prefix: DisplayIdPrefix): boolean {
  const pattern = DISPLAY_ID_PATTERNS[prefix];
  return pattern.test(id);
}

/**
 * Get entity type from a display ID
 */
export function getEntityTypeFromDisplayId(displayId: string): string | null {
  if (!isValidDisplayId(displayId)) {
    return null;
  }
  
  const prefix = displayId.split('-')[0] as DisplayIdPrefix;
  return PREFIX_TO_ENTITY_TYPE[prefix] || null;
}

/**
 * Parse a display ID into its components
 */
export function parseDisplayId(displayId: string): ParsedDisplayId | null {
  if (!isValidDisplayId(displayId)) {
    return null;
  }
  
  const [prefix, numberStr] = displayId.split('-');
  const number = parseInt(numberStr, 10);
  const entityType = PREFIX_TO_ENTITY_TYPE[prefix as DisplayIdPrefix];
  
  if (!entityType || isNaN(number)) {
    return null;
  }
  
  return {
    prefix: prefix as DisplayIdPrefix,
    number,
    raw: displayId,
    entityType,
  };
}

/**
 * Get display name/label for entity type (for UI display)
 */
export function getEntityTypeLabel(entityType: string): string {
  const labels: Record<string, string> = {
    users: 'User',
    organizations: 'Organization',
    tenants: 'Tenant',
    entities: 'Entity',
    platformModules: 'Module',
    apps: 'App',
    hubs: 'Hub',
    media: 'Media',
    wytidEntities: 'WytID',
    needs: 'Need',
    offers: 'Offer',
    assessmentQuestions: 'Assessment',
    trademarks: 'Trademark',
  };
  
  return labels[entityType] || entityType;
}

/**
 * Get display name/label from display ID (for UI display)
 */
export function getDisplayIdLabel(displayId: string): string | null {
  const entityType = getEntityTypeFromDisplayId(displayId);
  if (!entityType) {
    return null;
  }
  
  return getEntityTypeLabel(entityType);
}

/**
 * Format a display ID for display (adds spacing, color, etc. for UI)
 */
export function formatDisplayId(displayId: string): string {
  const parsed = parseDisplayId(displayId);
  if (!parsed) {
    return displayId;
  }
  
  return `${parsed.prefix}-${parsed.number.toString().padStart(parsed.raw.split('-')[1].length, '0')}`;
}

/**
 * Validate an array of display IDs
 */
export function validateDisplayIds(ids: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  ids.forEach(id => {
    if (isValidDisplayId(id)) {
      valid.push(id);
    } else {
      invalid.push(id);
    }
  });
  
  return { valid, invalid };
}

/**
 * Get all possible prefixes (for dropdowns, filters, etc.)
 */
export function getAllPrefixes(): DisplayIdPrefix[] {
  return Object.keys(DISPLAY_ID_PATTERNS) as DisplayIdPrefix[];
}

/**
 * Get prefix display name (for UI)
 */
export function getPrefixLabel(prefix: DisplayIdPrefix): string {
  const entityType = PREFIX_TO_ENTITY_TYPE[prefix];
  return getEntityTypeLabel(entityType);
}
