import { db } from '../db';
import { 
  offers, 
  needs,
  type Offer,
  type InsertOffer 
} from '../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { needsService } from './needsService';
import { pointsService } from './pointsService';

export class OffersService {
  /**
   * Create a new offer on a need
   */
  async createOffer(data: InsertOffer, userId: string): Promise<Offer> {
    // Verify user can make offer
    const canOffer = await needsService.canMakeOffer(data.needId, userId);
    
    if (!canOffer.canOffer) {
      throw new Error(canOffer.reason || 'Cannot make offer on this need');
    }

    // Check and deduct points if needed
    let pointsSpent = 0;
    if (canOffer.pointsCost && canOffer.pointsCost > 0) {
      const balance = await pointsService.getBalance(userId);
      if (balance < canOffer.pointsCost) {
        throw new Error(`Insufficient points. Required: ${canOffer.pointsCost}, Available: ${balance}`);
      }

      // Deduct points
      await pointsService.debitPoints({
        userId,
        amount: canOffer.pointsCost,
        type: 'offer_creation',
        description: `Points spent to make offer on need`,
        metadata: { needId: data.needId },
      });

      pointsSpent = canOffer.pointsCost;
    }

    // Create the offer
    const [offer] = await db.insert(offers).values({
      ...data,
      userId,
      status: 'pending',
      pointsSpent,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log(`[OffersService] Created offer ${offer.id} on need ${offer.needId} by user ${userId}`);
    return offer;
  }

  /**
   * Get a single offer by ID
   */
  async getOfferById(offerId: string): Promise<Offer | null> {
    const result = await db.select()
      .from(offers)
      .where(eq(offers.id, offerId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get offers for a specific need
   */
  async getOffersByNeed(needId: string, params: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Offer[]> {
    const { status, limit = 20, offset = 0 } = params;

    const conditions = [eq(offers.needId, needId)];

    if (status) {
      conditions.push(eq(offers.status, status));
    }

    return await db.select()
      .from(offers)
      .where(and(...conditions))
      .orderBy(desc(offers.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get offers made by a user
   */
  async getUserOffers(userId: string, params: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Offer[]> {
    const { status, limit = 20, offset = 0 } = params;

    const conditions = [eq(offers.userId, userId)];

    if (status) {
      conditions.push(eq(offers.status, status));
    }

    return await db.select()
      .from(offers)
      .where(and(...conditions))
      .orderBy(desc(offers.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get offers received on user's needs
   */
  async getReceivedOffers(userId: string, params: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Array<Offer & { need: any }>> {
    const { status, limit = 20, offset = 0 } = params;

    const conditions = [eq(needs.userId, userId)];

    if (status) {
      conditions.push(eq(offers.status, status));
    }

    const result = await db.select({
      offer: offers,
      need: needs,
    })
      .from(offers)
      .innerJoin(needs, eq(offers.needId, needs.id))
      .where(and(...conditions))
      .orderBy(desc(offers.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({ ...row.offer, need: row.need }));
  }

  /**
   * Update offer status (need owner only for accept/reject)
   */
  async updateOfferStatus(
    offerId: string, 
    status: 'pending' | 'accepted' | 'rejected',
    needOwnerId: string
  ): Promise<Offer> {
    const offer = await this.getOfferById(offerId);
    if (!offer) {
      throw new Error('Offer not found');
    }

    // Verify the user owns the need
    const need = await needsService.getNeedById(offer.needId);
    if (!need || need.userId !== needOwnerId) {
      throw new Error('Not authorized to update this offer');
    }

    const [updated] = await db.update(offers)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(offers.id, offerId))
      .returning();

    console.log(`[OffersService] Updated offer ${offerId} status to ${status}`);
    return updated;
  }

  /**
   * Delete an offer (offer owner only, only if pending)
   */
  async deleteOffer(offerId: string, userId: string): Promise<void> {
    const offer = await this.getOfferById(offerId);
    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.userId !== userId) {
      throw new Error('Not authorized to delete this offer');
    }

    if (offer.status !== 'pending') {
      throw new Error('Can only delete pending offers');
    }

    // Refund points if any were spent
    const pointsToRefund = offer.pointsSpent || 0;
    if (pointsToRefund > 0) {
      await pointsService.creditPoints({
        userId,
        amount: pointsToRefund,
        type: 'offer_deletion_refund',
        description: 'Points refunded from deleted offer',
        metadata: { offerId: offer.id, needId: offer.needId },
      });
    }

    await db.delete(offers)
      .where(eq(offers.id, offerId));

    console.log(`[OffersService] Deleted offer ${offerId} and refunded ${pointsToRefund} points`);
  }

  /**
   * Get offer counts for a need
   */
  async getOfferCount(needId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(offers)
      .where(eq(offers.needId, needId));

    return result[0]?.count || 0;
  }

  /**
   * Check if user has already made an offer on a need
   */
  async hasUserOffered(needId: string, userId: string): Promise<boolean> {
    const result = await db.select()
      .from(offers)
      .where(and(
        eq(offers.needId, needId),
        eq(offers.userId, userId)
      ))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Get offer statistics for a user
   */
  async getUserOfferStats(userId: string): Promise<{
    totalOffers: number;
    pendingOffers: number;
    acceptedOffers: number;
    rejectedOffers: number;
  }> {
    const result = await db
      .select({
        status: offers.status,
        count: sql<number>`count(*)::int`,
      })
      .from(offers)
      .where(eq(offers.userId, userId))
      .groupBy(offers.status);

    const stats = {
      totalOffers: 0,
      pendingOffers: 0,
      acceptedOffers: 0,
      rejectedOffers: 0,
    };

    result.forEach(row => {
      stats.totalOffers += row.count;
      if (row.status === 'pending') stats.pendingOffers = row.count;
      if (row.status === 'accepted') stats.acceptedOffers = row.count;
      if (row.status === 'rejected') stats.rejectedOffers = row.count;
    });

    return stats;
  }
}

export const offersService = new OffersService();
