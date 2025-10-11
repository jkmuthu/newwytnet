import { db } from '../db';
import { 
  offers, 
  pointsConfig,
  type Offer,
  type InsertOffer 
} from '../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { pointsService } from './pointsService';

export class OffersService {
  /**
   * Create a standalone offer (user posts what they can offer)
   * Deducts WytPoints from user
   */
  async createOffer(data: Omit<InsertOffer, 'id' | 'createdAt' | 'updatedAt' | 'pointsSpent'>, userId: string, tenantId?: string): Promise<{ offer: Offer; pointsSpent: number }> {
    // Get points configuration for posting offers
    const [config] = await db.select()
      .from(pointsConfig)
      .where(and(
        eq(pointsConfig.action, 'post_offer'),
        eq(pointsConfig.isActive, true)
      ));

    const pointsCost = config?.points || 0;

    // Check if user has enough points
    if (pointsCost > 0) {
      const balance = await pointsService.getBalance(userId);
      if (balance < pointsCost) {
        throw new Error(`Insufficient points. Required: ${pointsCost}, Available: ${balance}`);
      }

      // Deduct points
      await pointsService.debitPoints({
        userId,
        amount: pointsCost,
        type: 'post_offer',
        description: `Posted offer: ${data.title}`,
        metadata: { offerTitle: data.title },
      });
    }

    // Create the offer
    const [offer] = await db.insert(offers).values({
      ...data,
      userId,
      tenantId: tenantId || null,
      pointsSpent: pointsCost,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log(`[OffersService] Created standalone offer ${offer.id} by user ${userId}, points spent: ${pointsCost}`);
    return { offer, pointsSpent: pointsCost };
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
   * Get all public offers
   */
  async getPublicOffers(params: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Offer[]> {
    const { category, status, limit = 20, offset = 0 } = params;

    const conditions = [eq(offers.isPublic, true)];

    if (category) {
      conditions.push(sql`${offers.category} = ${category}`);
    }

    if (status) {
      conditions.push(sql`${offers.status} = ${status}`);
    }

    return await db.select()
      .from(offers)
      .where(and(...conditions))
      .orderBy(desc(offers.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get offers posted by a user
   */
  async getUserOffers(userId: string, params: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Offer[]> {
    const { status, limit = 20, offset = 0 } = params;

    const conditions = [eq(offers.userId, userId)];

    if (status) {
      conditions.push(sql`${offers.status} = ${status}`);
    }

    return await db.select()
      .from(offers)
      .where(and(...conditions))
      .orderBy(desc(offers.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Update an offer (owner only)
   */
  async updateOffer(
    offerId: string, 
    userId: string,
    data: Partial<Omit<InsertOffer, 'id' | 'userId' | 'tenantId' | 'createdAt' | 'updatedAt' | 'pointsSpent'>>
  ): Promise<Offer> {
    const offer = await this.getOfferById(offerId);
    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.userId !== userId) {
      throw new Error('Not authorized to update this offer');
    }

    const [updated] = await db.update(offers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(offers.id, offerId))
      .returning();

    console.log(`[OffersService] Updated offer ${offerId}`);
    return updated;
  }

  /**
   * Delete an offer (owner only)
   * Refunds points if any were spent
   */
  async deleteOffer(offerId: string, userId: string): Promise<void> {
    const offer = await this.getOfferById(offerId);
    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.userId !== userId) {
      throw new Error('Not authorized to delete this offer');
    }

    // Refund points if any were spent
    const pointsToRefund = offer.pointsSpent || 0;
    if (pointsToRefund > 0) {
      await pointsService.creditPoints({
        userId,
        amount: pointsToRefund,
        type: 'offer_deletion_refund',
        description: 'Points refunded from deleted offer',
        metadata: { offerId: offer.id },
      });
    }

    await db.delete(offers)
      .where(eq(offers.id, offerId));

    console.log(`[OffersService] Deleted offer ${offerId} and refunded ${pointsToRefund} points`);
  }

  /**
   * Get offer statistics for a user
   */
  async getUserOfferStats(userId: string): Promise<{
    totalOffers: number;
    activeOffers: number;
    closedOffers: number;
    fulfilledOffers: number;
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
      activeOffers: 0,
      closedOffers: 0,
      fulfilledOffers: 0,
    };

    result.forEach(row => {
      stats.totalOffers += row.count;
      if (row.status === 'active') stats.activeOffers = row.count;
      if (row.status === 'closed') stats.closedOffers = row.count;
      if (row.status === 'fulfilled') stats.fulfilledOffers = row.count;
    });

    return stats;
  }

  /**
   * List public offers for WytWall feed (unauthenticated)
   */
  async listPublicOffers(params: {
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    const { category, limit = 20, offset = 0 } = params;

    let query = db.select({
      offer: offers,
      user: sql`json_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email,
        'profileImageUrl', u.profile_image_url
      )`.as('user')
    })
      .from(offers)
      .leftJoin(sql`users u`, sql`u.id = ${offers.userId}`)
      .where(
        and(
          eq(offers.isPublic, true),
          eq(offers.status, 'active')
        )
      )
      .orderBy(desc(offers.createdAt))
      .limit(limit)
      .offset(offset);

    if (category && category !== 'all') {
      query = db.select({
        offer: offers,
        user: sql`json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'profileImageUrl', u.profile_image_url
        )`.as('user')
      })
        .from(offers)
        .leftJoin(sql`users u`, sql`u.id = ${offers.userId}`)
        .where(
          and(
            eq(offers.isPublic, true),
            eq(offers.status, 'active'),
            eq(offers.category, category)
          )
        )
        .orderBy(desc(offers.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const results = await query;
    return results.map((row: any) => ({ ...row.offer, user: row.user }));
  }

  /**
   * List authenticated offers for WytWall feed
   */
  async listAuthenticatedOffers(params: {
    userId: string;
    category?: string;
    circles?: string[];
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { userId, category, circles = [], limit = 20, offset = 0 } = params;

    const conditions = [eq(offers.status, 'active')];

    // For now, show public offers (circles implementation TBD)
    conditions.push(eq(offers.isPublic, true));

    if (category && category !== 'all') {
      conditions.push(eq(offers.category, category));
    }

    const results = await db.select({
      offer: offers,
      user: sql`json_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email,
        'profileImageUrl', u.profile_image_url
      )`.as('user')
    })
      .from(offers)
      .leftJoin(sql`users u`, sql`u.id = ${offers.userId}`)
      .where(and(...conditions))
      .orderBy(desc(offers.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map((row: any) => ({ ...row.offer, user: row.user }));
  }

  /**
   * Get category counts for offers
   */
  async getOffersCounts(params: {
    isPublic?: boolean;
    userId?: string;
    circles?: string[];
  } = {}): Promise<Record<string, number>> {
    const { isPublic = true, userId, circles = [] } = params;

    const conditions = [eq(offers.status, 'active')];

    if (isPublic) {
      conditions.push(eq(offers.isPublic, true));
    }

    const result = await db
      .select({
        category: offers.category,
        count: sql<number>`count(*)::int`,
      })
      .from(offers)
      .where(and(...conditions))
      .groupBy(offers.category);

    const counts: Record<string, number> = {
      all: 0,
      jobs: 0,
      real_estate: 0,
      b2b_supply: 0,
      service: 0,
      other: 0,
    };

    result.forEach(row => {
      counts.all += row.count;
      counts[row.category] = row.count;
    });

    return counts;
  }
}

export const offersService = new OffersService();
