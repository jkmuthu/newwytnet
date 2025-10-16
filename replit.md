# Overview

WytNet is built on a strategic foundation called **"Engine"** - a white-label, multi-tenant SaaS infrastructure providing low-code tools for application building, content management, and cross-tenant hub creation. The Engine includes CRUD builders, a CMS, app composition, hub aggregation, and the WytID Universal Identity & Validation system.

**Philosophy: "We are the first user of our own tools"**  
WytNet.com itself is the first Hub built on the Engine, demonstrating our commitment to using the same infrastructure we provide to our customers. This approach validates our tools and ensures we build features that genuinely work.

The platform offers white-label authentication (Google OAuth, Email OTP), role-based access control, comprehensive multi-tenancy with Row Level Security, and a blockchain-anchored identity system. Built as a monorepo with Express.js, React, and PostgreSQL with Drizzle ORM, WytNet aims to be a robust and scalable solution for SaaS applications.

## Architecture Hierarchy

```
Engine (wytnet.com/engine)
├── Infrastructure Foundation
├── Module Management
├── Super Admin Controls
└── Core Services
    ↓
WytNet Hub (wytnet.com)
├── First Implementation
├── Marketing & Content
├── Hub-specific Features
└── Customer-facing Interface
    ↓
Customer Hubs
└── Built using same Engine
```

# User Preferences

Preferred communication style: Simple, everyday language.
Focus: Fully white-label multi-tenant SaaS platform with identity validation.

# System Architecture

## Frontend Architecture
The frontend uses React 18, TypeScript, and Vite, styled with Tailwind CSS and shadcn/ui components. Wouter handles routing, and TanStack Query manages server state. It supports component-based builders for modules, CMS, apps, and hubs.

## Backend Architecture
The backend is an Express.js application with TypeScript, providing RESTful APIs for authentication, dashboard, and CRUD operations. Authentication uses WytPass OAuth (Google, Email OTP, Email/Password) with session-based authentication. Role-based access control and tenant isolation are enforced at the database level.

## Data Storage Architecture
PostgreSQL is the primary database, using Drizzle ORM. Multi-tenancy is implemented via `tenant_id` columns and Row Level Security. Core tables manage tenants, users, models, content, applications, and hubs, with junction tables handling complex entity relationships.

## Modular Architecture
The system is organized into self-contained packages (`kernel`, `builder`, `cms`, `appkit`, `hubkit`) within a monorepo, facilitating independent development.

## Security Architecture
Security includes PostgreSQL Row Level Security, session-based authentication with httpOnly cookies, role-based access control, CSRF protection, and Zod schema validation.

### User Role Hierarchy
The platform implements a three-tier authentication system:
- **Super Admin (Engine Level)**: Full access to Engine administration at `/engine/*`, manages infrastructure, modules, and global settings. Has `isSuperAdmin: true` flag.
- **Hub Owner (Hub Level)**: Administrative access to their specific Hub (e.g., WytNet Hub admin), manages hub content, settings, and activated modules. Uses `/admin` routes for hub management.
- **Hub Users (End Users)**: Regular users who access hub features and applications. Standard authentication with hub-specific permissions.

## UI/UX Decisions
The platform features modern UI elements like animated gradient backgrounds, glassmorphism cards, micro animations, and responsive designs. UTM tracking is standardized for external links.

## Key Features & Implementations
- **AI App Builder**: An admin-only, OpenAI-powered tool for natural language app creation.
- **Context-Based Module System**: A WordPress-style plugin architecture where modules are self-contained, context-aware components that can be activated/deactivated across different contexts (Platform, Hub, App, Game). It includes dependency management, conflict detection, and API exposure. Modules are enforced at both backend (middleware guards) and frontend (React hooks) layers.
  - **Engine-Level Modules**: Core infrastructure modules (category: 'platform-core', 'auth', 'data') that are always active at Engine level, providing foundational services like authentication, database, and core APIs.
  - **Hub-Level Modules**: Feature modules that can be selectively activated per Hub, App, or Game, allowing customization of capabilities per tenant.
  - **Module Hierarchy**: Engine provides the foundation → WytNet Hub selects its modules → Customer Hubs inherit or customize further.
- **White-label API Proxy Gateway**: A unified API gateway that proxies third-party services (e.g., Mappls, Digio) under WytNet branding, handling request/response transformation, credential management, and error handling. It also includes native WytData modules for geographic, internationalization, and business reference data.
- **Module Seeding System**: An auto-seeding system that syncs module definitions from a `MODULE_CATALOG` in code to the database on server startup, ensuring consistency and version control.
- **Dual App Architecture**: Distinguishes between Composed Apps (admin-created from multiple modules) and Module Apps (individual features/tools from platform modules, acting as marketplace items).

## Enhanced Module & App Management System
The platform implements comprehensive version control and access management for both Modules and Apps:

### Version Control & History Tracking
- **Version Management**: All modules and apps track version numbers (e.g., '1.0.0'), version history arrays, and changelogs
- **Edit History**: Automatic logging of all changes to name, description, route, category, contexts, and restrictedTo fields
- **Audit Trail**: Complete edit history with editor information, timestamps, old/new values stored in `module_edit_history` and `app_edit_history` tables
- **UI Display**: Version badges, changelog sections, and version history timelines in management interfaces

### Route & URL Management
- **Custom Routes**: Modules and Apps can have custom routes/URLs (e.g., `/auth`, `/payments/razorpay`, `/content/editor`)
- **Route Editor**: Admin UI allows editing routes with validation and history tracking
- **Route Redirects**: System tracks route changes to maintain backward compatibility

### Context-Based Access Control
- **Module Contexts**: Modules specify where they can be activated: Platform, Hub, App, or Game
- **App Contexts**: Apps define their activation contexts (typically Hub and App)
- **Granular Restrictions**: `restrictedTo` field enforces specific access levels:
  - **Engine-Only**: Core platform modules restricted to Engine administration (e.g., payment-core, analytics-engine, audit-logs)
  - **Hub-Only**: Hub-specific features (e.g., hub-aggregator)
  - **App-Only**: Application-specific modules
  - **Game-Only**: Gaming context modules
- **UI Controls**: Checkbox interfaces for context and restriction management in admin panels

### API Endpoints for Management
- **PATCH /api/modules/:moduleId/update** - Update module fields with edit history tracking
- **PATCH /api/apps/:appId/update** - Update app fields with edit history tracking
- **GET /api/modules/:moduleId/history** - Retrieve complete edit history for a module
- **GET /api/apps/:appId/history** - Retrieve complete edit history for an app

### Implementation Details
- **Database Schema**: Enhanced `platform_modules` and `apps` tables with version, versionHistory, changelog, route, contexts, and restrictedTo columns
- **Edit History Tables**: Dedicated `module_edit_history` and `app_edit_history` tables track field-level changes
- **Zod Validation**: Updated insert/select schemas for type-safe operations
- **Module Catalog**: All 45 modules in MODULE_CATALOG include version, changelog, route, and restriction information
- **Admin UI**: Enhanced management interfaces display version info, allow route editing, show edit history, and provide context/restriction controls

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