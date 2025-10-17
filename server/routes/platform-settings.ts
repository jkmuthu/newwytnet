import { Router } from "express";
import { db } from "../db";
import { platformSettings } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { adminAuthMiddleware } from "../customAuth";
import { requirePermission } from "../permission-middleware";

const router = Router();

// GET /api/admin/settings - Get all platform settings
router.get("/admin/settings", adminAuthMiddleware, requirePermission('system-security', 'view'), async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = db.select().from(platformSettings);
    
    if (category && typeof category === 'string') {
      query = query.where(eq(platformSettings.category, category)) as any;
    }

    const settings = await query.orderBy(platformSettings.category, platformSettings.key);

    // Group settings by category
    const grouped = settings.reduce((acc: any, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    res.json({ success: true, settings, grouped });
  } catch (error) {
    console.error("Error fetching platform settings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
});

// GET /api/admin/settings/:key - Get setting by key
router.get("/admin/settings/:key", adminAuthMiddleware, requirePermission('system-security', 'view'), async (req, res) => {
  try {
    const { key } = req.params;
    
    const [setting] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, key))
      .limit(1);

    if (!setting) {
      return res.status(404).json({ success: false, error: "Setting not found" });
    }

    res.json({ success: true, setting });
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({ success: false, error: "Failed to fetch setting" });
  }
});

// PUT /api/admin/settings/:id - Update setting
router.put("/admin/settings/:id", adminAuthMiddleware, requirePermission('system-security', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    
    const [updated] = await db
      .update(platformSettings)
      .set({
        value: String(value),
        updatedBy: (req.user as any)?.id || null,
        updatedAt: new Date(),
      })
      .where(eq(platformSettings.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, error: "Setting not found" });
    }

    res.json({ success: true, setting: updated });
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({ success: false, error: "Failed to update setting" });
  }
});

// POST /api/admin/settings - Create new setting
router.post("/admin/settings", adminAuthMiddleware, requirePermission('system-security', 'create'), async (req, res) => {
  try {
    const { key, value, type, category, label, description, isPublic, isEditable } = req.body;
    
    const [newSetting] = await db
      .insert(platformSettings)
      .values({
        key,
        value: String(value),
        type: type || 'string',
        category,
        label,
        description,
        isPublic: isPublic || false,
        isEditable: isEditable !== false,
        updatedBy: (req.user as any)?.id || null,
      })
      .returning();

    res.json({ success: true, setting: newSetting });
  } catch (error) {
    console.error("Error creating setting:", error);
    res.status(500).json({ success: false, error: "Failed to create setting" });
  }
});

export default router;
