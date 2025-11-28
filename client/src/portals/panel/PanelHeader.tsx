import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import type { WorkspaceContext } from "./PanelLayout";
import UniversalAuthHeader from "@/components/universal/UniversalAuthHeader";

interface PanelHeaderProps {
  currentWorkspace: WorkspaceContext;
  onWorkspaceChange: (workspace: WorkspaceContext) => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

/**
 * PanelHeader - Clean unified header for user panels
 * Layout: [Theme Toggle] [Home Icon] [Logo] [Notifications] [User Menu] | [Sidebar Toggle]
 */
export default function PanelHeader({ 
  onToggleSidebar,
  sidebarCollapsed 
}: PanelHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-3 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Left section - Unified Auth Header with all controls */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <UniversalAuthHeader 
              showThemeToggle={true}
              showHomeButton={true}
              showLogo={true}
              showNotifications={true}
              context="public"
            />
            
            {/* Sidebar Collapse Toggle (Desktop only) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="hidden lg:flex h-8 w-8 p-0 shrink-0 ml-2"
              data-testid="toggle-collapse"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Right section - Mobile Menu Toggle only */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="h-8 w-8 p-0"
              data-testid="toggle-sidebar-mobile"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
