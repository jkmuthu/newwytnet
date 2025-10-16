# Overview

WytNet is a white-label, multi-tenant SaaS platform providing low-code tools for application building, content management, and cross-tenant hub creation. It includes CRUD builders, a CMS, app composition, hub aggregation, and the WytID Universal Identity & Validation system. The platform offers white-label authentication (Google OAuth, Email OTP), role-based access control, comprehensive multi-tenancy with Row Level Security, and a blockchain-anchored identity system. Built as a monorepo with Express.js, React, and PostgreSQL with Drizzle ORM, WytNet aims to be a robust and scalable solution for SaaS applications.

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

## UI/UX Decisions
The platform features modern UI elements like animated gradient backgrounds, glassmorphism cards, micro animations, and responsive designs. UTM tracking is standardized for external links.

## Key Features & Implementations
- **AI App Builder**: An admin-only, OpenAI-powered tool for natural language app creation.
- **Context-Based Module System**: A WordPress-style plugin architecture where modules are self-contained, context-aware components that can be activated/deactivated across different contexts (Platform, Hub, App, Game). It includes dependency management, conflict detection, and API exposure. Modules are enforced at both backend (middleware guards) and frontend (React hooks) layers.
- **White-label API Proxy Gateway**: A unified API gateway that proxies third-party services (e.g., Mappls, Digio) under WytNet branding, handling request/response transformation, credential management, and error handling. It also includes native WytData modules for geographic, internationalization, and business reference data.
- **Module Seeding System**: An auto-seeding system that syncs module definitions from a `MODULE_CATALOG` in code to the database on server startup, ensuring consistency and version control.
- **Dual App Architecture**: Distinguishes between Composed Apps (admin-created from multiple modules) and Module Apps (individual features/tools from platform modules, acting as marketplace items).

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