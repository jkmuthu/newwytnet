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
  Shield
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
      return [
        {
          section: "Personal",
          items: [
            { 
              label: "Dashboard", 
              icon: Home, 
              href: "/panel/me", 
              active: location === "/panel/me" || location === "/panel/me/dashboard" 
            },
            { 
              label: "Profile", 
              icon: User, 
              href: "/panel/me/profile", 
              active: location === "/panel/me/profile" 
            },
            { 
              label: "Projects", 
              icon: FolderOpen, 
              href: "/panel/me/projects", 
              active: location === "/panel/me/projects" 
            },
            { 
              label: "Analytics", 
              icon: BarChart3, 
              href: "/panel/me/analytics", 
              active: location === "/panel/me/analytics" 
            },
            { 
              label: "Calendar", 
              icon: Calendar, 
              href: "/panel/me/calendar", 
              active: location === "/panel/me/calendar" 
            },
          ]
        },
        {
          section: "Tools",
          items: [
            { 
              label: "Documents", 
              icon: FileText, 
              href: "/panel/me/documents", 
              active: location === "/panel/me/documents" 
            },
            { 
              label: "Messages", 
              icon: MessageSquare, 
              href: "/panel/me/messages", 
              active: location === "/panel/me/messages" 
            },
          ]
        },
        {
          section: "Account",
          items: [
            { 
              label: "Settings", 
              icon: Settings, 
              href: "/panel/me/settings", 
              active: location === "/panel/me/settings" 
            },
          ]
        }
      ];
    } else {
      // Organization workspace navigation
      return [
        {
          section: "Organization",
          items: [
            { 
              label: "Dashboard", 
              icon: Building, 
              href: `/panel/org/${currentWorkspace.orgId}`, 
              active: location === `/panel/org/${currentWorkspace.orgId}` 
            },
            { 
              label: "Members", 
              icon: Users, 
              href: `/panel/org/${currentWorkspace.orgId}/members`, 
              active: location === `/panel/org/${currentWorkspace.orgId}/members` 
            },
            { 
              label: "Projects", 
              icon: FolderOpen, 
              href: `/panel/org/${currentWorkspace.orgId}/projects`, 
              active: location === `/panel/org/${currentWorkspace.orgId}/projects` 
            },
            { 
              label: "Analytics", 
              icon: BarChart3, 
              href: `/panel/org/${currentWorkspace.orgId}/analytics`, 
              active: location === `/panel/org/${currentWorkspace.orgId}/analytics` 
            },
          ]
        },
        {
          section: "Management",
          items: [
            { 
              label: "Billing", 
              icon: CreditCard, 
              href: `/panel/org/${currentWorkspace.orgId}/billing`, 
              active: location === `/panel/org/${currentWorkspace.orgId}/billing` 
            },
            { 
              label: "Security", 
              icon: Shield, 
              href: `/panel/org/${currentWorkspace.orgId}/security`, 
              active: location === `/panel/org/${currentWorkspace.orgId}/security` 
            },
            { 
              label: "Settings", 
              icon: Settings, 
              href: `/panel/org/${currentWorkspace.orgId}/settings`, 
              active: location === `/panel/org/${currentWorkspace.orgId}/settings` 
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