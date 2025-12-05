/**
 * Auto-Subscribe Service
 * Automatically assigns mandatory apps with their free plans to new users
 * 
 * Called during user registration to ensure all users have access to core apps
 */

import { db } from "../db";
import { apps, appPricingPlans, appPlanSubscriptions } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export class AutoSubscribeService {
  /**
   * Subscribe a user to all mandatory apps with their default (free) plans
   * Called after successful user registration
   */
  async subscribeToMandatoryApps(userId: string): Promise<{ appName: string; planName: string }[]> {
    const subscribedApps: { appName: string; planName: string }[] = [];

    try {
      // Get all mandatory apps that should be auto-assigned
      const mandatoryApps = await db.select()
        .from(apps)
        .where(and(
          eq(apps.appType, 'mandatory'),
          eq(apps.isAutoAssigned, true),
          eq(apps.status, 'active')
        ));

      for (const app of mandatoryApps) {
        // Get the default (free) plan for this app
        const [defaultPlan] = await db.select()
          .from(appPricingPlans)
          .where(and(
            eq(appPricingPlans.appId, app.id),
            eq(appPricingPlans.isDefault, true),
            eq(appPricingPlans.isActive, true)
          ))
          .limit(1);

        if (!defaultPlan) {
          console.warn(`No default plan found for mandatory app: ${app.name}`);
          continue;
        }

        // Check if user already has a subscription to this app
        const existingSubscription = await db.select()
          .from(appPlanSubscriptions)
          .where(and(
            eq(appPlanSubscriptions.userId, userId),
            eq(appPlanSubscriptions.appId, app.id)
          ))
          .limit(1);

        if (existingSubscription.length > 0) {
          console.log(`User ${userId} already subscribed to ${app.name}`);
          continue;
        }

        // Create subscription
        await db.insert(appPlanSubscriptions).values({
          userId: userId,
          appId: app.id,
          planId: defaultPlan.id,
          status: 'active',
          billingCycle: defaultPlan.planType === 'free' ? null : defaultPlan.planType,
          startDate: new Date(),
          endDate: null, // Free plans don't expire
          usageBalance: defaultPlan.usageLimit || 0,
          totalUsed: 0,
          isAutoAssigned: true,
          metadata: {
            source: 'auto_registration',
            assignedAt: new Date().toISOString()
          }
        });

        subscribedApps.push({
          appName: app.name,
          planName: defaultPlan.planName
        });

        console.log(`  ✓ Auto-subscribed user to ${app.name} (${defaultPlan.planName})`);
      }

      return subscribedApps;
    } catch (error) {
      console.error('Error auto-subscribing user to mandatory apps:', error);
      throw error;
    }
  }

  /**
   * Check if user has active subscription to an app
   */
  async hasActiveSubscription(userId: string, appId: string): Promise<boolean> {
    const [subscription] = await db.select()
      .from(appPlanSubscriptions)
      .where(and(
        eq(appPlanSubscriptions.userId, userId),
        eq(appPlanSubscriptions.appId, appId),
        eq(appPlanSubscriptions.status, 'active')
      ))
      .limit(1);

    return !!subscription;
  }

  /**
   * Get user's subscription for an app
   */
  async getUserAppSubscription(userId: string, appId: string) {
    const [subscription] = await db.select()
      .from(appPlanSubscriptions)
      .where(and(
        eq(appPlanSubscriptions.userId, userId),
        eq(appPlanSubscriptions.appId, appId)
      ))
      .limit(1);

    return subscription;
  }

  /**
   * Check and deduct usage for pay-per-use apps
   * Returns true if usage was available and deducted
   */
  async checkAndDeductUsage(userId: string, appId: string): Promise<{ allowed: boolean; remaining: number }> {
    const subscription = await this.getUserAppSubscription(userId, appId);

    if (!subscription) {
      return { allowed: false, remaining: 0 };
    }

    // Get the plan to check if it's pay-per-use
    const [plan] = await db.select()
      .from(appPricingPlans)
      .where(eq(appPricingPlans.id, subscription.planId))
      .limit(1);

    if (!plan) {
      return { allowed: false, remaining: 0 };
    }

    // For free or unlimited plans, always allow
    if (plan.planType === 'free' || plan.planType === 'monthly' || plan.planType === 'yearly') {
      return { allowed: true, remaining: -1 }; // -1 indicates unlimited
    }

    // For pay-per-use, check and deduct balance
    if (plan.planType === 'pay_per_use') {
      const currentBalance = subscription.usageBalance || 0;

      if (currentBalance <= 0) {
        return { allowed: false, remaining: 0 };
      }

      // Deduct usage
      await db.update(appPlanSubscriptions)
        .set({
          usageBalance: currentBalance - 1,
          totalUsed: (subscription.totalUsed || 0) + 1,
          lastUsedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(appPlanSubscriptions.id, subscription.id));

      return { allowed: true, remaining: currentBalance - 1 };
    }

    // For one-time purchases, allow if subscription is active
    if (plan.planType === 'one_time') {
      return { allowed: subscription.status === 'active', remaining: -1 };
    }

    return { allowed: false, remaining: 0 };
  }

  /**
   * Add usage balance to a pay-per-use subscription (after purchase)
   */
  async addUsageBalance(userId: string, appId: string, amount: number): Promise<number> {
    const subscription = await this.getUserAppSubscription(userId, appId);

    if (!subscription) {
      throw new Error('No subscription found for this app');
    }

    const newBalance = (subscription.usageBalance || 0) + amount;

    await db.update(appPlanSubscriptions)
      .set({
        usageBalance: newBalance,
        lastPaymentAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(appPlanSubscriptions.id, subscription.id));

    return newBalance;
  }
}

export const autoSubscribeService = new AutoSubscribeService();
