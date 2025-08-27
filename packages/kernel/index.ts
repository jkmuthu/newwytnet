// Kernel package - Core utilities for authentication, tenancy, and policies
export * from './auth';
export * from './tenancy';

// Re-export commonly used types and utilities
export type { AuthContext, UserRole, Permission } from './auth';
export type { TenantContext } from './tenancy';

// Kernel version and metadata
export const KERNEL_VERSION = '1.0.0';
export const KERNEL_COMPATIBILITY = {
  node: '>=18.0.0',
  typescript: '>=5.0.0',
};

// Default kernel configuration
export const DEFAULT_KERNEL_CONFIG = {
  auth: {
    sessionTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
    refreshThreshold: 15 * 60 * 1000, // 15 minutes
    maxSessions: 5,
  },
  tenancy: {
    defaultLocale: 'en-IN',
    fallbackLocale: 'en-IN',
    maxTenants: 1000,
  },
  security: {
    enableRLS: true,
    enableAudit: true,
    enableRateLimiting: true,
  },
};

// Initialize kernel with configuration
export function initializeKernel(config: Partial<typeof DEFAULT_KERNEL_CONFIG> = {}) {
  const mergedConfig = { ...DEFAULT_KERNEL_CONFIG, ...config };
  
  console.log(`🚀 WytNet Kernel v${KERNEL_VERSION} initialized`);
  console.log(`   - Auth: Session TTL ${mergedConfig.auth.sessionTTL}ms`);
  console.log(`   - Tenancy: Default locale ${mergedConfig.tenancy.defaultLocale}`);
  console.log(`   - Security: RLS ${mergedConfig.security.enableRLS ? 'enabled' : 'disabled'}`);
  
  return mergedConfig;
}

// Health check utilities
export function getKernelHealth() {
  return {
    version: KERNEL_VERSION,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
}
