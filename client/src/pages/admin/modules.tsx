import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Package, Globe, Building2, Layers, Gamepad2,
  Link2, AlertTriangle, Code, FileText, Settings, Shield, Route, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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

  const renderModuleRow = (module: ModuleDefinition) => {
    const isEnabled = enabledModuleIds.includes(module.id);
    const supportsPlatform = module.contexts.includes('platform');

    return (
      <div
        key={module.id}
        className={cn(
          "flex items-center gap-4 px-4 py-3 border-b hover:bg-muted/50 cursor-pointer transition-colors",
          "border-l-4",
          isEnabled ? "border-l-green-500 bg-green-50/30 dark:bg-green-900/10" : "border-l-gray-200 dark:border-l-gray-700"
        )}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-switch]')) {
            return;
          }
          setSelectedModule(module);
          setShowModuleDetails(true);
        }}
        data-testid={`module-row-${module.id}`}
      >
        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">{module.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground truncate">{module.description}</p>
        </div>

        <Badge className={cn(getCategoryColor(module.category), "text-xs whitespace-nowrap")}>
          {module.category.replace('_', ' ')}
        </Badge>

        <Badge variant="outline" className="text-xs whitespace-nowrap">
          v{module.version}
        </Badge>

        <Badge className={cn(getStatusColor(module.status), "text-xs whitespace-nowrap")}>
          {module.status}
        </Badge>

        <div className="flex items-center gap-2" data-switch>
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

        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Module Library
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Platform-level module activation and management
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]" data-testid="select-category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id} data-testid={`filter-${cat.id}`}>
                    {cat.label} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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

      {catalogLoading ? (
        <Card>
          <CardContent className="p-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-b animate-pulse">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : filteredModules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No modules found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {filteredModules.map(renderModuleRow)}
          </CardContent>
        </Card>
      )}

      <Dialog 
        open={showModuleDetails} 
        onOpenChange={(open) => {
          setShowModuleDetails(open);
          if (open && selectedModule) {
            setEditedRoute(selectedModule.route || '');
          }
        }}
      >
        <DialogContent className="max-w-6xl max-h-[85vh]">
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
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
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

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Available Contexts
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedModule.contexts.map(context => (
                      <Badge key={context} variant="outline" className="text-xs flex items-center gap-1">
                        <ContextIcon context={context} />
                        {context}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

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

                {selectedModule.dependencies.length > 0 && (
                  <>
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
                    <Separator />
                  </>
                )}

                {selectedModule.conflicts && selectedModule.conflicts.length > 0 && (
                  <>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Conflicts
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedModule.conflicts.map(conflict => (
                          <Badge key={conflict} variant="destructive" className="text-xs">
                            {conflict}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {selectedModule.apiEndpoints.length > 0 && (
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
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
