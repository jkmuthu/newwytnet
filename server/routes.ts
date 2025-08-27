import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { z } from "zod";
import { insertModelSchema, insertPageSchema, insertAppSchema, insertHubSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const validatedData = insertModelSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
        createdBy: userId,
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
        createdBy: userId,
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

      const apps = await storage.getAppsByTenant(user?.tenantId);
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

      const validatedData = insertAppSchema.parse({
        ...req.body,
        tenantId: user?.tenantId,
        createdBy: userId,
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

  const httpServer = createServer(app);
  return httpServer;
}
