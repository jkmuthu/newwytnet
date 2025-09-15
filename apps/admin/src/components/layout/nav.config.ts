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
    icon: Bot, 
    label: 'AI Directory', 
    href: '/ai-directory', 
    badge: 'LIVE',
    activeRoutes: ['/ai-directory']
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
  { icon: Bot, label: 'AI Directory', href: '/ai-directory' },
  { icon: QrCode, label: 'QR Generator', href: '/qr-generator' },
  { icon: Activity, label: 'DISC Assessment', href: '/assessment' },
];