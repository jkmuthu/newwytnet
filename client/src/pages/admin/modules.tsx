import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ModuleBuilder from "@/components/builders/module-builder";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

// Initial module data - this will be managed in state
const initialPlatformModules = [
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

const initialUserModules = [
  {
    id: 'contact-crm',
    name: 'Contact CRM',
    description: 'Customer relationship management system',
    category: 'user',
    status: 'enabled',
    type: 'crud',
    pricing: 'custom',
    icon: 'address-book',
    color: 'blue',
    creator: 'John Doe',
    usage: 45,
    installs: 12
  },
  {
    id: 'inventory-mgmt',
    name: 'Inventory Management',
    description: 'Product inventory tracking system',
    category: 'user',
    status: 'disabled',
    type: 'crud',
    pricing: 'custom',
    icon: 'boxes',
    color: 'green',
    creator: 'Jane Smith',
    usage: 0,
    installs: 3
  }
];

// Utility functions for localStorage persistence
const STORAGE_KEY = 'wytnet_modules_state';

const saveModulesToStorage = (platformModules: any[], userModules: any[]) => {
  try {
    const state = {
      platformModules,
      userModules,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save modules to localStorage:', error);
  }
};

const loadModulesFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      // Check if data is not too old (24 hours)
      if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
        return {
          platformModules: state.platformModules || initialPlatformModules,
          userModules: state.userModules || initialUserModules
        };
      }
    }
  } catch (error) {
    console.error('Failed to load modules from localStorage:', error);
  }
  
  // Return initial data if no saved state or error
  return {
    platformModules: initialPlatformModules,
    userModules: initialUserModules
  };
};

export default function AdminModules() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [platformModules, setPlatformModules] = useState<any[]>([]);
  const [userModules, setUserModules] = useState<any[]>([]);
  
  const { user } = useWhatsAppAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load persisted modules state on component mount
  useEffect(() => {
    const savedState = loadModulesFromStorage();
    setPlatformModules(savedState.platformModules);
    setUserModules(savedState.userModules);
  }, []);

  const allModules = [...platformModules, ...userModules];

  const filteredModules = allModules.filter(module => {
    const matchesCategory = filterCategory === 'all' || module.category === filterCategory;
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleModuleStatus = useMutation({
    mutationFn: async ({ moduleId, enabled }: { moduleId: string, enabled: boolean }) => {
      // Update local state immediately for better UX
      const updateModules = (modules: any[]) => 
        modules.map(m => m.id === moduleId ? { ...m, status: enabled ? 'enabled' : 'disabled' } : m);
      
      let updatedPlatformModules: any[];
      let updatedUserModules: any[];
      
      setPlatformModules(prev => {
        updatedPlatformModules = updateModules(prev);
        return updatedPlatformModules;
      });
      setUserModules(prev => {
        updatedUserModules = updateModules(prev);
        return updatedUserModules;
      });
      
      // Update selected module if it's the one being toggled
      if (selectedModule?.id === moduleId) {
        setSelectedModule((prev: any) => ({ ...prev, status: enabled ? 'enabled' : 'disabled' }));
      }
      
      // Save to localStorage for persistence
      setTimeout(() => {
        saveModulesToStorage(updatedPlatformModules, updatedUserModules);
      }, 0);
      
      // In production, this would make API call to update module status
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      return { moduleId, enabled };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Module status updated and saved successfully!",
      });
    },
    onError: (error, { moduleId, enabled }) => {
      // Revert the changes on error
      const revertModules = (modules: any[]) => 
        modules.map(m => m.id === moduleId ? { ...m, status: !enabled ? 'enabled' : 'disabled' } : m);
      
      setPlatformModules(prev => revertModules(prev));
      setUserModules(prev => revertModules(prev));
      
      if (selectedModule?.id === moduleId) {
        setSelectedModule((prev: any) => ({ ...prev, status: !enabled ? 'enabled' : 'disabled' }));
      }
      
      toast({
        title: "Error",
        description: "Failed to update module status",
        variant: "destructive",
      });
    }
  });

  const updateModulePricing = useMutation({
    mutationFn: async ({ moduleId, pricing, price }: { moduleId: string, pricing: string, price?: number }) => {
      // Update local state
      const updateModules = (modules: any[]) => 
        modules.map(m => m.id === moduleId ? { ...m, pricing, price } : m);
      
      let updatedPlatformModules: any[];
      let updatedUserModules: any[];
      
      setPlatformModules(prev => {
        updatedPlatformModules = updateModules(prev);
        return updatedPlatformModules;
      });
      setUserModules(prev => {
        updatedUserModules = updateModules(prev);
        return updatedUserModules;
      });
      
      // Update selected module
      if (selectedModule?.id === moduleId) {
        setSelectedModule((prev: any) => ({ ...prev, pricing, price }));
      }
      
      // Save to localStorage for persistence
      setTimeout(() => {
        saveModulesToStorage(updatedPlatformModules, updatedUserModules);
      }, 0);
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      return { moduleId, pricing, price };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Module pricing updated and saved successfully!",
      });
    }
  });

  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    teal: 'text-teal-600 bg-teal-50 border-teal-200',
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className="flex-1 overflow-y-auto">
        <Header 
          user={user} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Modules Management</h1>
            <p className="text-muted-foreground">Manage platform and user modules, pricing, and availability</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="list">📋 Modules List</TabsTrigger>
              <TabsTrigger value="builder">🔧 CRUD Builder</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant={filterCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterCategory('all')}
                      data-testid="filter-all"
                    >
                      All Modules
                    </Button>
                    <Button
                      variant={filterCategory === 'platform' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterCategory('platform')}
                      data-testid="filter-platform"
                    >
                      Platform Modules
                    </Button>
                    <Button
                      variant={filterCategory === 'user' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterCategory('user')}
                      data-testid="filter-user"
                    >
                      User Modules
                    </Button>
                  </div>
                </div>
                <Input
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64"
                  data-testid="input-search-modules"
                />
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-cubes text-blue-600"></i>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Modules</p>
                        <p className="text-2xl font-bold">{allModules.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-layer-group text-green-600"></i>
                      <div>
                        <p className="text-sm text-muted-foreground">Platform</p>
                        <p className="text-2xl font-bold">{platformModules.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-users text-purple-600"></i>
                      <div>
                        <p className="text-sm text-muted-foreground">User Created</p>
                        <p className="text-2xl font-bold">{userModules.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-chart-line text-orange-600"></i>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Usage</p>
                        <p className="text-2xl font-bold">{allModules.reduce((sum, m) => sum + m.usage, 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map((module) => (
                  <Card 
                    key={module.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedModule(module)}
                    data-testid={`card-module-${module.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-12 h-12 rounded-lg border-2 flex items-center justify-center",
                            colorClasses[module.color as keyof typeof colorClasses] || colorClasses.blue
                          )}>
                            <i className={`fas fa-${module.icon} text-lg`}></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{module.name}</h3>
                            <Badge variant={module.category === 'platform' ? 'default' : 'secondary'}>
                              {module.category === 'platform' ? 'Platform' : 'User'}
                            </Badge>
                          </div>
                        </div>
                        <Switch 
                          checked={module.status === 'enabled'}
                          disabled={toggleModuleStatus.isPending}
                          onCheckedChange={(checked) => {
                            toggleModuleStatus.mutate({ 
                              moduleId: module.id, 
                              enabled: checked 
                            });
                          }}
                          data-testid={`switch-${module.id}-status`}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {module.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <i className="fas fa-download text-muted-foreground"></i>
                            <span>{module.installs.toLocaleString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <i className="fas fa-chart-bar text-muted-foreground"></i>
                            <span>{module.usage.toLocaleString()}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {module.pricing === 'free' && (
                            <Badge variant="outline" className="text-green-600">Free</Badge>
                          )}
                          {module.pricing === 'premium' && (
                            <Badge variant="outline" className="text-blue-600">₹{module.price}</Badge>
                          )}
                          {module.pricing === 'freemium' && (
                            <Badge variant="outline" className="text-purple-600">Freemium</Badge>
                          )}
                          {module.pricing === 'custom' && (
                            <Badge variant="outline" className="text-gray-600">Custom</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredModules.length === 0 && (
                <div className="text-center py-12">
                  <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
                  <h3 className="text-lg font-medium text-foreground mb-2">No modules found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="builder" className="space-y-6">
              {editingModule ? (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-900">Editing: {editingModule.name}</h3>
                      <p className="text-sm text-blue-700">Modify the module configuration below</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingModule(null)}
                    >
                      <i className="fas fa-times mr-2"></i>
                      Cancel Edit
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900">Create New Module</h3>
                  <p className="text-sm text-green-700">Define a new CRUD module using JSON DSL</p>
                </div>
              )}
              
              <div className="bg-card rounded-lg border border-border">
                <ModuleBuilder editingModule={editingModule} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Module Detail Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-16 h-16 rounded-lg border-2 flex items-center justify-center",
                    colorClasses[selectedModule.color as keyof typeof colorClasses] || colorClasses.blue
                  )}>
                    <i className={`fas fa-${selectedModule.icon} text-2xl`}></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedModule.name}</h2>
                    <p className="text-muted-foreground">{selectedModule.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={selectedModule.category === 'platform' ? 'default' : 'secondary'}>
                        {selectedModule.category === 'platform' ? 'Platform' : 'User'}
                      </Badge>
                      <Badge variant={selectedModule.status === 'enabled' ? 'default' : 'destructive'}>
                        {selectedModule.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedModule(null)}
                  data-testid="button-close-modal"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{selectedModule.installs.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Installs</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{selectedModule.usage.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Monthly Usage</p>
                </div>
              </div>

              {/* Pricing Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Pricing & Plans</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Pricing Model</label>
                    <select 
                      value={selectedModule.pricing}
                      onChange={(e) => {
                        const newPricing = e.target.value;
                        updateModulePricing.mutate({ 
                          moduleId: selectedModule.id, 
                          pricing: newPricing,
                          price: newPricing === 'free' ? 0 : selectedModule.price 
                        });
                      }}
                      className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                      data-testid="select-pricing-model"
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                      <option value="freemium">Freemium</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  {selectedModule.pricing !== 'free' && (
                    <div>
                      <label className="text-sm font-medium text-foreground">Price (INR)</label>
                      <Input 
                        type="number" 
                        value={selectedModule.price || 0}
                        onChange={(e) => {
                          const newPrice = parseInt(e.target.value) || 0;
                          updateModulePricing.mutate({ 
                            moduleId: selectedModule.id, 
                            pricing: selectedModule.pricing,
                            price: newPrice 
                          });
                        }}
                        className="mt-1"
                        data-testid="input-module-price"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={selectedModule.status === 'enabled'}
                    disabled={toggleModuleStatus.isPending}
                    onCheckedChange={(checked) => {
                      toggleModuleStatus.mutate({ 
                        moduleId: selectedModule.id, 
                        enabled: checked 
                      });
                    }}
                  />
                  <span className="text-sm text-foreground">
                    {selectedModule.status === 'enabled' ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditingModule(selectedModule);
                      setActiveTab('builder');
                      setSelectedModule(null);
                    }}
                    data-testid="button-edit-module"
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Edit Module
                  </Button>
                  <Button 
                    onClick={() => {
                      window.open(selectedModule.route, '_blank');
                    }}
                    data-testid="button-view-details"
                  >
                    <i className="fas fa-external-link-alt mr-2"></i>
                    View Live
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}