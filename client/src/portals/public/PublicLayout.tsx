import { ReactNode, useEffect, useState } from "react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import PublicHeader from "./PublicHeader";
import PublicMobileLayout from "./PublicMobileLayout";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface PublicLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

/**
 * PublicLayout - Layout for public-facing pages (marketing, login, tools)
 * Features: Marketing navigation, login/signup buttons, no admin features
 */
export default function PublicLayout({ children, showFooter = true }: PublicLayoutProps) {
  const { isMobile } = useDeviceDetection();
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Use mobile-specific layout for small screens
  if (isMobile) {
    return (
      <PublicMobileLayout showFooter={showFooter}>
        {/* Mobile Theme Toggle */}
        <Button
          onClick={toggleTheme}
          variant="outline"
          size="sm"
          className="fixed top-4 right-4 z-50 w-9 h-9 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
          data-testid="button-theme-toggle-mobile"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? (
            <Sun className="h-3.5 w-3.5 text-yellow-500" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-slate-600" />
          )}
        </Button>
        {children}
      </PublicMobileLayout>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PublicHeader />
      
      {/* Theme Toggle Button - Fixed Position */}
      <Button
        onClick={toggleTheme}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 w-10 h-10 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        data-testid="button-theme-toggle"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-yellow-500" />
        ) : (
          <Moon className="h-4 w-4 text-slate-600" />
        )}
      </Button>
      
      <main className="flex-1" role="main">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}