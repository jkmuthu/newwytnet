import { db } from '../db';
import { 
  apps, 
  appPlanSubscriptions, 
  appPricingPlans,
  appUsageLogs,
  type AppPlanSubscription,
  type AppPricingPlan,
  type AppUsageLog
} from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { pointsService } from './pointsService';

export interface UsageCheckResult {
  allowed: boolean;
  reason: string;
  balance: number;
  cost: number;
  subscriptionType: 'free' | 'monthly' | 'yearly' | 'pay_per_use' | 'one_time' | null;
  subscription: AppPlanSubscription | null;
}

export interface UsageRecordResult {
  success: boolean;
  logId: string;
  pointsDeducted: number;
  newBalance: number;
  error?: string;
}

export class AppUsageService {
  /**
   * Check if user can use a pay-per-use app feature
   */
  async checkUsagePermission(userId: string, appSlug: string): Promise<UsageCheckResult> {
    try {
      const app = await db.select().from(apps).where(eq(apps.slug, appSlug)).limit(1);
      
      if (!app.length) {
        return {
          allowed: false,
          reason: 'App not found',
          balance: 0,
          cost: 0,
          subscriptionType: null,
          subscription: null
        };
      }

      const appId = app[0].id;

      const subscription = await db.select()
        .from(appPlanSubscriptions)
        .where(and(
          eq(appPlanSubscriptions.userId, userId),
          eq(appPlanSubscriptions.appId, appId),
          eq(appPlanSubscriptions.status, 'active')
        ))
        .limit(1);

      if (!subscription.length) {
        return {
          allowed: false,
          reason: 'No active subscription for this app',
          balance: 0,
          cost: 0,
          subscriptionType: null,
          subscription: null
        };
      }

      const sub = subscription[0];
      const plan = await db.select()
        .from(appPricingPlans)
        .where(eq(appPricingPlans.id, sub.planId))
        .limit(1);

      if (!plan.length) {
        return {
          allowed: false,
          reason: 'Subscription plan not found',
          balance: 0,
          cost: 0,
          subscriptionType: null,
          subscription: sub
        };
      }

      const planType = plan[0].planType as 'free' | 'monthly' | 'yearly' | 'pay_per_use' | 'one_time';
      const price = parseFloat(plan[0].price || '0');

      if (planType === 'free' || planType === 'monthly' || planType === 'yearly' || planType === 'one_time') {
        if (sub.endDate && new Date(sub.endDate) < new Date()) {
          return {
            allowed: false,
            reason: 'Subscription expired',
            balance: 0,
            cost: 0,
            subscriptionType: planType,
            subscription: sub
          };
        }
        return {
          allowed: true,
          reason: 'Active subscription',
          balance: 0,
          cost: 0,
          subscriptionType: planType,
          subscription: sub
        };
      }

      if (planType === 'pay_per_use') {
        const balance = await pointsService.getBalance(userId);
        const cost = price;

        if (balance < cost) {
          return {
            allowed: false,
            reason: `Insufficient WytPoints. You need ${cost} points but have ${balance}`,
            balance,
            cost,
            subscriptionType: 'pay_per_use',
            subscription: sub
          };
        }

        return {
          allowed: true,
          reason: 'Sufficient balance',
          balance,
          cost,
          subscriptionType: 'pay_per_use',
          subscription: sub
        };
      }

      return {
        allowed: false,
        reason: 'Unknown subscription type',
        balance: 0,
        cost: 0,
        subscriptionType: null,
        subscription: sub
      };
    } catch (error) {
      console.error('[AppUsageService] Error checking usage permission:', error);
      return {
        allowed: false,
        reason: 'Error checking permissions',
        balance: 0,
        cost: 0,
        subscriptionType: null,
        subscription: null
      };
    }
  }

  /**
   * Record app usage and deduct points if pay-per-use
   */
  async recordUsage(
    userId: string, 
    appSlug: string, 
    action: string, 
    metadata: Record<string, any> = {}
  ): Promise<UsageRecordResult> {
    try {
      const check = await this.checkUsagePermission(userId, appSlug);

      if (!check.allowed) {
        const app = await db.select().from(apps).where(eq(apps.slug, appSlug)).limit(1);
        
        if (app.length) {
          const [log] = await db.insert(appUsageLogs).values({
            userId,
            appId: app[0].id,
            subscriptionId: check.subscription?.id || null,
            action,
            pointsDeducted: 0,
            status: 'insufficient_funds',
            metadata,
            errorMessage: check.reason
          }).returning();

          return {
            success: false,
            logId: log.id,
            pointsDeducted: 0,
            newBalance: check.balance,
            error: check.reason
          };
        }

        return {
          success: false,
          logId: '',
          pointsDeducted: 0,
          newBalance: 0,
          error: check.reason
        };
      }

      const app = await db.select().from(apps).where(eq(apps.slug, appSlug)).limit(1);
      if (!app.length) {
        return {
          success: false,
          logId: '',
          pointsDeducted: 0,
          newBalance: 0,
          error: 'App not found'
        };
      }

      let newBalance = check.balance;
      let pointsDeducted = 0;

      if (check.subscriptionType === 'pay_per_use' && check.cost > 0) {
        await pointsService.debitPoints({
          userId,
          amount: check.cost,
          type: 'app_usage',
          description: `${appSlug} - ${action}`,
          metadata: { appSlug, action, ...metadata }
        });
        pointsDeducted = check.cost;
        newBalance = check.balance - check.cost;

        if (check.subscription) {
          await db.update(appPlanSubscriptions)
            .set({
              totalUsed: sql`${appPlanSubscriptions.totalUsed} + 1`,
              lastUsedAt: new Date(),
              updatedAt: new Date()
            })
            .where(eq(appPlanSubscriptions.id, check.subscription.id));
        }
      }

      const [log] = await db.insert(appUsageLogs).values({
        userId,
        appId: app[0].id,
        subscriptionId: check.subscription?.id || null,
        action,
        pointsDeducted,
        status: 'success',
        metadata
      }).returning();

      return {
        success: true,
        logId: log.id,
        pointsDeducted,
        newBalance
      };
    } catch (error: any) {
      console.error('[AppUsageService] Error recording usage:', error);
      return {
        success: false,
        logId: '',
        pointsDeducted: 0,
        newBalance: 0,
        error: error.message || 'Failed to record usage'
      };
    }
  }

  /**
   * Get usage history for a user and app
   */
  async getUsageHistory(userId: string, appSlug: string, limit: number = 50): Promise<AppUsageLog[]> {
    try {
      const app = await db.select().from(apps).where(eq(apps.slug, appSlug)).limit(1);
      if (!app.length) return [];

      const logs = await db.select()
        .from(appUsageLogs)
        .where(and(
          eq(appUsageLogs.userId, userId),
          eq(appUsageLogs.appId, app[0].id)
        ))
        .orderBy(desc(appUsageLogs.createdAt))
        .limit(limit);

      return logs;
    } catch (error) {
      console.error('[AppUsageService] Error getting usage history:', error);
      return [];
    }
  }

  /**
   * Get user's subscription status for an app
   */
  async getSubscriptionStatus(userId: string, appSlug: string) {
    try {
      const app = await db.select().from(apps).where(eq(apps.slug, appSlug)).limit(1);
      if (!app.length) return null;

      const subscription = await db.select({
        subscription: appPlanSubscriptions,
        plan: appPricingPlans
      })
        .from(appPlanSubscriptions)
        .innerJoin(appPricingPlans, eq(appPlanSubscriptions.planId, appPricingPlans.id))
        .where(and(
          eq(appPlanSubscriptions.userId, userId),
          eq(appPlanSubscriptions.appId, app[0].id),
          eq(appPlanSubscriptions.status, 'active')
        ))
        .limit(1);

      if (!subscription.length) return null;

      const balance = await pointsService.getBalance(userId);

      return {
        subscription: subscription[0].subscription,
        plan: subscription[0].plan,
        balance
      };
    } catch (error) {
      console.error('[AppUsageService] Error getting subscription status:', error);
      return null;
    }
  }
}

export const appUsageService = new AppUsageService();
