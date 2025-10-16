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

## Modular Architecture
The system is organized into self-contained packages (`kernel`, `builder`, `cms`, `appkit`, `hubkit`) within a monorepo. It features a context-based module system (WordPress-style) where modules are self-contained, context-aware components (Platform, Hub, App, Game) with dependency management and API exposure. This includes Engine-level (core infrastructure) and Hub-level modules (feature modules) and an auto-seeding system for module definitions.

## Security Architecture
Security includes PostgreSQL Row Level Security, session-based authentication with httpOnly cookies, role-based access control, CSRF protection, and Zod schema validation. A two-tier admin authentication system provides isolated sessions for Super Admins (Engine Portal) and Hub Admins (Hub Admin Portal), separate from regular user authentication, enabling triple session support.

### Multi-Context Panel Switcher
The platform supports seamless role/panel switching without re-authentication, similar to Google's account switcher. Users with multiple roles (e.g., Engine Admin, Hub Admin, Regular User) can switch between contexts from a unified dropdown menu. Each session type uses separate PostgreSQL session tables (`sessions`, `admin_sessions`, `hub_admin_sessions`) and distinct cookies (`connect.sid`, `admin.sid`, `hubadmin.sid`), allowing multiple active sessions simultaneously. The `/api/auth/contexts` endpoint detects all available contexts for the current user. Sessions persist for 7 days until explicit logout.

## UI/UX Decisions
The platform features modern UI elements like animated gradient backgrounds, glassmorphism cards, micro animations, and responsive designs. UTM tracking is standardized for external links.

## Key Features & Implementations
- **AI App Builder**: An admin-only, OpenAI-powered tool for natural language app creation.
- **White-label API Proxy Gateway**: A unified API gateway that proxies third-party services under WytNet branding, handling request/response transformation, credential management, and error handling.
- **Enhanced Module & App Management System**: Includes comprehensive version control (version numbers, history, changelogs), edit history tracking, custom route management with redirects, and context-based access control (`restrictedTo` fields for Engine-Only, Hub-Only, App-Only, Game-Only access).
- **AI-Assisted Module & App Improvement Workflow**: Integrates GPT-4 powered AI assistance into management interfaces for conversational support, quick actions (e.g., "Suggest Title," "Draft Changelog"), and one-click application of AI recommendations.

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