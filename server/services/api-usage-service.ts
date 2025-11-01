import { db } from '../db';
import { apiUsageLogs, apiPricingTiers, apiKeys } from '@shared/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';

export class ApiUsageService {
  
  async logRequest(params: {
    apiKeyId: string;
    userId: string;
    endpoint: string;
    method: string;
    statusCode?: number;
    responseTime?: number;
    ipAddress?: string;
    userAgent?: string;
    requestParams?: any;
    errorMessage?: string;
  }) {
    try {
      await db.insert(apiUsageLogs).values({
        apiKeyId: params.apiKeyId,
        userId: params.userId,
        endpoint: params.endpoint,
        method: params.method,
        statusCode: params.statusCode,
        responseTime: params.responseTime,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        requestParams: params.requestParams || {},
        errorMessage: params.errorMessage,
      });
    } catch (error) {
      console.error('[API Usage] Failed to log request:', error);
    }
  }

  async checkRateLimit(apiKeyId: string, tier: string): Promise<{
    allowed: boolean;
    limit: number;
    current: number;
    resetAt: Date;
  }> {
    const tierData = await db.select()
      .from(apiPricingTiers)
      .where(eq(apiPricingTiers.tier, tier as any))
      .limit(1);

    if (tierData.length === 0) {
      return { allowed: false, limit: 0, current: 0, resetAt: new Date() };
    }

    const requestsPerMinute = tierData[0].requestsPerMinute;
    
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    const recentRequests = await db.select({ count: sql<number>`count(*)::int` })
      .from(apiUsageLogs)
      .where(and(
        eq(apiUsageLogs.apiKeyId, apiKeyId),
        gte(apiUsageLogs.createdAt, oneMinuteAgo)
      ));

    const currentCount = recentRequests[0]?.count || 0;
    const resetAt = new Date(Date.now() + 60 * 1000);

    return {
      allowed: currentCount < requestsPerMinute,
      limit: requestsPerMinute,
      current: currentCount,
      resetAt,
    };
  }

  async checkMonthlyLimit(userId: string, tier: string): Promise<{
    allowed: boolean;
    limit: number;
    current: number;
    resetAt: Date;
  }> {
    const tierData = await db.select()
      .from(apiPricingTiers)
      .where(eq(apiPricingTiers.tier, tier as any))
      .limit(1);

    if (tierData.length === 0) {
      return { allowed: false, limit: 0, current: 0, resetAt: new Date() };
    }

    const requestsPerMonth = tierData[0].requestsPerMonth;
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthlyRequests = await db.select({ count: sql<number>`count(*)::int` })
      .from(apiUsageLogs)
      .where(and(
        eq(apiUsageLogs.userId, userId),
        gte(apiUsageLogs.createdAt, startOfMonth)
      ));

    const currentCount = monthlyRequests[0]?.count || 0;

    return {
      allowed: currentCount < requestsPerMonth,
      limit: requestsPerMonth,
      current: currentCount,
      resetAt: endOfMonth,
    };
  }

  async getUserUsageStats(userId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const totalRequests = await db.select({ count: sql<number>`count(*)::int` })
      .from(apiUsageLogs)
      .where(and(
        eq(apiUsageLogs.userId, userId),
        gte(apiUsageLogs.createdAt, startDate)
      ));

    const byEndpoint = await db.select({
      endpoint: apiUsageLogs.endpoint,
      count: sql<number>`count(*)::int`,
    })
      .from(apiUsageLogs)
      .where(and(
        eq(apiUsageLogs.userId, userId),
        gte(apiUsageLogs.createdAt, startDate)
      ))
      .groupBy(apiUsageLogs.endpoint)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const byStatus = await db.select({
      statusCode: apiUsageLogs.statusCode,
      count: sql<number>`count(*)::int`,
    })
      .from(apiUsageLogs)
      .where(and(
        eq(apiUsageLogs.userId, userId),
        gte(apiUsageLogs.createdAt, startDate)
      ))
      .groupBy(apiUsageLogs.statusCode)
      .orderBy(desc(sql`count(*)`));

    const successCount = byStatus
      .filter(s => s.statusCode && s.statusCode >= 200 && s.statusCode < 300)
      .reduce((sum, s) => sum + s.count, 0);

    const errorCount = byStatus
      .filter(s => s.statusCode && (s.statusCode >= 400 || s.statusCode === null))
      .reduce((sum, s) => sum + s.count, 0);

    const avgResponseTime = await db.select({
      avg: sql<number>`AVG(${apiUsageLogs.responseTime})::int`,
    })
      .from(apiUsageLogs)
      .where(and(
        eq(apiUsageLogs.userId, userId),
        gte(apiUsageLogs.createdAt, startDate),
        sql`${apiUsageLogs.responseTime} IS NOT NULL`
      ));

    return {
      totalRequests: totalRequests[0]?.count || 0,
      successCount,
      errorCount,
      successRate: totalRequests[0]?.count > 0 
        ? ((successCount / totalRequests[0].count) * 100).toFixed(2)
        : '0',
      avgResponseTime: avgResponseTime[0]?.avg || 0,
      topEndpoints: byEndpoint,
      statusDistribution: byStatus,
    };
  }

  async getUsageTimeline(userId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const timeline = await db.select({
      date: sql<string>`DATE(${apiUsageLogs.createdAt})`,
      count: sql<number>`count(*)::int`,
    })
      .from(apiUsageLogs)
      .where(and(
        eq(apiUsageLogs.userId, userId),
        gte(apiUsageLogs.createdAt, startDate)
      ))
      .groupBy(sql`DATE(${apiUsageLogs.createdAt})`)
      .orderBy(sql`DATE(${apiUsageLogs.createdAt})`);

    return timeline;
  }

  async getApiKeyUsage(apiKeyId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const totalRequests = await db.select({ count: sql<number>`count(*)::int` })
      .from(apiUsageLogs)
      .where(and(
        eq(apiUsageLogs.apiKeyId, apiKeyId),
        gte(apiUsageLogs.createdAt, startDate)
      ));

    const recentLogs = await db.select({
      endpoint: apiUsageLogs.endpoint,
      method: apiUsageLogs.method,
      statusCode: apiUsageLogs.statusCode,
      createdAt: apiUsageLogs.createdAt,
    })
      .from(apiUsageLogs)
      .where(eq(apiUsageLogs.apiKeyId, apiKeyId))
      .orderBy(desc(apiUsageLogs.createdAt))
      .limit(100);

    return {
      totalRequests: totalRequests[0]?.count || 0,
      recentLogs,
    };
  }

  async getCurrentMonthUsage(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const requests = await db.select({ count: sql<number>`count(*)::int` })
      .from(apiUsageLogs)
      .where(and(
        eq(apiUsageLogs.userId, userId),
        gte(apiUsageLogs.createdAt, startOfMonth)
      ));

    return requests[0]?.count || 0;
  }
}

export const apiUsageService = new ApiUsageService();
