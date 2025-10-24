import { db } from "../server/db";
import { appsRegistry } from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Seed WytApps based on the official apps catalog
 * Reference: docs/en/wytapps/apps-catalog.md
 */

const wytApps = [
  {
    name: "WytQRC",
    slug: "wyt-qrc",
    description: "QR Code Generator & Scanner - Dynamic QR code generation, scanning, and management",
    icon: "qr-code",
    category: "utilities",
    isActive: true,
    metadata: { route: "/app/qr-generator", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "DiscAssesser",
    slug: "disc-assesser",
    description: "DISC Assessment & Testing Platform - Comprehensive personality assessments and testing",
    icon: "clipboard-check",
    category: "education",
    isActive: true,
    metadata: { route: "/app/assessment", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "AI Directory",
    slug: "ai-directory",
    description: "Curated directory of AI tools, resources, and services",
    icon: "brain",
    category: "ai-tools",
    isActive: true,
    metadata: { route: "/app/ai-directory", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytPass",
    slug: "wyt-pass",
    description: "Universal Authentication & Identity System - Multi-method authentication for the entire ecosystem",
    icon: "shield-check",
    category: "core-platform",
    isActive: true,
    metadata: { route: "/auth", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytPanel",
    slug: "wyt-panel",
    description: "Personal & Organizational Dashboard System - Intelligent dashboards for individuals and teams",
    icon: "layout-dashboard",
    category: "core-platform",
    isActive: true,
    metadata: { route: "/panel", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytWall",
    slug: "wyt-wall",
    description: "Unified Social Wall & Intelligent Marketplace - Dynamic social marketplace and interaction layer",
    icon: "layout-grid",
    category: "social",
    isActive: true,
    metadata: { route: "/wytwall", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytPoints",
    slug: "wyt-points",
    description: "Gamification & Rewards Economy - Universal rewards and gamification system",
    icon: "coins",
    category: "core-platform",
    isActive: true,
    metadata: { route: "/points", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytScore",
    slug: "wyt-score",
    description: "Rating & Reputation System - Comprehensive rating and reputation tracking",
    icon: "star",
    category: "social",
    isActive: true,
    metadata: { route: "/app/score", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytCircle",
    slug: "wyt-circle",
    description: "Groups & Communities - Create and manage communities and collaborative spaces",
    icon: "users",
    category: "social",
    isActive: true,
    metadata: { route: "/app/circles", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytWallet",
    slug: "wyt-wallet",
    description: "Digital Wallet & Payment Management - Secure digital wallet for funds and transactions",
    icon: "wallet",
    category: "finance",
    isActive: true,
    metadata: { route: "/app/wallet", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytApps",
    slug: "wyt-apps",
    description: "App Store & Launcher - Central marketplace for discovering and managing WytApps",
    icon: "grid-3x3",
    category: "core-platform",
    isActive: true,
    metadata: { route: "/wytapps", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "Esign Creator",
    slug: "esign-creator",
    description: "Digital Signature Solution - Secure electronic signatures for documents and contracts",
    icon: "file-signature",
    category: "business",
    isActive: true,
    metadata: { route: "/app/esign", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "Currency Converter",
    slug: "currency-converter",
    description: "Universal Conversion Utilities - Currency exchange and unit conversion with real-time data",
    icon: "calculator",
    category: "utilities",
    isActive: true,
    metadata: { route: "/app/converter", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytDuty",
    slug: "wyt-duty",
    description: "Task & Duty Management - Powerful task tracking for individuals and teams",
    icon: "clipboard-list",
    category: "productivity",
    isActive: true,
    metadata: { route: "/app/duty", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytPay",
    slug: "wyt-pay",
    description: "Payment Gateway Integration - Multi-payment method support for businesses",
    icon: "credit-card",
    category: "finance",
    isActive: true,
    metadata: { route: "/app/pay", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytCloud",
    slug: "wyt-cloud",
    description: "File Storage & Cloud Sync - Secure cloud storage with real-time synchronization",
    icon: "cloud",
    category: "storage",
    isActive: true,
    metadata: { route: "/app/cloud", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytSite",
    slug: "wyt-site",
    description: "Website & eCommerce Builder - No-code platform for building websites and online stores",
    icon: "globe",
    category: "web-development",
    isActive: true,
    metadata: { route: "/app/site-builder", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytInvoice",
    slug: "wyt-invoice",
    description: "Digital Invoice Management - Automated invoice creation, delivery, and tracking",
    icon: "file-text",
    category: "finance",
    isActive: true,
    metadata: { route: "/app/invoice", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytQuote",
    slug: "wyt-quote",
    description: "Quotation & Proposal Management - Business quotations with approval workflows",
    icon: "file-edit",
    category: "business",
    isActive: true,
    metadata: { route: "/app/quote", contexts: ["app", "hub"], version: "1.0.0" }
  },
  {
    name: "WytAI",
    slug: "wyt-ai",
    description: "AI Intelligence & Automation - Multi-model AI powering automation and personalization",
    icon: "brain",
    category: "ai-tools",
    isActive: true,
    metadata: { route: "/app/ai", contexts: ["app", "hub"], version: "1.0.0" }
  }
];

async function seedWytApps() {
  try {
    console.log("🚀 Seeding WytApps...");
    
    // Check if apps already exist
    const existingApps = await db.select().from(appsRegistry);
    if (existingApps.length > 0) {
      console.log(`ℹ️  Found ${existingApps.length} existing apps, adding missing ones...`);
    }
    
    let addedCount = 0;
    
    // Insert apps
    for (const appData of wytApps) {
      // Check if app already exists by slug
      const existing = await db.select().from(appsRegistry).where(eq(appsRegistry.slug, appData.slug));
      
      if (existing.length === 0) {
        await db.insert(appsRegistry).values(appData);
        console.log(`✅ Added app: ${appData.name}`);
        addedCount++;
      } else {
        console.log(`⏭️  Skipped (exists): ${appData.name}`);
      }
    }
    
    console.log(`\n🎉 WytApps seeding complete! Added ${addedCount} new apps.`);
    console.log(`📊 Total apps in database: ${(await db.select().from(appsRegistry)).length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding WytApps:", error);
    process.exit(1);
  }
}

// Run if called directly
seedWytApps();

export { seedWytApps };
