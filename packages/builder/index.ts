// Builder package - CRUD Module Builder with DSL and code generation
export * from './dsl';
export * from './generator';

// Re-export commonly used types and utilities
export type { ModelDSL, FieldDefinition, FieldType } from './dsl';
export type { GeneratedFiles } from './generator';

// Builder version and metadata
export const BUILDER_VERSION = '1.0.0';
export const BUILDER_COMPATIBILITY = {
  kernel: '^1.0.0',
  prisma: '^5.0.0',
  nestjs: '^10.0.0',
  nextjs: '^14.0.0',
};

// Default builder configuration
export const DEFAULT_BUILDER_CONFIG = {
  generation: {
    outputDir: './generated',
    includeTests: true,
    includeDocs: true,
    generateMigrations: true,
  },
  validation: {
    strict: true,
    allowCustomFields: true,
    maxFields: 50,
  },
  templates: {
    prismaTemplate: 'default',
    controllerTemplate: 'rest',
    adminTemplate: 'shadcn',
  },
};

// Initialize builder with configuration
export function initializeBuilder(config: Partial<typeof DEFAULT_BUILDER_CONFIG> = {}) {
  const mergedConfig = { ...DEFAULT_BUILDER_CONFIG, ...config };
  
  console.log(`🔧 WytNet Builder v${BUILDER_VERSION} initialized`);
  console.log(`   - Output: ${mergedConfig.generation.outputDir}`);
  console.log(`   - Validation: ${mergedConfig.validation.strict ? 'strict' : 'loose'}`);
  console.log(`   - Templates: ${mergedConfig.templates.adminTemplate}`);
  
  return mergedConfig;
}

// Builder health check
export function getBuilderHealth() {
  return {
    version: BUILDER_VERSION,
    status: 'healthy',
    dslSupported: Object.values(import('./dsl').then(m => m.FieldType)),
    generationTargets: ['prisma', 'nestjs', 'nextjs'],
    timestamp: new Date().toISOString(),
  };
}

// Utility functions for builder operations
export function validateBuilderCompatibility(dependencies: Record<string, string>): boolean {
  // Check if provided dependencies match builder compatibility requirements
  const requiredDeps = BUILDER_COMPATIBILITY;
  
  for (const [dep, requiredVersion] of Object.entries(requiredDeps)) {
    if (!dependencies[dep]) {
      console.warn(`Missing dependency: ${dep}`);
      return false;
    }
    // In a real implementation, we'd use semver to check version compatibility
  }
  
  return true;
}
