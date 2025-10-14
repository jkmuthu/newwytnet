import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { fetchPlatformModules, updatePlatformModule, getWytApps, getWytHubs, getPlatformModules, type PlatformModule } from "@/lib/api";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Search, Package, Grid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminModuleLibrary() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all platform modules from API
  const { data: modules = [], isLoading, error } = useQuery({
    queryKey: ['platform-modules'],
    queryFn: fetchPlatformModules,
    staleTime: 5 * 60 * 1000,
  });

  // Filter modules by search and tab
  const filterModules = (moduleList: PlatformModule[]) => {
    return moduleList.filter(module => 
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const wytApps = filterModules(getWytApps(modules));
  const wytHubs = filterModules(getWytHubs(modules));
  const platformModules = filterModules(getPlatformModules(modules));
  
  const allModules = filterModules([...wytApps, ...wytHubs, ...platformModules]);

  // Update module status (enable/disable)
  const toggleModuleStatus = useMutation({
    mutationFn: async ({ moduleId, enabled }: { moduleId: string; enabled: boolean }) => {
      return updatePlatformModule(moduleId, { 
        status: enabled ? 'enabled' : 'disabled' 
      });
    },
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['platform-modules'] });
      
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
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
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

  const renderModuleCard = (module: PlatformModule) => (
    <Card 
      key={module.id} 
      className={cn(
        "hover:shadow-lg transition-all duration-200 border-l-4",
        module.category === 'wytapps' && "border-l-blue-500",
        module.category === 'wythubs' && "border-l-orange-500",
        module.category === 'platform' && "border-l-purple-500"
      )}
      data-testid={`module-card-${module.id}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              module.category === 'wytapps' && "bg-blue-100 dark:bg-blue-900",
              module.category === 'wythubs' && "bg-orange-100 dark:bg-orange-900",
              module.category === 'platform' && "bg-purple-100 dark:bg-purple-900"
            )}>
              <Package className={cn(
                "h-6 w-6",
                module.category === 'wytapps' && "text-blue-600 dark:text-blue-400",
                module.category === 'wythubs' && "text-orange-600 dark:text-orange-400",
                module.category === 'platform' && "text-purple-600 dark:text-purple-400"
              )} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{module.name}</CardTitle>
              <div className="flex gap-2 mb-2">
                <Badge className={getCategoryColor(module.category)} data-testid={`category-badge-${module.id}`}>
                  {getCategoryLabel(module.category)}
                </Badge>
                <Badge className={getStatusColor(module.status)} data-testid={`status-badge-${module.id}`}>
                  {module.status}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {module.description}
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={module.status === 'enabled'}
            onCheckedChange={(enabled) => 
              toggleModuleStatus.mutate({ moduleId: module.id, enabled })
            }
            disabled={toggleModuleStatus.isPending}
            data-testid={`toggle-status-${module.id}`}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex gap-4">
            <span title="Installations">📦 {module.installs?.toLocaleString() || 0}</span>
            <span title="Usage">📊 {module.usage?.toLocaleString() || 0}</span>
          </div>
        </div>
        {module.features && module.features.length > 0 && (
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
  );

  const renderModuleList = (moduleList: PlatformModule[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className={cn(
          viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
        )}>
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Package className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Failed to load modules
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please refresh the page to try again.
          </p>
        </div>
      );
    }

    if (moduleList.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria.
          </p>
        </div>
      );
    }

    return (
      <div className={cn(
        viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
      )}>
        {moduleList.map(renderModuleCard)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Module Library
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and manage all platform modules, apps, and hubs
        </p>
      </div>

      {/* Search and View Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search modules by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-modules"
              />
            </div>
            <div className="flex gap-2 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                data-testid="view-grid"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                data-testid="view-list"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" data-testid="tab-all">
            All Modules ({allModules.length})
          </TabsTrigger>
          <TabsTrigger value="apps" data-testid="tab-apps">
            WytApps ({wytApps.length})
          </TabsTrigger>
          <TabsTrigger value="hubs" data-testid="tab-hubs">
            WytHubs ({wytHubs.length})
          </TabsTrigger>
          <TabsTrigger value="platform" data-testid="tab-platform">
            Platform ({platformModules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderModuleList(allModules, "No modules found")}
        </TabsContent>

        <TabsContent value="apps" className="mt-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Direct user-facing applications
            </h3>
          </div>
          {renderModuleList(wytApps, "No WytApps found")}
        </TabsContent>

        <TabsContent value="hubs" className="mt-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Hub services with /h/ routes and whitelabel domains
            </h3>
          </div>
          {renderModuleList(wytHubs, "No WytHubs found")}
        </TabsContent>

        <TabsContent value="platform" className="mt-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              System components and building blocks
            </h3>
          </div>
          {renderModuleList(platformModules, "No platform modules found")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
