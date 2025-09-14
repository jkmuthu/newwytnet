import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Bot, Activity, QrCode, Briefcase, Wrench } from "lucide-react";
interface MobileLayoutProps {
  children: React.ReactNode;
  isMobile: boolean;
}

export default function MobileLayout({ children, isMobile }: MobileLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Bottom navigation items (exactly 4 as requested)
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
      label: "AI Directory",
      active: location === "/ai-directory"
    },
    {
      href: "/qr-generator",
      icon: Wrench,
      label: "WytTools",
      active: location === "/qr-generator" || location === "/assessment"
    },
    {
      href: "/wytapps",
      icon: Briefcase,
      label: "WytApps",
      active: location === "/wytapps"
    }
  ];

  // Sidebar items (only 3 working tools as requested)
  const sidebarItems = [
    { icon: Bot, label: 'AI Directory', href: '/ai-directory' },
    { icon: QrCode, label: 'QR Generator', href: '/qr-generator' },
    { icon: Activity, label: 'DISC Assessment', href: '/assessment' },
  ];

  // Don't render mobile layout for admin routes or if not mobile
  if (!isMobile || location.startsWith('/admin') || location.startsWith('/super-admin')) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transform-gpu will-change-transform">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Left */}
            <Link href="/" className="flex items-center" data-testid="mobile-logo">
              <img 
                src="/wytnet-logo.png" 
                alt="WytNet" 
                className="h-8 w-auto transition-transform hover:scale-105"
              />
            </Link>

            {/* Hamburger Menu - Right */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
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
                    WytPanel - All Tools
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-2">
                  {sidebarItems.map((item) => (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" 
                      onClick={() => setSidebarOpen(false)}
                      data-testid={`sidebar-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 transform-gpu will-change-transform">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div 
                className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${
                  item.active 
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                data-testid={`bottom-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}