/**
 * WytApps Seeding Service
 * Seeds WytApps with dynamic pricing plans
 * 
 * App Types:
 * - mandatory: Auto-assigned to all users (WytPass, WytWall) - starts with Free plan
 * - premium: Paid apps with various pricing models (WytQRC, WytAssessor)
 * - standard: Regular apps
 */

import { db } from "../db";
import { apps, appPricingPlans, appPricingHistory } from "@shared/schema";
import { eq, and } from "drizzle-orm";

interface AppDefinition {
  key: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  appType: 'mandatory' | 'premium' | 'standard';
  isCoreApp: boolean;
  isAutoAssigned: boolean;
  pricingModel: 'free' | 'subscription' | 'pay_per_use' | 'one_time' | 'custom';
  categories: string[];
  features: Array<{ name: string; description: string; enabled: boolean }>;
}

interface PricingPlanDefinition {
  planName: string;
  planSlug: string;
  description: string;
  planType: 'free' | 'monthly' | 'yearly' | 'one_time' | 'pay_per_use';
  price: string;
  currency: string;
  usageLimit?: number;
  usageUnit?: string;
  features: Array<{ name: string; included: boolean }>;
  limits: Record<string, any>;
  isDefault: boolean;
  sortOrder: number;
}

const WYTAPPS: AppDefinition[] = [
  {
    key: 'wytpass',
    slug: 'wytpass',
    name: 'WytPass',
    description: 'Unified authentication and identity management for WytNet platform. Secure login with multiple methods.',
    icon: '🔐',
    appType: 'mandatory',
    isCoreApp: true,
    isAutoAssigned: true,
    pricingModel: 'free',
    categories: ['security', 'authentication'],
    features: [
      { name: 'Email/Password Login', description: 'Traditional email and password authentication', enabled: true },
      { name: 'OTP Authentication', description: 'One-time password via SMS or Email', enabled: true },
      { name: 'Social Login', description: 'Login with Google, LinkedIn, Facebook', enabled: true },
      { name: 'Session Management', description: 'Manage active sessions across devices', enabled: true },
    ]
  },
  {
    key: 'wytwall',
    slug: 'wytwall',
    name: 'WytWall',
    description: 'Social marketplace for needs and offers. Post what you need or what you can offer to the community.',
    icon: '📢',
    appType: 'mandatory',
    isCoreApp: true,
    isAutoAssigned: true,
    pricingModel: 'free',
    categories: ['social', 'marketplace'],
    features: [
      { name: 'Post Needs', description: 'Share what you need with the community', enabled: true },
      { name: 'Post Offers', description: 'Share what you can offer to others', enabled: true },
      { name: 'Match System', description: 'Get matched with relevant needs/offers', enabled: true },
      { name: 'Direct Messaging', description: 'Connect directly with matches', enabled: true },
    ]
  },
  {
    key: 'wytqrc',
    slug: 'wytqrc',
    name: 'WytQRC',
    description: 'Professional QR code generator with customization, branding, and analytics.',
    icon: '📱',
    appType: 'premium',
    isCoreApp: false,
    isAutoAssigned: false,
    pricingModel: 'pay_per_use',
    categories: ['utilities', 'marketing'],
    features: [
      { name: 'QR Code Generation', description: 'Generate various types of QR codes', enabled: true },
      { name: 'Custom Branding', description: 'Add logo and colors to QR codes', enabled: true },
      { name: 'Download Options', description: 'Download in PNG, SVG, PDF formats', enabled: true },
      { name: 'Analytics', description: 'Track QR code scans and usage', enabled: true },
    ]
  },
  {
    key: 'wytassessor',
    slug: 'wytassessor',
    name: 'WytAssessor',
    description: 'Professional assessment and quiz platform with DISC personality analysis and custom assessments.',
    icon: '📊',
    appType: 'premium',
    isCoreApp: false,
    isAutoAssigned: false,
    pricingModel: 'pay_per_use',
    categories: ['assessment', 'hr', 'education'],
    features: [
      { name: 'DISC Assessment', description: 'Personality profiling using DISC methodology', enabled: true },
      { name: 'Custom Quizzes', description: 'Create and manage custom assessments', enabled: true },
      { name: 'Results Analytics', description: 'Detailed analysis and reporting', enabled: true },
      { name: 'Certificate Generation', description: 'Generate completion certificates', enabled: true },
    ]
  }
];

const APP_PRICING_PLANS: Record<string, PricingPlanDefinition[]> = {
  'wytpass': [
    {
      planName: 'Free',
      planSlug: 'free',
      description: 'Core authentication features - always free',
      planType: 'free',
      price: '0',
      currency: 'INR',
      features: [
        { name: 'All Authentication Methods', included: true },
        { name: 'Unlimited Logins', included: true },
        { name: 'Session Management', included: true },
      ],
      limits: {},
      isDefault: true,
      sortOrder: 1
    }
  ],
  'wytwall': [
    {
      planName: 'Free',
      planSlug: 'free',
      description: 'Full access to social marketplace features',
      planType: 'free',
      price: '0',
      currency: 'INR',
      features: [
        { name: 'Unlimited Posts', included: true },
        { name: 'Match Notifications', included: true },
        { name: 'Direct Messaging', included: true },
      ],
      limits: {},
      isDefault: true,
      sortOrder: 1
    }
  ],
  'wytqrc': [
    {
      planName: 'Pay Per Use',
      planSlug: 'pay-per-use',
      description: '₹10 per QR code generation',
      planType: 'pay_per_use',
      price: '10',
      currency: 'INR',
      usageLimit: 1,
      usageUnit: 'qr_codes',
      features: [
        { name: 'All QR Types', included: true },
        { name: 'Custom Branding', included: true },
        { name: 'Download PNG/SVG', included: true },
      ],
      limits: { maxPerGeneration: 1 },
      isDefault: true,
      sortOrder: 1
    },
    {
      planName: 'Monthly',
      planSlug: 'monthly',
      description: '₹10/month - Unlimited QR codes',
      planType: 'monthly',
      price: '10',
      currency: 'INR',
      features: [
        { name: 'Unlimited QR Codes', included: true },
        { name: 'Custom Branding', included: true },
        { name: 'All Formats', included: true },
        { name: 'Basic Analytics', included: true },
      ],
      limits: { unlimited: true },
      isDefault: false,
      sortOrder: 2
    },
    {
      planName: 'Yearly',
      planSlug: 'yearly',
      description: '₹100/year - Save ₹20',
      planType: 'yearly',
      price: '100',
      currency: 'INR',
      features: [
        { name: 'Unlimited QR Codes', included: true },
        { name: 'Custom Branding', included: true },
        { name: 'All Formats', included: true },
        { name: 'Advanced Analytics', included: true },
      ],
      limits: { unlimited: true },
      isDefault: false,
      sortOrder: 3
    }
  ],
  'wytassessor': [
    {
      planName: 'Pay Per Use',
      planSlug: 'pay-per-use',
      description: '₹10 per assessment',
      planType: 'pay_per_use',
      price: '10',
      currency: 'INR',
      usageLimit: 1,
      usageUnit: 'assessments',
      features: [
        { name: 'DISC Assessment', included: true },
        { name: 'Basic Results', included: true },
        { name: 'PDF Report', included: true },
      ],
      limits: { maxPerAssessment: 1 },
      isDefault: true,
      sortOrder: 1
    },
    {
      planName: 'Monthly',
      planSlug: 'monthly',
      description: '₹10/month - Unlimited assessments',
      planType: 'monthly',
      price: '10',
      currency: 'INR',
      features: [
        { name: 'Unlimited Assessments', included: true },
        { name: 'Detailed Reports', included: true },
        { name: 'Result History', included: true },
        { name: 'Comparison Charts', included: true },
      ],
      limits: { unlimited: true },
      isDefault: false,
      sortOrder: 2
    },
    {
      planName: 'Yearly',
      planSlug: 'yearly',
      description: '₹100/year - Save ₹20',
      planType: 'yearly',
      price: '100',
      currency: 'INR',
      features: [
        { name: 'Unlimited Assessments', included: true },
        { name: 'Detailed Reports', included: true },
        { name: 'Result History', included: true },
        { name: 'Comparison Charts', included: true },
        { name: 'Certificate Generation', included: true },
      ],
      limits: { unlimited: true },
      isDefault: false,
      sortOrder: 3
    }
  ]
};

export class WytAppsSeedingService {
  private displayIdCounter = 1;
  private planDisplayIdCounter = 1;

  private generateAppDisplayId(): string {
    const id = `WA${String(this.displayIdCounter).padStart(5, '0')}`;
    this.displayIdCounter++;
    return id;
  }

  private generatePlanDisplayId(): string {
    const id = `PP${String(this.planDisplayIdCounter).padStart(5, '0')}`;
    this.planDisplayIdCounter++;
    return id;
  }

  async seedWytApps(systemUserId: string) {
    console.log('📱 Seeding WytApps with dynamic pricing...');

    try {
      let appsSeeded = 0;
      let appsUpdated = 0;
      let plansSeeded = 0;

      for (const appDef of WYTAPPS) {
        // Check if app exists
        const existingApp = await db.select()
          .from(apps)
          .where(eq(apps.key, appDef.key))
          .limit(1);

        let appId: string;

        if (existingApp.length > 0) {
          // Update existing app
          await db.update(apps)
            .set({
              name: appDef.name,
              description: appDef.description,
              icon: appDef.icon,
              appType: appDef.appType,
              isCoreApp: appDef.isCoreApp,
              isAutoAssigned: appDef.isAutoAssigned,
              pricingModel: appDef.pricingModel,
              categories: appDef.categories,
              features: appDef.features,
              status: 'active',
              updatedAt: new Date()
            })
            .where(eq(apps.key, appDef.key));
          
          appId = existingApp[0].id;
          appsUpdated++;
          console.log(`  ✓ Updated app: ${appDef.name}`);
        } else {
          // Create new app
          const [newApp] = await db.insert(apps).values({
            displayId: this.generateAppDisplayId(),
            key: appDef.key,
            slug: appDef.slug,
            name: appDef.name,
            description: appDef.description,
            icon: appDef.icon,
            version: '1.0.0',
            manifest: { version: '1.0.0', author: 'WytNet' },
            appType: appDef.appType,
            isCoreApp: appDef.isCoreApp,
            isAutoAssigned: appDef.isAutoAssigned,
            pricingModel: appDef.pricingModel,
            categories: appDef.categories,
            features: appDef.features,
            status: 'active',
            isPublic: true,
            visibilityMode: 'public',
            wizardCompleted: true,
            wizardStep: 6,
            createdBy: systemUserId
          }).returning();
          
          appId = newApp.id;
          appsSeeded++;
          console.log(`  ✓ Created app: ${appDef.name}`);
        }

        // Seed pricing plans for this app
        const pricingPlans = APP_PRICING_PLANS[appDef.key] || [];
        
        for (const planDef of pricingPlans) {
          // Check if plan exists
          const existingPlan = await db.select()
            .from(appPricingPlans)
            .where(and(
              eq(appPricingPlans.appId, appId),
              eq(appPricingPlans.planSlug, planDef.planSlug)
            ))
            .limit(1);

          if (existingPlan.length === 0) {
            // Create new pricing plan
            const [newPlan] = await db.insert(appPricingPlans).values({
              displayId: this.generatePlanDisplayId(),
              appId: appId,
              planName: planDef.planName,
              planSlug: planDef.planSlug,
              description: planDef.description,
              planType: planDef.planType,
              price: planDef.price,
              currency: planDef.currency,
              usageLimit: planDef.usageLimit,
              usageUnit: planDef.usageUnit,
              features: planDef.features,
              limits: planDef.limits,
              isActive: true,
              isDefault: planDef.isDefault,
              sortOrder: planDef.sortOrder,
              createdBy: systemUserId
            }).returning();

            // Log pricing history
            await db.insert(appPricingHistory).values({
              appId: appId,
              planId: newPlan.id,
              changeType: 'created',
              newPrice: planDef.price,
              newData: planDef,
              changedBy: systemUserId,
              changeReason: 'Initial pricing plan setup'
            });

            plansSeeded++;
            console.log(`    + Added plan: ${planDef.planName} (${planDef.planType})`);
          } else {
            // Update existing plan
            const previousData = existingPlan[0];
            await db.update(appPricingPlans)
              .set({
                planName: planDef.planName,
                description: planDef.description,
                planType: planDef.planType,
                price: planDef.price,
                currency: planDef.currency,
                usageLimit: planDef.usageLimit,
                usageUnit: planDef.usageUnit,
                features: planDef.features,
                limits: planDef.limits,
                isDefault: planDef.isDefault,
                sortOrder: planDef.sortOrder,
                updatedAt: new Date()
              })
              .where(eq(appPricingPlans.id, previousData.id));
            
            console.log(`    ~ Updated plan: ${planDef.planName}`);
          }
        }
      }

      console.log(`✅ WytApps seeded: ${appsSeeded} new, ${appsUpdated} updated, ${plansSeeded} plans created`);
      return { appsSeeded, appsUpdated, plansSeeded };
    } catch (error) {
      console.error('❌ Error seeding WytApps:', error);
      throw error;
    }
  }

  async getMandatoryApps() {
    return db.select()
      .from(apps)
      .where(and(
        eq(apps.appType, 'mandatory'),
        eq(apps.isAutoAssigned, true)
      ));
  }

  async getDefaultPlanForApp(appId: string) {
    const [defaultPlan] = await db.select()
      .from(appPricingPlans)
      .where(and(
        eq(appPricingPlans.appId, appId),
        eq(appPricingPlans.isDefault, true),
        eq(appPricingPlans.isActive, true)
      ))
      .limit(1);
    
    return defaultPlan;
  }
}

export const wytAppsSeedingService = new WytAppsSeedingService();
