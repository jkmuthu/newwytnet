import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft,
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
  ClipboardCheck
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface NavigationItem {
  label: string;
  icon: React.ElementType;
  href: string;
  active: boolean;
  superAdminOnly?: boolean;
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

  // Flat navigation items
  const getNavigationItems = (): NavigationItem[] => {
    const isSuperAdmin = adminUser?.isSuperAdmin;

    const allItems: NavigationItem[] = [
      { 
        label: "Overview", 
        icon: LayoutDashboard, 
        href: "/engine", 
        active: location === "/engine"
      },
      { 
        label: "QA Testing Tracker", 
        icon: ClipboardCheck, 
        href: "/engine/qa-testing-tracker", 
        active: location === "/engine/qa-testing-tracker",
        superAdminOnly: true
      },
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
        label: "All Entities", 
        icon: Network, 
        href: "/engine/entities", 
        active: location === "/engine/entities"
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
        label: "Finance", 
        icon: CreditCard, 
        href: "/engine/finance", 
        active: location === "/engine/finance"
      },
      { 
        label: "Analytics", 
        icon: BarChart3, 
        href: "/engine/analytics", 
        active: location === "/engine/analytics"
      },
      { 
        label: "System & Security", 
        icon: Shield, 
        href: "/engine/system-security", 
        active: location === "/engine/system-security",
        superAdminOnly: true
      },
      { 
        label: "Integrations", 
        icon: Plug, 
        href: "/engine/integrations", 
        active: location === "/engine/integrations",
        superAdminOnly: true
      },
      { 
        label: "Global Settings", 
        icon: Settings, 
        href: "/engine/global-settings", 
        active: location === "/engine/global-settings",
        superAdminOnly: true
      },
      { 
        label: "Platform Hubs", 
        icon: Building, 
        href: "/engine/platform-hubs", 
        active: location === "/engine/platform-hubs",
        superAdminOnly: true
      },
      { 
        label: "Roles & Permissions", 
        icon: Shield, 
        href: "/engine/roles-permissions", 
        active: location === "/engine/roles-permissions",
        superAdminOnly: true
      },
      { 
        label: "Admin Users", 
        icon: Users, 
        href: "/engine/admin-users", 
        active: location === "/engine/admin-users",
        superAdminOnly: true
      },
      { 
        label: "Backups", 
        icon: Database, 
        href: "/engine/backups", 
        active: location === "/engine/backups",
        superAdminOnly: true
      },
      { 
        label: "Audit Logs", 
        icon: Eye, 
        href: "/engine/audit-logs", 
        active: location === "/engine/audit-logs",
        superAdminOnly: true
      },
      { 
        label: "Features Checklist", 
        icon: CheckSquare, 
        href: "/engine/features-checklist", 
        active: location === "/engine/features-checklist",
        superAdminOnly: true
      },
    ];

    // Filter items based on admin role
    return isSuperAdmin 
      ? allItems 
      : allItems.filter(item => !item.superAdminOnly);
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
        <ScrollArea className="flex-1 p-3">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-9 relative",
                    collapsed ? "px-2" : "px-3",
                    item.active && "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-r-2 border-red-600",
                    "hover:bg-red-50 dark:hover:bg-red-950"
                  )}
                  data-testid={`admin-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    collapsed ? "" : "mr-3",
                    item.active ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                  )} />
                  {!collapsed && (
                    <span className="truncate text-sm">
                      {item.label}
                    </span>
                  )}
                </Button>
              </Link>
            ))}
            {/* Developer Documentation Link */}
            <Link href="/devdoc">
              <Button
                variant="ghost"
                className="w-full justify-start h-9 px-3"
                data-testid="admin-nav-dev-doc"
              >
                <FileText className={cn(
                  "h-4 w-4 flex-shrink-0",
                  collapsed ? "" : "mr-3",
                  "text-gray-500 dark:text-gray-400"
                )} />
                {!collapsed && (
                  <span className="truncate text-sm">
                    Dev Doc
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
