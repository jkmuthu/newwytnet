import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Images,
  Palette,
  BarChart3,
  Settings,
  Smartphone,
  Globe,
  Users,
  Tag,
  Grid3x3,
  Link2
} from "lucide-react";
import { useHubAdminAuth } from "@/contexts/HubAdminAuthContext";

interface NavigationItem {
  label: string;
  icon: React.ElementType;
  href: string;
  active: boolean;
}

interface NavSection {
  section: string;
  items: NavigationItem[];
}

interface HubAdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * HubAdminSidebar - Navigation sidebar for WytNet.com Hub Admin portal
 * Features: Hub content management, CMS, media, themes, analytics
 */
export default function HubAdminSidebar({ collapsed, onToggleCollapse }: HubAdminSidebarProps) {
  const [location] = useLocation();
  const { hubAdminUser } = useHubAdminAuth();
  const [openSections, setOpenSections] = useState<string[]>(['Dashboard', 'Content Management']);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Hub Admin navigation items
  const navigationItems: NavSection[] = [
    {
      section: "Dashboard",
      items: [
        { 
          label: "Overview", 
          icon: LayoutDashboard, 
          href: "/admin", 
          active: location === "/admin"
        },
        { 
          label: "Analytics", 
          icon: BarChart3, 
          href: "/admin/analytics", 
          active: location === "/admin/analytics"
        },
      ]
    },
    {
      section: "Content Management",
      items: [
        { 
          label: "CMS Content", 
          icon: FileText, 
          href: "/admin/cms", 
          active: location === "/admin/cms"
        },
        { 
          label: "Media Library", 
          icon: Images, 
          href: "/admin/media", 
          active: location === "/admin/media"
        },
        { 
          label: "Categories", 
          icon: Tag, 
          href: "/admin/categories", 
          active: location === "/admin/categories"
        },
      ]
    },
    {
      section: "Hub Apps & Themes",
      items: [
        { 
          label: "Hub Apps", 
          icon: Grid3x3, 
          href: "/admin/apps", 
          active: location === "/admin/apps"
        },
        { 
          label: "Themes", 
          icon: Palette, 
          href: "/admin/themes", 
          active: location === "/admin/themes"
        },
      ]
    },
    {
      section: "Hub Settings",
      items: [
        { 
          label: "Hub Settings", 
          icon: Settings, 
          href: "/admin/settings", 
          active: location === "/admin/settings"
        },
        { 
          label: "Custom Domains", 
          icon: Link2, 
          href: "/admin/domains", 
          active: location === "/admin/domains"
        },
        { 
          label: "SEO Settings", 
          icon: Globe, 
          href: "/admin/seo", 
          active: location === "/admin/seo"
        },
        { 
          label: "Mobile App", 
          icon: Smartphone, 
          href: "/admin/mobile-app", 
          active: location === "/admin/mobile-app"
        },
        { 
          label: "Hub Users", 
          icon: Users, 
          href: "/admin/users", 
          active: location === "/admin/users"
        },
      ]
    }
  ];

  return (
    <div className={cn(
      "fixed top-16 left-0 bottom-0 bg-white dark:bg-gray-800 border-r border-blue-200 dark:border-blue-800 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <ScrollArea className="h-full py-4">
        <div className="space-y-2 px-3">
          {navigationItems.map((section) => (
            <Collapsible
              key={section.section}
              open={openSections.includes(section.section)}
              onOpenChange={() => toggleSection(section.section)}
            >
              {!collapsed && (
                <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  <span>{section.section}</span>
                  {openSections.includes(section.section) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </CollapsibleTrigger>
              )}
              
              <CollapsibleContent className="space-y-1 mt-1">
                {section.items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={item.active ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start",
                        collapsed ? "px-2" : "px-3",
                        item.active && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      )}
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                      {!collapsed && <span className="text-sm">{item.label}</span>}
                    </Button>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        {/* Hub Admin Indicator */}
        {!collapsed && (
          <div className="mt-6 mx-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-xs font-medium text-blue-700 dark:text-blue-400">
              🏢 Hub Admin Portal
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {hubAdminUser?.hubName || 'WytNet.com'}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Collapse toggle button */}
      <div className="absolute bottom-4 left-0 right-0 px-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-full justify-center text-gray-600 dark:text-gray-400"
          data-testid="button-collapse-sidebar"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>
    </div>
  );
}
