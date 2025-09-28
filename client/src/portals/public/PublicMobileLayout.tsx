import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Bot, Activity, QrCode, Briefcase, Wrench, Smartphone, Info, HelpCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/footer";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Bottom navigation items for mobile
  const bottomNavItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      active: location === "/"
    },
    {
      href: "/ai-directory", 
      icon: Bot,
      label: "AI Tools",
      active: location === "/ai-directory"
    },
    {
      href: "/qr-generator",
      icon: Wrench,
      label: "Tools",
      active: location.startsWith("/qr-generator") || location.startsWith("/assessment")
    },
    {
      href: "/wytapps",
      icon: Briefcase,
      label: "WytApps",
      active: location === "/wytapps"
    }
  ];

  // Sidebar items for mobile menu
  const sidebarItems = [
    { 
      section: "WytTools",
      items: [
        { icon: Bot, label: 'AI Directory', href: '/ai-directory' },
        { icon: QrCode, label: 'QR Generator', href: '/qr-generator' },
        { icon: Activity, label: 'DISC Assessment', href: '/assessment' },
        { icon: Briefcase, label: 'Trademark Tools', href: '/wytai-trademark' },
        { icon: Smartphone, label: 'Property Tools', href: '/realbro' },
      ]
    },
    { 
      section: "WytApps & More",
      items: [
        { icon: Briefcase, label: 'WytApps', href: '/wytapps' },
        { icon: Smartphone, label: 'Install App', href: '/mobile-app' },
        { icon: Info, label: 'About Us', href: '/about' },
        { icon: Phone, label: 'Contact', href: '/contact' },
        { icon: HelpCircle, label: 'Help', href: '/help' },
      ]
    }
  ];

  // Determine if bottom navigation should be shown
  const shouldShowBottomNav = () => {
    // Hide on login/auth pages and admin pages
    const hideBottomNavPages = ['/login', '/admin', '/panel'];
    return !hideBottomNavPages.some(page => location.startsWith(page));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center" data-testid="mobile-logo">
              <img 
                src="/wytnet-logo.png" 
                alt="WytNet" 
                className="h-8 w-auto transition-transform hover:scale-105"
              />
            </Link>

            {/* Right side - Login/Join + Menu */}
            <div className="flex items-center gap-2">
              {/* Access Buttons */}
              <div className="flex items-center gap-1">
                <Link href="/panel">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs px-2 py-1 text-gray-700 dark:text-gray-200"
                    data-testid="mobile-access-panel-button"
                  >
                    WytPanel
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    size="sm"
                    className="text-xs px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    data-testid="mobile-get-wytpass-button"
                  >
                    WytPass
                  </Button>
                </Link>
              </div>
              
              {/* Hamburger Menu */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-700 dark:text-gray-200"
                    data-testid="mobile-menu-trigger"
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
                      WytNet - All Tools
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 space-y-4">
                    {sidebarItems.map((section) => (
                      <div key={section.section}>
                        <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {section.section}
                        </h3>
                        <div className="mt-2 space-y-1">
                          {section.items.map((item) => (
                            <Link 
                              key={item.href}
                              href={item.href} 
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200" 
                              onClick={() => setSidebarOpen(false)}
                              data-testid={`sidebar-${item.label.toLowerCase().replace(' ', '-')}`}
                            >
                              <item.icon className="h-5 w-5" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("flex-1", shouldShowBottomNav() ? "pb-20" : "")}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {shouldShowBottomNav() && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center justify-around py-2">
            {bottomNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex flex-col items-center px-4 py-2 rounded-lg transition-colors",
                    item.active 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                  data-testid={`bottom-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}