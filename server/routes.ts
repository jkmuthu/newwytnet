import type { Express, Request, Response } from "express";
import { 
  setupAuth, 
  isAuthenticated, 
  Principal, 
  AuthenticatedRequest,
  adminAuthMiddleware,
  hubAdminAuthMiddleware,
  isAuthenticatedUnified,
  getPrincipal,
  getAdminPrincipal,
  isSuperAdmin,
  requireSuperAdmin
} from "./customAuth";
import { setupReplitAuth, isReplitAuthenticated } from "./replitAuth";
import { ObjectStorageService, objectStorageClient } from "./objectStorage";
import { 
  getAdminDashboardData,
  successResponse,
  errorResponse,
  paginatedResponse,
  validatePagination,
  validateSortParams,
  checkEntityExists,
  getSafeCount,
  logActivity,
  hasPermission,
  requirePermission
} from "./helpers/routeHelpers";
import {
  calculateSimilarityScore,
  calculateRiskAssessment,
  generateRecommendations,
  initializeSampleTrademarkData
} from "./services/trademarkAnalysis";
import { requireModule, requireAnyModule } from "./helpers/moduleMiddleware";
import { razorpayService } from "./services/razorpayService";
import path from "path";
import multer from "multer";
import { promises as fs } from "fs";
import * as fsSync from "fs";
import { fileTypeFromBuffer } from "file-type";
// Main WytPass OAuth authentication (Google, Email OTP, Email/Password) is in wytpass-auth.ts
import * as socialAuthService from "./services/socialAuth";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertModelSchema, 
  insertPageSchema, 
  insertAppSchema, 
  insertHubSchema,
  navigationMenus,
  insertNavigationMenuSchema,
  pages,
  blocks,
  backups,
  platformModules,
  insertPlatformModuleSchema,
  type PlatformModule,
  type InsertPlatformModule,
  platformSettings,
  users,
  tenants,
  apps,
  hubs,
  seoSettings,
  insertSeoSettingSchema,
  assessmentCategories,
  assessmentQuestions,
  assessmentOptions,
  assessmentSessions,
  assessmentResponses,
  assessmentResults,
  type SeoSetting,
  type InsertSeoSetting,
  apiIntegrations,
  insertApiIntegrationSchema,
  type ApiIntegration,
  type InsertApiIntegration,
  pointsWallets,
  pointsTransactions,
  pointsConfig,
  payments,
  orders,
  wytLifeApplications,
  userProfiles,
  bucketList,
  insertBucketListSchema,
  userNeeds,
  userOffers,
  insertUserProfileSchema,
  insertUserNeedSchema,
  insertUserOfferSchema,
  offers,
  datasetCollections,
  datasetItems,
  profileFieldWeights,
  wytWallPosts,
  insertWytWallPostSchema,
  userAppInstallations,
  aiAppProjects,
  aiChatConversations,
  aiGeneratedCode,
  insertAiAppProjectSchema,
  insertAiChatConversationSchema,
  insertAiGeneratedCodeSchema,
  type AiAppProject,
  type InsertAiAppProject,
  type AiChatConversation,
  type InsertAiChatConversation,
  appsRegistry,
  pricingPlans,
  pricingPlanTypes,
  userSubscriptions,
  usageTracking,
  paymentTransactions,
  appFeatures,
  planFeatureAccess,
  insertAppFeatureSchema,
  insertPlanFeatureAccessSchema,
  platformModuleActivations,
  hubModuleActivations,
  appModuleActivations,
  moduleEditHistory,
  appEditHistory,
  media,
  insertMediaSchema,
  type InsertMedia,
  platformHubs,
  platformHubAdmins,
  userRoles,
  roles,
  notifications,
  insertNotificationSchema,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { WytIDService } from "@packages/wytid/service";
import { WytIDEntityType, WytIDProofType, createEntitySchema, createProofSchema, transferEntitySchema } from "@packages/wytid/types";
import { AssessmentService } from "./assessmentService";
import { 
  insertAssessmentSessionSchema, 
  insertAssessmentResponseSchema,
  trademarks,
  trademarkSearches,
  trademarkSimilarities,
  trademarkApiUsage,
  tmNumbers,
  niceClassifications,
  ingestJobs,
  type Trademark,
  type TrademarkSearch,
  type InsertTrademarkSearch,
  type TMNumber,
  type NiceClassification,
  type IngestJob,
  insertTrademarkSearchSchema
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte, like, or, ilike, not, asc, inArray } from "drizzle-orm";
import { aiService } from "./services/aiService";
import rolesRouter from "./routes/roles";
import platformHubsRouter from "./routes/platform-hubs";
import wytaiRouter from "./routes/wytai";
import themesRouter from "./routes/themes";
import supportRouter from "./routes/support";
import integrationsRouter from "./routes/integrations";
import organizationsRouter from "./routes/organizations";
import platformSettingsRouter from "./routes/platform-settings";
import mediaRouter from "./routes/media";
import trashRouter from "./routes/trash";
import { setupFeaturesChecklistRoutes } from "./routes/features-checklist";
import { setupQATestingTrackerRoutes } from "./routes/qa-testing-tracker";
import { rateLimiters } from "./middleware/rateLimiter";
import { requireAuth } from "./wytpass-identity";

// Trademark analysis functions now imported from services/trademarkAnalysis.ts

// Risk assessment function now imported from services/trademarkAnalysis.ts

// Recommendations function now imported from services/trademarkAnalysis.ts

// All similarity algorithms now imported from services/trademarkAnalysis.ts

// Sample trademark data initialization now imported from services/trademarkAnalysis.ts

// Admin auth middleware now imported from customAuth.ts

// Unified authentication middleware now imported from customAuth.ts

// Principal resolver now imported from customAuth.ts

export async function registerRoutes(app: Express): Promise<void> {
  // Setup authentication systems
  await setupAuth(app); // Legacy auth system (being migrated)
  await setupReplitAuth(app); // Social auth (Google, Facebook, etc.)

  // Initialize services
  const wytidService = new WytIDService('mock');
  const assessmentService = new AssessmentService();

  // Initialize assessment default data
  await assessmentService.initializeDefaultData();

  // Initialize sample trademark data for demonstration
  await initializeSampleTrademarkData();

  // Initialize TMNumber11 system
  const tmNumberingService = await import('./services/tmNumbering');
  await tmNumberingService.initializeNiceClassifications();
  await tmNumberingService.seedSampleTMNumbers();

  // Initialize WytData datasets
  const { datasetSeedingService } = await import('./services/datasetSeedingService');
  await datasetSeedingService.initializeDatasets();

  // Register Roles & Permissions Management Router
  app.use('/api', rolesRouter);

  // Register Platform Hubs Management Router
  app.use('/api', platformHubsRouter);

  // Register WytAI Agent Router
  app.use('/api', wytaiRouter);

  // Register Themes Management Router
  app.use('/api', themesRouter);

  // Register Support & Knowledge Base Router
  app.use('/api', supportRouter);

  // Register Integrations Management Router
  app.use('/api', integrationsRouter);

  // Register Organizations Router
  app.use('/api', organizationsRouter);

  // Register Platform Settings Router
  app.use('/api', platformSettingsRouter);

  // Register Media Router
  app.use('/api', mediaRouter);

  // Register Trash Management Router
  app.use('/api', trashRouter);

  // Register Features Checklist Routes
  setupFeaturesChecklistRoutes(app);

  // Register QA Testing Tracker Routes
  setupQATestingTrackerRoutes(app);

  // Auth routes - unified endpoint for both authentication systems
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      res.json({
        id: principal.id,
        email: principal.email,
        firstName: principal.firstName,
        lastName: principal.lastName,
        name: principal.name,
        tenantId: principal.tenantId,
        role: principal.role,
        isSuperAdmin: principal.isSuperAdmin,
        mobileNumber: principal.mobileNumber,
        profileImageUrl: principal.profileImageUrl,
        provider: principal.provider
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Multi-Context Detection API - Enhanced Universal Panel Detection
  app.get('/api/auth/contexts', async (req: any, res) => {
    try {
      const contexts: Array<{
        type: 'engine_admin' | 'hub_admin' | 'user';
        name: string;
        path: string;
        icon: string;
        hubKey?: string;
        user: any;
        active: boolean;
      }> = [];

      // UNIFIED AUTH FIX: Read from wytpassPrincipal which is auto-populated
      const principal = req.session.wytpassPrincipal;

      if (!principal || !principal.id) {
        // No authentication - return empty contexts
        return res.json({ contexts: [], count: 0 });
      }

      // Get current route to determine active panel
      const currentPath = req.headers.referer || '';

      // 1. Check Engine Admin Access (isSuperAdmin flag on principal)
      if (principal.isSuperAdmin) {
        contexts.push({
          type: 'engine_admin',
          name: 'WytEngine',
          path: '/engine/dashboard',
          icon: 'Shield',
          user: {
            name: principal.name || 'Admin',
            email: principal.email || '',
            role: 'Super Admin'
          },
          active: currentPath.includes('/engine')
        });
      }

      // 2. Check Hub Admin Access (isHubAdmin flag on principal)
      if (principal.isHubAdmin) {
        // Query platform_hub_admins for which hubs this user administers
        const hubAdminRecords = await db
          .select({
            hubId: platformHubAdmins.hubId,
            hubName: platformHubs.name,
            hubSlug: platformHubs.slug,
            hubStatus: platformHubs.status,
          })
          .from(platformHubAdmins)
          .innerJoin(platformHubs, eq(platformHubAdmins.hubId, platformHubs.id))
          .where(
            and(
              eq(platformHubAdmins.userId, principal.id),
              eq(platformHubAdmins.isActive, true),
              eq(platformHubs.status, 'active')
            )
          );

        for (const hubAdmin of hubAdminRecords) {
          contexts.push({
            type: 'hub_admin',
            name: hubAdmin.hubName,
            path: `/${hubAdmin.hubSlug}/admin/dashboard`,
            icon: 'Settings',
            hubKey: hubAdmin.hubSlug,
            user: {
              name: principal.name,
              email: principal.email,
              role: 'Hub Admin'
            },
            active: currentPath.includes(`/${hubAdmin.hubSlug}/admin`)
          });
        }
      }

      // 3. Regular User Access - all authenticated users get WytNet panel
      const wytnetHub = await db
        .select()
        .from(platformHubs)
        .where(eq(platformHubs.slug, 'wytnet'))
        .limit(1);

      if (wytnetHub.length > 0 && wytnetHub[0].status === 'active') {
        // Only add if not already added as hub admin
        const alreadyAddedAsAdmin = contexts.some(c => c.hubKey === 'wytnet' && c.type === 'hub_admin');
        if (!alreadyAddedAsAdmin) {
          contexts.push({
            type: 'user',
            name: 'WytNet',
            path: '/dashboard',
            icon: 'Home',
            hubKey: 'wytnet',
            user: {
              name: principal.name,
              email: principal.email,
              role: 'User'
            },
            active: currentPath.includes('/dashboard') && !currentPath.includes('/admin') && !currentPath.includes('/engine')
          });
        }
      }

      res.json({
        contexts,
        count: contexts.length
      });
    } catch (error) {
      console.error("Error fetching contexts:", error);
      res.status(500).json({ message: "Failed to fetch contexts" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const stats = await storage.getDashboardStats(user.tenantId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Models/Modules CRUD
  app.get('/api/models', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const models = await storage.getModelsByTenant(user.tenantId);
      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  app.post('/api/models', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const validatedData = insertModelSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
        createdBy: user.id,
      });

      const model = await storage.createModel(validatedData);
      res.json(model);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating model:", error);
      res.status(500).json({ message: "Failed to create model" });
    }
  });

  app.put('/api/models/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { id } = req.params;
      const model = await storage.updateModel(id, req.body, user.tenantId);

      if (!model) {
        return res.status(404).json({ message: "Model not found" });
      }

      res.json(model);
    } catch (error) {
      console.error("Error updating model:", error);
      res.status(500).json({ message: "Failed to update model" });
    }
  });

  // Pages CRUD
  app.get('/api/pages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const pages = await storage.getPagesByTenant(user.tenantId);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.post('/api/pages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const validatedData = insertPageSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
        createdBy: user.id,
      });

      const page = await storage.createPage(validatedData);
      res.json(page);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating page:", error);
      res.status(500).json({ message: "Failed to create page" });
    }
  });

  // Navigation Menus CRUD - For Engine Admin Panel
  app.get('/api/admin/navigation-menus', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const menus = await db.select()
        .from(navigationMenus)
        .where(eq(navigationMenus.scope, 'engine'))
        .orderBy(navigationMenus.order);

      res.json(menus);
    } catch (error: any) {
      console.error('Error fetching navigation menus:', error);
      res.status(500).json({ error: 'Failed to fetch navigation menus' });
    }
  });

  app.post('/api/admin/navigation-menus', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const validatedData = insertNavigationMenuSchema.parse({
        ...req.body,
        createdBy: principal.id,
        scope: 'engine',
      });

      const [menu] = await db.insert(navigationMenus)
        .values(validatedData)
        .returning();

      res.json(menu);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Error creating navigation menu:', error);
      res.status(500).json({ error: 'Failed to create navigation menu' });
    }
  });

  // Reorder endpoint must come BEFORE :id route to avoid matching "reorder" as an id
  app.patch('/api/admin/navigation-menus/reorder', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const { menus } = req.body; // Array of { id, order }

      for (const menu of menus) {
        await db.update(navigationMenus)
          .set({ order: menu.order, updatedAt: new Date() })
          .where(eq(navigationMenus.id, menu.id));
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error reordering navigation menus:', error);
      res.status(500).json({ error: 'Failed to reorder navigation menus' });
    }
  });

  app.patch('/api/admin/navigation-menus/:id', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const { id } = req.params;
      const [menu] = await db.update(navigationMenus)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(navigationMenus.id, id))
        .returning();

      if (!menu) {
        return res.status(404).json({ error: 'Menu not found' });
      }

      res.json(menu);
    } catch (error: any) {
      console.error('Error updating navigation menu:', error);
      res.status(500).json({ error: 'Failed to update navigation menu' });
    }
  });

  app.delete('/api/admin/navigation-menus/:id', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const { id } = req.params;
      await db.delete(navigationMenus)
        .where(eq(navigationMenus.id, id));

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting navigation menu:', error);
      res.status(500).json({ error: 'Failed to delete navigation menu' });
    }
  });

  // Backup System - For Engine Admin Panel
  app.post('/api/admin/backup/create', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const { createFullBackup, ensureBackupSequence } = await import('./services/backupService');

      // Ensure backup sequence exists
      await ensureBackupSequence();

      // Create backup
      const backupId = await createFullBackup(principal.id);

      // Get the created backup
      const [backup] = await db.select()
        .from(backups)
        .where(eq(backups.id, backupId));

      res.json(backup);
    } catch (error: any) {
      console.error('Error creating backup:', error);
      res.status(500).json({ error: error.message || 'Failed to create backup' });
    }
  });

  app.get('/api/admin/backup/list', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const allBackups = await db.select()
        .from(backups)
        .orderBy(backups.createdAt);

      res.json(allBackups);
    } catch (error: any) {
      console.error('Error fetching backups:', error);
      res.status(500).json({ error: 'Failed to fetch backups' });
    }
  });

  app.get('/api/admin/backup/download/:id', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const { id } = req.params;
      const [backup] = await db.select()
        .from(backups)
        .where(eq(backups.id, id));

      if (!backup) {
        return res.status(404).json({ error: 'Backup not found' });
      }

      if (!backup.filePath) {
        return res.status(404).json({ error: 'Backup file not available' });
      }

      // Download from object storage to temp location
      const { downloadBackup } = await import('./services/backupService');
      const tempPath = path.join(process.cwd(), '.backup-temp', 'download', backup.filename);
      const tempDir = path.dirname(tempPath);

      if (!fsSync.existsSync(tempDir)) {
        fsSync.mkdirSync(tempDir, { recursive: true });
      }

      await downloadBackup(backup.filePath, tempPath);

      // Send file to client
      res.download(tempPath, backup.filename, (err) => {
        // Cleanup temp file after download
        if (fsSync.existsSync(tempPath)) {
          fsSync.unlinkSync(tempPath);
        }
        if (err) {
          console.error('Download error:', err);
        }
      });
    } catch (error: any) {
      console.error('Error downloading backup:', error);
      res.status(500).json({ error: error.message || 'Failed to download backup' });
    }
  });

  app.delete('/api/admin/backup/:id', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const { id } = req.params;
      const [backup] = await db.select()
        .from(backups)
        .where(eq(backups.id, id));

      if (!backup) {
        return res.status(404).json({ error: 'Backup not found' });
      }

      // Delete from object storage
      if (backup.filePath) {
        const { deleteBackupFile } = await import('./services/backupService');
        await deleteBackupFile(backup.filePath);
      }

      // Delete from database
      await db.delete(backups)
        .where(eq(backups.id, id));

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting backup:', error);
      res.status(500).json({ error: error.message || 'Failed to delete backup' });
    }
  });

  app.post('/api/admin/backup/restore/:id', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const { id } = req.params;
      const { restoreBackup } = await import('./services/backupService');

      await restoreBackup(id);

      res.json({ success: true, message: 'Backup restored successfully' });
    } catch (error: any) {
      console.error('Error restoring backup:', error);
      res.status(500).json({ error: error.message || 'Failed to restore backup' });
    }
  });

  // Audit Logs API
  app.get('/api/admin/audit-logs', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { auditLogService } = await import('./services/auditLogService');

      const {
        userId,
        action,
        resource,
        startDate,
        endDate,
        search,
        limit = 50,
        offset = 0,
      } = req.query;

      const filters = {
        userId: userId as string | undefined,
        action: action as string | undefined,
        resource: resource as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        search: search as string | undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      const [logs, totalCount] = await Promise.all([
        auditLogService.getLogs(filters),
        auditLogService.getLogsCount(filters),
      ]);

      res.json({
        logs,
        total: totalCount,
        limit: filters.limit,
        offset: filters.offset,
      });
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  app.get('/api/admin/audit-logs/stats', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { auditLogService } = await import('./services/auditLogService');

      const { startDate, endDate } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const stats = await auditLogService.getStats(filters);
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching audit log stats:', error);
      res.status(500).json({ error: 'Failed to fetch audit log stats' });
    }
  });

  app.get('/api/admin/audit-logs/user/:userId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { auditLogService } = await import('./services/auditLogService');

      const { userId } = req.params;
      const { limit = 10 } = req.query;

      const activity = await auditLogService.getUserRecentActivity(userId, parseInt(limit as string));
      res.json(activity);
    } catch (error: any) {
      console.error('Error fetching user activity:', error);
      res.status(500).json({ error: 'Failed to fetch user activity' });
    }
  });

  // Admin Pages CRUD - For Engine Admin Panel
  app.get('/api/admin/pages', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const allPages = await db.select()
        .from(pages)
        .orderBy(pages.createdAt);

      res.json(allPages);
    } catch (error: any) {
      console.error('Error fetching pages:', error);
      res.status(500).json({ error: 'Failed to fetch pages' });
    }
  });

  app.get('/api/admin/pages/:id', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const { id } = req.params;
      const [page] = await db.select()
        .from(pages)
        .where(eq(pages.id, id));

      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json(page);
    } catch (error: any) {
      console.error('Error fetching page:', error);
      res.status(500).json({ error: 'Failed to fetch page' });
    }
  });

  app.post('/api/admin/pages', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      // Get the primary tenant (engine tenant)
      const [engineTenant] = await db.select()
        .from(tenants)
        .limit(1);

      if (!engineTenant) {
        return res.status(500).json({ error: 'Engine tenant not found' });
      }

      const validatedData = insertPageSchema.parse({
        ...req.body,
        tenantId: engineTenant.id,
        createdBy: principal.id,
      });

      const [page] = await db.insert(pages)
        .values(validatedData)
        .returning();

      res.json(page);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Error creating page:', error);
      res.status(500).json({ error: 'Failed to create page' });
    }
  });

  app.patch('/api/admin/pages/:id', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const { id } = req.params;
      const [page] = await db.update(pages)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(pages.id, id))
        .returning();

      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json(page);
    } catch (error: any) {
      console.error('Error updating page:', error);
      res.status(500).json({ error: 'Failed to update page' });
    }
  });

  app.delete('/api/admin/pages/:id', async (req, res) => {
    try {
      const principal = req.session.wytpassPrincipal;
      if (!principal || !principal.isSuperAdmin) {
        return res.status(403).json({ error: 'Super Admin access required' });
      }

      const { id } = req.params;
      await db.delete(pages)
        .where(eq(pages.id, id));

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting page:', error);
      res.status(500).json({ error: 'Failed to delete page' });
    }
  });

  // Apps CRUD
  app.get('/api/apps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }
      const apps = await storage.getAppsByTenant(user.tenantId);
      res.json(apps);
    } catch (error) {
      console.error("Error fetching apps:", error);
      res.status(500).json({ message: "Failed to fetch apps" });
    }
  });

  app.post('/api/apps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }
      const validatedData = insertAppSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
        createdBy: user.id,
      });

      const app = await storage.createApp(validatedData);
      res.json(app);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating app:", error);
      res.status(500).json({ message: "Failed to create app" });
    }
  });

  // Hubs CRUD
  app.get('/api/hubs', isAuthenticated, async (req: any, res) => {
    try {
      const hubs = await storage.getAllHubs();
      res.json(hubs);
    } catch (error) {
      console.error("Error fetching hubs:", error);
      res.status(500).json({ message: "Failed to fetch hubs" });
    }
  });

  app.post('/api/hubs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertHubSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const hub = await storage.createHub(validatedData);
      res.json(hub);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating hub:", error);
      res.status(500).json({ message: "Failed to create hub" });
    }
  });

  // DSL validation endpoint
  app.post('/api/dsl/validate', isAuthenticated, async (req: any, res) => {
    try {
      const { dsl } = req.body;
      const validation = await storage.validateModelDSL(dsl);
      res.json(validation);
    } catch (error) {
      console.error("Error validating DSL:", error);
      res.status(500).json({ message: "Failed to validate DSL" });
    }
  });

  // Model generation endpoint
  app.post('/api/generate/model', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { modelId } = req.body;
      const result = await storage.generateModelCode(modelId, user.tenantId);
      res.json(result);
    } catch (error) {
      console.error("Error generating model:", error);
      res.status(500).json({ message: "Failed to generate model" });
    }
  });

  // Activity feed
  app.get('/api/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      const activities = await storage.getRecentActivity(user?.tenantId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Marketplace API Routes

  // Get marketplace apps with pricing
  app.get('/api/marketplace/apps', async (req: any, res) => {
    try {
      const apps = await storage.getMarketplaceApps();

      // Check user ownership if authenticated
      let appsWithOwnership = apps;
      if (req.user) {
        const userId = req.user.claims?.sub || req.user.id;
        appsWithOwnership = await Promise.all(
          apps.map(async (app) => {
            const owned = await storage.checkUserAppOwnership(userId, app.id);
            return { ...app, owned };
          })
        );
      } else {
        appsWithOwnership = apps.map(app => ({ ...app, owned: false }));
      }

      res.json(appsWithOwnership);
    } catch (error) {
      console.error("Error fetching marketplace apps:", error);
      res.status(500).json({ message: "Failed to fetch marketplace apps" });
    }
  });

  // Get single marketplace app
  app.get('/api/marketplace/apps/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const app = await storage.getMarketplaceApp(id);

      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }

      // Check user ownership if authenticated
      let owned = false;
      if (req.user) {
        const userId = req.user.claims?.sub || req.user.id;
        owned = await storage.checkUserAppOwnership(userId, app.id);
      }

      res.json({ ...app, owned });
    } catch (error) {
      console.error("Error fetching marketplace app:", error);
      res.status(500).json({ message: "Failed to fetch marketplace app" });
    }
  });

  // Purchase marketplace app
  app.post('/api/marketplace/purchase', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { appId, pricingType, amount, paymentId, orderId, signature } = req.body;

      // Validate the purchase data
      if (!appId || !pricingType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if user already owns this app
      const alreadyOwned = await storage.checkUserAppOwnership(userId, appId);
      if (alreadyOwned) {
        return res.status(400).json({ message: "You already own this app" });
      }

      // Create the purchase record
      const purchase = await storage.createAppPurchase({
        appId,
        userId,
        pricingType,
        amount: amount || 0,
        paymentId
      });

      res.json({ 
        success: true, 
        message: "Purchase successful",
        purchase 
      });
    } catch (error) {
      console.error("Error processing purchase:", error);
      res.status(500).json({ message: "Failed to process purchase" });
    }
  });

  // Get marketplace hubs
  app.get('/api/marketplace/hubs', async (req: any, res) => {
    try {
      const hubs = await storage.getMarketplaceHubs();
      res.json(hubs);
    } catch (error) {
      console.error("Error fetching marketplace hubs:", error);
      res.status(500).json({ message: "Failed to fetch marketplace hubs" });
    }
  });

  // Get single marketplace hub by ID
  app.get('/api/marketplace/hubs/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const hub = await storage.getMarketplaceHub(id);

      if (!hub) {
        return res.status(404).json({ message: "Hub not found" });
      }

      res.json(hub);
    } catch (error) {
      console.error("Error fetching marketplace hub:", error);
      res.status(500).json({ message: "Failed to fetch marketplace hub" });
    }
  });

  // Get single marketplace hub by slug
  app.get('/api/marketplace/hubs/slug/:slug', async (req: any, res) => {
    try {
      const { slug } = req.params;
      const hub = await storage.getMarketplaceHubBySlug(slug);

      if (!hub) {
        return res.status(404).json({ message: "Hub not found" });
      }

      res.json(hub);
    } catch (error) {
      console.error("Error fetching marketplace hub by slug:", error);
      res.status(500).json({ message: "Failed to fetch marketplace hub" });
    }
  });

  // Get hub items for a specific hub
  app.get('/api/marketplace/hubs/:id/items', async (req: any, res) => {
    try {
      const { id } = req.params;
      const hub = await storage.getMarketplaceHub(id);

      if (!hub) {
        return res.status(404).json({ message: "Hub not found" });
      }

      res.json(hub.items || []);
    } catch (error) {
      console.error("Error fetching hub items:", error);
      res.status(500).json({ message: "Failed to fetch hub items" });
    }
  });

  // WytID API Routes

  // Get WytID stats for dashboard
  app.get('/api/wytid/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const stats = await storage.getWytIDStats(user.tenantId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching WytID stats:", error);
      res.status(500).json({ message: "Failed to fetch WytID stats" });
    }
  });

  // Entity management
  app.get('/api/wytid/entities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const entities = await wytidService.getEntitiesByTenant(user.tenantId);
      res.json(entities);
    } catch (error) {
      console.error("Error fetching WytID entities:", error);
      res.status(500).json({ message: "Failed to fetch WytID entities" });
    }
  });

  app.post('/api/wytid/entities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const validatedData = createEntitySchema.parse(req.body);
      const entity = await wytidService.createEntity(validatedData, userId, user.tenantId);

      res.json(entity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating WytID entity:", error);
      res.status(500).json({ message: "Failed to create WytID entity" });
    }
  });

  app.get('/api/wytid/entities/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { id } = req.params;
      const entity = await wytidService.getEntity(id, user.tenantId);

      if (!entity) {
        return res.status(404).json({ message: "Entity not found" });
      }

      res.json(entity);
    } catch (error) {
      console.error("Error fetching WytID entity:", error);
      res.status(500).json({ message: "Failed to fetch WytID entity" });
    }
  });

  // Proof management
  app.get('/api/wytid/entities/:id/proofs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { id } = req.params;
      const proofs = await wytidService.getProofsByEntity(id, user.tenantId);
      res.json(proofs);
    } catch (error) {
      console.error("Error fetching WytID proofs:", error);
      res.status(500).json({ message: "Failed to fetch WytID proofs" });
    }
  });

  app.post('/api/wytid/proofs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const validatedData = createProofSchema.parse(req.body);
      const proof = await wytidService.createProof(validatedData, user.tenantId);

      res.json(proof);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating WytID proof:", error);
      res.status(500).json({ message: "Failed to create WytID proof" });
    }
  });

  app.put('/api/wytid/proofs/:id/revoke', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { id } = req.params;
      const proof = await wytidService.revokeProof(id, user.tenantId);

      if (!proof) {
        return res.status(404).json({ message: "Proof not found" });
      }

      res.json(proof);
    } catch (error) {
      console.error("Error revoking WytID proof:", error);
      res.status(500).json({ message: "Failed to revoke WytID proof" });
    }
  });

  // Transfer management
  app.post('/api/wytid/transfers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const validatedData = transferEntitySchema.parse(req.body);
      const transfer = await wytidService.transferEntity(validatedData, userId, user.tenantId);

      res.json(transfer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating WytID transfer:", error);
      res.status(500).json({ message: "Failed to create WytID transfer" });
    }
  });

  app.get('/api/wytid/entities/:id/transfers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { id } = req.params;
      const transfers = await wytidService.getTransfersByEntity(id, user.tenantId);
      res.json(transfers);
    } catch (error) {
      console.error("Error fetching WytID transfers:", error);
      res.status(500).json({ message: "Failed to fetch WytID transfers" });
    }
  });

  // Public verification API (no auth required)
  app.get('/api/public/wytid/verify/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;
      const apiKey = req.headers['x-api-key'] as string;

      // Validate API key if provided
      if (apiKey) {
        const keyInfo = await wytidService.validateApiKey(apiKey);
        if (!keyInfo) {
          return res.status(401).json({ message: "Invalid API key" });
        }
      }

      const verification = await wytidService.verifyEntity(identifier);
      res.json(verification);
    } catch (error) {
      console.error("Error verifying WytID entity:", error);
      res.status(500).json({ message: "Failed to verify WytID entity" });
    }
  });

  // API Key management (Super Admin)
  app.post('/api/wytid/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { name, scopes, expiresAt } = req.body;
      const apiKey = await wytidService.createApiKey(
        name, 
        scopes, 
        userId, 
        user.tenantId, 
        expiresAt ? new Date(expiresAt) : undefined
      );

      res.json(apiKey);
    } catch (error) {
      console.error("Error creating WytID API key:", error);
      res.status(500).json({ message: "Failed to create WytID API key" });
    }
  });

  // WytAi Trademark Engine - Proprietary AI-Powered Indian Trademark Intelligence

  // Analytics endpoint for WytAi dashboard
  app.get('/api/wytai/analytics', async (req, res) => {
    try {
      // Get total trademarks count
      const totalTrademarks = await db.select({ count: sql<number>`count(*)` }).from(trademarks);

      // Get total searches count  
      const totalSearches = await db.select({ count: sql<number>`count(*)` }).from(trademarkSearches);

      // Get recent activity (last 10 searches)
      const recentActivity = await db
        .select({
          id: trademarkSearches.id,
          query: trademarkSearches.queryText,
          results: trademarkSearches.totalResults,
          risk: trademarkSearches.riskAssessment,
          timestamp: trademarkSearches.createdAt,
        })
        .from(trademarkSearches)
        .orderBy(desc(trademarkSearches.createdAt))
        .limit(10);

      res.json({
        totalTrademarks: totalTrademarks[0].count,
        totalSearches: totalSearches[0].count,
        recentActivity: recentActivity.map(activity => ({
          ...activity,
          risk: activity.risk || 'low',
          timestamp: activity.timestamp.toISOString(),
        })),
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Core trademark search functionality
  app.post('/api/wytai/trademark/search', async (req, res) => {
    try {
      const startTime = Date.now();
      const { queryText, searchType = 'wytai_combined', filters = {} } = req.body;

      if (!queryText) {
        return res.status(400).json({ message: "Query text is required" });
      }

      // Perform trademark search with AI-powered similarity analysis
      const searchConditions = [
        ilike(trademarks.trademarkText, `%${queryText}%`),
        ilike(trademarks.applicantName, `%${queryText}%`)
      ];

      // Apply filters
      const whereConditions = [...searchConditions];
      if (filters.classification) {
        whereConditions.push(eq(trademarks.niceClassification, filters.classification));
      }
      if (filters.status) {
        whereConditions.push(eq(trademarks.status, filters.status));
      }

      const results = await db
        .select()
        .from(trademarks)
        .where(or(...whereConditions))
        .orderBy(desc(trademarks.filingDate))
        .limit(50);

      // AI-powered risk assessment
      const riskAssessment = calculateRiskAssessment(results, queryText);
      const recommendedActions = generateRecommendations(riskAssessment, results);

      // Create search record
      const searchDuration = Date.now() - startTime;
      const searchRecord: InsertTrademarkSearch = {
        queryText,
        searchType,
        filters,
        totalResults: results.length,
        aiConfidenceScore: riskAssessment.confidence.toString(),
        riskAssessment: riskAssessment.level,
        recommendedActions,
        searchDuration,
        algorithmUsed: 'wytai_combined',
        ipAddress: req.ip,
      };

      const [search] = await db.insert(trademarkSearches).values(searchRecord).returning();

      // Calculate similarity scores for each result
      const similarities = await Promise.all(
        results.map(async (trademark) => {
          const similarity = calculateSimilarityScore(queryText, trademark);

          const similarityRecord = {
            searchId: search.id,
            trademarkId: trademark.id,
            overallSimilarity: similarity.overall,
            textSimilarity: similarity.text,
            phoneticSimilarity: similarity.phonetic,
            semanticSimilarity: similarity.semantic,
            conflictProbability: similarity.conflictProbability,
            oppositionRisk: similarity.oppositionRisk,
            similarityReasons: similarity.reasons,
            algorithmBreakdown: similarity.breakdown,
            confidence: similarity.confidence,
          };

          await db.insert(trademarkSimilarities).values([similarityRecord]);

          return {
            trademark,
            similarity: similarityRecord
          };
        })
      );

      res.json({
        searchId: search.id,
        query: queryText,
        totalResults: results.length,
        searchDuration,
        riskAssessment: {
          level: riskAssessment.level,
          confidence: riskAssessment.confidence,
          summary: riskAssessment.summary
        },
        recommendedActions,
        results: similarities.map(s => ({
          id: s.trademark.id,
          applicationNumber: s.trademark.applicationNumber,
          trademarkText: s.trademark.trademarkText,
          applicantName: s.trademark.applicantName,
          status: s.trademark.status,
          filingDate: s.trademark.filingDate,
          classification: s.trademark.niceClassification,
          similarity: {
            overall: s.similarity.overallSimilarity,
            breakdown: s.similarity.algorithmBreakdown,
            conflictProbability: s.similarity.conflictProbability,
            oppositionRisk: s.similarity.oppositionRisk,
            reasons: s.similarity.similarityReasons
          }
        }))
      });

    } catch (error) {
      console.error("Error in trademark search:", error);
      res.status(500).json({ message: "Failed to perform trademark search" });
    }
  });

  // Get trademark by application number
  app.get('/api/wytai/trademark/:applicationNumber', async (req, res) => {
    try {
      const { applicationNumber } = req.params;

      const [trademark] = await db
        .select()
        .from(trademarks)
        .where(eq(trademarks.applicationNumber, applicationNumber));

      if (!trademark) {
        return res.status(404).json({ message: "Trademark not found" });
      }

      res.json(trademark);
    } catch (error) {
      console.error("Error fetching trademark:", error);
      res.status(500).json({ message: "Failed to fetch trademark details" });
    }
  });

  // Get search history
  app.get('/api/wytai/searches', async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const searches = await db
        .select()
        .from(trademarkSearches)
        .orderBy(desc(trademarkSearches.createdAt))
        .limit(parseInt(limit as string));

      res.json(searches);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  // WytAi Analytics - API usage stats
  app.get('/api/wytai/analytics', async (req, res) => {
    try {
      const totalTrademarks = await db
        .select({ count: sql<number>`count(*)` })
        .from(trademarks);

      const totalSearches = await db
        .select({ count: sql<number>`count(*)` })
        .from(trademarkSearches);

      const recentActivity = await db
        .select()
        .from(trademarkSearches)
        .orderBy(desc(trademarkSearches.createdAt))
        .limit(5);

      res.json({
        totalTrademarks: totalTrademarks[0].count,
        totalSearches: totalSearches[0].count,
        recentActivity: recentActivity.map(search => ({
          id: search.id,
          query: search.queryText,
          results: search.totalResults,
          risk: search.riskAssessment,
          timestamp: search.createdAt
        }))
      });
    } catch (error) {
      console.error("Error fetching WytAi analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // TMNumber11 Proprietary Numbering System API Endpoints
  // ====================================================

  // Generate TMNumber11 with Luhn check digit
  app.post('/api/tm/numbers/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { class: classCc, country: countryCcc, product: productPpppp, title, longDesc, keywords, segmentKey } = req.body;
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);

      if (!classCc || !countryCcc || !title) {
        return res.status(400).json({ error: 'Class, country, and title are required' });
      }

      const tmNumberingService = await import('./services/tmNumbering');
      const tmNumber = await tmNumberingService.createTMNumber11({
        classCc,
        countryCcc,
        productPpppp,
        title,
        longDesc,
        keywords: keywords || [],
        segmentKey,
        tenantId: user?.tenantId,
        createdBy: userId,
      });

      res.json({
        success: true,
        tmNumber,
        message: 'TMNumber11 generated successfully'
      });
    } catch (error) {
      console.error('Error generating TMNumber11:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate TMNumber11' });
    }
  });

  // Validate TMNumber11 format and check digit
  app.get('/api/tm/numbers/validate/:number', async (req, res) => {
    try {
      const { number } = req.params;

      const tmNumberingService = await import('./services/tmNumbering');
      const validation = tmNumberingService.validateTMNumber11(number);

      res.json({
        tmNumber: number,
        validation,
      });
    } catch (error) {
      console.error('Error validating TMNumber11:', error);
      res.status(500).json({ error: 'Failed to validate TMNumber11' });
    }
  });

  // Search TMNumbers by various criteria
  app.get('/api/tm/numbers', async (req, res) => {
    try {
      const { class: classCc, country: countryCcc, keyword, segment, status, limit = 50 } = req.query;

      const tmNumberingService = await import('./services/tmNumbering');
      const results = await tmNumberingService.searchTMNumbers({
        classCc: classCc as string,
        countryCcc: countryCcc as string,
        keyword: keyword as string,
        segmentKey: segment as string,
        status: status as string,
        limit: parseInt(limit as string, 10),
      });

      res.json({
        results,
        total: results.length,
        filters: { classCc, countryCcc, keyword, segment, status },
      });
    } catch (error) {
      console.error('Error searching TMNumbers:', error);
      res.status(500).json({ error: 'Failed to search TMNumbers' });
    }
  });

  // Get Nice Classifications (01-45)
  app.get('/api/tm/classes', async (req, res) => {
    try {
      const { category } = req.query;

      let query = db.select().from(niceClassifications).where(eq(niceClassifications.isActive, true));

      if (category) {
        query = query.where(eq(niceClassifications.category, category as string));
      }

      const classifications = await query.orderBy(niceClassifications.classNumber);

      res.json({
        classifications,
        total: classifications.length,
      });
    } catch (error) {
      console.error('Error fetching Nice classifications:', error);
      res.status(500).json({ error: 'Failed to fetch classifications' });
    }
  });

  // Ingest Job Management (for ETL pipeline)
  app.post('/api/ingest/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const { adapter, params = {} } = req.body;
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);

      if (!adapter) {
        return res.status(400).json({ error: 'Adapter is required' });
      }

      const [job] = await db.insert(ingestJobs).values({
        tenantId: user?.tenantId,
        userId,
        adapter,
        params,
        status: 'queued',
      }).returning();

      // TODO: Queue job for background processing
      // For now, we'll just mark it as queued

      res.json({
        job,
        message: 'Ingest job queued successfully'
      });
    } catch (error) {
      console.error('Error creating ingest job:', error);
      res.status(500).json({ error: 'Failed to create ingest job' });
    }
  });

  // Get ingest job status
  app.get('/api/ingest/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);

      const [job] = await db.select()
        .from(ingestJobs)
        .where(and(
          eq(ingestJobs.id, id),
          eq(ingestJobs.tenantId, user?.tenantId)
        ));

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json({ job });
    } catch (error) {
      console.error('Error fetching ingest job:', error);
      res.status(500).json({ error: 'Failed to fetch job' });
    }
  });

  // List ingest jobs for tenant
  app.get('/api/ingest/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const { status, adapter, limit = 50 } = req.query;
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);

      const conditions = [eq(ingestJobs.tenantId, user?.tenantId)];

      if (status) {
        conditions.push(eq(ingestJobs.status, status as string));
      }

      if (adapter) {
        conditions.push(eq(ingestJobs.adapter, adapter as string));
      }

      const jobs = await db.select()
        .from(ingestJobs)
        .where(and(...conditions))
        .orderBy(desc(ingestJobs.createdAt))
        .limit(parseInt(limit as string, 10));

      res.json({
        jobs,
        total: jobs.length,
      });
    } catch (error) {
      console.error('Error fetching ingest jobs:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });


  // Admin login endpoint with email-based authentication
  // Enterprise Admin Authentication Endpoints
  app.post('/api/auth/admin/login', async (req, res) => {
    try {
      const { email, password, deviceInfo } = req.body;

      // Super Admin credentials check
      if (email === 'jkm@jkmuthu.com' && password === 'SuperAdmin@2025') {
        // Find or create the super admin user in database
        let superAdminUser = await db
          .select()
          .from(users)
          .where(eq(users.email, 'jkm@jkmuthu.com'))
          .limit(1);

        // If super admin doesn't exist, create it
        if (superAdminUser.length === 0) {
          const [newSuperAdmin] = await db
            .insert(users)
            .values({
              name: 'Super Admin',
              email: 'jkm@jkmuthu.com',
              whatsappNumber: 'ADMIN_SUPER', // Unique identifier for super admin
              role: 'super_admin',
              isVerified: true,
              authMethods: ['email'],
              socialProviders: [],
              country: 'IN',
              tenantId: null, // Admin users don't belong to a tenant
              isSuperAdmin: true,
            })
            .returning();

          superAdminUser = [newSuperAdmin];
        }

        if (superAdminUser.length > 0) {
          const user = superAdminUser[0];

          // Use Passport's login mechanism for proper session management
          const passportUser = {
            id: user.id,
            name: user.name || 'Super Admin',
            email: user.email || undefined,
            profileImageUrl: user.profileImageUrl || undefined,
            role: 'super_admin',
            authMethods: user.authMethods as string[],
            socialProviders: user.socialProviders as string[],
            isSuperAdmin: true
          };

          // Use Passport login to properly serialize user in session
          await new Promise<void>((resolve, reject) => {
            (req as any).login(passportUser, (err: any) => {
              if (err) {
                console.error('Passport login error:', err);
                reject(err);
              } else {
                console.log('Passport login successful for user:', passportUser.id);
                resolve();
              }
            });
          });

          // Check if MFA is required (for future implementation)
          const requiresMFA = false; // Set to true when MFA is implemented

          if (requiresMFA) {
            return res.json({
              success: true,
              requiresMFA: true,
              message: 'MFA verification required'
            });
          }

          return res.json({
            success: true,
            message: 'Admin login successful',
            user: {
              id: user.id,
              name: user.name || 'Super Admin',
              role: 'super_admin',
              isSuperAdmin: true
            }
          });
        }
      }

      // Invalid credentials
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  });

  // Admin MFA verification endpoint
  app.post('/api/auth/admin/verify-mfa', async (req, res) => {
    try {
      const { username, mfaCode, rememberDevice } = req.body;

      // MFA verification logic (implement with actual MFA service)
      // For now, accept any 6-digit code for development
      if (mfaCode && mfaCode.length === 6) {
        // Find and authenticate user
        const superAdminUser = await db
          .select()
          .from(users)
          .where(eq(users.whatsappNumber, '+919345228184'))
          .limit(1);

        if (superAdminUser.length > 0) {
          const user = superAdminUser[0];

          // Set unified session structure for admin users
          (req.session as any).user = {
            type: 'whatsapp' as const,
            id: user.id,
            tenantId: user.tenantId || 'admin_tenant',
            role: user.role || 'super_admin',
            isSuperAdmin: true
          };

          return res.json({
            success: true,
            message: 'MFA verification successful',
            user: {
              id: user.id,
              name: user.name || 'Super Admin',
              role: user.role || 'super_admin',
              isSuperAdmin: true
            }
          });
        }
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid verification code'
      });
    } catch (error) {
      console.error('MFA verification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Verification failed'
      });
    }
  });

  // Check admin authentication status
  app.get('/api/auth/admin/status', async (req, res) => {
    try {
      const user = req.user;

      if (user && user.isSuperAdmin) {
        return res.json({
          authenticated: true,
          user: {
            id: user.id,
            name: user.name,
            role: user.role || 'super_admin',
            isSuperAdmin: user.isSuperAdmin
          }
        });
      }

      return res.json({ authenticated: false });
    } catch (error) {
      return res.json({ authenticated: false });
    }
  });

  // Get current admin user info - MOVED to server/admin-auth.ts
  // Using isolated admin authentication system
  // app.get('/api/auth/admin/user', async (req, res) => {
  //   ... old implementation using req.user ...
  // });

  // Admin logout
  app.post('/api/auth/admin/logout', async (req, res) => {
    try {
      // Destroy the session completely
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({
            success: false,
            error: 'Logout failed'
          });
        }

        // Clear the session cookie
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });

        return res.json({
          success: true,
          message: 'Logged out successfully'
        });
      });
    } catch (error) {
      console.error('Admin logout error:', error);
      return res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  });

  // Simple Super Admin Login Endpoint (Legacy)
  app.post('/api/auth/super-admin-login', async (req, res) => {
    try {
      const { username, password } = req.body;

      // Simple credentials check
      if (username === '9345228184' && password === 'sadmin12') {
        // Find the super admin user in database
        const superAdminUser = await db
          .select()
          .from(users)
          .where(eq(users.whatsappNumber, '+919345228184'))
          .limit(1);

        if (superAdminUser.length > 0) {
          const user = superAdminUser[0];

          // Set session for Super Admin
          (req.session as any).whatsappUserId = user.id;
          (req.session as any).whatsappNumber = user.whatsappNumber;
          (req.session as any).superAdminAuth = true;

          return res.json({
            success: true,
            message: 'Super Admin login successful',
            user: {
              id: user.id,
              name: user.name,
              role: user.role,
              isSuperAdmin: user.isSuperAdmin,
              redirectUrl: '/super-admin'
            }
          });
        }
      }

      // Invalid credentials
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    } catch (error) {
      console.error('Super Admin login error:', error);
      return res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  });

  app.post('/api/auth/admin-login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Fixed admin credentials
      const adminCredentials = {
        '9345228184': { password: 'sadmin12', role: 'super_admin', name: 'Super Administrator' },
        '8220449933': { password: 'admin123', role: 'admin', name: 'Administrator' }
      };

      const admin = adminCredentials[username as keyof typeof adminCredentials];

      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create admin session
      req.session.adminUserId = username;
      req.session.adminRole = admin.role;
      req.session.adminName = admin.name;

      // Generate simple token for frontend
      const token = Buffer.from(`${username}:${admin.role}:${Date.now()}`).toString('base64');

      res.json({
        success: true,
        token,
        user: {
          id: username,
          username,
          name: admin.name,
          role: admin.role,
          permissions: admin.role === 'super_admin' 
            ? ['all_access', 'user_management', 'system_settings', 'module_management', 'tenant_management']
            : ['read_access', 'limited_user_management', 'module_viewing'],
          isActive: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in admin login:', error);
      res.status(500).json({ error: 'Admin login failed' });
    }
  });


  // Production Search API with Meilisearch
  // =====================================

  // Global search across all content
  app.get('/api/search/global', async (req, res) => {
    try {
      const { q, limit = 20, offset = 0, filter, tenantId } = req.query as any;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const { shouldUseMockService } = await import('./services/searchService');

      let results;
      if (shouldUseMockService()) {
        const { mockSearchService } = await import('./services/mockSearchService');
        results = await mockSearchService.globalSearch(q, {
          limit: parseInt(limit),
          offset: parseInt(offset),
          filter: filter as string,
          tenantId: tenantId as string,
        });
      } else {
        const { searchService } = await import('./services/searchService');
        results = await searchService.globalSearch(q, {
          limit: parseInt(limit),
          offset: parseInt(offset),
          filter: filter as string,
          tenantId: tenantId as string,
          attributesToHighlight: ['title', 'description', 'content'],
        });
      }

      res.json(results);
    } catch (error) {
      console.error('Global search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Search tenants
  app.get('/api/search/tenants', async (req, res) => {
    try {
      const { q, limit = 20, offset = 0 } = req.query as any;

      const { searchService, SEARCH_INDEXES } = await import('./services/searchService');

      const results = await searchService.search(
        SEARCH_INDEXES.TENANTS,
        q || '',
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
        }
      );

      res.json(results);
    } catch (error) {
      console.error('Tenant search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Search users
  app.get('/api/search/users', async (req, res) => {
    try {
      const { q, limit = 20, offset = 0, tenantId } = req.query as any;

      const { searchService, SEARCH_INDEXES } = await import('./services/searchService');

      const results = await searchService.tenantSearch(
        SEARCH_INDEXES.USERS,
        q || '',
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          tenantId: tenantId as string,
        }
      );

      res.json(results);
    } catch (error) {
      console.error('User search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Search WhatsApp users
  app.get('/api/search/whatsapp-users', async (req, res) => {
    try {
      const { q, limit = 20, offset = 0, tenantId, country } = req.query as any;

      const { searchService, SEARCH_INDEXES } = await import('./services/searchService');

      let filter = '';
      if (country) {
        filter = `country = "${country}"`;
      }

      const results = await searchService.tenantSearch(
        SEARCH_INDEXES.WHATSAPP_USERS,
        q || '',
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          tenantId: tenantId as string,
          filter,
        }
      );

      res.json(results);
    } catch (error) {
      console.error('WhatsApp user search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Search models
  app.get('/api/search/models', async (req, res) => {
    try {
      const { q, limit = 20, offset = 0, tenantId, status } = req.query as any;

      const { searchService, SEARCH_INDEXES } = await import('./services/searchService');

      let filter = '';
      if (status) {
        filter = `status = "${status}"`;
      }

      const results = await searchService.tenantSearch(
        SEARCH_INDEXES.MODELS,
        q || '',
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          tenantId: tenantId as string,
          filter,
        }
      );

      res.json(results);
    } catch (error) {
      console.error('Model search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Search pages
  app.get('/api/search/pages', async (req, res) => {
    try {
      const { q, limit = 20, offset = 0, tenantId, status, locale } = req.query as any;

      const { searchService, SEARCH_INDEXES } = await import('./services/searchService');

      const filters = [];
      if (status) filters.push(`status = "${status}"`);
      if (locale) filters.push(`locale = "${locale}"`);

      const results = await searchService.tenantSearch(
        SEARCH_INDEXES.PAGES,
        q || '',
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          tenantId: tenantId as string,
          filter: filters.length > 0 ? filters.join(' AND ') : undefined,
        }
      );

      res.json(results);
    } catch (error) {
      console.error('Page search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Search apps
  app.get('/api/search/apps', async (req, res) => {
    try {
      const { q, limit = 20, offset = 0, tenantId, status, isPublic } = req.query as any;

      const { searchService, SEARCH_INDEXES } = await import('./services/searchService');

      const filters = [];
      if (status) filters.push(`status = "${status}"`);
      if (isPublic !== undefined) filters.push(`isPublic = ${isPublic}`);

      const results = await searchService.tenantSearch(
        SEARCH_INDEXES.APPS,
        q || '',
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          tenantId: tenantId as string,
          filter: filters.length > 0 ? filters.join(' AND ') : undefined,
        }
      );

      res.json(results);
    } catch (error) {
      console.error('App search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Search trademarks
  app.get('/api/search/trademarks', async (req, res) => {
    try {
      const { q, limit = 20, offset = 0, status, classification, country } = req.query as any;

      const { searchService, SEARCH_INDEXES } = await import('./services/searchService');

      const filters = [];
      if (status) filters.push(`status = "${status}"`);
      if (classification) filters.push(`classification = "${classification}"`);
      if (country) filters.push(`country = "${country}"`);

      const results = await searchService.search(
        SEARCH_INDEXES.TRADEMARKS,
        q || '',
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          filter: filters.length > 0 ? filters.join(' AND ') : undefined,
          attributesToHighlight: ['wordMark', 'applicantName', 'description'],
        }
      );

      res.json(results);
    } catch (error) {
      console.error('Trademark search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Search TM numbers
  app.get('/api/search/tm-numbers', async (req, res) => {
    try {
      const { q, limit = 20, offset = 0, classCc, countryCcc, status } = req.query as any;

      const { searchService, SEARCH_INDEXES } = await import('./services/searchService');

      const filters = [];
      if (classCc) filters.push(`classCc = "${classCc}"`);
      if (countryCcc) filters.push(`countryCcc = "${countryCcc}"`);
      if (status) filters.push(`status = "${status}"`);

      const results = await searchService.search(
        SEARCH_INDEXES.TM_NUMBERS,
        q || '',
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          filter: filters.length > 0 ? filters.join(' AND ') : undefined,
        }
      );

      res.json(results);
    } catch (error) {
      console.error('TM number search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Search media files
  app.get('/api/search/media', async (req, res) => {
    try {
      const { q, limit = 20, offset = 0, tenantId, mimeType } = req.query as any;

      const { searchService, SEARCH_INDEXES } = await import('./services/searchService');

      let filter = '';
      if (mimeType) {
        filter = `mimeType = "${mimeType}"`;
      }

      const results = await searchService.tenantSearch(
        SEARCH_INDEXES.MEDIA,
        q || '',
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          tenantId: tenantId as string,
          filter,
        }
      );

      res.json(results);
    } catch (error) {
      console.error('Media search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Get search suggestions/autocomplete
  app.get('/api/search/suggestions/:index', async (req, res) => {
    try {
      const { index } = req.params;
      const { q, limit = 5, tenantId } = req.query as any;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const { shouldUseMockService, SEARCH_INDEXES } = await import('./services/searchService');

      // Validate index name
      const validIndexes = Object.values(SEARCH_INDEXES);
      if (!validIndexes.includes(index as any)) {
        return res.status(400).json({ error: 'Invalid search index' });
      }

      let suggestions;
      if (shouldUseMockService()) {
        const { mockSearchService } = await import('./services/mockSearchService');
        suggestions = await mockSearchService.getSuggestions(
          index as any,
          q,
          parseInt(limit)
        );
      } else {
        const { searchService } = await import('./services/searchService');
        suggestions = await searchService.getSuggestions(
          index as any,
          q,
          parseInt(limit),
          tenantId as string
        );
      }

      res.json({ suggestions });
    } catch (error) {
      console.error('Search suggestions error:', error);
      res.status(500).json({ error: 'Failed to get suggestions' });
    }
  });

  // Get search index statistics
  app.get('/api/search/stats', async (req, res) => {
    try {
      const { shouldUseMockService, SEARCH_INDEXES } = await import('./services/searchService');

      const stats: Record<string, any> = {};

      if (shouldUseMockService()) {
        const { mockSearchService } = await import('./services/mockSearchService');
        for (const [key, indexName] of Object.entries(SEARCH_INDEXES)) {
          stats[key] = await mockSearchService.getIndexStats(indexName as any);
        }
      } else {
        const { searchService } = await import('./services/searchService');
        for (const [key, indexName] of Object.entries(SEARCH_INDEXES)) {
          stats[key] = await searchService.getIndexStats(indexName);
        }
      }

      res.json({ indexes: stats });
    } catch (error) {
      console.error('Search stats error:', error);
      res.status(500).json({ error: 'Failed to get search statistics' });
    }
  });

  // Search service health check
  app.get('/api/search/health', async (req, res) => {
    try {
      const { shouldUseMockService } = await import('./services/searchService');

      let isHealthy;
      if (shouldUseMockService()) {
        const { mockSearchService } = await import('./services/mockSearchService');
        isHealthy = await mockSearchService.isHealthy();
      } else {
        const { searchService } = await import('./services/searchService');
        isHealthy = await searchService.isHealthy();
      }

      res.json({ 
        status: isHealthy ? 'healthy' : 'unhealthy',
        service: shouldUseMockService() ? 'mock' : 'meilisearch',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Search health check error:', error);
      res.status(500).json({ 
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Rebuild search indexes (admin only)
  app.post('/api/search/rebuild', async (req, res) => {
    try {
      const { index } = req.body;

      const { searchIndexer } = await import('./services/searchIndexer');

      if (index === 'all') {
        // Rebuild all indexes
        await searchIndexer.initialize();
        res.json({ message: 'All search indexes rebuilt successfully' });
      } else if (index === 'global') {
        // Rebuild only global index
        await searchIndexer.rebuildGlobalIndex();
        res.json({ message: 'Global search index rebuilt successfully' });
      } else {
        res.status(400).json({ error: 'Invalid rebuild option' });
      }
    } catch (error) {
      console.error('Search rebuild error:', error);
      res.status(500).json({ error: 'Failed to rebuild search indexes' });
    }
  });

  // AssessDisc DISC Assessment Routes (Public Access)

  // Initialize assessment data (safe for production) - GET version for browser access
  app.get('/api/assessments/initialize', async (req, res) => {
    try {
      const force = req.query.force === 'true';

      if (force) {
        // Delete existing questions and options to force reinit
        await db.delete(assessmentOptions);
        await db.delete(assessmentQuestions);
        console.log('Forced deletion of questions and options for reinitialization');
      }

      // Force initialization of default data
      await assessmentService.initializeDefaultData();
      res.json({ success: true, message: 'Assessment data initialized successfully', forced: force });
    } catch (error) {
      console.error('Error initializing assessment data:', error);
      res.status(500).json({ error: 'Failed to initialize assessment data' });
    }
  });

  // Initialize assessment data (safe for production) - POST version for API calls
  app.post('/api/assessments/initialize', async (req, res) => {
    try {
      // Force initialization of default data
      await assessmentService.initializeDefaultData();
      res.json({ success: true, message: 'Assessment data initialized successfully' });
    } catch (error) {
      console.error('Error initializing assessment data:', error);
      res.status(500).json({ error: 'Failed to initialize assessment data' });
    }
  });

  // Reset assessment data (for development)
  app.delete('/api/assessments/reset', async (req, res) => {
    try {
      // Clear all assessment data to reinitialize
      await db.delete(assessmentOptions);
      await db.delete(assessmentQuestions);
      await db.delete(assessmentCategories);
      await db.delete(assessmentResults);
      await db.delete(assessmentResponses);
      await db.delete(assessmentSessions);

      // Reinitialize default data
      await assessmentService.initializeDefaultData();

      res.json({ success: true, message: 'Assessment data reset and reinitialized' });
    } catch (error) {
      console.error('Error resetting assessment data:', error);
      res.status(500).json({ error: 'Failed to reset assessment data' });
    }
  });

  // Get assessment categories
  app.get('/api/assessments/categories', async (req, res) => {
    try {
      const categories = await assessmentService.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching assessment categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get assessment questions
  app.get('/api/assessments/questions', async (req, res) => {
    try {
      const { categoryId, language = 'en' } = req.query;
      const questions = await assessmentService.getQuestions(
        categoryId && categoryId !== 'null' && categoryId !== '' ? categoryId as string : undefined, 
        language as string
      );
      res.json(questions);
    } catch (error) {
      console.error("Error fetching assessment questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Start assessment session
  app.post('/api/assessments/sessions', async (req, res) => {
    try {
      const sessionData = insertAssessmentSessionSchema.parse({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      const session = await assessmentService.createSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating assessment session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // Submit assessment response
  app.post('/api/assessments/responses', async (req, res) => {
    try {
      const responseData = insertAssessmentResponseSchema.parse(req.body);
      const response = await assessmentService.saveResponse(responseData);
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error saving assessment response:", error);
      res.status(500).json({ message: "Failed to save response" });
    }
  });

  // Calculate assessment results
  app.post('/api/assessments/sessions/:sessionId/calculate', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const result = await assessmentService.calculateAndSaveResults(sessionId);
      res.json(result);
    } catch (error) {
      console.error("Error calculating assessment results:", error);
      res.status(500).json({ message: "Failed to calculate results" });
    }
  });

  // Get assessment results
  app.get('/api/assessments/sessions/:sessionId/results', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const sessionWithResult = await assessmentService.getSessionWithResult(sessionId);

      if (!sessionWithResult) {
        return res.status(404).json({ message: "Session not found" });
      }

      res.json(sessionWithResult);
    } catch (error) {
      console.error("Error fetching assessment results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Get assessment session
  app.get('/api/assessments/sessions/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await assessmentService.getSessionWithResult(sessionId);

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Error fetching assessment session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // RealBro Property Brother API Routes
  app.get('/api/realbro/demo-stats', async (req, res) => {
    try {
      // Demo data for RealBro module
      const stats = {
        totalProperties: 12,
        availableProperties: 8,
        soldProperties: 4,
        creditsRemaining: 5
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching RealBro stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/realbro/demo-properties', async (req, res) => {
    try {
      // Demo properties data
      const properties = [
        {
          id: "RB001",
          title: "3 BHK Apartment in Anna Nagar",
          price: "₹85,00,000",
          size: "1200 sq ft",
          location: "Anna Nagar, Chennai",
          status: "AVAILABLE",
          commission: "2%",
          createdAt: new Date().toISOString()
        },
        {
          id: "RB002", 
          title: "2 BHK House in Coimbatore",
          price: "₹45,00,000",
          size: "900 sq ft",
          location: "RS Puram, Coimbatore", 
          status: "SOLD",
          commission: "₹50,000",
          createdAt: new Date().toISOString()
        },
        {
          id: "RB003",
          title: "Villa in ECR",
          price: "₹1,20,00,000", 
          size: "2500 sq ft",
          location: "ECR, Chennai",
          status: "AVAILABLE",
          commission: "1.5%",
          createdAt: new Date().toISOString()
        }
      ];
      res.json(properties);
    } catch (error) {
      console.error("Error fetching RealBro properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get('/api/realbro/demo-contacts', async (req, res) => {
    try {
      // Demo broker contacts
      const contacts = [
        { name: "Ravi Kumar", phone: "+91 98765 43210", email: "ravi@example.com", district: "Chennai" },
        { name: "Priya Sharma", phone: "+91 87654 32109", email: "priya@example.com", district: "Coimbatore" },
        { name: "Murugan S", phone: "+91 76543 21098", email: "murugan@example.com", district: "Madurai" }
      ];
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching RealBro contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.get('/api/realbro/demo-credits', async (req, res) => {
    try {
      // Demo credit transactions
      const creditHistory = [
        { type: "USED", amount: -1, description: "Property listing: Anna Nagar Apartment", date: "2 days ago" },
        { type: "PURCHASED", amount: 10, description: "Credit purchase - ₹2,500", date: "1 week ago" },
        { type: "FREE", amount: 1, description: "Welcome bonus", date: "2 weeks ago" }
      ];
      res.json({ balance: 5, history: creditHistory });
    } catch (error) {
      console.error("Error fetching RealBro credits:", error);
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  // WytDuty Enterprise API Routes
  app.get('/api/wytduty/demo-stats', async (req, res) => {
    try {
      const stats = {
        totalDuties: 247,
        pendingApproval: 8,
        completionRate: 94,
        overdue: 3
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching WytDuty stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/wytduty/demo-duties', async (req, res) => {
    try {
      const duties = [
        {
          id: "D001",
          title: "Q4 Financial Report",
          assignee: "Finance Team",
          status: "pending",
          priority: "high",
          schedule: "monthly_before_5",
          dueAt: new Date(Date.now() + 86400000).toISOString()
        },
        {
          id: "D002",
          title: "Security Audit Review",
          assignee: "Security Team", 
          status: "for_approval",
          priority: "high",
          schedule: "onetime",
          dueAt: new Date(Date.now() + 172800000).toISOString()
        },
        {
          id: "D003",
          title: "Weekly Newsletter",
          assignee: "Marketing",
          status: "pending",
          priority: "medium",
          schedule: "weekly_before_sat",
          dueAt: new Date(Date.now() + 432000000).toISOString()
        }
      ];
      res.json(duties);
    } catch (error) {
      console.error("Error fetching WytDuty duties:", error);
      res.status(500).json({ message: "Failed to fetch duties" });
    }
  });

  app.get('/api/wytduty/demo-approvals', async (req, res) => {
    try {
      const approvals = [
        {
          id: "D002",
          title: "Security Audit Review",
          requestedBy: "John Smith",
          date: "2 hours ago",
          priority: "high"
        },
        {
          id: "D008", 
          title: "Budget Revision Request",
          requestedBy: "Finance Team",
          date: "1 day ago",
          priority: "medium"
        }
      ];
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching WytDuty approvals:", error);
      res.status(500).json({ message: "Failed to fetch approvals" });
    }
  });

  // Admin Analytics API Routes  
  app.get('/api/admin/platform-stats', async (req, res) => {
    try {
      const stats = {
        totalUsers: 2847,
        activeTenants: 284,
        monthlyRevenue: 124500,
        platformUptime: 99.8
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform stats" });
    }
  });

  app.get('/api/admin/module-stats', async (req, res) => {
    try {
      const moduleStats = {
        assessment: { users: 8547, completionRate: 94.2, avgTime: 12 },
        realbro: { brokers: 127, properties: 2456, creditsUsed: 1890 },
        wytduty: { organizations: 45, dutiesCompleted: 12847, approvalRate: 96.8 }
      };
      res.json(moduleStats);
    } catch (error) {
      console.error("Error fetching module stats:", error);
      res.status(500).json({ message: "Failed to fetch module stats" });
    }
  });

  app.get('/api/admin/user-metrics', async (req, res) => {
    try {
      const userMetrics = {
        newUsers: 347,
        retention30d: 78.5,
        dailyActive: 1247,
        avgSessionDuration: 24,
        geography: {
          india: 85,
          usa: 8,
          uk: 4,
          others: 3
        }
      };
      res.json(userMetrics);
    } catch (error) {
      console.error("Error fetching user metrics:", error);
      res.status(500).json({ message: "Failed to fetch user metrics" });
    }
  });

  app.get('/api/admin/revenue-data', async (req, res) => {
    try {
      const revenueData = {
        monthlyRevenue: 124500,
        breakdown: {
          wytduty: { amount: 89400, percentage: 72 },
          realbro: { amount: 28750, percentage: 23 },
          assessment: { amount: 6350, percentage: 5 }
        },
        paymentSuccessRate: 98.7,
        averageTransaction: 2847,
        refundRate: 0.8
      };
      res.json(revenueData);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });

  // Profile Fields Management API Routes (Admin)
  app.get('/api/admin/profile-fields', adminAuthMiddleware, async (req: any, res) => {
    try {
      const fields = await db
        .select()
        .from(profileFieldWeights)
        .orderBy(profileFieldWeights.tabSection, profileFieldWeights.fieldName);

      res.json({ success: true, fields });
    } catch (error) {
      console.error("Error fetching profile fields:", error);
      res.status(500).json({ message: "Failed to fetch profile fields" });
    }
  });

  app.post('/api/admin/profile-fields', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { fieldName, fieldLabel, weightPercentage, isRequired, tabSection } = req.body;

      const [newField] = await db
        .insert(profileFieldWeights)
        .values({
          fieldName,
          fieldLabel,
          weightPercentage,
          isRequired,
          tabSection
        })
        .returning();

      res.json({ success: true, field: newField });
    } catch (error) {
      console.error("Error creating profile field:", error);
      res.status(500).json({ message: "Failed to create profile field" });
    }
  });

  app.put('/api/admin/profile-fields/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { fieldLabel, weightPercentage, isRequired, tabSection } = req.body;

      const [updatedField] = await db
        .update(profileFieldWeights)
        .set({
          fieldLabel,
          weightPercentage,
          isRequired,
          tabSection,
          updatedAt: new Date()
        })
        .where(eq(profileFieldWeights.id, id))
        .returning();

      if (!updatedField) {
        return res.status(404).json({ message: "Profile field not found" });
      }

      res.json({ success: true, field: updatedField });
    } catch (error) {
      console.error("Error updating profile field:", error);
      res.status(500).json({ message: "Failed to update profile field" });
    }
  });

  app.delete('/api/admin/profile-fields/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;

      const [deletedField] = await db
        .delete(profileFieldWeights)
        .where(eq(profileFieldWeights.id, id))
        .returning();

      if (!deletedField) {
        return res.status(404).json({ message: "Profile field not found" });
      }

      res.json({ success: true, message: "Profile field deleted successfully" });
    } catch (error) {
      console.error("Error deleting profile field:", error);
      res.status(500).json({ message: "Failed to delete profile field" });
    }
  });

  // Points Configuration Management API Routes (Admin)
  app.get('/api/admin/points-config', adminAuthMiddleware, async (req: any, res) => {
    try {
      const configs = await db
        .select()
        .from(pointsConfig)
        .where(eq(pointsConfig.isActive, true))
        .orderBy(pointsConfig.category, pointsConfig.action);

      res.json({ success: true, configs });
    } catch (error) {
      console.error("Error fetching points configuration:", error);
      res.status(500).json({ message: "Failed to fetch points configuration" });
    }
  });

  app.post('/api/admin/points-config', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { action, points, description, category } = req.body;

      const [newConfig] = await db
        .insert(pointsConfig)
        .values({
          action,
          points,
          description,
          category,
          isActive: true,
          updatedBy: req.user.id
        })
        .returning();

      res.json({ success: true, config: newConfig });
    } catch (error) {
      console.error("Error creating points configuration:", error);
      res.status(500).json({ message: "Failed to create points configuration" });
    }
  });

  app.put('/api/admin/points-config/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { points, description, isActive, category } = req.body;

      const [updatedConfig] = await db
        .update(pointsConfig)
        .set({
          points,
          description,
          isActive,
          category,
          updatedBy: req.user.id,
          updatedAt: new Date()
        })
        .where(eq(pointsConfig.id, id))
        .returning();

      if (!updatedConfig) {
        return res.status(404).json({ message: "Points configuration not found" });
      }

      res.json({ success: true, config: updatedConfig });
    } catch (error) {
      console.error("Error updating points configuration:", error);
      res.status(500).json({ message: "Failed to update points configuration" });
    }
  });

  app.delete('/api/admin/points-config/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;

      const [deletedConfig] = await db
        .delete(pointsConfig)
        .where(eq(pointsConfig.id, id))
        .returning();

      if (!deletedConfig) {
        return res.status(404).json({ message: "Points configuration not found" });
      }

      res.json({ success: true, message: "Points configuration deleted successfully" });
    } catch (error) {
      console.error("Error deleting points configuration:", error);
      res.status(500).json({ message: "Failed to delete points configuration" });
    }
  });

  // RealBro Enhanced API Routes
  app.get('/api/realbro/demo-properties', async (req, res) => {
    try {
      const properties = [
        {
          title: "3BHK Luxury Apartment",
          location: "Anna Nagar, Chennai",
          price: "₹85,00,000",
          size: "1,200 sq ft",
          status: "Available"
        },
        {
          title: "Independent Villa",
          location: "Peelamedu, Coimbatore", 
          price: "₹1,20,00,000",
          size: "2,400 sq ft",
          status: "New"
        },
        {
          title: "2BHK Modern Flat",
          location: "KK Nagar, Madurai",
          price: "₹45,00,000", 
          size: "900 sq ft",
          status: "Available"
        },
        {
          title: "4BHK Duplex House",
          location: "Race Course, Salem",
          price: "₹75,00,000",
          size: "1,800 sq ft", 
          status: "Premium"
        },
        {
          title: "Studio Apartment",
          location: "T Nagar, Chennai",
          price: "₹35,00,000",
          size: "450 sq ft",
          status: "Available"
        },
        {
          title: "Row House with Garden",
          location: "Saravanampatti, Coimbatore",
          price: "₹95,00,000",
          size: "1,600 sq ft",
          status: "New"
        }
      ];
      res.json(properties);
    } catch (error) {
      console.error("Error fetching demo properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // WytDuty Enhanced API Routes
  app.get('/api/wytduty/enhanced-duties', async (req, res) => {
    try {
      const duties = [
        {
          id: 1,
          title: "Morning Security Check",
          description: "Complete security rounds of all entry points",
          assignedTo: "Ravi Kumar",
          startTime: "06:00",
          endTime: "14:00",
          location: "Main Entrance",
          status: "confirmed",
          priority: "high"
        },
        {
          id: 2,
          title: "IT Support Coverage", 
          description: "Provide technical support for daily operations",
          assignedTo: "Priya Sharma",
          startTime: "09:00",
          endTime: "17:00", 
          location: "Tech Center",
          status: "pending",
          priority: "medium"
        }
      ];
      res.json(duties);
    } catch (error) {
      console.error("Error fetching enhanced duties:", error);
      res.status(500).json({ message: "Failed to fetch duties" });
    }
  });

  // Assessment API Routes
  app.get('/api/assessments/categories', async (req, res) => {
    try {
      const categories = [
        {
          id: 'general',
          name: 'general',
          displayName: 'General Professional',
          description: 'For general professional development'
        },
        {
          id: 'student',
          name: 'student', 
          displayName: 'Student',
          description: 'For students and academic purposes'
        },
        {
          id: 'manager',
          name: 'manager',
          displayName: 'Manager/Leader',
          description: 'For managers and leadership roles'
        }
      ];
      res.json(categories);
    } catch (error) {
      console.error("Error fetching assessment categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/assessments/questions', async (req, res) => {
    try {
      const { categoryId, language = 'en' } = req.query;

      const questions = [
        {
          id: 'q1',
          questionNumber: 1,
          questionText: 'When faced with a challenging problem, I prefer to:',
          discType: 'D',
          options: [
            { id: 'q1_a', optionText: 'Take charge and act decisively', optionValue: 4, discType: 'D' },
            { id: 'q1_b', optionText: 'Gather people to brainstorm solutions', optionValue: 3, discType: 'I' },
            { id: 'q1_c', optionText: 'Consider all stakeholders carefully', optionValue: 2, discType: 'S' },
            { id: 'q1_d', optionText: 'Analyze all possible outcomes first', optionValue: 1, discType: 'C' }
          ]
        },
        {
          id: 'q2',
          questionNumber: 2,
          questionText: 'In social situations, I tend to:',
          discType: 'I',
          options: [
            { id: 'q2_a', optionText: 'Lead conversations and energize others', optionValue: 4, discType: 'I' },
            { id: 'q2_b', optionText: 'Take control of the situation', optionValue: 3, discType: 'D' },
            { id: 'q2_c', optionText: 'Listen and support others', optionValue: 2, discType: 'S' },
            { id: 'q2_d', optionText: 'Observe and contribute thoughtfully', optionValue: 1, discType: 'C' }
          ]
        },
        {
          id: 'q3',
          questionNumber: 3,
          questionText: 'When working in a team, my priority is to:',
          discType: 'S',
          options: [
            { id: 'q3_a', optionText: 'Support team harmony and collaboration', optionValue: 4, discType: 'S' },
            { id: 'q3_b', optionText: 'Ensure quality and accuracy', optionValue: 3, discType: 'C' },
            { id: 'q3_c', optionText: 'Drive results and efficiency', optionValue: 2, discType: 'D' },
            { id: 'q3_d', optionText: 'Motivate and inspire the team', optionValue: 1, discType: 'I' }
          ]
        },
        {
          id: 'q4',
          questionNumber: 4,
          questionText: 'When making important decisions, I:',
          discType: 'C',
          options: [
            { id: 'q4_a', optionText: 'Gather and analyze detailed information', optionValue: 4, discType: 'C' },
            { id: 'q4_b', optionText: 'Consider impact on relationships', optionValue: 3, discType: 'S' },
            { id: 'q4_c', optionText: 'Make quick, bold decisions', optionValue: 2, discType: 'D' },
            { id: 'q4_d', optionText: 'Seek input from others', optionValue: 1, discType: 'I' }
          ]
        },
        {
          id: 'q5',
          questionNumber: 5,
          questionText: 'Under pressure, I:',
          discType: 'D',
          options: [
            { id: 'q5_a', optionText: 'Become more focused and driven', optionValue: 4, discType: 'D' },
            { id: 'q5_b', optionText: 'Rally others for support', optionValue: 3, discType: 'I' },
            { id: 'q5_c', optionText: 'Remain calm and steady', optionValue: 2, discType: 'S' },
            { id: 'q5_d', optionText: 'Systematically work through issues', optionValue: 1, discType: 'C' }
          ]
        },
        {
          id: 'q6',
          questionNumber: 6,
          questionText: 'I prefer communication that is:',
          discType: 'I',
          options: [
            { id: 'q6_a', optionText: 'Enthusiastic and expressive', optionValue: 4, discType: 'I' },
            { id: 'q6_b', optionText: 'Direct and to the point', optionValue: 3, discType: 'D' },
            { id: 'q6_c', optionText: 'Supportive and understanding', optionValue: 2, discType: 'S' },
            { id: 'q6_d', optionText: 'Detailed and precise', optionValue: 1, discType: 'C' }
          ]
        },
        {
          id: 'q7',
          questionNumber: 7,
          questionText: 'In conflicts, I tend to:',
          discType: 'S',
          options: [
            { id: 'q7_a', optionText: 'Seek peaceful resolutions', optionValue: 4, discType: 'S' },
            { id: 'q7_b', optionText: 'Address issues systematically', optionValue: 3, discType: 'C' },
            { id: 'q7_c', optionText: 'Take charge and resolve quickly', optionValue: 2, discType: 'D' },
            { id: 'q7_d', optionText: 'Help everyone feel heard', optionValue: 1, discType: 'I' }
          ]
        },
        {
          id: 'q8',
          questionNumber: 8,
          questionText: 'My work style is best described as:',
          discType: 'C',
          options: [
            { id: 'q8_a', optionText: 'Methodical and thorough', optionValue: 4, discType: 'C' },
            { id: 'q8_b', optionText: 'Consistent and reliable', optionValue: 3, discType: 'S' },
            { id: 'q8_c', optionText: 'Fast-paced and results-oriented', optionValue: 2, discType: 'D' },
            { id: 'q8_d', optionText: 'Collaborative and energetic', optionValue: 1, discType: 'I' }
          ]
        },
        {
          id: 'q9',
          questionNumber: 9,
          questionText: 'When learning something new, I prefer to:',
          discType: 'D',
          options: [
            { id: 'q9_a', optionText: 'Jump in and learn by doing', optionValue: 4, discType: 'D' },
            { id: 'q9_b', optionText: 'Learn with others in a group', optionValue: 3, discType: 'I' },
            { id: 'q9_c', optionText: 'Take time to understand thoroughly', optionValue: 2, discType: 'S' },
            { id: 'q9_d', optionText: 'Study all materials carefully first', optionValue: 1, discType: 'C' }
          ]
        },
        {
          id: 'q10',
          questionNumber: 10,
          questionText: 'I am most motivated by:',
          discType: 'I',
          options: [
            { id: 'q10_a', optionText: 'Recognition and positive feedback', optionValue: 4, discType: 'I' },
            { id: 'q10_b', optionText: 'Achieving challenging goals', optionValue: 3, discType: 'D' },
            { id: 'q10_c', optionText: 'Helping and supporting others', optionValue: 2, discType: 'S' },
            { id: 'q10_d', optionText: 'Doing quality, accurate work', optionValue: 1, discType: 'C' }
          ]
        }
      ];

      res.json(questions);
    } catch (error) {
      console.error("Error fetching assessment questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post('/api/assessments/sessions', async (req, res) => {
    try {
      const sessionData = req.body;
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const session = {
        id: sessionId,
        ...sessionData,
        isCompleted: false,
        createdAt: new Date()
      };

      res.json(session);
    } catch (error) {
      console.error("Error creating assessment session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.post('/api/assessments/responses', async (req, res) => {
    try {
      const responseData = req.body;

      // Store response (in a real app, this would go to database)
      const response = {
        id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...responseData,
        createdAt: new Date()
      };

      res.json(response);
    } catch (error) {
      console.error("Error storing assessment response:", error);
      res.status(500).json({ message: "Failed to store response" });
    }
  });

  app.post('/api/assessments/sessions/:sessionId/calculate', async (req, res) => {
    try {
      const { sessionId } = req.params;

      // Mock calculation - in a real app this would calculate based on stored responses
      const result = {
        sessionId,
        primaryType: 'D',
        secondaryType: 'I',
        dominanceScore: 75,
        influenceScore: 65,
        steadinessScore: 45,
        conscientiousnessScore: 55,
        personalityProfile: {
          dominance: { score: 75, description: 'You are results-oriented and direct in your approach.' },
          influence: { score: 65, description: 'You enjoy interacting with others and building relationships.' },
          steadiness: { score: 45, description: 'You prefer some variety and change in your work.' },
          conscientiousness: { score: 55, description: 'You balance quality with efficiency.' }
        },
        strengths: [
          'Leadership',
          'Decision Making', 
          'Communication',
          'Goal Achievement',
          'Team Building'
        ],
        recommendations: {
          primary: {
            career: [
              'Executive Leadership',
              'Sales Management',
              'Project Management',
              'Business Development',
              'Operations Management'
            ]
          },
          combinedAdvice: 'Your combination of Dominance and Influence makes you well-suited for leadership roles that require both driving results and inspiring teams. Consider positions where you can lead initiatives, make strategic decisions, and motivate others towards common goals.'
        }
      };

      res.json({ result });
    } catch (error) {
      console.error("Error calculating assessment results:", error);
      res.status(500).json({ message: "Failed to calculate results" });
    }
  });

  app.get('/api/assessments/sessions/:sessionId/results', async (req, res) => {
    try {
      const { sessionId } = req.params;

      // Mock results - in a real app this would fetch from database
      const result = {
        sessionId,
        primaryType: 'D',
        secondaryType: 'I',
        dominanceScore: 75,
        influenceScore: 65,
        steadinessScore: 45,
        conscientiousnessScore: 55,
        personalityProfile: {
          dominance: { score: 75, description: 'You are results-oriented and direct in your approach.' },
          influence: { score: 65, description: 'You enjoy interacting with others and building relationships.' },
          steadiness: { score: 45, description: 'You prefer some variety and change in your work.' },
          conscientiousness: { score: 55, description: 'You balance quality with efficiency.' }
        },
        strengths: [
          'Leadership',
          'Decision Making', 
          'Communication',
          'Goal Achievement',
          'Team Building'
        ],
        recommendations: {
          primary: {
            career: [
              'Executive Leadership',
              'Sales Management', 
              'Project Management',
              'Business Development',
              'Operations Management'
            ]
          },
          combinedAdvice: 'Your combination of Dominance and Influence makes you well-suited for leadership roles that require both driving results and inspiring teams. Consider positions where you can lead initiatives, make strategic decisions, and motivate others towards common goals.'
        }
      };

      res.json({ result });
    } catch (error) {
      console.error("Error fetching assessment results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // ============================================================================
  // PLATFORM MODULES MANAGEMENT API
  // ============================================================================

  // Initialize default platform modules service
  async function initializeDefaultModules() {
    try {
      const existingModules = await db.select().from(platformModules).limit(1);

      if (existingModules.length === 0) {
        console.log('Initializing default platform modules...');

        const defaultModules: InsertPlatformModule[] = [
          // WYTAPPS (Direct user-facing applications)
          {
            id: 'qr-generator',
            name: 'QR Code Generator',
            description: 'Generate QR codes for URLs, text, and contact information',
            category: 'wytapps',
            type: 'tool',
            status: 'enabled',
            pricing: 'free',
            icon: 'qrcode',
            color: 'blue',
            route: '/qr-generator',
            features: ['Instant QR code generation', 'Multiple data types support', 'Customizable colors & styles', 'Download in multiple formats'],
            usage: 1250,
            installs: 8900,
            order: 1
          },
          {
            id: 'assessment',
            name: 'DISC Assessment',
            description: 'Personality and behavioral assessment tool',
            category: 'wytapps',
            type: 'assessment',
            status: 'enabled',
            pricing: 'free',
            icon: 'chart-pie',
            color: 'purple',
            route: '/assessment',
            features: ['15-question assessment', 'Detailed personality insights', 'Career recommendations'],
            usage: 450,
            installs: 2100,
            order: 2
          },
          {
            id: 'ai-directory',
            name: 'AI Directory',
            description: 'Comprehensive AI tools and services directory',
            category: 'wytapps',
            type: 'directory',
            status: 'enabled',
            pricing: 'free',
            icon: 'robot',
            color: 'green',
            route: '/ai-directory',
            features: ['AI tools database', 'Categorized listings', 'Reviews and ratings'],
            usage: 3200,
            installs: 15600,
            order: 3
          },
          {
            id: 'realbro',
            name: 'RealBRO Hub', 
            description: 'Real estate broker and professional networking hub',
            category: 'wythubs',
            type: 'hub',
            status: 'disabled',
            pricing: 'freemium',
            price: '999',
            currency: 'INR',
            icon: 'home',
            color: 'orange',
            route: '/h/realbro',
            features: ['Property listing management', 'Broker network & contacts', 'Credit-based system', 'Tamil language support'],
            usage: 850,
            installs: 4200,
            order: 4
          },
          {
            id: 'wytduty',
            name: 'WytDuty Task Manager',
            description: 'Task and duty management for teams',
            category: 'wythubs',
            type: 'productivity',
            status: 'disabled',
            pricing: 'premium',
            price: '599',
            currency: 'INR',
            icon: 'tasks',
            color: 'indigo',
            route: '/wytduty',
            features: ['Duty assignment & tracking', 'Approval workflows', 'Calendar & scheduling', 'Analytics & reporting'],
            usage: 650,
            installs: 3100,
            order: 5
          },
          {
            id: 'tm-numbering',
            name: 'TMNumber11 System',
            description: 'Trademark numbering and classification system',
            category: 'wythubs',
            type: 'utility',
            status: 'disabled',
            pricing: 'premium',
            price: '1999',
            currency: 'INR',
            icon: 'trademark',
            color: 'red',
            route: '/tm-numbering',
            features: ['Trademark number generation', 'Classification system', 'Validation tools'],
            usage: 180,
            installs: 950,
            order: 6
          },
          {
            id: 'wytai-trademark',
            name: 'WytAi Trademark Analysis',
            description: 'AI-powered Indian trademark analysis engine',
            category: 'wythubs',
            type: 'ai-analysis',
            status: 'disabled',
            pricing: 'premium',
            price: '2499',
            currency: 'INR',
            icon: 'search',
            color: 'teal',
            route: '/wytai-trademark',
            features: ['AI-powered analysis', 'Similarity detection', 'Risk assessment', 'Legal insights'],
            usage: 320,
            installs: 1200,
            order: 7
          },

          // NEW WYTAPPS (Free productivity tools)
          {
            id: 'invoice-generator',
            name: 'Invoice Generator',
            description: 'Simple business invoice creation and PDF export',
            category: 'wytapps',
            type: 'tool',
            status: 'disabled',
            pricing: 'free',
            icon: 'file-invoice',
            color: 'purple',
            route: '/invoice-generator',
            features: ['Professional templates', 'PDF export', 'Auto-calculations', 'Customer database'],
            usage: 0,
            installs: 0,
            order: 8
          },
          {
            id: 'expense-calculator',
            name: 'Expense Calculator',
            description: 'Quick budget and expense tracking',
            category: 'wytapps',
            type: 'tool',
            status: 'disabled',
            pricing: 'free',
            icon: 'calculator',
            color: 'green',
            route: '/expense-calculator',
            features: ['Budget tracking', 'Expense categories', 'Monthly reports', 'Export to CSV'],
            usage: 0,
            installs: 0,
            order: 9
          },
          {
            id: 'business-card-designer',
            name: 'Business Card Designer',
            description: 'Simple digital business card creator',
            category: 'wytapps',
            type: 'tool',
            status: 'disabled',
            pricing: 'free',
            icon: 'id-card',
            color: 'blue',
            route: '/business-card-designer',
            features: ['Professional templates', 'QR code integration', 'Digital sharing', 'Print ready'],
            usage: 0,
            installs: 0,
            order: 10
          },
          {
            id: 'habit-tracker',
            name: 'Habit Tracker',
            description: 'Daily habit tracking for "Better Lifestyle" goals',
            category: 'wytapps',
            type: 'tool',
            status: 'disabled',
            pricing: 'free',
            icon: 'check-circle',
            color: 'teal',
            route: '/habit-tracker',
            features: ['Daily tracking', 'Progress streaks', 'Goal setting', 'Lifestyle insights'],
            usage: 0,
            installs: 0,
            order: 11
          },
          {
            id: 'unit-converter',
            name: 'Unit Converter',
            description: 'Length, weight, temperature conversions',
            category: 'wytapps',
            type: 'tool',
            status: 'disabled',
            pricing: 'free',
            icon: 'arrows-rotate',
            color: 'orange',
            route: '/unit-converter',
            features: ['Multiple units', 'Instant conversion', 'History tracking', 'Favorites'],
            usage: 0,
            installs: 0,
            order: 12
          },
          {
            id: 'quote-generator',
            name: 'Quote Generator',
            description: 'Motivational quotes for workstyle improvement',
            category: 'wytapps',
            type: 'tool',
            status: 'disabled',
            pricing: 'free',
            icon: 'quote-right',
            color: 'pink',
            route: '/quote-generator',
            features: ['Daily inspiration', 'Category filters', 'Share quotes', 'Workstyle focus'],
            usage: 0,
            installs: 0,
            order: 13
          },
          {
            id: 'astro-predictor',
            name: 'Multi Factor Astro Predictor',
            description: 'Comprehensive astrological predictions and insights',
            category: 'wytapps',
            type: 'tool',
            status: 'disabled',
            pricing: 'free',
            icon: 'star',
            color: 'yellow',
            route: '/astro-predictor',
            features: ['Birth chart analysis', 'Daily predictions', 'Compatibility checks', 'Career guidance'],
            usage: 0,
            installs: 0,
            order: 14
          },

          // WYTHUBS (Hub services with /h/ routes)  
          {
            id: 'ai-directory-hub',
            name: 'AI Directory Hub',
            description: 'AI Directory as a hub service with whitelabel domain support',
            category: 'wythubs',
            type: 'hub',
            status: 'disabled',
            pricing: 'free',
            icon: 'robot',
            color: 'green',
            route: '/h/ai-directory',
            features: ['Hub-based AI tools', 'Cross-tenant data', 'Whitelabel domains', 'Directory aggregation'],
            usage: 3200,
            installs: 15600,
            order: 101
          },

          // PLATFORM MODULES (System components)
          {
            id: 'auth-module',
            name: 'Authentication Module',
            description: 'Multi-tenant authentication and user management system',
            category: 'platform',
            type: 'system',
            status: 'disabled',
            pricing: 'core',
            icon: 'shield',
            color: 'gray',
            route: '/admin/auth',
            features: ['WhatsApp OTP', 'Multi-tenant isolation', 'Role-based access', 'Session management'],
            usage: 0,
            installs: 1,
            order: 201
          },
          {
            id: 'cms-builder',
            name: 'CMS Builder',
            description: 'Content management system with drag-and-drop functionality',
            category: 'platform',
            type: 'builder',
            status: 'enabled',
            pricing: 'core',
            icon: 'layout',
            color: 'gray',
            route: '/admin/cms',
            features: ['Drag-and-drop editor', 'Block-based content', 'Multi-language support', 'Template system'],
            usage: 0,
            installs: 1,
            order: 202
          },
          {
            id: 'tenant-manager',
            name: 'Multi-Tenant Core',
            description: 'Core multi-tenancy management and isolation system',
            category: 'platform',
            type: 'core',
            status: 'enabled',
            pricing: 'core',
            icon: 'building',
            color: 'gray',
            route: '/admin/tenants',
            features: ['Tenant isolation', 'Row-level security', 'Resource allocation', 'Billing integration'],
            usage: 0,
            installs: 1,
            order: 203
          },
          {
            id: 'hub-aggregator',
            name: 'Hub Aggregation Engine',
            description: 'Cross-tenant data aggregation and hub management',
            category: 'platform',
            type: 'engine',
            status: 'enabled',
            pricing: 'core',
            icon: 'network',
            color: 'gray',
            route: '/admin/hubs',
            features: ['Cross-tenant queries', 'Data aggregation', 'Hub marketplace', 'API federation'],
            usage: 0,
            installs: 1,
            order: 204
          },
          {
            id: 'search-engine',
            name: 'Platform Search Engine',
            description: 'Unified search across all platform components and content',
            category: 'platform',
            type: 'service',
            status: 'enabled',
            pricing: 'core',
            icon: 'search',
            color: 'gray',
            route: '/admin/search',
            features: ['Full-text search', 'Multi-tenant indexing', 'Real-time updates', 'Faceted search'],
            usage: 0,
            installs: 1,
            order: 205
          },
          {
            id: 'analytics-engine',
            name: 'Analytics & Metrics Engine',
            description: 'Platform-wide analytics, usage tracking, and business intelligence',
            category: 'platform',
            type: 'analytics',
            status: 'enabled',
            pricing: 'core',
            icon: 'chart-bar',
            color: 'gray',
            route: '/admin/analytics',
            features: ['Usage tracking', 'Performance metrics', 'Business intelligence', 'Custom dashboards'],
            usage: 0,
            installs: 1,
            order: 206
          }
        ];

        await db.insert(platformModules).values(defaultModules);
        console.log(`✅ Initialized ${defaultModules.length} default platform modules`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize default modules:', error);
    }
  }

  // Initialize default modules on startup
  initializeDefaultModules();

  // Reset platform modules (for development)
  app.post('/api/platform-modules/reset', async (req, res) => {
    try {
      // Clear all platform modules
      await db.delete(platformModules);

      // Reinitialize default modules
      await initializeDefaultModules();

      res.json({ success: true, message: 'Platform modules reset and reinitialized' });
    } catch (error) {
      console.error('Error resetting platform modules:', error);
      res.status(500).json({ error: 'Failed to reset platform modules' });
    }
  });

  // Get all platform modules (public endpoint)
  app.get('/api/platform-modules', async (req, res) => {
    try {
      const modules = await db
        .select()
        .from(platformModules)
        .orderBy(platformModules.order, platformModules.name);

      res.json({
        success: true,
        modules
      });
    } catch (error) {
      console.error('Error fetching platform modules:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch platform modules'
      });
    }
  });

  // Get enabled platform modules only (public endpoint)
  app.get('/api/platform-modules/enabled', async (req, res) => {
    try {
      const modules = await db
        .select()
        .from(platformModules)
        .where(eq(platformModules.status, 'enabled'))
        .orderBy(platformModules.order, platformModules.name);

      res.json({
        success: true,
        modules
      });
    } catch (error) {
      console.error('Error fetching enabled platform modules:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch enabled platform modules'
      });
    }
  });

  // Update platform module status (Super Admin only)
  app.put('/api/platform-modules/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, ...updateData } = req.body;
      const user = req.user;

      // Check if user is super admin
      if (!user?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Only super admin can modify platform modules'
        });
      }

      // Validate status
      if (status && !['enabled', 'disabled', 'maintenance'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be: enabled, disabled, or maintenance'
        });
      }

      const updatedModule = await db
        .update(platformModules)
        .set({
          ...updateData,
          ...(status && { status }),
          updatedAt: new Date()
        })
        .where(eq(platformModules.id, id))
        .returning();

      if (updatedModule.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Platform module not found'
        });
      }

      res.json({
        success: true,
        module: updatedModule[0],
        message: `Platform module ${status ? 'status updated' : 'updated'} successfully`
      });
    } catch (error) {
      console.error('Error updating platform module:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update platform module'
      });
    }
  });

  // Create new platform module (Super Admin only)
  app.post('/api/platform-modules', adminAuthMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      // Check if user is super admin
      if (!user?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Only super admin can create platform modules'
        });
      }

      // Validate request body
      const validatedData = insertPlatformModuleSchema.parse({
        ...req.body,
        createdBy: user.id
      });

      const newModule = await db
        .insert(platformModules)
        .values(validatedData)
        .returning();

      res.status(201).json({
        success: true,
        module: newModule[0],
        message: 'Platform module created successfully'
      });
    } catch (error) {
      console.error('Error creating platform module:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid module data',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create platform module'
      });
    }
  });

  // Delete platform module (Super Admin only)
  app.delete('/api/platform-modules/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      // Check if user is super admin
      if (!user?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Only super admin can delete platform modules'
        });
      }

      const deletedModule = await db
        .delete(platformModules)
        .where(eq(platformModules.id, id))
        .returning();

      if (deletedModule.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Platform module not found'
        });
      }

      res.json({
        success: true,
        message: 'Platform module deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting platform module:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete platform module'
      });
    }
  });

  // =============================================================================
  // MODULE ACTIVATION & DEPENDENCY MANAGEMENT
  // =============================================================================

  // Activate module with dependency resolution
  app.post('/api/modules/activate', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { moduleId, context, contextId } = req.body;
      const user = req.user;

      if (!moduleId || !context) {
        return res.status(400).json({
          success: false,
          error: 'moduleId and context are required'
        });
      }

      if ((context === 'hub' || context === 'app' || context === 'game') && !contextId) {
        return res.status(400).json({
          success: false,
          error: `contextId is required for ${context} context`
        });
      }

      const { moduleDependencyService } = await import('./services/moduleDependencyService');
      const result = await moduleDependencyService.activateModuleWithDependencies(
        moduleId,
        context,
        contextId,
        user?.id
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Module activation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate module',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  });

  // Deactivate module
  app.post('/api/modules/deactivate', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { moduleId, context, contextId, force } = req.body;

      if (!moduleId || !context) {
        return res.status(400).json({
          success: false,
          error: 'moduleId and context are required'
        });
      }

      const { moduleDependencyService } = await import('./services/moduleDependencyService');
      const result = await moduleDependencyService.deactivateModule(
        moduleId,
        context,
        contextId,
        force
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Module deactivation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate module',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  });

  // Get module activation status
  app.get('/api/modules/:moduleId/status', async (req, res) => {
    try {
      const { moduleId } = req.params;

      const { moduleDependencyService } = await import('./services/moduleDependencyService');
      const status = await moduleDependencyService.getModuleActivationStatus(moduleId);

      if (!status) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      res.json({
        success: true,
        ...status
      });
    } catch (error) {
      console.error('Error fetching module status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch module status'
      });
    }
  });

  // Get modules from catalog
  app.get('/api/modules/catalog', async (req, res) => {
    try {
      const { MODULE_CATALOG } = await import('./modules-catalog');
      const { category, context } = req.query;

      let modules = [...MODULE_CATALOG];

      // Filter by category
      if (category && typeof category === 'string') {
        modules = modules.filter(m => m.category === category);
      }

      // Filter by context
      if (context && typeof context === 'string') {
        modules = modules.filter(m => m.contexts.includes(context as any));
      }

      res.json({
        success: true,
        modules,
        total: modules.length
      });
    } catch (error) {
      console.error('Error fetching module catalog:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch module catalog'
      });
    }
  });

  // Get enabled modules for a specific context
  app.get('/api/modules/enabled/:context', async (req, res) => {
    try {
      const { context } = req.params;
      const { contextId } = req.query;

      if ((context === 'hub' || context === 'app' || context === 'game') && !contextId) {
        return res.status(400).json({
          success: false,
          error: `contextId is required for ${context} context`
        });
      }

      let activations: any[] = [];

      if (context === 'platform') {
        activations = await db.select()
          .from(platformModuleActivations)
          .where(and(
            eq(platformModuleActivations.context, context),
            eq(platformModuleActivations.isActive, true)
          ));
      } else if (context === 'hub' && contextId) {
        activations = await db.select()
          .from(hubModuleActivations)
          .where(and(
            eq(hubModuleActivations.hubId, contextId as string),
            eq(hubModuleActivations.isActive, true)
          ));
      } else if (context === 'app' && contextId) {
        activations = await db.select()
          .from(appModuleActivations)
          .where(and(
            eq(appModuleActivations.appId, contextId as string),
            eq(appModuleActivations.isActive, true)
          ));
      }

      res.json({
        success: true,
        activations,
        moduleIds: activations.map(a => a.moduleId)
      });
    } catch (error) {
      console.error('Error fetching enabled modules:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch enabled modules'
      });
    }
  });

  // =============================================================================
  // MODULE & APP UPDATE WITH EDIT HISTORY
  // =============================================================================

  // Update module with edit history tracking
  app.patch('/api/modules/:moduleId/update', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { moduleId } = req.params;
      const user = req.user;
      const updates = req.body;

      if (!user?.id) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Get current module
      const [currentModule] = await db
        .select()
        .from(platformModules)
        .where(eq(platformModules.id, moduleId))
        .limit(1);

      if (!currentModule) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      // Track fields that can be updated with history
      const trackableFields = ['name', 'description', 'route', 'category', 'contexts', 'restrictedTo'];
      const historyRecords = [];

      // Compare old vs new values and track changes
      for (const field of trackableFields) {
        if (updates[field] !== undefined) {
          const oldValue = currentModule[field as keyof typeof currentModule];
          const newValue = updates[field];

          // Convert to string for comparison
          const oldValueStr = typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue || '');
          const newValueStr = typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue || '');

          if (oldValueStr !== newValueStr) {
            historyRecords.push({
              moduleId,
              field,
              oldValue: oldValueStr,
              newValue: newValueStr,
              editedBy: user.id
            });
          }
        }
      }

      // Update the module
      const [updatedModule] = await db
        .update(platformModules)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(platformModules.id, moduleId))
        .returning();

      // Insert history records
      if (historyRecords.length > 0) {
        await db.insert(moduleEditHistory).values(historyRecords);
      }

      res.json({
        success: true,
        message: 'Module updated successfully',
        module: updatedModule,
        changesTracked: historyRecords.length
      });
    } catch (error) {
      console.error('Error updating module:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update module'
      });
    }
  });

  // Update app with edit history tracking
  app.patch('/api/apps/:appId/update', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { appId } = req.params;
      const user = req.user;
      const updates = req.body;

      if (!user?.id) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Get current app
      const [currentApp] = await db
        .select()
        .from(apps)
        .where(eq(apps.id, appId))
        .limit(1);

      if (!currentApp) {
        return res.status(404).json({
          success: false,
          error: 'App not found'
        });
      }

      // Track fields that can be updated with history
      const trackableFields = ['name', 'description', 'route', 'categories', 'contexts', 'restrictedTo', 'changelog'];
      const historyRecords = [];

      // Compare old vs new values and track changes
      for (const field of trackableFields) {
        if (updates[field] !== undefined) {
          const oldValue = currentApp[field as keyof typeof currentApp];
          const newValue = updates[field];

          // Convert to string for comparison
          const oldValueStr = typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue || '');
          const newValueStr = typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue || '');

          if (oldValueStr !== newValueStr) {
            historyRecords.push({
              appId,
              field,
              oldValue: oldValueStr,
              newValue: newValueStr,
              editedBy: user.id
            });
          }
        }
      }

      // Update the app
      const [updatedApp] = await db
        .update(apps)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(apps.id, appId))
        .returning();

      // Insert history records
      if (historyRecords.length > 0) {
        await db.insert(appEditHistory).values(historyRecords);
      }

      res.json({
        success: true,
        message: 'App updated successfully',
        app: updatedApp,
        changesTracked: historyRecords.length
      });
    } catch (error) {
      console.error('Error updating app:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update app'
      });
    }
  });

  // Get edit history for a module
  app.get('/api/modules/:moduleId/history', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { moduleId } = req.params;

      // Verify module exists
      const [module] = await db
        .select()
        .from(platformModules)
        .where(eq(platformModules.id, moduleId))
        .limit(1);

      if (!module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      // Get edit history with user information
      const history = await db
        .select({
          id: moduleEditHistory.id,
          field: moduleEditHistory.field,
          oldValue: moduleEditHistory.oldValue,
          newValue: moduleEditHistory.newValue,
          editedAt: moduleEditHistory.editedAt,
          editedBy: moduleEditHistory.editedBy,
          userName: users.name,
          userEmail: users.email
        })
        .from(moduleEditHistory)
        .leftJoin(users, eq(moduleEditHistory.editedBy, users.id))
        .where(eq(moduleEditHistory.moduleId, moduleId))
        .orderBy(desc(moduleEditHistory.editedAt));

      res.json({
        success: true,
        history,
        total: history.length
      });
    } catch (error) {
      console.error('Error fetching module history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch module history'
      });
    }
  });

  // Get edit history for an app
  app.get('/api/apps/:appId/history', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { appId } = req.params;

      // Verify app exists
      const [app] = await db
        .select()
        .from(apps)
        .where(eq(apps.id, appId))
        .limit(1);

      if (!app) {
        return res.status(404).json({
          success: false,
          error: 'App not found'
        });
      }

      // Get edit history with user information
      const history = await db
        .select({
          id: appEditHistory.id,
          field: appEditHistory.field,
          oldValue: appEditHistory.oldValue,
          newValue: appEditHistory.newValue,
          editedAt: appEditHistory.editedAt,
          editedBy: appEditHistory.editedBy,
          userName: users.name,
          userEmail: users.email
        })
        .from(appEditHistory)
        .leftJoin(users, eq(appEditHistory.editedBy, users.id))
        .where(eq(appEditHistory.appId, appId))
        .orderBy(desc(appEditHistory.editedAt));

      res.json({
        success: true,
        history,
        total: history.length
      });
    } catch (error) {
      console.error('Error fetching app history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch app history'
      });
    }
  });

  // =============================================================================
  // AI-ASSISTED MODULE & APP MANAGEMENT
  // =============================================================================

  // AI Chat for Module Improvement
  app.post('/api/admin/modules/:moduleId/ai-chat', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { moduleId } = req.params;
      const { message, conversationHistory } = req.body;
      const user = req.user;

      if (!user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!aiService.isReady()) {
        return res.status(503).json({ 
          error: 'AI service is not available. Please check OpenAI API configuration.' 
        });
      }

      // Get module details for context
      const [module] = await db
        .select()
        .from(platformModules)
        .where(eq(platformModules.id, moduleId))
        .limit(1);

      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }

      // Build context for AI
      const moduleContext = `
Current Module Details:
- Name: ${module.name}
- Description: ${module.description || 'No description'}
- Category: ${module.category}
- Version: ${module.version}
- Route: ${module.route || 'Not set'}
- Contexts: ${module.contexts?.join(', ') || 'None'}
- Dependencies: ${module.dependencies?.join(', ') || 'None'}
- Changelog: ${module.changelog || 'No changelog'}

You are an AI assistant helping to improve this module. Provide specific, actionable suggestions.
When suggesting improvements, format your response with suggestions in a structured way.
`;

      // Build conversation messages
      const messages = [
        { role: 'system' as const, content: moduleContext },
        ...(conversationHistory || []).slice(-5).map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user' as const, content: message }
      ];

      // Get AI response
      const aiResponse = await aiService.chat(messages, {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1500
      });

      const responseText = aiResponse.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

      // Try to extract structured suggestions if present
      let suggestions = null;
      const jsonMatch = responseText.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          suggestions = JSON.parse(jsonMatch[0]);
        } catch (e) {
          // Ignore parsing errors
        }
      }

      res.json({
        success: true,
        response: responseText,
        suggestions
      });
    } catch (error) {
      console.error('Error in module AI chat:', error);
      res.status(500).json({ error: 'Failed to process AI request' });
    }
  });

  // AI Chat for App Improvement
  app.post('/api/admin/apps/:appId/ai-chat', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { appId } = req.params;
      const { message, conversationHistory } = req.body;
      const user = req.user;

      if (!user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!aiService.isReady()) {
        return res.status(503).json({ 
          error: 'AI service is not available. Please check OpenAI API configuration.' 
        });
      }

      // Get app details for context
      const [app] = await db
        .select()
        .from(apps)
        .where(eq(apps.id, appId))
        .limit(1);

      if (!app) {
        return res.status(404).json({ error: 'App not found' });
      }

      // Build context for AI
      const appContext = `
Current App Details:
- Name: ${app.name}
- Description: ${app.description || 'No description'}
- Category: ${app.category || 'Not set'}
- Version: ${app.version || '1.0.0'}
- Route: ${app.route || 'Not set'}
- Contexts: ${app.contexts?.join(', ') || 'None'}
- Module IDs: ${app.moduleIds?.join(', ') || 'None'}
- Changelog: ${app.changelog || 'No changelog'}

You are an AI assistant helping to improve this application. Provide specific, actionable suggestions.
When suggesting improvements, format your response with suggestions in a structured way.
`;

      // Build conversation messages
      const messages = [
        { role: 'system' as const, content: appContext },
        ...(conversationHistory || []).slice(-5).map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user' as const, content: message }
      ];

      // Get AI response
      const aiResponse = await aiService.chat(messages, {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1500
      });

      const responseText = aiResponse.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

      // Try to extract structured suggestions if present
      let suggestions = null;
      const jsonMatch = responseText.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          suggestions = JSON.parse(jsonMatch[0]);
        } catch (e) {
          // Ignore parsing errors
        }
      }

      res.json({
        success: true,
        response: responseText,
        suggestions
      });
    } catch (error) {
      console.error('Error in app AI chat:', error);
      res.status(500).json({ error: 'Failed to process AI request' });
    }
  });

  // =============================================================================
  // GEO-REGULATORY CONTROL - Multi-country Compliance & Data Sovereignty
  // =============================================================================

  // Import geo-regulatory tables and validation schemas
  const { 
    geoRegulatoryRules, 
    geoComplianceLogs,
    createGeoRegulatoryRuleSchema,
    updateGeoRegulatoryRuleSchema
  } = await import("@shared/schema");

  // Get all geo-regulatory rules (with optional filters + pagination)
  app.get('/api/geo-regulatory/rules', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { 
        countryCode, 
        hubId, 
        tenantId,
        appId,
        isActive,
        page = '1',
        limit = '50'
      } = req.query;

      // Pagination
      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10))); // Max 100 per page
      const offset = (pageNum - 1) * limitNum;

      // Build query with filters
      const conditions = [];
      if (countryCode) conditions.push(eq(geoRegulatoryRules.countryCode, countryCode as string));
      if (hubId) conditions.push(eq(geoRegulatoryRules.hubId, hubId as string));
      if (tenantId) conditions.push(eq(geoRegulatoryRules.tenantId, tenantId as string));
      if (appId) conditions.push(eq(geoRegulatoryRules.appId, appId as string));
      if (isActive !== undefined) conditions.push(eq(geoRegulatoryRules.isActive, isActive === 'true'));

      // Get total count for pagination
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(geoRegulatoryRules)
        .where(whereClause);

      const total = totalResult?.count || 0;

      // Get paginated rules
      let query = db.select().from(geoRegulatoryRules);
      if (whereClause) {
        query = query.where(whereClause);
      }

      const rules = await query
        .orderBy(desc(geoRegulatoryRules.createdAt))
        .limit(limitNum)
        .offset(offset);

      res.json({
        success: true,
        rules,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Error fetching geo-regulatory rules:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch geo-regulatory rules'
      });
    }
  });

  // Create new geo-regulatory rule (with Zod validation)
  app.post('/api/geo-regulatory/rules', adminAuthMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Validate request body with Zod schema
      const validationResult = createGeoRegulatoryRuleSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues
        });
      }

      const validatedData = validationResult.data;

      // Insert with validated data only - prevents privilege escalation
      const [newRule] = await db.insert(geoRegulatoryRules).values({
        ...validatedData,
        effectiveDate: validatedData.effectiveDate ? new Date(validatedData.effectiveDate) : new Date(),
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
        createdBy: user.id,
        updatedBy: user.id
      }).returning();

      // Log compliance event
      await db.insert(geoComplianceLogs).values({
        ruleId: newRule.id,
        eventType: 'rule_created' as any,
        severity: 'info',
        countryCode: newRule.countryCode,
        stateCode: newRule.stateCode,
        tenantId: newRule.tenantId,
        hubId: newRule.hubId,
        appId: newRule.appId,
        userId: user.id,
        action: 'create_regulatory_rule',
        result: 'success',
        metadata: { ruleName: newRule.regionName }
      });

      res.json({
        success: true,
        rule: newRule
      });
    } catch (error) {
      console.error('Error creating geo-regulatory rule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create geo-regulatory rule'
      });
    }
  });

  // Update geo-regulatory rule (with Zod validation and field whitelisting)
  app.patch('/api/geo-regulatory/rules/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Validate request body with partial update schema
      const validationResult = updateGeoRegulatoryRuleSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues
        });
      }

      const validatedData = validationResult.data;

      // Convert date strings to Date objects if present
      const updateData: any = { ...validatedData };
      if (validatedData.effectiveDate) {
        updateData.effectiveDate = new Date(validatedData.effectiveDate);
      }
      if (validatedData.expiryDate) {
        updateData.expiryDate = new Date(validatedData.expiryDate);
      }

      // Update with validated data only - prevents privilege escalation
      const [updatedRule] = await db.update(geoRegulatoryRules)
        .set({
          ...updateData,
          updatedBy: user.id,
          updatedAt: new Date()
        })
        .where(eq(geoRegulatoryRules.id, id))
        .returning();

      if (!updatedRule) {
        return res.status(404).json({
          success: false,
          error: 'Rule not found'
        });
      }

      // Log compliance event
      await db.insert(geoComplianceLogs).values({
        ruleId: id,
        eventType: 'rule_updated' as any,
        severity: 'info',
        countryCode: updatedRule.countryCode,
        stateCode: updatedRule.stateCode,
        tenantId: updatedRule.tenantId,
        hubId: updatedRule.hubId,
        appId: updatedRule.appId,
        userId: user.id,
        action: 'update_regulatory_rule',
        result: 'success',
        metadata: { changes: Object.keys(validatedData) }
      });

      res.json({
        success: true,
        rule: updatedRule
      });
    } catch (error) {
      console.error('Error updating geo-regulatory rule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update geo-regulatory rule'
      });
    }
  });

  // Delete geo-regulatory rule (with enhanced audit logging)
  app.delete('/api/geo-regulatory/rules/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // First get the rule to capture full details for audit
      const [ruleToDelete] = await db.select().from(geoRegulatoryRules)
        .where(eq(geoRegulatoryRules.id, id));

      if (!ruleToDelete) {
        return res.status(404).json({
          success: false,
          error: 'Rule not found'
        });
      }

      // Delete the rule
      await db.delete(geoRegulatoryRules)
        .where(eq(geoRegulatoryRules.id, id));

      // Log compliance event with full context
      await db.insert(geoComplianceLogs).values({
        ruleId: id,
        eventType: 'rule_deleted' as any,
        severity: 'warning',
        countryCode: ruleToDelete.countryCode,
        stateCode: ruleToDelete.stateCode,
        tenantId: ruleToDelete.tenantId,
        hubId: ruleToDelete.hubId,
        appId: ruleToDelete.appId,
        userId: user.id,
        action: 'delete_regulatory_rule',
        result: 'success',
        metadata: { 
          ruleName: ruleToDelete.regionName,
          complianceTemplate: ruleToDelete.complianceTemplate,
          deletedAt: new Date().toISOString()
        }
      });

      res.json({
        success: true,
        message: 'Rule deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting geo-regulatory rule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete geo-regulatory rule'
      });
    }
  });

  // Get compliance logs (with filters and pagination)
  app.get('/api/geo-regulatory/compliance-logs', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { 
        countryCode, 
        eventType, 
        severity, 
        governmentAccess,
        tenantId,
        hubId,
        appId,
        page = '1',
        limit = '50'
      } = req.query;

      // Pagination
      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(500, Math.max(1, parseInt(limit as string, 10))); // Max 500 per page for logs
      const offset = (pageNum - 1) * limitNum;

      // Build query with filters
      const conditions = [];
      if (countryCode) conditions.push(eq(geoComplianceLogs.countryCode, countryCode as string));
      if (eventType) conditions.push(eq(geoComplianceLogs.eventType, eventType as string));
      if (severity) conditions.push(eq(geoComplianceLogs.severity, severity as string));
      if (governmentAccess !== undefined) conditions.push(eq(geoComplianceLogs.governmentAccess, governmentAccess === 'true'));
      if (tenantId) conditions.push(eq(geoComplianceLogs.tenantId, tenantId as string));
      if (hubId) conditions.push(eq(geoComplianceLogs.hubId, hubId as string));
      if (appId) conditions.push(eq(geoComplianceLogs.appId, appId as string));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count for pagination
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(geoComplianceLogs)
        .where(whereClause);

      const total = totalResult?.count || 0;

      // Get paginated logs
      let query = db.select().from(geoComplianceLogs);
      if (whereClause) {
        query = query.where(whereClause);
      }

      const logs = await query
        .orderBy(desc(geoComplianceLogs.timestamp))
        .limit(limitNum)
        .offset(offset);

      res.json({
        success: true,
        logs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Error fetching compliance logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch compliance logs'
      });
    }
  });

  // Get compliance templates (GDPR, CCPA, PDPA, etc.)
  app.get('/api/geo-regulatory/templates', adminAuthMiddleware, async (req: any, res) => {
    try {
      const templates = {
        'GDPR': {
          name: 'General Data Protection Regulation (EU)',
          description: 'European Union data protection and privacy regulation',
          applicableRegions: ['EU', 'GB'],
          requirements: {
            dataResidency: true,
            dataExportAllowed: false,
            minimumAge: 16,
            retentionDays: 730,
            governmentAccessLevel: 'analytics_only'
          },
          recommendations: {
            restrictedModules: [],
            contentFilters: {},
            enforcementLevel: 'block'
          }
        },
        'CCPA': {
          name: 'California Consumer Privacy Act (US)',
          description: 'California state privacy law',
          applicableRegions: ['US-CA'],
          requirements: {
            dataResidency: false,
            dataExportAllowed: true,
            minimumAge: 13,
            retentionDays: null,
            governmentAccessLevel: 'read_only'
          },
          recommendations: {
            restrictedModules: [],
            contentFilters: {},
            enforcementLevel: 'warn'
          }
        },
        'PDPA': {
          name: 'Personal Data Protection Act (Singapore)',
          description: 'Singapore data protection regulation',
          applicableRegions: ['SG'],
          requirements: {
            dataResidency: true,
            dataExportAllowed: false,
            minimumAge: 18,
            retentionDays: 365,
            governmentAccessLevel: 'analytics_only'
          },
          recommendations: {
            restrictedModules: [],
            contentFilters: {},
            enforcementLevel: 'block'
          }
        },
        'IT_ACT_2000': {
          name: 'Information Technology Act 2000 (India)',
          description: 'Indian cybersecurity and data protection law',
          applicableRegions: ['IN'],
          requirements: {
            dataResidency: true,
            dataExportAllowed: false,
            minimumAge: 18,
            retentionDays: 180,
            governmentAccessLevel: 'read_only'
          },
          recommendations: {
            restrictedModules: [],
            contentFilters: {},
            enforcementLevel: 'warn'
          }
        }
      };

      res.json({
        success: true,
        templates
      });
    } catch (error) {
      console.error('Error fetching compliance templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch compliance templates'
      });
    }
  });

  // =============================================================================
  // WYTENTITIES - Knowledge Graph & Entity Management APIs
  // =============================================================================

  const { 
    entityTypes, 
    entities, 
    entityRelationships, 
    entityTags,
    createEntityTypeSchema,
    updateEntityTypeSchema,
    createEntitySchema,
    updateEntitySchema,
    createEntityRelationshipSchema,
    updateEntityRelationshipSchema,
    createEntityTagSchema
  } = await import("@shared/schema");

  const { ENTITY_TYPES_CATALOG } = await import("./entity-types-catalog");

  // Entity Types - CRUD APIs

  // GET all entity types
  app.get('/api/entities/types', adminAuthMiddleware, async (req: any, res) => {
    try {
      const types = await db.select().from(entityTypes)
        .orderBy(entityTypes.displayOrder, entityTypes.name);

      res.json({ success: true, types });
    } catch (error) {
      console.error('Error fetching entity types:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch entity types' });
    }
  });

  // GET single entity type
  app.get('/api/entities/types/:typeId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { typeId } = req.params;
      const [type] = await db.select().from(entityTypes).where(eq(entityTypes.id, typeId));

      if (!type) {
        return res.status(404).json({ success: false, error: 'Entity type not found' });
      }

      res.json({ success: true, type });
    } catch (error) {
      console.error('Error fetching entity type:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch entity type' });
    }
  });

  // POST create entity type
  app.post('/api/entities/types', adminAuthMiddleware, async (req: any, res) => {
    try {
      const validatedData = createEntityTypeSchema.parse(req.body);

      const [newType] = await db.insert(entityTypes)
        .values(validatedData)
        .returning();

      res.status(201).json({ success: true, type: newType });
    } catch (error: any) {
      console.error('Error creating entity type:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ success: false, error: 'Failed to create entity type' });
    }
  });

  // PATCH update entity type
  app.patch('/api/entities/types/:typeId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { typeId } = req.params;
      const validatedData = updateEntityTypeSchema.parse(req.body);

      const [updatedType] = await db.update(entityTypes)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(entityTypes.id, typeId))
        .returning();

      if (!updatedType) {
        return res.status(404).json({ success: false, error: 'Entity type not found' });
      }

      res.json({ success: true, type: updatedType });
    } catch (error: any) {
      console.error('Error updating entity type:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ success: false, error: 'Failed to update entity type' });
    }
  });

  // DELETE entity type (only if not system)
  app.delete('/api/entities/types/:typeId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { typeId } = req.params;

      // Check if system type
      const [type] = await db.select().from(entityTypes).where(eq(entityTypes.id, typeId));
      if (type?.isSystem) {
        return res.status(403).json({ success: false, error: 'Cannot delete system entity types' });
      }

      await db.delete(entityTypes).where(eq(entityTypes.id, typeId));
      res.json({ success: true, message: 'Entity type deleted' });
    } catch (error) {
      console.error('Error deleting entity type:', error);
      res.status(500).json({ success: false, error: 'Failed to delete entity type' });
    }
  });

  // Entities - CRUD APIs

  // GET all entities (with filters and pagination)
  app.get('/api/entities', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { 
        typeId, 
        search, 
        isPublic, 
        isVerified, 
        tenantId, 
        hubId,
        page = '1', 
        limit = '50' 
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 100);
      const offset = (pageNum - 1) * limitNum;

      // Build filter conditions array
      const conditions: any[] = [];

      if (typeId) conditions.push(eq(entities.entityTypeId, typeId));
      if (search) conditions.push(like(entities.title, `%${search}%`));
      if (isPublic !== undefined) conditions.push(eq(entities.isPublic, isPublic === 'true'));
      if (isVerified !== undefined) conditions.push(eq(entities.isVerified, isVerified === 'true'));
      if (tenantId) conditions.push(eq(entities.tenantId, tenantId));
      if (hubId) conditions.push(eq(entities.hubId, hubId));

      let query = db.select().from(entities).$dynamic();
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const results = await query
        .orderBy(desc(entities.tagCount), desc(entities.createdAt))
        .limit(limitNum)
        .offset(offset);

      // Get filtered count
      let countQuery = db.select({ count: sql<number>`count(*)::int` }).from(entities).$dynamic();
      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }
      const [{ count }] = await countQuery;

      res.json({
        success: true,
        entities: results,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          totalPages: Math.ceil(count / limitNum)
        }
      });
    } catch (error) {
      console.error('Error fetching entities:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch entities' });
    }
  });

  // GET single entity (with relationships)
  app.get('/api/entities/:entityId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { entityId } = req.params;
      const { includeRelationships = 'true' } = req.query;

      const [entity] = await db.select().from(entities).where(eq(entities.id, entityId));

      if (!entity) {
        return res.status(404).json({ success: false, error: 'Entity not found' });
      }

      let relationships = null;
      if (includeRelationships === 'true') {
        const parents = await db.select().from(entityRelationships)
          .where(and(
            eq(entityRelationships.sourceEntityId, entityId),
            eq(entityRelationships.relationshipType, 'parent')
          ));

        const children = await db.select().from(entityRelationships)
          .where(and(
            eq(entityRelationships.sourceEntityId, entityId),
            eq(entityRelationships.relationshipType, 'child')
          ));

        const friends = await db.select().from(entityRelationships)
          .where(and(
            eq(entityRelationships.sourceEntityId, entityId),
            eq(entityRelationships.relationshipType, 'friend')
          ));

        relationships = { parents, children, friends };
      }

      res.json({ success: true, entity, relationships });
    } catch (error) {
      console.error('Error fetching entity:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch entity' });
    }
  });

  // POST create entity
  app.post('/api/entities', adminAuthMiddleware, async (req: any, res) => {
    try {
      const admin = req.admin;
      const validatedData = createEntitySchema.parse(req.body);

      const [newEntity] = await db.insert(entities)
        .values({
          ...validatedData,
          createdBy: admin.id,
          updatedBy: admin.id
        })
        .returning();

      res.status(201).json({ success: true, entity: newEntity });
    } catch (error: any) {
      console.error('Error creating entity:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ success: false, error: 'Failed to create entity' });
    }
  });

  // PATCH update entity
  app.patch('/api/entities/:entityId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { entityId } = req.params;
      const admin = req.admin;
      const validatedData = updateEntitySchema.parse(req.body);

      const [updatedEntity] = await db.update(entities)
        .set({
          ...validatedData,
          updatedBy: admin.id,
          updatedAt: new Date()
        })
        .where(eq(entities.id, entityId))
        .returning();

      if (!updatedEntity) {
        return res.status(404).json({ success: false, error: 'Entity not found' });
      }

      res.json({ success: true, entity: updatedEntity });
    } catch (error: any) {
      console.error('Error updating entity:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ success: false, error: 'Failed to update entity' });
    }
  });

  // DELETE entity
  app.delete('/api/entities/:entityId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { entityId } = req.params;

      await db.delete(entities).where(eq(entities.id, entityId));
      res.json({ success: true, message: 'Entity deleted' });
    } catch (error) {
      console.error('Error deleting entity:', error);
      res.status(500).json({ success: false, error: 'Failed to delete entity' });
    }
  });

  // Entity Relationships - APIs

  // GET relationships for an entity
  app.get('/api/entities/:entityId/relationships', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { entityId } = req.params;
      const { type } = req.query; // parent, child, friend

      let query = db.select().from(entityRelationships)
        .where(eq(entityRelationships.sourceEntityId, entityId)).$dynamic();

      if (type) {
        query = query.where(eq(entityRelationships.relationshipType, type));
      }

      const relationships = await query;
      res.json({ success: true, relationships });
    } catch (error) {
      console.error('Error fetching relationships:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch relationships' });
    }
  });

  // POST create relationship
  app.post('/api/entities/relationships', adminAuthMiddleware, async (req: any, res) => {
    try {
      const admin = req.admin;
      const validatedData = createEntityRelationshipSchema.parse(req.body);

      // Check for circular references
      if (validatedData.sourceEntityId === validatedData.targetEntityId) {
        return res.status(400).json({ success: false, error: 'Cannot create self-referential relationship' });
      }

      const [newRelationship] = await db.insert(entityRelationships)
        .values({
          ...validatedData,
          createdBy: admin.id
        })
        .returning();

      res.status(201).json({ success: true, relationship: newRelationship });
    } catch (error: any) {
      console.error('Error creating relationship:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ success: false, error: 'Failed to create relationship' });
    }
  });

  // DELETE relationship
  app.delete('/api/entities/relationships/:relationshipId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { relationshipId } = req.params;

      await db.delete(entityRelationships).where(eq(entityRelationships.id, relationshipId));
      res.json({ success: true, message: 'Relationship deleted' });
    } catch (error) {
      console.error('Error deleting relationship:', error);
      res.status(500).json({ success: false, error: 'Failed to delete relationship' });
    }
  });

  // Entity Tags - APIs

  // GET tags for an entity
  app.get('/api/entities/:entityId/tags', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { entityId } = req.params;

      const tags = await db.select().from(entityTags)
        .where(eq(entityTags.entityId, entityId))
        .orderBy(desc(entityTags.taggedAt));

      res.json({ success: true, tags });
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch tags' });
    }
  });

  // POST create entity tag
  app.post('/api/entities/tags', adminAuthMiddleware, async (req: any, res) => {
    try {
      const admin = req.admin;
      const validatedData = createEntityTagSchema.parse(req.body);

      const [newTag] = await db.insert(entityTags)
        .values({
          ...validatedData,
          taggedBy: admin.id
        })
        .returning();

      // Increment tag count on entity
      await db.update(entities)
        .set({ tagCount: sql`${entities.tagCount} + 1` })
        .where(eq(entities.id, validatedData.entityId));

      res.status(201).json({ success: true, tag: newTag });
    } catch (error: any) {
      console.error('Error creating tag:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ success: false, error: 'Failed to create tag' });
    }
  });

  // DELETE entity tag
  app.delete('/api/entities/tags/:tagId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { tagId } = req.params;

      const [tag] = await db.select().from(entityTags).where(eq(entityTags.id, tagId));

      if (tag) {
        await db.delete(entityTags).where(eq(entityTags.id, tagId));

        // Decrement tag count
        await db.update(entities)
          .set({ tagCount: sql`GREATEST(${entities.tagCount} - 1, 0)` })
          .where(eq(entities.id, tag.entityId));
      }

      res.json({ success: true, message: 'Tag deleted' });
    } catch (error) {
      console.error('Error deleting tag:', error);
      res.status(500).json({ success: false, error: 'Failed to delete tag' });
    }
  });

  // Entity Search & Discovery

  // GET search entities
  app.get('/api/entities/search', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { q, typeId, limit = '20' } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ success: false, error: 'Search query required' });
      }

      const limitNum = Math.min(parseInt(limit as string), 50);
      const searchTerm = `%${q}%`;

      let query = db.select().from(entities)
        .where(
          or(
            like(entities.title, searchTerm),
            like(entities.shortDescription, searchTerm),
            sql`${entities.aliases}::text LIKE ${searchTerm}`
          )
        ).$dynamic();

      if (typeId) {
        query = query.where(eq(entities.entityTypeId, typeId as string));
      }

      const results = await query
        .orderBy(desc(entities.isVerified), desc(entities.tagCount))
        .limit(limitNum);

      // Get filtered count
      let countQuery = db.select({ count: sql<number>`count(*)::int` }).from(entities).$dynamic();
      if (typeId) {
         countQuery = countQuery.where(eq(entities.entityTypeId, typeId as string));
      }
      const [{ count }] = await countQuery;

      res.json({ success: true, entities: results });
    } catch (error) {
      console.error('Error searching entities:', error);
      res.status(500).json({ success: false, error: 'Failed to search entities' });
    }
  });

  // GET entity type catalog (for seeding reference)
  app.get('/api/entities/types/catalog', adminAuthMiddleware, async (req: any, res) => {
    try {
      res.json({ success: true, catalog: ENTITY_TYPES_CATALOG });
    } catch (error) {
      console.error('Error fetching entity types catalog:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch catalog' });
    }
  });

  // =============================================================================
  // MODULE PROXY ROUTES - White-label API Gateway
  // =============================================================================

  // WytMap (Mappls) Proxy Routes
  app.get('/api/modules/wytmap/geocode', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { moduleProxyService } = await import('./services/moduleProxyService');

      const result = await moduleProxyService.proxyRequest({
        moduleId: 'wytmap-mappls',
        endpoint: '/geocode',
        method: 'GET',
        query: req.query as Record<string, string>
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Geocoding failed'
      });
    }
  });

  app.get('/api/modules/wytmap/reverse-geocode', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { moduleProxyService } = await import('./services/moduleProxyService');

      const result = await moduleProxyService.proxyRequest({
        moduleId: 'wytmap-mappls',
        endpoint: '/rev_geocode',
        method: 'GET',
        query: req.query as Record<string, string>
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Reverse geocoding failed'
      });
    }
  });

  app.get('/api/modules/wytmap/directions', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { moduleProxyService } = await import('./services/moduleProxyService');

      const result = await moduleProxyService.proxyRequest({
        moduleId: 'wytmap-mappls',
        endpoint: '/route_adv/driving',
        method: 'GET',
        query: req.query as Record<string, string>
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Directions request failed'
      });
    }
  });

  app.get('/api/modules/wytmap/nearby', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { moduleProxyService } = await import('./services/moduleProxyService');

      const result = await moduleProxyService.proxyRequest({
        moduleId: 'wytmap-mappls',
        endpoint: '/nearby',
        method: 'GET',
        query: req.query as Record<string, string>
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Nearby search failed'
      });
    }
  });

  app.get('/api/modules/wytmap/distance', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { moduleProxyService } = await import('./services/moduleProxyService');

      const result = await moduleProxyService.proxyRequest({
        moduleId: 'wytmap-mappls',
        endpoint: '/distance_matrix/driving',
        method: 'GET',
        query: req.query as Record<string, string>
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Distance calculation failed'
      });
    }
  });

  // WytKYC (Digio) Proxy Routes
  app.post('/api/modules/wytkyc/esign/initiate', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { moduleProxyService } = await import('./services/moduleProxyService');

      const result = await moduleProxyService.proxyRequest({
        moduleId: 'wytkyc-digio',
        endpoint: '/client/document/upload',
        method: 'POST',
        body: req.body
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'eSign initiation failed'
      });
    }
  });

  app.get('/api/modules/wytkyc/esign/status/:requestId', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { moduleProxyService } = await import('./services/moduleProxyService');

      const result = await moduleProxyService.proxyRequest({
        moduleId: 'wytkyc-digio',
        endpoint: `/client/document/${req.params.requestId}`,
        method: 'GET'
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Status check failed'
      });
    }
  });

  app.post('/api/modules/wytkyc/verify/pan', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { moduleProxyService } = await import('./services/moduleProxyService');

      const result = await moduleProxyService.proxyRequest({
        moduleId: 'wytkyc-digio',
        endpoint: '/kyc/v2/fetch/pan',
        method: 'POST',
        body: req.body
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'PAN verification failed'
      });
    }
  });

  app.post('/api/modules/wytkyc/verify/aadhaar', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { moduleProxyService } = await import('./services/moduleProxyService');

      const result = await moduleProxyService.proxyRequest({
        moduleId: 'wytkyc-digio',
        endpoint: '/kyc/v2/request/with_digilocker',
        method: 'POST',
        body: req.body
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Aadhaar verification failed'
      });
    }
  });

  app.post('/api/modules/wytkyc/face-match', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { moduleProxyService } = await import('./services/moduleProxyService');

      const result = await moduleProxyService.proxyRequest({
        moduleId: 'wytkyc-digio',
        endpoint: '/kyc/v2/face_match',
        method: 'POST',
        body: req.body
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Face matching failed'
      });
    }
  });

  // =============================================================================
  // WYTGEO, WYTI18N, WYTBIZ API ROUTES - Split Dataset Modules
  // =============================================================================

  // Dataset module mapping
  const DATASET_MODULE_MAP: Record<string, string[]> = {
    'wytgeo': ['countries', 'india-states', 'india-cities', 'timezones'],
    'wyti18n': ['languages', 'currencies'],
    'wytbiz': ['industries', 'company-sizes', 'job-roles', 'gst-state-codes']
  };

  // Helper to get datasets by module
  const getDatasetsByModule = async (modulePrefix: string): Promise<any[]> => {
    const datasetKeys = DATASET_MODULE_MAP[modulePrefix] || [];
    const collections = await db.select()
      .from(datasetCollections)
      .where(sql`${datasetCollections.key} = ANY(${datasetKeys})`);
    return collections;
  };

  // WytGeo Routes - Geography & Location
  app.get('/api/modules/wytgeo/countries', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const collection = await db.select().from(datasetCollections).where(eq(datasetCollections.key, 'countries'));
      if (!collection[0]) return res.status(404).json({ success: false, error: 'Collection not found' });

      const items = await db.select().from(datasetItems).where(eq(datasetItems.collectionId, collection[0].id)).orderBy(asc(datasetItems.sortOrder));
      res.json({ success: true, collection: collection[0], items, total: items.length, _wytnet: { module: 'wytgeo' } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/modules/wytgeo/india-states', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const collection = await db.select().from(datasetCollections).where(eq(datasetCollections.key, 'india-states'));
      if (!collection[0]) return res.status(404).json({ success: false, error: 'Collection not found' });

      const items = await db.select().from(datasetItems).where(eq(datasetItems.collectionId, collection[0].id)).orderBy(asc(datasetItems.sortOrder));
      res.json({ success: true, collection: collection[0], items, total: items.length, _wytnet: { module: 'wytgeo' } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/modules/wytgeo/india-cities', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const collection = await db.select().from(datasetCollections).where(eq(datasetCollections.key, 'india-cities'));
      if (!collection[0]) return res.status(404).json({ success: false, error: 'Collection not found' });

      const items = await db.select().from(datasetItems).where(eq(datasetItems.collectionId, collection[0].id)).orderBy(asc(datasetItems.sortOrder));
      res.json({ success: true, collection: collection[0], items, total: items.length, _wytnet: { module: 'wytgeo' } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/modules/wytgeo/timezones', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const collection = await db.select().from(datasetCollections).where(eq(datasetCollections.key, 'timezones'));
      if (!collection[0]) return res.status(404).json({ success: false, error: 'Collection not found' });

      const items = await db.select().from(datasetItems).where(eq(datasetItems.collectionId, collection[0].id)).orderBy(asc(datasetItems.sortOrder));
      res.json({ success: true, collection: collection[0], items, total: items.length, _wytnet: { module: 'wytgeo' } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // WytI18n Routes - Internationalization
  app.get('/api/modules/wyti18n/languages', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const collection = await db.select().from(datasetCollections).where(eq(datasetCollections.key, 'languages'));
      if (!collection[0]) return res.status(404).json({ success: false, error: 'Collection not found' });

      const items = await db.select().from(datasetItems).where(eq(datasetItems.collectionId, collection[0].id)).orderBy(asc(datasetItems.sortOrder));
      res.json({ success: true, collection: collection[0], items, total: items.length, _wytnet: { module: 'wyti18n' } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/modules/wyti18n/currencies', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const collection = await db.select().from(datasetCollections).where(eq(datasetCollections.key, 'currencies'));
      if (!collection[0]) return res.status(404).json({ success: false, error: 'Collection not found' });

      const items = await db.select().from(datasetItems).where(eq(datasetItems.collectionId, collection[0].id)).orderBy(asc(datasetItems.sortOrder));
      res.json({ success: true, collection: collection[0], items, total: items.length, _wytnet: { module: 'wyti18n' } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // WytBiz Routes - Business Reference
  app.get('/api/modules/wytbiz/industries', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const collection = await db.select().from(datasetCollections).where(eq(datasetCollections.key, 'industries'));
      if (!collection[0]) return res.status(404).json({ success: false, error: 'Collection not found' });

      const items = await db.select().from(datasetItems).where(eq(datasetItems.collectionId, collection[0].id)).orderBy(asc(datasetItems.sortOrder));
      res.json({ success: true, collection: collection[0], items, total: items.length, _wytnet: { module: 'wytbiz' } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/modules/wytbiz/company-sizes', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const collection = await db.select().from(datasetCollections).where(eq(datasetCollections.key, 'company-sizes'));
      if (!collection[0]) return res.status(404).json({ success: false, error: 'Collection not found' });

      const items = await db.select().from(datasetItems).where(eq(datasetItems.collectionId, collection[0].id)).orderBy(asc(datasetItems.sortOrder));
      res.json({ success: true, collection: collection[0], items, total: items.length, _wytnet: { module: 'wytbiz' } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/modules/wytbiz/job-roles', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const collection = await db.select().from(datasetCollections).where(eq(datasetCollections.key, 'job-roles'));
      if (!collection[0]) return res.status(404).json({ success: false, error: 'Collection not found' });

      const items = await db.select().from(datasetItems).where(eq(datasetItems.collectionId, collection[0].id)).orderBy(asc(datasetItems.sortOrder));
      res.json({ success: true, collection: collection[0], items, total: items.length, _wytnet: { module: 'wytbiz' } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/modules/wytbiz/gst-state-codes', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const collection = await db.select().from(datasetCollections).where(eq(datasetCollections.key, 'gst-state-codes'));
      if (!collection[0]) return res.status(404).json({ success: false, error: 'Collection not found' });

      const items = await db.select().from(datasetItems).where(eq(datasetItems.collectionId, collection[0].id)).orderBy(asc(datasetItems.sortOrder));
      res.json({ success: true, collection: collection[0], items, total: items.length, _wytnet: { module: 'wytbiz' } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // =============================================================================
  // WYTDATA API ROUTES - Legacy/Backward Compatibility
  // =============================================================================

  // Get all available dataset collections
  app.get('/api/modules/wytdata/collections', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const collections = await db.select()
        .from(datasetCollections)
        .orderBy(datasetCollections.name);

      res.json({
        success: true,
        collections: collections.map(c => ({
          key: c.key,
          name: c.name,
          description: c.description,
          scope: c.scope,
          metadata: c.metadata
        })),
        total: collections.length,
        _wytnet: {
          module: 'wytdata-api',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch collections'
      });
    }
  });

  // Get dataset items by key (public access for specific datasets)
  app.get('/api/modules/wytdata/:key', async (req: any, res) => {
    try {
      const { key } = req.params;

      // List of public datasets that don't require authentication
      const publicDatasets = ['india-cities', 'countries', 'currencies', 'timezones', 'india-states'];

      // If dataset is not public and user is not authenticated, return 401
      if (!publicDatasets.includes(key) && !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const [collection] = await db.select()
        .from(datasetCollections)
        .where(eq(datasetCollections.key, key));

      if (!collection) {
        return res.status(404).json({
          success: false,
          error: `Dataset '${key}' not found`
        });
      }

      const items = await db.select()
        .from(datasetItems)
        .where(eq(datasetItems.collectionId, collection.id))
        .orderBy(asc(datasetItems.sortOrder), asc(datasetItems.label));

      res.json({
        success: true,
        collection: {
          key: collection.key,
          name: collection.name,
          description: collection.description
        },
        items: items.map(i => ({
          code: i.code,
          label: i.label,
          locale: i.locale,
          metadata: i.metadata
        })),
        total: items.length,
        _wytnet: {
          module: 'wytdata-api',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch dataset'
      });
    }
  });

  // Search within a dataset
  app.get('/api/modules/wytdata/:key/search', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { key } = req.params;
      const { q, locale } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Search query (q) is required'
        });
      }

      const [collection] = await db.select()
        .from(datasetCollections)
        .where(eq(datasetCollections.key, key));

      if (!collection) {
        return res.status(404).json({
          success: false,
          error: `Dataset '${key}' not found`
        });
      }

      let query = db.select()
        .from(datasetItems)
        .where(eq(datasetItems.collectionId, collection.id));

      // Filter by locale if provided
      if (locale && typeof locale === 'string') {
        query = query.where(eq(datasetItems.locale, locale as string));
      }

      const allItems = await query;

      // Client-side search filtering (case-insensitive)
      const searchTerm = q.toLowerCase();
      const filteredItems = allItems.filter(item => 
        item.label.toLowerCase().includes(searchTerm) ||
        item.code.toLowerCase().includes(searchTerm)
      );

      res.json({
        success: true,
        query: q,
        collection: {
          key: collection.key,
          name: collection.name
        },
        items: filteredItems.map(i => ({
          code: i.code,
          label: i.label,
          locale: i.locale,
          metadata: i.metadata
        })),
        total: filteredItems.length,
        _wytnet: {
          module: 'wytdata-api',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Search failed'
      });
    }
  });

  // Get localized dataset
  app.get('/api/modules/wytdata/:key/locale/:locale', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { key, locale } = req.params;

      const [collection] = await db.select()
        .from(datasetCollections)
        .where(eq(datasetCollections.key, key));

      if (!collection) {
        return res.status(404).json({
          success: false,
          error: `Dataset '${key}' not found`
        });
      }

      const items = await db.select()
        .from(datasetItems)
        .where(and(
          eq(datasetItems.collectionId, collection.id),
          eq(datasetItems.locale, locale)
        ))
        .orderBy(asc(datasetItems.sortOrder), asc(datasetItems.label));

      // Fallback to 'en' if no items found for requested locale
      let finalItems = items;
      if (items.length === 0 && locale !== 'en') {
        finalItems = await db.select()
          .from(datasetItems)
          .where(and(
            eq(datasetItems.collectionId, collection.id),
            eq(datasetItems.locale, 'en')
          ))
          .orderBy(asc(datasetItems.sortOrder), asc(datasetItems.label));
      }

      res.json({
        success: true,
        collection: {
          key: collection.key,
          name: collection.name,
          description: collection.description
        },
        locale,
        items: finalItems.map(i => ({
          code: i.code,
          label: i.label,
          locale: i.locale,
          metadata: i.metadata
        })),
        total: finalItems.length,
        fallback: items.length === 0 && locale !== 'en',
        _wytnet: {
          module: 'wytdata-api',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch localized dataset'
      });
    }
  });

  // Batch fetch multiple datasets
  app.post('/api/modules/wytdata/batch', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { keys } = req.body;

      if (!Array.isArray(keys) || keys.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'keys array is required'
        });
      }

      if (keys.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 10 datasets can be fetched in batch'
        });
      }

      const results: Record<string, any> = {};

      for (const key of keys) {
        const [collection] = await db.select()
          .from(datasetCollections)
          .where(eq(datasetCollections.key, key));

        if (collection) {
          const items = await db.select()
            .from(datasetItems)
            .where(eq(datasetItems.collectionId, collection.id))
            .orderBy(asc(datasetItems.sortOrder), asc(datasetItems.label));

          results[key] = {
            collection: {
              key: collection.key,
              name: collection.name,
              description: collection.description
            },
            items: items.map(i => ({
              code: i.code,
              label: i.label,
              locale: i.locale,
              metadata: i.metadata
            })),
            total: items.length
          };
        } else {
          results[key] = {
            error: `Dataset '${key}' not found`
          };
        }
      }

      res.json({
        success: true,
        datasets: results,
        totalRequested: keys.length,
        _wytnet: {
          module: 'wytdata-api',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Batch fetch failed'
      });
    }
  });

  // =============================================================================
  // USER APP INSTALLATIONS - WytApps Marketplace
  // =============================================================================

  // Get apps catalog for marketplace (public)
  app.get('/api/apps/catalog', async (req, res) => {
    try {
      const { category, pricing } = req.query;

      let query = db
        .select()
        .from(platformModules)
        .where(eq(platformModules.status, 'enabled'))
        .orderBy(platformModules.order, platformModules.name);

      const apps = await query;

      // Filter by category if provided
      let filteredApps = apps;
      if (category) {
        filteredApps = apps.filter((app: any) => app.category === category);
      }

      // Filter by pricing if provided
      if (pricing) {
        filteredApps = filteredApps.filter((app: any) => app.pricing === pricing);
      }

      res.json({
        success: true,
        apps: filteredApps,
        total: filteredApps.length
      });
    } catch (error) {
      console.error('Error fetching apps catalog:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch apps catalog'
      });
    }
  });

  // Get user's installed apps
  app.get('/api/apps/my-apps', async (req: any, res) => {
    try {
      // Check if user is authenticated (Passport or custom session)
      if (!req.user && !req.session?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get user ID from either Passport or custom session
      const userId = req.user?.id || req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const userApps = await db
        .select({
          installation: userAppInstallations,
          app: platformModules
        })
        .from(userAppInstallations)
        .innerJoin(platformModules, eq(userAppInstallations.appSlug, platformModules.id))
        .where(eq(userAppInstallations.userId, userId));

      res.json({
        success: true,
        apps: userApps,
        total: userApps.length
      });
    } catch (error) {
      console.error('Error fetching user apps:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user apps'
      });
    }
  });

  // Install an app for user
  app.post('/api/apps/install', async (req: any, res) => {
    try {
      // Check if user is authenticated (Passport or custom session)
      if (!req.user && !req.session?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get user ID from either Passport or custom session
      const userId = req.user?.id || req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { appSlug, subscriptionTier = 'free' } = req.body;

      if (!appSlug) {
        return res.status(400).json({
          success: false,
          error: 'App slug is required'
        });
      }

      // Check if app exists and is enabled
      const app = await db
        .select()
        .from(platformModules)
        .where(eq(platformModules.id, appSlug))
        .limit(1);

      if (app.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'App not found'
        });
      }

      if (app[0].status !== 'enabled') {
        return res.status(400).json({
          success: false,
          error: 'App is not available for installation'
        });
      }

      // Check if already installed
      const existing = await db
        .select()
        .from(userAppInstallations)
        .where(and(
          eq(userAppInstallations.userId, userId),
          eq(userAppInstallations.appSlug, appSlug)
        ))
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'App already installed'
        });
      }

      // Install the app
      const installation = await db
        .insert(userAppInstallations)
        .values({
          userId: userId,
          appSlug,
          subscriptionTier,
          status: 'active',
          installedAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Increment install count
      await db
        .update(platformModules)
        .set({ 
          installs: sql`${platformModules.installs} + 1`,
          updatedAt: new Date()
        })
        .where(eq(platformModules.id, appSlug));

      res.json({
        success: true,
        installation: installation[0],
        message: `${app[0].name} installed successfully`
      });
    } catch (error) {
      console.error('Error installing app:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to install app'
      });
    }
  });

  // Uninstall an app
  app.delete('/api/apps/uninstall/:appSlug', async (req: any, res) => {
    try {
      // Check if user is authenticated (Passport or custom session)
      if (!req.user && !req.session?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get user ID from either Passport or custom session
      const userId = req.user?.id || req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { appSlug } = req.params;

      // Check if app is installed
      const installation = await db
        .select()
        .from(userAppInstallations)
        .where(and(
          eq(userAppInstallations.userId, userId),
          eq(userAppInstallations.appSlug, appSlug)
        ))
        .limit(1);

      if (installation.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'App not installed'
        });
      }

      // Delete the installation
      await db
        .delete(userAppInstallations)
        .where(and(
          eq(userAppInstallations.userId, userId),
          eq(userAppInstallations.appSlug, appSlug)
        ));

      // Decrement install count
      await db
        .update(platformModules)
        .set({ 
          installs: sql`GREATEST(${platformModules.installs} - 1, 0)`,
          updatedAt: new Date()
        })
        .where(eq(platformModules.id, appSlug));

      res.json({
        success: true,
        message: 'App uninstalled successfully'
      });
    } catch (error) {
      console.error('Error uninstalling app:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to uninstall app'
      });
    }
  });

  // =============================================================================
  // SOCIAL AUTHENTICATION ROUTES
  // =============================================================================

  // Social auth providers info with mobile verification policy
  app.get('/api/auth/social/providers', (req, res) => {
    res.json({
      success: true,
      providers: socialAuthService.SOCIAL_PROVIDERS,
      securityPolicy: {
        requiresMobileVerification: true,
        mobileFirstPolicy: true,
        noSyntheticNumbers: true,
        otpVerificationRequired: true
      },
      message: 'All social authentication requires mobile number verification via OTP'
    });
  });

  // Complete social account setup after mobile verification
  app.post('/api/auth/social/complete-setup', async (req, res) => {
    try {
      const { pendingUserId, verifiedMobileNumber, otpToken } = req.body;

      if (!pendingUserId || !verifiedMobileNumber || !otpToken) {
        return res.status(400).json({
          success: false,
          error: 'Pending user ID, verified mobile number and OTP token are required'
        });
      }

      // Verify OTP first using WhatsApp auth service
      const otpVerification = await whatsappAuthService.verifyOTP(verifiedMobileNumber, otpToken);
      if (!otpVerification.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid OTP. Please verify your mobile number first.'
        });
      }

      // Complete social account setup with verified mobile
      const user = await socialAuthService.completeSocialAccountSetup(pendingUserId, verifiedMobileNumber);

      // Create session for the user
      (req as any).session.userId = user.id;
      (req as any).session.isAuthenticated = true;

      res.json({
        success: true,
        message: 'Social account setup completed successfully',
        user: {
          id: user.id,
          name: user.name,
          whatsappNumber: user.whatsappNumber,
          email: user.email,
          isVerified: user.isVerified,
          authMethods: user.authMethods,
          socialProviders: user.socialProviders
        }
      });
    } catch (error) {
      console.error('Error completing social account setup:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to complete social account setup'
      });
    }
  });

  // Check pending social verification status
  app.get('/api/auth/social/pending/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      const pendingStatus = await socialAuthService.getPendingSocialVerification(userId);

      res.json({
        success: true,
        ...pendingStatus
      });
    } catch (error) {
      console.error('Error checking pending social verification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check pending verification status'
      });
    }
  });

  // OAuth initiation endpoints - redirect to provider with mobile verification flow
  app.get('/api/auth/google', (req, res) => {
    // For demo: simulate OAuth initiation that requires mobile verification
    const state = Buffer.from(JSON.stringify({
      provider: 'google',
      timestamp: Date.now(),
      requiresMobileVerification: true
    })).toString('base64');

    res.json({
      success: true,
      provider: 'google',
      message: 'Google OAuth - Mobile verification required',
      redirectUrl: `https://accounts.google.com/oauth/authorize?client_id=demo&redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URI || '/api/auth/callback/google')}&state=${state}&scope=openid%20profile%20email`,
      requiresMobileVerification: true,
      demoMode: true
    });
  });

  app.get('/api/auth/facebook', (req, res) => {
    const state = Buffer.from(JSON.stringify({
      provider: 'facebook',
      timestamp: Date.now(),
      requiresMobileVerification: true
    })).toString('base64');

    res.json({
      success: true,
      provider: 'facebook',
      message: 'Facebook OAuth - Mobile verification required',
      redirectUrl: `https://www.facebook.com/v18.0/dialog/oauth?client_id=demo&redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URI || '/api/auth/callback/facebook')}&state=${state}&scope=public_profile,email`,
      requiresMobileVerification: true,
      demoMode: true
    });
  });

  // LinkedIn OAuth route now handled by WytPass Auth (server/wytpass-auth.ts)
  // app.get('/api/auth/linkedin', ...) - REMOVED to avoid conflict with passport route

  app.get('/api/auth/instagram', (req, res) => {
    const state = Buffer.from(JSON.stringify({
      provider: 'instagram',
      timestamp: Date.now(),
      requiresMobileVerification: true
    })).toString('base64');

    res.json({
      success: true,
      provider: 'instagram',
      message: 'Instagram OAuth - Mobile verification required',
      redirectUrl: `https://api.instagram.com/oauth/authorize?client_id=demo&redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URI || '/api/auth/callback/instagram')}&state=${state}&scope=user_profile,user_media`,
      requiresMobileVerification: true,
      demoMode: true
    });
  });

  // OAuth callback endpoints - handle provider response and initiate mobile verification
  app.get('/api/auth/callback/:provider', async (req, res) => {
    try {
      const { provider } = req.params;
      const { code, state } = req.query;

      if (!code || !state) {
        return res.redirect('/auth/error?message=Missing authorization code or state');
      }

      // Decode state to verify request
      let stateData;
      try {
        stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
      } catch {
        return res.redirect('/auth/error?message=Invalid state parameter');
      }

      if (stateData.provider !== provider) {
        return res.redirect('/auth/error?message=Provider mismatch');
      }

      // For demo: simulate OAuth profile retrieval
      const mockProfile: socialAuthService.SocialProfile = {
        id: `demo_${provider}_${Date.now()}`,
        email: `demo.user@${provider}.example.com`,
        name: `Demo ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        firstName: 'Demo',
        lastName: 'User',
        profileImageUrl: `https://via.placeholder.com/150?text=${provider.toUpperCase()}`,
        provider: provider as socialAuthService.SocialProvider
      };

      // Mock tokens
      const mockTokens = {
        accessToken: `demo_access_token_${Date.now()}`,
        refreshToken: `demo_refresh_token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
      };

      // Create pending social user (requires mobile verification)
      const result = await socialAuthService.createPendingSocialUser(mockProfile, mockTokens);

      // Redirect to mobile verification page
      const redirectUrl = `/auth/mobile-verification?userId=${result.pendingUserId}&provider=${provider}&requiresVerification=${result.requiresMobileVerification}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error(`Error in ${req.params.provider} OAuth callback:`, error);
      res.redirect('/auth/error?message=OAuth authentication failed');
    }
  });

  // Social auth login simulation for demo purposes  
  app.post('/api/auth/social/demo-login', async (req, res) => {
    try {
      const { provider, userEmail, userName } = req.body;

      if (!provider || !socialAuthService.SOCIAL_PROVIDERS[provider as socialAuthService.SocialProvider]) {
        return res.status(400).json({
          success: false,
          error: 'Invalid social provider'
        });
      }

      // Create demo profile
      const demoProfile: socialAuthService.SocialProfile = {
        id: `demo_${provider}_${Date.now()}`,
        email: userEmail || `demo.user@${provider}.example.com`,
        name: userName || `Demo ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        firstName: 'Demo',
        lastName: 'User',
        profileImageUrl: `https://via.placeholder.com/150?text=${provider.toUpperCase()}`,
        provider: provider as socialAuthService.SocialProvider
      };

      // Create demo tokens
      const demoTokens = {
        accessToken: `demo_access_token_${Date.now()}`,
        refreshToken: `demo_refresh_token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600000)
      };

      // Create pending social user
      const result = await socialAuthService.createPendingSocialUser(demoProfile, demoTokens);

      res.json({
        success: true,
        pendingUserId: result.pendingUserId,
        requiresMobileVerification: result.requiresMobileVerification,
        provider: provider,
        message: 'Social authentication initiated. Mobile verification required to complete setup.'
      });
    } catch (error) {
      console.error('Error in demo social login:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initiate social authentication'
      });
    }
  });


  // =============================================================================
  // SUPER ADMIN DASHBOARD ROUTES
  // =============================================================================

  // NOTE: Admin dashboard endpoint moved to server/admin-auth.ts
  // Using isolated admin authentication system with dedicated session

  // Super Admin dashboard data - COMMENTED OUT - Using new isolated admin system
  // app.get('/api/admin/dashboard', adminAuthMiddleware, async (req: any, res) => {
  //   ... old implementation ...
  // });

  // Super Admin user management
  app.get('/api/admin/users', adminAuthMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Super Admin required'
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const [allUsers, totalCount] = await Promise.all([
        db.select({
          id: users.id,
          displayId: users.displayId,
          name: users.firstName,
          email: users.email,
          whatsappNumber: users.whatsappNumber,
          country: sql<string>'N/A'.as('country'),
          gender: sql<string>'N/A'.as('gender'),
          role: users.role,
          isVerified: users.isVerified,
          isSuperAdmin: users.isSuperAdmin,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          tenantId: users.tenantId,
          profileCompletionPercentage: userProfiles.profileCompletionPercentage
        })
        .from(users)
        .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(users.createdAt)),

        db.select({ count: sql<number>`cast(count(*) as integer)` }).from(users)
      ]);

      res.json({
        success: true,
        users: allUsers,
        pagination: {
          total: totalCount[0]?.count || 0,
          page,
          limit,
          totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
        }
      });
    } catch (error) {
      console.error('Error loading users for admin:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load users'
      });
    }
  });

  // Create user (Super Admin only)
  app.post('/api/admin/users/create', adminAuthMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Super Admin required'
        });
      }

      const { fullName, email, whatsappNumber, password, roleId } = req.body;

      // Validation
      if (!fullName || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Full name, email, and password are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      // Validate password strength (minimum 8 characters)
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters long'
        });
      }

      // Check if email already exists
      const [existingUser] = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }

      // Get role details if roleId provided
      let selectedRole = null;
      let isSuperAdmin = false;
      if (roleId) {
        [selectedRole] = await db.select()
          .from(roles)
          .where(eq(roles.id, roleId))
          .limit(1);

        // Auto-cascade: Super Admin gets all privileges
        if (selectedRole?.name === 'Super Admin') {
          isSuperAdmin = true;
        }
      }

      // Hash password
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 10);

      // Split full name
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Generate user ID (format: usr_timestamp_random)
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Create user
      const [newUser] = await db.insert(users).values({
        id: userId,
        email,
        firstName,
        lastName,
        name: fullName,
        whatsappNumber: whatsappNumber || null,
        passwordHash,
        role: selectedRole?.name === 'Super Admin' ? 'super_admin' : 
              selectedRole?.name === 'Admin' ? 'admin' : 'user',
        isSuperAdmin,
        isVerified: true, // Admin-created users are pre-verified
        authMethods: ['password'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      // Assign role in userRoles table if roleId provided
      if (roleId) {
        await db.insert(userRoles).values({
          userId: newUser.id,
          roleId,
          assignedBy: user.id,
          createdAt: new Date(),
        });
      }

      // Log the action in audit logs
      await logActivity(
        db,
        user.id,
        'user',
        'create',
        newUser.id,
        { email, role: selectedRole?.name || 'User' },
        req
      );

      res.json({
        success: true,
        message: 'User created successfully',
        user: {
          id: newUser.id,
          displayId: newUser.displayId,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          isSuperAdmin: newUser.isSuperAdmin,
        }
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create user'
      });
    }
  });

  // Super Admin tenant management
  app.get('/api/admin/tenants', adminAuthMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Super Admin required'
        });
      }

      const allTenants = await db.select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        status: tenants.status,
        createdAt: tenants.createdAt,
        settings: tenants.settings
      }).from(tenants).orderBy(desc(tenants.createdAt));

      res.json({
        success: true,
        tenants: allTenants
      });
    } catch (error) {
      console.error('Error loading tenants for admin:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load tenants'
      });
    }
  });

  // =============================================================================
  // SOCIAL AUTH ADMIN MANAGEMENT ROUTES
  // =============================================================================

  // Social Auth dashboard data for Super Admin
  app.get('/api/admin/social-auth', adminAuthMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Super Admin required'
        });
      }

      // Get social auth statistics
      const [
        totalSocialUsers,
        pendingVerifications,
        verifiedAccounts,
        recentSocialActivity,
        allSocialTokens
      ] = await Promise.all([
        // Total users with social providers
        db.select({ count: sql<number>`cast(count(*) as integer)` })
          .from(users)
          .where(sql`cardinality(social_providers) > 0`),

        // Pending mobile verifications
        db.select({ count: sql<number>`cast(count(*) as integer)` })
          .from(users)
          .where(and(
            sql`cardinality(social_providers) > 0`,
            eq(users.isVerified, false)
          )),

        // Verified social accounts
        db.select({ count: sql<number>`cast(count(*) as integer)` })
          .from(users)
          .where(and(
            sql`cardinality(social_providers) > 0`,
            eq(users.isVerified, true)
          )),

        // Recent social users
        db.select({
          id: users.id,
          name: users.firstName,
          email: users.email,
          socialProviders: users.socialProviders,
          isVerified: users.isVerified,
          whatsappNumber: users.id,
          lastLoginAt: users.lastLoginAt
        })
          .from(users)
          .where(sql`cardinality(social_providers) > 0`)
          .orderBy(desc(users.lastLoginAt))
          .limit(50),

        // All social tokens for audit
        db.select()
          .from(socialAuthTokens)
          .orderBy(desc(socialAuthTokens.createdAt))
          .limit(100)
      ]);

      // Provider statistics
      const providers = [
        {
          provider: 'google',
          name: 'Google',
          enabled: true,
          userCount: 0,
          lastActivity: null
        },
        {
          provider: 'facebook',
          name: 'Facebook',
          enabled: true,
          userCount: 0,
          lastActivity: null
        },
        {
          provider: 'linkedin',
          name: 'LinkedIn',
          enabled: true,
          userCount: 0,
          lastActivity: null
        },
        {
          provider: 'instagram',
          name: 'Instagram',
          enabled: true,
          userCount: 0,
          lastActivity: null
        }
      ];

      // Calculate provider user counts
      for (const user of recentSocialActivity) {
        if (user.socialProviders) {
          for (const provider of user.socialProviders) {
            const providerData = providers.find(p => p.provider === provider);
            if (providerData) {
              providerData.userCount++;
              if (!providerData.lastActivity || (user.lastLoginAt && new Date(user.lastLoginAt) > new Date(providerData.lastActivity))) {
                providerData.lastActivity = user.lastLoginAt;
              }
            }
          }
        }
      }

      // Generate audit log
      const auditLog = allSocialTokens.map(token => ({
        id: token.id,
        userId: token.userId,
        action: 'Social Login',
        provider: token.provider,
        timestamp: token.createdAt,
        details: `${token.provider} authentication token created`
      }));

      res.json({
        success: true,
        socialAuth: {
          statistics: {
            totalSocialUsers: totalSocialUsers[0]?.count || 0,
            pendingVerifications: pendingVerifications[0]?.count || 0,
            linkedAccounts: verifiedAccounts[0]?.count || 0,
            blockedProviders: 0 // Future feature
          },
          providers,
          users: recentSocialActivity.map(user => ({
            ...user,
            status: user.isVerified ? 'verified' : 'pending',
            lastLogin: user.lastLoginAt
          })),
          auditLog
        }
      });
    } catch (error) {
      console.error('Error loading social auth data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load social auth data'
      });
    }
  });

  // Toggle social provider enable/disable
  app.put('/api/admin/social-auth/provider/:provider', adminAuthMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Super Admin required'
        });
      }

      const { provider } = req.params;
      const { enabled } = req.body;

      // For demo purposes, just return success
      // In production, this would update provider settings in database

      res.json({
        success: true,
        message: `${provider} provider ${enabled ? 'enabled' : 'disabled'} successfully`,
        provider,
        enabled
      });
    } catch (error) {
      console.error('Error updating social provider:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update social provider'
      });
    }
  });

  // Unlink social account
  app.post('/api/admin/social-auth/unlink', adminAuthMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Super Admin required'
        });
      }

      const { userId, provider } = req.body;

      if (!userId || !provider) {
        return res.status(400).json({
          success: false,
          error: 'User ID and provider are required'
        });
      }

      // Unlink the social provider using the service
      await socialAuthService.unlinkSocialProvider(userId, provider as socialAuthService.SocialProvider);

      res.json({
        success: true,
        message: `Successfully unlinked ${provider} from user account`,
        userId,
        provider
      });
    } catch (error) {
      console.error('Error unlinking social account:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to unlink social account'
      });
    }
  });

  // SEO Settings endpoints

  // Get SEO settings
  app.get('/api/admin/seo-settings', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Get current SEO settings for the tenant
      const settings = await db
        .select()
        .from(seoSettings)
        .where(eq(seoSettings.tenantId, user.tenantId))
        .limit(1);

      // Return settings or empty object if none exist
      const currentSettings = settings[0] || null;

      res.json(currentSettings);
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch SEO settings'
      });
    }
  });

  // Update SEO settings
  app.put('/api/admin/seo-settings', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Validate request body
      const validatedData = insertSeoSettingSchema.partial().parse(req.body);

      // Check if settings already exist
      const existingSettings = await db
        .select()
        .from(seoSettings)
        .where(eq(seoSettings.tenantId, user.tenantId))
        .limit(1);

      let updatedSettings;

      if (existingSettings.length > 0) {
        // Update existing settings
        updatedSettings = await db
          .update(seoSettings)
          .set({
            ...validatedData,
            updatedAt: new Date()
          })
          .where(eq(seoSettings.tenantId, user.tenantId))
          .returning();
      } else {
        // Create new settings
        updatedSettings = await db
          .insert(seoSettings)
          .values({
            tenantId: user.tenantId,
            ...validatedData
          })
          .returning();
      }

      res.json({
        success: true,
        data: updatedSettings[0],
        message: 'SEO settings updated successfully'
      });
    } catch (error) {
      console.error('Error updating SEO settings:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update SEO settings'
      });
    }
  });

  // API Integrations endpoints for Super Admin

  // Get all API integrations
  app.get('/api/admin/api-integrations', adminAuthMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Super Admin required'
        });
      }

      // Get all API integrations
      const integrations = await db
        .select()
        .from(apiIntegrations)
        .orderBy(apiIntegrations.category, apiIntegrations.displayName);

      // Don't return actual credentials, just whether they exist
      const safeIntegrations = integrations.map(integration => ({
        ...integration,
        credentials: Object.keys(integration.credentials).reduce((acc, key) => {
          acc[key] = integration.credentials[key] ? '***configured***' : '';
          return acc;
        }, {} as any),
      }));

      res.json({
        success: true,
        data: safeIntegrations
      });
    } catch (error) {
      console.error('Error fetching API integrations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch API integrations'
      });
    }
  });

  // Update API integration settings
  app.put('/api/admin/api-integrations/:provider', adminAuthMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { provider } = req.params;

      if (!user?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Super Admin required'
        });
      }

      const { credentials, isEnabled = false } = req.body;

      if (!credentials || typeof credentials !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Credentials object is required'
        });
      }

      // Get provider display name and category
      const providerConfig = {
        google_auth: { displayName: 'Google OAuth', category: 'auth' },
        facebook_auth: { displayName: 'Facebook OAuth', category: 'auth' },
        linkedin_auth: { displayName: 'LinkedIn OAuth', category: 'auth' },
        whatsapp_auth: { displayName: 'WhatsApp Business', category: 'auth' },
        sms_otp: { displayName: 'SMS OTP Service', category: 'auth' },
        razorpay: { displayName: 'Razorpay', category: 'payment' },
        gpay_direct: { displayName: 'Google Pay Direct', category: 'payment' },
        bhim_direct: { displayName: 'BHIM Pay Direct', category: 'payment' }
      }[provider];

      if (!providerConfig) {
        return res.status(400).json({
          success: false,
          error: 'Invalid provider'
        });
      }

      // Encrypt sensitive credentials (in production, use proper encryption)
      // For now, we'll store them as-is but in production should use crypto.encrypt
      const encryptedCredentials = credentials;

      // Check if integration already exists
      const existing = await db
        .select()
        .from(apiIntegrations)
        .where(eq(apiIntegrations.provider, provider as any))
        .limit(1);

      let result;
      if (existing.length > 0) {
        // Update existing
        result = await db
          .update(apiIntegrations)
          .set({
            credentials: encryptedCredentials,
            isEnabled,
            lastUpdatedBy: user.id,
            updatedAt: new Date()
          })
          .where(eq(apiIntegrations.provider, provider as any))
          .returning();
      } else {
        // Create new
        result = await db
          .insert(apiIntegrations)
          .values({
            provider: provider as any,
            displayName: providerConfig.displayName,
            category: providerConfig.category,
            credentials: encryptedCredentials,
            isEnabled,
            lastUpdatedBy: user.id
          })
          .returning();
      }

      res.json({
        success: true,
        data: {
          ...result[0],
          credentials: Object.keys(result[0].credentials).reduce((acc, key) => {
            acc[key] = result[0].credentials[key] ? '***configured***' : '';
            return acc;
          }, {} as any)
        },
        message: `${providerConfig.displayName} integration updated successfully`
      });
    } catch (error) {
      console.error('Error updating API integration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update API integration'
      });
    }
  });

  // Bulk save API integrations (for the form save)
  app.post('/api/admin/api-integrations/bulk', adminAuthMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      if (!user?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Super Admin required'
        });
      }

      const { integrations } = req.body;

      if (!Array.isArray(integrations)) {
        return res.status(400).json({
          success: false,
          error: 'Integrations array is required'
        });
      }

      const results = [];

      // Process each integration
      for (const integration of integrations) {
        const { provider, credentials, isEnabled = false } = integration;

        if (!provider || !credentials) {
          continue; // Skip invalid entries
        }

        // Get provider config
        const providerConfig = {
          google_auth: { displayName: 'Google OAuth', category: 'auth' },
          facebook_auth: { displayName: 'Facebook OAuth', category: 'auth' },
          linkedin_auth: { displayName: 'LinkedIn OAuth', category: 'auth' },
          whatsapp_auth: { displayName: 'WhatsApp Business', category: 'auth' },
          sms_otp: { displayName: 'SMS OTP Service', category: 'auth' },
          razorpay: { displayName: 'Razorpay', category: 'payment' },
          gpay_direct: { displayName: 'Google Pay Direct', category: 'payment' },
          bhim_direct: { displayName: 'BHIM Pay Direct', category: 'payment' }
        }[provider];

        if (!providerConfig) {
          continue; // Skip invalid providers
        }

        // Check if exists
        const existing = await db
          .select()
          .from(apiIntegrations)
          .where(eq(apiIntegrations.provider, provider as any))
          .limit(1);

        if (existing.length > 0) {
          // Update existing
          const result = await db
            .update(apiIntegrations)
            .set({
              credentials,
              isEnabled,
              lastUpdatedBy: user.id,
              updatedAt: new Date()
            })
            .where(eq(apiIntegrations.provider, provider as any))
            .returning();
          results.push(result[0]);
        } else {
          // Create new
          const result = await db
            .insert(apiIntegrations)
            .values({
              provider: provider as any,
              displayName: providerConfig.displayName,
              category: providerConfig.category,
              credentials,
              isEnabled,
              lastUpdatedBy: user.id
            })
            .returning();
          results.push(result[0]);
        }
      }

      res.json({
        success: true,
        data: results.map(result => ({
          ...result,
          credentials: Object.keys(result.credentials).reduce((acc, key) => {
            acc[key] = result.credentials[key] ? '***configured***' : '';
            return acc;
          }, {} as any)
        })),
        message: `Successfully updated ${results.length} API integrations`
      });
    } catch (error) {
      console.error('Error bulk updating API integrations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update API integrations'
      });
    }
  });

  // Serve .well-known directory for TWA domain verification
  app.get('/.well-known/assetlinks.json', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', '.well-known', 'assetlinks.json'));
  });

  // CI Upload endpoints for getting signed URLs (secured)
  app.post('/api/ci/upload-urls', async (req, res) => {
    try {
      // Authenticate CI requests using secure token
      const authHeader = req.headers.authorization;
      const expectedToken = process.env.CI_UPLOAD_TOKEN;

      if (!expectedToken) {
        console.error('CI_UPLOAD_TOKEN not configured - CI uploads disabled');
        return res.status(503).json({
          success: false,
          error: 'CI upload service not configured'
        });
      }

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Missing or invalid authorization header'
        });
      }

      const token = authHeader.substring(7);
      if (token !== expectedToken) {
        console.warn('Unauthorized CI upload attempt from IP:', req.ip);
        return res.status(401).json({
          success: false,
          error: 'Invalid authorization token'
        });
      }

      // Generate signed upload URLs
      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();

      const apkUploadUrl = await objectStorageService.getApkUploadURL();
      const metadataUploadUrl = await objectStorageService.getMetadataUploadURL();

      console.log('Generated signed upload URLs for authorized CI request');
      res.json({
        success: true,
        apkUploadUrl,
        metadataUploadUrl
      });
    } catch (error) {
      console.error('Error generating upload URLs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate upload URLs'
      });
    }
  });

  // APK Download and Metadata APIs
  app.get('/downloads/wytnet-latest.apk', async (req, res) => {
    try {
      const { apkStorage } = await import('./services/apkStorage');

      const apkFile = await apkStorage.getAPKFile();
      if (!apkFile) {
        return res.status(404).json({
          error: 'APK not available',
          message: 'APK is being built by CI. Please check back in a few minutes.'
        });
      }

      // Use Object Storage service to properly stream the file
      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();

      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="wytnet-latest.apk"');

      await objectStorageService.downloadObject(apkFile, res);
    } catch (error) {
      console.error('Error serving APK download:', error);
      res.status(500).json({
        error: 'Download failed',
        message: 'Unable to serve APK file.'
      });
    }
  });

  app.get('/api/mobile/latest', async (req, res) => {
    try {
      const { apkStorage } = await import('./services/apkStorage');

      const metadata = await apkStorage.getLatestMetadata();
      if (!metadata) {
        return res.status(404).json({
          success: false,
          error: 'No APK metadata available'
        });
      }

      res.json({
        success: true,
        data: metadata,
        message: 'Latest APK metadata retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching APK metadata:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch APK metadata'
      });
    }
  });

  // APK Storage configuration (for debugging - admin only)
  app.get('/api/mobile/config', async (req, res) => {
    try {
      // Basic security - only allow in development or for authenticated admin users
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          error: 'Configuration endpoint not available in production'
        });
      }

      const { apkStorage } = await import('./services/apkStorage');
      const config = apkStorage.getConfig();

      res.json({
        success: true,
        data: {
          ...config,
          bucketId: config.bucketId ? '***configured***' : 'not-configured'
        }
      });
    } catch (error) {
      console.error('Error fetching storage config:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch storage configuration'
      });
    }
  });

  // ========================================
  // PAYMENT ROUTES (Razorpay Integration)
  // ========================================

  // Get available plans
  app.get('/api/payments/plans', requireModule('razorpay-payment'), async (req, res) => {
    try {
      const result = await razorpayService.getPlans();

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch plans'
      });
    }
  });

  // Create payment order
  app.post('/api/payments/create-order', isAuthenticatedUnified, requireModule('razorpay-payment'), async (req, res) => {
    try {
      const principal = getPrincipal(req);
      if (!principal) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { amount, currency, planId, receipt, notes, items } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid amount is required'
        });
      }

      const result = await razorpayService.createOrder(principal.id, {
        amount,
        currency,
        planId,
        receipt,
        notes,
        items
      });

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error creating payment order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment order'
      });
    }
  });

  // Verify payment
  app.post('/api/payments/verify', isAuthenticatedUnified, async (req, res) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: 'Payment verification data is required'
        });
      }

      const result = await razorpayService.handlePaymentSuccess({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      });

      if (result.success) {
        res.json({
          success: true,
          message: 'Payment verified successfully',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify payment'
      });
    }
  });

  // Handle payment failure
  app.post('/api/payments/failure', isAuthenticatedUnified, async (req, res) => {
    try {
      const { payment_id, reason } = req.body;

      if (!payment_id) {
        return res.status(400).json({
          success: false,
          error: 'Payment ID is required'
        });
      }

      const result = await razorpayService.handlePaymentFailure(payment_id, reason);

      if (result.success) {
        res.json({
          success: true,
          message: 'Payment failure recorded'
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error handling payment failure:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to handle payment failure'
      });
    }
  });

  // Get payment history
  app.get('/api/payments/history', isAuthenticatedUnified, async (req, res) => {
    try {
      const principal = getPrincipal(req);
      if (!principal) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const result = await razorpayService.getPaymentHistory(principal.id);

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment history'
      });
    }
  });

  // Get payment details
  app.get('/api/payments/:paymentId', isAuthenticatedUnified, async (req, res) => {
    try {
      const { paymentId } = req.params;

      const result = await razorpayService.getPayment(paymentId);

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment details'
      });
    }
  });

  // Razorpay webhook endpoint (for handling payment status updates)
  app.post('/api/payments/webhook', async (req, res) => {
    try {
      // Verify webhook signature (implement webhook signature verification)
      const webhookSignature = req.headers['x-razorpay-signature'] as string;

      // Handle different webhook events
      const { event, payload } = req.body;

      console.log('📩 Razorpay Webhook received:', event);

      switch (event) {
        case 'payment.captured':
          // Handle successful payment
          await razorpayService.handlePaymentSuccess({
            razorpay_payment_id: payload.payment.entity.id,
            razorpay_order_id: payload.payment.entity.order_id,
            razorpay_signature: '' // Webhook doesn't provide signature
          });
          break;

        case 'payment.failed':
          // Handle failed payment
          await razorpayService.handlePaymentFailure(
            payload.payment.entity.id,
            payload.payment.entity.error_description
          );
          break;

        default:
          console.log('Unhandled webhook event:', event);
      }

      res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('Error handling Razorpay webhook:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to handle webhook'
      });
    }
  });

  // Refund payment (admin only)
  app.post('/api/payments/:paymentId/refund', isAuthenticatedUnified, async (req, res) => {
    try {
      const principal = getPrincipal(req);
      const adminPrincipal = getAdminPrincipal(req);

      if (!adminPrincipal && !isSuperAdmin(principal)) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      const { paymentId } = req.params;
      const { amount, reason } = req.body;

      const result = await razorpayService.refundPayment(paymentId, amount, reason);

      if (result.success) {
        res.json({
          success: true,
          message: 'Refund processed successfully',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process refund'
      });
    }
  });

  // Create payment link
  app.post('/api/payments/create-link', async (req, res) => {
    try {
      const { amount, description, customerName, customerEmail, customerContact, notes } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid amount is required'
        });
      }

      const result = await razorpayService.createPaymentLink({
        amount,
        description: description || 'Test Payment',
        customerName,
        customerEmail,
        customerContact,
        notes
      });

      if (result.success) {
        res.json({
          success: true,
          message: 'Payment link created successfully',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment link'
      });
    }
  });

  // Get payment link details
  app.get('/api/payments/link/:paymentLinkId', async (req, res) => {
    try {
      const { paymentLinkId } = req.params;
      const result = await razorpayService.getPaymentLink(paymentLinkId);

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error fetching payment link:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment link'
      });
    }
  });

  // Create payment order for DISC Assessment Report
  app.post('/api/payments/disc/create-order', async (req, res) => {
    try {
      const { sessionId, product } = req.body;
      const user = (req as any).user;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      // Verify session is completed
      const session = await db.select()
        .from(assessmentSessions)
        .where(eq(assessmentSessions.id, sessionId))
        .limit(1);

      if (!session[0]) {
        return res.status(404).json({
          success: false,
          error: 'Assessment session not found'
        });
      }

      if (!session[0].isCompleted) {
        return res.status(400).json({
          success: false,
          error: 'Please complete the assessment first'
        });
      }

      if (session[0].reportPaid) {
        return res.status(400).json({
          success: false,
          error: 'Report already purchased'
        });
      }

      // Create order with Rs. 1 amount
      const result = await razorpayService.createOrder(user?.id || 'anonymous', {
        amount: 1, // Rs. 1
        currency: 'INR',
        receipt: `DISC-${sessionId.slice(0, 8)}`,
        notes: {
          sessionId,
          product: product || 'disc_assessment_report',
          participantName: session[0].participantName,
          participantEmail: session[0].participantEmail || '',
        },
        items: [{
          name: 'DISC Assessment Report',
          description: `DISC Assessment Report for ${session[0].participantName}`,
          amount: 1,
          currency: 'INR',
          quantity: 1,
        }]
      });

      if (result.success && result.data) {
        // Link order to session
        await db.update(assessmentSessions)
          .set({ 
            paymentOrderId: result.data.orderId,
            updatedAt: new Date()
          })
          .where(eq(assessmentSessions.id, sessionId));

        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || 'Failed to create order'
        });
      }
    } catch (error) {
      console.error('Error creating payment order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment order'
      });
    }
  });

  // Verify payment and mark assessment as paid
  app.post('/api/payments/disc/verify', async (req, res) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature, sessionId } = req.body;

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Missing payment verification data'
        });
      }

      // Get session and validate
      const session = await db.select()
        .from(assessmentSessions)
        .where(eq(assessmentSessions.id, sessionId))
        .limit(1);

      if (!session[0]) {
        return res.status(404).json({
          success: false,
          error: 'Assessment session not found'
        });
      }

      // Check if session is completed
      if (!session[0].isCompleted) {
        return res.status(400).json({
          success: false,
          error: 'Assessment must be completed first'
        });
      }

      // Check if already paid (idempotent)
      if (session[0].reportPaid) {
        return res.status(200).json({
          success: true,
          message: 'Report already purchased',
          data: { alreadyPaid: true }
        });
      }

      // Verify order belongs to this session
      const payment = await db.select()
        .from(payments)
        .where(eq(payments.providerOrderId, razorpay_order_id))
        .limit(1);

      if (!payment[0]) {
        return res.status(404).json({
          success: false,
          error: 'Payment order not found'
        });
      }

      // Verify payment using Razorpay service
      const verificationResult = await razorpayService.handlePaymentSuccess({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      });

      if (verificationResult.success) {
        // Mark assessment session as paid
        await db.update(assessmentSessions)
          .set({ 
            reportPaid: true,
            updatedAt: new Date()
          })
          .where(eq(assessmentSessions.id, sessionId));

        res.json({
          success: true,
          message: 'Payment verified successfully',
          data: { 
            ...verificationResult.data,
            reportPaid: true
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: verificationResult.error || 'Payment verification failed'
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify payment'
      });
    }
  });

  // ========================================
  // WYTPOINTS ECONOMY API ROUTES
  // ========================================

  const { pointsService } = await import('./services/pointsService');

  // User Points Routes

  // Get current points balance
  app.get('/api/points/balance', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // WytPoints are only available for WhatsApp-authenticated users
      if (principal.provider !== 'whatsapp') {
        return res.status(403).json({ 
          error: 'WytPoints are only available for WhatsApp-authenticated users',
          feature: 'wytpoints',
          requiredProvider: 'whatsapp'
        });
      }

      const balance = await pointsService.getBalance(principal.id);
      res.json({ success: true, balance });
    } catch (error) {
      console.error('Error fetching points balance:', error);
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  });

  // Wallet balance alias (for convenience)
  app.get('/api/wallet/balance', async (req: any, res) => {    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (principal.provider !== 'whatsapp') {
        return res.status(403).json({ 
          error: 'WytPoints are only available for WhatsApp-authenticated users',
          feature: 'wytpoints',
          requiredProvider: 'whatsapp'
        });
      }

      const balance = await pointsService.getBalance(principal.id);
      res.json({ success: true, balance });
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  });

  // Get wallet details with transaction history
  app.get('/api/points/wallet', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const details = await pointsService.getWalletDetails(principal.id, limit);

      res.json({ success: true, data: details });
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      res.status(500).json({ error: 'Failed to fetch wallet details' });
    }
  });

  // Get transaction history
  app.get('/api/points/transactions', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await pointsService.getTransactions(principal.id, limit);

      res.json({ success: true, transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Get or generate referral code
  app.get('/api/points/referral/code', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get user from unified users table
      const [user] = await db.select().from(users).where(eq(users.id, principal.id)).limit(1);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let referralCode = user.referralCode;

      // Generate referral code if not exists
      if (!referralCode) {
        referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        await db.update(users).set({ referralCode }).where(eq(users.id, principal.id));
      }

      const referralLink = `${req.protocol}://${req.get('host')}/login?ref=${referralCode}`;

      res.json({ 
        success: true, 
        referralCode,
        referralLink 
      });
    } catch (error) {
      console.error('Error getting referral code:', error);
      res.status(500).json({ error: 'Failed to get referral code' });
    }
  });

  // Get user's referrals
  app.get('/api/points/referrals', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get user's referral code from unified users table
      const [user] = await db.select().from(users).where(eq(users.id, principal.id)).limit(1);

      if (!user || !user.referralCode) {
        return res.json({ 
          success: true, 
          referrals: [],
          totalReferrals: 0 
        });
      }

      // Get all users who used this referral code
      const referrals = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.referredBy, user.referralCode))
      .orderBy(desc(users.createdAt));

      res.json({ 
        success: true, 
        referrals,
        totalReferrals: referrals.length 
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
      res.status(500).json({ error: 'Failed to fetch referrals' });
    }
  });

  // Get points configuration (public - for opportunities display)
  app.get('/api/points/config', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const configs = await db
        .select()
        .from(pointsConfig)
        .where(eq(pointsConfig.isActive, true))
        .orderBy(pointsConfig.category, pointsConfig.action);

      res.json({ success: true, configs });
    } catch (error) {
      console.error('Error fetching points configuration:', error);
      res.status(500).json({ error: 'Failed to fetch points configuration' });
    }
  });

  // Create points recharge order
  app.post('/api/points/recharge', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // WytPoints are only available for WhatsApp-authenticated users
      if (principal.provider !== 'whatsapp') {
        return res.status(403).json({ 
          error: 'WytPoints are only available for WhatsApp-authenticated users',
          feature: 'wytpoints',
          requiredProvider: 'whatsapp'
        });
      }

      const { amount, pointsAmount } = req.body;

      if (!amount || !pointsAmount || amount <= 0 || pointsAmount <= 0) {
        return res.status(400).json({ 
          error: 'Invalid amount or pointsAmount' 
        });
      }

      const result = await razorpayService.createPointsRechargeOrder(principal.id, {
        amount: parseFloat(amount),
        pointsAmount: parseInt(pointsAmount),
      });

      if (!result.success) {
        // Return 403 for WhatsApp-only restriction, 500 for other errors
        const statusCode = result.error?.includes('WhatsApp-authenticated') ? 403 : 500;
        return res.status(statusCode).json({ error: result.error });
      }

      res.json(result);
    } catch (error: any) {
      console.error('Error creating recharge order:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to create recharge order' 
      });
    }
  });

  // Verify points recharge payment
  app.post('/api/points/recharge/verify', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // WytPoints are only available for WhatsApp-authenticated users
      if (principal.provider !== 'whatsapp') {
        return res.status(403).json({ 
          error: 'WytPoints are only available for WhatsApp-authenticated users',
          feature: 'wytpoints',
          requiredProvider: 'whatsapp'
        });
      }

      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ 
          error: 'Missing payment verification data' 
        });
      }

      const result = await razorpayService.handlePointsRechargeSuccess({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      });

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json(result);
    } catch (error: any) {
      console.error('Error verifying recharge payment:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to verify payment' 
      });
    }
  });

  // Admin Points Routes

  // Get points system statistics
  app.get('/api/admin/points/statistics', requireSuperAdmin, async (req: any, res) => {
    try {
      const stats = await pointsService.getStatistics();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching points statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // Get all wallets (admin view)
  app.get('/api/admin/points/wallets', requireSuperAdmin, async (req: any, res) => {
    try {
      const wallets = await db.select()
        .from(pointsWallets)
        .orderBy(desc(pointsWallets.balance))
        .limit(100);

      res.json({ success: true, wallets });
    } catch (error) {
      console.error('Error fetching wallets:', error);
      res.status(500).json({ error: 'Failed to fetch wallets' });
    }
  });

  // Get specific user's wallet details (admin)
  app.get('/api/admin/points/wallet/:userId', requireSuperAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const details = await pointsService.getWalletDetails(userId, limit);
      res.json({ success: true, data: details });
    } catch (error) {
      console.error('Error fetching user wallet:', error);
      res.status(500).json({ error: 'Failed to fetch wallet details' });
    }
  });

  // Admin manual balance adjustment
  app.post('/api/admin/points/adjust', requireSuperAdmin, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { userId, amount, reason } = req.body;

      if (!userId || amount === undefined || !reason) {
        return res.status(400).json({ 
          error: 'Missing required fields: userId, amount, reason' 
        });
      }

      const wallet = await pointsService.adminAdjustBalance({
        userId,
        amount: parseInt(amount),
        reason,
        adminUserId: principal.id,
      });

      res.json({ 
        success: true, 
        message: 'Balance adjusted successfully',
        wallet 
      });
    } catch (error: any) {
      console.error('Error adjusting balance:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to adjust balance' 
      });
    }
  });

  // Points Configuration Routes (Admin)

  // Get all points configurations
  app.get('/api/admin/points/config', requireSuperAdmin, async (req: any, res) => {
    try {
      const configs = await db.select()
        .from(pointsConfig)
        .orderBy(pointsConfig.category, pointsConfig.action);

      res.json({ success: true, configs });
    } catch (error) {
      console.error('Error fetching points config:', error);
      res.status(500).json({ error: 'Failed to fetch points configuration' });
    }
  });

  // Update points configuration
  app.put('/api/admin/points/config/:id', requireSuperAdmin, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { points, description, isActive } = req.body;

      const [updated] = await db.update(pointsConfig)
        .set({
          points,
          description,
          isActive,
          updatedBy: principal.id,
          updatedAt: new Date(),
        })
        .where(eq(pointsConfig.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Configuration not found' });
      }

      res.json({ success: true, config: updated });
    } catch (error) {
      console.error('Error updating points config:', error);
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  });

  // Get points value for a specific action (helper for services)
  app.get('/api/points/config/:action', async (req: any, res) => {
    try {
      const { action } = req.params;

      const [config] = await db.select()
        .from(pointsConfig)
        .where(eq(pointsConfig.action, action))
        .limit(1);

      if (!config) {
        return res.status(404).json({ error: 'Configuration not found' });
      }

      res.json({ success: true, config });
    } catch (error) {
      console.error('Error fetching points config:', error);
      res.status(500).json({ error: 'Failed to fetch configuration' });
    }
  });

  // ========================================
  // DATASET MANAGEMENT ROUTES (Admin)
  // ========================================

  // Get all dataset collections
  app.get('/api/admin/datasets', adminAuthMiddleware, async (req: any, res) => {
    try {
      const collections = await db.select()
        .from(datasetCollections)
        .orderBy(datasetCollections.name);

      res.json({ success: true, collections });
    } catch (error) {
      console.error('Error fetching dataset collections:', error);
      res.status(500).json({ error: 'Failed to fetch dataset collections' });
    }
  });

  // Get single dataset collection with items
  app.get('/api/admin/datasets/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;

      const [collection] = await db.select()
        .from(datasetCollections)
        .where(eq(datasetCollections.id, id))
        .limit(1);

      if (!collection) {
        return res.status(404).json({ error: 'Dataset collection not found' });
      }

      const items = await db.select()
        .from(datasetItems)
        .where(eq(datasetItems.collectionId, id))
        .orderBy(datasetItems.sortOrder, datasetItems.label);

      res.json({ success: true, collection, items });
    } catch (error) {
      console.error('Error fetching dataset collection:', error);
      res.status(500).json({ error: 'Failed to fetch dataset collection' });
    }
  });

  // Create new dataset collection
  app.post('/api/admin/datasets', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { key, name, description, scope, metadata } = req.body;

      const [collection] = await db.insert(datasetCollections)
        .values({
          key,
          name,
          description,
          scope: scope || 'global',
          metadata: metadata || {},
        })
        .returning();

      res.json({ success: true, collection });
    } catch (error: any) {
      console.error('Error creating dataset collection:', error);
      res.status(500).json({ error: error.message || 'Failed to create dataset collection' });
    }
  });

  // Update dataset collection
  app.put('/api/admin/datasets/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name, description, metadata } = req.body;

      // Check if collection is immutable
      const [existing] = await db.select()
        .from(datasetCollections)
        .where(eq(datasetCollections.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ error: 'Dataset collection not found' });
      }

      if (existing.metadata && (existing.metadata as any).immutable) {
        return res.status(403).json({ error: 'Cannot modify immutable dataset collection' });
      }

      const [updated] = await db.update(datasetCollections)
        .set({
          name,
          description,
          metadata,
          updatedAt: new Date(),
        })
        .where(eq(datasetCollections.id, id))
        .returning();

      res.json({ success: true, collection: updated });
    } catch (error) {
      console.error('Error updating dataset collection:', error);
      res.status(500).json({ error: 'Failed to update dataset collection' });
    }
  });

  // Delete dataset collection
  app.delete('/api/admin/datasets/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;

      // Check if collection is immutable
      const [existing] = await db.select()
        .from(datasetCollections)
        .where(eq(datasetCollections.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ error: 'Dataset collection not found' });
      }

      if (existing.metadata && (existing.metadata as any).immutable) {
        return res.status(403).json({ error: 'Cannot delete immutable dataset collection' });
      }

      await db.delete(datasetCollections)
        .where(eq(datasetCollections.id, id));

      res.json({ success: true, message: 'Dataset collection deleted' });
    } catch (error) {
      console.error('Error deleting dataset collection:', error);
      res.status(500).json({ error: 'Failed to delete dataset collection' });
    }
  });

  // Create dataset item
  app.post('/api/admin/datasets/:collectionId/items', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { collectionId } = req.params;
      const { code, label, locale, isDefault, sortOrder, metadata } = req.body;

      const [item] = await db.insert(datasetItems)
        .values({
          collectionId,
          code,
          label,
          locale: locale || 'en',
          isDefault: isDefault || false,
          sortOrder: sortOrder || 0,
          metadata: metadata || {},
        })
        .returning();

      res.json({ success: true, item });
    } catch (error: any) {
      console.error('Error creating dataset item:', error);
      res.status(500).json({ error: error.message || 'Failed to create dataset item' });
    }
  });

  // Update dataset item
  app.put('/api/admin/datasets/:collectionId/items/:itemId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { itemId } = req.params;
      const { code, label, locale, isDefault, sortOrder, metadata } = req.body;

      const [updated] = await db.update(datasetItems)
        .set({
          code,
          label,
          locale,
          isDefault,
          sortOrder,
          metadata,
        })
        .where(eq(datasetItems.id, itemId))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Dataset item not found' });
      }

      res.json({ success: true, item: updated });
    } catch (error) {
      console.error('Error updating dataset item:', error);
      res.status(500).json({ error: 'Failed to update dataset item' });
    }
  });

  // Delete dataset item
  app.delete('/api/admin/datasets/:collectionId/items/:itemId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { itemId } = req.params;

      await db.delete(datasetItems)
        .where(eq(datasetItems.id, itemId));

      res.json({ success: true, message: 'Dataset item deleted' });
    } catch (error) {
      console.error('Error deleting dataset item:', error);
      res.status(500).json({ error: 'Failed to delete dataset item' });
    }
  });

  // Set item as default
  app.post('/api/admin/datasets/:collectionId/items/:itemId/set-default', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { collectionId, itemId } = req.params;

      // First, unset all defaults in this collection
      await db.update(datasetItems)
        .set({ isDefault: false })
        .where(eq(datasetItems.collectionId, collectionId));

      // Then set this item as default
      const [updated] = await db.update(datasetItems)
        .set({ isDefault: true })
        .where(eq(datasetItems.id, itemId))
        .returning();

      res.json({ success: true, item: updated });
    } catch (error) {
      console.error('Error setting default item:', error);
      res.status(500).json({ error: 'Failed to set default item' });
    }
  });

  // Reorder dataset item
  app.post('/api/admin/datasets/:collectionId/items/:itemId/reorder', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { collectionId, itemId } = req.params;
      const { direction } = req.body;

      // Get all items in this collection sorted by sortOrder
      const allItems = await db.select()
        .from(datasetItems)
        .where(eq(datasetItems.collectionId, collectionId))
        .orderBy(datasetItems.sortOrder);

      const currentIndex = allItems.findIndex(item => item.id === itemId);
      if (currentIndex === -1) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= allItems.length) {
        return res.status(400).json({ error: 'Cannot move item in that direction' });
      }

      // Swap sort orders
      const currentItem = allItems[currentIndex];
      const targetItem = allItems[targetIndex];

      await db.update(datasetItems)
        .set({ sortOrder: targetItem.sortOrder })
        .where(eq(datasetItems.id, currentItem.id));

      await db.update(datasetItems)
        .set({ sortOrder: currentItem.sortOrder })
        .where(eq(datasetItems.id, targetItem.id));

      res.json({ success: true, message: 'Item reordered successfully' });
    } catch (error) {
      console.error('Error reordering item:', error);
      res.status(500).json({ error: 'Failed to reorder item' });
    }
  });

  // ========================================
  // END DATASET MANAGEMENT ROUTES
  // ========================================

  // ========================================
  // WYTWALL MARKETPLACE ROUTES
  // ========================================

  const { needsService } = await import('./services/needsService');
  const { offersService } = await import('./services/offersService');
  const { wytstarService } = await import('./services/wytstarService');
  const { profileCompletionService } = await import('./services/profileCompletionService');

  // Needs Routes

  // List public needs (unauthenticated)
  app.get('/api/needs/public', async (req: any, res) => {
    try {
      const category = req.query.category as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const needs = await needsService.listPublicNeeds({ category, limit, offset });
      const counts = await needsService.getNeedsCounts({ isPublic: true });

      res.json({ success: true, needs, counts });
    } catch (error: any) {
      console.error('Error fetching public needs:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch needs' });
    }
  });

  // List authenticated user needs
  app.get('/api/needs', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const category = req.query.category as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const needs = await needsService.listAuthenticatedNeeds({
        userId: principal.id,
        category,
        circles: [],
        limit,
        offset,
      });

      const counts = await needsService.getNeedsCounts({
        isPublic: false,
        userId: principal.id,
        circles: [],
      });

      res.json({ success: true, needs, counts });
    } catch (error: any) {
      console.error('Error fetching needs:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch needs' });
    }
  });

  // Get user's own needs
  app.get('/api/needs/my', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const status = req.query.status as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const needs = await needsService.getUserNeeds(principal.id, { status, limit, offset });
      res.json({ success: true, needs });
    } catch (error: any) {
      console.error('Error fetching user needs:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch needs' });
    }
  });

  // Get single need by ID
  app.get('/api/needs/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const need = await needsService.getNeedById(id);

      if (!need) {
        return res.status(404).json({ error: 'Need not found' });
      }

      res.json({ success: true, need });
    } catch (error: any) {
      console.error('Error fetching need:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch need' });
    }
  });

  // Create a new need
  app.post('/api/needs', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const needData = {
        ...req.body,
        userId: principal.id,
        tenantId: principal.tenantId || null,
      };

      const need = await needsService.createNeed(needData);

      // Record WytStar contribution
      await wytstarService.recordContribution({
        userId: principal.id,
        tenantId: principal.tenantId,
        type: 'post_need',
        entityType: 'need',
        entityId: need.id,
      });

      // Award WytPoints for posting need
      const [config] = await db.select()
        .from(pointsConfig)
        .where(and(
          eq(pointsConfig.action, 'post_need'),
          eq(pointsConfig.isActive, true)
        ));

      if (config && config.points > 0) {
        await pointsService.creditPoints({
          userId: principal.id,
          amount: config.points,
          type: 'post_need',
          description: `Posted need: ${need.title}`,
          metadata: { needId: need.id },
        });
      }

      // Auto-complete profile section if first need
      await profileCompletionService.autoCompleteSection(principal.id, 'first_need');

      res.json({ success: true, need, pointsEarned: config?.points || 0 });
    } catch (error: any) {
      console.error('Error creating need:', error);
      res.status(500).json({ error: error.message || 'Failed to create need' });
    }
  });

  // Update a need
  app.put('/api/needs/:id', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const need = await needsService.updateNeed(id, principal.id, req.body);

      res.json({ success: true, need });
    } catch (error: any) {
      console.error('Error updating need:', error);
      res.status(400).json({ error: error.message || 'Failed to update need' });
    }
  });

  // Delete a need
  app.delete('/api/needs/:id', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      await needsService.deleteNeed(id, principal.id);

      res.json({ success: true, message: 'Need deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting need:', error);
      res.status(400).json({ error: error.message || 'Failed to delete need' });
    }
  });

  // Offers Routes

  // Get offers for a need
  app.get('/api/needs/:needId/offers', async (req: any, res) => {
    try {
      const { needId } = req.params;
      const status = req.query.status as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const offers = await offersService.getOffersByNeed(needId, { status, limit, offset });
      res.json({ success: true, offers });
    } catch (error: any) {
      console.error('Error fetching offers:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch offers' });
    }
  });

  // Create a standalone offer
  app.post('/api/offers', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { offer, pointsSpent } = await offersService.createOffer(req.body, principal.id, principal.tenantId);

      // Record WytStar contribution
      await wytstarService.recordContribution({
        userId: principal.id,
        tenantId: principal.tenantId,
        type: 'make_offer',
        entityType: 'offer',
        entityId: offer.id,
      });

      // Auto-complete profile section if first offer
      await profileCompletionService.autoCompleteSection(principal.id, 'first_offer');

      res.json({ success: true, offer, pointsSpent });
    } catch (error: any) {
      console.error('Error creating offer:', error);
      res.status(400).json({ error: error.message || 'Failed to create offer' });
    }
  });

  // Get user's offers
  app.get('/api/offers/my', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const status = req.query.status as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const offers = await offersService.getUserOffers(principal.id, { status, limit, offset });
      res.json({ success: true, offers });
    } catch (error: any) {
      console.error('Error fetching user offers:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch offers' });
    }
  });

  // Get offers received on user's needs
  app.get('/api/offers/received', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const status = req.query.status as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const offers = await offersService.getReceivedOffers(principal.id, { status, limit, offset });
      res.json({ success: true, offers });
    } catch (error: any) {
      console.error('Error fetching received offers:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch offers' });
    }
  });

  // Update offer status
  app.put('/api/offers/:id/status', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { status } = req.body;

      const offer = await offersService.updateOfferStatus(id, status, principal.id);
      res.json({ success: true, offer });
    } catch (error: any) {
      console.error('Error updating offer status:', error);
      res.status(400).json({ error: error.message || 'Failed to update offer' });
    }
  });

  // Update an offer
  app.put('/api/offers/:id', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const offer = await offersService.updateOffer(id, principal.id, req.body);

      res.json({ success: true, offer });
    } catch (error: any) {
      console.error('Error updating offer:', error);
      res.status(400).json({ error: error.message || 'Failed to update offer' });
    }
  });

  // Delete an offer
  app.delete('/api/offers/:id', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      await offersService.deleteOffer(id, principal.id);

      res.json({ success: true, message: 'Offer deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting offer:', error);
      res.status(400).json({ error: error.message || 'Failed to delete offer' });
    }
  });

  // List public offers (unauthenticated - for WytWall feed)
  app.get('/api/offers/public', async (req: any, res) => {
    try {
      const category = req.query.category as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const offers = await offersService.listPublicOffers({ category, limit, offset });
      const counts = await offersService.getOffersCounts({ isPublic: true });

      res.json({ success: true, offers, counts });
    } catch (error: any) {
      console.error('Error fetching public offers:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch offers' });
    }
  });

  // List authenticated user offers (for WytWall feed)
  app.get('/api/offers', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const category = req.query.category as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const offers = await offersService.listAuthenticatedOffers({
        userId: principal.id,
        category,
        circles: [],
        limit,
        offset,
      });

      const counts = await offersService.getOffersCounts({
        isPublic: false,
        userId: principal.id,
        circles: [],
      });

      res.json({ success: true, offers, counts });
    } catch (error: any) {
      console.error('Error fetching offers:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch offers' });
    }
  });

  // ========================================
  // WYTWALL POSTS - Simplified Needs/Offers
  // ========================================

  // Create a new WytWall post
  app.post('/api/wytwall/posts', rateLimiters.postCreation, requireAuth, async (req: Request, res: Response) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Validate request body
      const validatedData = insertWytWallPostSchema.parse({
        ...req.body,
        userId: principal.id,
      });

      const [post] = await db.insert(wytWallPosts).values(validatedData).returning();

      res.json({ success: true, post });
    } catch (error: any) {
      console.error("Error creating WytWall post:", error);
      res.status(400).json({ error: error.message || "Failed to create post" });
    }
  });

  // Get user's WytWall posts
  app.get('/api/wytwall/my-posts', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const postType = req.query.postType as string;

      let query = db.select().from(wytWallPosts).where(eq(wytWallPosts.userId, principal.id));

      if (postType && (postType === 'need' || postType === 'offer')) {
        query = query.where(and(
          eq(wytWallPosts.userId, principal.id),
          eq(wytWallPosts.postType, postType)
        ));
      }

      const posts = await query.orderBy(desc(wytWallPosts.createdAt));

      res.json({ success: true, posts });
    } catch (error: any) {
      console.error('Error fetching WytWall posts:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch posts' });
    }
  });

  // Get all WytWall posts (public feed)
  app.get('/api/wytwall/posts', async (req: any, res) => {
    try {
      const postType = req.query.postType as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      let query = db.select({
        id: wytWallPosts.id,
        userId: wytWallPosts.userId,
        postType: wytWallPosts.postType,
        category: wytWallPosts.category,
        description: wytWallPosts.description,
        createdAt: wytWallPosts.createdAt,
        userName: users.firstName,
        userEmail: users.email,
        userProfileImage: users.profileImageUrl,
      })
      .from(wytWallPosts)
      .leftJoin(users, eq(wytWallPosts.userId, users.id)); // Corrected join alias

      if (postType && (postType === 'need' || postType === 'offer')) {
        query = query.where(eq(wytWallPosts.postType, postType));
      }

      const posts = await query.orderBy(desc(wytWallPosts.createdAt)).limit(limit).offset(offset);

      res.json({ success: true, posts });
    } catch (error: any) {
      console.error('Error fetching WytWall posts:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch posts' });
    }
  });

  // Delete a WytWall post
  app.delete('/api/wytwall/posts/:id', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      // Check if post belongs to user
      const [post] = await db.select().from(wytWallPosts).where(eq(wytWallPosts.id, id));

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (post.userId !== principal.id) {
        return res.status(403).json({ error: 'Not authorized to delete this post' });
      }

      await db.delete(wytWallPosts).where(eq(wytWallPosts.id, id));

      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting WytWall post:', error);
      res.status(400).json({ error: error.message || 'Failed to delete post' });
    }
  });

  // WytStar Routes

  // Get user's WytStar level
  app.get('/api/wytstar/level', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const level = await wytstarService.getOrCreateUserLevel(principal.id);
      res.json({ success: true, level });
    } catch (error: any) {
      console.error('Error fetching WytStar level:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch level' });
    }
  });

  // Get user's contributions
  app.get('/api/wytstar/contributions', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const contributions = await wytstarService.getUserContributions(principal.id, { limit, offset });
      res.json({ success: true, contributions });
    } catch (error: any) {
      console.error('Error fetching contributions:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch contributions' });
    }
  });

  // Get leaderboard
  app.get('/api/wytstar/leaderboard', async (req: any, res) => {
    try {
      const period = (req.query.period as 'all' | 'monthly') || 'all';
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const leaderboard = await wytstarService.getLeaderboard({ period, limit, offset });
      res.json({ success: true, leaderboard });
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch leaderboard' });
    }
  });

  // Admin Approval Workflow Routes

  // Get pending offers for approval
  app.get('/api/admin/offers/pending', adminAuthMiddleware, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await db.select({
        offer: offers,
        user: sql`json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'profileImageUrl', u.profile_image_url
        )`.as('user')
      })
        .from(offers)
        .leftJoin(users, eq(users.id, offers.userId)) // Corrected join alias
        .where(eq(offers.approvalStatus, 'pending'))
        .orderBy(desc(offers.createdAt))
        .limit(limit)
        .offset(offset);

      const pendingOffers = result.map((row: any) => ({ ...row.offer, user: row.user }));
      res.json({ success: true, offers: pendingOffers });
    } catch (error: any) {
      console.error('Error fetching pending offers:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch pending offers' });
    }
  });

  // Approve an offer
  app.post('/api/admin/offers/:id/approve', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const adminId = req.admin.id;

      const [offer] = await db.update(offers)
        .set({
          approvalStatus: 'approved',
          approvedBy: adminId,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(offers.id, id))
        .returning();

      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }

      res.json({ success: true, offer });
    } catch (error: any) {
      console.error('Error approving offer:', error);
      res.status(400).json({ error: error.message || 'Failed to approve offer' });
    }
  });

  // Reject an offer
  app.post('/api/admin/offers/:id/reject', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const adminId = req.admin.id;
      const { reason } = req.body;

      const [offer] = await db.update(offers)
        .set({
          approvalStatus: 'rejected',
          approvedBy: adminId,
          approvedAt: new Date(),
          rejectionReason: reason || 'No reason provided',
          updatedAt: new Date(),
        })
        .where(eq(offers.id, id))
        .returning();

      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }

      res.json({ success: true, offer });
    } catch (error: any) {
      console.error('Error rejecting offer:', error);
      res.status(400).json({ error: error.message || 'Failed to reject offer' });
    }
  });

  // Profile Completion Routes

  // Get user's profile completion status
  app.get('/api/profile/completion', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const status = await profileCompletionService.getCompletionStatus(principal.id);
      res.json({ success: true, ...status });
    } catch (error: any) {
      console.error('Error fetching completion status:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch status' });
    }
  });

  // Complete a profile section
  app.post('/api/profile/completion/:section', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { section } = req.params;
      const completion = await profileCompletionService.completeSection(
        principal.id,
        section as any,
        principal.tenantId
      );

      res.json({ success: true, completion });
    } catch (error: any) {
      console.error('Error completing section:', error);
      res.status(400).json({ error: error.message || 'Failed to complete section' });
    }
  });

  // Profile Wizard Routes

  // Update basic profile info
  app.post('/api/profile/basic-info', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { name, email, gender, dateOfBirth } = req.body;

      await db.update(users)
        .set({
          name: name || undefined,
          email: email || undefined,
          gender: gender || undefined,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(users.id, principal.id));

      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
  });

  // Complete profile wizard and award points
  app.post('/api/profile/complete-wizard', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { socialLinks } = req.body;

      // Update profile as complete
      await db.update(users)
        .set({
          profileComplete: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, principal.id));

      // Get profile_complete points config
      const [config] = await db.select()
        .from(pointsConfig)
        .where(and(
          eq(pointsConfig.action, 'profile_complete'),
          eq(pointsConfig.isActive, true)
        ));

      const pointsEarned = config?.points || 10;

      // Award points for completing profile
      await pointsService.creditPoints({
        userId: principal.id,
        amount: pointsEarned,
        type: 'profile_complete',
        description: 'Profile completion wizard completed',
        metadata: { socialLinks },
      });

      res.json({ 
        success: true, 
        message: 'Profile completed successfully',
        pointsEarned 
      });
    } catch (error: any) {
      console.error('Error completing wizard:', error);
      res.status(500).json({ error: error.message || 'Failed to complete wizard' });
    }
  });

  // ========================================
  // FILE UPLOAD ROUTES
  // ========================================

  // Configure multer for memory storage
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept only images
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    },
  });

  // Upload profile photo using Replit Object Storage (Google Cloud Storage SDK)
  app.post('/api/upload/profile-photo', upload.single('photo'), async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Validate actual file content using magic bytes (not just claimed mimetype)
      const fileType = await fileTypeFromBuffer(req.file.buffer);

      // List of allowed image types based on magic bytes
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      if (!fileType || !allowedImageTypes.includes(fileType.mime)) {
        console.warn('Rejected upload attempt:', {
          claimedMimetype: req.file.mimetype,
          actualMimetype: fileType?.mime || 'unknown',
          userId: principal.id
        });
        return res.status(400).json({ 
          error: 'Invalid file type. Only genuine image files are allowed.' 
        });
      }

      // Get safe extension from verified mimetype
      const mimeToExt: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp'
      };
      const safeExtension = mimeToExt[fileType.mime];

      // Sanitize principal ID to prevent directory traversal (whitelist alphanumeric, hyphens, underscores only)
      const safePrincipalId = principal.id.replace(/[^a-zA-Z0-9_-]/g, '');

      // Generate secure UUID-based filename (ignore user-provided filename)
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const filename = `${safePrincipalId}_${timestamp}_${randomId}${safeExtension}`;

      // Get the private object directory from environment
      const privateDir = process.env.PRIVATE_OBJECT_DIR || '/replit-objstore-f99ecc31-a513-406e-afc5-c84fcbc3d8c7/.private';
      const fullPath = `${privateDir}/profile-photos/${filename}`;

      // Parse the path to get bucket and object name
      const pathParts = fullPath.split('/').filter(p => p);
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join('/');

      // Upload to Google Cloud Storage using the SDK
      const { objectStorageClient } = await import('./objectStorage');
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      await file.save(req.file.buffer, {
        contentType: fileType.mime,
        metadata: {
          contentType: fileType.mime,
        },
      });

      // Return relative URL path
      const publicUrl = `/uploads/profile-photos/${filename}`;

      // Update user profile with new photo URL
      const [existingProfile] = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, principal.id));

      if (existingProfile) {
        // Update existing profile
        await db.update(userProfiles)
          .set({ 
            profilePhoto: publicUrl,
            updatedAt: new Date()
          })
          .where(eq(userProfiles.userId, principal.id));
      } else {
        // Create new profile with photo
        await db.insert(userProfiles).values({
          userId: principal.id,
          profilePhoto: publicUrl,
        });
      }

      res.json({ success: true, url: publicUrl });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: error.message || 'Failed to upload file' });
    }
  });

  // Serve uploaded profile photos
  app.get('/uploads/profile-photos/:filename', async (req, res) => {
    try {
      // Sanitize filename to prevent directory traversal
      const filename = path.basename(req.params.filename);

      // Validate filename format (userId_timestamp_randomId.ext)
      if (!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|webp)$/.test(filename)) {
        return res.status(400).json({ error: 'Invalid filename format' });
      }

      // Get the private object directory from environment
      const privateDir = process.env.PRIVATE_OBJECT_DIR || '/replit-objstore-f99ecc31-a513-406e-afc5-c84fcbc3d8c7/.private';
      const fullPath = `${privateDir}/profile-photos/${filename}`;

      // Parse the path to get bucket and object name
      const pathParts = fullPath.split('/').filter(p => p);
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join('/');

      // Get file from Google Cloud Storage using the SDK
      const { objectStorageClient } = await import('./objectStorage');
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Get file metadata
      const [metadata] = await file.getMetadata();

      // Set appropriate headers
      res.set({
        'Content-Type': metadata.contentType || 'image/jpeg',
        'Content-Length': metadata.size,
        'Cache-Control': 'private, max-age=3600',
      });

      // Stream the file to the response
      const stream = file.createReadStream();

      stream.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error streaming file' });
        }
      });

      stream.pipe(res);
    } catch (error: any) {
      console.error('Error serving file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to serve file' });
      }
    }
  });

  // ========================================
  // ACCOUNT MANAGEMENT & PROFILE ROUTES
  // ========================================

  // Get user basic info (name, email)
  app.get('/api/user', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Fetch user from whatsappUsers table
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, principal.id));

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        name: user.name || '',
        email: user.email || ''
      });
    } catch (error: any) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch user' });
    }
  });

  // Get user detailed profile
  app.get('/api/account/profile', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const [profile] = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, principal.id));

      res.json(profile || null);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch profile' });
    }
  });

  // Update user detailed profile
  app.patch('/api/account/profile', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Convert dateOfBirth string to Date if present
      const requestData = { ...req.body, userId: principal.id };
      if (requestData.dateOfBirth && typeof requestData.dateOfBirth === 'string') {
        requestData.dateOfBirth = new Date(requestData.dateOfBirth);
      }

      const profileData = insertUserProfileSchema.parse(requestData);

      // Calculate profile completion percentage
      const fieldWeights = await db.select()
        .from(profileFieldWeights)
        .where(eq(profileFieldWeights.tabSection, 'personal'));

      let totalWeight = 0;
      let completedWeight = 0;

      for (const weight of fieldWeights) {
        totalWeight += weight.weightPercentage;

        // Check if field is filled
        const fieldValue = (profileData as any)[weight.fieldName];
        const isFilled = fieldValue && 
          (typeof fieldValue === 'string' ? fieldValue.trim() !== '' : 
           Array.isArray(fieldValue) ? fieldValue.length > 0 : 
           true);

        if (isFilled) {
          completedWeight += weight.weightPercentage;
        }
      }

      const completionPercentage = totalWeight > 0 
        ? Math.round((completedWeight / totalWeight) * 100) 
        : 0;

      // Check if profile exists
      const [existing] = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, principal.id));

      if (existing) {
        // Update existing profile
        await db.update(userProfiles)
          .set({ 
            ...profileData, 
            profileCompletionPercentage: completionPercentage,
            updatedAt: new Date() 
          })
          .where(eq(userProfiles.userId, principal.id));
      } else {
        // Create new profile
        await db.insert(userProfiles).values({
          ...profileData,
          profileCompletionPercentage: completionPercentage
        });
      }

      res.json({ success: true, message: 'Profile updated successfully', completionPercentage });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
  });

  // Check username availability
  app.get('/api/account/username/check', async (req: any, res) => {
    try {
      const { username } = req.query;

      if (!username || typeof username !== 'string' || username.length < 3) {
        return res.json({ available: false, error: 'Username must be at least 3 characters' });
      }

      const [existing] = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.username, username));

      res.json({ available: !existing });
    } catch (error: any) {
      console.error('Error checking username:', error);
      res.status(500).json({ error: error.message || 'Failed to check username' });
    }
  });

  // Change username
  app.patch('/api/account/username', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { username } = req.body;
      if (!username || username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }

      // Check if username is already taken
      const [existing] = await db.select()
        .from(userProfiles)
        .where(and(
          eq(userProfiles.username, username),
          not(eq(userProfiles.userId, principal.id))
        ));

      if (existing) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Update or create profile with new username
      const [profile] = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, principal.id));

      if (profile) {
        await db.update(userProfiles)
          .set({ username, updatedAt: new Date() })
          .where(eq(userProfiles.userId, principal.id));
      } else {
        await db.insert(userProfiles).values({ userId: principal.id, username });
      }

      res.json({ success: true, message: 'Username updated successfully' });
    } catch (error: any) {
      console.error('Error updating username:', error);
      res.status(500).json({ error: error.message || 'Failed to update username' });
    }
  });

  // Change password
  app.patch('/api/account/password', async (req: any, res) => {
    try {
      console.log('DEBUG: Password change - checking session:', {
        hasWytpass: !!(req.session as any)?.wytpassPrincipal,
        hasAdminUser: !!(req.session as any)?.adminUser,
        hasHubAdmin: !!(req.session as any)?.hubAdminUser,
        hasUser: !!req.session?.user
      });
      const principal = await getPrincipal(req);
      console.log('DEBUG: Password change - principal:', principal ? 'found' : 'null');
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { currentPassword, newPassword } = req.body;
      if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      // Get user
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, principal.id));

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // If user has a password, verify current password
      if (user.passwordHash) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password is required' });
        }

        const bcrypt = await import('bcryptjs');
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
      }
      // If user doesn't have a password (OAuth users), allow setting one without current password

      // Hash new password
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await db.update(users)
        .set({ passwordHash: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, principal.id));

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      res.status(500).json({ error: error.message || 'Failed to update password' });
    }
  });

  // ========================================
  // BUCKET LIST API ROUTES
  // ========================================

  // Get user's bucket list items
  app.get('/api/bucket-list', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const items = await db.select()
        .from(bucketList)
        .where(eq(bucketList.userId, principal.id))
        .orderBy(desc(bucketList.createdAt));

      res.json({ success: true, items });
    } catch (error: any) {
      console.error('Error fetching bucket list:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch bucket list' });
    }
  });

  // Get public bucket list items from OTHER users for WytMatch
  app.get('/api/bucket-list/public', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get public bucket list items from OTHER users (not current user)
      const items = await db.select({
        id: bucketList.id,
        title: bucketList.title,
        description: bucketList.description,
        category: bucketList.category,
        priority: bucketList.priority,
        status: bucketList.status,
        targetDate: bucketList.targetDate,
        createdAt: bucketList.createdAt,
        userId: bucketList.userId,
      })
        .from(bucketList)
        .where(and(
          eq(bucketList.isPublic, true),
          not(eq(bucketList.userId, principal.id))
        ))
        .orderBy(desc(bucketList.createdAt));

      res.json({ success: true, items });
    } catch (error: any) {
      console.error('Error fetching public bucket list:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch public bucket list' });
    }
  });

  // Create bucket list item
  app.post('/api/bucket-list', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const itemData = insertBucketListSchema.parse({ ...req.body, userId: principal.id });

      const [newItem] = await db.insert(bucketList)
        .values(itemData)
        .returning();

      res.json({ success: true, item: newItem });
    } catch (error: any) {
      console.error('Error creating bucket list item:', error);
      res.status(500).json({ error: error.message || 'Failed to create bucket list item' });
    }
  });

  // Update bucket list item
  app.patch('/api/bucket-list/:id', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      // Verify ownership
      const [existing] = await db.select()
        .from(bucketList)
        .where(and(
          eq(bucketList.id, id),
          eq(bucketList.userId, principal.id)
        ));

      if (!existing) {
        return res.status(404).json({ error: 'Bucket list item not found' });
      }

      // Handle completion
      const updateData: any = { ...req.body, updatedAt: new Date() };
      if (req.body.status === 'completed' && !existing.completedAt) {
        updateData.completedAt = new Date();
      } else if (req.body.status !== 'completed') {
        updateData.completedAt = null;
      }

      const [updatedItem] = await db.update(bucketList)
        .set(updateData)
        .where(eq(bucketList.id, id))
        .returning();

      res.json({ success: true, item: updatedItem });
    } catch (error: any) {
      console.error('Error updating bucket list item:', error);
      res.status(500).json({ error: error.message || 'Failed to update bucket list item' });
    }
  });

  // Delete bucket list item
  app.delete('/api/bucket-list/:id', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      // Verify ownership and delete
      const deleted = await db.delete(bucketList)
        .where(and(
          eq(bucketList.id, id),
          eq(bucketList.userId, principal.id)
        ))
        .returning();

      if (!deleted.length) {
        return res.status(404).json({ error: 'Bucket list item not found' });
      }

      res.json({ success: true, message: 'Bucket list item deleted' });
    } catch (error: any) {
      console.error('Error deleting bucket list item:', error);
      res.status(500).json({ error: error.message || 'Failed to delete bucket list item' });
    }
  });

  // ========================================
  // DATASET API ROUTES (for frontend dropdowns)
  // ========================================

  // Get dataset items by collection key
  app.get('/api/datasets/:key', async (req: any, res) => {
    try {
      const { key } = req.params;

      // Find collection by key
      const [collection] = await db.select()
        .from(datasetCollections)
        .where(eq(datasetCollections.key, key));

      if (!collection) {
        return res.status(404).json({ error: 'Dataset not found' });
      }

      // Get items for this collection
      const items = await db.select()
        .from(datasetItems)
        .where(eq(datasetItems.collectionId, collection.id))
        .orderBy(asc(datasetItems.sortOrder), asc(datasetItems.label));

      res.json({ items });
    } catch (error: any) {
      console.error('Error fetching dataset:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch dataset' });
    }
  });

  // ========================================
  // USER NEEDS & OFFERS ROUTES
  // ========================================

  // Get user's needs
  app.get('/api/needs/my-needs', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const needs = await db.select()
        .from(userNeeds)
        .where(eq(userNeeds.userId, principal.id))
        .orderBy(desc(userNeeds.createdAt));

      res.json(needs);
    } catch (error: any) {
      console.error('Error fetching needs:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch needs' });
    }
  });

  // Create a need
  app.post('/api/needs', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const needData = insertUserNeedSchema.parse({ ...req.body, userId: principal.id });

      const [need] = await db.insert(userNeeds)
        .values(needData)
        .returning();

      res.json(need);
    } catch (error: any) {
      console.error('Error creating need:', error);
      res.status(500).json({ error: error.message || 'Failed to create need' });
    }
  });

  // Get user's offers
  app.get('/api/offers/my-offers', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const userOffersList = await db.select()
        .from(userOffers)
        .where(eq(userOffers.userId, principal.id))
        .orderBy(desc(userOffers.createdAt));

      res.json(userOffersList);
    } catch (error: any) {
      console.error('Error fetching offers:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch offers' });
    }
  });

  // Create an offer
  app.post('/api/offers', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const offerData = insertUserOfferSchema.parse({ ...req.body, userId: principal.id });

      const [offer] = await db.insert(userOffers)
        .values(offerData)
        .returning();

      res.json(offer);
    } catch (error: any) {
      console.error('Error creating offer:', error);
      res.status(500).json({ error: error.message || 'Failed to create offer' });
    }
  });

  // WytLife Application Routes

  // Submit WytLife application
  app.post('/api/wytlife/apply', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      const data = req.body;

      // Validate required fields
      if (!data.fullName || !data.whyJoin) {
        return res.status(400).json({ error: 'Full name and why join are required' });
      }

      // Create application record
      const [application] = await db.insert(wytLifeApplications).values({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        country: data.country,
        occupation: data.occupation,
        organization: data.organization,
        whyJoin: data.whyJoin,
        areasOfInterest: data.areasOfInterest || [],
        status: 'pending',
        userId: principal?.id || null,
        pointsAwarded: 0,
        tenantId: principal?.tenantId || null,
      }).returning();

      // Award bonus points if user is authenticated
      if (principal?.id) {
        const bonusPoints = 25;
        await pointsService.creditPoints({
          userId: principal.id,
          amount: bonusPoints,
          type: 'wytlife_application',
          description: 'Bonus points for WytLife application',
          metadata: { applicationId: application.id },
        });

        // Update application with points awarded
        await db.update(wytLifeApplications)
          .set({ pointsAwarded: bonusPoints })
          .where(eq(wytLifeApplications.id, application.id));
      }

      res.json({ 
        success: true, 
        message: 'Application submitted successfully',
        pointsAwarded: principal?.id ? 25 : 0,
        application 
      });
    } catch (error: any) {
      console.error('Error submitting WytLife application:', error);
      res.status(500).json({ error: error.message || 'Failed to submit application' });
    }
  });

  // Get WytLife applications (admin only)
  app.get('/api/wytlife/applications', async (req: any, res) => {
    try {
      const principal = await getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Check if user is admin/super admin
      const user = await db.select()
        .from(users)
        .where(eq(users.id, principal.id))
        .limit(1);

      if (!user[0]?.isSuperAdmin && user[0]?.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const status = req.query.status as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      let query = db.select().from(wytLifeApplications);

      if (status) {
        query = query.where(eq(wytLifeApplications.status, status));
      }

      const applications = await query
        .orderBy(desc(wytLifeApplications.createdAt))
        .limit(limit)
        .offset(offset);

      res.json({ success: true, applications });
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch applications' });
    }
  });

  // ========================================
  // END WYTWALL MARKETPLACE ROUTES
  // ========================================

  // ========================================
  // WYTLIFE SEO/SMO ROUTE HANDLER (Production Only)
  // ========================================

  // Only apply server-side meta tag injection in production
  // In development, let Vite handle routing and the client-side router will work
  if (process.env.NODE_ENV === 'production') {
    app.get('/wytlife', async (_req, res, next) => {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');

        const indexPath = path.resolve(process.cwd(), 'dist', 'public', 'index.html');
        let html = await fs.readFile(indexPath, 'utf-8');

        // Replace meta tags for WytLife-specific SEO/SMO
        html = html.replace(
          '<title>WytNet - Multi-Tenant SaaS Platform | Free Assessment Tools</title>',
          '<title>WytLife - Create Your MyClone. Live Forever | Life Continuity Platform</title>'
        );
        html = html.replace(
          '<meta name="description" content="Build scalable SaaS applications with WytNet\'s multi-tenant platform. Start with free assessment tools, productivity suites, and specialized business utilities." />',
          '<meta name="description" content="WytLife is a revolutionary life continuity platform powered by Soul Engine. Create your MyClone and achieve digital immortality. Your consciousness, memories, and personality live forever." />'
        );
        html = html.replace(
          '<meta property="og:title" content="WytNet - Multi-Tenant SaaS Platform" />',
          '<meta property="og:title" content="WytLife - Create Your MyClone. Live Forever" />'
        );
        html = html.replace(
          '<meta property="og:description" content="The ultimate platform for building, managing, and scaling SaaS applications with free productivity tools." />',
          '<meta property="og:description" content="Revolutionary life continuity platform powered by Soul Engine. Create your digital immortality with MyClone technology." />'
        );
        html = html.replace(
          '<meta property="og:image" content="https://wytnet.com/og-banner.png" />',
          '<meta property="og:image" content="https://wytnet.com/attached_assets/IMG-20250927-WA0258_1759886837095.jpg" />'
        );
        html = html.replace(
          '<meta property="og:url" content="https://wytnet.com/" />',
          '<meta property="og:url" content="https://wytnet.com/wytlife" />'
        );
        html = html.replace(
          '<meta property="twitter:title" content="WytNet - Multi-Tenant SaaS Platform" />',
          '<meta property="twitter:title" content="WytLife - Create Your MyClone. Live Forever" />'
        );
        html = html.replace(
          '<meta property="twitter:description" content="Build scalable SaaS applications with our multi-tenant platform. Free assessment tools available." />',
          '<meta property="twitter:description" content="Revolutionary life continuity platform powered by Soul Engine. Create your digital immortality with MyClone technology." />'
        );
        html = html.replace(
          '<meta property="twitter:image" content="https://wytnet.com/og-banner.png" />',
          '<meta property="twitter:image" content="https://wytnet.com/attached_assets/IMG-20250927-WA0258_1759886837095.jpg" />'
        );
        html = html.replace(
          '<meta property="twitter:url" content="https://wytnet.com/" />',
          '<meta property="twitter:url" content="https://wytnet.com/wytlife" />'
        );

        res.set('Content-Type', 'text/html').send(html);
      } catch (error) {
        next(error);
      }
    });
  }

  // ========================================
  // END WYTLIFE SEO/SMO ROUTE HANDLER
  // ========================================

  // ========================================
  // AI APP BUILDER ROUTES
  // ========================================

  // Get user's app builder projects
  app.get('/api/ai-builder/projects', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const projects = await db.select()
        .from(aiAppProjects)
        .where(eq(aiAppProjects.ownerId, principal.id))
        .orderBy(desc(aiAppProjects.createdAt));

      res.json({ projects });
    } catch (error) {
      console.error('Error fetching AI Builder projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  // Create new app builder project
  app.post('/api/ai-builder/projects/create', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { name, slug, description } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({ error: 'Project name is required' });
      }

      // Create new project
      const [newProject] = await db.insert(aiAppProjects).values({
        ownerId: principal.id,
        name: name.trim(),
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
        description: description?.trim() || '',
        status: 'draft',
        accessLevel: 'super_admin',
      }).returning();

      res.json({ 
        success: true,
        project: newProject 
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  // Chat with AI to generate app code
  app.post('/api/ai-builder/chat', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!aiService.isReady()) {
        return res.status(503).json({ 
          error: 'AI service is not available. Please check OpenAI API configuration.' 
        });
      }

      const { message, projectId, conversationHistory } = req.body;

      if (!message?.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Build WytNet context for AI
      const wytnetContext = `
WytNet Framework Context:
- Database: PostgreSQL with Drizzle ORM (shared/schema.ts)
- Backend: Express.js TypeScript (server/routes.ts)
- Frontend: React 18 + Vite (client/src/)
- UI: shadcn/ui components + Tailwind CSS
- Auth: WytPass (Google OAuth, Email OTP, Email/Password) - already configured
- File Structure: Follow existing patterns
- All apps must run within wytnet.com domain

CONSTRAINTS:
- You CANNOT change: database type, auth system, UI framework, language
- You CAN ONLY: create new tables, add API routes, create UI pages using existing components
- Always use existing utilities and follow established patterns
`;

      // Build conversation messages
      const messages = [
        { role: 'system' as const, content: wytnetContext },
        ...(conversationHistory || []).slice(-5).map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user' as const, content: message }
      ];

      // Get AI response
      const aiResponse = await aiService.chat(messages, {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000
      });

      const responseText = aiResponse.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

      // Check if user is asking to create a new project
      const createProjectKeywords = ['create', 'build', 'make', 'new app', 'inventory', 'crm', 'management'];
      const isCreatingProject = !projectId && createProjectKeywords.some(kw => message.toLowerCase().includes(kw));

      let newProjectId: string | null = null;
      let newProjectName: string | null = null;

      if (isCreatingProject && message.length > 20) {
        // Extract app name from user message (simple heuristic)
        const appNameMatch = message.match(/(?:create|build|make)\s+(?:a|an)?\s*([a-zA-Z\s]+?)(?:\s+app|\s+system|$)/i);
        const extractedName = appNameMatch?.[1]?.trim() || 'New App';
        const slug = extractedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();

        // Create new project
        const [newProject] = await db.insert(aiAppProjects).values({
          ownerId: principal.id,
          name: extractedName,
          slug,
          description: message.substring(0, 200),
          status: 'draft',
          accessLevel: 'super_admin',
        }).returning();

        newProjectId = newProject.id;
        newProjectName = newProject.name;

        // Create initial conversation
        await db.insert(aiChatConversations).values({
          projectId: newProjectId,
          userId: principal.id,
          title: `${extractedName} - Initial Planning`,
          messages: JSON.stringify([
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: responseText, timestamp: new Date().toISOString() }
          ]),
          totalMessages: 2
        });
      }

      res.json({
        response: responseText,
        projectCreated: !!newProjectId,
        projectId: newProjectId,
        projectName: newProjectName
      });
    } catch (error) {
      console.error('Error in AI chat:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to process chat message' 
      });
    }
  });

  // Update app builder project
  app.patch('/api/ai-builder/projects/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { name, description, status } = req.body;

      // Verify project ownership
      const [existingProject] = await db.select()
        .from(aiAppProjects)
        .where(
          and(
            eq(aiAppProjects.id, id),
            eq(aiAppProjects.ownerId, principal.id)
          )
        )
        .limit(1);

      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Update project
      const updateData: any = {
        updatedAt: new Date()
      };

      if (name?.trim()) updateData.name = name.trim();
      if (description !== undefined) updateData.description = description?.trim() || '';
      if (status) updateData.status = status;

      const [updatedProject] = await db.update(aiAppProjects)
        .set(updateData)
        .where(eq(aiAppProjects.id, id))
        .returning();

      res.json({ 
        success: true,
        project: updatedProject 
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  });

  // Delete app builder project
  app.delete('/api/ai-builder/projects/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      // Verify project ownership
      const [existingProject] = await db.select()
        .from(aiAppProjects)
        .where(
          and(
            eq(aiAppProjects.id, id),
            eq(aiAppProjects.ownerId, principal.id)
          )
        )
        .limit(1);

      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Delete project (cascades to conversations and generated code)
      await db.delete(aiAppProjects)
        .where(eq(aiAppProjects.id, id));

      res.json({ 
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });

  // Get specific project details
  app.get('/api/ai-builder/projects/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      const [project] = await db.select()
        .from(aiAppProjects)
        .where(
          and(
            eq(aiAppProjects.id, id),
            eq(aiAppProjects.ownerId, principal.id)
          )
        )
        .limit(1);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Get conversations for this project
      const conversations = await db.select()
        .from(aiChatConversations)
        .where(eq(aiChatConversations.projectId, id))
        .orderBy(desc(aiChatConversations.createdAt));

      // Get generated code for this project
      const generatedCode = await db.select()
        .from(aiGeneratedCode)
        .where(eq(aiGeneratedCode.projectId, id))
        .orderBy(desc(aiGeneratedCode.createdAt));

      res.json({
        project,
        conversations,
        generatedCode
      });
    } catch (error) {
      console.error('Error fetching project details:', error);
      res.status(500).json({ error: 'Failed to fetch project details' });
    }
  });

  // ========================================
  // END AI APP BUILDER ROUTES
  // ========================================

  // ========================================
  // APPS ADMIN ROUTES
  // ========================================

  // Get all apps with plan counts and module counts for pricing configuration
  app.get('/api/admin/pricing/apps', adminAuthMiddleware, async (req: any, res) => {
    try {
      const apps = await db.select()
        .from(appsRegistry)
        .orderBy(appsRegistry.name);

      // Get plan counts and module counts for each app
      const appsWithCounts = await Promise.all(
        apps.map(async (app) => {
          const planCount = await db.select({ count: sql<number>`count(*)::int` })
            .from(pricingPlans)
            .where(eq(pricingPlans.appId, app.id));

          const moduleCount = await db.select({ count: sql<number>`count(*)::int` })
            .from(appModules)
            .where(eq(appModules.appId, app.id));

          return {
            ...app,
            planCount: planCount[0]?.count || 0,
            moduleCount: moduleCount[0]?.count || 0,
          };
        })
      );

      res.json({ success: true, apps: appsWithCounts });
    } catch (error) {
      console.error('Error fetching apps:', error);
      res.status(500).json({ error: 'Failed to fetch apps' });
    }
  });

  // Update app properties (Active status, Promo card, etc.)
  app.patch('/api/admin/apps/:appId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { appId } = req.params;
      const updateData: any = {};

      // Allow updating specific fields
      if (req.body.isActive !== undefined) {
        updateData.isActive = req.body.isActive;
      }
      if (req.body.metadata !== undefined) {
        updateData.metadata = req.body.metadata;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      await db.update(appsRegistry)
        .set(updateData)
        .where(eq(appsRegistry.id, appId));

      res.json({ success: true, message: 'App updated successfully' });
    } catch (error) {
      console.error('Error updating app:', error);
      res.status(500).json({ error: 'Failed to update app' });
    }
  });

  // Get pricing plans for a specific app
  app.get('/api/admin/pricing/plans/:appId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { appId } = req.params;

      // Get all plans for the app
      const plans = await db.select()
        .from(pricingPlans)
        .where(eq(pricingPlans.appId, appId))
        .orderBy(pricingPlans.sortOrder);

      // Fetch pricing types for each plan
      const plansWithTypes = await Promise.all(
        plans.map(async (plan) => {
          const types = await db.select()
            .from(pricingPlanTypes)
            .where(eq(pricingPlanTypes.pricingPlanId, plan.id));

          return {
            ...plan,
            pricingTypes: types,
          };
        })
      );

      res.json({ success: true, plans: plansWithTypes });
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      res.status(500).json({ error: 'Failed to fetch pricing plans' });
    }
  });

  // Create new pricing plan
  app.post('/api/admin/pricing/plans', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { appId, planName, planBatch, basePrice, currency, pricingTypes } = req.body;

      if (!appId || !planName) {
        return res.status(400).json({ error: 'App ID and plan name are required' });
      }

      // Create the pricing plan
      const [newPlan] = await db.insert(pricingPlans)
        .values({
          appId,
          planName,
          planBatch: planBatch || '',
          basePrice: basePrice || '0',
          currency: currency || 'INR',
          isActive: true,
        })
        .returning();

      // Create pricing types if provided
      if (pricingTypes && Array.isArray(pricingTypes) && pricingTypes.length > 0) {
        await db.insert(pricingPlanTypes)
          .values(
            pricingTypes.map((pt: any) => ({
              pricingPlanId: newPlan.id,
              type: pt.type,
              price: pt.price || '0',
              billingInterval: pt.billingInterval,
              trialDays: pt.trialDays || 0,
              isActive: true,
            }))
          );
      }

      res.json({
        success: true,
        message: 'Pricing plan created successfully',
        plan: newPlan,
      });
    } catch (error) {
      console.error('Error creating pricing plan:', error);
      res.status(500).json({ error: 'Failed to create pricing plan' });
    }
  });

  // Update pricing plan
  app.patch('/api/admin/pricing/plans/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { planName, planBatch, basePrice, pricingTypes } = req.body;

      // Update the plan
      const [updatedPlan] = await db.update(pricingPlans)
        .set({
          planName,
          planBatch,
          basePrice,
          updatedAt: new Date(),
        })
        .where(eq(pricingPlans.id, id))
        .returning();

      if (!updatedPlan) {
        return res.status(404).json({ error: 'Pricing plan not found' });
      }

      // Delete existing pricing types and recreate
      if (pricingTypes && Array.isArray(pricingTypes)) {
        await db.delete(pricingPlanTypes)
          .where(eq(pricingPlanTypes.pricingPlanId, id));

        if (pricingTypes.length > 0) {
          await db.insert(pricingPlanTypes)
            .values(
              pricingTypes.map((pt: any) => ({
                pricingPlanId: id,
                type: pt.type,
                price: pt.price || '0',
                billingInterval: pt.billingInterval,
                trialDays: pt.trialDays || 0,
                isActive: true,
              }))
            );
        }
      }

      res.json({
        success: true,
        message: 'Pricing plan updated successfully',
        plan: updatedPlan,
      });
    } catch (error) {
      console.error('Error updating pricing plan:', error);
      res.status(500).json({ error: 'Failed to update pricing plan' });
    }
  });

  // Delete pricing plan
  app.delete('/api/admin/pricing/plans/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      // Delete pricing plan (cascade will delete pricing types)
      await db.delete(pricingPlans)
        .where(eq(pricingPlans.id, id));

      res.json({
        success: true,
        message: 'Pricing plan deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      res.status(500).json({ error: 'Failed to delete pricing plan' });
    }
  });

  // ========================================
  // END PRICING PLANS ADMIN ROUTES
  // ========================================

  // ========================================
  // APP FEATURES & PLAN FEATURE ACCESS ROUTES
  // ========================================

  // Get all features for a specific app
  app.get('/api/admin/features/:appId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { appId } = req.params;

      const features = await db.select()
        .from(appFeatures)
        .where(eq(appFeatures.appId, appId))
        .orderBy(appFeatures.sortOrder, appFeatures.name);

      res.json({ success: true, features });
    } catch (error) {
      console.error('Error fetching app features:', error);
      res.status(500).json({ error: 'Failed to fetch app features' });
    }
  });

  // Create new app feature
  app.post('/api/admin/features', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { appId, name, description, featureKey, category, hasQuota, defaultQuota, quotaUnit } = req.body;

      if (!appId || !name || !featureKey) {
        return res.status(400).json({ error: 'App ID, name, and feature key are required' });
      }

      const [newFeature] = await db.insert(appFeatures)
        .values({
          appId,
          name,
          description,
          featureKey,
          category,
          hasQuota: hasQuota || false,
          defaultQuota: defaultQuota || null,
          quotaUnit: quotaUnit || null,
          isActive: true,
        })
        .returning();

      res.json({
        success: true,
        message: 'Feature created successfully',
        feature: newFeature,
      });
    } catch (error: any) {
      console.error('Error creating feature:', error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ error: 'Feature key already exists for this app' });
      } else {
        res.status(500).json({ error: 'Failed to create feature' });
      }
    }
  });

  // Update app feature
  app.patch('/api/admin/features/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { name, description, category, hasQuota, defaultQuota, quotaUnit, isActive } = req.body;

      const [updatedFeature] = await db.update(appFeatures)
        .set({
          name,
          description,
          category,
          hasQuota,
          defaultQuota,
          quotaUnit,
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(appFeatures.id, id))
        .returning();

      if (!updatedFeature) {
        return res.status(404).json({ error: 'Feature not found' });
      }

      res.json({
        success: true,
        message: 'Feature updated successfully',
        feature: updatedFeature,
      });
    } catch (error) {
      console.error('Error updating feature:', error);
      res.status(500).json({ error: 'Failed to update feature' });
    }
  });

  // Delete app feature
  app.delete('/api/admin/features/:id', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      await db.delete(appFeatures)
        .where(eq(appFeatures.id, id));

      res.json({
        success: true,
        message: 'Feature deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting feature:', error);
      res.status(500).json({ error: 'Failed to delete feature' });
    }
  });

  // Get features assigned to a specific plan
  app.get('/api/admin/plans/:planId/features', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { planId } = req.params;

      // Get plan with app info
      const plan = await db.select()
        .from(pricingPlans)
        .where(eq(pricingPlans.id, planId))
        .limit(1);

      if (!plan || plan.length === 0) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      // Get all features for the app
      const allFeatures = await db.select()
        .from(appFeatures)
        .where(eq(appFeatures.appId, plan[0].appId))
        .orderBy(appFeatures.sortOrder, appFeatures.name);

      // Get assigned features for this plan
      const assignedFeatures = await db.select({
        id: planFeatureAccess.id,
        featureId: planFeatureAccess.featureId,
        isEnabled: planFeatureAccess.isEnabled,
        hasCustomQuota: planFeatureAccess.hasCustomQuota,
        customQuota: planFeatureAccess.customQuota,
      })
        .from(planFeatureAccess)
        .where(eq(planFeatureAccess.pricingPlanId, planId));

      // Map assigned features
      const assignedMap = new Map(assignedFeatures.map(af => [af.featureId, af]));

      const featuresWithAccess = allFeatures.map(feature => ({
        ...feature,
        access: assignedMap.get(feature.id) || null,
      }));

      res.json({ success: true, features: featuresWithAccess });
    } catch (error) {
      console.error('Error fetching plan features:', error);
      res.status(500).json({ error: 'Failed to fetch plan features' });
    }
  });

  // Update plan feature access (bulk update)
  app.patch('/api/admin/plans/:planId/features', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { planId } = req.params;
      const { features } = req.body; // Array of { featureId, isEnabled, hasCustomQuota, customQuota }

      if (!Array.isArray(features)) {
        return res.status(400).json({ error: 'Features array is required' });
      }

      // Delete existing plan feature access
      await db.delete(planFeatureAccess)
        .where(eq(planFeatureAccess.pricingPlanId, planId));

      // Insert new feature access (only for enabled features)
      const enabledFeatures = features.filter(f => f.isEnabled);

      if (enabledFeatures.length > 0) {
        await db.insert(planFeatureAccess)
          .values(
            enabledFeatures.map((f: any) => ({
              pricingPlanId: planId,
              featureId: f.featureId,
              isEnabled: true,
              hasCustomQuota: f.hasCustomQuota || false,
              customQuota: f.customQuota || null,
            }))
          );
      }

      res.json({
        success: true,
        message: 'Plan features updated successfully',
      });
    } catch (error) {
      console.error('Error updating plan features:', error);
      res.status(500).json({ error: 'Failed to update plan features' });
    }
  });

  // ========================================
  // END APP FEATURES & PLAN FEATURE ACCESS ROUTES
  // ========================================

  // ========================================
  // PRICING MATRIX API (Unified Features & Plans)
  // ========================================

  // Get full pricing matrix for an app (plans + features + access mappings)
  app.get('/api/admin/pricing/matrix/:appId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { appId } = req.params;

      // Get all plans for the app with their pricing types
      const plans = await db.select()
        .from(pricingPlans)
        .where(eq(pricingPlans.appId, appId))
        .orderBy(pricingPlans.sortOrder);

      // Get pricing types for all plans
      const plansWithTypes = await Promise.all(
        plans.map(async (plan) => {
          const types = await db.select()
            .from(pricingPlanTypes)
            .where(eq(pricingPlanTypes.pricingPlanId, plan.id));

          return {
            ...plan,
            pricingTypes: types,
          };
        })
      );

      // Get all features for the app
      const features = await db.select()
        .from(appFeatures)
        .where(eq(appFeatures.appId, appId))
        .orderBy(appFeatures.sortOrder, appFeatures.name);

      // Get all plan-feature access mappings for this app
      const planIds = plans.map(p => p.id);
      const featureAccess = planIds.length > 0 
        ? await db.select()
            .from(planFeatureAccess)
            .where(inArray(planFeatureAccess.pricingPlanId, planIds))
        : [];

      // Build access matrix map: { planId: { featureId: access } }
      const accessMatrix: Record<string, Record<string, any>> = {};
      featureAccess.forEach((access) => {
        if (!accessMatrix[access.pricingPlanId]) {
          accessMatrix[access.pricingPlanId] = {};
        }
        accessMatrix[access.pricingPlanId][access.featureId] = {
          isEnabled: access.isEnabled,
          hasCustomQuota: access.hasCustomQuota,
          customQuota: access.customQuota,
        };
      });

      res.json({
        success: true,
        plans: plansWithTypes,
        features,
        accessMatrix,
      });
    } catch (error) {
      console.error('Error fetching pricing matrix:', error);
      res.status(500).json({ error: 'Failed to fetch pricing matrix' });
    }
  });

  // Save full pricing matrix (plans with pricing types + feature access)
  app.post('/api/admin/pricing/matrix/:appId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const principal = await getAdminPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { appId } = req.params;
      const { plans } = req.body; // Array of plan updates with pricing types and feature access

      if (!Array.isArray(plans)) {
        return res.status(400).json({ error: 'Plans array is required' });
      }

      // Process each plan update
      for (const planUpdate of plans) {
        const { planId, isActive, pricingTypes, featureAccess } = planUpdate;

        if (!planId) continue;

        // Update plan active status if provided
        if (isActive !== undefined) {
          await db.update(pricingPlans)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(pricingPlans.id, planId));
        }

        // Update pricing types if provided
        if (pricingTypes && Array.isArray(pricingTypes)) {
          // Delete existing pricing types
          await db.delete(pricingPlanTypes)
            .where(eq(pricingPlanTypes.pricingPlanId, planId));

          // Insert new pricing types (only non-empty ones)
          const validTypes = pricingTypes.filter(pt => pt.type && pt.price !== undefined);
          if (validTypes.length > 0) {
            await db.insert(pricingPlanTypes)
              .values(
                validTypes.map((pt: any) => ({
                  pricingPlanId: planId,
                  type: pt.type,
                  price: pt.price || '0',
                  billingInterval: pt.billingInterval || '',
                  trialDays: pt.trialDays || 0,
                  usageLimit: pt.usageLimit || null,
                  isActive: true,
                }))
              );
          }
        }

        // Update feature access if provided
        if (featureAccess && typeof featureAccess === 'object') {
          // Delete existing feature access for this plan
          await db.delete(planFeatureAccess)
            .where(eq(planFeatureAccess.pricingPlanId, planId));

          // Insert new feature access (only enabled features)
          const enabledFeatures = Object.entries(featureAccess)
            .filter(([_, access]: [string, any]) => access.isEnabled)
            .map(([featureId, access]: [string, any]) => ({
              pricingPlanId: planId,
              featureId,
              isEnabled: true,
              hasCustomQuota: access.hasCustomQuota || false,
              customQuota: access.customQuota || null,
            }));

          if (enabledFeatures.length > 0) {
            await db.insert(planFeatureAccess)
              .values(enabledFeatures);
          }
        }
      }

      res.json({
        success: true,
        message: 'Pricing matrix updated successfully',
      });
    } catch (error) {
      console.error('Error updating pricing matrix:', error);
      res.status(500).json({ error: 'Failed to update pricing matrix' });
    }
  });

  // ========================================
  // END PRICING MATRIX API
  // ========================================

  // ========================================
  // JUNCTION TABLE MANAGEMENT API
  // Manage many-to-many relationships: Apps↔Modules, Modules↔Features, Hubs↔Modules, Hubs↔Apps
  // ========================================

  // Import junction tables
  const { 
    appModules, 
    moduleFeatures, 
    hubModules, 
    hubApps 
  } = await import("@shared/schema");

  // ============ APP MODULES ============

  // Get all modules linked to an app
  app.get('/api/admin/app-modules/:appId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { appId } = req.params;

      const modules = await db.select()
        .from(appModules)
        .where(eq(appModules.appId, appId));

      res.json({ success: true, data: modules });
    } catch (error) {
      console.error('Error fetching app modules:', error);
      res.status(500).json({ error: 'Failed to fetch app modules' });
    }
  });

  // Link a module to an app
  app.post('/api/admin/app-modules', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { appId, moduleId, isRequired = true, version = null, config = {}, sortOrder = 0, metadata = {} } = req.body;

      if (!appId || !moduleId) {
        return res.status(400).json({ error: 'appId and moduleId are required' });
      }

      // Check if relationship already exists
      const existing = await db.select()
        .from(appModules)
        .where(sql`${appModules.appId} = ${appId} AND ${appModules.moduleId} = ${moduleId}`)
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Module already linked to this app' });
      }

      const [newLink] = await db.insert(appModules).values({
        appId,
        moduleId,
        isRequired,
        version,
        config,
        sortOrder,
        metadata,
      }).returning();

      res.json({ success: true, data: newLink });
    } catch (error) {
      console.error('Error linking module to app:', error);
      res.status(500).json({ error: 'Failed to link module to app' });
    }
  });

  // Update module configuration for an app
  app.patch('/api/admin/app-modules/:appId/:moduleId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { appId, moduleId } = req.params;
      const { isRequired, version, config, sortOrder, metadata } = req.body;

      const updateData: any = {};
      if (isRequired !== undefined) updateData.isRequired = isRequired;
      if (version !== undefined) updateData.version = version;
      if (config !== undefined) updateData.config = config;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      if (metadata !== undefined) updateData.metadata = metadata;

      const [updated] = await db.update(appModules)
        .set(updateData)
        .where(sql`${appModules.appId} = ${appId} AND ${appModules.moduleId} = ${moduleId}`)
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'App-Module link not found' });
      }

      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error updating app module:', error);
      res.status(500).json({ error: 'Failed to update app module' });
    }
  });

  // Unlink a module from an app
  app.delete('/api/admin/app-modules/:appId/:moduleId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { appId, moduleId } = req.params;

      const deleted = await db.delete(appModules)
        .where(sql`${appModules.appId} = ${appId} AND ${appModules.moduleId} = ${moduleId}`)
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: 'App-Module link not found' });
      }

      res.json({ success: true, message: 'Module unlinked from app successfully' });
    } catch (error) {
      console.error('Error unlinking module from app:', error);
      res.status(500).json({ error: 'Failed to unlink module from app' });
    }
  });

  // ============ MODULE FEATURES ============

  // Get all features linked to a module
  app.get('/api/admin/module-features/:moduleId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { moduleId } = req.params;

      const features = await db.select()
        .from(moduleFeatures)
        .where(eq(moduleFeatures.moduleId, moduleId));

      res.json({ success: true, data: features });
    } catch (error) {
      console.error('Error fetching module features:', error);
      res.status(500).json({ error: 'Failed to fetch module features' });
    }
  });

  // Link a feature to a module
  app.post('/api/admin/module-features', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { moduleId, featureId, isRequired = false, sortOrder = 0, metadata = {} } = req.body;

      if (!moduleId || !featureId) {
        return res.status(400).json({ error: 'moduleId and featureId are required' });
      }

      // Check if relationship already exists
      const existing = await db.select()
        .from(moduleFeatures)
        .where(sql`${moduleFeatures.moduleId} = ${moduleId} AND ${moduleFeatures.featureId} = ${featureId}`)
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Feature already linked to this module' });
      }

      const [newLink] = await db.insert(moduleFeatures).values({
        moduleId,
        featureId,
        isRequired,
        sortOrder,
        metadata,
      }).returning();

      res.json({ success: true, data: newLink });
    } catch (error) {
      console.error('Error linking feature to module:', error);
      res.status(500).json({ error: 'Failed to link feature to module' });
    }
  });

  // Unlink a feature from a module
  app.delete('/api/admin/module-features/:moduleId/:featureId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { moduleId, featureId } = req.params;

      const deleted = await db.delete(moduleFeatures)
        .where(sql`${moduleFeatures.moduleId} = ${moduleId} AND ${moduleFeatures.featureId} = ${featureId}`)
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: 'Module-Feature link not found' });
      }

      res.json({ success: true, message: 'Feature unlinked from module successfully' });
    } catch (error) {
      console.error('Error unlinking feature from module:', error);
      res.status(500).json({ error: 'Failed to unlink feature from module' });
    }
  });

  // ============ HUB MODULES ============

  // Get all modules linked to a hub
  app.get('/api/admin/hub-modules/:hubId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { hubId } = req.params;

      const modules = await db.select()
        .from(hubModules)
        .where(eq(hubModules.hubId, hubId));

      res.json({ success: true, data: modules });
    } catch (error) {
      console.error('Error fetching hub modules:', error);
      res.status(500).json({ error: 'Failed to fetch hub modules' });
    }
  });

  // Link a module to a hub
  app.post('/api/admin/hub-modules', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { hubId, moduleId, isActive = true, sortOrder = 0, metadata = {} } = req.body;

      if (!hubId || !moduleId) {
        return res.status(400).json({ error: 'hubId and moduleId are required' });
      }

      // Check if relationship already exists
      const existing = await db.select()
        .from(hubModules)
        .where(sql`${hubModules.hubId} = ${hubId} AND ${hubModules.moduleId} = ${moduleId}`)
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Module already linked to this hub' });
      }

      const [newLink] = await db.insert(hubModules).values({
        hubId,
        moduleId,
        isActive,
        sortOrder,
        metadata,
      }).returning();

      res.json({ success: true, data: newLink });
    } catch (error) {
      console.error('Error linking module to hub:', error);
      res.status(500).json({ error: 'Failed to link module to hub' });
    }
  });

  // Unlink a module from a hub
  app.delete('/api/admin/hub-modules/:hubId/:moduleId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { hubId, moduleId } = req.params;

      const deleted = await db.delete(hubModules)
        .where(sql`${hubModules.hubId} = ${hubId} AND ${hubModules.moduleId} = ${moduleId}`)
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: 'Hub-Module link not found' });
      }

      res.json({ success: true, message: 'Module unlinked from hub successfully' });
    } catch (error) {
      console.error('Error unlinking module from hub:', error);
      res.status(500).json({ error: 'Failed to unlink module from hub' });
    }
  });

  // ============ HUB APPS ============

  // Get all apps linked to a hub
  app.get('/api/admin/hub-apps/:hubId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { hubId } = req.params;

      const apps = await db.select()
        .from(hubApps)
        .where(eq(hubApps.hubId, hubId));

      res.json({ success: true, data: apps });
    } catch (error) {
      console.error('Error fetching hub apps:', error);
      res.status(500).json({ error: 'Failed to fetch hub apps' });
    }
  });

  // Link an app to a hub
  app.post('/api/admin/hub-apps', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { hubId, appId, isActive = true, sortOrder = 0, metadata = {} } = req.body;

      if (!hubId || !appId) {
        return res.status(400).json({ error: 'hubId and appId are required' });
      }

      // Check if relationship already exists
      const existing = await db.select()
        .from(hubApps)
        .where(sql`${hubApps.hubId} = ${hubId} AND ${hubApps.appId} = ${appId}`)
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).json({ error: 'App already linked to this hub' });
      }

      const [newLink] = await db.insert(hubApps).values({
        hubId,
        appId,
        isActive,
        sortOrder,
        metadata,
      }).returning();

      res.json({ success: true, data: newLink });
    } catch (error) {
      console.error('Error linking app to hub:', error);
      res.status(500).json({ error: 'Failed to link app to hub' });
    }
  });

  // Unlink an app from a hub
  app.delete('/api/admin/hub-apps/:hubId/:appId', adminAuthMiddleware, async (req: any, res) => {
    try {
      const { hubId, appId } = req.params;

      const deleted = await db.delete(hubApps)
        .where(sql`${hubApps.hubId} = ${hubId} AND ${hubApps.appId} = ${appId}`)
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: 'Hub-App link not found' });
      }

      res.json({ success: true, message: 'App unlinked from hub successfully' });
    } catch (error) {
      console.error('Error unlinking app from hub:', error);
      res.status(500).json({ error: 'Failed to unlink app from hub' });
    }
  });

  // ========================================
  // END JUNCTION TABLE MANAGEMENT API
  // ========================================

  // ========================================
  // END APP FEATURES & PLAN FEATURE ACCESS ROUTES
  // ========================================

  // ========================================
  // HUB ADMIN MEDIA LIBRARY APIs
  // ========================================

  // Initialize Object Storage Service
  const objectStorageService = new ObjectStorageService();

  // Configure multer for media upload
  const mediaUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept images, videos, and documents
      const allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/ogg',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
      }
    },
  });

  // POST /api/hub-admin/media/upload - Upload media file
  app.post('/api/hub-admin/media/upload', hubAdminAuthMiddleware, mediaUpload.single('file'), async (req: any, res) => {
    try {
      const hubAdminPrincipal = (req.session as any)?.hubAdminPrincipal;

      if (!hubAdminPrincipal) {
        return res.status(401).json({ 
          success: false, 
          error: 'Hub admin authentication required' 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        });
      }

      const file = req.file;
      const tenantId = hubAdminPrincipal.tenantId;
      const userId = hubAdminPrincipal.id;

      // Server-side file type validation (security critical!)
      const detectedType = await fileTypeFromBuffer(file.buffer);

      // Allowed MIME types for security
      const allowedMimes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!detectedType || !allowedMimes.includes(detectedType.mime)) {
        return res.status(400).json({
          success: false,
          error: `Invalid file type. Detected: ${detectedType?.mime || 'unknown'}. Only images, videos, and documents are allowed.`
        });
      }

      // Use detected MIME type instead of client-provided one
      const trustedMimeType = detectedType.mime;

      // Generate unique filename with correct extension
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileExtension = `.${detectedType.ext}`;
      const filename = `${timestamp}_${randomSuffix}${fileExtension}`;

      // Upload to Object Storage private directory
      const privateDir = objectStorageService.getPrivateObjectDir();
      const objectPath = `${privateDir}/media/${tenantId}/${filename}`;

      // Parse bucket and object name
      const pathParts = objectPath.startsWith('/') ? objectPath : `/${objectPath}`;
      const parts = pathParts.split('/');
      const bucketName = parts[1];
      const objectName = parts.slice(2).join('/');

      // Upload file to Object Storage
      const bucket = objectStorageClient.bucket(bucketName);
      const fileObj = bucket.file(objectName);

      await fileObj.save(file.buffer, {
        metadata: {
          contentType: trustedMimeType, // Use server-detected MIME type
        },
      });

      // Generate file URL (can be signed URL for private access)
      const fileUrl = `${objectPath}`;

      // Store metadata in database
      const [mediaRecord] = await db.insert(media).values({
        tenantId,
        filename,
        originalName: file.originalname,
        mimeType: trustedMimeType, // Use server-validated MIME type
        size: file.size,
        url: fileUrl,
        metadata: {
          uploadedAt: new Date().toISOString(),
          bucket: bucketName,
          objectName,
        },
        createdBy: userId,
      }).returning();

      res.json({
        success: true,
        message: 'Media uploaded successfully',
        media: mediaRecord,
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload media' 
      });
    }
  });

  // GET /api/hub-admin/media - List media files with pagination and filters
  app.get('/api/hub-admin/media', hubAdminAuthMiddleware, async (req: any, res) => {
    try {
      const hubAdminPrincipal = (req.session as any)?.hubAdminPrincipal;

      if (!hubAdminPrincipal) {
        return res.status(401).json({ 
          success: false, 
          error: 'Hub admin authentication required' 
        });
      }

      const tenantId = hubAdminPrincipal.tenantId;

      // Pagination parameters
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      // Filter by mimeType category
      const mimeTypeFilter = req.query.mimeType as string;

      let query = db.select()
        .from(media)
        .where(eq(media.tenantId, tenantId))
        .orderBy(desc(media.createdAt))
        .limit(limit)
        .offset(offset);

      // Apply mimeType filter if provided
      if (mimeTypeFilter) {
        const conditions = [];

        if (mimeTypeFilter === 'images') {
          conditions.push(like(media.mimeType, 'image/%'));
        } else if (mimeTypeFilter === 'videos') {
          conditions.push(like(media.mimeType, 'video/%'));
        } else if (mimeTypeFilter === 'documents') {
          conditions.push(
            or(
              like(media.mimeType, 'application/pdf'),
              like(media.mimeType, 'application/msword'),
              like(media.mimeType, 'application/vnd.%')
            )!
          );
        }

        if (conditions.length > 0) {
          query = db.select()
            .from(media)
            .where(and(eq(media.tenantId, tenantId), ...conditions)!)
            .orderBy(desc(media.createdAt))
            .limit(limit)
            .offset(offset);
        }
      }

      const mediaFiles = await query;

      // Get total count
      let countQuery = db.select({ count: sql<number>`count(*)` })
        .from(media)
        .where(eq(media.tenantId, tenantId));

      if (mimeTypeFilter) {
        const conditions = [];

        if (mimeTypeFilter === 'images') {
          conditions.push(like(media.mimeType, 'image/%'));
        } else if (mimeTypeFilter === 'videos') {
          conditions.push(like(media.mimeType, 'video/%'));
        } else if (mimeTypeFilter === 'documents') {
          conditions.push(
            or(
              like(media.mimeType, 'application/pdf'),
              like(media.mimeType, 'application/msword'),
              like(media.mimeType, 'application/vnd.%')
            )!
          );
        }

        if (conditions.length > 0) {
          countQuery = db.select({ count: sql<number>`count(*)` })
            .from(media)
            .where(and(eq(media.tenantId, tenantId), ...conditions)!);
        }
      }

      const [{ count }] = await countQuery;

      res.json({
        success: true,
        data: mediaFiles,
        pagination: {
          total: Number(count),
          limit,
          offset,
          hasMore: offset + limit < Number(count),
        },
      });
    } catch (error) {
      console.error('Error fetching media:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch media files' 
      });
    }
  });

  // DELETE /api/hub-admin/media/:id - Delete media file
  app.delete('/api/hub-admin/media/:id', hubAdminAuthMiddleware, async (req: any, res) => {
    try {
      const hubAdminPrincipal = (req.session as any)?.hubAdminPrincipal;

      if (!hubAdminPrincipal) {
        return res.status(401).json({ 
          success: false, 
          error: 'Hub admin authentication required' 
        });
      }

      const { id } = req.params;
      const tenantId = hubAdminPrincipal.tenantId;

      // Find media record
      const [mediaRecord] = await db.select()
        .from(media)
        .where(and(eq(media.id, id), eq(media.tenantId, tenantId))!)
        .limit(1);

      if (!mediaRecord) {
        return res.status(404).json({ 
          success: false, 
          error: 'Media file not found' 
        });
      }

      // Delete from Object Storage
      try {
        const objectPath = mediaRecord.url;
        const pathParts = objectPath.startsWith('/') ? objectPath : `/${objectPath}`;
        const parts = pathParts.split('/');
        const bucketName = parts[1];
        const objectName = parts.slice(2).join('/');

        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectName);

        await file.delete();
      } catch (storageError) {
        console.error('Error deleting from Object Storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      await db.delete(media)
        .where(and(eq(media.id, id), eq(media.tenantId, tenantId))!);

      res.json({
        success: true,
        message: 'Media file deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting media:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete media file' 
      });
    }
  });

  // ========================================
  // END HUB ADMIN MEDIA LIBRARY APIs
  // ========================================

  // ========================================
  // NOTIFICATIONS APIs
  // ========================================

  // GET /api/notifications - Get user's notifications
  app.get('/api/notifications', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const principal = getPrincipal(req);

      if (!principal) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const userId = principal.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      // Fetch notifications
      const userNotifications = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count }] = await db.select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(eq(notifications.userId, userId));

      res.json({
        success: true,
        notifications: userNotifications,
        pagination: {
          total: Number(count),
          limit,
          offset,
          hasMore: offset + limit < Number(count),
        },
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch notifications' 
      });
    }
  });

  // GET /api/notifications/unread-count - Get count of unread notifications
  app.get('/api/notifications/unread-count', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const principal = getPrincipal(req);

      if (!principal) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const userId = principal.id;

      const [{ count }] = await db.select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )!);

      res.json({
        success: true,
        unreadCount: Number(count),
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch unread count' 
      });
    }
  });

  // POST /api/notifications/:id/mark-read - Mark notification as read
  app.post('/api/notifications/:id/mark-read', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const principal = getPrincipal(req);

      if (!principal) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const userId = principal.id;
      const { id } = req.params;

      // Verify notification belongs to user
      const [notification] = await db.select()
        .from(notifications)
        .where(and(
          eq(notifications.id, id),
          eq(notifications.userId, userId)
        )!)
        .limit(1);

      if (!notification) {
        return res.status(404).json({ 
          success: false, 
          error: 'Notification not found' 
        });
      }

      // Mark as read
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id));

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to mark notification as read' 
      });
    }
  });

  // POST /api/notifications/mark-all-read - Mark all notifications as read
  app.post('/api/notifications/mark-all-read', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const principal = getPrincipal(req);

      if (!principal) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const userId = principal.id;

      // Mark all as read
      await db.update(notifications)
        .set({ isRead: true })
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )!);

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to mark all notifications as read' 
      });
    }
  });

  // ========================================
  // END NOTIFICATIONS APIs
  // ========================================

  // ========================================
  // VERSION TRACKING API
  // ========================================

  // GET /api/version - Get current platform version information
  app.get('/api/version', async (req, res) => {
    try {
      // Fetch platform settings from database
      const platformInfoKeys = ['platform_name', 'platform_version', 'platform_tagline', 'platform_mission'];
      const platformInfo = await db.select()
        .from(platformSettings)
        .where(inArray(platformSettings.key, platformInfoKeys));

      // Convert array to object for easy access
      const platformData: Record<string, string> = {};
      platformInfo.forEach(setting => {
        platformData[setting.key] = setting.value || '';
      });

      // Fetch all enabled modules with their versions
      const modulesData = await db.select({
        id: platformModules.id,
        displayId: platformModules.displayId,
        name: platformModules.name,
        version: platformModules.version,
        changelog: platformModules.changelog,
        status: platformModules.status,
        category: platformModules.category,
      })
      .from(platformModules)
      .where(eq(platformModules.status, 'enabled'));

      // Fetch all published apps with their versions
      const appsData = await db.select({
        id: apps.id,
        displayId: apps.displayId,
        key: apps.key,
        name: apps.name,
        version: apps.version,
        changelog: apps.changelog,
        status: apps.status,
      })
      .from(apps)
      .where(eq(apps.status, 'published'));

      const versionData = {
        platform: {
          name: platformData.platform_name || 'WytNet',
          version: platformData.platform_version || '1.0.0',
          tagline: platformData.platform_tagline || 'Get In. Get Done.',
          mission: platformData.platform_mission || 'Speed | Security | Scale',
          lastUpdated: new Date().toISOString(),
        },
        modules: modulesData,
        apps: appsData,
        summary: {
          totalModules: modulesData.length,
          totalApps: appsData.length,
        },
      };

      res.json({
        success: true,
        data: versionData,
      });
    } catch (error) {
      console.error('Error fetching version data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch version data',
      });
    }
  });

  // ========================================
  // END VERSION TRACKING API
  // ========================================
}