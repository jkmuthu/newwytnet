import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, 
  LogOut, 
  ChevronDown, 
  Menu,
  User,
  LayoutDashboard,
  Shield,
  Sun,
  Moon,
  Bell
} from "lucide-react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import NotificationBell from "@/components/notifications/NotificationBell";
import ContextAwareLogo from "@/components/shared/ContextAwareLogo";

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

interface UniversalAuthHeaderProps {
  showThemeToggle?: boolean;
  showHomeButton?: boolean;
  showLogo?: boolean;
  showNotifications?: boolean;
  context?: 'public' | 'panel' | 'engine';
}

/**
 * UniversalAuthHeader - Unified header component for all panels
 * Layout: [Theme Toggle] [Home Icon] [Logo] [Menus] [Notifications] [User Avatar + Dropdown]
 * Dropdown: WytPanel, My Account, WytEngine (admin only), Logout
 */
export default function UniversalAuthHeader({
  showThemeToggle = true,
  showHomeButton = true,
  showLogo = true,
  showNotifications = true,
  context = 'panel'
}: UniversalAuthHeaderProps) {
  const { isMobile } = useDeviceDetection();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark';
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const { data: contextsData } = useQuery<ContextsResponse>({
    queryKey: ["/api/auth/contexts"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const contexts = contextsData?.contexts || [];
  const hasAuth = contexts.length > 0;
  
  const userContext = contexts.find(c => c.type === 'user');
  const engineContext = contexts.find(c => c.type === 'engine_admin');
  const hasEngineAccess = !!engineContext;
  
  const activeContext = contexts.find(c => c.active);
  const userInfo = activeContext?.user || userContext?.user || contexts[0]?.user;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled([
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }),
        fetch('/api/auth/admin/logout', { method: 'POST', credentials: 'include' }),
        fetch('/api/hub-admin/session', { method: 'DELETE', credentials: 'include' })
      ]);
      
      const anySucceeded = results.some(result => result.status === 'fulfilled' && (result.value as Response).ok);
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
      queryClient.clear();
      setLocation('/');
      toast({
        title: "Session cleared",
        description: "You have been logged out",
      });
    },
  });

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Theme toggle button component
  const ThemeToggleButton = () => (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 h-9 w-9 p-0"
      data-testid="button-theme-toggle"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-slate-600" />
      )}
    </Button>
  );

  // Home button component
  const HomeButton = () => (
    <Link href="/">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 h-9 w-9 p-0"
        data-testid="button-home"
        aria-label="Go to home page"
      >
        <Home className="h-5 w-5" />
      </Button>
    </Link>
  );

  // If not authenticated, show login button
  if (!hasAuth) {
    return (
      <div className="flex items-center gap-2">
        {showThemeToggle && <ThemeToggleButton />}
        {showHomeButton && <HomeButton />}
        {showLogo && (
          <ContextAwareLogo context={context} className="h-8 w-auto mx-2" href="/" />
        )}
        <Link href="/login">
          <Button 
            variant="default" 
            size={isMobile ? "sm" : "default"}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            data-testid="button-login"
          >
            Login / Join
          </Button>
        </Link>
      </div>
    );
  }

  // Dropdown menu items (without Go Home - we have icon for that)
  const menuItems = (
    <>
      <Link href="/u/me" onClick={() => setIsMenuOpen(false)}>
        <DropdownMenuItem className="cursor-pointer gap-3 py-2.5" data-testid="menu-wytpanel">
          <LayoutDashboard className="h-4 w-4" />
          <span>WytPanel</span>
        </DropdownMenuItem>
      </Link>
      
      <Link href="/u/me/account" onClick={() => setIsMenuOpen(false)}>
        <DropdownMenuItem className="cursor-pointer gap-3 py-2.5" data-testid="menu-my-account">
          <User className="h-4 w-4" />
          <span>My Account</span>
        </DropdownMenuItem>
      </Link>
      
      {hasEngineAccess && (
        <Link href="/engine" onClick={() => setIsMenuOpen(false)}>
          <DropdownMenuItem className="cursor-pointer gap-3 py-2.5 text-red-600 dark:text-red-400" data-testid="menu-wytengine">
            <Shield className="h-4 w-4" />
            <span>WytEngine</span>
          </DropdownMenuItem>
        </Link>
      )}
      
      <DropdownMenuSeparator />
      
      <DropdownMenuItem
        onClick={() => {
          setIsMenuOpen(false);
          logoutMutation.mutate();
        }}
        disabled={logoutMutation.isPending}
        className="cursor-pointer gap-3 py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30"
        data-testid="menu-logout"
      >
        <LogOut className="h-4 w-4" />
        <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
      </DropdownMenuItem>
    </>
  );

  // Mobile view with sheet
  if (isMobile) {
    return (
      <div className="flex items-center gap-1">
        {showThemeToggle && <ThemeToggleButton />}
        {showHomeButton && <HomeButton />}
        {showNotifications && <NotificationBell />}
        
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 px-2"
              data-testid="button-mobile-menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
                  {getUserInitials(userInfo?.name)}
                </AvatarFallback>
              </Avatar>
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white/30">
                    <AvatarFallback className="bg-white/20 text-white font-semibold">
                      {getUserInitials(userInfo?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{userInfo?.name || "User"}</p>
                    <p className="text-sm opacity-80 truncate">{userInfo?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-2">
                <div className="space-y-1">
                  <Link 
                    href="/u/me" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-medium">WytPanel</span>
                  </Link>
                  
                  <Link 
                    href="/u/me/account" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">My Account</span>
                  </Link>
                  
                  {hasEngineAccess && (
                    <Link 
                      href="/engine" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600 dark:text-red-400"
                    >
                      <Shield className="h-5 w-5" />
                      <span className="font-medium">WytEngine</span>
                    </Link>
                  )}
                </div>
              </div>

              <div className="p-3 border-t">
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logoutMutation.mutate();
                  }}
                  variant="outline"
                  className="w-full justify-start gap-3 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                  disabled={logoutMutation.isPending}
                  data-testid="button-logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex items-center gap-2">
      {showThemeToggle && <ThemeToggleButton />}
      {showHomeButton && <HomeButton />}
      {showLogo && (
        <ContextAwareLogo context={context} className="h-8 w-auto mx-2" href="/" />
      )}
      {showNotifications && <NotificationBell />}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="gap-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            data-testid="button-user-menu"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
                {getUserInitials(userInfo?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium">{userInfo?.name || "User"}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-2 border-b mb-1">
            <p className="font-medium text-sm">{userInfo?.name || "User"}</p>
            <p className="text-xs text-muted-foreground">{userInfo?.email}</p>
          </div>
          {menuItems}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
