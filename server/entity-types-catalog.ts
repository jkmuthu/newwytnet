/**
 * WYTENTITIES - Entity Types Catalog
 * 
 * Defines core entity types that power the Knowledge Graph layer.
 * These entity types sit ABOVE the Module layer and enable tag-based prevention of duplication.
 * 
 * Inspired by Wikipedia's linking system where meaningful words become tagged entities
 * with Parent/Child/Friend relationships.
 */

export interface EntityTypeDefinition {
  slug: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  schema: Record<string, any>; // JSON schema for entity fields
  requiredFields: string[];
  allowsChildren: boolean;
  allowsFriends: boolean;
  maxAliases: number;
  isSystem: boolean; // System types can't be deleted
  displayOrder: number;
  examples: string[]; // Example entities of this type
}

/**
 * Core Entity Types - The foundation of WytNet's Knowledge Graph
 * 
 * Based on your original "Objects" concept from 15 years ago
 */
export const ENTITY_TYPES_CATALOG: EntityTypeDefinition[] = [
  {
    slug: 'location',
    name: 'Location',
    description: 'Geographic entities: countries, states, cities, landmarks',
    icon: 'MapPin',
    color: 'blue',
    schema: {
      type: 'object',
      properties: {
        locationType: { type: 'string', enum: ['country', 'state', 'city', 'landmark', 'region'] },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        population: { type: 'number' },
        timezone: { type: 'string' },
        countryCode: { type: 'string' },
        stateCode: { type: 'string' },
      }
    },
    requiredFields: ['title', 'locationType'],
    allowsChildren: true, // e.g., Tamil Nadu (parent) -> Chennai (child)
    allowsFriends: true, // e.g., Mumbai <-> Bombay (alternate names)
    maxAliases: 15,
    isSystem: true,
    displayOrder: 1,
    examples: ['India', 'Tamil Nadu', 'Chennai', 'Marina Beach']
  },
  {
    slug: 'industry',
    name: 'Industry',
    description: 'Business sectors, industries, and professional domains',
    icon: 'Building2',
    color: 'purple',
    schema: {
      type: 'object',
      properties: {
        industryType: { type: 'string', enum: ['primary', 'secondary', 'tertiary', 'quaternary'] },
        naicsCode: { type: 'string' },
        sicCode: { type: 'string' },
        parentIndustry: { type: 'string' },
      }
    },
    requiredFields: ['title'],
    allowsChildren: true, // e.g., Technology (parent) -> Software Development (child)
    allowsFriends: true,
    maxAliases: 10,
    isSystem: true,
    displayOrder: 2,
    examples: ['Technology', 'Software Development', 'Healthcare', 'Manufacturing']
  },
  {
    slug: 'language',
    name: 'Language',
    description: 'Human languages and linguistic entities',
    icon: 'Languages',
    color: 'green',
    schema: {
      type: 'object',
      properties: {
        languageCode: { type: 'string' }, // ISO 639-1
        nativeName: { type: 'string' },
        scriptType: { type: 'string' },
        speakerCount: { type: 'number' },
        languageFamily: { type: 'string' },
      }
    },
    requiredFields: ['title', 'languageCode'],
    allowsChildren: true, // e.g., Dravidian (parent) -> Tamil (child)
    allowsFriends: true,
    maxAliases: 5,
    isSystem: true,
    displayOrder: 3,
    examples: ['Tamil', 'English', 'Hindi', 'Spanish']
  },
  {
    slug: 'job-role',
    name: 'Job Role',
    description: 'Professional roles, positions, and job titles',
    icon: 'Briefcase',
    color: 'orange',
    schema: {
      type: 'object',
      properties: {
        seniorityLevel: { type: 'string', enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'] },
        department: { type: 'string' },
        requiredSkills: { type: 'array', items: { type: 'string' } },
        salaryRange: { type: 'object' },
      }
    },
    requiredFields: ['title'],
    allowsChildren: true, // e.g., Engineer (parent) -> Software Engineer (child)
    allowsFriends: true, // e.g., Developer <-> Programmer
    maxAliases: 8,
    isSystem: true,
    displayOrder: 4,
    examples: ['Software Engineer', 'Product Manager', 'Data Scientist', 'Designer']
  },
  {
    slug: 'skill',
    name: 'Skill',
    description: 'Professional skills, competencies, and expertise areas',
    icon: 'Award',
    color: 'yellow',
    schema: {
      type: 'object',
      properties: {
        skillType: { type: 'string', enum: ['technical', 'soft', 'domain', 'tool', 'language'] },
        proficiencyLevels: { type: 'array', items: { type: 'string' } },
        relatedCertifications: { type: 'array', items: { type: 'string' } },
      }
    },
    requiredFields: ['title', 'skillType'],
    allowsChildren: true, // e.g., Programming (parent) -> Python (child)
    allowsFriends: true,
    maxAliases: 10,
    isSystem: true,
    displayOrder: 5,
    examples: ['Python', 'Leadership', 'Data Analysis', 'Communication']
  },
  {
    slug: 'business',
    name: 'Business',
    description: 'Companies, organizations, and business entities',
    icon: 'Building',
    color: 'indigo',
    schema: {
      type: 'object',
      properties: {
        businessType: { type: 'string', enum: ['startup', 'sme', 'enterprise', 'nonprofit', 'government'] },
        foundedYear: { type: 'number' },
        employeeCount: { type: 'number' },
        website: { type: 'string' },
        headquarters: { type: 'string' },
      }
    },
    requiredFields: ['title'],
    allowsChildren: true, // e.g., Alphabet (parent) -> Google (child)
    allowsFriends: true,
    maxAliases: 5,
    isSystem: true,
    displayOrder: 6,
    examples: ['Google', 'Microsoft', 'Tata Group', 'Reliance Industries']
  },
  {
    slug: 'person',
    name: 'Person',
    description: 'Notable individuals, celebrities, professionals',
    icon: 'User',
    color: 'pink',
    schema: {
      type: 'object',
      properties: {
        personType: { type: 'string', enum: ['celebrity', 'professional', 'politician', 'athlete', 'artist'] },
        birthYear: { type: 'number' },
        nationality: { type: 'string' },
        occupation: { type: 'array', items: { type: 'string' } },
      }
    },
    requiredFields: ['title'],
    allowsChildren: false, // People don't typically have child entities
    allowsFriends: true, // e.g., collaborators, family members
    maxAliases: 8,
    isSystem: true,
    displayOrder: 7,
    examples: ['Rajinikanth', 'A.R. Rahman', 'Sundar Pichai']
  },
  {
    slug: 'event',
    name: 'Event',
    description: 'Conferences, festivals, competitions, and gatherings',
    icon: 'Calendar',
    color: 'red',
    schema: {
      type: 'object',
      properties: {
        eventType: { type: 'string', enum: ['conference', 'festival', 'competition', 'workshop', 'webinar'] },
        frequency: { type: 'string', enum: ['one-time', 'recurring', 'annual'] },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        venue: { type: 'string' },
      }
    },
    requiredFields: ['title', 'eventType'],
    allowsChildren: true, // e.g., TechCrunch Disrupt (parent) -> TechCrunch Disrupt 2024 (child)
    allowsFriends: true,
    maxAliases: 5,
    isSystem: true,
    displayOrder: 8,
    examples: ['Pongal', 'TechCrunch Disrupt', 'Chennai Book Fair', 'Olympic Games']
  },
  {
    slug: 'product',
    name: 'Product',
    description: 'Products, services, and offerings',
    icon: 'Package',
    color: 'teal',
    schema: {
      type: 'object',
      properties: {
        productType: { type: 'string', enum: ['physical', 'digital', 'service', 'saas'] },
        category: { type: 'string' },
        brand: { type: 'string' },
        priceRange: { type: 'object' },
      }
    },
    requiredFields: ['title', 'productType'],
    allowsChildren: true, // e.g., iPhone (parent) -> iPhone 15 Pro (child)
    allowsFriends: true,
    maxAliases: 8,
    isSystem: true,
    displayOrder: 9,
    examples: ['iPhone', 'Gmail', 'WytNet Platform', 'ChatGPT']
  },
  {
    slug: 'category',
    name: 'Category',
    description: 'Content categories, tags, and classification labels',
    icon: 'Tag',
    color: 'gray',
    schema: {
      type: 'object',
      properties: {
        categoryType: { type: 'string', enum: ['content', 'product', 'general', 'custom'] },
        parentCategory: { type: 'string' },
        displayColor: { type: 'string' },
      }
    },
    requiredFields: ['title'],
    allowsChildren: true, // e.g., Cinema (parent) -> Tamil Cinema (child)
    allowsFriends: true,
    maxAliases: 10,
    isSystem: true,
    displayOrder: 10,
    examples: ['Technology', 'Tamil Cinema', 'Finance', 'Education']
  }
];

/**
 * Helper function to get entity type by slug
 */
export function getEntityTypeBySlug(slug: string): EntityTypeDefinition | undefined {
  return ENTITY_TYPES_CATALOG.find(type => type.slug === slug);
}

/**
 * Helper function to get all system entity types
 */
export function getSystemEntityTypes(): EntityTypeDefinition[] {
  return ENTITY_TYPES_CATALOG.filter(type => type.isSystem);
}

/**
 * Helper function to validate if an entity type allows children
 */
export function entityTypeAllowsChildren(slug: string): boolean {
  const entityType = getEntityTypeBySlug(slug);
  return entityType?.allowsChildren ?? false;
}

/**
 * Helper function to validate if an entity type allows friends
 */
export function entityTypeAllowsFriends(slug: string): boolean {
  const entityType = getEntityTypeBySlug(slug);
  return entityType?.allowsFriends ?? false;
}
