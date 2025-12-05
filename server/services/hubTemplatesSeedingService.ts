/**
 * Hub Templates Seeding Service
 * Seeds default hub templates for the WytHubs system
 */

import { db } from "../db";
import { hubTemplates } from "@shared/schema";
import { eq } from "drizzle-orm";

interface HubTemplateDefinition {
  name: string;
  slug: string;
  description: string;
  category: 'general' | 'community' | 'marketplace' | 'directory' | 'learning' | 'event';
  thumbnail?: string;
  defaultModules: string[];
  defaultTheme: Record<string, any>;
  defaultSettings: Record<string, any>;
  defaultPages: string[];
  features: string[];
  isPublic: boolean;
  requiresWytDev: boolean;
  sortOrder: number;
}

const HUB_TEMPLATES: HubTemplateDefinition[] = [
  {
    name: "Blank Canvas",
    slug: "blank",
    description: "Start from scratch with a clean slate. Perfect for custom hub designs with full flexibility.",
    category: "general",
    defaultModules: ["wytpass-auth", "notifications"],
    defaultTheme: {
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      headerStyle: "minimal"
    },
    defaultSettings: {
      allowPublicAccess: true,
      requireLogin: false,
      enableComments: true
    },
    defaultPages: ["home"],
    features: ["custom-branding", "flexible-layout"],
    isPublic: true,
    requiresWytDev: false,
    sortOrder: 1
  },
  {
    name: "Community Hub",
    slug: "community",
    description: "Build vibrant communities with discussions, member profiles, and social features. Ideal for interest groups, clubs, and associations.",
    category: "community",
    defaultModules: ["wytpass-auth", "wytwall", "notifications", "hub-members", "hub-discussions", "messaging"],
    defaultTheme: {
      primaryColor: "#10b981",
      secondaryColor: "#059669",
      headerStyle: "social"
    },
    defaultSettings: {
      allowPublicAccess: true,
      requireLogin: true,
      enableComments: true,
      enableReactions: true,
      enableMessaging: true
    },
    defaultPages: ["home", "feed", "members", "about"],
    features: ["user-profiles", "posts", "comments", "reactions", "messaging", "member-directory"],
    isPublic: true,
    requiresWytDev: true,
    sortOrder: 2
  },
  {
    name: "Marketplace Hub",
    slug: "marketplace",
    description: "Create a thriving marketplace connecting buyers and sellers. Perfect for e-commerce, services, and B2B platforms.",
    category: "marketplace",
    defaultModules: ["wytpass-auth", "wytwall", "notifications", "razorpay-payment", "hub-members", "hub-listings", "hub-reviews", "hub-subscriptions"],
    defaultTheme: {
      primaryColor: "#f59e0b",
      secondaryColor: "#d97706",
      headerStyle: "commerce"
    },
    defaultSettings: {
      allowPublicAccess: true,
      requireLogin: false,
      enablePayments: true,
      enableReviews: true,
      enableWishlist: true
    },
    defaultPages: ["home", "products", "sellers", "cart", "about"],
    features: ["listings", "payments", "reviews", "wishlist", "seller-profiles", "search-filters"],
    isPublic: true,
    requiresWytDev: true,
    sortOrder: 3
  },
  {
    name: "Directory Hub",
    slug: "directory",
    description: "Comprehensive directory for businesses, professionals, or organizations. Features search, filters, and detailed profiles.",
    category: "directory",
    defaultModules: ["wytpass-auth", "notifications", "hub-members", "hub-listings", "hub-reviews", "search"],
    defaultTheme: {
      primaryColor: "#3b82f6",
      secondaryColor: "#2563eb",
      headerStyle: "professional"
    },
    defaultSettings: {
      allowPublicAccess: true,
      requireLogin: false,
      enableSearch: true,
      enableFilters: true,
      enableClaiming: true
    },
    defaultPages: ["home", "listings", "categories", "map", "about"],
    features: ["business-listings", "search", "filters", "maps", "claiming", "reviews"],
    isPublic: true,
    requiresWytDev: true,
    sortOrder: 4
  },
  {
    name: "Learning Hub",
    slug: "learning",
    description: "Educational platform for courses, tutorials, and knowledge sharing. Perfect for training centers, academies, and skill development.",
    category: "learning",
    defaultModules: ["wytpass-auth", "notifications", "hub-members", "hub-courses", "hub-discussions", "hub-subscriptions"],
    defaultTheme: {
      primaryColor: "#8b5cf6",
      secondaryColor: "#7c3aed",
      headerStyle: "educational"
    },
    defaultSettings: {
      allowPublicAccess: true,
      requireLogin: true,
      enableProgress: true,
      enableCertificates: true,
      enableQuizzes: true
    },
    defaultPages: ["home", "courses", "my-learning", "certificates", "about"],
    features: ["courses", "lessons", "progress-tracking", "certificates", "quizzes", "discussion-forums"],
    isPublic: true,
    requiresWytDev: true,
    sortOrder: 5
  },
  {
    name: "Event Hub",
    slug: "event",
    description: "Host and manage events with registrations, schedules, and attendee management. Great for conferences, meetups, and workshops.",
    category: "event",
    defaultModules: ["wytpass-auth", "notifications", "hub-members", "hub-events", "calendar", "razorpay-payment", "hub-subscriptions"],
    defaultTheme: {
      primaryColor: "#ec4899",
      secondaryColor: "#db2777",
      headerStyle: "event"
    },
    defaultSettings: {
      allowPublicAccess: true,
      requireLogin: false,
      enableTicketing: true,
      enableRSVP: true,
      enableReminders: true
    },
    defaultPages: ["home", "events", "schedule", "speakers", "register", "about"],
    features: ["event-listings", "ticketing", "registrations", "schedule", "speakers", "attendee-management"],
    isPublic: true,
    requiresWytDev: true,
    sortOrder: 6
  }
];

export class HubTemplatesSeedingService {
  private displayIdCounter = 1;

  private generateDisplayId(): string {
    const id = `HT${String(this.displayIdCounter).padStart(5, '0')}`;
    this.displayIdCounter++;
    return id;
  }

  async seedTemplates() {
    console.log('🏗️  Seeding hub templates...');
    
    try {
      let seededCount = 0;
      let updatedCount = 0;

      for (const template of HUB_TEMPLATES) {
        try {
          const existing = await db.select()
            .from(hubTemplates)
            .where(eq(hubTemplates.slug, template.slug))
            .limit(1);

          if (existing.length > 0) {
            await db.update(hubTemplates)
              .set({
                name: template.name,
                description: template.description,
                category: template.category,
                thumbnail: template.thumbnail,
                defaultModules: template.defaultModules,
                defaultTheme: template.defaultTheme,
                defaultSettings: template.defaultSettings,
                defaultPages: template.defaultPages,
                features: template.features,
                isPublic: template.isPublic,
                requiresWytDev: template.requiresWytDev,
                sortOrder: template.sortOrder,
                updatedAt: new Date()
              })
              .where(eq(hubTemplates.slug, template.slug));
            
            updatedCount++;
            console.log(`  ✓ Updated template: ${template.name}`);
          } else {
            await db.insert(hubTemplates).values({
              displayId: this.generateDisplayId(),
              name: template.name,
              slug: template.slug,
              description: template.description,
              category: template.category,
              thumbnail: template.thumbnail,
              defaultModules: template.defaultModules,
              defaultTheme: template.defaultTheme,
              defaultSettings: template.defaultSettings,
              defaultPages: template.defaultPages,
              features: template.features,
              isPublic: template.isPublic,
              requiresWytDev: template.requiresWytDev,
              sortOrder: template.sortOrder
            });
            
            seededCount++;
            console.log(`  ✓ Seeded template: ${template.name}`);
          }
        } catch (error: any) {
          console.error(`  ❌ Failed to seed template "${template.name}":`, error.message);
        }
      }

      console.log(`✅ Hub templates seeding complete: ${seededCount} new, ${updatedCount} updated`);
    } catch (error) {
      console.error('❌ Hub templates seeding failed:', error);
    }
  }
}

export const hubTemplatesSeedingService = new HubTemplatesSeedingService();
