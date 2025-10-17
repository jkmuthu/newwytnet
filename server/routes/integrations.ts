import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { adminAuthMiddleware } from "../customAuth";
import { requirePermission } from "../permission-middleware";

const router = Router();

// GET /api/admin/integrations - Get all integrations
router.get("/admin/integrations", adminAuthMiddleware, requirePermission('integrations', 'view'), async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT * FROM platform_integrations ORDER BY category, name
    `);

    res.json({ success: true, integrations: result.rows });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    res.status(500).json({ success: false, error: "Failed to fetch integrations" });
  }
});

// POST /api/admin/integrations/:id/configure - Configure integration
router.post("/admin/integrations/:id/configure", adminAuthMiddleware, requirePermission('integrations', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const credentials = req.body;

    await db.execute(sql`
      UPDATE platform_integrations
      SET 
        credentials = ${JSON.stringify(credentials)},
        is_configured = true,
        is_active = true,
        updated_at = NOW()
      WHERE id = ${id}
    `);

    res.json({ success: true, message: "Integration configured successfully" });
  } catch (error) {
    console.error("Error configuring integration:", error);
    res.status(500).json({ success: false, error: "Failed to configure integration" });
  }
});

// POST /api/admin/integrations/:id/toggle - Toggle integration status
router.post("/admin/integrations/:id/toggle", adminAuthMiddleware, requirePermission('integrations', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;

    const current = await db.execute(sql`
      SELECT is_active FROM platform_integrations WHERE id = ${id}
    `);

    if (!current.rows[0]) {
      return res.status(404).json({ success: false, error: "Integration not found" });
    }

    await db.execute(sql`
      UPDATE platform_integrations
      SET is_active = ${!current.rows[0].is_active}, updated_at = NOW()
      WHERE id = ${id}
    `);

    res.json({ success: true, message: "Integration status updated" });
  } catch (error) {
    console.error("Error toggling integration:", error);
    res.status(500).json({ success: false, error: "Failed to toggle integration" });
  }
});

export default router;
