// PostgreSQL full-text search fallback when Meilisearch is unavailable
import { eq, and, or, like, ilike, sql, desc } from 'drizzle-orm';
import { db } from '../db';
import {
  tenants,
  users,
  models,
  pages,
  apps,
  trademarks,
  tmNumbers,
  media,
} from '@shared/schema';
import type { SearchResult, SearchOptions, TenantSearchOptions, SearchIndex } from './searchService';

// PostgreSQL Search Service - Production-ready fallback
export class PostgreSQLSearchService {
  // Search in tenants table
  private async searchTenants(query: string, options: SearchOptions = {}): Promise<any[]> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    if (!query.trim()) {
      return db.select().from(tenants).limit(limit).offset(offset);
    }

    const searchPattern = `%${query}%`;
    return db
      .select()
      .from(tenants)
      .where(
        or(
          ilike(tenants.name, searchPattern),
          ilike(tenants.slug, searchPattern),
          ilike(tenants.domain, searchPattern),
          ilike(tenants.subdomain, searchPattern)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tenants.createdAt));
  }

  // Search in users table
  private async searchUsers(query: string, options: SearchOptions = {}): Promise<any[]> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    if (!query.trim()) {
      return db.select().from(users).limit(limit).offset(offset);
    }

    const searchPattern = `%${query}%`;
    return db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.firstName, searchPattern),
          ilike(users.lastName, searchPattern),
          ilike(users.email, searchPattern)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));
  }

  // Search in models table
  private async searchModels(query: string, options: SearchOptions = {}): Promise<any[]> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    if (!query.trim()) {
      return db.select().from(models).limit(limit).offset(offset);
    }

    const searchPattern = `%${query}%`;
    return db
      .select()
      .from(models)
      .where(
        or(
          ilike(models.name, searchPattern),
          ilike(models.description, searchPattern)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(models.createdAt));
  }

  // Search in pages table
  private async searchPages(query: string, options: SearchOptions = {}): Promise<any[]> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    if (!query.trim()) {
      return db.select().from(pages).limit(limit).offset(offset);
    }

    const searchPattern = `%${query}%`;
    return db
      .select()
      .from(pages)
      .where(
        or(
          ilike(pages.title, searchPattern),
          ilike(pages.slug, searchPattern),
          ilike(pages.path, searchPattern)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(pages.createdAt));
  }

  // Search in apps table
  private async searchApps(query: string, options: SearchOptions = {}): Promise<any[]> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    if (!query.trim()) {
      return db.select().from(apps).limit(limit).offset(offset);
    }

    const searchPattern = `%${query}%`;
    return db
      .select()
      .from(apps)
      .where(
        or(
          ilike(apps.name, searchPattern),
          ilike(apps.description, searchPattern),
          ilike(apps.key, searchPattern)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(apps.createdAt));
  }

  // Search in trademarks table
  private async searchTrademarks(query: string, options: SearchOptions = {}): Promise<any[]> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    if (!query.trim()) {
      return db.select().from(trademarks).limit(limit).offset(offset);
    }

    const searchPattern = `%${query}%`;
    return db
      .select()
      .from(trademarks)
      .where(
        or(
          ilike(trademarks.wordMark, searchPattern),
          ilike(trademarks.applicantName, searchPattern),
          ilike(trademarks.description, searchPattern)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(trademarks.applicationDate));
  }

  // Search in TM numbers table
  private async searchTMNumbers(query: string, options: SearchOptions = {}): Promise<any[]> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    if (!query.trim()) {
      return db.select().from(tmNumbers).limit(limit).offset(offset);
    }

    const searchPattern = `%${query}%`;
    return db
      .select()
      .from(tmNumbers)
      .where(
        or(
          ilike(tmNumbers.generatedNumber, searchPattern),
          ilike(tmNumbers.classCc, searchPattern),
          ilike(tmNumbers.countryCcc, searchPattern)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tmNumbers.createdAt));
  }

  // Search in media table
  private async searchMedia(query: string, options: SearchOptions = {}): Promise<any[]> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    if (!query.trim()) {
      return db.select().from(media).limit(limit).offset(offset);
    }

    const searchPattern = `%${query}%`;
    return db
      .select()
      .from(media)
      .where(
        or(
          ilike(media.filename, searchPattern),
          ilike(media.originalName, searchPattern)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(media.createdAt));
  }

  // Global search across multiple tables
  private async searchGlobal(query: string, options: SearchOptions = {}): Promise<any[]> {
    const limit = options.limit || 20;
    
    // Search across all tables and combine results (simplified)
    const [tenantsResults, modelsResults, pagesResults, appsResults] = await Promise.all([
      this.searchTenants(query, { limit: 5 }),
      this.searchModels(query, { limit: 5 }),
      this.searchPages(query, { limit: 5 }),
      this.searchApps(query, { limit: 5 }),
    ]);

    // Combine and format results
    const combined = [
      ...tenantsResults.map(t => ({ ...t, _type: 'tenant', title: t.name })),
      ...modelsResults.map(m => ({ ...m, _type: 'model', title: m.name })),
      ...pagesResults.map(p => ({ ...p, _type: 'page' })),
      ...appsResults.map(a => ({ ...a, _type: 'app', title: a.name })),
    ];

    return combined.slice(0, limit);
  }

  // Main search method
  async search<T = any>(
    indexName: SearchIndex,
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const startTime = Date.now();

    let results: any[] = [];

    // Route to appropriate table search
    switch (indexName) {
      case 'tenants':
        results = await this.searchTenants(query, options);
        break;
      case 'users':
        results = await this.searchUsers(query, options);
        break;
      case 'models':
        results = await this.searchModels(query, options);
        break;
      case 'pages':
        results = await this.searchPages(query, options);
        break;
      case 'apps':
        results = await this.searchApps(query, options);
        break;
      case 'trademarks':
        results = await this.searchTrademarks(query, options);
        break;
      case 'tm_numbers':
        results = await this.searchTMNumbers(query, options);
        break;
      case 'media':
        results = await this.searchMedia(query, options);
        break;
      case 'global_search':
        results = await this.searchGlobal(query, options);
        break;
      default:
        results = [];
    }

    const processingTime = Date.now() - startTime;

    return {
      hits: results as T[],
      query,
      processingTimeMs: processingTime,
      hitsPerPage: limit,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(results.length / limit),
      totalHits: results.length,
    };
  }

  // Tenant-aware search
  async tenantSearch<T = any>(
    indexName: SearchIndex,
    query: string,
    options: TenantSearchOptions = {}
  ): Promise<SearchResult<T>> {
    // For now, just call the regular search
    // TODO: Add tenant filtering based on options.tenantId
    return this.search<T>(indexName, query, options);
  }

  // Global search
  async globalSearch(
    query: string,
    options: TenantSearchOptions = {}
  ): Promise<SearchResult<any>> {
    return this.search('global_search' as SearchIndex, query, options);
  }

  // Get search suggestions
  async getSuggestions(
    indexName: SearchIndex,
    query: string,
    limit: number = 5,
    tenantId?: string
  ): Promise<string[]> {
    const results = await this.search(indexName, query, { limit });
    
    return results.hits
      .slice(0, limit)
      .map((hit: any) => hit.title || hit.name || hit.wordMark || '')
      .filter(Boolean);
  }

  // Get index statistics
  async getIndexStats(indexName: SearchIndex): Promise<any> {
    let count = 0;
    
    try {
      switch (indexName) {
        case 'tenants':
          [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(tenants);
          break;
        case 'users':
          [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users);
          break;
        case 'models':
          [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(models);
          break;
        case 'pages':
          [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(pages);
          break;
        case 'apps':
          [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(apps);
          break;
        case 'trademarks':
          [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(trademarks);
          break;
        case 'tm_numbers':
          [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(tmNumbers);
          break;
        case 'media':
          [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(media);
          break;
      }

      return {
        numberOfDocuments: count,
        isIndexing: false,
        fieldDistribution: {},
      };
    } catch (error) {
      console.error(`Failed to get stats for ${indexName}:`, error);
      return { numberOfDocuments: 0, isIndexing: false, fieldDistribution: {} };
    }
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      await db.select({ count: sql<number>`1` }).from(users).limit(1);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Placeholder methods for API compatibility
  async addDocuments<T>(indexName: SearchIndex, documents: T[]): Promise<void> {
    console.log(`[PostgreSQL Search] Skipping addDocuments - data already in database`);
  }

  async updateDocuments<T>(indexName: SearchIndex, documents: T[]): Promise<void> {
    console.log(`[PostgreSQL Search] Skipping updateDocuments - data already in database`);
  }

  async deleteDocuments(indexName: SearchIndex, documentIds: string[]): Promise<void> {
    console.log(`[PostgreSQL Search] Skipping deleteDocuments - use database directly`);
  }

  async clearIndex(indexName: SearchIndex): Promise<void> {
    console.log(`[PostgreSQL Search] Skipping clearIndex - use database directly`);
  }

  async initializeIndexes(): Promise<void> {
    console.log(`[PostgreSQL Search] PostgreSQL search service initialized - using database directly`);
  }
}

export const pgSearchService = new PostgreSQLSearchService();
