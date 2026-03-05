import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// CORS configuration for custom domain
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://wytnet.com', 'https://www.wytnet.com', 'http://localhost:5000', 'http://127.0.0.1:5000']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize services in the background
  try {
    console.log('Initializing services...');
    
    // Initialize search service
    const { checkMeilisearchAvailability } = await import('./services/searchService');
    
    // Check if Meilisearch is available
    const isAvailable = await checkMeilisearchAvailability();
    
    if (isAvailable) {
      console.log('Meilisearch is available, initializing production search...');
      const { searchIndexer } = await import('./services/searchIndexer');
      
      // Initialize search indexes in background
      searchIndexer.initialize().catch(error => {
        console.error('Search initialization failed:', error);
        console.log('Search functionality will be limited until manual initialization');
      });
    } else {
      console.log('Using mock search service for development');
    }

    // Initialize assessment service
    console.log('Initializing assessment service...');
    const { AssessmentService } = await import('./assessmentService');
    const assessmentService = new AssessmentService();
    
    await assessmentService.initializeDefaultData();
    console.log('Assessment service initialized with default data');
    
  } catch (error) {
    console.error('Failed to initialize services:', error);
    console.log('Server starting with limited functionality');
  }

  // Setup WytPass Unified Identity System (MUST be first - creates session middleware)
  try {
    console.log('🔐 Setting up WytPass Unified Identity System...');
    const { setupWytPassAuth } = await import('./wytpass-identity');
    setupWytPassAuth(app);
  } catch (error) {
    console.error('WytPass Identity initialization failed:', error);
    throw error; // Critical - app cannot function without unified auth
  }

  // Setup WytPass OAuth (Google, LinkedIn, etc.)
  try {
    console.log('Setting up WytPass OAuth...');
    const { setupWytPassAuth: setupOAuth } = await import('./wytpass-auth');
    setupOAuth(app);
    console.log('WytPass OAuth initialized successfully');
  } catch (error) {
    console.warn('WytPass OAuth initialization failed:', error);
    console.log('Continuing without WytPass OAuth - Google/Facebook login unavailable');
  }

  // Setup Engine Admin Authentication (now uses WytPass)
  try {
    console.log('Setting up Engine Admin Auth...');
    const { setupAdminAuth, seedSuperAdmin } = await import('./admin-auth');
    setupAdminAuth(app);
    // Ensure super admin user exists in DB with correct credentials
    await seedSuperAdmin();
  } catch (error) {
    console.warn('Engine Admin Auth initialization failed:', error);
    console.log('Continuing without Admin Auth - Admin login unavailable');
  }

  // Setup Hub Admin Authentication (now uses WytPass)
  try {
    console.log('Setting up Hub Admin Auth...');
    const { setupHubAdminAuth } = await import('./hub-admin-auth');
    setupHubAdminAuth(app);
  } catch (error) {
    console.warn('Hub Admin Auth initialization failed:', error);
    console.log('Continuing without Hub Admin Auth - Hub admin login unavailable');
  }

  // Seed platform modules from catalog
  try {
    const { moduleSeedingService } = await import('./services/moduleSeedingService');
    await moduleSeedingService.seedModules();
  } catch (error) {
    console.error('Module seeding failed:', error);
  }

  // Auto-discover and register modules from manifest.json files
  try {
    console.log('🔍 Scanning for module manifests...');
    const { manifestScanner } = await import('./services/manifestScanner');
    const scanResult = await manifestScanner.scanAll();
    console.log(`✅ Manifest scan complete: ${scanResult.discovered} found, ${scanResult.registered} new, ${scanResult.updated} updated`);
    if (scanResult.errors.length > 0) {
      console.warn(`⚠️  ${scanResult.errors.length} manifest errors:`);
      scanResult.errors.forEach(err => console.warn(`  - ${err.path}: ${err.error}`));
    }
  } catch (error) {
    console.error('Manifest scanning failed:', error);
  }

  // Seed entity types and starter entities
  try {
    const { entitySeedingService } = await import('./services/entitySeedingService');
    await entitySeedingService.seedAll();
  } catch (error) {
    console.error('Entity seeding failed:', error);
  }

  // Seed platform hubs
  try {
    const { seedPlatformHubs } = await import('./services/platformHubsSeedingService');
    await seedPlatformHubs();
  } catch (error) {
    console.error('Platform hubs seeding failed:', error);
  }

  // Seed permissions and default roles
  try {
    const { seedEnginePermissions, seedDefaultEngineRoles } = await import('./services/permissionsSeedingService');
    await seedEnginePermissions();
    await seedDefaultEngineRoles();
  } catch (error) {
    console.error('Permissions seeding failed:', error);
  }

  // Seed navigation menus
  try {
    const { seedNavigationMenus } = await import('./services/navigationMenusSeedingService');
    await seedNavigationMenus();
  } catch (error) {
    console.error('Navigation menus seeding failed:', error);
  }

  // Seed platform themes
  try {
    const { seedPlatformThemes } = await import('./services/themesSeedingService');
    await seedPlatformThemes();
  } catch (error) {
    console.error('Platform themes seeding failed:', error);
  }

  // Seed platform integrations
  try {
    const { seedPlatformIntegrations } = await import('./services/integrationsSeedingService');
    await seedPlatformIntegrations();
  } catch (error) {
    console.error('Platform integrations seeding failed:', error);
  }

  // Seed platform settings
  try {
    const { seedPlatformSettings } = await import('./services/platformSettingsSeedingService');
    await seedPlatformSettings();
  } catch (error) {
    console.error('Platform settings seeding failed:', error);
  }

  // Setup Hub Routing Middleware (Multi-domain routing)
  try {
    console.log('🌐 Setting up Hub Routing Middleware...');
    const { hubRoutingMiddleware } = await import('./hub-routing-middleware');
    app.use(hubRoutingMiddleware());
    console.log('✅ Hub Routing Middleware initialized (subdomain, custom domain, path routing)');
  } catch (error) {
    console.warn('Hub Routing Middleware initialization failed:', error);
    console.log('Continuing without hub routing');
  }

  // Setup Developer Documentation Routes
  try {
    console.log('📚 Setting up Developer Documentation...');
    const { setupDocsRoutes } = await import('./docs-routes');
    setupDocsRoutes(app);
  } catch (error) {
    console.warn('Developer Documentation setup failed:', error);
    console.log('Continuing without DevDoc routes');
  }

  await registerRoutes(app);
  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.HOST || (process.platform === "win32" ? "127.0.0.1" : "0.0.0.0");
  const listenOptions = process.platform === "win32"
    ? { port, host }
    : { port, host, reusePort: true };

  server.listen(listenOptions, () => {
    log(`serving on port ${port}`);
  });
})();
