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
    icon: QrCode, 
    label: 'Tools', 
    href: '/wytapps', 
    badge: null,
    activeRoutes: ['/wytapps', '/a/wytqrc', '/a/wytassessor', '/wytai-trademark']
  }
];

export const sidebarNavItems = [
  { icon: Briefcase, label: 'WytApps', href: '/wytapps' },
];

// WytApps submenu items - using new /a/:slug public app routes
export const wytAppsItems = [
  { icon: QrCode, label: 'QR Generator', href: '/a/wytqrc' },
  { icon: Activity, label: 'DISC Assessment', href: '/a/wytassessor' },
];