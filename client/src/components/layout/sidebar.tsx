import { cn } from "@/lib/utils";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";
import { useLocation } from "wouter";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ open, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { user, isAuthenticated, isSuperAdmin, role } = useWhatsAppAuth();
  const [location] = useLocation();

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      {
        section: "Core Platform",
        items: [
          { label: "Dashboard", icon: "tachometer-alt", href: "#dashboard", active: true },
        ]
      },
    ];

    // Add role-specific menu items
    if (isSuperAdmin) {
      // Super Admin gets all capabilities
      return [
        {
          section: "🦸‍♂️ Super Admin",
          items: [
            { label: "Dashboard", icon: "tachometer-alt", href: "/dashboard", active: location === "/dashboard" },
            { label: "System Overview", icon: "server", href: "/admin/system-overview", active: location === "/admin/system-overview" },
            { label: "Global Settings", icon: "cogs", href: "/admin/global-settings", active: location === "/admin/global-settings" },
          ]
        },
        {
          section: "Core Platform",
          items: [
            { label: "Tenants", icon: "building", href: "/admin/tenants", active: location === "/admin/tenants" },
            { label: "All Users", icon: "users", href: "/admin/users", active: location === "/admin/users" },
            { label: "WytPass Management", icon: "id-badge", href: "/user-auth-methods", active: location === "/user-auth-methods" },
          ]
        },
        {
          section: "Builders",
          items: [
            { label: "Modules (CRUD)", icon: "cubes", href: "/admin/modules", active: location === "/admin/modules" },
            { label: "CMS Builder", icon: "edit", href: "/admin/cms", active: location === "/admin/cms" },
            { label: "App Builder", icon: "mobile-alt", href: "/admin/apps", active: location === "/admin/apps" },
            { label: "Hub Builder", icon: "network-wired", href: "/admin/hubs", active: location === "/admin/hubs" },
            { label: "DataSets", icon: "database", href: "/admin/datasets", active: location === "/admin/datasets" },
          ]
        },
        {
          section: "Business",
          items: [
            { label: "Plan Management", icon: "credit-card", href: "/admin/plans", active: location === "/admin/plans" },
            { label: "Payment Methods", icon: "wallet", href: "/admin/payments", active: location === "/admin/payments" },
            { label: "Analytics", icon: "chart-line", href: "/analytics", active: location === "/analytics" },
          ]
        },
        {
          section: "System",
          items: [
            { label: "Search", icon: "search", href: "/search", active: location === "/search" },
            { label: "Themes", icon: "palette", href: "/admin/themes", active: location === "/admin/themes" },
            { label: "Media", icon: "images", href: "/admin/media", active: location === "/admin/media" },
            { label: "APIs", icon: "plug", href: "/admin/apis", active: location === "/admin/apis" },
            { label: "AI Management", icon: "robot", href: "/admin/ai", active: location === "/admin/ai" },
            { label: "Policies", icon: "shield-alt", href: "/admin/policies", active: location === "/admin/policies" },
            { label: "Logs", icon: "list-alt", href: "/admin/logs", active: location === "/admin/logs" },
          ]
        }
      ];
    } else if (role === 'admin') {
      // Admin gets most capabilities except system-wide settings
      return [
        ...baseItems,
        {
          section: "Core Platform",
          items: [
            { label: "Tenants", icon: "building", href: "#tenants" },
            { label: "Users", icon: "users", href: "#users" },
          ]
        },
        {
          section: "Builders",
          items: [
            { label: "Modules (CRUD)", icon: "cubes", href: "#modules" },
            { label: "CMS Builder", icon: "edit", href: "#cms" },
            { label: "App Builder", icon: "mobile-alt", href: "#apps" },
            { label: "Hub Builder", icon: "network-wired", href: "#hubs" },
          ]
        },
        {
          section: "Business",
          items: [
            { label: "Analytics", icon: "chart-line", href: "#analytics" },
          ]
        },
        {
          section: "System",
          items: [
            { label: "Search", icon: "search", href: "/search" },
            { label: "Media", icon: "images", href: "#media" },
          ]
        }
      ];
    } else if (role === 'manager') {
      // Manager gets limited administrative access
      return [
        ...baseItems,
        {
          section: "Builders",
          items: [
            { label: "CMS Builder", icon: "edit", href: "#cms" },
            { label: "App Builder", icon: "mobile-alt", href: "#apps" },
          ]
        },
        {
          section: "System",
          items: [
            { label: "Search", icon: "search", href: "/search" },
          ]
        }
      ];
    } else {
      // Regular user gets basic access
      return [
        ...baseItems,
        {
          section: "Tools",
          items: [
            { label: "Search", icon: "search", href: "/search" },
            { label: "My Content", icon: "folder", href: "#my-content" },
          ]
        }
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "sidebar-transition bg-card border-r border-border fixed lg:relative h-full z-30 overflow-y-auto transition-all duration-300",
        "lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header with hamburger toggle */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <img 
                  src="/wytnet-logo-new.png" 
                  alt="WytNet" 
                  className="h-8 w-auto transition-transform hover:scale-105"
                />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {isSuperAdmin ? '🦸‍♂️ Super Admin' : user?.name || 'Multi-SaaS Platform'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Hamburger Toggle Button */}
            <button
              onClick={onToggleCollapse}
              className={cn(
                "p-2 rounded-md hover:bg-muted transition-colors",
                isCollapsed ? "mx-auto" : "ml-auto"
              )}
              data-testid="button-hamburger-toggle"
            >
              <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-bars'} text-muted-foreground`}></i>
            </button>
          </div>
        </div>

        <nav className="p-2 space-y-2">
          {menuItems.map((section) => (
            <div key={section.section} className="mb-4">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  {section.section}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => {
                        onClose(); // Close sidebar on mobile after navigation
                      }}
                      className={cn(
                        "flex items-center rounded-md transition-colors group relative",
                        isCollapsed ? "px-3 py-3 justify-center" : "px-3 py-2 space-x-3",
                        item.active 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted text-foreground"
                      )}
                      data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <i className={`fas fa-${item.icon} ${isCollapsed ? 'text-lg' : 'w-5'}`}></i>
                      {!isCollapsed && <span>{item.label}</span>}
                      
                      {/* Tooltip for collapsed mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
