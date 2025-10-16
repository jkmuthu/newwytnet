import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Menu, User, Settings, LogOut, Shield, Activity, HelpCircle, Bell, Search, Home } from "lucide-react";
import { Link } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

/**
 * AdminHeader - Header for admin portal
 * Features: Admin branding, system monitoring, admin profile management
 */
export default function AdminHeader({ 
  onToggleSidebar,
  sidebarCollapsed 
}: AdminHeaderProps) {
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Admin branding */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden"
              data-testid="toggle-admin-sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-3">
              <Link href="/engine" className="flex items-center">
                <img 
                  src="/wytnet-logo.png" 
                  alt="WytNet" 
                  className="h-8 w-auto"
                />
              </Link>
            </div>
          </div>

          {/* Center section - System status indicator */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-3 py-1 bg-green-50 dark:bg-green-950 rounded-full">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                System Online
              </span>
            </div>
          </div>

          {/* Right section - Admin actions + Profile */}
          <div className="flex items-center space-x-3">
            {/* Quick Actions */}
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="admin-home">
                <Home className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/engine/search">
              <Button variant="ghost" size="sm" data-testid="admin-search">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/engine/notifications">
              <Button variant="ghost" size="sm" data-testid="admin-notifications">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/engine/system-status">
              <Button variant="ghost" size="sm" data-testid="admin-system-monitor">
                <Activity className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/engine/help">
              <Button variant="ghost" size="sm" data-testid="admin-help">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </Link>

            {/* Admin User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full border-2 border-red-200 dark:border-red-800"
                  data-testid="admin-user-menu"
                >
                  <Avatar className="h-10 w-10">
                    {adminUser?.profileImageUrl && (
                      <AvatarImage src={adminUser.profileImageUrl} alt={adminUser.name || "Admin"} />
                    )}
                    <AvatarFallback className="bg-red-600 text-white">
                      {getUserInitials(adminUser)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    {adminUser?.profileImageUrl && (
                      <AvatarImage src={adminUser.profileImageUrl} alt={adminUser.name || "Admin"} />
                    )}
                    <AvatarFallback className="bg-red-600 text-white text-xs">
                      {getUserInitials(adminUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {adminUser?.name || "Admin User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {adminUser?.email || ""}
                    </p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                        {adminUser?.role || 'admin'}
                      </Badge>
                      {adminUser?.isSuperAdmin && (
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-4 bg-yellow-100 text-yellow-800">
                          Super
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href="/engine/profile">
                  <DropdownMenuItem className="cursor-pointer" data-testid="admin-menu-profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Admin Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/engine/settings">
                  <DropdownMenuItem className="cursor-pointer" data-testid="admin-menu-settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Admin Settings</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/engine/security">
                  <DropdownMenuItem className="cursor-pointer" data-testid="admin-menu-security">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Security</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 dark:text-red-400"
                  onClick={handleLogout}
                  disabled={adminLogoutMutation.isPending}
                  data-testid="admin-menu-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{adminLogoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}