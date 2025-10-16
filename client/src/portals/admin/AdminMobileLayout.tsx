import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  Shield,
  LayoutDashboard,
  Users,
  Building,
  Package,
  BarChart3,
  Search,
  Bell,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AdminMobileLayoutProps {
  children: ReactNode;
}

/**
 * AdminMobileLayout - Mobile layout for admin portal
 * Features: Mobile-optimized admin navigation with quick access to key admin functions
 */
export default function AdminMobileLayout({ children }: AdminMobileLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const adminLogoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
      return response.json();
    },
    onSuccess: () => {
      // Clear all cached queries
      queryClient.clear();
      
      // Force a full page reload to the Engine login page
      // This ensures all session state is completely cleared
      window.location.href = '/engine/login';
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    adminLogoutMutation.mutate();
  };

  const getUserInitials = (user: any) => {
    if (!user?.name) return 'A';
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.name[0]?.toUpperCase() || 'A';
  };

  // Bottom navigation items for mobile admin
  const bottomNavItems = [
    {
      href: "/engine",
      icon: LayoutDashboard,
      label: "Dashboard",
      active: location === "/engine"
    },
    {
      href: "/engine/users",
      icon: Users,
      label: "Users",
      active: location === "/engine/users"
    },
    {
      href: "/engine/modules",
      icon: Package,
      label: "Modules",
      active: location === "/engine/modules"
    },
    {
      href: "/engine/analytics",
      icon: BarChart3,
      label: "Analytics",
      active: location === "/engine/analytics"
    }
  ];

  // Sidebar sections for mobile menu
  const sidebarSections = [
    {
      section: "Dashboard",
      items: [
        { icon: LayoutDashboard, label: 'Overview', href: '/engine' },
      ]
    },
    {
      section: "Data Management",
      items: [
        { icon: Users, label: 'All Users', href: '/engine/users' },
        { icon: Building, label: 'All Orgs', href: '/engine/tenants' },
        { icon: Package, label: 'DataSets', href: '/engine/datasets' },
        { icon: Package, label: 'Media', href: '/engine/media' },
      ]
    },
    {
      section: "Platform Management",
      items: [
        { icon: Package, label: 'Modules', href: '/engine/modules' },
        { icon: Package, label: 'Apps', href: '/engine/apps' },
        { icon: Package, label: 'Hubs', href: '/engine/hubs' },
        { icon: Package, label: 'CMS', href: '/engine/cms' },
        { icon: Package, label: 'Themes', href: '/engine/themes' },
      ]
    },
    {
      section: "Operations",
      items: [
        { icon: Package, label: 'Plans & Prices', href: '/engine/plans-prices' },
        { icon: Package, label: 'Help & Support', href: '/engine/help-support' },
        { icon: Package, label: 'Billing', href: '/engine/billing' },
        { icon: Package, label: 'Transactions', href: '/engine/transactions' },
        { icon: BarChart3, label: 'Analytics', href: '/engine/analytics' },
      ]
    },
    {
      section: "System & Config",
      items: [
        { icon: Package, label: 'Integrations', href: '/engine/integrations' },
        { icon: Settings, label: 'SEO Settings', href: '/engine/seo-settings' },
        { icon: Settings, label: 'Global Settings', href: '/engine/global-settings' },
        { icon: Shield, label: 'Roles & Permissions', href: '/engine/roles-permissions' },
        { icon: Users, label: 'Admin Users', href: '/engine/admin-users' },
        { icon: Package, label: 'Backups', href: '/engine/backups' },
        { icon: Package, label: 'System Logs', href: '/engine/system-logs' },
        { icon: Package, label: 'System Monitor', href: '/engine/system-monitor' },
        { icon: Package, label: 'System Status', href: '/engine/system-status' },
        { icon: Shield, label: 'Security', href: '/engine/security' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Mobile Admin Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-red-200 dark:border-red-800 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left - Admin branding */}
            <div className="flex items-center space-x-2">
              <Link href="/">
                <img 
                  src="/wytnet-logo.png" 
                  alt="WytNet" 
                  className="h-6 w-auto"
                />
              </Link>
              <Badge variant="destructive" className="bg-red-600 text-xs">
                Engine
              </Badge>
              {adminUser?.isSuperAdmin && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-600 text-xs">
                  Super
                </Badge>
              )}
            </div>

            {/* Right - Actions + Menu */}
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              
              {/* Admin Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-red-200 dark:border-red-800">
                    <Avatar className="h-8 w-8">
                      {adminUser?.profileImageUrl && (
                        <AvatarImage src={adminUser.profileImageUrl} alt={adminUser.name || "Admin"} />
                      )}
                      <AvatarFallback className="bg-red-600 text-white text-xs">
                        {getUserInitials(adminUser)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-red-600 text-white text-xs">
                        {getUserInitials(adminUser)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{adminUser?.name || "Admin"}</p>
                      <p className="text-xs text-muted-foreground">
                        {adminUser?.email || ""}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {adminUser?.role || 'admin'}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400"
                    onClick={handleLogout}
                    disabled={adminLogoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {adminLogoutMutation.isPending ? "Signing out..." : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Hamburger Menu */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-red-600" />
                      Engine Admin
                      {adminUser?.isSuperAdmin && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600 text-xs">
                          Super Admin
                        </Badge>
                      )}
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 space-y-4">
                    {sidebarSections.map((section) => (
                      <div key={section.section}>
                        <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {section.section}
                        </h3>
                        <div className="mt-2 space-y-1">
                          {section.items.map((item) => (
                            <Link 
                              key={item.href}
                              href={item.href} 
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-700 dark:text-gray-200" 
                              onClick={() => setSidebarOpen(false)}
                              data-testid={`admin-sidebar-${item.label.toLowerCase().replace(' ', '-')}`}
                            >
                              <item.icon className="h-5 w-5" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 p-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-red-200 dark:border-red-800 z-50">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex flex-col items-center px-3 py-2 rounded-lg transition-colors",
                  item.active 
                    ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
                data-testid={`admin-bottom-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}