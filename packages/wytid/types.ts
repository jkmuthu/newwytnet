// WytID type definitions
import { z } from 'zod';

// Entity types supported by WytID
export enum WytIDEntityType {
  PERSON = 'person',
  ORG = 'org', 
  ASSET = 'asset',
  DOCUMENT = 'document',
}

// Proof types for identity validation
export enum WytIDProofType {
  HASH = 'hash',
  SIGNATURE = 'signature',
  BLOCKCHAIN_ANCHOR = 'blockchain_anchor',
  NOTARY = 'notary',
}

// Transfer status
export enum WytIDTransferStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Entity metadata schema
export const wytidEntityMetaSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.record(z.any()).optional(),
  externalRefs: z.record(z.string()).optional(),
});

// Proof data schema
export const wytidProofDataSchema = z.object({
  hash: z.string().optional(),
  signature: z.string().optional(),
  publicKey: z.string().optional(),
  algorithm: z.string().optional(),
  txHash: z.string().optional(),
  blockNumber: z.number().optional(),
  notaryId: z.string().optional(),
  notarySignature: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// API schemas for validation
export const createEntitySchema = z.object({
  type: z.nativeEnum(WytIDEntityType),
  meta: wytidEntityMetaSchema,
});

export const createProofSchema = z.object({
  entityId: z.string().uuid(),
  proofType: z.nativeEnum(WytIDProofType),
  proofData: wytidProofDataSchema,
  expiresAt: z.date().optional(),
});

export const transferEntitySchema = z.object({
  entityId: z.string().uuid(),
  toUserId: z.string(),
  transferNote: z.string().optional(),
});

// Type exports for database models
export type WytIDEntity = {
  id: string;
  type: WytIDEntityType;
  identifier: string;
  meta: z.infer<typeof wytidEntityMetaSchema>;
  ownerUserId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WytIDProof = {
  id: string;
  entityId: string;
  proofType: WytIDProofType;
  proofData: z.infer<typeof wytidProofDataSchema>;
  issuedAt: Date;
  expiresAt: Date | null;
  isRevoked: boolean;
  tenantId: string;
  createdAt: Date;
};

export type WytIDTransfer = {
  id: string;
  entityId: string;
  fromUserId: string;
  toUserId: string;
  status: WytIDTransferStatus;
  txHash: string | null;
  transferNote: string | null;
  transferredAt: Date | null;
  tenantId: string;
  createdAt: Date;
};

// Verification response
export type WytIDVerificationResponse = {
  valid: boolean;
  entity: WytIDEntity;
  proofs: WytIDProof[];
  transfers: WytIDTransfer[];
  lastVerified: Date;
  warnings: string[];
};

// API key scopes for external verification
export enum WytIDApiScope {
  VERIFY_READ = 'verify:read',
  ENTITY_READ = 'entity:read', 
  PROOF_READ = 'proof:read',
  TRANSFER_READ = 'transfer:read',
}

// WytKey API authentication
export type WytKeyAuth = {
  apiKey: string;
  scopes: WytIDApiScope[];
  tenantId?: string;
  rateLimit: number;
};