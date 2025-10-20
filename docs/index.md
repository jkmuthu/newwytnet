---
layout: home
title: WytNet DevDoc
titleTemplate: Complete Developer Documentation

hero:
  name: WytNet
  text: Developer Documentation
  tagline: Complete technical documentation for the WytNet multi-tenant SaaS platform
  actions:
    - theme: brand
      text: Get Started →
      link: /en/core-concepts
    - theme: alt
      text: Implementation Guide →
      link: /en/implementation/replit-guide
    - theme: alt
      text: தமிழில் படிக்க →
      link: /ta/core-concepts
  image:
    src: /wytnet-logo.png
    alt: WytNet Logo

features:
  - icon: 🏗️
    title: Core Concepts
    details: Understand Entity → Module → App → Hub architecture and platform fundamentals
    link: /en/core-concepts
  - icon: 🔐
    title: WytPass Authentication
    details: Unified multi-method authentication with Google OAuth, Email OTP, and Email/Password
    link: /en/features/wytpass
  - icon: 🌐
    title: WytWall Social Commerce
    details: Peer-to-peer Needs & Offers marketplace with AI-powered matching
    link: /en/features/wytwall
  - icon: 📱
    title: MyWyt Apps
    details: App marketplace with WytLife, AI Directory, QR Generator, DISC Assessment
    link: /en/features/mywyt-apps
  - icon: 📊
    title: Database Schema
    details: Complete PostgreSQL schema with ERD diagrams, RLS policies, and Global Display IDs
    link: /en/architecture/database-schema
  - icon: 🏢
    title: Multi-tenancy & RLS
    details: Tenant isolation, Row Level Security, cross-tenant hub system
    link: /en/architecture/multi-tenancy
  - icon: 🔑
    title: RBAC System
    details: 64 permissions across 16 resources with 8 default roles
    link: /en/architecture/rbac
  - icon: ⚛️
    title: Frontend Architecture
    details: React + TypeScript, Wouter routing, TanStack Query, shadcn/ui
    link: /en/architecture/frontend
  - icon: 🛠️
    title: Backend Architecture
    details: Express.js server, middleware layers, storage interface pattern
    link: /en/architecture/backend
  - icon: 🔧
    title: API Reference
    details: Complete REST API documentation with TypeScript schemas
    link: /en/api/authentication
  - icon: 🎯
    title: Implementation Guide
    details: Step-by-step guide for Replit Assistant with code patterns
    link: /en/implementation/replit-guide
  - icon: 🎨
    title: Admin Panels
    details: Engine Admin (platform) and Hub Admin (hub-level) documentation
    link: /en/admin/engine-admin
---

## Quick Navigation

<div class="vp-doc">

### 📚 Documentation Sections

#### Introduction
- **[Platform Overview](/en/overview)** - High-level platform introduction
- **[Core Concepts](/en/core-concepts)** - Entity → Module → App → Hub hierarchy

#### Features
- **[WytPass Authentication](/en/features/wytpass)** - Google OAuth, Email OTP, Email/Password
- **[User Registration & Panel](/en/features/user-registration)** - User journey and dashboard
- **[WytWall](/en/features/wytwall)** - Social commerce Needs & Offers feed
- **[MyWyt Apps](/en/features/mywyt-apps)** - App marketplace and management
- **[WytLife](/en/features/wytlife)** - Life events & milestones tracking
- **[AI Directory](/en/features/ai-directory)** - Curated AI tools database
- **[QR Generator](/en/features/qr-generator)** - QR code creation and analytics
- **[DISC Assessment](/en/features/disc-assessment)** - Personality profiling tool

#### Architecture
- **[Database Schema](/en/architecture/database-schema)** - Complete schema with ERD diagrams
- **[Multi-tenancy & RLS](/en/architecture/multi-tenancy)** - Tenant isolation and security
- **[RBAC System](/en/architecture/rbac)** - 64 permissions and role management
- **[Frontend Architecture](/en/architecture/frontend)** - React, TanStack Query patterns
- **[Backend Architecture](/en/architecture/backend)** - Express.js, middleware, services

#### API Reference
- **[Authentication APIs](/en/api/authentication)** - Register, login, OAuth endpoints
- **[User APIs](/en/api/users)** - Profile, settings, notifications
- **[WytWall APIs](/en/api/wytwall)** - Posts, likes, comments, moderation
- **[Admin APIs](/en/api/admin)** - Modules, apps, hubs, roles, audit logs

#### Implementation
- **[Replit Assistant Guide](/en/implementation/replit-guide)** - Complete implementation checklist with code patterns and examples

#### Admin Panels
- **[Engine Admin Panel](/en/admin/engine-admin)** - Platform-level administration
- **[Hub Admin Panel](/en/admin/hub-admin)** - Hub-level management

### 🌐 Language Options

This documentation is available in:
- **English** (Current)
- **[தமிழ்](/ta/core-concepts)** - Tamil version (முழுமையான தமிழ் ஆவணப்படுத்தல்)

### 🎯 For Different Audiences

#### For Replit Assistant
Start with the **[Implementation Guide](/en/implementation/replit-guide)** - it has everything needed to implement features from this documentation with complete code examples and step-by-step procedures.

#### For Developers
1. Read [Core Concepts](/en/core-concepts) to understand the platform
2. Review [Frontend](/en/architecture/frontend) and [Backend](/en/architecture/backend) architecture
3. Check [API Reference](/en/api/authentication) for endpoint details
4. Use [Implementation Guide](/en/implementation/replit-guide) for coding patterns

#### For Platform Admins
1. Learn [RBAC System](/en/architecture/rbac) for permissions management
2. Review [Engine Admin Panel](/en/admin/engine-admin) documentation
3. Check [Multi-tenancy](/en/architecture/multi-tenancy) for tenant concepts

#### For Hub Admins
1. Review [Hub Admin Panel](/en/admin/hub-admin) documentation
2. Learn about [WytWall](/en/features/wytwall) moderation
3. Understand [MyWyt Apps](/en/features/mywyt-apps) activation

### 📖 About This Documentation

**Last Updated:** October 20, 2025  
**Version:** 1.0.0  
**Platform:** WytNet Engine

This documentation is:
- ✅ **Comprehensive** - Every feature, API, and architectural decision documented
- ✅ **Bilingual** - Full Tamil and English support
- ✅ **Implementation-Ready** - Code examples, schemas, and step-by-step guides
- ✅ **Visual** - Mermaid diagrams for workflows, architecture, and database relationships
- ✅ **Searchable** - Full-text search across all pages
- ✅ **Developer-Friendly** - TypeScript schemas, curl examples, frontend patterns

</div>

---

*Built with ❤️ for developers by the WytNet team*
