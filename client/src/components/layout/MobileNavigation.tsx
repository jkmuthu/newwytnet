import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Home, 
  Search, 
  User, 
  Settings, 
  Activity,
  Building,
  Briefcase,
  QrCode,
  Bot,
  Brain,
  BarChart3,
  Bell,
  MessageCircle,
  Shield,
  Users,
  Database,
  Smartphone
} from 'lucide-react';
import { useWhatsAppAuth } from '@/hooks/useWhatsAppAuth';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

export default function MobileNavigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, isSuperAdmin } = useWhatsAppAuth();
  const { isMobile, touchEnabled } = useDeviceDetection();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const publicNavItems = [
    { icon: Bot, label: 'AI Directory', href: '/ai-directory', badge: 'LIVE' },
    { icon: QrCode, label: 'QR Generator', href: '/qr-generator', badge: 'LIVE' },
    { icon: Activity, label: 'DISC Assessment', href: '/assessment', badge: 'LIVE' },
    { icon: Smartphone, label: 'Install App', href: '/mobile-app', badge: null },
  ];

  const dashboardItems = isAuthenticated ? [
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard', badge: null },
  ] : [];

  const superAdminItems = isSuperAdmin ? [
    { icon: Shield, label: 'System Overview', href: '/system-overview', badge: null },
    { icon: Settings, label: 'Global Settings', href: '/global-settings', badge: null },
    { icon: Users, label: 'All Users', href: '/users', badge: null },
    { icon: Database, label: 'WytPass Management', href: '/wytpass', badge: null },
  ] : [];

  const allItems = [...publicNavItems, ...dashboardItems, ...superAdminItems];

  const getUserInitials = (user: any) => {
    if (!user?.name) return 'U';
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.name[0]?.toUpperCase() || 'U';
  };

  if (!isMobile) return null;

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="/wytnet-logo.png" 
            alt="WytNet" 
            className="h-8 w-auto transition-transform hover:scale-105"
          />
        </Link>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          {isAuthenticated && (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">3</Badge>
            </Button>
          )}

          {/* Profile/Login */}
          {isAuthenticated && user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(true)}
              className="relative"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className={`${isSuperAdmin ? 'bg-gradient-to-br from-red-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'} text-white text-sm`}>
                  {isSuperAdmin ? '🦸‍♂️' : getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
            </Button>
          ) : (
            <Link href="/whatsapp-auth">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                <MessageCircle className="h-4 w-4 mr-1" />
                Login
              </Button>
            </Link>
          )}

          {/* Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMenuOpen(true)}
            data-testid="mobile-menu-trigger"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>


      {/* Mobile Menu Sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-80 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left">Navigation Menu</SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-full">
            <nav className="flex-1 overflow-auto p-4">
              <div className="space-y-1">
                {allItems.map((item, index) => (
                  <Link key={index} href={item.href} onClick={() => setMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start h-12 ${
                        location === item.href ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="border-t p-4 space-y-2">
              <Link href="/mobile-app" onClick={() => setMenuOpen(false)}>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2 mb-3"
                  data-testid="button-install-app-menu"
                >
                  <Smartphone className="h-4 w-4" />
                  Install App
                </Button>
              </Link>
              <div className="text-center text-sm text-gray-500">
                WytNet Multi-SaaS Platform
              </div>
              <div className="text-center text-xs text-gray-400">
                Version 2.0 • Made with ❤️
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Profile Bottom Sheet */}
      {isAuthenticated && user && (
        <BottomSheet open={profileOpen} onOpenChange={setProfileOpen}>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={`${isSuperAdmin ? 'bg-gradient-to-br from-red-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'} text-white`}>
                  {isSuperAdmin ? '🦸‍♂️' : getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">
                  {isSuperAdmin ? '🦸‍♂️ ' : ''}{user.name}
                </div>
                <div className="text-sm text-gray-500">{user.phone || user.email || 'User'}</div>
                <div className="text-xs text-gray-400">{user.role?.toUpperCase()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>

            <Link href="/mobile-app" onClick={() => setProfileOpen(false)}>
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 mb-2"
                data-testid="button-install-app"
              >
                <Smartphone className="h-4 w-4" />
                Install App
              </Button>
            </Link>

            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => {
                // Implement logout
                window.location.href = '/api/auth/whatsapp/logout';
              }}
            >
              Logout
            </Button>
          </div>
        </BottomSheet>
      )}

    </>
  );
}