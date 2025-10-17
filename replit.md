# Overview

WytNet is built on "Engine," a white-label, multi-tenant SaaS infrastructure providing low-code tools for application building, content management, and cross-tenant hub creation. The platform offers CRUD builders, a CMS, app composition, hub aggregation, and the WytID Universal Identity & Validation system. WytNet.com serves as the first Hub built on the Engine, demonstrating the "first user of our own tools" philosophy. The platform includes white-label authentication, role-based access control, comprehensive multi-tenancy with Row Level Security, and a blockchain-anchored identity system, aiming to be a robust and scalable SaaS solution.

# User Preferences

Preferred communication style: Simple, everyday language.
Focus: Fully white-label multi-tenant SaaS platform with identity validation.

# System Architecture

## Frontend Architecture
The frontend uses React 18, TypeScript, Vite, Tailwind CSS, and shadcn/ui components. Wouter handles routing, and TanStack Query manages server state. It supports component-based builders for modules, CMS, apps, and hubs.

## Backend Architecture
The backend is an Express.js application with TypeScript, providing RESTful APIs for authentication, dashboard, and CRUD operations. Authentication uses WytPass OAuth (Google, Email OTP, Email/Password) with session-based authentication. Role-based access control and tenant isolation are enforced at the database level.

## Data Storage Architecture
PostgreSQL is the primary database, using Drizzle ORM. Multi-tenancy is implemented via `tenant_id` columns and Row Level Security. Core tables manage tenants, users, models, content, applications, and hubs, with junction tables handling complex entity relationships.

### Global Display ID System
The platform uses a unified Display ID system providing human-readable, globally unique identifiers across all entities. Format: 2-letter prefix + zero-padded number (e.g., UR0000001, OR00001). All Display IDs are generated using PostgreSQL sequences for concurrency safety and uniqueness. Key prefixes: UR (Users), OR (Organizations), TN (Tenants), EN (Entities), MD (Modules), AP (Apps), HB (Hubs), ME (Media), WI (WytID), ND (Needs), OF (Offers), AS (Assessments), TM (Trademarks).

## Modular Architecture
The system is organized into self-contained packages (`kernel`, `builder`, `cms`, `appkit`, `hubkit`) within a monorepo. It features a context-based module system (WordPress-style) where modules are self-contained, context-aware components (Platform, Hub, App, Game) with dependency management and API exposure. This includes Engine-level (core infrastructure) and Hub-level modules (feature modules) and an auto-seeding system for module definitions.

## Security Architecture
Security includes PostgreSQL Row Level Security, session-based authentication with httpOnly cookies, role-based access control, CSRF protection, and Zod schema validation. A two-tier admin authentication system provides isolated sessions for Super Admins (Engine Portal) and Hub Admins (Hub Admin Portal), separate from regular user authentication, enabling triple session support.

### Multi-Context Panel Switcher
The platform supports seamless role/panel switching without re-authentication, similar to Google's account switcher. Users with multiple roles (e.g., Engine Admin, Hub Admin, Regular User) can switch between contexts from a unified dropdown menu. Each session type uses separate PostgreSQL session tables (`sessions`, `admin_sessions`, `hub_admin_sessions`) and distinct cookies (`connect.sid`, `admin.sid`, `hubadmin.sid`), allowing multiple active sessions simultaneously. The `/api/auth/contexts` endpoint intelligently detects all available panels based on user access rights - checking both active sessions and database records to show all panels a user has access to, even if they don't have an active session in that context. The switcher displays active contexts with visual highlighting and allows instant switching between panels. Sessions persist for 7 days until explicit logout.

## UI/UX Decisions
The platform features modern UI elements like animated gradient backgrounds, glassmorphism cards, micro animations, and responsive designs. UTM tracking is standardized for external links.

## Key Features & Implementations
- **AI App Builder**: An admin-only, OpenAI-powered tool for natural language app creation.
- **White-label API Proxy Gateway**: A unified API gateway that proxies third-party services under WytNet branding, handling request/response transformation, credential management, and error handling.
- **Enhanced Module & App Management System**: Includes comprehensive version control (version numbers, history, changelogs), edit history tracking, custom route management with redirects, and context-based access control (`restrictedTo` fields for Engine-Only, Hub-Only, App-Only, Game-Only access).
- **AI-Assisted Module & App Improvement Workflow**: Integrates GPT-4 powered AI assistance into management interfaces for conversational support, quick actions (e.g., "Suggest Title," "Draft Changelog"), and one-click application of AI recommendations.
- **White-Label Multi-Domain Hub System** (October 2025): Comprehensive platform hub management with multi-domain routing (custom domains, subdomains, path-based), SEO configuration, branding customization, domain verification, and hub-level RBAC. Supports WytNet.com as primary hub (PH0000001) with verified custom domain. Includes hub routing middleware for automatic domain detection and context propagation.
- **Granular Roles & Permissions Management System** (October 2025): Complete engine-level RBAC with 64 fine-grained permissions across 16 resource sections (Users, Organizations, Entities, DataSets, Media, Modules, Apps, Hubs, CMS, Themes, Integrations, Pricing, Help & Support, Analytics, Roles & Permissions, System & Security). Features table-based permission matrix UI with CRUD checkboxes (View, Create, Edit, Delete), idempotent seeding service, 8 default roles (Super Admin, Admin, Viewer, Developer, Data Manager, Finance Manager, Hub Manager, Analyst), and protected API routes with `requirePermission` middleware. Role-specific permissions: Developer (modules/apps/themes/integrations CRUD), Data Manager (datasets/entities/media CRUD), Finance Manager (pricing/analytics CRUD + view-only users/orgs), Hub Manager (hubs/cms CRUD), Analyst (view-only all resources). Permissions identified by resource-action pairs (e.g., 'roles-permissions:view').
- **WytAI Agent** (October 2025): Intelligent AI assistant embedded in Engine Admin portal for conversational platform management. Floating chat widget (bottom-right, collapsible, mobile-responsive) with voice input/output supporting Tamil and English. Leverages GPT-4 with Engine context awareness (modules, apps, hubs) to provide actionable suggestions for improving existing features. Backend APIs at `/api/admin/wytai/chat` and `/api/admin/wytai/chat/stream` protected by adminAuthMiddleware. Features comprehensive settings page with Tamil documentation (capabilities, limitations, usage guidelines), keyboard shortcuts (Ctrl+K toggle, Esc close), attachment support (client-side preview with file metadata sent to GPT), Web Speech API integration for hands-free Tamil voice commands, and Text-to-Speech for Tamil responses. Clear separation of responsibilities: WytAI for frontend/UI improvements, Replit Agent for backend/infrastructure changes.
- **Audit Logs System** (October 2025): Comprehensive audit logging infrastructure tracking all administrative actions across the Engine admin portal. Features auditLogService with filtering, pagination, search, and user activity tracking. Admin UI at `/engine/audit-logs` provides real-time monitoring with stats cards (total events, active users, top actions), advanced filtering (action type, resource, date range, search), and detailed activity timeline with timestamps, IP addresses, and user agents. API endpoints protected by adminAuthMiddleware: `/api/admin/audit-logs` (paginated logs), `/api/admin/audit-logs/stats` (activity statistics), `/api/admin/audit-logs/user/:userId` (user-specific activity). Database schema stores tenantId, userId, action, resource, resourceId, details (JSONB), ipAddress, userAgent, and timestamps with indexed queries for performance. Super Admin-only access for security compliance and regulatory requirements.

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