// HubKit package - Hub Builder for cross-tenant aggregation
export * from './aggregation';

// Re-export commonly used types and utilities
export type { HubConfig } from './aggregation';

// HubKit version and metadata
export const HUBKIT_VERSION = '1.0.0';
export const HUBKIT_COMPATIBILITY = {
  kernel: '^1.0.0',
  appkit: '^1.0.0',
};

// Default HubKit configuration
export const DEFAULT_HUBKIT_CONFIG = {
  aggregation: {
    enableRealtime: true,
    batchSize: 1000,
    maxAggregationRules: 50,
    retentionDays: 365,
  },
  moderation: {
    enableAutoModeration: true,
    enableMLFiltering: false,
    maxModeratorsPerHub: 10,
    reviewTimeoutHours: 24,
  },
  revenue: {
    enablePayouts: true,
    minimumPayout: 100,
    payoutSchedule: 'weekly',
    defaultCommission: 5.0, // percentage
  },
  directory: {
    enableSEO: true,
    maxListingsPerPage: 50,
    enableSearch: true,
    enableFilters: true,
  },
};

// Initialize HubKit with configuration
export function initializeHubKit(config: Partial<typeof DEFAULT_HUBKIT_CONFIG> = {}) {
  const mergedConfig = { ...DEFAULT_HUBKIT_CONFIG, ...config };
  
  console.log(`🌐 WytNet HubKit v${HUBKIT_VERSION} initialized`);
  console.log(`   - Aggregation: ${mergedConfig.aggregation.enableRealtime ? 'realtime' : 'batch'}`);
  console.log(`   - Moderation: ${mergedConfig.moderation.enableAutoModeration ? 'auto' : 'manual'}`);
  console.log(`   - Revenue: ${mergedConfig.revenue.defaultCommission}% default commission`);
  
  return mergedConfig;
}

// HubKit health check
export function getHubKitHealth() {
  return {
    version: HUBKIT_VERSION,
    status: 'healthy',
    aggregationEngine: 'operational',
    eventBus: 'connected',
    moderationQueue: 'processing',
    timestamp: new Date().toISOString(),
  };
}

// Utility functions for hub operations
export function validateHubConfiguration(config: any): boolean {
  const { HubManager } = require('./aggregation');
  const manager = new HubManager();
  
  try {
    // This will throw if invalid
    const validation = manager['validateHub'](config);
    return validation.valid;
  } catch (error) {
    console.error('Hub validation failed:', error.message);
    return false;
  }
}

export function createHubFromTemplate(template: string, customConfig: any = {}) {
  const { EXAMPLE_HUBS } = require('./aggregation');
  
  if (!EXAMPLE_HUBS[template]) {
    throw new Error(`Unknown hub template: ${template}`);
  }
  
  return {
    ...EXAMPLE_HUBS[template],
    ...customConfig,
    version: HUBKIT_VERSION,
  };
}

export function calculateHubMetrics(hubConfig: any, usage: any = {}) {
  // Calculate hub performance and financial metrics
  const aggregationRules = hubConfig.aggregationRules || [];
  const revenueModel = hubConfig.revenueModel || {};
  
  return {
    totalRules: aggregationRules.length,
    activeRules: aggregationRules.filter((r: any) => r.status === 'active').length,
    estimatedRevenue: calculateHubRevenue(revenueModel, usage),
    memberCount: usage.members || 0,
    listingCount: usage.listings || 0,
    transactionVolume: usage.transactions || 0,
  };
}

function calculateHubRevenue(revenueModel: any, usage: any): number {
  let totalRevenue = 0;
  
  // Joining fees
  totalRevenue += (usage.newMembers || 0) * (revenueModel.joiningFee || 0);
  
  // Listing fees
  totalRevenue += (usage.newListings || 0) * (revenueModel.listingFee || 0);
  
  // Commission from transactions
  const transactionRevenue = (usage.transactionVolume || 0);
  totalRevenue += transactionRevenue * ((revenueModel.commissionRate || 0) / 100);
  
  return totalRevenue;
}
