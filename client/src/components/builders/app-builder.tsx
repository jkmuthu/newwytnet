import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AppBuilder() {
  const [appConfig, setAppConfig] = useState({
    name: 'WytCRM',
    version: '1.0.0',
    description: 'Complete CRM solution with contact, lead, and deal management',
    selectedModules: [
      { id: '1', name: 'Contact Module', description: 'Customer contact management', icon: 'address-book', color: 'green' },
      { id: '2', name: 'Lead Module', description: 'Lead tracking and qualification', icon: 'chart-line', color: 'blue' },
      { id: '3', name: 'Deal Module', description: 'Sales pipeline management', icon: 'handshake', color: 'purple' },
    ]
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apps } = useQuery({
    queryKey: ["/api/apps"],
    retry: false,
  });

  const { data: models } = useQuery({
    queryKey: ["/api/models"],
    retry: false,
  });

  const createAppMutation = useMutation({
    mutationFn: async (appData: any) => {
      return await apiRequest("/api/apps", "POST", appData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "App created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBuildApp = () => {
    const manifest = {
      name: appConfig.name,
      version: appConfig.version,
      description: appConfig.description,
      modules: appConfig.selectedModules.map(m => m.id),
      pricing: {
        free: { price: 0, features: ['100 contacts', 'Basic features', 'Email support'] },
        pro: { price: 999, features: ['10,000 contacts', 'Advanced features', 'Priority support'] },
        enterprise: { price: 2999, features: ['Unlimited contacts', 'All features', '24/7 support'] }
      }
    };

    createAppMutation.mutate({
      key: appConfig.name.toLowerCase().replace(/\s+/g, '-'),
      name: appConfig.name,
      description: appConfig.description,
      version: appConfig.version,
      manifest,
      categories: ['crm', 'business'],
      status: 'draft'
    });
  };

  const handleRemoveModule = (moduleId: string) => {
    setAppConfig({
      ...appConfig,
      selectedModules: appConfig.selectedModules.filter(m => m.id !== moduleId)
    });
  };

  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
  };

  const iconColors = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">App Builder</h2>
          <p className="text-muted-foreground">Compose modules into complete applications</p>
        </div>
        <Button data-testid="button-new-app">
          <i className="fas fa-plus mr-2"></i>New App
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* App Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">App Name</label>
                  <Input
                    value={appConfig.name}
                    onChange={(e) => setAppConfig({...appConfig, name: e.target.value})}
                    data-testid="input-app-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Version</label>
                  <Input
                    value={appConfig.version}
                    onChange={(e) => setAppConfig({...appConfig, version: e.target.value})}
                    data-testid="input-app-version"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground block mb-2">Description</label>
                  <Textarea
                    rows={3}
                    value={appConfig.description}
                    onChange={(e) => setAppConfig({...appConfig, description: e.target.value})}
                    data-testid="textarea-app-description"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected Modules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appConfig.selectedModules.map((module) => (
                <div
                  key={module.id}
                  className={`flex items-center justify-between p-3 ${colorClasses[module.color as keyof typeof colorClasses]} rounded-md border`}
                >
                  <div className="flex items-center space-x-3">
                    <i className={`fas fa-${module.icon} ${iconColors[module.color as keyof typeof iconColors]}`}></i>
                    <div>
                      <span className="font-medium text-foreground">{module.name}</span>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveModule(module.id)}
                    className="text-destructive hover:text-destructive/80"
                    data-testid={`button-remove-${module.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              ))}
              
              <Button variant="outline" className="w-full border-dashed" data-testid="button-add-module">
                <i className="fas fa-plus mr-2"></i>Add Module
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Free Tier</h4>
                  <p className="text-2xl font-bold text-foreground mb-2">₹0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 100 contacts</li>
                    <li>• Basic features</li>
                    <li>• Email support</li>
                  </ul>
                </div>
                <div className="border-2 border-primary rounded-lg p-4 relative">
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">Popular</Badge>
                  <h4 className="font-medium text-foreground mb-2">Pro</h4>
                  <p className="text-2xl font-bold text-foreground mb-2">₹999<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 10,000 contacts</li>
                    <li>• Advanced features</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Enterprise</h4>
                  <p className="text-2xl font-bold text-foreground mb-2">₹2,999<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Unlimited contacts</li>
                    <li>• All features</li>
                    <li>• 24/7 support</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Build Actions & Published Apps */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Build Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={handleBuildApp}
                disabled={createAppMutation.isPending}
                data-testid="button-build-app"
              >
                <i className="fas fa-hammer mr-2"></i>
                {createAppMutation.isPending ? "Building..." : "Build App"}
              </Button>
              <Button variant="secondary" className="w-full" data-testid="button-preview-app">
                <i className="fas fa-eye mr-2"></i>Preview
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-export-app">
                <i className="fas fa-download mr-2"></i>Export
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Published Apps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {apps?.map((app: any) => (
                <div key={app.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-address-book text-blue-600"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground text-sm" data-testid={`text-app-${app.name.toLowerCase()}`}>
                        {app.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">v{app.version}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <Button variant="secondary" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" data-testid={`button-view-app-${app.name.toLowerCase()}`}>
                      View
                    </Button>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-muted-foreground">
                  No apps published yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
