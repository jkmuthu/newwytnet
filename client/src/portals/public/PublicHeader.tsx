import { Link } from "wouter";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import UniversalAuthHeader from "@/components/universal/UniversalAuthHeader";

/**
 * PublicHeader - Navigation header for public pages
 * Uses UniversalAuthHeader for consistent layout
 * Layout: [Theme Toggle] [Home Icon] [Logo] [Nav Menus] [Notifications] [User Menu]
 */
export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Unified Auth Header (Theme Toggle + Home + Logo + Notifications + User) */}
          <div className="flex items-center">
            <UniversalAuthHeader 
              showThemeToggle={true}
              showHomeButton={true}
              showLogo={true}
              showNotifications={true}
              context="public"
            />
          </div>

          {/* Center: Desktop & Tablet Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {/* WytWall - Direct Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    WytWall
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* WytApps - Direct Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/wytapps" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    WytApps
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* WytHubs - Direct Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/wythubs" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    WytHubs
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* WytLife - Direct Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/wytlife" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    WytLife
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right: Empty placeholder for layout balance */}
          <div className="hidden md:block w-[200px]" />
        </div>
      </div>
    </header>
  );
}
