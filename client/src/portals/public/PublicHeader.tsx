import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Menu, Bell, User, Settings, LogOut, LayoutDashboard, Wrench, Smartphone, Wallet, UserCircle, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * PublicHeader - Navigation header for public pages
 * Features: Marketing navigation, login/signup buttons, no admin features
 */
export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const wytHubsNavItems = [
    { label: "AI Directory", href: "/ai-directory" },
    { label: "WytLife", href: "/wytlife" },
  ];

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" data-testid="link-logo">
            <img 
              src="/wytnet-logo.png" 
              alt="WytNet" 
              className="h-8 w-auto transition-transform hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {/* WytWall - Direct Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    WytWall
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Features - Direct Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/features" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Features
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

              {/* WytHubs - Dropdown Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-gray-700 dark:text-gray-200 font-medium transition-all duration-200 hover:scale-105 hover:text-blue-600 dark:hover:text-blue-400">
                  WytHubs
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {wytHubsNavItems.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:scale-105 hover:shadow-md"
                          >
                            <div className="text-sm font-medium leading-none hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{item.label}</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side - Conditional Based on Auth Status */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              // Authenticated: Notification Icon → User DP → Theme Toggle
              <>
                {/* Notification Icon */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                  data-testid="button-notifications"
                >
                  <Bell className="h-5 w-5" />
                  {/* Notification Badge */}
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">3</span>
                  </span>
                </Button>

                {/* User Display Picture with Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-9 w-9 rounded-full p-0 hover:scale-105 transition-transform"
                      data-testid="user-avatar"
                    >
                      <Avatar className="h-9 w-9">
                        {user && typeof user === 'object' && 'profileImageUrl' in user && user.profileImageUrl && 
                         typeof user.profileImageUrl === 'string' ? (
                          <AvatarImage 
                            src={user.profileImageUrl} 
                            alt={(user && 'name' in user && typeof user.name === 'string' ? user.name : "User")} 
                          />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="cursor-pointer" asChild>
                      <Link href="/panel/me/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>My Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" asChild>
                      <Link href="/panel/me/wyttools">
                        <Wrench className="mr-2 h-4 w-4" />
                        <span>My WytTools</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" asChild>
                      <Link href="/panel/me/wytapps">
                        <Smartphone className="mr-2 h-4 w-4" />
                        <span>My WytApps</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" asChild>
                      <Link href="/panel/me/wallet">
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>My Wallet</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" asChild>
                      <Link href="/panel/me/account">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 dark:text-red-400"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{logoutMutation.isPending ? "Signing out..." : "Logout"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Toggle */}
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
              </>
            ) : (
              // Not Authenticated: Login/Join Button → Theme Toggle
              <>
                <Link href="/login">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md font-medium"
                    data-testid="button-login-join"
                  >
                    Login / Join
                  </Button>
                </Link>

                {/* Theme Toggle */}
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}