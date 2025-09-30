import { db } from '../db';
import { 
  pointsWallets, 
  pointsTransactions,
  type PointsWallet,
  type PointsTransaction 
} from '../../shared/schema';
import { eq, desc, sql } from 'drizzle-orm';

export class PointsService {
  /**
   * Create a wallet for a new user with initial balance
   */
  async createWallet(userId: string, initialBalance: number = 0): Promise<PointsWallet> {
    // Check if wallet already exists
    const existing = await db.select()
      .from(pointsWallets)
      .where(eq(pointsWallets.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new wallet
    const [wallet] = await db.insert(pointsWallets).values({
      userId,
      balance: initialBalance,
      lifetimeEarned: initialBalance > 0 ? initialBalance : 0,
      lifetimeSpent: 0,
    }).returning();

    // Create initial transaction if there's a starting balance
    if (initialBalance > 0) {
      await this.logTransaction({
        userId,
        amount: initialBalance,
        balanceAfter: initialBalance,
        type: 'initial_balance',
        description: 'Initial wallet balance',
        metadata: {},
      });
    }

    console.log(`[PointsService] Created wallet for user ${userId} with balance ${initialBalance}`);
    return wallet;
  }

  /**
   * Get wallet for a user (create if doesn't exist)
   */
  async getOrCreateWallet(userId: string): Promise<PointsWallet> {
    const existing = await db.select()
      .from(pointsWallets)
      .where(eq(pointsWallets.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    return this.createWallet(userId, 0);
  }

  /**
   * Get current balance for a user
   */
  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.balance;
  }

  /**
   * Credit points to user's wallet (ATOMIC)
   */
  async creditPoints(params: {
    userId: string;
    amount: number;
    type: string;
    description?: string;
    metadata?: Record<string, any>;
    createdBy?: string;
  }): Promise<PointsWallet> {
    const { userId, amount, type, description, metadata = {}, createdBy } = params;

    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }

    // Get or create wallet first (outside transaction)
    await this.getOrCreateWallet(userId);

    // Execute update and log in a single atomic transaction
    const result = await db.transaction(async (tx) => {
      // Lock and update wallet
      const [updatedWallet] = await tx
        .update(pointsWallets)
        .set({
          balance: sql`${pointsWallets.balance} + ${amount}`,
          lifetimeEarned: sql`${pointsWallets.lifetimeEarned} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(pointsWallets.userId, userId))
        .returning();

      if (!updatedWallet) {
        throw new Error('Failed to update wallet');
      }

      // Log transaction with actual balance
      await tx.insert(pointsTransactions).values({
        userId,
        amount,
        balanceAfter: updatedWallet.balance,
        type,
        description: description || null,
        metadata: metadata || {},
        createdBy: createdBy || null,
      });

      return updatedWallet;
    });

    console.log(`[PointsService] Credited ${amount} points to user ${userId}. New balance: ${result.balance}`);
    return result;
  }

  /**
   * Debit points from user's wallet (ATOMIC)
   */
  async debitPoints(params: {
    userId: string;
    amount: number;
    type: string;
    description?: string;
    metadata?: Record<string, any>;
    createdBy?: string;
  }): Promise<PointsWallet> {
    const { userId, amount, type, description, metadata = {}, createdBy } = params;

    if (amount <= 0) {
      throw new Error('Debit amount must be positive');
    }

    // Get wallet first (outside transaction)
    const wallet = await this.getOrCreateWallet(userId);

    // Check sufficient balance before transaction
    if (wallet.balance < amount) {
      throw new Error(`Insufficient points balance. Available: ${wallet.balance}, Required: ${amount}`);
    }

    // Execute update and log in a single atomic transaction
    const result = await db.transaction(async (tx) => {
      // Lock and update wallet
      const [updatedWallet] = await tx
        .update(pointsWallets)
        .set({
          balance: sql`${pointsWallets.balance} - ${amount}`,
          lifetimeSpent: sql`${pointsWallets.lifetimeSpent} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(pointsWallets.userId, userId))
        .returning();

      if (!updatedWallet) {
        throw new Error('Failed to update wallet');
      }

      // Double-check balance didn't go negative (race condition check)
      if (updatedWallet.balance < 0) {
        throw new Error('Insufficient funds - balance would be negative');
      }

      // Log transaction with actual balance (negative amount for debit)
      await tx.insert(pointsTransactions).values({
        userId,
        amount: -amount,
        balanceAfter: updatedWallet.balance,
        type,
        description: description || null,
        metadata: metadata || {},
        createdBy: createdBy || null,
      });

      return updatedWallet;
    });

    console.log(`[PointsService] Debited ${amount} points from user ${userId}. New balance: ${result.balance}`);
    return result;
  }

  /**
   * Get transaction history for a user
   */
  async getTransactions(userId: string, limit: number = 50): Promise<PointsTransaction[]> {
    const transactions = await db.select()
      .from(pointsTransactions)
      .where(eq(pointsTransactions.userId, userId))
      .orderBy(desc(pointsTransactions.createdAt))
      .limit(limit);

    return transactions;
  }

  /**
   * Get wallet details with transaction history
   */
  async getWalletDetails(userId: string, transactionLimit: number = 20): Promise<{
    wallet: PointsWallet;
    recentTransactions: PointsTransaction[];
  }> {
    const [wallet, recentTransactions] = await Promise.all([
      this.getOrCreateWallet(userId),
      this.getTransactions(userId, transactionLimit),
    ]);

    return {
      wallet,
      recentTransactions,
    };
  }

  /**
   * Admin: Manually adjust user's balance
   */
  async adminAdjustBalance(params: {
    userId: string;
    amount: number;
    reason: string;
    adminUserId: string;
  }): Promise<PointsWallet> {
    const { userId, amount, reason, adminUserId } = params;

    if (amount === 0) {
      throw new Error('Adjustment amount cannot be zero');
    }

    if (amount > 0) {
      return this.creditPoints({
        userId,
        amount,
        type: 'admin_adjustment',
        description: `Admin adjustment: ${reason}`,
        metadata: { adjustedBy: adminUserId, reason },
        createdBy: adminUserId,
      });
    } else {
      return this.debitPoints({
        userId,
        amount: Math.abs(amount),
        type: 'admin_adjustment',
        description: `Admin adjustment: ${reason}`,
        metadata: { adjustedBy: adminUserId, reason },
        createdBy: adminUserId,
      });
    }
  }

  /**
   * Internal: Log a transaction
   */
  private async logTransaction(params: {
    userId: string;
    amount: number;
    balanceAfter: number;
    type: string;
    description?: string;
    metadata?: Record<string, any>;
    createdBy?: string;
  }): Promise<PointsTransaction> {
    const [transaction] = await db.insert(pointsTransactions).values({
      userId: params.userId,
      amount: params.amount,
      balanceAfter: params.balanceAfter,
      type: params.type,
      description: params.description || null,
      metadata: params.metadata || {},
      createdBy: params.createdBy || null,
    }).returning();

    return transaction;
  }

  /**
   * Get points statistics for admin dashboard
   */
  async getStatistics(): Promise<{
    totalWallets: number;
    totalPointsInCirculation: number;
    totalPointsEarned: number;
    totalPointsSpent: number;
  }> {
    const wallets = await db.select().from(pointsWallets);

    const stats = wallets.reduce(
      (acc, wallet) => ({
        totalWallets: acc.totalWallets + 1,
        totalPointsInCirculation: acc.totalPointsInCirculation + wallet.balance,
        totalPointsEarned: acc.totalPointsEarned + wallet.lifetimeEarned,
        totalPointsSpent: acc.totalPointsSpent + wallet.lifetimeSpent,
      }),
      {
        totalWallets: 0,
        totalPointsInCirculation: 0,
        totalPointsEarned: 0,
        totalPointsSpent: 0,
      }
    );

    return stats;
  }
}

// Export singleton instance
export const pointsService = new PointsService();
