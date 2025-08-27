#!/usr/bin/env node

import { db } from '../server/db';
import { 
  tenants, users, models, apps, hubs, plans, pages, blocks, auditLogs
} from '../shared/schema';
import { DSL_TEMPLATES } from '../packages/builder/dsl';
import { EXAMPLE_APPS } from '../packages/appkit/manifest';
import { EXAMPLE_HUBS } from '../packages/hubkit/aggregation';

async function main() {
  console.log('🌱 Seeding WytNet database...');

  try {
    // Create example tenant
    const [tenant] = await db.insert(tenants).values({
      name: 'Demo Tenant',
      slug: 'demo',
      subdomain: 'demo',
      status: 'active',
      settings: {
        theme: 'default',
        locale: 'en-IN',
        currency: 'INR',
      },
    }).returning();

    console.log(`✅ Created tenant: ${tenant.name} (${tenant.id})`);

    // Create super admin user
    const [superAdmin] = await db.insert(users).values({
      id: 'super-admin-001',
      email: 'admin@wytnet.com',
      firstName: 'Super',
      lastName: 'Admin',
      tenantId: tenant.id,
    }).returning();

    console.log(`✅ Created super admin: ${superAdmin.email}`);

    // Create demo user
    const [demoUser] = await db.insert(users).values({
      id: 'demo-user-001',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      tenantId: tenant.id,
    }).returning();

    console.log(`✅ Created demo user: ${demoUser.email}`);

    // Create example models from DSL templates
    const modelPromises = Object.entries(DSL_TEMPLATES).map(async ([key, dsl]) => {
      const [model] = await db.insert(models).values({
        tenantId: tenant.id,
        name: dsl.name,
        description: dsl.description,
        schema: dsl as any,
        status: 'active',
        version: '1.0.0',
        createdBy: superAdmin.id,
      }).returning();

      return model;
    });

    const createdModels = await Promise.all(modelPromises);
    console.log(`✅ Created ${createdModels.length} models: ${createdModels.map(m => m.name).join(', ')}`);

    // Create example plans
    const planData = [
      {
        name: 'Free',
        description: 'Perfect for getting started',
        price: 0,
        currency: 'INR',
        interval: 'monthly',
        features: ['Up to 100 contacts', 'Basic features', 'Email support'],
        limits: { contacts: 100, models: 3, pages: 10 },
      },
      {
        name: 'Professional',
        description: 'For growing businesses',
        price: 999,
        currency: 'INR',
        interval: 'monthly',
        features: ['Up to 10,000 contacts', 'Advanced features', 'Priority support', 'Custom themes'],
        limits: { contacts: 10000, models: 25, pages: 100 },
      },
      {
        name: 'Enterprise',
        description: 'For large organizations',
        price: 2999,
        currency: 'INR',
        interval: 'monthly',
        features: ['Unlimited contacts', 'All features', '24/7 support', 'White-label options'],
        limits: {},
      },
    ];

    const createdPlans = await Promise.all(
      planData.map(async (plan) => {
        const [created] = await db.insert(plans).values(plan).returning();
        return created;
      })
    );

    console.log(`✅ Created ${createdPlans.length} plans: ${createdPlans.map(p => p.name).join(', ')}`);

    // Create example apps
    const [wytCrmApp] = await db.insert(apps).values({
      tenantId: tenant.id,
      key: EXAMPLE_APPS.wytcrm.key,
      name: EXAMPLE_APPS.wytcrm.name,
      description: EXAMPLE_APPS.wytcrm.description,
      version: EXAMPLE_APPS.wytcrm.version,
      manifest: EXAMPLE_APPS.wytcrm as any,
      categories: EXAMPLE_APPS.wytcrm.categories,
      status: 'published',
      isPublic: true,
      pricing: EXAMPLE_APPS.wytcrm.pricing,
      createdBy: superAdmin.id,
    }).returning();

    console.log(`✅ Created app: ${wytCrmApp.name}`);

    // Create example hub
    const [ownerNetHub] = await db.insert(hubs).values({
      key: EXAMPLE_HUBS.ownernet.key,
      name: EXAMPLE_HUBS.ownernet.name,
      description: EXAMPLE_HUBS.ownernet.description,
      type: EXAMPLE_HUBS.ownernet.type,
      config: EXAMPLE_HUBS.ownernet as any,
      aggregationRules: EXAMPLE_HUBS.ownernet.aggregationRules,
      moderationSettings: EXAMPLE_HUBS.ownernet.moderation,
      revenueModel: EXAMPLE_HUBS.ownernet.revenueModel,
      status: 'active',
      createdBy: superAdmin.id,
    }).returning();

    console.log(`✅ Created hub: ${ownerNetHub.name}`);

    // Create example pages
    const landingPageContent = {
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          name: 'Hero Section',
          content: {
            title: 'Welcome to WytNet',
            subtitle: 'The Ultimate Multi-SaaS Platform',
            description: 'Build, deploy, and manage multiple SaaS applications with our powerful low-code platform.',
            backgroundImage: '/images/hero-bg.jpg',
            cta: {
              text: 'Get Started',
              url: '/dashboard',
              style: 'primary',
            },
            alignment: 'center',
          },
        },
        {
          id: 'features-1',
          type: 'collection',
          name: 'Features Grid',
          content: {
            title: 'Platform Features',
            modelName: 'feature',
            layout: 'grid',
            columns: 3,
            fields: ['title', 'description', 'icon'],
          },
        },
        {
          id: 'cta-1',
          type: 'cta',
          name: 'Call to Action',
          content: {
            title: 'Ready to Get Started?',
            description: 'Join thousands of businesses already using WytNet to power their SaaS applications.',
            button: {
              text: 'Start Free Trial',
              url: '/register',
              style: 'primary',
              size: 'large',
            },
            alignment: 'center',
          },
        },
      ],
    };

    const [landingPage] = await db.insert(pages).values({
      tenantId: tenant.id,
      title: 'WytNet - Multi-SaaS Platform',
      slug: 'home',
      path: '/',
      locale: 'en-IN',
      content: landingPageContent,
      status: 'published',
      publishedAt: new Date(),
      createdBy: superAdmin.id,
    }).returning();

    console.log(`✅ Created page: ${landingPage.title}`);

    // Create example blocks
    const blockData = [
      {
        tenantId: tenant.id,
        type: 'hero',
        name: 'Default Hero',
        content: {
          title: 'Hero Title',
          subtitle: 'Hero subtitle',
          alignment: 'center',
        },
        settings: {
          padding: 'large',
          backgroundColor: '#f8f9fa',
        },
        isGlobal: true,
        createdBy: superAdmin.id,
      },
      {
        tenantId: tenant.id,
        type: 'richtext',
        name: 'Default Rich Text',
        content: {
          html: '<p>Rich text content goes here...</p>',
          alignment: 'left',
        },
        settings: {
          padding: 'medium',
        },
        isGlobal: true,
        createdBy: superAdmin.id,
      },
    ];

    const createdBlocks = await Promise.all(
      blockData.map(async (block) => {
        const [created] = await db.insert(blocks).values(block).returning();
        return created;
      })
    );

    console.log(`✅ Created ${createdBlocks.length} blocks`);

    // Log initial activities
    const activities = [
      {
        tenantId: tenant.id,
        userId: superAdmin.id,
        action: 'system_initialized',
        resource: 'system',
        details: { version: '1.0.0', environment: 'development' },
      },
      {
        tenantId: tenant.id,
        userId: superAdmin.id,
        action: 'tenant_created',
        resource: 'tenant',
        resourceId: tenant.id,
        details: { name: tenant.name, slug: tenant.slug },
      },
      {
        tenantId: tenant.id,
        userId: superAdmin.id,
        action: 'seed_completed',
        resource: 'system',
        details: {
          models: createdModels.length,
          apps: 1,
          hubs: 1,
          plans: createdPlans.length,
        },
      },
    ];

    await Promise.all(
      activities.map(async (activity) => {
        await db.insert(auditLogs).values(activity);
      })
    );

    console.log(`✅ Created ${activities.length} audit log entries`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nExample data created:');
    console.log(`   - Tenant: ${tenant.name} (${tenant.slug})`);
    console.log(`   - Super Admin: ${superAdmin.email}`);
    console.log(`   - Demo User: ${demoUser.email}`);
    console.log(`   - Models: ${createdModels.length} (${createdModels.map(m => m.name).join(', ')})`);
    console.log(`   - Apps: ${wytCrmApp.name}`);
    console.log(`   - Hubs: ${ownerNetHub.name}`);
    console.log(`   - Plans: ${createdPlans.length} pricing tiers`);
    console.log(`   - Pages: Landing page with CMS blocks`);
    console.log(`   - Blocks: ${createdBlocks.length} reusable components`);

    console.log('\n🚀 You can now:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Login via Replit Auth');
    console.log('   3. Explore the Super Admin dashboard');
    console.log('   4. Try building models with DSL');
    console.log('   5. Create pages with the CMS builder');
    console.log('   6. Compose apps and deploy them');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
