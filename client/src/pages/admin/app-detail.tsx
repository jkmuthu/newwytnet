
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Package, FileText, RouteIcon, Settings, Shield, 
  History, ArrowLeft, Edit2, Save, X, Building2, Layers, Globe
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppDefinition {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  version?: string;
  route?: string;
  contexts?: Array<'hub' | 'app'>;
  versionHistory?: Array<{
    version: string;
    date: string;
    changes: string;
  }>;
  changelog?: string;
  restrictedTo?: string[];
  isActive?: boolean;
  moduleCount?: number;
  modules?: any[];
  createdAt: string;
  updatedAt: string;
}

export default function AppDetailPage() {
  const [, params] = useRoute("/engine/apps/:id");
  const [, navigate] = useLocation();
  const appId = params?.id;
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedRoute, setEditedRoute] = useState('');
  const [editedContexts, setEditedContexts] = useState({
    hub: false,
    app: false,
  });
  const [accessRestrictions, setAccessRestrictions] = useState({
    engineOnly: false,
    hubOnly: false,
    tenantSpecific: false,
  });
  const { toast } = useToast();

  // Fetch app details
  const { data: appData, isLoading } = useQuery({
    queryKey: [`/api/admin/apps/${appId}`],
    enabled: !!appId,
  });

  const app: AppDefinition | undefined = appData as AppDefinition;

  // Update app mutation
  const updateAppMutation = useMutation({
    mutationFn: async (data: { id: string; route?: string; contexts?: string[]; restrictions?: string[] }) => {
      const response = await fetch(`/api/admin/apps/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update app');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/apps/${appId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/apps'] });
      toast({
        title: "Success",
        description: "App updated successfully",
      });
      setIsEditMode(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update app",
        variant: "destructive",
      });
    },
  });

  const handleEnterEditMode = () => {
    if (app) {
      setEditedRoute(app.route || '');
      setEditedContexts({
        hub: app.contexts?.includes('hub') || false,
        app: app.contexts?.includes('app') || false,
      });
      setAccessRestrictions({
        engineOnly: app.restrictedTo?.includes('engine_only') || false,
        hubOnly: app.restrictedTo?.includes('hub_only') || false,
        tenantSpecific: app.restrictedTo?.includes('tenant_specific') || false,
      });
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSaveChanges = () => {
    if (!app) return;

    const contexts: string[] = [];
    if (editedContexts.hub) contexts.push('hub');
    if (editedContexts.app) contexts.push('app');

    const restrictions: string[] = [];
    if (accessRestrictions.engineOnly) restrictions.push('engine_only');
    if (accessRestrictions.hubOnly) restrictions.push('hub_only');
    if (accessRestrictions.tenantSpecific) restrictions.push('tenant_specific');

    updateAppMutation.mutate({
      id: app.id,
      route: editedRoute,
      contexts,
      restrictions,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading app details...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">App not found</p>
          <Button onClick={() => navigate('/engine/apps')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Apps
          </Button>
        </div>
      </div>
    );
  }

  const getAppIcon = (iconName?: string) => {
    if (!iconName) return <Layers className="h-6 w-6 text-muted-foreground" />;
    return <span className="text-2xl" role="img" aria-label="app icon">{iconName}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/engine/apps')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Apps
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-3">
              {getAppIcon(app.icon)}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{app.name}</h1>
                {app.version && (
                  <Badge variant="outline" className="mt-1">
                    v{app.version}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={updateAppMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  disabled={updateAppMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateAppMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={handleEnterEditMode}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        {app.description && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">{app.description}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  App Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                  {app.category ? (
                    <Badge variant="secondary">{app.category}</Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not set</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                  <Badge variant={app.isActive ? "default" : "secondary"}>
                    {app.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Module Count</p>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{app.moduleCount || 0}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-sm">
                    {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : '-'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Route Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RouteIcon className="h-5 w-5" />
                  App Route
                </CardTitle>
                <CardDescription>
                  The URL path where this app is accessible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="app-route">URL Path/Route</Label>
                  <Input
                    id="app-route"
                    value={isEditMode ? editedRoute : (app.route || '')}
                    onChange={(e) => setEditedRoute(e.target.value)}
                    placeholder="/app-path"
                    className="font-mono"
                    disabled={!isEditMode}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contexts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Available Contexts
                </CardTitle>
                <CardDescription>
                  Contexts determine where this app can be activated. <strong>Hub Context</strong> allows activation in organization hubs, while <strong>App Context</strong> allows activation in individual user workspaces.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="context-hub"
                      checked={isEditMode ? editedContexts.hub : (app.contexts?.includes('hub') || false)}
                      onCheckedChange={(checked) => {
                        if (isEditMode) {
                          setEditedContexts(prev => ({ ...prev, hub: checked as boolean }));
                        }
                      }}
                      disabled={!isEditMode}
                    />
                    <Label htmlFor="context-hub" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      Hub Context
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="context-app"
                      checked={isEditMode ? editedContexts.app : (app.contexts?.includes('app') || false)}
                      onCheckedChange={(checked) => {
                        if (isEditMode) {
                          setEditedContexts(prev => ({ ...prev, app: checked as boolean }));
                        }
                      }}
                      disabled={!isEditMode}
                    />
                    <Label htmlFor="context-app" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Layers className="h-3 w-3" />
                      App Context
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Access Restrictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Access Restrictions
                </CardTitle>
                <CardDescription>
                  Control who can access this app. <strong>Engine Only</strong> limits to platform admins, <strong>Hub Only</strong> limits to hub members, and <strong>Tenant Specific</strong> requires specific tenant permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="restriction-engine"
                      checked={isEditMode ? accessRestrictions.engineOnly : (app.restrictedTo?.includes('engine_only') || false)}
                      onCheckedChange={(checked) => {
                        if (isEditMode) {
                          setAccessRestrictions(prev => ({ ...prev, engineOnly: checked as boolean }));
                        }
                      }}
                      disabled={!isEditMode}
                    />
                    <Label htmlFor="restriction-engine" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      Engine Only
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="restriction-hub"
                      checked={isEditMode ? accessRestrictions.hubOnly : (app.restrictedTo?.includes('hub_only') || false)}
                      onCheckedChange={(checked) => {
                        if (isEditMode) {
                          setAccessRestrictions(prev => ({ ...prev, hubOnly: checked as boolean }));
                        }
                      }}
                      disabled={!isEditMode}
                    />
                    <Label htmlFor="restriction-hub" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      Hub Only
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="restriction-tenant"
                      checked={isEditMode ? accessRestrictions.tenantSpecific : (app.restrictedTo?.includes('tenant_specific') || false)}
                      onCheckedChange={(checked) => {
                        if (isEditMode) {
                          setAccessRestrictions(prev => ({ ...prev, tenantSpecific: checked as boolean }));
                        }
                      }}
                      disabled={!isEditMode}
                    />
                    <Label htmlFor="restriction-tenant" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      Tenant Specific
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modules */}
            {app.modules && app.modules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Composed Modules ({app.modules.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {app.modules.map((module: any, idx: number) => (
                      <Badge 
                        key={idx} 
                        variant={module.isRequired ? "default" : "outline"}
                      >
                        {module.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Changelog & Version History */}
          <div className="space-y-6">
            {/* Changelog */}
            {app.changelog && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Changelog
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                      {app.changelog}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Version History */}
            {app.versionHistory && app.versionHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Version History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {app.versionHistory.map((versionItem, idx) => (
                        <div 
                          key={idx} 
                          className="border rounded-lg p-3 bg-muted/30"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              v{versionItem.version}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(versionItem.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {versionItem.changes}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
