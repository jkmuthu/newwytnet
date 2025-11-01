import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Network, Plus, Search, Tag, CheckCircle, Circle, Trash2, Edit, BarChart3, Settings as SettingsIcon, Database, Eye } from "lucide-react";

interface ObjectType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

interface ObjectItem {
  id: string;
  title: string;
  slug: string;
  aliases: string[];
  description?: string;
  entityTypeId: string;
  isVerified: boolean;
  isPublic: boolean;
  tagCount: number;
  entityType?: ObjectType;
}

export default function AdminObjects() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("objects-list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch object types
  const { data: objectTypesData } = useQuery<{ types: ObjectType[] }>({
    queryKey: ["/api/entities/types"],
  });

  // Fetch objects with filters
  const { data: objectsData, isLoading } = useQuery<{ entities: ObjectItem[] }>({
    queryKey: ["/api/entities", { search: searchQuery, typeId: selectedType !== "all" ? selectedType : undefined }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedType !== "all") params.append("typeId", selectedType);
      
      const url = `/api/entities${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error("Failed to fetch objects");
      return response.json();
    }
  });

  const objectTypes = objectTypesData?.types || [];
  const objects = objectsData?.entities || [];

  // Get object count by type
  const getObjectCountByType = (typeId: string) => {
    return objects.filter(e => e.entityTypeId === typeId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Network className="h-8 w-8 text-purple-600" />
            Objects Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage objects and knowledge graph structure
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-object">
              <Plus className="h-4 w-4 mr-2" />
              Create Object
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Object</DialogTitle>
              <DialogDescription>Add a new object to the knowledge graph</DialogDescription>
            </DialogHeader>
            <ObjectForm 
              objectTypes={objectTypes} 
              onSuccess={() => {
                setCreateDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="objects-list" data-testid="tab-objects-list">
            <Database className="h-4 w-4 mr-2" />
            Objects List
          </TabsTrigger>
          <TabsTrigger value="object-types" data-testid="tab-object-types">
            <Tag className="h-4 w-4 mr-2" />
            Object Types
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Objects List Tab */}
        <TabsContent value="objects-list" className="space-y-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Objects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-objects">{objects.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Object Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-object-types">{objectTypes.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-verified-objects">
                  {objects.filter(e => e.isVerified).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-tags">
                  {objects.reduce((sum, e) => sum + (e.tagCount || 0), 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search objects by name or alias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-objects"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]" data-testid="select-object-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {objectTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Objects Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading objects...</div>
              ) : objects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No objects found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Object Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Aliases</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {objects.map((object) => (
                      <ObjectRow 
                        key={object.id} 
                        object={object} 
                        objectTypes={objectTypes} 
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Object Types Tab */}
        <TabsContent value="object-types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Object Types</CardTitle>
              <CardDescription>Core object types in the knowledge graph</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {objectTypes.map((type) => (
                  <div
                    key={type.id}
                    className="p-3 border rounded-lg hover:border-purple-400 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedType(type.id);
                      setActiveTab("objects-list");
                    }}
                    data-testid={`card-object-type-${type.slug}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`bg-${type.color}-100 text-${type.color}-700`}>
                        {type.name}
                      </Badge>
                      {type.isSystem && <CheckCircle className="h-3 w-3 text-green-600" />}
                    </div>
                    <div className="text-xs text-gray-500">{getObjectCountByType(type.id)} objects</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Object Analytics
              </CardTitle>
              <CardDescription>View insights and trends for your knowledge graph</CardDescription>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-sm">
                  Object analytics, relationship insights, and usage trends will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Object Configuration
              </CardTitle>
              <CardDescription>Configure object settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <SettingsIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
                <p className="text-sm">
                  Object configuration options, validation rules, and system preferences will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Object Row Component with Edit capability
function ObjectRow({ object, objectTypes }: { object: ObjectItem; objectTypes: ObjectType[] }) {
  const { toast } = useToast();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const objectType = objectTypes.find(t => t.id === object.entityTypeId);

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/entities/${object.id}`),
    onSuccess: () => {
      toast({ title: "Object deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
    },
    onError: () => {
      toast({ title: "Failed to delete object", variant: "destructive" });
    }
  });

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${object.title}"?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <TableRow data-testid={`row-object-${object.slug}`}>
      <TableCell>
        {object.isVerified ? (
          <CheckCircle className="h-4 w-4 text-green-600" data-testid={`icon-verified-${object.id}`} />
        ) : (
          <Circle className="h-4 w-4 text-gray-300" />
        )}
      </TableCell>
      <TableCell>
        <div className="font-medium" data-testid={`text-object-title-${object.id}`}>
          {object.title}
        </div>
        {object.description && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-1">{object.description}</div>
        )}
      </TableCell>
      <TableCell>
        {objectType && (
          <Badge variant="outline" data-testid={`badge-object-type-${object.id}`}>
            {objectType.name}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {object.aliases && object.aliases.length > 0 ? (
            object.aliases.slice(0, 3).map((alias, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {alias}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
          {object.aliases && object.aliases.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{object.aliases.length - 3}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2">
          {object.tagCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {object.tagCount}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                data-testid={`button-view-object-${object.id}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <ObjectDetailsView object={object} objectType={objectType} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                data-testid={`button-edit-object-${object.id}`}
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Object</DialogTitle>
                <DialogDescription>Update object information</DialogDescription>
              </DialogHeader>
              <ObjectForm
                object={object}
                objectTypes={objectTypes}
                onSuccess={() => {
                  setEditDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
                }}
              />
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            data-testid={`button-delete-object-${object.id}`}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Object Details View Component
function ObjectDetailsView({ object, objectType }: { object: ObjectItem; objectType?: ObjectType }) {
  const { data: relationshipsData } = useQuery<{ relationships: any[] }>({
    queryKey: ["/api/entities", object.id, "relationships"],
  });

  const relationships = relationshipsData?.relationships || [];

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {object.isVerified && <CheckCircle className="h-5 w-5 text-green-600" />}
          {object.title}
        </DialogTitle>
        <DialogDescription>{object.description || "No description"}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Object Type</label>
            <div className="mt-1">
              {objectType && (
                <Badge variant="outline">{objectType.name}</Badge>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <div className="mt-1 flex gap-2">
              <Badge variant={object.isVerified ? "default" : "secondary"}>
                {object.isVerified ? "Verified" : "Unverified"}
              </Badge>
              <Badge variant={object.isPublic ? "default" : "secondary"}>
                {object.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Aliases</label>
          <div className="mt-1 flex flex-wrap gap-1">
            {object.aliases && object.aliases.length > 0 ? (
              object.aliases.map((alias, i) => (
                <Badge key={i} variant="secondary">{alias}</Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">No aliases</span>
            )}
          </div>
        </div>

        {relationships.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-600">Relationships ({relationships.length})</label>
            <div className="mt-2 space-y-2">
              {relationships.map((rel: any, i) => (
                <div key={i} className="p-2 border rounded text-sm">
                  <span className="font-medium">{rel.type}</span>
                  <span className="text-gray-500 mx-2">→</span>
                  <span>{rel.targetEntityTitle || rel.targetEntityId}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Object Form Component (for both Create and Edit)
function ObjectForm({ 
  object, 
  objectTypes, 
  onSuccess 
}: { 
  object?: ObjectItem;
  objectTypes: ObjectType[]; 
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isEdit = !!object;
  
  const [formData, setFormData] = useState({
    title: object?.title || "",
    entityTypeId: object?.entityTypeId || objectTypes[0]?.id || "",
    description: object?.description || "",
    aliases: object?.aliases?.join(", ") || "",
    isVerified: object?.isVerified || false,
    isPublic: object?.isPublic ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit) {
        return apiRequest("PUT", `/api/entities/${object.id}`, data);
      }
      return apiRequest("POST", "/api/entities", data);
    },
    onSuccess: () => {
      toast({ title: `Object ${isEdit ? 'updated' : 'created'} successfully` });
      onSuccess();
    },
    onError: () => {
      toast({ title: `Failed to ${isEdit ? 'update' : 'create'} object`, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const aliases = formData.aliases.split(",").map(a => a.trim()).filter(Boolean);
    saveMutation.mutate({
      ...formData,
      aliases,
      slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title *</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          data-testid="input-object-title"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Object Type *</label>
        <Select value={formData.entityTypeId} onValueChange={(value) => setFormData({ ...formData, entityTypeId: value })}>
          <SelectTrigger data-testid="select-object-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {objectTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          data-testid="input-object-description"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Aliases (comma-separated)</label>
        <Input
          value={formData.aliases}
          onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
          placeholder="e.g., Bangalore, Bengaluru"
          data-testid="input-object-aliases"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.isVerified}
            onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
            className="rounded"
            data-testid="checkbox-object-verified"
          />
          Verified
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="rounded"
            data-testid="checkbox-object-public"
          />
          Public
        </label>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={saveMutation.isPending} data-testid="button-submit-object">
          {saveMutation.isPending ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Object" : "Create Object")}
        </Button>
      </div>
    </form>
  );
}
