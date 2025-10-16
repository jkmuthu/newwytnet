import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Menu, User, Settings, LogOut, Home, Activity, Bell, Search, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useHubAdminAuth } from "@/contexts/HubAdminAuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

interface HubAdminHeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

/**
 * HubAdminHeader - Header for WytNet.com Hub Admin portal
 * Features: Hub branding, content monitoring, hub admin profile management
 */
export default function HubAdminHeader({ 
  onToggleSidebar,
  sidebarCollapsed 
}: HubAdminHeaderProps) {
  const { hubAdminUser } = useHubAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // Fetch available contexts/panels
  const { data: contextsData } = useQuery({
    queryKey: ['/api/auth/contexts'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const availableContexts = contextsData?.contexts || [];

  const handleSwitchContext = (path: string) => {
    setLocation(path);
  };

  const hubAdminLogoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/hub-admin/session', {
        method: 'DELETE',
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
      
      // Force a full page reload to the Hub Admin login page
      window.location.href = '/admin/login';
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
    hubAdminLogoutMutation.mutate();
  };

  const getUserInitials = (user: any) => {
    if (!user?.name) return 'HA';
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.name[0]?.toUpperCase() || 'HA';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Hub Admin branding */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="text-blue-700 dark:text-blue-400"
              data-testid="button-toggle-sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Link href="/admin">
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-2">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    WytNet.com Hub Admin
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Content Management
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Right section - Hub Admin profile */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-gray-600 dark:text-gray-400"
              data-testid="button-search"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-gray-600 dark:text-gray-400 relative"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-blue-600 rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative flex items-center space-x-3 px-3"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-8 w-8 border-2 border-blue-500">
                    <AvatarImage src={hubAdminUser?.profileImageUrl} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {getUserInitials(hubAdminUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {hubAdminUser?.name || 'Hub Admin'}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {hubAdminUser?.hubName || 'WytNet.com'}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {hubAdminUser?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {hubAdminUser?.email}
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs border-blue-500 text-blue-700 dark:text-blue-400">
                    Hub Admin
                  </Badge>
                </div>

                {/* Panel/Role Switcher */}
                {availableContexts.length > 1 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1">
                      Switch Panel
                    </DropdownMenuLabel>
                    {availableContexts.map((context: any) => (
                      <DropdownMenuItem
                        key={context.type}
                        onClick={() => handleSwitchContext(context.path)}
                        className={`cursor-pointer ${context.active ? 'bg-accent' : ''}`}
                        data-testid={`switch-to-${context.type}`}
                      >
                        {context.type === 'engine_admin' && <Shield className="mr-2 h-4 w-4" />}
                        {context.type === 'hub_admin' && <Settings className="mr-2 h-4 w-4" />}
                        {context.type === 'user' && <User className="mr-2 h-4 w-4" />}
                        <div className="flex-1">
                          <div className="text-sm font-medium">{context.name}</div>
                          <div className="text-xs text-muted-foreground">{context.user.role}</div>
                        </div>
                        {context.active && (
                          <Badge variant="outline" className="text-xs px-1 py-0 h-4 ml-2">
                            Active
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Hub Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 cursor-pointer"
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
