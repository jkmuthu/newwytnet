import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Webhook, Edit, Trash2, ExternalLink, Eye, Package, Database, Code } from "lucide-react";

interface ApiEntry {
  id: string;
  displayId: string;
  name: string;
  originalName?: string;
  slug: string;
  description: string;
  type: 'wytmodule' | 'wytapp' | 'wytdataset' | 'thirdparty';
  sourceId?: string;
  isWhiteLabeled: boolean;
  baseUrl?: string;
  version: string;
  authType?: string;
  docsUrl?: string;
  category?: string;
  tags: string[];
  status: string;
  isPublic: boolean;
  usageCount: number;
  icon?: string;
  logoUrl?: string;
  websiteUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApiLibraryPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("thirdparty");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ApiEntry | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    originalName: "",
    description: "",
    baseUrl: "",
    version: "1.0.0",
    authType: "api_key",
    docsUrl: "",
    category: "",
    tags: "",
    isWhiteLabeled: true,
    status: "active",
    isPublic: true,
  });

  // Fetch all API entries
  const { data: apiData, isLoading } = useQuery<{ success: boolean; entries: ApiEntry[] }>({
    queryKey: ['/api/admin/api-library'],
  });

  // Filter entries by type
  const filterByType = (type: string) => {
    return apiData?.entries?.filter(entry => entry.type === type) || [];
  };

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingEntry 
        ? `/api/admin/api-library/${editingEntry.id}`
        : '/api/admin/api-library';
      const method = editingEntry ? 'PATCH' : 'POST';
      
      return apiRequest(url, method, {
        ...data,
        type: activeTab,
        tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-library'] });
      toast({
        title: "Success",
        description: editingEntry ? "API updated successfully" : "API added successfully",
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save API",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/api-library/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-library'] });
      toast({
        title: "Success",
        description: "API deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      originalName: "",
      description: "",
      baseUrl: "",
      version: "1.0.0",
      authType: "api_key",
      docsUrl: "",
      category: "",
      tags: "",
      isWhiteLabeled: true,
      status: "active",
      isPublic: true,
    });
    setEditingEntry(null);
  };

  const handleEdit = (entry: ApiEntry) => {
    setEditingEntry(entry);
    setFormData({
      name: entry.name,
      originalName: entry.originalName || "",
      description: entry.description,
      baseUrl: entry.baseUrl || "",
      version: entry.version,
      authType: entry.authType || "api_key",
      docsUrl: entry.docsUrl || "",
      category: entry.category || "",
      tags: entry.tags.join(', '),
      isWhiteLabeled: entry.isWhiteLabeled,
      status: entry.status,
      isPublic: entry.isPublic,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "API name is required",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  const renderApiTable = (entries: ApiEntry[]) => (
    <Table data-testid="table-api-entries">
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Original</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground py-8" data-testid="text-no-apis">
              No APIs found. Add your first API to get started.
            </TableCell>
          </TableRow>
        ) : (
          entries.map((entry) => (
            <TableRow key={entry.id} data-testid={`row-api-${entry.id}`}>
              <TableCell className="font-mono text-xs" data-testid={`text-display-id-${entry.id}`}>{entry.displayId}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Webhook className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium" data-testid={`text-name-${entry.id}`}>{entry.name}</div>
                    {entry.isWhiteLabeled && (
                      <Badge variant="secondary" className="text-xs mt-1" data-testid={`badge-whitelabeled-${entry.id}`}>White-labeled</Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground" data-testid={`text-original-${entry.id}`}>{entry.originalName || '-'}</TableCell>
              <TableCell><Badge variant="outline" data-testid={`badge-version-${entry.id}`}>{entry.version}</Badge></TableCell>
              <TableCell><Badge data-testid={`badge-type-${entry.id}`}>{entry.type}</Badge></TableCell>
              <TableCell>
                <Badge variant={entry.status === 'active' ? 'default' : 'secondary'} data-testid={`badge-status-${entry.id}`}>
                  {entry.status}
                </Badge>
              </TableCell>
              <TableCell data-testid={`text-usage-${entry.id}`}>{entry.usageCount}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  {entry.docsUrl && (
                    <Button variant="ghost" size="sm" asChild data-testid={`button-docs-${entry.id}`}>
                      <a href={entry.docsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)} data-testid={`button-edit-${entry.id}`}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteMutation.mutate(entry.id)}
                    data-testid={`button-delete-${entry.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-8 space-y-6" data-testid="page-api-library">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">API Library</h1>
          <p className="text-muted-foreground mt-1" data-testid="text-page-description">
            Manage WytNet APIs and third-party integrations with white-labeling
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-testid="tabs-api-types">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="wytmodule" className="gap-2" data-testid="tab-wytmodule">
            <Package className="h-4 w-4" />
            WytModule
          </TabsTrigger>
          <TabsTrigger value="wytapp" className="gap-2" data-testid="tab-wytapp">
            <Code className="h-4 w-4" />
            WytApp
          </TabsTrigger>
          <TabsTrigger value="wytdataset" className="gap-2" data-testid="tab-wytdataset">
            <Database className="h-4 w-4" />
            WytDataset
          </TabsTrigger>
          <TabsTrigger value="thirdparty" className="gap-2" data-testid="tab-thirdparty">
            <Webhook className="h-4 w-4" />
            Third-Party
          </TabsTrigger>
        </TabsList>

        {['wytmodule', 'wytapp', 'wytdataset', 'thirdparty'].map((type) => (
          <TabsContent key={type} value={type} className="space-y-6" data-testid={`tab-content-${type}`}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="capitalize" data-testid={`text-card-title-${type}`}>{type.replace('wyt', 'Wyt')} APIs</CardTitle>
                    <CardDescription data-testid={`text-card-description-${type}`}>
                      {type === 'thirdparty' 
                        ? 'White-labeled third-party API integrations'
                        : `APIs generated from ${type} sources`}
                    </CardDescription>
                  </div>
                  {type === 'thirdparty' && (
                    <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="gap-2" data-testid="button-add-api">
                      <Plus className="h-4 w-4" />
                      Add Third-Party API
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="text-loading">Loading APIs...</div>
                ) : (
                  renderApiTable(filterByType(type))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-api-form">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">{editingEntry ? 'Edit API' : 'Add Third-Party API'}</DialogTitle>
            <DialogDescription data-testid="text-dialog-description">
              White-label a third-party API with your own branding (e.g., Mappls → WytMap)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name (White-Label) *</Label>
                <Input
                  id="brand-name"
                  placeholder="e.g., WytMap"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-brand-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original-name">Original Name</Label>
                <Input
                  id="original-name"
                  placeholder="e.g., Mappls"
                  value={formData.originalName}
                  onChange={(e) => setFormData({ ...formData, originalName: e.target.value })}
                  data-testid="input-original-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the API functionality..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                data-testid="textarea-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base-url">Base URL</Label>
                <Input
                  id="base-url"
                  placeholder="https://api.example.com"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  data-testid="input-base-url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  placeholder="1.0.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  data-testid="input-version"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="auth-type">Authentication Type</Label>
                <Select
                  value={formData.authType}
                  onValueChange={(value) => setFormData({ ...formData, authType: value })}
                >
                  <SelectTrigger id="auth-type" data-testid="select-auth-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="oauth">OAuth 2.0</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Maps, Payment"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  data-testid="input-category"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="docs-url">Documentation URL</Label>
              <Input
                id="docs-url"
                placeholder="https://docs.example.com"
                value={formData.docsUrl}
                onChange={(e) => setFormData({ ...formData, docsUrl: e.target.value })}
                data-testid="input-docs-url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="maps, navigation, location"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                data-testid="input-tags"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save">
              {saveMutation.isPending ? 'Saving...' : (editingEntry ? 'Update' : 'Add')} API
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
