import { db } from "../../db";
import { wytaiUsage } from "@shared/schema";
import { checkRateLimits } from "./validator";

export interface UsageStats {
  daily: { used: number; limit: number; remaining: number };
  monthly: { used: number; limit: number; remaining: number };
}

/**
 * Track WytAI usage in database and return fresh stats
 */
export async function trackUsage(
  userId: string,
  model: string,
  provider: string,
  usage: any,
  ipAddress?: string
): Promise<UsageStats | null> {
  try {
    await db.insert(wytaiUsage).values({
      userId,
      model,
      provider,
      promptTokens: usage?.prompt_tokens || 0,
      completionTokens: usage?.completion_tokens || 0,
      totalTokens: usage?.total_tokens || 0,
      requestData: {},
      responseData: { usage },
      ipAddress,
    });

    // Return fresh stats after tracking
    const rateLimitCheck = await checkRateLimits(userId);
    return rateLimitCheck.stats || null;
  } catch (error) {
    console.error("Failed to track WytAI usage:", error);
    return null;
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(userId: string): Promise<UsageStats | null> {
  const rateLimitCheck = await checkRateLimits(userId);
  return rateLimitCheck.stats || null;
}
