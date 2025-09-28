import { Bot, Home, QrCode, Briefcase, Activity, Network } from "lucide-react";

export const bottomNavItems = [
  { 
    icon: Home, 
    label: 'Home', 
    href: '/', 
    badge: null,
    activeRoutes: ['/']
  },
  { 
    icon: Network, 
    label: 'WytHubs', 
    href: '/ai-directory', 
    badge: 'LIVE',
    activeRoutes: ['/ai-directory', '/hubs']
  },
  { 
    icon: QrCode, 
    label: 'WytTools', 
    href: '/qr-generator', 
    badge: 'LIVE',
    activeRoutes: ['/qr-generator', '/assessment']
  },
  { 
    icon: Briefcase, 
    label: 'WytApps', 
    href: '/wytapps', 
    badge: null,
    activeRoutes: ['/wytapps']
  }
];

export const sidebarNavItems = [
  { icon: Network, label: 'WytHubs', href: '/ai-directory' },
];

// WytHubs submenu items
export const wytHubsItems = [
  { icon: Bot, label: 'AI Directory', href: '/ai-directory' },
];

// WytTools submenu items
export const wytToolsItems = [
  { icon: QrCode, label: 'QR Generator', href: '/qr-generator' },
  { icon: Activity, label: 'DISC Assessment', href: '/assessment' },
];