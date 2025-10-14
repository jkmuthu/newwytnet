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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { Search, Plus, Layers, Package, Bot, Sparkles } from "lucide-react";
import AdminAppBuilder from "./app-builder";

// Form schema for creating new app
const createAppSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
  moduleIds: z.array(z.string()).default([]),
});

type CreateAppForm = z.infer<typeof createAppSchema>;

export default function AdminApps() {
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('registry');
  const { toast } = useToast();

  // Fetch apps with modules
  const { data: appsData, isLoading } = useQuery({
    queryKey: ['/api/admin/apps'],
  });

  // Fetch platform modules for selection
  const { data: modulesData } = useQuery({
    queryKey: ['/api/admin/platform-modules'],
  });

  const apps = (appsData as any)?.apps || [];
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
              {filteredApps.map((app: any) => (
                <Card key={app.id} className="hover:border-primary/50 transition-colors" data-testid={`card-app-${app.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {app.icon && (
                            <span className="text-2xl" role="img" aria-label="app icon">
                              {app.icon}
                            </span>
                          )}
                          {app.name}
                        </CardTitle>
                        <CardDescription className="mt-2">{app.description || "No description"}</CardDescription>
                      </div>
                      {app.category && (
                        <Badge variant="secondary" data-testid={`badge-category-${app.id}`}>
                          {app.category}
                        </Badge>
                      )}
                    </div>
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
                            {app.modules.map((module: any, idx: number) => (
                              <Badge
                                key={idx}
                                variant={module.isRequired ? "default" : "outline"}
                                className="text-xs"
                                data-testid={`badge-module-${app.id}-${idx}`}
                              >
                                {module.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No modules assigned</p>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge variant={app.isActive ? "default" : "secondary"} data-testid={`badge-status-${app.id}`}>
                          {app.isActive ? "Active" : "Inactive"}
                        </Badge>
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
    </div>
  );
}
