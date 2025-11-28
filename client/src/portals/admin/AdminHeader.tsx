import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import UniversalAuthHeader from "@/components/universal/UniversalAuthHeader";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

/**
 * AdminHeader - Header for Engine admin portal
 * Uses UniversalAuthHeader for consistent layout across all panels
 * Layout: [Theme Toggle] [Home Icon] [Logo] [Notifications] [User Menu] | [System Status] | [Sidebar Toggle]
 */
export default function AdminHeader({ 
  onToggleSidebar,
  sidebarCollapsed 
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Unified Auth Header + Sidebar Toggle */}
          <div className="flex items-center space-x-3">
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

            {/* Unified Auth Header with all controls */}
            <UniversalAuthHeader 
              showThemeToggle={true}
              showHomeButton={true}
              showLogo={true}
              showNotifications={true}
              context="engine"
            />
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

          {/* Right section - Empty (all controls are in UniversalAuthHeader now) */}
          <div className="hidden md:block" />
        </div>
      </div>
    </header>
  );
}
