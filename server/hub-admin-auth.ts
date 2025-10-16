import { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { createWytPassPrincipal, requireHubAdmin } from "./wytpass-identity";

/**
 * Hub Admin Authentication System
 * Now uses unified WytPass identity instead of separate sessions
 */
export function setupHubAdminAuth(app: Express) {

  // Hub Admin Session API Endpoints
  
  // POST /api/hub-admin/session - Hub Admin login (WytPass Unified)
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
          [hubAdmin] = await db
            .insert(users)
            .values({
              name: "Hub Admin",
              email: "hubadmin@wytnet.com",
              role: "hub_admin",
              passwordHash: await bcrypt.hash("hubadmin123", 10),
            })
            .returning();
        }

        // Create unified WytPass principal
        const principal = await createWytPassPrincipal(hubAdmin, 'hub_admin');
        req.session.wytpassPrincipal = principal;

        // Save session explicitly
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("WytPass session save error:", err);
              reject(err);
            } else {
              console.log("✅ WytPass session created for Hub Admin");
              resolve();
            }
          });
        });

        return res.json({
          success: true,
          message: "Hub admin login successful",
          hubAdmin: {
            id: principal.id,
            name: principal.name,
            email: principal.email,
            role: "Hub Admin",
            isHubAdmin: principal.isHubAdmin,
            panels: principal.panels,
          },
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

  // GET /api/hub-admin/session - Check hub admin session status (WytPass Unified)
  app.get("/api/hub-admin/session", (req: Request, res: Response) => {
    const principal = req.session.wytpassPrincipal;

    if (principal && principal.isHubAdmin) {
      return res.json({
        authenticated: true,
        hubAdmin: {
          id: principal.id,
          name: principal.name,
          email: principal.email,
          role: "Hub Admin",
          isHubAdmin: principal.isHubAdmin,
          panels: principal.panels,
        },
      });
    }

    return res.json({
      authenticated: false,
    });
  });

  // DELETE /api/hub-admin/session - Hub Admin logout (WytPass Unified)
  app.delete("/api/hub-admin/session", (req: Request, res: Response) => {
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

  console.log("✅ Hub Admin Auth (WytPass Unified) initialized");
}
