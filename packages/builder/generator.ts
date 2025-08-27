// Code generation from DSL models
import { ModelDSL, FieldDefinition, FieldType } from "./dsl";

export interface GeneratedFiles {
  prismaModel: string;
  zodSchemas: string;
  nestController: string;
  nestService: string;
  nextAdminPages: string[];
  migration: string;
}

export class CodeGenerator {
  static generateFromDSL(dsl: ModelDSL, tenantId: string): GeneratedFiles {
    return {
      prismaModel: this.generatePrismaModel(dsl),
      zodSchemas: this.generateZodSchemas(dsl),
      nestController: this.generateNestController(dsl),
      nestService: this.generateNestService(dsl),
      nextAdminPages: this.generateNextAdminPages(dsl),
      migration: this.generateMigration(dsl),
    };
  }

  private static generatePrismaModel(dsl: ModelDSL): string {
    const tableName = dsl.tableName || dsl.name.toLowerCase();
    
    let model = `model ${dsl.name} {\n`;
    
    // Standard fields
    model += `  id        String   @id @default(cuid())\n`;
    model += `  tenantId  String\n`;
    model += `  createdBy String\n`;
    model += `  createdAt DateTime @default(now())\n`;
    model += `  updatedAt DateTime @updatedAt\n\n`;

    // Custom fields
    dsl.fields.forEach(field => {
      model += `  ${this.generatePrismaField(field)}\n`;
    });

    // Relations
    if (dsl.relations) {
      model += '\n';
      dsl.relations.forEach(relation => {
        model += `  ${this.generatePrismaRelation(relation)}\n`;
      });
    }

    // Indexes and constraints
    model += '\n';
    model += `  tenant    Tenant @relation(fields: [tenantId], references: [id])\n`;
    model += `  createdByUser User @relation(fields: [createdBy], references: [id])\n\n`;
    
    model += `  @@map("${tableName}")\n`;
    model += `  @@index([tenantId])\n`;
    
    // Unique constraints for unique fields
    const uniqueFields = dsl.fields.filter(f => f.unique);
    uniqueFields.forEach(field => {
      model += `  @@unique([tenantId, ${field.name}])\n`;
    });
    
    model += `}\n`;

    return model;
  }

  private static generatePrismaField(field: FieldDefinition): string {
    const fieldType = this.mapFieldTypeToPrisma(field.type);
    const optional = field.required ? '' : '?';
    let fieldDef = `${field.name} ${fieldType}${optional}`;

    // Add field attributes
    if (field.unique && field.type !== FieldType.REF) {
      fieldDef += ' @unique';
    }

    if (field.type === FieldType.REF && field.model) {
      fieldDef += ` @relation(fields: [${field.name}Id], references: [id])`;
    }

    return fieldDef;
  }

  private static generatePrismaRelation(relation: any): string {
    switch (relation.type) {
      case 'hasMany':
        return `${relation.field || relation.model.toLowerCase() + 's'} ${relation.model}[]`;
      case 'hasOne':
        return `${relation.field || relation.model.toLowerCase()} ${relation.model}?`;
      case 'belongsTo':
        return `${relation.field || relation.model.toLowerCase()} ${relation.model} @relation(fields: [${relation.foreignKey || relation.model.toLowerCase() + 'Id'}], references: [id])`;
      default:
        return '';
    }
  }

  private static mapFieldTypeToPrisma(type: FieldType): string {
    switch (type) {
      case FieldType.STRING:
      case FieldType.EMAIL:
      case FieldType.ENUM:
        return 'String';
      case FieldType.TEXT:
        return 'String'; // Use String with @db.Text for large text
      case FieldType.NUMBER:
        return 'Int';
      case FieldType.MONEY:
        return 'Decimal';
      case FieldType.BOOLEAN:
        return 'Boolean';
      case FieldType.DATE:
      case FieldType.DATETIME:
        return 'DateTime';
      case FieldType.JSON:
        return 'Json';
      case FieldType.MEDIA:
        return 'String'; // Store media URLs/paths
      case FieldType.REF:
        return 'String'; // Foreign key
      case FieldType.ARRAY:
        return 'String[]';
      default:
        return 'String';
    }
  }

  private static generateZodSchemas(dsl: ModelDSL): string {
    let schemas = `import { z } from "zod";\n\n`;
    
    // Base schema
    schemas += `export const ${dsl.name.toLowerCase()}Schema = z.object({\n`;
    schemas += `  id: z.string().cuid(),\n`;
    schemas += `  tenantId: z.string().uuid(),\n`;
    schemas += `  createdBy: z.string(),\n`;
    schemas += `  createdAt: z.date(),\n`;
    schemas += `  updatedAt: z.date(),\n`;

    dsl.fields.forEach(field => {
      schemas += `  ${this.generateZodField(field)},\n`;
    });

    schemas += `});\n\n`;

    // Insert schema (without auto-generated fields)
    schemas += `export const insert${dsl.name}Schema = ${dsl.name.toLowerCase()}Schema.omit({\n`;
    schemas += `  id: true,\n`;
    schemas += `  createdAt: true,\n`;
    schemas += `  updatedAt: true,\n`;
    schemas += `});\n\n`;

    // Update schema
    schemas += `export const update${dsl.name}Schema = insert${dsl.name}Schema.partial();\n\n`;

    // Types
    schemas += `export type ${dsl.name} = z.infer<typeof ${dsl.name.toLowerCase()}Schema>;\n`;
    schemas += `export type Insert${dsl.name} = z.infer<typeof insert${dsl.name}Schema>;\n`;
    schemas += `export type Update${dsl.name} = z.infer<typeof update${dsl.name}Schema>;\n`;

    return schemas;
  }

  private static generateZodField(field: FieldDefinition): string {
    let zodField = `${field.name}: `;

    switch (field.type) {
      case FieldType.STRING:
      case FieldType.EMAIL:
      case FieldType.TEXT:
        zodField += 'z.string()';
        if (field.validation?.minLength) {
          zodField += `.min(${field.validation.minLength})`;
        }
        if (field.validation?.maxLength) {
          zodField += `.max(${field.validation.maxLength})`;
        }
        if (field.type === FieldType.EMAIL) {
          zodField += '.email()';
        }
        break;
      case FieldType.NUMBER:
        zodField += 'z.number()';
        if (field.validation?.min !== undefined) {
          zodField += `.min(${field.validation.min})`;
        }
        if (field.validation?.max !== undefined) {
          zodField += `.max(${field.validation.max})`;
        }
        break;
      case FieldType.MONEY:
        zodField += 'z.number().multipleOf(0.01)';
        break;
      case FieldType.BOOLEAN:
        zodField += 'z.boolean()';
        break;
      case FieldType.DATE:
      case FieldType.DATETIME:
        zodField += 'z.date()';
        break;
      case FieldType.ENUM:
        if (field.options) {
          zodField += `z.enum([${field.options.map(opt => `"${opt}"`).join(', ')}])`;
        } else {
          zodField += 'z.string()';
        }
        break;
      case FieldType.JSON:
        zodField += 'z.record(z.any())';
        break;
      case FieldType.ARRAY:
        zodField += 'z.array(z.string())';
        break;
      default:
        zodField += 'z.string()';
    }

    if (!field.required) {
      zodField += '.optional()';
    }

    return zodField;
  }

  private static generateNestController(dsl: ModelDSL): string {
    const modelName = dsl.name;
    const modelLower = modelName.toLowerCase();
    
    return `import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ${modelName}Service } from './${modelLower}.service';
import { Insert${modelName}, Update${modelName} } from './schemas/${modelLower}.schema';
import { AuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CurrentTenant } from '../auth/current-tenant.decorator';

@Controller('${modelLower}s')
@UseGuards(AuthGuard, TenantGuard)
export class ${modelName}Controller {
  constructor(private readonly ${modelLower}Service: ${modelName}Service) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: any
  ) {
    return this.${modelLower}Service.findAll(tenantId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string
  ) {
    return this.${modelLower}Service.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() create${modelName}Dto: Insert${modelName}
  ) {
    return this.${modelLower}Service.create(tenantId, userId, create${modelName}Dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() update${modelName}Dto: Update${modelName}
  ) {
    return this.${modelLower}Service.update(tenantId, id, update${modelName}Dto);
  }

  @Delete(':id')
  async remove(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string
  ) {
    return this.${modelLower}Service.remove(tenantId, id);
  }
}`;
  }

  private static generateNestService(dsl: ModelDSL): string {
    const modelName = dsl.name;
    const modelLower = modelName.toLowerCase();
    
    return `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Insert${modelName}, Update${modelName} } from './schemas/${modelLower}.schema';

@Injectable()
export class ${modelName}Service {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: any = {}) {
    const { page = 1, limit = 10, search, ...filters } = query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...filters,
      ${dsl.ui?.searchFields ? `
      ...(search && {
        OR: [
          ${dsl.ui.searchFields.map(field => `{ ${field}: { contains: search, mode: 'insensitive' } }`).join(',\n          ')}
        ]
      })` : ''}
    };

    const [items, total] = await Promise.all([
      this.prisma.${modelLower}.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.${modelLower}.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.${modelLower}.findFirst({
      where: { id, tenantId },
    });

    if (!item) {
      throw new NotFoundException('${modelName} not found');
    }

    return item;
  }

  async create(tenantId: string, userId: string, data: Insert${modelName}) {
    return this.prisma.${modelLower}.create({
      data: {
        ...data,
        tenantId,
        createdBy: userId,
      },
    });
  }

  async update(tenantId: string, id: string, data: Update${modelName}) {
    const existing = await this.findOne(tenantId, id);
    
    return this.prisma.${modelLower}.update({
      where: { id: existing.id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.findOne(tenantId, id);
    
    return this.prisma.${modelLower}.delete({
      where: { id: existing.id },
    });
  }
}`;
  }

  private static generateNextAdminPages(dsl: ModelDSL): string[] {
    const modelName = dsl.name;
    const modelLower = modelName.toLowerCase();
    
    // List page
    const listPage = `'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function ${modelName}ListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/${modelLower}s', { search, page }],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', \`/api/${modelLower}s/\${id}\`);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: '${modelName} deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/${modelLower}s'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this ${modelLower}?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">${modelName}s</h1>
        <Button href={\`/${modelLower}s/new\`}>
          Add ${modelName}
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          placeholder="Search ${modelLower}s..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {data?.items?.map((item: any) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{item.${dsl.ui?.displayField || 'name'} || item.id}</span>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" href={\`/${modelLower}s/\${item.id}\`}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" href={\`/${modelLower}s/\${item.id}/edit\`}>
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  ${dsl.fields.slice(0, 4).map(field => 
                    `<div><span className="font-medium">${field.label || field.name}:</span> {item.${field.name}}</div>`
                  ).join('\n                  ')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}`;

    return [listPage];
  }

  private static generateMigration(dsl: ModelDSL): string {
    const tableName = dsl.tableName || dsl.name.toLowerCase();
    
    return `-- Migration for ${dsl.name} model
-- Generated from DSL: ${dsl.description || ''}

CREATE TABLE "${tableName}" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  ${dsl.fields.map(field => this.generateSQLField(field)).join(',\n  ')},

  CONSTRAINT "${tableName}_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "${tableName}_tenant_id_idx" ON "${tableName}"("tenant_id");
CREATE INDEX "${tableName}_created_at_idx" ON "${tableName}"("created_at");

-- Add unique constraints for unique fields
${dsl.fields.filter(f => f.unique).map(field => 
  `CREATE UNIQUE INDEX "${tableName}_${field.name}_tenant_id_key" ON "${tableName}"("${field.name}", "tenant_id");`
).join('\n')}

-- Add foreign key constraints
ALTER TABLE "${tableName}" ADD CONSTRAINT "${tableName}_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "${tableName}" ADD CONSTRAINT "${tableName}_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable RLS
ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant isolation
CREATE POLICY "${tableName}_tenant_isolation" ON "${tableName}"
  AS RESTRICTIVE FOR ALL
  TO authenticated
  USING (tenant_id = current_setting('app.current_tenant_id'));`;
  }

  private static generateSQLField(field: FieldDefinition): string {
    const sqlType = this.mapFieldTypeToSQL(field.type);
    const nullable = field.required ? 'NOT NULL' : 'NULL';
    
    return `"${field.name}" ${sqlType} ${nullable}`;
  }

  private static mapFieldTypeToSQL(type: FieldType): string {
    switch (type) {
      case FieldType.STRING:
      case FieldType.EMAIL:
      case FieldType.ENUM:
      case FieldType.MEDIA:
      case FieldType.REF:
        return 'TEXT';
      case FieldType.TEXT:
        return 'TEXT';
      case FieldType.NUMBER:
        return 'INTEGER';
      case FieldType.MONEY:
        return 'DECIMAL(10,2)';
      case FieldType.BOOLEAN:
        return 'BOOLEAN';
      case FieldType.DATE:
      case FieldType.DATETIME:
        return 'TIMESTAMP(3)';
      case FieldType.JSON:
        return 'JSONB';
      case FieldType.ARRAY:
        return 'TEXT[]';
      default:
        return 'TEXT';
    }
  }
}
