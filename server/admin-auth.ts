import { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, tenants, models, apps } from "@shared/schema";
import { eq, sql, count, and, isNotNull } from "drizzle-orm";
import { createWytPassPrincipal, requireSuperAdmin, getPrincipalFromLegacySession } from "./wytpass-identity";

/**
 * Engine Admin Authentication System
 * Now uses unified WytPass identity instead of separate sessions
 */
export async function seedSuperAdmin() {
  const SUPER_ADMIN_EMAIL = "jkm@jkmuthu.com";
  const SUPER_ADMIN_PASSWORD = "Super*123";

  try {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, SUPER_ADMIN_EMAIL))
      .limit(1);

    if (!existing) {
      await db.insert(users).values({
        name: "Super Admin",
        email: SUPER_ADMIN_EMAIL,
        role: "admin",
        passwordHash: await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10),
        isSuperAdmin: true,
      });
      console.log("✅ Super Admin user created in database");
    } else if (!existing.isSuperAdmin || !existing.passwordHash) {
      await db
        .update(users)
        .set({
          isSuperAdmin: true,
          passwordHash: existing.passwordHash || await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10),
        })
        .where(eq(users.email, SUPER_ADMIN_EMAIL));
      console.log("✅ Super Admin user updated with isSuperAdmin flag");
    }
  } catch (error) {
    console.error("Super Admin seeding error:", error);
  }
}

export function setupAdminAuth(app: Express) {

  // Admin Session API Endpoints
  
  // POST /api/admin/session - Admin login (WytPass Unified)
  app.post("/api/admin/session", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Verify super admin credentials
      const SUPER_ADMIN_EMAIL = "jkm@jkmuthu.com";
      const SUPER_ADMIN_PASSWORD = "Super*123";

      // Find or create super admin user
      let [superAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.email, SUPER_ADMIN_EMAIL))
        .limit(1);

      // Check hardcoded credential or bcrypt hash in DB
      let isValidPassword = password === SUPER_ADMIN_PASSWORD;
      if (!isValidPassword && superAdmin?.passwordHash) {
        isValidPassword = await bcrypt.compare(password, superAdmin.passwordHash);
      }

      if (email === SUPER_ADMIN_EMAIL && isValidPassword) {
        if (!superAdmin) {
          [superAdmin] = await db
            .insert(users)
            .values({
              name: "Super Admin",
              email: SUPER_ADMIN_EMAIL,
              role: "admin",
              passwordHash: await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10),
              isSuperAdmin: true,
            })
            .returning();
        }

        // Ensure passwordHash is up-to-date in DB
        if (superAdmin && !superAdmin.passwordHash) {
          await db
            .update(users)
            .set({ passwordHash: await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10), isSuperAdmin: true })
            .where(eq(users.email, SUPER_ADMIN_EMAIL));
        }

        // Create unified WytPass principal
        const principal = await createWytPassPrincipal(superAdmin, 'engine_admin');
        req.session.wytpassPrincipal = principal;

        // Save session explicitly
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("WytPass session save error:", err);
              reject(err);
            } else {
              console.log("✅ WytPass session created for Super Admin");
              resolve();
            }
          });
        });

        return res.json({
          success: true,
          message: "Admin login successful",
          admin: {
            id: principal.id,
            name: principal.name,
            email: principal.email,
            role: "Super Admin",
            isSuperAdmin: principal.isSuperAdmin,
            panels: principal.panels,
          },
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

  // GET /api/admin/session - Check admin session status (WytPass Unified)
  app.get("/api/admin/session", async (req: Request, res: Response) => {
    try {
      // Try wytpassPrincipal first, then bridge from any legacy/regular session
      const principal = req.session.wytpassPrincipal || await getPrincipalFromLegacySession(req);

      if (principal && principal.isSuperAdmin) {
        return res.json({
          authenticated: true,
          admin: {
            id: principal.id,
            name: principal.name,
            email: principal.email,
            role: "Super Admin",
            isSuperAdmin: principal.isSuperAdmin,
            panels: principal.panels,
          },
        });
      }

      return res.json({ authenticated: false });
    } catch (error) {
      console.error("Admin session check error:", error);
      return res.json({ authenticated: false });
    }
  });

  // DELETE /api/admin/session - Admin logout (WytPass Unified)
  app.delete("/api/admin/session", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("WytPass logout error:", err);
        return res.status(500).json({
          success: false,
          error: "Logout failed",
        });
      }

      res.clearCookie("wytpass.sid");
      return res.json({
        success: true,
        message: "Logged out successfully",
      });
    });
  });

  // Middleware now uses WytPass unified system
  const requireAdminAuth = requireSuperAdmin;

  // GET /api/admin/dashboard - Dashboard statistics
  app.get("/api/admin/dashboard", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();

      // Get total users count
      const [usersCount] = await db
        .select({ count: count() })
        .from(users);

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

  // GET /api/auth/admin/user - Get current admin user info (WytPass Unified)
  app.get("/api/auth/admin/user", requireAdminAuth, (req: Request, res: Response) => {
    const principal = req.session.wytpassPrincipal;
    if (principal) {
      return res.json({
        id: principal.id,
        name: principal.name,
        email: principal.email,
        role: "Super Admin",
        isSuperAdmin: principal.isSuperAdmin,
        panels: principal.panels,
      });
    }
    return res.status(401).json({ error: "Not authenticated" });
  });
  
  console.log("✅ Engine Admin Auth (WytPass Unified) initialized");
}
