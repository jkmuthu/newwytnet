import { useState } from "react";
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
import { fetchPlatformModules, updatePlatformModule, getWytApps, getWytHubs, getPlatformModules, type PlatformModule } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminModules() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('apps');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<PlatformModule | null>(null);
  
  const { user, isSuperAdmin } = useWhatsAppAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all platform modules from API
  const { data: modules = [], isLoading, error } = useQuery({
    queryKey: ['platform-modules'],
    queryFn: fetchPlatformModules,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Separate WytApps, WytHubs, and Platform Modules
  const wytApps = getWytApps(modules).filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const wytHubs = getWytHubs(modules).filter(hub => 
    hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hub.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const platformModules = getPlatformModules(modules).filter(module => 
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update module status (enable/disable)
  const toggleModuleStatus = useMutation({
    mutationFn: async ({ moduleId, enabled }: { moduleId: string; enabled: boolean }) => {
      return updatePlatformModule(moduleId, { 
        status: enabled ? 'enabled' : 'disabled' 
      });
    },
    onSuccess: (_, { enabled }) => {
      // Invalidate and refetch platform modules
      queryClient.invalidateQueries({ queryKey: ['platform-modules'] });
      queryClient.invalidateQueries({ queryKey: ['platform-modules', 'enabled'] });
      
      toast({
        title: "Success",
        description: `Module ${enabled ? 'enabled' : 'disabled'} successfully!`,
      });
    },
    onError: (error) => {
      console.error('Failed to update module status:', error);
      toast({
        title: "Error",
        description: "Failed to update module status. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'disabled':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'wytapps':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'wythubs':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      case 'platform':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'wytapps':
        return 'WytApp';
      case 'wythubs':
        return 'WytHub';
      case 'platform':
        return 'System Module';
      default:
        return category;
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100';
      case 'premium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100';
      case 'freemium':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  // Show access denied if not super admin
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <i className="fas fa-lock text-6xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300">Only Super Admin can access module management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Apps & Modules Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage user-facing apps and platform system modules
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="apps">WytApps ({wytApps.length})</TabsTrigger>
                <TabsTrigger value="hubs">WytHubs ({wytHubs.length})</TabsTrigger>
                <TabsTrigger value="modules">Platform ({platformModules.length})</TabsTrigger>
                <TabsTrigger value="builder">Builder</TabsTrigger>
              </TabsList>

              <TabsContent value="apps" className="space-y-6">
                {/* Search */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-blue-600">WytApps</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Direct user-facing applications</p>
                      </div>
                      <Badge variant="secondary">{wytApps.length} apps</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="Search WytApps..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-md"
                    />
                  </CardContent>
                </Card>

                {/* User Apps List */}
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="h-6 w-32 bg-gray-200 rounded"></div>
                            <div className="h-6 w-16 bg-gray-200 rounded"></div>
                          </div>
                          <div className="h-4 w-48 bg-gray-200 rounded"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            <div className="h-6 w-12 bg-gray-200 rounded"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-400 mb-4">
                      <i className="fas fa-exclamation-triangle text-4xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Failed to load WytApps
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Please refresh the page to try again.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {wytApps.map((module) => (
                      <Card key={module.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${module.color}-100`}>
                                <i className={`fas fa-${module.icon} text-${module.color}-600`}></i>
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                  {module.name}
                                </h3>
                                <div className="flex gap-2 mt-1">
                                  <Badge className={getCategoryColor(module.category)}>
                                    {getCategoryLabel(module.category)}
                                  </Badge>
                                  <Badge className={getPricingColor(module.pricing)}>
                                    {module.pricing}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Switch
                              checked={module.status === 'enabled'}
                              onCheckedChange={(enabled) => 
                                toggleModuleStatus.mutate({ moduleId: module.id, enabled })
                              }
                              disabled={toggleModuleStatus.isPending}
                            />
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                            {module.description}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>👥 {module.installs?.toLocaleString() || 0}</span>
                              <span>📊 {module.usage?.toLocaleString() || 0}</span>
                            </div>
                            <Badge className={getStatusColor(module.status)}>
                              {module.status}
                            </Badge>
                          </div>
                          {module.features && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-1">
                                {module.features.slice(0, 3).map((feature, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                                {module.features.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{module.features.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="hubs" className="space-y-6">
                {/* Search */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-orange-600">WytHubs</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Hub services with /h/ routes and whitelabel domains</p>
                      </div>
                      <Badge variant="secondary">{wytHubs.length} hubs</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="Search WytHubs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-md"
                    />
                  </CardContent>
                </Card>

                {/* WytHubs List */}
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="h-6 w-32 bg-gray-200 rounded"></div>
                            <div className="h-6 w-16 bg-gray-200 rounded"></div>
                          </div>
                          <div className="h-4 w-48 bg-gray-200 rounded"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            <div className="h-6 w-12 bg-gray-200 rounded"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-400 mb-4">
                      <i className="fas fa-exclamation-triangle text-4xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Failed to load WytHubs
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Please refresh the page to try again.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {wytHubs.map((module) => (
                      <Card key={module.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${module.color}-100`}>
                                <i className={`fas fa-${module.icon} text-${module.color}-600`}></i>
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                  {module.name}
                                </h3>
                                <div className="flex gap-2 mt-1">
                                  <Badge className={getCategoryColor(module.category)}>
                                    {getCategoryLabel(module.category)}
                                  </Badge>
                                  <Badge className={getPricingColor(module.pricing)}>
                                    {module.pricing}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Switch
                              checked={module.status === 'enabled'}
                              onCheckedChange={(enabled) => 
                                toggleModuleStatus.mutate({ moduleId: module.id, enabled })
                              }
                              disabled={toggleModuleStatus.isPending}
                            />
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                            {module.description}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>👥 {module.installs?.toLocaleString() || 0}</span>
                              <span>📊 {module.usage?.toLocaleString() || 0}</span>
                            </div>
                            <Badge className={getStatusColor(module.status)}>
                              {module.status}
                            </Badge>
                          </div>
                          {module.features && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-1">
                                {module.features.slice(0, 3).map((feature, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                                {module.features.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{module.features.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="mt-2 text-xs text-gray-500">
                            Route: <code className="bg-gray-100 px-1 rounded">{module.route}</code>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* No hubs found */}
                {!isLoading && !error && wytHubs.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <i className="fas fa-search text-4xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No WytHubs found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Try adjusting your search criteria.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="modules" className="space-y-6">
                {/* Search */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-gray-600">Platform Modules</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">System components and building blocks</p>
                      </div>
                      <Badge variant="secondary">{platformModules.length} modules</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="Search platform modules..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-md"
                    />
                  </CardContent>
                </Card>

                {/* Platform Modules List */}
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="h-6 w-32 bg-gray-200 rounded"></div>
                            <div className="h-6 w-16 bg-gray-200 rounded"></div>
                          </div>
                          <div className="h-4 w-48 bg-gray-200 rounded"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            <div className="h-6 w-12 bg-gray-200 rounded"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-400 mb-4">
                      <i className="fas fa-exclamation-triangle text-4xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Failed to load platform modules
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Please refresh the page to try again.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {platformModules.map((module) => (
                      <Card key={module.id} className="hover:shadow-md transition-shadow border-l-4 border-l-gray-500">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {module.name}
                                </h3>
                                <Badge className={getCategoryColor(module.category)}>
                                  {getCategoryLabel(module.category)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {module.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(module.status)}>
                              {module.status}
                            </Badge>
                            <Badge className={getPricingColor(module.pricing)}>
                              {module.pricing === 'premium' && module.price ? `₹${module.price}` : module.pricing}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                              <span>👥 {module.usage?.toLocaleString() || 0}</span>
                              <span>📦 {module.installs?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={module.status === 'enabled'}
                                onCheckedChange={(enabled) => 
                                  toggleModuleStatus.mutate({ 
                                    moduleId: module.id, 
                                    enabled 
                                  })
                                }
                                disabled={toggleModuleStatus.isPending}
                                data-testid={`switch-${module.id}`}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedModule(module)}
                                data-testid={`view-${module.id}`}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* No modules found */}
                {!isLoading && !error && platformModules.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <i className="fas fa-search text-4xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No platform modules found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Try adjusting your search criteria.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="create" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Module</CardTitle>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">
                        Module creation functionality will be implemented in a future update.
                      </p>
                    </CardContent>
                  </CardHeader>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Module Detail Modal */}
            {selectedModule && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedModule.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedModule(null)}
                        data-testid="close-modal"
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedModule.description}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Category</h4>
                        <Badge className={getCategoryColor(selectedModule.category)}>
                          {selectedModule.category}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Type</h4>
                        <p className="text-gray-600 dark:text-gray-300">{selectedModule.type}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Status</h4>
                        <Badge className={getStatusColor(selectedModule.status)}>
                          {selectedModule.status}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Pricing</h4>
                        <Badge className={getPricingColor(selectedModule.pricing)}>
                          {selectedModule.pricing === 'premium' && selectedModule.price 
                            ? `₹${selectedModule.price}` 
                            : selectedModule.pricing}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Usage</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedModule.usage?.toLocaleString() || 0} monthly users
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Installs</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedModule.installs?.toLocaleString() || 0} total installs
                        </p>
                      </div>
                    </div>

                    {selectedModule.features && selectedModule.features.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Features</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                          {selectedModule.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <h4 className="font-semibold mb-1">Route</h4>
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {selectedModule.route}
                        </code>
                      </div>
                      <Switch
                        checked={selectedModule.status === 'enabled'}
                        onCheckedChange={(enabled) => {
                          toggleModuleStatus.mutate({ 
                            moduleId: selectedModule.id, 
                            enabled 
                          });
                          setSelectedModule({
                            ...selectedModule,
                            status: enabled ? 'enabled' : 'disabled'
                          });
                        }}
                        disabled={toggleModuleStatus.isPending}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
    </div>
  );
}