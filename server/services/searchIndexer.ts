import { db } from '../db';
import { searchService, SEARCH_INDEXES } from './searchService';
import type { 
  Tenant, 
  User, 
  Model, 
  Page, 
  App, 
  Trademark, 
  TMNumber,
  Media,
  WhatsAppUser
} from '@shared/schema';
import { 
  tenants,
  users,
  whatsappUsers,
  models,
  pages,
  apps,
  trademarks,
  tmNumbers,
  media
} from '@shared/schema';

// Batch processing configuration
const BATCH_SIZE = 1000;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Background indexing job status
export interface IndexingJob {
  id: string;
  type: 'full' | 'incremental' | 'single';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
}

class SearchIndexer {
  private activeJobs: Map<string, IndexingJob> = new Map();

  // Initialize search indexes and perform initial data sync
  async initialize(): Promise<void> {
    console.log('Initializing search service and indexes...');
    
    try {
      // Initialize Meilisearch indexes
      await searchService.initializeIndexes();
      
      // Check if indexes are empty and need initial population
      await this.checkAndPopulateIndexes();
      
      console.log('Search indexer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize search indexer:', error);
      throw error;
    }
  }

  // Check if indexes need initial population
  private async checkAndPopulateIndexes(): Promise<void> {
    try {
      // Check each index and populate if empty
      const indexChecks = [
        { index: SEARCH_INDEXES.TENANTS, populateFn: () => this.indexAllTenants() },
        { index: SEARCH_INDEXES.USERS, populateFn: () => this.indexAllUsers() },
        { index: SEARCH_INDEXES.WHATSAPP_USERS, populateFn: () => this.indexAllWhatsAppUsers() },
        { index: SEARCH_INDEXES.MODELS, populateFn: () => this.indexAllModels() },
        { index: SEARCH_INDEXES.PAGES, populateFn: () => this.indexAllPages() },
        { index: SEARCH_INDEXES.APPS, populateFn: () => this.indexAllApps() },
        { index: SEARCH_INDEXES.TRADEMARKS, populateFn: () => this.indexAllTrademarks() },
        { index: SEARCH_INDEXES.TM_NUMBERS, populateFn: () => this.indexAllTMNumbers() },
        { index: SEARCH_INDEXES.MEDIA, populateFn: () => this.indexAllMedia() },
      ];

      for (const { index, populateFn } of indexChecks) {
        const stats = await searchService.getIndexStats(index);
        
        if (!stats || stats.numberOfDocuments === 0) {
          console.log(`Populating empty ${index} index...`);
          await populateFn();
        } else {
          console.log(`${index} index already has ${stats.numberOfDocuments} documents`);
        }
      }

      // Always update global search index
      await this.rebuildGlobalIndex();
      
    } catch (error) {
      console.error('Error checking and populating indexes:', error);
      throw error;
    }
  }

  // Index all tenants
  async indexAllTenants(): Promise<void> {
    try {
      const allTenants = await db.select().from(tenants);
      
      if (allTenants.length > 0) {
        await this.processBatch(SEARCH_INDEXES.TENANTS, allTenants);
        console.log(`Indexed ${allTenants.length} tenants`);
      }
    } catch (error) {
      console.error('Failed to index tenants:', error);
      throw error;
    }
  }

  // Index all users
  async indexAllUsers(): Promise<void> {
    try {
      const allUsers = await db.select().from(users);
      
      if (allUsers.length > 0) {
        await this.processBatch(SEARCH_INDEXES.USERS, allUsers);
        console.log(`Indexed ${allUsers.length} users`);
      }
    } catch (error) {
      console.error('Failed to index users:', error);
      throw error;
    }
  }

  // Index all WhatsApp users
  async indexAllWhatsAppUsers(): Promise<void> {
    try {
      const allWhatsAppUsers = await db.select().from(whatsappUsers);
      
      if (allWhatsAppUsers.length > 0) {
        await this.processBatch(SEARCH_INDEXES.WHATSAPP_USERS, allWhatsAppUsers);
        console.log(`Indexed ${allWhatsAppUsers.length} WhatsApp users`);
      }
    } catch (error) {
      console.error('Failed to index WhatsApp users:', error);
      throw error;
    }
  }

  // Index all models
  async indexAllModels(): Promise<void> {
    try {
      const allModels = await db.select().from(models);
      
      if (allModels.length > 0) {
        await this.processBatch(SEARCH_INDEXES.MODELS, allModels);
        console.log(`Indexed ${allModels.length} models`);
      }
    } catch (error) {
      console.error('Failed to index models:', error);
      throw error;
    }
  }

  // Index all pages
  async indexAllPages(): Promise<void> {
    try {
      const allPages = await db.select().from(pages);
      
      if (allPages.length > 0) {
        // Transform pages to include searchable content
        const searchablePages = allPages.map(page => ({
          ...page,
          searchableContent: this.extractPageContent(page.content as any),
        }));
        
        await this.processBatch(SEARCH_INDEXES.PAGES, searchablePages);
        console.log(`Indexed ${searchablePages.length} pages`);
      }
    } catch (error) {
      console.error('Failed to index pages:', error);
      throw error;
    }
  }

  // Index all apps
  async indexAllApps(): Promise<void> {
    try {
      const allApps = await db.select().from(apps);
      
      if (allApps.length > 0) {
        // Transform apps to include searchable categories
        const searchableApps = allApps.map(app => ({
          ...app,
          searchableCategories: Array.isArray(app.categories) 
            ? app.categories.join(', ') 
            : '',
        }));
        
        await this.processBatch(SEARCH_INDEXES.APPS, searchableApps);
        console.log(`Indexed ${searchableApps.length} apps`);
      }
    } catch (error) {
      console.error('Failed to index apps:', error);
      throw error;
    }
  }

  // Index all trademarks
  async indexAllTrademarks(): Promise<void> {
    try {
      const allTrademarks = await db.select().from(trademarks);
      
      if (allTrademarks.length > 0) {
        await this.processBatch(SEARCH_INDEXES.TRADEMARKS, allTrademarks);
        console.log(`Indexed ${allTrademarks.length} trademarks`);
      }
    } catch (error) {
      console.error('Failed to index trademarks:', error);
      throw error;
    }
  }

  // Index all TM numbers
  async indexAllTMNumbers(): Promise<void> {
    try {
      const allTMNumbers = await db.select().from(tmNumbers);
      
      if (allTMNumbers.length > 0) {
        await this.processBatch(SEARCH_INDEXES.TM_NUMBERS, allTMNumbers);
        console.log(`Indexed ${allTMNumbers.length} TM numbers`);
      }
    } catch (error) {
      console.error('Failed to index TM numbers:', error);
      throw error;
    }
  }

  // Index all media files
  async indexAllMedia(): Promise<void> {
    try {
      const allMedia = await db.select().from(media);
      
      if (allMedia.length > 0) {
        await this.processBatch(SEARCH_INDEXES.MEDIA, allMedia);
        console.log(`Indexed ${allMedia.length} media files`);
      }
    } catch (error) {
      console.error('Failed to index media:', error);
      throw error;
    }
  }

  // Rebuild global search index with aggregated content
  async rebuildGlobalIndex(): Promise<void> {
    try {
      console.log('Rebuilding global search index...');
      
      // Clear existing global index
      await searchService.clearIndex(SEARCH_INDEXES.GLOBAL);
      
      // Aggregate content from all sources
      const globalDocuments = [];
      
      // Add tenants to global search
      const allTenants = await db.select().from(tenants);
      for (const tenant of allTenants) {
        globalDocuments.push({
          id: `tenant_${tenant.id}`,
          type: 'tenant',
          title: tenant.name,
          description: `Organization: ${tenant.name}`,
          content: `${tenant.name} ${tenant.slug}`,
          url: `/tenants/${tenant.slug}`,
          tenantId: tenant.id,
          category: 'organization',
          createdAt: tenant.createdAt,
        });
      }

      // Add models to global search
      const allModels = await db.select().from(models);
      for (const model of allModels) {
        globalDocuments.push({
          id: `model_${model.id}`,
          type: 'model',
          title: model.name,
          description: model.description || `CRUD Model: ${model.name}`,
          content: `${model.name} ${model.description || ''}`,
          url: `/models/${model.id}`,
          tenantId: model.tenantId,
          userId: model.createdBy,
          category: 'crud',
          status: model.status,
          createdAt: model.createdAt,
        });
      }

      // Add pages to global search
      const allPages = await db.select().from(pages);
      for (const page of allPages) {
        globalDocuments.push({
          id: `page_${page.id}`,
          type: 'page',
          title: page.title,
          description: `CMS Page: ${page.title}`,
          content: `${page.title} ${this.extractPageContent(page.content as any)}`,
          url: page.path,
          tenantId: page.tenantId,
          userId: page.createdBy,
          category: 'content',
          status: page.status,
          createdAt: page.createdAt,
        });
      }

      // Add apps to global search
      const allApps = await db.select().from(apps);
      for (const app of allApps) {
        globalDocuments.push({
          id: `app_${app.id}`,
          type: 'app',
          title: app.name,
          description: app.description || `Application: ${app.name}`,
          content: `${app.name} ${app.description || ''}`,
          url: `/apps/${app.key}`,
          tenantId: app.tenantId,
          userId: app.createdBy,
          category: 'application',
          status: app.status,
          createdAt: app.createdAt,
        });
      }

      // Add trademarks to global search
      const allTrademarks = await db.select().from(trademarks);
      for (const trademark of allTrademarks) {
        globalDocuments.push({
          id: `trademark_${trademark.id}`,
          type: 'trademark',
          title: trademark.wordMark || trademark.applicationNumber,
          description: `Trademark by ${trademark.applicantName}`,
          content: `${trademark.wordMark || ''} ${trademark.applicantName} ${trademark.description || ''}`,
          url: `/trademarks/${trademark.id}`,
          category: 'trademark',
          status: trademark.status,
          createdAt: trademark.applicationDate,
        });
      }

      // Process global documents in batches
      if (globalDocuments.length > 0) {
        await this.processBatch(SEARCH_INDEXES.GLOBAL, globalDocuments);
        console.log(`Rebuilt global index with ${globalDocuments.length} documents`);
      }
      
    } catch (error) {
      console.error('Failed to rebuild global search index:', error);
      throw error;
    }
  }

  // Process documents in batches with retry logic
  private async processBatch<T>(indexName: string, documents: T[]): Promise<void> {
    const batches = [];
    
    // Split into batches
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      batches.push(documents.slice(i, i + BATCH_SIZE));
    }

    // Process each batch with retry logic
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      let attempts = 0;
      
      while (attempts < MAX_RETRY_ATTEMPTS) {
        try {
          await searchService.addDocuments(indexName as any, batch);
          break; // Success, exit retry loop
        } catch (error) {
          attempts++;
          console.error(`Batch ${i + 1} failed (attempt ${attempts}):`, error);
          
          if (attempts >= MAX_RETRY_ATTEMPTS) {
            throw new Error(`Failed to process batch ${i + 1} after ${MAX_RETRY_ATTEMPTS} attempts`);
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
        }
      }
    }
  }

  // Extract searchable content from page content JSON
  private extractPageContent(content: any): string {
    if (!content) return '';
    
    try {
      const extractText = (obj: any): string => {
        if (typeof obj === 'string') return obj;
        if (typeof obj !== 'object') return '';
        
        let text = '';
        
        if (obj.text) text += obj.text + ' ';
        if (obj.content) text += obj.content + ' ';
        if (obj.title) text += obj.title + ' ';
        if (obj.heading) text += obj.heading + ' ';
        
        if (Array.isArray(obj)) {
          for (const item of obj) {
            text += extractText(item) + ' ';
          }
        } else if (typeof obj === 'object') {
          for (const value of Object.values(obj)) {
            text += extractText(value) + ' ';
          }
        }
        
        return text;
      };
      
      return extractText(content).trim();
    } catch (error) {
      console.error('Error extracting page content:', error);
      return '';
    }
  }

  // Index single document (for real-time updates)
  async indexDocument<T>(indexName: string, document: T): Promise<void> {
    try {
      await searchService.addDocuments(indexName as any, [document]);
    } catch (error) {
      console.error(`Failed to index single document in ${indexName}:`, error);
      throw error;
    }
  }

  // Update single document
  async updateDocument<T>(indexName: string, document: T): Promise<void> {
    try {
      await searchService.updateDocuments(indexName as any, [document]);
    } catch (error) {
      console.error(`Failed to update single document in ${indexName}:`, error);
      throw error;
    }
  }

  // Delete single document
  async deleteDocument(indexName: string, documentId: string): Promise<void> {
    try {
      await searchService.deleteDocuments(indexName as any, [documentId]);
    } catch (error) {
      console.error(`Failed to delete document ${documentId} from ${indexName}:`, error);
      throw error;
    }
  }

  // Get indexing job status
  getJobStatus(jobId: string): IndexingJob | null {
    return this.activeJobs.get(jobId) || null;
  }

  // Get all active jobs
  getActiveJobs(): IndexingJob[] {
    return Array.from(this.activeJobs.values());
  }

  // Clear completed jobs
  clearCompletedJobs(): void {
    for (const [jobId, job] of this.activeJobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed') {
        this.activeJobs.delete(jobId);
      }
    }
  }
}

// Export singleton instance
export const searchIndexer = new SearchIndexer();