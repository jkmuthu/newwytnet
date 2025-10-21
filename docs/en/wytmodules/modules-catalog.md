# WytModules Complete Catalog

This is the complete catalog of all 51 WytModules available in the WytNet platform. Modules are organized by category and include detailed information about contexts, dependencies, and pricing.

## Module Legend

- **Category**: Module functional category
- **Contexts**: Where module can be activated (Platform, Hub, App, Game)
- **Dependencies**: Required modules that must be activated first
- **Pricing**: Free, Premium (monthly), or Usage-based (per transaction/call)

---

## 1. Authentication & Identity (7 modules)

### WytPass Authentication Core
- **ID**: `wytpass-auth`
- **Description**: Universal identity system with multi-method authentication
- **Contexts**: Platform, Hub, App, Game
- **Dependencies**: None
- **Pricing**: Free (core platform)
- **Restricted**: Engine-only

### Google OAuth Login
- **ID**: `google-oauth`
- **Description**: Sign in with Google account
- **Contexts**: Platform, Hub, App
- **Dependencies**: wytpass-auth
- **Pricing**: Free
- **Requirements**: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

### Email OTP Authentication
- **ID**: `email-otp-auth`
- **Description**: Passwordless login via email OTP
- **Contexts**: Platform, Hub, App
- **Dependencies**: wytpass-auth, email-service
- **Pricing**: Usage-based (₹0.50 per OTP)
- **Requirements**: MSG91_AUTH_KEY, MSG91_EMAIL_TEMPLATE_ID

### WhatsApp OTP Authentication
- **ID**: `whatsapp-otp-auth`
- **Description**: Self-share OTP through WhatsApp (No SMS costs)
- **Contexts**: Platform, Hub, App
- **Dependencies**: wytpass-auth
- **Pricing**: Free

### LinkedIn OAuth Login
- **ID**: `linkedin-oauth`
- **Description**: Sign in with LinkedIn professional account
- **Contexts**: Platform, Hub, App
- **Dependencies**: wytpass-auth
- **Pricing**: Free
- **Requirements**: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET

### Facebook OAuth Login
- **ID**: `facebook-oauth`
- **Description**: Sign in with Facebook account
- **Contexts**: Platform, Hub, App
- **Dependencies**: wytpass-auth
- **Pricing**: Free
- **Requirements**: FACEBOOK_APP_ID, FACEBOOK_APP_SECRET

### WytKYC - Identity Verification
- **ID**: `wytkyc-digio`
- **Description**: Aadhaar eSign, PAN verification, eKYC powered by Digio
- **Contexts**: Platform, Hub, App
- **Dependencies**: wytpass-auth
- **Pricing**: Usage-based (₹5.00 per verification)
- **Requirements**: DIGIO_API_KEY
- **Conflicts**: signzy-kyc, perfios-kyc

---

## 2. Payment Gateways (4 modules)

### Payment Core System
- **ID**: `payment-core`
- **Description**: Base payment processing infrastructure
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Free (core infrastructure)
- **Restricted**: Engine-only

### Razorpay Payment Gateway
- **ID**: `razorpay-payment`
- **Description**: Indian payment gateway for cards, UPI, wallets
- **Contexts**: Platform, Hub, App
- **Dependencies**: payment-core
- **Pricing**: Usage-based (₹2.00 per transaction)
- **Requirements**: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
- **Conflicts**: stripe-payment

### Bank Transfer Payment Method
- **ID**: `bank-transfer-payment`
- **Description**: Manual bank transfer/NEFT/RTGS payments
- **Contexts**: Platform, Hub, App
- **Dependencies**: payment-core
- **Pricing**: Free
- **Requirements**: BANK_ACCOUNT_NUMBER, BANK_IFSC_CODE, BANK_NAME

### Stripe Payment Gateway
- **ID**: `stripe-payment`
- **Description**: International payment gateway for global payments
- **Contexts**: Platform, Hub, App
- **Dependencies**: payment-core
- **Pricing**: Usage-based (₹2.90 per transaction)
- **Requirements**: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- **Conflicts**: razorpay-payment

---

## 3. Content & Media (5 modules)

### Logo/DP Uploader with Autocrop
- **ID**: `logo-dp-uploader`
- **Description**: Profile picture and logo uploader with auto-crop
- **Contexts**: Platform, Hub, App
- **Dependencies**: object-storage
- **Pricing**: Free

### Multi Images Uploader
- **ID**: `multi-image-uploader`
- **Description**: Upload multiple images with preview and gallery
- **Contexts**: Platform, Hub, App
- **Dependencies**: object-storage
- **Pricing**: Free

### Video Player Module
- **ID**: `video-player`
- **Description**: Embed and play videos with controls
- **Contexts**: Platform, Hub, App, Game
- **Dependencies**: None
- **Pricing**: Free

### Rich Text Editor
- **ID**: `rich-text-editor`
- **Description**: WYSIWYG editor for content creation
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Free

### Object Storage Service
- **ID**: `object-storage`
- **Description**: Cloud storage for files and media
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Usage-based (₹0.023 per GB)
- **Requirements**: STORAGE_BUCKET
- **Restricted**: Engine-only

---

## 4. Communication (6 modules)

### Email Service
- **ID**: `email-service`
- **Description**: Send transactional and marketing emails
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Usage-based (₹0.10 per email)
- **Requirements**: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
- **Restricted**: Engine-only

### SMS Service
- **ID**: `sms-service`
- **Description**: Send SMS notifications and OTPs
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Usage-based (₹0.05 per SMS)
- **Requirements**: SMS_PROVIDER, SMS_API_KEY
- **Restricted**: Engine-only

### Push Notifications
- **ID**: `push-notifications`
- **Description**: Web and mobile push notifications
- **Contexts**: Platform, Hub, App, Game
- **Dependencies**: None
- **Pricing**: Free
- **Requirements**: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY

### Real-time Chat System
- **ID**: `chat-system`
- **Description**: WebSocket-based chat and messaging
- **Contexts**: Platform, Hub, App, Game
- **Dependencies**: None
- **Pricing**: Premium (₹49/month)

### WhatsApp Business API
- **ID**: `whatsapp-business`
- **Description**: WhatsApp Business messaging and automation
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Usage-based (WhatsApp pricing)
- **Requirements**: WHATSAPP_API_TOKEN

---

## 5. Data Management (6 modules)

### Dataset Creator
- **ID**: `dataset-creator`
- **Description**: Create and manage structured datasets
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Free

### CSV Import/Export
- **ID**: `csv-import-export`
- **Description**: Import and export data via CSV files
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Free

### Search Engine (Meilisearch)
- **ID**: `search-engine`
- **Description**: Full-text search across platform
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Premium (₹29/month)
- **Requirements**: MEILISEARCH_URL, MEILISEARCH_API_KEY

### WytGeo - Location & Geography Data
- **ID**: `wytgeo`
- **Description**: Comprehensive location datasets: 50 countries, 37 Indian states, 100 cities, 10 timezones
- **Contexts**: Platform, Hub, App, Game
- **Dependencies**: None
- **Pricing**: Usage-based (₹0.30 per API call)

### WytI18n - Internationalization Data
- **ID**: `wyti18n`
- **Description**: Global i18n datasets: 20 languages with ISO codes, 20 currencies with symbols
- **Contexts**: Platform, Hub, App, Game
- **Dependencies**: None
- **Pricing**: Usage-based (₹0.20 per API call)

### WytBiz - Business Reference Data
- **ID**: `wytbiz`
- **Description**: Business datasets: 15 industries, 6 company sizes, 15 job roles, 34 GST codes
- **Contexts**: Platform, Hub, App, Game
- **Dependencies**: None
- **Pricing**: Usage-based (₹0.20 per API call)

---

## 6. User & Organization (8 modules)

### Organisation Manager
- **ID**: `organization-manager`
- **Description**: Multi-level organization and team management
- **Contexts**: Platform, Hub, App
- **Dependencies**: wytpass-auth
- **Pricing**: Premium (₹99/month)

### Role-Based Access Control
- **ID**: `rbac-system`
- **Description**: Granular permissions and role management
- **Contexts**: Platform, Hub, App
- **Dependencies**: wytpass-auth
- **Pricing**: Premium (₹79/month)

### User Profile Manager
- **ID**: `user-profile-manager`
- **Description**: Complete user profile management system
- **Contexts**: Platform, Hub, App
- **Dependencies**: wytpass-auth
- **Pricing**: Free

### Referral System
- **ID**: `referral-system`
- **Description**: User referral tracking and rewards
- **Contexts**: Platform, Hub, App
- **Dependencies**: wytpass-auth
- **Pricing**: Free

### Onboarding Wizard
- **ID**: `onboarding-wizard`
- **Description**: New user onboarding flow builder
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Free

### Support Tickets System
- **ID**: `support-tickets`
- **Description**: Help desk and customer support
- **Contexts**: Platform, Hub, App
- **Dependencies**: wytpass-auth
- **Pricing**: Premium (₹59/month)

### Team Collaboration Module
- **ID**: `team-collaboration`
- **Description**: Team features and workspace management
- **Contexts**: Platform, Hub, App
- **Dependencies**: organization-manager
- **Pricing**: Premium (₹89/month)

### My Account Module
- **ID**: `my-account`
- **Description**: User account settings and preferences
- **Contexts**: Platform, Hub, App
- **Dependencies**: wytpass-auth
- **Pricing**: Free

---

## 7. Productivity (4 modules)

### Calendar Module
- **ID**: `calendar`
- **Description**: Event scheduling and calendar management
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Free

### Task Manager
- **ID**: `task-manager`
- **Description**: Task assignment and tracking system
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Free

### Kanban Board
- **ID**: `kanban-board`
- **Description**: Visual workflow board for task management
- **Contexts**: Platform, Hub, App
- **Dependencies**: task-manager
- **Pricing**: Premium (₹39/month)

### Pricing Plans Module
- **ID**: `pricing-plans`
- **Description**: Subscription and pricing plan management
- **Contexts**: Platform, Hub, App
- **Dependencies**: payment-core
- **Pricing**: Free

---

## 8. Platform Core (10 modules)

### Analytics & Metrics Engine
- **ID**: `analytics-engine`
- **Description**: Platform-wide analytics and usage tracking
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Premium (₹149/month)
- **Restricted**: Engine-only

### Audit Logs System
- **ID**: `audit-logs`
- **Description**: Track all system actions for compliance
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Premium (₹99/month)
- **Restricted**: Engine-only

### Geo-Regulatory Control
- **ID**: `geo-regulatory-control`
- **Description**: Multi-country compliance, data sovereignty, and geographic access control
- **Contexts**: Hub, App
- **Dependencies**: None
- **Pricing**: Premium (₹199/month)

### WytEntities - Knowledge Graph
- **ID**: `wytentities`
- **Description**: Meta-entity layer for knowledge graph management and tag-based duplication prevention
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Premium (₹249/month)
- **Restricted**: Platform-engine
- **Entity Types**: Location, Industry, Language, JobRole, Skill, Business, Person, Event, Product, Category

### API Key Manager
- **ID**: `api-key-manager`
- **Description**: Generate and manage API keys for module access
- **Contexts**: Platform
- **Dependencies**: None
- **Pricing**: Free
- **Restricted**: Engine-only

### Rate Limiting System
- **ID**: `rate-limiter`
- **Description**: API rate limiting and throttling
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Free
- **Restricted**: Engine-only

### Webhook Manager
- **ID**: `webhook-manager`
- **Description**: Manage outgoing webhooks and events
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Free

### Multi-Tenant Core
- **ID**: `multi-tenant-core`
- **Description**: Core multi-tenancy and RLS system
- **Contexts**: Platform
- **Dependencies**: None
- **Pricing**: Free
- **Restricted**: Engine-only

### CMS Builder
- **ID**: `cms-builder`
- **Description**: Content management system with drag-and-drop
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Free

### Hub Aggregation Engine
- **ID**: `hub-aggregator`
- **Description**: Cross-tenant data aggregation for hubs
- **Contexts**: Platform, Hub
- **Dependencies**: None
- **Pricing**: Premium (₹129/month)

---

## 9. Location Services (3 modules)

### Google Maps Integration
- **ID**: `google-maps`
- **Description**: Maps, geocoding, and location services
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Usage-based (Google pricing)
- **Requirements**: GOOGLE_MAPS_API_KEY

### Mappls (MapmyIndia)
- **ID**: `mappls`
- **Description**: India-specific maps and navigation
- **Contexts**: Platform, Hub, App
- **Dependencies**: None
- **Pricing**: Usage-based (₹0.50 per API call)
- **Requirements**: MAPPLS_API_KEY

### Geofencing Module
- **ID**: `geofencing`
- **Description**: Location-based triggers and boundaries
- **Contexts**: Platform, Hub, App
- **Dependencies**: google-maps OR mappls
- **Pricing**: Premium (₹69/month)

---

## Module Pricing Summary

### Free Modules (25 modules)
Most core functionality is free, including: WytPass Auth, Payment Core, Content uploaders, Video Player, Rich Text Editor, Dataset Creator, CSV Import/Export, User Profile, Calendar, Task Manager, Pricing Plans, and more.

### Premium Modules (13 modules)
Monthly subscription required:
- Chat System: ₹49/month
- Search Engine: ₹29/month
- Kanban Board: ₹39/month
- Support Tickets: ₹59/month
- Geofencing: ₹69/month
- RBAC System: ₹79/month
- Team Collaboration: ₹89/month
- Organization Manager: ₹99/month
- Audit Logs: ₹99/month
- Hub Aggregation: ₹129/month
- Analytics Engine: ₹149/month
- Geo-Regulatory: ₹199/month
- WytEntities: ₹249/month

### Usage-Based Modules (13 modules)
Pay per use:
- Object Storage: ₹0.023/GB
- SMS Service: ₹0.05/SMS
- Email Service: ₹0.10/email
- WytI18n: ₹0.20/API call
- WytBiz: ₹0.20/API call
- WytGeo: ₹0.30/API call
- Email OTP: ₹0.50/OTP
- Mappls: ₹0.50/API call
- Razorpay: ₹2.00/transaction
- Stripe: ₹2.90/transaction
- WytKYC: ₹5.00/verification
- WhatsApp Business: Provider pricing
- Google Maps: Provider pricing

## Module Dependencies Visualization

```
wytkyc-digio
  └─ wytpass-auth

email-otp-auth
  ├─ wytpass-auth
  └─ email-service

multi-image-uploader
  └─ object-storage

kanban-board
  └─ task-manager

pricing-plans
  └─ payment-core

razorpay-payment
  └─ payment-core

stripe-payment
  └─ payment-core

organization-manager
  └─ wytpass-auth

rbac-system
  └─ wytpass-auth

team-collaboration
  └─ organization-manager

geofencing
  └─ google-maps OR mappls
```

## Module Contexts Overview

### Platform Context (Engine-level)
Available across all hubs and apps. Examples: WytPass Auth, Payment Core, Object Storage, Multi-Tenant Core.

### Hub Context
Hub-specific customization. Examples: Theme Engine, SEO Manager, Navigation Builder, Hub Aggregation.

### App Context
App-level functionality. Examples: Chat System, Comments, Activity Feed, Support Tickets.

### Game Context
Gaming-specific modules. Examples: Video Player, Push Notifications, Chat System.

## Related Documentation

- [WytModules Overview](/en/wytmodules/)
- [WytApps - Application Layer](/en/wytapps/)
- [Engine Admin - Module Management](/en/admin-panels/engine-admin)
