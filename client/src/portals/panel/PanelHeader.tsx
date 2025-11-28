import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { WorkspaceContext } from "./PanelLayout";
import NotificationBell from "@/components/notifications/NotificationBell";
import UniversalAuthHeader from "@/components/universal/UniversalAuthHeader";

interface PanelHeaderProps {
  currentWorkspace: WorkspaceContext;
  onWorkspaceChange: (workspace: WorkspaceContext) => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

/**
 * PanelHeader - Clean header with logo, notifications, and user menu
 * Features: WytNet logo, sidebar toggle, notifications, user menu
 */
export default function PanelHeader({ 
  onToggleSidebar,
  sidebarCollapsed 
}: PanelHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-3 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Left section - Logo + Collapse Toggle */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* WytNet Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer shrink-0">
                <img 
                  src="/wytnet-logo.png?v=2" 
                  alt="WytNet" 
                  className="h-8 w-auto transition-transform hover:scale-105"
                />
              </div>
            </Link>

            {/* Sidebar Collapse Toggle (Desktop only) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="hidden lg:flex h-8 w-8 p-0 shrink-0"
              data-testid="toggle-collapse"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Right section - Actions + Unified Auth Header */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Notifications */}
            <NotificationBell />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden h-8 w-8 p-0"
              data-testid="toggle-sidebar-mobile"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Unified Auth Header */}
            <UniversalAuthHeader />
          </div>
        </div>
      </div>
    </header>
  );
}
