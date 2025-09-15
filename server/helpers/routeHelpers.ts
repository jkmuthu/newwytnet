import { db } from "../db";
import { sql, eq, desc, and, gte, lte, like, or, ilike } from "drizzle-orm";
import { 
  platformModules, 
  users, 
  tenants, 
  apps, 
  hubs, 
  whatsappUsers,
  assessmentSessions,
  assessmentResponses,
  assessmentResults,
  trademarks,
  trademarkSearches,
  tmNumbers,
  niceClassifications,
  ingestJobs,
  apiIntegrations
} from "@shared/schema";
import type { Principal } from "../customAuth";

// Dashboard data aggregation helpers
export async function getAdminDashboardData() {
  try {
    // Get platform module stats
    const moduleStats = await db
      .select({
        total: sql<number>`count(*)`,
        enabled: sql<number>`count(*) filter (where ${platformModules.status} = 'enabled')`,
        disabled: sql<number>`count(*) filter (where ${platformModules.status} = 'disabled')`
      })
      .from(platformModules);

    // Get user stats
    const userStats = await db
      .select({
        total: sql<number>`count(*)`,
        withTenants: sql<number>`count(*) filter (where ${users.tenantId} is not null)`
      })
      .from(users);

    // Get WhatsApp user stats
    const whatsappStats = await db
      .select({
        total: sql<number>`count(*)`,
        verified: sql<number>`count(*) filter (where ${whatsappUsers.isVerified} = true)`,
        superAdmins: sql<number>`count(*) filter (where ${whatsappUsers.isSuperAdmin} = true)`
      })
      .from(whatsappUsers);

    // Get tenant stats
    const tenantStats = await db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(*) filter (where ${tenants.isActive} = true)`
      })
      .from(tenants);

    // Get app stats
    const appStats = await db
      .select({
        total: sql<number>`count(*)`
      })
      .from(apps);

    // Get hub stats
    const hubStats = await db
      .select({
        total: sql<number>`count(*)`
      })
      .from(hubs);

    // Get assessment stats
    const assessmentStats = await db
      .select({
        sessions: sql<number>`count(distinct ${assessmentSessions.id})`,
        responses: sql<number>`count(distinct ${assessmentResponses.id})`,
        results: sql<number>`count(distinct ${assessmentResults.id})`
      })
      .from(assessmentSessions)
      .leftJoin(assessmentResponses, eq(assessmentSessions.id, assessmentResponses.sessionId))
      .leftJoin(assessmentResults, eq(assessmentSessions.id, assessmentResults.sessionId));

    // Get trademark stats
    const trademarkStats = await db
      .select({
        total: sql<number>`count(*)`,
        registered: sql<number>`count(*) filter (where ${trademarks.status} = 'registered')`,
        pending: sql<number>`count(*) filter (where ${trademarks.status} = 'pending')`,
        searches: sql<number>`count(distinct ${trademarkSearches.id})`
      })
      .from(trademarks)
      .leftJoin(trademarkSearches, eq(trademarks.id, trademarkSearches.id));

    return {
      modules: moduleStats[0] || { total: 0, enabled: 0, disabled: 0 },
      users: userStats[0] || { total: 0, withTenants: 0 },
      whatsappUsers: whatsappStats[0] || { total: 0, verified: 0, superAdmins: 0 },
      tenants: tenantStats[0] || { total: 0, active: 0 },
      apps: appStats[0] || { total: 0 },
      hubs: hubStats[0] || { total: 0 },
      assessments: assessmentStats[0] || { sessions: 0, responses: 0, results: 0 },
      trademarks: trademarkStats[0] || { total: 0, registered: 0, pending: 0, searches: 0 }
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}

// Response helpers for consistent API responses
export function successResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message
  };
}

export function errorResponse(message: string, error?: unknown, statusCode?: number) {
  return {
    success: false,
    error: message,
    details: error instanceof Error ? error.message : undefined,
    statusCode: statusCode || 500
  };
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
) {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    message
  };
}

// Validation helpers
export function validatePagination(query: any): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

export function validateSortParams(query: any, allowedFields: string[]): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : allowedFields[0];
  const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';
  
  return { sortBy, sortOrder };
}

// Database query helpers
export async function checkEntityExists(table: any, id: string): Promise<boolean> {
  try {
    const result = await db.select({ id: table.id }).from(table).where(eq(table.id, id)).limit(1);
    return result.length > 0;
  } catch (error) {
    console.error('Error checking entity existence:', error);
    return false;
  }
}

export async function getSafeCount(table: any, condition?: any): Promise<number> {
  try {
    const query = db.select({ count: sql<number>`count(*)` }).from(table);
    if (condition) {
      query.where(condition);
    }
    const result = await query;
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error getting count:', error);
    return 0;
  }
}

// Activity logging helpers
export function logActivity(
  user: Principal,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, any>
) {
  console.log('Activity Log:', {
    userId: user.id,
    userRole: user.role,
    tenantId: user.tenantId,
    action,
    entityType,
    entityId,
    metadata,
    timestamp: new Date().toISOString()
  });
}

// Permission helpers
export function hasPermission(user: Principal, permission: string): boolean {
  // Super admins have all permissions
  if (user.isSuperAdmin) {
    return true;
  }
  
  // For now, only super admins have admin permissions
  if (permission.startsWith('admin:')) {
    return false;
  }
  
  // Regular users have basic permissions
  return ['read:own', 'write:own', 'create:basic'].includes(permission);
}

export function requirePermission(user: Principal, permission: string): boolean {
  if (!hasPermission(user, permission)) {
    throw new Error(`Access denied: ${permission} permission required`);
  }
  return true;
}