import { Request, Response, NextFunction } from 'express';
import { moduleActivationService, ModuleContext } from '../services/moduleActivationService';

interface ModuleCheckOptions {
  context?: ModuleContext;
  contextIdParam?: string;
  skipIfAdmin?: boolean;
}

export function requireModule(moduleId: string, options: ModuleCheckOptions = {}) {
  const {
    context = 'platform',
    contextIdParam,
    skipIfAdmin = true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (skipIfAdmin && (req as any).admin) {
        return next();
      }

      const contextId = contextIdParam ? req.params[contextIdParam] : undefined;

      const isActive = await moduleActivationService.isModuleActive(moduleId, {
        context,
        contextId
      });

      if (!isActive) {
        return res.status(403).json({
          error: 'Module not activated',
          message: `The module "${moduleId}" is not activated in this context`,
          moduleId,
          context,
          contextId
        });
      }

      next();
    } catch (error) {
      console.error(`Module activation check failed for ${moduleId}:`, error);
      return res.status(500).json({
        error: 'Module activation check failed',
        message: 'An error occurred while checking module activation'
      });
    }
  };
}

export function requireAnyModule(moduleIds: string[], options: ModuleCheckOptions = {}) {
  const {
    context = 'platform',
    contextIdParam,
    skipIfAdmin = true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (skipIfAdmin && (req as any).admin) {
        return next();
      }

      const contextId = contextIdParam ? req.params[contextIdParam] : undefined;

      const checks = await Promise.all(
        moduleIds.map(moduleId =>
          moduleActivationService.isModuleActive(moduleId, { context, contextId })
        )
      );

      const anyActive = checks.some(isActive => isActive);

      if (!anyActive) {
        return res.status(403).json({
          error: 'None of the required modules are activated',
          message: `At least one of these modules must be activated: ${moduleIds.join(', ')}`,
          moduleIds,
          context,
          contextId
        });
      }

      next();
    } catch (error) {
      console.error(`Module activation check failed:`, error);
      return res.status(500).json({
        error: 'Module activation check failed',
        message: 'An error occurred while checking module activation'
      });
    }
  };
}

export function requireAllModules(moduleIds: string[], options: ModuleCheckOptions = {}) {
  const {
    context = 'platform',
    contextIdParam,
    skipIfAdmin = true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (skipIfAdmin && (req as any).admin) {
        return next();
      }

      const contextId = contextIdParam ? req.params[contextIdParam] : undefined;

      const checks = await Promise.all(
        moduleIds.map(moduleId =>
          moduleActivationService.isModuleActive(moduleId, { context, contextId })
        )
      );

      const allActive = checks.every(isActive => isActive);

      if (!allActive) {
        const inactiveModules = moduleIds.filter((_, index) => !checks[index]);
        return res.status(403).json({
          error: 'Not all required modules are activated',
          message: `These modules must be activated: ${inactiveModules.join(', ')}`,
          requiredModules: moduleIds,
          inactiveModules,
          context,
          contextId
        });
      }

      next();
    } catch (error) {
      console.error(`Module activation check failed:`, error);
      return res.status(500).json({
        error: 'Module activation check failed',
        message: 'An error occurred while checking module activation'
      });
    }
  };
}
