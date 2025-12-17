import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Home, Activity, QrCode, Grid3x3, Sun, Moon, Menu, Building, User, FolderOpen, Settings, LogOut, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Footer from "@/components/layout/footer";
import { HeaderRightSection } from "@/components/universal/UniversalAuthHeader";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PublicMobileLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

/**
 * PublicMobileLayout - Mobile layout for public pages
 * Features: Mobile-optimized navigation with bottom tabs, hamburger menu sidebar, and unified header
 */
export default function PublicMobileLayout({ children, showFooter = true }: PublicMobileLayoutProps) {
  const [location] = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Bottom navigation items for mobile - Unified across public pages
  const bottomNavItems = [
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


  // Determine if bottom navigation should be shown
  const shouldShowBottomNav = () => {
    // Hide on login/auth pages and admin pages
    const hideBottomNavPages = ['/login', '/admin', '/panel'];
    return !hideBottomNavPages.some(page => location.startsWith(page));
  };

  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header - Unified with WytNet Logo and Hamburger Menu */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-3 sm:px-4">
          <div className="flex justify-between items-center h-14">
            {/* Left side - Hamburger Menu + Logo */}
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
                  <nav className="flex-1 p-3 space-y-1">
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
                        <FolderOpen className="h-5 w-5" />
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
                    
                    {!!user && (
                      <>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                          My Workspace
                        </div>
                        <Link href="/u/me" onClick={() => setSidebarOpen(false)}>
                          <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <User className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">My Dashboard</span>
                          </div>
                        </Link>
                        <Link href="/u/me/wytapps" onClick={() => setSidebarOpen(false)}>
                          <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <FolderOpen className="h-5 w-5" />
                            <span className="font-medium">My Apps</span>
                          </div>
                        </Link>
                      </>
                    )}
                    
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                      More
                    </div>
                    <Link href="/about" onClick={() => setSidebarOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Info className="h-5 w-5" />
                        <span className="font-medium">About</span>
                      </div>
                    </Link>
                    <Link href="/help" onClick={() => setSidebarOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <HelpCircle className="h-5 w-5" />
                        <span className="font-medium">Help</span>
                      </div>
                    </Link>
                  </nav>
                  
                  {!!user && (
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
                  )}
                </SheetContent>
              </Sheet>
              
              {/* WytNet Logo */}
              <Link href="/" className="flex items-center" data-testid="mobile-logo">
                <img 
                  src="/wytnet-logo.png?v=2" 
                  alt="WytNet" 
                  className="h-7 w-auto transition-transform hover:scale-105"
                />
              </Link>
            </div>

            {/* Right side - Theme toggle + Notifications + User menu */}
            <div className="flex items-center gap-1">
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                data-testid="button-theme-toggle-mobile"
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600" />
                )}
              </Button>
              <HeaderRightSection />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("flex-1 overflow-y-auto overscroll-contain px-0 py-0", shouldShowBottomNav() ? "pb-20" : "pb-2")}>
        {children}
        
        {/* Footer - inside scrollable content */}
        {showFooter && <Footer />}
      </main>

      {/* Bottom Navigation - Touch-friendly 44px+ targets */}
      {shouldShowBottomNav() && (
        <nav className="flex-shrink-0 fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-inset-bottom">
          <div className="flex items-center justify-around py-1 px-1">
            {bottomNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex flex-col items-center justify-center min-h-[52px] min-w-[64px] px-3 py-2 rounded-xl transition-all active:scale-95",
                    item.active 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-sm" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  )}
                  data-testid={`bottom-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon className={cn("h-5 w-5 mb-0.5", item.active && "h-[22px] w-[22px]")} />
                  <span className={cn(
                    "text-[11px] font-medium truncate",
                    item.active && "font-semibold"
                  )}>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}