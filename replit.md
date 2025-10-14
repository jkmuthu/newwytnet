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