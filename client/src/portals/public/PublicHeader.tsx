import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Menu, Bell, User, Settings, LogOut, LayoutDashboard, Wrench, Smartphone, Wallet, UserCircle } from "lucide-react";
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
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const companyNavItems = [
    { label: "About", href: "/about" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ];

  const wytToolsNavItems = [
    { label: "QR Generator", href: "/qr-generator" },
    { label: "DISC Assessment", href: "/assessment" },
  ];

  const resourcesNavItems = [
    { label: "Help Center", href: "/help" },
    { label: "Documentation", href: "/docs" },
    { label: "API", href: "/api" },
    { label: "Status", href: "/status" },
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
        <div className="flex h-14 sm:h-16 items-center justify-between">
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
              {/* WytTools Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-gray-700 dark:text-gray-200 font-medium transition-all duration-200 hover:scale-105 hover:text-blue-600 dark:hover:text-blue-400">
                  WytTools
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {wytToolsNavItems.map((item) => (
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

              {/* AI Directory - Direct Link */}
              <NavigationMenuItem>
                <Link href="/ai-directory">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    AI Directory
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {/* WytApps - Direct Link */}
              <NavigationMenuItem>
                <Link href="/wytapps">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    WytApps
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side - Conditional Based on Auth Status */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {isAuthenticated ? (
              // Authenticated: Right to Left order - Hamburger menu, User DP, Notification Icon
              <>
                {/* Hamburger Menu - WytPanel Navigation */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      data-testid="button-hamburger-menu"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      WytPanel
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/panel/me/dashboard">
                      <DropdownMenuItem className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>My Dash</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/panel/me/wyttools">
                      <DropdownMenuItem className="cursor-pointer">
                        <Wrench className="mr-2 h-4 w-4" />
                        <span>My WytTools</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/panel/me/wytapps">
                      <DropdownMenuItem className="cursor-pointer">
                        <Smartphone className="mr-2 h-4 w-4" />
                        <span>My WytApps</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/panel/me/wallet">
                      <DropdownMenuItem className="cursor-pointer">
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>My Wallet</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/panel/me/account">
                      <DropdownMenuItem className="cursor-pointer">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                      </DropdownMenuItem>
                    </Link>
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

                {/* User Display Picture */}
                <Link href="/panel/me/profile">
                  <Button 
                    variant="ghost" 
                    className="relative h-8 w-8 rounded-full p-0 hover:scale-105 transition-transform"
                    data-testid="user-avatar"
                  >
                    <Avatar className="h-8 w-8">
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
                </Link>

                {/* Notification Icon */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                  data-testid="button-notifications"
                >
                  <Bell className="h-5 w-5" />
                  {/* Notification Badge */}
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">3</span>
                  </span>
                </Button>
              </>
            ) : (
              // Not Authenticated: Get WytPass Button, Access WytPanel
              <>
                <Link href="/panel" className="hidden sm:block">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    data-testid="button-access-panel"
                  >
                    <span className="hidden md:inline">Access WytPanel</span>
                    <span className="md:hidden">Panel</span>
                  </Button>
                </Link>
                <Link href="/wytpass-login">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
                    data-testid="button-get-wytpass"
                  >
                    <span className="hidden md:inline">Get WytPass</span>
                    <span className="md:hidden">WytPass</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}