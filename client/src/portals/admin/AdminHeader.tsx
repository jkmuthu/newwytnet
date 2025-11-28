import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { HeaderLeftSection, HeaderRightSection } from "@/components/universal/UniversalAuthHeader";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

/**
 * AdminHeader - Header for Engine admin portal
 * Layout: [Left: Theme + Home + Logo] [Center: System Status] [Right: Notifications + User + Sidebar Toggle]
 */
export default function AdminHeader({ 
  onToggleSidebar,
  sidebarCollapsed 
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="px-4 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Left: Theme Toggle + Home + Logo */}
          <HeaderLeftSection context="engine" />

          {/* Center: System status indicator */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-950 rounded-full">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                System Online
              </span>
            </div>
          </div>

          {/* Right: Notifications + User Menu + Sidebar Toggle */}
          <div className="flex items-center gap-1 sm:gap-2">
            <HeaderRightSection />
            
            {/* Sidebar Collapse Toggle (Desktop only) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="hidden lg:flex h-9 w-9 p-0"
              data-testid="toggle-collapse"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden h-9 w-9 p-0"
              data-testid="toggle-admin-sidebar"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
