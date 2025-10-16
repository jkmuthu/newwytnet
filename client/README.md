# WytNet Hub

**Conceptual Role:** First Hub Implementation Built on Engine

This directory represents **WytNet.com** - the first Hub built using the Engine platform, demonstrating our philosophy of "we are the first user of our own tools."

## Architecture Position

```
Engine (/server)
├── Platform Infrastructure
└── Core Services
    ↓
WytNet Hub (this directory: /client)
├── Public Site
├── Hub Admin Portal
└── Engine Admin Portal
    ↓
Future Customer Hubs
└── Built using same Engine
```

## Philosophy

> "We are the first user of our own tools"

WytNet.com itself is built on the Engine platform, using the same tools and infrastructure we provide to customers. This validates our platform and ensures we build features that genuinely work.

## Directory Structure

### `/src/portals`
Admin portals for different access levels:

#### `/portals/engine`
Super Admin Portal (Platform Management)
- Module management
- Entity knowledge graph
- Geo-regulatory controls
- Platform registry
- System settings

#### `/portals/hub-admin`
Hub Admin Portal (WytNet.com Management)
- CMS content editor
- Media library
- Hub apps
- Theme customization
- SEO settings
- Hub analytics

### `/src/pages`
Public-facing pages and features:
- Home page
- Public dashboards
- User authentication
- Hub features (Needs, Offers, etc.)

### `/src/components`
Shared UI components:
- `/ui` - shadcn/ui components
- Reusable widgets
- Common layouts

### `/src/contexts`
State management:
- `AuthProvider` - Regular user authentication
- `AdminAuthProvider` - Super admin authentication
- `HubAdminAuthProvider` - Hub admin authentication
- Theme and other global state

### `/src/lib`
Utilities and helpers:
- Query client (TanStack Query)
- API utilities
- Validation schemas

## Access Levels

### 1. Public Users
- **Routes:** `/`, `/login`, `/needs`, `/offers`, etc.
- **Authentication:** WytPass OAuth (Google, Email OTP)
- **Purpose:** Access hub features and content

### 2. Hub Admin
- **Routes:** `/admin/*`
- **Login:** `/admin/login`
- **Credentials:** `hubadmin@wytnet.com` / `hubadmin123`
- **Purpose:** Manage WytNet.com hub content

### 3. Super Admin (Engine)
- **Routes:** `/engine/*`
- **Login:** `/engine/login`
- **Credentials:** `jkm@jkmuthu.com` / `SuperAdmin@2025`
- **Purpose:** Manage platform infrastructure

## Technical Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Routing:** Wouter (lightweight client-side routing)
- **State:** TanStack Query (server state) + Context (UI state)
- **Forms:** React Hook Form + Zod validation

## Key Features

### Authentication Gates
- `AuthGate` - Protects user routes
- `AdminGate` - Protects super admin routes (`/engine/*`)
- `HubAdminGate` - Protects hub admin routes (`/admin/*`)

### Routing Pattern
```typescript
// App.tsx structure
<Route path="/engine/*" component={EngineRouter} />    // Super admin
<Route path="/admin/*" component={HubAdminRouter} />   // Hub admin
<Route path="/*" component={PublicRoutes} />           // Public users
```

### Session Isolation
Each access level has its own:
- Authentication context
- Session cookie (admin.sid, hubadmin.sid, connect.sid)
- Cache invalidation
- Login/logout flow

Users can be logged in to all three simultaneously without conflict.

## Development Notes

⚠️ **DO NOT MODIFY:**
- `vite.config.ts` - Pre-configured for this directory structure
- Build scripts expect this directory to be named `/client`

✅ **Common Patterns:**
- Use `@/` prefix for imports (configured in tsconfig)
- Forms use shadcn Form component with zodResolver
- API calls use TanStack Query with apiRequest
- Always add data-testid attributes for interactive elements

## Styling Guidelines

- Use Tailwind CSS utilities
- Dark mode: `className="bg-white dark:bg-black"`
- Icons from lucide-react
- Consistent spacing and animations
- Mobile-first responsive design

## Multi-Tenancy

While WytNet.com is the first hub, the same `/client` structure can be:
1. Cloned for customer hubs
2. Customized with different themes
3. Connected to their own tenant_id
4. Deployed as separate instances

The Engine (/server) handles all the multi-tenancy logic at the backend.
