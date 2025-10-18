import { Bot, Home, QrCode, Briefcase, Activity } from "lucide-react";

export const bottomNavItems = [
  { 
    icon: Home, 
    label: 'Home', 
    href: '/', 
    badge: null,
    activeRoutes: ['/']
  },
  { 
    icon: Briefcase, 
    label: 'WytApps', 
    href: '/wytapps', 
    badge: null,
    activeRoutes: ['/wytapps', '/qr-generator', '/assessment', '/ai-directory']
  },
  { 
    icon: QrCode, 
    label: 'Features', 
    href: '/features', 
    badge: null,
    activeRoutes: ['/features']
  },
  { 
    icon: Activity, 
    label: 'Pricing', 
    href: '/pricing', 
    badge: null,
    activeRoutes: ['/pricing']
  }
];

export const sidebarNavItems = [
  { icon: Briefcase, label: 'WytApps', href: '/wytapps' },
];

// WytApps submenu items  
export const wytAppsItems = [
  { icon: QrCode, label: 'QR Generator', href: '/qr-generator' },
  { icon: Activity, label: 'DISC Assessment', href: '/assessment' },
  { icon: Bot, label: 'AI Directory', href: '/ai-directory' },
];