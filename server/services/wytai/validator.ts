import { db } from "../../db";
import { wytaiUsage, users } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";

// Rate limits configuration
export const RATE_LIMITS = {
  daily: 100,   // 100 requests per day
  monthly: 2000 // 2000 requests per month
};

export interface RateLimitResult {
  allowed: boolean;
  message?: string;
  stats?: {
    daily: { used: number; limit: number; remaining: number };
    monthly: { used: number; limit: number; remaining: number };
  };
}

/**
 * Check if user has exceeded rate limits
 */
export async function checkRateLimits(userId: string): Promise<RateLimitResult> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get daily usage count
  const dailyUsage = await db.select({
    count: sql<number>`cast(count(*) as int)`,
  })
    .from(wytaiUsage)
    .where(and(
      eq(wytaiUsage.userId, userId),
      gte(wytaiUsage.createdAt, today)
    ));

  // Get monthly usage count
  const monthlyUsage = await db.select({
    count: sql<number>`cast(count(*) as int)`,
  })
    .from(wytaiUsage)
    .where(and(
      eq(wytaiUsage.userId, userId),
      gte(wytaiUsage.createdAt, thisMonth)
    ));

  const dailyCount = dailyUsage[0]?.count || 0;
  const monthlyCount = monthlyUsage[0]?.count || 0;

  const stats = {
    daily: { used: dailyCount, limit: RATE_LIMITS.daily, remaining: RATE_LIMITS.daily - dailyCount },
    monthly: { used: monthlyCount, limit: RATE_LIMITS.monthly, remaining: RATE_LIMITS.monthly - monthlyCount },
  };

  if (dailyCount >= RATE_LIMITS.daily) {
    return {
      allowed: false,
      message: `Daily limit of ${RATE_LIMITS.daily} requests exceeded. Try again tomorrow.`,
      stats,
    };
  }

  if (monthlyCount >= RATE_LIMITS.monthly) {
    return {
      allowed: false,
      message: `Monthly limit of ${RATE_LIMITS.monthly} requests exceeded. Limit resets next month.`,
      stats,
    };
  }

  return { allowed: true, stats };
}

/**
 * Check if user has access to WytAI (Super Admin only)
 */
export async function checkWytAIAccess(userId: string): Promise<boolean> {
  const user = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!user || user.length === 0) return false;
  
  // Only Super Admins have access to WytAI
  return user[0].isSuperAdmin === true;
}
