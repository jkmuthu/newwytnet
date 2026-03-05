import { Express, Request, Response } from "express";
import { db } from "../db";
import { dynamicModules, dynamicModuleEntries } from "@shared/schema";
import { eq, desc, ilike, sql, and } from "drizzle-orm";
import { requireSuperAdmin } from "../wytpass-identity";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 100);
}

function generateCSV(fields: any[], entries: any[]): string {
  const fieldNames = fields.map((f: any) => f.name || f.label);
  const headers = ["#", ...fieldNames, "status", "submitted_at"].join(",");
  const rows = entries.map((entry: any, i: number) => {
    const data = entry.data || {};
    const values = fieldNames.map((name: string) => {
      const val = data[name] ?? "";
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    return [i + 1, ...values, entry.status, entry.submittedAt?.toISOString?.() ?? ""].join(",");
  });
  return [headers, ...rows].join("\n");
}

export function setupDynamicModulesRoutes(app: Express) {

  // GET /api/dynamic-modules — list all modules
  app.get("/api/dynamic-modules", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const modules = await db
        .select()
        .from(dynamicModules)
        .orderBy(desc(dynamicModules.createdAt));
      res.json({ success: true, modules });
    } catch (error) {
      console.error("List dynamic modules error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch modules" });
    }
  });

  // POST /api/dynamic-modules — create module
  app.post("/api/dynamic-modules", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      if (!name?.trim()) {
        return res.status(400).json({ success: false, error: "Module name is required" });
      }

      const baseSlug = generateSlug(name.trim());
      let slug = baseSlug;
      let attempt = 0;
      while (true) {
        const [existing] = await db
          .select({ id: dynamicModules.id })
          .from(dynamicModules)
          .where(eq(dynamicModules.slug, slug))
          .limit(1);
        if (!existing) break;
        attempt++;
        slug = `${baseSlug}_${attempt}`;
      }

      const principal = (req as any).wytpassUser;
      const [mod] = await db
        .insert(dynamicModules)
        .values({
          name: name.trim(),
          slug,
          description: description?.trim() || null,
          status: "draft",
          fields: [],
          settings: {
            successAction: "message",
            successMessage: "Thank you for your submission!",
            maxEntries: 0,
            maxPerUser: 0,
            requireLogin: false,
            allowMultiple: true,
            notifyAdmin: true,
            notifyEmails: "",
            emailSubject: `New submission: ${name.trim()}`,
            notificationFormat: "plain",
            sendConfirmation: false,
            honeypot: true,
            rateLimiting: true,
            maxPerIpPerHour: 5,
            recaptcha: false,
          },
          entryCount: 0,
          createdBy: principal?.id || null,
        })
        .returning();

      res.json({ success: true, module: mod });
    } catch (error) {
      console.error("Create dynamic module error:", error);
      res.status(500).json({ success: false, error: "Failed to create module" });
    }
  });

  // GET /api/dynamic-modules/:id — get single module
  app.get("/api/dynamic-modules/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [mod] = await db
        .select()
        .from(dynamicModules)
        .where(eq(dynamicModules.id, req.params.id))
        .limit(1);

      if (!mod) return res.status(404).json({ success: false, error: "Module not found" });
      res.json({ success: true, module: mod });
    } catch (error) {
      console.error("Get dynamic module error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch module" });
    }
  });

  // PUT /api/dynamic-modules/:id — update module
  app.put("/api/dynamic-modules/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { name, description, status, fields, settings } = req.body;

      const updateData: Partial<typeof dynamicModules.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (fields !== undefined) updateData.fields = fields;
      if (settings !== undefined) updateData.settings = settings;

      const [mod] = await db
        .update(dynamicModules)
        .set(updateData)
        .where(eq(dynamicModules.id, req.params.id))
        .returning();

      if (!mod) return res.status(404).json({ success: false, error: "Module not found" });
      res.json({ success: true, module: mod });
    } catch (error) {
      console.error("Update dynamic module error:", error);
      res.status(500).json({ success: false, error: "Failed to update module" });
    }
  });

  // DELETE /api/dynamic-modules/:id — delete module (cascades entries)
  app.delete("/api/dynamic-modules/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(dynamicModules).where(eq(dynamicModules.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete dynamic module error:", error);
      res.status(500).json({ success: false, error: "Failed to delete module" });
    }
  });

  // POST /api/dynamic-modules/:id/duplicate — clone module
  app.post("/api/dynamic-modules/:id/duplicate", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [original] = await db
        .select()
        .from(dynamicModules)
        .where(eq(dynamicModules.id, req.params.id))
        .limit(1);

      if (!original) return res.status(404).json({ success: false, error: "Module not found" });

      const baseName = `${original.name} (Copy)`;
      const baseSlug = generateSlug(baseName);
      let slug = baseSlug;
      let attempt = 0;
      while (true) {
        const [existing] = await db
          .select({ id: dynamicModules.id })
          .from(dynamicModules)
          .where(eq(dynamicModules.slug, slug))
          .limit(1);
        if (!existing) break;
        attempt++;
        slug = `${baseSlug}_${attempt}`;
      }

      const principal = (req as any).wytpassUser;
      const [mod] = await db
        .insert(dynamicModules)
        .values({
          name: baseName,
          slug,
          description: original.description,
          status: "draft",
          fields: original.fields as any,
          settings: original.settings as any,
          entryCount: 0,
          createdBy: principal?.id || null,
        })
        .returning();

      res.json({ success: true, module: mod });
    } catch (error) {
      console.error("Duplicate dynamic module error:", error);
      res.status(500).json({ success: false, error: "Failed to duplicate module" });
    }
  });

  // GET /api/dynamic-modules/:id/entries — list entries (paginated + searchable)
  app.get("/api/dynamic-modules/:id/entries", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const entries = await db
        .select()
        .from(dynamicModuleEntries)
        .where(eq(dynamicModuleEntries.moduleId, req.params.id))
        .orderBy(desc(dynamicModuleEntries.submittedAt))
        .limit(limit)
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(dynamicModuleEntries)
        .where(eq(dynamicModuleEntries.moduleId, req.params.id));

      res.json({ success: true, entries, total: count, page, limit });
    } catch (error) {
      console.error("List entries error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch entries" });
    }
  });

  // PATCH /api/dynamic-modules/:id/entries/:entryId — update entry status
  app.patch("/api/dynamic-modules/:id/entries/:entryId", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const [entry] = await db
        .update(dynamicModuleEntries)
        .set({ status })
        .where(and(
          eq(dynamicModuleEntries.id, req.params.entryId),
          eq(dynamicModuleEntries.moduleId, req.params.id)
        ))
        .returning();

      if (!entry) return res.status(404).json({ success: false, error: "Entry not found" });
      res.json({ success: true, entry });
    } catch (error) {
      console.error("Update entry error:", error);
      res.status(500).json({ success: false, error: "Failed to update entry" });
    }
  });

  // DELETE /api/dynamic-modules/:id/entries/:entryId — delete entry
  app.delete("/api/dynamic-modules/:id/entries/:entryId", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await db
        .delete(dynamicModuleEntries)
        .where(and(
          eq(dynamicModuleEntries.id, req.params.entryId),
          eq(dynamicModuleEntries.moduleId, req.params.id)
        ));

      // Decrement entry count
      await db
        .update(dynamicModules)
        .set({ entryCount: sql`GREATEST(entry_count - 1, 0)` })
        .where(eq(dynamicModules.id, req.params.id));

      res.json({ success: true });
    } catch (error) {
      console.error("Delete entry error:", error);
      res.status(500).json({ success: false, error: "Failed to delete entry" });
    }
  });

  // GET /api/dynamic-modules/:id/export — export entries as CSV
  app.get("/api/dynamic-modules/:id/export", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [mod] = await db
        .select()
        .from(dynamicModules)
        .where(eq(dynamicModules.id, req.params.id))
        .limit(1);

      if (!mod) return res.status(404).json({ success: false, error: "Module not found" });

      const entries = await db
        .select()
        .from(dynamicModuleEntries)
        .where(eq(dynamicModuleEntries.moduleId, req.params.id))
        .orderBy(desc(dynamicModuleEntries.submittedAt));

      const csv = generateCSV(mod.fields as any[], entries);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${mod.slug}_entries.csv"`);
      res.send(csv);
    } catch (error) {
      console.error("Export entries error:", error);
      res.status(500).json({ success: false, error: "Failed to export entries" });
    }
  });

  // POST /api/dynamic-modules/submit/:slug — PUBLIC submission endpoint
  app.post("/api/dynamic-modules/submit/:slug", async (req: Request, res: Response) => {
    try {
      const [mod] = await db
        .select()
        .from(dynamicModules)
        .where(and(
          eq(dynamicModules.slug, req.params.slug),
          eq(dynamicModules.status, "active")
        ))
        .limit(1);

      if (!mod) return res.status(404).json({ success: false, error: "Module not found or inactive" });

      const settings = mod.settings as any;

      // Honeypot check
      if (settings.honeypot && req.body._honey) {
        return res.json({ success: true, message: settings.successMessage || "Thank you!" });
      }

      // Max entries check
      if (settings.maxEntries > 0 && mod.entryCount >= settings.maxEntries) {
        return res.status(400).json({ success: false, error: "Maximum entries reached" });
      }

      const submitterIp = (req.ip || req.connection?.remoteAddress || "unknown").substring(0, 45);

      await db.insert(dynamicModuleEntries).values({
        moduleId: mod.id,
        data: req.body,
        status: "new",
        submitterIp,
      });

      // Increment entry count
      await db
        .update(dynamicModules)
        .set({ entryCount: sql`entry_count + 1` })
        .where(eq(dynamicModules.id, mod.id));

      const successMsg = settings.successMessage || "Thank you for your submission!";
      res.json({ success: true, message: successMsg });
    } catch (error) {
      console.error("Submit entry error:", error);
      res.status(500).json({ success: false, error: "Submission failed" });
    }
  });

  console.log("✅ Dynamic Modules API routes initialized");
}
