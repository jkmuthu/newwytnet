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
      label: "Tools",
      active: location === "/qr-generator" || location === "/assessment"
    },
    {
      href: "/realbro",
      icon: Globe,
      label: "Hubs", 
      active: location === "/realbro"
    },
    {
      href: "/wytapps",
      icon: Briefcase,
      label: "Apps",
      active: location === "/wytapps"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              item.active 
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}>
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
        
        {/* Login/Profile Button */}
        {!isAuthenticated ? (
          <Link href="/whatsapp-auth">
            <div className="flex flex-col items-center px-3 py-2 rounded-lg text-green-600 dark:text-green-400 transition-colors hover:text-green-700">
              <LogIn className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">Login</span>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard">
            <div className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              location === "/dashboard" 
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}>
              <div className="h-5 w-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">U</span>
              </div>
              <span className="text-xs mt-1 font-medium">Profile</span>
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}