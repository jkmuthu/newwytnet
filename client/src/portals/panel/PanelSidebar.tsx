import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  Home, 
  User, 
  Settings, 
  FolderOpen, 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  FileText,
  Building,
  Users,
  CreditCard,
  Shield,
  ShoppingCart,
  Package,
  Award,
  Wallet // Import Wallet icon
} from "lucide-react";
import type { WorkspaceContext } from "./PanelLayout";

interface NavItem {
  label: string;
  icon: any;
  href: string;
  active: boolean;
  badge?: {
    content: number | string;
    tone?: 'default' | 'muted';
  };
}

interface PanelSidebarProps {
  currentWorkspace: WorkspaceContext;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * PanelSidebar - Navigation sidebar for user workspaces
 * Features: Context-aware navigation based on personal vs organization workspace
 */
export default function PanelSidebar({ currentWorkspace, collapsed, onToggleCollapse }: PanelSidebarProps) {
  const [location] = useLocation();

  // Fetch installed apps count for badge
  const { data: myAppsData } = useQuery({
    queryKey: ['/api/apps/my-apps'],
    enabled: currentWorkspace.type === 'personal',
    staleTime: 30000, // 30 seconds
  });

  const installedAppsCount = (myAppsData as any)?.apps?.length || 0;
  const appsCountBadge = installedAppsCount > 99 ? '99+' : installedAppsCount.toString();

  // Navigation items based on workspace context
  const getNavigationItems = () => {
    if (currentWorkspace.type === 'app') {
      // AppPanel Navigation - App-specific menus
      const appSlug = currentWorkspace.appSlug || '';
      
      // Define app-specific navigation
      const appNavigations: Record<string, any[]> = {
        'wytduty': [
          { label: "Dashboard", icon: Home, href: `/apppanel/wytduty`, active: location === `/apppanel/wytduty` || location === `/apppanel/wytduty/dashboard` },
          { label: "My Duties", icon: FileText, href: `/apppanel/wytduty/my-duties`, active: location === `/apppanel/wytduty/my-duties` },
          { label: "Assigned Duties", icon: Package, href: `/apppanel/wytduty/assigned`, active: location === `/apppanel/wytduty/assigned` },
          { label: "Calendar", icon: Calendar, href: `/apppanel/wytduty/calendar`, active: location === `/apppanel/wytduty/calendar` },
          { label: "Settings", icon: Settings, href: `/apppanel/wytduty/settings`, active: location === `/apppanel/wytduty/settings` },
        ],
        'wytqrc': [
          { label: "Dashboard", icon: Home, href: `/apppanel/wytqrc`, active: location === `/apppanel/wytqrc` },
          { label: "Generate QR", icon: Package, href: `/apppanel/wytqrc/generate`, active: location === `/apppanel/wytqrc/generate` },
          { label: "My QR Codes", icon: FolderOpen, href: `/apppanel/wytqrc/my-codes`, active: location === `/apppanel/wytqrc/my-codes` },
          { label: "Settings", icon: Settings, href: `/apppanel/wytqrc/settings`, active: location === `/apppanel/wytqrc/settings` },
        ],
        // Add more app navigations as needed
      };
      
      const items = appNavigations[appSlug] || [
        { label: "Dashboard", icon: Home, href: `/apppanel/${appSlug}`, active: location === `/apppanel/${appSlug}` },
        { label: "Settings", icon: Settings, href: `/apppanel/${appSlug}/settings`, active: location === `/apppanel/${appSlug}/settings` },
      ];
      
      return [
        {
          section: currentWorkspace.appName || "App Panel",
          items
        }
      ];
    } else if (currentWorkspace.type === 'personal') {
      // MyPanel Navigation
      return [
        {
          section: "MyPanel",
          items: [
            { 
              label: "My Dashboard", 
              icon: Home, 
              href: "/mypanel", 
              active: location === "/mypanel" || location === "/mypanel/dashboard"
            },
            { 
              label: "My WytWall", 
              icon: MessageSquare, 
              href: "/mypanel/wytwall", 
              active: location === "/mypanel/wytwall" || location === "/mypanel/posts"
            },
            { 
              label: "My WytApps", 
              icon: Package, 
              href: "/mypanel/wytapps", 
              active: location === "/mypanel/wytapps" || location.startsWith("/mypanel/wytapps/"),
              badge: installedAppsCount > 0 ? { content: appsCountBadge, tone: 'default' as const } : undefined
            },
            { 
              label: "My Profile", 
              icon: User, 
              href: "/mypanel/profile", 
              active: location === "/mypanel/profile" 
            },
          ]
        }
      ];
    } else {
      // OrgPanel Navigation
      return [
        {
          section: "OrgPanel",
          items: [
            { 
              label: "Our Dashboard", 
              icon: Building, 
              href: "/orgpanel", 
              active: location === "/orgpanel" || location === "/orgpanel/dashboard"
            },
            { 
              label: "Our WytWall", 
              icon: MessageSquare, 
              href: "/orgpanel/wytwall", 
              active: location === "/orgpanel/wytwall" || location === "/orgpanel/posts"
            },
            { 
              label: "Our WytApps", 
              icon: Package, 
              href: "/orgpanel/wytapps", 
              active: location === "/orgpanel/wytapps" 
            },
            { 
              label: "Our Team", 
              icon: Users, 
              href: "/orgpanel/team", 
              active: location === "/orgpanel/team" 
            },
            { 
              label: "Our Org Profile", 
              icon: Building, 
              href: "/orgpanel/profile", 
              active: location === "/orgpanel/profile" 
            },
          ]
        }
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className={cn(
      "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              {currentWorkspace.type === 'app' ? (
                <Package className="h-5 w-5 text-purple-600" />
              ) : currentWorkspace.type === 'personal' ? (
                <User className="h-5 w-5 text-blue-600" />
              ) : (
                <Building className="h-5 w-5 text-green-600" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">
                {currentWorkspace.name}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hidden lg:flex"
            data-testid="collapse-sidebar"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
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
                  <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {section.section}
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
                          item.active && "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                        )}
                        data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <div className="relative">
                          <item.icon className={cn(
                            "h-5 w-5 flex-shrink-0",
                            collapsed ? "" : "mr-3",
                            item.active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                          )} />
                          {item.badge && collapsed && (
                            <Badge 
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                            >
                              {item.badge.content}
                            </Badge>
                          )}
                        </div>
                        {!collapsed && (
                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <Badge 
                                className="ml-2 h-5 px-1.5 text-xs flex-shrink-0"
                              >
                                {item.badge.content}
                              </Badge>
                            )}
                          </div>
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Workspace info footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {currentWorkspace.type === 'app' ? `${currentWorkspace.appName} App` : 
               currentWorkspace.type === 'personal' ? 'Personal Workspace' : 'Organization Workspace'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}