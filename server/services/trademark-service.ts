/**
 * Trademark Database Service
 * Handles all database operations for Indian Trademarks
 * Manages deduplication, validation, and lifecycle tracking
 */

import { db } from '../db';
import { trademarkMaster, trademarkLifecycle, datasetSyncLogs, datasetAuditTrail } from '@shared/schema';
import { eq, and, sql, inArray, desc } from 'drizzle-orm';
import { tmviewService } from './tmview-service';

interface TrademarkInsertData {
  tmNumber: string;
  brandName?: string;
  brandImage?: string;
  classes?: number[];
  goodsServices?: string;
  applicationDate?: Date;
  registrationDate?: Date;
  status?: string;
  office?: string;
  owner?: string;
  ownerAddress?: string;
  source?: string;
  metadata?: any;
}

interface TrademarkLifecycleData {
  tmNumber: string;
  eventType: string;
  eventDate: Date;
  eventDetails?: string;
  documentUrl?: string;
  source?: string;
  metadata?: any;
}

export class TrademarkService {
  /**
   * Insert or update trademark record
   * Handles deduplication and source priority
   */
  async upsertTrademark(data: TrademarkInsertData, userId?: string): Promise<any> {
    try {
      // Validate TM Number
      if (!tmviewService.validateTMNumber(data.tmNumber)) {
        throw new Error(`Invalid TM Number: ${data.tmNumber}`);
      }

      // Standardize fields
      const standardized = {
        tmNumber: data.tmNumber.replace(/\D/g, ''),
        brandName: data.brandName ? tmviewService.cleanText(data.brandName) : null,
        brandImage: data.brandImage || null,
        classes: data.classes ? tmviewService.validateClasses(data.classes) : [],
        goodsServices: data.goodsServices ? tmviewService.cleanText(data.goodsServices) : null,
        applicationDate: data.applicationDate || null,
        registrationDate: data.registrationDate || null,
        status: data.status ? tmviewService.standardizeStatus(data.status) : 'Filed',
        office: data.office ? tmviewService.standardizeOffice(data.office) : null,
        owner: data.owner ? tmviewService.cleanText(data.owner) : null,
        ownerAddress: data.ownerAddress || null,
        source: data.source || 'Manual',
        sourcePriority: tmviewService.getSourcePriority(data.source || 'Manual'),
        lastSyncedAt: new Date(),
        metadata: data.metadata || {},
        updatedAt: new Date(),
      };

      // Check if record exists
      const existing = await db.select()
        .from(trademarkMaster)
        .where(eq(trademarkMaster.tmNumber, standardized.tmNumber))
        .limit(1);

      let result;
      let action: 'create' | 'update' | 'skip' = 'skip';
      const oldValues = existing[0] || {};

      if (existing.length === 0) {
        // Insert new record
        result = await db.insert(trademarkMaster)
          .values(standardized)
          .returning();
        action = 'create';
      } else {
        // Check source priority
        const existingPriority = existing[0].sourcePriority || 5;
        const newPriority = standardized.sourcePriority;

        // Only update if new source has higher or equal priority
        if (newPriority <= existingPriority) {
          result = await db.update(trademarkMaster)
            .set(standardized)
            .where(eq(trademarkMaster.tmNumber, standardized.tmNumber))
            .returning();
          action = 'update';
        } else {
          result = existing;
          action = 'skip';
        }
      }

      // Log audit trail
      if (action !== 'skip') {
        await this.logAudit({
          tmNumber: standardized.tmNumber,
          action,
          userId,
          oldValues: action === 'update' ? oldValues : undefined,
          newValues: standardized,
          source: data.source || 'Manual',
        });
      }

      return { record: result[0], action };

    } catch (error: any) {
      console.error('[Trademark] Upsert error:', error);
      throw error;
    }
  }

  /**
   * Add lifecycle event for a trademark
   */
  async addLifecycleEvent(data: TrademarkLifecycleData, userId?: string): Promise<any> {
    try {
      const result = await db.insert(trademarkLifecycle)
        .values({
          tmNumber: data.tmNumber,
          eventType: data.eventType,
          eventDate: data.eventDate,
          eventDetails: data.eventDetails || null,
          documentUrl: data.documentUrl || null,
          source: data.source || 'Manual',
          metadata: data.metadata || {},
          updatedAt: new Date(),
        })
        .returning();

      return result[0];
    } catch (error: any) {
      console.error('[Trademark] Lifecycle event error:', error);
      throw error;
    }
  }

  /**
   * Search trademarks
   */
  async searchTrademarks(filters: {
    tmNumber?: string;
    brandName?: string;
    owner?: string;
    status?: string;
    classes?: number[];
    office?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      let query = db.select().from(trademarkMaster);
      const conditions = [];

      if (filters.tmNumber) {
        conditions.push(eq(trademarkMaster.tmNumber, filters.tmNumber));
      }
      if (filters.brandName) {
        conditions.push(sql`${trademarkMaster.brandName} ILIKE ${'%' + filters.brandName + '%'}`);
      }
      if (filters.owner) {
        conditions.push(sql`${trademarkMaster.owner} ILIKE ${'%' + filters.owner + '%'}`);
      }
      if (filters.status) {
        conditions.push(eq(trademarkMaster.status, filters.status));
      }
      if (filters.office) {
        conditions.push(eq(trademarkMaster.office, filters.office));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const results = await query
        .limit(filters.limit || 50)
        .offset(filters.offset || 0)
        .orderBy(desc(trademarkMaster.applicationDate));

      return results;
    } catch (error: any) {
      console.error('[Trademark] Search error:', error);
      throw error;
    }
  }

  /**
   * Get trademark with lifecycle events
   */
  async getTrademarkWithLifecycle(tmNumber: string): Promise<any> {
    try {
      const trademark = await db.select()
        .from(trademarkMaster)
        .where(eq(trademarkMaster.tmNumber, tmNumber))
        .limit(1);

      if (trademark.length === 0) {
        return null;
      }

      const events = await db.select()
        .from(trademarkLifecycle)
        .where(eq(trademarkLifecycle.tmNumber, tmNumber))
        .orderBy(desc(trademarkLifecycle.eventDate));

      return {
        ...trademark[0],
        lifecycle: events,
      };
    } catch (error: any) {
      console.error('[Trademark] Get trademark error:', error);
      throw error;
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<any> {
    try {
      const total = await db.select({ count: sql<number>`count(*)::int` })
        .from(trademarkMaster);

      const byStatus = await db.select({
        status: trademarkMaster.status,
        count: sql<number>`count(*)::int`,
      })
        .from(trademarkMaster)
        .groupBy(trademarkMaster.status);

      const byOffice = await db.select({
        office: trademarkMaster.office,
        count: sql<number>`count(*)::int`,
      })
        .from(trademarkMaster)
        .groupBy(trademarkMaster.office);

      return {
        total: total[0]?.count || 0,
        byStatus,
        byOffice,
      };
    } catch (error: any) {
      console.error('[Trademark] Stats error:', error);
      throw error;
    }
  }

  /**
   * Log audit trail
   */
  private async logAudit(data: {
    tmNumber: string;
    action: string;
    userId?: string;
    oldValues?: any;
    newValues?: any;
    source?: string;
  }): Promise<void> {
    try {
      // This will be implemented when the dataset audit trail is ready
      // For now, just log to console
      console.log('[Trademark] Audit:', data.action, data.tmNumber);
    } catch (error) {
      console.error('[Trademark] Audit log error:', error);
    }
  }
}

// Export singleton instance
export const trademarkService = new TrademarkService();
