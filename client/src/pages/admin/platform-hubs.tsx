import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Plus,
  Settings,
  Users,
  Search,
  ShieldCheck,
  Globe,
  Palette,
  FileText,
  Check,
  X,
  Copy,
  ExternalLink,
  AlertCircle,
  LayoutTemplate,
  RefreshCw,
  Store,
  GraduationCap,
  Calendar,
  Users2,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrashView } from "@/components/shared/TrashView";

interface PlatformHub {
  id: string;
  displayId: string;
  name: string;
  slug: string;
  subdomain: string;
  description: string | null;
  customDomain: string | null;
  domainVerified: boolean;
  favicon: string | null;
  ogImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  themeColors: any;
  status: string;
  admins?: HubAdmin[];
  adminCount?: number;
  createdAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
  deleteReason: string | null;
}

interface HubAdmin {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roleId: string | null;
  roleName: string | null;
  isActive: boolean;
  assignedAt: string;
}

interface User {
  id: string;
  displayId: string;
  name: string;
  email: string;
}

interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
  priority: number | null;
}

interface HubTemplate {
  id: string;
  displayId: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  thumbnail: string | null;
  defaultModules: string[];
  defaultTheme: Record<string, any>;
  defaultSettings: Record<string, any>;
  defaultPages: string[];
  features: string[];
  isPublic: boolean;
  requiresWytDev: boolean;
  usageCount: number;
  rating: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function AdminPlatformHubs() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHub, setSelectedHub] = useState<PlatformHub | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createHubOpen, setCreateHubOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all-hubs' | 'templates' | 'trash' | 'configurations'>('all-hubs');
  const [createFromTemplateOpen, setCreateFromTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<HubTemplate | null>(null);
  const [newHubName, setNewHubName] = useState("");
  const [newHubSlug, setNewHubSlug] = useState("");

  // Fetch platform hubs
  const { data: hubsData, isLoading: hubsLoading } = useQuery<{ success: boolean; hubs: PlatformHub[] }>({
    queryKey: ["/api/admin/platform-hubs"],
  });

  // Trash management queries and mutations
  const { data: trashHubsData, isLoading: isLoadingTrash } = useQuery<{
    success: boolean;
    hubs: PlatformHub[];
    count: number;
  }>({
    queryKey: ['/api/admin/trash/hubs'],
  });

  const restoreHubMutation = useMutation({
    mutationFn: async (hubId: string) => {
      return await apiRequest(`/api/admin/trash/hubs/${hubId}/restore`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trash/hubs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/platform-hubs'] });
      toast({ title: "Success", description: "Hub restored successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to restore hub", variant: "destructive" });
    }
  });

  const permanentlyDeleteHubMutation = useMutation({
    mutationFn: async (hubId: string) => {
      return await apiRequest(`/api/admin/trash/hubs/${hubId}/permanent`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trash/hubs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/platform-hubs'] });
      toast({ title: "Success", description: "Hub permanently deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete hub", variant: "destructive" });
    }
  });

  // Fetch all users (for admin assignment)
  const { data: usersData } = useQuery<{ success: boolean; users: User[] }>({
    queryKey: ["/api/admin/users"],
  });

  // Hub Templates
  const { data: templatesData, isLoading: templatesLoading } = useQuery<HubTemplate[]>({
    queryKey: ["/api/engine/hub-templates"],
  });

  const seedTemplatesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/engine/hub-templates/seed', 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/engine/hub-templates'] });
      toast({ title: "Success", description: "Hub templates seeded successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to seed templates", variant: "destructive" });
    }
  });

  const createHubFromTemplateMutation = useMutation({
    mutationFn: async ({ templateId, hubName, hubSlug }: { templateId: string; hubName: string; hubSlug: string }) => {
      return await apiRequest('/api/engine/hubs/from-template', 'POST', { templateId, hubName, hubSlug });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/platform-hubs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/engine/hub-templates'] });
      setCreateFromTemplateOpen(false);
      setSelectedTemplate(null);
      setNewHubName("");
      setNewHubSlug("");
      toast({ 
        title: "Hub Created!", 
        description: `Your hub is now available at ${data.url}` 
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create hub from template", variant: "destructive" });
    }
  });

  const templates = templatesData || [];

  const hubs = hubsData?.hubs || [];
  const users = usersData?.users || [];

  const filteredHubs = hubs.filter((hub) =>
    hub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hub.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hub.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-heading">
            All Hubs
          </h1>
          <p className="text-muted-foreground">
            Manage all hubs, their settings, branding, SEO, and domains
          </p>
        </div>
        {activeTab === 'all-hubs' && (
          <Button onClick={() => setCreateHubOpen(true)} data-testid="button-create-hub">
            <Plus className="h-4 w-4 mr-2" />
            Create Hub
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
          <TabsTrigger value="all-hubs" data-testid="tab-all-hubs">
            <Building2 className="h-4 w-4 mr-2" />
            All Hubs ({hubs.length})
          </TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">
            <LayoutTemplate className="h-4 w-4 mr-2" />
            Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="trash" data-testid="tab-trash">
            Trash ({trashHubsData?.count || 0})
          </TabsTrigger>
          <TabsTrigger value="configurations" data-testid="tab-configurations">
            <Settings className="h-4 w-4 mr-2" />
            Configurations
          </TabsTrigger>
        </TabsList>

        {/* All Hubs Tab */}
        <TabsContent value="all-hubs" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Hubs ({hubs.length})</CardTitle>
                  <CardDescription>View and manage hub settings and administrators</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search hubs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-hubs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {hubsLoading ? (
                <div className="text-center py-8">Loading hubs...</div>
              ) : filteredHubs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  {searchTerm ? "No hubs match your search" : "No hubs created yet"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Display ID</TableHead>
                      <TableHead>Hub Name</TableHead>
                      <TableHead>Access</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Admins</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHubs.map((hub) => (
                      <TableRow key={hub.id} data-testid={`row-hub-${hub.id}`}>
                        <TableCell>
                          <Badge variant="outline">{hub.displayId}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{hub.name}</div>
                            {hub.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {hub.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              /{hub.slug}
                            </code>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {hub.subdomain}.wytnet.com
                            </code>
                          </div>
                        </TableCell>
                        <TableCell>
                          {hub.customDomain ? (
                            <div className="flex items-center gap-2">
                              <code className="text-sm bg-primary/10 px-2 py-1 rounded">
                                {hub.customDomain}
                              </code>
                              {hub.domainVerified ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No custom domain</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={hub.status === "active" ? "default" : "secondary"}>
                            {hub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{hub.adminCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedHub(hub);
                              setSettingsOpen(true);
                            }}
                            data-testid={`button-settings-${hub.id}`}
                          >
                            <Settings className="h-3 w-3 mr-2" />
                            Settings
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutTemplate className="h-5 w-5" />
                    Hub Templates
                  </CardTitle>
                  <CardDescription>
                    Pre-built hub configurations to quickly create new hubs
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => seedTemplatesMutation.mutate()}
                  disabled={seedTemplatesMutation.isPending}
                  data-testid="button-seed-templates"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${seedTemplatesMutation.isPending ? 'animate-spin' : ''}`} />
                  {seedTemplatesMutation.isPending ? 'Seeding...' : 'Seed Templates'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="text-center py-8">Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <LayoutTemplate className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No templates available</h3>
                  <p className="mb-4">Click "Seed Templates" to add the default hub templates</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => {
                    const getCategoryIcon = (category: string) => {
                      switch (category) {
                        case 'community': return <Users2 className="h-6 w-6" />;
                        case 'marketplace': return <Store className="h-6 w-6" />;
                        case 'directory': return <FolderOpen className="h-6 w-6" />;
                        case 'learning': return <GraduationCap className="h-6 w-6" />;
                        case 'event': return <Calendar className="h-6 w-6" />;
                        default: return <Sparkles className="h-6 w-6" />;
                      }
                    };
                    
                    const getCategoryColor = (category: string) => {
                      switch (category) {
                        case 'community': return 'bg-green-500/10 text-green-600 border-green-200';
                        case 'marketplace': return 'bg-amber-500/10 text-amber-600 border-amber-200';
                        case 'directory': return 'bg-blue-500/10 text-blue-600 border-blue-200';
                        case 'learning': return 'bg-purple-500/10 text-purple-600 border-purple-200';
                        case 'event': return 'bg-pink-500/10 text-pink-600 border-pink-200';
                        default: return 'bg-indigo-500/10 text-indigo-600 border-indigo-200';
                      }
                    };
                    
                    return (
                      <Card 
                        key={template.id} 
                        className={`relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 ${!template.isActive ? 'opacity-60' : ''}`}
                        data-testid={`card-template-${template.slug}`}
                      >
                        <div className={`absolute top-0 left-0 right-0 h-2 ${getCategoryColor(template.category).split(' ')[0]}`} />
                        <CardHeader className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className={`p-3 rounded-xl ${getCategoryColor(template.category)}`}>
                              {getCategoryIcon(template.category)}
                            </div>
                            <Badge variant="secondary" className="capitalize">
                              {template.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg mt-4">{template.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap gap-1">
                            {(template.features as string[])?.slice(0, 4).map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature.replace(/-/g, ' ')}
                              </Badge>
                            ))}
                            {(template.features as string[])?.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{(template.features as string[]).length - 4} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{template.usageCount || 0} hubs created</span>
                            {template.requiresWytDev && (
                              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                WytDev Required
                              </Badge>
                            )}
                          </div>

                          <Button 
                            className="w-full" 
                            onClick={() => {
                              setSelectedTemplate(template);
                              setNewHubName('');
                              setNewHubSlug('');
                              setCreateFromTemplateOpen(true);
                            }}
                            disabled={!template.isActive}
                            data-testid={`button-use-template-${template.slug}`}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Use Template
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trash Tab */}
        <TabsContent value="trash" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trash ({trashHubsData?.count || 0})</CardTitle>
              <CardDescription>Deleted hubs - will be permanently removed after 90 days</CardDescription>
            </CardHeader>
            <CardContent>
              <TrashView
                items={trashHubsData?.hubs || []}
                isLoading={isLoadingTrash}
                entityType="Hub"
                onRestore={async (id: string) => { await restoreHubMutation.mutateAsync(id); }}
                onPermanentDelete={async (id: string) => { await permanentlyDeleteHubMutation.mutateAsync(id); }}
                renderItemName={(hub: PlatformHub) => hub.name}
                renderItemDetails={(hub: PlatformHub) => (
                  <div className="text-sm text-muted-foreground">
                    {hub.displayId && <span className="font-mono">{hub.displayId}</span>}
                    {hub.slug && <span className="ml-2">• /{hub.slug}</span>}
                    {hub.subdomain && <span className="ml-2">• {hub.subdomain}.wytnet.com</span>}
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurations Tab */}
        <TabsContent value="configurations" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Hub Configurations
              </CardTitle>
              <CardDescription>
                Configure platform-wide settings for all hubs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Total Hubs
                  </h3>
                  <p className="text-3xl font-bold">{hubs.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active platform hubs
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-600" />
                    Verified Domains
                  </h3>
                  <p className="text-3xl font-bold">
                    {hubs.filter(h => h.customDomain && h.domainVerified).length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Custom domains active
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Hub Administrators
                  </h3>
                  <p className="text-3xl font-bold">
                    {hubs.reduce((sum, h) => sum + (h.adminCount || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total hub admins assigned
                  </p>
                </div>
              </div>
              
              {/* Platform-Wide Configuration */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h4 className="font-semibold">Platform-Wide Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Default Hub Status</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Multi-Domain Routing</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Custom Domain Support</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subdomain Routing</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">SSL/TLS Certificates</span>
                    <Badge variant="default">Auto-Managed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Hub Creation</span>
                    <Badge variant="default">Super Admin Only</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hub Settings Dialog */}
      {selectedHub && (
        <HubSettingsDialog
          hub={selectedHub}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          users={users}
        />
      )}

      {/* Create Hub Dialog */}
      <CreateHubDialog open={createHubOpen} onOpenChange={setCreateHubOpen} />

      {/* Create from Template Dialog */}
      <Dialog open={createFromTemplateOpen} onOpenChange={setCreateFromTemplateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              Create Hub from Template
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate ? (
                <>Using the <strong>{selectedTemplate.name}</strong> template</>
              ) : (
                'Select a template to create your hub'
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will create a new hub with pre-configured modules: {(selectedTemplate.defaultModules as string[])?.join(', ') || 'None'}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="hub-name">Hub Name *</Label>
                <Input
                  id="hub-name"
                  placeholder="My Awesome Hub"
                  value={newHubName}
                  onChange={(e) => {
                    setNewHubName(e.target.value);
                    setNewHubSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                  }}
                  data-testid="input-template-hub-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hub-slug">Hub URL Slug *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/h/</span>
                  <Input
                    id="hub-slug"
                    placeholder="my-awesome-hub"
                    value={newHubSlug}
                    onChange={(e) => setNewHubSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                    data-testid="input-template-hub-slug"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your hub will be accessible at /h/{newHubSlug || 'your-slug'}
                </p>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCreateFromTemplateOpen(false);
                    setSelectedTemplate(null);
                    setNewHubName("");
                    setNewHubSlug("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedTemplate && newHubName && newHubSlug) {
                      createHubFromTemplateMutation.mutate({
                        templateId: selectedTemplate.id,
                        hubName: newHubName,
                        hubSlug: newHubSlug
                      });
                    }
                  }}
                  disabled={!newHubName || !newHubSlug || createHubFromTemplateMutation.isPending}
                  data-testid="button-create-from-template"
                >
                  {createHubFromTemplateMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Hub
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Hub Settings Dialog with Tabs
function HubSettingsDialog({
  hub,
  open,
  onOpenChange,
  users,
}: {
  hub: PlatformHub;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {hub.name}
          </DialogTitle>
          <DialogDescription>
            {hub.displayId} • Configure hub settings, branding, SEO, domain, and administrators
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="domain">Domain</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <GeneralSettingsTab hub={hub} onClose={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="branding" className="space-y-4 mt-4">
            <BrandingSettingsTab hub={hub} onClose={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 mt-4">
            <SEOSettingsTab hub={hub} onClose={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="domain" className="space-y-4 mt-4">
            <DomainSettingsTab hub={hub} onClose={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="admins" className="space-y-4 mt-4">
            <AdminsTab hub={hub} users={users} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// General Settings Tab
function GeneralSettingsTab({ hub, onClose }: { hub: PlatformHub; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: hub.name,
    slug: hub.slug,
    subdomain: hub.subdomain,
    description: hub.description || "",
    status: hub.status,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest(`/api/admin/platform-hubs/${hub.id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-hubs"] });
      toast({ title: "Hub settings updated successfully" });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update hub settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Hub Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          data-testid="input-hub-name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="my-hub"
            required
            data-testid="input-slug"
          />
          <p className="text-xs text-muted-foreground">
            Path: wytnet.com/hubs/{formData.slug}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subdomain">Subdomain</Label>
          <Input
            id="subdomain"
            value={formData.subdomain}
            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
            placeholder="myhub"
            required
            data-testid="input-subdomain"
          />
          <p className="text-xs text-muted-foreground">
            URL: {formData.subdomain}.wytnet.com
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          data-testid="textarea-description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger data-testid="select-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-general">
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

// Branding Settings Tab
function BrandingSettingsTab({ hub, onClose }: { hub: PlatformHub; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    favicon: hub.favicon || "",
    ogImage: hub.ogImage || "",
    themeColors: hub.themeColors || { primary: "#6366f1", secondary: "#8b5cf6" },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest(`/api/admin/platform-hubs/${hub.id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-hubs"] });
      toast({ title: "Branding settings updated successfully" });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update branding settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="favicon">Favicon URL</Label>
        <Input
          id="favicon"
          value={formData.favicon}
          onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
          placeholder="https://example.com/favicon.ico"
          data-testid="input-favicon"
        />
        <p className="text-xs text-muted-foreground">URL to the hub's favicon</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ogImage">OG Image URL</Label>
        <Input
          id="ogImage"
          value={formData.ogImage}
          onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
          placeholder="https://example.com/og-image.jpg"
          data-testid="input-og-image"
        />
        <p className="text-xs text-muted-foreground">Open Graph image for social sharing</p>
      </div>

      <div className="space-y-4">
        <Label>Theme Colors</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor" className="text-sm">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={formData.themeColors.primary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    themeColors: { ...formData.themeColors, primary: e.target.value },
                  })
                }
                className="h-10 w-20"
                data-testid="input-primary-color"
              />
              <Input
                value={formData.themeColors.primary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    themeColors: { ...formData.themeColors, primary: e.target.value },
                  })
                }
                placeholder="#6366f1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor" className="text-sm">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={formData.themeColors.secondary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    themeColors: { ...formData.themeColors, secondary: e.target.value },
                  })
                }
                className="h-10 w-20"
                data-testid="input-secondary-color"
              />
              <Input
                value={formData.themeColors.secondary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    themeColors: { ...formData.themeColors, secondary: e.target.value },
                  })
                }
                placeholder="#8b5cf6"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-branding">
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

// SEO Settings Tab
function SEOSettingsTab({ hub, onClose }: { hub: PlatformHub; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    seoTitle: hub.seoTitle || "",
    seoDescription: hub.seoDescription || "",
    seoKeywords: hub.seoKeywords || "",
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest(`/api/admin/platform-hubs/${hub.id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-hubs"] });
      toast({ title: "SEO settings updated successfully" });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update SEO settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          SEO settings help your hub rank better in search engines and appear correctly in social media shares.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="seoTitle">SEO Title</Label>
        <Input
          id="seoTitle"
          value={formData.seoTitle}
          onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
          placeholder="Your Hub Name - Description"
          maxLength={60}
          data-testid="input-seo-title"
        />
        <p className="text-xs text-muted-foreground">
          {formData.seoTitle.length}/60 characters (recommended)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seoDescription">SEO Description</Label>
        <Textarea
          id="seoDescription"
          value={formData.seoDescription}
          onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
          placeholder="A brief description of your hub for search engines..."
          rows={3}
          maxLength={160}
          data-testid="textarea-seo-description"
        />
        <p className="text-xs text-muted-foreground">
          {formData.seoDescription.length}/160 characters (recommended)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seoKeywords">SEO Keywords</Label>
        <Input
          id="seoKeywords"
          value={formData.seoKeywords}
          onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
          placeholder="keyword1, keyword2, keyword3"
          data-testid="input-seo-keywords"
        />
        <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-seo">
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

// Domain Settings Tab
function DomainSettingsTab({ hub, onClose }: { hub: PlatformHub; onClose: () => void }) {
  const { toast } = useToast();
  const [customDomain, setCustomDomain] = useState(hub.customDomain || "");
  const [showDNSGuide, setShowDNSGuide] = useState(false);

  const { data: dnsData } = useQuery<{
    success: boolean;
    domain: string;
    dnsRecords: DNSRecord[];
    verified: boolean;
  }>({
    queryKey: ["/api/admin/platform-hubs", hub.id, "dns-records"],
    enabled: !!hub.customDomain,
  });

  const updateDomainMutation = useMutation({
    mutationFn: (domain: string | null) =>
      apiRequest(`/api/admin/platform-hubs/${hub.id}/domain`, "PUT", { customDomain: domain }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-hubs"] });
      toast({ title: "Custom domain updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update custom domain",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/api/admin/platform-hubs/${hub.id}/verify-domain`, "POST"),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-hubs"] });
      toast({
        title: data.verified ? "Domain verified successfully" : "Domain verification failed",
        description: data.message,
        variant: data.verified ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to verify domain",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateDomain = () => {
    updateDomainMutation.mutate(customDomain || null);
  };

  const handleRemoveDomain = () => {
    if (confirm("Are you sure you want to remove the custom domain?")) {
      updateDomainMutation.mutate(null);
      setCustomDomain("");
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          Configure a custom domain for this hub. Visitors can access the hub at your custom domain instead of the default subdomain.
        </AlertDescription>
      </Alert>

      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <div>
          <h3 className="font-semibold mb-2">Default Access URLs</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="text-sm bg-background px-2 py-1 rounded flex-1">
                wytnet.com/hubs/{hub.slug}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(`wytnet.com/hubs/${hub.slug}`);
                  toast({ title: "Copied to clipboard" });
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-background px-2 py-1 rounded flex-1">
                {hub.subdomain}.wytnet.com
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(`${hub.subdomain}.wytnet.com`);
                  toast({ title: "Copied to clipboard" });
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="customDomain">Custom Domain</Label>
        <div className="flex gap-2">
          <Input
            id="customDomain"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="yourdomain.com"
            disabled={updateDomainMutation.isPending}
            data-testid="input-custom-domain"
          />
          <Button
            onClick={handleUpdateDomain}
            disabled={updateDomainMutation.isPending || customDomain === hub.customDomain}
            data-testid="button-update-domain"
          >
            {updateDomainMutation.isPending ? "Updating..." : "Update"}
          </Button>
        </div>

        {hub.customDomain && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${hub.domainVerified ? "bg-green-600" : "bg-amber-600"}`} />
                <div>
                  <code className="text-sm font-medium">{hub.customDomain}</code>
                  <p className="text-xs text-muted-foreground">
                    {hub.domainVerified ? "Verified and active" : "Pending verification"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!hub.domainVerified && (
                  <Button
                    size="sm"
                    onClick={() => verifyDomainMutation.mutate()}
                    disabled={verifyDomainMutation.isPending}
                    data-testid="button-verify-domain"
                  >
                    {verifyDomainMutation.isPending ? "Verifying..." : "Verify"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDNSGuide(!showDNSGuide)}
                  data-testid="button-dns-guide"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  DNS Setup
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveDomain}
                  data-testid="button-remove-domain"
                >
                  Remove
                </Button>
              </div>
            </div>

            {showDNSGuide && dnsData?.dnsRecords && (
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-semibold">DNS Configuration Required</h4>
                <p className="text-sm text-muted-foreground">
                  Add these DNS records to your domain provider to complete the setup:
                </p>
                <div className="space-y-2">
                  {dnsData.dnsRecords.map((record, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="grid grid-cols-4 gap-4 flex-1 text-sm">
                          <div>
                            <span className="text-xs font-semibold text-muted-foreground">TYPE</span>
                            <p className="font-mono">{record.type}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-muted-foreground">NAME</span>
                            <p className="font-mono">{record.name}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-xs font-semibold text-muted-foreground">VALUE</span>
                            <p className="font-mono truncate">{record.value}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(record.value);
                            toast({ title: "Copied to clipboard" });
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    DNS changes can take up to 48 hours to propagate. After adding these records, click "Verify" to check the configuration.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

// Admins Tab
function AdminsTab({ hub, users }: { hub: PlatformHub; users: User[] }) {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Fetch fresh hub data with admins
  const { data: hubData } = useQuery<{ success: boolean; hub: PlatformHub }>({
    queryKey: ["/api/admin/platform-hubs", hub.id],
  });

  const currentHub = hubData?.hub || hub;
  const currentAdmins = currentHub.admins || [];

  const assignAdminMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest(`/api/admin/platform-hubs/${hub.id}/admins`, "POST", { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-hubs", hub.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-hubs"] });
      toast({ title: "Hub admin assigned successfully" });
      setSelectedUserId("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to assign hub admin",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: (adminId: string) =>
      apiRequest(`/api/admin/platform-hubs/${hub.id}/admins/${adminId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-hubs", hub.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-hubs"] });
      toast({ title: "Hub admin removed successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove hub admin",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentAdminUserIds = new Set(currentAdmins.map((a) => a.userId));
  const availableUsers = users.filter((u) => !currentAdminUserIds.has(u.id));

  return (
    <div className="space-y-6">
      {/* Current Admins */}
      <div>
        <h3 className="font-semibold mb-3">Current Administrators</h3>
        {currentAdmins.length > 0 ? (
          <div className="space-y-2">
            {currentAdmins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-3 border rounded-lg"
                data-testid={`admin-${admin.userId}`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{admin.userName}</div>
                    <div className="text-sm text-muted-foreground">{admin.userEmail}</div>
                    {admin.roleName && (
                      <Badge variant="outline" className="mt-1">
                        {admin.roleName}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm(`Remove ${admin.userName} as hub admin?`)) {
                      removeAdminMutation.mutate(admin.id);
                    }
                  }}
                  disabled={removeAdminMutation.isPending}
                  data-testid={`button-remove-${admin.userId}`}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground border rounded-lg">
            No administrators assigned yet
          </div>
        )}
      </div>

      {/* Assign New Admin */}
      <div>
        <h3 className="font-semibold mb-3">Assign New Administrator</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Select User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger data-testid="select-user">
                <SelectValue placeholder="Choose a user to assign..." />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    All users are already assigned as admins
                  </div>
                ) : (
                  availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => selectedUserId && assignAdminMutation.mutate(selectedUserId)}
            disabled={!selectedUserId || assignAdminMutation.isPending}
            className="w-full"
            data-testid="button-assign-admin"
          >
            {assignAdminMutation.isPending ? "Assigning..." : "Assign as Hub Admin"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Create Hub Dialog (Basic Implementation)
function CreateHubDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    subdomain: "",
    description: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("/api/admin/platform-hubs", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-hubs"] });
      toast({ title: "Hub created successfully" });
      onOpenChange(false);
      setFormData({ name: "", slug: "", subdomain: "", description: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create hub",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Hub</DialogTitle>
          <DialogDescription>
            Create a new platform hub with custom branding and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">Hub Name</Label>
            <Input
              id="create-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-create-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-slug">URL Slug</Label>
              <Input
                id="create-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="my-hub"
                required
                data-testid="input-create-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-subdomain">Subdomain</Label>
              <Input
                id="create-subdomain"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                placeholder="myhub"
                required
                data-testid="input-create-subdomain"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-description">Description</Label>
            <Textarea
              id="create-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              data-testid="textarea-create-description"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} data-testid="button-create-hub">
              {createMutation.isPending ? "Creating..." : "Create Hub"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
