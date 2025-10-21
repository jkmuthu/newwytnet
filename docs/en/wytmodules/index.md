# WytModules Overview

**WytModules** are small, focused plugins that power the WytNet platform. Like WordPress plugins, each module does ONE thing well and can be combined to create complex functionality.

## What are WytModules?

WytModules are the building blocks of the WytNet ecosystem:
- **Focused**: Each module solves a specific problem
- **Combinable**: Modules work together to create complex features
- **Context-Based**: Can be activated in Platform, Hub, App, or Game contexts
- **Dependency-Aware**: Modules can depend on other modules

## Module vs App vs Hub

### WytModules (51 modules)
- Small, focused plugins (e.g., Google OAuth, Email Service, Payment Core)
- Technical infrastructure and capabilities
- Combined to build features
- Activated per context (Platform/Hub/App/Game)

### WytApps (39 apps)
- Complete user-facing applications (e.g., WytInvoice, WytShop, WytMeet)
- Built using multiple modules
- Category-based organization
- Subscribed and installed by users

### WytHubs (5+ hubs)
- Multi-domain websites/portals (e.g., WytNet.com, ClanNet)
- Custom branding and routing
- Hub-level RBAC
- Collection of activated apps and modules

## Module Categories

WytNet platform has 51 modules organized into 9 categories:

### 1. Authentication & Identity (7 modules)
Core authentication system and identity verification.

- **WytPass Authentication Core** - Universal identity system
- **Google OAuth Login** - Sign in with Google
- **Email OTP Authentication** - Passwordless email login
- **WhatsApp OTP Authentication** - Self-share OTP (no SMS costs)
- **LinkedIn OAuth Login** - Professional network login
- **Facebook OAuth Login** - Social login
- **WytKYC** - Identity verification (Aadhaar, PAN via Digio)

### 2. Payment Gateways (4 modules)
Payment processing infrastructure.

- **Payment Core System** - Base payment infrastructure
- **Razorpay Payment Gateway** - Indian payments (UPI, cards, wallets)
- **Bank Transfer Payment** - Manual NEFT/RTGS/IMPS
- **Stripe Payment Gateway** - International payments

### 3. Content & Media (5 modules)
File uploads, media management, and storage.

- **Logo/DP Uploader** - Profile pictures with auto-crop
- **Multi Images Uploader** - Gallery and image management
- **Video Player Module** - Video embedding and playback
- **Rich Text Editor** - WYSIWYG content creation
- **Object Storage Service** - Cloud storage for files

### 4. Communication (6 modules)
Messaging, notifications, and communication tools.

- **Email Service** - Transactional and marketing emails
- **SMS Service** - OTP and notifications
- **Push Notifications** - Web and mobile notifications
- **Real-time Chat System** - WebSocket-based messaging
- **WhatsApp Business API** - WhatsApp messaging automation

### 5. Data Management (6 modules)
Data tools, search, and analytics.

- **Dataset Creator** - Structured dataset management
- **CSV Import/Export** - Data import/export
- **Search Engine** - Full-text search (Meilisearch)
- **Analytics Module** - Usage tracking and insights
- **Reports Generator** - Custom report builder
- **API Builder** - Create custom REST APIs

### 6. User & Organization (8 modules)
User management, profiles, and organizational features.

- **User Profile System** - Personal profiles
- **Organization Manager** - Org creation and management
- **Team Collaboration** - Team features
- **User Roles & Permissions** - RBAC system
- **My Account Module** - Account settings
- **Referral System** - User referrals
- **Onboarding Wizard** - New user onboarding
- **Support Tickets** - Help desk system

### 7. Productivity (4 modules)
Task management and productivity tools.

- **Calendar Integration** - Scheduling and events
- **File Sharing** - Secure file sharing
- **Comments & Mentions** - Social features
- **Activity Feed** - Timeline of activities

### 8. Platform Core (5 modules)
Essential platform infrastructure.

- **Navigation Builder** - Menu and navigation
- **Theme Engine** - UI theming system
- **SEO Manager** - Meta tags and optimization
- **Pricing Plans Builder** - Subscription plans
- **Web Builder CMS** - Page builder

### 9. Location Services (3 modules)
Maps, geocoding, and location features.

- **Google Maps Integration** - Maps and location
- **Mappls (MapmyIndia)** - India-specific maps
- **Geofencing** - Location-based triggers

## Module Contexts

Modules can be activated in different contexts:

### Platform Context
- Engine-level modules (core infrastructure)
- Available across all hubs and apps
- Examples: WytPass Auth, Payment Core, Object Storage

### Hub Context
- Hub-specific features
- Can be customized per hub
- Examples: Theme Engine, SEO Manager, Navigation Builder

### App Context
- App-level functionality
- Activated within specific apps
- Examples: Chat System, Comments, Activity Feed

### Game Context
- Gaming-specific modules
- Multiplayer, leaderboards, achievements
- Examples: Video Player, Push Notifications, Chat

## Module Dependencies

Modules can depend on other modules:

```
wytkyc-digio (Identity Verification)
  └─ depends on: wytpass-auth

email-otp-auth (Email OTP Login)
  ├─ depends on: wytpass-auth
  └─ depends on: email-service

multi-image-uploader (Gallery Uploader)
  └─ depends on: object-storage
```

Dependency management ensures:
- Required modules are activated first
- Conflicts are prevented
- Smooth module activation flow

## Module Pricing Models

### Free Modules (Most modules)
- Core platform features
- Basic functionality
- No additional cost

### Premium Modules
- Advanced features
- Monthly subscription
- Example: Real-time Chat System (₹49/month)

### Usage-Based Modules
- Pay per usage
- Transaction-based pricing
- Examples:
  - Razorpay Payment: ₹2/transaction
  - Email Service: ₹0.10/email
  - SMS Service: ₹0.05/SMS
  - WytKYC: ₹5/verification

## Module Management

### For Super Admins (Engine Level)

**Activate Modules**
1. Navigate to Engine Admin → Modules
2. Browse module catalog
3. Select desired modules
4. Configure settings (API keys, etc.)
5. Activate for Platform/Hub/App contexts

**Module Settings**
- API key configuration
- Webhook URLs
- Feature flags
- Pricing settings

### For Hub Admins

**Enable Modules for Hub**
1. Navigate to Hub Admin → Modules
2. View available modules (activated by Super Admin)
3. Enable for your hub
4. Configure hub-specific settings

### For App Developers

**Include Modules in Apps**
1. Specify module dependencies in app manifest
2. Platform auto-activates required modules
3. Use module APIs in app code

## Creating Custom Modules

WytNet supports custom module development:

### Module Structure
```typescript
{
  id: 'custom-module-id',
  name: 'Module Name',
  description: 'What it does',
  category: 'category-name',
  type: 'module-type',
  contexts: ['platform', 'hub', 'app'],
  dependencies: ['required-module-ids'],
  apiEndpoints: [...],
  settings: {...},
  pricing: 'free' | 'premium' | 'usage-based',
  version: '1.0.0'
}
```

### Development Workflow
1. Define module manifest
2. Implement API endpoints
3. Test in development context
4. Submit for review (Super Admin approval)
5. Publish to module catalog

## Complete Module Catalog

View the [Complete Modules Catalog](modules-catalog) for detailed information on all 51 modules.

### Sample Modules by Category

**Authentication & Identity**
- WytPass Authentication Core
- Google OAuth, LinkedIn OAuth, Facebook OAuth
- Email OTP, WhatsApp OTP
- WytKYC (Identity Verification)

**Payment Processing**
- Razorpay, Stripe Payment Gateways
- Bank Transfer, Payment Core

**Content Management**
- Rich Text Editor, Image Uploaders
- Video Player, Object Storage

**Communication**
- Email Service, SMS Service
- Push Notifications, Chat System

**Data Tools**
- Dataset Creator, CSV Import/Export
- Search Engine (Meilisearch)
- Analytics, Reports Generator

[Browse Complete Catalog →](modules-catalog)

## Integration with WytApps

WytApps are built using WytModules:

### Example: WytInvoice App

WytInvoice uses these modules:
- **wytpass-auth**: User authentication
- **payment-core**: Payment infrastructure
- **razorpay-payment**: Payment processing
- **email-service**: Invoice emails
- **object-storage**: PDF storage
- **rich-text-editor**: Invoice notes

### Example: WytShop App

WytShop uses these modules:
- **wytpass-auth**: Customer accounts
- **payment-core + razorpay-payment**: Checkout
- **multi-image-uploader**: Product images
- **search-engine**: Product search
- **email-service**: Order confirmations
- **object-storage**: Product assets

## Roadmap

### Q1 2026
- Blockchain Wallet Module
- Cryptocurrency Payment Module
- AI Content Generator Module
- Video Call Module (WebRTC)

### Q2 2026
- AR/VR Module
- IoT Device Integration Module
- Blockchain Smart Contract Module
- Advanced Analytics Dashboard

### Q3 2026
- Marketplace Module (for module distribution)
- Third-party Module SDK
- Module Versioning System
- Module A/B Testing Framework

## Related Documentation

- [WytApps - Application Layer](/en/wytapps/)
- [WytSuites - App Bundles](/en/wytsuites/)
- [WytHubs - Multi-Domain System](/en/wythubs/)
- [Engine Admin - Module Management](/en/admin-panels/engine-admin)

## Support & Resources

- [Module Development Guide](#)
- [API Documentation](#)
- [Module Community Forum](#)
- Email Support: modules@wytnet.com
