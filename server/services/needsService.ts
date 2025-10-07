import { db } from '../db';
import { 
  needs, 
  type Need,
  type InsertNeed 
} from '../../shared/schema';
import { eq, desc, and, or, sql, inArray } from 'drizzle-orm';

export class NeedsService {
  /**
   * Create a new need
   */
  async createNeed(data: InsertNeed): Promise<Need> {
    const [need] = await db.insert(needs).values({
      ...data,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log(`[NeedsService] Created need ${need.id} by user ${need.userId}`);
    return need;
  }

  /**
   * Get a single need by ID
   */
  async getNeedById(needId: string): Promise<Need | null> {
    const result = await db.select()
      .from(needs)
      .where(eq(needs.id, needId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * List public needs (for unauthenticated users)
   * Only shows public needs that are active
   */
  async listPublicNeeds(params: {
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Need[]> {
    const { category, limit = 20, offset = 0 } = params;

    let query = db.select()
      .from(needs)
      .where(
        and(
          eq(needs.isPublic, true),
          eq(needs.status, 'active')
        )
      )
      .orderBy(desc(needs.createdAt))
      .limit(limit)
      .offset(offset);

    if (category && category !== 'all') {
      query = db.select()
        .from(needs)
        .where(
          and(
            eq(needs.isPublic, true),
            eq(needs.status, 'active'),
            eq(needs.category, category as any)
          )
        )
        .orderBy(desc(needs.createdAt))
        .limit(limit)
        .offset(offset);
    }

    return await query;
  }

  /**
   * List authenticated user needs (shows both public and circle needs)
   */
  async listAuthenticatedNeeds(params: {
    userId: string;
    category?: string;
    circles?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Need[]> {
    const { userId, category, circles = [], limit = 20, offset = 0 } = params;

    const conditions = [
      eq(needs.status, 'active')
    ];

    // Show public needs OR needs in user's circles
    if (circles.length > 0) {
      conditions.push(
        or(
          eq(needs.isPublic, true),
          sql`${needs.circles} && ARRAY[${circles.join(',')}]::text[]`
        )!
      );
    } else {
      conditions.push(eq(needs.isPublic, true));
    }

    // Add category filter if specified
    if (category && category !== 'all') {
      conditions.push(eq(needs.category, category as any));
    }

    const result = await db.select()
      .from(needs)
      .where(and(...conditions))
      .orderBy(desc(needs.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  }

  /**
   * Get user's own needs
   */
  async getUserNeeds(userId: string, params: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Need[]> {
    const { status, limit = 20, offset = 0 } = params;

    const conditions = [eq(needs.userId, userId)];

    if (status) {
      conditions.push(eq(needs.status, status as any));
    }

    return await db.select()
      .from(needs)
      .where(and(...conditions))
      .orderBy(desc(needs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Update a need (owner only)
   */
  async updateNeed(needId: string, userId: string, data: Partial<InsertNeed>): Promise<Need> {
    // Verify ownership
    const existing = await this.getNeedById(needId);
    if (!existing) {
      throw new Error('Need not found');
    }
    if (existing.userId !== userId) {
      throw new Error('Not authorized to update this need');
    }

    const [updated] = await db.update(needs)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(needs.id, needId))
      .returning();

    console.log(`[NeedsService] Updated need ${needId}`);
    return updated;
  }

  /**
   * Delete a need (owner only)
   */
  async deleteNeed(needId: string, userId: string): Promise<void> {
    // Verify ownership
    const existing = await this.getNeedById(needId);
    if (!existing) {
      throw new Error('Need not found');
    }
    if (existing.userId !== userId) {
      throw new Error('Not authorized to delete this need');
    }

    await db.delete(needs)
      .where(eq(needs.id, needId));

    console.log(`[NeedsService] Deleted need ${needId}`);
  }

  /**
   * Close a need (mark as fulfilled or closed)
   */
  async closeNeed(needId: string, userId: string, status: 'closed' | 'fulfilled'): Promise<Need> {
    return await this.updateNeed(needId, userId, { status });
  }

  /**
   * Check if a user can make an offer on a need
   */
  async canMakeOffer(needId: string, userId: string): Promise<{
    canOffer: boolean;
    reason?: string;
    pointsCost?: number;
  }> {
    const need = await this.getNeedById(needId);
    
    if (!need) {
      return { canOffer: false, reason: 'Need not found' };
    }

    if (need.userId === userId) {
      return { canOffer: false, reason: 'Cannot make offer on your own need' };
    }

    if (need.status !== 'active') {
      return { canOffer: false, reason: 'Need is not active' };
    }

    if (need.expiresAt && new Date(need.expiresAt) < new Date()) {
      return { canOffer: false, reason: 'Need has expired' };
    }

    return { 
      canOffer: true, 
      pointsCost: need.pointsCost || 0 
    };
  }

  /**
   * Get needs count by category
   */
  async getNeedsCounts(params: {
    isPublic?: boolean;
    userId?: string;
    circles?: string[];
  } = {}): Promise<Record<string, number>> {
    const { isPublic = true, userId, circles = [] } = params;

    const conditions = [eq(needs.status, 'active')];

    if (isPublic) {
      conditions.push(eq(needs.isPublic, true));
    } else if (userId && circles.length > 0) {
      conditions.push(
        or(
          eq(needs.isPublic, true),
          sql`${needs.circles} && ARRAY[${circles.join(',')}]::text[]`
        )!
      );
    }

    const result = await db
      .select({
        category: needs.category,
        count: sql<number>`count(*)::int`,
      })
      .from(needs)
      .where(and(...conditions))
      .groupBy(needs.category);

    const counts: Record<string, number> = {
      all: 0,
    };

    result.forEach(row => {
      counts[row.category] = row.count;
      counts.all += row.count;
    });

    return counts;
  }

  /**
   * Search needs by keyword
   */
  async searchNeeds(params: {
    query: string;
    isPublic?: boolean;
    userId?: string;
    circles?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Need[]> {
    const { query, isPublic = true, userId, circles = [], limit = 20, offset = 0 } = params;

    const conditions = [
      eq(needs.status, 'active'),
      or(
        sql`${needs.title} ILIKE ${`%${query}%`}`,
        sql`${needs.description} ILIKE ${`%${query}%`}`
      )!
    ];

    if (isPublic) {
      conditions.push(eq(needs.isPublic, true));
    } else if (userId && circles.length > 0) {
      conditions.push(
        or(
          eq(needs.isPublic, true),
          sql`${needs.circles} && ARRAY[${circles.join(',')}]::text[]`
        )!
      );
    }

    return await db.select()
      .from(needs)
      .where(and(...conditions))
      .orderBy(desc(needs.createdAt))
      .limit(limit)
      .offset(offset);
  }
}

export const needsService = new NeedsService();
