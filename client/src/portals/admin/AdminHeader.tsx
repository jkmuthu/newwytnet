import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { HeaderLeftSection, HeaderRightSection } from "@/components/universal/UniversalAuthHeader";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

/**
 * AdminHeader - Unified header for Engine admin portal
 * Layout: [Left: Theme + Home + Logo] [Center: Nav Menus + System Status] [Right: Notifications + User + Sidebar Toggle]
 */
export default function AdminHeader({ 
  onToggleSidebar,
  sidebarCollapsed 
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="px-3 sm:px-4 lg:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Left: Theme Toggle + Home + Logo */}
          <HeaderLeftSection context="engine" />

          {/* Center: Navigation Menus + System Status (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 flex-1 justify-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-0.5 lg:gap-1">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/" className="inline-flex h-9 items-center justify-center rounded-md bg-transparent px-2.5 lg:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400">
                      WytWall
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/wytapps" className="inline-flex h-9 items-center justify-center rounded-md bg-transparent px-2.5 lg:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400">
                      WytApps
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/wythubs" className="inline-flex h-9 items-center justify-center rounded-md bg-transparent px-2.5 lg:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400">
                      WytHubs
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/wytlife" className="inline-flex h-9 items-center justify-center rounded-md bg-transparent px-2.5 lg:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400">
                      WytLife
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* System status indicator */}
            <div className="hidden lg:flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-950 rounded-full">
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
