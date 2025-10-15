# Overview

WytNet is a fully white-label, production-ready multi-tenant SaaS platform foundation providing low-code tools for application building, content management, and cross-tenant hub creation. It includes CRUD builders, CMS, app composition, hub aggregation, and the WytID Universal Identity & Validation system. Built as a monorepo, it uses Express.js, React with Vite, and PostgreSQL with Drizzle ORM. Key features include white-label authentication (Google OAuth, Email OTP), role-based access control, comprehensive multi-tenancy with Row Level Security, and the WytID blockchain-anchored identity system. The platform aims to offer a robust and scalable solution for building and deploying SaaS applications.

# User Preferences

Preferred communication style: Simple, everyday language.
Focus: Fully white-label multi-tenant SaaS platform with identity validation.

# System Architecture

## Frontend Architecture
The frontend uses React 18, TypeScript, and Vite. Styling is handled by Tailwind CSS with shadcn/ui components. Wouter is used for routing and TanStack Query for server state management. The architecture supports component-based builders for modules, CMS, apps, and hubs.

## Backend Architecture
The backend is an Express.js application with TypeScript, providing RESTful APIs for authentication, dashboard, and CRUD operations. Authentication uses WytPass OAuth (Google, Email OTP, Email/Password) with session-based authentication and PostgreSQL session storage. Role-based access control and tenant isolation are enforced at the database level.

## Data Storage Architecture
PostgreSQL is the primary database, utilizing Drizzle ORM for type-safe operations. Multi-tenancy is implemented via `tenant_id` columns and Row Level Security policies. Core tables include `tenants`, `users`, `models`, `pages`, `blocks`, `apps`, `app_installs`, and `hubs`. Junction tables (`module_features`, `app_modules`, `hub_modules`, `hub_apps`) manage complex entity relationships (Features → Modules → Apps → Hubs).

## Package-Based Modular Architecture
The system is organized into self-contained packages (`kernel`, `builder`, `cms`, `appkit`, `hubkit`) under a monorepo structure, facilitating independent development and clear interfaces.

## Security Architecture
Security layers include PostgreSQL Row Level Security, session-based authentication with httpOnly cookies, role-based access control, CSRF protection, and Zod schema validation.

## UI/UX Decisions
The platform features modern UI elements such as animated gradient backgrounds, glassmorphism cards, micro animations, and responsive designs for an enhanced user experience, particularly visible in the login page and user profile sections. UTM tracking is standardized for all external links using `openExternalLink()` to ensure proper traffic attribution.

## Key Features & Implementations
- **AI App Builder**: Admin-only AI-powered tool using OpenAI for natural language app creation, integrated into the WytNet framework (PostgreSQL+Drizzle, React/TypeScript, shadcn/ui, WytPass auth).
- **WytMatch & Bucket List**: User feature allowing users to create public/private bucket lists, with WytMatch enabling discovery of shared interests for potential opportunities.
- **Enterprise Junction Table Architecture**: Robust many-to-many relationship management through dedicated junction tables and corresponding admin API endpoints.
- **Public WytApps & WytHubs Pages**: Marketing pages showcasing available apps and hubs with authentication-aware CTAs ([+Add App], [+Subscribe]) that redirect to login for unauthenticated users or dashboard for logged-in users. Features loading states, error handling, and responsive designs with proper accessibility (data-testid attributes).

## Context-Based Module System (October 2025)

WytNet now implements a **WordPress-style plugin architecture** where modules are small, focused, single-purpose components that can be activated/deactivated across different contexts.

### Module Architecture
- **Modules as Plugins**: Each module is a self-contained plugin (e.g., "WytPass Auth", "Razorpay Payment", "Calendar", "Logo Uploader with Autocrop")
- **Context-Aware Activation**: Modules can be enabled/disabled independently for Platform ✓ Hub ✓ App ✓ Game ✓ contexts
- **50+ Module Catalog**: Organized into 8 categories:
  1. Authentication & Identity
  2. Payment Gateways
  3. Content & Media
  4. Communication
  5. Data Management
  6. User & Organization
  7. Productivity
  8. Platform Core

### Dependency Management
- **Auto-Resolution**: Automatically enables required dependencies when activating a module
- **Conflict Detection**: Prevents activation of conflicting modules (e.g., Razorpay vs Stripe)
- **Dependency Chains**: Supports complex dependency graphs with recursive resolution
- **Service Layer**: `moduleDependencyService.ts` handles all dependency logic and validation

### Module Activation System
- **Platform-Level**: Admin panel manages platform-wide module activation
- **Context-Specific**: Hub/App/Game managers activate modules within their scope (with contextId)
- **Activation Tables**: `platform_module_activations`, `hub_module_activations`, `app_module_activations`, `game_module_activations`
- **Settings & Configuration**: Each activation can store custom settings in JSONB fields

### API Exposure & Monetization
- **Module API Endpoints**: Each module exposes its own REST API endpoints
- **API-as-a-Service Model**: Planned monetization similar to Google Cloud Console
- **API Key Management**: Per-module API key generation (planned)
- **Usage Tracking**: Analytics and rate limiting per module (planned)

### Database Schema
```typescript
platformModules {
  id, name, description, category,
  contexts: ['platform', 'hub', 'app', 'game'],
  dependencies: ['module-id-1', 'module-id-2'],
  conflicts: ['conflicting-module'],
  apiEndpoints: [{ path, method, description }],
  settings: { /* module config */ },
  compatibilityMatrix: { /* version compat */ },
  version, status
}

platform_module_activations {
  id, moduleId, context, isActive,
  settings, activatedBy, activatedAt, deactivatedAt
}
```

### Module Library UI
- **Admin Dashboard**: Module browsing, search, and filtering by 8 categories
- **Toggle Activation**: One-click enable/disable with dependency auto-resolution
- **Dependency Visualization**: Shows required modules and conflicts inline
- **API Documentation**: Details dialog with full endpoint documentation
- **Stats Dashboard**: Total, active, and inactive module counts

### Module Activation Enforcement (October 2025)

WytNet enforces module activation at both backend and frontend layers to ensure features are only accessible when their modules are activated.

#### Backend Enforcement
- **Middleware Guards**: `requireModule(moduleId)` middleware checks activation before route access
  - File: `server/helpers/moduleMiddleware.ts`
  - Usage: `app.post('/api/payments/create-order', isAuthenticated, requireModule('razorpay-payment'), handler)`
  - Admin bypass: Automatically allows super admins (configurable via `skipIfAdmin: false`)
  - Returns 403 with detailed error if module not activated
- **Service Layer**: `moduleActivationService.ts` provides:
  - `isModuleActive(moduleId, context)`: Check if module is activated
  - `getActiveModules(context)`: Get list of all active module IDs
  - Context-aware: Platform, Hub, App, Game scoping with optional contextId
- **API Endpoint**: `GET /api/modules/enabled/:context?contextId={id}` returns activated modules for frontend consumption

#### Frontend Enforcement
- **React Hook**: `useEnabledModules({ context, contextId })` fetches and caches enabled modules
  - File: `client/src/hooks/useEnabledModules.ts`
  - Returns: `isModuleEnabled(moduleId)`, `enabledModules[]`, `activations[]`, `getModuleSettings()`
  - Caching: 5-minute stale time, React Query powered
- **Helper Hook**: `useIsModuleEnabled(moduleId, context)` for simple enabled/disabled checks
- **Conditional Components**:
  - `<ModuleFeatureDemo moduleId="..." moduleName="...">`: Shows loading/disabled/active states with visual feedback
  - `<ConditionalFeature moduleId="..." fallback={<>}>`: Simple show/hide wrapper
  - File: `client/src/components/ModuleFeatureDemo.tsx`

#### Implementation Pattern
```typescript
// Backend: Protect routes
app.post('/api/feature', requireModule('feature-module'), handler);

// Frontend: Conditional rendering
const { isEnabled } = useIsModuleEnabled('feature-module');
if (!isEnabled) return null;
return <FeatureUI />;
```

### White-label API Proxy Gateway (October 2025)

WytNet implements a **unified API gateway** that proxies third-party services under WytNet branding, similar to Google Cloud Console's approach.

#### Module Types
- **Native**: Built in-house by WytNet (e.g., WytPass Auth, WytID)
- **Proxy**: Third-party services white-labeled (e.g., WytMap→Mappls, WytKYC→Digio)
- **Hybrid**: Combination of native features + proxy integrations

#### Proxy Architecture
- **Request Transformation**: WytNet API format → Provider-specific format
- **Response Transformation**: Provider response → WytNet branded response
- **Credential Management**: Secure API key injection via environment variables
- **Error Handling**: White-labeled error messages maintaining WytNet branding
- **Usage Tracking**: Per-module API usage analytics (planned)

#### Implemented Proxy Modules
1. **WytMap (Mappls Proxy)**
   - India-specific location services
   - Endpoints: `/api/modules/wytmap/{geocode, reverse-geocode, directions, nearby, distance}`
   - Credential: `MAPPLS_API_KEY`
   - Transformation: GET params via query, POST bodies preserved
   
2. **WytKYC (Digio Proxy)**
   - Identity verification and eSign services
   - Endpoints: `/api/modules/wytkyc/{esign/initiate, verify/pan, verify/aadhaar, face-match}`
   - Credential: `DIGIO_API_KEY` (pending)
   - Government integrations: UIDAI, NSDL, DigiLocker

3. **WytData (Native)**
   - Essential reference datasets for app development
   - **Collections (307 items total)**:
     - Countries (50): ISO codes, phone prefixes, flags, currencies
     - Languages (20): ISO 639 codes, native names, text direction (RTL/LTR)
     - Currencies (20): ISO 4217 codes, symbols, decimal places
     - Timezones (10): IANA IDs, UTC offsets, DST info
     - India States (37): State codes, capitals
     - India Cities (100): Top 100 major cities by population
     - GST State Codes (34): Tax jurisdiction codes
     - Industries (15): Business sector classifications
     - Company Sizes (6): Employee count ranges
     - Job Roles (15): Common professional positions
   - **Endpoints**:
     - `GET /api/modules/wytdata/collections` - List all available datasets
     - `GET /api/modules/wytdata/:key` - Fetch complete dataset
     - `GET /api/modules/wytdata/:key/search?q={query}` - Search within dataset
     - `GET /api/modules/wytdata/:key/locale/:locale` - Filter by locale (e.g., hi, en)
     - `POST /api/modules/wytdata/batch` - Fetch multiple datasets in one request
   - **Auto-Seeding**: Datasets initialized on server startup via `datasetSeedingService.ts`
   - **Self-Consuming**: Platform uses WytData APIs for dropdowns, forms, and data validation

#### Service Layer
- **ModuleProxyService**: Central proxy orchestrator in `server/services/moduleProxyService.ts`
- **Method-aware transformations**: GET vs POST/PUT body handling
- **Security**: No credential exposure, environment-based key management
- **Self-consuming architecture**: WytNet uses own Module Library APIs to build platform features

# External Dependencies

## Database Integration
- **Neon Database**: Serverless PostgreSQL.
- **Drizzle ORM**: Type-safe ORM for PostgreSQL.

## Authentication Services
- **WytPass OAuth**: Custom multi-method authentication system.
- **Google OAuth**: Social login integration.
- **MSG91 Email OTP**: Passwordless email authentication.
- **connect-pg-simple**: PostgreSQL-backed session management.

## UI and Styling Framework
- **shadcn/ui**: React component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Accessible component primitives.

## State Management and API Integration
- **TanStack Query**: Server state management and caching.
- **React Hook Form**: Form handling with Zod validation.
- **Wouter**: Lightweight client-side routing.

## Development and Build Tools
- **Vite**: Fast build tool and development server.
- **TypeScript**: Type-safe language.
- **ESBuild**: Fast JavaScript bundler.

## AI and Machine Learning
- **OpenAI API**: GPT-4 integration for AI App Builder.

## Runtime and Deployment
- **Node.js**: JavaScript runtime.
- **Express.js**: Web application framework.
- **ws library**: WebSocket support for real-time capabilities.