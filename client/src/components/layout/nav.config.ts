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
    href: '/hubs', 
    badge: 'LIVE',
    activeRoutes: ['/hubs', '/hub', '/ai-directory']
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
  { icon: Network, label: 'WytHubs', href: '/hubs' },
];

// WytHubs submenu items
export const wytHubsItems = [
  { icon: Network, label: 'All Hubs', href: '/hubs' },
  { icon: Bot, label: 'AI Directory', href: '/ai-directory' },
];

// WytTools submenu items
export const wytToolsItems = [
  { icon: QrCode, label: 'QR Generator', href: '/qr-generator' },
  { icon: Activity, label: 'DISC Assessment', href: '/assessment' },
];