import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Shield, 
  Settings, 
  Users, 
  Building2, 
  Plug, 
  BarChart3, 
  Menu, 
  X,
  Monitor,
  Smartphone,
  LogOut,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Database,
  Image,
  Box,
  Globe,
  Palette,
  CreditCard,
  HeadphonesIcon,
  DollarSign,
  Receipt,
  TrendingUp,
  Cog,
  Search,
  ShieldCheck,
  UserCog,
  HardDrive,
  FileText,
  Activity,
  AlertCircle,
  Lock
} from "lucide-react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: {
    id: string;
    name: string;
    role: string;
    isSuperAdmin: boolean;
  };
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: string;
  mobileOptimized?: boolean;
  desktopOnly?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/admin',
        mobileOptimized: true,
      }
    ]
  },
  {
    id: 'data-management',
    label: 'Data Management',
    items: [
      {
        id: 'users',
        label: 'All Users',
        icon: Users,
        path: '/admin/users',
        mobileOptimized: true,
      },
      {
        id: 'orgs',
        label: 'All Orgs',
        icon: Building2,
        path: '/admin/tenants',
        mobileOptimized: true,
      },
      {
        id: 'datasets',
        label: 'DataSets',
        icon: Database,
        path: '/admin/datasets',
        mobileOptimized: true,
      },
      {
        id: 'media',
        label: 'Media',
        icon: Image,
        path: '/admin/media',
        mobileOptimized: true,
      }
    ]
  },
  {
    id: 'platform-management',
    label: 'Platform Management',
    items: [
      {
        id: 'modules',
        label: 'Modules',
        icon: Box,
        path: '/admin/modules',
        mobileOptimized: true,
      },
      {
        id: 'apps',
        label: 'Apps',
        icon: Smartphone,
        path: '/admin/apps',
        mobileOptimized: true,
      },
      {
        id: 'hubs',
        label: 'Hubs',
        icon: Globe,
        path: '/admin/hubs',
        mobileOptimized: true,
      },
      {
        id: 'cms',
        label: 'CMS',
        icon: FileText,
        path: '/admin/cms',
        mobileOptimized: true,
      },
      {
        id: 'themes',
        label: 'Themes',
        icon: Palette,
        path: '/admin/themes',
        mobileOptimized: true,
      }
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        id: 'plans-prices',
        label: 'Plans & Prices',
        icon: CreditCard,
        path: '/admin/plans-prices',
        mobileOptimized: true,
      },
      {
        id: 'help-support',
        label: 'Help & Support',
        icon: HeadphonesIcon,
        path: '/admin/help-support',
        mobileOptimized: true,
      },
      {
        id: 'billing',
        label: 'Billing',
        icon: DollarSign,
        path: '/admin/billing',
        mobileOptimized: true,
      },
      {
        id: 'transactions',
        label: 'Transactions',
        icon: Receipt,
        path: '/admin/transactions',
        mobileOptimized: true,
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: TrendingUp,
        path: '/admin/analytics',
        mobileOptimized: true,
      }
    ]
  },
  {
    id: 'system-config',
    label: 'System & Config',
    items: [
      {
        id: 'integrations',
        label: 'Integrations',
        icon: Plug,
        path: '/admin/integrations',
        mobileOptimized: true,
      },
      {
        id: 'seo-settings',
        label: 'SEO Settings',
        icon: Search,
        path: '/admin/seo-settings',
        mobileOptimized: true,
      },
      {
        id: 'global-settings',
        label: 'Global Settings',
        icon: Settings,
        path: '/admin/global-settings',
        mobileOptimized: true,
      },
      {
        id: 'roles-permissions',
        label: 'Roles & Permissions',
        icon: ShieldCheck,
        path: '/admin/roles-permissions',
        mobileOptimized: true,
      },
      {
        id: 'admin-users',
        label: 'Admin Users',
        icon: UserCog,
        path: '/admin/admin-users',
        mobileOptimized: true,
      },
      {
        id: 'backups',
        label: 'Backups',
        icon: HardDrive,
        path: '/admin/backups',
        mobileOptimized: true,
      },
      {
        id: 'system-logs',
        label: 'System Logs',
        icon: FileText,
        path: '/admin/system-logs',
        mobileOptimized: true,
      },
      {
        id: 'system-monitor',
        label: 'System Monitor',
        icon: Activity,
        path: '/admin/system-monitor',
        mobileOptimized: true,
      },
      {
        id: 'system-status',
        label: 'System Status',
        icon: AlertCircle,
        path: '/admin/system-status',
        mobileOptimized: true,
      },
      {
        id: 'security',
        label: 'Security',
        icon: Lock,
        path: '/admin/security',
        mobileOptimized: true,
      }
    ]
  }
];

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { isMobile, isTablet } = useDeviceDetection();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [layoutMode, setLayoutMode] = useState<'auto' | 'mobile' | 'desktop'>('auto');
  const [openGroups, setOpenGroups] = useState<string[]>(['dashboard', 'data-management']);

  // Check for forced layout mode from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'mobile' || mode === 'desktop') {
      setLayoutMode(mode);
    }
  }, [location]);

  // Determine effective layout
  const effectiveIsMobile = layoutMode === 'mobile' || 
    (layoutMode === 'auto' && (isMobile || isTablet));

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear all cached queries
      queryClient.clear();
      
      // Force a full page reload to the login page
      // This ensures all session state is completely cleared
      window.location.href = '/admin/login';
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const toggleLayoutMode = () => {
    const newMode = effectiveIsMobile ? 'desktop' : 'mobile';
    setLayoutMode(newMode);
    
    // Update URL without navigation
    const params = new URLSearchParams(window.location.search);
    params.set('mode', newMode);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Get all nav items for bottom nav
  const allNavItems = navigationGroups.flatMap(group => group.items);
  const quickNavItems = allNavItems.slice(0, 4);

  // Mobile Layout
  if (effectiveIsMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-lg">Admin</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLayoutMode}
                data-testid="button-layout-toggle"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-blue-600 text-white">
                  {user?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <span className="font-bold text-lg">WytNet Admin</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
                </div>
                
                <nav className="space-y-1">
                  {navigationGroups.map((group) => (
                    <div key={group.id}>
                      {group.id === 'dashboard' ? (
                        group.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Button
                              key={item.id}
                              variant="ghost"
                              asChild
                              className={cn(
                                "w-full justify-start h-auto px-3 py-2 text-sm font-medium mb-2",
                                location === item.path
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                              )}
                              onClick={() => setIsSidebarOpen(false)}
                              data-testid={`nav-${item.id}`}
                            >
                              <Link href={item.path}>
                                <div className="flex items-center space-x-3 w-full">
                                  <Icon className="h-5 w-5" />
                                  <span>{item.label}</span>
                                </div>
                              </Link>
                            </Button>
                          );
                        })
                      ) : (
                        <Collapsible
                          open={openGroups.includes(group.id)}
                          onOpenChange={() => toggleGroup(group.id)}
                        >
                          <CollapsibleTrigger className="w-full px-3 py-2 flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                            <span>{group.label}</span>
                            {openGroups.includes(group.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-1 space-y-1">
                            {group.items.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Button
                                  key={item.id}
                                  variant="ghost"
                                  asChild
                                  className={cn(
                                    "w-full justify-start h-auto px-3 py-2 pl-6 text-sm",
                                    location === item.path
                                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                  )}
                                  onClick={() => setIsSidebarOpen(false)}
                                  data-testid={`nav-${item.id}`}
                                >
                                  <Link href={item.path}>
                                    <div className="flex items-center space-x-3 w-full">
                                      <Icon className="h-4 w-4" />
                                      <span>{item.label}</span>
                                    </div>
                                  </Link>
                                </Button>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  ))}
                </nav>
                
                <div className="mt-6 pt-6 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <main className="p-4">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t shadow-lg">
          <div className="flex items-center justify-around py-2">
            {quickNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  asChild
                  className={cn(
                    "flex flex-col items-center p-2 h-auto min-h-[3rem] rounded-lg transition-colors",
                    location === item.path
                      ? "text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                  data-testid={`bottom-nav-${item.id}`}
                >
                  <Link href={item.path}>
                    <div className="flex flex-col items-center">
                      <Icon className="h-5 w-5" />
                      <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
                    </div>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">WytNet</h1>
              <p className="text-sm text-gray-500">Admin Portal</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-600 text-white">
                  {user?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name || 'Admin User'}</p>
                <p className="text-sm text-gray-500">{user?.role || 'Administrator'}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navigationGroups.map((group) => (
              <div key={group.id}>
                {group.id === 'dashboard' ? (
                  group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        asChild
                        className={cn(
                          "w-full justify-start h-auto px-4 py-3 font-medium mb-2",
                          location === item.path
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                        data-testid={`nav-${item.id}`}
                      >
                        <Link href={item.path}>
                          <div className="flex items-center space-x-3 w-full">
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      </Button>
                    );
                  })
                ) : (
                  <Collapsible
                    open={openGroups.includes(group.id)}
                    onOpenChange={() => toggleGroup(group.id)}
                  >
                    <CollapsibleTrigger className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg uppercase tracking-wide">
                      <span>{group.label}</span>
                      {openGroups.includes(group.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-1 space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Button
                            key={item.id}
                            variant="ghost"
                            asChild
                            className={cn(
                              "w-full justify-start h-auto px-4 py-2.5 text-sm",
                              location === item.path
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                            )}
                            data-testid={`nav-${item.id}`}
                          >
                            <Link href={item.path}>
                              <div className="flex items-center space-x-3 w-full">
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                              </div>
                            </Link>
                          </Button>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Layout Mode</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLayoutMode}
                data-testid="button-layout-toggle"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Switch to Mobile
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}