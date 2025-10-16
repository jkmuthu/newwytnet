/**
 * Entity Seeding Service
 * Seeds entity_types and starter entities from ENTITY_TYPES_CATALOG
 */

import { db } from "../db";
import { entityTypes, entities } from "@shared/schema";
import { ENTITY_TYPES_CATALOG } from "../entity-types-catalog";
import { eq } from "drizzle-orm";

interface StarterEntity {
  title: string;
  aliases?: string[];
  description?: string;
  metadata?: Record<string, any>;
  isVerified?: boolean;
}

const STARTER_ENTITIES: Record<string, StarterEntity[]> = {
  location: [
    { title: 'India', aliases: ['Bharat', 'IN'], description: 'Republic of India', metadata: { countryCode: 'IN', continent: 'Asia' }, isVerified: true },
    { title: 'United States', aliases: ['USA', 'US', 'America'], description: 'United States of America', metadata: { countryCode: 'US', continent: 'North America' }, isVerified: true },
    { title: 'United Kingdom', aliases: ['UK', 'Britain', 'Great Britain'], description: 'United Kingdom of Great Britain', metadata: { countryCode: 'GB', continent: 'Europe' }, isVerified: true },
    { title: 'Singapore', aliases: ['SG'], description: 'Republic of Singapore', metadata: { countryCode: 'SG', continent: 'Asia' }, isVerified: true },
    { title: 'Bangalore', aliases: ['Bengaluru'], description: 'Silicon Valley of India', metadata: { city: true, state: 'Karnataka', country: 'India' }, isVerified: true },
    { title: 'Mumbai', aliases: ['Bombay'], description: 'Financial capital of India', metadata: { city: true, state: 'Maharashtra', country: 'India' }, isVerified: true },
    { title: 'Delhi', aliases: ['New Delhi'], description: 'Capital of India', metadata: { city: true, country: 'India' }, isVerified: true }
  ],
  industry: [
    { title: 'Technology', aliases: ['Tech', 'IT', 'Software'], description: 'Information Technology & Software', isVerified: true },
    { title: 'Healthcare', aliases: ['Medical', 'Health'], description: 'Healthcare & Medical Services', isVerified: true },
    { title: 'Finance', aliases: ['Banking', 'FinTech'], description: 'Finance & Banking', isVerified: true },
    { title: 'Education', aliases: ['EdTech', 'Learning'], description: 'Education & Training', isVerified: true },
    { title: 'E-commerce', aliases: ['Retail', 'Shopping'], description: 'E-commerce & Retail', isVerified: true },
    { title: 'Manufacturing', aliases: ['Production', 'Industry'], description: 'Manufacturing & Production', isVerified: true }
  ],
  language: [
    { title: 'English', aliases: ['EN'], description: 'English language', metadata: { code: 'en' }, isVerified: true },
    { title: 'Hindi', aliases: ['HI'], description: 'Hindi language', metadata: { code: 'hi' }, isVerified: true },
    { title: 'Spanish', aliases: ['ES', 'Español'], description: 'Spanish language', metadata: { code: 'es' }, isVerified: true },
    { title: 'Mandarin', aliases: ['Chinese', 'ZH'], description: 'Mandarin Chinese', metadata: { code: 'zh' }, isVerified: true }
  ],
  'job-role': [
    { title: 'Software Engineer', aliases: ['Developer', 'Programmer', 'SDE'], description: 'Software development professional', isVerified: true },
    { title: 'Product Manager', aliases: ['PM', 'Product Lead'], description: 'Product management professional', isVerified: true },
    { title: 'Designer', aliases: ['UI/UX Designer', 'Product Designer'], description: 'Design professional', isVerified: true },
    { title: 'Data Scientist', aliases: ['ML Engineer', 'Data Analyst'], description: 'Data science professional', isVerified: true },
    { title: 'Marketing Manager', aliases: ['Growth Manager', 'Marketing Lead'], description: 'Marketing professional', isVerified: true }
  ],
  skill: [
    { title: 'JavaScript', aliases: ['JS'], description: 'JavaScript programming language', isVerified: true },
    { title: 'Python', aliases: ['Py'], description: 'Python programming language', isVerified: true },
    { title: 'React', aliases: ['ReactJS'], description: 'React JavaScript library', isVerified: true },
    { title: 'Node.js', aliases: ['NodeJS'], description: 'Node.js runtime', isVerified: true },
    { title: 'TypeScript', aliases: ['TS'], description: 'TypeScript programming language', isVerified: true },
    { title: 'SQL', aliases: ['Structured Query Language'], description: 'SQL database language', isVerified: true }
  ],
  category: [
    { title: 'Technology', description: 'Technology category', isVerified: true },
    { title: 'Business', description: 'Business category', isVerified: true },
    { title: 'Education', description: 'Education category', isVerified: true },
    { title: 'Health', description: 'Health & Wellness category', isVerified: true },
    { title: 'Entertainment', description: 'Entertainment category', isVerified: true }
  ]
};

export class EntitySeedingService {
  /**
   * Seed entity types from ENTITY_TYPES_CATALOG
   */
  async seedEntityTypes() {
    console.log('🏷️  Seeding entity types from catalog...');
    
    try {
      let seededCount = 0;
      let updatedCount = 0;

      for (const typeDef of ENTITY_TYPES_CATALOG) {
        try {
          const existing = await db.select()
            .from(entityTypes)
            .where(eq(entityTypes.slug, typeDef.slug))
            .limit(1);

          if (existing.length > 0) {
            await db.update(entityTypes)
              .set({
                name: typeDef.name,
                description: typeDef.description,
                icon: typeDef.icon,
                color: typeDef.color,
                schema: typeDef.schema,
                requiredFields: typeDef.requiredFields,
                allowsChildren: typeDef.allowsChildren,
                allowsFriends: typeDef.allowsFriends,
                maxAliases: typeDef.maxAliases,
                isSystem: typeDef.isSystem,
                displayOrder: typeDef.displayOrder
              })
              .where(eq(entityTypes.slug, typeDef.slug));
            
            updatedCount++;
          } else {
            await db.insert(entityTypes)
              .values({
                name: typeDef.name,
                slug: typeDef.slug,
                description: typeDef.description,
                icon: typeDef.icon,
                color: typeDef.color,
                schema: typeDef.schema,
                requiredFields: typeDef.requiredFields,
                allowsChildren: typeDef.allowsChildren,
                allowsFriends: typeDef.allowsFriends,
                maxAliases: typeDef.maxAliases,
                isSystem: typeDef.isSystem,
                displayOrder: typeDef.displayOrder
              });
            
            seededCount++;
          }
        } catch (error: any) {
          console.error(`  ❌ Failed to seed entity type "${typeDef.name}":`, error.message);
        }
      }

      console.log(`  ✓ Entity types: ${seededCount} new, ${updatedCount} updated`);
    } catch (error) {
      console.error('❌ Entity type seeding failed:', error);
    }
  }

  /**
   * Seed starter entities for each type
   */
  async seedStarterEntities() {
    console.log('🌱 Seeding starter entities...');
    
    try {
      let totalSeeded = 0;

      for (const [typeSlug, starterList] of Object.entries(STARTER_ENTITIES)) {
        // Get entity type ID from slug
        const entityType = await db.select()
          .from(entityTypes)
          .where(eq(entityTypes.slug, typeSlug))
          .limit(1);

        if (entityType.length === 0) {
          console.error(`  ❌ Entity type "${typeSlug}" not found, skipping starter entities`);
          continue;
        }

        for (const starter of starterList) {
          try {
            // Generate slug from title
            const slug = starter.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            
            const existing = await db.select()
              .from(entities)
              .where(eq(entities.slug, slug))
              .limit(1);

            if (existing.length === 0) {
              await db.insert(entities)
                .values({
                  entityTypeId: entityType[0].id,
                  title: starter.title,
                  slug,
                  aliases: starter.aliases || [],
                  description: starter.description,
                  metadata: starter.metadata || {},
                  isVerified: starter.isVerified || false,
                  tagCount: 0
                });
              
              totalSeeded++;
            }
          } catch (error: any) {
            console.error(`  ❌ Failed to seed entity "${starter.title}":`, error.message);
          }
        }
      }

      console.log(`  ✓ Seeded ${totalSeeded} starter entities`);
    } catch (error) {
      console.error('❌ Starter entity seeding failed:', error);
    }
  }

  /**
   * Run full entity seeding process
   */
  async seedAll() {
    await this.seedEntityTypes();
    await this.seedStarterEntities();
    console.log('✅ Entity seeding complete');
  }
}

export const entitySeedingService = new EntitySeedingService();
