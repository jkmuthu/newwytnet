import { Express, Request, Response } from "express";
import { db } from "../db";
import { qaTestItems, insertQATestItemSchema, updateQATestItemSchema, markJKMTestedSchema } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireSuperAdmin } from "../wytpass-identity";

/**
 * QA Testing Tracker API Routes
 * Simple table-based QA testing tracker for feature verification
 */
export function setupQATestingTrackerRoutes(app: Express) {

  // ===============================
  // QA Test Items Management
  // ===============================

  // GET /api/admin/qa-test-items - List all QA test items
  app.get("/api/admin/qa-test-items", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const items = await db
        .select()
        .from(qaTestItems)
        .orderBy(qaTestItems.orderIndex, desc(qaTestItems.createdAt));

      res.json(items);
    } catch (error) {
      console.error("Error fetching QA test items:", error);
      res.status(500).json({ error: "Failed to fetch QA test items" });
    }
  });

  // GET /api/admin/qa-test-items/:id - Get single QA test item
  app.get("/api/admin/qa-test-items/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const [item] = await db
        .select()
        .from(qaTestItems)
        .where(eq(qaTestItems.id, id))
        .limit(1);

      if (!item) {
        return res.status(404).json({ error: "QA test item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error fetching QA test item:", error);
      res.status(500).json({ error: "Failed to fetch QA test item" });
    }
  });

  // POST /api/admin/qa-test-items - Create new QA test item
  app.post("/api/admin/qa-test-items", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertQATestItemSchema.parse(req.body);

      // Generate display ID
      const itemCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(qaTestItems);
      const nextNumber = (Number(itemCount[0]?.count || 0) + 1).toString().padStart(5, '0');
      const displayId = `QA${nextNumber}`;

      const [newItem] = await db
        .insert(qaTestItems)
        .values({
          ...validatedData,
          displayId,
        })
        .returning();

      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error creating QA test item:", error);
      res.status(500).json({ error: "Failed to create QA test item" });
    }
  });

  // PATCH /api/admin/qa-test-items/:id - Update QA test item
  app.patch("/api/admin/qa-test-items/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateQATestItemSchema.parse(req.body);

      const [updatedItem] = await db
        .update(qaTestItems)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(qaTestItems.id, id))
        .returning();

      if (!updatedItem) {
        return res.status(404).json({ error: "QA test item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating QA test item:", error);
      res.status(500).json({ error: "Failed to update QA test item" });
    }
  });

  // PATCH /api/admin/qa-test-items/:id/agent-test - Mark as agent tested
  app.patch("/api/admin/qa-test-items/:id/agent-test", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tested } = req.body;
      const principal = req.session.wytpassPrincipal;

      const updates: any = {
        agentTested: tested,
        agentTestedAt: tested ? new Date() : null,
        agentTestedBy: tested ? (principal?.name || 'Replit Agent') : null,
        updatedAt: new Date(),
      };

      const [updatedItem] = await db
        .update(qaTestItems)
        .set(updates)
        .where(eq(qaTestItems.id, id))
        .returning();

      if (!updatedItem) {
        return res.status(404).json({ error: "QA test item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating agent test status:", error);
      res.status(500).json({ error: "Failed to update agent test status" });
    }
  });

  // PATCH /api/admin/qa-test-items/:id/jkm-test - Mark as JKM tested
  app.patch("/api/admin/qa-test-items/:id/jkm-test", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = markJKMTestedSchema.parse(req.body);

      const updates: any = {
        jkmTested: validatedData.jkmTested,
        jkmTestedAt: validatedData.jkmTested ? new Date() : null,
        updatedAt: new Date(),
      };

      const [updatedItem] = await db
        .update(qaTestItems)
        .set(updates)
        .where(eq(qaTestItems.id, id))
        .returning();

      if (!updatedItem) {
        return res.status(404).json({ error: "QA test item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating JKM test status:", error);
      res.status(500).json({ error: "Failed to update JKM test status" });
    }
  });

  // DELETE /api/admin/qa-test-items/:id - Delete QA test item
  app.delete("/api/admin/qa-test-items/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const [deletedItem] = await db
        .delete(qaTestItems)
        .where(eq(qaTestItems.id, id))
        .returning();

      if (!deletedItem) {
        return res.status(404).json({ error: "QA test item not found" });
      }

      res.json({ success: true, message: "QA test item deleted" });
    } catch (error) {
      console.error("Error deleting QA test item:", error);
      res.status(500).json({ error: "Failed to delete QA test item" });
    }
  });

  // ===============================
  // Statistics
  // ===============================

  // GET /api/admin/qa-test-stats - Get QA testing statistics
  app.get("/api/admin/qa-test-stats", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [stats] = await db
        .select({
          totalItems: sql<number>`count(*)`,
          agentTestedItems: sql<number>`sum(case when agent_tested = true then 1 else 0 end)`,
          jkmTestedItems: sql<number>`sum(case when jkm_tested = true then 1 else 0 end)`,
          bothTestedItems: sql<number>`sum(case when agent_tested = true and jkm_tested = true then 1 else 0 end)`,
          pendingItems: sql<number>`sum(case when agent_tested = false and jkm_tested = false then 1 else 0 end)`,
        })
        .from(qaTestItems);

      res.json(stats);
    } catch (error) {
      console.error("Error fetching QA test stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  console.log("✅ QA Testing Tracker API routes initialized");
}
