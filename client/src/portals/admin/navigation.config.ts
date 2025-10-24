/**
 * Canonical Navigation Registry for Engine Admin Portal
 * 
 * Phase 1: Engine Panel Consolidation
 * - Organizes navigation into 10 logical sections
 * - Enables shared metadata for search and breadcrumbs
 * - Supports role-based access control
 * 
 * Status: Initial registry based on current implementation
 */

import {
  LayoutDashboard,
  Users,
  Building,
  Package,
  Smartphone,
  Network,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Database,
  Globe,
  Palette,
  Images,
  Plug,
  CreditCard,
  FileImage,
  List,
  Server,
  Eye,
  CheckSquare,
  ClipboardCheck,
  Brain,
  Cpu,
  Code,
  Terminal,
  Workflow,
  Webhook,
  Search,
  HelpCircle,
  Book,
  Lightbulb,
  Lock,
  Trash,
  Activity,
  Home,
  TrendingUp,
  Zap,
  Bell,
  User,
  type LucideIcon
} from "lucide-react";

/**
 * Navigation Item Interface
 */
export interface NavigationItem {
  label: string;
  icon: LucideIcon;
  href: string;
  description?: string;
  badge?: string;
  superAdminOnly?: boolean;
  adminOnly?: boolean;
  developerOnly?: boolean;
  keywords?: string[]; // For search indexing
}

/**
 * Navigation Section Interface
 */
export interface NavigationSection {
  id: string;
  title: string;
  icon: LucideIcon;
  items: NavigationItem[];
  order: number;
  collapsed?: boolean;
}

/**
 * Phase 1 Target: 10 Logical Sections
 * 
 * Mapping existing items + adding new items for complete Self-Service Platform
 */
export const navigationSections: NavigationSection[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. Dashboard & Overview
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "dashboard",
    title: "📊 Dashboard & Overview",
    icon: LayoutDashboard,
    order: 1,
    items: [
      {
        label: "Platform Dashboard",
        icon: LayoutDashboard,
        href: "/engine",
        description: "Platform overview, key metrics, recent activity",
        keywords: ["dashboard", "overview", "metrics", "stats"]
      },
      {
        label: "Global Search",
        icon: Search,
        href: "/engine/search",
        description: "Search across all platform resources",
        keywords: ["search", "find", "query", "lookup"]
      },
      {
        label: "Notifications",
        icon: Bell,
        href: "/engine/notifications",
        description: "System notifications, alerts, announcements",
        keywords: ["notifications", "alerts", "announcements", "messages"]
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. Platform Management
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "platform-management",
    title: "🏗️ Platform Management",
    icon: Building,
    order: 2,
    items: [
      {
        label: "All Users",
        icon: Users,
        href: "/engine/users",
        description: "User management, profiles, authentication",
        keywords: ["users", "profiles", "accounts"]
      },
      {
        label: "All Orgs",
        icon: Building,
        href: "/engine/tenants",
        description: "Organization management, multi-tenancy",
        keywords: ["organizations", "tenants", "companies"]
      },
      {
        label: "All Hubs",
        icon: Network,
        href: "/engine/platform-hubs",
        description: "Hub management, domain routing, hub settings",
        keywords: ["hubs", "domains", "routing"],
        superAdminOnly: true
      },
      {
        label: "Roles & Permissions",
        icon: Shield,
        href: "/engine/roles-permissions",
        description: "RBAC management, role creation, permission assignment",
        keywords: ["roles", "permissions", "rbac", "access"],
        superAdminOnly: true
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. Content & Builders
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "content-builders",
    title: "🔨 Content & Builders",
    icon: Package,
    order: 3,
    items: [
      {
        label: "All Modules",
        icon: Package,
        href: "/engine/modules",
        description: "WytModules catalog, activation, configuration",
        keywords: ["modules", "library", "catalog", "plugins"]
      },
      {
        label: "All Apps",
        icon: Smartphone,
        href: "/engine/apps",
        description: "WytApps management, app installation, configuration",
        keywords: ["apps", "applications", "wytapps"]
      },
      {
        label: "CMS",
        icon: FileText,
        href: "/engine/cms",
        description: "Content management system, pages, posts",
        keywords: ["cms", "content", "pages", "posts"]
      },
      {
        label: "All Entities",
        icon: Network,
        href: "/engine/entities",
        description: "Entity type management, custom entities",
        keywords: ["entities", "types", "custom"]
      },
      {
        label: "All Datasets",
        icon: Database,
        href: "/engine/datasets",
        description: "WytData management, global datasets",
        keywords: ["datasets", "data", "wytdata"]
      },
      {
        label: "App Builder",
        icon: Code,
        href: "/engine/app-builder",
        description: "AI-powered application builder",
        keywords: ["app", "builder", "ai", "create", "generate"],
        superAdminOnly: true
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. Business & Commerce
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "business-commerce",
    title: "💰 Business & Commerce",
    icon: CreditCard,
    order: 4,
    items: [
      {
        label: "Plans & Prices",
        icon: CreditCard,
        href: "/engine/plans-prices",
        description: "Pricing plans, subscription tiers",
        keywords: ["plans", "pricing", "subscriptions"]
      },
      {
        label: "Finance",
        icon: BarChart3,
        href: "/engine/finance",
        description: "Financial overview, transactions, revenue",
        keywords: ["finance", "revenue", "transactions"]
      },
      {
        label: "WytPoints Management",
        icon: CreditCard,
        href: "/engine/wytpoints",
        description: "WytPoints economy, rewards, transactions",
        keywords: ["wytpoints", "rewards", "economy", "credits"]
      },
      {
        label: "Billing",
        icon: CreditCard,
        href: "/engine/billing",
        description: "Billing management, invoices, payment history",
        keywords: ["billing", "invoices", "payments", "history"]
      },
      {
        label: "Transactions",
        icon: List,
        href: "/engine/transactions",
        description: "Transaction history, payment records",
        keywords: ["transactions", "payments", "history", "records"]
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. Design & Themes
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "design-themes",
    title: "🎨 Design & Themes",
    icon: Palette,
    order: 5,
    items: [
      {
        label: "Themes",
        icon: Palette,
        href: "/engine/themes",
        description: "Theme management, customization",
        keywords: ["themes", "design", "colors", "branding"]
      },
      {
        label: "Media",
        icon: Images,
        href: "/engine/media",
        description: "Media library, images, assets",
        keywords: ["media", "images", "assets", "files"]
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. Integrations & APIs
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "integrations-apis",
    title: "🔌 Integrations & APIs",
    icon: Plug,
    order: 6,
    items: [
      {
        label: "Integrations",
        icon: Plug,
        href: "/engine/integrations",
        description: "Third-party integrations, services",
        keywords: ["integrations", "services", "third-party"],
        superAdminOnly: true
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. AI & Automation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "ai-automation",
    title: "🤖 AI & Automation",
    icon: Brain,
    order: 7,
    items: [
      {
        label: "AI Management",
        icon: Brain,
        href: "/engine/ai",
        description: "AI system management, models, settings",
        keywords: ["ai", "management", "models", "settings"],
        superAdminOnly: true
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. System & Settings
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "system-settings",
    title: "⚙️ System & Settings",
    icon: Settings,
    order: 8,
    items: [
      {
        label: "Global Settings",
        icon: Settings,
        href: "/engine/global-settings",
        description: "Platform-wide configuration, global settings",
        keywords: ["settings", "global", "configuration"],
        superAdminOnly: true
      },
      {
        label: "System & Security",
        icon: Shield,
        href: "/engine/system-security",
        description: "Security settings, compliance, monitoring",
        keywords: ["security", "compliance", "monitoring", "system"],
        superAdminOnly: true
      },
      {
        label: "Audit Logs",
        icon: Eye,
        href: "/engine/audit-logs",
        description: "Activity logs, audit trail, user actions",
        keywords: ["audit", "logs", "activity", "trail"],
        superAdminOnly: true
      },
      {
        label: "Backups",
        icon: Database,
        href: "/engine/backups",
        description: "Database backups, restore, scheduling",
        keywords: ["backup", "restore", "database"],
        superAdminOnly: true
      },
      {
        label: "SEO Settings",
        icon: Search,
        href: "/engine/seo-settings",
        description: "SEO configuration, meta tags, sitemap",
        keywords: ["seo", "search", "optimization", "meta"],
        adminOnly: true
      },
      {
        label: "Geo-Regulatory",
        icon: Globe,
        href: "/engine/geo-regulatory",
        description: "Geographic and regulatory compliance settings",
        keywords: ["geo", "regulatory", "compliance", "location"],
        superAdminOnly: true
      },
      {
        label: "System Logs",
        icon: FileText,
        href: "/engine/system-logs",
        description: "System logs, errors, warnings",
        keywords: ["logs", "system", "errors", "warnings"],
        superAdminOnly: true
      },
      {
        label: "Advanced Logs",
        icon: Terminal,
        href: "/engine/logs",
        description: "Advanced system logs viewer",
        keywords: ["logs", "advanced", "system", "debug"],
        developerOnly: true
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9. Help & Documentation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "help-documentation",
    title: "📚 Help & Documentation",
    icon: HelpCircle,
    order: 9,
    items: [
      {
        label: "DevDoc Access",
        icon: Book,
        href: "/devdoc",
        description: "Developer documentation, technical guides",
        keywords: ["devdoc", "documentation", "developer", "guides"]
      },
      {
        label: "Help & Support",
        icon: HelpCircle,
        href: "/engine/help-support",
        description: "Support resources, FAQs, help center",
        keywords: ["help", "support", "faq", "assistance"]
      },
      {
        label: "Features Checklist",
        icon: CheckSquare,
        href: "/engine/features-checklist",
        description: "Track feature implementation progress",
        keywords: ["features", "checklist", "progress", "tracking"],
        superAdminOnly: true
      },
      {
        label: "QA Testing Tracker",
        icon: ClipboardCheck,
        href: "/engine/qa-testing-tracker",
        description: "Quality assurance testing, test results",
        keywords: ["qa", "testing", "quality", "tracker"],
        superAdminOnly: true
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 10. Analytics & Insights
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "analytics-insights",
    title: "📊 Analytics & Insights",
    icon: BarChart3,
    order: 10,
    items: [
      {
        label: "Platform Analytics",
        icon: BarChart3,
        href: "/engine/analytics",
        description: "Platform analytics, usage statistics",
        keywords: ["analytics", "stats", "metrics", "usage"]
      }
    ]
  }
];

/**
 * Helper Functions
 */

/**
 * Get all navigation items flattened
 */
export function getAllNavigationItems(): NavigationItem[] {
  return navigationSections.flatMap(section => section.items);
}

/**
 * Search navigation items by keyword
 */
export function searchNavigationItems(query: string): NavigationItem[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  const allItems = getAllNavigationItems();
  
  return allItems.filter(item => {
    const matchesLabel = item.label.toLowerCase().includes(lowerQuery);
    const matchesDescription = item.description?.toLowerCase().includes(lowerQuery);
    const matchesKeywords = item.keywords?.some(keyword => 
      keyword.toLowerCase().includes(lowerQuery)
    );
    
    return matchesLabel || matchesDescription || matchesKeywords;
  });
}

/**
 * Get navigation items filtered by user role
 */
export function getFilteredNavigationSections(userRole: {
  isSuperAdmin?: boolean;
  isAdmin?: boolean;
  isDeveloper?: boolean;
}): NavigationSection[] {
  return navigationSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Super admin sees everything
      if (userRole.isSuperAdmin) return true;
      
      // Filter based on role restrictions
      if (item.superAdminOnly) return false;
      if (item.developerOnly && !userRole.isDeveloper) return false;
      if (item.adminOnly && !userRole.isAdmin && !userRole.isSuperAdmin) return false;
      
      return true;
    })
  })).filter(section => section.items.length > 0);
}

/**
 * Get breadcrumb trail for a given path
 */
export function getBreadcrumbs(path: string): { label: string; href: string }[] {
  const breadcrumbs: { label: string; href: string }[] = [
    { label: "Dashboard", href: "/engine" }
  ];
  
  // Find matching navigation item
  const allItems = getAllNavigationItems();
  const matchedItem = allItems.find(item => item.href === path);
  
  if (matchedItem && path !== "/engine") {
    // Find the section
    const section = navigationSections.find(s => 
      s.items.some(i => i.href === path)
    );
    
    if (section) {
      breadcrumbs.push({
        label: section.title.replace(/^[^\s]+\s/, ''), // Remove emoji
        href: section.items[0].href // Link to first item in section
      });
    }
    
    breadcrumbs.push({
      label: matchedItem.label,
      href: matchedItem.href
    });
  }
  
  return breadcrumbs;
}

/**
 * Get navigation section by ID
 */
export function getNavigationSection(id: string): NavigationSection | undefined {
  return navigationSections.find(section => section.id === id);
}

export default navigationSections;
