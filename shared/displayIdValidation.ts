/**
 * Display ID Validation Utilities
 * Validates and parses human-readable display IDs
 */

export type DisplayIdPrefix = 
  | 'UR' // User
  | 'OR' // Organization
  | 'TN' // Tenant
  | 'EN' // Entity
  | 'MD' // Module
  | 'AP' // App
  | 'HB' // Hub
  | 'ME' // Media
  | 'WI' // WytID Entity
  | 'ND' // Need
  | 'OF' // Offer
  | 'AS' // Assessment
  | 'TM'; // Trademark

export interface ParsedDisplayId {
  prefix: DisplayIdPrefix;
  number: number;
  raw: string;
  entityType: string;
}

// Regex patterns for each display ID type (no hyphens)
export const DISPLAY_ID_PATTERNS = {
  UR: /^UR\d{7}$/,  // UR0000001
  OR: /^OR\d{5}$/,  // OR00001
  TN: /^TN\d{5}$/,  // TN00001
  EN: /^EN\d{5}$/,  // EN00001
  MD: /^MD\d{4}$/,  // MD0001
  AP: /^AP\d{4}$/,  // AP0001
  HB: /^HB\d{3}$/,  // HB001
  ME: /^ME\d{5}$/,  // ME00001
  WI: /^WI\d{5}$/,  // WI00001
  ND: /^ND\d{5}$/,  // ND00001
  OF: /^OF\d{5}$/,  // OF00001
  AS: /^AS\d{4}$/,  // AS0001
  TM: /^TM\d{5}$/,  // TM00001
} as const;

// Combined pattern for any display ID (no hyphens)
export const ANY_DISPLAY_ID_PATTERN = /^(UR|OR|TN|EN|MD|AP|HB|ME|WI|ND|OF|AS|TM)\d+$/;

// Map prefix to entity type
export const PREFIX_TO_ENTITY_TYPE: Record<DisplayIdPrefix, string> = {
  UR: 'users',
  OR: 'organizations',
  TN: 'tenants',
  EN: 'entities',
  MD: 'platformModules',
  AP: 'apps',
  HB: 'hubs',
  ME: 'media',
  WI: 'wytidEntities',
  ND: 'needs',
  OF: 'offers',
  AS: 'assessmentQuestions',
  TM: 'trademarks',
};

// Map entity type to prefix
export const ENTITY_TYPE_TO_PREFIX: Record<string, DisplayIdPrefix> = {
  users: 'UR',
  organizations: 'OR',
  tenants: 'TN',
  entities: 'EN',
  platformModules: 'MD',
  apps: 'AP',
  hubs: 'HB',
  media: 'ME',
  wytidEntities: 'WI',
  needs: 'ND',
  offers: 'OF',
  assessmentQuestions: 'AS',
  trademarks: 'TM',
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
  
  const prefix = displayId.substring(0, 2) as DisplayIdPrefix;
  return PREFIX_TO_ENTITY_TYPE[prefix] || null;
}

/**
 * Parse a display ID into its components
 */
export function parseDisplayId(displayId: string): ParsedDisplayId | null {
  if (!isValidDisplayId(displayId)) {
    return null;
  }
  
  const prefix = displayId.substring(0, 2) as DisplayIdPrefix;
  const numberStr = displayId.substring(2);
  const number = parseInt(numberStr, 10);
  const entityType = PREFIX_TO_ENTITY_TYPE[prefix];
  
  if (!entityType || isNaN(number)) {
    return null;
  }
  
  return {
    prefix,
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
  
  const numberPart = parsed.raw.substring(2);
  return `${parsed.prefix}${parsed.number.toString().padStart(numberPart.length, '0')}`;
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
