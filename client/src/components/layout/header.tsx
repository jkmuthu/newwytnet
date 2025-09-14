import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, Settings, LogOut, Home, Activity, Building, Briefcase, QrCode, Bot, BarChart, Brain, MessageCircle } from "lucide-react";
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
                src="/wytnet-logo.png" 
                alt="WytNet" 
                className="h-8 w-auto transition-transform hover:scale-105"
              />
            </Link>
          </div>

          {/* Right section - Login Button & Hamburger Menu */}
          <div className="flex items-center space-x-3">
            {/* Login/Join Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/login'}
              className="hidden sm:inline-flex"
              data-testid="button-login"
            >
              Login / Join
            </Button>
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
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
                  <div className="px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    WytPanel - All Tools
                  </div>
                  
                  <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                  
                  <Link href="/ai-directory" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Bot className="h-5 w-5" />
                    <span>AI Directory</span>
                  </Link>
                  
                  <Link href="/qr-generator" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <QrCode className="h-5 w-5" />
                    <span>QR Generator</span>
                  </Link>
                  
                  <Link href="/assessment" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
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
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}