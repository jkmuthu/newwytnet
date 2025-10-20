# Overview

WytNet is a white-label, multi-tenant SaaS platform built on "Engine," providing low-code tools for application building, content management, and cross-tenant hub creation. It offers CRUD builders, a CMS, app composition, hub aggregation, and the WytID Universal Identity & Validation system. WytNet.com serves as the initial hub, showcasing the platform's capabilities. The system features white-label authentication, role-based access control, comprehensive multi-tenancy with Row Level Security, and blockchain-anchored identity, designed for scalability and robustness.

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

## Developer Documentation Architecture

### Documentation Structure
- **VitePress Static Site**: Built documentation in `docs/.vitepress/dist/`
- **Bilingual Support**: Full Tamil (`/ta/`) and English (`/en/`) versions
- **20+ Pages**: Features, architecture, API reference, admin panels, implementation guide
- **Mermaid Diagrams**: Workflow visualizations and architecture diagrams
- **Search-Enabled**: Full-text search across all pages

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
- `DOC_SITE_PASSWORD`: Password for external developer access (default: `wytnet123`)
- `DOC_SITE_API_TOKEN`: Bearer token for Replit Agent (default: `replit-agent-token-12345`)

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