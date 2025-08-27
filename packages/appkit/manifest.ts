// App manifest schema and utilities for WytApps
import { z } from "zod";

// App manifest schema
export const appManifestSchema = z.object({
  // Basic app information
  key: z.string().min(1).regex(/^[a-z0-9-]+$/, "App key must be lowercase alphanumeric with dashes"),
  name: z.string().min(1).max(100),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must follow semver format (x.y.z)"),
  description: z.string().max(500),
  icon: z.string().url().optional(),
  
  // Categorization
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  
  // Dependencies and compatibility
  dependencies: z.object({
    kernel: z.string().default("^1.0.0"),
    builder: z.string().optional(),
    cms: z.string().optional(),
  }).default({}),
  
  // Modules included in this app
  modules: z.array(z.object({
    id: z.string(),
    name: z.string(),
    required: z.boolean().default(true),
    version: z.string().optional(),
  })).default([]),
  
  // CMS blocks provided by this app
  blocks: z.array(z.object({
    type: z.string(),
    name: z.string(),
    icon: z.string().optional(),
    category: z.string().default("custom"),
  })).default([]),
  
  // App routes and pages
  routes: z.object({
    admin: z.array(z.object({
      path: z.string(),
      component: z.string(),
      title: z.string(),
      icon: z.string().optional(),
      permissions: z.array(z.string()).default([]),
    })).default([]),
    user: z.array(z.object({
      path: z.string(),
      component: z.string(),
      title: z.string(),
      public: z.boolean().default(false),
    })).default([]),
    api: z.array(z.object({
      path: z.string(),
      method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
      handler: z.string(),
      permissions: z.array(z.string()).default([]),
    })).default([]),
  }).default({}),
  
  // Workflow definitions
  workflows: z.array(z.object({
    id: z.string(),
    name: z.string(),
    trigger: z.object({
      type: z.enum(["webhook", "schedule", "event", "manual"]),
      config: z.record(z.any()).default({}),
    }),
    actions: z.array(z.object({
      type: z.enum(["notify", "webhook", "email", "database", "custom"]),
      config: z.record(z.any()).default({}),
    })),
    active: z.boolean().default(true),
  })).default([]),
  
  // External service connectors
  connectors: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["api", "database", "storage", "messaging", "payment"]),
    config: z.object({
      baseUrl: z.string().url().optional(),
      authType: z.enum(["none", "apiKey", "oauth", "bearer"]).default("none"),
      required: z.boolean().default(false),
    }),
    permissions: z.array(z.string()).default([]),
  })).default([]),
  
  // Required permissions
  permissions: z.array(z.object({
    scope: z.string(),
    description: z.string(),
    required: z.boolean().default(true),
  })).default([]),
  
  // Metering and usage tracking
  metering: z.array(z.object({
    metric: z.string(),
    description: z.string(),
    unit: z.string(),
    aggregation: z.enum(["sum", "count", "max", "avg"]).default("sum"),
  })).default([]),
  
  // Pricing configuration
  pricing: z.object({
    model: z.enum(["free", "freemium", "subscription", "usage", "one_time"]).default("free"),
    tiers: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number().min(0),
      currency: z.string().default("INR"),
      interval: z.enum(["monthly", "yearly", "one_time"]).optional(),
      features: z.array(z.string()).default([]),
      limits: z.record(z.number()).default({}),
      popular: z.boolean().default(false),
    })).default([]),
    trial: z.object({
      enabled: z.boolean().default(false),
      duration: z.number().default(14), // days
      tier: z.string().optional(),
    }).optional(),
  }).default({}),
  
  // Database migrations for this app
  migrations: z.array(z.object({
    version: z.string(),
    description: z.string(),
    up: z.string(), // SQL or migration file path
    down: z.string(), // Rollback SQL or migration file path
  })).default([]),
  
  // Internationalization
  i18n: z.object({
    supported: z.array(z.string()).default(["en-IN"]),
    default: z.string().default("en-IN"),
    fallback: z.string().default("en-IN"),
  }).default({}),
  
  // App configuration schema
  config: z.object({
    schema: z.record(z.any()).default({}),
    defaults: z.record(z.any()).default({}),
  }).default({}),
  
  // Build and deployment configuration
  build: z.object({
    entry: z.string().default("index.ts"),
    output: z.string().default("dist"),
    assets: z.array(z.string()).default([]),
    env: z.record(z.string()).default({}),
  }).optional(),
  
  // App metadata
  metadata: z.object({
    author: z.string().optional(),
    license: z.string().default("MIT"),
    repository: z.string().url().optional(),
    homepage: z.string().url().optional(),
    support: z.string().email().optional(),
    keywords: z.array(z.string()).default([]),
  }).optional(),
});

export type AppManifest = z.infer<typeof appManifestSchema>;

// App builder utilities
export class AppBuilder {
  static createManifest(config: Partial<AppManifest>): AppManifest {
    const defaultManifest: Partial<AppManifest> = {
      version: "1.0.0",
      categories: [],
      tags: [],
      dependencies: { kernel: "^1.0.0" },
      modules: [],
      blocks: [],
      routes: { admin: [], user: [], api: [] },
      workflows: [],
      connectors: [],
      permissions: [],
      metering: [],
      pricing: { model: "free", tiers: [] },
      migrations: [],
      i18n: { supported: ["en-IN"], default: "en-IN", fallback: "en-IN" },
      config: { schema: {}, defaults: {} },
    };

    return appManifestSchema.parse({ ...defaultManifest, ...config });
  }

  static validateManifest(manifest: any): { valid: boolean; errors: string[] } {
    try {
      appManifestSchema.parse(manifest);
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

  static generateAppPackage(manifest: AppManifest): { 
    manifest: AppManifest;
    packageJson: any;
    dockerfile: string;
    readme: string;
  } {
    const packageJson = {
      name: `@wytnet/app-${manifest.key}`,
      version: manifest.version,
      description: manifest.description,
      main: "dist/index.js",
      types: "dist/index.d.ts",
      files: ["dist/**/*"],
      scripts: {
        build: "tsc",
        dev: "tsc --watch",
        test: "jest",
        lint: "eslint src/**/*.ts",
      },
      dependencies: {
        "@wytnet/kernel": manifest.dependencies.kernel,
        ...(manifest.dependencies.builder && { "@wytnet/builder": manifest.dependencies.builder }),
        ...(manifest.dependencies.cms && { "@wytnet/cms": manifest.dependencies.cms }),
      },
      devDependencies: {
        typescript: "^5.0.0",
        "@types/node": "^20.0.0",
        jest: "^29.0.0",
        eslint: "^8.0.0",
      },
      keywords: manifest.metadata?.keywords || [],
      author: manifest.metadata?.author,
      license: manifest.metadata?.license || "MIT",
      repository: manifest.metadata?.repository,
      homepage: manifest.metadata?.homepage,
    };

    const dockerfile = `
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
    `.trim();

    const readme = `
# ${manifest.name}

${manifest.description}

## Version
${manifest.version}

## Installation

\`\`\`bash
npm install @wytnet/app-${manifest.key}
\`\`\`

## Configuration

This app requires the following permissions:
${manifest.permissions.map(p => `- ${p.scope}: ${p.description}`).join('\n')}

## Pricing

${manifest.pricing.tiers.map(tier => `
### ${tier.name}
- Price: ${tier.price} ${tier.currency}${tier.interval ? `/${tier.interval}` : ''}
- Features: ${tier.features.join(', ')}
`).join('\n')}

## Support

${manifest.metadata?.support ? `Email: ${manifest.metadata.support}` : 'No support contact provided'}
    `.trim();

    return {
      manifest,
      packageJson,
      dockerfile,
      readme,
    };
  }

  static calculateAppCost(manifest: AppManifest, usage: Record<string, number> = {}): {
    tier: string;
    cost: number;
    currency: string;
    interval?: string;
    overages: Array<{ metric: string; units: number; cost: number }>;
  } {
    // Simple cost calculation - in production would be more sophisticated
    const freeTier = manifest.pricing.tiers.find(t => t.price === 0);
    if (freeTier && Object.keys(usage).length === 0) {
      return {
        tier: freeTier.id,
        cost: 0,
        currency: freeTier.currency,
        interval: freeTier.interval,
        overages: [],
      };
    }

    // For now, return the first paid tier
    const paidTier = manifest.pricing.tiers.find(t => t.price > 0);
    if (paidTier) {
      return {
        tier: paidTier.id,
        cost: paidTier.price,
        currency: paidTier.currency,
        interval: paidTier.interval,
        overages: [],
      };
    }

    return {
      tier: 'free',
      cost: 0,
      currency: 'INR',
      overages: [],
    };
  }
}

// App registry for managing installed apps
export class AppRegistry {
  private apps: Map<string, AppManifest> = new Map();

  registerApp(manifest: AppManifest): void {
    const validation = AppBuilder.validateManifest(manifest);
    if (!validation.valid) {
      throw new Error(`Invalid app manifest: ${validation.errors.join(', ')}`);
    }
    this.apps.set(manifest.key, manifest);
  }

  getApp(key: string): AppManifest | undefined {
    return this.apps.get(key);
  }

  getAllApps(): AppManifest[] {
    return Array.from(this.apps.values());
  }

  getAppsByCategory(category: string): AppManifest[] {
    return this.getAllApps().filter(app => app.categories.includes(category));
  }

  searchApps(query: string): AppManifest[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllApps().filter(app => 
      app.name.toLowerCase().includes(lowerQuery) ||
      app.description.toLowerCase().includes(lowerQuery) ||
      app.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  unregisterApp(key: string): boolean {
    return this.apps.delete(key);
  }
}

// Example app manifests
export const EXAMPLE_APPS = {
  wytcrm: AppBuilder.createManifest({
    key: "wytcrm",
    name: "WytCRM",
    description: "Complete CRM solution with contact, lead, and deal management",
    categories: ["crm", "business", "sales"],
    tags: ["contacts", "leads", "deals", "pipeline"],
    modules: [
      { id: "contact", name: "Contact Module", required: true },
      { id: "lead", name: "Lead Module", required: true },
      { id: "deal", name: "Deal Module", required: true },
    ],
    routes: {
      admin: [
        { path: "/contacts", component: "ContactList", title: "Contacts", icon: "address-book" },
        { path: "/leads", component: "LeadList", title: "Leads", icon: "chart-line" },
        { path: "/deals", component: "DealList", title: "Deals", icon: "handshake" },
        { path: "/pipeline", component: "Pipeline", title: "Sales Pipeline", icon: "tasks" },
      ],
      user: [
        { path: "/dashboard", component: "Dashboard", title: "Dashboard" },
        { path: "/contacts/:id", component: "ContactDetail", title: "Contact Details" },
      ],
      api: [
        { path: "/contacts", method: "GET", handler: "ContactController.list" },
        { path: "/contacts", method: "POST", handler: "ContactController.create" },
        { path: "/leads/:id/convert", method: "POST", handler: "LeadController.convert" },
      ],
    },
    workflows: [
      {
        id: "lead-assignment",
        name: "Auto-assign Leads",
        trigger: { type: "event", config: { event: "lead.created" } },
        actions: [
          { type: "custom", config: { handler: "assignToSalesRep" } },
          { type: "notify", config: { template: "lead-assigned" } },
        ],
      },
    ],
    permissions: [
      { scope: "contacts.read", description: "View contacts", required: true },
      { scope: "contacts.write", description: "Create and edit contacts", required: true },
      { scope: "leads.read", description: "View leads", required: true },
      { scope: "leads.write", description: "Create and edit leads", required: true },
      { scope: "deals.read", description: "View deals", required: true },
      { scope: "deals.write", description: "Create and edit deals", required: true },
    ],
    metering: [
      { metric: "contacts", description: "Number of contacts", unit: "count" },
      { metric: "deals", description: "Number of deals", unit: "count" },
      { metric: "emails_sent", description: "Emails sent", unit: "count" },
    ],
    pricing: {
      model: "freemium",
      tiers: [
        {
          id: "free",
          name: "Free",
          price: 0,
          currency: "INR",
          features: ["Up to 100 contacts", "Basic lead management", "Email support"],
          limits: { contacts: 100, deals: 50 },
        },
        {
          id: "pro",
          name: "Professional",
          price: 999,
          currency: "INR",
          interval: "monthly",
          features: ["Up to 10,000 contacts", "Advanced pipeline", "Email automation", "Priority support"],
          limits: { contacts: 10000, deals: 1000 },
          popular: true,
        },
        {
          id: "enterprise",
          name: "Enterprise",
          price: 2999,
          currency: "INR",
          interval: "monthly",
          features: ["Unlimited contacts", "Custom workflows", "API access", "24/7 support"],
          limits: {},
        },
      ],
      trial: { enabled: true, duration: 14, tier: "pro" },
    },
    metadata: {
      author: "WytNet Team",
      license: "MIT",
      keywords: ["crm", "sales", "contacts", "leads", "pipeline"],
    },
  }),
};
