# Overview

**WytNet.com** is an all-in-one digital platform for a better lifestyle and best workstyle — for individuals and organizations everywhere.

**Tagline:** *"Get In. Get Done."*

**Mission:** Create a connected digital ecosystem powered by **Speed | Security | Scale**. WytNet unifies productivity, social networking, and intelligent automation.

**Vision:** Build a world where every task, connection, and opportunity happens in one smart environment powered by technology and trust.

**Technical Foundation:** WytNet is a white-label, multi-tenant SaaS platform built on "Engine" — a central framework that creates, connects, and controls all components through a modular architecture: **Modules → Apps → Hubs**. The platform features universal WytPass authentication, role-based access control (RBAC), comprehensive multi-tenancy with Row Level Security, WytPoints economy system, and AI-powered automation through WytAI Agent.

# User Preferences

Preferred communication style: Simple, everyday language.
Focus: Fully white-label multi-tenant SaaS platform with identity validation.

# System Architecture

## Frontend Architecture
The frontend is built with React 18, TypeScript, Vite, Tailwind CSS, and shadcn/ui. Wouter manages routing, and TanStack Query handles server state. It supports component-based builders for modules, CMS, applications, and hubs.

## Backend Architecture
The backend is an Express.js application with TypeScript, providing RESTful APIs. Authentication uses WytPass OAuth (Google, Email OTP, Email/Password) with session-based authentication. Role-based access control and tenant isolation are enforced at the database level.

## Data Storage Architecture
PostgreSQL is the primary database, utilizing Drizzle ORM. Multi-tenancy is achieved through `tenant_id` columns and Row Level Security. A Global Display ID system provides human-readable, globally unique identifiers for all entities (e.g., UR0000001, OR00001).

## Modular Architecture
The system is organized into self-contained packages (`kernel`, `builder`, `cms`, `appkit`, `hubkit`) within a monorepo. It features a context-based module system (Platform, Hub, App, Game contexts) with dependency management and API exposure.

## Security Architecture
Security measures include PostgreSQL Row Level Security, session-based authentication with httpOnly cookies, role-based access control, CSRF protection, and Zod schema validation. A two-tier admin authentication system provides isolated sessions for Super Admins and Hub Admins, supporting triple session management and a multi-context panel switcher for seamless role transitions.

## UI/UX Decisions
The platform incorporates modern UI elements like animated gradient backgrounds, glassmorphism cards, micro animations, and responsive designs. It features a mobile-first responsive design across all admin portals and the WytAI Agent, with dedicated mobile layouts and optimized components. The public portal navigation structure has been updated for desktop, tablet, and mobile views, emphasizing "WytApps" over "WytHubs."

## Key Features & Implementations
- **AI App Builder**: An OpenAI-powered tool for natural language app creation (admin-only).
- **White-label API Proxy Gateway**: Unifies third-party service integration under WytNet branding.
- **Enhanced Module & App Management System**: Includes version control, edit history, custom route management, and context-based access control.
- **AI-Assisted Module & App Improvement Workflow**: Integrates GPT-4 for conversational support and recommendations.
- **White-Label Multi-Domain Hub System**: Manages platform hubs with multi-domain routing, SEO, branding, and hub-level RBAC.
- **Granular Roles & Permissions Management System**: Engine-level RBAC with 64 fine-grained permissions across 16 resource sections, 8 default roles, and protected API routes.
- **WytAI Agent**: An intelligent AI assistant embedded in the Engine Admin portal, offering conversational platform management via a floating chat widget. It supports multiple AI models (GPT-4o, Claude 3.5 Sonnet, Gemini 2.0), voice input/output in Tamil and English, rate limiting, and comprehensive usage tracking.
- **Audit Logs System**: Tracks all administrative actions with filtering, pagination, search, and detailed activity timelines accessible via an admin UI.
- **Global Platform Settings System**: A comprehensive configuration management system for platform-wide settings stored in a key-value `platform_settings` table, managed via API and a dedicated frontend UI.
- **Organizations Management API**: Full CRUD API for managing organizations with enhanced schema, integrated into the Tenants page.
- **Mock Data Cleanup**: Replaced all mock data with real database-backed implementations across critical admin features.
- **Progressive Web App (PWA) Support**: Full PWA implementation including service worker, manifest, icons, offline functionality, background sync, and push notifications.
- **WytNet DevDoc (Developer Documentation System)**: Comprehensive bilingual (Tamil + English) technical documentation built with VitePress. Features include complete API reference, architecture docs, feature workflows with Mermaid diagrams, implementation guides for Replit Assistant, and database schema documentation with ERD diagrams. Protected by three authentication methods: password-only (external developers), Super Admin session (auto-access for logged-in admins), and API token (Replit Agent). Available at `/devdoc/` with 20+ documentation pages covering all platform features, RBAC system, multi-tenancy architecture, and step-by-step implementation patterns.
- **Features Checklist System**: A comprehensive project management tool with dual-testing workflow for tracking WytNet platform feature implementations. Features full CRUD operations for features and tasks, expandable accordion UI with task cards and clickable URL links, dual-stage approval workflow (Agent Tested → JKM Tested), URL pattern validation, and real-time progress tracking. Built with react-hook-form for robust form handling, TanStack Query for state management, and mobile-optimized responsive design. Accessible at `/engine/features-checklist` in the Engine Admin portal.

## Developer Documentation Architecture

### Documentation Structure
- **VitePress Static Site**: Built documentation in `docs/.vitepress/dist/`
- **Bilingual Support**: Full Tamil (`/ta/`) and English (`/en/`) versions
- **100+ Pages**: Comprehensive documentation across 8 major sections
- **Mermaid Diagrams**: Workflow visualizations and architecture diagrams
- **Search-Enabled**: Full-text search across all pages in both languages

### Documentation Sections
1. **Introduction**: Platform overview and core concepts
2. **Platform Features**: Foundation features (WytPass Auth, RBAC, Multi-tenancy, WytAI Agent, Audit Logs, PWA)
3. **WytApps**: 39 applications across 17 categories with multi-category support, MyPanel/OrgPanel availability, individual app pricing
4. **WytSuites**: 3 app bundles (WytWorks, WytStax, WytCRM) with bundle pricing and included apps
5. **WytModules**: 51 modules across 9 categories (Authentication, Payment, Content, Communication, Data, User-Org, Productivity, Platform Core, Location)
6. **WytHubs**: 5 active hubs (WytEngine, WytNet.com, ClanNet, MemberNet, VoterNet) with multi-domain routing and hub management
7. **Architecture**: Database schema, multi-tenancy, RBAC, frontend/backend architecture
8. **Admin Panels**: Engine Admin, Hub Admin, MyPanel, OrgPanel documentation
9. **API Reference**: Complete API documentation with authentication, users, admin endpoints
10. **Implementation Guide**: Replit Assistant guide, VitePress editing guide

### Content Architecture

#### WytApps (39 Apps)
**Category System**: Apps can belong to multiple categories simultaneously
- **17 Categories**: Productivity, Finance & Accounting, E-commerce & Sales, HR & Payroll, CRM & Customer Management, Marketing & Communications, Education & Learning, Healthcare & Wellness, Real Estate & Property, Legal & Compliance, Travel & Hospitality, Events & Entertainment, Social & Community, Utilities & Tools, Analytics & Reporting, Documents & Media, AI-Powered

**Panel Availability**:
- **MyPanel**: Individual user workspace (24 apps available)
- **OrgPanel**: Organization workspace (33 apps available)
- **Both Panels**: Apps available in both contexts (18 apps)

**Pricing Models**:
- **Free Apps**: Basic functionality apps (9 apps)
- **Premium Apps**: Monthly subscription (₹199-₹999/month) (30 apps)
- Individual app pricing documented in apps-catalog.md

#### WytSuites (3 Bundles)
**Bundle Pricing**: Discounted bundles vs individual app subscriptions
- **WytWorks Bundle**: 8 productivity apps for individuals and small teams (₹1,599/month, saves ₹2,193/month)
- **WytStax Bundle**: 11 business management apps for startups and SMEs (₹2,999/month, saves ₹2,690/month)
- **WytCRM Bundle**: 6 customer management apps for sales and marketing teams (₹1,799/month, saves ₹1,795/month)

**Mixed Pricing Plans**: Users can subscribe to individual apps OR bundles OR both, with Pricing Plans API managing subscriptions

#### WytModules (51 Modules)
**9 Module Categories**:
1. Authentication & Identity (7 modules)
2. Payment Gateways (4 modules)
3. Content & Media (5 modules)
4. Communication (6 modules)
5. Data Management (6 modules)
6. User & Organization (8 modules)
7. Productivity (4 modules)
8. Platform Core (10 modules)
9. Location Services (3 modules)

**Pricing Models**:
- **Free Modules**: 25 modules (WytPass Auth, Payment Core, Content uploaders, etc.)
- **Premium Modules**: 13 modules with monthly subscription (₹29-₹249/month)
- **Usage-Based Modules**: 13 modules with per-transaction/API call pricing (₹0.023/GB to ₹5/verification)

**Module Contexts**: Platform, Hub, App, Game - determines where modules can be activated
**Dependencies**: Modules can require other modules (e.g., Email OTP depends on WytPass Auth + Email Service)

#### WytHubs (5 Active Hubs)
**Hub Types**:
1. **WytEngine** (engine.wytnet.com): Platform control center for Super Admins
2. **WytNet.com** (wytnet.com): Public platform portal and marketplace
3. **ClanNet** (clannet.org): Community and social hub
4. **MemberNet** (membernet.in): Membership management hub
5. **VoterNet** (voternet.co): Civic engagement hub

**Multi-Domain Routing**: Automatic hub detection based on domain with DNS configuration
**Hub Tenancy**: Row Level Security (RLS) ensures complete data isolation between hubs
**Hub Pricing**: Free for 1 hub, ₹999/month per additional hub

**Hub Management**:
- Super Admin creates hubs via Engine Admin
- Hub Admin manages branding, apps, modules, settings
- Hub-level RBAC with 5 roles (Super Admin, Hub Admin, Hub Manager, Content Manager, Member)

### VitePress Editing Workflow
**Development**: `npm run docs:dev` for live preview with hot reload
**Building**: `npm run docs:build` to generate static site in `docs/.vitepress/dist/`
**Content Editing**: Direct markdown file editing in `docs/en/` and `docs/ta/` directories
**Navigation Updates**: Edit `docs/.vitepress/config.ts` for sidebar and top navigation
**Branding**: Logo and favicon in `docs/public/` directory

Comprehensive VitePress editing guide available at `/en/implementation/vitepress-guide`

### Authentication System (Triple Method)
1. **Password Authentication**: External developers use `DOC_SITE_PASSWORD` env var
2. **Super Admin Session**: Automatic access for logged-in Engine Admin users via WytPass session
3. **Replit Agent Token**: API access using `DOC_SITE_API_TOKEN` Bearer token for AI Assistant

### Access URLs
- **Login Page**: `/devdoc-login`
- **Documentation**: `/devdoc/`
- **Session API**: `/api/devdoc/session`
- **Auth Endpoint**: `/devdoc-auth` (POST)

### Environment Variables
- `DOC_SITE_PASSWORD`: **REQUIRED** - Password for external developer access (no default for security)
- `DOC_SITE_API_TOKEN`: **REQUIRED** - Bearer token for Replit Agent (no default for security)

**Security Note**: Both environment variables MUST be set before the server starts. The server will fail to start if they are missing to prevent unauthorized access.

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
- **VitePress**: Documentation site generator with Vue-based SSG.

## AI and Machine Learning
- **OpenAI API**: GPT-4 integration.
- **Anthropic API**: Claude 3.5 Sonnet integration.
- **Google AI Studio API**: Gemini 2.0 Flash and 1.5 Pro integration.

## Runtime and Deployment
- **Node.js**: JavaScript runtime.
- **Express.js**: Web application framework.
- **ws library**: WebSocket support.