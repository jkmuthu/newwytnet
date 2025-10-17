import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { 
  platformThemes,
  insertPlatformThemeSchema,
  type PlatformTheme,
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { adminAuthMiddleware } from "../customAuth";
import { requirePermission } from "../permission-middleware";

const router = Router();

async function generateDisplayId(prefix: string): Promise<string> {
  const sequenceName = `${prefix.toLowerCase()}_seq`;
  const result = await db.execute(sql`
    SELECT nextval('${sql.raw(sequenceName)}') as next_id
  `);
  const nextId = Number(result.rows[0]?.next_id || 1);
  return `${prefix}${String(nextId).padStart(7, '0')}`;
}

// ============================================
// PLATFORM THEMES MANAGEMENT
// ============================================

// GET /api/admin/themes - Get all themes
router.get("/admin/themes", adminAuthMiddleware, requirePermission('themes', 'view'), async (req, res) => {
  try {
    const allThemes = await db
      .select()
      .from(platformThemes)
      .orderBy(desc(platformThemes.isDefault), desc(platformThemes.createdAt));

    res.json({ success: true, themes: allThemes });
  } catch (error) {
    console.error("Error fetching themes:", error);
    res.status(500).json({ success: false, error: "Failed to fetch themes" });
  }
});

// GET /api/admin/themes/:id - Get theme by ID
router.get("/admin/themes/:id", adminAuthMiddleware, requirePermission('themes', 'view'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [theme] = await db
      .select()
      .from(platformThemes)
      .where(eq(platformThemes.id, id))
      .limit(1);

    if (!theme) {
      return res.status(404).json({ success: false, error: "Theme not found" });
    }

    res.json({ success: true, theme });
  } catch (error) {
    console.error("Error fetching theme:", error);
    res.status(500).json({ success: false, error: "Failed to fetch theme" });
  }
});

// POST /api/admin/themes - Create new theme
router.post("/admin/themes", adminAuthMiddleware, requirePermission('themes', 'create'), async (req, res) => {
  try {
    const validationSchema = insertPlatformThemeSchema.extend({
      colorScheme: z.any().optional(),
      spacing: z.any().optional(),
      borderRadius: z.any().optional(),
      shadows: z.any().optional(),
    });

    const themeData = validationSchema.parse(req.body);
    const displayId = await generateDisplayId('TM');

    // If this is marked as default, unset other defaults
    if (themeData.isDefault) {
      await db.update(platformThemes)
        .set({ isDefault: false })
        .where(eq(platformThemes.isDefault, true));
    }

    const [newTheme] = await db
      .insert(platformThemes)
      .values({
        displayId,
        ...themeData,
        type: 'custom',
      })
      .returning();

    res.status(201).json({ success: true, theme: newTheme });
  } catch (error: any) {
    console.error("Error creating theme:", error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: "Invalid theme data", details: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to create theme" });
  }
});

// PUT /api/admin/themes/:id - Update theme
router.put("/admin/themes/:id", adminAuthMiddleware, requirePermission('themes', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const validationSchema = insertPlatformThemeSchema.partial().extend({
      colorScheme: z.any().optional(),
      spacing: z.any().optional(),
      borderRadius: z.any().optional(),
      shadows: z.any().optional(),
    });

    const updateData = validationSchema.parse(req.body);

    // If this is marked as default, unset other defaults
    if (updateData.isDefault) {
      await db.update(platformThemes)
        .set({ isDefault: false })
        .where(eq(platformThemes.isDefault, true));
    }

    const [updatedTheme] = await db
      .update(platformThemes)
      .set({
        ...updateData,
        updatedAt: sql`NOW()`,
      })
      .where(eq(platformThemes.id, id))
      .returning();

    if (!updatedTheme) {
      return res.status(404).json({ success: false, error: "Theme not found" });
    }

    res.json({ success: true, theme: updatedTheme });
  } catch (error: any) {
    console.error("Error updating theme:", error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: "Invalid theme data", details: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to update theme" });
  }
});

// DELETE /api/admin/themes/:id - Delete theme
router.delete("/admin/themes/:id", adminAuthMiddleware, requirePermission('themes', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if theme is system theme
    const [theme] = await db
      .select()
      .from(platformThemes)
      .where(eq(platformThemes.id, id))
      .limit(1);

    if (!theme) {
      return res.status(404).json({ success: false, error: "Theme not found" });
    }

    if (theme.type === 'system') {
      return res.status(400).json({ 
        success: false, 
        error: "Cannot delete system themes" 
      });
    }

    if (theme.isDefault) {
      return res.status(400).json({ 
        success: false, 
        error: "Cannot delete the default theme. Please set another theme as default first." 
      });
    }

    await db.delete(platformThemes).where(eq(platformThemes.id, id));

    res.json({ success: true, message: "Theme deleted successfully" });
  } catch (error) {
    console.error("Error deleting theme:", error);
    res.status(500).json({ success: false, error: "Failed to delete theme" });
  }
});

// POST /api/admin/themes/:id/set-default - Set theme as default
router.post("/admin/themes/:id/set-default", adminAuthMiddleware, requirePermission('themes', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;

    // Unset all other defaults
    await db.update(platformThemes)
      .set({ isDefault: false })
      .where(eq(platformThemes.isDefault, true));

    // Set this theme as default
    const [updatedTheme] = await db
      .update(platformThemes)
      .set({ 
        isDefault: true, 
        isActive: true,
        updatedAt: sql`NOW()`,
      })
      .where(eq(platformThemes.id, id))
      .returning();

    if (!updatedTheme) {
      return res.status(404).json({ success: false, error: "Theme not found" });
    }

    res.json({ success: true, theme: updatedTheme });
  } catch (error) {
    console.error("Error setting default theme:", error);
    res.status(500).json({ success: false, error: "Failed to set default theme" });
  }
});

// POST /api/admin/themes/:id/toggle-status - Toggle theme active status
router.post("/admin/themes/:id/toggle-status", adminAuthMiddleware, requirePermission('themes', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;

    const [theme] = await db
      .select()
      .from(platformThemes)
      .where(eq(platformThemes.id, id))
      .limit(1);

    if (!theme) {
      return res.status(404).json({ success: false, error: "Theme not found" });
    }

    const [updatedTheme] = await db
      .update(platformThemes)
      .set({ 
        isActive: !theme.isActive,
        updatedAt: sql`NOW()`,
      })
      .where(eq(platformThemes.id, id))
      .returning();

    res.json({ success: true, theme: updatedTheme });
  } catch (error) {
    console.error("Error toggling theme status:", error);
    res.status(500).json({ success: false, error: "Failed to toggle theme status" });
  }
});

export default router;
