import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Globe, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  ExternalLink,
  Loader2,
  Layout,
  Palette,
  Settings,
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UserSite {
  id: string;
  displayId: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  status: 'draft' | 'published' | 'suspended';
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  category: string;
  defaultTheme: any;
  features: string[];
}

export default function WytSiteWorkspace() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [siteName, setSiteName] = useState("");
  const { toast } = useToast();

  const { data: sitesData, isLoading: sitesLoading } = useQuery({
    queryKey: ['/api/wytsite/sites'],
  });

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/wytsite/templates'],
  });

  const sites: UserSite[] = (sitesData as any)?.sites || [];
  const templates: Template[] = (templatesData as any)?.templates || [];

  const createSiteMutation = useMutation({
    mutationFn: async (data: { name: string; templateId?: string }) => {
      return apiRequest('/api/wytsite/sites', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wytsite/sites'] });
      setIsCreateOpen(false);
      setSiteName("");
      setSelectedTemplate(null);
      toast({
        title: "Site created",
        description: "Your new website has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create site",
        variant: "destructive",
      });
    },
  });

  const deleteSiteMutation = useMutation({
    mutationFn: async (siteId: string) => {
      return apiRequest(`/api/wytsite/sites/${siteId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wytsite/sites'] });
      toast({
        title: "Site deleted",
        description: "Your website has been deleted.",
      });
    },
  });

  const publishSiteMutation = useMutation({
    mutationFn: async (siteId: string) => {
      return apiRequest(`/api/wytsite/sites/${siteId}/publish`, 'POST');
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/wytsite/sites'] });
      toast({
        title: "Site published",
        description: `Your site is now live at ${data.url}`,
      });
    },
  });

  const handleCreateSite = () => {
    if (!siteName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a site name",
        variant: "destructive",
      });
      return;
    }
    createSiteMutation.mutate({
      name: siteName,
      templateId: selectedTemplate?.id,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (sitesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/u/wytapps">
            <Button variant="ghost" size="sm" data-testid="button-back-apps">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="h-6 w-6 text-indigo-600" />
              WytSite
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Build beautiful websites in minutes
            </p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-site">
              <Plus className="h-4 w-4 mr-2" />
              Create New Site
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Website</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  placeholder="My Awesome Website"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  data-testid="input-site-name"
                />
              </div>
              
              <div className="space-y-3">
                <Label>Choose a Template (Optional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !selectedTemplate ? 'ring-2 ring-indigo-600' : ''
                    }`}
                    onClick={() => setSelectedTemplate(null)}
                    data-testid="template-blank"
                  >
                    <CardContent className="p-4 text-center">
                      <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mb-2">
                        <Layout className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">Blank Site</p>
                    </CardContent>
                  </Card>
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-indigo-600' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                      data-testid={`template-${template.slug}`}
                    >
                      <CardContent className="p-4">
                        <div 
                          className="h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center mb-2"
                          style={{
                            background: template.defaultTheme?.primaryColor 
                              ? `linear-gradient(135deg, ${template.defaultTheme.primaryColor} 0%, ${template.defaultTheme.secondaryColor || template.defaultTheme.primaryColor} 100%)`
                              : undefined
                          }}
                        >
                          <Globe className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className="text-xs text-gray-500 truncate">{template.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSite} 
                disabled={createSiteMutation.isPending}
                data-testid="button-confirm-create"
              >
                {createSiteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Site'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sites.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
              <Globe className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No websites yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
              Create your first website to get started. Choose from our beautiful templates or start from scratch.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-site">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <Card key={site.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{site.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3" />
                      {site.subdomain}.wytsite.com
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`menu-site-${site.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/a/wytsite/${site.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Site
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/a/wytsite/${site.id}/settings`}>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      {site.status === 'published' ? (
                        <DropdownMenuItem onClick={() => window.open(`/site/${site.subdomain}`, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Live Site
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => publishSiteMutation.mutate(site.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this site?')) {
                            deleteSiteMutation.mutate(site.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(site.status)}>
                    {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <BarChart3 className="h-3 w-3" />
                    {site.viewCount} views
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/a/wytsite/${site.id}/edit`} data-testid={`button-edit-${site.id}`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <Link href={`/a/wytsite/${site.id}/design`} data-testid={`button-design-${site.id}`}>
                      <Palette className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
