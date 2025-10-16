import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Package, Grid, List, Globe, Building2, Layers, Gamepad2,
  Link2, AlertTriangle, Code, Info, CheckCircle2, FileText, Settings, Shield, Route
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleEndpoint {
  path: string;
  method: string;
  description: string;
}

interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  contexts: Array<'platform' | 'hub' | 'app' | 'game'>;
  dependencies: string[];
  conflicts?: string[];
  apiEndpoints: ModuleEndpoint[];
  settings?: Record<string, any>;
  compatibilityMatrix?: Record<string, string[]>;
  version: string;
  status: 'stable' | 'beta' | 'alpha';
  route?: string;
  changelog?: string;
  restrictedTo?: string[];
}

export default function AdminModuleLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<ModuleDefinition | null>(null);
  const [showModuleDetails, setShowModuleDetails] = useState(false);
  const [editedRoute, setEditedRoute] = useState('');
  const [contextRestrictions, setContextRestrictions] = useState({
    engineOnly: false,
    hubOnly: false,
    appOnly: false,
    gameOnly: false,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch module catalog
  const { data: catalogData, isLoading: catalogLoading } = useQuery({
    queryKey: ['modules', 'catalog', categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const response = await fetch(`/api/modules/catalog?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch catalog');
      return response.json();
    },
  });

  // Fetch platform activations (admin can only manage platform-level activations)
  const { data: platformActivations } = useQuery({
    queryKey: ['modules', 'enabled', 'platform'],
    queryFn: async () => {
      const response = await fetch('/api/modules/enabled/platform');
      if (!response.ok) throw new Error('Failed to fetch activations');
      return response.json();
    },
  });

  const modules: ModuleDefinition[] = catalogData?.modules || [];
  const enabledModuleIds: string[] = platformActivations?.moduleIds || [];

  // Activate module mutation (platform context only)
  const activateModule = useMutation({
    mutationFn: async (moduleId: string) => {
      const response = await fetch('/api/modules/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, context: 'platform' }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Activation failed');
      }
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      
      const autoEnabled = data.autoEnabledModules?.length || 0;
      const autoEnabledList = data.autoEnabledModules?.join(', ') || '';
      
      toast({
        title: "✅ Module Activated",
        description: (
          <div className="space-y-1">
            <p>{data.message}</p>
            {autoEnabled > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Auto-enabled dependencies:</strong> {autoEnabledList}
              </p>
            )}
          </div>
        ),
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Activation Failed",
        description: error.message || "Failed to activate module",
        variant: "destructive",
      });
    }
  });

  // Deactivate module mutation
  const deactivateModule = useMutation({
    mutationFn: async (moduleId: string) => {
      const response = await fetch('/api/modules/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, context: 'platform' }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Deactivation failed');
      }
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast({
        title: "Module Deactivated",
        description: data.message,
      });
    },
    onError: (error: any) => {
      const errorMsg = error.message || "Failed to deactivate module";
      toast({
        title: "Deactivation Failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
  });

  // Filter modules by search
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Get category counts
  const categories = [
    { id: 'all', label: 'All Categories', count: modules.length },
    { id: 'auth', label: 'Auth & Identity', count: modules.filter(m => m.category === 'auth').length },
    { id: 'payment', label: 'Payment', count: modules.filter(m => m.category === 'payment').length },
    { id: 'content', label: 'Content & Media', count: modules.filter(m => m.category === 'content').length },
    { id: 'communication', label: 'Communication', count: modules.filter(m => m.category === 'communication').length },
    { id: 'data', label: 'Data', count: modules.filter(m => m.category === 'data').length },
    { id: 'user_org', label: 'User & Org', count: modules.filter(m => m.category === 'user_org').length },
    { id: 'productivity', label: 'Productivity', count: modules.filter(m => m.category === 'productivity').length },
    { id: 'platform_core', label: 'Platform Core', count: modules.filter(m => m.category === 'platform_core').length },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      auth: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
      payment: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      content: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
      communication: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
      data: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-100',
      user_org: 'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100',
      productivity: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
      platform_core: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      stable: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      beta: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
      alpha: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const ContextIcon = ({ context }: { context: string }) => {
    switch (context) {
      case 'platform': return <Globe className="h-3 w-3" />;
      case 'hub': return <Building2 className="h-3 w-3" />;
      case 'app': return <Layers className="h-3 w-3" />;
      case 'game': return <Gamepad2 className="h-3 w-3" />;
      default: return <Package className="h-3 w-3" />;
    }
  };

  const renderModuleCard = (module: ModuleDefinition) => {
    const isEnabled = enabledModuleIds.includes(module.id);
    const hasDependencies = module.dependencies && module.dependencies.length > 0;
    const hasConflicts = module.conflicts && module.conflicts.length > 0;
    const supportsPlatform = module.contexts.includes('platform');

    return (
      <Card 
        key={module.id} 
        className={cn(
          "hover:shadow-lg transition-all duration-200 border-l-4",
          isEnabled ? "border-l-green-500" : "border-l-gray-300"
        )}
        data-testid={`module-card-${module.id}`}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                isEnabled ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"
              )}>
                <Package className={cn(
                  "h-6 w-6",
                  isEnabled ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"
                )} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">{module.name}</CardTitle>
                  {isEnabled && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                </div>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <Badge className={getCategoryColor(module.category)}>
                    {module.category.replace('_', ' ')}
                  </Badge>
                  <Badge className={getStatusColor(module.status)}>
                    {module.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    v{module.version}
                  </Badge>
                </div>
                <CardDescription className="text-sm line-clamp-2">
                  {module.description}
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  activateModule.mutate(module.id);
                } else {
                  deactivateModule.mutate(module.id);
                }
              }}
              disabled={!supportsPlatform || activateModule.isPending || deactivateModule.isPending}
              data-testid={`toggle-${module.id}`}
            />
          </div>

          {/* Available Contexts */}
          <div className="flex items-center gap-2 border-t pt-3">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Contexts:</span>
            <div className="flex gap-1">
              {module.contexts.map(context => (
                <Badge key={context} variant="outline" className="text-xs flex items-center gap-1">
                  <ContextIcon context={context} />
                  {context}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Dependencies & Conflicts */}
          {(hasDependencies || hasConflicts) && (
            <div className="space-y-2 mb-3">
              {hasDependencies && (
                <div className="flex items-start gap-2 text-xs">
                  <Link2 className="h-3 w-3 text-blue-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Requires:</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">
                      {module.dependencies.slice(0, 3).join(', ')}
                      {module.dependencies.length > 3 && ` +${module.dependencies.length - 3} more`}
                    </span>
                  </div>
                </div>
              )}
              {hasConflicts && module.conflicts && (
                <div className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Conflicts:</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">{module.conflicts.join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* API Endpoints */}
          {module.apiEndpoints && module.apiEndpoints.length > 0 && (
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <Code className="h-3 w-3" />
                  API Endpoints ({module.apiEndpoints.length})
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedModule(module);
                    setShowModuleDetails(true);
                  }}
                  data-testid={`view-details-${module.id}`}
                >
                  <Info className="h-3 w-3 mr-1" />
                  Details
                </Button>
              </div>
              <div className="space-y-1">
                {module.apiEndpoints.slice(0, 2).map((endpoint, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs p-1 bg-gray-50 dark:bg-gray-800 rounded">
                    <Badge variant="outline" className="text-xs px-1">
                      {endpoint.method}
                    </Badge>
                    <code className="text-xs text-gray-600 dark:text-gray-400">{endpoint.path}</code>
                  </div>
                ))}
                {module.apiEndpoints.length > 2 && (
                  <p className="text-xs text-gray-500">+{module.apiEndpoints.length - 2} more endpoints</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Module Library
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Platform-level module activation and management
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search modules..."
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

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={categoryFilter === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(cat.id)}
                data-testid={`filter-${cat.id}`}
              >
                {cat.label} ({cat.count})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{modules.length}</div>
            <p className="text-sm text-muted-foreground">Total Modules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{enabledModuleIds.length}</div>
            <p className="text-sm text-muted-foreground">Active Modules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{modules.length - enabledModuleIds.length}</div>
            <p className="text-sm text-muted-foreground">Inactive Modules</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Grid */}
      {catalogLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredModules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No modules found</p>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
        )}>
          {filteredModules.map(renderModuleCard)}
        </div>
      )}

      {/* Module Details Dialog */}
      <Dialog 
        open={showModuleDetails} 
        onOpenChange={(open) => {
          setShowModuleDetails(open);
          if (open && selectedModule) {
            setEditedRoute(selectedModule.route || '');
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {selectedModule?.name}
              <Badge variant="outline" className="ml-2">
                v{selectedModule?.version}
              </Badge>
            </DialogTitle>
            <DialogDescription>{selectedModule?.description}</DialogDescription>
          </DialogHeader>
          
          {selectedModule && (
            <div className="space-y-6">
              {/* Metadata */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</p>
                  <Badge className={getCategoryColor(selectedModule.category)}>
                    {selectedModule.category.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <Badge className={getStatusColor(selectedModule.status)}>
                    {selectedModule.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Version</p>
                  <Badge variant="outline">v{selectedModule.version}</Badge>
                </div>
              </div>

              <Separator />

              {/* Changelog */}
              {selectedModule.changelog && (
                <>
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Changelog
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {selectedModule.changelog}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Route Editor */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Module Route
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="module-route" className="text-sm text-gray-600 dark:text-gray-400">
                    URL Path/Route
                  </Label>
                  <Input
                    id="module-route"
                    value={editedRoute}
                    onChange={(e) => setEditedRoute(e.target.value)}
                    placeholder="/module-path"
                    className="font-mono"
                    data-testid="input-module-route"
                  />
                  <p className="text-xs text-muted-foreground">
                    Define the URL route where this module is accessible
                  </p>
                </div>
              </div>

              <Separator />

              {/* Context Restrictions */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Context Restrictions
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="engine-only"
                      checked={contextRestrictions.engineOnly}
                      onCheckedChange={(checked) => 
                        setContextRestrictions(prev => ({ ...prev, engineOnly: checked as boolean }))
                      }
                      data-testid="checkbox-engine-only"
                    />
                    <Label htmlFor="engine-only" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      Engine Only
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hub-only"
                      checked={contextRestrictions.hubOnly}
                      onCheckedChange={(checked) => 
                        setContextRestrictions(prev => ({ ...prev, hubOnly: checked as boolean }))
                      }
                      data-testid="checkbox-hub-only"
                    />
                    <Label htmlFor="hub-only" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      Hub Only
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="app-only"
                      checked={contextRestrictions.appOnly}
                      onCheckedChange={(checked) => 
                        setContextRestrictions(prev => ({ ...prev, appOnly: checked as boolean }))
                      }
                      data-testid="checkbox-app-only"
                    />
                    <Label htmlFor="app-only" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Layers className="h-3 w-3" />
                      App Only
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="game-only"
                      checked={contextRestrictions.gameOnly}
                      onCheckedChange={(checked) => 
                        setContextRestrictions(prev => ({ ...prev, gameOnly: checked as boolean }))
                      }
                      data-testid="checkbox-game-only"
                    />
                    <Label htmlFor="game-only" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Gamepad2 className="h-3 w-3" />
                      Game Only
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Access Restrictions */}
              {selectedModule.restrictedTo && selectedModule.restrictedTo.length > 0 && (
                <>
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Access Restrictions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedModule.restrictedTo.map((restriction, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                          data-testid={`badge-restriction-${idx}`}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      This module is restricted to specific user roles or permissions
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Dependencies */}
              {selectedModule.dependencies.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Dependencies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModule.dependencies.map(dep => (
                      <Badge key={dep} variant="outline">{dep}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* API Endpoints */}
              {selectedModule.apiEndpoints.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      API Endpoints ({selectedModule.apiEndpoints.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedModule.apiEndpoints.map((endpoint, idx) => (
                        <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono text-xs">
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                              {endpoint.path}
                            </code>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {endpoint.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
