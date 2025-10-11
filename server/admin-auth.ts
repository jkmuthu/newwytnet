import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { whatsappUsers, tenants, models, apps } from "@shared/schema";
import { eq, sql, count, and, isNotNull } from "drizzle-orm";

// Extend Express Request to include admin session
declare global {
  namespace Express {
    interface Request {
      adminSession?: {
        adminPrincipal?: {
          id: string;
          name: string;
          email: string;
          role: string;
          isSuperAdmin: boolean;
        };
      };
    }
  }
}

/**
 * Enterprise Admin Authentication System
 * Completely isolated from user authentication - uses separate session store and cookie
 */
export function setupAdminAuth(app: Express) {
  // Create dedicated PostgreSQL session store for admin sessions
  const PostgresSessionStore = connectPg(session);
  const adminSessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: "admin_sessions", // Separate table from user sessions
  });

  // Admin session middleware with dedicated cookie name
  const adminSessionMiddleware = session({
    name: "admin.sid", // Different cookie name to prevent mixing
    secret: process.env.SESSION_SECRET || "admin-secret-key",
    store: adminSessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: process.env.NODE_ENV === "production" ? ".wytnet.com" : undefined,
      sameSite: "lax",
    },
  });

  // Apply admin session middleware only to admin routes
  app.use("/api/admin", adminSessionMiddleware);

  // Admin Session API Endpoints
  
  // POST /api/admin/session - Admin login
  app.post("/api/admin/session", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Verify super admin credentials
      if (email === "jkm@jkmuthu.com" && password === "SuperAdmin@2025") {
        // Find or create super admin user
        let [superAdmin] = await db
          .select()
          .from(whatsappUsers)
          .where(eq(whatsappUsers.email, "jkm@jkmuthu.com"))
          .limit(1);

        if (!superAdmin) {
          [superAdmin] = await db
            .insert(whatsappUsers)
            .values({
              name: "Super Admin",
              email: "jkm@jkmuthu.com",
              whatsappNumber: "ADMIN_SUPER",
              role: "super_admin",
              isVerified: true,
              authMethods: ["email"],
              socialProviders: [],
              country: "IN",
              tenantId: null,
              isSuperAdmin: true,
            })
            .returning();
        }

        // Store admin principal in isolated session
        (req.session as any).adminPrincipal = {
          id: superAdmin.id,
          name: superAdmin.name || "Super Admin",
          email: superAdmin.email || "jkm@jkmuthu.com",
          role: "super_admin",
          isSuperAdmin: true,
        };

        // Save session explicitly
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("Admin session save error:", err);
              reject(err);
            } else {
              console.log("Admin session saved successfully");
              resolve();
            }
          });
        });

        return res.json({
          success: true,
          message: "Admin login successful",
          admin: (req.session as any).adminPrincipal,
        });
      }

      // Invalid credentials
      return res.status(401).json({
        success: false,
        error: "Invalid admin credentials",
      });
    } catch (error) {
      console.error("Admin login error:", error);
      return res.status(500).json({
        success: false,
        error: "Authentication failed",
      });
    }
  });

  // GET /api/admin/session - Check admin session status
  app.get("/api/admin/session", (req: Request, res: Response) => {
    const adminPrincipal = (req.session as any)?.adminPrincipal;

    if (adminPrincipal && adminPrincipal.isSuperAdmin) {
      return res.json({
        authenticated: true,
        admin: adminPrincipal,
      });
    }

    return res.json({
      authenticated: false,
    });
  });

  // DELETE /api/admin/session - Admin logout
  app.delete("/api/admin/session", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Admin logout error:", err);
        return res.status(500).json({
          success: false,
          error: "Logout failed",
        });
      }

      res.clearCookie("admin.sid");
      return res.json({
        success: true,
        message: "Logged out successfully",
      });
    });
  });

  // Middleware to check admin authentication
  const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
    const adminPrincipal = (req.session as any)?.adminPrincipal;
    
    if (!adminPrincipal || !adminPrincipal.isSuperAdmin) {
      return res.status(401).json({
        error: "Unauthorized - Admin access required",
      });
    }
    
    next();
  };

  // GET /api/admin/dashboard - Dashboard statistics
  app.get("/api/admin/dashboard", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();

      // Get total users count
      const [usersCount] = await db
        .select({ count: count() })
        .from(whatsappUsers);

      // Get active tenants count
      const [tenantsCount] = await db
        .select({ count: count() })
        .from(tenants);

      // Get enabled modules count
      const [modulesCount] = await db
        .select({ count: count() })
        .from(models);

      // Get configured apps/integrations count
      const [appsCount] = await db
        .select({ count: count() })
        .from(apps);

      const responseTime = Date.now() - startTime;

      // Calculate system uptime
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const uptimeString = `${hours}h ${minutes}m`;

      // Recent activity (mock data for now - can be enhanced with activity logs)
      const recentActivity = [
        {
          id: "1",
          type: "user_login" as const,
          description: "Admin logged in successfully",
          timestamp: new Date().toISOString(),
          severity: "info" as const,
        },
      ];

      return res.json({
        totalUsers: usersCount?.count || 0,
        activeTenants: tenantsCount?.count || 0,
        enabledModules: modulesCount?.count || 0,
        configuredIntegrations: appsCount?.count || 0,
        systemHealth: {
          status: responseTime < 1000 ? "healthy" : responseTime < 3000 ? "warning" : "error",
          uptime: uptimeString,
          responseTime,
        },
        recentActivity,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return res.status(500).json({
        error: "Failed to fetch dashboard statistics",
      });
    }
  });

  // GET /api/auth/admin/user - Get current admin user info
  app.get("/api/auth/admin/user", requireAdminAuth, (req: Request, res: Response) => {
    const adminPrincipal = (req.session as any)?.adminPrincipal;
    return res.json(adminPrincipal);
  });
}
