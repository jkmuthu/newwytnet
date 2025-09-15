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
            href: "/admin", 
            active: location === "/admin"
          },
          { 
            label: "System Status", 
            icon: Server, 
            href: "/admin/system-overview", 
            active: location === "/admin/system-overview"
          },
        ]
      },
      {
        section: "User Management",
        items: [
          { 
            label: "Users", 
            icon: Users, 
            href: "/admin/users", 
            active: location === "/admin/users"
          },
          { 
            label: "Tenants", 
            icon: Building, 
            href: "/admin/tenants", 
            active: location === "/admin/tenants"
          },
        ]
      },
      {
        section: "Platform Management",
        items: [
          { 
            label: "Modules", 
            icon: Package, 
            href: "/admin/modules", 
            active: location === "/admin/modules"
          },
          { 
            label: "Apps", 
            icon: Smartphone, 
            href: "/admin/apps", 
            active: location === "/admin/apps"
          },
          { 
            label: "Hubs", 
            icon: Network, 
            href: "/admin/hubs", 
            active: location === "/admin/hubs"
          },
          { 
            label: "CMS", 
            icon: FileText, 
            href: "/admin/cms", 
            active: location === "/admin/cms"
          },
        ]
      },
      {
        section: "Analytics & Reports",
        items: [
          { 
            label: "Analytics", 
            icon: BarChart3, 
            href: "/admin/analytics", 
            active: location === "/admin/analytics"
          },
        ]
      },
      {
        section: "Configuration",
        items: [
          { 
            label: "SEO Settings", 
            icon: Globe, 
            href: "/admin/seo-settings", 
            active: location === "/admin/seo-settings"
          },
          { 
            label: "Themes", 
            icon: Palette, 
            href: "/admin/themes", 
            active: location === "/admin/themes"
          },
          { 
            label: "Media", 
            icon: Images, 
            href: "/admin/media", 
            active: location === "/admin/media"
          },
        ]
      }
    ];

    // Add super admin only sections
    if (isSuperAdmin) {
      baseItems.splice(1, 0, {
        section: "🦸‍♂️ Super Admin",
        items: [
          { 
            label: "Global Settings", 
            icon: Settings, 
            href: "/admin/global-settings", 
            active: location === "/admin/global-settings",
            superAdminOnly: true
          },
          { 
            label: "System Logs", 
            icon: List, 
            href: "/admin/logs", 
            active: location === "/admin/logs",
            superAdminOnly: true
          },
          { 
            label: "System Monitor", 
            icon: Eye, 
            href: "/admin/monitor", 
            active: location === "/admin/monitor",
            superAdminOnly: true
          },
        ]
      });
      
      // Add advanced sections for super admin
      baseItems.push(
        {
          section: "Advanced",
          items: [
            { 
              label: "Integrations", 
              icon: Plug, 
              href: "/admin/integrations", 
              active: location === "/admin/integrations"
            },
            { 
              label: "AI Management", 
              icon: Bot, 
              href: "/admin/ai", 
              active: location === "/admin/ai"
            },
            { 
              label: "Billing", 
              icon: CreditCard, 
              href: "/admin/billing", 
              active: location === "/admin/billing"
            },
            { 
              label: "Security", 
              icon: Shield, 
              href: "/admin/security", 
              active: location === "/admin/security"
            },
          ]
        }
      );
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
          <nav className="space-y-6">
            {navigationItems.map((section) => (
              <div key={section.section}>
                {!collapsed && (
                  <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    {section.section}
                    {section.section.includes('Super Admin') && (
                      <Badge variant="secondary" className="text-xs px-1 py-0 h-4 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        SA
                      </Badge>
                    )}
                  </h3>
                )}
                <div className="space-y-1">
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
                          <span className="truncate flex items-center gap-2">
                            {item.label}
                            {item.superAdminOnly && (
                              <Badge variant="outline" className="text-xs px-1 py-0 h-4 border-yellow-500 text-yellow-600 dark:text-yellow-400">
                                SA
                              </Badge>
                            )}
                          </span>
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
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