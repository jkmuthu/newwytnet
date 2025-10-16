import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronLeft,
  ChevronDown,
  ChevronRight,
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
  Bot,
  CreditCard,
  FileImage,
  List,
  Server,
  Eye
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface NavigationItem {
  label: string;
  icon: React.ElementType;
  href: string;
  active: boolean;
}

interface NavSection {
  section: string;
  items: NavigationItem[];
}

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * AdminSidebar - Navigation sidebar for admin portal
 * Features: Admin-only navigation, system management tools, role-based access
 */
export default function AdminSidebar({ collapsed, onToggleCollapse }: AdminSidebarProps) {
  const [location] = useLocation();
  const { adminUser } = useAdminAuth();
  const [openSections, setOpenSections] = useState<string[]>(['Dashboard', 'Build & Compose']);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Navigation items based on admin role
  const getNavigationItems = () => {
    const isSuperAdmin = adminUser?.isSuperAdmin;

    const baseItems = [
      {
        section: "Dashboard",
        items: [
          { 
            label: "Overview", 
            icon: LayoutDashboard, 
            href: "/engine", 
            active: location === "/engine"
          },
        ]
      },
      {
        section: "Data Management",
        items: [
          { 
            label: "All Users", 
            icon: Users, 
            href: "/engine/users", 
            active: location === "/engine/users"
          },
          { 
            label: "All Orgs", 
            icon: Building, 
            href: "/engine/tenants", 
            active: location === "/engine/tenants"
          },
          { 
            label: "DataSets", 
            icon: Database, 
            href: "/engine/datasets", 
            active: location === "/engine/datasets"
          },
          { 
            label: "Media", 
            icon: Images, 
            href: "/engine/media", 
            active: location === "/engine/media"
          },
        ]
      },
      {
        section: "Build & Compose",
        items: [
          { 
            label: "Module Library", 
            icon: Package, 
            href: "/engine/modules", 
            active: location === "/engine/modules"
          },
          { 
            label: "Apps", 
            icon: Smartphone, 
            href: "/engine/apps", 
            active: location === "/engine/apps"
          },
          { 
            label: "Hubs", 
            icon: Network, 
            href: "/engine/hubs", 
            active: location === "/engine/hubs"
          },
        ]
      },
      {
        section: "Content & Design",
        items: [
          { 
            label: "CMS", 
            icon: FileText, 
            href: "/engine/cms", 
            active: location === "/engine/cms"
          },
          { 
            label: "Themes", 
            icon: Palette, 
            href: "/engine/themes", 
            active: location === "/engine/themes"
          },
        ]
      },
      {
        section: "Operations",
        items: [
          { 
            label: "Plans & Prices", 
            icon: CreditCard, 
            href: "/engine/plans-prices", 
            active: location === "/engine/plans-prices"
          },
          { 
            label: "Help & Support", 
            icon: FileImage, 
            href: "/engine/help-support", 
            active: location === "/engine/help-support"
          },
          { 
            label: "Billing", 
            icon: CreditCard, 
            href: "/engine/billing", 
            active: location === "/engine/billing"
          },
          { 
            label: "Transactions", 
            icon: List, 
            href: "/engine/transactions", 
            active: location === "/engine/transactions"
          },
          { 
            label: "Analytics", 
            icon: BarChart3, 
            href: "/engine/analytics", 
            active: location === "/engine/analytics"
          },
        ]
      },
    ];

    // Add System & Config section only for Super Admin
    if (isSuperAdmin) {
      baseItems.push({
        section: "System & Config",
        items: [
          { 
            label: "Platform Registry", 
            icon: Server, 
            href: "/engine/platform-registry", 
            active: location === "/engine/platform-registry"
          },
          { 
            label: "System Overview", 
            icon: Settings, 
            href: "/engine/system-overview", 
            active: location === "/engine/system-overview"
          },
          { 
            label: "Integrations", 
            icon: Plug, 
            href: "/engine/integrations", 
            active: location === "/engine/integrations"
          },
          { 
            label: "SEO Settings", 
            icon: Globe, 
            href: "/engine/seo-settings", 
            active: location === "/engine/seo-settings"
          },
          { 
            label: "Global Settings", 
            icon: Settings, 
            href: "/engine/global-settings", 
            active: location === "/engine/global-settings"
          },
          { 
            label: "Roles & Permissions", 
            icon: Shield, 
            href: "/engine/roles-permissions", 
            active: location === "/engine/roles-permissions"
          },
          { 
            label: "Admin Users", 
            icon: Users, 
            href: "/engine/admin-users", 
            active: location === "/engine/admin-users"
          },
          { 
            label: "Backups", 
            icon: Database, 
            href: "/engine/backups", 
            active: location === "/engine/backups"
          },
          { 
            label: "System Logs", 
            icon: List, 
            href: "/engine/system-logs", 
            active: location === "/engine/system-logs"
          },
          { 
            label: "System Monitor", 
            icon: Eye, 
            href: "/engine/system-monitor", 
            active: location === "/engine/system-monitor"
          },
          { 
            label: "System Status", 
            icon: Server, 
            href: "/engine/system-status", 
            active: location === "/engine/system-status"
          },
          { 
            label: "Security", 
            icon: Shield, 
            href: "/engine/security", 
            active: location === "/engine/security"
          },
        ]
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className={cn(
      "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-red-200 dark:border-red-800 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-700 dark:text-red-300">
                Admin Panel
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hidden lg:flex hover:bg-red-100 dark:hover:bg-red-900"
            data-testid="collapse-admin-sidebar"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform text-red-600",
              collapsed && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">
            {navigationItems.map((section) => (
              <Collapsible
                key={section.section}
                open={openSections.includes(section.section)}
                onOpenChange={() => toggleSection(section.section)}
              >
                {!collapsed && (
                  <CollapsibleTrigger className="w-full px-2 py-2 flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-red-50 dark:hover:bg-red-950 rounded-lg">
                    <div className="flex items-center gap-1">
                      {section.section}
                      {section.section === 'System & Config' && (
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-4 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          SA
                        </Badge>
                      )}
                    </div>
                    {openSections.includes(section.section) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                )}
                <CollapsibleContent className={cn("space-y-1", !collapsed && "mt-1")}>
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={item.active ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-10 relative",
                          collapsed ? "px-2" : "px-3",
                          item.active && "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-r-2 border-red-600",
                          "hover:bg-red-50 dark:hover:bg-red-950"
                        )}
                        data-testid={`admin-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 flex-shrink-0",
                          collapsed ? "" : "mr-3",
                          item.active ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                        )} />
                        {!collapsed && (
                          <span className="truncate">
                            {item.label}
                          </span>
                        )}
                      </Button>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
            {/* Developer Documentation Link */}
            <Link href="/devdoc">
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-3"
                data-testid="admin-nav-dev-documentation"
              >
                <FileText className={cn(
                  "h-5 w-5 flex-shrink-0",
                  collapsed ? "" : "mr-3",
                  "text-gray-500 dark:text-gray-400"
                )} />
                {!collapsed && (
                  <span className="truncate">
                    Dev Documentation
                  </span>
                )}
              </Button>
            </Link>
          </nav>
        </ScrollArea>

        {/* Admin status footer */}
        {!collapsed && (
          <div className="p-4 border-t border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <div className="text-xs text-red-600 dark:text-red-400 font-medium">
              {adminUser?.isSuperAdmin ? '🦸‍♂️ Super Admin Portal' : '👨‍💼 Admin Portal'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Role: {adminUser?.role || 'admin'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}