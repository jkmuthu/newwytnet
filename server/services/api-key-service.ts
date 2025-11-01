import { db } from '../db';
import { apiKeys, apiPricingTiers, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export class ApiKeyService {
  
  generateApiKey(): { key: string; prefix: string } {
    const randomBytes = crypto.randomBytes(24);
    const key = `wyt_${randomBytes.toString('hex')}`;
    const prefix = key.substring(0, 10);
    
    return { key, prefix };
  }

  async hashKey(key: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(key, salt);
  }

  async verifyKey(key: string, hash: string): Promise<boolean> {
    return bcrypt.compare(key, hash);
  }

  async createKey(params: {
    userId: string;
    name: string;
    tier?: 'free' | 'starter' | 'pro' | 'enterprise';
    expiresInDays?: number;
  }) {
    const { userId, name, tier = 'free', expiresInDays } = params;

    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    const tierData = await db.select()
      .from(apiPricingTiers)
      .where(eq(apiPricingTiers.tier, tier))
      .limit(1);

    if (tierData.length === 0) {
      throw new Error('Invalid tier');
    }

    const existingKeys = await db.select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.userId, userId),
        eq(apiKeys.status, 'active')
      ));

    if (existingKeys.length >= tierData[0].maxApiKeys) {
      throw new Error(`Maximum API keys (${tierData[0].maxApiKeys}) reached for ${tier} tier`);
    }

    const { key, prefix } = this.generateApiKey();
    const keyHash = await this.hashKey(key);

    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const [newKey] = await db.insert(apiKeys).values({
      userId,
      keyPrefix: prefix,
      keyHash,
      name,
      tier,
      status: 'active',
      expiresAt,
    }).returning();

    return {
      id: newKey.id,
      key,
      prefix,
      name: newKey.name,
      tier: newKey.tier,
      createdAt: newKey.createdAt,
      expiresAt: newKey.expiresAt,
    };
  }

  async validateKey(key: string): Promise<{
    valid: boolean;
    keyData?: any;
    reason?: string;
  }> {
    if (!key || !key.startsWith('wyt_')) {
      return { valid: false, reason: 'Invalid API key format' };
    }

    const prefix = key.substring(0, 10);

    const keys = await db.select({
      id: apiKeys.id,
      userId: apiKeys.userId,
      keyHash: apiKeys.keyHash,
      tier: apiKeys.tier,
      status: apiKeys.status,
      expiresAt: apiKeys.expiresAt,
      name: apiKeys.name,
    })
      .from(apiKeys)
      .where(eq(apiKeys.keyPrefix, prefix));

    if (keys.length === 0) {
      return { valid: false, reason: 'API key not found' };
    }

    for (const keyRecord of keys) {
      const isMatch = await this.verifyKey(key, keyRecord.keyHash);
      
      if (isMatch) {
        if (keyRecord.status !== 'active') {
          return { valid: false, reason: `API key is ${keyRecord.status}` };
        }

        if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
          await db.update(apiKeys)
            .set({ status: 'expired' })
            .where(eq(apiKeys.id, keyRecord.id));
          
          return { valid: false, reason: 'API key expired' };
        }

        await db.update(apiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(apiKeys.id, keyRecord.id));

        return {
          valid: true,
          keyData: {
            id: keyRecord.id,
            userId: keyRecord.userId,
            tier: keyRecord.tier,
            name: keyRecord.name,
          },
        };
      }
    }

    return { valid: false, reason: 'Invalid API key' };
  }

  async revokeKey(keyId: string, userId: string) {
    const [updated] = await db.update(apiKeys)
      .set({ status: 'revoked', updatedAt: new Date() })
      .where(and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.userId, userId)
      ))
      .returning();

    if (!updated) {
      throw new Error('API key not found or unauthorized');
    }

    return { success: true, message: 'API key revoked successfully' };
  }

  async regenerateKey(keyId: string, userId: string) {
    const existing = await db.select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.userId, userId)
      ))
      .limit(1);

    if (existing.length === 0) {
      throw new Error('API key not found or unauthorized');
    }

    const { key, prefix } = this.generateApiKey();
    const keyHash = await this.hashKey(key);

    const [updated] = await db.update(apiKeys)
      .set({
        keyPrefix: prefix,
        keyHash,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, keyId))
      .returning();

    return {
      id: updated.id,
      key,
      prefix,
      name: updated.name,
      tier: updated.tier,
      updatedAt: updated.updatedAt,
    };
  }

  async listUserKeys(userId: string) {
    const keys = await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      tier: apiKeys.tier,
      status: apiKeys.status,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));

    return keys;
  }

  async getUserTier(userId: string): Promise<'free' | 'starter' | 'pro' | 'enterprise'> {
    const keys = await db.select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.userId, userId),
        eq(apiKeys.status, 'active')
      ))
      .orderBy(desc(apiKeys.createdAt))
      .limit(1);

    return keys.length > 0 ? keys[0].tier : 'free';
  }

  async updateKeyTier(keyId: string, userId: string, newTier: 'free' | 'starter' | 'pro' | 'enterprise') {
    const [updated] = await db.update(apiKeys)
      .set({ tier: newTier, updatedAt: new Date() })
      .where(and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.userId, userId)
      ))
      .returning();

    if (!updated) {
      throw new Error('API key not found or unauthorized');
    }

    return updated;
  }
}

export const apiKeyService = new ApiKeyService();
