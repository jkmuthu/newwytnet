import { Button } from "@/components/ui/button";
import { Menu, User, ChevronLeft, ChevronRight, Search, Bell, Building } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { WorkspaceContext } from "./PanelLayout";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/notifications/NotificationBell";
import UniversalAuthHeader from "@/components/universal/UniversalAuthHeader";

interface PanelHeaderProps {
  currentWorkspace: WorkspaceContext;
  onWorkspaceChange: (workspace: WorkspaceContext) => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

/**
 * PanelHeader - Redesigned header with logo, panel switcher, and responsive design
 * Features: WytNet logo, My Panel/Org Panel switcher, sidebar toggle, search, notifications, user menu
 */
export default function PanelHeader({ 
  currentWorkspace, 
  onWorkspaceChange, 
  onToggleSidebar,
  sidebarCollapsed 
}: PanelHeaderProps) {
  const [location, setLocation] = useLocation();

  // Determine active panel based on current location
  const isMyPanel = location.includes('/mypanel') || (!location.includes('/orgpanel') && !location.includes('/panel/org'));
  const isOrgPanel = location.includes('/orgpanel') || location.includes('/panel/org');

  const switchToMyPanel = () => {
    onWorkspaceChange({
      type: 'personal',
      id: 'me',
      name: 'My Panel'
    });
    setLocation('/mypanel');
  };

  const switchToOrgPanel = () => {
    onWorkspaceChange({
      type: 'organization',
      id: 'org',
      name: 'Org Panel'
    });
    setLocation('/orgpanel');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-3 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Left section - Logo + Panel Switcher + Collapse */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* WytNet Logo */}
            <Link href="/mypanel">
              <div className="flex items-center gap-2 cursor-pointer shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-lg">W</span>
                </div>
                <span className="hidden sm:block text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  WytNet
                </span>
              </div>
            </Link>

            {/* Panel Switcher */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={isMyPanel ? 'default' : 'ghost'}
                size="sm"
                onClick={switchToMyPanel}
                className={cn(
                  "h-8 text-xs sm:text-sm px-2 sm:px-4",
                  isMyPanel && "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                data-testid="switch-my-panel"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xs:inline">My Panel</span>
                <span className="xs:hidden">My</span>
              </Button>
              <Button
                variant={isOrgPanel ? 'default' : 'ghost'}
                size="sm"
                onClick={switchToOrgPanel}
                className={cn(
                  "h-8 text-xs sm:text-sm px-2 sm:px-4",
                  isOrgPanel && "bg-green-600 hover:bg-green-700 text-white"
                )}
                data-testid="switch-org-panel"
              >
                <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xs:inline">Org Panel</span>
                <span className="xs:hidden">Org</span>
              </Button>
            </div>

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

            {/* Unified Auth Header with Panel Switcher */}
            <UniversalAuthHeader />
          </div>
        </div>
      </div>
    </header>
  );
}
