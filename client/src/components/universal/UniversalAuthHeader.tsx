import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Settings, 
  Home, 
  LogOut, 
  ChevronDown, 
  Menu,
  User,
  CheckCircle2
} from "lucide-react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

interface Context {
  type: 'engine_admin' | 'hub_admin' | 'user';
  name: string;
  path: string;
  icon: string;
  hubKey?: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  active: boolean;
}

interface ContextsResponse {
  contexts: Context[];
  count: number;
}

export default function UniversalAuthHeader() {
  const { isMobile } = useDeviceDetection();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch available contexts for the user
  const { data: contextsData, isLoading: contextsLoading } = useQuery<ContextsResponse>({
    queryKey: ["/api/auth/contexts"],
    retry: false,
    refetchOnWindowFocus: true,
  });

  const contexts = contextsData?.contexts || [];
  const activeContext = contexts.find(c => c.active);
  const hasAuth = contexts.length > 0;

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Try all logout endpoints - one will succeed based on active session
      const results = await Promise.allSettled([
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }),
        fetch('/api/auth/admin/logout', { method: 'POST', credentials: 'include' }),
        fetch('/api/hub-admin/session', { method: 'DELETE', credentials: 'include' })
      ]);
      
      // Check if at least one logout succeeded
      const anySucceeded = results.some(result => result.status === 'fulfilled' && result.value.ok);
      if (!anySucceeded) {
        throw new Error('All logout attempts failed');
      }
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation('/');
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
    },
    onError: () => {
      // Even if logout API fails, clear client state and redirect
      queryClient.clear();
      setLocation('/');
      toast({
        title: "Session cleared",
        description: "You have been logged out locally",
        variant: "default",
      });
    },
  });

  // Icon mapping
  const getIcon = (iconName: string, isActive: boolean = false) => {
    const className = `h-4 w-4 ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`;
    switch (iconName) {
      case 'Shield':
        return <Shield className={className} />;
      case 'Settings':
        return <Settings className={className} />;
      case 'Home':
      case 'User':
        return <Home className={className} />;
      default:
        return <User className={className} />;
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Panel Switch Handler
  const handlePanelSwitch = (path: string) => {
    setLocation(path);
    setIsMenuOpen(false);
  };

  // Not authenticated - show Login/Join button
  if (!hasAuth) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button 
            variant="ghost" 
            size={isMobile ? "sm" : "default"}
            data-testid="button-login"
          >
            Login / Join
          </Button>
        </Link>
      </div>
    );
  }

  // Authenticated - show user DP with panel switcher
  const userInfo = activeContext?.user || contexts[0]?.user;

  // Mobile version - Sheet menu
  if (isMobile) {
    return (
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            data-testid="button-mobile-menu"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={undefined} />
              <AvatarFallback className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                {getUserInitials(userInfo?.name)}
              </AvatarFallback>
            </Avatar>
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] p-0">
          <div className="flex flex-col h-full">
            {/* User Info Header */}
            <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-white">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-white text-purple-600 font-semibold">
                    {getUserInitials(userInfo?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{userInfo?.name}</p>
                  <p className="text-xs opacity-90 truncate">{userInfo?.email}</p>
                </div>
              </div>
            </div>

            {/* Panel Switcher */}
            <div className="flex-1 overflow-y-auto p-2">
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Switch Panel
              </p>
              <div className="space-y-1">
                {contexts.map((context, index) => (
                  <button
                    key={index}
                    onClick={() => handlePanelSwitch(context.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      context.active
                        ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    data-testid={`button-switch-${context.hubKey || context.type}`}
                  >
                    {getIcon(context.icon, context.active)}
                    <div className="flex-1 text-left">
                      <p className="font-medium">{context.name}</p>
                      <p className="text-xs text-muted-foreground">{context.user.role}</p>
                    </div>
                    {context.active && (
                      <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Logout */}
            <div className="p-2 border-t">
              <Button
                onClick={() => logoutMutation.mutate()}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version - Dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="gap-2 px-2"
          data-testid="button-user-menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} />
            <AvatarFallback className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
              {getUserInitials(userInfo?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">{userInfo?.name}</span>
            <span className="text-xs text-muted-foreground">{activeContext?.user.role || userInfo?.role}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        {/* User Info */}
        <DropdownMenuLabel className="pb-2">
          <div className="flex flex-col">
            <p className="font-medium">{userInfo?.name}</p>
            <p className="text-xs text-muted-foreground font-normal">{userInfo?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Panel Switcher */}
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Switch Panel
          </p>
        </div>
        {contexts.map((context, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => handlePanelSwitch(context.path)}
            className={`flex items-center gap-2 cursor-pointer ${
              context.active ? 'bg-purple-50 dark:bg-purple-950/30' : ''
            }`}
            data-testid={`menu-item-${context.hubKey || context.type}`}
          >
            {getIcon(context.icon, context.active)}
            <div className="flex-1">
              <p className="font-medium text-sm">{context.name}</p>
              <p className="text-xs text-muted-foreground">{context.user.role}</p>
            </div>
            {context.active && (
              <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
          data-testid="menu-item-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
