// Cross-tenant aggregation and hub management utilities
import { z } from "zod";

// Hub configuration schema
export const hubConfigSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9-]+$/, "Hub key must be lowercase alphanumeric with dashes"),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  type: z.enum(["community", "marketplace", "directory", "classifieds"]),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must follow semver format"),
  
  // Cross-tenant aggregation rules
  aggregationRules: z.array(z.object({
    id: z.string(),
    name: z.string(),
    source: z.string(), // e.g., "property.*" or "service.verified"
    filter: z.string(), // SQL-like filter expression
    fields: z.array(z.string()).default([]), // Fields to include in aggregation
    transformations: z.array(z.object({
      field: z.string(),
      operation: z.enum(["map", "filter", "aggregate", "enrich"]),
      config: z.record(z.any()),
    })).default([]),
    schedule: z.object({
      type: z.enum(["realtime", "scheduled", "manual"]).default("realtime"),
      interval: z.string().optional(), // cron expression for scheduled
    }).default({ type: "realtime" }),
    status: z.enum(["active", "inactive", "error"]).default("active"),
  })).default([]),
  
  // Moderation settings
  moderation: z.object({
    enabled: z.boolean().default(true),
    autoApprove: z.boolean().default(false),
    contentFilters: z.array(z.object({
      type: z.enum(["profanity", "spam", "quality", "custom"]),
      config: z.record(z.any()),
      action: z.enum(["flag", "reject", "approve"]).default("flag"),
    })).default([]),
    reviewQueue: z.object({
      enabled: z.boolean().default(true),
      priority: z.enum(["fifo", "priority", "random"]).default("fifo"),
      autoAssign: z.boolean().default(true),
    }).default({}),
    escalation: z.object({
      enabled: z.boolean().default(true),
      timeoutHours: z.number().default(24),
      escalateTo: z.array(z.string()).default([]),
    }).default({}),
  }).default({}),
  
  // Verification and KYC settings
  verification: z.object({
    enabled: z.boolean().default(false),
    levels: z.array(z.object({
      id: z.string(),
      name: z.string(),
      requirements: z.array(z.string()),
      privileges: z.array(z.string()),
    })).default([]),
    providers: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["document", "biometric", "third_party"]),
      config: z.record(z.any()),
    })).default([]),
    autoVerify: z.boolean().default(false),
  }).default({}),
  
  // Revenue model and fees
  revenueModel: z.object({
    type: z.enum(["free", "subscription", "commission", "listing_fee", "hybrid"]).default("free"),
    joiningFee: z.number().default(0),
    subscriptionFee: z.number().default(0),
    subscriptionInterval: z.enum(["monthly", "yearly"]).default("monthly"),
    commissionRate: z.number().min(0).max(100).default(0), // percentage
    listingFee: z.number().default(0),
    featuredListingFee: z.number().default(0),
    transactionFee: z.number().min(0).max(100).default(0), // percentage
    payoutSchedule: z.enum(["instant", "daily", "weekly", "monthly"]).default("weekly"),
    minimumPayout: z.number().default(100),
  }).default({}),
  
  // Public directory configuration
  directory: z.object({
    enabled: z.boolean().default(true),
    searchable: z.boolean().default(true),
    categories: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      icon: z.string().optional(),
    })).default([]),
    filters: z.array(z.object({
      field: z.string(),
      type: z.enum(["text", "select", "range", "boolean"]),
      options: z.array(z.string()).optional(),
    })).default([]),
    sorting: z.array(z.object({
      field: z.string(),
      label: z.string(),
      direction: z.enum(["asc", "desc"]).default("desc"),
    })).default([]),
  }).default({}),
  
  // SEO and social settings
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    canonicalUrl: z.string().url().optional(),
    ogImage: z.string().url().optional(),
    twitterHandle: z.string().optional(),
    structuredData: z.record(z.any()).default({}),
  }).default({}),
  
  // Legal and compliance
  legal: z.object({
    termsOfService: z.string().optional(),
    privacyPolicy: z.string().optional(),
    disputeResolution: z.string().optional(),
    dataRetention: z.object({
      period: z.number().default(365), // days
      autoDelete: z.boolean().default(false),
    }).default({}),
    compliance: z.array(z.string()).default([]), // e.g., ["GDPR", "CCPA"]
  }).default({}),
  
  // Integration settings
  integrations: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["webhook", "api", "sync"]),
    config: z.record(z.any()),
    enabled: z.boolean().default(false),
  })).default([]),
  
  // Compatibility and dependencies
  compatibility: z.object({
    kernel: z.string().default("^1.0.0"),
    apps: z.array(z.string()).default([]),
    modules: z.array(z.string()).default([]),
  }).default({}),
});

export type HubConfig = z.infer<typeof hubConfigSchema>;

// Aggregation engine for cross-tenant data
export class AggregationEngine {
  private rules: Map<string, any> = new Map();
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  addRule(rule: any): void {
    this.rules.set(rule.id, rule);
    
    if (rule.schedule.type === "realtime") {
      this.setupRealtimeAggregation(rule);
    } else if (rule.schedule.type === "scheduled") {
      this.setupScheduledAggregation(rule);
    }
  }

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    // TODO: Clean up any scheduled jobs or event listeners
  }

  async executeRule(ruleId: string, data?: any): Promise<any> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Aggregation rule not found: ${ruleId}`);
    }

    try {
      // Parse source pattern (e.g., "property.*" -> model: "property", filter: "*")
      const { model, filter } = this.parseSourcePattern(rule.source);
      
      // Fetch data from participating tenants
      const sourceData = await this.fetchSourceData(model, filter, rule.filter);
      
      // Apply transformations
      const transformedData = await this.applyTransformations(sourceData, rule.transformations);
      
      // Store aggregated data
      await this.storeAggregatedData(ruleId, transformedData);
      
      return transformedData;
    } catch (error) {
      console.error(`Error executing aggregation rule ${ruleId}:`, error);
      await this.updateRuleStatus(ruleId, "error");
      throw error;
    }
  }

  private setupRealtimeAggregation(rule: any): void {
    // Listen for relevant data changes
    const eventPattern = this.getEventPattern(rule.source);
    this.eventBus.subscribe(eventPattern, async (event: any) => {
      await this.executeRule(rule.id, event.data);
    });
  }

  private setupScheduledAggregation(rule: any): void {
    // TODO: Implement cron-based scheduling
    console.log(`Setting up scheduled aggregation for rule ${rule.id} with interval ${rule.schedule.interval}`);
  }

  private parseSourcePattern(source: string): { model: string; filter: string } {
    const [model, filter = "*"] = source.split(".");
    return { model, filter };
  }

  private async fetchSourceData(model: string, filter: string, conditions: string): Promise<any[]> {
    // TODO: Implement actual data fetching from tenant databases
    // This would query all participating tenants for the specified model/filter
    console.log(`Fetching data for model: ${model}, filter: ${filter}, conditions: ${conditions}`);
    return [];
  }

  private async applyTransformations(data: any[], transformations: any[]): Promise<any[]> {
    let result = data;
    
    for (const transformation of transformations) {
      switch (transformation.operation) {
        case "map":
          result = result.map(item => this.mapTransformation(item, transformation.config));
          break;
        case "filter":
          result = result.filter(item => this.filterTransformation(item, transformation.config));
          break;
        case "aggregate":
          result = [this.aggregateTransformation(result, transformation.config)];
          break;
        case "enrich":
          result = await Promise.all(result.map(item => this.enrichTransformation(item, transformation.config)));
          break;
      }
    }
    
    return result;
  }

  private mapTransformation(item: any, config: any): any {
    // Apply field mapping/renaming
    const mapped: any = {};
    for (const [sourceField, targetField] of Object.entries(config.fieldMap || {})) {
      mapped[targetField as string] = item[sourceField];
    }
    return { ...item, ...mapped };
  }

  private filterTransformation(item: any, config: any): boolean {
    // Apply filtering logic based on config
    for (const [field, condition] of Object.entries(config.conditions || {})) {
      const value = item[field];
      if (!this.evaluateCondition(value, condition)) {
        return false;
      }
    }
    return true;
  }

  private aggregateTransformation(items: any[], config: any): any {
    // Perform aggregation (sum, count, avg, etc.)
    const result: any = {};
    
    for (const [field, operation] of Object.entries(config.operations || {})) {
      switch (operation) {
        case "count":
          result[field] = items.length;
          break;
        case "sum":
          result[field] = items.reduce((sum, item) => sum + (item[field] || 0), 0);
          break;
        case "avg":
          result[field] = items.reduce((sum, item) => sum + (item[field] || 0), 0) / items.length;
          break;
        case "max":
          result[field] = Math.max(...items.map(item => item[field] || 0));
          break;
        case "min":
          result[field] = Math.min(...items.map(item => item[field] || 0));
          break;
      }
    }
    
    return result;
  }

  private async enrichTransformation(item: any, config: any): Promise<any> {
    // Enrich data with additional information
    const enriched = { ...item };
    
    // TODO: Implement enrichment logic (e.g., geocoding, external API calls)
    if (config.geocode && item.address) {
      enriched.coordinates = await this.geocodeAddress(item.address);
    }
    
    return enriched;
  }

  private evaluateCondition(value: any, condition: any): boolean {
    // Simple condition evaluation - extend as needed
    if (typeof condition === "object") {
      if (condition.$eq !== undefined) return value === condition.$eq;
      if (condition.$ne !== undefined) return value !== condition.$ne;
      if (condition.$gt !== undefined) return value > condition.$gt;
      if (condition.$gte !== undefined) return value >= condition.$gte;
      if (condition.$lt !== undefined) return value < condition.$lt;
      if (condition.$lte !== undefined) return value <= condition.$lte;
      if (condition.$in !== undefined) return condition.$in.includes(value);
      if (condition.$nin !== undefined) return !condition.$nin.includes(value);
    }
    return value === condition;
  }

  private async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    // TODO: Implement actual geocoding
    console.log(`Geocoding address: ${address}`);
    return null;
  }

  private getEventPattern(source: string): string {
    const { model } = this.parseSourcePattern(source);
    return `${model}.*`; // Listen to all events for this model
  }

  private async storeAggregatedData(ruleId: string, data: any): Promise<void> {
    // TODO: Store in hub's aggregated data storage
    console.log(`Storing aggregated data for rule ${ruleId}:`, data);
  }

  private async updateRuleStatus(ruleId: string, status: string): Promise<void> {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.status = status;
      this.rules.set(ruleId, rule);
    }
  }
}

// Event bus for cross-tenant communication (mock implementation)
export class EventBus {
  private listeners: Map<string, Array<(event: any) => void>> = new Map();

  subscribe(pattern: string, callback: (event: any) => void): void {
    if (!this.listeners.has(pattern)) {
      this.listeners.set(pattern, []);
    }
    this.listeners.get(pattern)!.push(callback);
  }

  publish(event: string, data: any): void {
    // Find matching patterns and notify listeners
    for (const [pattern, callbacks] of this.listeners.entries()) {
      if (this.matchesPattern(event, pattern)) {
        callbacks.forEach(callback => {
          try {
            callback({ event, data, timestamp: new Date() });
          } catch (error) {
            console.error(`Error in event listener for ${event}:`, error);
          }
        });
      }
    }
  }

  private matchesPattern(event: string, pattern: string): boolean {
    // Simple pattern matching - extend for more sophisticated matching
    if (pattern === "*") return true;
    if (pattern.endsWith(".*")) {
      const prefix = pattern.slice(0, -2);
      return event.startsWith(prefix);
    }
    return event === pattern;
  }
}

// Hub management utilities
export class HubManager {
  private hubs: Map<string, HubConfig> = new Map();
  private aggregationEngine: AggregationEngine;

  constructor() {
    this.aggregationEngine = new AggregationEngine(new EventBus());
  }

  createHub(config: HubConfig): void {
    const validation = this.validateHub(config);
    if (!validation.valid) {
      throw new Error(`Invalid hub configuration: ${validation.errors.join(', ')}`);
    }

    this.hubs.set(config.key, config);
    
    // Set up aggregation rules
    config.aggregationRules.forEach(rule => {
      this.aggregationEngine.addRule(rule);
    });
  }

  getHub(key: string): HubConfig | undefined {
    return this.hubs.get(key);
  }

  updateHub(key: string, updates: Partial<HubConfig>): void {
    const existing = this.hubs.get(key);
    if (!existing) {
      throw new Error(`Hub not found: ${key}`);
    }

    const updated = { ...existing, ...updates };
    const validation = this.validateHub(updated);
    if (!validation.valid) {
      throw new Error(`Invalid hub configuration: ${validation.errors.join(', ')}`);
    }

    this.hubs.set(key, updated);
  }

  deleteHub(key: string): boolean {
    const hub = this.hubs.get(key);
    if (hub) {
      // Clean up aggregation rules
      hub.aggregationRules.forEach(rule => {
        this.aggregationEngine.removeRule(rule.id);
      });
    }
    return this.hubs.delete(key);
  }

  getAllHubs(): HubConfig[] {
    return Array.from(this.hubs.values());
  }

  getHubsByType(type: string): HubConfig[] {
    return this.getAllHubs().filter(hub => hub.type === type);
  }

  private validateHub(config: any): { valid: boolean; errors: string[] } {
    try {
      hubConfigSchema.parse(config);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        return { valid: false, errors };
      }
      return { valid: false, errors: [error.message] };
    }
  }
}

// Example hub configurations
export const EXAMPLE_HUBS = {
  ownernet: {
    key: "ownernet",
    name: "OwnerNET",
    description: "A comprehensive directory for property owners and managers to connect, share resources, and collaborate",
    type: "directory" as const,
    version: "1.0.0",
    aggregationRules: [
      {
        id: "property-listings",
        name: "Property Listings",
        source: "property.*",
        filter: "status = 'active'",
        fields: ["title", "price", "location", "type", "bedrooms", "bathrooms"],
        transformations: [
          {
            field: "location",
            operation: "enrich" as const,
            config: { geocode: true }
          }
        ],
        schedule: { type: "realtime" as const },
        status: "active" as const,
      },
      {
        id: "service-providers",
        name: "Service Providers",
        source: "service.*",
        filter: "verified = true",
        fields: ["name", "category", "rating", "contact", "services"],
        transformations: [
          {
            field: "rating",
            operation: "aggregate" as const,
            config: { operations: { avgRating: "avg" } }
          }
        ],
        schedule: { type: "scheduled" as const, interval: "0 */6 * * *" }, // Every 6 hours
        status: "active" as const,
      }
    ],
    moderation: {
      enabled: true,
      autoApprove: false,
      contentFilters: [
        {
          type: "profanity" as const,
          config: { strictness: "medium" },
          action: "flag" as const,
        },
        {
          type: "quality" as const,
          config: { minScore: 0.7 },
          action: "reject" as const,
        }
      ],
      reviewQueue: {
        enabled: true,
        priority: "priority" as const,
        autoAssign: true,
      },
    },
    verification: {
      enabled: true,
      levels: [
        {
          id: "basic",
          name: "Basic Verification",
          requirements: ["email", "phone"],
          privileges: ["post_listings", "contact_members"],
        },
        {
          id: "premium",
          name: "Premium Verification",
          requirements: ["email", "phone", "document", "address"],
          privileges: ["post_listings", "contact_members", "featured_listings", "bulk_operations"],
        }
      ],
      autoVerify: false,
    },
    revenueModel: {
      type: "hybrid" as const,
      joiningFee: 500,
      listingFee: 100,
      featuredListingFee: 500,
      commissionRate: 2.5,
      transactionFee: 1.5,
      payoutSchedule: "weekly" as const,
      minimumPayout: 1000,
    },
    directory: {
      enabled: true,
      searchable: true,
      categories: [
        { id: "residential", name: "Residential Properties", icon: "home" },
        { id: "commercial", name: "Commercial Properties", icon: "building" },
        { id: "services", name: "Property Services", icon: "tools" },
      ],
      filters: [
        { field: "price", type: "range" as const },
        { field: "bedrooms", type: "select" as const, options: ["1", "2", "3", "4+"] },
        { field: "type", type: "select" as const, options: ["apartment", "house", "condo", "townhouse"] },
      ],
      sorting: [
        { field: "price", label: "Price", direction: "asc" as const },
        { field: "createdAt", label: "Newest", direction: "desc" as const },
        { field: "rating", label: "Rating", direction: "desc" as const },
      ],
    },
    seo: {
      title: "OwnerNET - Property Owner Directory",
      description: "Connect with property owners and managers nationwide. Find properties, services, and resources in one comprehensive directory.",
      keywords: ["property", "real estate", "owners", "management", "directory"],
      ogImage: "https://ownernet.com/og-image.jpg",
    },
    legal: {
      termsOfService: "https://ownernet.com/terms",
      privacyPolicy: "https://ownernet.com/privacy",
      dataRetention: {
        period: 2555, // 7 years
        autoDelete: false,
      },
      compliance: ["GDPR", "CCPA"],
    },
  } as HubConfig,
};
