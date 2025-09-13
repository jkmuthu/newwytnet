import { Link, useLocation } from "wouter";
import { Home, Bot, Wrench, Globe, Briefcase, LogIn } from "lucide-react";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";

export default function MobileBottomNavigation() {
  const [location] = useLocation();
  const { isAuthenticated } = useWhatsAppAuth();

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      active: location === "/"
    },
    {
      href: "/ai-directory", 
      icon: Bot,
      label: "AI Directory",
      active: location === "/ai-directory"
    },
    {
      href: "/qr-generator",
      icon: Wrench,
      label: "WytTools",
      active: location === "/qr-generator" || location === "/assessment"
    },
    {
      href: "/wytapps",
      icon: Briefcase,
      label: "WytApps",
      active: location === "/wytapps"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${
              item.active 
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}>
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}