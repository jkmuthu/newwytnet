import { Button } from "@/components/ui/button";
import { Menu, Home, Bell, Search } from "lucide-react";
import { Link } from "wouter";
import NotificationBell from "@/components/notifications/NotificationBell";
import UniversalAuthHeader from "@/components/universal/UniversalAuthHeader";

interface HubAdminHeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

/**
 * HubAdminHeader - Header for WytNet.com Hub Admin portal
 * Features: Hub branding, content monitoring, hub admin profile management
 */
export default function HubAdminHeader({ 
  onToggleSidebar,
  sidebarCollapsed 
}: HubAdminHeaderProps) {

  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Hub Admin branding */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="text-blue-700 dark:text-blue-400"
              data-testid="button-toggle-sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Link href="/admin">
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-2">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    WytNet.com Hub Admin
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Content Management
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Right section - Notifications + Unified Auth Header */}
          <div className="flex items-center space-x-2">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Unified Auth Header with Panel Switcher */}
            <UniversalAuthHeader />
          </div>
        </div>
      </div>
    </header>
  );
}
