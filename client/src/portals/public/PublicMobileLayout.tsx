import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Bot, Activity, QrCode, Grid3x3, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/footer";
import UniversalAuthHeader from "@/components/universal/UniversalAuthHeader";

interface PublicMobileLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

/**
 * PublicMobileLayout - Mobile layout for public pages
 * Features: Mobile-optimized navigation with bottom tabs and side menu
 */
export default function PublicMobileLayout({ children, showFooter = true }: PublicMobileLayoutProps) {
  const [location] = useLocation();

  // Bottom navigation items for mobile
  const bottomNavItems = [
    {
      href: "/",
      icon: Home,
      label: "WytWall",
      active: location === "/"
    },
    {
      href: "/wytapps",
      icon: Grid3x3,
      label: "WytApps",
      active: location === "/wytapps"
    },
    {
      href: "/wytlife",
      icon: Activity,
      label: "WytLife",
      active: location === "/wytlife"
    },
    {
      href: "/qr-generator", 
      icon: QrCode,
      label: "Tools",
      active: location === "/qr-generator" || location === "/assessment" || location === "/wytai-trademark"
    }
  ];

  // Sidebar items for mobile menu
  const sidebarItems = [
    { icon: QrCode, label: 'QR Generator', href: '/qr-generator' },
    { icon: Activity, label: 'DISC Assessment', href: '/assessment' },
    { icon: Grid3x3, label: 'Other WytApps', href: '/wytapps' },
    { icon: Activity, label: 'WytLife', href: '/wytlife' },
    { icon: Smartphone, label: 'Install App', href: '/mobile-app' },
  ];

  // Determine if bottom navigation should be shown
  const shouldShowBottomNav = () => {
    // Hide on login/auth pages and admin pages
    const hideBottomNavPages = ['/login', '/admin', '/panel'];
    return !hideBottomNavPages.some(page => location.startsWith(page));
  };

  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-3 sm:px-4">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center" data-testid="mobile-logo">
              <img 
                src="/wytnet-logo.png?v=2" 
                alt="WytNet" 
                className="h-8 w-auto transition-transform hover:scale-105"
              />
            </Link>

            {/* Right side - Universal Auth only */}
            <div className="flex items-center gap-2">
              {/* Universal Authentication with integrated menu */}
              <UniversalAuthHeader sidebarItems={sidebarItems} />
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

      {/* Bottom Navigation */}
      {shouldShowBottomNav() && (
        <nav className="flex-shrink-0 fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-inset-bottom">
          <div className="flex items-center justify-around py-1.5 sm:py-2">
            {bottomNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex flex-col items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors min-w-[60px]",
                    item.active 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                  data-testid={`bottom-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon className="h-5 w-5 sm:h-5 sm:w-5" />
                  <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium truncate max-w-[65px]">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}