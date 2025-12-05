/**
 * WytHub Dataset Seeding Service
 * Seeds hub-specific reference datasets for communities, marketplaces, events, etc.
 */

import { db } from "../db";
import { datasetCollections, datasetItems } from "@shared/schema";
import { eq, and } from "drizzle-orm";

interface DatasetCollection {
  key: string;
  name: string;
  description: string;
  scope: 'global' | 'tenant';
  metadata?: any;
}

interface DatasetItem {
  code: string;
  label: string;
  locale?: string;
  isDefault?: boolean;
  sortOrder?: number;
  metadata?: any;
}

export class HubDatasetSeedingService {
  /**
   * Initialize all hub-related datasets
   */
  async initializeHubDatasets() {
    console.log('🏢 Initializing WytHub datasets...');
    
    try {
      await this.seedHubCategories();
      await this.seedEventTypes();
      await this.seedListingCategories();
      await this.seedMembershipTiers();
      await this.seedDiscussionTopics();
      
      console.log('✅ WytHub datasets initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing hub datasets:', error);
    }
  }

  /**
   * Create or get collection by key
   */
  private async createCollection(collection: DatasetCollection): Promise<string> {
    const [existing] = await db.select()
      .from(datasetCollections)
      .where(eq(datasetCollections.key, collection.key))
      .limit(1);

    if (existing) {
      return existing.id;
    }

    const [created] = await db.insert(datasetCollections)
      .values({
        key: collection.key,
        name: collection.name,
        description: collection.description,
        scope: collection.scope,
        metadata: collection.metadata || {}
      })
      .returning();

    return created.id;
  }

  /**
   * Create items for a collection
   */
  private async createItems(collectionId: string, items: DatasetItem[]) {
    for (const item of items) {
      const [existing] = await db.select()
        .from(datasetItems)
        .where(and(
          eq(datasetItems.collectionId, collectionId),
          eq(datasetItems.code, item.code)
        ))
        .limit(1);

      if (!existing) {
        await db.insert(datasetItems).values({
          collectionId,
          code: item.code,
          label: item.label,
          locale: item.locale || 'en',
          isDefault: item.isDefault || false,
          sortOrder: item.sortOrder || 0,
          metadata: item.metadata || {}
        });
      }
    }
  }

  /**
   * Seed Hub Categories dataset
   */
  private async seedHubCategories() {
    const collectionId = await this.createCollection({
      key: 'hub-categories',
      name: 'Hub Categories',
      description: 'Categories for organizing hub content and features',
      scope: 'global',
      metadata: { icon: '📂', context: 'hub' }
    });

    await this.createItems(collectionId, [
      { code: 'general', label: 'General', sortOrder: 1, isDefault: true },
      { code: 'announcements', label: 'Announcements', sortOrder: 2, metadata: { color: 'blue' } },
      { code: 'resources', label: 'Resources', sortOrder: 3, metadata: { color: 'green' } },
      { code: 'showcase', label: 'Showcase', sortOrder: 4, metadata: { color: 'purple' } },
      { code: 'help', label: 'Help & Support', sortOrder: 5, metadata: { color: 'orange' } },
      { code: 'feedback', label: 'Feedback & Ideas', sortOrder: 6, metadata: { color: 'yellow' } },
      { code: 'introductions', label: 'Introductions', sortOrder: 7, metadata: { color: 'pink' } },
      { code: 'jobs', label: 'Jobs & Opportunities', sortOrder: 8, metadata: { color: 'emerald' } },
      { code: 'events', label: 'Events', sortOrder: 9, metadata: { color: 'indigo' } },
      { code: 'marketplace', label: 'Marketplace', sortOrder: 10, metadata: { color: 'red' } }
    ]);
    console.log('  ✓ Seeded hub categories');
  }

  /**
   * Seed Event Types dataset
   */
  private async seedEventTypes() {
    const collectionId = await this.createCollection({
      key: 'event-types',
      name: 'Event Types',
      description: 'Types of events for hubs and organizations',
      scope: 'global',
      metadata: { icon: '📅', context: 'hub' }
    });

    await this.createItems(collectionId, [
      { code: 'conference', label: 'Conference', sortOrder: 1, metadata: { icon: 'building-2', duration: 'multi-day' } },
      { code: 'workshop', label: 'Workshop', sortOrder: 2, metadata: { icon: 'hammer', duration: 'half-day' } },
      { code: 'webinar', label: 'Webinar', sortOrder: 3, isDefault: true, metadata: { icon: 'video', duration: '1-2 hours' } },
      { code: 'meetup', label: 'Meetup', sortOrder: 4, metadata: { icon: 'users', duration: '2-3 hours' } },
      { code: 'networking', label: 'Networking Event', sortOrder: 5, metadata: { icon: 'handshake', duration: '2-4 hours' } },
      { code: 'training', label: 'Training Session', sortOrder: 6, metadata: { icon: 'graduation-cap', duration: 'varies' } },
      { code: 'hackathon', label: 'Hackathon', sortOrder: 7, metadata: { icon: 'code', duration: '24-48 hours' } },
      { code: 'seminar', label: 'Seminar', sortOrder: 8, metadata: { icon: 'presentation', duration: '1-2 hours' } },
      { code: 'panel', label: 'Panel Discussion', sortOrder: 9, metadata: { icon: 'mic', duration: '1-2 hours' } },
      { code: 'launch', label: 'Product Launch', sortOrder: 10, metadata: { icon: 'rocket', duration: '1-2 hours' } },
      { code: 'celebration', label: 'Celebration/Party', sortOrder: 11, metadata: { icon: 'party-popper', duration: '3-5 hours' } },
      { code: 'ama', label: 'AMA (Ask Me Anything)', sortOrder: 12, metadata: { icon: 'message-circle', duration: '1 hour' } }
    ]);
    console.log('  ✓ Seeded event types');
  }

  /**
   * Seed Listing Categories dataset
   */
  private async seedListingCategories() {
    const collectionId = await this.createCollection({
      key: 'listing-categories',
      name: 'Listing Categories',
      description: 'Categories for marketplace and directory listings',
      scope: 'global',
      metadata: { icon: '🏪', context: 'hub' }
    });

    await this.createItems(collectionId, [
      { code: 'products', label: 'Products', sortOrder: 1, isDefault: true, metadata: { icon: 'package' } },
      { code: 'services', label: 'Services', sortOrder: 2, metadata: { icon: 'briefcase' } },
      { code: 'jobs', label: 'Jobs & Careers', sortOrder: 3, metadata: { icon: 'user-check' } },
      { code: 'real-estate', label: 'Real Estate', sortOrder: 4, metadata: { icon: 'home' } },
      { code: 'rentals', label: 'Rentals', sortOrder: 5, metadata: { icon: 'key' } },
      { code: 'vehicles', label: 'Vehicles', sortOrder: 6, metadata: { icon: 'car' } },
      { code: 'electronics', label: 'Electronics', sortOrder: 7, metadata: { icon: 'smartphone' } },
      { code: 'furniture', label: 'Furniture & Home', sortOrder: 8, metadata: { icon: 'sofa' } },
      { code: 'clothing', label: 'Clothing & Fashion', sortOrder: 9, metadata: { icon: 'shirt' } },
      { code: 'food', label: 'Food & Beverages', sortOrder: 10, metadata: { icon: 'utensils' } },
      { code: 'events', label: 'Events & Tickets', sortOrder: 11, metadata: { icon: 'ticket' } },
      { code: 'education', label: 'Education & Courses', sortOrder: 12, metadata: { icon: 'book' } },
      { code: 'freelance', label: 'Freelance Work', sortOrder: 13, metadata: { icon: 'laptop' } },
      { code: 'community', label: 'Community & Non-Profit', sortOrder: 14, metadata: { icon: 'heart' } },
      { code: 'other', label: 'Other', sortOrder: 99, metadata: { icon: 'more-horizontal' } }
    ]);
    console.log('  ✓ Seeded listing categories');
  }

  /**
   * Seed Membership Tiers dataset
   */
  private async seedMembershipTiers() {
    const collectionId = await this.createCollection({
      key: 'membership-tiers',
      name: 'Membership Tiers',
      description: 'Standard membership tier levels for hub subscriptions',
      scope: 'global',
      metadata: { icon: '⭐', context: 'hub' }
    });

    await this.createItems(collectionId, [
      { 
        code: 'free', 
        label: 'Free', 
        sortOrder: 1, 
        isDefault: true,
        metadata: { 
          price: 0, 
          color: 'gray',
          features: ['Basic access', 'Community forums', 'Public content']
        } 
      },
      { 
        code: 'basic', 
        label: 'Basic', 
        sortOrder: 2,
        metadata: { 
          price: 9.99, 
          color: 'blue',
          features: ['All free features', 'Premium content', 'Email support']
        } 
      },
      { 
        code: 'pro', 
        label: 'Pro', 
        sortOrder: 3,
        metadata: { 
          price: 29.99, 
          color: 'purple',
          features: ['All basic features', 'Priority support', 'Exclusive events', 'Member badge']
        } 
      },
      { 
        code: 'premium', 
        label: 'Premium', 
        sortOrder: 4,
        metadata: { 
          price: 49.99, 
          color: 'gold',
          features: ['All pro features', '1-on-1 mentoring', 'VIP access', 'Early access']
        } 
      },
      { 
        code: 'enterprise', 
        label: 'Enterprise', 
        sortOrder: 5,
        metadata: { 
          price: 'custom', 
          color: 'emerald',
          features: ['All premium features', 'Custom integrations', 'Dedicated account manager', 'SLA']
        } 
      },
      { 
        code: 'lifetime', 
        label: 'Lifetime', 
        sortOrder: 6,
        metadata: { 
          price: 'one-time', 
          color: 'rose',
          features: ['All premium features forever', 'Founder badge', 'Special recognition']
        } 
      }
    ]);
    console.log('  ✓ Seeded membership tiers');
  }

  /**
   * Seed Discussion Topics dataset
   */
  private async seedDiscussionTopics() {
    const collectionId = await this.createCollection({
      key: 'discussion-topics',
      name: 'Discussion Topics',
      description: 'Topic tags for community discussions and forums',
      scope: 'global',
      metadata: { icon: '💬', context: 'hub' }
    });

    await this.createItems(collectionId, [
      { code: 'question', label: 'Question', sortOrder: 1, isDefault: true, metadata: { color: 'blue', icon: 'help-circle' } },
      { code: 'discussion', label: 'Discussion', sortOrder: 2, metadata: { color: 'green', icon: 'message-square' } },
      { code: 'announcement', label: 'Announcement', sortOrder: 3, metadata: { color: 'red', icon: 'megaphone' } },
      { code: 'tutorial', label: 'Tutorial', sortOrder: 4, metadata: { color: 'purple', icon: 'book-open' } },
      { code: 'showcase', label: 'Showcase', sortOrder: 5, metadata: { color: 'orange', icon: 'star' } },
      { code: 'feedback', label: 'Feedback', sortOrder: 6, metadata: { color: 'yellow', icon: 'thumbs-up' } },
      { code: 'bug-report', label: 'Bug Report', sortOrder: 7, metadata: { color: 'red', icon: 'bug' } },
      { code: 'feature-request', label: 'Feature Request', sortOrder: 8, metadata: { color: 'indigo', icon: 'lightbulb' } },
      { code: 'poll', label: 'Poll', sortOrder: 9, metadata: { color: 'cyan', icon: 'bar-chart' } },
      { code: 'job-post', label: 'Job Post', sortOrder: 10, metadata: { color: 'emerald', icon: 'briefcase' } },
      { code: 'event', label: 'Event', sortOrder: 11, metadata: { color: 'pink', icon: 'calendar' } },
      { code: 'introduction', label: 'Introduction', sortOrder: 12, metadata: { color: 'teal', icon: 'user-plus' } },
      { code: 'resource', label: 'Resource Share', sortOrder: 13, metadata: { color: 'amber', icon: 'link' } },
      { code: 'off-topic', label: 'Off-Topic', sortOrder: 99, metadata: { color: 'gray', icon: 'coffee' } }
    ]);
    console.log('  ✓ Seeded discussion topics');
  }
}

export const hubDatasetSeedingService = new HubDatasetSeedingService();
