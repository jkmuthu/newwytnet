import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { 
  Search, Plus, Layers, Package, Bot, Building2, 
  Info, FileText, Route as RouteIcon, Settings, 
  Shield, Globe, History, CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminAppBuilder from "./app-builder";
import { AdminDetailWorkspace } from "@/components/admin/AdminDetailWorkspace";
import { AIAssistantChat } from "@/components/admin/AIAssistantChat";

// App interface with new fields
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
}

// Form schema for creating new app
const createAppSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
  moduleIds: z.array(z.string()).default([]),
  route: z.string().optional(),
  version: z.string().optional(),
  contexts: z.array(z.enum(['hub', 'app'])).default(['app']),
});

type CreateAppForm = z.infer<typeof createAppSchema>;

export default function AdminApps() {
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('registry');
  const [selectedApp, setSelectedApp] = useState<AppDefinition | null>(null);
  const [showAppDetails, setShowAppDetails] = useState(false);
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

  // Fetch apps with modules
  const { data: appsData, isLoading } = useQuery({
    queryKey: ['/api/admin/apps'],
  });

  // Fetch platform modules for selection
  const { data: modulesData } = useQuery({
    queryKey: ['/api/admin/platform-modules'],
  });

  const apps: AppDefinition[] = (appsData as any)?.apps || [];
  const modules = (modulesData as any)?.modules || [];

  // Filter apps by search
  const filteredApps = apps.filter((app: any) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create app mutation
  const createAppMutation = useMutation({
    mutationFn: async (data: CreateAppForm) => {
      const response = await fetch('/api/admin/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create app');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/apps'] });
      toast({
        title: "Success",
        description: "App created successfully",
      });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create app",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateAppForm>({
    resolver: zodResolver(createAppSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
      category: "",
      moduleIds: [],
      route: "",
      version: "",
      contexts: ['app'],
    },
  });

  const onSubmit = (data: CreateAppForm) => {
    createAppMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Apps</h1>
          <p className="text-muted-foreground">Build and manage applications</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="registry" className="gap-2" data-testid="tab-registry">
            <Layers className="h-4 w-4" />
            Apps Registry
          </TabsTrigger>
          <TabsTrigger value="ai-builder" className="gap-2" data-testid="tab-ai-builder">
            <Bot className="h-4 w-4" />
            AI Builder
          </TabsTrigger>
        </TabsList>

        {/* Apps Registry Tab */}
        <TabsContent value="registry" className="space-y-6 mt-6">
          {/* Create App Button */}
          <div className="flex justify-end">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-create-app">
                  <Plus className="h-4 w-4" />
                  Create App
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New App</DialogTitle>
                  <DialogDescription>
                    Compose a new application from platform modules
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>App Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., WytTask Manager" {...field} data-testid="input-app-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., wyttask-manager" {...field} data-testid="input-app-slug" />
                          </FormControl>
                          <FormDescription>Lowercase with hyphens</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description..." {...field} data-testid="input-app-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-app-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="productivity">Productivity</SelectItem>
                              <SelectItem value="utility">Utility</SelectItem>
                              <SelectItem value="ai">AI</SelectItem>
                              <SelectItem value="communication">Communication</SelectItem>
                              <SelectItem value="analytics">Analytics</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon (Emoji)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 🚀" {...field} data-testid="input-app-icon" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="route"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Route</FormLabel>
                          <FormControl>
                            <Input placeholder="/app-path" {...field} className="font-mono" data-testid="input-app-route-create" />
                          </FormControl>
                          <FormDescription>URL path where app will be accessible</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input placeholder="1.0.0" {...field} data-testid="input-app-version" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <FormLabel>Available Contexts</FormLabel>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="create-context-hub"
                            checked={form.watch('contexts')?.includes('hub')}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('contexts') || [];
                              if (checked) {
                                form.setValue('contexts', [...current, 'hub']);
                              } else {
                                form.setValue('contexts', current.filter(c => c !== 'hub'));
                              }
                            }}
                            data-testid="checkbox-create-context-hub"
                          />
                          <Label htmlFor="create-context-hub" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                            <Building2 className="h-3 w-3" />
                            Hub Context
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="create-context-app"
                            checked={form.watch('contexts')?.includes('app')}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('contexts') || [];
                              if (checked) {
                                form.setValue('contexts', [...current, 'app']);
                              } else {
                                form.setValue('contexts', current.filter(c => c !== 'app'));
                              }
                            }}
                            data-testid="checkbox-create-context-app"
                          />
                          <Label htmlFor="create-context-app" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                            <Layers className="h-3 w-3" />
                            App Context
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} data-testid="button-cancel">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createAppMutation.isPending} data-testid="button-submit-app">
                        {createAppMutation.isPending ? "Creating..." : "Create App"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-apps"
                />
              </div>
            </CardContent>
          </Card>

          {/* Apps Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading apps...</div>
          ) : filteredApps.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No apps found</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Create your first app to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app: AppDefinition) => (
                <Card key={app.id} className={cn(
                  "hover:shadow-lg transition-all duration-200 border-l-4",
                  app.isActive ? "border-l-green-500" : "border-l-gray-300"
                )} data-testid={`card-app-${app.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="flex items-center gap-2">
                            {app.icon && (
                              <span className="text-2xl" role="img" aria-label="app icon">
                                {app.icon}
                              </span>
                            )}
                            {app.name}
                          </CardTitle>
                          {app.isActive && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        </div>
                        <div className="flex gap-2 mb-2 flex-wrap">
                          {app.category && (
                            <Badge variant="secondary" data-testid={`badge-category-${app.id}`}>
                              {app.category}
                            </Badge>
                          )}
                          {app.version && (
                            <Badge variant="outline" className="text-xs" data-testid={`badge-version-${app.id}`}>
                              v{app.version}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm line-clamp-2">
                          {app.description || "No description"}
                        </CardDescription>
                      </div>
                    </div>

                    {/* Route Display */}
                    {app.route && (
                      <div className="flex items-center gap-2 border-t pt-3 mt-3">
                        <RouteIcon className="h-3 w-3 text-muted-foreground" />
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400" data-testid={`route-${app.id}`}>
                          {app.route}
                        </code>
                      </div>
                    )}

                    {/* Contexts */}
                    {app.contexts && app.contexts.length > 0 && (
                      <div className="flex items-center gap-2 border-t pt-3 mt-3">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Contexts:</span>
                        <div className="flex gap-1">
                          {app.contexts.map(context => (
                            <Badge key={context} variant="outline" className="text-xs flex items-center gap-1" data-testid={`badge-context-${app.id}-${context}`}>
                              {context === 'hub' ? <Building2 className="h-3 w-3" /> : <Layers className="h-3 w-3" />}
                              {context}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Module Composition */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>Modules ({app.moduleCount || 0})</span>
                        </div>
                        {app.modules && app.modules.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {app.modules.slice(0, 3).map((module: any, idx: number) => (
                              <Badge
                                key={idx}
                                variant={module.isRequired ? "default" : "outline"}
                                className="text-xs"
                                data-testid={`badge-module-${app.id}-${idx}`}
                              >
                                {module.name}
                              </Badge>
                            ))}
                            {app.modules.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{app.modules.length - 3} more</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No modules assigned</p>
                        )}
                      </div>

                      {/* Access Restrictions */}
                      {app.restrictedTo && app.restrictedTo.length > 0 && (
                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                            <Shield className="h-3 w-3" />
                            <span>Access Restrictions</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {app.restrictedTo.map((restriction, idx) => (
                              <Badge 
                                key={idx} 
                                variant="secondary" 
                                className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                                data-testid={`badge-restriction-${app.id}-${idx}`}
                              >
                                {restriction}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status and Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge variant={app.isActive ? "default" : "secondary"} data-testid={`badge-status-${app.id}`}>
                          {app.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setShowAppDetails(true);
                            setEditedRoute(app.route || '');
                            setEditedContexts({
                              hub: app.contexts?.includes('hub') || false,
                              app: app.contexts?.includes('app') || false,
                            });
                          }}
                          data-testid={`button-view-details-${app.id}`}
                        >
                          <Info className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* AI Builder Tab */}
        <TabsContent value="ai-builder" className="mt-6">
          <AdminAppBuilder />
        </TabsContent>
      </Tabs>

      {/* App Details Dialog */}
      <Dialog 
        open={showAppDetails} 
        onOpenChange={(open) => {
          setShowAppDetails(open);
          if (open && selectedApp) {
            setEditedRoute(selectedApp.route || '');
            setEditedContexts({
              hub: selectedApp.contexts?.includes('hub') || false,
              app: selectedApp.contexts?.includes('app') || false,
            });
            setAccessRestrictions({
              engineOnly: selectedApp.restrictedTo?.includes('engine_only') || false,
              hubOnly: selectedApp.restrictedTo?.includes('hub_only') || false,
              tenantSpecific: selectedApp.restrictedTo?.includes('tenant_specific') || false,
            });
          }
        }}
      >
        <DialogContent className="max-w-6xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {selectedApp?.name}
              {selectedApp?.version && (
                <Badge variant="outline" className="ml-2" data-testid="dialog-version-badge">
                  v{selectedApp.version}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>{selectedApp?.description || "No description available"}</DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <AdminDetailWorkspace
              leftContent={
                <div className="space-y-6">
              {/* Metadata */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</p>
                  {selectedApp.category ? (
                    <Badge variant="secondary" data-testid="dialog-category">
                      {selectedApp.category}
                    </Badge>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not set</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <Badge variant={selectedApp.isActive ? "default" : "secondary"} data-testid="dialog-status">
                    {selectedApp.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Version</p>
                  {selectedApp.version ? (
                    <Badge variant="outline" data-testid="dialog-version">v{selectedApp.version}</Badge>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not set</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Changelog */}
              {selectedApp.changelog && (
                <>
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Changelog
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300" data-testid="dialog-changelog">
                        {selectedApp.changelog}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Route Editor */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <RouteIcon className="h-4 w-4" />
                  App Route
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="app-route" className="text-sm text-gray-600 dark:text-gray-400">
                    URL Path/Route
                  </Label>
                  <Input
                    id="app-route"
                    value={editedRoute}
                    onChange={(e) => setEditedRoute(e.target.value)}
                    placeholder="/app-path"
                    className="font-mono"
                    data-testid="input-app-route"
                  />
                  <p className="text-xs text-muted-foreground">
                    Define the URL route where this app is accessible
                  </p>
                </div>
              </div>

              <Separator />

              {/* Contexts */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Available Contexts
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="context-hub"
                      checked={editedContexts.hub}
                      onCheckedChange={(checked) => 
                        setEditedContexts(prev => ({ ...prev, hub: checked as boolean }))
                      }
                      data-testid="checkbox-context-hub"
                    />
                    <Label htmlFor="context-hub" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      Hub Context
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="context-app"
                      checked={editedContexts.app}
                      onCheckedChange={(checked) => 
                        setEditedContexts(prev => ({ ...prev, app: checked as boolean }))
                      }
                      data-testid="checkbox-context-app"
                    />
                    <Label htmlFor="context-app" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Layers className="h-3 w-3" />
                      App Context
                    </Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Select the contexts where this app can be activated
                </p>
              </div>

              <Separator />

              {/* Access Restrictions */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Access Restrictions
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="restriction-engine"
                      checked={accessRestrictions.engineOnly}
                      onCheckedChange={(checked) => 
                        setAccessRestrictions(prev => ({ ...prev, engineOnly: checked as boolean }))
                      }
                      data-testid="checkbox-restriction-engine"
                    />
                    <Label htmlFor="restriction-engine" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      Engine Only
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="restriction-hub"
                      checked={accessRestrictions.hubOnly}
                      onCheckedChange={(checked) => 
                        setAccessRestrictions(prev => ({ ...prev, hubOnly: checked as boolean }))
                      }
                      data-testid="checkbox-restriction-hub"
                    />
                    <Label htmlFor="restriction-hub" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      Hub Only
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="restriction-tenant"
                      checked={accessRestrictions.tenantSpecific}
                      onCheckedChange={(checked) => 
                        setAccessRestrictions(prev => ({ ...prev, tenantSpecific: checked as boolean }))
                      }
                      data-testid="checkbox-restriction-tenant"
                    />
                    <Label htmlFor="restriction-tenant" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      Tenant Specific
                    </Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Define access restrictions for this app
                </p>
              </div>

              {/* Version History */}
              {selectedApp.versionHistory && selectedApp.versionHistory.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Version History
                    </h4>
                    <div className="space-y-3">
                      {selectedApp.versionHistory.map((versionItem, idx) => (
                        <div 
                          key={idx} 
                          className="border rounded-lg p-3 bg-muted/30"
                          data-testid={`version-history-${idx}`}
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
                  </div>
                </>
              )}

              {/* Modules */}
              {selectedApp.modules && selectedApp.modules.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Composed Modules ({selectedApp.modules.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.modules.map((module: any, idx: number) => (
                        <Badge 
                          key={idx} 
                          variant={module.isRequired ? "default" : "outline"}
                          data-testid={`dialog-module-${idx}`}
                        >
                          {module.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
                </div>
              }
              rightContent={
                <AIAssistantChat
                  resourceType="app"
                  resourceId={selectedApp.id}
                  resourceName={selectedApp.name}
                  onApplySuggestions={(suggestions) => {
                    if (suggestions.route) setEditedRoute(suggestions.route);
                    if (suggestions.contexts) {
                      setEditedContexts({
                        hub: suggestions.contexts.includes('hub'),
                        app: suggestions.contexts.includes('app'),
                      });
                    }
                    if (suggestions.restrictions) {
                      setAccessRestrictions({
                        engineOnly: suggestions.restrictions.includes('engine_only'),
                        hubOnly: suggestions.restrictions.includes('hub_only'),
                        tenantSpecific: suggestions.restrictions.includes('tenant_specific'),
                      });
                    }
                    toast({
                      title: "Suggestions Applied",
                      description: "AI suggestions have been applied. Review and save changes.",
                    });
                  }}
                />
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
