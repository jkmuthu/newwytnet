// Utility to manage module status across the application
const STORAGE_KEY = 'wytnet_modules_state';

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  category: 'platform' | 'user';
  status: 'enabled' | 'disabled';
  type: string;
  pricing: string;
  price?: number;
  icon: string;
  color: string;
  route: string;
  usage: number;
  installs: number;
  creator?: string;
}

// Initial platform modules configuration
const defaultPlatformModules: ModuleConfig[] = [
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes for URLs, text, and contact information',
    category: 'platform',
    status: 'enabled',
    type: 'tool',
    pricing: 'free',
    icon: 'qrcode',
    color: 'blue',
    route: '/qr-generator',
    usage: 1250,
    installs: 8900
  },
  {
    id: 'assessment',
    name: 'DISC Assessment',
    description: 'Personality and behavioral assessment tool',
    category: 'platform', 
    status: 'enabled',
    type: 'assessment',
    pricing: 'premium',
    price: 299,
    icon: 'chart-pie',
    color: 'purple',
    route: '/assessment',
    usage: 450,
    installs: 2100
  },
  {
    id: 'ai-directory',
    name: 'AI Directory',
    description: 'Comprehensive AI tools and services directory',
    category: 'platform',
    status: 'enabled',
    type: 'directory',
    pricing: 'free',
    icon: 'robot',
    color: 'green',
    route: '/ai-directory',
    usage: 3200,
    installs: 15600
  },
  {
    id: 'realbro',
    name: 'RealBRO Hub',
    description: 'Real estate broker and professional networking hub',
    category: 'platform',
    status: 'enabled',
    type: 'hub',
    pricing: 'freemium',
    price: 999,
    icon: 'home',
    color: 'orange',
    route: '/realbro',
    usage: 850,
    installs: 4200
  },
  {
    id: 'wytduty',
    name: 'WytDuty Task Manager',
    description: 'Task and duty management for teams',
    category: 'platform',
    status: 'enabled',
    type: 'productivity',
    pricing: 'premium',
    price: 599,
    icon: 'tasks',
    color: 'indigo',
    route: '/wytduty',
    usage: 650,
    installs: 3100
  },
  {
    id: 'tm-numbering',
    name: 'TMNumber11 System',
    description: 'Trademark numbering and classification system',
    category: 'platform',
    status: 'enabled',
    type: 'utility',
    pricing: 'premium',
    price: 1999,
    icon: 'trademark',
    color: 'red',
    route: '/tm-numbering',
    usage: 180,
    installs: 950
  },
  {
    id: 'wytai-trademark',
    name: 'WytAi Trademark Analysis',
    description: 'AI-powered Indian trademark analysis engine',
    category: 'platform',
    status: 'enabled',
    type: 'ai-analysis',
    pricing: 'premium',
    price: 2499,
    icon: 'search',
    color: 'teal',
    route: '/wytai-trademark',
    usage: 320,
    installs: 1200
  }
];

export const loadModulesFromStorage = (): { platformModules: ModuleConfig[], userModules: ModuleConfig[] } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      // Check if data is not too old (24 hours)
      if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
        return {
          platformModules: state.platformModules || defaultPlatformModules,
          userModules: state.userModules || []
        };
      }
    }
  } catch (error) {
    console.error('Failed to load modules from localStorage:', error);
  }
  
  // Return default data if no saved state or error
  return {
    platformModules: defaultPlatformModules,
    userModules: []
  };
};

export const getEnabledModules = (): ModuleConfig[] => {
  const { platformModules, userModules } = loadModulesFromStorage();
  const allModules = [...platformModules, ...userModules];
  return allModules.filter(module => module.status === 'enabled');
};

export const isModuleEnabled = (moduleId: string): boolean => {
  const enabledModules = getEnabledModules();
  return enabledModules.some(module => module.id === moduleId);
};

export const getModuleById = (moduleId: string): ModuleConfig | undefined => {
  const { platformModules, userModules } = loadModulesFromStorage();
  const allModules = [...platformModules, ...userModules];
  return allModules.find(module => module.id === moduleId);
};