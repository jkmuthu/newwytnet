import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Home, Moon, Sun } from "lucide-react";
import { Link } from "wouter";
import ContextAwareLogo from "@/components/shared/ContextAwareLogo";
import NotificationBell from "@/components/notifications/NotificationBell";
import UniversalAuthHeader from "@/components/universal/UniversalAuthHeader";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

/**
 * AdminHeader - Header for Engine admin portal
 * Features: Engine branding, system monitoring, admin profile management
 */
export default function AdminHeader({ 
  onToggleSidebar,
  sidebarCollapsed 
}: AdminHeaderProps) {
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage (Light mode as default)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark';
    
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Theme Toggle + Sidebar Toggle + Logo */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              data-testid="button-theme-toggle"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" />
              )}
            </Button>

            {/* Sidebar Toggle (Mobile) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden h-9 w-9 p-0"
              data-testid="toggle-admin-sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <ContextAwareLogo context="engine" className="h-8 w-auto" href="/engine" />
          </div>

          {/* Center section - System status indicator */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-3 py-1 bg-green-50 dark:bg-green-950 rounded-full">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                System Online
              </span>
            </div>
          </div>

          {/* Right section - Notifications + Unified Auth Header */}
          <div className="flex items-center space-x-2">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Quick Actions (kept minimal) */}
            <Link href="/">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0" data-testid="admin-home">
                <Home className="h-5 w-5" />
              </Button>
            </Link>

            {/* Unified Auth Header with Panel Switcher */}
            <UniversalAuthHeader />
          </div>
        </div>
      </div>
    </header>
  );
}