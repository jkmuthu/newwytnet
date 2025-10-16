import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Hub Admin Authentication System
 * Separate authentication for WytNet.com Hub administrators
 * Uses separate session store and cookie from Engine super admins
 */
export function setupHubAdminAuth(app: Express) {
  // Create dedicated PostgreSQL session store for hub admin sessions
  const PostgresSessionStore = connectPg(session);
  const hubAdminSessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: "hub_admin_sessions", // Separate table from admin and user sessions
  });

  // Hub Admin session middleware with dedicated cookie name
  const hubAdminSessionMiddleware = session({
    name: "hubadmin.sid", // Different cookie name to prevent mixing
    secret: process.env.SESSION_SECRET || "hubadmin-secret-key",
    store: hubAdminSessionStore,
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

  // Apply hub admin session middleware only to hub admin routes
  app.use("/api/hub-admin", hubAdminSessionMiddleware);

  // Hub Admin Session API Endpoints
  
  // POST /api/hub-admin/session - Hub Admin login
  app.post("/api/hub-admin/session", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Verify hub admin credentials
      if (email === "hubadmin@wytnet.com" && password === "hubadmin123") {
        // Find or create hub admin user
        let [hubAdmin] = await db
          .select()
          .from(users)
          .where(eq(users.email, "hubadmin@wytnet.com"))
          .limit(1);

        if (!hubAdmin) {
          // Generate unique ID for hub admin user
          const hubAdminId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          [hubAdmin] = await db
            .insert(users)
            .values({
              id: hubAdminId,
              firstName: "Hub",
              lastName: "Admin",
              email: "hubadmin@wytnet.com",
              role: "hub_admin",
              passwordHash: await bcrypt.hash("hubadmin123", 10),
            })
            .returning();
        }

        // Store hub admin principal in isolated session
        (req.session as any).hubAdminPrincipal = {
          id: hubAdmin.id,
          name: `${hubAdmin.firstName} ${hubAdmin.lastName}`,
          email: hubAdmin.email || "hubadmin@wytnet.com",
          role: "hub_admin",
          hubId: "wytnet_hub",
          hubName: "WytNet.com",
          tenantId: hubAdmin.tenantId || "wytnet_tenant",
        };

        // Save session explicitly
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("Hub admin session save error:", err);
              reject(err);
            } else {
              console.log("Hub admin session saved successfully");
              resolve();
            }
          });
        });

        return res.json({
          success: true,
          message: "Hub admin login successful",
          hubAdmin: (req.session as any).hubAdminPrincipal,
        });
      }

      // Invalid credentials
      return res.status(401).json({
        success: false,
        error: "Invalid hub admin credentials",
      });
    } catch (error) {
      console.error("Hub admin login error:", error);
      return res.status(500).json({
        success: false,
        error: "Authentication failed",
      });
    }
  });

  // GET /api/hub-admin/session - Check hub admin session status
  app.get("/api/hub-admin/session", (req: Request, res: Response) => {
    const hubAdminPrincipal = (req.session as any)?.hubAdminPrincipal;

    if (hubAdminPrincipal) {
      return res.json({
        authenticated: true,
        hubAdmin: hubAdminPrincipal,
      });
    }

    return res.json({
      authenticated: false,
    });
  });

  // DELETE /api/hub-admin/session - Hub Admin logout
  app.delete("/api/hub-admin/session", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Hub admin logout error:", err);
        return res.status(500).json({
          success: false,
          error: "Logout failed",
        });
      }

      res.clearCookie("hubadmin.sid");
      return res.json({
        success: true,
        message: "Logged out successfully",
      });
    });
  });

  console.log("🏢 Hub Admin Auth initialized successfully");
}
