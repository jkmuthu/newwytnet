import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  Home, 
  User, 
  Settings, 
  FolderOpen, 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  FileText,
  Building,
  Users,
  CreditCard,
  Shield,
  ShoppingCart,
  Package,
  Award
} from "lucide-react";
import type { WorkspaceContext } from "./PanelLayout";

interface PanelSidebarProps {
  currentWorkspace: WorkspaceContext;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * PanelSidebar - Navigation sidebar for user workspaces
 * Features: Context-aware navigation based on personal vs organization workspace
 */
export default function PanelSidebar({ currentWorkspace, collapsed, onToggleCollapse }: PanelSidebarProps) {
  const [location] = useLocation();

  // Navigation items based on workspace context
  const getNavigationItems = () => {
    if (currentWorkspace.type === 'personal') {
      // MyPanel Navigation
      return [
        {
          section: "MyPanel",
          items: [
            { 
              label: "My Dashboard", 
              icon: Home, 
              href: "/mypanel", 
              active: location === "/mypanel" || location === "/mypanel/dashboard"
            },
            { 
              label: "My WytWall", 
              icon: Home, 
              href: "/mypanel/wytwall", 
              active: location === "/mypanel/wytwall" 
            },
            { 
              label: "My Needs", 
              icon: ShoppingCart, 
              href: "/mypanel/needs", 
              active: location === "/mypanel/needs" 
            },
            { 
              label: "My Offers", 
              icon: Package, 
              href: "/mypanel/offers", 
              active: location === "/mypanel/offers" 
            },
            { 
              label: "My Duties", 
              icon: FileText, 
              href: "/mypanel/duties", 
              active: location === "/mypanel/duties" 
            },
            { 
              label: "My WytScore", 
              icon: BarChart3, 
              href: "/mypanel/wytscore", 
              active: location === "/mypanel/wytscore" 
            },
            { 
              label: "My Circle", 
              icon: Users, 
              href: "/mypanel/circle", 
              active: location === "/mypanel/circle" 
            },
            { 
              label: "My WytWallet", 
              icon: CreditCard, 
              href: "/mypanel/wallet", 
              active: location === "/mypanel/wallet" 
            },
            { 
              label: "My Points", 
              icon: Award, 
              href: "/mypanel/points", 
              active: location === "/mypanel/points" 
            },
            { 
              label: "My WytApps", 
              icon: Package, 
              href: "/mypanel/wytapps", 
              active: location === "/mypanel/wytapps" 
            },
            { 
              label: "My WytHubs", 
              icon: Building, 
              href: "/mypanel/wythubs", 
              active: location === "/mypanel/wythubs" 
            },
            { 
              label: "My WytGames", 
              icon: Calendar, 
              href: "/mypanel/wytgames", 
              active: location === "/mypanel/wytgames" 
            },
            { 
              label: "My Profile", 
              icon: User, 
              href: "/mypanel/profile", 
              active: location === "/mypanel/profile" 
            },
            { 
              label: "My Account", 
              icon: Settings, 
              href: "/mypanel/account", 
              active: location === "/mypanel/account" 
            },
          ]
        }
      ];
    } else {
      // OrgPanel Navigation
      return [
        {
          section: "OrgPanel",
          items: [
            { 
              label: "Our Dashboard", 
              icon: Building, 
              href: "/orgpanel", 
              active: location === "/orgpanel" || location === "/orgpanel/dashboard"
            },
            { 
              label: "Our WytWall", 
              icon: Building, 
              href: "/orgpanel/wytwall", 
              active: location === "/orgpanel/wytwall" 
            },
            { 
              label: "Our Needs", 
              icon: ShoppingCart, 
              href: "/orgpanel/needs", 
              active: location === "/orgpanel/needs" 
            },
            { 
              label: "Our Offers", 
              icon: Package, 
              href: "/orgpanel/offers", 
              active: location === "/orgpanel/offers" 
            },
            { 
              label: "Our Duties", 
              icon: FileText, 
              href: "/orgpanel/duties", 
              active: location === "/orgpanel/duties" 
            },
            { 
              label: "Our WytApps", 
              icon: Package, 
              href: "/orgpanel/wytapps", 
              active: location === "/orgpanel/wytapps" 
            },
            { 
              label: "Our WytWallet", 
              icon: CreditCard, 
              href: "/orgpanel/wallet", 
              active: location === "/orgpanel/wallet" 
            },
            { 
              label: "Our Team", 
              icon: Users, 
              href: "/orgpanel/team", 
              active: location === "/orgpanel/team" 
            },
            { 
              label: "Our Profile", 
              icon: User, 
              href: "/orgpanel/profile", 
              active: location === "/orgpanel/profile" 
            },
            { 
              label: "Our Account", 
              icon: Settings, 
              href: "/orgpanel/account", 
              active: location === "/orgpanel/account" 
            },
          ]
        }
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className={cn(
      "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              {currentWorkspace.type === 'personal' ? (
                <User className="h-5 w-5 text-blue-600" />
              ) : (
                <Building className="h-5 w-5 text-green-600" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">
                {currentWorkspace.name}
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hidden lg:flex"
            data-testid="collapse-sidebar"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-6">
            {navigationItems.map((section) => (
              <div key={section.section}>
                {!collapsed && (
                  <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {section.section}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={item.active ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-10",
                          collapsed ? "px-2" : "px-3",
                          item.active && "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                        )}
                        data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 flex-shrink-0",
                          collapsed ? "" : "mr-3",
                          item.active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                        )} />
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Workspace info footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {currentWorkspace.type === 'personal' ? 'Personal Workspace' : 'Organization Workspace'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}