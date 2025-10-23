# Overview

**WytNet.com** is an all-in-one digital platform designed to enhance both lifestyle and workstyle for individuals and organizations. Its mission is to create a connected digital ecosystem emphasizing speed, security, and scalability by unifying productivity, social networking, and intelligent automation. The platform aims to build a world where every task, connection, and opportunity is managed within a smart, trustworthy environment.

WytNet is a white-label, multi-tenant SaaS platform built on "Engine," a modular framework organizing components into **Modules → Apps → Hubs**. Key features include universal WytPass authentication, robust role-based access control (RBAC), comprehensive multi-tenancy with Row Level Security, a WytPoints economic system, and AI-powered automation via the WytAI Agent.

# User Preferences

Preferred communication style: Simple, everyday language.
Focus: Fully white-label multi-tenant SaaS platform with identity validation.

# System Architecture

## Frontend Architecture
The frontend uses React 18, TypeScript, Vite, Tailwind CSS, and shadcn/ui. Wouter handles routing, and TanStack Query manages server state. It supports component-based builders for modules, CMS, applications, and hubs, with a mobile-first responsive design, animated gradients, and glassmorphism elements.

## Backend Architecture
The backend is an Express.js application with TypeScript, providing RESTful APIs. WytPass OAuth (Google, Email OTP, Email/Password) provides session-based authentication, with RBAC and tenant isolation enforced at the database level.

## Data Storage Architecture
PostgreSQL is the primary database, managed by Drizzle ORM. Multi-tenancy is implemented using `tenant_id` columns and Row Level Security. A Global Display ID system provides human-readable, globally unique identifiers.

## Modular Architecture
The system is organized into self-contained packages (`kernel`, `builder`, `cms`, `appkit`, `hubkit`) within a monorepo. It features a context-based module system (Platform, Hub, App, Game contexts) with dependency management.

## Security Architecture
Security measures include PostgreSQL Row Level Security, session-based authentication with httpOnly cookies, role-based access control, CSRF protection, and Zod schema validation. A unified WytPass authentication system enables single-session access across authorized panels (WytNet, Engine Admin, Hub Admin, MyPanel, OrgPanel) with seamless switching.

## Key Features & Implementations
- **AI App Builder**: OpenAI-powered tool for natural language app creation (admin-only).
- **White-label API Proxy Gateway**: Unifies third-party service integration.
- **Enhanced Module & App Management System**: Includes version control, edit history, custom route management, and context-based access control.
- **White-Label Multi-Domain Hub System**: Manages platform hubs with multi-domain routing, SEO, branding, and hub-level RBAC.
- **Granular Roles & Permissions Management System**: Engine-level RBAC with fine-grained permissions and 8 default roles.
- **WytAI Agent**: An intelligent AI assistant embedded in the Engine Admin portal, offering conversational management via a floating chat widget. Supports multiple AI models (GPT-4o, Claude 3.5 Sonnet, Gemini 2.0) and voice input/output.
- **Audit Logs System**: Tracks administrative actions with a filterable UI.
- **Global Platform Settings System**: Comprehensive configuration management via API and UI.
- **Organizations Management API**: Full CRUD for organizations.
- **Progressive Web App (PWA) Support**: Full PWA implementation including service worker, manifest, and push notifications.
- **WytNet DevDoc (Developer Documentation System)**: Comprehensive bilingual (Tamil + English) technical documentation built with VitePress with **4-level RBAC** (Public, Developer, Internal, Admin) integrated with WytNet's permission system. Features API reference, architecture docs, workflow diagrams, implementation guides, **PRD (Project Requirements Documentation)**, **Chat History Archive**, and business strategy. Access managed through Engine Admin Panel with dual-layer authentication (WytPass + password backward compatibility).
- **Features Checklist System**: Project management tool with a dual-testing workflow for tracking feature implementations, accessible in the Engine Admin portal.
- **Content Architecture**: Features a robust system for WytApps (39 apps across 17 categories with flexible pricing), WytSuites (3 app bundles), WytModules (51 modules across 9 categories with various pricing models), and WytHubs (5 active hubs with multi-domain routing and hub-level RBAC).

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
- **VitePress**: Documentation site generator.

## AI and Machine Learning
- **OpenAI API**: GPT-4 integration.
- **Anthropic API**: Claude 3.5 Sonnet integration.
- **Google AI Studio API**: Gemini 2.0 Flash and 1.5 Pro integration.

## Runtime and Deployment
- **Node.js**: JavaScript runtime.
- **Express.js**: Web application framework.
- **ws library**: WebSocket support.