# Hub Admin Panel Guide

## Overview

The Hub Admin Panel is the control center for managing your specific hub on the WytNet platform. As a Hub Admin, you have full control over your hub's settings, branding, modules, content, members, and analytics.

**Access Level**: Hub Admin

**URL**: `https://your-hub.wytnet.com/admin` or `https://wytnet.com/hub-admin`

---

## Table of Contents

1. [Hub Dashboard](#hub-dashboard)
2. [Domain Management](#domain-management)
3. [Hub Branding](#hub-branding)
4. [Module Management](#module-management)
5. [Content Management](#content-management)
6. [Member Management](#member-management)
7. [Hub Settings](#hub-settings)
8. [Analytics & Insights](#analytics--insights)
9. [Billing & Subscription](#billing--subscription)
10. [Support & Help](#support--help)

---

## Hub Dashboard

### Overview Screen

The Hub Dashboard provides an at-a-glance view of your hub's performance and activity.

**Screenshot Description**:

```
┌─────────────────────────────────────────────────────────────┐
│  OwnerNet Hub Admin Dashboard                      [Profile ▼]
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Welcome back, John! 👋                                      │
│                                                              │
│  📊 Quick Stats                                              │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│  │  2,458    │ │    145    │ │   1,234   │ │    89%    │   │
│  │  Total    │ │   New     │ │   Active  │ │   Engaged │   │
│  │  Members  │ │ This Week │ │   Today   │ │   Users   │   │
│  │  +12% ↑   │ │  +23% ↑   │ │  +5.2% ↑  │ │  +3.1% ↑  │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
│                                                              │
│  📈 Activity Trends (Last 7 Days)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [Bar chart showing daily member signups and activity] │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ⚡ Recent Activity                                          │
│  • New member joined: sarah@example.com                      │
│  • Post published: "Looking for 2BHK in Anna Nagar"         │
│  • Module activated: Calendar & Events                       │
│  • Domain verified: ownernet.com                             │
│                                                              │
│  🚨 Action Required                                          │
│  • 12 posts pending moderation                              │
│  • 3 member join requests awaiting approval                 │
│  • Subscription renewal due in 5 days                        │
│                                                              │
│  🎯 Quick Actions                                            │
│  [Moderate Posts] [Approve Members] [Customize Branding]    │
│  [Activate Module] [View Analytics] [Hub Settings]           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Navigation Menu**:

```
Hub Admin
├── 📊 Dashboard
├── 🌐 Domain & Branding
│   ├── Domain Settings
│   └── Branding
├── 🧩 Modules & Apps
├── 📄 Content Management
│   ├── Pages
│   ├── Menus
│   └── Media Library
├── 👥 Members
│   ├── All Members
│   ├── Roles
│   └── Join Requests
├── 🎨 WytWall
│   ├── Posts
│   └── Moderation Queue
├── ⚙️ Settings
│   ├── General
│   ├── Privacy
│   ├── Features
│   └── Integrations
├── 📊 Analytics
└── 💳 Billing
```

---

## Domain Management

Configure your hub's domain settings including subdomain and custom domain.

### Subdomain Configuration

Every hub gets a free subdomain on WytNet.

**Path**: Hub Admin > Domain & Branding > Domain Settings

```
┌─────────────────────────────────────────────────────────────┐
│  Domain Settings                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Subdomain                                                   │
│  ━━━━━━━━━                                                  │
│                                                              │
│  Your hub subdomain:                                         │
│  https://[ownernet].wytnet.com                               │
│                                                              │
│  ⚠️ Changing your subdomain will break existing links       │
│                                                              │
│  [Keep Current] [Change Subdomain]                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Custom Domain Setup

Add your own domain to your hub for a professional branded experience.

**Path**: Hub Admin > Domain & Branding > Domain Settings > Custom Domain

**Workflow**:

1. Click **"Add Custom Domain"**
2. Enter your domain (e.g., `ownernet.com`)
3. System generates DNS records
4. Configure DNS at your registrar
5. Wait for verification (automatic)
6. SSL certificate auto-generated

**Custom Domain Screen**:

```
┌─────────────────────────────────────────────────────────────┐
│  Custom Domain                                [+ Add Domain]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Current Domain                                              │
│  ━━━━━━━━━━━━━━                                             │
│                                                              │
│  ✓ ownernet.com                                              │
│  Status: ✅ Active | SSL: ✅ Valid                           │
│  Verified: Oct 15, 2025                                      │
│  Certificate expires: Jan 15, 2026 (Auto-renewal enabled)   │
│                                                              │
│  [View DNS Records] [Renew SSL] [Remove Domain]              │
│                                                              │
│  DNS Configuration                                           │
│  ━━━━━━━━━━━━━━━━━                                          │
│                                                              │
│  Add these records at your domain registrar:                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Type   │ Name  │ Value                  │ TTL    │ ✓   │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ A      │ @     │ 103.21.58.12           │ 3600   │ ✓   │ │
│  │ CNAME  │ www   │ ownernet.wytnet.com    │ 3600   │ ✓   │ │
│  │ TXT    │ @     │ wytnet-verify=abc123   │ 3600   │ ✓   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  All DNS records verified ✅                                 │
│                                                              │
│  Domain Health Check                                         │
│  ━━━━━━━━━━━━━━━━━━                                         │
│  ✓ DNS propagation complete                                 │
│  ✓ SSL certificate active                                   │
│  ✓ HTTPS redirect enabled                                   │
│  ✓ WWW redirect configured                                  │
│                                                              │
│  [Run Health Check] [Troubleshoot]                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Adding a New Domain**:

```
┌─────────────────────────────────────────────────────────────┐
│  Add Custom Domain                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Enter Your Domain                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━                                │
│                                                              │
│  Domain Name: [ownernet.com                ]                 │
│                                                              │
│  ⚠️ Make sure you own this domain                           │
│                                                              │
│  [Cancel]                                  [Continue →]      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

(After clicking Continue)

┌─────────────────────────────────────────────────────────────┐
│  Configure DNS Records                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 2: Add DNS Records                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━                                  │
│                                                              │
│  Go to your domain registrar and add these DNS records:      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Type   │ Name  │ Value                  │ TTL           │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ A      │ @     │ 103.21.58.12           │ 3600          │ │
│  │ CNAME  │ www   │ ownernet.wytnet.com    │ 3600          │ │
│  │ TXT    │ @     │ wytnet-verify=xyz789   │ 3600          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Copy All Records]  [Download as CSV]                       │
│                                                              │
│  Common Domain Registrars:                                   │
│  • GoDaddy - [How to add DNS records]                        │
│  • Namecheap - [How to add DNS records]                      │
│  • Cloudflare - [How to add DNS records]                     │
│  • Google Domains - [How to add DNS records]                 │
│                                                              │
│  Verification Status                                         │
│  ━━━━━━━━━━━━━━━━━━━                                        │
│  ⏳ Waiting for DNS propagation...                           │
│  This may take 24-48 hours                                   │
│                                                              │
│  [← Back] [Check Verification Status] [I've Added Records]   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Hub Branding

Customize your hub's appearance to match your brand identity.

### Logo & Favicon

**Path**: Hub Admin > Domain & Branding > Branding

```
┌─────────────────────────────────────────────────────────────┐
│  Hub Branding                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tabs: Logo | Colors | Theme | Advanced]                    │
│                                                              │
│  Logo                                                        │
│  ━━━━                                                        │
│                                                              │
│  Main Logo (Header & Marketing)                              │
│  ┌──────────────────────┐                                   │
│  │                      │                                    │
│  │   [Current Logo]     │                                    │
│  │                      │                                    │
│  └──────────────────────┘                                    │
│  200 x 60 pixels                                             │
│                                                              │
│  [Upload New Logo] [Remove]                                  │
│                                                              │
│  Recommended:                                                │
│  • Format: PNG with transparent background                   │
│  • Size: 200x60 pixels (max 500KB)                           │
│  • Color: Works on both light and dark backgrounds           │
│                                                              │
│  Square Logo (Mobile & Social)                               │
│  ┌────────────┐                                              │
│  │            │                                              │
│  │  [Square]  │                                              │
│  │            │                                              │
│  └────────────┘                                              │
│  200 x 200 pixels                                            │
│                                                              │
│  [Upload Square Logo] [Remove]                               │
│                                                              │
│  Favicon (Browser Tab Icon)                                  │
│  ┌──┐                                                        │
│  │🏠│ 32 x 32 pixels                                         │
│  └──┘                                                        │
│                                                              │
│  [Upload Favicon] [Remove]                                   │
│                                                              │
│  [Save Changes]                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Color Scheme

**Path**: Hub Admin > Domain & Branding > Branding > Colors

```
┌─────────────────────────────────────────────────────────────┐
│  Color Scheme                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Brand Colors                                                │
│  ━━━━━━━━━━━                                                │
│                                                              │
│  Primary Color                                               │
│  [██████] #FF6B00  🎨                                        │
│  Used for: Primary buttons, links, active states            │
│                                                              │
│  Secondary Color                                             │
│  [██████] #1A1A1A  🎨                                        │
│  Used for: Secondary buttons, text, headings                 │
│                                                              │
│  Accent Color                                                │
│  [██████] #00D9FF  🎨                                        │
│  Used for: Highlights, notifications, badges                 │
│                                                              │
│  Success Color                                               │
│  [██████] #00B87C  🎨                                        │
│  Used for: Success messages, positive actions               │
│                                                              │
│  Error Color                                                 │
│  [██████] #FF3B30  🎨                                        │
│  Used for: Error messages, destructive actions              │
│                                                              │
│  Warning Color                                               │
│  [██████] #FFA500  🎨                                        │
│  Used for: Warnings, caution alerts                          │
│                                                              │
│  Background                                                  │
│  Light: [██████] #FFFFFF  🎨                                 │
│  Dark:  [██████] #0A0A0A  🎨                                 │
│                                                              │
│  Text                                                        │
│  Light: [██████] #1A1A1A  🎨                                 │
│  Dark:  [██████] #FFFFFF  🎨                                 │
│                                                              │
│  Color Presets                                               │
│  ━━━━━━━━━━━━━                                              │
│  [Modern Orange] [Professional Blue] [Nature Green]         │
│  [Minimal Gray] [Vibrant Purple] [Custom...]                │
│                                                              │
│  Live Preview                                                │
│  ━━━━━━━━━━━━                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [LOGO] OwnerNet         Search...    Login   Signup    │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │                                                        │ │
│  │  Welcome to OwnerNet                                   │ │
│  │  Your property community platform                      │ │
│  │                                                        │ │
│  │  [Join Now] [Learn More]                               │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Reset to Defaults] [Preview Full Site] [Save Changes]     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Theme Customization

**Path**: Hub Admin > Domain & Branding > Branding > Theme

```
┌─────────────────────────────────────────────────────────────┐
│  Theme Settings                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Default Theme                                               │
│  ━━━━━━━━━━━━━                                              │
│                                                              │
│  ⚫ Light Theme                                              │
│  ⚪ Dark Theme                                               │
│  ⚪ Auto (System preference)                                 │
│                                                              │
│  ☑ Allow users to override theme preference                 │
│                                                              │
│  Typography                                                  │
│  ━━━━━━━━━━━                                                │
│                                                              │
│  Font Family:    [Inter ▼]                                   │
│  Heading Font:   [Poppins ▼]                                 │
│  Font Size:      [Medium ▼]                                  │
│  Line Height:    [1.6 ▼]                                     │
│                                                              │
│  Layout                                                      │
│  ━━━━━━                                                     │
│                                                              │
│  Container Width:  [1200px ▼]                                │
│  Border Radius:    [8px ▼]                                   │
│  Spacing:          [Medium ▼]                                │
│                                                              │
│  Header Style:     ⚫ Fixed  ⚪ Static  ⚪ Sticky             │
│  Footer Style:     ⚫ Standard  ⚪ Minimal  ⚪ Hidden          │
│                                                              │
│  Advanced Customization                                      │
│  ━━━━━━━━━━━━━━━━━━━━                                       │
│                                                              │
│  Custom CSS:                                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ /* Add your custom CSS here */                         │ │
│  │ .custom-header {                                       │ │
│  │   background: linear-gradient(to right, #ff6b00, ...); │ │
│  │ }                                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Validate CSS] [Preview] [Save Changes]                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Module Management

Activate and configure modules for your hub.

### View Available Modules

**Path**: Hub Admin > Modules & Apps

```
┌─────────────────────────────────────────────────────────────┐
│  Modules & Apps                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tabs: Active (12) | Available (24) | Installed Apps (3)]   │
│                                                              │
│  Active Modules                                              │
│  ━━━━━━━━━━━━━━                                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ✅ WytWall - Social Commerce Feed                       │ │
│  │    Members can post Needs and Offers                    │ │
│  │    Activity: 234 posts this month                       │ │
│  │    [Configure] [Deactivate] [View Analytics]            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ✅ Razorpay Payment Gateway                             │ │
│  │    Accept payments from members                         │ │
│  │    Revenue: ₹45,678 this month                          │ │
│  │    [Configure] [Deactivate] [View Transactions]         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ✅ Calendar & Events                                    │ │
│  │    Create and manage events                             │ │
│  │    Upcoming: 5 events                                   │ │
│  │    [Configure] [Deactivate] [View Calendar]             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Available Modules                                           │
│  ━━━━━━━━━━━━━━━━━                                          │
│                                                              │
│  Category: [All ▼]  Search: [______________]                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📧 Email Marketing                          Free        │ │
│  │    Send newsletters and automated emails                 │ │
│  │    [Activate] [Learn More]                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 💬 WhatsApp Integration                   ₹199/month   │ │
│  │    Send notifications via WhatsApp                       │ │
│  │    [Activate] [Learn More]                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🎓 Learning Management System             ₹999/month   │ │
│  │    Create and sell online courses                        │ │
│  │    [Activate] [Learn More]                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Activate a Module

**Workflow**:

1. Navigate to **Hub Admin > Modules & Apps > Available**
2. Find the module you want to activate
3. Click **"Activate"**
4. Configure module settings
5. Confirm activation
6. Module becomes available to your hub members

**Activation Modal**:

```
┌─────────────────────────────────────────────────────────────┐
│  Activate Module: WhatsApp Integration                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Module Information                                          │
│  ━━━━━━━━━━━━━━━━━━                                         │
│  Name: WhatsApp Integration                                  │
│  Provider: WytNet                                            │
│  Price: ₹199/month                                           │
│                                                              │
│  Features:                                                   │
│  • Send notifications to members via WhatsApp                │
│  • Automated welcome messages                               │
│  • Event reminders                                           │
│  • Transaction confirmations                                 │
│                                                              │
│  Configuration                                               │
│  ━━━━━━━━━━━━━                                              │
│                                                              │
│  WhatsApp Business Account:                                  │
│  Phone Number: [+91 __________ ]                             │
│                                                              │
│  API Key: [____________________________]                     │
│          (Get from WhatsApp Business API Dashboard)          │
│                                                              │
│  Notification Settings:                                      │
│  ☑ Send welcome message on member join                      │
│  ☑ Send event reminders                                     │
│  ☐ Send daily digest                                        │
│  ☐ Send payment confirmations                               │
│                                                              │
│  Billing                                                     │
│  ━━━━━━━                                                    │
│  Monthly Cost: ₹199                                          │
│  First Month: Free trial                                     │
│                                                              │
│  Your card ending in •••• 1234 will be charged ₹199 starting│
│  from Nov 20, 2025.                                          │
│                                                              │
│  ☑ I agree to the module terms and conditions               │
│                                                              │
│  [Cancel]                            [Start Free Trial]      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Configure Module Settings

**Path**: Hub Admin > Modules & Apps > [Module] > Configure

**Example: WytWall Configuration**

```
┌─────────────────────────────────────────────────────────────┐
│  WytWall Module Settings                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tabs: General | Moderation | Categories | Advanced]        │
│                                                              │
│  General Settings                                            │
│  ━━━━━━━━━━━━━━━━                                           │
│                                                              │
│  ☑ Enable WytWall feed                                      │
│  ☑ Allow members to post Needs                              │
│  ☑ Allow members to post Offers                             │
│                                                              │
│  Post Settings                                               │
│  ━━━━━━━━━━━━━                                              │
│  Max images per post:        [10 ▼]                          │
│  Max description length:     [5000 chars]                    │
│  Post expiration:            [30 days ▼]                     │
│                                                              │
│  ☑ Require location for all posts                           │
│  ☑ Require price/budget for all posts                       │
│  ☐ Allow anonymous posts                                    │
│                                                              │
│  Moderation                                                  │
│  ━━━━━━━━━━                                                 │
│                                                              │
│  Moderation Mode:                                            │
│  ⚫ Auto-approve all posts                                   │
│  ⚪ Manual approval required                                 │
│  ⚪ AI-assisted moderation (approve low-risk, flag others)   │
│                                                              │
│  Auto-moderation Rules:                                      │
│  ☑ Block posts with profanity                               │
│  ☑ Block posts with spam keywords                           │
│  ☑ Block duplicate posts                                    │
│  ☑ Flag posts with contact info in description              │
│                                                              │
│  Categories                                                  │
│  ━━━━━━━━━━                                                 │
│                                                              │
│  Enable these categories for your hub:                       │
│  ☑ Product for Use                                          │
│  ☑ Product for Business                                     │
│  ☑ Property                                                 │
│  ☑ Services                                                 │
│  ☐ Jobs                                                     │
│  ☐ Events                                                   │
│  ☑ Community                                                │
│                                                              │
│  Custom Categories: [+ Add Custom Category]                  │
│  • Property Management                                       │
│  • Tenant Search                                            │
│                                                              │
│  Points & Rewards (WytPoints)                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━                                 │
│  Points for creating Need:  [5 points]                       │
│  Points for creating Offer: [10 points]                      │
│  Points for comment:        [2 points]                       │
│  Points for like:           [1 point]                        │
│                                                              │
│  [Cancel]                                      [Save Changes]│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Content Management

Manage pages, menus, and media for your hub.

### Pages

**Path**: Hub Admin > Content Management > Pages

```
┌─────────────────────────────────────────────────────────────┐
│  Pages                                        [+ New Page]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Status: [All ▼]  Search: [______________]                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📄 Home                                                 │ │
│  │    Path: /  |  Status: ✅ Published                     │ │
│  │    Last edited: Oct 18, 2025 by admin@ownernet.com     │ │
│  │    Views: 12,458                                        │ │
│  │    [Edit] [Preview] [Unpublish] [⋮]                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📄 About Us                                             │ │
│  │    Path: /about  |  Status: ✅ Published                │ │
│  │    Last edited: Sep 22, 2025 by admin@ownernet.com     │ │
│  │    Views: 3,456                                         │ │
│  │    [Edit] [Preview] [Unpublish] [⋮]                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📝 Community Guidelines (Draft)                         │ │
│  │    Path: /guidelines  |  Status: 📝 Draft               │ │
│  │    Last edited: Oct 20, 2025 by admin@ownernet.com     │ │
│  │    Views: -                                             │ │
│  │    [Edit] [Preview] [Publish] [Delete]                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Page Editor**:

```
┌─────────────────────────────────────────────────────────────┐
│  Edit Page: About Us                     [Save] [Publish]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Page Title: [About OwnerNet Community      ]                │
│  Slug:       [about                        ]                 │
│  Path:       /about (read-only)                              │
│                                                              │
│  [Tabs: Content | SEO | Settings]                            │
│                                                              │
│  Content Editor                                              │
│  ━━━━━━━━━━━━━━                                             │
│                                                              │
│  [Rich Text Editor Toolbar: B I U ⚲ 🔗 📷 Code ...]         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │ # About OwnerNet                                       │ │
│  │                                                        │ │
│  │ OwnerNet is Chennai's largest property owners         │ │
│  │ community platform connecting landlords, property      │ │
│  │ managers, and tenants.                                 │ │
│  │                                                        │ │
│  │ [Image: Community gathering]                           │ │
│  │                                                        │ │
│  │ ## Our Mission                                         │ │
│  │ ...                                                    │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  SEO Settings                                                │
│  ━━━━━━━━━━━━                                               │
│  Meta Title: [About OwnerNet - Chennai's Property Community ]│
│  Meta Description: [______________________________________]  │
│  [________________________________________________________]  │
│                                                              │
│  Featured Image: [Upload] [None selected]                    │
│                                                              │
│  Page Settings                                               │
│  ━━━━━━━━━━━━━                                              │
│  Template: [Default ▼]                                       │
│  Status: ⚫ Published  ⚪ Draft                               │
│  Visibility: ⚫ Public  ⚪ Members Only  ⚪ Private            │
│                                                              │
│  [Save as Draft] [Preview] [Publish]                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Navigation Menus

**Path**: Hub Admin > Content Management > Menus

```
┌─────────────────────────────────────────────────────────────┐
│  Navigation Menus                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Select Menu: [Primary Menu ▼]   [+ Create New Menu]        │
│                                                              │
│  Menu Items                                                  │
│  ━━━━━━━━━━                                                 │
│                                                              │
│  [+ Add Menu Item]                                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☰ Home                                      [Edit] [×]  │ │
│  │   Link: /  |  Target: _self                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☰ WytWall                                   [Edit] [×]  │ │
│  │   Link: /wytwall  |  Target: _self                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☰ About                                     [Edit] [×]  │ │
│  │   Link: /about  |  Target: _self                       │ │
│  │   └─ ☰ Our Team           (Submenu)        [Edit] [×]  │ │
│  │   └─ ☰ Contact Us         (Submenu)        [Edit] [×]  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☰ Events                                    [Edit] [×]  │ │
│  │   Link: /events  |  Target: _self                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Menu Settings                                               │
│  ━━━━━━━━━━━━━                                              │
│  Position: ⚫ Header  ⚪ Footer  ⚪ Sidebar                   │
│  Layout: ⚫ Horizontal  ⚪ Vertical                           │
│                                                              │
│  [Save Menu]                                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Media Library

**Path**: Hub Admin > Content Management > Media Library

```
┌─────────────────────────────────────────────────────────────┐
│  Media Library                              [Upload Files ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tabs: All | Images | Documents | Videos]                   │
│                                                              │
│  Filter: [All ▼]  Sort: [Newest ▼]  View: [Grid] [List]     │
│  Search: [______________]                                    │
│                                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] │              │
│  │      │ │      │ │      │ │      │ │      │              │
│  │Logo  │ │Hero  │ │Event │ │Team  │ │Banner│              │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │
│   [✓][⋮]   [✓][⋮]   [✓][⋮]   [✓][⋮]   [✓][⋮]              │
│                                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │[PDF] │ │[IMG] │ │[VID] │ │[IMG] │ │[IMG] │              │
│  │      │ │      │ │      │ │      │ │      │              │
│  │Guide │ │Photo │ │Intro │ │Slide │ │Cover │              │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │
│   [✓][⋮]   [✓][⋮]   [✓][⋮]   [✓][⋮]   [✓][⋮]              │
│                                                              │
│  Storage Used: 234 MB / 10 GB                                │
│  [■■■■■□□□□□] 23%                                           │
│                                                              │
│  Selected: 0 items                                           │
│  [Delete Selected] [Download] [Add to Gallery]               │
│                                                              │
│  Showing 1-12 of 145 files                                   │
│  [◄ Prev] [1] [2] [3] ... [13] [Next ►]                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Member Management

Manage your hub members, roles, and join requests.

### View All Members

**Path**: Hub Admin > Members > All Members

```
┌─────────────────────────────────────────────────────────────┐
│  Members                                  [+ Invite Members]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Total Members: 2,458  |  Active Today: 1,234                │
│                                                              │
│  Role: [All ▼]  Status: [All ▼]  Search: [______________]   │
│                                                              │
│  [Bulk Actions ▼]  [Export CSV]                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☐ [👤] Rajesh Kumar                                    │ │
│  │    rajesh@example.com | +91-9876543210                  │ │
│  │    Role: Member | ✓ Verified | Joined: Mar 15, 2024    │ │
│  │    Activity: Active today | Posts: 23 | WytPoints: 456  │ │
│  │    [View Profile] [Edit] [Change Role] [Remove] [⋮]     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☐ [👤] Priya Sharma                                    │ │
│  │    priya@example.com | +91-9123456789                   │ │
│  │    Role: Moderator | ✓ Verified | Joined: Jan 10, 2024 │ │
│  │    Activity: Active 2 hours ago | Posts: 67             │ │
│  │    [View Profile] [Edit] [Change Role] [Remove] [⋮]     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☐ [👤] Mohamed Ali                                     │ │
│  │    mohamed@example.com | No phone                       │ │
│  │    Role: Member | ⚠️ Not verified | Joined: Oct 18, 2025│ │
│  │    Activity: Last seen 5 days ago | Posts: 2            │ │
│  │    [View Profile] [Edit] [Send Verification] [Remove]   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Showing 1-20 of 2,458 members                               │
│  [◄ Prev] [1] [2] [3] ... [123] [Next ►]                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Member Roles

**Path**: Hub Admin > Members > Roles

```
┌─────────────────────────────────────────────────────────────┐
│  Member Roles                            [+ Create Role]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Hub Roles (4)                                               │
│  ━━━━━━━━━━                                                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Hub Admin                                    [Edit]     │ │
│  │ Full control over hub settings and members               │ │
│  │ Members: 2 | System Role: Cannot be deleted             │ │
│  │ Permissions: All hub permissions (45)                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Moderator                               [Edit] [Delete] │ │
│  │ Moderate posts and members                               │ │
│  │ Members: 5                                               │ │
│  │ Permissions: 12 permissions                              │ │
│  │ • View members, Edit posts, Delete comments, Ban users   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Member                                      [Edit]      │ │
│  │ Standard member with basic permissions                   │ │
│  │ Members: 2,448 | Default role for new members           │ │
│  │ Permissions: 8 permissions                               │ │
│  │ • Create posts, Comment, Like, View content              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Premium Member                          [Edit] [Delete] │ │
│  │ Premium members with extra benefits                      │ │
│  │ Members: 3                                               │ │
│  │ Permissions: 15 permissions                              │ │
│  │ • All member permissions + Priority support + No ads     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Join Requests

**Path**: Hub Admin > Members > Join Requests

```
┌─────────────────────────────────────────────────────────────┐
│  Join Requests                                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Pending Requests: 3                                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [👤] Ananya Reddy                                       │ │
│  │      ananya@example.com                                 │ │
│  │      Requested: 2 hours ago                             │ │
│  │                                                         │ │
│  │      Message: "I'm a property owner in T Nagar looking  │ │
│  │      to connect with other landlords in the area."      │ │
│  │                                                         │ │
│  │      [Approve] [Reject] [Send Message]                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [👤] Karthik Venkat                                     │ │
│  │      karthik@example.com                                │ │
│  │      Requested: 1 day ago                               │ │
│  │                                                         │ │
│  │      Message: "Property manager with 10+ years          │ │
│  │      experience. Would love to join the community."     │ │
│  │                                                         │ │
│  │      [Approve] [Reject] [Send Message]                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Approve All] [Reject All]                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Hub Settings

Configure general hub settings, privacy, and features.

### General Settings

**Path**: Hub Admin > Settings > General

```
┌─────────────────────────────────────────────────────────────┐
│  Hub Settings                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tabs: General | Privacy | Features | Integrations]         │
│                                                              │
│  Basic Information                                           │
│  ━━━━━━━━━━━━━━━━━━                                         │
│                                                              │
│  Hub Name:    [OwnerNet Community              ]             │
│  Tagline:     [Chennai's Largest Property Owners Community]  │
│  Description: [___________________________________________]  │
│               [___________________________________________]  │
│               [___________________________________________]  │
│                                                              │
│  Locale & Regional Settings                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━                                    │
│  Language:    [English (India) ▼]                            │
│  Timezone:    [Asia/Kolkata    ▼]                            │
│  Currency:    [INR ▼]                                         │
│  Date Format: [DD/MM/YYYY ▼]                                 │
│                                                              │
│  Contact Information                                         │
│  ━━━━━━━━━━━━━━━━━━━                                        │
│  Support Email:   [support@ownernet.com        ]             │
│  Contact Phone:   [+91-44-12345678             ]             │
│  Address:         [___________________________]             │
│                   [___________________________]             │
│                                                              │
│  Social Media                                                │
│  ━━━━━━━━━━━━                                               │
│  Facebook:    [https://facebook.com/ownernet   ]             │
│  Twitter:     [https://twitter.com/ownernet    ]             │
│  LinkedIn:    [https://linkedin.com/company/... ]            │
│  Instagram:   [https://instagram.com/ownernet  ]             │
│                                                              │
│  [Save Changes]                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Privacy Settings

**Path**: Hub Admin > Settings > Privacy

```
┌─────────────────────────────────────────────────────────────┐
│  Privacy Settings                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Hub Visibility                                              │
│  ━━━━━━━━━━━━━━                                             │
│                                                              │
│  ⚫ Public - Anyone can view and join                        │
│  ⚪ Private - Invite-only, hidden from search                │
│  ⚪ Unlisted - Anyone with link can view and join            │
│                                                              │
│  Member Join Settings                                        │
│  ━━━━━━━━━━━━━━━━━━━━                                       │
│                                                              │
│  ⚫ Allow self-signup                                        │
│  ⚪ Require admin approval                                   │
│  ⚪ Invite-only                                              │
│                                                              │
│  ☑ Ask for join request message                             │
│  ☑ Email verification required                              │
│  ☑ Phone verification required                              │
│                                                              │
│  Content Privacy                                             │
│  ━━━━━━━━━━━━━━━                                            │
│                                                              │
│  Who can view hub content?                                   │
│  ⚫ Everyone (Public)                                        │
│  ⚪ Members only                                             │
│  ⚪ Logged-in users                                          │
│                                                              │
│  Who can create posts?                                       │
│  ⚫ All members                                              │
│  ⚪ Moderators and admins only                               │
│  ⚪ Custom role selection                                    │
│                                                              │
│  Search Engine Indexing                                      │
│  ━━━━━━━━━━━━━━━━━━━━━                                      │
│                                                              │
│  ☑ Allow search engines to index hub pages                  │
│  ☐ Block search engine indexing (noindex)                   │
│                                                              │
│  Data & Analytics                                            │
│  ━━━━━━━━━━━━━━━━                                           │
│                                                              │
│  ☑ Enable Google Analytics                                  │
│  ☑ Track user behavior for insights                         │
│  ☑ Allow members to opt-out of analytics                    │
│                                                              │
│  [Save Changes]                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Feature Settings

**Path**: Hub Admin > Settings > Features

```
┌─────────────────────────────────────────────────────────────┐
│  Feature Settings                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Core Features                                               │
│  ━━━━━━━━━━━━━                                              │
│                                                              │
│  ☑ Member Profiles                                          │
│  ☑ Direct Messaging                                         │
│  ☑ Notifications                                            │
│  ☑ Search                                                   │
│  ☐ Live Chat                                                │
│  ☐ Video Calls                                              │
│                                                              │
│  Social Features                                             │
│  ━━━━━━━━━━━━━━━                                            │
│                                                              │
│  ☑ WytWall Feed (Needs & Offers)                            │
│  ☑ Comments                                                 │
│  ☑ Likes & Reactions                                        │
│  ☐ Polls & Surveys                                          │
│  ☐ Groups & Communities                                     │
│                                                              │
│  Commerce Features                                           │
│  ━━━━━━━━━━━━━━━━━                                          │
│                                                              │
│  ☑ Payments (Razorpay)                                      │
│  ☐ Subscriptions                                            │
│  ☐ Marketplace                                              │
│  ☐ Booking System                                           │
│                                                              │
│  Content Features                                            │
│  ━━━━━━━━━━━━━━━━                                           │
│                                                              │
│  ☑ Blog/Articles                                            │
│  ☑ Events Calendar                                          │
│  ☐ Photo Gallery                                            │
│  ☐ Video Library                                            │
│  ☐ Document Repository                                      │
│                                                              │
│  Gamification                                                │
│  ━━━━━━━━━━━━━                                              │
│                                                              │
│  ☑ WytPoints (Point system)                                 │
│  ☑ WytStars (Levels & Badges)                               │
│  ☑ Leaderboards                                             │
│  ☐ Achievements                                             │
│                                                              │
│  [Save Changes]                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Analytics & Insights

Track your hub's performance and member engagement.

### Analytics Dashboard

**Path**: Hub Admin > Analytics

```
┌─────────────────────────────────────────────────────────────┐
│  Hub Analytics                                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Period: [Last 30 Days ▼]  Compare: [Previous Period ▼]     │
│                                                              │
│  Overview                                                    │
│  ━━━━━━━━                                                   │
│                                                              │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│  │  2,458    │ │  1,234    │ │    234    │ │   1,567   │   │
│  │  Total    │ │  Active   │ │    New    │ │   Total   │   │
│  │  Members  │ │  Today    │ │ This Week │ │   Posts   │   │
│  │  +12% ↑   │ │  +5% ↑    │ │  +23% ↑   │ │  +18% ↑   │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
│                                                              │
│  Member Growth                                               │
│  ━━━━━━━━━━━━━                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [Line chart showing member growth over time]          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Engagement Metrics                                          │
│  ━━━━━━━━━━━━━━━━━                                          │
│                                                              │
│  Daily Active Users (DAU):    1,234                          │
│  Weekly Active Users (WAU):   2,156                          │
│  Monthly Active Users (MAU):  2,458                          │
│                                                              │
│  Engagement Rate:             89%                            │
│  Avg. Session Duration:       8m 45s                         │
│  Posts Per Active User:       2.3                            │
│  Comments Per Post:           4.7                            │
│                                                              │
│  Top Content                                                 │
│  ━━━━━━━━━━━                                                │
│  1. "2BHK flat for rent in Anna Nagar" - 456 views          │
│  2. "Looking for property manager" - 389 views               │
│  3. "Community guidelines updated" - 234 views               │
│                                                              │
│  Top Contributors                                            │
│  ━━━━━━━━━━━━━━━━                                           │
│  1. Rajesh Kumar - 67 posts, 234 comments                    │
│  2. Priya Sharma - 45 posts, 189 comments                    │
│  3. Suresh Babu - 34 posts, 156 comments                     │
│                                                              │
│  Geographic Distribution                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━                                     │
│  1. Chennai - 1,892 members (77%)                            │
│  2. Bangalore - 234 members (10%)                            │
│  3. Mumbai - 145 members (6%)                                │
│  4. Others - 187 members (7%)                                │
│                                                              │
│  [Export Report] [Schedule Email]                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Billing & Subscription

Manage your hub's subscription and billing.

### Billing Dashboard

**Path**: Hub Admin > Billing

```
┌─────────────────────────────────────────────────────────────┐
│  Billing & Subscription                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Current Plan                                                │
│  ━━━━━━━━━━━                                                │
│                                                              │
│  Hub Premium                                                 │
│  ₹2,999/month                                                │
│                                                              │
│  Includes:                                                   │
│  ✓ Unlimited members                                        │
│  ✓ Custom domain                                            │
│  ✓ 12 active modules                                        │
│  ✓ Priority support                                         │
│  ✓ Advanced analytics                                       │
│                                                              │
│  Next billing date: Nov 15, 2025                             │
│  Amount: ₹2,999                                              │
│                                                              │
│  [Change Plan] [Cancel Subscription]                         │
│                                                              │
│  Payment Method                                              │
│  ━━━━━━━━━━━━━━                                             │
│                                                              │
│  💳 Visa ending in •••• 1234                                 │
│  Expires: 12/26                                              │
│                                                              │
│  [Update Payment Method] [Add New Card]                      │
│                                                              │
│  Billing History                                             │
│  ━━━━━━━━━━━━━━━                                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Oct 15, 2025  │ Hub Premium      │ ₹2,999  │ ✓ Paid    │ │
│  │               │ Invoice #12345   │         │ [Download]│ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Sep 15, 2025  │ Hub Premium      │ ₹2,999  │ ✓ Paid    │ │
│  │               │ Invoice #12344   │         │ [Download]│ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Total Spent: ₹35,988 (Last 12 months)                       │
│                                                              │
│  Module Subscriptions                                        │
│  ━━━━━━━━━━━━━━━━━━━                                        │
│                                                              │
│  • WhatsApp Integration - ₹199/month                         │
│  • Learning Management System - ₹999/month                   │
│                                                              │
│  Subtotal: ₹1,198/month                                      │
│                                                              │
│  Total Monthly Cost: ₹4,197                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Common Hub Admin Workflows

### Workflow 1: Launch Your Hub

1. **Set up branding**: Upload logo, set colors
2. **Configure domain**: Add custom domain (optional)
3. **Activate modules**: Enable WytWall, Calendar, etc.
4. **Create pages**: About, Guidelines, Contact
5. **Configure settings**: Privacy, features, join rules
6. **Invite members**: Send invitations or enable self-signup
7. **Announce launch**: Share hub URL on social media
8. **Monitor activity**: Check dashboard daily

### Workflow 2: Moderate WytWall Posts

1. Go to **Hub Admin > WytWall > Moderation Queue**
2. Review pending post details
3. Check for spam, inappropriate content, duplicates
4. Make decision: Approve or Reject
5. If rejecting, provide reason to user
6. Set auto-moderation rules to reduce manual work

### Workflow 3: Add a New Hub Admin

1. Go to **Hub Admin > Members > All Members**
2. Search for the member
3. Click member profile
4. Click **"Change Role"**
5. Select **"Hub Admin"** role
6. Confirm assignment
7. Member receives email notification
8. New admin can access Hub Admin Panel

### Workflow 4: Customize Member Onboarding

1. Go to **Hub Admin > Settings > Features**
2. Enable **"Welcome Message"**
3. Create welcome page content
4. Set up automated welcome email
5. Configure onboarding checklist
6. Enable guided tour for new members
7. Test the flow by creating test member

---

## Best Practices

1. **Regular Updates**: Keep your hub content fresh and updated
2. **Member Engagement**: Post regularly, respond to comments
3. **Moderation**: Review pending content daily
4. **Analytics**: Check analytics weekly to track growth
5. **Branding Consistency**: Maintain consistent branding across all channels
6. **Communication**: Keep members informed of updates
7. **Security**: Enable 2FA, review sessions regularly
8. **Backup**: Export member data monthly
9. **Support**: Respond to member queries within 24 hours
10. **Innovation**: Try new modules and features

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Quick search |
| `G then D` | Go to Dashboard |
| `G then M` | Go to Members |
| `G then S` | Go to Settings |
| `G then A` | Go to Analytics |
| `Ctrl + S` | Save current form |
| `Esc` | Close modal |

---

## Support & Help

For Hub Admin support:

- **Help Center**: https://wytnet.com/help
- **Community Forum**: https://community.wytnet.com
- **Email Support**: support@wytnet.com
- **Live Chat**: Available during business hours
- **Video Tutorials**: https://wytnet.com/tutorials

For urgent issues:
- **Priority Support**: priority@wytnet.com (Premium plan)
- **Phone Support**: +91-44-12345678 (Business hours)

---

## Frequently Asked Questions

**Q: How do I upgrade my hub plan?**

A: Go to Hub Admin > Billing > Change Plan and select your desired plan.

**Q: Can I have multiple custom domains?**

A: Premium and Enterprise plans support multiple custom domains.

**Q: How do I export my member data?**

A: Go to Hub Admin > Members > Export CSV to download all member data.

**Q: What happens if I cancel my subscription?**

A: Your hub will be downgraded to the free plan. Custom domain, some modules, and advanced features will be disabled.

**Q: Can I restore deleted content?**

A: Yes, deleted content is moved to trash and can be restored within 30 days.

**Q: How do I add co-admins?**

A: Assign "Hub Admin" role to members via Hub Admin > Members.

**Q: Is there a mobile app for hub admins?**

A: Yes, the WytNet mobile app includes hub admin features.

**Q: How do I integrate with third-party services?**

A: Go to Hub Admin > Settings > Integrations to configure third-party integrations.
