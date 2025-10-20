# WytNet Implementation Guide for Replit Assistant

**Version:** 1.0  
**Last Updated:** October 20, 2025  
**Purpose:** Comprehensive step-by-step guide for implementing features in WytNet

---

## Table of Contents

1. [Project Structure Overview](#1-project-structure-overview)
2. [Database Setup & Migrations](#2-database-setup--migrations)
3. [Backend Implementation Patterns](#3-backend-implementation-patterns)
4. [Frontend Implementation Patterns](#4-frontend-implementation-patterns)
5. [Feature Implementation Checklist](#5-feature-implementation-checklist)
6. [Common Implementation Scenarios](#6-common-implementation-scenarios)
7. [Code Patterns Library](#7-code-patterns-library)
8. [Testing & Verification](#8-testing--verification)
9. [Deployment & Production](#9-deployment--production)
10. [Quick Reference Cards](#10-quick-reference-cards)

---

## 1. Project Structure Overview

### Complete Directory Tree

```
wytnet/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   │   ├── manifest.json           # PWA manifest
│   │   ├── sw.js                   # Service worker
│   │   └── icons/                  # App icons
│   │
│   └── src/
│       ├── main.tsx                # Entry point
│       ├── App.tsx                 # Root router & providers
│       ├── index.css               # Global styles
│       │
│       ├── components/             # Reusable components
│       │   ├── ui/                 # shadcn/ui components
│       │   │   ├── button.tsx
│       │   │   ├── dialog.tsx
│       │   │   ├── form.tsx
│       │   │   ├── input.tsx
│       │   │   ├── select.tsx
│       │   │   └── ...
│       │   │
│       │   ├── layout/             # Layout components
│       │   │   ├── header.tsx
│       │   │   ├── footer.tsx
│       │   │   └── sidebar.tsx
│       │   │
│       │   ├── admin/              # Admin components
│       │   ├── auth/               # Auth components
│       │   └── shared/             # Shared components
│       │
│       ├── pages/                  # Page components
│       │   ├── admin/              # Engine admin pages
│       │   ├── hub-admin/          # Hub admin pages
│       │   ├── account/            # User account pages
│       │   └── ...                 # Public pages
│       │
│       ├── portals/                # Portal routers
│       │   ├── admin/              # Engine admin portal
│       │   │   └── AdminRouter.tsx
│       │   ├── hub-admin/          # Hub admin portal
│       │   │   └── HubAdminRouter.tsx
│       │   ├── panel/              # User panel
│       │   │   └── PanelRouter.tsx
│       │   └── public/             # Public portal
│       │       └── PublicRouter.tsx
│       │
│       ├── contexts/               # React contexts
│       │   ├── AuthContext.tsx
│       │   ├── AdminAuthContext.tsx
│       │   └── HubAdminAuthContext.tsx
│       │
│       ├── hooks/                  # Custom hooks
│       │   ├── use-toast.ts
│       │   ├── use-mobile.tsx
│       │   └── useAuth.ts
│       │
│       └── lib/                    # Utilities & configs
│           ├── queryClient.ts      # TanStack Query config
│           ├── utils.ts            # General utilities
│           └── api.ts              # API helpers
│
├── server/                          # Backend Express application
│   ├── index.ts                    # Server entry point
│   ├── db.ts                       # Database connection
│   ├── storage.ts                  # Storage interface
│   ├── routes.ts                   # Main routes file
│   │
│   ├── routes/                     # Route modules
│   │   ├── roles.ts
│   │   ├── platform-hubs.ts
│   │   └── ...
│   │
│   ├── services/                   # Business logic
│   │   ├── aiService.ts
│   │   ├── razorpayService.ts
│   │   └── ...
│   │
│   ├── helpers/                    # Helper functions
│   │   ├── displayIdGenerator.ts
│   │   └── routeHelpers.ts
│   │
│   ├── constants/                  # Constants
│   │   └── permissions.ts
│   │
│   ├── wytpass-identity.ts         # WytPass unified auth
│   ├── wytpass-auth.ts             # OAuth integrations
│   ├── admin-auth.ts               # Engine admin auth
│   └── hub-admin-auth.ts           # Hub admin auth
│
├── shared/                          # Shared between client & server
│   └── schema.ts                   # Database schema & types
│
├── packages/                        # Internal packages
│   ├── appkit/
│   ├── builder/
│   ├── cms/
│   ├── hubkit/
│   ├── kernel/
│   └── wytid/
│
├── docs/                            # Documentation
│   ├── en/
│   │   ├── architecture/
│   │   ├── api/
│   │   ├── features/
│   │   └── implementation/         # You are here
│   └── ta/
│
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite config
├── tailwind.config.ts               # Tailwind config
├── drizzle.config.ts                # Drizzle config
└── replit.md                        # Project documentation

```

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **React Components** | PascalCase | `UserProfile.tsx` |
| **React Pages** | PascalCase or kebab-case | `AdminDashboard.tsx` or `admin-dashboard.tsx` |
| **Hooks** | camelCase with `use` prefix | `useAuth.ts`, `use-mobile.tsx` |
| **Utilities** | camelCase | `queryClient.ts`, `utils.ts` |
| **Services** | camelCase with Service suffix | `aiService.ts`, `razorpayService.ts` |
| **Routes** | kebab-case | `platform-hubs.ts`, `roles.ts` |
| **Types/Interfaces** | PascalCase | `User`, `InsertUser` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_BASE_URL` |

### Where to Place New Files

| File Type | Location | Example |
|-----------|----------|---------|
| **New Page (Public)** | `client/src/pages/` | `client/src/pages/about.tsx` |
| **New Page (Admin)** | `client/src/pages/admin/` | `client/src/pages/admin/users.tsx` |
| **New Page (Hub Admin)** | `client/src/pages/hub-admin/` | `client/src/pages/hub-admin/content.tsx` |
| **New Component** | `client/src/components/shared/` | `client/src/components/shared/DataTable.tsx` |
| **New UI Component** | `client/src/components/ui/` | `client/src/components/ui/data-table.tsx` |
| **New Hook** | `client/src/hooks/` | `client/src/hooks/usePermissions.ts` |
| **New API Route** | Add to `server/routes.ts` | In `registerRoutes()` function |
| **New Service** | `server/services/` | `server/services/emailService.ts` |
| **New Database Table** | `shared/schema.ts` | Add table definition |

---

## 2. Database Setup & Migrations

### 2.1 Understanding Drizzle ORM

WytNet uses **Drizzle ORM** for type-safe database operations with PostgreSQL.

**Key Benefits:**
- Full TypeScript type inference
- No need to write SQL manually
- Schema-first approach
- Automatic migrations with `db:push`

### 2.2 Adding a New Table

**Location:** `shared/schema.ts`

#### Step-by-Step Process

**Step 1:** Define the table schema

```typescript
// shared/schema.ts

import { pgTable, uuid, varchar, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

// Define your new table
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // TK00001
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default('pending'), // pending, in_progress, completed
  priority: varchar("priority", { length: 20 }).default('medium'), // low, medium, high
  
  // Foreign keys
  userId: varchar("user_id").notNull().references(() => users.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  // Soft delete
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deleteReason: text("delete_reason"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_tasks_display_id").on(table.displayId),
  index("idx_tasks_user_id").on(table.userId),
  index("idx_tasks_deleted_at").on(table.deletedAt),
]);
```

**Step 2:** Create insert and select schemas

```typescript
// shared/schema.ts (continued)

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Create insert schema (for validation)
export const insertTaskSchema = createInsertSchema(tasks, {
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
}).omit({
  id: true,
  displayId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  deletedBy: true,
  deleteReason: true,
});

// Create TypeScript types
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
```

**Step 3:** Add relations (if needed)

```typescript
// shared/schema.ts (continued)

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [tasks.tenantId],
    references: [tenants.id],
  }),
}));
```

**Step 4:** Create database sequence for Display ID (if needed)

```typescript
// server/scripts/create-sequences.sql

-- Create sequence for task display IDs
CREATE SEQUENCE IF NOT EXISTS tk_seq START 1;

-- Generate display ID
SELECT 'TK' || LPAD(nextval('tk_seq')::text, 5, '0');
-- Result: TK00001
```

### 2.3 Running Migrations

**Command:**

```bash
npm run db:push
```

**What it does:**
- Compares your schema in `shared/schema.ts` with the database
- Generates and applies necessary changes
- No manual SQL migration files needed

**If you get a data-loss warning:**

```bash
npm run db:push --force
```

⚠️ **Warning:** This will drop and recreate tables, losing data. Only use in development.

### 2.4 Complete Table Example

Here's a complete example of adding a "Projects" table:

```typescript
// shared/schema.ts

// ============================================================
// PROJECTS TABLE
// ============================================================

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // PR00001
  
  // Basic info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default('active'), // active, archived, completed
  
  // Settings
  settings: jsonb("settings").default({}),
  metadata: jsonb("metadata").default({}),
  
  // Ownership
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  // Soft delete
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deleteReason: text("delete_reason"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_projects_display_id").on(table.displayId),
  index("idx_projects_owner_id").on(table.ownerId),
  index("idx_projects_deleted_at").on(table.deletedAt),
]);

// Insert schema
export const insertProjectSchema = createInsertSchema(projects, {
  name: z.string().min(1, "Project name is required").max(255),
  description: z.string().optional(),
  status: z.enum(['active', 'archived', 'completed']).default('active'),
}).omit({
  id: true,
  displayId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  deletedBy: true,
  deleteReason: true,
});

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

// Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [projects.tenantId],
    references: [tenants.id],
  }),
  // Add other relations as needed
}));
```

---

## 3. Backend Implementation Patterns

### 3.1 Storage Interface Pattern

The storage interface (`server/storage.ts`) abstracts database operations.

#### Adding Storage Methods

**Location:** `server/storage.ts`

**Step 1:** Add method to `IStorage` interface

```typescript
// server/storage.ts

export interface IStorage {
  // ... existing methods ...
  
  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(data: InsertTask): Promise<Task>;
  updateTask(id: string, data: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  softDeleteTask(id: string, deletedBy: string, reason?: string): Promise<Task | undefined>;
}
```

**Step 2:** Implement methods in storage class

```typescript
// server/storage.ts (in the implementation class)

async getTasks(userId: string): Promise<Task[]> {
  return db.select()
    .from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      isNull(tasks.deletedAt)
    ))
    .orderBy(desc(tasks.createdAt));
}

async getTask(id: string): Promise<Task | undefined> {
  const result = await db.select()
    .from(tasks)
    .where(and(
      eq(tasks.id, id),
      isNull(tasks.deletedAt)
    ))
    .limit(1);
  
  return result[0];
}

async createTask(data: InsertTask): Promise<Task> {
  // Generate display ID
  const displayIdResult = await db.execute(
    sql`SELECT 'TK' || LPAD(nextval('tk_seq')::text, 5, '0') as display_id`
  );
  const displayId = displayIdResult.rows[0].display_id;
  
  const result = await db.insert(tasks)
    .values({
      ...data,
      displayId,
    })
    .returning();
  
  return result[0];
}

async updateTask(id: string, data: Partial<InsertTask>): Promise<Task | undefined> {
  const result = await db.update(tasks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id))
    .returning();
  
  return result[0];
}

async deleteTask(id: string): Promise<boolean> {
  const result = await db.delete(tasks)
    .where(eq(tasks.id, id));
  
  return result.rowCount > 0;
}

async softDeleteTask(id: string, deletedBy: string, reason?: string): Promise<Task | undefined> {
  const result = await db.update(tasks)
    .set({
      deletedAt: new Date(),
      deletedBy,
      deleteReason: reason,
    })
    .where(eq(tasks.id, id))
    .returning();
  
  return result[0];
}
```

### 3.2 Adding API Routes

**Location:** `server/routes.ts` (inside `registerRoutes` function)

#### Basic CRUD Routes Example

```typescript
// server/routes.ts

export async function registerRoutes(app: Express): Promise<void> {
  // ... existing setup ...
  
  // ============================================================
  // TASKS API ROUTES
  // ============================================================
  
  // GET /api/tasks - Get all tasks for current user
  app.get('/api/tasks', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
    try {
      const principal = getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const tasks = await storage.getTasks(principal.userId);
      return res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });
  
  // GET /api/tasks/:id - Get single task
  app.get('/api/tasks/:id', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
    try {
      const principal = getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const task = await storage.getTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      // Check ownership
      if (task.userId !== principal.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      return res.json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      return res.status(500).json({ message: 'Failed to fetch task' });
    }
  });
  
  // POST /api/tasks - Create new task
  app.post('/api/tasks', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
    try {
      const principal = getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Validate request body
      const validated = insertTaskSchema.parse(req.body);
      
      // Create task
      const task = await storage.createTask({
        ...validated,
        userId: principal.userId,
        tenantId: principal.tenantId,
      });
      
      return res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors,
        });
      }
      
      console.error('Error creating task:', error);
      return res.status(500).json({ message: 'Failed to create task' });
    }
  });
  
  // PATCH /api/tasks/:id - Update task
  app.patch('/api/tasks/:id', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
    try {
      const principal = getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check ownership
      const existing = await storage.getTask(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      if (existing.userId !== principal.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      // Validate partial update
      const validated = insertTaskSchema.partial().parse(req.body);
      
      // Update task
      const task = await storage.updateTask(req.params.id, validated);
      
      return res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors,
        });
      }
      
      console.error('Error updating task:', error);
      return res.status(500).json({ message: 'Failed to update task' });
    }
  });
  
  // DELETE /api/tasks/:id - Soft delete task
  app.delete('/api/tasks/:id', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
    try {
      const principal = getPrincipal(req);
      if (!principal) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check ownership
      const existing = await storage.getTask(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      if (existing.userId !== principal.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      // Soft delete
      await storage.softDeleteTask(
        req.params.id,
        principal.userId,
        req.body.reason || 'User deleted'
      );
      
      return res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ message: 'Failed to delete task' });
    }
  });
  
  // ... rest of routes ...
}
```

### 3.3 Authentication Middleware

**Available Middleware:**

| Middleware | Purpose | Usage |
|------------|---------|-------|
| `isAuthenticatedUnified` | Check if user is logged in (any auth method) | Public user routes |
| `requireSuperAdmin` | Check if user is super admin | Engine admin routes |
| `hubAdminAuthMiddleware` | Check if user is hub admin | Hub admin routes |
| `adminAuthMiddleware` | Legacy admin check | Legacy routes |

**Example with Permission Check:**

```typescript
// Require specific permission
app.post('/api/projects', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
  try {
    const principal = getPrincipal(req);
    if (!principal) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check permission
    const canCreate = await hasPermission(principal.userId, 'projects.create');
    if (!canCreate) {
      return res.status(403).json({ message: 'You do not have permission to create projects' });
    }
    
    // ... create project ...
  } catch (error) {
    // ... error handling ...
  }
});
```

### 3.4 Error Handling Pattern

**Standard error response format:**

```typescript
// Success response
return res.json({
  success: true,
  data: result,
  message: 'Operation successful',
});

// Error response
return res.status(400).json({
  success: false,
  message: 'Validation failed',
  errors: validationErrors,
});

// Validation error (Zod)
try {
  const validated = schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.errors,
    });
  }
}

// Database error
catch (error) {
  console.error('Database error:', error);
  return res.status(500).json({
    message: 'Internal server error',
  });
}
```

---

## 4. Frontend Implementation Patterns

### 4.1 Creating a New Page

#### Step 1: Create the page file

**Location:** `client/src/pages/` (or appropriate subdirectory)

```typescript
// client/src/pages/tasks.tsx

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import TaskForm from "@/components/shared/TaskForm";

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false);
  
  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });
  
  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest(`/api/tasks/${taskId}`, 'DELETE');
    },
    onSuccess: () => {
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });
  
  if (isLoading) {
    return <div>Loading tasks...</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <Button onClick={() => setShowForm(true)} data-testid="button-create-task">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>
      
      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
          }}
        />
      )}
      
      <div className="grid gap-4">
        {tasks?.map((task: any) => (
          <Card key={task.id} data-testid={`card-task-${task.id}`}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span data-testid={`text-task-title-${task.id}`}>{task.title}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(task.id)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-task-${task.id}`}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p data-testid={`text-task-description-${task.id}`}>{task.description}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-sm text-muted-foreground">
                  Status: {task.status}
                </span>
                <span className="text-sm text-muted-foreground">
                  Priority: {task.priority}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### Step 2: Register the route

**Location:** `client/src/App.tsx` or appropriate portal router

```typescript
// client/src/portals/panel/PanelRouter.tsx

import { Switch, Route } from "wouter";
import TasksPage from "@/pages/tasks";

export default function PanelRouter() {
  return (
    <Switch>
      {/* ... existing routes ... */}
      
      <Route path="/mypanel/tasks" component={TasksPage} />
      
      {/* ... other routes ... */}
    </Switch>
  );
}
```

### 4.2 TanStack Query Patterns

#### Query Pattern (GET requests)

```typescript
import { useQuery } from "@tanstack/react-query";

// Simple query
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/tasks'],
});

// Query with parameters
const { data: task } = useQuery({
  queryKey: ['/api/tasks', taskId],
  enabled: !!taskId, // Only run when taskId exists
});

// Query with custom error handling
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/projects'],
  retry: 3,
  retryDelay: 1000,
});

// Hierarchical query keys for cache invalidation
const { data: projectTasks } = useQuery({
  queryKey: ['/api/projects', projectId, 'tasks'],
});
```

#### Mutation Pattern (POST/PATCH/DELETE requests)

```typescript
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Create mutation
const createMutation = useMutation({
  mutationFn: async (data: InsertTask) => {
    const res = await apiRequest('/api/tasks', 'POST', data);
    return res.json();
  },
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    
    toast({
      title: "Success",
      description: "Task created successfully",
    });
  },
  onError: (error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  },
});

// Update mutation
const updateMutation = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTask> }) => {
    const res = await apiRequest(`/api/tasks/${id}`, 'PATCH', data);
    return res.json();
  },
  onSuccess: (_, variables) => {
    // Invalidate specific task and list
    queryClient.invalidateQueries({ queryKey: ['/api/tasks', variables.id] });
    queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
  },
});

// Delete mutation
const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    return apiRequest(`/api/tasks/${id}`, 'DELETE');
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
  },
});

// Using mutations
<Button
  onClick={() => createMutation.mutate(taskData)}
  disabled={createMutation.isPending}
>
  {createMutation.isPending ? 'Creating...' : 'Create Task'}
</Button>
```

#### Cache Invalidation Best Practices

```typescript
// Invalidate all tasks queries
queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });

// Invalidate specific task
queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId] });

// Invalidate hierarchical queries
queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });

// Update cache manually (optimistic update)
queryClient.setQueryData(['/api/tasks', taskId], (old: Task) => ({
  ...old,
  status: 'completed',
}));

// Refetch immediately
await queryClient.refetchQueries({ queryKey: ['/api/tasks'] });
```

### 4.3 Form Handling with React Hook Form + Zod

#### Complete Form Component Example

```typescript
// client/src/components/shared/TaskForm.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define form schema (extend from insertTaskSchema)
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: any; // Existing task for editing
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskForm({ task, onClose, onSuccess }: TaskFormProps) {
  const { toast } = useToast();
  
  // Initialize form with default values
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "pending",
      priority: task?.priority || "medium",
    },
  });
  
  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const url = task ? `/api/tasks/${task.id}` : '/api/tasks';
      const method = task ? 'PATCH' : 'POST';
      const res = await apiRequest(url, method, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: task ? "Task updated successfully" : "Task created successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submit handler
  const onSubmit = (data: TaskFormValues) => {
    mutation.mutate(data);
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update task details below' : 'Fill in the task details below'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task title"
                      {...field}
                      data-testid="input-task-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description"
                      {...field}
                      data-testid="input-task-description"
                    />
                  </FormControl>
                  <FormDescription>
                    Optional task description
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Status Field */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-task-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Priority Field */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-task-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                data-testid="button-submit"
              >
                {mutation.isPending ? 'Saving...' : task ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 4.4 Using shadcn/ui Components

**Import pattern:**

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
```

**Common components:**

| Component | Usage |
|-----------|-------|
| `Button` | Buttons with variants |
| `Card` | Card containers |
| `Dialog` | Modal dialogs |
| `Form` | Form wrapper |
| `Input` | Text inputs |
| `Select` | Dropdown selects |
| `Textarea` | Multi-line text |
| `Table` | Data tables |
| `Tabs` | Tab navigation |
| `Toast` | Notifications |

---

## 5. Feature Implementation Checklist

Use this checklist for implementing any new feature:

### ✅ Step 1: Define Data Model

**File:** `shared/schema.ts`

- [ ] Define table schema with pgTable
- [ ] Add indexes for performance
- [ ] Create insert schema with createInsertSchema
- [ ] Define TypeScript types (Select & Insert)
- [ ] Add relations if needed
- [ ] Create database sequence for display IDs (if needed)

### ✅ Step 2: Create Storage Interface Methods

**File:** `server/storage.ts`

- [ ] Add method signatures to `IStorage` interface
- [ ] Implement CRUD methods in storage class
- [ ] Add soft delete support (if needed)
- [ ] Add search/filter methods (if needed)
- [ ] Handle display ID generation

### ✅ Step 3: Implement API Routes

**File:** `server/routes.ts`

- [ ] Add GET routes for reading data
- [ ] Add POST routes for creating data
- [ ] Add PATCH routes for updating data
- [ ] Add DELETE routes for deleting data
- [ ] Add authentication middleware
- [ ] Add permission checks
- [ ] Add request validation with Zod
- [ ] Add error handling

### ✅ Step 4: Create Frontend Pages/Components

**Files:** `client/src/pages/` and `client/src/components/`

- [ ] Create page component
- [ ] Add TanStack Query for data fetching
- [ ] Add mutations for data changes
- [ ] Create form components (if needed)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add data-testid attributes
- [ ] Style with Tailwind CSS

### ✅ Step 5: Add Navigation/Routing

**File:** `client/src/App.tsx` or portal router

- [ ] Register route in appropriate router
- [ ] Add navigation link in sidebar/header
- [ ] Add breadcrumbs (if needed)
- [ ] Add protected route wrapper (if needed)

### ✅ Step 6: Test Functionality

- [ ] Run database migration (`npm run db:push`)
- [ ] Restart workflow
- [ ] Test API endpoints (curl/Postman)
- [ ] Test frontend UI
- [ ] Test form validation
- [ ] Test error handling
- [ ] Test permissions/authorization

---

## 6. Common Implementation Scenarios

### 6.1 Adding a Complete CRUD Feature

**Example: Blog Posts Feature**

#### Step 1: Database Schema

```typescript
// shared/schema.ts

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id", { length: 20 }).unique(), // BP00001
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  status: varchar("status", { length: 20 }).default('draft'), // draft, published, archived
  authorId: varchar("author_id").notNull().references(() => users.id),
  
  publishedAt: timestamp("published_at"),
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by"),
  deleteReason: text("delete_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_blog_posts_display_id").on(table.displayId),
  index("idx_blog_posts_author_id").on(table.authorId),
  index("idx_blog_posts_status").on(table.status),
  index("idx_blog_posts_deleted_at").on(table.deletedAt),
]);

export const insertBlogPostSchema = createInsertSchema(blogPosts, {
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
}).omit({
  id: true,
  displayId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  deletedBy: true,
  deleteReason: true,
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
```

#### Step 2: Storage Methods

```typescript
// server/storage.ts

export interface IStorage {
  // ... existing methods ...
  
  // Blog post operations
  getBlogPosts(filters?: { status?: string; authorId?: string }): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(data: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  publishBlogPost(id: string): Promise<BlogPost | undefined>;
  softDeleteBlogPost(id: string, deletedBy: string, reason?: string): Promise<BlogPost | undefined>;
}

// Implementation
async getBlogPosts(filters?: { status?: string; authorId?: string }): Promise<BlogPost[]> {
  const conditions = [isNull(blogPosts.deletedAt)];
  
  if (filters?.status) {
    conditions.push(eq(blogPosts.status, filters.status));
  }
  
  if (filters?.authorId) {
    conditions.push(eq(blogPosts.authorId, filters.authorId));
  }
  
  return db.select()
    .from(blogPosts)
    .where(and(...conditions))
    .orderBy(desc(blogPosts.createdAt));
}

async createBlogPost(data: InsertBlogPost): Promise<BlogPost> {
  const displayIdResult = await db.execute(
    sql`SELECT 'BP' || LPAD(nextval('bp_seq')::text, 5, '0') as display_id`
  );
  const displayId = displayIdResult.rows[0].display_id;
  
  const result = await db.insert(blogPosts)
    .values({
      ...data,
      displayId,
    })
    .returning();
  
  return result[0];
}

async publishBlogPost(id: string): Promise<BlogPost | undefined> {
  const result = await db.update(blogPosts)
    .set({
      status: 'published',
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id))
    .returning();
  
  return result[0];
}
```

#### Step 3: API Routes

```typescript
// server/routes.ts

// GET /api/blog-posts
app.get('/api/blog-posts', async (req, res) => {
  try {
    const { status, authorId } = req.query;
    
    const posts = await storage.getBlogPosts({
      status: status as string,
      authorId: authorId as string,
    });
    
    return res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
});

// GET /api/blog-posts/:slug
app.get('/api/blog-posts/:slug', async (req, res) => {
  try {
    const post = await storage.getBlogPostBySlug(req.params.slug);
    
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    return res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return res.status(500).json({ message: 'Failed to fetch blog post' });
  }
});

// POST /api/blog-posts
app.post('/api/blog-posts', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
  try {
    const principal = getPrincipal(req);
    if (!principal) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const validated = insertBlogPostSchema.parse(req.body);
    
    const post = await storage.createBlogPost({
      ...validated,
      authorId: principal.userId,
    });
    
    return res.status(201).json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Error creating blog post:', error);
    return res.status(500).json({ message: 'Failed to create blog post' });
  }
});

// PATCH /api/blog-posts/:id
app.patch('/api/blog-posts/:id', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
  try {
    const principal = getPrincipal(req);
    if (!principal) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const existing = await storage.getBlogPost(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    if (existing.authorId !== principal.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const validated = insertBlogPostSchema.partial().parse(req.body);
    const post = await storage.updateBlogPost(req.params.id, validated);
    
    return res.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Error updating blog post:', error);
    return res.status(500).json({ message: 'Failed to update blog post' });
  }
});

// POST /api/blog-posts/:id/publish
app.post('/api/blog-posts/:id/publish', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
  try {
    const principal = getPrincipal(req);
    if (!principal) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const existing = await storage.getBlogPost(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    if (existing.authorId !== principal.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const post = await storage.publishBlogPost(req.params.id);
    
    return res.json(post);
  } catch (error) {
    console.error('Error publishing blog post:', error);
    return res.status(500).json({ message: 'Failed to publish blog post' });
  }
});

// DELETE /api/blog-posts/:id
app.delete('/api/blog-posts/:id', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
  try {
    const principal = getPrincipal(req);
    if (!principal) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const existing = await storage.getBlogPost(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    if (existing.authorId !== principal.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    await storage.softDeleteBlogPost(
      req.params.id,
      principal.userId,
      req.body.reason || 'User deleted'
    );
    
    return res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return res.status(500).json({ message: 'Failed to delete blog post' });
  }
});
```

#### Step 4: Frontend Pages

```typescript
// client/src/pages/blog.tsx

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function BlogPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/blog-posts'],
  });
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Link href="/mypanel/blog/new">
          <Button data-testid="button-create-post">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-4">
        {posts?.map((post: any) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card className="hover:bg-accent cursor-pointer" data-testid={`card-post-${post.id}`}>
              <CardHeader>
                <CardTitle data-testid={`text-post-title-${post.id}`}>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground" data-testid={`text-post-excerpt-${post.id}`}>
                  {post.excerpt}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">
                    Status: {post.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// client/src/pages/blog-editor.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const blogPostSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  content: z.string().optional(),
  excerpt: z.string().optional(),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

export default function BlogEditorPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
    },
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: BlogPostFormValues) => {
      const res = await apiRequest('/api/blog-posts', 'POST', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      setLocation(`/blog/${data.slug}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: BlogPostFormValues) => {
    createMutation.mutate(data);
  };
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter post title"
                    {...field}
                    data-testid="input-post-title"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="enter-post-slug"
                    {...field}
                    data-testid="input-post-slug"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Short description..."
                    {...field}
                    data-testid="input-post-excerpt"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your post content..."
                    className="min-h-[300px]"
                    {...field}
                    data-testid="input-post-content"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              data-testid="button-submit"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Post'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/mypanel/blog')}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

#### Step 5: Register Routes

```typescript
// client/src/portals/panel/PanelRouter.tsx

import BlogPage from "@/pages/blog";
import BlogEditorPage from "@/pages/blog-editor";

export default function PanelRouter() {
  return (
    <Switch>
      {/* ... existing routes ... */}
      
      <Route path="/mypanel/blog" component={BlogPage} />
      <Route path="/mypanel/blog/new" component={BlogEditorPage} />
      
      {/* ... other routes ... */}
    </Switch>
  );
}
```

#### Step 6: Test

```bash
# Push database changes
npm run db:push

# Restart workflow (automatic after db:push)

# Test API
curl http://localhost:5000/api/blog-posts

# Test creating a post
curl -X POST http://localhost:5000/api/blog-posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "This is my first blog post",
    "excerpt": "A great first post"
  }'
```

### 6.2 Adding Authentication-Protected Routes

**Backend:**

```typescript
// server/routes.ts

// Protected route - requires authentication
app.get('/api/protected-data', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
  try {
    const principal = getPrincipal(req);
    if (!principal) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Access user info from principal
    const data = await storage.getUserData(principal.userId);
    
    return res.json(data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Super admin only route
app.post('/api/admin/settings', requireSuperAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const principal = getAdminPrincipal(req);
    if (!principal) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Only super admins can access this
    // ... implementation ...
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
```

**Frontend:**

```typescript
// client/src/components/admin/ProtectedAdminRoute.tsx

import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { data: admin, isLoading } = useQuery({
    queryKey: ['/api/admin/auth/session'],
  });
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!admin) {
    return <Redirect to="/engine/login" />;
  }
  
  return <>{children}</>;
}

// Usage in router
<Route path="/engine/settings">
  <ProtectedAdminRoute>
    <SettingsPage />
  </ProtectedAdminRoute>
</Route>
```

### 6.3 File Upload Handling

**Backend:**

```typescript
// server/routes.ts

import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

// Configure multer
const upload = multer({
  dest: 'uploads/temp',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Upload endpoint
app.post('/api/upload', isAuthenticatedUnified, upload.single('file'), async (req: AuthenticatedRequest, res) => {
  try {
    const principal = getPrincipal(req);
    if (!principal) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Process the file
    const fileData = await fs.readFile(req.file.path);
    const filename = `${Date.now()}-${req.file.originalname}`;
    const uploadPath = path.join('uploads', filename);
    
    await fs.writeFile(uploadPath, fileData);
    await fs.unlink(req.file.path); // Delete temp file
    
    // Save to database
    const media = await storage.createMedia({
      filename: filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${filename}`,
      userId: principal.userId,
    });
    
    return res.json(media);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Upload failed' });
  }
});
```

**Frontend:**

```typescript
// client/src/components/shared/FileUpload.tsx

import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useState } from "react";

export default function FileUpload() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      setFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      uploadMutation.mutate(file);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        data-testid="input-file-upload"
      />
      
      <Button
        type="submit"
        disabled={!file || uploadMutation.isPending}
        data-testid="button-upload"
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
      </Button>
    </form>
  );
}
```

---

## 7. Code Patterns Library

### 7.1 API Endpoint Pattern

**Copy-paste ready template:**

```typescript
// GET endpoint with authentication
app.get('/api/RESOURCE', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
  try {
    const principal = getPrincipal(req);
    if (!principal) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const data = await storage.getRESOURCE(principal.userId);
    return res.json(data);
  } catch (error) {
    console.error('Error fetching RESOURCE:', error);
    return res.status(500).json({ message: 'Failed to fetch RESOURCE' });
  }
});

// POST endpoint with validation
app.post('/api/RESOURCE', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
  try {
    const principal = getPrincipal(req);
    if (!principal) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const validated = insertRESOURCESchema.parse(req.body);
    
    const data = await storage.createRESOURCE({
      ...validated,
      userId: principal.userId,
    });
    
    return res.status(201).json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Error creating RESOURCE:', error);
    return res.status(500).json({ message: 'Failed to create RESOURCE' });
  }
});

// PATCH endpoint with ownership check
app.patch('/api/RESOURCE/:id', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
  try {
    const principal = getPrincipal(req);
    if (!principal) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const existing = await storage.getRESOURCE(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'RESOURCE not found' });
    }
    
    if (existing.userId !== principal.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const validated = insertRESOURCESchema.partial().parse(req.body);
    const data = await storage.updateRESOURCE(req.params.id, validated);
    
    return res.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Error updating RESOURCE:', error);
    return res.status(500).json({ message: 'Failed to update RESOURCE' });
  }
});

// DELETE endpoint with soft delete
app.delete('/api/RESOURCE/:id', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
  try {
    const principal = getPrincipal(req);
    if (!principal) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const existing = await storage.getRESOURCE(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'RESOURCE not found' });
    }
    
    if (existing.userId !== principal.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    await storage.softDeleteRESOURCE(
      req.params.id,
      principal.userId,
      req.body.reason || 'User deleted'
    );
    
    return res.json({ message: 'RESOURCE deleted successfully' });
  } catch (error) {
    console.error('Error deleting RESOURCE:', error);
    return res.status(500).json({ message: 'Failed to delete RESOURCE' });
  }
});
```

### 7.2 TanStack Query Pattern

**Copy-paste ready template:**

```typescript
// Query (GET)
const { data: RESOURCE, isLoading, error } = useQuery({
  queryKey: ['/api/RESOURCE'],
});

// Query with ID
const { data: RESOURCE } = useQuery({
  queryKey: ['/api/RESOURCE', id],
  enabled: !!id,
});

// Create Mutation (POST)
const createMutation = useMutation({
  mutationFn: async (data: InsertRESOURCE) => {
    const res = await apiRequest('/api/RESOURCE', 'POST', data);
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/RESOURCE'] });
    toast({ title: "Success", description: "RESOURCE created" });
  },
  onError: (error: Error) => {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  },
});

// Update Mutation (PATCH)
const updateMutation = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: Partial<InsertRESOURCE> }) => {
    const res = await apiRequest(`/api/RESOURCE/${id}`, 'PATCH', data);
    return res.json();
  },
  onSuccess: (_, variables) => {
    queryClient.invalidateQueries({ queryKey: ['/api/RESOURCE', variables.id] });
    queryClient.invalidateQueries({ queryKey: ['/api/RESOURCE'] });
    toast({ title: "Success", description: "RESOURCE updated" });
  },
  onError: (error: Error) => {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  },
});

// Delete Mutation (DELETE)
const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    return apiRequest(`/api/RESOURCE/${id}`, 'DELETE');
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/RESOURCE'] });
    toast({ title: "Success", description: "RESOURCE deleted" });
  },
  onError: (error: Error) => {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  },
});

// Usage
createMutation.mutate(formData);
updateMutation.mutate({ id: '123', data: formData });
deleteMutation.mutate('123');
```

### 7.3 Form Component Pattern

**Copy-paste ready template:**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // Add more fields...
});

type FormValues = z.infer<typeof formSchema>;

interface RESOURCEFormProps {
  item?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RESOURCEForm({ item, onClose, onSuccess }: RESOURCEFormProps) {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || "",
      // Add more defaults...
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const url = item ? `/api/RESOURCE/${item.id}` : '/api/RESOURCE';
      const method = item ? 'PATCH' : 'POST';
      const res = await apiRequest(url, method, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: item ? "Updated successfully" : "Created successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit' : 'Create'} RESOURCE</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name"
                      {...field}
                      data-testid="input-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Add more fields... */}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                data-testid="button-submit"
              >
                {mutation.isPending ? 'Saving...' : item ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 7.4 Protected Route Pattern

**Copy-paste ready template:**

```typescript
// client/src/components/auth/ProtectedRoute.tsx

import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, redirectTo = "/login" }: ProtectedRouteProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to={redirectTo} />;
  }
  
  return <>{children}</>;
}

// Usage
<Route path="/dashboard">
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
</Route>
```

### 7.5 Permission Check Pattern

**Backend:**

```typescript
// Helper function
async function checkPermission(userId: string, permission: string): Promise<boolean> {
  const userPerms = await storage.getUserPermissions(userId);
  return userPerms.includes(permission);
}

// Usage in route
app.post('/api/projects', isAuthenticatedUnified, async (req: AuthenticatedRequest, res) => {
  try {
    const principal = getPrincipal(req);
    if (!principal) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const canCreate = await checkPermission(principal.userId, 'projects.create');
    if (!canCreate) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    // ... implementation ...
  } catch (error) {
    // ... error handling ...
  }
});
```

**Frontend:**

```typescript
// Custom hook
function usePermission(permission: string) {
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
  });
  
  const { data: permissions } = useQuery({
    queryKey: ['/api/permissions', user?.id],
    enabled: !!user,
  });
  
  return permissions?.includes(permission) || false;
}

// Usage in component
export default function ProjectsPage() {
  const canCreate = usePermission('projects.create');
  
  return (
    <div>
      {canCreate && (
        <Button onClick={handleCreate}>Create Project</Button>
      )}
    </div>
  );
}
```

---

## 8. Testing & Verification

### 8.1 Testing Backend APIs

**Using curl:**

```bash
# GET request
curl http://localhost:5000/api/tasks

# POST request
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task",
    "status": "pending",
    "priority": "medium"
  }'

# PATCH request
curl -X PATCH http://localhost:5000/api/tasks/123 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'

# DELETE request
curl -X DELETE http://localhost:5000/api/tasks/123

# With authentication (if using session cookies)
curl http://localhost:5000/api/tasks \
  -H "Cookie: wytpass.sid=<session-id>"
```

**Using Postman:**

1. Create a collection for WytNet API
2. Add requests for each endpoint
3. Set base URL to `http://localhost:5000`
4. Add authentication if needed

### 8.2 Testing Frontend Features

**Manual testing checklist:**

- [ ] Page loads without errors
- [ ] Data fetches correctly
- [ ] Forms submit successfully
- [ ] Validation works as expected
- [ ] Loading states display
- [ ] Error messages appear
- [ ] Navigation works
- [ ] Responsive on mobile
- [ ] Dark mode works (if applicable)

**Browser console checks:**

```javascript
// Check React Query cache
window.queryClient.getQueryData(['/api/tasks'])

// Check user session
fetch('/api/auth/user', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)

// Check localStorage
localStorage.getItem('theme')
```

### 8.3 Common Issues & Debugging

**Issue: "Cannot read properties of null (reading 'useRef')"**

This error in the console indicates a React hook usage issue. It's often related to multiple React instances.

**Solution:** Check that you're not importing React explicitly (Vite handles it automatically).

```typescript
// ❌ Wrong - Don't do this
import React from 'react';

// ✅ Correct - Let Vite handle it
// No React import needed
```

---

**Issue: Form not submitting**

**Solution:** Check form errors:

```typescript
// Add to your form component
console.log('Form errors:', form.formState.errors);

// Check if form is valid
console.log('Form is valid:', form.formState.isValid);
```

---

**Issue: Query not refetching after mutation**

**Solution:** Ensure you're invalidating the correct query key:

```typescript
// ❌ Wrong - String key
queryClient.invalidateQueries({ queryKey: [`/api/tasks/${id}`] });

// ✅ Correct - Array key
queryClient.invalidateQueries({ queryKey: ['/api/tasks', id] });
queryClient.invalidateQueries({ queryKey: ['/api/tasks'] }); // Invalidate list too
```

---

**Issue: 401 Unauthorized on API calls**

**Solution:** Ensure credentials are included:

```typescript
// Already configured in queryClient.ts
fetch(url, {
  credentials: 'include', // This is critical
});
```

---

**Issue: Database table doesn't exist**

**Solution:** Run database migration:

```bash
npm run db:push
```

If that doesn't work:

```bash
npm run db:push --force
```

### 8.4 Workflow Restart Procedures

**When to restart workflow:**

- After database schema changes
- After adding new environment variables
- After installing new packages
- After modifying server code
- Workflow crashes

**How to restart:**

The workflow automatically restarts when files change. If you need to manually restart:

1. Stop the workflow (if running)
2. Click "Start application" in the workflow panel
3. Wait for server to start (look for "serving on port 5000")

**Check workflow status:**

```bash
# Look for these log messages
12:19:23 PM [express] serving on port 5000
```

---

## 9. Deployment & Production

### 9.1 Environment Variables

**Required environment variables:**

```bash
# Database
DATABASE_URL=postgresql://...

# Session
SESSION_SECRET=your-secret-key-here

# OAuth (Optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...

# API Keys (Optional)
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
OPENAI_API_KEY=...

# Frontend (prefix with VITE_)
VITE_API_BASE_URL=https://wytnet.com
```

**Setting in Replit:**

1. Go to Tools > Secrets
2. Add each variable as a secret
3. Restart workflow

### 9.2 Database Migration in Production

**⚠️ Warning:** Always backup before running migrations in production.

**Steps:**

1. Create database backup
2. Test migration in staging
3. Run migration: `npm run db:push`
4. Verify data integrity
5. Monitor for errors

**Rollback plan:**

If migration fails, restore from backup:

```sql
-- Restore from backup (example)
psql $DATABASE_URL < backup.sql
```

### 9.3 Build Process

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

**Build output:**

- Frontend: `dist/`
- Backend: Compiled TypeScript

### 9.4 Publishing Checklist

Before publishing to production:

- [ ] All tests pass
- [ ] Database migrations tested
- [ ] Environment variables set
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] SEO tags added (if public page)
- [ ] Security audit done
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Backup created
- [ ] Monitoring setup

---

## 10. Quick Reference Cards

### 10.1 Most Common Commands

```bash
# Database
npm run db:push              # Push schema changes to database
npm run db:push --force      # Force push (data loss)
npm run db:studio            # Open Drizzle Studio (DB GUI)

# Development
npm run dev                  # Start development server
npm run build                # Build for production
npm start                    # Start production server

# Package Management
npm install <package>        # Install package
npm uninstall <package>      # Remove package

# Git
git status                   # Check status
git add .                    # Stage all changes
git commit -m "message"      # Commit changes
```

### 10.2 File Locations Quick Reference

| Need | File Path |
|------|-----------|
| Add database table | `shared/schema.ts` |
| Add API route | `server/routes.ts` |
| Add storage method | `server/storage.ts` |
| Add service | `server/services/yourService.ts` |
| Add public page | `client/src/pages/your-page.tsx` |
| Add admin page | `client/src/pages/admin/your-page.tsx` |
| Add component | `client/src/components/shared/YourComponent.tsx` |
| Add UI component | `client/src/components/ui/your-component.tsx` |
| Add hook | `client/src/hooks/useYourHook.ts` |
| Add context | `client/src/contexts/YourContext.tsx` |
| Register route | `client/src/App.tsx` or portal router |
| Global styles | `client/src/index.css` |
| Environment vars | Replit Secrets |

### 10.3 Import Path Aliases

```typescript
// Frontend aliases
import { Button } from "@/components/ui/button";           // UI components
import { useAuth } from "@/hooks/useAuth";                 // Hooks
import { queryClient } from "@/lib/queryClient";           // Lib/utils
import type { User } from "@shared/schema";                 // Shared types

// Backend aliases
import { storage } from "./storage";                        // Storage
import { db } from "./db";                                  // Database
import type { User } from "@shared/schema";                 // Shared types
```

### 10.4 Environment Variable Names

```bash
# Database
DATABASE_URL

# Session
SESSION_SECRET

# OAuth
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
FACEBOOK_CLIENT_ID
FACEBOOK_CLIENT_SECRET

# Payment Gateways
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
STRIPE_SECRET_KEY

# AI Services
OPENAI_API_KEY
ANTHROPIC_API_KEY
GOOGLE_AI_API_KEY

# Email/SMS
MSG91_AUTH_KEY
SENDGRID_API_KEY

# Storage
GOOGLE_CLOUD_STORAGE_BUCKET

# Frontend (Vite)
VITE_API_BASE_URL
VITE_APP_NAME
```

### 10.5 HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 500 | Internal Server Error | Server error |

### 10.6 Common Zod Patterns

```typescript
import { z } from "zod";

// String validations
z.string()
z.string().min(1, "Required")
z.string().max(255)
z.string().email("Invalid email")
z.string().url("Invalid URL")
z.string().regex(/^[a-z]+$/, "Lowercase only")
z.string().optional()
z.string().nullable()

// Number validations
z.number()
z.number().int()
z.number().positive()
z.number().min(0)
z.number().max(100)

// Enum
z.enum(['option1', 'option2', 'option3'])

// Boolean
z.boolean()

// Date
z.date()
z.string().datetime()

// Objects
z.object({
  name: z.string(),
  age: z.number(),
})

// Arrays
z.array(z.string())
z.array(z.object({ id: z.string() }))

// Optional fields
z.object({
  name: z.string(),
  age: z.number().optional(),
})

// Default values
z.string().default("default value")

// Transform
z.string().transform((val) => val.toLowerCase())

// Refine (custom validation)
z.string().refine((val) => val.length > 5, {
  message: "Must be longer than 5 characters",
})

// Union
z.union([z.string(), z.number()])

// Intersection
z.intersection(schema1, schema2)

// Extend
baseSchema.extend({
  newField: z.string(),
})

// Partial
schema.partial() // All fields optional

// Omit
schema.omit({ fieldToRemove: true })

// Pick
schema.pick({ fieldToKeep: true })
```

---

## Conclusion

This guide provides comprehensive, step-by-step instructions for implementing features in WytNet. Every pattern is copy-paste ready and includes complete examples.

**Remember:**

1. **Always start with the database schema** in `shared/schema.ts`
2. **Add storage methods** in `server/storage.ts`
3. **Create API routes** in `server/routes.ts`
4. **Build frontend components** in `client/src/`
5. **Test thoroughly** before deploying

**Need help?** Refer to:
- Database schema: `docs/en/architecture/database-schema.md`
- Frontend architecture: `docs/en/architecture/frontend.md`
- Backend architecture: `docs/en/architecture/backend.md`
- API reference: `docs/en/api/`

---

**Version History:**

- v1.0 (October 20, 2025) - Initial comprehensive guide

**Maintained by:** WytNet Engineering Team
