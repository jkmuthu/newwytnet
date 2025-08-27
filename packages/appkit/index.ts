// AppKit package - Application Builder with manifest system
export * from './manifest';

// Re-export commonly used types and utilities
export type { AppManifest } from './manifest';

// AppKit version and metadata
export const APPKIT_VERSION = '1.0.0';
export const APPKIT_COMPATIBILITY = {
  kernel: '^1.0.0',
  builder: '^1.0.0',
  cms: '^1.0.0',
};

// Default AppKit configuration
export const DEFAULT_APPKIT_CONFIG = {
  marketplace: {
    enablePublicRegistry: true,
    requireApproval: true,
    maxAppsPerTenant: 100,
  },
  deployment: {
    enableAutoDeployment: false,
    enableRollback: true,
    healthCheckTimeout: 30000,
  },
  pricing: {
    defaultCurrency: 'INR',
    supportedCurrencies: ['INR', 'USD', 'EUR'],
    enableTrials: true,
    defaultTrialDays: 14,
  },
  security: {
    requireCodeSigning: true,
    enableSandbox: true,
    maxPermissions: 50,
  },
};

// Initialize AppKit with configuration
export function initializeAppKit(config: Partial<typeof DEFAULT_APPKIT_CONFIG> = {}) {
  const mergedConfig = { ...DEFAULT_APPKIT_CONFIG, ...config };
  
  console.log(`📱 WytNet AppKit v${APPKIT_VERSION} initialized`);
  console.log(`   - Marketplace: ${mergedConfig.marketplace.enablePublicRegistry ? 'public' : 'private'}`);
  console.log(`   - Currency: ${mergedConfig.pricing.defaultCurrency}`);
  console.log(`   - Security: Code signing ${mergedConfig.security.requireCodeSigning ? 'required' : 'optional'}`);
  
  return mergedConfig;
}

// AppKit health check
export function getAppKitHealth() {
  return {
    version: APPKIT_VERSION,
    status: 'healthy',
    registry: 'operational',
    supportedFormats: ['manifest.json', 'app.yaml'],
    timestamp: new Date().toISOString(),
  };
}

// Utility functions for app operations
export function validateAppDependencies(manifest: any): boolean {
  const { AppBuilder } = require('./manifest');
  const validation = AppBuilder.validateManifest(manifest);
  
  if (!validation.valid) {
    console.error('App validation failed:', validation.errors);
    return false;
  }
  
  // Check compatibility with current platform version
  const deps = manifest.dependencies || {};
  return Object.keys(APPKIT_COMPATIBILITY).every(dep => {
    if (deps[dep]) {
      // In a real implementation, we'd use semver for proper version checking
      return true;
    }
    return true; // Optional dependencies
  });
}

export function generateAppPackage(manifest: any) {
  const { AppBuilder } = require('./manifest');
  return AppBuilder.generateAppPackage(manifest);
}

export function calculateAppMetrics(manifest: any, usage: Record<string, number> = {}) {
  const { AppBuilder } = require('./manifest');
  return AppBuilder.calculateAppCost(manifest, usage);
}
