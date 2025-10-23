import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronDown, ChevronRight, Shield } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { getFilteredNavigationSections, type NavigationSection } from "./navigation.config";
import { useState } from "react";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * AdminSidebar - Navigation sidebar for admin portal
 * Features: Sectioned navigation, role-based filtering, search-ready
 * Phase 1: Engine Panel Consolidation
 */
export default function AdminSidebar({ collapsed, onToggleCollapse }: AdminSidebarProps) {
  const [location] = useLocation();
  const { adminUser } = useAdminAuth();
  
  // Track collapsed sections (only used when sidebar is expanded)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Get navigation sections filtered by user role
  const navigationSections = getFilteredNavigationSections({
    isSuperAdmin: adminUser?.isSuperAdmin,
    isAdmin: true, // All engine admin users are admins
    isDeveloper: adminUser?.role === 'Developer' || adminUser?.isSuperAdmin
  });

  return (
    <div className={cn(
      "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-red-200 dark:border-red-800 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-700 dark:text-red-300">
                Admin Panel
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hidden lg:flex hover:bg-red-100 dark:hover:bg-red-900"
            data-testid="collapse-admin-sidebar"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform text-red-600",
              collapsed && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Navigation - Sectioned */}
        <ScrollArea className="flex-1 p-3">
          <nav className="space-y-2">
            {navigationSections.map((section) => (
              <div key={section.id} className="space-y-1">
                {/* Section Header (only show when sidebar is expanded) */}
                {!collapsed && (
                  <div 
                    className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {section.title}
                    </div>
                    {collapsedSections.has(section.id) ? (
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                )}

                {/* Section Items */}
                {(!collapsed && !collapsedSections.has(section.id)) || collapsed ? (
                  <div className={cn("space-y-1", collapsed && "border-b border-gray-200 dark:border-gray-700 pb-2 mb-2")}>
                    {section.items.map((item) => {
                      const isActive = location === item.href;
                      
                      return (
                        <Link key={item.href} href={item.href}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start h-9 relative",
                              collapsed ? "px-2" : "px-3",
                              isActive && "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-r-2 border-red-600",
                              "hover:bg-red-50 dark:hover:bg-red-950"
                            )}
                            data-testid={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                            title={collapsed ? item.label : undefined}
                          >
                            <item.icon className={cn(
                              "h-4 w-4 flex-shrink-0",
                              collapsed ? "" : "mr-3",
                              isActive ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                            )} />
                            {!collapsed && (
                              <span className="truncate text-sm">
                                {item.label}
                              </span>
                            )}
                            {!collapsed && item.badge && (
                              <Badge className="ml-auto" variant="secondary">
                                {item.badge}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Admin status footer */}
        {!collapsed && (
          <div className="p-4 border-t border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <div className="text-xs text-red-600 dark:text-red-400 font-medium">
              {adminUser?.isSuperAdmin ? '🦸‍♂️ Super Admin Portal' : '👨‍💼 Admin Portal'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Role: {adminUser?.role || 'admin'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
