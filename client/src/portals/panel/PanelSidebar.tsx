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
  Wallet,
  Globe
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

  // Fetch current user
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/user'],
    staleTime: 60000, // 1 minute
  });

  // Fetch organizations to get role info
  const { data: orgsData } = useQuery({
    queryKey: ['/api/user/organizations'],
    enabled: currentWorkspace.type === 'organization',
    staleTime: 30000,
  });

  const installedAppsCount = (myAppsData as any)?.apps?.length || 0;
  const appsCountBadge = installedAppsCount > 99 ? '99+' : installedAppsCount.toString();

  // Extract context IDs from URL
  const orgnameFromUrl = location.match(/^\/o\/([^\/]+)/)?.[1] || 'default';
  const appnameFromUrl = location.match(/^\/a\/([^\/]+)/)?.[1] || '';
  const hubnameFromUrl = location.match(/^\/h\/([^\/]+)/)?.[1] || '';

  // Get current org and user's role in it
  const currentOrg = (orgsData as any)?.organizations?.find(
    (org: any) => org.slug === orgnameFromUrl || org.name?.toLowerCase().replace(/\s+/g, '-') === orgnameFromUrl
  );
  const currentUserRole = currentOrg?.role || 'member';
  const currentUser = userData as any;
  
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
      const baseUrl = `/h/${hubSlug}`;
      
      return [
        {
          section: "Hub Panel",
          items: [
            { 
              label: "Hub Dashboard", 
              icon: Home, 
              href: baseUrl, 
              active: location === baseUrl || location === `${baseUrl}/dashboard`
            },
            { 
              label: "Hub WytWall", 
              icon: MessageSquare, 
              href: `${baseUrl}/wytwall`, 
              active: location === `${baseUrl}/wytwall`
            },
            { 
              label: "Hub Apps", 
              icon: Package, 
              href: `${baseUrl}/wytapps`, 
              active: location === `${baseUrl}/wytapps`
            },
            { 
              label: "Hub Team", 
              icon: Users, 
              href: `${baseUrl}/team`, 
              active: location === `${baseUrl}/team`
            },
            { 
              label: "Hub Settings", 
              icon: Settings, 
              href: `${baseUrl}/settings`, 
              active: location === `${baseUrl}/settings`
            },
          ]
        }
      ];
    } else if (currentWorkspace.type === 'personal') {
      // MyPanel Navigation - clean /u/* URLs (no username required)
      return [
        {
          section: "WytPanel",
          items: [
            { 
              label: "My Dashboard", 
              icon: Home, 
              href: `/u/dashboard`, 
              active: location === '/u' || location === '/u/dashboard'
            },
            { 
              label: "My WytWall", 
              icon: MessageSquare, 
              href: `/u/wytwall`, 
              active: location === '/u/wytwall' || location.startsWith('/u/wytwall/')
            },
            { 
              label: "My WytApps", 
              icon: Package, 
              href: `/u/wytapps`, 
              active: location === '/u/wytapps' || location.startsWith('/u/wytapps/'),
              badge: installedAppsCount > 0 ? { content: appsCountBadge, tone: 'default' as const } : undefined
            },
            { 
              label: "My Orgs", 
              icon: Building, 
              href: `/u/orgs`, 
              active: location === '/u/orgs' || location.startsWith('/u/orgs/')
            },
            { 
              label: "My Hubs", 
              icon: Globe, 
              href: `/u/hubs`, 
              active: location === '/u/hubs' || location.startsWith('/u/hubs/')
            },
            { 
              label: "My Profile", 
              icon: User, 
              href: `/u/profile`, 
              active: location === '/u/profile'
            },
            { 
              label: "My Account", 
              icon: Settings, 
              href: `/u/settings`, 
              active: location === '/u/settings' || location === '/u/account'
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
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                {currentWorkspace.type === 'app' ? (
                  <Package className="h-5 w-5 text-purple-600 flex-shrink-0" />
                ) : currentWorkspace.type === 'personal' ? (
                  <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <Building className="h-5 w-5 text-green-600 flex-shrink-0" />
                )}
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {currentWorkspace.name}
                </span>
              </div>
              {/* Show user info and role for organization workspaces */}
              {currentWorkspace.type === 'organization' && currentUser && (
                <div className="mt-2 pl-7">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {currentUser.email?.split('@')[0] || currentUser.name || 'User'}{' '}
                    <span className="text-gray-400 dark:text-gray-500">|</span>{' '}
                    <span className="capitalize font-medium text-purple-600 dark:text-purple-400">
                      {currentUserRole}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hidden lg:flex flex-shrink-0"
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