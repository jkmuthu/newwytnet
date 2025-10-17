import { Router } from "express";
import { db } from "../db";
import { media } from "@shared/schema";
import { desc, like, or, and, eq } from "drizzle-orm";
import { adminAuthMiddleware } from "../customAuth";
import { requirePermission } from "../permission-middleware";

const router = Router();

// GET /api/admin/media - List all media files across all tenants (Engine admin view)
router.get("/admin/media", adminAuthMiddleware, requirePermission('media', 'view'), async (req, res) => {
  try {
    const { search, mimeType, limit = '50', offset = '0' } = req.query;
    
    let query = db.select().from(media);
    
    const conditions = [];
    
    // Search filter
    if (search && typeof search === 'string') {
      conditions.push(
        or(
          like(media.filename, `%${search}%`),
          like(media.originalName, `%${search}%`)
        )
      );
    }
    
    // MIME type filter
    if (mimeType && typeof mimeType === 'string') {
      conditions.push(like(media.mimeType, `${mimeType}%`));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const mediaFiles = await query
      .orderBy(desc(media.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    // Get total count
    const totalResult = await db.select({ count: media.id }).from(media);
    const total = totalResult.length;
    
    res.json({
      success: true,
      media: mediaFiles,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ success: false, error: "Failed to fetch media files" });
  }
});

// GET /api/admin/media/stats - Get media statistics
router.get("/admin/media/stats", adminAuthMiddleware, requirePermission('media', 'view'), async (req, res) => {
  try {
    const allMedia = await db.select().from(media);
    
    const stats = {
      totalFiles: allMedia.length,
      totalSize: allMedia.reduce((sum, file) => sum + (file.size || 0), 0),
      byType: {
        images: allMedia.filter(f => f.mimeType?.startsWith('image/')).length,
        videos: allMedia.filter(f => f.mimeType?.startsWith('video/')).length,
        documents: allMedia.filter(f => f.mimeType?.startsWith('application/')).length,
        other: allMedia.filter(f => !f.mimeType?.match(/^(image|video|application)\//)).length,
      },
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching media stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch media statistics" });
  }
});

// DELETE /api/admin/media/:id - Delete media file
router.delete("/admin/media/:id", adminAuthMiddleware, requirePermission('media', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deleted] = await db
      .delete(media)
      .where(eq(media.id, id))
      .returning();
    
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Media file not found" });
    }
    
    res.json({ success: true, message: "Media file deleted successfully" });
  } catch (error) {
    console.error("Error deleting media:", error);
    res.status(500).json({ success: false, error: "Failed to delete media file" });
  }
});

export default router;
