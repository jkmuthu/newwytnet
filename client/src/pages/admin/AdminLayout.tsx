import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  LogOut
} from "lucide-react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useToast } from "@/hooks/use-toast";

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

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    path: '/admin',
    mobileOptimized: true,
  },
  {
    id: 'modules',
    label: 'Platform Modules',
    icon: Settings,
    path: '/admin/modules',
    mobileOptimized: true,
  },
  {
    id: 'integrations',
    label: 'API Integrations',
    icon: Plug,
    path: '/admin/integrations',
    mobileOptimized: true,
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    path: '/admin/users',
    badge: 'New',
    mobileOptimized: true,
  },
  {
    id: 'tenants',
    label: 'Tenant Management',
    icon: Building2,
    path: '/admin/tenants',
    desktopOnly: true,
  }
];

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { isMobile, isTablet } = useDeviceDetection();
  const { toast } = useToast();
  const [layoutMode, setLayoutMode] = useState<'auto' | 'mobile' | 'desktop'>('auto');

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
      await fetch('/api/auth/admin/logout', { method: 'POST' });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
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

  // Filter nav items based on device and permissions
  const visibleNavItems = navItems.filter(item => {
    if (effectiveIsMobile && item.desktopOnly) return false;
    if (!effectiveIsMobile && !item.mobileOptimized) return true;
    return true;
  });

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
                
                <nav className="space-y-2">
                  {visibleNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.id} href={item.path}>
                        <a
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            location === item.path
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          )}
                          onClick={() => setIsSidebarOpen(false)}
                          data-testid={`nav-${item.id}`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </a>
                      </Link>
                    );
                  })}
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
            {visibleNavItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.id} href={item.path}>
                  <a
                    className={cn(
                      "flex flex-col items-center p-2 rounded-lg transition-colors",
                      location === item.path
                        ? "text-blue-600"
                        : "text-gray-400 hover:text-gray-600"
                    )}
                    data-testid={`bottom-nav-${item.id}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
                  </a>
                </Link>
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

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.id} href={item.path}>
                  <a
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                      location === item.path
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                    data-testid={`nav-${item.id}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                    {item.desktopOnly && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        Desktop
                      </Badge>
                    )}
                  </a>
                </Link>
              );
            })}
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