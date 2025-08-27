// WytID service layer for business logic
import { eq, and, desc, sql, count } from "drizzle-orm";
import { db } from "../../server/db";
import {
  wytidEntities,
  wytidProofs,
  wytidTransfers,
  wytidApiKeys,
  generateWytIDIdentifier,
  type WytIDEntity,
  type WytIDProof,
  type WytIDTransfer,
  type WytIDApiKey,
  type InsertWytIDEntity,
  type InsertWytIDProof,
  type InsertWytIDTransfer,
} from "./schema";
import {
  WytIDEntityType,
  WytIDProofType,
  WytIDTransferStatus,
  type WytIDVerificationResponse,
  createEntitySchema,
  createProofSchema,
  transferEntitySchema,
} from "./types";
import { createProofAnchor, type IProofAnchor, ProofAnchorUtils } from "./anchoring";

export class WytIDService {
  private proofAnchor: IProofAnchor;

  constructor(anchorProvider: string = 'mock', anchorConfig?: any) {
    this.proofAnchor = createProofAnchor(anchorProvider, anchorConfig);
  }

  // Entity management
  async createEntity(
    data: { type: WytIDEntityType; meta: any },
    ownerUserId: string,
    tenantId: string
  ): Promise<WytIDEntity> {
    const validated = createEntitySchema.parse(data);
    
    const entityData: InsertWytIDEntity = {
      type: validated.type,
      identifier: generateWytIDIdentifier(),
      meta: validated.meta,
      ownerUserId,
      tenantId,
    };

    const [entity] = await db.insert(wytidEntities).values(entityData).returning();
    
    console.log(`🆔 Created WytID entity: ${entity.identifier}`);
    return entity;
  }

  async getEntity(id: string, tenantId: string): Promise<WytIDEntity | undefined> {
    const [entity] = await db
      .select()
      .from(wytidEntities)
      .where(and(eq(wytidEntities.id, id), eq(wytidEntities.tenantId, tenantId)));
    
    return entity;
  }

  async getEntityByIdentifier(identifier: string): Promise<WytIDEntity | undefined> {
    const [entity] = await db
      .select()
      .from(wytidEntities)
      .where(eq(wytidEntities.identifier, identifier));
    
    return entity;
  }

  async getEntitiesByOwner(ownerUserId: string, tenantId: string): Promise<WytIDEntity[]> {
    return await db
      .select()
      .from(wytidEntities)
      .where(and(eq(wytidEntities.ownerUserId, ownerUserId), eq(wytidEntities.tenantId, tenantId)))
      .orderBy(desc(wytidEntities.createdAt));
  }

  async getEntitiesByTenant(tenantId: string): Promise<WytIDEntity[]> {
    return await db
      .select()
      .from(wytidEntities)
      .where(eq(wytidEntities.tenantId, tenantId))
      .orderBy(desc(wytidEntities.createdAt));
  }

  async updateEntity(
    id: string,
    data: { meta?: any },
    tenantId: string
  ): Promise<WytIDEntity | undefined> {
    const [entity] = await db
      .update(wytidEntities)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(wytidEntities.id, id), eq(wytidEntities.tenantId, tenantId)))
      .returning();

    return entity;
  }

  // Proof management
  async createProof(
    data: { entityId: string; proofType: WytIDProofType; proofData: any; expiresAt?: Date },
    tenantId: string
  ): Promise<WytIDProof> {
    const validated = createProofSchema.parse(data);

    // Verify entity exists and belongs to tenant
    const entity = await this.getEntity(validated.entityId, tenantId);
    if (!entity) {
      throw new Error('Entity not found or access denied');
    }

    // Anchor proof if blockchain anchoring is enabled
    let anchoredData = validated.proofData;
    if (validated.proofType === WytIDProofType.BLOCKCHAIN_ANCHOR) {
      try {
        const payload = ProofAnchorUtils.createProofPayload(validated.entityId, validated.proofData);
        const txHash = await this.proofAnchor.anchor(payload);
        anchoredData = {
          ...validated.proofData,
          txHash,
          anchoredAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Failed to anchor proof:', error);
        throw new Error('Proof anchoring failed');
      }
    }

    const proofData: InsertWytIDProof = {
      entityId: validated.entityId,
      proofType: validated.proofType,
      proofData: anchoredData,
      expiresAt: validated.expiresAt || null,
      tenantId,
    };

    const [proof] = await db.insert(wytidProofs).values(proofData).returning();
    
    console.log(`🔐 Created WytID proof: ${proof.id} for entity ${entity.identifier}`);
    return proof;
  }

  async getProofsByEntity(entityId: string, tenantId: string): Promise<WytIDProof[]> {
    return await db
      .select()
      .from(wytidProofs)
      .where(and(eq(wytidProofs.entityId, entityId), eq(wytidProofs.tenantId, tenantId)))
      .orderBy(desc(wytidProofs.issuedAt));
  }

  async getProof(id: string, tenantId: string): Promise<WytIDProof | undefined> {
    const [proof] = await db
      .select()
      .from(wytidProofs)
      .where(and(eq(wytidProofs.id, id), eq(wytidProofs.tenantId, tenantId)));
    
    return proof;
  }

  async revokeProof(id: string, tenantId: string): Promise<WytIDProof | undefined> {
    const [proof] = await db
      .update(wytidProofs)
      .set({ isRevoked: true })
      .where(and(eq(wytidProofs.id, id), eq(wytidProofs.tenantId, tenantId)))
      .returning();

    return proof;
  }

  // Transfer management
  async transferEntity(
    data: { entityId: string; toUserId: string; transferNote?: string },
    fromUserId: string,
    tenantId: string
  ): Promise<WytIDTransfer> {
    const validated = transferEntitySchema.parse(data);

    // Verify entity exists and belongs to current owner
    const entity = await this.getEntity(validated.entityId, tenantId);
    if (!entity || entity.ownerUserId !== fromUserId) {
      throw new Error('Entity not found or access denied');
    }

    // Create transfer record
    const transferData: InsertWytIDTransfer = {
      entityId: validated.entityId,
      fromUserId,
      toUserId: validated.toUserId,
      status: WytIDTransferStatus.PENDING,
      transferNote: validated.transferNote || null,
      tenantId,
    };

    const [transfer] = await db.insert(wytidTransfers).values(transferData).returning();

    // For demo purposes, auto-complete the transfer
    await this.completeTransfer(transfer.id, tenantId);

    console.log(`🔄 Initiated WytID transfer: ${transfer.id} for entity ${entity.identifier}`);
    return transfer;
  }

  async completeTransfer(transferId: string, tenantId: string): Promise<WytIDTransfer | undefined> {
    // Get transfer details
    const [transfer] = await db
      .select()
      .from(wytidTransfers)
      .where(and(eq(wytidTransfers.id, transferId), eq(wytidTransfers.tenantId, tenantId)));

    if (!transfer || transfer.status !== WytIDTransferStatus.PENDING) {
      throw new Error('Transfer not found or not in pending status');
    }

    // Generate mock transaction hash
    const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2)}`.padEnd(66, '0');

    // Update entity ownership
    await db
      .update(wytidEntities)
      .set({
        ownerUserId: transfer.toUserId,
        updatedAt: new Date(),
      })
      .where(eq(wytidEntities.id, transfer.entityId));

    // Complete transfer
    const [completedTransfer] = await db
      .update(wytidTransfers)
      .set({
        status: WytIDTransferStatus.COMPLETED,
        txHash,
        transferredAt: new Date(),
      })
      .where(eq(wytidTransfers.id, transferId))
      .returning();

    return completedTransfer;
  }

  async getTransfersByEntity(entityId: string, tenantId: string): Promise<WytIDTransfer[]> {
    return await db
      .select()
      .from(wytidTransfers)
      .where(and(eq(wytidTransfers.entityId, entityId), eq(wytidTransfers.tenantId, tenantId)))
      .orderBy(desc(wytidTransfers.createdAt));
  }

  // Verification
  async verifyEntity(identifier: string): Promise<WytIDVerificationResponse> {
    const entity = await this.getEntityByIdentifier(identifier);
    if (!entity) {
      return {
        valid: false,
        entity: null as any,
        proofs: [],
        transfers: [],
        lastVerified: new Date(),
        warnings: ['Entity not found'],
      };
    }

    const proofs = await this.getProofsByEntity(entity.id, entity.tenantId);
    const transfers = await this.getTransfersByEntity(entity.id, entity.tenantId);

    const warnings: string[] = [];
    
    // Check for expired proofs
    const now = new Date();
    const expiredProofs = proofs.filter(p => p.expiresAt && p.expiresAt < now);
    if (expiredProofs.length > 0) {
      warnings.push(`${expiredProofs.length} proof(s) expired`);
    }

    // Check for revoked proofs
    const revokedProofs = proofs.filter(p => p.isRevoked);
    if (revokedProofs.length > 0) {
      warnings.push(`${revokedProofs.length} proof(s) revoked`);
    }

    const validProofs = proofs.filter(p => !p.isRevoked && (!p.expiresAt || p.expiresAt > now));

    return {
      valid: validProofs.length > 0,
      entity,
      proofs: validProofs,
      transfers,
      lastVerified: new Date(),
      warnings,
    };
  }

  // Statistics
  async getWytIDStats(tenantId: string): Promise<{
    totalEntities: number;
    entitiesByType: Record<string, number>;
    totalProofs: number;
    proofsByType: Record<string, number>;
    totalTransfers: number;
    recentActivity: number;
  }> {
    const [entitiesCount] = await db
      .select({ count: count() })
      .from(wytidEntities)
      .where(eq(wytidEntities.tenantId, tenantId));

    const [proofsCount] = await db
      .select({ count: count() })
      .from(wytidProofs)
      .where(eq(wytidProofs.tenantId, tenantId));

    const [transfersCount] = await db
      .select({ count: count() })
      .from(wytidTransfers)
      .where(eq(wytidTransfers.tenantId, tenantId));

    // Get entities by type
    const entitiesByType = await db
      .select({
        type: wytidEntities.type,
        count: count(),
      })
      .from(wytidEntities)
      .where(eq(wytidEntities.tenantId, tenantId))
      .groupBy(wytidEntities.type);

    // Get proofs by type
    const proofsByType = await db
      .select({
        type: wytidProofs.proofType,
        count: count(),
      })
      .from(wytidProofs)
      .where(eq(wytidProofs.tenantId, tenantId))
      .groupBy(wytidProofs.proofType);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentActivity] = await db
      .select({ count: count() })
      .from(wytidEntities)
      .where(
        and(
          eq(wytidEntities.tenantId, tenantId),
          sql`${wytidEntities.createdAt} >= ${sevenDaysAgo}`
        )
      );

    return {
      totalEntities: entitiesCount.count,
      entitiesByType: Object.fromEntries(
        entitiesByType.map(e => [e.type, e.count])
      ),
      totalProofs: proofsCount.count,
      proofsByType: Object.fromEntries(
        proofsByType.map(p => [p.type, p.count])
      ),
      totalTransfers: transfersCount.count,
      recentActivity: recentActivity.count,
    };
  }

  // API Key management for external verification
  async createApiKey(
    name: string,
    scopes: string[],
    createdBy: string,
    tenantId?: string,
    expiresAt?: Date
  ): Promise<WytIDApiKey> {
    const apiKey = `wyt_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    const [key] = await db
      .insert(wytidApiKeys)
      .values({
        apiKey,
        name,
        scopes,
        tenantId,
        expiresAt,
        createdBy,
      })
      .returning();

    return key;
  }

  async validateApiKey(apiKey: string): Promise<WytIDApiKey | null> {
    const [key] = await db
      .select()
      .from(wytidApiKeys)
      .where(and(eq(wytidApiKeys.apiKey, apiKey), eq(wytidApiKeys.isActive, true)));

    if (!key) return null;

    // Check expiration
    if (key.expiresAt && key.expiresAt < new Date()) {
      return null;
    }

    // Update last used timestamp
    await db
      .update(wytidApiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(wytidApiKeys.id, key.id));

    return key;
  }
}