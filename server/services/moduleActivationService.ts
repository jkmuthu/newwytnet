import { db } from '../db';
import { platformModuleActivations, hubModuleActivations, appModuleActivations } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export type ModuleContext = 'platform' | 'hub' | 'app' | 'game';

interface ActivationCheck {
  context: ModuleContext;
  contextId?: string;
}

export class ModuleActivationService {
  async isModuleActive(moduleId: string, check: ActivationCheck): Promise<boolean> {
    const { context, contextId } = check;

    try {
      switch (context) {
        case 'platform': {
          const activation = await db.query.platformModuleActivations.findFirst({
            where: and(
              eq(platformModuleActivations.moduleId, moduleId),
              eq(platformModuleActivations.context, 'platform'),
              eq(platformModuleActivations.isActive, true)
            )
          });
          return !!activation;
        }

        case 'hub': {
          if (!contextId) return false;
          const activation = await db.query.hubModuleActivations.findFirst({
            where: and(
              eq(hubModuleActivations.moduleId, moduleId),
              eq(hubModuleActivations.hubId, contextId),
              eq(hubModuleActivations.isActive, true)
            )
          });
          return !!activation;
        }

        case 'app': {
          if (!contextId) return false;
          const activation = await db.query.appModuleActivations.findFirst({
            where: and(
              eq(appModuleActivations.moduleId, moduleId),
              eq(appModuleActivations.appId, contextId),
              eq(appModuleActivations.isActive, true)
            )
          });
          return !!activation;
        }

        case 'game': {
          return false;
        }

        default:
          return false;
      }
    } catch (error) {
      console.error(`Error checking module activation for ${moduleId}:`, error);
      return false;
    }
  }

  async getActiveModules(check: ActivationCheck): Promise<string[]> {
    const { context, contextId } = check;

    try {
      switch (context) {
        case 'platform': {
          const activations = await db.query.platformModuleActivations.findMany({
            where: and(
              eq(platformModuleActivations.context, 'platform'),
              eq(platformModuleActivations.isActive, true)
            )
          });
          return activations.map(a => a.moduleId);
        }

        case 'hub': {
          if (!contextId) return [];
          const activations = await db.query.hubModuleActivations.findMany({
            where: and(
              eq(hubModuleActivations.hubId, contextId),
              eq(hubModuleActivations.isActive, true)
            )
          });
          return activations.map(a => a.moduleId);
        }

        case 'app': {
          if (!contextId) return [];
          const activations = await db.query.appModuleActivations.findMany({
            where: and(
              eq(appModuleActivations.appId, contextId),
              eq(appModuleActivations.isActive, true)
            )
          });
          return activations.map(a => a.moduleId);
        }

        case 'game': {
          return [];
        }

        default:
          return [];
      }
    } catch (error) {
      console.error(`Error fetching active modules for context ${context}:`, error);
      return [];
    }
  }

}

export const moduleActivationService = new ModuleActivationService();
