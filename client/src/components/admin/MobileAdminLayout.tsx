import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X,
  Home,
  BarChart3,
  Users,
  Building2,
  Layers,
  Activity,
  Settings,
  Shield,
  Database,
  Monitor,
  Bell,
  Search,
  User,
  LogOut
} from 'lucide-react';

interface MobileAdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  color?: string;
}

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/super-admin', icon: Home },
  { title: 'Analytics', href: '/super-admin/analytics', icon: BarChart3 },
  { title: 'Users', href: '/super-admin/users', icon: Users, badge: 'new' },
  { title: 'Tenants', href: '/super-admin/tenants', icon: Building2 },
  { title: 'Modules', href: '/super-admin/modules', icon: Layers },
  { title: 'System', href: '/super-admin/system', icon: Monitor },
  { title: 'Database', href: '/super-admin/database', icon: Database },
  { title: 'Activity', href: '/super-admin/activity', icon: Activity },
  { title: 'Settings', href: '/super-admin/settings', icon: Settings },
];

export default function MobileAdminLayout({ children, title = "Super Admin", showBackButton = false }: MobileAdminLayoutProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentPath = location.split('?')[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transform-gpu will-change-transform">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Menu */}
          <div className="flex items-center space-x-3">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  data-testid="button-menu"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-6 w-6 text-blue-600" />
                      <span className="font-semibold text-lg">WytNet Admin</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMenuOpen(false)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Admin Profile */}
                  <div className="p-4 border-b bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Super Admin</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">admin@wytnet.com</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 p-4 space-y-1">
                    {adminNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentPath === item.href;
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div
                            className={cn(
                              "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                              isActive
                                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="h-5 text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Footer Actions */}
                  <div className="p-4 border-t space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Title */}
            <h1 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h1>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              data-testid="button-search"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-4 md:pb-0" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
        {children}
      </main>
    </div>
  );
}