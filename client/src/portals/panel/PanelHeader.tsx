import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, User, Settings, LogOut, Building, ChevronDown, Search, Bell, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { WorkspaceContext } from "./PanelLayout";

interface PanelHeaderProps {
  currentWorkspace: WorkspaceContext;
  onWorkspaceChange: (workspace: WorkspaceContext) => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

/**
 * PanelHeader - Header for authenticated user workspaces
 * Features: Workspace switcher, search, notifications, user menu
 */
export default function PanelHeader({ 
  currentWorkspace, 
  onWorkspaceChange, 
  onToggleSidebar,
  sidebarCollapsed 
}: PanelHeaderProps) {
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

  const workspaceOptions = [
    {
      type: 'personal' as const,
      id: 'me',
      name: 'My Panel',
      icon: User,
      orgId: undefined,
    },
    // TODO: Add organization workspaces from user data
    // {
    //   type: 'organization' as const,
    //   id: 'org-1',
    //   name: 'WytNet Team',
    //   icon: Building,
    //   orgId: 'org-1'
    // }
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Sidebar toggle + Workspace switcher */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden"
              data-testid="toggle-sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Workspace Switcher */}
            <Select value={currentWorkspace.id} onValueChange={handleWorkspaceChange}>
              <SelectTrigger className="w-48 border-0 shadow-none">
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
          </div>

          {/* Right section - Actions + Profile */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <Button variant="ghost" size="sm" data-testid="button-search">
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Help */}
            <Button variant="ghost" size="sm" data-testid="button-help">
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full"
                  data-testid="user-menu"
                >
                  <Avatar className="h-10 w-10">
                    {user?.profileImageUrl && (
                      <AvatarImage src={user.profileImageUrl} alt={user.name || "User"} />
                    )}
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    {user?.profileImageUrl && (
                      <AvatarImage src={user.profileImageUrl} alt={user.name || "User"} />
                    )}
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || user?.mobileNumber || ""}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href="/panel/me/profile">
                  <DropdownMenuItem className="cursor-pointer" data-testid="menu-profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/panel/me/settings">
                  <DropdownMenuItem className="cursor-pointer" data-testid="menu-settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
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