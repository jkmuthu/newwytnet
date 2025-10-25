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

interface EntityType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

interface Entity {
  id: string;
  title: string;
  slug: string;
  aliases: string[];
  description?: string;
  entityTypeId: string;
  isVerified: boolean;
  isPublic: boolean;
  tagCount: number;
  entityType?: EntityType;
}

export default function AdminEntities() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("entities-list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch entity types
  const { data: entityTypesData } = useQuery<{ types: EntityType[] }>({
    queryKey: ["/api/entities/types"],
  });

  // Fetch entities with filters
  const { data: entitiesData, isLoading } = useQuery<{ entities: Entity[] }>({
    queryKey: ["/api/entities", { search: searchQuery, typeId: selectedType !== "all" ? selectedType : undefined }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedType !== "all") params.append("typeId", selectedType);
      
      const url = `/api/entities${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error("Failed to fetch entities");
      return response.json();
    }
  });

  const entityTypes = entityTypesData?.types || [];
  const entities = entitiesData?.entities || [];

  // Get entity count by type
  const getEntityCountByType = (typeId: string) => {
    return entities.filter(e => e.entityTypeId === typeId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Network className="h-8 w-8 text-purple-600" />
            Entities Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage entities and knowledge graph structure
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-entity">
              <Plus className="h-4 w-4 mr-2" />
              Create Entity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Entity</DialogTitle>
              <DialogDescription>Add a new entity to the knowledge graph</DialogDescription>
            </DialogHeader>
            <EntityForm 
              entityTypes={entityTypes} 
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
          <TabsTrigger value="entities-list" data-testid="tab-entities-list">
            <Database className="h-4 w-4 mr-2" />
            Entities List
          </TabsTrigger>
          <TabsTrigger value="entity-types" data-testid="tab-entity-types">
            <Tag className="h-4 w-4 mr-2" />
            Entity Types
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

        {/* Entities List Tab */}
        <TabsContent value="entities-list" className="space-y-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Entities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-entities">{entities.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Entity Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-entity-types">{entityTypes.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-verified-entities">
                  {entities.filter(e => e.isVerified).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-tags">
                  {entities.reduce((sum, e) => sum + (e.tagCount || 0), 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search entities by name or alias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-entities"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]" data-testid="select-entity-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {entityTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Entities Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading entities...</div>
              ) : entities.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No entities found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Entity Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Aliases</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entities.map((entity) => (
                      <EntityRow 
                        key={entity.id} 
                        entity={entity} 
                        entityTypes={entityTypes} 
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entity Types Tab */}
        <TabsContent value="entity-types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entity Types</CardTitle>
              <CardDescription>Core entity types in the knowledge graph</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {entityTypes.map((type) => (
                  <div
                    key={type.id}
                    className="p-3 border rounded-lg hover:border-purple-400 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedType(type.id);
                      setActiveTab("entities-list");
                    }}
                    data-testid={`card-entity-type-${type.slug}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`bg-${type.color}-100 text-${type.color}-700`}>
                        {type.name}
                      </Badge>
                      {type.isSystem && <CheckCircle className="h-3 w-3 text-green-600" />}
                    </div>
                    <div className="text-xs text-gray-500">{getEntityCountByType(type.id)} entities</div>
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
                Entity Analytics
              </CardTitle>
              <CardDescription>View insights and trends for your knowledge graph</CardDescription>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-sm">
                  Entity analytics, relationship insights, and usage trends will be available here.
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
                Entity Configuration
              </CardTitle>
              <CardDescription>Configure entity settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <SettingsIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
                <p className="text-sm">
                  Entity configuration options, validation rules, and system preferences will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Entity Row Component with Edit capability
function EntityRow({ entity, entityTypes }: { entity: Entity; entityTypes: EntityType[] }) {
  const { toast } = useToast();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const entityType = entityTypes.find(t => t.id === entity.entityTypeId);

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/entities/${entity.id}`),
    onSuccess: () => {
      toast({ title: "Entity deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
    },
    onError: () => {
      toast({ title: "Failed to delete entity", variant: "destructive" });
    }
  });

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${entity.title}"?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <TableRow data-testid={`row-entity-${entity.slug}`}>
      <TableCell>
        {entity.isVerified ? (
          <CheckCircle className="h-4 w-4 text-green-600" data-testid={`icon-verified-${entity.id}`} />
        ) : (
          <Circle className="h-4 w-4 text-gray-300" />
        )}
      </TableCell>
      <TableCell>
        <div className="font-medium" data-testid={`text-entity-title-${entity.id}`}>
          {entity.title}
        </div>
        {entity.description && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-1">{entity.description}</div>
        )}
      </TableCell>
      <TableCell>
        {entityType && (
          <Badge variant="outline" data-testid={`badge-entity-type-${entity.id}`}>
            {entityType.name}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {entity.aliases && entity.aliases.length > 0 ? (
            entity.aliases.slice(0, 3).map((alias, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {alias}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
          {entity.aliases && entity.aliases.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{entity.aliases.length - 3}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2">
          {entity.tagCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {entity.tagCount}
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
                data-testid={`button-view-entity-${entity.id}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <EntityDetailsView entity={entity} entityType={entityType} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                data-testid={`button-edit-entity-${entity.id}`}
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Entity</DialogTitle>
                <DialogDescription>Update entity information</DialogDescription>
              </DialogHeader>
              <EntityForm
                entity={entity}
                entityTypes={entityTypes}
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
            data-testid={`button-delete-entity-${entity.id}`}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Entity Details View Component
function EntityDetailsView({ entity, entityType }: { entity: Entity; entityType?: EntityType }) {
  const { data: relationshipsData } = useQuery<{ relationships: any[] }>({
    queryKey: ["/api/entities", entity.id, "relationships"],
  });

  const relationships = relationshipsData?.relationships || [];

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {entity.isVerified && <CheckCircle className="h-5 w-5 text-green-600" />}
          {entity.title}
        </DialogTitle>
        <DialogDescription>{entity.description || "No description"}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Entity Type</label>
            <div className="mt-1">
              {entityType && (
                <Badge variant="outline">{entityType.name}</Badge>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <div className="mt-1 flex gap-2">
              <Badge variant={entity.isVerified ? "default" : "secondary"}>
                {entity.isVerified ? "Verified" : "Unverified"}
              </Badge>
              <Badge variant={entity.isPublic ? "default" : "secondary"}>
                {entity.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Aliases</label>
          <div className="mt-1 flex flex-wrap gap-1">
            {entity.aliases && entity.aliases.length > 0 ? (
              entity.aliases.map((alias, i) => (
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

// Entity Form Component (for both Create and Edit)
function EntityForm({ 
  entity, 
  entityTypes, 
  onSuccess 
}: { 
  entity?: Entity;
  entityTypes: EntityType[]; 
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isEdit = !!entity;
  
  const [formData, setFormData] = useState({
    title: entity?.title || "",
    entityTypeId: entity?.entityTypeId || entityTypes[0]?.id || "",
    description: entity?.description || "",
    aliases: entity?.aliases?.join(", ") || "",
    isVerified: entity?.isVerified || false,
    isPublic: entity?.isPublic ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit) {
        return apiRequest("PUT", `/api/entities/${entity.id}`, data);
      }
      return apiRequest("POST", "/api/entities", data);
    },
    onSuccess: () => {
      toast({ title: `Entity ${isEdit ? 'updated' : 'created'} successfully` });
      onSuccess();
    },
    onError: () => {
      toast({ title: `Failed to ${isEdit ? 'update' : 'create'} entity`, variant: "destructive" });
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
          data-testid="input-entity-title"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Entity Type *</label>
        <Select value={formData.entityTypeId} onValueChange={(value) => setFormData({ ...formData, entityTypeId: value })}>
          <SelectTrigger data-testid="select-entity-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {entityTypes.map((type) => (
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
          data-testid="input-entity-description"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Aliases (comma-separated)</label>
        <Input
          value={formData.aliases}
          onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
          placeholder="e.g., Bangalore, Bengaluru"
          data-testid="input-entity-aliases"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.isVerified}
            onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
            className="rounded"
            data-testid="checkbox-entity-verified"
          />
          Verified
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="rounded"
            data-testid="checkbox-entity-public"
          />
          Public
        </label>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={saveMutation.isPending} data-testid="button-submit-entity">
          {saveMutation.isPending ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Entity" : "Create Entity")}
        </Button>
      </div>
    </form>
  );
}
