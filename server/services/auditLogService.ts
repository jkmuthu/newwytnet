import { db } from '../db';
import { auditLogs } from '../../shared/schema';
import { desc, and, eq, gte, lte, or, like, sql } from 'drizzle-orm';
import type { Request } from 'express';

export interface AuditLogEntry {
  tenantId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export class AuditLogService {
  /**
   * Create an audit log entry
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        tenantId: entry.tenantId || null,
        userId: entry.userId || null,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId || null,
        details: entry.details || {},
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        createdAt: new Date(),
      });

      console.log(`[AuditLog] ${entry.action} on ${entry.resource}${entry.resourceId ? ` (${entry.resourceId})` : ''} by user ${entry.userId || 'system'}`);
    } catch (error) {
      console.error('[AuditLog] Failed to create audit log:', error);
    }
  }

  /**
   * Log from Express request context
   */
  async logFromRequest(req: Request, action: string, resource: string, resourceId?: string, details?: Record<string, any>): Promise<void> {
    const user = (req as any).user || (req as any).adminUser;
    const tenantId = user?.tenantId || null;
    const userId = user?.id || null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await this.log({
      tenantId,
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Get audit logs with filters
   */
  async getLogs(filters: AuditLogFilters = {}) {
    const {
      userId,
      action,
      resource,
      startDate,
      endDate,
      search,
      limit = 50,
      offset = 0,
    } = filters;

    const conditions = [];

    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }

    if (action) {
      conditions.push(eq(auditLogs.action, action));
    }

    if (resource) {
      conditions.push(eq(auditLogs.resource, resource));
    }

    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(auditLogs.createdAt, endDate));
    }

    if (search) {
      conditions.push(
        or(
          like(auditLogs.action, `%${search}%`),
          like(auditLogs.resource, `%${search}%`),
          like(auditLogs.resourceId, `%${search}%`)
        )
      );
    }

    const query = db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }

    return await query;
  }

  /**
   * Get total count of logs matching filters
   */
  async getLogsCount(filters: AuditLogFilters = {}): Promise<number> {
    const {
      userId,
      action,
      resource,
      startDate,
      endDate,
      search,
    } = filters;

    const conditions = [];

    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }

    if (action) {
      conditions.push(eq(auditLogs.action, action));
    }

    if (resource) {
      conditions.push(eq(auditLogs.resource, resource));
    }

    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(auditLogs.createdAt, endDate));
    }

    if (search) {
      conditions.push(
        or(
          like(auditLogs.action, `%${search}%`),
          like(auditLogs.resource, `%${search}%`),
          like(auditLogs.resourceId, `%${search}%`)
        )
      );
    }

    const query = db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs);

    if (conditions.length > 0) {
      const result = await query.where(and(...conditions));
      return result[0]?.count || 0;
    }

    const result = await query;
    return result[0]?.count || 0;
  }

  /**
   * Get recent activity for a user
   */
  async getUserRecentActivity(userId: string, limit: number = 10) {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  /**
   * Get audit summary stats
   */
  async getStats(filters: { startDate?: Date; endDate?: Date } = {}) {
    const conditions = [];

    if (filters.startDate) {
      conditions.push(gte(auditLogs.createdAt, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(auditLogs.createdAt, filters.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalLogs, uniqueUsers, actionCounts] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(whereClause),
      
      db.select({ count: sql<number>`count(distinct user_id)` })
        .from(auditLogs)
        .where(whereClause),
      
      db.select({
        action: auditLogs.action,
        count: sql<number>`count(*)`,
      })
        .from(auditLogs)
        .where(whereClause)
        .groupBy(auditLogs.action)
        .orderBy(desc(sql`count(*)`))
        .limit(10),
    ]);

    return {
      totalLogs: totalLogs[0]?.count || 0,
      uniqueUsers: uniqueUsers[0]?.count || 0,
      topActions: actionCounts,
    };
  }
}

export const auditLogService = new AuditLogService();
