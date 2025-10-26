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
 * Optimized Navigation Structure
 * 5 Main Groups: Overview | Core Management | CMS & Builders | Analytics & Insights | Settings
 */
export const navigationSections: NavigationSection[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. Overview
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "overview",
    title: "📊 Overview",
    icon: LayoutDashboard,
    order: 1,
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/engine",
        description: "Platform overview, key metrics, recent activity",
        keywords: ["dashboard", "overview", "metrics", "stats"]
      },
      {
        label: "Notifications",
        icon: Bell,
        href: "/engine/notifications",
        description: "System notifications, alerts, announcements",
        keywords: ["notifications", "alerts", "announcements", "messages"]
      },
      {
        label: "Global Search",
        icon: Search,
        href: "/engine/search",
        description: "Search across all platform resources",
        keywords: ["search", "find", "query", "lookup"]
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. Core Management
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "core-management",
    title: "🏗️ Core Management",
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
        label: "All Hubs",
        icon: Network,
        href: "/engine/platform-hubs",
        description: "Hub management, domain routing, hub settings",
        keywords: ["hubs", "domains", "routing"],
        superAdminOnly: true
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. CMS & Builders
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "cms-builders",
    title: "🔨 CMS & Builders",
    icon: Code,
    order: 3,
    items: [
      {
        label: "Pages & CMS",
        icon: FileText,
        href: "/engine/cms",
        description: "Content management system, pages, posts",
        keywords: ["cms", "content", "pages", "posts"]
      },
      {
        label: "App Builder",
        icon: Code,
        href: "/engine/app-builder",
        description: "AI-powered application builder",
        keywords: ["app", "builder", "ai", "create", "generate"],
        superAdminOnly: true
      },
      {
        label: "API Library",
        icon: Webhook,
        href: "/engine/api-library",
        description: "Third-party API management, white-label rebranding",
        keywords: ["api", "library", "integrations", "rebrand", "wytmap"],
        superAdminOnly: true
      },
      {
        label: "All Themes",
        icon: Palette,
        href: "/engine/themes",
        description: "Theme management, customization",
        keywords: ["themes", "design", "colors", "branding"]
      },
      {
        label: "Media Library",
        icon: Images,
        href: "/engine/media",
        description: "Media library, images, assets",
        keywords: ["media", "images", "assets", "files"]
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. Analytics & Insights
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "analytics-insights",
    title: "📊 Analytics & Insights",
    icon: BarChart3,
    order: 4,
    items: [
      {
        label: "Help & Support",
        icon: HelpCircle,
        href: "/engine/help-support",
        description: "Support resources, FAQs, help center",
        keywords: ["help", "support", "faq", "assistance"]
      },
      {
        label: "Transactions",
        icon: List,
        href: "/engine/transactions",
        description: "Transaction history, payment records",
        keywords: ["transactions", "payments", "history", "records"]
      },
      {
        label: "Analytics",
        icon: BarChart3,
        href: "/engine/analytics",
        description: "Platform analytics, usage statistics",
        keywords: ["analytics", "stats", "metrics", "usage"]
      },
      {
        label: "DevDoc",
        icon: Book,
        href: "/devdoc",
        description: "Developer documentation, technical guides",
        keywords: ["devdoc", "documentation", "developer", "guides"]
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. Settings
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "settings",
    title: "⚙️ Settings",
    icon: Settings,
    order: 5,
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
        label: "Pricing Plans",
        icon: CreditCard,
        href: "/engine/plans-prices",
        description: "Pricing plans, subscription tiers",
        keywords: ["plans", "pricing", "subscriptions"]
      },
      {
        label: "Points Management",
        icon: Zap,
        href: "/engine/wytpoints",
        description: "WytPoints economy, rewards, transactions",
        keywords: ["wytpoints", "rewards", "economy", "credits"]
      },
      {
        label: "Integrations",
        icon: Plug,
        href: "/engine/integrations",
        description: "Third-party integrations, services",
        keywords: ["integrations", "services", "third-party"],
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
        label: "Backups",
        icon: Database,
        href: "/engine/backups",
        description: "Database backups, restore, scheduling",
        keywords: ["backup", "restore", "database"],
        superAdminOnly: true
      },
      {
        label: "Geo Regulatory",
        icon: Globe,
        href: "/engine/geo-regulatory",
        description: "Geographic and regulatory compliance settings",
        keywords: ["geo", "regulatory", "compliance", "location"],
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
        label: "All Logs",
        icon: FileText,
        href: "/engine/all-logs",
        description: "Unified logs: Audit, System, and Advanced logs",
        keywords: ["logs", "audit", "system", "advanced", "activity"],
        superAdminOnly: true
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
