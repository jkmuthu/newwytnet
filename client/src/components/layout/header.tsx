import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, User, Settings, LogOut, Home, Activity, Building, Briefcase, QrCode, Bot, BarChart, Brain, MessageCircle, Coins } from "lucide-react";
import { Link } from "wouter";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchEnabledPlatformModules } from "@/lib/api";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, isSuperAdmin } = useWhatsAppAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch enabled modules from API
  const { data: enabledModules = [] } = useQuery({
    queryKey: ['platform-modules', 'enabled'],
    queryFn: fetchEnabledPlatformModules,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Helper function to check if module is enabled
  const isModuleEnabled = (moduleId: string) => {
    return enabledModules.some(module => module.id === moduleId);
  };

  // Fetch WytPoints balance for authenticated WhatsApp users
  const { data: pointsBalance, isLoading: pointsLoading } = useQuery<{
    success: boolean;
    balance: number;
  }>({
    queryKey: ['/api/points/balance'],
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });

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
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center" data-testid="link-logo">
              <img 
                src="/wytnet-logo.png?v=2" 
                alt="WytNet" 
                className="h-8 w-auto transition-transform hover:scale-105"
              />
            </Link>
          </div>

          {/* Right section - Conditional Login/Join OR User Menu */}
          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              /* Show Login/Join Button when NOT authenticated */
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/login'}
                className="inline-flex"
                data-testid="button-login"
              >
                Login / Join
              </Button>
            ) : (
              /* Show WytPoints balance and User Panel Menu when AUTHENTICATED */
              <>
                {/* WytPoints Balance Badge */}
                {pointsBalance && pointsBalance.success && (
                  <Badge 
                    variant="outline" 
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    data-testid="badge-wytpoints-balance"
                  >
                    <Coins className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-semibold">{pointsBalance.balance}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">WytPoints</span>
                  </Badge>
                )}
                
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    data-testid="button-user-menu"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img 
                      src="/wytnet-logo.png?v=2" 
                      alt="WytNet" 
                      className="h-6 w-auto"
                    />
                    <span>Menu</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-2">
                  {/* User Info Section */}
                  {user && (
                    <div className="px-3 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.role || 'User'}
                          </p>
                        </div>
                      </div>
                      
                      {/* WytPoints Balance */}
                      {pointsBalance && pointsBalance.success && (
                        <div className="flex items-center justify-between px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">WytPoints</span>
                          </div>
                          <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400" data-testid="text-wytpoints-balance">
                            {pointsBalance.balance}
                          </span>
                        </div>
                      )}
                      {pointsLoading && (
                        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <span className="text-sm text-gray-500">Loading points...</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    User Dashboard
                  </div>
                  
                  <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Activity className="h-5 w-5" />
                    <span>My Dashboard</span>
                  </Link>
                  
                  <div className="px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 mt-4">
                    Available Apps
                  </div>
                  
                  <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                  
                  <Link href="/a/wytqrc" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <QrCode className="h-5 w-5" />
                    <span>QR Generator</span>
                  </Link>
                  
                  <Link href="/a/wytassessor" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Activity className="h-5 w-5" />
                    <span>DISC Assessment</span>
                  </Link>
                  
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
                  
                  {/* Logout Section */}
                  {isAuthenticated && (
                    <>
                      <div className="px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 mt-4 border-t pt-4">
                        Account
                      </div>
                      <button 
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 w-full text-left"
                        data-testid="button-logout"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </>
                  )}
                </nav>
              </SheetContent>
                </Sheet>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}