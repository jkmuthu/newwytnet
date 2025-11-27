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

  // Extract username from URL or use default
  const usernameFromUrl = location.match(/^\/u\/([^\/]+)/)?.[1] || 'me';
  const orgnameFromUrl = location.match(/^\/o\/([^\/]+)/)?.[1] || 'default';
  const appnameFromUrl = location.match(/^\/a\/([^\/]+)/)?.[1] || '';
  const hubnameFromUrl = location.match(/^\/h\/([^\/]+)/)?.[1] || '';
  
  // Navigation items based on workspace context
  const getNavigationItems = () => {
    if (currentWorkspace.type === 'app') {
      // AppPanel Navigation - /a/:appname/*
      const appSlug = currentWorkspace.appSlug || appnameFromUrl;
      
      // Define app-specific navigation
      const appNavigations: Record<string, any[]> = {
        'wytduty': [
          { label: "Dashboard", icon: Home, href: `/a/wytduty`, active: location === `/a/wytduty` || location === `/a/wytduty/dashboard` },
          { label: "My Duties", icon: FileText, href: `/a/wytduty/my-duties`, active: location === `/a/wytduty/my-duties` },
          { label: "Assigned Duties", icon: Package, href: `/a/wytduty/assigned`, active: location === `/a/wytduty/assigned` },
          { label: "Calendar", icon: Calendar, href: `/a/wytduty/calendar`, active: location === `/a/wytduty/calendar` },
          { label: "Settings", icon: Settings, href: `/a/wytduty/settings`, active: location === `/a/wytduty/settings` },
        ],
        'wytqrc': [
          { label: "Dashboard", icon: Home, href: `/a/wytqrc`, active: location === `/a/wytqrc` },
          { label: "Generate QR", icon: Package, href: `/a/wytqrc/generate`, active: location === `/a/wytqrc/generate` },
          { label: "My QR Codes", icon: FolderOpen, href: `/a/wytqrc/my-codes`, active: location === `/a/wytqrc/my-codes` },
          { label: "Settings", icon: Settings, href: `/a/wytqrc/settings`, active: location === `/a/wytqrc/settings` },
        ],
      };
      
      const items = appNavigations[appSlug] || [
        { label: "Dashboard", icon: Home, href: `/a/${appSlug}`, active: location === `/a/${appSlug}` },
        { label: "Settings", icon: Settings, href: `/a/${appSlug}/settings`, active: location === `/a/${appSlug}/settings` },
      ];
      
      return [
        {
          section: currentWorkspace.appName || "App Panel",
          items
        }
      ];
    } else if (currentWorkspace.type === 'hub') {
      // HubPanel Navigation - /h/:hubname/*
      const hubSlug = hubnameFromUrl;
      return [
        {
          section: "Hub Panel",
          items: [
            { 
              label: "Hub Dashboard", 
              icon: Home, 
              href: `/h/${hubSlug}`, 
              active: location === `/h/${hubSlug}` || location === `/h/${hubSlug}/dashboard`
            },
            { 
              label: "Hub WytWall", 
              icon: MessageSquare, 
              href: `/h/${hubSlug}/wytwall`, 
              active: location === `/h/${hubSlug}/wytwall`
            },
            { 
              label: "Hub Apps", 
              icon: Package, 
              href: `/h/${hubSlug}/wytapps`, 
              active: location === `/h/${hubSlug}/wytapps`
            },
            { 
              label: "Hub Team", 
              icon: Users, 
              href: `/h/${hubSlug}/team`, 
              active: location === `/h/${hubSlug}/team`
            },
            { 
              label: "Hub Profile", 
              icon: Building, 
              href: `/h/${hubSlug}/profile`, 
              active: location === `/h/${hubSlug}/profile`
            },
          ]
        }
      ];
    } else if (currentWorkspace.type === 'personal') {
      // MyPanel Navigation - /u/:username/*
      return [
        {
          section: "My Panel",
          items: [
            { 
              label: "My Dashboard", 
              icon: Home, 
              href: `/u/${usernameFromUrl}`, 
              active: location === `/u/${usernameFromUrl}` || location === `/u/${usernameFromUrl}/dashboard`
            },
            { 
              label: "My WytWall", 
              icon: MessageSquare, 
              href: `/u/${usernameFromUrl}/wytwall`, 
              active: location === `/u/${usernameFromUrl}/wytwall` || location.startsWith(`/u/${usernameFromUrl}/wytwall/`)
            },
            { 
              label: "My WytApps", 
              icon: Package, 
              href: `/u/${usernameFromUrl}/wytapps`, 
              active: location === `/u/${usernameFromUrl}/wytapps` || location.startsWith(`/u/${usernameFromUrl}/wytapps/`),
              badge: installedAppsCount > 0 ? { content: appsCountBadge, tone: 'default' as const } : undefined
            },
            { 
              label: "My Orgs", 
              icon: Building, 
              href: `/u/${usernameFromUrl}/orgs`, 
              active: location === `/u/${usernameFromUrl}/orgs` || location.startsWith(`/u/${usernameFromUrl}/orgs/`)
            },
            { 
              label: "My Profile", 
              icon: User, 
              href: `/u/${usernameFromUrl}/profile`, 
              active: location === `/u/${usernameFromUrl}/profile` 
            },
          ]
        }
      ];
    } else {
      // OrgPanel Navigation - /o/:orgname/*
      return [
        {
          section: "Org Panel",
          items: [
            { 
              label: "Our Dashboard", 
              icon: Building, 
              href: `/o/${orgnameFromUrl}`, 
              active: location === `/o/${orgnameFromUrl}` || location === `/o/${orgnameFromUrl}/dashboard`
            },
            { 
              label: "Our WytWall", 
              icon: MessageSquare, 
              href: `/o/${orgnameFromUrl}/wytwall`, 
              active: location === `/o/${orgnameFromUrl}/wytwall` || location === `/o/${orgnameFromUrl}/posts`
            },
            { 
              label: "Our WytApps", 
              icon: Package, 
              href: `/o/${orgnameFromUrl}/wytapps`, 
              active: location === `/o/${orgnameFromUrl}/wytapps` 
            },
            { 
              label: "Our Team", 
              icon: Users, 
              href: `/o/${orgnameFromUrl}/team`, 
              active: location === `/o/${orgnameFromUrl}/team` 
            },
            { 
              label: "Our Org Profile", 
              icon: Building, 
              href: `/o/${orgnameFromUrl}/profile`, 
              active: location === `/o/${orgnameFromUrl}/profile` 
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