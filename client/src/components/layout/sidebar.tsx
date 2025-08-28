import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const menuItems = [
    {
      section: "Core Platform",
      items: [
        { label: "Dashboard", icon: "tachometer-alt", href: "#dashboard", active: true },
        { label: "Tenants", icon: "building", href: "#tenants" },
        { label: "Admin Users", icon: "users", href: "#users" },
      ]
    },
    {
      section: "Builders",
      items: [
        { label: "Modules (CRUD)", icon: "cubes", href: "#modules" },
        { label: "CMS Builder", icon: "edit", href: "#cms" },
        { label: "App Builder", icon: "mobile-alt", href: "#apps" },
        { label: "Hub Builder", icon: "network-wired", href: "#hubs" },
        { label: "DataSets", icon: "database", href: "#datasets" },
      ]
    },
    {
      section: "Business",
      items: [
        { label: "Plan Management", icon: "credit-card", href: "#plans" },
        { label: "Payment Methods", icon: "wallet", href: "#payments" },
        { label: "Analytics", icon: "chart-line", href: "#analytics" },
      ]
    },
    {
      section: "System",
      items: [
        { label: "Search", icon: "search", href: "/search" },
        { label: "Themes", icon: "palette", href: "#themes" },
        { label: "Media", icon: "images", href: "#media" },
        { label: "APIs", icon: "plug", href: "#apis" },
        { label: "AI Management", icon: "robot", href: "#ai" },
        { label: "Policies", icon: "shield-alt", href: "#policies" },
        { label: "Logs", icon: "list-alt", href: "#logs" },
      ]
    }
  ];

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
        "sidebar-transition w-64 bg-card border-r border-border fixed lg:relative h-full z-30 overflow-y-auto",
        "lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-cube text-primary-foreground text-sm"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">WytNet</h1>
              <p className="text-xs text-muted-foreground">Multi-SaaS Platform</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((section) => (
            <div key={section.section} className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.section}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                        item.active 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted text-foreground"
                      )}
                      data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <i className={`fas fa-${item.icon} w-5`}></i>
                      <span>{item.label}</span>
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
