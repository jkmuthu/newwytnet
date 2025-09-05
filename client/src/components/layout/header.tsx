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
import { getEnabledModules, isModuleEnabled } from "@/utils/moduleStatus";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, isSuperAdmin } = useWhatsAppAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const enabledModules = getEnabledModules();

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
                      src="/wytnet-logo.png" 
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
                  {isModuleEnabled('ai-directory') && (
                    <Link href="/ai-directory" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                      <Bot className="h-5 w-5" />
                      <span>AI Directory</span>
                    </Link>
                  )}
                  
                  {/* WytTools Section - Show only if any tools are enabled */}
                  {(isModuleEnabled('qr-generator') || isModuleEnabled('assessment')) && (
                    <>
                      <div className="px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        WytTools
                      </div>
                      {isModuleEnabled('qr-generator') && (
                        <Link href="/qr-generator" className="flex items-center gap-3 px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                          <QrCode className="h-5 w-5" />
                          <span>QR Generator</span>
                        </Link>
                      )}
                      {isModuleEnabled('assessment') && (
                        <Link href="/assessment" className="flex items-center gap-3 px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                          <Activity className="h-5 w-5" />
                          <span>Disc Assess</span>
                        </Link>
                      )}
                    </>
                  )}
                  
                  {/* WytHubs Section - Show only if any hubs are enabled */}
                  {(isModuleEnabled('realbro') || isModuleEnabled('wytduty')) && (
                    <>
                      <div className="px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        WytHubs
                      </div>
                      {isModuleEnabled('realbro') && (
                        <Link href="/realbro" className="flex items-center gap-3 px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                          <Building className="h-5 w-5" />
                          <span>RealBRO</span>
                        </Link>
                      )}
                      {isModuleEnabled('wytduty') && (
                        <Link href="/wytduty" className="flex items-center gap-3 px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                          <Briefcase className="h-5 w-5" />
                          <span>WytDuty</span>
                        </Link>
                      )}
                    </>
                  )}
                  
                  <Link href="/wytapps" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Briefcase className="h-5 w-5" />
                    <span>WytApps</span>
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
                    src="/wytnet-logo.png" 
                    alt="WytNet - Multi-SaaS Engine" 
                    className="h-8 w-auto transition-transform hover:scale-105"
                  />
                </div>
              </Link>
            </div>
          </div>

          {/* Center section - Public Navigation */}
          <div className="hidden md:block flex-1 max-w-4xl mx-8">
            <nav className="flex items-center justify-center space-x-6">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium" data-testid="nav-home">
                Home
              </Link>
              {isModuleEnabled('ai-directory') && (
                <Link href="/ai-directory" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium" data-testid="nav-ai-directory">
                  AI Directory
                </Link>
              )}
              
              {/* WytTools Dropdown - Show only if any tools are enabled */}
              {(isModuleEnabled('qr-generator') || isModuleEnabled('assessment')) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium flex items-center" data-testid="dropdown-wyttools">
                      WytTools
                      <span className="ml-1">▼</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    {isModuleEnabled('qr-generator') && (
                      <DropdownMenuItem asChild>
                        <Link href="/qr-generator" className="flex items-center w-full" data-testid="link-qr-generator">
                          🔳 QR Generator
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {isModuleEnabled('assessment') && (
                      <DropdownMenuItem asChild>
                        <Link href="/assessment" className="flex items-center w-full" data-testid="link-disc-assess">
                          📊 Disc Assess
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* WytHubs Dropdown - Show only if any hubs are enabled */}
              {(isModuleEnabled('realbro') || isModuleEnabled('wytduty')) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium flex items-center" data-testid="dropdown-wythubs">
                      WytHubs
                      <span className="ml-1">▼</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    {isModuleEnabled('realbro') && (
                      <DropdownMenuItem asChild>
                        <Link href="/realbro" className="flex items-center w-full" data-testid="link-realbro">
                          🏠 RealBRO
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {isModuleEnabled('wytduty') && (
                      <DropdownMenuItem asChild>
                        <Link href="/wytduty" className="flex items-center w-full" data-testid="link-wytduty">
                          💼 WytDuty
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Link href="/wytapps" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium" data-testid="nav-wytapps">
                WytApps
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