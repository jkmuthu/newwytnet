import { db } from '../db';
import { 
  wytstarContributions,
  wytstarLevels,
  type WytstarContribution,
  type WytstarLevel,
  type InsertWytstarContribution 
} from '../../shared/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { pointsService } from './pointsService';

// WytStar level thresholds
const LEVEL_THRESHOLDS = {
  bronze: 0,
  silver: 100,
  gold: 500,
  platinum: 2000,
  diamond: 10000,
};

// Points awarded per contribution type
const CONTRIBUTION_POINTS = {
  post_need: 5,
  make_offer: 3,
  verify_need: 10,
  verify_offer: 10,
  add_listing: 8,
  add_details: 2,
  upload_image: 1,
};

export class WytStarService {
  /**
   * Record a contribution and award points
   */
  async recordContribution(params: {
    userId: string;
    tenantId?: string;
    type: keyof typeof CONTRIBUTION_POINTS;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, any>;
  }): Promise<WytstarContribution> {
    const { userId, tenantId, type, entityType, entityId, metadata = {} } = params;

    const pointsEarned = CONTRIBUTION_POINTS[type] || 0;

    // Create contribution record
    const [contribution] = await db.insert(wytstarContributions).values({
      userId,
      tenantId: tenantId || null,
      type,
      entityType: entityType || null,
      entityId: entityId || null,
      pointsEarned,
      isVerified: false,
      metadata,
      createdAt: new Date(),
    }).returning();

    // Award points to user's WytPoints wallet
    if (pointsEarned > 0) {
      await pointsService.creditPoints({
        userId,
        amount: pointsEarned,
        type: 'wytstar_contribution',
        description: `WytStar points for ${type.replace('_', ' ')}`,
        metadata: { contributionId: contribution.id, contributionType: type },
      });
    }

    // Update user's WytStar level
    await this.updateUserLevel(userId);

    console.log(`[WytStarService] Recorded ${type} contribution for user ${userId}, awarded ${pointsEarned} points`);
    return contribution;
  }

  /**
   * Verify a contribution (admin/moderator only)
   */
  async verifyContribution(contributionId: string, verifiedBy: string): Promise<WytstarContribution> {
    const contribution = await db.select()
      .from(wytstarContributions)
      .where(eq(wytstarContributions.id, contributionId))
      .limit(1);

    if (!contribution[0]) {
      throw new Error('Contribution not found');
    }

    if (contribution[0].isVerified) {
      throw new Error('Contribution already verified');
    }

    // Award bonus points for verification (2x original points)
    const bonusPoints = contribution[0].pointsEarned;
    if (bonusPoints > 0) {
      await pointsService.creditPoints({
        userId: contribution[0].userId,
        amount: bonusPoints,
        type: 'contribution_verification_bonus',
        description: 'Bonus points for verified contribution',
        metadata: { contributionId },
      });
    }

    const [verified] = await db.update(wytstarContributions)
      .set({
        isVerified: true,
        verifiedBy,
        verifiedAt: new Date(),
      })
      .where(eq(wytstarContributions.id, contributionId))
      .returning();

    // Update user's level after verification
    await this.updateUserLevel(contribution[0].userId);

    console.log(`[WytStarService] Verified contribution ${contributionId}, awarded ${bonusPoints} bonus points`);
    return verified;
  }

  /**
   * Get or create user's WytStar level
   */
  async getOrCreateUserLevel(userId: string): Promise<WytstarLevel> {
    const existing = await db.select()
      .from(wytstarLevels)
      .where(eq(wytstarLevels.userId, userId))
      .limit(1);

    if (existing[0]) {
      return existing[0];
    }

    const [level] = await db.insert(wytstarLevels).values({
      userId,
      level: 'bronze',
      totalPoints: 0,
      monthlyPoints: 0,
      streakDays: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return level;
  }

  /**
   * Update user's WytStar level based on total points
   */
  async updateUserLevel(userId: string): Promise<WytstarLevel> {
    // Calculate total points from contributions
    const pointsResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${wytstarContributions.pointsEarned}), 0)::int` })
      .from(wytstarContributions)
      .where(eq(wytstarContributions.userId, userId));

    const totalPoints = pointsResult[0]?.total || 0;

    // Calculate monthly points (last 30 days)
    const monthlyResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${wytstarContributions.pointsEarned}), 0)::int` })
      .from(wytstarContributions)
      .where(
        and(
          eq(wytstarContributions.userId, userId),
          sql`${wytstarContributions.createdAt} >= NOW() - INTERVAL '30 days'`
        )
      );

    const monthlyPoints = monthlyResult[0]?.total || 0;

    // Determine level based on total points
    let newLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' = 'bronze';
    if (totalPoints >= LEVEL_THRESHOLDS.diamond) newLevel = 'diamond';
    else if (totalPoints >= LEVEL_THRESHOLDS.platinum) newLevel = 'platinum';
    else if (totalPoints >= LEVEL_THRESHOLDS.gold) newLevel = 'gold';
    else if (totalPoints >= LEVEL_THRESHOLDS.silver) newLevel = 'silver';

    // Update or create level record
    const existing = await db.select()
      .from(wytstarLevels)
      .where(eq(wytstarLevels.userId, userId))
      .limit(1);

    if (existing[0]) {
      const [updated] = await db.update(wytstarLevels)
        .set({
          level: newLevel,
          totalPoints,
          monthlyPoints,
          lastContributionAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(wytstarLevels.userId, userId))
        .returning();

      return updated;
    } else {
      const [created] = await db.insert(wytstarLevels).values({
        userId,
        level: newLevel,
        totalPoints,
        monthlyPoints,
        lastContributionAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return created;
    }
  }

  /**
   * Get user's contributions
   */
  async getUserContributions(userId: string, params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<WytstarContribution[]> {
    const { limit = 20, offset = 0 } = params;

    return await db.select()
      .from(wytstarContributions)
      .where(eq(wytstarContributions.userId, userId))
      .orderBy(desc(wytstarContributions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get leaderboard (top users by total points)
   */
  async getLeaderboard(params: {
    period?: 'all' | 'monthly';
    limit?: number;
    offset?: number;
  } = {}): Promise<WytstarLevel[]> {
    const { period = 'all', limit = 100, offset = 0 } = params;

    const orderBy = period === 'monthly' 
      ? desc(wytstarLevels.monthlyPoints)
      : desc(wytstarLevels.totalPoints);

    return await db.select()
      .from(wytstarLevels)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Update monthly rankings
   * This should be run periodically (e.g., daily cron job)
   */
  async updateRankings(): Promise<void> {
    // Update global ranks
    const allUsers = await db.select()
      .from(wytstarLevels)
      .orderBy(desc(wytstarLevels.totalPoints));

    for (let i = 0; i < allUsers.length; i++) {
      await db.update(wytstarLevels)
        .set({ rank: i + 1 })
        .where(eq(wytstarLevels.userId, allUsers[i].userId));
    }

    // Update monthly ranks
    const monthlyUsers = await db.select()
      .from(wytstarLevels)
      .orderBy(desc(wytstarLevels.monthlyPoints));

    for (let i = 0; i < monthlyUsers.length; i++) {
      await db.update(wytstarLevels)
        .set({ monthlyRank: i + 1 })
        .where(eq(wytstarLevels.userId, monthlyUsers[i].userId));
    }

    console.log('[WytStarService] Updated rankings for all users');
  }

  /**
   * Get contribution stats by type
   */
  async getContributionStats(userId: string): Promise<Record<string, number>> {
    const result = await db
      .select({
        type: wytstarContributions.type,
        count: sql<number>`count(*)::int`,
      })
      .from(wytstarContributions)
      .where(eq(wytstarContributions.userId, userId))
      .groupBy(wytstarContributions.type);

    const stats: Record<string, number> = {};
    result.forEach(row => {
      stats[row.type] = row.count;
    });

    return stats;
  }

  /**
   * Reset monthly points (run at start of each month)
   */
  async resetMonthlyPoints(): Promise<void> {
    await db.update(wytstarLevels)
      .set({ monthlyPoints: 0 });

    console.log('[WytStarService] Reset monthly points for all users');
  }
}

export const wytstarService = new WytStarService();
