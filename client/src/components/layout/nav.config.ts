import { Bot, Home, QrCode, Briefcase, Activity } from "lucide-react";

export const bottomNavItems = [
  { 
    icon: Home, 
    label: 'WytWall', 
    href: '/', 
    badge: null,
    activeRoutes: ['/']
  },
  { 
    icon: Briefcase, 
    label: 'WytApps', 
    href: '/wytapps', 
    badge: null,
    activeRoutes: ['/wytapps']
  },
  { 
    icon: Activity, 
    label: 'WytLife', 
    href: '/wytlife', 
    badge: null,
    activeRoutes: ['/wytlife']
  },
  { 
    icon: Bot, 
    label: 'AI Directory', 
    href: '/ai-directory', 
    badge: null,
    activeRoutes: ['/ai-directory', '/qr-generator', '/assessment']
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