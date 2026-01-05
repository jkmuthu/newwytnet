import { db } from "../db";
import { platformHubs } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// Default platform hubs to seed
const DEFAULT_PLATFORM_HUBS = [
  {
    displayId: "PH0000001",
    name: "WytNet.com",
    slug: "wytnet",
    subdomain: "www",
    customDomain: "wytnet.com",
    description: "The primary hub of WytNet - A comprehensive platform for businesses and professionals to connect, collaborate, and grow.",
    seoTitle: "WytNet - Professional Business Network & Collaboration Platform",
    seoDescription: "Join WytNet.com, the premier platform for business networking, collaboration, and professional growth. Connect with industry leaders and expand your opportunities.",
    seoKeywords: "business network, professional collaboration, wytnet, business platform, networking",
    seoRobots: "index, follow",
    status: "active" as const,
    domainVerified: true,
    themeSettings: {
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    settings: {
      enablePublicDirectory: true,
      enableSearch: true,
      enableAnalytics: true,
    },
    metadata: {
      isPrimary: true,
      category: "general",
      tags: ["business", "networking", "platform"],
    },
  },
  {
    displayId: "PH0000002",
    name: "OwnerNET",
    slug: "ownernet",
    subdomain: "ownernet",
    description: "A comprehensive directory for property owners and managers to connect, share resources, and collaborate on property management excellence.",
    seoTitle: "OwnerNET - Property Owners & Managers Network",
    seoDescription: "Connect with property owners and managers. Share resources, find service providers, and collaborate on property management best practices.",
    seoKeywords: "property management, real estate network, property owners, facility management",
    seoRobots: "index, follow",
    status: "active" as const,
    domainVerified: false,
    themeSettings: {
      primaryColor: "#059669",
      secondaryColor: "#10b981",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    settings: {
      enablePublicDirectory: true,
      enableSearch: true,
      requireVerification: true,
    },
    metadata: {
      category: "real-estate",
      tags: ["property", "real-estate", "management", "networking"],
    },
  },
  {
    displayId: "PH0000003",
    name: "DevHub",
    slug: "devhub",
    subdomain: "devhub",
    description: "A vibrant community hub for developers, engineers, and tech enthusiasts to share knowledge, collaborate on projects, and stay updated with the latest in technology.",
    seoTitle: "DevHub - Developer Community & Collaboration Platform",
    seoDescription: "Join DevHub for developer networking, code collaboration, tech discussions, and career opportunities in software development.",
    seoKeywords: "developer community, programming, software development, tech hub, coding",
    seoRobots: "index, follow",
    status: "active" as const,
    domainVerified: false,
    themeSettings: {
      primaryColor: "#0ea5e9",
      secondaryColor: "#06b6d4",
      fontFamily: "JetBrains Mono, monospace",
    },
    settings: {
      enablePublicDirectory: true,
      enableSearch: true,
      enableCodeSharing: true,
    },
    metadata: {
      category: "technology",
      tags: ["developers", "programming", "tech", "community"],
    },
  },
  {
    displayId: "PH0000004",
    name: "MarketPlace",
    slug: "marketplace",
    subdomain: "marketplace",
    description: "Connect buyers and sellers in a trusted marketplace environment. Discover products, services, and business opportunities across various industries.",
    seoTitle: "MarketPlace - Buy & Sell Products and Services",
    seoDescription: "Your trusted marketplace for buying and selling products and services. Connect with verified sellers and find great deals across multiple categories.",
    seoKeywords: "marketplace, buy sell, ecommerce, business marketplace, trade",
    seoRobots: "index, follow",
    status: "active" as const,
    domainVerified: false,
    themeSettings: {
      primaryColor: "#f59e0b",
      secondaryColor: "#f97316",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    settings: {
      enablePublicDirectory: true,
      enableSearch: true,
      enableTransactions: true,
      requireVerification: true,
    },
    metadata: {
      category: "commerce",
      tags: ["marketplace", "ecommerce", "buying", "selling"],
    },
  },
  {
    displayId: "PH0000005",
    name: "WytSite",
    slug: "wytsite",
    subdomain: "wytsite",
    description: "Build beautiful, professional websites in minutes with AI-powered design tools. No coding required - just describe your vision and watch it come to life.",
    seoTitle: "WytSite - AI-Powered Website Builder",
    seoDescription: "Create stunning websites effortlessly with WytSite. AI-powered design, drag-and-drop editor, custom domains, and professional templates for any business.",
    seoKeywords: "website builder, AI website, drag drop editor, no code website, professional templates",
    seoRobots: "index, follow",
    status: "active" as const,
    domainVerified: false,
    themeSettings: {
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    settings: {
      enablePublicDirectory: true,
      enableSearch: true,
      enableTemplates: true,
      enableAIBuilder: true,
    },
    metadata: {
      category: "tools",
      tags: ["website", "builder", "AI", "design", "no-code"],
    },
  },
];

// Helper function to generate Display IDs
async function generateDisplayId(prefix: string): Promise<string> {
  const sequenceName = `${prefix.toLowerCase()}_seq`;
  const result = await db.execute(sql`
    SELECT nextval('${sql.raw(sequenceName)}') as next_id
  `);
  const nextId = Number(result.rows[0]?.next_id || 1);
  return `${prefix}${String(nextId).padStart(7, '0')}`;
}

// Create sequence for platform hubs if it doesn't exist
async function ensureSequenceExists() {
  try {
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'ph_seq') THEN
          CREATE SEQUENCE ph_seq START WITH 1;
        END IF;
      END $$;
    `);
  } catch (error) {
    console.error("Error creating sequence:", error);
  }
}

export async function seedPlatformHubs() {
  try {
    console.log("🌐 Seeding platform hubs...");
    
    // Ensure sequence exists
    await ensureSequenceExists();
    
    let newCount = 0;
    let updatedCount = 0;
    
    for (const hubData of DEFAULT_PLATFORM_HUBS) {
      // Check if hub already exists by slug
      const [existingHub] = await db
        .select()
        .from(platformHubs)
        .where(eq(platformHubs.slug, hubData.slug))
        .limit(1);
      
      if (existingHub) {
        // Update existing hub (preserve ID and dates)
        await db
          .update(platformHubs)
          .set({
            name: hubData.name,
            description: hubData.description,
            subdomain: hubData.subdomain,
            customDomain: (hubData as any).customDomain || null,
            seoTitle: hubData.seoTitle,
            seoDescription: hubData.seoDescription,
            seoKeywords: hubData.seoKeywords,
            seoRobots: hubData.seoRobots,
            status: hubData.status,
            domainVerified: hubData.domainVerified,
            themeSettings: hubData.themeSettings,
            settings: hubData.settings,
            metadata: hubData.metadata,
            updatedAt: new Date(),
          })
          .where(eq(platformHubs.id, existingHub.id));
        
        updatedCount++;
        console.log(`  ✓ Updated hub: ${hubData.name} (${hubData.slug})`);
      } else {
        // Check if we need to set the sequence to match the displayId
        const expectedNumber = parseInt(hubData.displayId.replace('PH', ''));
        await db.execute(sql`
          SELECT setval('ph_seq', GREATEST((SELECT COALESCE(MAX(CAST(SUBSTRING(display_id FROM 3) AS INTEGER)), 0) FROM platform_hubs), ${expectedNumber}))
        `);
        
        // Insert new hub
        await db
          .insert(platformHubs)
          .values({
            displayId: hubData.displayId,
            name: hubData.name,
            slug: hubData.slug,
            subdomain: hubData.subdomain,
            customDomain: (hubData as any).customDomain || null,
            description: hubData.description,
            seoTitle: hubData.seoTitle,
            seoDescription: hubData.seoDescription,
            seoKeywords: hubData.seoKeywords,
            seoRobots: hubData.seoRobots,
            status: hubData.status,
            domainVerified: hubData.domainVerified,
            themeSettings: hubData.themeSettings,
            settings: hubData.settings,
            metadata: hubData.metadata,
          });
        
        newCount++;
        console.log(`  ✓ Created hub: ${hubData.name} (${hubData.slug})`);
      }
    }
    
    console.log(`✅ Platform hubs seeded: ${newCount} new, ${updatedCount} updated`);
    return { newCount, updatedCount };
  } catch (error) {
    console.error("❌ Error seeding platform hubs:", error);
    throw error;
  }
}
