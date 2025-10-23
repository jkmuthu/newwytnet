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
        label: "System Health",
        icon: Activity,
        href: "/engine/system-health",
        description: "Server status, database health, service monitoring",
        keywords: ["health", "status", "monitoring", "uptime"],
        superAdminOnly: true
      },
      {
        label: "Real-time Analytics",
        icon: TrendingUp,
        href: "/engine/analytics-realtime",
        description: "Live user activity, performance metrics",
        keywords: ["analytics", "realtime", "live", "monitoring"],
        adminOnly: true
      },
      {
        label: "Quick Actions",
        icon: Zap,
        href: "/engine/quick-actions",
        description: "Common administrative tasks, shortcuts",
        keywords: ["quick", "actions", "shortcuts", "tasks"]
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
        label: "Admin Users",
        icon: Shield,
        href: "/engine/admin-users",
        description: "Engine admin user management",
        keywords: ["admin", "users", "administrators"],
        superAdminOnly: true
      },
      {
        label: "Platform Hubs",
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
      },
      {
        label: "WytPass Authentication",
        icon: Lock,
        href: "/engine/wytpass",
        description: "Unified authentication system, OAuth providers",
        keywords: ["auth", "authentication", "wytpass", "oauth"],
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
        label: "Module Library",
        icon: Package,
        href: "/engine/modules",
        description: "WytModules catalog, activation, configuration",
        keywords: ["modules", "library", "catalog", "plugins"]
      },
      {
        label: "Apps",
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
        label: "DataSets",
        icon: Database,
        href: "/engine/datasets",
        description: "WytData management, global datasets",
        keywords: ["datasets", "data", "wytdata"]
      },
      {
        label: "Page Builder",
        icon: FileText,
        href: "/engine/page-builder",
        description: "Visual page builder for custom layouts",
        keywords: ["pages", "builder", "visual", "custom"],
        superAdminOnly: true
      },
      {
        label: "Hub Builder",
        icon: Globe,
        href: "/engine/hub-builder",
        description: "Create and configure new hubs",
        keywords: ["hub", "builder", "create"],
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
        label: "Subscriptions",
        icon: FileText,
        href: "/engine/subscriptions",
        description: "User subscriptions, billing management",
        keywords: ["subscriptions", "billing", "payments"]
      },
      {
        label: "Payment Methods",
        icon: CreditCard,
        href: "/engine/payment-methods",
        description: "Configure payment gateways, methods",
        keywords: ["payments", "gateways", "razorpay", "stripe"],
        superAdminOnly: true
      },
      {
        label: "Revenue Analytics",
        icon: TrendingUp,
        href: "/engine/revenue-analytics",
        description: "Revenue reports, financial analytics",
        keywords: ["revenue", "analytics", "reports", "finance"]
      },
      {
        label: "WytPoints Management",
        icon: CreditCard,
        href: "/engine/wytpoints",
        description: "WytPoints economy, rewards, transactions",
        keywords: ["wytpoints", "rewards", "economy", "credits"]
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
      },
      {
        label: "Branding Settings",
        icon: Palette,
        href: "/engine/branding",
        description: "Platform branding, logos, colors",
        keywords: ["branding", "logo", "colors", "identity"],
        superAdminOnly: true
      },
      {
        label: "UI Customization",
        icon: Settings,
        href: "/engine/ui-customization",
        description: "Customize UI components, layouts",
        keywords: ["ui", "customization", "components", "layouts"],
        superAdminOnly: true
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
      },
      {
        label: "API Management",
        icon: Code,
        href: "/engine/api-management",
        description: "API keys, rate limiting, documentation",
        keywords: ["api", "keys", "documentation", "endpoints"],
        superAdminOnly: true
      },
      {
        label: "Webhooks",
        icon: Webhook,
        href: "/engine/webhooks",
        description: "Webhook configuration, event triggers",
        keywords: ["webhooks", "events", "triggers"],
        superAdminOnly: true
      },
      {
        label: "Custom Connectors",
        icon: Plug,
        href: "/engine/connectors",
        description: "Build custom integration connectors",
        keywords: ["connectors", "custom", "integrations"],
        developerOnly: true
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
        label: "WytAI Agent",
        icon: Brain,
        href: "/engine/wytai",
        description: "AI assistant, full-page interface, conversations",
        keywords: ["ai", "assistant", "wytai", "chat", "gpt", "claude"]
      },
      {
        label: "AI Models Configuration",
        icon: Cpu,
        href: "/engine/ai-config",
        description: "Configure AI providers (OpenAI, Claude, Gemini)",
        keywords: ["ai", "models", "openai", "claude", "gemini", "config"],
        superAdminOnly: true
      },
      {
        label: "Automation Rules",
        icon: Zap,
        href: "/engine/automation",
        description: "Create automation rules, triggers",
        keywords: ["automation", "rules", "triggers", "workflows"]
      },
      {
        label: "Workflow Builder",
        icon: Workflow,
        href: "/engine/workflows",
        description: "Visual workflow builder for automation",
        keywords: ["workflow", "builder", "automation", "visual"],
        adminOnly: true
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
        label: "Trash Management",
        icon: Trash,
        href: "/engine/trash",
        description: "Deleted items, recovery, permanent deletion",
        keywords: ["trash", "deleted", "recovery", "restore"],
        adminOnly: true
      },
      {
        label: "Database Tools",
        icon: Database,
        href: "/engine/db-tools",
        description: "Database management, queries, schema",
        keywords: ["database", "tools", "queries", "schema"],
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
        label: "Knowledge Base",
        icon: Lightbulb,
        href: "/engine/knowledge-base",
        description: "Articles, tutorials, best practices",
        keywords: ["knowledge", "articles", "tutorials", "guides"]
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
  // 10. Developer Tools
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "developer-tools",
    title: "🧪 Developer Tools",
    icon: Terminal,
    order: 10,
    items: [
      {
        label: "Analytics",
        icon: BarChart3,
        href: "/engine/analytics",
        description: "Platform analytics, usage statistics",
        keywords: ["analytics", "stats", "metrics", "usage"]
      },
      {
        label: "API Explorer",
        icon: Terminal,
        href: "/engine/api-explorer",
        description: "Interactive API testing, documentation",
        keywords: ["api", "explorer", "testing", "swagger"],
        developerOnly: true
      },
      {
        label: "Webhook Tester",
        icon: Webhook,
        href: "/engine/webhook-tester",
        description: "Test webhooks, inspect payloads",
        keywords: ["webhook", "tester", "payloads", "test"],
        developerOnly: true
      },
      {
        label: "Database Query Tool",
        icon: Database,
        href: "/engine/db-query",
        description: "Execute SQL queries, inspect database",
        keywords: ["database", "query", "sql", "inspect"],
        developerOnly: true
      },
      {
        label: "Log Viewer",
        icon: FileText,
        href: "/engine/logs",
        description: "View application logs, error tracking",
        keywords: ["logs", "errors", "tracking", "debugging"],
        developerOnly: true
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
