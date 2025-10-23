---
requiredLevel: internal
---

# Project Requirements Documentation (PRD)

:::info INTERNAL TEAM ACCESS
This section contains detailed project requirements, specifications, and planning documents. Access is restricted to the internal development team and Super Admins.
:::

## Document Overview

This PRD defines the complete requirements for the **WytNet Platform** - a white-label, multi-tenant SaaS platform that unifies productivity, social networking, and intelligent automation.

**Last Updated**: October 2025  
**Version**: 2.0  
**Status**: Active Development

---

## Table of Contents

1. [Product Vision & Goals](#product-vision--goals)
2. [Functional Requirements](#functional-requirements)
3. [Non-Functional Requirements](#non-functional-requirements)
4. [User Stories & Personas](#user-stories--personas)
5. [Technical Specifications](#technical-specifications)
6. [Success Metrics](#success-metrics)
7. [Roadmap & Milestones](#roadmap--milestones)

---

## Product Vision & Goals

### Vision Statement

Build a world where every task, connection, and opportunity happens in one smart environment powered by technology and trust.

### Mission

Create a connected digital ecosystem powered by **Speed | Security | Scale**. WytNet unifies productivity, social networking, and intelligent automation into a single platform.

### Core Value Proposition

**"Get In. Get Done."** - WytNet eliminates the friction of managing multiple tools, subscriptions, and identities by providing:

- **One Identity**: WytPass universal authentication across all apps
- **One Platform**: Unified ecosystem eliminating app-switching
- **One Payment**: Single subscription for all features
- **One Experience**: Consistent UX across all applications

### Primary Goals

1. **For End Users**: Provide seamless access to multiple applications with a single identity
2. **For Organizations**: Enable custom-branded platforms (Hubs) with white-label capabilities
3. **For Developers**: Offer modular framework for rapid app development and deployment
4. **For Platform**: Achieve product-market fit with 10K MAU within Year 1

---

## Functional Requirements

### FR1: Authentication & Identity (WytPass)

**Priority**: P0 (Critical)  
**Status**: ✅ Implemented

**Requirements**:
- Multi-method authentication (Google OAuth, Email OTP, Email/Password)
- Universal session management across all contexts (Engine Admin, Hub Admin, User panels)
- LinkedIn OAuth integration
- Session-based authentication with httpOnly cookies
- Password requirements: min 8 chars, uppercase, numbers, special chars
- Account verification via email

**Acceptance Criteria**:
- ✅ User can sign up using Google OAuth
- ✅ User can sign up using email/password
- ✅ User can log in with Email OTP (passwordless)
- ✅ Session persists across page refreshes
- ✅ User can seamlessly switch between admin panels without re-authentication

### FR2: Multi-Tenancy & Hub System

**Priority**: P0 (Critical)  
**Status**: ✅ Implemented

**Requirements**:
- Platform supports multiple independent hubs (tenants)
- Each hub has isolated data with Row Level Security (RLS)
- Hub-level branding (logo, colors, domain)
- Multi-domain routing (subdomain + custom domain + path-based)
- Cross-tenant hub access for Super Admins

**Acceptance Criteria**:
- ✅ Each hub has complete data isolation
- ✅ Hub can configure custom domain
- ✅ Hub can customize branding and appearance
- ✅ Users can only access data from their assigned hub
- ✅ Super Admin can access all hubs from Engine Admin

### FR3: RBAC (Role-Based Access Control)

**Priority**: P0 (Critical)  
**Status**: ✅ Implemented

**Requirements**:
- Granular permission system with resource-action model
- 80 permissions across 20 resources (64 core + 16 DevDoc)
- 8 default roles (Super Admin, Admin, Developer, Hub Manager, Data Manager, Finance Manager, Analyst, Viewer)
- Role assignment at user level
- Permission inheritance and aggregation for multi-role users

**Acceptance Criteria**:
- ✅ Super Admin has full platform access
- ✅ Hub Manager can only manage assigned hub
- ✅ Developer can access DevDoc at developer level
- ✅ Permissions are enforced at API and UI levels
- ✅ Multi-role users aggregate permissions correctly

### FR4: Module System

**Priority**: P0 (Critical)  
**Status**: ✅ Implemented

**Requirements**:
- 51 platform modules across 9 categories
- Module activation at platform, hub, and app levels
- Module manifest system with metadata (name, description, dependencies, version)
- Module composition into apps
- Module edit history and version control

**Acceptance Criteria**:
- ✅ Modules can be activated/deactivated per hub
- ✅ Modules declare dependencies in manifest
- ✅ Module changes are tracked in edit history
- ✅ Modules compose into functional apps

### FR5: App Marketplace & Management

**Priority**: P1 (High)  
**Status**: ✅ Implemented

**Requirements**:
- 39 WytApps across 17 categories
- App installation and subscription management
- Usage tracking per app
- App-level module activation
- Pricing plans (Free, Basic, Pro, Enterprise)

**Acceptance Criteria**:
- ✅ Users can browse app catalog
- ✅ Users can install apps to their panel
- ✅ App subscriptions are tracked
- ✅ Usage limits are enforced based on pricing plan
- ✅ Apps can be uninstalled

### FR6: WytWall (Social Commerce)

**Priority**: P1 (High)  
**Status**: ✅ Implemented

**Requirements**:
- Users can post Needs (what they're looking for)
- Users can post Offers (what they're offering)
- AI-powered matching between Needs and Offers
- Real-time feed with infinite scroll
- Like, comment, share functionality
- Privacy controls (public, connections only, private)

**Acceptance Criteria**:
- ✅ User can create Need/Offer posts
- ✅ Posts appear in WytWall feed
- ✅ AI matches Needs with relevant Offers
- ✅ Users can interact with posts (like, comment)
- ✅ Privacy settings are respected

### FR7: WytLife (Life Continuity Platform)

**Priority**: P1 (High)  
**Status**: ✅ Implemented

**Description**: WytLife is a revolutionary Life Continuity Platform enabling digital immortality through AI technology. Users create a "MyClone" - a living digital reflection powered by the proprietary "Soul Engine" AI.

**Requirements**:
- MyClone creation and management (digital twin of user)
- Soul Engine AI integration (personality modeling)
- Voice recording and replication
- Memory documentation and preservation
- Thought journaling system
- Continuous learning and personality refinement
- WytPass authentication integration
- WytPoints rewards for contributions
- Founding 1000 members program
- WhatsApp community integration

**Acceptance Criteria**:
- ✅ User can create WytPass account
- ✅ User can upload voice recordings for vocal modeling
- ✅ User can document memories and life experiences
- ✅ Soul Engine processes data to create personalized MyClone
- ✅ MyClone reflects user's personality and communication style
- ✅ Family members can interact with MyClone
- ✅ WytPoints awarded for building MyClone
- ✅ Founding members can join WhatsApp community
- ✅ Platform integrated with WytNet ecosystem (WytPass, WytPoints, WytStream, WytPage)

### FR8: Engine Admin Portal

**Priority**: P0 (Critical)  
**Status**: ✅ Implemented

**Requirements**:
- Dashboard with platform-wide analytics
- Module management (create, edit, activate, version control)
- App management (catalog, pricing plans, subscriptions)
- Hub management (create, configure, branding)
- User management (roles, permissions, search)
- Roles & Permissions management UI
- Audit logs viewer with filtering
- Platform settings configuration
- WytAI Agent integration

**Acceptance Criteria**:
- ✅ Super Admin can access all management functions
- ✅ Dashboard shows real-time platform metrics
- ✅ All CRUD operations are available for each entity
- ✅ Audit logs capture all administrative actions
- ✅ WytAI Agent provides conversational assistance

### FR9: WytAI Agent

**Priority**: P1 (High)  
**Status**: ✅ Implemented

**Requirements**:
- Floating chat widget in Engine Admin Portal
- Multi-model AI support (GPT-4o, Claude 3.5 Sonnet, Gemini 2.0)
- Voice input and output
- Context-aware responses based on admin session
- Platform documentation integration
- Conversation history per session

**Acceptance Criteria**:
- ✅ Chat widget accessible from all Engine Admin pages
- ✅ User can ask questions in natural language
- ✅ AI provides relevant, contextual responses
- ✅ Voice input works on supported browsers
- ✅ Conversation history persists during session

### FR10: DevDoc with RBAC

**Priority**: P2 (Medium)  
**Status**: ✅ Implemented

**Requirements**:
- Comprehensive developer documentation
- Bilingual support (English + Tamil)
- 4-level access control (Public, Developer, Internal, Admin)
- Integration with WytPass authentication
- Dynamic sidebar based on user permissions
- Password fallback for external developers

**Acceptance Criteria**:
- ✅ Public users see overview and core concepts only
- ✅ Developers see API docs and architecture
- ✅ Internal team sees admin guides and project docs
- ✅ Super Admin sees business strategy and chat history
- ✅ Sidebar filters based on user's role permissions

---

## Non-Functional Requirements

### NFR1: Performance

**Requirements**:
- Page load time < 2 seconds
- API response time < 500ms for 95th percentile
- Database query optimization with proper indexes
- Lazy loading for images and components
- Code splitting for frontend bundles
- CDN for static assets

**Metrics**:
- Lighthouse Performance Score > 90
- Time to Interactive (TTI) < 3s
- First Contentful Paint (FCP) < 1.5s

### NFR2: Security

**Requirements**:
- HTTPS enforcement for all traffic
- Session-based authentication with httpOnly cookies
- CSRF protection on all state-changing operations
- SQL injection prevention via parameterized queries
- XSS protection via input sanitization
- Row Level Security (RLS) for multi-tenancy
- Secrets management via environment variables
- Password hashing with bcrypt (10 rounds)

**Compliance**:
- SOC 2 Type II via Replit infrastructure
- GDPR-compliant data handling
- Audit logging for compliance tracking

### NFR3: Scalability

**Requirements**:
- Support 1M+ users within 3 years
- Horizontal scaling via Replit Autoscale Deployments
- Database connection pooling
- Caching strategy for frequently accessed data
- Async operations for long-running tasks
- WebSocket support for real-time features

**Targets**:
- 99.95% uptime SLA
- Support 10K concurrent users
- Database can handle 100K records per table

### NFR4: Maintainability

**Requirements**:
- TypeScript for type safety
- Comprehensive code documentation
- Drizzle ORM for database schema management
- Modular architecture for code reusability
- Consistent coding standards
- Git-based version control

**Standards**:
- All code reviewed before merge
- Unit test coverage > 70%
- Integration tests for critical paths
- Production standards documented

### NFR5: Usability

**Requirements**:
- Mobile-first responsive design
- Accessible UI (WCAG 2.1 Level AA)
- Consistent UX across all apps
- Dark mode support
- Intuitive navigation
- Clear error messages
- Loading states for async operations

**Metrics**:
- System Usability Scale (SUS) > 75
- Net Promoter Score (NPS) > 50
- Task completion rate > 90%

---

## User Stories & Personas

### Persona 1: End User (Ravi)

**Background**: 32-year-old small business owner in Chennai  
**Goals**: Manage business, connect with customers, track personal goals  
**Pain Points**: Too many apps, multiple subscriptions, scattered data

**User Stories**:

1. **As an end user**, I want to sign up with my Google account so I can get started quickly
   - **Acceptance**: One-click Google OAuth signup, profile auto-populated

2. **As an end user**, I want to access all my apps from one dashboard so I don't waste time switching platforms
   - **Acceptance**: Unified dashboard with all installed apps, single click to launch

3. **As an end user**, I want to post what I need on WytWall so relevant people can help me
   - **Acceptance**: Create Need post, AI matches with Offers, notifications for matches

### Persona 2: Hub Admin (Priya)

**Background**: Operations Manager at a property management company  
**Goals**: Customize platform for company, manage team access, monitor activity  
**Pain Points**: Generic software doesn't fit workflow, complex admin tools

**User Stories**:

1. **As a Hub Admin**, I want to customize my hub's branding so it matches my company identity
   - **Acceptance**: Upload logo, set colors, configure domain, preview changes

2. **As a Hub Admin**, I want to activate only relevant modules so my team isn't overwhelmed
   - **Acceptance**: Browse module catalog, activate/deactivate per hub, changes reflect immediately

3. **As a Hub Admin**, I want to assign roles to team members so permissions are managed properly
   - **Acceptance**: Search users, assign roles, permissions apply instantly

### Persona 3: Super Admin (Kumar)

**Background**: Platform founder and technical lead  
**Goals**: Monitor platform health, manage all hubs, make strategic decisions  
**Pain Points**: Need complete visibility, security concerns, scalability planning

**User Stories**:

1. **As a Super Admin**, I want to see platform-wide analytics so I can make data-driven decisions
   - **Acceptance**: Dashboard shows MAU, revenue, churn, hub metrics

2. **As a Super Admin**, I want to access any hub's admin panel so I can provide support
   - **Acceptance**: Panel switching menu, seamless context change, full permissions

3. **As a Super Admin**, I want audit logs for all administrative actions so I can ensure compliance
   - **Acceptance**: Searchable audit log, filter by user/action/date, export capability

---

## Technical Specifications

### Tech Stack

**Frontend**:
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- Wouter (routing)
- TanStack Query (server state)
- React Hook Form + Zod (forms)

**Backend**:
- Node.js + Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL (Neon)
- Session-based authentication
- WebSocket (ws library)

**Infrastructure**:
- Replit Deployment (Autoscale)
- Google Cloud Platform
- Neon Serverless PostgreSQL
- Replit Object Storage

**AI/ML**:
- OpenAI GPT-4o
- Anthropic Claude 3.5 Sonnet
- Google Gemini 2.0 Flash

### Database Schema

**Core Tables**:
- `users` - User accounts with WytPass authentication
- `tenants` - Hub/organization data
- `roles` - RBAC role definitions
- `permissions` - Granular permission definitions
- `user_roles` - User-role assignments
- `role_permissions` - Role-permission mappings
- `platform_modules` - Module catalog
- `platform_hubs` - Hub configurations
- `apps_registry` - App catalog
- `audit_logs` - Compliance and monitoring

**Feature Tables**:
- `wyt_wall_posts` - WytWall needs/offers
- `user_profiles` - WytLife profile data
- `bucket_list` - User goals and aspirations
- `ai_chat_conversations` - WytAI Agent chat history

### API Design

**Authentication**:
- `POST /api/auth/google` - Google OAuth callback
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/otp/send` - Send OTP to email
- `POST /api/auth/otp/verify` - Verify OTP code
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - End session

**RBAC**:
- `GET /api/roles` - List all roles
- `GET /api/roles/:id/permissions` - Get role permissions
- `POST /api/roles` - Create role
- `PATCH /api/roles/:id/permissions` - Update role permissions

**DevDoc**:
- `GET /api/devdoc/check-access` - Check user's DevDoc permissions
- `GET /api/devdoc/config` - Get permission-based sidebar config

---

## Success Metrics

### User Acquisition Metrics

| Metric | Year 1 Target | Year 2 Target | Year 3 Target |
|--------|---------------|---------------|---------------|
| Monthly Active Users (MAU) | 10,000 | 50,000 | 200,000 |
| Customer Acquisition Cost (CAC) | ₹5,000 | ₹3,000 | ₹2,000 |
| Lifetime Value (LTV) | ₹50,000 | ₹75,000 | ₹100,000 |
| LTV:CAC Ratio | 10:1 | 25:1 | 50:1 |

### Revenue Metrics

| Metric | Year 1 Target | Year 2 Target | Year 3 Target |
|--------|---------------|---------------|---------------|
| Monthly Recurring Revenue (MRR) | ₹50L | ₹3Cr | ₹15Cr |
| Annual Recurring Revenue (ARR) | ₹6Cr | ₹36Cr | ₹180Cr |
| Monthly Churn Rate | <5% | <3% | <2% |
| Expansion Revenue | 30% | 40% | 50% |

### Product Metrics

| Metric | Target |
|--------|--------|
| App Installations per User | 5+ |
| Daily Active Users (DAU) | 30% of MAU |
| Feature Adoption Rate | >60% |
| Net Promoter Score (NPS) | >50 |
| Customer Satisfaction (CSAT) | >4.5/5 |

### Technical Metrics

| Metric | Target |
|--------|--------|
| Uptime | 99.95% |
| API Response Time (P95) | <500ms |
| Page Load Time | <2s |
| Lighthouse Score | >90 |
| Security Incidents | 0 |

---

## Roadmap & Milestones

### Phase 1: Foundation (Current - 6 months)

**Status**: 85% Complete

**Completed**:
- ✅ Core platform architecture (Entity → Module → App → Hub)
- ✅ WytPass unified authentication
- ✅ Multi-tenancy with RLS
- ✅ RBAC with 80 permissions
- ✅ Engine Admin Portal
- ✅ Basic app ecosystem (WytWall, WytLife, AI Directory, QR Generator, DISC Assessment)
- ✅ WytAI Agent
- ✅ DevDoc with RBAC
- ✅ PWA support
- ✅ Audit logging

**In Progress**:
- 🔄 Hub Admin Portal enhancements
- 🔄 Mobile app (React Native)
- 🔄 Payment integration (Razorpay)

**Pending**:
- ⏳ Beta user testing (Target: 100 users)
- ⏳ Performance optimization
- ⏳ Production deployment

### Phase 2: Growth (6-12 months)

**Goals**: Expand app ecosystem, achieve product-market fit

**Planned**:
- Launch app marketplace with 50+ apps
- Mobile apps (iOS + Android) in production
- API marketplace for third-party developers
- Partner program launch
- White-label program (first 5 paying customers)
- Advanced analytics dashboard
- Automated onboarding flow
- Customer success program

**Targets**:
- 10K MAU
- ₹50L MRR
- 5 enterprise customers
- 20+ apps in marketplace

### Phase 3: Scale (12-24 months)

**Goals**: International expansion, enterprise features

**Planned**:
- International market entry (Singapore, UAE)
- Enterprise SSO integration
- Custom integrations framework
- Advanced AI capabilities
- Industry-specific hub templates
- API rate limiting and monetization
- Developer SDK and documentation
- Partner ecosystem program

**Targets**:
- 50K MAU
- ₹3Cr MRR
- 50 enterprise customers
- 100+ apps in marketplace

### Phase 4: Innovation (24-36 months)

**Goals**: Market leadership, platform ecosystem

**Planned**:
- Blockchain integration for WytID
- Advanced analytics and ML insights
- Industry vertical expansions
- AI-powered automation suite
- Global expansion (5+ countries)
- IPO preparation

**Targets**:
- 200K MAU
- ₹15Cr MRR
- Market leader in category
- Exit strategy evaluation

---

## Risk Management

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database scaling issues | High | Implement caching, optimize queries, plan sharding |
| Security breach | Critical | Regular audits, penetration testing, SOC 2 compliance |
| Third-party API downtime | Medium | Implement fallbacks, circuit breakers, status monitoring |
| Performance degradation | High | Load testing, monitoring, auto-scaling |

### Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low user adoption | Critical | Beta testing, user feedback, iterative improvements |
| High churn rate | High | Customer success program, feature improvements |
| Competition | High | Differentiation via WytPass, modular architecture |
| Funding constraints | High | Revenue focus, cost optimization, investor relations |

---

## Appendices

### A. Glossary

- **Engine**: Core platform framework powering all hubs and apps
- **Hub**: Independent platform instance (tenant) with own branding and domain
- **Module**: Self-contained functional component that can be composed into apps
- **WytPass**: Universal authentication and identity system
- **RBAC**: Role-Based Access Control system
- **RLS**: Row Level Security for data isolation

### B. Related Documents

- [Architecture Overview](/en/architecture/)
- [Database Schema](/en/architecture/database-schema)
- [API Reference](/en/api/)
- [Use Case Flows](/en/use-case-flows/)
- [Production Standards](/en/production-standards/)
- [Business Strategy](/en/business/) (Super Admin only)

---

**Document Owner**: Platform Team  
**Review Cycle**: Quarterly  
**Next Review**: January 2026
