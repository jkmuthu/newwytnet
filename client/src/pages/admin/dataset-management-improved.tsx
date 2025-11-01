import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Database, Globe, Building, Star, ChevronUp, ChevronDown, Download, Upload, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DatasetCollection, DatasetItem } from "@shared/schema";

export default function AdminDatasetManagementImproved() {
  const [activeTab, setActiveTab] = useState("collections");
  const [selectedCollection, setSelectedCollection] = useState<DatasetCollection | null>(null);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<DatasetCollection | null>(null);
  const [editingItem, setEditingItem] = useState<DatasetItem | null>(null);
  const [selectedCountryForFilter, setSelectedCountryForFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const { data: collectionsData, isLoading: collectionsLoading } = useQuery<{ success: boolean; collections: DatasetCollection[] }>({
    queryKey: ['/api/admin/datasets'],
  });

  const { data: collectionDetails } = useQuery<{ success: boolean; collection: DatasetCollection; items: DatasetItem[] }>({
    queryKey: ['/api/admin/datasets', selectedCollection?.id],
    enabled: !!selectedCollection,
  });

  const { data: countriesData } = useQuery<{ success: boolean; collection: DatasetCollection; items: DatasetItem[] }>({
    queryKey: ['/api/admin/datasets/countries'],
    queryFn: async () => {
      const collections = collectionsData?.collections || [];
      const countriesCollection = collections.find(c => c.key === 'countries');
      if (!countriesCollection) return { success: false, collection: {} as DatasetCollection, items: [] };
      const response = await fetch(`/api/admin/datasets/${countriesCollection.id}`, { credentials: 'include' });
      return response.json();
    },
    enabled: !!collectionsData,
  });

  const { data: statesData } = useQuery<{ success: boolean; collection: DatasetCollection; items: DatasetItem[] }>({
    queryKey: ['/api/admin/datasets/states'],
    queryFn: async () => {
      const collections = collectionsData?.collections || [];
      const statesCollection = collections.find(c => c.key === 'states');
      if (!statesCollection) return { success: false, collection: {} as DatasetCollection, items: [] };
      const response = await fetch(`/api/admin/datasets/${statesCollection.id}`, { credentials: 'include' });
      return response.json();
    },
    enabled: !!collectionsData,
  });

  const { data: languagesData } = useQuery<{ success: boolean; collection: DatasetCollection; items: DatasetItem[] }>({
    queryKey: ['/api/admin/datasets/languages'],
    queryFn: async () => {
      const collections = collectionsData?.collections || [];
      const languagesCollection = collections.find(c => c.key === 'languages');
      if (!languagesCollection) return { success: false, collection: {} as DatasetCollection, items: [] };
      const response = await fetch(`/api/admin/datasets/${languagesCollection.id}`, { credentials: 'include' });
      return response.json();
    },
    enabled: !!collectionsData,
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (data: any) => apiRequest('/api/admin/datasets', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/datasets'] });
      setIsCollectionDialogOpen(false);
      toast({ title: "Success", description: "Dataset collection created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create collection", variant: "destructive" });
    },
  });

  const updateCollectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => apiRequest(`/api/admin/datasets/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/datasets'] });
      setIsCollectionDialogOpen(false);
      setEditingCollection(null);
      toast({ title: "Success", description: "Dataset collection updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update collection", variant: "destructive" });
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: async (id: string) => apiRequest(`/api/admin/datasets/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/datasets'] });
      if (selectedCollection) setSelectedCollection(null);
      toast({ title: "Success", description: "Dataset collection deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete collection", variant: "destructive" });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: any) => apiRequest(`/api/admin/datasets/${selectedCollection?.id}/items`, 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/datasets', selectedCollection?.id] });
      setIsItemDialogOpen(false);
      toast({ title: "Success", description: "Dataset item created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create item", variant: "destructive" });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: any }) => 
      apiRequest(`/api/admin/datasets/${selectedCollection?.id}/items/${itemId}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/datasets', selectedCollection?.id] });
      setIsItemDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Success", description: "Dataset item updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update item", variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => 
      apiRequest(`/api/admin/datasets/${selectedCollection?.id}/items/${itemId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/datasets', selectedCollection?.id] });
      toast({ title: "Success", description: "Dataset item deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete item", variant: "destructive" });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (itemId: string) => 
      apiRequest(`/api/admin/datasets/${selectedCollection?.id}/items/${itemId}/set-default`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/datasets', selectedCollection?.id] });
      toast({ title: "Success", description: "Default item updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to set default", variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ itemId, direction }: { itemId: string; direction: 'up' | 'down' }) =>
      apiRequest(`/api/admin/datasets/${selectedCollection?.id}/items/${itemId}/reorder`, 'POST', { direction }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/datasets', selectedCollection?.id] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to reorder", variant: "destructive" });
    },
  });

  const handleCollectionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      key: formData.get('key') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      scope: formData.get('scope') as string,
      metadata: {},
    };

    if (editingCollection) {
      updateCollectionMutation.mutate({ id: editingCollection.id, data });
    } else {
      createCollectionMutation.mutate(data);
    }
  };

  const handleItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const metadata: any = {};
    
    if (selectedCollection?.key === 'states') {
      const countryCode = formData.get('countryCode') as string;
      if (countryCode) {
        metadata.countryCode = countryCode;
        metadata.type = formData.get('stateType') as string || 'State';
      }
    } else if (selectedCollection?.key === 'cities') {
      const countryCode = formData.get('countryCode') as string;
      const stateCode = formData.get('stateCode') as string;
      if (countryCode) metadata.countryCode = countryCode;
      if (stateCode) metadata.stateCode = stateCode;
    }
    
    const data = {
      code: formData.get('code') as string,
      label: formData.get('label') as string,
      locale: formData.get('locale') as string || 'en',
      sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
      metadata,
    };

    if (editingItem) {
      updateItemMutation.mutate({ itemId: editingItem.id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };

  const isImmutable = (collection: DatasetCollection) => {
    return collection.metadata && (collection.metadata as any).immutable;
  };

  const handleViewItems = (collection: DatasetCollection) => {
    setSelectedCollection(collection);
    setActiveTab("items");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            All Datasets
          </h1>
          <p className="text-muted-foreground mt-2">
            WytData Management: Global reference datasets (Countries, Cities, Languages, Currencies, Industries, etc.)
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="collections" data-testid="tab-collections">
            <Database className="h-4 w-4 mr-2" />
            All Collections
          </TabsTrigger>
          <TabsTrigger value="items" data-testid="tab-items" disabled={!selectedCollection}>
            <Globe className="h-4 w-4 mr-2" />
            Collection Items
            {selectedCollection && <Badge variant="secondary" className="ml-2">{selectedCollection.name}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Dataset Settings
          </TabsTrigger>
          <TabsTrigger value="import-export" data-testid="tab-import-export">
            <Upload className="h-4 w-4 mr-2" />
            Import/Export Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Collections</CardTitle>
                  <CardDescription>
                    Available dataset collections - WytData global reference data
                    {collectionsData && <Badge variant="secondary" className="ml-2">{collectionsData.collections.length} total</Badge>}
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingCollection(null);
                  setIsCollectionDialogOpen(true);
                }} data-testid="button-add-collection">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Collection
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search datasets by name, key, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                  data-testid="input-search-datasets"
                />
              </div>
              
              {collectionsLoading ? (
                <p className="text-sm text-muted-foreground">Loading collections...</p>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center w-24">Items</TableHead>
                        <TableHead className="text-center w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collectionsData?.collections
                        .filter(c => {
                          if (!searchQuery) return true;
                          const query = searchQuery.toLowerCase();
                          return (
                            c.name.toLowerCase().includes(query) ||
                            c.key.toLowerCase().includes(query) ||
                            (c.description?.toLowerCase() || '').includes(query)
                          );
                        })
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((collection) => {
                          const itemCount = (collection.metadata as any)?.itemCount || 0;
                          return (
                            <TableRow
                              key={collection.id}
                              className="cursor-pointer hover:bg-accent"
                              data-testid={`collection-row-${collection.key}`}
                            >
                              <TableCell className="text-center">
                                <span className="text-2xl">{(collection.metadata as any)?.icon || '📊'}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{collection.name}</span>
                                  {collection.scope === 'global' && <Globe className="h-3.5 w-3.5 text-blue-500" />}
                                  {isImmutable(collection) && <Badge variant="secondary" className="text-xs">Protected</Badge>}
                                </div>
                              </TableCell>
                              <TableCell>
                                <code className="text-xs bg-muted px-2 py-0.5 rounded">{collection.key}</code>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {collection.description || 'No description'}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">{itemCount}</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewItems(collection);
                                  }}
                                  data-testid={`button-view-${collection.key}`}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedCollection ? selectedCollection.name : 'Select a collection'}
                  </CardTitle>
                  <CardDescription>
                    {selectedCollection ? selectedCollection.description || 'No description' : 'Choose a collection to view items'}
                  </CardDescription>
                </div>
                {selectedCollection && (
                  <div className="flex gap-2">
                    {!isImmutable(selectedCollection) && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingCollection(selectedCollection);
                          setIsCollectionDialogOpen(true);
                        }} data-testid="button-edit-collection">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Collection
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          if (confirm('Are you sure you want to delete this collection?')) {
                            deleteCollectionMutation.mutate(selectedCollection.id);
                          }
                        }} data-testid="button-delete-collection">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                    <Button size="sm" onClick={() => {
                      setEditingItem(null);
                      setSelectedCountryForFilter('');
                      setIsItemDialogOpen(true);
                    }} data-testid="button-add-item">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedCollection && collectionDetails ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Locale</TableHead>
                        <TableHead className="w-20">Default</TableHead>
                        <TableHead className="w-24">Order</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collectionDetails.items
                        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                        .map((item, index, sortedItems) => (
                        <TableRow key={item.id} data-testid={`item-row-${item.code}`}>
                          <TableCell className="font-mono text-sm">{item.code}</TableCell>
                          <TableCell>{item.label}</TableCell>
                          <TableCell>{item.locale}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDefaultMutation.mutate(item.id)}
                              className={item.isDefault ? "text-yellow-500 hover:text-yellow-600" : "text-gray-300 hover:text-yellow-500"}
                              data-testid={`button-default-${item.code}`}
                              title={item.isDefault ? "Default item" : "Set as default"}
                            >
                              <Star className={`h-4 w-4 ${item.isDefault ? "fill-current" : ""}`} />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => reorderMutation.mutate({ itemId: item.id, direction: 'up' })}
                                disabled={index === 0}
                                data-testid={`button-move-up-${item.code}`}
                                title="Move up"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => reorderMutation.mutate({ itemId: item.id, direction: 'down' })}
                                disabled={index === sortedItems.length - 1}
                                data-testid={`button-move-down-${item.code}`}
                                title="Move down"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(item);
                                  setSelectedCountryForFilter((item.metadata as any)?.countryCode || '');
                                  setIsItemDialogOpen(true);
                                }}
                                data-testid={`button-edit-item-${item.code}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this item?')) {
                                    deleteItemMutation.mutate(item.id);
                                  }
                                }}
                                data-testid={`button-delete-item-${item.code}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No collection selected. Go to Collections List to select one.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Settings</CardTitle>
              <CardDescription>Configure dataset management options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto-sync</h3>
                    <p className="text-sm text-muted-foreground">Automatically synchronize datasets</p>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Versioning</h3>
                    <p className="text-sm text-muted-foreground">Track dataset version history</p>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import & Export</CardTitle>
              <CardDescription>Bulk operations for dataset management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Import Data</h3>
                        <p className="text-sm text-muted-foreground">Upload CSV/JSON files</p>
                      </div>
                      <Button variant="outline" disabled>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                      <Badge variant="secondary" className="block">Coming Soon</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <Download className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Export Data</h3>
                        <p className="text-sm text-muted-foreground">Download as CSV/JSON</p>
                      </div>
                      <Button variant="outline" disabled>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Badge variant="secondary" className="block">Coming Soon</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Collection Dialog - Same as before */}
      <Dialog open={isCollectionDialogOpen} onOpenChange={setIsCollectionDialogOpen}>
        <DialogContent data-testid="dialog-collection">
          <DialogHeader>
            <DialogTitle>{editingCollection ? 'Edit Collection' : 'Create Collection'}</DialogTitle>
            <DialogDescription>
              {editingCollection ? 'Update collection details' : 'Add a new dataset collection'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCollectionSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key">Key *</Label>
                <Input
                  id="key"
                  name="key"
                  placeholder="countries"
                  defaultValue={editingCollection?.key}
                  required
                  disabled={!!editingCollection}
                  data-testid="input-collection-key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Countries"
                  defaultValue={editingCollection?.name}
                  required
                  data-testid="input-collection-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="ISO 3166-1 country codes and names"
                  defaultValue={editingCollection?.description || ''}
                  data-testid="input-collection-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scope">Scope *</Label>
                <select
                  id="scope"
                  name="scope"
                  defaultValue={editingCollection?.scope || 'global'}
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-800"
                  data-testid="select-collection-scope"
                >
                  <option value="global">Global</option>
                  <option value="tenant">Tenant</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createCollectionMutation.isPending || updateCollectionMutation.isPending} data-testid="button-save-collection">
                {createCollectionMutation.isPending || updateCollectionMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Item Dialog - Truncated for brevity, same as original */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent data-testid="dialog-item">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update item details' : `Add a new item to ${selectedCollection?.name}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleItemSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input id="code" name="code" placeholder="US" defaultValue={editingItem?.code} required data-testid="input-item-code" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Label *</Label>
                <Input id="label" name="label" placeholder="United States" defaultValue={editingItem?.label} required data-testid="input-item-label" />
              </div>
              {(selectedCollection?.key === 'states' || selectedCollection?.key === 'cities') && (
                <div className="space-y-2">
                  <Label htmlFor="countryCode">Country *</Label>
                  <select id="countryCode" name="countryCode" defaultValue={(editingItem?.metadata as any)?.countryCode || ''} onChange={(e) => setSelectedCountryForFilter(e.target.value)} className="w-full border rounded-md px-3 py-2 dark:bg-gray-800" required data-testid="select-item-country">
                    <option value="">Select Country</option>
                    {countriesData?.items?.map((country) => (
                      <option key={country.id} value={country.code}>{country.label}</option>
                    ))}
                  </select>
                </div>
              )}
              {selectedCollection?.key === 'states' && (
                <div className="space-y-2">
                  <Label htmlFor="stateType">Type</Label>
                  <select id="stateType" name="stateType" defaultValue={(editingItem?.metadata as any)?.type || 'State'} className="w-full border rounded-md px-3 py-2 dark:bg-gray-800" data-testid="select-state-type">
                    <option value="State">State</option>
                    <option value="Province">Province</option>
                    <option value="Union Territory">Union Territory</option>
                    <option value="Country">Country</option>
                  </select>
                </div>
              )}
              {selectedCollection?.key === 'cities' && (
                <div className="space-y-2">
                  <Label htmlFor="stateCode">State/Province</Label>
                  <select id="stateCode" name="stateCode" defaultValue={(editingItem?.metadata as any)?.stateCode || ''} className="w-full border rounded-md px-3 py-2 dark:bg-gray-800" data-testid="select-item-state">
                    <option value="">Select State (Optional)</option>
                    {statesData?.items?.filter((state) => !selectedCountryForFilter || (state.metadata as any)?.countryCode === selectedCountryForFilter).map((state) => (
                      <option key={state.id} value={state.code}>{state.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="locale">Language *</Label>
                <select id="locale" name="locale" defaultValue={editingItem?.locale || 'en'} className="w-full border rounded-md px-3 py-2 dark:bg-gray-800" required data-testid="select-item-language">
                  {languagesData?.items?.map((language) => (
                    <option key={language.id} value={language.code}>{language.label} ({language.code})</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Language/region code for this label</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input id="sortOrder" name="sortOrder" type="number" placeholder="0" defaultValue={editingItem?.sortOrder || 0} data-testid="input-item-sort-order" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createItemMutation.isPending || updateItemMutation.isPending} data-testid="button-save-item">
                {createItemMutation.isPending || updateItemMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
