import {
  users,
  tenants,
  memberships,
  models,
  pages,
  blocks,
  apps,
  appInstalls,
  hubs,
  plans,
  media,
  auditLogs,
  wytidEntities,
  wytidProofs,
  wytidTransfers,
  wytidApiKeys,
  assessmentCategories,
  assessmentQuestions,
  assessmentOptions,
  assessmentSessions,
  assessmentResponses,
  assessmentResults,
  type User,
  type UpsertUser,
  type Tenant,
  type Model,
  type Page,
  type Block,
  type App,
  type AppInstall,
  type Hub,
  type Plan,
  type Media,
  type AuditLog,
  type InsertModel,
  type InsertPage,
  type InsertBlock,
  type InsertApp,
  type InsertHub,
  type InsertPlan,
  type InsertMedia,
  type AssessmentCategory,
  type AssessmentQuestion,
  type AssessmentOption,
  type AssessmentSession,
  type AssessmentResponse,
  type AssessmentResult,
  type InsertAssessmentSession,
  type InsertAssessmentResponse,
  type InsertAssessmentResult,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, count, sql } from "drizzle-orm";
import { DSLValidator, CodeGenerator } from "@packages/builder/index";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Dashboard and analytics
  getDashboardStats(tenantId: string): Promise<{
    activeTenants: number;
    deployedApps: number;
    activeHubs: number;
    revenue: string;
    tenantsTrend: { value: number; isPositive: boolean };
    appsTrend: { value: number; isPositive: boolean };
    hubsTrend: { value: number; isPositive: boolean };
    revenueTrend: { value: number; isPositive: boolean };
  }>;

  // Tenant operations
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
  createTenant(data: any): Promise<Tenant>;

  // Model/Module operations
  getModelsByTenant(tenantId: string): Promise<Model[]>;
  getModel(id: string, tenantId: string): Promise<Model | undefined>;
  createModel(data: InsertModel): Promise<Model>;
  updateModel(id: string, data: any, tenantId: string): Promise<Model | undefined>;
  deleteModel(id: string, tenantId: string): Promise<boolean>;

  // DSL and code generation
  validateModelDSL(dsl: any): Promise<{ valid: boolean; errors: string[]; data?: any }>;
  generateModelCode(modelId: string, tenantId: string): Promise<{
    prismaModel: string;
    zodSchemas: string;
    nestController: string;
    nestService: string;
    nextAdminPages: string[];
    migration: string;
  }>;

  // Page operations
  getPagesByTenant(tenantId: string): Promise<Page[]>;
  getPage(id: string, tenantId: string): Promise<Page | undefined>;
  createPage(data: InsertPage): Promise<Page>;
  updatePage(id: string, data: any, tenantId: string): Promise<Page | undefined>;
  deletePage(id: string, tenantId: string): Promise<boolean>;
  publishPage(id: string, tenantId: string): Promise<Page | undefined>;

  // Block operations
  getBlocksByTenant(tenantId: string): Promise<Block[]>;
  getBlock(id: string, tenantId: string): Promise<Block | undefined>;
  createBlock(data: InsertBlock): Promise<Block>;
  updateBlock(id: string, data: any, tenantId: string): Promise<Block | undefined>;
  deleteBlock(id: string, tenantId: string): Promise<boolean>;

  // App operations
  getAppsByTenant(tenantId?: string): Promise<App[]>;
  getApp(id: string): Promise<App | undefined>;
  createApp(data: InsertApp): Promise<App>;
  updateApp(id: string, data: any): Promise<App | undefined>;
  deleteApp(id: string): Promise<boolean>;
  publishApp(id: string): Promise<App | undefined>;

  // App installation operations
  getAppInstalls(tenantId: string): Promise<AppInstall[]>;
  installApp(appId: string, tenantId: string, installedBy: string): Promise<AppInstall>;
  uninstallApp(appId: string, tenantId: string): Promise<boolean>;

  // Hub operations
  getAllHubs(): Promise<Hub[]>;
  getHub(id: string): Promise<Hub | undefined>;
  createHub(data: InsertHub): Promise<Hub>;
  updateHub(id: string, data: any): Promise<Hub | undefined>;
  deleteHub(id: string): Promise<boolean>;

  // Plan operations
  getPlans(): Promise<Plan[]>;
  getPlan(id: string): Promise<Plan | undefined>;
  createPlan(data: InsertPlan): Promise<Plan>;
  updatePlan(id: string, data: any): Promise<Plan | undefined>;
  deletePlan(id: string): Promise<boolean>;

  // Media operations
  getMediaByTenant(tenantId: string): Promise<Media[]>;
  createMedia(data: InsertMedia): Promise<Media>;
  deleteMedia(id: string, tenantId: string): Promise<boolean>;

  // Activity and audit
  getRecentActivity(tenantId?: string): Promise<AuditLog[]>;
  logActivity(data: any): Promise<AuditLog>;

  // WytID operations
  getWytIDStats(tenantId: string): Promise<{
    totalEntities: number;
    entitiesByType: Record<string, number>;
    totalProofs: number;
    proofsByType: Record<string, number>;
    totalTransfers: number;
    recentActivity: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT - mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUser(userData.id!);
    if (existingUser) {
      // Update existing user
      const [user] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id!))
        .returning();
      return user;
    }

    // Create default tenant for new user
    let tenantId = userData.tenantId;
    if (!tenantId) {
      const defaultTenant = await this.createTenant({
        name: `${userData.firstName || 'User'}'s Organization`,
        slug: `user-${userData.id}-org`,
        subdomain: `user-${userData.id}`,
        status: 'active',
        settings: {
          theme: 'default',
          features: ['crud', 'cms', 'apps', 'hubs']
        }
      });
      tenantId = defaultTenant.id;
    }

    // Create new user with tenant
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        tenantId,
      })
      .returning();

    // Create membership record
    await db.insert(memberships).values({
      userId: user.id,
      tenantId: tenantId,
      role: 'owner',
      status: 'active',
      permissions: {
        admin: true,
        manage_users: true,
        manage_apps: true,
        manage_billing: true
      }
    });

    return user;
  }

  // Dashboard and analytics
  async getDashboardStats(tenantId: string): Promise<{
    activeTenants: number;
    deployedApps: number;
    activeHubs: number;
    revenue: string;
    tenantsTrend: { value: number; isPositive: boolean };
    appsTrend: { value: number; isPositive: boolean };
    hubsTrend: { value: number; isPositive: boolean };
    revenueTrend: { value: number; isPositive: boolean };
  }> {
    // Get counts
    const [tenantCount] = await db.select({ count: count() }).from(tenants);
    const [appCount] = await db.select({ count: count() }).from(apps).where(eq(apps.status, 'published'));
    const [hubCount] = await db.select({ count: count() }).from(hubs).where(eq(hubs.status, 'active'));
    
    // Mock revenue calculation - in real app would come from billing/payment data
    const revenue = "24.5L";

    return {
      activeTenants: tenantCount.count,
      deployedApps: appCount.count,
      activeHubs: hubCount.count,
      revenue,
      tenantsTrend: { value: 12.5, isPositive: true },
      appsTrend: { value: 8.2, isPositive: true },
      hubsTrend: { value: 15.3, isPositive: true },
      revenueTrend: { value: 22.1, isPositive: true },
    };
  }

  // Tenant operations
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return tenant;
  }

  async createTenant(data: any): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values(data).returning();
    return tenant;
  }

  // Model/Module operations
  async getModelsByTenant(tenantId: string): Promise<Model[]> {
    return await db.select()
      .from(models)
      .where(eq(models.tenantId, tenantId))
      .orderBy(desc(models.createdAt));
  }

  async getModel(id: string, tenantId: string): Promise<Model | undefined> {
    const [model] = await db.select()
      .from(models)
      .where(and(eq(models.id, id), eq(models.tenantId, tenantId)));
    return model;
  }

  async createModel(data: InsertModel): Promise<Model> {
    const [model] = await db.insert(models).values(data).returning();
    
    // Log activity
    await this.logActivity({
      tenantId: data.tenantId,
      userId: data.createdBy,
      action: 'model_created',
      resource: 'model',
      resourceId: model.id,
      details: { name: data.name, description: data.description },
    });

    return model;
  }

  async updateModel(id: string, data: any, tenantId: string): Promise<Model | undefined> {
    const [model] = await db.update(models)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(models.id, id), eq(models.tenantId, tenantId)))
      .returning();
    
    if (model) {
      await this.logActivity({
        tenantId,
        action: 'model_updated',
        resource: 'model',
        resourceId: id,
        details: data,
      });
    }

    return model;
  }

  async deleteModel(id: string, tenantId: string): Promise<boolean> {
    const result = await db.delete(models)
      .where(and(eq(models.id, id), eq(models.tenantId, tenantId)));
    
    if (result.rowCount && result.rowCount > 0) {
      await this.logActivity({
        tenantId,
        action: 'model_deleted',
        resource: 'model',
        resourceId: id,
        details: {},
      });
      return true;
    }
    return false;
  }

  // DSL and code generation
  async validateModelDSL(dsl: any): Promise<{ valid: boolean; errors: string[]; data?: any }> {
    return DSLValidator.validate(dsl);
  }

  async generateModelCode(modelId: string, tenantId: string): Promise<{
    prismaModel: string;
    zodSchemas: string;
    nestController: string;
    nestService: string;
    nextAdminPages: string[];
    migration: string;
  }> {
    const model = await this.getModel(modelId, tenantId);
    if (!model) {
      throw new Error('Model not found');
    }

    const generated = CodeGenerator.generateFromDSL(model.schema as any, tenantId);
    
    await this.logActivity({
      tenantId,
      action: 'code_generated',
      resource: 'model',
      resourceId: modelId,
      details: { type: 'full_crud' },
    });

    return generated;
  }

  // Page operations
  async getPagesByTenant(tenantId: string): Promise<Page[]> {
    return await db.select()
      .from(pages)
      .where(eq(pages.tenantId, tenantId))
      .orderBy(desc(pages.createdAt));
  }

  async getPage(id: string, tenantId: string): Promise<Page | undefined> {
    const [page] = await db.select()
      .from(pages)
      .where(and(eq(pages.id, id), eq(pages.tenantId, tenantId)));
    return page;
  }

  async createPage(data: InsertPage): Promise<Page> {
    const [page] = await db.insert(pages).values(data).returning();
    
    await this.logActivity({
      tenantId: data.tenantId,
      userId: data.createdBy,
      action: 'page_created',
      resource: 'page',
      resourceId: page.id,
      details: { title: data.title, path: data.path },
    });

    return page;
  }

  async updatePage(id: string, data: any, tenantId: string): Promise<Page | undefined> {
    const [page] = await db.update(pages)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(pages.id, id), eq(pages.tenantId, tenantId)))
      .returning();
    
    if (page) {
      await this.logActivity({
        tenantId,
        action: 'page_updated',
        resource: 'page',
        resourceId: id,
        details: data,
      });
    }

    return page;
  }

  async deletePage(id: string, tenantId: string): Promise<boolean> {
    const result = await db.delete(pages)
      .where(and(eq(pages.id, id), eq(pages.tenantId, tenantId)));
    
    if (result.rowCount && result.rowCount > 0) {
      await this.logActivity({
        tenantId,
        action: 'page_deleted',
        resource: 'page',
        resourceId: id,
        details: {},
      });
      return true;
    }
    return false;
  }

  async publishPage(id: string, tenantId: string): Promise<Page | undefined> {
    const [page] = await db.update(pages)
      .set({ 
        status: 'published', 
        publishedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(and(eq(pages.id, id), eq(pages.tenantId, tenantId)))
      .returning();

    if (page) {
      await this.logActivity({
        tenantId,
        action: 'page_published',
        resource: 'page',
        resourceId: id,
        details: { title: page.title },
      });
    }

    return page;
  }

  // Block operations
  async getBlocksByTenant(tenantId: string): Promise<Block[]> {
    return await db.select()
      .from(blocks)
      .where(eq(blocks.tenantId, tenantId))
      .orderBy(desc(blocks.createdAt));
  }

  async getBlock(id: string, tenantId: string): Promise<Block | undefined> {
    const [block] = await db.select()
      .from(blocks)
      .where(and(eq(blocks.id, id), eq(blocks.tenantId, tenantId)));
    return block;
  }

  async createBlock(data: InsertBlock): Promise<Block> {
    const [block] = await db.insert(blocks).values(data).returning();
    
    await this.logActivity({
      tenantId: data.tenantId,
      userId: data.createdBy,
      action: 'block_created',
      resource: 'block',
      resourceId: block.id,
      details: { name: data.name, type: data.type },
    });

    return block;
  }

  async updateBlock(id: string, data: any, tenantId: string): Promise<Block | undefined> {
    const [block] = await db.update(blocks)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(blocks.id, id), eq(blocks.tenantId, tenantId)))
      .returning();

    if (block) {
      await this.logActivity({
        tenantId,
        action: 'block_updated',
        resource: 'block',
        resourceId: id,
        details: data,
      });
    }

    return block;
  }

  async deleteBlock(id: string, tenantId: string): Promise<boolean> {
    const result = await db.delete(blocks)
      .where(and(eq(blocks.id, id), eq(blocks.tenantId, tenantId)));

    if (result.rowCount && result.rowCount > 0) {
      await this.logActivity({
        tenantId,
        action: 'block_deleted',
        resource: 'block',
        resourceId: id,
        details: {},
      });
      return true;
    }
    return false;
  }

  // App operations
  async getAppsByTenant(tenantId?: string): Promise<App[]> {
    const query = db.select().from(apps);
    
    if (tenantId) {
      return await query.where(eq(apps.tenantId, tenantId)).orderBy(desc(apps.createdAt));
    }
    
    // Return public apps or all apps for super admin
    return await query
      .where(eq(apps.isPublic, true))
      .orderBy(desc(apps.createdAt));
  }

  async getApp(id: string): Promise<App | undefined> {
    const [app] = await db.select().from(apps).where(eq(apps.id, id));
    return app;
  }

  async createApp(data: InsertApp): Promise<App> {
    const [app] = await db.insert(apps).values(data).returning();
    
    await this.logActivity({
      tenantId: data.tenantId || '',
      userId: data.createdBy,
      action: 'app_created',
      resource: 'app',
      resourceId: app.id,
      details: { name: data.name, key: data.key },
    });

    return app;
  }

  async updateApp(id: string, data: any): Promise<App | undefined> {
    const [app] = await db.update(apps)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(apps.id, id))
      .returning();

    if (app) {
      await this.logActivity({
        tenantId: app.tenantId || '',
        action: 'app_updated',
        resource: 'app',
        resourceId: id,
        details: data,
      });
    }

    return app;
  }

  async deleteApp(id: string): Promise<boolean> {
    const result = await db.delete(apps).where(eq(apps.id, id));
    
    if (result.rowCount && result.rowCount > 0) {
      await this.logActivity({
        action: 'app_deleted',
        resource: 'app',
        resourceId: id,
        details: {},
      });
      return true;
    }
    return false;
  }

  async publishApp(id: string): Promise<App | undefined> {
    const [app] = await db.update(apps)
      .set({ 
        status: 'published',
        isPublic: true,
        updatedAt: new Date() 
      })
      .where(eq(apps.id, id))
      .returning();

    if (app) {
      await this.logActivity({
        tenantId: app.tenantId || '',
        action: 'app_published',
        resource: 'app',
        resourceId: id,
        details: { name: app.name },
      });
    }

    return app;
  }

  // App installation operations
  async getAppInstalls(tenantId: string): Promise<AppInstall[]> {
    return await db.select()
      .from(appInstalls)
      .where(eq(appInstalls.tenantId, tenantId))
      .orderBy(desc(appInstalls.installedAt));
  }

  async installApp(appId: string, tenantId: string, installedBy: string): Promise<AppInstall> {
    const [install] = await db.insert(appInstalls).values({
      appId,
      tenantId,
      installedBy,
      status: 'active',
      settings: {},
    }).returning();

    await this.logActivity({
      tenantId,
      userId: installedBy,
      action: 'app_installed',
      resource: 'app_install',
      resourceId: install.id,
      details: { appId },
    });

    return install;
  }

  async uninstallApp(appId: string, tenantId: string): Promise<boolean> {
    const result = await db.delete(appInstalls)
      .where(and(eq(appInstalls.appId, appId), eq(appInstalls.tenantId, tenantId)));

    if (result.rowCount && result.rowCount > 0) {
      await this.logActivity({
        tenantId,
        action: 'app_uninstalled',
        resource: 'app_install',
        details: { appId },
      });
      return true;
    }
    return false;
  }

  // Hub operations
  async getAllHubs(): Promise<Hub[]> {
    return await db.select().from(hubs).orderBy(desc(hubs.createdAt));
  }

  async getHub(id: string): Promise<Hub | undefined> {
    const [hub] = await db.select().from(hubs).where(eq(hubs.id, id));
    return hub;
  }

  async createHub(data: InsertHub): Promise<Hub> {
    const [hub] = await db.insert(hubs).values(data).returning();
    
    await this.logActivity({
      userId: data.createdBy,
      action: 'hub_created',
      resource: 'hub',
      resourceId: hub.id,
      details: { name: data.name, key: data.key, type: data.type },
    });

    return hub;
  }

  async updateHub(id: string, data: any): Promise<Hub | undefined> {
    const [hub] = await db.update(hubs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(hubs.id, id))
      .returning();

    if (hub) {
      await this.logActivity({
        action: 'hub_updated',
        resource: 'hub',
        resourceId: id,
        details: data,
      });
    }

    return hub;
  }

  async deleteHub(id: string): Promise<boolean> {
    const result = await db.delete(hubs).where(eq(hubs.id, id));
    
    if (result.rowCount && result.rowCount > 0) {
      await this.logActivity({
        action: 'hub_deleted',
        resource: 'hub',
        resourceId: id,
        details: {},
      });
      return true;
    }
    return false;
  }

  // Plan operations
  async getPlans(): Promise<Plan[]> {
    return await db.select().from(plans)
      .where(eq(plans.isActive, true))
      .orderBy(asc(plans.price));
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }

  async createPlan(data: InsertPlan): Promise<Plan> {
    const [plan] = await db.insert(plans).values(data).returning();
    
    await this.logActivity({
      action: 'plan_created',
      resource: 'plan',
      resourceId: plan.id,
      details: { name: data.name, price: data.price },
    });

    return plan;
  }

  async updatePlan(id: string, data: any): Promise<Plan | undefined> {
    const [plan] = await db.update(plans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(plans.id, id))
      .returning();

    if (plan) {
      await this.logActivity({
        action: 'plan_updated',
        resource: 'plan',
        resourceId: id,
        details: data,
      });
    }

    return plan;
  }

  async deletePlan(id: string): Promise<boolean> {
    // Soft delete by setting inactive
    const [plan] = await db.update(plans)
      .set({ isActive: false })
      .where(eq(plans.id, id))
      .returning();

    if (plan) {
      await this.logActivity({
        action: 'plan_deleted',
        resource: 'plan',
        resourceId: id,
        details: {},
      });
      return true;
    }
    return false;
  }

  // Media operations
  async getMediaByTenant(tenantId: string): Promise<Media[]> {
    return await db.select()
      .from(media)
      .where(eq(media.tenantId, tenantId))
      .orderBy(desc(media.createdAt));
  }

  async createMedia(data: InsertMedia): Promise<Media> {
    const [mediaFile] = await db.insert(media).values(data).returning();
    
    await this.logActivity({
      tenantId: data.tenantId,
      userId: data.createdBy,
      action: 'media_uploaded',
      resource: 'media',
      resourceId: mediaFile.id,
      details: { filename: data.filename, size: data.size },
    });

    return mediaFile;
  }

  async deleteMedia(id: string, tenantId: string): Promise<boolean> {
    const result = await db.delete(media)
      .where(and(eq(media.id, id), eq(media.tenantId, tenantId)));

    if (result.rowCount && result.rowCount > 0) {
      await this.logActivity({
        tenantId,
        action: 'media_deleted',
        resource: 'media',
        resourceId: id,
        details: {},
      });
      return true;
    }
    return false;
  }

  // Activity and audit
  async getRecentActivity(tenantId?: string): Promise<AuditLog[]> {
    const query = db.select().from(auditLogs);
    
    if (tenantId) {
      return await query
        .where(eq(auditLogs.tenantId, tenantId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(50);
    }
    
    return await query
      .orderBy(desc(auditLogs.createdAt))
      .limit(50);
  }

  async logActivity(data: any): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values({
      tenantId: data.tenantId || null,
      userId: data.userId || null,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId || null,
      details: data.details || {},
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
    }).returning();

    return log;
  }

  // WytID operations
  async getWytIDStats(tenantId: string): Promise<{
    totalEntities: number;
    entitiesByType: Record<string, number>;
    totalProofs: number;
    proofsByType: Record<string, number>;
    totalTransfers: number;
    recentActivity: number;
  }> {
    const [entitiesCount] = await db
      .select({ count: count() })
      .from(wytidEntities)
      .where(eq(wytidEntities.tenantId, tenantId));

    const [proofsCount] = await db
      .select({ count: count() })
      .from(wytidProofs)
      .where(eq(wytidProofs.tenantId, tenantId));

    const [transfersCount] = await db
      .select({ count: count() })
      .from(wytidTransfers)
      .where(eq(wytidTransfers.tenantId, tenantId));

    // Get entities by type
    const entitiesByType = await db
      .select({
        type: wytidEntities.type,
        count: count(),
      })
      .from(wytidEntities)
      .where(eq(wytidEntities.tenantId, tenantId))
      .groupBy(wytidEntities.type);

    // Get proofs by type
    const proofsByType = await db
      .select({
        type: wytidProofs.proofType,
        count: count(),
      })
      .from(wytidProofs)
      .where(eq(wytidProofs.tenantId, tenantId))
      .groupBy(wytidProofs.proofType);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentActivity] = await db
      .select({ count: count() })
      .from(wytidEntities)
      .where(
        and(
          eq(wytidEntities.tenantId, tenantId),
          sql`${wytidEntities.createdAt} >= ${sevenDaysAgo}`
        )
      );

    return {
      totalEntities: entitiesCount.count,
      entitiesByType: Object.fromEntries(
        entitiesByType.map(e => [e.type, e.count])
      ),
      totalProofs: proofsCount.count,
      proofsByType: Object.fromEntries(
        proofsByType.map(p => [p.type, p.count])
      ),
      totalTransfers: transfersCount.count,
      recentActivity: recentActivity.count,
    };
  }
}

export const storage = new DatabaseStorage();
