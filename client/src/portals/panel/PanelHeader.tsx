import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, User, Settings, LogOut, ChevronLeft, ChevronRight, Search, Bell, Building } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { WorkspaceContext } from "./PanelLayout";
import { cn } from "@/lib/utils";

interface PanelHeaderProps {
  currentWorkspace: WorkspaceContext;
  onWorkspaceChange: (workspace: WorkspaceContext) => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

/**
 * PanelHeader - Redesigned header with logo, panel switcher, and responsive design
 * Features: WytNet logo, My Panel/Org Panel switcher, sidebar toggle, search, notifications, user menu
 */
export default function PanelHeader({ 
  currentWorkspace, 
  onWorkspaceChange, 
  onToggleSidebar,
  sidebarCollapsed 
}: PanelHeaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      window.location.href = '/';
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
    logoutMutation.mutate();
  };

  const getUserInitials = (user: any) => {
    const name = user?.name;
    if (!name || typeof name !== 'string') return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || 'U';
  };

  // Determine active panel based on current location
  const isMyPanel = location.includes('/mypanel') || (!location.includes('/orgpanel') && !location.includes('/panel/org'));
  const isOrgPanel = location.includes('/orgpanel') || location.includes('/panel/org');

  const switchToMyPanel = () => {
    onWorkspaceChange({
      type: 'personal',
      id: 'me',
      name: 'My Panel'
    });
    setLocation('/mypanel');
  };

  const switchToOrgPanel = () => {
    onWorkspaceChange({
      type: 'organization',
      id: 'org',
      name: 'Org Panel'
    });
    setLocation('/orgpanel');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-3 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Left section - Logo + Panel Switcher + Collapse */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* WytNet Logo */}
            <Link href="/mypanel">
              <div className="flex items-center gap-2 cursor-pointer shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-lg">W</span>
                </div>
                <span className="hidden sm:block text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  WytNet
                </span>
              </div>
            </Link>

            {/* Panel Switcher */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={isMyPanel ? 'default' : 'ghost'}
                size="sm"
                onClick={switchToMyPanel}
                className={cn(
                  "h-8 text-xs sm:text-sm px-2 sm:px-4",
                  isMyPanel && "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                data-testid="switch-my-panel"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xs:inline">My Panel</span>
                <span className="xs:hidden">My</span>
              </Button>
              <Button
                variant={isOrgPanel ? 'default' : 'ghost'}
                size="sm"
                onClick={switchToOrgPanel}
                className={cn(
                  "h-8 text-xs sm:text-sm px-2 sm:px-4",
                  isOrgPanel && "bg-green-600 hover:bg-green-700 text-white"
                )}
                data-testid="switch-org-panel"
              >
                <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xs:inline">Org Panel</span>
                <span className="xs:hidden">Org</span>
              </Button>
            </div>

            {/* Sidebar Collapse Toggle (Desktop only) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="hidden lg:flex h-8 w-8 p-0 shrink-0"
              data-testid="toggle-collapse"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Right section - Actions + Profile */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Search */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 sm:h-10 sm:w-10 p-0"
              data-testid="button-search"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 sm:h-10 sm:w-10 p-0 relative"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden h-8 w-8 p-0"
              data-testid="toggle-sidebar-mobile"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0"
                  data-testid="user-menu"
                >
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    {user && typeof user === 'object' && 'profileImageUrl' in user && user.profileImageUrl && 
                     typeof user.profileImageUrl === 'string' && (
                      <AvatarImage 
                        src={user.profileImageUrl} 
                        alt={(user && 'name' in user && typeof user.name === 'string' ? user.name : "User")} 
                      />
                    )}
                    <AvatarFallback className="bg-blue-600 text-white text-xs sm:text-sm">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    {user && typeof user === 'object' && 'profileImageUrl' in user && user.profileImageUrl && 
                     typeof user.profileImageUrl === 'string' && (
                      <AvatarImage 
                        src={user.profileImageUrl} 
                        alt={(user && 'name' in user && typeof user.name === 'string' ? user.name : "User")} 
                      />
                    )}
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {(user && typeof user === 'object' && 'name' in user ? user.name as string : '') || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user && typeof user === 'object' && 'email' in user ? user.email as string : ''}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href={currentWorkspace.type === 'personal' ? '/mypanel/profile' : '/orgpanel/profile'}>
                  <DropdownMenuItem className="cursor-pointer" data-testid="menu-profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href={currentWorkspace.type === 'personal' ? '/mypanel/account' : '/orgpanel/account'}>
                  <DropdownMenuItem className="cursor-pointer" data-testid="menu-settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 dark:text-red-400"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  data-testid="menu-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{logoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
