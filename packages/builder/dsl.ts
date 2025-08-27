// JSON DSL schema and validation for CRUD module builder
import { z } from "zod";

// Field types supported by the DSL
export enum FieldType {
  STRING = 'string',
  TEXT = 'text',
  NUMBER = 'number',
  MONEY = 'money',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  EMAIL = 'email',
  ENUM = 'enum',
  JSON = 'json',
  MEDIA = 'media',
  REF = 'ref',
  ARRAY = 'array',
}

// Validation schema for field definitions
const fieldValidationSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  regex: z.string().optional(),
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
}).optional();

// Field definition schema
const fieldSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(FieldType),
  label: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  unique: z.boolean().default(false),
  validation: fieldValidationSchema,
  // For enum fields
  options: z.array(z.string()).optional(),
  // For reference fields
  model: z.string().optional(),
  // For array fields
  itemType: z.nativeEnum(FieldType).optional(),
  // UI hints
  ui: z.object({
    hidden: z.boolean().optional(),
    readonly: z.boolean().optional(),
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
  }).optional(),
});

// Permission expressions
const permissionSchema = z.object({
  create: z.string().optional(),
  read: z.string().optional(),
  update: z.string().optional(),
  delete: z.string().optional(),
});

// Main DSL schema
export const modelDSLSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tableName: z.string().optional(),
  fields: z.array(fieldSchema).min(1),
  permissions: permissionSchema.optional(),
  hooks: z.object({
    beforeCreate: z.string().optional(),
    afterCreate: z.string().optional(),
    beforeUpdate: z.string().optional(),
    afterUpdate: z.string().optional(),
    beforeDelete: z.string().optional(),
    afterDelete: z.string().optional(),
  }).optional(),
  ui: z.object({
    displayField: z.string().optional(),
    searchFields: z.array(z.string()).optional(),
    sortFields: z.array(z.string()).optional(),
    filters: z.array(z.string()).optional(),
    actions: z.array(z.string()).optional(),
  }).optional(),
  relations: z.array(z.object({
    type: z.enum(['hasOne', 'hasMany', 'belongsTo', 'manyToMany']),
    model: z.string(),
    field: z.string().optional(),
    foreignKey: z.string().optional(),
  })).optional(),
  i18n: z.boolean().default(false),
  audit: z.boolean().default(true),
  softDelete: z.boolean().default(false),
});

export type ModelDSL = z.infer<typeof modelDSLSchema>;
export type FieldDefinition = z.infer<typeof fieldSchema>;

export class DSLValidator {
  static validate(dsl: any): { valid: boolean; errors: string[]; data?: ModelDSL } {
    try {
      const validated = modelDSLSchema.parse(dsl);
      
      // Additional semantic validation
      const errors = this.validateSemantics(validated);
      
      if (errors.length > 0) {
        return { valid: false, errors };
      }
      
      return { valid: true, errors: [], data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        return { valid: false, errors };
      }
      return { valid: false, errors: [error.message] };
    }
  }

  private static validateSemantics(dsl: ModelDSL): string[] {
    const errors: string[] = [];

    // Check for duplicate field names
    const fieldNames = dsl.fields.map(f => f.name);
    const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate field names: ${duplicates.join(', ')}`);
    }

    // Validate reference fields
    dsl.fields.forEach(field => {
      if (field.type === FieldType.REF && !field.model) {
        errors.push(`Reference field '${field.name}' must specify a model`);
      }
      
      if (field.type === FieldType.ENUM && (!field.options || field.options.length === 0)) {
        errors.push(`Enum field '${field.name}' must specify options`);
      }

      if (field.type === FieldType.ARRAY && !field.itemType) {
        errors.push(`Array field '${field.name}' must specify itemType`);
      }
    });

    // Validate UI configuration
    if (dsl.ui?.displayField && !fieldNames.includes(dsl.ui.displayField)) {
      errors.push(`Display field '${dsl.ui.displayField}' does not exist`);
    }

    if (dsl.ui?.searchFields) {
      const invalidSearchFields = dsl.ui.searchFields.filter(field => !fieldNames.includes(field));
      if (invalidSearchFields.length > 0) {
        errors.push(`Invalid search fields: ${invalidSearchFields.join(', ')}`);
      }
    }

    // Validate relations
    dsl.relations?.forEach(relation => {
      if (relation.field && !fieldNames.includes(relation.field)) {
        errors.push(`Relation field '${relation.field}' does not exist`);
      }
    });

    return errors;
  }

  static getFieldValidation(field: FieldDefinition): Record<string, any> {
    const validation: Record<string, any> = {};

    if (field.required) {
      validation.required = true;
    }

    if (field.unique) {
      validation.unique = true;
    }

    if (field.validation) {
      Object.assign(validation, field.validation);
    }

    // Type-specific validation
    switch (field.type) {
      case FieldType.EMAIL:
        validation.email = true;
        break;
      case FieldType.NUMBER:
      case FieldType.MONEY:
        validation.type = 'number';
        break;
      case FieldType.DATE:
        validation.type = 'date';
        break;
      case FieldType.DATETIME:
        validation.type = 'datetime';
        break;
    }

    return validation;
  }
}

// Example DSL templates
export const DSL_TEMPLATES = {
  contact: {
    name: "Contact",
    description: "Customer contact management",
    fields: [
      {
        name: "firstName",
        type: FieldType.STRING,
        required: true,
        validation: { minLength: 2, maxLength: 50 }
      },
      {
        name: "lastName",
        type: FieldType.STRING,
        required: true,
        validation: { minLength: 2, maxLength: 50 }
      },
      {
        name: "email",
        type: FieldType.EMAIL,
        required: true,
        unique: true
      },
      {
        name: "phone",
        type: FieldType.STRING,
        validation: { regex: "^[+]?[1-9]\\d{9,14}$" }
      },
      {
        name: "company",
        type: FieldType.REF,
        model: "Company"
      },
      {
        name: "tags",
        type: FieldType.ARRAY,
        itemType: FieldType.STRING
      }
    ],
    permissions: {
      create: "role:editor",
      read: "role:viewer",
      update: "role:editor",
      delete: "role:admin"
    },
    ui: {
      displayField: "firstName",
      searchFields: ["firstName", "lastName", "email"],
      sortFields: ["firstName", "lastName", "createdAt"],
      filters: ["company", "tags"]
    }
  },

  product: {
    name: "Product",
    description: "Product catalog management",
    fields: [
      {
        name: "name",
        type: FieldType.STRING,
        required: true,
        validation: { minLength: 2, maxLength: 100 }
      },
      {
        name: "description",
        type: FieldType.TEXT
      },
      {
        name: "price",
        type: FieldType.MONEY,
        required: true,
        validation: { min: 0 }
      },
      {
        name: "category",
        type: FieldType.REF,
        model: "Category"
      },
      {
        name: "status",
        type: FieldType.ENUM,
        options: ["active", "inactive", "discontinued"],
        required: true
      },
      {
        name: "images",
        type: FieldType.ARRAY,
        itemType: FieldType.MEDIA
      }
    ],
    permissions: {
      create: "role:editor",
      read: "role:viewer",
      update: "role:editor",
      delete: "role:admin"
    }
  }
};
