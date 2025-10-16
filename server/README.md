# Engine Core

**Conceptual Role:** Platform Infrastructure & Foundation

This directory represents the **Engine** - WytNet's white-label, multi-tenant SaaS infrastructure that powers all hubs.

## Architecture Position

```
Engine (this directory: /server)
├── Platform Infrastructure
├── Module System
├── Authentication & Authorization
└── Core APIs
    ↓
Hubs (implementations built on Engine)
└── WytNet Hub (/client)
    └── Customer Hubs (future)
```

## Philosophy

> "We are the first user of our own tools"

The Engine provides the foundation that WytNet.com and all customer hubs are built upon. Everything in this directory is **platform-level infrastructure** that enables hub creation and management.

## Directory Structure

### `/platform`
Core platform services and infrastructure:
- Express server setup
- Database configuration
- Session management
- Core middleware

### `/modules`
Module system implementation:
- Module registry
- Dependency management
- Context activation
- Module seeding

### `/auth`
Authentication infrastructure:
- Two-tier admin authentication (super admin + hub admin)
- WytPass OAuth integration
- Session stores (admin_sessions, hub_admin_sessions)
- Custom auth middleware

### Root Files
- `index.ts` - Main server entry point
- `routes.ts` - API route definitions
- `storage.ts` - Storage interface
- `vite.ts` - Vite integration (DO NOT MODIFY)

## Key Features

### 1. Super Admin Portal (`/engine/*`)
- **Access:** Platform infrastructure management
- **Session:** `admin.sid` cookie, `admin_sessions` table
- **Credentials:** `jkm@jkmuthu.com` / `SuperAdmin@2025`
- **Features:** Modules, Entities, Geo-Regulatory, Platform Registry

### 2. Hub Admin Portal (`/admin/*`)
- **Access:** Hub content management (for WytNet.com hub)
- **Session:** `hubadmin.sid` cookie, `hub_admin_sessions` table  
- **Credentials:** `hubadmin@wytnet.com` / `hubadmin123`
- **Features:** CMS, Media, Apps, Themes, Hub Settings

### 3. Module System
- 47+ platform modules (auth, payments, analytics, etc.)
- Context-based activation (Platform, Hub, App, Game)
- Dependency management and conflict detection
- Version control and edit history

### 4. WytEntities Knowledge Graph
- 31+ entity types across 10 categories
- Meta-layer above modules to prevent duplication
- Relationship mapping and intelligent tagging
- Wikipedia-style entity linking

### 5. Geo-Regulatory Controls
- Country/state-level compliance management
- Government monitoring (read-only)
- Data sovereignty controls
- Regional regulatory frameworks

## Technical Stack

- **Runtime:** Node.js + Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **Authentication:** Session-based with PostgreSQL stores
- **APIs:** RESTful endpoints

## Development Notes

⚠️ **DO NOT MODIFY:**
- `vite.ts` - Vite integration is pre-configured
- Build scripts expect this directory to be named `/server`

✅ **Safe to modify:**
- Add new routes in `routes.ts`
- Extend storage interface in `storage.ts`
- Add modules to module catalog
- Create new middleware for features

## Session Isolation

The Engine supports **triple session authentication**:
- Regular users (public hub access)
- Hub admins (hub content management)
- Super admins (platform infrastructure)

All three can be active simultaneously with complete isolation via separate cookies and session tables.
