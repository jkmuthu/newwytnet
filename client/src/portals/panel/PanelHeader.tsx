import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import type { WorkspaceContext } from "./PanelLayout";
import { HeaderLeftSection, HeaderRightSection } from "@/components/universal/UniversalAuthHeader";

interface PanelHeaderProps {
  currentWorkspace: WorkspaceContext;
  onWorkspaceChange: (workspace: WorkspaceContext) => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

/**
 * PanelHeader - Clean unified header for user panels
 * Layout: [Left: Theme + Home + Logo] [Right: Notifications + User + Sidebar Toggle]
 */
export default function PanelHeader({ 
  onToggleSidebar,
  sidebarCollapsed 
}: PanelHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-3 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Left: Theme Toggle + Home + Logo */}
          <HeaderLeftSection context="public" />

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
