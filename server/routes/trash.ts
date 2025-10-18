import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { adminAuthMiddleware, requireSuperAdmin } from '../customAuth';
import { requirePermission } from '../helpers/routeHelpers';
import { z } from 'zod';

const router = Router();

// ============================================
// USER TRASH MANAGEMENT
// ============================================

// GET /api/admin/trash/users - Get all soft-deleted users (Super Admin only)
router.get("/admin/trash/users", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const deletedUsers = await storage.getDeletedUsers();
    
    res.json({ 
      success: true, 
      users: deletedUsers,
      count: deletedUsers.length 
    });
  } catch (error) {
    console.error("Error fetching deleted users:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch deleted users" 
    });
  }
});

// POST /api/admin/users/:id/soft-delete - Soft delete a user (Super Admin only)
router.post("/admin/users/:id/soft-delete", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminUser = (req as any).adminUser;
    
    if (!adminUser?.id) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }
    
    const user = await storage.softDeleteUser(id, adminUser.id, reason);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "User moved to trash",
      user 
    });
  } catch (error) {
    console.error("Error soft-deleting user:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete user" 
    });
  }
});

// POST /api/admin/trash/users/:id/restore - Restore a soft-deleted user (Super Admin only)
router.post("/admin/trash/users/:id/restore", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    if (!adminUser?.id) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }
    
    const user = await storage.restoreUser(id, adminUser.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found in trash" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "User restored successfully",
      user 
    });
  } catch (error) {
    console.error("Error restoring user:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to restore user" 
    });
  }
});

// DELETE /api/admin/trash/users/:id/permanent - Permanently delete a user (Super Admin only)
router.delete("/admin/trash/users/:id/permanent", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    if (!adminUser?.id) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }
    
    const success = await storage.permanentlyDeleteUser(id, adminUser.id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "User permanently deleted" 
    });
  } catch (error) {
    console.error("Error permanently deleting user:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to permanently delete user" 
    });
  }
});

// ============================================
// TENANT/ORGANIZATION TRASH MANAGEMENT
// ============================================

// GET /api/admin/trash/tenants - Get all soft-deleted tenants (Super Admin only)
router.get("/admin/trash/tenants", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const deletedTenants = await storage.getDeletedTenants();
    
    res.json({ 
      success: true, 
      tenants: deletedTenants,
      count: deletedTenants.length 
    });
  } catch (error) {
    console.error("Error fetching deleted tenants:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch deleted tenants" 
    });
  }
});

// POST /api/admin/tenants/:id/soft-delete - Soft delete a tenant (Super Admin only)
router.post("/admin/tenants/:id/soft-delete", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminUser = (req as any).adminUser;
    
    if (!adminUser?.id) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }
    
    const tenant = await storage.softDeleteTenant(id, adminUser.id, reason);
    
    if (!tenant) {
      return res.status(404).json({ 
        success: false, 
        error: "Tenant not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Tenant moved to trash",
      tenant 
    });
  } catch (error) {
    console.error("Error soft-deleting tenant:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete tenant" 
    });
  }
});

// POST /api/admin/trash/tenants/:id/restore - Restore a soft-deleted tenant (Super Admin only)
router.post("/admin/trash/tenants/:id/restore", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    if (!adminUser?.id) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }
    
    const tenant = await storage.restoreTenant(id, adminUser.id);
    
    if (!tenant) {
      return res.status(404).json({ 
        success: false, 
        error: "Tenant not found in trash" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Tenant restored successfully",
      tenant 
    });
  } catch (error) {
    console.error("Error restoring tenant:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to restore tenant" 
    });
  }
});

// DELETE /api/admin/trash/tenants/:id/permanent - Permanently delete a tenant (Super Admin only)
router.delete("/admin/trash/tenants/:id/permanent", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    if (!adminUser?.id) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }
    
    const success = await storage.permanentlyDeleteTenant(id, adminUser.id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        error: "Tenant not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Tenant permanently deleted" 
    });
  } catch (error) {
    console.error("Error permanently deleting tenant:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to permanently delete tenant" 
    });
  }
});

// ============================================
// HUB TRASH MANAGEMENT
// ============================================

// GET /api/admin/trash/hubs - Get all soft-deleted hubs (Super Admin only)
router.get("/admin/trash/hubs", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const deletedHubs = await storage.getDeletedHubs();
    
    res.json({ 
      success: true, 
      hubs: deletedHubs,
      count: deletedHubs.length 
    });
  } catch (error) {
    console.error("Error fetching deleted hubs:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch deleted hubs" 
    });
  }
});

// POST /api/admin/hubs/:id/soft-delete - Soft delete a hub (Super Admin only)
router.post("/admin/hubs/:id/soft-delete", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminUser = (req as any).adminUser;
    
    if (!adminUser?.id) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }
    
    const hub = await storage.softDeleteHub(id, adminUser.id, reason);
    
    if (!hub) {
      return res.status(404).json({ 
        success: false, 
        error: "Hub not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Hub moved to trash",
      hub 
    });
  } catch (error) {
    console.error("Error soft-deleting hub:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete hub" 
    });
  }
});

// POST /api/admin/trash/hubs/:id/restore - Restore a soft-deleted hub (Super Admin only)
router.post("/admin/trash/hubs/:id/restore", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    if (!adminUser?.id) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }
    
    const hub = await storage.restoreHub(id, adminUser.id);
    
    if (!hub) {
      return res.status(404).json({ 
        success: false, 
        error: "Hub not found in trash" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Hub restored successfully",
      hub 
    });
  } catch (error) {
    console.error("Error restoring hub:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to restore hub" 
    });
  }
});

// DELETE /api/admin/trash/hubs/:id/permanent - Permanently delete a hub (Super Admin only)
router.delete("/admin/trash/hubs/:id/permanent", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    if (!adminUser?.id) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }
    
    const success = await storage.permanentlyDeleteHub(id, adminUser.id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        error: "Hub not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Hub permanently deleted" 
    });
  } catch (error) {
    console.error("Error permanently deleting hub:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to permanently delete hub" 
    });
  }
});

// ============================================
// APP TRASH MANAGEMENT
// ============================================

// GET /api/admin/trash/apps - Get all soft-deleted apps (Super Admin only)
router.get("/admin/trash/apps", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const deletedApps = await storage.getDeletedApps();
    
    res.json({ 
      success: true, 
      apps: deletedApps,
      count: deletedApps.length 
    });
  } catch (error) {
    console.error("Error fetching deleted apps:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch deleted apps" 
    });
  }
});

// POST /api/admin/apps/:id/soft-delete - Soft delete an app (Super Admin only)
router.post("/admin/apps/:id/soft-delete", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminUser = (req as any).adminUser;
    
    if (!adminUser?.id) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }
    
    const app = await storage.softDeleteApp(id, adminUser.id, reason);
    
    if (!app) {
      return res.status(404).json({ 
        success: false, 
        error: "App not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "App moved to trash",
      app 
    });
  } catch (error) {
    console.error("Error soft-deleting app:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete app" 
    });
  }
});

// POST /api/admin/trash/apps/:id/restore - Restore a soft-deleted app (Super Admin only)
router.post("/admin/trash/apps/:id/restore", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    if (!adminUser?.id) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }
    
    const app = await storage.restoreApp(id, adminUser.id);
    
    if (!app) {
      return res.status(404).json({ 
        success: false, 
        error: "App not found in trash" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "App restored successfully",
      app 
    });
  } catch (error) {
    console.error("Error restoring app:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to restore app" 
    });
  }
});

// DELETE /api/admin/trash/apps/:id/permanent - Permanently delete an app (Super Admin only)
router.delete("/admin/trash/apps/:id/permanent", adminAuthMiddleware, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser;
    
    if (!adminUser?.id) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }
    
    const success = await storage.permanentlyDeleteApp(id, adminUser.id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        error: "App not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "App permanently deleted" 
    });
  } catch (error) {
    console.error("Error permanently deleting app:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to permanently delete app" 
    });
  }
});

export default router;
