import { db } from '../db';
import { pricingPlans, pricingPlanTypes } from '@shared/schema';
import { DEFAULT_PLANS } from '../constants/defaultPlans';

/**
 * Creates default pricing plans for a given app
 * @param appId - The ID of the app to create plans for
 * @returns Array of created plan IDs
 */
export async function createDefaultPlansForApp(appId: string): Promise<string[]> {
  const createdPlanIds: string[]  = [];

  for (const template of DEFAULT_PLANS) {
    try {
      // Create the pricing plan
      const [newPlan] = await db.insert(pricingPlans)
        .values({
          appId,
          planName: template.planName,
          planBatch: template.planBatch,
          description: template.description,
          basePrice: template.basePrice,
          currency: template.currency,
          isActive: template.isActive,
          isFeatured: template.isFeatured,
          sortOrder: template.sortOrder,
          features: [],
          limits: {},
        })
        .returning();

      // Create pricing types for this plan
      if (template.pricingTypes && template.pricingTypes.length > 0) {
        await db.insert(pricingPlanTypes)
          .values(
            template.pricingTypes.map((pt) => ({
              pricingPlanId: newPlan.id,
              type: pt.type,
              price: pt.price,
              billingInterval: pt.billingInterval,
              trialDays: pt.trialDays,
              usageLimit: null,
              isActive: true,
            }))
          );
      }

      createdPlanIds.push(newPlan.id);
    } catch (error) {
      console.error(`Error creating plan ${template.planBatch} for app ${appId}:`, error);
    }
  }

  console.log(`✅ Created ${createdPlanIds.length} default plans for app ${appId}`);
  return createdPlanIds;
}
