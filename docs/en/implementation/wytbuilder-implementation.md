---
requiredLevel: developer
---

# Implementation Guide: WytBuilder Self-Service Platform

**Phase**: 3 of 3  
**Timeline**: 4-6 weeks  
**Status**: Implementation Ready  
**Prerequisites**: Phase 1 & 2 complete

---

## Overview

This guide provides step-by-step instructions for implementing the complete WytBuilder platform, enabling Super Admins to create modules, apps, pages, and hubs through visual drag-drop interfaces and AI-powered natural language generation.

---

## Step 1: Module Builder - Drag-Drop CRUD

### 1.1 Install Drag-Drop Library

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-flow-renderer
```

### 1.2 Create Module Builder Page

**Create**: `client/src/pages/engine-admin/module-builder.tsx`

```typescript
import { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { EntityCanvas } from '@/components/builders/EntityCanvas';
import { ComponentPalette } from '@/components/builders/ComponentPalette';
import { PropertiesPanel } from '@/components/builders/PropertiesPanel';
import { ModuleBuilderHeader } from '@/components/builders/ModuleBuilderHeader';
import { AIGeneratePanel } from '@/components/builders/AIGeneratePanel';

interface Entity {
  id: string;
  name: string;
  fields: Field[];
  position: { x: number; y: number };
}

interface Field {
  id: string;
  name: string;
  type: FieldType;
  validation: ValidationRules;
}

type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'relation';

export default function ModuleBuilderPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over?.id === 'canvas' && active.data.current?.type === 'entity') {
      // Add new entity to canvas
      const newEntity: Entity = {
        id: `entity-${Date.now()}`,
        name: 'New Entity',
        fields: [],
        position: { x: 100, y: 100 },
      };
      
      setEntities([...entities, newEntity]);
    }
  };
  
  const handleGenerateFromAI = async (description: string) => {
    // Call AI to generate module structure
    const response = await fetch('/api/admin/wytai/generate-module', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });
    
    const { entities: generatedEntities } = await response.json();
    setEntities(generatedEntities);
  };
  
  return (
    <div className="h-screen flex flex-col">
      <ModuleBuilderHeader
        onSave={() => saveModule(entities)}
        onDeploy={() => deployModule(entities)}
        onShowAI={() => setShowAIPanel(true)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <DndContext onDragEnd={handleDragEnd}>
          <ComponentPalette />
          
          <EntityCanvas
            entities={entities}
            onSelectEntity={setSelectedEntity}
            onUpdateEntity={(entity) => {
              setEntities(entities.map(e => 
                e.id === entity.id ? entity : e
              ));
            }}
          />
          
          {selectedEntity && (
            <PropertiesPanel
              entity={selectedEntity}
              onUpdate={(updated) => {
                setEntities(entities.map(e => 
                  e.id === updated.id ? updated : e
                ));
                setSelectedEntity(updated);
              }}
            />
          )}
        </DndContext>
      </div>
      
      {showAIPanel && (
        <AIGeneratePanel
          onGenerate={handleGenerateFromAI}
          onClose={() => setShowAIPanel(false)}
        />
      )}
    </div>
  );
}
```

### 1.3 Create Component Palette

**Create**: `client/src/components/builders/ComponentPalette.tsx`

```typescript
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Database, FileText, Link2, Zap } from 'lucide-react';

const components = [
  { id: 'entity', label: 'Entity', icon: Database, type: 'entity' },
  { id: 'field', label: 'Field', icon: FileText, type: 'field' },
  { id: 'relation', label: 'Relationship', icon: Link2, type: 'relation' },
  { id: 'action', label: 'Action', icon: Zap, type: 'action' },
];

export function ComponentPalette() {
  return (
    <div className="w-64 border-r p-4 space-y-4 bg-background overflow-y-auto">
      <div>
        <h3 className="font-semibold mb-3">Components</h3>
        <div className="space-y-2">
          {components.map(component => (
            <DraggableComponent key={component.id} component={component} />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-3">Templates</h3>
        <div className="space-y-2">
          <TemplateCard name="Blog" entities={['Post', 'Category', 'Comment']} />
          <TemplateCard name="E-commerce" entities={['Product', 'Order', 'Customer']} />
          <TemplateCard name="CRM" entities={['Contact', 'Deal', 'Task']} />
        </div>
      </div>
    </div>
  );
}

function DraggableComponent({ component }: { component: typeof components[0] }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: component.id,
    data: { type: component.type },
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;
  
  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 cursor-grab active:cursor-grabbing hover:bg-accent"
      data-testid={`draggable-${component.id}`}
    >
      <div className="flex items-center gap-2">
        <component.icon className="h-4 w-4" />
        <span className="text-sm">{component.label}</span>
      </div>
    </Card>
  );
}

function TemplateCard({ name, entities }: { name: string; entities: string[] }) {
  return (
    <Card className="p-3 cursor-pointer hover:bg-accent">
      <div className="font-medium text-sm">{name}</div>
      <div className="text-xs text-muted-foreground mt-1">
        {entities.join(', ')}
      </div>
    </Card>
  );
}
```

### 1.4 Create Entity Canvas

**Create**: `client/src/components/builders/EntityCanvas.tsx`

```typescript
import { useDroppable } from '@dnd-kit/core';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
} from 'react-flow-renderer';

interface Entity {
  id: string;
  name: string;
  fields: Field[];
  position: { x: number; y: number };
}

interface EntityCanvasProps {
  entities: Entity[];
  onSelectEntity: (entity: Entity) => void;
  onUpdateEntity: (entity: Entity) => void;
}

export function EntityCanvas({
  entities,
  onSelectEntity,
  onUpdateEntity,
}: EntityCanvasProps) {
  const { setNodeRef } = useDroppable({ id: 'canvas' });
  
  const nodes: Node[] = entities.map(entity => ({
    id: entity.id,
    type: 'entity',
    position: entity.position,
    data: { entity, onSelect: () => onSelectEntity(entity) },
  }));
  
  const edges: Edge[] = []; // TODO: Add relationships
  
  return (
    <div ref={setNodeRef} className="flex-1 bg-muted/20" data-testid="entity-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ entity: EntityNode }}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

function EntityNode({ data }: { data: { entity: Entity; onSelect: () => void } }) {
  const { entity, onSelect } = data;
  
  return (
    <div
      className="bg-background border-2 border-border rounded-lg p-4 min-w-[200px] cursor-pointer hover:border-primary"
      onClick={onSelect}
      data-testid={`entity-node-${entity.id}`}
    >
      <div className="font-semibold mb-2">{entity.name}</div>
      <div className="space-y-1">
        {entity.fields.map(field => (
          <div key={field.id} className="text-sm text-muted-foreground">
            {field.name}: {field.type}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 1.5 Create Properties Panel

**Create**: `client/src/components/builders/PropertiesPanel.tsx`

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash } from 'lucide-react';

const fieldTypes = ['text', 'number', 'boolean', 'date', 'email', 'url', 'textarea', 'select', 'relation'];

interface PropertiesPanelProps {
  entity: Entity;
  onUpdate: (entity: Entity) => void;
}

export function PropertiesPanel({ entity, onUpdate }: PropertiesPanelProps) {
  const addField = () => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      name: 'newField',
      type: 'text',
      validation: {},
    };
    
    onUpdate({
      ...entity,
      fields: [...entity.fields, newField],
    });
  };
  
  const updateField = (fieldId: string, updates: Partial<Field>) => {
    onUpdate({
      ...entity,
      fields: entity.fields.map(f => 
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    });
  };
  
  const deleteField = (fieldId: string) => {
    onUpdate({
      ...entity,
      fields: entity.fields.filter(f => f.id !== fieldId),
    });
  };
  
  return (
    <div className="w-80 border-l p-4 space-y-4 overflow-y-auto bg-background">
      <div>
        <h3 className="font-semibold mb-3">Entity Properties</h3>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="entity-name">Name</Label>
            <Input
              id="entity-name"
              value={entity.name}
              onChange={(e) => onUpdate({ ...entity, name: e.target.value })}
              data-testid="input-entity-name"
            />
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Fields</h3>
          <Button size="sm" onClick={addField} data-testid="button-add-field">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        
        <div className="space-y-4">
          {entity.fields.map(field => (
            <div key={field.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Input
                  value={field.name}
                  onChange={(e) => updateField(field.id, { name: e.target.value })}
                  className="flex-1 mr-2"
                  placeholder="Field name"
                  data-testid={`input-field-name-${field.id}`}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteField(field.id)}
                  data-testid={`button-delete-field-${field.id}`}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              <Select
                value={field.type}
                onValueChange={(type) => updateField(field.id, { type: type as FieldType })}
              >
                <SelectTrigger data-testid={`select-field-type-${field.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Step 2: Code Generation Engine

### 2.1 Create Schema Generator

**Create**: `server/generators/schemaGenerator.ts`

```typescript
interface Entity {
  name: string;
  fields: Field[];
}

interface Field {
  name: string;
  type: string;
  validation: ValidationRules;
}

export class SchemaGenerator {
  generateDrizzleSchema(entities: Entity[]): string {
    const imports = `import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';`;
    
    const tables = entities.map(entity => this.generateTable(entity)).join('\n\n');
    
    return `${imports}\n\n${tables}`;
  }
  
  private generateTable(entity: Entity): string {
    const tableName = this.toSnakeCase(entity.name);
    const fields = entity.fields.map(f => this.generateField(f)).join(',\n  ');
    
    return `
export const ${entity.name} = pgTable('${tableName}', {
  id: uuid('id').defaultRandom().primaryKey(),
  ${fields},
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
    `.trim();
  }
  
  private generateField(field: Field): string {
    const typeMap: Record<string, string> = {
      text: 'text',
      number: 'integer',
      boolean: 'boolean',
      date: 'timestamp',
      email: 'text',
      url: 'text',
    };
    
    const drizzleType = typeMap[field.type] || 'text';
    let code = `${field.name}: ${drizzleType}('${this.toSnakeCase(field.name)}')`;
    
    if (field.validation.required) code += '.notNull()';
    if (field.validation.unique) code += '.unique()';
    
    return code;
  }
  
  generateZodSchema(entities: Entity[]): string {
    const imports = `import { createInsertSchema } from 'drizzle-zod';\nimport { z } from 'zod';`;
    
    const schemas = entities.map(entity => {
      const pascalName = this.toPascalCase(entity.name);
      
      return `
export const insert${pascalName}Schema = createInsertSchema(${entity.name});
export type Insert${pascalName} = z.infer<typeof insert${pascalName}Schema>;
export type ${pascalName} = typeof ${entity.name}.$inferSelect;
      `.trim();
    }).join('\n\n');
    
    return `${imports}\n\n${schemas}`;
  }
  
  private toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }
  
  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
```

### 2.2 Create API Generator

**Create**: `server/generators/apiGenerator.ts`

```typescript
export class APIGenerator {
  generateCRUDRoutes(entity: Entity): string {
    const entityName = entity.name;
    const routePath = this.toKebabCase(entity.name);
    
    return `
import { Router } from 'express';
import { db } from '../db';
import { ${entityName}, insert${this.toPascalCase(entityName)}Schema } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { adminAuthMiddleware, requirePermission } from '../customAuth';

const router = Router();

// List all
router.get('/${routePath}', adminAuthMiddleware, requirePermission('${entityName}', 'view'), async (req, res) => {
  try {
    const items = await db.select().from(${entityName});
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching ${routePath}:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ${routePath}' });
  }
});

// Get by ID
router.get('/${routePath}/:id', adminAuthMiddleware, requirePermission('${entityName}', 'view'), async (req, res) => {
  try {
    const [item] = await db
      .select()
      .from(${entityName})
      .where(eq(${entityName}.id, req.params.id))
      .limit(1);
      
    if (!item) {
      return res.status(404).json({ success: false, error: '${entityName} not found' });
    }
    
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error fetching ${entityName}:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ${entityName}' });
  }
});

// Create
router.post('/${routePath}', adminAuthMiddleware, requirePermission('${entityName}', 'create'), async (req, res) => {
  try {
    const validatedData = insert${this.toPascalCase(entityName)}Schema.parse(req.body);
    const [newItem] = await db.insert(${entityName}).values(validatedData).returning();
    res.status(201).json({ success: true, data: newItem });
  } catch (error: any) {
    console.error('Error creating ${entityName}:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to create ${entityName}' });
  }
});

// Update
router.put('/${routePath}/:id', adminAuthMiddleware, requirePermission('${entityName}', 'edit'), async (req, res) => {
  try {
    const validatedData = insert${this.toPascalCase(entityName)}Schema.partial().parse(req.body);
    const [updatedItem] = await db
      .update(${entityName})
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(${entityName}.id, req.params.id))
      .returning();
      
    if (!updatedItem) {
      return res.status(404).json({ success: false, error: '${entityName} not found' });
    }
    
    res.json({ success: true, data: updatedItem });
  } catch (error: any) {
    console.error('Error updating ${entityName}:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to update ${entityName}' });
  }
});

// Delete
router.delete('/${routePath}/:id', adminAuthMiddleware, requirePermission('${entityName}', 'delete'), async (req, res) => {
  try {
    const [deletedItem] = await db
      .delete(${entityName})
      .where(eq(${entityName}.id, req.params.id))
      .returning();
      
    if (!deletedItem) {
      return res.status(404).json({ success: false, error: '${entityName} not found' });
    }
    
    res.json({ success: true, message: '${entityName} deleted successfully' });
  } catch (error) {
    console.error('Error deleting ${entityName}:', error);
    res.status(500).json({ success: false, error: 'Failed to delete ${entityName}' });
  }
});

export default router;
    `.trim();
  }
  
  private toKebabCase(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }
  
  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
```

---

## Step 3: AI Integration

### 3.1 Create Module Generation Endpoint

**Create**: `server/routes/builder.ts`

```typescript
import { Router } from 'express';
import { adminAuthMiddleware } from '../customAuth';
import { aiService } from '../services/aiService';
import { SchemaGenerator } from '../generators/schemaGenerator';
import { APIGenerator } from '../generators/apiGenerator';
import { UIGenerator } from '../generators/uiGenerator';

const router = Router();

// Generate module from natural language description
router.post('/admin/builder/generate-module', adminAuthMiddleware, async (req, res) => {
  try {
    const { description } = req.body;
    
    // Use AI to generate module structure
    const prompt = `
Generate a module structure for: "${description}"

Return JSON with this structure:
{
  "moduleName": "string",
  "entities": [
    {
      "name": "string",
      "fields": [
        {
          "name": "string",
          "type": "text|number|boolean|date|email|relation",
          "validation": {
            "required": boolean,
            "unique": boolean,
            "min": number,
            "max": number
          }
        }
      ]
    }
  ]
}
    `.trim();
    
    const response = await aiService.chat([
      { role: 'system', content: 'You are a database schema expert.' },
      { role: 'user', content: prompt },
    ], {
      model: 'gpt-4o',
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    
    const moduleStructure = JSON.parse(response.choices[0].message.content);
    
    // Generate code
    const schemaGen = new SchemaGenerator();
    const apiGen = new APIGenerator();
    const uiGen = new UIGenerator();
    
    const drizzleSchema = schemaGen.generateDrizzleSchema(moduleStructure.entities);
    const zodSchema = schemaGen.generateZodSchema(moduleStructure.entities);
    const apiRoutes = moduleStructure.entities.map(e => apiGen.generateCRUDRoutes(e));
    const uiComponents = moduleStructure.entities.map(e => uiGen.generateListComponent(e));
    
    res.json({
      success: true,
      module: {
        name: moduleStructure.moduleName,
        entities: moduleStructure.entities,
        code: {
          schema: drizzleSchema,
          validation: zodSchema,
          api: apiRoutes,
          ui: uiComponents,
        },
      },
    });
  } catch (error: any) {
    console.error('Error generating module:', error);
    res.status(500).json({ success: false, error: 'Failed to generate module' });
  }
});

export default router;
```

---

## Testing

### Test Module Builder

```typescript
describe('Module Builder', () => {
  it('should allow dragging entity to canvas', () => {
    render(<ModuleBuilderPage />);
    
    const entity = screen.getByTestId('draggable-entity');
    const canvas = screen.getByTestId('entity-canvas');
    
    fireEvent.dragStart(entity);
    fireEvent.drop(canvas);
    
    expect(screen.getByTestId(/entity-node-/)).toBeInTheDocument();
  });
  
  it('should generate module from AI description', async () => {
    render(<ModuleBuilderPage />);
    
    fireEvent.click(screen.getByText('AI Generate'));
    
    const input = screen.getByPlaceholderText('Describe your module...');
    fireEvent.change(input, {
      target: { value: 'Blog with posts and comments' }
    });
    
    fireEvent.click(screen.getByText('Generate'));
    
    await waitFor(() => {
      expect(screen.getByText('Post')).toBeInTheDocument();
      expect(screen.getByText('Comment')).toBeInTheDocument();
    });
  });
});
```

---

## Deployment Checklist

- [ ] Drag-drop functionality working
- [ ] Entity canvas implemented
- [ ] Properties panel functional
- [ ] AI generation working
- [ ] Schema generation complete
- [ ] API generation complete
- [ ] UI generation complete
- [ ] Code validation in place
- [ ] Safe deployment pipeline
- [ ] All tests passing

---

## References

- [PRD: Self-Service Platform](/en/prd/self-service-platform)
- [WytBuilder Architecture](/en/architecture/wytbuilder)
- [Code Generation](/en/architecture/code-generation)
