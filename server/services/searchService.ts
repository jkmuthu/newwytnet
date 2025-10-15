import { MeiliSearch } from 'meilisearch';
import type { 
  Tenant, 
  User, 
  Model, 
  Page, 
  App, 
  Trademark, 
  TMNumber,
  Media
} from '@shared/schema';

// Search configuration
const SEARCH_CONFIG = {
  host: process.env.MEILISEARCH_URL || 'http://127.0.0.1:7700',
  apiKey: process.env.MEILISEARCH_API_KEY || '',
  timeout: 30000,
};

// Index names for different content types
export const SEARCH_INDEXES = {
  TENANTS: 'tenants',
  USERS: 'users',
  MODELS: 'models',
  PAGES: 'pages',
  APPS: 'apps',
  TRADEMARKS: 'trademarks',
  TM_NUMBERS: 'tm_numbers',
  MEDIA: 'media',
  GLOBAL: 'global_search',
} as const;

export type SearchIndex = typeof SEARCH_INDEXES[keyof typeof SEARCH_INDEXES];

// Initialize Meilisearch client with fallback
let client: MeiliSearch | null = null;
let useMockService = false;

export function getSearchClient(): MeiliSearch {
  if (!client) {
    client = new MeiliSearch(SEARCH_CONFIG);
  }
  return client;
}

// Check if Meilisearch is available
export async function checkMeilisearchAvailability(): Promise<boolean> {
  try {
    const testClient = new MeiliSearch(SEARCH_CONFIG);
    await testClient.health();
    useMockService = false;
    return true;
  } catch (error) {
    console.warn('Meilisearch not available, using mock service for development');
    useMockService = true;
    return false;
  }
}

// Export flag for service selection
export function shouldUseMockService(): boolean {
  return useMockService;
}

// Search result interface
export interface SearchResult<T = any> {
  hits: T[];
  query: string;
  processingTimeMs: number;
  hitsPerPage: number;
  page: number;
  totalPages: number;
  totalHits: number;
  facetDistribution?: Record<string, Record<string, number>>;
}

// Search options interface
export interface SearchOptions {
  limit?: number;
  offset?: number;
  filter?: string;
  sort?: string[];
  facets?: string[];
  attributesToRetrieve?: string[];
  attributesToHighlight?: string[];
  attributesToCrop?: string[];
  cropLength?: number;
  highlightPreTag?: string;
  highlightPostTag?: string;
  matchingStrategy?: 'all' | 'last';
}

// Multi-tenant search options
export interface TenantSearchOptions extends SearchOptions {
  tenantId?: string;
  userId?: string;
}

// Searchable document types
export type SearchableDocument = 
  | (Tenant & { _type: 'tenant' })
  | (User & { _type: 'user' })
  | (WhatsAppUser & { _type: 'whatsapp_user' })
  | (Model & { _type: 'model' })
  | (Page & { _type: 'page' })
  | (App & { _type: 'app' })
  | (Trademark & { _type: 'trademark' })
  | (TMNumber & { _type: 'tm_number' })
  | (Media & { _type: 'media' });

class SearchService {
  private client: MeiliSearch;

  constructor() {
    this.client = getSearchClient();
  }

  // Initialize all search indexes with proper configuration
  async initializeIndexes(): Promise<void> {
    try {
      console.log('Initializing Meilisearch indexes...');

      // Create all indexes
      for (const indexName of Object.values(SEARCH_INDEXES)) {
        try {
          await this.client.createIndex(indexName, { primaryKey: 'id' });
          console.log(`Created index: ${indexName}`);
        } catch (error: any) {
          // Index might already exist
          if (error.code !== 'index_already_exists') {
            console.error(`Error creating index ${indexName}:`, error);
          }
        }
      }

      // Configure tenant index
      await this.configureTenantsIndex();
      
      // Configure users index
      await this.configureUsersIndex();
      
      // Configure WhatsApp users index
      await this.configureWhatsAppUsersIndex();
      
      // Configure models index
      await this.configureModelsIndex();
      
      // Configure pages index
      await this.configurePagesIndex();
      
      // Configure apps index
      await this.configureAppsIndex();
      
      // Configure trademarks index
      await this.configureTrademarksIndex();
      
      // Configure TM numbers index
      await this.configureTMNumbersIndex();
      
      // Configure media index
      await this.configureMediaIndex();
      
      // Configure global search index
      await this.configureGlobalIndex();

      console.log('All search indexes initialized successfully');
    } catch (error) {
      console.error('Failed to initialize search indexes:', error);
      throw error;
    }
  }

  // Configure tenants index
  private async configureTenantsIndex(): Promise<void> {
    const index = this.client.index(SEARCH_INDEXES.TENANTS);
    
    await index.updateSettings({
      searchableAttributes: ['name', 'slug', 'domain', 'subdomain'],
      filterableAttributes: ['status', 'createdAt', 'updatedAt'],
      sortableAttributes: ['createdAt', 'updatedAt', 'name'],
      displayedAttributes: ['id', 'name', 'slug', 'domain', 'status'],
    });
  }

  // Configure users index
  private async configureUsersIndex(): Promise<void> {
    const index = this.client.index(SEARCH_INDEXES.USERS);
    
    await index.updateSettings({
      searchableAttributes: ['firstName', 'lastName', 'email'],
      filterableAttributes: ['tenantId', 'createdAt', 'updatedAt'],
      sortableAttributes: ['createdAt', 'updatedAt', 'firstName', 'lastName'],
      displayedAttributes: ['id', 'firstName', 'lastName', 'email', 'tenantId'],
    });
  }

  // Configure WhatsApp users index
  private async configureWhatsAppUsersIndex(): Promise<void> {
    const index = this.client.index(SEARCH_INDEXES.USERS);
    
    await index.updateSettings({
      searchableAttributes: ['name', 'whatsappNumber'],
      filterableAttributes: ['country', 'isVerified', 'tenantId', 'createdAt'],
      sortableAttributes: ['createdAt', 'lastLoginAt', 'name'],
      displayedAttributes: ['id', 'name', 'country', 'whatsappNumber', 'isVerified'],
    });
  }

  // Configure models index
  private async configureModelsIndex(): Promise<void> {
    const index = this.client.index(SEARCH_INDEXES.MODELS);
    
    await index.updateSettings({
      searchableAttributes: ['name', 'description'],
      filterableAttributes: ['tenantId', 'status', 'version', 'createdBy', 'createdAt'],
      sortableAttributes: ['createdAt', 'updatedAt', 'name', 'version'],
      displayedAttributes: ['id', 'name', 'description', 'status', 'version', 'tenantId'],
    });
  }

  // Configure pages index
  private async configurePagesIndex(): Promise<void> {
    const index = this.client.index(SEARCH_INDEXES.PAGES);
    
    await index.updateSettings({
      searchableAttributes: ['title', 'slug', 'path'],
      filterableAttributes: ['tenantId', 'status', 'locale', 'createdBy', 'publishedAt'],
      sortableAttributes: ['createdAt', 'updatedAt', 'publishedAt', 'title'],
      displayedAttributes: ['id', 'title', 'slug', 'path', 'status', 'locale'],
    });
  }

  // Configure apps index
  private async configureAppsIndex(): Promise<void> {
    const index = this.client.index(SEARCH_INDEXES.APPS);
    
    await index.updateSettings({
      searchableAttributes: ['name', 'description', 'key'],
      filterableAttributes: ['tenantId', 'status', 'isPublic', 'categories', 'createdBy'],
      sortableAttributes: ['createdAt', 'updatedAt', 'name', 'version'],
      displayedAttributes: ['id', 'key', 'name', 'description', 'version', 'status'],
    });
  }

  // Configure trademarks index
  private async configureTrademarksIndex(): Promise<void> {
    const index = this.client.index(SEARCH_INDEXES.TRADEMARKS);
    
    await index.updateSettings({
      searchableAttributes: ['wordMark', 'applicantName', 'description'],
      filterableAttributes: ['applicationNumber', 'registrationNumber', 'status', 'classification', 'type', 'applicationDate', 'country'],
      sortableAttributes: ['applicationDate', 'registrationDate', 'renewalDate', 'wordMark'],
      displayedAttributes: ['id', 'wordMark', 'applicantName', 'applicationNumber', 'status', 'classification'],
    });
  }

  // Configure TM numbers index
  private async configureTMNumbersIndex(): Promise<void> {
    const index = this.client.index(SEARCH_INDEXES.TM_NUMBERS);
    
    await index.updateSettings({
      searchableAttributes: ['generatedNumber', 'classCc', 'countryCcc', 'segmentKey'],
      filterableAttributes: ['classCc', 'countryCcc', 'segmentKey', 'status', 'createdAt'],
      sortableAttributes: ['createdAt', 'generatedNumber'],
      displayedAttributes: ['id', 'generatedNumber', 'classCc', 'countryCcc', 'segmentKey', 'status'],
    });
  }

  // Configure media index
  private async configureMediaIndex(): Promise<void> {
    const index = this.client.index(SEARCH_INDEXES.MEDIA);
    
    await index.updateSettings({
      searchableAttributes: ['filename', 'originalName'],
      filterableAttributes: ['tenantId', 'mimeType', 'createdBy', 'createdAt'],
      sortableAttributes: ['createdAt', 'filename', 'size'],
      displayedAttributes: ['id', 'filename', 'originalName', 'mimeType', 'size', 'url'],
    });
  }

  // Configure global search index (aggregated content)
  private async configureGlobalIndex(): Promise<void> {
    const index = this.client.index(SEARCH_INDEXES.GLOBAL);
    
    await index.updateSettings({
      searchableAttributes: ['title', 'content', 'description', 'keywords'],
      filterableAttributes: ['type', 'tenantId', 'userId', 'status', 'category', 'createdAt'],
      sortableAttributes: ['createdAt', 'updatedAt', 'relevanceScore', 'title'],
      displayedAttributes: ['id', 'type', 'title', 'description', 'url', 'tenantId'],
    });
  }

  // Add documents to specific index
  async addDocuments<T>(indexName: SearchIndex, documents: T[]): Promise<void> {
    if (!documents || documents.length === 0) return;

    try {
      const index = this.client.index(indexName);
      const task = await index.addDocuments(documents, { primaryKey: 'id' });
      
      // Wait for indexing to complete
      await this.client.waitForTask(task.taskUid);
      console.log(`Added ${documents.length} documents to ${indexName} index`);
    } catch (error) {
      console.error(`Failed to add documents to ${indexName}:`, error);
      throw error;
    }
  }

  // Update documents in specific index
  async updateDocuments<T>(indexName: SearchIndex, documents: T[]): Promise<void> {
    if (!documents || documents.length === 0) return;

    try {
      const index = this.client.index(indexName);
      const task = await index.updateDocuments(documents, { primaryKey: 'id' });
      
      // Wait for indexing to complete
      await this.client.waitForTask(task.taskUid);
      console.log(`Updated ${documents.length} documents in ${indexName} index`);
    } catch (error) {
      console.error(`Failed to update documents in ${indexName}:`, error);
      throw error;
    }
  }

  // Delete documents from specific index
  async deleteDocuments(indexName: SearchIndex, documentIds: string[]): Promise<void> {
    if (!documentIds || documentIds.length === 0) return;

    try {
      const index = this.client.index(indexName);
      const task = await index.deleteDocuments(documentIds);
      
      // Wait for deletion to complete
      await this.client.waitForTask(task.taskUid);
      console.log(`Deleted ${documentIds.length} documents from ${indexName} index`);
    } catch (error) {
      console.error(`Failed to delete documents from ${indexName}:`, error);
      throw error;
    }
  }

  // Search within specific index
  async search<T = any>(
    indexName: SearchIndex, 
    query: string, 
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    try {
      const index = this.client.index(indexName);
      const searchOptions = {
        limit: options.limit || 20,
        offset: options.offset || 0,
        filter: options.filter,
        sort: options.sort,
        facets: options.facets,
        attributesToRetrieve: options.attributesToRetrieve,
        attributesToHighlight: options.attributesToHighlight || ['*'],
        attributesToCrop: options.attributesToCrop,
        cropLength: options.cropLength || 200,
        highlightPreTag: options.highlightPreTag || '<mark>',
        highlightPostTag: options.highlightPostTag || '</mark>',
        matchingStrategy: options.matchingStrategy || 'last',
      };

      const result = await index.search(query, searchOptions);
      
      return {
        hits: result.hits as T[],
        query: result.query,
        processingTimeMs: result.processingTimeMs,
        hitsPerPage: result.hitsPerPage,
        page: result.page,
        totalPages: result.totalPages,
        totalHits: result.totalHits,
        facetDistribution: result.facetDistribution,
      };
    } catch (error) {
      console.error(`Search failed in ${indexName}:`, error);
      throw error;
    }
  }

  // Multi-tenant search with automatic filtering
  async tenantSearch<T = any>(
    indexName: SearchIndex,
    query: string,
    options: TenantSearchOptions = {}
  ): Promise<SearchResult<T>> {
    const filters = [];
    
    if (options.tenantId) {
      filters.push(`tenantId = "${options.tenantId}"`);
    }
    
    if (options.userId) {
      filters.push(`createdBy = "${options.userId}"`);
    }
    
    if (options.filter) {
      filters.push(options.filter);
    }

    const searchOptions: SearchOptions = {
      ...options,
      filter: filters.length > 0 ? filters.join(' AND ') : undefined,
    };

    return this.search<T>(indexName, query, searchOptions);
  }

  // Global search across all content types
  async globalSearch(
    query: string,
    options: TenantSearchOptions = {}
  ): Promise<SearchResult<SearchableDocument>> {
    return this.tenantSearch<SearchableDocument>(
      SEARCH_INDEXES.GLOBAL,
      query,
      {
        ...options,
        attributesToRetrieve: ['id', 'type', 'title', 'description', 'url', 'tenantId'],
      }
    );
  }

  // Search suggestions/autocomplete
  async getSuggestions(
    indexName: SearchIndex,
    query: string,
    limit: number = 5,
    tenantId?: string
  ): Promise<string[]> {
    try {
      const searchOptions: SearchOptions = {
        limit,
        attributesToRetrieve: ['id'],
        attributesToHighlight: [],
      };

      if (tenantId) {
        searchOptions.filter = `tenantId = "${tenantId}"`;
      }

      const result = await this.search(indexName, query, searchOptions);
      
      // Extract unique suggestion terms (simplified approach)
      // In production, you might want to implement a dedicated suggestions index
      return result.hits
        .slice(0, limit)
        .map((hit: any) => hit.title || hit.name || hit.wordMark || '')
        .filter(Boolean);
    } catch (error) {
      console.error(`Failed to get suggestions from ${indexName}:`, error);
      return [];
    }
  }

  // Get search statistics
  async getIndexStats(indexName: SearchIndex): Promise<any> {
    try {
      const index = this.client.index(indexName);
      return await index.getStats();
    } catch (error) {
      console.error(`Failed to get stats for ${indexName}:`, error);
      return null;
    }
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.client.health();
      return health.status === 'available';
    } catch (error) {
      console.error('Search service health check failed:', error);
      return false;
    }
  }

  // Clear all data from an index
  async clearIndex(indexName: SearchIndex): Promise<void> {
    try {
      const index = this.client.index(indexName);
      const task = await index.deleteAllDocuments();
      await this.client.waitForTask(task.taskUid);
      console.log(`Cleared all documents from ${indexName} index`);
    } catch (error) {
      console.error(`Failed to clear ${indexName} index:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const searchService = new SearchService();