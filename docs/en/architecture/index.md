---
requiredLevel: developer
---

# Architecture Overview

WytNet is built on a modular, scalable architecture designed for multi-tenancy, security, and extensibility. This section covers the technical architecture of the platform.

## System Architecture

WytNet follows a **hierarchical modular architecture** that builds from the smallest components to fully independent platforms:

```
Entity (நிறுவனம்)
  └─> Multiple Entities (Modules → Apps → Hubs)
      └─> Can Become: Multiple Modules (ஒரு App)
          └─> Configured with: B (Hub)
              └─> Users: Add to [WytNet.com User Panel]
                  └─> [MyPanel.com Org Panel]
```

## Key Architectural Components

### 1. Database Schema
WytNet uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema supports:
- Multi-tenancy with Row Level Security (RLS)
- Global Display IDs for human-readable entity identification
- Flexible entity-attribute-value (EAV) patterns for dynamic data

[View Database Schema Documentation →](/en/architecture/database-schema)

### 2. Multi-Tenancy & Row Level Security
Complete data isolation between hubs (tenants) using PostgreSQL's Row Level Security:
- `hub_id` field on every table
- Automatic RLS policies enforce tenant boundaries
- Single database, isolated queries
- GDPR & CCPA compliant data separation

[View Multi-Tenancy Documentation →](/en/architecture/multi-tenancy)

### 3. Role-Based Access Control (RBAC)
Granular permission system with 64 permissions across 16 resource sections:
- 8 default roles (Super Admin, Admin, Developer, etc.)
- Hub-level and Engine-level RBAC
- Protected API routes with permission checks
- Role hierarchy and inheritance

[View RBAC System Documentation →](/en/architecture/rbac)

### 4. Module Manifest Specification
Standardized module packaging and dependency management:
- JSON-based manifest files
- Version control and semantic versioning
- Dependency resolution
- API exposure and route registration

[View Module Manifest Specification →](/en/architecture/module-manifest)

### 5. Frontend Architecture
React-based single-page application with:
- TypeScript for type safety
- Vite for build tooling
- Wouter for routing
- TanStack Query for server state
- shadcn/ui component library
- Tailwind CSS for styling

[View Frontend Architecture →](/en/architecture/frontend)

### 6. Backend Architecture
Express.js backend with:
- TypeScript for type safety
- RESTful API design
- Session-based authentication
- Middleware for auth, RBAC, tenant isolation
- WebSocket support for real-time features

[View Backend Architecture →](/en/architecture/backend)

## Architecture Principles

### Speed
- ⚡ Optimized query patterns with Drizzle ORM
- 🚀 Edge-ready deployment architecture
- 📦 Lazy loading and code splitting
- 🔄 Efficient caching strategies

### Security
- 🔐 WytPass unified authentication
- 🛡️ Row Level Security for data isolation
- 🔒 RBAC with fine-grained permissions
- 🔑 Secure session management
- 🚫 CSRF protection

### Scale
- 🌐 Multi-tenant architecture
- 📊 Horizontal scalability ready
- 🏗️ Modular component system
- 🔌 Plugin architecture for extensions
- 💾 Optimized database schema

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (server state), React hooks (local state)
- **UI Components**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (Neon serverless)
- **Session Store**: PostgreSQL (connect-pg-simple)
- **Authentication**: Passport.js + WytPass OAuth

### Infrastructure
- **Database**: Neon PostgreSQL (serverless)
- **Hosting**: Replit (development & deployment)
- **CDN**: Cloudflare (optional for production)
- **Object Storage**: Google Cloud Storage
- **Email**: MSG91 Email API
- **SMS**: MSG91 SMS API

### AI & Machine Learning
- **OpenAI**: GPT-4o for WytAI Agent
- **Anthropic**: Claude 3.5 Sonnet for advanced reasoning
- **Google AI**: Gemini 2.0 Flash and 1.5 Pro

### Development Tools
- **Package Manager**: npm
- **Type Checking**: TypeScript compiler
- **Linting**: ESLint
- **Database Migrations**: Drizzle Kit
- **Documentation**: VitePress

## Related Documentation

- [Database Schema](/en/architecture/database-schema) - Complete database design
- [Multi-Tenancy](/en/architecture/multi-tenancy) - Tenant isolation patterns
- [RBAC System](/en/architecture/rbac) - Permission and role management
- [Frontend Architecture](/en/architecture/frontend) - React app structure
- [Backend Architecture](/en/architecture/backend) - Express API design
- [Module Manifest](/en/architecture/module-manifest) - Module packaging spec
