// Mock search service for development when Meilisearch is not available
import type { SearchResult, SearchOptions, TenantSearchOptions, SearchIndex } from './searchService';

// Mock search results generator
const generateMockResults = (query: string, indexType: string, limit: number = 20): any[] => {
  if (!query.trim()) return [];

  const mockData: Record<string, any[]> = {
    tenants: [
      { id: '1', name: 'Acme Corporation', slug: 'acme', domain: 'acme.com', status: 'active' },
      { id: '2', name: 'Global Tech Solutions', slug: 'globaltech', domain: 'globaltech.io', status: 'active' },
      { id: '3', name: 'Innovation Hub', slug: 'innovation', domain: 'innovationhub.in', status: 'active' },
    ],
    users: [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', tenantId: '1' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', tenantId: '1' },
      { id: '3', firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com', tenantId: '2' },
    ],
    users: [
      { id: '1', name: 'Rahul Sharma', country: 'IN', whatsappNumber: '+919876543210', isVerified: true },
      { id: '2', name: 'Priya Patel', country: 'IN', whatsappNumber: '+919876543211', isVerified: true },
      { id: '3', name: 'Amit Kumar', country: 'IN', whatsappNumber: '+919876543212', isVerified: false },
    ],
    models: [
      { id: '1', name: 'Product Catalog', description: 'E-commerce product management', status: 'published', tenantId: '1' },
      { id: '2', name: 'Customer Records', description: 'Customer relationship management', status: 'draft', tenantId: '1' },
      { id: '3', name: 'Inventory System', description: 'Stock and inventory tracking', status: 'published', tenantId: '2' },
    ],
    pages: [
      { id: '1', title: 'About Us', slug: 'about', path: '/about', status: 'published', locale: 'en-IN' },
      { id: '2', title: 'Contact Information', slug: 'contact', path: '/contact', status: 'published', locale: 'en-IN' },
      { id: '3', title: 'Privacy Policy', slug: 'privacy', path: '/privacy', status: 'published', locale: 'en-IN' },
    ],
    apps: [
      { id: '1', key: 'ecommerce', name: 'E-Commerce Suite', description: 'Complete online store solution', status: 'published' },
      { id: '2', key: 'crm', name: 'Customer CRM', description: 'Customer relationship management', status: 'published' },
      { id: '3', key: 'analytics', name: 'Analytics Dashboard', description: 'Business intelligence and reporting', status: 'draft' },
    ],
    trademarks: [
      { id: '1', wordMark: 'TECHFLOW', applicantName: 'Tech Solutions Inc.', applicationNumber: 'TM2024001', status: 'registered' },
      { id: '2', wordMark: 'INNOVATE+', applicantName: 'Innovation Labs', applicationNumber: 'TM2024002', status: 'pending' },
      { id: '3', wordMark: 'SMARTBIZ', applicantName: 'Business Apps Ltd.', applicationNumber: 'TM2024003', status: 'registered' },
    ],
    tm_numbers: [
      { id: '1', generatedNumber: 'TM-IN-09-2024-001', classCc: '09', countryCcc: 'IN', status: 'active' },
      { id: '2', generatedNumber: 'TM-IN-35-2024-002', classCc: '35', countryCcc: 'IN', status: 'active' },
      { id: '3', generatedNumber: 'TM-IN-42-2024-003', classCc: '42', countryCcc: 'IN', status: 'reserved' },
    ],
    media: [
      { id: '1', filename: 'company-logo.png', originalName: 'Company Logo.png', mimeType: 'image/png', size: 15420 },
      { id: '2', filename: 'product-image.jpg', originalName: 'Product Image.jpg', mimeType: 'image/jpeg', size: 234560 },
      { id: '3', filename: 'user-manual.pdf', originalName: 'User Manual.pdf', mimeType: 'application/pdf', size: 1024000 },
    ],
    global: [
      { id: 'tenant_1', type: 'tenant', title: 'Acme Corporation', description: 'Organization: Acme Corporation', category: 'organization' },
      { id: 'model_1', type: 'model', title: 'Product Catalog', description: 'CRUD Model: Product Catalog', category: 'crud' },
      { id: 'page_1', type: 'page', title: 'About Us', description: 'CMS Page: About Us', category: 'content' },
      { id: 'app_1', type: 'app', title: 'E-Commerce Suite', description: 'Application: E-Commerce Suite', category: 'application' },
      { id: 'trademark_1', type: 'trademark', title: 'TECHFLOW', description: 'Trademark by Tech Solutions Inc.', category: 'trademark' },
    ],
  };

  const indexData = mockData[indexType] || [];
  
  // Simple text matching
  const results = indexData.filter(item => {
    const searchableText = Object.values(item).join(' ').toLowerCase();
    return searchableText.includes(query.toLowerCase());
  });

  // Add highlighting simulation
  return results.slice(0, limit).map(item => ({
    ...item,
    _formatted: {
      title: item.title || item.name || item.wordMark,
      description: item.description,
    }
  }));
};

export class MockSearchService {
  private mockDelay = () => new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  async search<T = any>(
    indexName: SearchIndex,
    query: string,
    options: SearchOptions = {}
  ): Promise<any> {
    await this.mockDelay();
    
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    
    const allResults = generateMockResults(query, indexName, limit + offset);
    const paginatedResults = allResults.slice(offset, offset + limit);
    
    return {
      hits: paginatedResults,
      query,
      processingTimeMs: Math.floor(50 + Math.random() * 100),
      hitsPerPage: limit,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(allResults.length / limit),
      totalHits: allResults.length,
    };
  }

  async tenantSearch<T = any>(
    indexName: SearchIndex,
    query: string,
    options: TenantSearchOptions = {}
  ): Promise<any> {
    return this.search<T>(indexName, query, options);
  }

  async globalSearch(
    query: string,
    options: TenantSearchOptions = {}
  ): Promise<any> {
    return this.search('global' as SearchIndex, query, options);
  }

  async getSuggestions(
    indexName: SearchIndex,
    query: string,
    limit: number = 5
  ): Promise<string[]> {
    await this.mockDelay();
    
    const suggestions = [
      `${query} solution`,
      `${query} system`,
      `${query} platform`,
      `${query} management`,
      `${query} services`,
    ];
    
    return suggestions.slice(0, limit);
  }

  async getIndexStats(indexName: SearchIndex): Promise<any> {
    await this.mockDelay();
    
    const mockStats: Record<string, any> = {
      tenants: { numberOfDocuments: 3, isIndexing: false, fieldDistribution: { name: 3, slug: 3 } },
      users: { numberOfDocuments: 25, isIndexing: false, fieldDistribution: { name: 25, whatsappNumber: 25 } },
      models: { numberOfDocuments: 8, isIndexing: false, fieldDistribution: { name: 8, description: 8 } },
      pages: { numberOfDocuments: 12, isIndexing: false, fieldDistribution: { title: 12, content: 12 } },
      apps: { numberOfDocuments: 6, isIndexing: false, fieldDistribution: { name: 6, description: 6 } },
      trademarks: { numberOfDocuments: 1250, isIndexing: false, fieldDistribution: { wordMark: 1250, applicantName: 1250 } },
      tm_numbers: { numberOfDocuments: 850, isIndexing: false, fieldDistribution: { generatedNumber: 850 } },
      media: { numberOfDocuments: 45, isIndexing: false, fieldDistribution: { filename: 45, originalName: 45 } },
      global: { numberOfDocuments: 2150, isIndexing: false, fieldDistribution: { title: 2150, content: 2150 } },
    };

    return mockStats[indexName] || { numberOfDocuments: 0, isIndexing: false, fieldDistribution: {} };
  }

  async isHealthy(): Promise<boolean> {
    return true; // Mock service is always "healthy"
  }

  async addDocuments<T>(indexName: SearchIndex, documents: T[]): Promise<void> {
    await this.mockDelay();
    console.log(`[MOCK] Added ${documents.length} documents to ${indexName} index`);
  }

  async updateDocuments<T>(indexName: SearchIndex, documents: T[]): Promise<void> {
    await this.mockDelay();
    console.log(`[MOCK] Updated ${documents.length} documents in ${indexName} index`);
  }

  async deleteDocuments(indexName: SearchIndex, documentIds: string[]): Promise<void> {
    await this.mockDelay();
    console.log(`[MOCK] Deleted ${documentIds.length} documents from ${indexName} index`);
  }

  async clearIndex(indexName: SearchIndex): Promise<void> {
    await this.mockDelay();
    console.log(`[MOCK] Cleared all documents from ${indexName} index`);
  }

  async initializeIndexes(): Promise<void> {
    await this.mockDelay();
    console.log('[MOCK] Initialized all search indexes');
  }
}

export const mockSearchService = new MockSearchService();