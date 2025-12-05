# Overview

**WytNet.com** is an all-in-one digital platform designed to enhance both lifestyle and workstyle for individuals and organizations. Its mission is to create a connected digital ecosystem emphasizing speed, security, and scalability by unifying productivity, social networking, and intelligent automation. The platform aims to build a world where every task, connection, and opportunity is managed within a smart, trustworthy environment.

**Recent Updates (Dec 5, 2025):**
- ✅ WytApp Dynamic Pricing System: Fully configurable pricing per app with multiple plan types (free, monthly, yearly, pay-per-use, one-time)
- ✅ Mandatory Apps Auto-Assignment: WytPass and WytWall auto-assigned to all users on registration with free plans
- ✅ Premium Apps with Flexible Pricing: WytQRC and WytAssessor with pay-per-use (₹10), monthly (₹10/month), yearly (₹100/year) plans
- ✅ Complete Pricing Audit Trail: All pricing changes tracked with previous/new values, who changed, and change reason

**Previous Updates (Nov 26, 2025):**
- ✅ Light mode set as default theme (dark mode no longer system preference override)
- ✅ File organization completed - documentation, setup, and config files organized into dedicated folders
- ✅ Professional investor presentation (14 slides) with WytLife branding and $300B+ market opportunity

WytNet is a white-label, multi-tenant SaaS platform built on "Engine," a modular framework organizing components into **Modules → Apps → Hubs**. Key features include universal WytPass authentication, robust role-based access control (RBAC), comprehensive multi-tenancy with Row Level Security, a WytPoints economic system, and AI-powered automation via the WytAI Agent.

# User Preferences

Preferred communication style: Simple, everyday language.
Focus: Fully white-label multi-tenant SaaS platform with identity validation.

# System Architecture

## Frontend Architecture
The frontend uses React 18, TypeScript, Vite, Tailwind CSS, and shadcn/ui. Wouter handles routing, and TanStack Query manages server state. It supports component-based builders for modules, CMS, applications, and hubs, with a mobile-first responsive design, animated gradients, and glassmorphism elements.

## Routing Architecture
The application uses a clear separation between public marketing pages and authenticated functional pages:

### Public Routes (Marketing & Information)
- `/` - WytNet Hub homepage
- `/wytapps` - WytApps marketplace listing
- `/app/:id` - Individual app marketing pages with features, pricing, and "Add to Panel" button
- `/features`, `/pricing`, `/about` - Platform information pages

### Authenticated Panel Routes (Functional Workspaces)
- `/mypanel/*` - Personal workspace (My Panel) with user-specific features
- `/orgpanel/*` - Organization workspace (Org Panel) with team collaboration features
- `/apppanel/:appSlug/*` - **App Panel** - Immersive app-specific workspaces with dedicated navigation
  - Example: `/apppanel/wytduty` - WytDuty app with dashboard, tasks, calendar, settings
  - Each app has its own navigation menu and features when "switched to"
  - Maintains unified header while providing app-focused sidebar navigation

### Admin Routes (Platform Management)
- `/engine/*` - Engine Admin (Super Admin Panel for platform infrastructure)
- `/admin/*` - Hub Admin (WytNet.com hub content management)

### Key Routing Principles
1. **Public routes** show marketing information and allow users to discover and add apps to their panels
2. **Panel routes** require authentication and provide functional app workspaces
3. **App Panel** provides immersive, app-specific experiences while maintaining platform consistency
4. Users "switch to app" from My WytApps to enter dedicated app workspaces at `/apppanel/:appSlug`

## Backend Architecture
The backend is an Express.js application with TypeScript, providing RESTful APIs. WytPass OAuth (Google, Email OTP, Email/Password) provides session-based authentication, with RBAC and tenant isolation enforced at the database level.

## Data Storage Architecture
PostgreSQL is the primary database, managed by Drizzle ORM. Multi-tenancy is implemented using `tenant_id` columns and Row Level Security. A Global Display ID system provides human-readable, globally unique identifiers.

## Modular Architecture
The system is organized into self-contained packages (`kernel`, `builder`, `cms`, `appkit`, `hubkit`) within a monorepo. It features a context-based module system (Platform, Hub, App, Game contexts) with dependency management.

## Security Architecture
Security measures include PostgreSQL Row Level Security, session-based authentication with httpOnly cookies, role-based access control, CSRF protection, and Zod schema validation. A unified WytPass authentication system enables single-session access across authorized panels (WytNet, Engine Admin, Hub Admin, MyPanel, OrgPanel) with seamless switching.

## Key Features & Implementations
- **App Panel System**: Immersive app-specific workspaces accessible at `/apppanel/:appSlug` routes. Users can "Switch to App" from My WytApps to enter dedicated app environments with app-specific navigation, dashboard, and features while maintaining the unified platform header. Each app gets its own sidebar navigation and workspace context (personal, organization, or app-specific).
- **AI App Builder**: OpenAI-powered tool for natural language app creation (admin-only).
- **White-label API Proxy Gateway**: Unifies third-party service integration.
- **Enhanced Module & App Management System**: Includes version control, edit history, custom route management, and context-based access control.
- **White-Label Multi-Domain Hub System**: Manages platform hubs with multi-domain routing, SEO, branding, and hub-level RBAC.
- **Granular Roles & Permissions Management System**: Engine-level RBAC with fine-grained permissions and 8 default roles.
- **WytAI Agent**: An intelligent AI assistant embedded in the Engine Admin portal, offering conversational management via a floating chat widget. Supports multiple AI models (GPT-4o, Claude 3.5 Sonnet, Gemini 2.0) and voice input/output.
- **Audit Logs System**: Tracks administrative actions with a filterable UI.
- **Global Platform Settings System**: Comprehensive configuration management via API and UI.
- **Organizations Management API**: Full CRUD for organizations.
- **Progressive Web App (PWA) Support**: Full PWA implementation including service worker, manifest, and push notifications.
- **WytNet DevDoc (Developer Documentation System)**: Comprehensive bilingual (Tamil + English) technical documentation built with VitePress with **4-level RBAC** (Public, Developer, Internal, Admin) integrated with WytNet's permission system. Features API reference, architecture docs, workflow diagrams, implementation guides, **PRD (Project Requirements Documentation)**, **Chat History Archive**, and business strategy. Access managed through Engine Admin Panel with dual-layer authentication (WytPass + password backward compatibility).
- **Features Checklist System**: Project management tool with a dual-testing workflow for tracking feature implementations, accessible in the Engine Admin portal.
- **Content Architecture**: Features a robust system for WytApps (39 apps across 17 categories with flexible pricing), WytSuites (3 app bundles), WytModules (51 modules across 9 categories with various pricing models), and WytHubs (5 active hubs with multi-domain routing and hub-level RBAC).
- **WytApp Dynamic Pricing System**: Fully configurable pricing system for WytApps with multiple plan types (free, monthly, yearly, pay-per-use, one-time). Features mandatory core apps (WytPass, WytWall) auto-assigned on registration, premium apps with flexible pricing (₹10/use, ₹10/month, ₹100/year), complete pricing audit trail, and per-app subscription management. Database tables: `app_pricing_plans`, `app_pricing_history`, `app_plan_subscriptions`.
- **WytData Management System (All Datasets)**: Consolidated dataset management interface at `/engine/datasets` for managing global reference data collections. Includes 38+ dataset collections (Countries, Cities, Languages, Currencies, Industries, etc.) with CRUD operations, import/export functionality, and hierarchical data management. The "All Datasets" page serves as the unified WytData management hub with collection-level and item-level editing capabilities.
- **Self-Service Platform Initiative (Phase 1-3 Roadmap)**: Strategic 3-phase transformation to enable Super Admins to autonomously build features without developer dependency. Phase 1: Engine Panel Consolidation (standardize navigation, APIs, routing). Phase 2: WytAI Agent Full Page (transform floating widget to comprehensive full-page interface with voice, files, code execution, deep context integration). Phase 3: WytBuilder Platform (visual drag-drop CRUD builders for modules, apps, pages, hubs with AI-powered code generation). Documentation includes comprehensive PRD, architecture docs (WytBuilder, WytAI Agent), and step-by-step implementation guides for all 3 phases.

# External Dependencies

## Database Integration
- **Neon Database**: Serverless PostgreSQL.
- **Drizzle ORM**: Type-safe ORM.

## Authentication Services
- **WytPass OAuth**: Custom multi-method authentication.
- **Google OAuth**: Social login.
- **MSG91 Email OTP**: Passwordless email authentication.
- **connect-pg-simple**: PostgreSQL session management.

## UI and Styling Framework
- **shadcn/ui**: React component library.
- **Tailwind CSS**: Utility-first CSS.
- **Radix UI**: Accessible component primitives.

## State Management and API Integration
- **TanStack Query**: Server state management.
- **React Hook Form**: Form handling with Zod.
- **Wouter**: Client-side routing.

## Development and Build Tools
- **Vite**: Build tool and dev server.
- **TypeScript**: Type-safe language.
- **ESBuild**: JavaScript bundler.
- **VitePress**: Documentation site generator.

## AI and Machine Learning
- **OpenAI API**: GPT-4 integration.
- **Anthropic API**: Claude 3.5 Sonnet integration.
- **Google AI Studio API**: Gemini 2.0 Flash and 1.5 Pro integration.

## Runtime and Deployment
- **Node.js**: JavaScript runtime.
- **Express.js**: Web application framework.
- **ws library**: WebSocket support.