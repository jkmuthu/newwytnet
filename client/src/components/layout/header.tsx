import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, Settings, LogOut, Home, Activity, Building, Briefcase, QrCode, Bot, BarChart, Brain, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, isSuperAdmin } = useWhatsAppAuth();
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
      // Redirect to home page
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

  const handleWhatsAppLogin = () => {
    window.location.href = '/whatsapp-auth';
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img 
                      src="/attached_assets/wyt-logo_1757064733529.png" 
                      alt="WytNet" 
                      className="h-6 w-auto"
                    />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-2">
                  <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                  <Link href="/assessment" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Activity className="h-5 w-5" />
                    <span>Assessment</span>
                  </Link>
                  <Link href="/realbro" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Building className="h-5 w-5" />
                    <span>RealBro</span>
                  </Link>
                  <Link href="/wytduty" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Briefcase className="h-5 w-5" />
                    <span>WytDuty</span>
                  </Link>
                  <Link href="/qr-generator" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <QrCode className="h-5 w-5" />
                    <span>QR Generator</span>
                  </Link>
                  <Link href="/ai-directory" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Bot className="h-5 w-5" />
                    <span>AI Directory</span>
                  </Link>
                  <Link href="/wytai-trademark" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700" onClick={() => setMobileMenuOpen(false)}>
                    <Brain className="h-5 w-5" />
                    <span>WytAi Trademark</span>
                  </Link>
                  <Link href="/search" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <span>🔍 Search</span>
                  </Link>
                  {isAuthenticated && (
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                      <BarChart className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            {onMenuClick && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMenuClick}
                className="lg:hidden"
                data-testid="button-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center" data-testid="link-logo">
                <div className="flex items-center space-x-2">
                  <img 
                    src="/attached_assets/wyt-logo_1757064733529.png" 
                    alt="WytNet - Multi-SaaS Engine" 
                    className="h-8 w-auto transition-transform hover:scale-105"
                  />
                </div>
              </Link>
            </div>
          </div>

          {/* Center section - Public Navigation */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <nav className="flex items-center justify-center space-x-6">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium" data-testid="nav-home">
                Home
              </Link>
              <Link href="/assessment" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium" data-testid="nav-assessment">
                Assessment
              </Link>
              <Link href="/realbro" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium" data-testid="nav-realbro">
                RealBro
              </Link>
              <Link href="/wytduty" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium" data-testid="nav-wytduty">
                WytDuty
              </Link>
              <Link href="/qr-generator" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium" data-testid="nav-qr-generator">
                QR Generator
              </Link>
              <Link href="/ai-directory" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium" data-testid="nav-ai-directory">
                AI Directory
              </Link>
              <Link href="/wytai-trademark" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-md border border-blue-200 dark:border-blue-700" data-testid="nav-wytai-trademark">
                WytAi Trademark
              </Link>
              <Link href="/search" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium" data-testid="nav-search">
                🔍 Search
              </Link>
              {isAuthenticated && (
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium" data-testid="nav-dashboard">
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`${isSuperAdmin ? 'bg-gradient-to-br from-red-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'} text-white`}>
                        {isSuperAdmin ? '🦸‍♂️' : getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium" data-testid="text-user-name">
                      {isSuperAdmin ? '🦸‍♂️ ' : ''}{user?.name}
                    </div>
                    <div className="text-gray-500 text-xs" data-testid="text-user-phone">
                      {user?.whatsappNumber}
                    </div>
                    <div className="text-gray-400 text-xs" data-testid="text-user-role">
                      {user?.role?.toUpperCase() || 'USER'}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="menu-item-profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="menu-item-settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-item-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button onClick={handleWhatsAppLogin} data-testid="button-whatsapp-login" className="bg-green-600 hover:bg-green-700 text-white">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WytPass Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}