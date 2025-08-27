// WytID integration for CRUD Builder
// Adds identity validation hooks to generated models

export interface WytIDIntegrationConfig {
  enableEntityValidation: boolean;
  enableProofRequirement: boolean;
  enableTransferTracking: boolean;
  entityTypes: string[];
  requiredProofTypes: string[];
}

export class WytIDCRUDIntegration {
  private config: WytIDIntegrationConfig;

  constructor(config: WytIDIntegrationConfig) {
    this.config = config;
  }

  // Generate WytID validation hooks for CRUD operations
  generateValidationHooks(modelSchema: any): string {
    if (!this.config.enableEntityValidation) {
      return '';
    }

    return `
// WytID Entity Validation Hooks
export const wytidValidation = {
  beforeCreate: async (data: any, context: any) => {
    if (data.wytidEntityId) {
      const verification = await fetch('/api/public/wytid/verify/' + data.wytidEntityId);
      const result = await verification.json();
      
      if (!result.valid) {
        throw new Error('Invalid WytID entity: ' + result.warnings.join(', '));
      }
      
      // Attach verified entity data
      data._wytidVerification = result;
    }
    return data;
  },
  
  afterCreate: async (record: any, context: any) => {
    // Log WytID activity if entity is linked
    if (record.wytidEntityId && record._wytidVerification) {
      await fetch('/api/wytid/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_created',
          entityId: record.wytidEntityId,
          modelType: '${modelSchema.name}',
          recordId: record.id,
          metadata: {
            verification: record._wytidVerification,
            timestamp: new Date().toISOString()
          }
        })
      });
    }
    return record;
  },
  
  beforeUpdate: async (id: string, data: any, context: any) => {
    // Re-validate WytID entity if changed
    if (data.wytidEntityId) {
      const verification = await fetch('/api/public/wytid/verify/' + data.wytidEntityId);
      const result = await verification.json();
      
      if (!result.valid) {
        throw new Error('Invalid WytID entity: ' + result.warnings.join(', '));
      }
      
      data._wytidVerification = result;
    }
    return data;
  }
};

// WytID field definitions for model builder
export const wytidFields = {
  wytidEntityId: {
    type: 'varchar',
    length: 100,
    nullable: true,
    description: 'Associated WytID entity identifier',
    validation: {
      pattern: '^WYT-[A-Z0-9]{12,}$',
      message: 'Must be a valid WytID identifier'
    }
  },
  wytidVerified: {
    type: 'boolean',
    default: false,
    description: 'Whether the WytID entity has been verified'
  },
  wytidVerifiedAt: {
    type: 'timestamp',
    nullable: true,
    description: 'When the WytID entity was last verified'
  }
};
`;
  }

  // Generate proof validation middleware
  generateProofMiddleware(modelSchema: any): string {
    if (!this.config.enableProofRequirement) {
      return '';
    }

    return `
// WytID Proof Requirement Middleware
export const wytidProofMiddleware = {
  requireProof: async (req: any, res: any, next: any) => {
    const { wytidEntityId } = req.body;
    
    if (!wytidEntityId) {
      return res.status(400).json({
        error: 'WytID entity required',
        message: 'This model requires a valid WytID entity with proof'
      });
    }

    try {
      // Verify entity has required proof types
      const proofsResponse = await fetch('/api/wytid/entities/' + wytidEntityId + '/proofs');
      const proofs = await proofsResponse.json();
      
      const requiredTypes = ${JSON.stringify(this.config.requiredProofTypes)};
      const existingTypes = proofs.map(p => p.proofType);
      const missingTypes = requiredTypes.filter(type => !existingTypes.includes(type));
      
      if (missingTypes.length > 0) {
        return res.status(400).json({
          error: 'Missing required proofs',
          message: 'Entity must have proofs of type: ' + missingTypes.join(', '),
          missingProofTypes: missingTypes
        });
      }
      
      req.wytidProofs = proofs;
      next();
    } catch (error) {
      return res.status(500).json({
        error: 'WytID verification failed',
        message: error.message
      });
    }
  }
};
`;
  }

  // Generate transfer tracking hooks
  generateTransferHooks(modelSchema: any): string {
    if (!this.config.enableTransferTracking) {
      return '';
    }

    return `
// WytID Transfer Tracking Hooks
export const wytidTransferHooks = {
  onOwnershipChange: async (record: any, oldOwner: string, newOwner: string, context: any) => {
    if (record.wytidEntityId) {
      // Initiate WytID entity transfer
      try {
        await fetch('/api/wytid/transfers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityId: record.wytidEntityId,
            toUserId: newOwner,
            transferNote: 'Ownership change in ${modelSchema.name} model, record ID: ' + record.id
          })
        });
        
        // Log the transfer
        console.log('WytID entity transfer initiated:', {
          entityId: record.wytidEntityId,
          fromOwner: oldOwner,
          toOwner: newOwner,
          modelType: '${modelSchema.name}',
          recordId: record.id
        });
      } catch (error) {
        console.error('Failed to initiate WytID transfer:', error);
        // Don't fail the main operation, just log the error
      }
    }
  },
  
  onRecordDelete: async (record: any, context: any) => {
    if (record.wytidEntityId) {
      // Create audit trail for deleted record with WytID entity
      await fetch('/api/wytid/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_deleted',
          entityId: record.wytidEntityId,
          modelType: '${modelSchema.name}',
          recordId: record.id,
          metadata: {
            deletedAt: new Date().toISOString(),
            deletedBy: context.userId
          }
        })
      });
    }
  }
};
`;
  }

  // Generate complete WytID integration code
  generateIntegrationCode(modelSchema: any): string {
    const validationHooks = this.generateValidationHooks(modelSchema);
    const proofMiddleware = this.generateProofMiddleware(modelSchema);
    const transferHooks = this.generateTransferHooks(modelSchema);

    return `
// Generated WytID Integration for ${modelSchema.name}
// This file provides identity validation and proof management for your CRUD model

${validationHooks}

${proofMiddleware}

${transferHooks}

// WytID Configuration for this model
export const wytidConfig = ${JSON.stringify(this.config, null, 2)};

// Utility functions
export const wytidUtils = {
  // Verify an entity identifier
  async verifyEntity(identifier: string) {
    const response = await fetch('/api/public/wytid/verify/' + identifier);
    return await response.json();
  },
  
  // Get entity proofs
  async getEntityProofs(entityId: string) {
    const response = await fetch('/api/wytid/entities/' + entityId + '/proofs');
    return await response.json();
  },
  
  // Check if entity has required proof types
  hasRequiredProofs(proofs: any[]) {
    const requiredTypes = ${JSON.stringify(this.config.requiredProofTypes)};
    const existingTypes = proofs.map(p => p.proofType);
    return requiredTypes.every(type => existingTypes.includes(type));
  },
  
  // Generate WytID field validators for forms
  getFieldValidators() {
    return {
      wytidEntityId: {
        required: ${this.config.enableEntityValidation},
        pattern: /^WYT-[A-Z0-9]{12,}$/,
        message: 'Must be a valid WytID identifier (e.g., WYT-ABC123XYZ789)'
      }
    };
  }
};

// Export integration hooks for use in generated CRUD operations
export default {
  validation: wytidValidation,
  middleware: wytidProofMiddleware,
  transfer: wytidTransferHooks,
  utils: wytidUtils,
  config: wytidConfig
};
`;
  }

  // Check if a model should have WytID integration
  static shouldIntegrate(modelSchema: any): boolean {
    // Check if model has identity-related fields or annotations
    const hasIdentityFields = modelSchema.fields?.some((field: any) => 
      field.name.includes('identity') || 
      field.name.includes('wytid') ||
      field.name.includes('verified')
    );

    const hasIdentityAnnotations = modelSchema.annotations?.includes('identity') ||
                                   modelSchema.annotations?.includes('verification') ||
                                   modelSchema.annotations?.includes('wytid');

    return hasIdentityFields || hasIdentityAnnotations;
  }

  // Create default WytID configuration for a model
  static createDefaultConfig(modelSchema: any): WytIDIntegrationConfig {
    return {
      enableEntityValidation: true,
      enableProofRequirement: false, // Default to false to not break existing flows
      enableTransferTracking: true,
      entityTypes: ['person', 'org'], // Most common types
      requiredProofTypes: ['hash'], // Minimal requirement
    };
  }
}