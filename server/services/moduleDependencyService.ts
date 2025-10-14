import { MODULE_CATALOG, getModuleById, validateModuleDependencies, checkModuleConflicts } from '../modules-catalog';
import { db } from '../db';
import { platformModuleActivations, hubModuleActivations, appModuleActivations } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface ModuleActivationResult {
  success: boolean;
  message: string;
  autoEnabledModules?: string[];
  conflicts?: string[];
  errors?: string[];
}

export class ModuleDependencyService {
  /**
   * Activate a module in a specific context with dependency resolution
   */
  async activateModuleWithDependencies(
    moduleId: string,
    context: 'platform' | 'hub' | 'app' | 'game',
    contextId?: string, // hubId or appId (not needed for platform)
    activatedBy?: string
  ): Promise<ModuleActivationResult> {
    const module = getModuleById(moduleId);
    
    if (!module) {
      return {
        success: false,
        message: `Module '${moduleId}' not found`,
        errors: [`Module '${moduleId}' does not exist`]
      };
    }

    // Check if module supports this context
    if (!module.contexts.includes(context)) {
      return {
        success: false,
        message: `Module '${module.name}' cannot be activated in '${context}' context`,
        errors: [`Module does not support ${context} context. Supported: ${module.contexts.join(', ')}`]
      };
    }

    // Get currently enabled modules in this context
    const enabledModules = await this.getEnabledModulesInContext(context, contextId);
    
    // Check for conflicts
    const conflictCheck = checkModuleConflicts(moduleId, enabledModules);
    if (conflictCheck.hasConflict) {
      return {
        success: false,
        message: `Module '${module.name}' conflicts with already enabled modules`,
        conflicts: conflictCheck.conflicts,
        errors: [`Conflicts with: ${conflictCheck.conflicts.map(c => getModuleById(c)?.name).join(', ')}`]
      };
    }

    // Check dependencies
    const depCheck = validateModuleDependencies(moduleId, enabledModules);
    const autoEnabledModules: string[] = [];
    
    if (!depCheck.valid) {
      // Auto-enable missing dependencies
      for (const depId of depCheck.missing) {
        const depModule = getModuleById(depId);
        if (!depModule) {
          return {
            success: false,
            message: `Required dependency '${depId}' not found`,
            errors: [`Dependency module '${depId}' does not exist`]
          };
        }

        // Recursively activate dependency
        const depResult = await this.activateModuleWithDependencies(depId, context, contextId, activatedBy);
        if (!depResult.success) {
          return {
            success: false,
            message: `Failed to activate required dependency '${depModule.name}'`,
            errors: depResult.errors
          };
        }
        
        autoEnabledModules.push(depId);
        if (depResult.autoEnabledModules) {
          autoEnabledModules.push(...depResult.autoEnabledModules);
        }
      }
    }

    // Activate the module
    try {
      if (context === 'platform') {
        await this.activatePlatformModule(moduleId, context, activatedBy);
      } else if (context === 'hub' && contextId) {
        await this.activateHubModule(contextId, moduleId, activatedBy);
      } else if (context === 'app' && contextId) {
        await this.activateAppModule(contextId, moduleId, activatedBy);
      }

      return {
        success: true,
        message: `Module '${module.name}' activated successfully${autoEnabledModules.length > 0 ? ` with ${autoEnabledModules.length} dependencies` : ''}`,
        autoEnabledModules: autoEnabledModules.length > 0 ? autoEnabledModules : undefined
      };
    } catch (error) {
      console.error('Module activation error:', error);
      return {
        success: false,
        message: `Failed to activate module '${module.name}'`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Deactivate a module with dependent modules check
   */
  async deactivateModule(
    moduleId: string,
    context: 'platform' | 'hub' | 'app' | 'game',
    contextId?: string,
    force: boolean = false
  ): Promise<ModuleActivationResult> {
    const module = getModuleById(moduleId);
    
    if (!module) {
      return {
        success: false,
        message: `Module '${moduleId}' not found`,
        errors: [`Module '${moduleId}' does not exist`]
      };
    }

    // Check if other enabled modules depend on this one
    const enabledModules = await this.getEnabledModulesInContext(context, contextId);
    const dependentModules = MODULE_CATALOG.filter(m => 
      enabledModules.includes(m.id) && 
      m.dependencies.includes(moduleId)
    );

    if (dependentModules.length > 0 && !force) {
      return {
        success: false,
        message: `Cannot deactivate '${module.name}' - other modules depend on it`,
        errors: [`Required by: ${dependentModules.map(m => m.name).join(', ')}`]
      };
    }

    // Deactivate the module
    try {
      if (context === 'platform') {
        await db.update(platformModuleActivations)
          .set({ 
            isActive: false,
            deactivatedAt: new Date(),
            updatedAt: new Date()
          })
          .where(and(
            eq(platformModuleActivations.moduleId, moduleId),
            eq(platformModuleActivations.context, context)
          ));
      } else if (context === 'hub' && contextId) {
        await db.update(hubModuleActivations)
          .set({ 
            isActive: false,
            deactivatedAt: new Date(),
            updatedAt: new Date()
          })
          .where(and(
            eq(hubModuleActivations.hubId, contextId),
            eq(hubModuleActivations.moduleId, moduleId)
          ));
      } else if (context === 'app' && contextId) {
        await db.update(appModuleActivations)
          .set({ 
            isActive: false,
            deactivatedAt: new Date(),
            updatedAt: new Date()
          })
          .where(and(
            eq(appModuleActivations.appId, contextId),
            eq(appModuleActivations.moduleId, moduleId)
          ));
      }

      return {
        success: true,
        message: `Module '${module.name}' deactivated successfully`
      };
    } catch (error) {
      console.error('Module deactivation error:', error);
      return {
        success: false,
        message: `Failed to deactivate module '${module.name}'`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get list of enabled modules in a specific context
   */
  private async getEnabledModulesInContext(
    context: 'platform' | 'hub' | 'app' | 'game',
    contextId?: string
  ): Promise<string[]> {
    if (context === 'platform') {
      const activations = await db.select()
        .from(platformModuleActivations)
        .where(and(
          eq(platformModuleActivations.context, context),
          eq(platformModuleActivations.isActive, true)
        ));
      return activations.map(a => a.moduleId);
    } else if (context === 'hub' && contextId) {
      const activations = await db.select()
        .from(hubModuleActivations)
        .where(and(
          eq(hubModuleActivations.hubId, contextId),
          eq(hubModuleActivations.isActive, true)
        ));
      return activations.map(a => a.moduleId);
    } else if (context === 'app' && contextId) {
      const activations = await db.select()
        .from(appModuleActivations)
        .where(and(
          eq(appModuleActivations.appId, contextId),
          eq(appModuleActivations.isActive, true)
        ));
      return activations.map(a => a.moduleId);
    }
    return [];
  }

  /**
   * Activate platform-level module
   */
  private async activatePlatformModule(moduleId: string, context: string, activatedBy?: string) {
    const existing = await db.select()
      .from(platformModuleActivations)
      .where(and(
        eq(platformModuleActivations.moduleId, moduleId),
        eq(platformModuleActivations.context, context)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db.update(platformModuleActivations)
        .set({ 
          isActive: true,
          deactivatedAt: null,
          updatedAt: new Date()
        })
        .where(eq(platformModuleActivations.id, existing[0].id));
    } else {
      // Create new
      await db.insert(platformModuleActivations).values({
        moduleId,
        context,
        isActive: true,
        settings: {},
        activatedBy
      });
    }
  }

  /**
   * Activate hub-level module
   */
  private async activateHubModule(hubId: string, moduleId: string, activatedBy?: string) {
    const existing = await db.select()
      .from(hubModuleActivations)
      .where(and(
        eq(hubModuleActivations.hubId, hubId),
        eq(hubModuleActivations.moduleId, moduleId)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db.update(hubModuleActivations)
        .set({ 
          isActive: true,
          deactivatedAt: null,
          updatedAt: new Date()
        })
        .where(eq(hubModuleActivations.id, existing[0].id));
    } else {
      await db.insert(hubModuleActivations).values({
        hubId,
        moduleId,
        isActive: true,
        settings: {},
        activatedBy
      });
    }
  }

  /**
   * Activate app-level module
   */
  private async activateAppModule(appId: string, moduleId: string, activatedBy?: string) {
    const existing = await db.select()
      .from(appModuleActivations)
      .where(and(
        eq(appModuleActivations.appId, appId),
        eq(appModuleActivations.moduleId, moduleId)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db.update(appModuleActivations)
        .set({ 
          isActive: true,
          deactivatedAt: null,
          updatedAt: new Date()
        })
        .where(eq(appModuleActivations.id, existing[0].id));
    } else {
      await db.insert(appModuleActivations).values({
        appId,
        moduleId,
        isActive: true,
        settings: {},
        activatedBy
      });
    }
  }

  /**
   * Get module activation status across all contexts
   */
  async getModuleActivationStatus(moduleId: string) {
    const module = getModuleById(moduleId);
    if (!module) {
      return null;
    }

    const platformActivations = await db.select()
      .from(platformModuleActivations)
      .where(and(
        eq(platformModuleActivations.moduleId, moduleId),
        eq(platformModuleActivations.isActive, true)
      ));

    const hubActivations = await db.select()
      .from(hubModuleActivations)
      .where(and(
        eq(hubModuleActivations.moduleId, moduleId),
        eq(hubModuleActivations.isActive, true)
      ));

    const appActivations = await db.select()
      .from(appModuleActivations)
      .where(and(
        eq(appModuleActivations.moduleId, moduleId),
        eq(appModuleActivations.isActive, true)
      ));

    return {
      module,
      activations: {
        platform: platformActivations.map(a => ({ context: a.context, activatedAt: a.activatedAt })),
        hubs: hubActivations.map(a => ({ hubId: a.hubId, activatedAt: a.activatedAt })),
        apps: appActivations.map(a => ({ appId: a.appId, activatedAt: a.activatedAt }))
      }
    };
  }
}

export const moduleDependencyService = new ModuleDependencyService();
