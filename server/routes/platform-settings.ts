import { Router } from "express";
import { db } from "../db";
import { platformSettings, insertPlatformSettingSchema, updatePlatformSettingSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { adminAuthMiddleware } from "../customAuth";
import { requirePermission } from "../permission-middleware";
import { z } from "zod";

const router = Router();

// GET /api/platform-settings/public - Get public platform settings (no auth required)
router.get("/public", async (req, res) => {
  try {
    const settings = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.isPublic, true))
      .orderBy(platformSettings.category, platformSettings.key);

    // Parse values based on type
    const parsedSettings = settings.map(setting => ({
      ...setting,
      parsedValue: setting.value ? parseSettingValue(setting.value, setting.type) : null,
    }));

    res.json({ success: true, settings: parsedSettings });
  } catch (error) {
    console.error("Error fetching public platform settings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
});

// Helper function to parse value based on type
function parseSettingValue(value: string, type: string): any {
  switch (type) {
    case 'number':
      const num = Number(value);
      if (isNaN(num)) throw new Error(`Invalid number value: ${value}`);
      return num;
    case 'boolean':
      if (value === 'true') return true;
      if (value === 'false') return false;
      throw new Error(`Invalid boolean value: ${value}`);
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        throw new Error(`Invalid JSON value: ${value}`);
      }
    default:
      return value;
  }
}

// Helper function to serialize value to string for storage
function serializeSettingValue(value: any, type: string): string {
  switch (type) {
    case 'number':
      return String(value);
    case 'boolean':
      return String(value);
    case 'json':
      return JSON.stringify(value);
    default:
      return String(value);
  }
}

// GET /api/admin/settings - Get all platform settings
router.get("/admin/settings", adminAuthMiddleware, requirePermission('system-security', 'view'), async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = db.select().from(platformSettings);
    
    if (category && typeof category === 'string') {
      query = query.where(eq(platformSettings.category, category)) as any;
    }

    const settings = await query.orderBy(platformSettings.category, platformSettings.key);

    // Parse values based on type
    const parsedSettings = settings.map(setting => ({
      ...setting,
      parsedValue: setting.value ? parseSettingValue(setting.value, setting.type) : null,
    }));

    // Group settings by category
    const grouped = parsedSettings.reduce((acc: any, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    res.json({ success: true, settings: parsedSettings, grouped });
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

    const parsedSetting = {
      ...setting,
      parsedValue: setting.value ? parseSettingValue(setting.value, setting.type) : null,
    };

    res.json({ success: true, setting: parsedSetting });
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({ success: false, error: "Failed to fetch setting" });
  }
});

// PUT /api/admin/settings/:id - Update setting
router.put("/admin/settings/:id", adminAuthMiddleware, requirePermission('system-security', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const validatedData = updatePlatformSettingSchema.parse(req.body);
    
    // Get current setting to check if editable and get type
    const [currentSetting] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.id, id))
      .limit(1);

    if (!currentSetting) {
      return res.status(404).json({ success: false, error: "Setting not found" });
    }

    if (!currentSetting.isEditable) {
      return res.status(403).json({ success: false, error: "This setting is read-only and cannot be modified" });
    }

    // Validate and parse value based on type
    try {
      parseSettingValue(validatedData.value, currentSetting.type);
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const [updated] = await db
      .update(platformSettings)
      .set({
        value: validatedData.value,
        updatedBy: (req.user as any)?.id || null,
        updatedAt: new Date(),
      })
      .where(eq(platformSettings.id, id))
      .returning();

    res.json({ success: true, setting: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Invalid request data", details: error.errors });
    }
    console.error("Error updating setting:", error);
    res.status(500).json({ success: false, error: "Failed to update setting" });
  }
});

// POST /api/admin/settings - Create new setting
router.post("/admin/settings", adminAuthMiddleware, requirePermission('system-security', 'create'), async (req, res) => {
  try {
    // Validate request body
    const validatedData = insertPlatformSettingSchema.parse(req.body);
    
    // Check if key already exists
    const [existing] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, validatedData.key))
      .limit(1);

    if (existing) {
      return res.status(409).json({ success: false, error: `Setting with key '${validatedData.key}' already exists` });
    }

    // Validate value if provided
    if (validatedData.value) {
      try {
        parseSettingValue(validatedData.value, validatedData.type);
      } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
      }
    }

    const [newSetting] = await db
      .insert(platformSettings)
      .values({
        ...validatedData,
        updatedBy: (req.user as any)?.id || null,
      })
      .returning();

    res.json({ success: true, setting: newSetting });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Invalid request data", details: error.errors });
    }
    console.error("Error creating setting:", error);
    res.status(500).json({ success: false, error: "Failed to create setting" });
  }
});

// GET /api/admin/settings/authentication - Get all authentication-related settings
router.get("/admin/settings/authentication", adminAuthMiddleware, async (req, res) => {
  try {
    const authKeys = [
      'email_validation_required',
      'password_min_length',
      'password_require_uppercase',
      'password_require_numbers',
      'password_require_special_chars',
      'enabled_auth_providers',
      'allow_hub_override_auth'
    ];

    const settings = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.category, 'security'));

    // Filter to only auth-related settings and parse values
    const authSettings = settings
      .filter(s => authKeys.includes(s.key))
      .reduce((acc: any, setting) => {
        acc[setting.key] = setting.value ? parseSettingValue(setting.value, setting.type) : null;
        return acc;
      }, {});

    res.json({ success: true, settings: authSettings });
  } catch (error) {
    console.error("Error fetching authentication settings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch authentication settings" });
  }
});

// PUT /api/admin/settings/authentication - Update authentication settings
router.put("/admin/settings/authentication", adminAuthMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user?.isSuperAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied: Super Admin required' 
      });
    }

    const updates = req.body;
    const authKeys = [
      'email_validation_required',
      'password_min_length',
      'password_require_uppercase',
      'password_require_numbers',
      'password_require_special_chars',
      'enabled_auth_providers',
      'allow_hub_override_auth'
    ];

    // Update each setting
    for (const [key, value] of Object.entries(updates)) {
      if (!authKeys.includes(key)) {
        continue; // Skip non-auth settings
      }

      const [setting] = await db
        .select()
        .from(platformSettings)
        .where(eq(platformSettings.key, key))
        .limit(1);

      if (setting && setting.isEditable) {
        const serializedValue = serializeSettingValue(value, setting.type);
        
        await db
          .update(platformSettings)
          .set({
            value: serializedValue,
            updatedBy: user.id,
            updatedAt: new Date(),
          })
          .where(eq(platformSettings.key, key));
      }
    }

    res.json({ success: true, message: "Authentication settings updated successfully" });
  } catch (error) {
    console.error("Error updating authentication settings:", error);
    res.status(500).json({ success: false, error: "Failed to update authentication settings" });
  }
});

// Organization Roles Settings
// GET /api/admin/settings/org-roles - Get organization role definitions
router.get("/admin/settings/org-roles", adminAuthMiddleware, async (req, res) => {
  try {
    // Get org-roles setting from platform settings
    const [setting] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, 'org_roles'))
      .limit(1);

    if (setting && setting.value) {
      const roles = JSON.parse(setting.value);
      res.json({ success: true, roles });
    } else {
      // Return default roles if not configured
      const defaultRoles = [
        {
          id: 'owner',
          name: 'Owner',
          slug: 'owner',
          description: 'Full access to all organization features. Cannot be modified.',
          isSystem: true,
          permissions: {
            dashboard: { view: true, add: true, edit: true, delete: true },
            wytwall: { view: true, add: true, edit: true, delete: true },
            wytapps: { view: true, add: true, edit: true, delete: true },
            team: { view: true, add: true, edit: true, delete: true },
            projects: { view: true, add: true, edit: true, delete: true },
            billing: { view: true, add: true, edit: true, delete: true },
            settings: { view: true, add: true, edit: true, delete: true },
          },
        },
        {
          id: 'admin',
          name: 'Admin',
          slug: 'admin',
          description: 'Can manage team members and most organization settings.',
          isSystem: true,
          permissions: {
            dashboard: { view: true, add: true, edit: true, delete: true },
            wytwall: { view: true, add: true, edit: true, delete: true },
            wytapps: { view: true, add: true, edit: true, delete: true },
            team: { view: true, add: true, edit: true, delete: true },
            projects: { view: true, add: true, edit: true, delete: true },
            billing: { view: true, add: false, edit: false, delete: false },
            settings: { view: true, add: true, edit: true, delete: false },
          },
        },
        {
          id: 'analyst',
          name: 'Analyst',
          slug: 'analyst',
          description: 'Can view data and create reports. Limited editing access.',
          isSystem: true,
          permissions: {
            dashboard: { view: true, add: false, edit: false, delete: false },
            wytwall: { view: true, add: true, edit: false, delete: false },
            wytapps: { view: true, add: false, edit: false, delete: false },
            team: { view: true, add: false, edit: false, delete: false },
            projects: { view: true, add: false, edit: false, delete: false },
            billing: { view: false, add: false, edit: false, delete: false },
            settings: { view: false, add: false, edit: false, delete: false },
          },
        },
        {
          id: 'custom',
          name: 'Custom',
          slug: 'custom',
          description: 'Fully customizable permissions set by the organization owner.',
          isSystem: true,
          permissions: {
            dashboard: { view: true, add: false, edit: false, delete: false },
            wytwall: { view: true, add: false, edit: false, delete: false },
            wytapps: { view: true, add: false, edit: false, delete: false },
            team: { view: true, add: false, edit: false, delete: false },
            projects: { view: true, add: false, edit: false, delete: false },
            billing: { view: false, add: false, edit: false, delete: false },
            settings: { view: false, add: false, edit: false, delete: false },
          },
        },
      ];
      res.json({ success: true, roles: defaultRoles });
    }
  } catch (error) {
    console.error("Error fetching org roles:", error);
    res.status(500).json({ success: false, error: "Failed to fetch organization roles" });
  }
});

// POST /api/admin/settings/org-roles - Save organization role definitions
router.post("/admin/settings/org-roles", adminAuthMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user?.isSuperAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied: Super Admin required' 
      });
    }

    const { roles } = req.body;
    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({ success: false, error: "Invalid roles data" });
    }

    // Check if setting exists
    const [existing] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, 'org_roles'))
      .limit(1);

    const rolesJson = JSON.stringify(roles);

    if (existing) {
      // Update existing
      await db
        .update(platformSettings)
        .set({
          value: rolesJson,
          updatedBy: user.id,
          updatedAt: new Date(),
        })
        .where(eq(platformSettings.key, 'org_roles'));
    } else {
      // Create new setting
      await db
        .insert(platformSettings)
        .values({
          key: 'org_roles',
          value: rolesJson,
          type: 'json',
          label: 'Organization Roles',
          description: 'Role definitions and permissions for organization users',
          category: 'organizations',
          isEditable: true,
          isPublic: false,
          createdBy: user.id,
        });
    }

    res.json({ success: true, message: "Organization roles saved successfully" });
  } catch (error) {
    console.error("Error saving org roles:", error);
    res.status(500).json({ success: false, error: "Failed to save organization roles" });
  }
});

export default router;
