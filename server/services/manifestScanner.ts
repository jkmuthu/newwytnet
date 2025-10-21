import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { db } from '../db';
import { platformModules } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Manifest JSON Schema for validation
const manifestSchema = z.object({
  id: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'ID must be kebab-case'),
  name: z.string().min(3).max(255),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be semantic version (X.Y.Z)'),
  category: z.enum(['platform', 'wythubs', 'wytapps', 'wytgames']),
  type: z.string().min(1).max(50),
  
  // Optional fields
  description: z.string().optional(),
  author: z.string().optional(),
  license: z.string().optional(),
  contexts: z.array(z.enum(['platform', 'hub', 'app', 'game'])).optional().default(['platform', 'hub', 'app', 'game']),
  dependencies: z.array(z.string()).optional().default([]),
  conflicts: z.array(z.string()).optional().default([]),
  
  api: z.object({
    endpoints: z.array(z.object({
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
      path: z.string(),
      auth: z.boolean().optional().default(true),
      permissions: z.array(z.string()).optional().default([]),
      description: z.string().optional(),
    })).optional().default([]),
    webhooks: z.array(z.object({
      path: z.string(),
      events: z.array(z.string()),
    })).optional().default([]),
  }).optional().default({ endpoints: [], webhooks: [] }),
  
  ui: z.object({
    route: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    adminPanel: z.boolean().optional().default(false),
  }).optional(),
  
  settings: z.object({
    required: z.record(z.object({
      type: z.enum(['string', 'number', 'boolean', 'array', 'object', 'enum']),
      secret: z.boolean().optional().default(false),
      description: z.string().optional(),
      validation: z.string().optional(),
      default: z.any().optional(),
      enum: z.array(z.any()).optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })).optional().default({}),
    optional: z.record(z.object({
      type: z.enum(['string', 'number', 'boolean', 'array', 'object', 'enum']),
      secret: z.boolean().optional().default(false),
      description: z.string().optional(),
      validation: z.string().optional(),
      default: z.any().optional(),
      enum: z.array(z.any()).optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })).optional().default({}),
  }).optional(),
  
  permissions: z.object({
    required: z.array(z.string()).optional().default([]),
    optional: z.array(z.string()).optional().default([]),
  }).optional(),
  
  compatibility: z.object({
    minPlatformVersion: z.string().optional(),
    maxPlatformVersion: z.string().optional(),
    nodeVersion: z.string().optional(),
  }).optional(),
  
  pricing: z.object({
    model: z.enum(['free', 'paid', 'freemium', 'subscription']).optional().default('free'),
    price: z.number().optional().default(0),
    currency: z.string().optional().default('INR'),
  }).optional(),
  
  hooks: z.object({
    onInstall: z.string().optional(),
    onUninstall: z.string().optional(),
    onActivate: z.string().optional(),
    onDeactivate: z.string().optional(),
  }).optional(),
  
  features: z.array(z.string()).optional().default([]),
  metadata: z.object({
    repository: z.string().optional(),
    documentation: z.string().optional(),
    support: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
  }).optional(),
});

export type ModuleManifest = z.infer<typeof manifestSchema>;

export interface ScanResult {
  discovered: number;
  registered: number;
  updated: number;
  errors: Array<{ path: string; error: string }>;
}

export class ManifestScanner {
  private scanPaths = [
    path.join(process.cwd(), 'packages'),
    path.join(process.cwd(), 'modules'),
  ];

  /**
   * Scan all configured directories for manifest.json files
   */
  async scanAll(): Promise<ScanResult> {
    const result: ScanResult = {
      discovered: 0,
      registered: 0,
      updated: 0,
      errors: [],
    };

    for (const scanPath of this.scanPaths) {
      try {
        const pathResult = await this.scanDirectory(scanPath);
        result.discovered += pathResult.discovered;
        result.registered += pathResult.registered;
        result.updated += pathResult.updated;
        result.errors.push(...pathResult.errors);
      } catch (error) {
        console.error(`Error scanning directory ${scanPath}:`, error);
        result.errors.push({
          path: scanPath,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  /**
   * Scan a specific directory for manifest.json files
   */
  private async scanDirectory(dirPath: string): Promise<ScanResult> {
    const result: ScanResult = {
      discovered: 0,
      registered: 0,
      updated: 0,
      errors: [],
    };

    try {
      // Check if directory exists
      const exists = await fs.access(dirPath).then(() => true).catch(() => false);
      if (!exists) {
        console.log(`Directory not found: ${dirPath}, skipping...`);
        return result;
      }

      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const manifestPath = path.join(dirPath, entry.name, 'manifest.json');
          const manifestExists = await fs.access(manifestPath).then(() => true).catch(() => false);

          if (manifestExists) {
            result.discovered++;
            try {
              const registerResult = await this.processManifest(manifestPath);
              if (registerResult.created) {
                result.registered++;
              } else if (registerResult.updated) {
                result.updated++;
              }
            } catch (error) {
              result.errors.push({
                path: manifestPath,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }
        }
      }
    } catch (error) {
      result.errors.push({
        path: dirPath,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return result;
  }

  /**
   * Validate that all dependencies exist in the database
   */
  private async validateDependencies(dependencies: string[]): Promise<string[]> {
    const existingModules = await db
      .select({ id: platformModules.id })
      .from(platformModules);

    const existingIds = new Set(existingModules.map(m => m.id));
    const missingDeps = dependencies.filter(dep => !existingIds.has(dep));

    return missingDeps;
  }

  /**
   * Validate that no conflicting modules are currently active
   */
  private async validateConflicts(conflicts: string[]): Promise<string[]> {
    if (conflicts.length === 0) return [];

    const activeModules = await db
      .select({ id: platformModules.id })
      .from(platformModules)
      .where(eq(platformModules.status, 'enabled'));

    const activeIds = new Set(activeModules.map(m => m.id));
    const activeConflicts = conflicts.filter(conflict => activeIds.has(conflict));

    return activeConflicts;
  }

  /**
   * Process a single manifest file
   */
  private async processManifest(manifestPath: string): Promise<{ created: boolean; updated: boolean }> {
    // Read and parse manifest file
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifestData = JSON.parse(manifestContent);

    // Validate manifest schema
    const manifest = manifestSchema.parse(manifestData);

    // Validate dependencies - ensure all required modules exist
    if (manifest.dependencies && manifest.dependencies.length > 0) {
      const missingDeps = await this.validateDependencies(manifest.dependencies);
      if (missingDeps.length > 0) {
        throw new Error(
          `Missing dependencies: ${missingDeps.join(', ')}. Install required modules first.`
        );
      }
    }

    // Validate conflicts - ensure conflicting modules are not active
    if (manifest.conflicts && manifest.conflicts.length > 0) {
      const activeConflicts = await this.validateConflicts(manifest.conflicts);
      if (activeConflicts.length > 0) {
        throw new Error(
          `Conflicting modules are active: ${activeConflicts.join(', ')}. Deactivate them first.`
        );
      }
    }

    // Check if module already exists
    const [existingModule] = await db
      .select()
      .from(platformModules)
      .where(eq(platformModules.id, manifest.id))
      .limit(1);

    // Prepare module data for database
    const moduleData = {
      id: manifest.id,
      name: manifest.name,
      description: manifest.description || null,
      category: manifest.category,
      type: manifest.type,
      version: manifest.version,
      contexts: manifest.contexts || ['platform', 'hub', 'app', 'game'],
      dependencies: manifest.dependencies || [],
      apiEndpoints: manifest.api?.endpoints || [],
      settings: {
        required: manifest.settings?.required || {},
        optional: manifest.settings?.optional || {},
      },
      compatibilityMatrix: manifest.compatibility || {},
      pricing: manifest.pricing?.model || 'free',
      price: manifest.pricing?.price ? manifest.pricing.price.toString() : null,
      currency: manifest.pricing?.currency || 'INR',
      icon: manifest.ui?.icon || null,
      color: manifest.ui?.color || 'blue',
      route: manifest.ui?.route || null,
      features: manifest.features || [],
      metadata: {
        ...manifest.metadata,
        manifestPath,
        hooks: manifest.hooks || {},
        permissions: manifest.permissions || {},
      },
      status: 'enabled',
    };

    if (existingModule) {
      // Update existing module
      await db
        .update(platformModules)
        .set({
          ...moduleData,
          updatedAt: new Date(),
        })
        .where(eq(platformModules.id, manifest.id));

      console.log(`  ✓ Updated module from manifest: ${manifest.name} (${manifest.id})`);
      return { created: false, updated: true };
    } else {
      // Insert new module
      await db.insert(platformModules).values(moduleData);

      console.log(`  ✓ Registered new module from manifest: ${manifest.name} (${manifest.id})`);
      return { created: true, updated: false };
    }
  }

  /**
   * Validate a manifest file without registering it
   */
  async validateManifest(manifestPath: string): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifestData = JSON.parse(manifestContent);
      manifestSchema.parse(manifestData);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}

// Singleton instance
export const manifestScanner = new ManifestScanner();
