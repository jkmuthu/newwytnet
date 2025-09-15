import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  Home, 
  FolderOpen, 
  BarChart3, 
  MessageSquare,
  Building,
  Users,
  Search,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { WorkspaceContext } from "./PanelLayout";

interface PanelMobileLayoutProps {
  children: ReactNode;
  currentWorkspace: WorkspaceContext;
  onWorkspaceChange: (workspace: WorkspaceContext) => void;
}

/**
 * PanelMobileLayout - Mobile layout for user workspaces
 * Features: Mobile navigation with workspace switcher and bottom tabs
 */
export default function PanelMobileLayout({ 
  children, 
  currentWorkspace, 
  onWorkspaceChange 
}: PanelMobileLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useWhatsAppAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/whatsapp/logout', {
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
      queryClient.invalidateQueries({ queryKey: ['/api/auth/whatsapp/user'] });
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
    if (!user?.name) return 'U';
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.name[0]?.toUpperCase() || 'U';
  };

  // Bottom navigation items based on workspace
  const getBottomNavItems = () => {
    if (currentWorkspace.type === 'personal') {
      return [
        {
          href: "/panel/me",
          icon: Home,
          label: "Home",
          active: location === "/panel/me" || location === "/panel/me/dashboard"
        },
        {
          href: "/panel/me/projects",
          icon: FolderOpen,
          label: "Projects",
          active: location === "/panel/me/projects"
        },
        {
          href: "/panel/me/analytics",
          icon: BarChart3,
          label: "Analytics",
          active: location === "/panel/me/analytics"
        },
        {
          href: "/panel/me/messages",
          icon: MessageSquare,
          label: "Messages",
          active: location === "/panel/me/messages"
        }
      ];
    } else {
      return [
        {
          href: `/panel/org/${currentWorkspace.orgId}`,
          icon: Building,
          label: "Dashboard",
          active: location === `/panel/org/${currentWorkspace.orgId}`
        },
        {
          href: `/panel/org/${currentWorkspace.orgId}/members`,
          icon: Users,
          label: "Members",
          active: location === `/panel/org/${currentWorkspace.orgId}/members`
        },
        {
          href: `/panel/org/${currentWorkspace.orgId}/projects`,
          icon: FolderOpen,
          label: "Projects",
          active: location === `/panel/org/${currentWorkspace.orgId}/projects`
        },
        {
          href: `/panel/org/${currentWorkspace.orgId}/analytics`,
          icon: BarChart3,
          label: "Analytics",
          active: location === `/panel/org/${currentWorkspace.orgId}/analytics`
        }
      ];
    }
  };

  const workspaceOptions = [
    {
      type: 'personal' as const,
      id: 'me',
      name: 'My Panel',
      icon: User,
      orgId: undefined,
    }
    // TODO: Add organization workspaces
  ];

  const handleWorkspaceChange = (workspaceId: string) => {
    const workspace = workspaceOptions.find(ws => ws.id === workspaceId);
    if (workspace) {
      onWorkspaceChange({
        type: workspace.type,
        id: workspace.id,
        name: workspace.name,
        orgId: workspace.orgId,
      });
    }
  };

  const bottomNavItems = getBottomNavItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left - Workspace Switcher */}
            <Select value={currentWorkspace.id} onValueChange={handleWorkspaceChange}>
              <SelectTrigger className="w-40 border-0 shadow-none">
                <div className="flex items-center space-x-2">
                  {currentWorkspace.type === 'personal' ? (
                    <User className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Building className="h-4 w-4 text-green-600" />
                  )}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {workspaceOptions.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    <div className="flex items-center space-x-2">
                      <workspace.icon className={`h-4 w-4 ${
                        workspace.type === 'personal' ? 'text-blue-600' : 'text-green-600'
                      }`} />
                      <span>{workspace.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Right - Actions + Menu */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {user?.profileImageUrl && (
                        <AvatarImage src={user.profileImageUrl} alt={user.name || "User"} />
                      )}
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || user?.mobileNumber || ""}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/panel/me/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/panel/me/settings">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? "Signing out..." : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 p-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex flex-col items-center px-3 py-2 rounded-lg transition-colors",
                  item.active 
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
                data-testid={`bottom-nav-${item.label.toLowerCase().replace(' ', '-')}`}
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