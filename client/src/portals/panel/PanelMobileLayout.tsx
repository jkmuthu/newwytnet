import { useState, useEffect, ReactNode } from "react";
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
  Bell,
  Sun,
  Moon,
  Grid3x3,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
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
  const [isDark, setIsDark] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark';
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

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
    if (!user?.name) return 'U';
    const nameParts = String(user.name).split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return String(user.name)[0]?.toUpperCase() || 'U';
  };

  // Bottom navigation items - Unified across public and panel (same as public pages)
  const getBottomNavItems = () => {
    return [
      {
        href: "/",
        icon: Home,
        label: "WytWall",
        active: location === "/" || location.startsWith("/wytwall")
      },
      {
        href: "/wytapps",
        icon: Grid3x3,
        label: "WytApps",
        active: location === "/wytapps" || location.startsWith("/app/")
      },
      {
        href: "/wythubs",
        icon: Building,
        label: "WytHubs",
        active: location === "/wythubs" || location.startsWith("/hub/")
      },
      {
        href: "/wytlife",
        icon: Activity,
        label: "WytLife",
        active: location === "/wytlife" || location.startsWith("/wytlife")
      }
    ];
  };

  // Sidebar navigation items based on workspace context
  const getSidebarNavItems = () => {
    if (currentWorkspace.type === 'personal') {
      return [
        {
          href: "/u/me",
          icon: Home,
          label: "Dashboard",
          active: location === "/u/me" || location === "/u/me/dashboard" || location === "/panel/me"
        },
        {
          href: "/u/me/wytapps",
          icon: FolderOpen,
          label: "My Apps",
          active: location === "/u/me/wytapps" || location.startsWith("/u/me/wytapps/")
        },
        {
          href: "/u/me/wallet",
          icon: BarChart3,
          label: "Analytics",
          active: location === "/u/me/wallet"
        },
        {
          href: "/u/me/posts",
          icon: MessageSquare,
          label: "Messages",
          active: location === "/u/me/posts"
        }
      ];
    } else {
      return [
        {
          href: `/o/${currentWorkspace.orgId}`,
          icon: Building,
          label: "Dashboard",
          active: location === `/o/${currentWorkspace.orgId}` || location === `/o/${currentWorkspace.orgId}/dashboard`
        },
        {
          href: `/o/${currentWorkspace.orgId}/team`,
          icon: Users,
          label: "Team",
          active: location === `/o/${currentWorkspace.orgId}/team`
        },
        {
          href: `/o/${currentWorkspace.orgId}/wytapps`,
          icon: FolderOpen,
          label: "Apps",
          active: location === `/o/${currentWorkspace.orgId}/wytapps`
        },
        {
          href: `/o/${currentWorkspace.orgId}/settings`,
          icon: Settings,
          label: "Settings",
          active: location === `/o/${currentWorkspace.orgId}/settings`
        }
      ];
    }
  };

  const workspaceOptions = [
    {
      type: 'personal' as const,
      id: 'me',
      name: 'WytPanel',
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
    <div className="min-h-screen h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header - Unified with WytNet Logo */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="px-3 sm:px-4">
          <div className="flex justify-between items-center h-14">
            {/* Left - Hamburger Menu + Logo */}
            <div className="flex items-center gap-2">
              {/* Hamburger Menu */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 p-0"
                    data-testid="button-hamburger-menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <SheetHeader className="p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <SheetTitle className="flex items-center gap-2 text-white">
                      <img 
                        src="/wytnet-logo.png?v=2" 
                        alt="WytNet" 
                        className="h-6 w-auto brightness-0 invert"
                      />
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {/* Explore Section */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Explore
                    </div>
                    <Link href="/" onClick={() => setSidebarOpen(false)}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                        location === "/" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}>
                        <Home className="h-5 w-5" />
                        <span className="font-medium">WytWall</span>
                      </div>
                    </Link>
                    <Link href="/wytapps" onClick={() => setSidebarOpen(false)}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                        location === "/wytapps" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}>
                        <Grid3x3 className="h-5 w-5" />
                        <span className="font-medium">WytApps</span>
                      </div>
                    </Link>
                    <Link href="/wythubs" onClick={() => setSidebarOpen(false)}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                        location === "/wythubs" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}>
                        <Building className="h-5 w-5" />
                        <span className="font-medium">WytHubs</span>
                      </div>
                    </Link>
                    <Link href="/wytlife" onClick={() => setSidebarOpen(false)}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                        location === "/wytlife" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}>
                        <Activity className="h-5 w-5" />
                        <span className="font-medium">WytLife</span>
                      </div>
                    </Link>
                    
                    {/* My Workspace Section - Context-aware */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                      {currentWorkspace.type === 'personal' ? 'My WytPanel' : currentWorkspace.name}
                    </div>
                    {getSidebarNavItems().map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                        <div className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                          item.active ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}>
                          <item.icon className={cn("h-5 w-5", item.active ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400")} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                      </Link>
                    ))}
                    
                    {/* Settings always available */}
                    <Link href="/u/me/account" onClick={() => setSidebarOpen(false)}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                        location === "/u/me/account" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}>
                        <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium">Settings</span>
                      </div>
                    </Link>
                  </nav>
                  <div className="p-3 border-t">
                    <Button
                      onClick={() => {
                        setSidebarOpen(false);
                        handleLogout();
                      }}
                      variant="outline"
                      className="w-full justify-start gap-3 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{logoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* WytNet Logo */}
              <Link href="/">
                <img 
                  src="/wytnet-logo.png?v=2" 
                  alt="WytNet" 
                  className="h-7 w-auto"
                  data-testid="img-logo"
                />
              </Link>
            </div>

            {/* Right - Actions + User Avatar */}
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleTheme}
                className="h-10 w-10 p-0"
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600" />
                )}
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              
              {/* User Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      {(user as any)?.profileImageUrl && (
                        <AvatarImage src={(user as any).profileImageUrl} alt={(user as any).name || "User"} />
                      )}
                      <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-3 p-3 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{(user as any)?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(user as any)?.email || (user as any)?.mobileNumber || ""}
                      </p>
                    </div>
                  </div>
                  <Link href="/u/me/profile">
                    <DropdownMenuItem className="cursor-pointer py-2.5">
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/u/me/account">
                    <DropdownMenuItem className="cursor-pointer py-2.5">
                      <Settings className="mr-3 h-4 w-4" />
                      Account Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400 py-2.5"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    {logoutMutation.isPending ? "Signing out..." : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 py-4 pb-20">
        {children}
      </main>

      {/* Bottom Navigation - Touch-friendly 44px+ targets */}
      <nav className="flex-shrink-0 fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around py-1 px-1">
          {bottomNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex flex-col items-center justify-center min-h-[52px] min-w-[64px] px-3 py-2 rounded-xl transition-all active:scale-95",
                  item.active 
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-sm" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
                data-testid={`bottom-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className={cn("h-5 w-5 mb-0.5", item.active && "h-[22px] w-[22px]")} />
                <span className={cn(
                  "text-[11px] font-medium truncate max-w-[60px]",
                  item.active && "font-semibold"
                )}>{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}