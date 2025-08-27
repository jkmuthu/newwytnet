// WytID Universal Identity & Validation Kernel
export * from './schema';
export * from './service';
export * from './anchoring';
export * from './types';

// Re-export commonly used types and utilities
export type { WytIDEntity, WytIDProof, WytIDTransfer } from './types';
export type { IProofAnchor } from './anchoring';

// WytID version and metadata
export const WYTID_VERSION = '1.0.0';
export const WYTID_COMPATIBILITY = {
  kernel: '^1.0.0',
  builder: '^1.0.0',
  postgres: '^15.0.0',
  drizzle: '^0.28.0',
};

// Default WytID configuration
export const DEFAULT_WYTID_CONFIG = {
  entity: {
    identifierPrefix: 'WYT',
    autoGenerateId: true,
    requireTenantScope: true,
  },
  proofs: {
    enableBlockchainAnchoring: false,
    defaultAnchorProvider: 'mock',
    expirationDays: 365,
  },
  verification: {
    enablePublicApi: true,
    requireApiKey: true,
    rateLimitPerMinute: 100,
  },
};

// Initialize WytID with configuration
export function initializeWytID(config: Partial<typeof DEFAULT_WYTID_CONFIG> = {}) {
  const mergedConfig = { ...DEFAULT_WYTID_CONFIG, ...config };
  
  console.log(`🆔 WytID v${WYTID_VERSION} initialized`);
  console.log(`   - Entity prefix: ${mergedConfig.entity.identifierPrefix}`);
  console.log(`   - Anchoring: ${mergedConfig.proofs.defaultAnchorProvider}`);
  console.log(`   - Public API: ${mergedConfig.verification.enablePublicApi ? 'enabled' : 'disabled'}`);
  
  return mergedConfig;
}

// WytID health check
export function getWytIDHealth() {
  return {
    version: WYTID_VERSION,
    status: 'healthy',
    entityTypes: ['person', 'org', 'asset', 'document'],
    proofTypes: ['hash', 'signature', 'blockchain_anchor', 'notary'],
    timestamp: new Date().toISOString(),
  };
}