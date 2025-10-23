---
requiredLevel: internal
---

# Engine Admin Panel Guide

## Overview

The Engine Admin Panel is the central control center for managing the entire WytNet platform at the super admin level. It provides comprehensive tools for managing modules, apps, hubs, users, roles, permissions, and platform-wide settings.

**Access Level**: Super Admin only

**URL**: `https://wytnet.com/engine-admin`

---

## Table of Contents

1. [Current Implementation Status](#current-implementation-status) ⚡ **NEW**
2. [Dashboard](#dashboard)
3. [Module Management](#module-management)
4. [App Management](#app-management)
5. [Hub Management](#hub-management)
6. [User Management](#user-management)
7. [Roles & Permissions](#roles--permissions)
8. [Audit Logs](#audit-logs)
9. [Platform Settings](#platform-settings)
10. [WytAI Agent Integration](#wytai-agent-integration)
11. [Analytics & Reports](#analytics--reports)

---

## Current Implementation Status

> **Last Updated**: October 23, 2025  
> **Status**: ✅ Core Features Working | ⚠️ Self-Service Platform In Progress

### ✅ What's Currently Working

**Authentication & Authorization**
- ✅ **UniversalAuthHeader Integration** (October 2025)
  - Unified authentication across all portals (Public, Engine Admin, Hub Admin, Panel)
  - Consistent panel switcher with session validation
  - Single logout flow across all contexts
  - ~438 lines of duplicate code eliminated
  - Theme toggle, sidebar controls, branding preserved per portal

**Engine Admin Portal**
- ✅ **Server Running**: Port 5000, all services initialized
- ✅ **Routes**: 40+ AdminRouter routes configured and accessible
- ✅ **Pages**: 47 page component files verified
- ✅ **Sidebar Navigation**: 23 menu items properly configured
- ✅ **API Endpoints**: Major routers available (roles, platform-hubs, themes, integrations, media, platform-settings)

**Database & Services**
- ✅ PostgreSQL (Neon) database connected
- ✅ WytPass Unified Identity System active
- ✅ Multi-tenant Row Level Security enabled
- ✅ All platform services initialized (AI, Payment, Search, Assessment, etc.)

### ⚠️ Known Issues & Technical Debt

**Development Environment**
- ⚠️ **React Refresh Console Errors** (Non-Blocking)
  - Error: `The requested module '/@react-refresh' does not provide an export named 'injectIntoGlobalHook'`
  - **Impact**: Dev-only HMR warnings, does not affect functionality
  - **Cause**: Known Replit/Vite containerized environment incompatibility
  - **Workaround**: Cannot fix without modifying forbidden vite.config.ts
  - **Status**: Documented, frontend works correctly (200 OK)

**Code Quality**
- ⚠️ **routes.ts Type Suppressions**
  - File size: 12,527 lines
  - Type suppressions: 46 instances (`as any`, `@ts-ignore`, etc.)
  - **Impact**: Technical debt, no runtime errors
  - **Status**: Deferred to future technical debt sprint
  - **Note**: Server runs successfully despite type suppressions

### 🚀 Self-Service Platform Initiative (Phase 1-3)

The Engine Panel is undergoing transformation to enable **Super Admins to autonomously build features** without Replit Agent dependency.

**Phase 1: Engine Panel Consolidation** (In Progress)
- Reorganize navigation into 10 logical sections
- Standardize CRUD patterns with reusable templates
- Add breadcrumb navigation and global search
- Implement lazy loading and API documentation (/api/docs)

**Phase 2: WytAI Agent Full Page** (Planned)
- Transform floating widget to full-page interface
- Multi-modal input (text, voice, file upload)
- Code execution sandbox with syntax highlighting
- Conversation management with history and search
- Multi-AI support (GPT-4, Claude 3.5, Gemini 2.0)

**Phase 3: WytBuilder Platform** (Planned)
- Visual drag-drop Module Builder
- Code generation engine (Schema, API, UI)
- App Builder for multi-module composition
- Page Builder for custom UI creation
- Safe deployment pipeline with validation and rollback

**Documentation**: Complete technical specifications available in:
- `/docs/en/prd/self-service-platform.md` (Project Requirements)
- `/docs/en/architecture/wytbuilder.md` (WytBuilder Architecture)
- `/docs/en/architecture/wytai-agent.md` (WytAI Agent Architecture)
- `/docs/en/implementation/engine-panel-consolidation.md` (Phase 1 Guide)
- `/docs/en/implementation/wytai-full-page.md` (Phase 2 Guide)
- `/docs/en/implementation/wytbuilder-implementation.md` (Phase 3 Guide)

### 📊 Implementation Progress

| Component | Status | Progress | Notes |
|-----------|--------|----------|-------|
| **Core Infrastructure** |
| Server & Database | ✅ Complete | 100% | Running on port 5000, all services active |
| WytPass Authentication | ✅ Complete | 100% | Unified system across all portals |
| UniversalAuthHeader | ✅ Complete | 100% | Integrated in Admin, Hub Admin, Panel |
| Multi-Tenancy & RBAC | ✅ Complete | 100% | Row Level Security enabled |
| **Engine Admin Portal** |
| Dashboard | ✅ Working | 90% | Core metrics, activity feed |
| Module Management | ✅ Working | 85% | CRUD operations functional |
| App Management | ✅ Working | 85% | App catalog, installation |
| Hub Management | ✅ Working | 85% | Hub CRUD, domain routing |
| User Management | ✅ Working | 80% | User list, role assignment |
| Roles & Permissions | ✅ Working | 90% | 8 default roles, 80 permissions |
| Audit Logs | ✅ Working | 85% | Activity tracking, filtering |
| Platform Settings | ✅ Working | 80% | Global configuration |
| WytAI Agent (Floating) | ✅ Working | 70% | Basic chat, multi-AI support |
| Analytics & Reports | ⚡ Partial | 40% | Basic metrics available |
| **Self-Service Platform** |
| Phase 1: Consolidation | 🚧 In Progress | 15% | Planning complete, implementation started |
| Phase 2: WytAI Full Page | 📋 Planned | 0% | Architecture designed |
| Phase 3: WytBuilder | 📋 Planned | 0% | Architecture designed |

### 🔗 Quick Links

- **Engine Admin Portal**: `/engine`
- **DevDoc**: `/devdoc/` (Password: `Super*123`)
- **API Documentation**: `/api/docs` (Coming in Phase 1)
- **Features Checklist**: `/engine/features-checklist`
- **QA Testing Tracker**: `/engine/qa-tracker`

---

## Dashboard

### Overview Screen

The Engine Admin Dashboard provides a high-level overview of the entire platform.

**Key Metrics Displayed**

```
┌─────────────────────────────────────────────────────────────┐
│  WytNet Engine Admin Dashboard                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Platform Overview                                        │
│                                                              │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│  │ 12,458    │ │    45     │ │    28     │ │   120     │   │
│  │ Total     │ │ Platform  │ │  Active   │ │ Installed │   │
│  │ Users     │ │ Hubs      │ │ Modules   │ │   Apps    │   │
│  │ +8.5% ↑   │ │ +12.3% ↑  │ │ +2.1% →   │ │ +5.4% ↑   │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
│                                                              │
│  📈 Growth Trends (Last 30 Days)                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                        │   │
│  │  [Line chart showing user growth, hub creation, etc.] │   │
│  │                                                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ⚡ Recent Activity                                          │
│  • New hub created: "OwnerNet" by admin@wytnet.com          │
│  • Module activated: Razorpay Payment in Hub #PH0012        │
│  • User role updated: user@example.com → Hub Admin          │
│  • System setting changed: Email SMTP configuration         │
│                                                              │
│  🚨 Alerts & Notifications                                   │
│  • 5 pending posts awaiting moderation                      │
│  • 2 hubs pending domain verification                       │
│  • Security update available (v2.3.5)                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Navigation Menu**

```
Engine Admin
├── 📊 Dashboard
├── 🧩 Modules
├── 📦 Apps
├── 🏢 Platform Hubs
├── 👥 Users
├── 🔐 Roles & Permissions
├── 📝 Audit Logs
├── ⚙️ Platform Settings
├── 🤖 WytAI Agent
└── 📈 Analytics
```

---

## Module Management

Modules are lightweight plugins that add specific functionality to the platform. They can be activated at platform, hub, app, or game contexts.

### View All Modules

**Path**: Engine Admin > Modules

**Screenshot Description**:
```
┌─────────────────────────────────────────────────────────────┐
│  Modules Management                          [+ New Module] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Filters:                                                    │
│  Category: [All ▼] Status: [All ▼] Context: [All ▼]         │
│  Search: [________________]                                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ID: razorpay-payment   │ MD0001 │ [Edit] [Deactivate] │ │
│  │ Name: Razorpay Payment Gateway                         │ │
│  │ Category: Payment | Type: Integration                  │ │
│  │ Status: ✓ Enabled | Contexts: Platform, Hub, App      │ │
│  │ Version: 2.1.0 | Installs: 45 hubs                    │ │
│  │ Dependencies: payment-core                             │ │
│  │ Price: ₹299/month                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ID: calendar   │ MD0002 │ [Edit] [Activate]            │ │
│  │ Name: Event Calendar                                   │ │
│  │ Category: Productivity | Type: Feature                 │ │
│  │ Status: ⭕ Disabled | Contexts: Hub, App               │ │
│  │ Version: 1.5.2 | Installs: 12 hubs                    │ │
│  │ Dependencies: None                                     │ │
│  │ Price: Free                                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Pagination: 1 2 3 ... 10 Next →]                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Create a New Module

**Path**: Engine Admin > Modules > + New Module

**Workflow**:

1. Click **"+ New Module"** button
2. Fill in the module details form
3. Configure contexts and dependencies
4. Set pricing and access restrictions
5. Define API endpoints (if applicable)
6. Save the module

**Form Fields**:

```
┌─────────────────────────────────────────────────────────────┐
│  Create New Module                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Basic Information                                           │
│  ━━━━━━━━━━━━━━━━━━                                         │
│  Module ID: [____________________]  (e.g., stripe-payment)  │
│  Name:      [____________________]  (e.g., Stripe Payment)  │
│  Description: [___________________________________________]  │
│              [___________________________________________]  │
│                                                              │
│  Category:  [Payment        ▼]                              │
│  Type:      [Integration    ▼]                              │
│  Icon:      [Select Icon    ▼]  Color: [#0066FF]            │
│  Route:     [____________________]  (optional)              │
│                                                              │
│  Context Support                                             │
│  ━━━━━━━━━━━━━━━                                            │
│  ☑ Platform   ☑ Hub   ☐ App   ☐ Game                        │
│                                                              │
│  Dependencies                                                │
│  ━━━━━━━━━━━━━                                              │
│  Required Modules: [Select modules...         ▼]            │
│  Selected: payment-core, user-auth                           │
│                                                              │
│  API Endpoints                                               │
│  ━━━━━━━━━━━━━━                                             │
│  [+ Add Endpoint]                                            │
│  1. POST /api/stripe/create-checkout  Auth: ✓               │
│  2. POST /api/stripe/webhook         Auth: ✗               │
│                                                              │
│  Settings Schema                                             │
│  ━━━━━━━━━━━━━━━━                                           │
│  {                                                           │
│    "apiKeyRequired": true,                                   │
│    "webhookUrl": "string",                                   │
│    "currency": "INR"                                         │
│  }                                                           │
│                                                              │
│  Compatibility Matrix                                        │
│  ━━━━━━━━━━━━━━━━━━━━                                       │
│  Min Platform Version: [1.0.0]                               │
│  Conflicts With: [razorpay-payment]                          │
│                                                              │
│  Pricing & Access                                            │
│  ━━━━━━━━━━━━━━━━━                                          │
│  Pricing: ⚪ Free  ⚫ Paid  ⚪ Freemium                        │
│  Price:   [299] Currency: [INR ▼]                            │
│                                                              │
│  Access Restrictions:                                        │
│  ☐ Engine Only  ☐ Hub Only  ☐ App Only                       │
│                                                              │
│  Version Information                                         │
│  ━━━━━━━━━━━━━━━━━━━                                        │
│  Version:   [1.0.0]                                          │
│  Changelog: [___________________________________________]    │
│             [Initial release with Stripe integration]        │
│                                                              │
│  [Cancel]                              [Save as Draft] [Save]│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Edit Module

**Path**: Engine Admin > Modules > [Module] > Edit

**Key Actions**:

- Update name, description, route
- Change category or type
- Add/remove contexts
- Update dependencies
- Modify API endpoints
- Adjust pricing
- Upload new version

**Version Control**:

Every edit creates a new entry in the module's version history. The system tracks:
- Who made the change
- What field was changed
- Old value vs new value
- Timestamp of the change

**Edit History View**:

```
Version History
━━━━━━━━━━━━━━

Version 2.1.0 (Current) - Oct 20, 2025
• Added support for recurring payments
• Fixed webhook signature validation
• Updated dependencies

Version 2.0.0 - Sep 15, 2025
• Major: Added multi-currency support
• Breaking: Changed API response format

Version 1.5.2 - Aug 10, 2025
• Fixed: Memory leak in payment processor
• Improved error messages

[View Full Changelog]
```

### Activate/Deactivate Module

**Activation Workflow**:

1. Navigate to Modules list
2. Find the module to activate
3. Click **"Activate"** button
4. Select context (Platform/Hub/App/Game)
5. Configure module settings
6. Confirm activation

**Activation Modal**:

```
┌─────────────────────────────────────────────────────────────┐
│  Activate Module: Razorpay Payment                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Select Context:                                             │
│  ⚫ Platform Level (Global)                                  │
│  ⚪ Hub Level (Select specific hubs)                         │
│  ⚪ App Level (Select specific apps)                         │
│                                                              │
│  Module Settings:                                            │
│  ━━━━━━━━━━━━━━━━                                           │
│  Razorpay API Key:    [____________________________]         │
│  Razorpay Secret Key: [____________________________]         │
│  Webhook URL:         [auto-generated]                       │
│  Default Currency:    [INR ▼]                                │
│                                                              │
│  ☑ Enable for all existing hubs                             │
│  ☐ Notify hub admins of new feature                         │
│                                                              │
│  Dependencies Check:                                         │
│  ✓ payment-core (v1.2.0) - Already activated                │
│  ✓ user-auth (v2.0.1) - Already activated                   │
│                                                              │
│  [Cancel]                                      [Activate]    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Deactivation**:

When deactivating a module:
- System checks if any hubs/apps are using it
- Warns about impact on dependent modules
- Offers migration path if applicable
- Allows scheduling deactivation for future date

---

## App Management

Apps are larger, more complex applications that can be installed on hubs. Unlike modules, apps have their own UI, routes, and complete feature sets.

### View All Apps

**Path**: Engine Admin > Apps

**Screenshot Description**:

```
┌─────────────────────────────────────────────────────────────┐
│  Apps Management                                [+ New App]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Status: [All ▼]  Category: [All ▼]  Search: [__________]   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [App Icon] WytMatch Dating App          AP0001         │ │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │ Status: ✓ Published | Version: 3.2.1                   │ │
│  │ Description: AI-powered matchmaking platform           │ │
│  │ Categories: Social, Dating, AI                         │ │
│  │ Pricing: Freemium (₹499/month pro)                     │ │
│  │ Installs: 23 hubs | Active: 21 hubs                    │ │
│  │ Route: /wytmatch | Contexts: Hub                       │ │
│  │                                                        │ │
│  │ [View Details] [Edit] [Unpublish]                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [App Icon] WytCommerce E-store         AP0002         │ │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │ Status: 📝 Draft | Version: 1.0.0-beta                │ │
│  │ Description: Full-featured e-commerce platform         │ │
│  │ Categories: Commerce, Payment                          │ │
│  │ Pricing: ₹999/month                                    │ │
│  │ Installs: 0 hubs | Active: 0 hubs                      │ │
│  │ Route: /store | Contexts: Hub, App                     │ │
│  │                                                        │ │
│  │ [View Details] [Edit] [Publish]                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Create a New App

**Path**: Engine Admin > Apps > + New App

**Workflow**:

1. Click **"+ New App"**
2. Enter app basic information
3. Configure app manifest (features, routes, permissions)
4. Set pricing and visibility
5. Upload app icon and screenshots
6. Save as draft or publish immediately

**Form Structure**:

```
┌─────────────────────────────────────────────────────────────┐
│  Create New App                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Basic Information                                           │
│  ━━━━━━━━━━━━━━━━━━                                         │
│  App Key:        [____________________] (unique ID)          │
│  App Name:       [____________________]                      │
│  Description:    [___________________________________]        │
│  Tagline:        [___________________________________]        │
│                                                              │
│  Categories:     [Select categories...        ▼]            │
│  Selected: Social, Networking                                │
│                                                              │
│  Media                                                       │
│  ━━━━━━                                                     │
│  Icon: [Upload 512x512 PNG]  [Current: none]                │
│  Screenshots: [Upload] (Max 5 images)                        │
│                                                              │
│  App Configuration                                           │
│  ━━━━━━━━━━━━━━━━━━                                         │
│  Version:        [1.0.0]                                     │
│  Route:          [/myapp]                                    │
│  Contexts:       ☑ Hub  ☑ App  ☐ Game                       │
│                                                              │
│  App Manifest (JSON):                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ {                                                      │ │
│  │   "features": ["messaging", "notifications"],          │ │
│  │   "requiredModules": ["user-auth", "real-time"],       │ │
│  │   "permissions": ["users:view", "messages:create"],    │ │
│  │   "routes": [                                          │ │
│  │     { "path": "/dashboard", "component": "Dashboard" } │ │
│  │   ]                                                    │ │
│  │ }                                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Pricing & Visibility                                        │
│  ━━━━━━━━━━━━━━━━━━━                                        │
│  Pricing Model:  ⚪ Free  ⚫ Paid  ⚪ Freemium                │
│  Price:          [999] Currency: [INR ▼]                     │
│  Billing:        [Monthly ▼]                                 │
│                                                              │
│  Visibility:     ⚫ Public  ⚪ Private  ⚪ Unlisted            │
│                                                              │
│  Access Restrictions:                                        │
│  ☐ Engine Only  ☑ Hub Only  ☐ Specific Hubs                 │
│                                                              │
│  Status:         ⚪ Draft  ⚫ Published                       │
│                                                              │
│  [Cancel]                              [Save Draft] [Publish]│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Publish/Unpublish Apps

**Publishing Workflow**:

1. Ensure app is complete (all required fields filled)
2. Review app manifest for errors
3. Run automated tests (if configured)
4. Click **"Publish"**
5. Optionally notify hub admins
6. App becomes available in marketplace

**Pre-Publish Checklist**:

```
✓ App name and description provided
✓ Icon uploaded (512x512px)
✓ At least 3 screenshots
✓ Valid manifest JSON
✓ All required modules available
✓ Pricing information complete
✗ Terms of service accepted
⚠ No version history (first release)

[Fix Issues Before Publishing]
```

**Unpublishing**:

- Stops new installations
- Existing installations continue to work
- Hub admins can still manage installed instances
- Option to force-remove from all hubs (requires confirmation)

### App Settings & Configuration

**App Detail View**:

```
┌─────────────────────────────────────────────────────────────┐
│  WytMatch Dating App (AP0001)                    [Edit] [⋮]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tabs: Overview | Installs | Analytics | Settings | Logs]  │
│                                                              │
│  Overview                                                    │
│  ━━━━━━━━                                                   │
│  Version: 3.2.1                                              │
│  Status: Published                                           │
│  Created: Jan 15, 2024                                       │
│  Last Updated: Oct 18, 2025                                  │
│                                                              │
│  Description:                                                │
│  AI-powered matchmaking platform with compatibility scoring, │
│  real-time chat, and video calls.                            │
│                                                              │
│  Categories: Social, Dating, AI                              │
│  Route: /wytmatch                                            │
│  Contexts: Hub                                               │
│                                                              │
│  Statistics                                                  │
│  ━━━━━━━━━━                                                 │
│  Total Installs: 23 hubs                                     │
│  Active Installs: 21 hubs (91.3%)                            │
│  Total Users: 8,542 users                                    │
│  Daily Active: 1,234 users                                   │
│  Revenue (MTD): ₹10,477                                      │
│                                                              │
│  Version History                                             │
│  ━━━━━━━━━━━━━━━                                            │
│  v3.2.1 (Current) - Oct 18, 2025                             │
│  • Bug fix: Video call disconnection issue                   │
│  • Performance: Faster profile loading                       │
│                                                              │
│  v3.2.0 - Oct 10, 2025                                       │
│  • Feature: AI compatibility score v2                        │
│  • Feature: Interest-based matching                          │
│                                                              │
│  [View Full Changelog]                                       │
│                                                              │
│  Required Modules                                            │
│  ━━━━━━━━━━━━━━━━                                           │
│  ✓ user-auth (v2.0+)                                         │
│  ✓ real-time-messaging (v1.5+)                               │
│  ✓ media-upload (v1.0+)                                      │
│  ✓ video-call (v2.1+)                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Hub Management

Hubs are multi-tenant instances that can be created and managed from the Engine Admin Panel.

### View All Platform Hubs

**Path**: Engine Admin > Platform Hubs

**Screenshot Description**:

```
┌─────────────────────────────────────────────────────────────┐
│  Platform Hubs                              [+ Create Hub]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Status: [All ▼]  Verified: [All ▼]  Search: [__________]   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🏢 OwnerNet Community                    PH0001         │ │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │ Slug: ownernet                                         │ │
│  │ Domain: ownernet.wytnet.com ✓ Verified                 │ │
│  │ Custom: ownernet.com ✓ Verified                        │ │
│  │ Status: ✓ Active | Members: 2,458 | Admins: 5          │ │
│  │ Modules: 12 active | Apps: 3 installed                 │ │
│  │ Created: Mar 12, 2024 by admin@wytnet.com              │ │
│  │                                                        │ │
│  │ [Manage] [Analytics] [Settings] [⋮]                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🏢 TechHub Chennai                       PH0002         │ │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │ Slug: techhub                                          │ │
│  │ Domain: techhub.wytnet.com ✓ Verified                  │ │
│  │ Custom: None                                           │ │
│  │ Status: ✓ Active | Members: 845 | Admins: 3            │ │
│  │ Modules: 8 active | Apps: 2 installed                  │ │
│  │ Created: Jun 5, 2024 by founder@techhub.com            │ │
│  │                                                        │ │
│  │ [Manage] [Analytics] [Settings] [⋮]                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🏢 StartupConnect                        PH0003         │ │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │ Slug: startupconnect                                   │ │
│  │ Domain: startup.wytnet.com ⏳ Pending verification     │ │
│  │ Custom: startupconnect.in ⚠️ DNS not configured        │ │
│  │ Status: ⚠️ Inactive | Members: 12 | Admins: 1          │ │
│  │ Modules: 4 active | Apps: 0 installed                  │ │
│  │ Created: Oct 1, 2025 by hello@startupconnect.in        │ │
│  │                                                        │ │
│  │ [Activate] [Analytics] [Settings] [⋮]                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Create a New Hub

**Path**: Engine Admin > Platform Hubs > + Create Hub

**Workflow**:

1. Click **"+ Create Hub"**
2. Fill in basic hub information
3. Configure domain settings (subdomain/custom domain)
4. Set up branding (logo, colors, theme)
5. Choose initial modules to activate
6. Assign hub admin(s)
7. Create the hub

**Creation Form**:

```
┌─────────────────────────────────────────────────────────────┐
│  Create New Hub                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Basic Information                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━                                │
│                                                              │
│  Hub Slug:       [____________________] .wytnet.com          │
│                  (Unique identifier, lowercase, no spaces)   │
│                                                              │
│  Hub Name:       [____________________]                      │
│                  (Display name for your hub)                 │
│                                                              │
│  Description:    [___________________________________]        │
│                  [___________________________________]        │
│                                                              │
│  Tagline:        [___________________________________]        │
│                  (Short, catchy description)                 │
│                                                              │
│  Step 2: Domain Configuration                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━                               │
│                                                              │
│  Subdomain:      [ownernet].wytnet.com                       │
│                  ✓ Available                                 │
│                                                              │
│  Custom Domain:  [____________________]  (optional)          │
│                  ⚠️ Requires DNS configuration               │
│                                                              │
│  Step 3: Branding                                            │
│  ━━━━━━━━━━━━━━━━                                           │
│                                                              │
│  Logo:           [Upload 200x200 PNG] [None selected]       │
│  Favicon:        [Upload 32x32 ICO]   [None selected]       │
│                                                              │
│  Brand Colors:                                               │
│  Primary:   [#FF6B00] 🎨                                     │
│  Secondary: [#1A1A1A] 🎨                                     │
│  Accent:    [#00D9FF] 🎨                                     │
│                                                              │
│  Theme:     ⚫ Light  ⚪ Dark  ⚪ Auto                         │
│                                                              │
│  Step 4: Features & Modules                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━                                │
│                                                              │
│  Core Features (Always included):                            │
│  ☑ User Authentication (WytPass)                            │
│  ☑ User Profiles & Management                               │
│  ☑ Basic CMS                                                │
│                                                              │
│  Additional Modules (Select to activate):                    │
│  ☑ WytWall (Social Commerce Feed)                           │
│  ☑ WytMatch (Matchmaking Engine)                            │
│  ☐ Calendar & Events                                        │
│  ☐ Razorpay Payment                                         │
│  ☐ WhatsApp Integration                                     │
│  ☐ Email Marketing                                          │
│                                                              │
│  Step 5: Settings                                            │
│  ━━━━━━━━━━━━━━━                                            │
│                                                              │
│  Visibility:         ⚫ Public  ⚪ Private  ⚪ Unlisted        │
│  Require Approval:   ⚪ Yes    ⚫ No                          │
│  Self Signup:        ⚫ Allowed ⚪ Disabled                   │
│                                                              │
│  Locale:    [English (India) ▼]                             │
│  Timezone:  [Asia/Kolkata    ▼]                             │
│                                                              │
│  Step 6: Hub Admin Assignment                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━                                │
│                                                              │
│  Assign Admin:  [Search user by email...        ▼]          │
│  Selected: admin@ownernet.com                                │
│                                                              │
│  ☑ Send welcome email with login instructions               │
│  ☑ Grant full hub admin permissions                         │
│                                                              │
│  [← Back]                              [Cancel] [Create Hub] │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Domain Management

**Subdomain Configuration**:

All hubs get a free subdomain: `{slug}.wytnet.com`

**Custom Domain Setup**:

1. Navigate to Hub > Settings > Domain
2. Enter custom domain (e.g., `ownernet.com`)
3. System generates DNS records
4. Update DNS at your domain registrar
5. Wait for verification (automatic, checks every 5 minutes)
6. Once verified, SSL certificate is auto-generated

**DNS Configuration Screen**:

```
┌─────────────────────────────────────────────────────────────┐
│  Custom Domain Configuration                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Domain: ownernet.com                                        │
│  Status: ⏳ Awaiting DNS verification                        │
│                                                              │
│  Add these DNS records at your domain registrar:            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Record Type │ Name │ Value                 │ TTL       │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ A           │ @    │ 103.21.58.12          │ 3600      │ │
│  │ CNAME       │ www  │ ownernet.wytnet.com   │ 3600      │ │
│  │ TXT         │ @    │ wytnet-verify=abc123  │ 3600      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Copy All Records] [Check Verification Status]             │
│                                                              │
│  Verification Progress:                                      │
│  ✓ Domain ownership verified                                │
│  ⏳ DNS propagation (may take 24-48 hours)                   │
│  ⏳ SSL certificate generation                               │
│                                                              │
│  [← Back] [Manual Verification] [Need Help?]                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Hub Branding

**Branding Editor**:

```
┌─────────────────────────────────────────────────────────────┐
│  Hub Branding - OwnerNet                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tabs: Logo | Colors | Theme | Advanced]                    │
│                                                              │
│  Logo & Favicon                                              │
│  ━━━━━━━━━━━━━━                                             │
│                                                              │
│  Main Logo (Appears in header)                               │
│  ┌──────────────┐                                           │
│  │ [Logo Image] │ [Upload New] [Remove]                     │
│  │              │                                            │
│  └──────────────┘                                            │
│  Recommended: 200x60px PNG with transparency                 │
│                                                              │
│  Favicon (Browser tab icon)                                  │
│  ┌────┐                                                      │
│  │[F] │ [Upload New] [Remove]                                │
│  └────┘                                                      │
│  Recommended: 32x32px ICO or PNG                             │
│                                                              │
│  Color Scheme                                                │
│  ━━━━━━━━━━━━                                               │
│                                                              │
│  Primary Color:   [#FF6B00] 🎨                               │
│  Used for: Buttons, links, highlights                        │
│                                                              │
│  Secondary Color: [#1A1A1A] 🎨                               │
│  Used for: Text, headers, backgrounds                        │
│                                                              │
│  Accent Color:    [#00D9FF] 🎨                               │
│  Used for: Notifications, badges, highlights                 │
│                                                              │
│  Success Color:   [#00B87C] 🎨                               │
│  Error Color:     [#FF3B30] 🎨                               │
│  Warning Color:   [#FFA500] 🎨                               │
│                                                              │
│  [Reset to Defaults] [Preview Changes]                       │
│                                                              │
│  Preview                                                     │
│  ━━━━━━━                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [LOGO] OwnerNet         🔍 Search    Login  Signup     │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │                                                        │ │
│  │  Welcome to OwnerNet Community                         │ │
│  │  Connect with property owners...                       │ │
│  │                                                        │ │
│  │  [Join Now 🎨]  [Learn More]                           │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Cancel]                                            [Save]  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Hub Module Management

**Activate/Deactivate Modules for a Hub**:

Path: Engine Admin > Platform Hubs > [Hub] > Modules

```
┌─────────────────────────────────────────────────────────────┐
│  Hub Modules - OwnerNet                    [+ Add Module]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Active Modules (12)                                         │
│  ━━━━━━━━━━━━━━━                                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ✓ WytWall (Social Commerce Feed)                       │ │
│  │   Activated: Mar 12, 2024 by admin@ownernet.com        │ │
│  │   Posts: 2,458 | Users: 1,234                          │ │
│  │   [Configure] [Deactivate]                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ✓ Razorpay Payment Gateway                             │ │
│  │   Activated: Mar 15, 2024 by admin@ownernet.com        │ │
│  │   Transactions: 345 | Revenue: ₹1,23,456               │ │
│  │   [Configure] [Deactivate]                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Available Modules (16)                                      │
│  ━━━━━━━━━━━━━━━━━━                                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⭕ Calendar & Events                                    │ │
│  │   Organize events and manage bookings                   │ │
│  │   Price: Free                                           │ │
│  │   [Activate]                                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⭕ WhatsApp Integration                                 │ │
│  │   Send notifications and messages via WhatsApp          │ │
│  │   Price: ₹199/month                                     │ │
│  │   [Activate]                                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## User Management

Manage all platform users, assign roles, view activity, and handle user accounts.

### View All Users

**Path**: Engine Admin > Users

**Screenshot Description**:

```
┌─────────────────────────────────────────────────────────────┐
│  User Management                         [+ Create User]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Filters:                                                    │
│  Role: [All ▼] Status: [All ▼] Verified: [All ▼]            │
│  Search: [____________________] [🔍 Search]                  │
│                                                              │
│  [Bulk Actions ▼]  [Export CSV] [Export Excel]              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☐ [Avatar] John Doe                     UR0000001      │ │
│  │    john@example.com | +91-9876543210                   │ │
│  │    Role: User | ✓ Verified | Last Login: 2 hours ago   │ │
│  │    Joined: Mar 15, 2024 | WytPoints: 1,234             │ │
│  │    Hubs: OwnerNet, TechHub                             │ │
│  │    [View Profile] [Edit] [Assign Role] [⋮]             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☐ [Avatar] Sarah Admin                 UR0000042      │ │
│  │    sarah@wytnet.com | +91-9123456789                   │ │
│    Role: Super Admin | ✓ Verified | Last Login: Now       │ │
│  │    Joined: Jan 1, 2024 | WytPoints: 8,542              │ │
│  │    Admin of: OwnerNet (PH0001), TechHub (PH0002)       │ │
│  │    [View Profile] [Edit] [Revoke Admin] [⋮]            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Showing 1-20 of 12,458 users                                │
│  [◄ Prev] [1] [2] [3] ... [623] [Next ►]                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### User Detail View

**Path**: Engine Admin > Users > [User]

```
┌─────────────────────────────────────────────────────────────┐
│  User Profile: John Doe (UR0000001)          [Edit] [⋮]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tabs: Overview | Activity | Roles | Permissions | Hubs]   │
│                                                              │
│  Profile Information                                         │
│  ━━━━━━━━━━━━━━━━━━━                                        │
│  [Avatar]                                                    │
│  Name: John Doe                                              │
│  Email: john@example.com ✓ Verified                          │
│  WhatsApp: +91-9876543210                                    │
│  Display ID: UR0000001                                       │
│                                                              │
│  Account Status                                              │
│  ━━━━━━━━━━━━━━                                             │
│  Status: ✓ Active                                            │
│  Verified: Yes                                               │
│  Profile Complete: 85%                                       │
│  Created: Mar 15, 2024                                       │
│  Last Login: Oct 20, 2025 10:30 AM                           │
│                                                              │
│  Roles & Permissions                                         │
│  ━━━━━━━━━━━━━━━━━━━                                        │
│  Primary Role: User                                          │
│  Is Super Admin: No                                          │
│  Is Hub Admin: Yes (2 hubs)                                  │
│                                                              │
│  Assigned Roles:                                             │
│  • Hub Admin (OwnerNet PH0001) - Assigned Mar 15, 2024      │
│  • Content Moderator (TechHub PH0002) - Assigned Jun 1, 2024│
│                                                              │
│  Hub Memberships                                             │
│  ━━━━━━━━━━━━━━━━                                           │
│  • OwnerNet (PH0001) - Admin - Joined Mar 15, 2024          │
│  • TechHub (PH0002) - Moderator - Joined Jun 1, 2024        │
│                                                              │
│  Statistics                                                  │
│  ━━━━━━━━━━                                                 │
│  WytPoints: 1,234 pts                                        │
│  WytStars: ⭐⭐⭐ (Level 3)                                   │
│  Total Posts: 45 (32 offers, 13 needs)                      │
│  Total Comments: 123                                         │
│  Connections: 89 users                                       │
│                                                              │
│  Authentication Methods                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━                                     │
│  • Email/Password ✓                                          │
│  • Google OAuth ✓                                            │
│  • LinkedIn OAuth ✗                                          │
│  • Email OTP ✓                                               │
│                                                              │
│  Recent Activity (Last 10)                                   │
│  ━━━━━━━━━━━━━━━━                                           │
│  • Posted new offer "iPhone 15 for sale" - 2 hours ago      │
│  • Liked post P0234 - 3 hours ago                            │
│  • Commented on post P0189 - 5 hours ago                     │
│  • Updated profile - Yesterday                               │
│  • Logged in from Chrome/Windows - Yesterday                 │
│                                                              │
│  Actions                                                     │
│  ━━━━━━━                                                    │
│  [Assign Role] [Edit Profile] [Reset Password]              │
│  [View Sessions] [Ban User] [Delete Account]                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Assign Roles to Users

**Path**: Engine Admin > Users > [User] > Assign Role

```
┌─────────────────────────────────────────────────────────────┐
│  Assign Roles to John Doe (UR0000001)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Current Roles (2)                                           │
│  ━━━━━━━━━━━━━━                                             │
│  • Hub Admin (OwnerNet) - Engine scope                       │
│  • Content Moderator (TechHub) - Hub scope                   │
│                                                              │
│  Add New Role                                                │
│  ━━━━━━━━━━━━                                               │
│                                                              │
│  Select Role: [Choose role...                ▼]             │
│                                                              │
│  Available Roles:                                            │
│  ⚪ Super Admin (Engine scope)                               │
│     Full platform access                                     │
│                                                              │
│  ⚪ Platform Moderator (Engine scope)                        │
│     Moderate content across all hubs                         │
│                                                              │
│  ⚪ Hub Admin (Hub scope)                                    │
│     Manage specific hub                                      │
│     Select Hub: [Choose hub...            ▼]                │
│                                                              │
│  ⚪ Developer (Engine scope)                                 │
│     API access and integration management                    │
│                                                              │
│  ⚪ Custom Role                                              │
│     Create custom role with specific permissions             │
│                                                              │
│  Role Expiration (Optional)                                  │
│  ━━━━━━━━━━━━━━━━━━                                         │
│  ⚪ No expiration                                            │
│  ⚫ Expires on: [Oct 20, 2026] 📅                            │
│                                                              │
│  Permissions Preview                                         │
│  ━━━━━━━━━━━━━━━━━━━                                        │
│  This role will grant:                                       │
│  ✓ users:view, users:edit                                   │
│  ✓ hubs:view, hubs:edit                                     │
│  ✓ modules:view                                             │
│  ✗ system-security:* (restricted)                           │
│                                                              │
│  [Cancel]                                      [Assign Role] │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Roles & Permissions

Comprehensive RBAC (Role-Based Access Control) management.

### View All Roles

**Path**: Engine Admin > Roles & Permissions

```
┌─────────────────────────────────────────────────────────────┐
│  Roles & Permissions                     [+ Create Role]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tabs: Roles | Permissions | Assignments]                   │
│                                                              │
│  System Roles (Protected)                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━                                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🔒 Super Admin              RL00001  [View] [Edit⚠️]    │ │
│  │    Scope: Engine | Users: 3 | Status: Active           │ │
│  │    Full platform access with all permissions            │ │
│  │    Permissions: All 64 permissions                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🔒 Hub Admin                RL00002  [View] [Edit⚠️]    │ │
│  │    Scope: Hub | Users: 45 | Status: Active             │ │
│  │    Manage hub-level settings, users, and content        │ │
│  │    Permissions: 28 permissions (Hub scope)              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Custom Roles                                                │
│  ━━━━━━━━━━━━                                               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Content Moderator           RL00010  [View] [Edit] [×]  │ │
│  │    Scope: Hub | Users: 12 | Status: Active             │ │
│  │    Moderate posts and comments                          │ │
│  │    Permissions: 8 permissions                           │ │
│  │    Created: Jun 1, 2024 by admin@wytnet.com            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Developer                   RL00015  [View] [Edit] [×]  │ │
│  │    Scope: Engine | Users: 5 | Status: Active           │ │
│  │    API access and integration management                │ │
│  │    Permissions: 12 permissions                          │ │
│  │    Created: Aug 10, 2024 by admin@wytnet.com           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Create Custom Role

**Path**: Engine Admin > Roles & Permissions > + Create Role

```
┌─────────────────────────────────────────────────────────────┐
│  Create Custom Role                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Basic Information                                           │
│  ━━━━━━━━━━━━━━━━━━                                         │
│  Role Name:        [____________________]                    │
│  Description:      [___________________________________]     │
│                    [___________________________________]     │
│                                                              │
│  Scope:            ⚫ Engine  ⚪ Hub  ⚪ App                   │
│                                                              │
│  Status:           ⚫ Active  ⚪ Inactive                     │
│                                                              │
│  Permissions                                                 │
│  ━━━━━━━━━━━                                                │
│                                                              │
│  Select permissions for this role:                           │
│                                                              │
│  [Search permissions...]                                     │
│                                                              │
│  ▼ Users (4 permissions)                                     │
│    ☑ users:view       - View user information               │
│    ☑ users:create     - Create new users                    │
│    ☐ users:edit       - Edit user details                   │
│    ☐ users:delete     - Delete users                        │
│                                                              │
│  ▼ Hubs (4 permissions)                                      │
│    ☑ hubs:view        - View hub information                │
│    ☐ hubs:create      - Create new hubs                     │
│    ☐ hubs:edit        - Edit hub settings                   │
│    ☐ hubs:delete      - Delete hubs                         │
│                                                              │
│  ▼ Modules (4 permissions)                                   │
│    ☑ modules:view     - View module list                    │
│    ☐ modules:create   - Create new modules                  │
│    ☐ modules:edit     - Edit modules                        │
│    ☐ modules:delete   - Delete modules                      │
│                                                              │
│  ▶ Apps (4 permissions)                                      │
│  ▶ CMS (4 permissions)                                       │
│  ▶ Analytics (4 permissions)                                 │
│  ▶ System & Security (4 permissions)                         │
│  ... [Show all 16 resources]                                 │
│                                                              │
│  Selected: 5 permissions                                     │
│                                                              │
│  [Select All] [Deselect All] [Copy from existing role ▼]    │
│                                                              │
│  [Cancel]                              [Save Draft] [Create] │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Permission Matrix

**Path**: Engine Admin > Roles & Permissions > Permissions

```
┌─────────────────────────────────────────────────────────────┐
│  Permission Matrix                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  View: ⚫ By Resource  ⚪ By Role  ⚪ By User                  │
│                                                              │
│  Resource: Users                                             │
│  ━━━━━━━━━━━━━━━━                                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         │ Super  │ Hub    │ Content │ Developer │      │ │
│  │ Action  │ Admin  │ Admin  │ Mod     │           │      │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ View    │   ✓    │   ✓    │   ✓     │    ✓      │ PM01 │ │
│  │ Create  │   ✓    │   ✓    │   ✗     │    ✗      │ PM02 │ │
│  │ Edit    │   ✓    │   ✓    │   ✗     │    ✗      │ PM03 │ │
│  │ Delete  │   ✓    │   ✗    │   ✗     │    ✗      │ PM04 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Resource: Hubs                                              │
│  ━━━━━━━━━━━━━━━                                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         │ Super  │ Hub    │ Content │ Developer │      │ │
│  │ Action  │ Admin  │ Admin  │ Mod     │           │      │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ View    │   ✓    │   ✓    │   ✓     │    ✓      │ PM17 │ │
│  │ Create  │   ✓    │   ✗    │   ✗     │    ✗      │ PM18 │ │
│  │ Edit    │   ✓    │   ✓    │   ✗     │    ✗      │ PM19 │ │
│  │ Delete  │   ✓    │   ✗    │   ✗     │    ✗      │ PM20 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Export Matrix as CSV] [Export as Excel]                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Audit Logs

Track all administrative actions for security and compliance.

### View Audit Logs

**Path**: Engine Admin > Audit Logs

```
┌─────────────────────────────────────────────────────────────┐
│  Audit Logs                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Filters:                                                    │
│  User: [All ▼] Action: [All ▼] Resource: [All ▼]            │
│  Date Range: [Oct 1, 2025] to [Oct 20, 2025] 📅             │
│  Search: [____________________]                              │
│                                                              │
│  [Export Logs] [Advanced Search]                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🟢 CREATE | User                                        │ │
│  │ User: admin@wytnet.com (UR0000001)                      │ │
│  │ Action: Created new user "john@example.com"             │ │
│  │ Resource ID: UR0000123                                  │ │
│  │ IP: 103.21.58.12 | Browser: Chrome/Windows             │ │
│  │ Timestamp: Oct 20, 2025 10:30:15 AM                     │ │
│  │ Details: { email: "john@example.com", role: "user" }    │ │
│  │ [View Full Details]                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🔵 UPDATE | Module                                      │ │
│  │ User: sarah@wytnet.com (UR0000042)                      │ │
│  │ Action: Activated module "razorpay-payment"             │ │
│  │ Resource ID: MD0001                                     │ │
│  │ Context: Hub PH0001 (OwnerNet)                          │ │
│  │ IP: 103.21.58.45 | Browser: Safari/macOS               │ │
│  │ Timestamp: Oct 20, 2025 09:15:42 AM                     │ │
│  │ [View Full Details]                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🔴 DELETE | Hub                                         │ │
│  │ User: admin@wytnet.com (UR0000001)                      │ │
│  │ Action: Deleted hub "OldCommunity"                      │ │
│  │ Resource ID: PH0099                                     │ │
│  │ Reason: "Hub inactive for 90+ days"                     │ │
│  │ IP: 103.21.58.12 | Browser: Chrome/Windows             │ │
│  │ Timestamp: Oct 19, 2025 04:20:18 PM                     │ │
│  │ [View Full Details] [Restore]                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Showing 1-20 of 5,482 logs                                  │
│  [◄ Prev] [1] [2] [3] ... [275] [Next ►]                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Action Types**:

- 🟢 CREATE - New resource created
- 🔵 UPDATE - Resource updated
- 🔴 DELETE - Resource deleted
- 🟡 LOGIN - User login
- 🟣 PERMISSION - Permission/role change
- ⚪ VIEW - Sensitive data accessed

---

## Platform Settings

Global platform configuration and system settings.

### System Settings

**Path**: Engine Admin > Platform Settings

```
┌─────────────────────────────────────────────────────────────┐
│  Platform Settings                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tabs: General | Email | Payment | Security | API | Advanced]
│                                                              │
│  General Settings                                            │
│  ━━━━━━━━━━━━━━━━━                                          │
│                                                              │
│  Platform Name:      [WytNet                    ]            │
│  Platform Tagline:   [Connect, Create, Grow     ]            │
│  Support Email:      [support@wytnet.com        ]            │
│  Admin Email:        [admin@wytnet.com          ]            │
│                                                              │
│  Default Locale:     [English (India)    ▼]                 │
│  Default Timezone:   [Asia/Kolkata       ▼]                 │
│  Default Currency:   [INR ▼]                                 │
│                                                              │
│  Email Settings                                              │
│  ━━━━━━━━━━━━━━                                             │
│                                                              │
│  SMTP Host:          [smtp.gmail.com            ]            │
│  SMTP Port:          [587                       ]            │
│  SMTP Username:      [notifications@wytnet.com  ]            │
│  SMTP Password:      [••••••••••••             ] [Change]   │
│  From Name:          [WytNet Platform           ]            │
│  From Email:         [noreply@wytnet.com        ]            │
│                                                              │
│  ☑ Enable email notifications                               │
│  ☑ Send welcome emails to new users                         │
│  ☐ Send weekly digest emails                                │
│                                                              │
│  [Test Email Configuration]                                  │
│                                                              │
│  Payment Settings                                            │
│  ━━━━━━━━━━━━━━━━                                           │
│                                                              │
│  Default Payment Gateway: [Razorpay ▼]                       │
│                                                              │
│  Razorpay Configuration:                                     │
│  API Key:            [rzp_test_••••••••        ]             │
│  Secret Key:         [••••••••••••             ]             │
│  Webhook Secret:     [••••••••••••             ]             │
│                                                              │
│  ☑ Enable test mode                                         │
│  ☐ Enable automatic refunds                                 │
│                                                              │
│  Security Settings                                           │
│  ━━━━━━━━━━━━━━━━━                                          │
│                                                              │
│  ☑ Enforce HTTPS                                            │
│  ☑ Enable CORS                                              │
│  ☑ Rate limiting enabled                                    │
│  ☐ Require 2FA for admins                                   │
│  ☐ IP whitelist for admin panel                             │
│                                                              │
│  Session Timeout:    [7 days           ▼]                   │
│  Password Policy:    [Strong           ▼]                   │
│  Max Login Attempts: [5                ]                     │
│  Lockout Duration:   [15 minutes       ]                     │
│                                                              │
│  API Settings                                                │
│  ━━━━━━━━━━━                                                │
│                                                              │
│  API Base URL:       [https://api.wytnet.com    ]            │
│  API Version:        [v1                        ]            │
│                                                              │
│  Rate Limits:                                                │
│  - Public endpoints:  [100 req/min              ]            │
│  - Authenticated:     [1000 req/min             ]            │
│  - Admin:             [10000 req/min            ]            │
│                                                              │
│  ☑ Enable API documentation (Swagger)                       │
│  ☑ Enable GraphQL endpoint                                  │
│                                                              │
│  [Cancel]                      [Save Changes]                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## WytAI Agent Integration

Manage WytAI Agent settings and monitor AI-powered features.

### WytAI Configuration

**Path**: Engine Admin > WytAI Agent

```
┌─────────────────────────────────────────────────────────────┐
│  WytAI Agent Management                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tabs: Overview | Configuration | Usage | Training]         │
│                                                              │
│  WytAI Status                                                │
│  ━━━━━━━━━━━━                                               │
│  Status: 🟢 Active | Version: 2.3.0                          │
│  Provider: OpenAI GPT-4 Turbo                                │
│  Uptime: 99.8% (Last 30 days)                                │
│                                                              │
│  Configuration                                               │
│  ━━━━━━━━━━━━━                                              │
│                                                              │
│  AI Provider:        [OpenAI ▼]                              │
│  Model:              [gpt-4-turbo ▼]                         │
│  API Key:            [sk-••••••••••••          ] [Change]   │
│                                                              │
│  Features Enabled:                                           │
│  ☑ Smart Matching (WytMatch)                                │
│  ☑ Content Moderation (WytWall)                             │
│  ☑ Chatbot Support                                          │
│  ☑ Recommendation Engine                                    │
│  ☐ Predictive Analytics                                     │
│                                                              │
│  Model Parameters:                                           │
│  Temperature:        [0.7               ] (0-1)              │
│  Max Tokens:         [1000              ]                    │
│  Top P:              [0.9               ] (0-1)              │
│                                                              │
│  Usage Statistics (This Month)                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━                                 │
│                                                              │
│  Total API Calls:    45,678                                  │
│  Total Tokens Used:  12,345,678                              │
│  Estimated Cost:     $234.56                                 │
│                                                              │
│  Breakdown by Feature:                                       │
│  • Smart Matching:     18,234 calls (40%)                    │
│  • Content Moderation: 15,678 calls (34%)                    │
│  • Chatbot:            8,456 calls (19%)                     │
│  • Recommendations:    3,310 calls (7%)                      │
│                                                              │
│  Training Data                                               │
│  ━━━━━━━━━━━━━                                              │
│                                                              │
│  Custom Training Dataset:                                    │
│  • WytNet platform documentation                             │
│  • Historical user interactions                              │
│  • Community-specific knowledge                              │
│                                                              │
│  Last Training Update: Oct 15, 2025                          │
│  [Retrain Model] [Upload Custom Dataset]                     │
│                                                              │
│  [Save Configuration]                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Analytics & Reports

Platform-wide analytics and performance metrics.

### Analytics Dashboard

**Path**: Engine Admin > Analytics

```
┌─────────────────────────────────────────────────────────────┐
│  Platform Analytics                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Period: [Last 30 Days ▼]  Compare: [Previous Period ▼]     │
│                                                              │
│  Key Metrics                                                 │
│  ━━━━━━━━━━━                                                │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 12,458   │ │  45      │ │  28      │ │ 120      │       │
│  │ Users    │ │ Hubs     │ │ Modules  │ │ Apps     │       │
│  │ +8.5% ↑  │ │ +12.3% ↑ │ │ +2.1% →  │ │ +5.4% ↑  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  User Growth                                                 │
│  ━━━━━━━━━━━                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [Line chart: User registrations over time]            │   │
│  │                                                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Engagement Metrics                                          │
│  ━━━━━━━━━━━━━━━━━                                          │
│                                                              │
│  Daily Active Users (DAU):    3,456                          │
│  Weekly Active Users (WAU):   8,234                          │
│  Monthly Active Users (MAU):  12,458                         │
│                                                              │
│  Avg. Session Duration:       12m 34s                        │
│  Avg. Posts Per User:         3.2                            │
│  Avg. Comments Per Post:      4.5                            │
│                                                              │
│  Top Hubs by Activity                                        │
│  ━━━━━━━━━━━━━━━━━━━                                        │
│  1. OwnerNet - 8,542 active users                            │
│  2. TechHub Chennai - 2,134 active users                     │
│  3. StartupConnect - 1,782 active users                      │
│                                                              │
│  Top Modules by Usage                                        │
│  ━━━━━━━━━━━━━━━━━━━━                                       │
│  1. WytWall - 45 installations                               │
│  2. Razorpay Payment - 32 installations                      │
│  3. Calendar & Events - 28 installations                     │
│                                                              │
│  Revenue Overview                                            │
│  ━━━━━━━━━━━━━━━                                            │
│  Monthly Recurring Revenue: ₹2,34,567                        │
│  Total Revenue (MTD):       ₹1,23,456                        │
│  Revenue Growth:            +15.3% ↑                         │
│                                                              │
│  [Export Report] [Schedule Email Report]                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Common Admin Workflows

### Workflow 1: Onboard a New Hub

1. Go to **Engine Admin > Platform Hubs > + Create Hub**
2. Fill in hub details (slug, name, description)
3. Configure subdomain (auto: `{slug}.wytnet.com`)
4. Upload logo and set brand colors
5. Select initial modules to activate
6. Assign hub admin user
7. Click **"Create Hub"**
8. Hub is created and admin receives email invitation
9. Admin logs in and completes hub setup
10. Hub goes live

### Workflow 2: Activate a New Module Globally

1. Go to **Engine Admin > Modules**
2. Find the module to activate
3. Click **"Activate"**
4. Select **"Platform Level"** context
5. Configure module settings (API keys, etc.)
6. Check **"Enable for all existing hubs"** (optional)
7. Click **"Activate"**
8. Module is now available for all hubs

### Workflow 3: Assign Super Admin Role

1. Go to **Engine Admin > Users**
2. Search for the user
3. Click user to open profile
4. Click **"Assign Role"**
5. Select **"Super Admin"**
6. Review permissions (all 64 permissions)
7. Click **"Assign Role"**
8. User is now Super Admin

### Workflow 4: Moderate Flagged Content

1. Go to **Engine Admin > WytWall > Flagged Posts**
2. Review flagged post details
3. Read user reports and AI analysis
4. Make decision: Approve or Remove
5. If removing, select reason and ban duration
6. Click action button
7. User is notified of decision
8. Audit log entry created

---

## Best Practices

1. **Regular Backups**: Always backup before major changes
2. **Test in Staging**: Test modules/apps in staging before production
3. **Monitor Logs**: Review audit logs weekly
4. **Role Management**: Follow principle of least privilege
5. **Documentation**: Document all custom configurations
6. **Communication**: Notify users of major platform updates
7. **Performance**: Monitor platform performance metrics
8. **Security**: Keep all modules and platform updated

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Quick search (global) |
| `Ctrl + /` | Toggle sidebar |
| `G then D` | Go to Dashboard |
| `G then M` | Go to Modules |
| `G then H` | Go to Hubs |
| `G then U` | Go to Users |
| `Ctrl + S` | Save current form |
| `Esc` | Close modal |

---

## Support & Help

For Engine Admin support:

- **Documentation**: https://wytnet.com/docs/admin
- **Support Email**: engine-support@wytnet.com
- **Developer Slack**: wytnet-devs.slack.com
- **Status Page**: https://status.wytnet.com

For critical issues, contact: **critical@wytnet.com**
