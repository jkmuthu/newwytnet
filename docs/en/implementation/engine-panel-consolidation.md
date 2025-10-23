---
requiredLevel: developer
---

# Implementation Guide: Engine Panel Consolidation

**Phase**: 1 of 3  
**Timeline**: 1-2 weeks  
**Status**: Implementation Ready

---

## Overview

This guide provides step-by-step instructions for consolidating and standardizing the WytNet Engine Admin Panel. The goal is to create a solid foundation for the Self-Service Platform by organizing navigation, standardizing CRUD patterns, and optimizing performance.

---

## Prerequisites

- Access to WytNet codebase
- Understanding of React 18, TypeScript, Express.js
- Familiarity with Drizzle ORM and TanStack Query
- Node.js 20+ installed

---

## Step 1: Navigation Restructuring

### 1.1 Update Sidebar Navigation

**File**: `client/src/components/layout/sidebar.tsx`

Replace the existing `getMenuItems` function with the new structure:

```typescript
const getMenuItems = () => {
  if (isSuperAdmin) {
    return [
      {
        section: "📊 Dashboard & Overview",
        items: [
          { label: "Platform Dashboard", icon: "tachometer-alt", href: "/engine/dashboard", active: location === "/engine/dashboard" },
          { label: "System Health", icon: "heartbeat", href: "/engine/system-health", active: location === "/engine/system-health" },
          { label: "Real-time Analytics", icon: "chart-line", href: "/engine/analytics-realtime", active: location === "/engine/analytics-realtime" },
          { label: "Quick Actions", icon: "bolt", href: "/engine/quick-actions", active: location === "/engine/quick-actions" },
        ]
      },
      {
        section: "🏗️ Platform Management",
        items: [
          { label: "Tenants & Organizations", icon: "building", href: "/engine/tenants", active: location === "/engine/tenants" },
          { label: "User Management", icon: "users", href: "/engine/users", active: location === "/engine/users" },
          { label: "WytPass Authentication", icon: "id-badge", href: "/engine/wytpass", active: location === "/engine/wytpass" },
          { label: "Roles & Permissions", icon: "shield-alt", href: "/engine/roles", active: location === "/engine/roles" },
          { label: "Hubs Management", icon: "network-wired", href: "/engine/hubs", active: location === "/engine/hubs" },
        ]
      },
      {
        section: "🔨 Content & Builders",
        items: [
          { label: "Module Builder", icon: "cubes", href: "/engine/modules", active: location === "/engine/modules" },
          { label: "App Builder", icon: "mobile-alt", href: "/engine/apps", active: location === "/engine/apps" },
          { label: "CMS Builder", icon: "edit", href: "/engine/cms", active: location === "/engine/cms" },
          { label: "Page Builder", icon: "file-alt", href: "/engine/pages", active: location === "/engine/pages" },
          { label: "Hub Builder", icon: "sitemap", href: "/engine/hub-builder", active: location === "/engine/hub-builder" },
          { label: "DataSets Management", icon: "database", href: "/engine/datasets", active: location === "/engine/datasets" },
        ]
      },
      {
        section: "💰 Business & Commerce",
        items: [
          { label: "Pricing Plans", icon: "tag", href: "/engine/plans", active: location === "/engine/plans" },
          { label: "Subscriptions", icon: "calendar-check", href: "/engine/subscriptions", active: location === "/engine/subscriptions" },
          { label: "Payment Methods", icon: "credit-card", href: "/engine/payments", active: location === "/engine/payments" },
          { label: "Revenue Analytics", icon: "chart-bar", href: "/engine/revenue", active: location === "/engine/revenue" },
          { label: "WytPoints Management", icon: "coins", href: "/engine/wytpoints", active: location === "/engine/wytpoints" },
        ]
      },
      {
        section: "🎨 Design & Themes",
        items: [
          { label: "Theme Manager", icon: "palette", href: "/engine/themes", active: location === "/engine/themes" },
          { label: "Branding Settings", icon: "paint-brush", href: "/engine/branding", active: location === "/engine/branding" },
          { label: "Media Library", icon: "images", href: "/engine/media", active: location === "/engine/media" },
          { label: "UI Customization", icon: "sliders-h", href: "/engine/ui-customization", active: location === "/engine/ui-customization" },
        ]
      },
      {
        section: "🔌 Integrations & APIs",
        items: [
          { label: "Third-party Integrations", icon: "plug", href: "/engine/integrations", active: location === "/engine/integrations" },
          { label: "API Management", icon: "code", href: "/engine/api-management", active: location === "/engine/api-management" },
          { label: "Webhooks", icon: "exchange-alt", href: "/engine/webhooks", active: location === "/engine/webhooks" },
          { label: "Custom Connectors", icon: "link", href: "/engine/connectors", active: location === "/engine/connectors" },
        ]
      },
      {
        section: "🤖 AI & Automation",
        items: [
          { label: "WytAI Agent", icon: "robot", href: "/engine/wytai", active: location === "/engine/wytai" },
          { label: "AI Models Configuration", icon: "brain", href: "/engine/ai-config", active: location === "/engine/ai-config" },
          { label: "Automation Rules", icon: "tasks", href: "/engine/automation", active: location === "/engine/automation" },
          { label: "Workflow Builder", icon: "project-diagram", href: "/engine/workflows", active: location === "/engine/workflows" },
        ]
      },
      {
        section: "⚙️ System & Settings",
        items: [
          { label: "Global Settings", icon: "cog", href: "/engine/global-settings", active: location === "/engine/global-settings" },
          { label: "Platform Settings", icon: "cogs", href: "/engine/platform-settings", active: location === "/engine/platform-settings" },
          { label: "Security & Compliance", icon: "lock", href: "/engine/security", active: location === "/engine/security" },
          { label: "Audit Logs", icon: "clipboard-list", href: "/engine/audit-logs", active: location === "/engine/audit-logs" },
          { label: "Trash Management", icon: "trash-alt", href: "/engine/trash", active: location === "/engine/trash" },
          { label: "Database Tools", icon: "database", href: "/engine/db-tools", active: location === "/engine/db-tools" },
        ]
      },
      {
        section: "📚 Help & Documentation",
        items: [
          { label: "DevDoc Access", icon: "book", href: "/dev-documentation", active: location === "/dev-documentation" },
          { label: "Support Tickets", icon: "ticket-alt", href: "/engine/support", active: location === "/engine/support" },
          { label: "Knowledge Base", icon: "lightbulb", href: "/engine/knowledge-base", active: location === "/engine/knowledge-base" },
          { label: "Features Checklist", icon: "check-square", href: "/engine/features", active: location === "/engine/features" },
          { label: "QA Testing Tracker", icon: "vial", href: "/engine/qa-testing", active: location === "/engine/qa-testing" },
        ]
      },
      {
        section: "🧪 Developer Tools",
        items: [
          { label: "API Explorer", icon: "terminal", href: "/engine/api-explorer", active: location === "/engine/api-explorer" },
          { label: "Webhook Tester", icon: "flask", href: "/engine/webhook-tester", active: location === "/engine/webhook-tester" },
          { label: "Database Query Tool", icon: "database", href: "/engine/db-query", active: location === "/engine/db-query" },
          { label: "Log Viewer", icon: "scroll", href: "/engine/logs", active: location === "/engine/logs" },
        ]
      },
    ];
  }
  
  // Similar structure for other roles (admin, manager, user)
  // ... (reduced menu based on permissions)
};
```

### 1.2 Add Search Functionality

Add global search to the sidebar:

```typescript
// In sidebar.tsx, add state for search
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<MenuItem[]>([]);

// Search handler
const handleSearch = (query: string) => {
  setSearchQuery(query);
  
  if (!query.trim()) {
    setSearchResults([]);
    return;
  }
  
  const allItems = menuItems.flatMap(section => section.items);
  const results = allItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );
  
  setSearchResults(results);
};

// Add search input to sidebar
<div className="px-4 py-2">
  <Input
    type="search"
    placeholder="Search pages..."
    value={searchQuery}
    onChange={(e) => handleSearch(e.target.value)}
    className="w-full"
    data-testid="input-sidebar-search"
  />
  
  {searchResults.length > 0 && (
    <div className="mt-2 space-y-1">
      {searchResults.map(item => (
        <Link key={item.href} href={item.href}>
          <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
            <i className={`fas fa-${item.icon} mr-2`} />
            {item.label}
          </div>
        </Link>
      ))}
    </div>
  )}
</div>
```

### 1.3 Add Breadcrumb Navigation

**Create**: `client/src/components/layout/breadcrumb.tsx`

```typescript
import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <Link href="/engine/dashboard">
        <div className="flex items-center hover:text-gray-900 dark:hover:text-white cursor-pointer">
          <Home className="h-4 w-4" />
        </div>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link href={item.href}>
              <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer">
                {item.label}
              </span>
            </Link>
          ) : (
            <span className="font-medium text-gray-900 dark:text-white">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
```

Use in pages:

```typescript
import { Breadcrumb } from '@/components/layout/breadcrumb';

function ModulesPage() {
  return (
    <div>
      <Breadcrumb items={[
        { label: 'Content & Builders', href: '/engine/modules' },
        { label: 'Module Builder' }
      ]} />
      
      {/* Page content */}
    </div>
  );
}
```

---

## Step 2: API Organization

### 2.1 Create API Documentation

**Create**: `server/api-docs.ts`

```typescript
import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WytNet Engine API',
      version: '1.0.0',
      description: 'Complete API documentation for WytNet Engine Admin Panel',
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
        },
      },
    },
    security: [{
      sessionAuth: [],
    }],
  },
  apis: ['./server/routes/*.ts'], // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

const router = Router();

router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerSpec));
router.get('/docs.json', (req, res) => {
  res.json(swaggerSpec);
});

export default router;
```

Add to `server/index.ts`:

```typescript
import apiDocs from './api-docs';
app.use('/api', apiDocs);
```

### 2.2 Standardize API Error Responses

**Create**: `server/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  
  console.error('API Error:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });
  
  res.status(statusCode).json({
    success: false,
    error: err.message,
    code,
    details: err.details,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
}

// Custom error classes
export class ValidationError extends Error {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  code = 'NOT_FOUND';
  
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  code = 'UNAUTHORIZED';
  
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  code = 'FORBIDDEN';
  
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}
```

Use in routes:

```typescript
import { NotFoundError, ValidationError } from '../middleware/errorHandler';

router.get('/api/modules/:id', async (req, res, next) => {
  try {
    const module = await getModule(req.params.id);
    
    if (!module) {
      throw new NotFoundError('Module not found');
    }
    
    res.json({ success: true, data: module });
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

---

## Step 3: CRUD Pattern Standardization

### 3.1 Create Reusable DataTable Component

**Create**: `client/src/components/ui/data-table.tsx`

```typescript
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Search...",
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('');
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className="space-y-4">
      {searchable && (
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
          data-testid="input-table-search"
        />
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s) total
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            data-testid="button-previous-page"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            data-testid="button-next-page"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 3.2 Create Standard CRUD Page Template

**Create**: `client/src/components/templates/crud-page.tsx`

```typescript
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { ColumnDef } from '@tanstack/react-table';

interface CRUDPageProps<T> {
  title: string;
  apiEndpoint: string;
  columns: ColumnDef<T>[];
  FormComponent: React.ComponentType<{
    data?: T;
    onSuccess: () => void;
    onCancel: () => void;
  }>;
}

export function CRUDPage<T extends { id: string }>({
  title,
  apiEndpoint,
  columns,
  FormComponent,
}: CRUDPageProps<T>) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | undefined>();
  
  const { data, isLoading } = useQuery<{ data: T[] }>({
    queryKey: [apiEndpoint],
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`${apiEndpoint}/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      toast({ title: 'Deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    },
  });
  
  const handleCreate = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };
  
  const handleEdit = (item: T) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingItem(undefined);
    queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
  };
  
  const actionsColumn: ColumnDef<T> = {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleEdit(row.original)}
          data-testid={`button-edit-${row.id}`}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleDelete(row.original.id)}
          data-testid={`button-delete-${row.id}`}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    ),
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button onClick={handleCreate} data-testid="button-create">
          <Plus className="h-4 w-4 mr-2" />
          Add {title}
        </Button>
      </div>
      
      <DataTable
        columns={[...columns, actionsColumn]}
        data={data?.data || []}
      />
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Create'} {title}
            </DialogTitle>
          </DialogHeader>
          <FormComponent
            data={editingItem}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## Step 4: Routing Optimization

### 4.1 Implement Lazy Loading

**Update**: `client/src/App.tsx`

```typescript
import { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';

// Lazy load admin pages
const ModulesPage = lazy(() => import('./pages/engine-admin/modules'));
const AppsPage = lazy(() => import('./pages/engine-admin/apps'));
const HubsPage = lazy(() => import('./pages/engine-admin/hubs'));
const RolesPage = lazy(() => import('./pages/engine-admin/roles'));
const ThemesPage = lazy(() => import('./pages/engine-admin/themes'));
const WytAIPage = lazy(() => import('./pages/engine-admin/wytai'));
// ... more pages

function App() {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <Switch>
        <Route path="/engine/modules" component={ModulesPage} />
        <Route path="/engine/apps" component={AppsPage} />
        <Route path="/engine/hubs" component={HubsPage} />
        <Route path="/engine/roles" component={RolesPage} />
        <Route path="/engine/themes" component={ThemesPage} />
        <Route path="/engine/wytai" component={WytAIPage} />
        {/* ... more routes */}
      </Switch>
    </Suspense>
  );
}
```

### 4.2 Add Route Prefetching

```typescript
import { useEffect } from 'react';

// Prefetch likely next routes
function usePrefetch(routes: string[]) {
  useEffect(() => {
    routes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }, [routes]);
}

// Use in pages
function DashboardPage() {
  usePrefetch([
    '/engine/modules',
    '/engine/apps',
    '/engine/users',
  ]);
  
  return <div>Dashboard</div>;
}
```

---

## Step 5: Performance Optimization

### 5.1 Install Dependencies

```bash
npm install @tanstack/react-table
npm install --save-dev @types/react-table
```

### 5.2 Configure Code Splitting

**Update**: `vite.config.ts`

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          
          // Page chunks
          'admin-pages': [
            './client/src/pages/engine-admin/modules.tsx',
            './client/src/pages/engine-admin/apps.tsx',
            './client/src/pages/engine-admin/hubs.tsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

---

## Testing

### Test Navigation

```typescript
describe('Navigation', () => {
  it('should render all menu sections for super admin', () => {
    render(<Sidebar isSuperAdmin={true} />);
    
    expect(screen.getByText('📊 Dashboard & Overview')).toBeInTheDocument();
    expect(screen.getByText('🏗️ Platform Management')).toBeInTheDocument();
    expect(screen.getByText('🔨 Content & Builders')).toBeInTheDocument();
  });
  
  it('should filter menu items by search', () => {
    render(<Sidebar isSuperAdmin={true} />);
    
    const search = screen.getByTestId('input-sidebar-search');
    fireEvent.change(search, { target: { value: 'module' } });
    
    expect(screen.getByText('Module Builder')).toBeInTheDocument();
  });
});
```

### Test CRUD Operations

```typescript
describe('CRUD Page', () => {
  it('should list all items', async () => {
    render(<ModulesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Product Reviews')).toBeInTheDocument();
    });
  });
  
  it('should create new item', async () => {
    render(<ModulesPage />);
    
    fireEvent.click(screen.getByTestId('button-create'));
    
    // Fill form
    fireEvent.change(screen.getByTestId('input-name'), {
      target: { value: 'Blog Posts' }
    });
    
    fireEvent.click(screen.getByTestId('button-submit'));
    
    await waitFor(() => {
      expect(screen.getByText('Blog Posts')).toBeInTheDocument();
    });
  });
});
```

---

## Deployment Checklist

- [ ] All navigation sections implemented
- [ ] Search functionality working
- [ ] Breadcrumbs on all pages
- [ ] API documentation accessible at `/api/docs`
- [ ] Error handling standardized
- [ ] CRUD templates in use
- [ ] Lazy loading implemented
- [ ] Bundle size < 500KB
- [ ] All tests passing
- [ ] Performance metrics tracked

---

## Next Steps

After completing Phase 1, proceed to:
- [WytAI Agent Full Page Implementation](/en/implementation/wytai-full-page)
- [WytBuilder Implementation](/en/implementation/wytbuilder-implementation)

---

## References

- [PRD: Self-Service Platform](/en/prd/self-service-platform)
- [Navigation Best Practices](/en/best-practices/navigation)
- [Performance Optimization](/en/best-practices/performance)
