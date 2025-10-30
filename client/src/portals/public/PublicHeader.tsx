import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Moon, Sun } from "lucide-react";
import UniversalAuthHeader from "@/components/universal/UniversalAuthHeader";
import ContextAwareLogo from "@/components/shared/ContextAwareLogo";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useQuery } from "@tanstack/react-query";

interface Context {
  type: 'engine_admin' | 'hub_admin' | 'user';
  name: string;
  path: string;
  active: boolean;
}

interface ContextsResponse {
  contexts: Context[];
  count: number;
}

/**
 * PublicHeader - Navigation header for public pages
 * Features: Marketing navigation, login/signup buttons, enterprise session management
 * Unified design: Theme toggle (left) | Logo (center) | Nav | Notifications + User menu (right)
 */
export default function PublicHeader() {
  const [isDark, setIsDark] = useState(false);
  
  // Check if user is authenticated
  const { data: contextsData } = useQuery<ContextsResponse>({
    queryKey: ["/api/auth/contexts"],
    retry: false,
    refetchOnWindowFocus: true,
  });

  const hasAuth = (contextsData?.contexts?.length || 0) > 0;

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Theme Toggle */}
          <div className="flex items-center">
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
          </div>

          {/* Center: Logo */}
          <div className="flex items-center flex-shrink-0">
            <ContextAwareLogo context="public" className="h-8 w-auto" href="/" />
          </div>

          {/* Desktop & Tablet Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {/* WytWall - Direct Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    WytWall
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* WytApps - Direct Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/wytapps" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    WytApps
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* WytLife - Direct Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/wytlife" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    WytLife
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right: Notifications + User Menu */}
          <div className="flex items-center gap-2">
            {hasAuth && <NotificationBell />}
            <UniversalAuthHeader />
          </div>
        </div>
      </div>
    </header>
  );
}
