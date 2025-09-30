import type { Express, RequestHandler } from "express";
import { 
  setupAuth, 
  isAuthenticated, 
  Principal, 
  AuthenticatedRequest,
  adminAuthMiddleware,
  isAuthenticatedUnified,
  getPrincipal,
  getAdminPrincipal,
  isSuperAdmin,
  requireSuperAdmin
} from "./customAuth";
import { setupReplitAuth, isReplitAuthenticated } from "./replitAuth";
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
import { razorpayService } from "./services/razorpayService";
import path from "path";
import * as whatsappAuthService from "./services/whatsappAuth";
import * as socialAuthService from "./services/socialAuth";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertModelSchema, 
  insertPageSchema, 
  insertAppSchema, 
  insertHubSchema,
  platformModules,
  insertPlatformModuleSchema,
  type PlatformModule,
  type InsertPlatformModule,
  users,
  tenants,
  apps,
  hubs,
  seoSettings,
  insertSeoSettingSchema,
  whatsappUsers,
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
  type InsertApiIntegration
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
import { eq, desc, and, sql, gte, lte, like, or, ilike } from "drizzle-orm";

// Trademark analysis functions now imported from services/trademarkAnalysis.ts

// Risk assessment function now imported from services/trademarkAnalysis.ts

// Recommendations function now imported from services/trademarkAnalysis.ts

// All similarity algorithms now imported from services/trademarkAnalysis.ts

// Sample trademark data initialization now imported from services/trademarkAnalysis.ts

// Admin auth middleware now imported from customAuth.ts

// Unified authentication middleware now imported from customAuth.ts

// Principal resolver now imported from customAuth.ts

export async function registerRoutes(app: Express): Promise<void> {
  // Setup both authentication systems
  await setupAuth(app); // Custom mobile/WhatsApp auth
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

  // WhatsApp OTP Authentication System
  // =================================

  // Initiate registration/login with WhatsApp OTP
  app.post('/api/auth/whatsapp/send-otp', async (req, res) => {
    try {
      const { name, country = 'IN', whatsappNumber, gender, dateOfBirth } = req.body;

      if (!whatsappNumber) {
        return res.status(400).json({ error: 'WhatsApp number is required' });
      }

      const whatsappAuthService = await import('./services/whatsappAuth');
      
      // Validate phone number
      if (!whatsappAuthService.validatePhoneNumber(whatsappNumber, country)) {
        return res.status(400).json({ 
          error: country === 'IN' 
            ? 'Invalid Indian mobile number. Please enter 10 digits starting with 6, 7, 8, or 9'
            : 'Invalid phone number format'
        });
      }

      // Format phone number
      const formattedNumber = whatsappAuthService.formatPhoneNumber(whatsappNumber, country);

      // Check if user exists
      let user = await whatsappAuthService.findWhatsAppUser(formattedNumber);
      
      let isNewUser = false;
      
      // If user doesn't exist, detect if it's a new user registration
      if (!user) {
        isNewUser = true;
        
        // For new users, validate required fields
        if (name && gender && dateOfBirth) {
          user = await whatsappAuthService.createWhatsAppUser({
            name,
            country,
            whatsappNumber: formattedNumber,
            gender,
            dateOfBirth,
          });
        } else {
          // Return new user indication - frontend will show registration form
          return res.json({
            success: true,
            isNewUser: true,
            message: 'New user detected. Please complete registration.',
            whatsappNumber: formattedNumber,
          });
        }
      }

      // Generate OTP session
      const { otp, sessionId } = await whatsappAuthService.createOTPSession(formattedNumber);

      // Generate WhatsApp share link
      const whatsappLink = whatsappAuthService.generateWhatsAppLink(formattedNumber, otp);

      res.json({
        success: true,
        message: isNewUser ? 'Welcome! OTP generated for new WytPass account.' : 'Welcome back! OTP generated.',
        sessionId,
        whatsappLink,
        whatsappNumber: formattedNumber,
        expiresIn: 300, // 5 minutes in seconds
        isNewUser: isNewUser || !user.isVerified,
      });
    } catch (error) {
      console.error('Error sending WhatsApp OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  });

  // Verify WhatsApp OTP and complete login
  app.post('/api/auth/whatsapp/verify-otp', async (req, res) => {
    try {
      const { whatsappNumber, otp } = req.body;

      if (!whatsappNumber || !otp) {
        return res.status(400).json({ error: 'WhatsApp number and OTP are required' });
      }

      const whatsappAuthService = await import('./services/whatsappAuth');

      // Verify OTP
      const user = await whatsappAuthService.verifyOTP(whatsappNumber, otp);

      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid or expired OTP. Please request a new one.' 
        });
      }

      // Create session (similar to regular auth)
      if (req.session) {
        req.session.whatsappUserId = user.id;
        req.session.whatsappNumber = user.whatsappNumber;
        req.session.isWhatsAppAuth = true;
      }

      res.json({
        success: true,
        message: user.isSuperAdmin ? 'Welcome back, Super Admin!' : 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          country: user.country,
          whatsappNumber: user.whatsappNumber,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          role: user.role,
          isSuperAdmin: user.isSuperAdmin,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt,
        },
      });
    } catch (error) {
      console.error('Error verifying WhatsApp OTP:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  });

  // Get current WhatsApp authenticated user
  app.get('/api/auth/whatsapp/user', async (req, res) => {
    try {
      if (!req.session?.whatsappUserId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const whatsappAuthService = await import('./services/whatsappAuth');
      const user = await whatsappAuthService.findWhatsAppUser(req.session.whatsappNumber);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Security check: Ensure role matches the actual WhatsApp number
      // Super Admin access control
      const isSuperAdmin = Boolean(user.whatsappNumber === '+919345228184' || 
                          (process.env.NODE_ENV === 'development' && user.whatsappNumber)); // Dev mode: any authenticated user can be super admin
      const correctRole = isSuperAdmin ? 'super_admin' : 'user';

      res.json({
        id: user.id,
        name: user.name,
        country: user.country,
        whatsappNumber: user.whatsappNumber,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        role: correctRole,
        isSuperAdmin,
        isVerified: user.isVerified,
        lastLoginAt: user.lastLoginAt,
      });
    } catch (error) {
      console.error('Error getting WhatsApp user:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // Admin login endpoint with fixed credentials
  // Enterprise Admin Authentication Endpoints
  app.post('/api/auth/admin/login', async (req, res) => {
    try {
      const { username, password, deviceInfo } = req.body;

      // Simple credentials check for development
      if (username === '9345228184' && password === 'sadmin12') {
        // Find the super admin user in database
        const superAdminUser = await db
          .select()
          .from(whatsappUsers)
          .where(eq(whatsappUsers.whatsappNumber, '+919345228184'))
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
              role: user.role || 'super_admin',
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
          .from(whatsappUsers)
          .where(eq(whatsappUsers.whatsappNumber, '+919345228184'))
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
      const sessionUser = (req.session as any)?.user;
      
      if (sessionUser && sessionUser.isSuperAdmin) {
        return res.json({
          authenticated: true,
          user: {
            id: sessionUser.id,
            role: sessionUser.role || 'super_admin',
            isSuperAdmin: sessionUser.isSuperAdmin
          }
        });
      }
      
      return res.json({ authenticated: false });
    } catch (error) {
      return res.json({ authenticated: false });
    }
  });

  // Get current admin user info
  app.get('/api/auth/admin/user', async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser || !sessionUser.isSuperAdmin) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Find admin user
      const adminUser = await db
        .select()
        .from(whatsappUsers)
        .where(eq(whatsappUsers.id, sessionUser.id))
        .limit(1);

      if (adminUser.length > 0) {
        const user = adminUser[0];
        return res.json({
          id: user.id,
          name: user.name || 'Super Admin',
          role: user.role || 'super_admin',
          isSuperAdmin: Boolean(user.isSuperAdmin || user.whatsappNumber === '+919345228184')
        });
      }
      
      return res.status(404).json({ error: 'User not found' });
    } catch (error) {
      console.error('Get admin user error:', error);
      return res.status(500).json({ error: 'Failed to get user info' });
    }
  });

  // Admin logout
  app.post('/api/auth/admin/logout', async (req, res) => {
    try {
      // Clear unified session
      delete (req.session as any).user;
      
      return res.json({
        success: true,
        message: 'Logged out successfully'
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
          .from(whatsappUsers)
          .where(eq(whatsappUsers.whatsappNumber, '+919345228184'))
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

  // Development login endpoint (only in development mode)
  app.post('/api/auth/whatsapp/dev-login', async (req, res) => {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: 'Development login not available in production' });
    }

    try {
      const { name, whatsappNumber, country = 'India' } = req.body;

      if (!name || !whatsappNumber) {
        return res.status(400).json({ error: 'Name and WhatsApp number are required' });
      }

      const whatsappAuthService = await import('./services/whatsappAuth');
      
      // Find or create development user
      let user = await whatsappAuthService.findWhatsAppUser(whatsappNumber);
      
      if (!user) {
        // Create new user if doesn't exist
        user = await whatsappAuthService.createWhatsAppUser({
          name,
          whatsappNumber,
          country,
          gender: undefined,
          dateOfBirth: undefined,
          isVerified: true,
        });
      }

      // Set session
      req.session.whatsappUserId = user.id;
      req.session.whatsappNumber = user.whatsappNumber;

      const isSuperAdmin = Boolean(user.whatsappNumber === '+919345228184' || 
                          (process.env.NODE_ENV === 'development' && user.whatsappNumber));

      res.json({
        success: true,
        message: 'Development login successful',
        user: {
          id: user.id,
          name: user.name,
          whatsappNumber: user.whatsappNumber,
          country: user.country,
          role: isSuperAdmin ? 'super_admin' : 'user',
          isSuperAdmin: isSuperAdmin,
          isVerified: true,
        },
      });
    } catch (error) {
      console.error('Error in development login:', error);
      res.status(500).json({ error: 'Development login failed' });
    }
  });

  // WhatsApp logout
  app.post('/api/auth/whatsapp/logout', async (req, res) => {
    try {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Logout failed' });
          }
          res.json({ success: true, message: 'Logged out successfully' });
        });
      } else {
        res.json({ success: true, message: 'Already logged out' });
      }
    } catch (error) {
      console.error('Error during WhatsApp logout:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  });

  // Check phone number availability
  app.post('/api/auth/whatsapp/check-number', async (req, res) => {
    try {
      const { whatsappNumber, country = 'IN' } = req.body;

      if (!whatsappNumber) {
        return res.status(400).json({ error: 'WhatsApp number is required' });
      }

      const whatsappAuthService = await import('./services/whatsappAuth');

      // Validate phone number format
      if (!whatsappAuthService.validatePhoneNumber(whatsappNumber, country)) {
        return res.status(400).json({ 
          error: 'Invalid phone number format',
          isValid: false 
        });
      }

      // Format and check if exists
      const formattedNumber = whatsappAuthService.formatPhoneNumber(whatsappNumber, country);
      const existingUser = await whatsappAuthService.findWhatsAppUser(formattedNumber);

      res.json({
        isValid: true,
        isAvailable: !existingUser,
        isRegistered: !!existingUser,
        formattedNumber,
        existingUser: existingUser ? {
          name: existingUser.name,
          isVerified: existingUser.isVerified,
        } : null,
      });
    } catch (error) {
      console.error('Error checking phone number:', error);
      res.status(500).json({ error: 'Failed to check number' });
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
  // Platform Modules Management API
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

  app.get('/api/auth/linkedin', (req, res) => {
    const state = Buffer.from(JSON.stringify({
      provider: 'linkedin',
      timestamp: Date.now(),
      requiresMobileVerification: true
    })).toString('base64');
    
    res.json({
      success: true,
      provider: 'linkedin',
      message: 'LinkedIn OAuth - Mobile verification required',
      redirectUrl: `https://www.linkedin.com/oauth/v2/authorization?client_id=demo&redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URI || '/api/auth/callback/linkedin')}&state=${state}&scope=r_liteprofile%20r_emailaddress`,
      requiresMobileVerification: true,
      demoMode: true
    });
  });

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

  // Super Admin dashboard data
  app.get('/api/admin/dashboard', adminAuthMiddleware, async (req: any, res) => {
    try {

      // Get comprehensive dashboard data
      const [
        totalUsers,
        totalTenants,
        totalApps,
        totalHubs,
        modulesList,
        recentUsers,
        systemMetrics
      ] = await Promise.all([
        // Total users count
        db.select({ count: sql<number>`cast(count(*) as integer)` }).from(users),
        
        // Total tenants count
        db.select({ count: sql<number>`cast(count(*) as integer)` }).from(tenants),
        
        // Total apps count
        db.select({ count: sql<number>`cast(count(*) as integer)` }).from(apps),
        
        // Total hubs count
        db.select({ count: sql<number>`cast(count(*) as integer)` }).from(hubs),
        
        // Platform modules status
        db.select().from(platformModules).orderBy(platformModules.name),
        
        // Recent users (last 10) - using correct column names
        db.select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          createdAt: users.createdAt,
          tenantId: users.tenantId
        }).from(users).orderBy(desc(users.createdAt)).limit(10),
        
        // System metrics (placeholder)
        Promise.resolve({
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          cpuLoad: 0.45, // Mock data
          activeConnections: 42 // Mock data
        })
      ]);

      res.json({
        success: true,
        dashboard: {
          statistics: {
            totalUsers: totalUsers[0]?.count || 0,
            totalTenants: totalTenants[0]?.count || 0,
            totalApps: totalApps[0]?.count || 0,
            totalHubs: totalHubs[0]?.count || 0,
            platformModules: modulesList.length
          },
          platformModules: modulesList.map(module => ({
            id: module.id,
            name: module.name,
            description: module.description,
            isEnabled: module.isEnabled,
            category: module.category,
            version: module.version
          })),
          recentActivity: recentUsers.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            joinedAt: user.createdAt,
            role: user.role,
            type: 'user_registration'
          })),
          systemMetrics: {
            ...systemMetrics,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load dashboard data'
      });
    }
  });

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
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt,
          tenantId: users.tenantId
        }).from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt)),
        
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
          .from(whatsappUsers)
          .where(sql`cardinality(social_providers) > 0`),
        
        // Pending mobile verifications
        db.select({ count: sql<number>`cast(count(*) as integer)` })
          .from(whatsappUsers)
          .where(and(
            sql`cardinality(social_providers) > 0`,
            eq(whatsappUsers.isVerified, false)
          )),
        
        // Verified social accounts
        db.select({ count: sql<number>`cast(count(*) as integer)` })
          .from(whatsappUsers)
          .where(and(
            sql`cardinality(social_providers) > 0`,
            eq(whatsappUsers.isVerified, true)
          )),
        
        // Recent social users
        db.select({
          id: whatsappUsers.id,
          name: whatsappUsers.name,
          email: whatsappUsers.email,
          socialProviders: whatsappUsers.socialProviders,
          isVerified: whatsappUsers.isVerified,
          whatsappNumber: whatsappUsers.whatsappNumber,
          lastLoginAt: whatsappUsers.lastLoginAt
        })
          .from(whatsappUsers)
          .where(sql`cardinality(social_providers) > 0`)
          .orderBy(desc(whatsappUsers.lastLoginAt))
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

  // ==========================================
  // PAYMENT ROUTES (Razorpay Integration)
  // ==========================================

  // Get available plans
  app.get('/api/payments/plans', async (req, res) => {
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
  app.post('/api/payments/create-order', isAuthenticatedUnified, async (req, res) => {
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
}
