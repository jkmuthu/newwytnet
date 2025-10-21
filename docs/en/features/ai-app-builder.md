# AI App Builder

:::warning IMPLEMENTATION STATUS
**This feature is currently IN DEVELOPMENT and not yet available in production.**

What exists: AI-powered code generation capabilities integrated into Engine Admin
What's planned: Full end-to-end app deployment workflow described in this document

See "Current vs Planned Features" section below for details.
:::

## Overview

The **AI App Builder** is a planned OpenAI-powered tool that will enable Super Admins to create fully functional WytNet applications using natural language descriptions. The vision: describe what you want to build, and the AI generates the complete application code, database schema, API routes, and user interface.

**Planned Access**: Engine Admin → Apps → AI App Builder (Admin-only feature)

---

## Current vs Planned Features

### ✅ Currently Implemented
- OpenAI GPT-4o integration (API key configured)
- AI-powered code generation capabilities
- Basic prompt engineering for WytNet architecture

### 🔄 In Development
- User interface for describing apps
- Code review and editing workflow
- Database schema generation

### 📋 Planned (Not Yet Started)
- One-click deployment mechanism
- Iterative chat-based refinement
- Template library
- Visual preview before deployment
- Version control integration
- Automated testing generation

---

## Vision

Transform app development from weeks of coding to minutes of conversation. Enable non-technical stakeholders to prototype ideas instantly, and empower developers to jumpstart complex projects with AI-generated scaffolding.

---

## Core Capabilities

### 1. Natural Language to Code

**Input**: Plain English description of your app idea

**Example**:
```
"Create a task management app where users can create projects, 
add tasks with due dates and priorities, assign tasks to team 
members, and track completion status."
```

**Output**: Complete application including:
- Database schema (Drizzle ORM models)
- Backend API routes (Express.js)
- Frontend components (React + TypeScript)
- Styling (Tailwind CSS)
- Form validation (Zod schemas)

### 2. Full-Stack Generation

The AI App Builder generates production-ready code across the entire stack:

**Backend**:
- PostgreSQL database tables with proper relations
- RESTful API endpoints (CRUD operations)
- Input validation using Zod
- Session-based authentication
- Row Level Security for multi-tenancy

**Frontend**:
- React components with TypeScript
- Form handling with react-hook-form
- Data fetching with TanStack Query
- shadcn/ui component library
- Responsive design with Tailwind CSS

**Integration**:
- Wouter routing configuration
- API client setup
- State management
- Error handling

### 3. Intelligent Code Quality

The AI follows WytNet's architecture patterns and best practices:

**Type Safety**:
```typescript
// Generated database schema
export const tasks = pgTable('tasks', {
  id: varchar('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: varchar('project_id').references(() => projects.id),
  title: varchar('title', { length: 255 }).notNull(),
  dueDate: timestamp('due_date'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  status: varchar('status', { length: 20 }).default('pending'),
  tenantId: varchar('tenant_id').notNull()
});

// Generated insert schema
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
```

**Clean API Routes**:
```typescript
// Generated API endpoint
app.post('/api/tasks', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const result = insertTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  
  const task = await db.insert(tasks).values({
    ...result.data,
    tenantId: req.user.tenantId
  }).returning();
  
  res.json(task[0]);
});
```

**Modern React Components**:
```typescript
// Generated task form component
export function TaskForm() {
  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: '',
      priority: 'medium',
      status: 'pending'
    }
  });
  
  const createTask = useMutation({
    mutationFn: async (data: InsertTask) => 
      apiRequest('/api/tasks', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: 'Task created successfully' });
    }
  });
  
  return (
    <Form {...form}>
      {/* Form fields */}
    </Form>
  );
}
```

---

## How It Works (Planned Workflow)

:::tip PLANNED FEATURE
The workflow described below represents the intended user experience when fully implemented.
:::

### Step 1: Describe Your App

Navigate to **Engine Admin → Apps → AI App Builder** (when available) and describe your application in natural language.

**Tips for Better Results**:
- Be specific about features and functionality
- Mention data models and relationships
- Specify user roles and permissions if needed
- Include any special requirements (real-time updates, file uploads, etc.)

**Example Description**:
```
Build an event management system where:
- Users can create events with title, description, date, location
- Events can be public or private
- Users can RSVP to events (attending/maybe/not attending)
- Event creators can see attendee list
- Events should be searchable by date and location
- Include a calendar view of upcoming events
```

### Step 2: AI Generation

The AI analyzes your description and generates:

1. **Database Schema** (`shared/schema.ts`):
   - Tables and columns
   - Relationships and foreign keys
   - Indexes for performance
   - Multi-tenancy support

2. **API Routes** (`server/routes.ts`):
   - CRUD endpoints
   - Input validation
   - Authentication checks
   - Error handling

3. **Frontend Components** (`client/src/pages/`):
   - List views with filtering/sorting
   - Create/edit forms
   - Detail views
   - Delete confirmations

4. **Routing Configuration** (`client/src/App.tsx`):
   - Route definitions
   - Navigation menu
   - Protected routes

### Step 3: Review and Refine

The generated code is displayed with syntax highlighting. You can:

- **Review**: Check the code quality and structure
- **Edit**: Make manual adjustments if needed
- **Regenerate**: Provide additional instructions to improve
- **Accept**: Deploy the generated code to your platform

### Step 4: Deploy (Planned)

Once satisfied, the planned **"Deploy Application"** button will:

1. Create database tables via `npm run db:push`
2. Register API routes automatically
3. Compile frontend components
4. Make app live and accessible immediately

**Current Status**: Deployment automation is not yet implemented. Generated code can be manually integrated into the codebase.

---

## Technical Architecture

### AI Model

**Model**: OpenAI GPT-4o
**Why GPT-4o**:
- Superior code generation quality
- Strong understanding of TypeScript and React
- Excellent at following architectural patterns
- Can generate complex multi-file projects

### Prompt Engineering

The system uses carefully crafted prompts to ensure consistent, high-quality output:

**System Prompt** (excerpt):
```
You are an expert full-stack developer building applications for WytNet platform.

Architecture Requirements:
- Database: PostgreSQL with Drizzle ORM
- Backend: Express.js with TypeScript
- Frontend: React 18 with TypeScript, Vite, Tailwind CSS
- State: TanStack Query for server state, useState for local state
- Forms: react-hook-form with Zod validation
- UI: shadcn/ui component library
- Routing: wouter for client-side routing

Code Quality Standards:
- Type-safe: Use TypeScript strictly, no 'any' types
- Validated: All inputs validated with Zod schemas
- Secure: Multi-tenancy with Row Level Security
- Accessible: Proper ARIA labels and semantic HTML
- Responsive: Mobile-first design with Tailwind
- Testable: Clean separation of concerns

Multi-Tenancy:
- All tables must include tenant_id column
- All queries must filter by tenant_id
- Use req.user.tenantId from session

...
```

### Code Parsing and Injection

The generated response is parsed to extract distinct code blocks:

```typescript
interface GeneratedApp {
  schema: string;         // Database schema code
  routes: string;         // API routes code
  components: {
    [filename: string]: string;  // React component files
  };
  routing: string;        // Wouter route configuration
  readme: string;         // Documentation
}
```

Files are then injected into the appropriate locations:
- `shared/schema.ts` - Append schema definitions
- `server/routes.ts` - Append API routes
- `client/src/pages/` - Create component files
- `client/src/App.tsx` - Update routing

---

## Best Practices

### Writing Effective Descriptions

**Do**:
- ✅ Specify data models and their relationships
- ✅ Describe user workflows step-by-step
- ✅ Mention required validations (e.g., "email must be valid")
- ✅ Include permission requirements (e.g., "only admins can delete")
- ✅ Describe UI expectations (e.g., "show as cards, not table")

**Don't**:
- ❌ Use vague terms like "make it nice" or "modern design"
- ❌ Assume the AI knows your business domain (explain acronyms)
- ❌ Over-specify implementation details (let AI choose patterns)
- ❌ Request features outside WytNet's stack (e.g., "use Vue")

### Iterative Refinement

Start simple, then enhance:

**First Iteration**:
```
"Create a blog app with posts (title, content, author) 
and comments. Users can create posts and comment on others."
```

**Second Iteration** (after reviewing):
```
"Add tags to posts, allow filtering by tag, 
add publish/draft status, and show author profile on posts."
```

**Third Iteration**:
```
"Add rich text editor for post content,
image upload for post thumbnails,
and email notifications when someone comments."
```

### Code Review Checklist

Before deploying AI-generated code, verify:

- [ ] Database schema includes `tenant_id` for RLS
- [ ] All API routes check `req.isAuthenticated()`
- [ ] Input validation covers all edge cases
- [ ] Foreign key relationships are correct
- [ ] Forms have proper error handling
- [ ] Components follow shadcn/ui patterns
- [ ] Mobile responsiveness is adequate
- [ ] No hardcoded values (use env vars for config)

---

## Limitations

### Current Limitations

1. **Single-Context Generation**: Generates code in one pass, not iterative
2. **No Real-Time Features**: WebSocket/SSE not yet supported in prompts
3. **Limited File Uploads**: File handling requires manual implementation
4. **Basic Permissions**: Complex RBAC rules may need manual refinement
5. **No Testing Code**: Generated code lacks unit/integration tests

### Planned Enhancements

- **Iterative Refinement**: Chat-based improvements to generated apps
- **Visual Preview**: Live preview before deployment
- **Version Control**: Git integration for generated code
- **Template Library**: Pre-built patterns for common use cases
- **Test Generation**: Automatic unit and E2E tests

---

## Use Cases

### Rapid Prototyping

**Scenario**: Product manager wants to validate an idea with stakeholders

**Solution**: Describe the concept to AI App Builder, get a working prototype in 5 minutes, demo to team, gather feedback, iterate

**Time Saved**: Days/weeks → Minutes

### Admin Tools

**Scenario**: Need a quick admin interface for managing platform data

**Solution**: "Create an admin panel for viewing and editing user feedback submissions with filters and export"

**Benefit**: No need to hand-code repetitive CRUD interfaces

### Internal Tools

**Scenario**: Team needs a simple app for tracking vacation requests

**Solution**: "Build a vacation request app where employees submit requests with dates and reason, managers can approve/deny, and everyone sees a team calendar"

**Benefit**: Custom tools without dedicated dev time

### Learning and Exploration

**Scenario**: Developer wants to learn WytNet architecture patterns

**Solution**: Generate sample apps, study the code, understand best practices

**Benefit**: Hands-on learning with production-quality examples

---

## Security Considerations

### Access Control

- **Super Admin Only**: AI App Builder restricted to Engine Admin users
- **Permission**: Requires `ai_app_builder.use` permission
- **Audit Logging**: All generations logged with user ID and timestamp

### Generated Code Safety

- **Input Sanitization**: Generated code uses Zod validation by default
- **SQL Injection Prevention**: Drizzle ORM uses parameterized queries
- **XSS Protection**: React escapes user content automatically
- **CSRF Protection**: Session-based auth includes CSRF tokens

### API Cost Management

- **Rate Limiting**: 5 generations per hour per admin
- **Token Limits**: Max 4000 tokens per generation (prevents runaway costs)
- **Usage Tracking**: Monitor OpenAI API costs via analytics dashboard

---

## API Reference

### POST /api/ai-app-builder/generate

Generate application code from natural language description.

**Request Body**:
```typescript
{
  description: string,     // App description
  name: string,           // App name (for file naming)
  options?: {
    includeAuth?: boolean,    // Add auth logic (default: true)
    includeRBAC?: boolean,    // Add permission checks (default: false)
    mobileFirst?: boolean     // Optimize for mobile (default: true)
  }
}
```

**Response**:
```typescript
{
  success: boolean,
  app: {
    schema: string,
    routes: string,
    components: { [filename: string]: string },
    routing: string,
    readme: string
  },
  metadata: {
    tokensUsed: number,
    generationTime: number,  // milliseconds
    estimatedCost: number    // USD
  }
}
```

---

## Related Documentation

- [WytAI Agent](/en/features/wytai-agent)
- [Module & App Management](/en/features/module-app-management)
- [Database Schema](/en/architecture/database-schema)
- [Backend Architecture](/en/architecture/backend)
- [Frontend Architecture](/en/architecture/frontend)

---

## Environment Variables

```bash
# Required for AI App Builder
OPENAI_API_KEY=sk-...      # OpenAI API key

# Optional: Rate limiting
AI_BUILDER_RATE_LIMIT=5    # Generations per hour (default: 5)
AI_BUILDER_MAX_TOKENS=4000 # Max tokens per generation
```

---

## Troubleshooting

**Problem**: Generated code has type errors

**Solution**: Review the error messages, manually fix types, or regenerate with more specific description

---

**Problem**: Database migration fails

**Solution**: Check for conflicting table names, ensure schema is valid SQL, use `npm run db:push --force` if needed

---

**Problem**: "Rate limit exceeded"

**Solution**: Wait until next hour or ask Super Admin to increase `AI_BUILDER_RATE_LIMIT`

---

## Access Control

**Required Permission**: `ai_app_builder.use` (Super Admin only)

Only Engine Admin users with Super Admin role can access AI App Builder.
