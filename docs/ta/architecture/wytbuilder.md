---
requiredLevel: developer
---

# WytBuilder System கட்டமைப்பு

**பதிப்பு**: 1.0  
**கடைசி புதுப்பிப்பு**: அக்டோபர் 2025  
**நிலை**: வடிவமைப்பு கட்டம்

---

## மேலோட்டம்

**WytBuilder** என்பது visual drag-drop interfaces மற்றும் AI-powered இயற்கை மொழி உருவாக்கம் மூலம் Super Admins முழுமையான அம்சங்களை (modules, apps, pages, hubs) உருவாக்க செயல்படுத்தும் ஒரு விரிவான no-code தளமாகும்.

### முக்கிய கொள்கைகள்

1. **Zero-Code உருவாக்கல்**: Code எழுதாமல் முழுமையான அம்சங்களை உருவாக்குதல்
2. **AI-First**: இயற்கை மொழியிலிருந்து production-ready அம்சங்களாக
3. **Visual Development**: அனைத்து components-க்கும் drag-drop interface
4. **Production-Ready**: உருவாக்கப்பட்ட code தர தரநிலைகளை பூர்த்தி செய்கிறது
5. **Instant Deployment**: Validation உடன் live மாற்றங்கள்

---

## System கட்டமைப்பு

### உயர்-நிலை கட்டமைப்பு

**User Interface Layer**:
- Builder UI
- Visual Canvas
- Properties Panel
- Live Preview

**Builder Components**:
- Module Builder
- App Builder
- Page Builder
- Hub Builder

**AI Generation Layer**:
- NLP Parser
- Intent Recognition
- AI Generator
- Prompt Engine

**Code Generation Engine**:
- Schema Generator
- API Generator
- UI Component Generator
- Code Validator

**Deployment Layer**:
- DB Migration
- File System
- Code Bundler
- Deployment Engine

---

## Module Builder கட்டமைப்பு

### Entity-Relationship Model

```typescript
interface Entity {
  id: string;
  name: string;
  displayName: string;
  fields: Field[];
  relationships: Relationship[];
  permissions: EntityPermissions;
}

interface Field {
  id: string;
  name: string;
  type: FieldType;
  validation: ValidationRules;
  isRequired: boolean;
  isUnique: boolean;
}

type FieldType = 
  | 'text' | 'number' | 'boolean' | 'date' 
  | 'email' | 'url' | 'file' | 'relation';
```

### Drag-Drop செயல்படுத்தல்

**தொழில்நுட்பம்**: `@dnd-kit/core`

**Component Palette** (Draggable Source):
- Entities templates
- Fields templates
- Relationships templates
- Actions templates

**Canvas** (Drop Zone):
- Entity nodes
- Relationship connectors
- Visual layout
- Real-time updates

### Schema Generation Pipeline

**Input**: Visual entity model  
**Output**: Drizzle ORM schema + Zod validation

```typescript
class SchemaGenerator {
  generateDrizzleSchema(entities: Entity[]): string
  generateZodSchema(entities: Entity[]): string
}
```

### API Generation Pipeline

**Input**: Entity model  
**Output**: Express.js CRUD routes

உருவாக்கப்பட்ட endpoints:
- GET /entity - அனைத்தையும் பட்டியலிடு
- GET /entity/:id - ID-ஆல் பெறு
- POST /entity - புதியது உருவாக்கு
- PUT /entity/:id - புதுப்பி
- DELETE /entity/:id - நீக்கு

---

## App Builder கட்டமைப்பு

### App Composition Model

```typescript
interface App {
  id: string;
  name: string;
  modules: ModuleReference[];
  pages: Page[];
  navigation: NavigationConfig;
  workflows: Workflow[];
  pricing: PricingConfig;
}
```

### Module Integration System

**Module Adapter Pattern**:
- Routes adaptation
- Navigation integration
- Permissions merging
- Data integration setup

---

## Page Builder கட்டமைப்பு

### Component System

**Component Library**: 50+ pre-built components

**வகைகள்**:
1. **Layout**: Container, Grid, Flex, Stack
2. **Typography**: Heading, Text, Code
3. **Forms**: Input, Select, Checkbox, Radio
4. **Data Display**: Table, Card, List
5. **Media**: Image, Video, Icon
6. **Navigation**: Link, Button, Menu

### Layout Engine

**Responsive Grid System**:
- Desktop layout
- Tablet layout
- Mobile layout
- Automatic breakpoints

---

## Hub Builder கட்டமைப்பு

### Multi-Domain Routing

```typescript
interface HubDomainConfig {
  primaryDomain: string;
  customDomains: CustomDomain[];
  aliases: string[];
}
```

### Hub Isolation

**Tenant Isolation**:
- Hub context middleware
- Domain-based routing
- Isolated configurations
- Theme separation

---

## Code Validation System

### Multi-Layer Validation

```typescript
class CodeValidator {
  validateSyntax(code): ValidationResult
  validateTypes(code): ValidationResult
  validateSecurity(code): ValidationResult
  validatePerformance(code): ValidationResult
}
```

**Validation Layers**:
1. Syntax checking (ESLint)
2. Type checking (TypeScript)
3. Security scanning
4. Performance analysis

---

## Deployment System

### Safe Deployment Pipeline

1. **Backup** current state
2. **Validate** code
3. **Run** database migrations
4. **Write** files
5. **Update** configuration
6. **Restart** services
7. **Verify** deployment
8. **Rollback** on errors

---

## Performance Optimization

### Code Splitting

```typescript
// Lazy load builder components
const ModuleBuilder = lazy(() => import('./builders/ModuleBuilder'));
const AppBuilder = lazy(() => import('./builders/AppBuilder'));
```

### Caching Strategy

- Template caching
- Component metadata caching
- AI response caching
- Validation result caching

---

## Security Considerations

### Code Execution Sandbox

```typescript
class SandboxExecutor {
  async execute(code: string, timeout: number): Promise<any>
}
```

**Whitelist approach**:
- Safe APIs only
- Timeout enforcement
- Resource limits
- Error isolation

### Permission Enforcement

அனைத்து உருவாக்கப்பட்ட API routes-லும் permission checks சேர்க்கப்பட்டுள்ளது.

---

## தொழில்நுட்ப Stack

### Frontend
- React 18 - UI framework
- TypeScript - Type safety
- @dnd-kit/core - Drag-drop
- Monaco Editor - Code editing
- React Flow - Visual graphs

### Backend
- Node.js - Runtime
- Express.js - Web framework
- Drizzle ORM - Database ORM
- TypeScript Compiler API - Code generation

### AI Integration
- OpenAI GPT-4o - Code generation
- Claude 3.5 Sonnet - Complex logic
- Custom prompts - Domain-specific generation

---

## எதிர்கால மேம்பாடுகள்

### Phase 4 சாத்தியங்கள்

1. **Version Control Integration**:
   - Git integration
   - Branch-based development
   - Pull request workflow

2. **Collaborative Building**:
   - Real-time collaboration
   - Shared sessions
   - Comments & reviews

3. **Marketplace**:
   - Custom modules sharing
   - Template marketplace
   - Community components

4. **Advanced AI**:
   - Voice commands
   - Screen mockup to code
   - Natural language debugging

---

## குறிப்புகள்

- [PRD: சுய-சேவை தளம்](/ta/prd/self-service-platform)
- [Module System](/ta/core-concepts)
- [RBAC கட்டமைப்பு](/ta/architecture/rbac)
- [Database Schema](/ta/architecture/database-schema)
