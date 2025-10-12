# Overview

WytNet is a fully white-label, production-ready multi-tenant SaaS platform foundation that provides a comprehensive suite of low-code tools for building applications, managing content, and creating cross-tenant hubs. The platform features CRUD builders, CMS functionality, app composition tools, hub aggregation capabilities, and a complete WytID Universal Identity & Validation system - all designed to work seamlessly in a multi-tenant architecture.

The system is built as a monorepo with Express.js backend, React frontend using Vite, and PostgreSQL with Drizzle ORM for data persistence. It now includes custom authentication (fully white-label), role-based access control, comprehensive multi-tenancy support with Row Level Security, and the complete WytID blockchain-anchored identity system.

**Latest Status (OAuth-Based Authentication):**
✅ **Modern OAuth Authentication** - Google OAuth and Email OTP (global best practices)
✅ **Email-Based System** - Removed mobile number concept, using email as primary identifier
✅ **Super Admin Access** - Dedicated admin portal at /admin with jkm@jkmuthu.com
✅ **WytPass Universal Identity** - OAuth-powered identity validation system
✅ **Production-ready architecture** - All core systems functional and integrated
✅ **Enterprise Structure Analysis** - Evaluated separated admin/client architecture vs unified approach
✅ **Architecture Decision** - Maintained unified structure for stability and zero-risk operation
✅ **Login Page Redesign** - Modern UI with micro animations, glassmorphism effects, and optimized layout

# User Preferences

Preferred communication style: Simple, everyday language.
Focus: Fully white-label multi-tenant SaaS platform with identity validation.

## Recent Updates (October 12, 2025)

**Login Page Improvements:**
- ✅ Restructured layout: Login/Register box moved to top, OAuth methods below
- ✅ Simplified route: All authentication now uses `/login` (removed `/wytpass-login`)
- ✅ Modern visual design: Animated gradient backgrounds, glassmorphism cards
- ✅ Micro animations: Blob animations, fade-in effects, hover transitions, gradient text
- ✅ Enhanced UX: Color-coded OAuth buttons (blue for Google, purple for Email OTP)
- ✅ Responsive design: Touch-friendly buttons with scale transforms on hover

## UTM Tracking Standard

All external links from WytNet must include UTM parameters for proper traffic attribution:
- **Source**: `wytnet` (mandatory for all external links)
- **Medium**: Context-specific (e.g., `ai_directory`, `hub`, `wytlife`, `qr_generator`, `referral`)
- **Campaign**: Purpose-specific (e.g., `ai_tools_referral`, `hub_referral`, `whatsapp_community`, `platform_traffic`)
- **Content**: Tool/feature name when applicable
- **Term**: Category or specific context when relevant

Use the `openExternalLink()` function from `/client/src/lib/utm.ts` for all external links instead of direct `window.open()` calls.

**Implementation**: All external links in AI Directory, WytHubs, WytLife, and other pages use UTM tracking with source=wytnet.

# Production Domain Setup

**✅ DOMAIN ACTIVE:** wytnet.com is now live and configured
- Custom domain: https://wytnet.com  
- Session cookies configured for `.wytnet.com`
- CORS policy set for production domain
- All future modules will deploy to this domain

# System Architecture

## Frontend Architecture
The frontend is built with React 18 and TypeScript, using Vite as the build tool and development server. The UI layer leverages Tailwind CSS for styling with shadcn/ui components providing a consistent design system. The application uses Wouter for client-side routing and TanStack Query for server state management and caching.

The frontend follows a component-based architecture with separate builders for different functionalities:
- Module Builder for CRUD operations using JSON DSL
- CMS Builder for drag-and-drop page creation
- App Builder for composing modules into applications
- Hub Builder for cross-tenant aggregation and marketplace creation

## Backend Architecture
The backend uses Express.js with TypeScript, serving both API endpoints and static files. The server implements a RESTful API architecture with dedicated routes for authentication, dashboard statistics, and CRUD operations for models, pages, apps, and hubs.

Authentication is handled through WytPass OAuth system with multiple methods: Google OAuth for social login, Email OTP for passwordless authentication, and traditional email/password. The system uses session-based authentication with PostgreSQL session storage and implements role-based access control with tenant isolation enforced at the database level.

## Data Storage Architecture
PostgreSQL is used as the primary database with Drizzle ORM for type-safe database operations. The database schema implements multi-tenancy using tenant_id columns with Row Level Security policies for data isolation.

Core database tables include:
- `tenants` for multi-tenant organization
- `users` for user management with tenant associations
- `models` for CRUD module definitions using JSON DSL
- `pages` and `blocks` for CMS content management
- `apps` and `app_installs` for application composition
- `hubs` for cross-tenant aggregation configurations

## Package-Based Modular Architecture
The system is organized into focused packages under the `/packages` directory:
- `kernel` - Core authentication, tenancy, and security utilities
- `builder` - CRUD module DSL validation and code generation
- `cms` - Content management system with block-based rendering
- `appkit` - Application composition and manifest management
- `hubkit` - Cross-tenant aggregation and hub management

Each package is self-contained with clear interfaces and version compatibility requirements, enabling independent development and testing.

## Security Architecture
Security is implemented through multiple layers:
- PostgreSQL Row Level Security for tenant data isolation
- Session-based authentication with httpOnly cookies
- Role-based access control with hierarchical permissions
- CSRF protection where needed
- Input validation using Zod schemas throughout the application

## Architecture Decision: Unified vs Separated Structure
**Analysis Completed (Sep 2025):** Evaluated enterprise-grade separated admin/client architecture:
- **Benefits:** Better security isolation, smaller client bundles, admin-optimized UI
- **Trade-offs:** Additional complexity, deployment coordination, monorepo tooling requirements
- **Decision:** Maintained unified structure for production stability and zero-risk operation
- **Current Approach:** Role-based access control with secure admin routes in unified application
- **Future Consideration:** Separated architecture viable for scaling beyond current requirements

# External Dependencies

## Database Integration
- **Neon Database**: Serverless PostgreSQL database via `@neondatabase/serverless`
- **Drizzle ORM**: Type-safe database operations and migrations with PostgreSQL dialect

## Authentication Services  
- **WytPass OAuth**: Multi-method authentication system (Google OAuth, Email OTP, Email/Password)
- **Google OAuth**: Official Google OAuth 2.0 integration for social login
- **MSG91 Email OTP**: Passwordless email OTP authentication via MSG91 service
- **Session Storage**: PostgreSQL-backed session management using `connect-pg-simple`

## UI and Styling Framework
- **shadcn/ui**: Comprehensive React component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Accessible component primitives for complex UI interactions

## State Management and API Integration
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form handling with Zod schema validation
- **Wouter**: Lightweight client-side routing for React

## Development and Build Tools
- **Vite**: Fast build tool and development server with React plugin
- **TypeScript**: Type-safe development across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds

## Runtime and Deployment
- **Node.js**: Runtime environment with ES modules support
- **Express.js**: Web application framework for API and static file serving
- **WebSocket Support**: Real-time capabilities via ws library for database connections