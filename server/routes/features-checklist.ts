import { Express, Request, Response } from "express";
import { db } from "../db";
import { features, featureTasks, insertFeatureSchema, insertFeatureTaskSchema, updateFeatureSchema, updateFeatureTaskSchema, updateTaskTestStatusSchema } from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { requireSuperAdmin } from "../wytpass-identity";

/**
 * Features Checklist API Routes
 * Manages project features and testing workflow
 */
export function setupFeaturesChecklistRoutes(app: Express) {

  // ===============================
  // Features Management
  // ===============================

  // GET /api/admin/features - List all features with tasks
  app.get("/api/admin/features", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const allFeatures = await db
        .select()
        .from(features)
        .orderBy(desc(features.createdAt));

      // Get tasks for each feature
      const featuresWithTasks = await Promise.all(
        allFeatures.map(async (feature) => {
          const tasks = await db
            .select()
            .from(featureTasks)
            .where(eq(featureTasks.featureId, feature.id))
            .orderBy(featureTasks.orderIndex);

          return {
            ...feature,
            tasks,
          };
        })
      );

      res.json(featuresWithTasks);
    } catch (error) {
      console.error("Error fetching features:", error);
      res.status(500).json({ error: "Failed to fetch features" });
    }
  });

  // GET /api/admin/features/:id - Get single feature with tasks
  app.get("/api/admin/features/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const [feature] = await db
        .select()
        .from(features)
        .where(eq(features.id, id))
        .limit(1);

      if (!feature) {
        return res.status(404).json({ error: "Feature not found" });
      }

      const tasks = await db
        .select()
        .from(featureTasks)
        .where(eq(featureTasks.featureId, id))
        .orderBy(featureTasks.orderIndex);

      res.json({
        ...feature,
        tasks,
      });
    } catch (error) {
      console.error("Error fetching feature:", error);
      res.status(500).json({ error: "Failed to fetch feature" });
    }
  });

  // POST /api/admin/features - Create new feature
  app.post("/api/admin/features", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertFeatureSchema.parse(req.body);

      // Generate display ID
      const featureCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(features);
      const nextNumber = (Number(featureCount[0]?.count || 0) + 1).toString().padStart(5, '0');
      const displayId = `FT${nextNumber}`;

      const [newFeature] = await db
        .insert(features)
        .values({
          ...validatedData,
          displayId,
        })
        .returning();

      res.status(201).json(newFeature);
    } catch (error) {
      console.error("Error creating feature:", error);
      res.status(500).json({ error: "Failed to create feature" });
    }
  });

  // PATCH /api/admin/features/:id - Update feature
  app.patch("/api/admin/features/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateFeatureSchema.parse(req.body);

      const [updatedFeature] = await db
        .update(features)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(features.id, id))
        .returning();

      if (!updatedFeature) {
        return res.status(404).json({ error: "Feature not found" });
      }

      res.json(updatedFeature);
    } catch (error) {
      console.error("Error updating feature:", error);
      res.status(500).json({ error: "Failed to update feature" });
    }
  });

  // DELETE /api/admin/features/:id - Delete feature
  app.delete("/api/admin/features/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const [deletedFeature] = await db
        .delete(features)
        .where(eq(features.id, id))
        .returning();

      if (!deletedFeature) {
        return res.status(404).json({ error: "Feature not found" });
      }

      res.json({ success: true, message: "Feature deleted" });
    } catch (error) {
      console.error("Error deleting feature:", error);
      res.status(500).json({ error: "Failed to delete feature" });
    }
  });

  // ===============================
  // Tasks Management
  // ===============================

  // POST /api/admin/features/:featureId/tasks - Create new task
  app.post("/api/admin/features/:featureId/tasks", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { featureId } = req.params;
      const validatedData = insertFeatureTaskSchema.parse({
        ...req.body,
        featureId,
      });

      // Generate display ID
      const taskCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(featureTasks);
      const nextNumber = (Number(taskCount[0]?.count || 0) + 1).toString().padStart(5, '0');
      const displayId = `TSK${nextNumber}`;

      // Validate URL pattern if URL provided
      let urlPatternValid = true;
      if (validatedData.url && validatedData.expectedUrlPattern) {
        const pattern = new RegExp(validatedData.expectedUrlPattern.replace('*', '.*'));
        urlPatternValid = pattern.test(validatedData.url);
      }

      const [newTask] = await db
        .insert(featureTasks)
        .values({
          ...validatedData,
          displayId,
          urlPatternValid,
        })
        .returning();

      // Update feature's total tasks count
      await updateFeatureProgress(featureId);

      res.status(201).json(newTask);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  // PATCH /api/admin/tasks/:id - Update task
  app.patch("/api/admin/tasks/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateFeatureTaskSchema.parse(req.body);

      // Validate URL pattern if URL or pattern updated
      let urlPatternValid = undefined;
      if (validatedData.url !== undefined || validatedData.expectedUrlPattern !== undefined) {
        const [currentTask] = await db
          .select()
          .from(featureTasks)
          .where(eq(featureTasks.id, id))
          .limit(1);

        if (currentTask) {
          const url = validatedData.url ?? currentTask.url;
          const pattern = validatedData.expectedUrlPattern ?? currentTask.expectedUrlPattern;

          if (url && pattern) {
            const regex = new RegExp(pattern.replace('*', '.*'));
            urlPatternValid = regex.test(url);
          }
        }
      }

      const [updatedTask] = await db
        .update(featureTasks)
        .set({
          ...validatedData,
          ...(urlPatternValid !== undefined && { urlPatternValid }),
          updatedAt: new Date(),
        })
        .where(eq(featureTasks.id, id))
        .returning();

      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Update feature progress
      await updateFeatureProgress(updatedTask.featureId);

      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // PATCH /api/admin/tasks/:id/test - Update testing status
  app.patch("/api/admin/tasks/:id/test", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateTaskTestStatusSchema.parse(req.body);
      const principal = req.session.wytpassPrincipal;

      const updates: any = {
        updatedAt: new Date(),
      };

      if (validatedData.testType === 'agent') {
        updates.agentTested = validatedData.tested;
        updates.agentTestedAt = validatedData.tested ? new Date() : null;
        updates.agentTestedBy = validatedData.tested ? (principal?.name || 'Replit Agent') : null;
        updates.agentTestComments = validatedData.comments || null;
        updates.status = validatedData.tested ? 'agent_tested' : 'pending';
      } else if (validatedData.testType === 'jkm') {
        updates.jkmTested = validatedData.tested;
        updates.jkmTestedAt = validatedData.tested ? new Date() : null;
        updates.jkmTestComments = validatedData.comments || null;

        // Get current task to check if agent tested
        const [currentTask] = await db
          .select()
          .from(featureTasks)
          .where(eq(featureTasks.id, id))
          .limit(1);

        if (currentTask && currentTask.agentTested && validatedData.tested) {
          updates.status = 'completed';
        } else if (validatedData.tested) {
          updates.status = 'jkm_tested';
        }
      }

      const [updatedTask] = await db
        .update(featureTasks)
        .set(updates)
        .where(eq(featureTasks.id, id))
        .returning();

      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Update feature progress
      await updateFeatureProgress(updatedTask.featureId);

      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating test status:", error);
      res.status(500).json({ error: "Failed to update test status" });
    }
  });

  // DELETE /api/admin/tasks/:id - Delete task
  app.delete("/api/admin/tasks/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const [deletedTask] = await db
        .delete(featureTasks)
        .where(eq(featureTasks.id, id))
        .returning();

      if (!deletedTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Update feature progress
      await updateFeatureProgress(deletedTask.featureId);

      res.json({ success: true, message: "Task deleted" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // ===============================
  // Statistics & Progress
  // ===============================

  // GET /api/admin/features/stats - Get overall statistics
  app.get("/api/admin/features-stats", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [featureStats] = await db
        .select({
          totalFeatures: sql<number>`count(*)`,
          completedFeatures: sql<number>`sum(case when status = 'completed' then 1 else 0 end)`,
          inProgressFeatures: sql<number>`sum(case when status = 'in_progress' then 1 else 0 end)`,
          pendingFeatures: sql<number>`sum(case when status = 'pending' then 1 else 0 end)`,
        })
        .from(features);

      const [taskStats] = await db
        .select({
          totalTasks: sql<number>`count(*)`,
          agentTestedTasks: sql<number>`sum(case when agent_tested = true then 1 else 0 end)`,
          jkmTestedTasks: sql<number>`sum(case when jkm_tested = true then 1 else 0 end)`,
          completedTasks: sql<number>`sum(case when status = 'completed' then 1 else 0 end)`,
          pendingJkmTests: sql<number>`sum(case when agent_tested = true and jkm_tested = false then 1 else 0 end)`,
        })
        .from(featureTasks);

      res.json({
        features: featureStats,
        tasks: taskStats,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  console.log("✅ Features Checklist API routes initialized");
}

// Helper function to update feature progress
async function updateFeatureProgress(featureId: string) {
  try {
    const tasks = await db
      .select()
      .from(featureTasks)
      .where(eq(featureTasks.featureId, featureId));

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const agentTestedTasks = tasks.filter(t => t.agentTested).length;
    const jkmTestedTasks = tasks.filter(t => t.jkmTested).length;

    // Update feature status based on progress
    let status = 'pending';
    if (completedTasks === totalTasks && totalTasks > 0) {
      status = 'completed';
    } else if (completedTasks > 0 || agentTestedTasks > 0) {
      status = 'in_progress';
    }

    // Get current feature to check timestamps
    const [currentFeature] = await db
      .select()
      .from(features)
      .where(eq(features.id, featureId))
      .limit(1);

    await db
      .update(features)
      .set({
        totalTasks,
        completedTasks,
        agentTestedTasks,
        jkmTestedTasks,
        status,
        updatedAt: new Date(),
        ...(status === 'completed' && !currentFeature?.completedAt && { completedAt: new Date() }),
        ...(status === 'in_progress' && !currentFeature?.startedAt && { startedAt: new Date() }),
      })
      .where(eq(features.id, featureId));
  } catch (error) {
    console.error("Error updating feature progress:", error);
  }
}
