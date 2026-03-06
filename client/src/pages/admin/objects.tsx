import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { GripVertical, Network, Plus, Search, Tag, CheckCircle, Circle, Trash2, Edit, BarChart3, Settings as SettingsIcon, Database, Eye } from "lucide-react";

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
  imageUrl?: string;
  metadata?: {
    icon?: string;
    images?: string[];
    materiality?: "tangible" | "intangible";
    categories?: string[];
    customFields?: Array<{ key: string; value: string }>;
    [key: string]: any;
  };
  entityType?: ObjectType;
}

interface DynamicField {
  id: string;
  key: string;
  value: string;
}

const toKebabSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const uniqueList = (items: string[]) => {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const item of items) {
    const cleaned = item.trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(cleaned);
  }

  return output;
};

const buildPluralAlias = (name: string) => {
  const base = name.trim();
  if (base.length < 2) return "";

  const lower = base.toLowerCase();
  if (/(s|x|z|ch|sh)$/.test(lower)) {
    return `${base}es`;
  }

  if (/[^aeiou]y$/.test(lower)) {
    return `${base.slice(0, -1)}ies`;
  }

  return `${base}s`;
};

const reorderItems = <T,>(items: T[], from: number, to: number) => {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

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
    mutationFn: () => apiRequest(`/api/entities/${object.id}`, "DELETE"),
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
  const metadata = object.metadata || {};
  const objectImages = Array.isArray(metadata.images)
    ? metadata.images.filter((img: unknown) => typeof img === "string" && img.trim())
    : object.imageUrl
      ? [object.imageUrl]
      : [];
  const categories = Array.isArray(metadata.categories)
    ? metadata.categories.filter((cat: unknown) => typeof cat === "string" && cat.trim())
    : [];
  const customFields = Array.isArray(metadata.customFields)
    ? metadata.customFields.filter((f: any) => f && typeof f.key === "string")
    : [];

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

        {(metadata.icon || metadata.materiality || categories.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Object Icon</label>
              <div className="mt-1 text-sm">{metadata.icon || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Materiality</label>
              <div className="mt-1 text-sm capitalize">{metadata.materiality || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Categories</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {categories.length > 0 ? categories.map((cat: string) => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
                )) : <span className="text-sm text-gray-500">-</span>}
              </div>
            </div>
          </div>
        )}

        {objectImages.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-600">Object Images</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
              {objectImages.slice(0, 6).map((img: string, idx: number) => (
                <a key={`${img}-${idx}`} href={img} target="_blank" rel="noreferrer" className="block border rounded p-2 text-xs truncate hover:bg-muted">
                  {img}
                </a>
              ))}
            </div>
          </div>
        )}

        {customFields.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-600">Custom Fields</label>
            <div className="mt-2 space-y-2">
              {customFields.map((field: any, idx: number) => (
                <div key={`${field.key}-${idx}`} className="grid grid-cols-2 gap-2 text-sm border rounded px-3 py-2">
                  <span className="font-medium">{field.key}</span>
                  <span className="text-gray-600">{field.value || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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

  const metadata = object?.metadata || {};
  const initialImages = Array.isArray(metadata.images)
    ? metadata.images.filter((img: unknown) => typeof img === "string" && img.trim()).slice(0, 6)
    : object?.imageUrl
      ? [object.imageUrl]
      : [];
  const initialCustomFields = Array.isArray(metadata.customFields)
    ? metadata.customFields
      .filter((field: any) => field && typeof field.key === "string")
      .map((field: any, idx: number) => ({
        id: `${field.key || "field"}-${idx}`,
        key: String(field.key || ""),
        value: String(field.value || ""),
      }))
    : [];

  const [formData, setFormData] = useState({
    title: object?.title || "",
    entityTypeId: object?.entityTypeId || objectTypes[0]?.id || "",
    description: object?.description || "",
    objectIcon: typeof metadata.icon === "string" ? metadata.icon : "",
    materiality: metadata.materiality === "intangible" ? "intangible" : "tangible",
    isVerified: object?.isVerified || false,
    isPublic: object?.isPublic ?? true,
  });
  const [manualAliases, setManualAliases] = useState<string[]>(object?.aliases || []);
  const [aliasInput, setAliasInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [objectImages, setObjectImages] = useState<string[]>(initialImages);
  const [categories, setCategories] = useState<string[]>(Array.isArray(metadata.categories) ? metadata.categories : []);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>(
    initialCustomFields.length > 0 ? initialCustomFields : [{ id: `field-${Date.now()}`, key: "", value: "" }],
  );
  const [dragSource, setDragSource] = useState<{ list: "images" | "fields"; index: number } | null>(null);

  const autoPluralAlias = useMemo(() => buildPluralAlias(formData.title), [formData.title]);
  const allAliases = useMemo(
    () => uniqueList([...manualAliases, ...(autoPluralAlias ? [autoPluralAlias] : [])]),
    [manualAliases, autoPluralAlias],
  );

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit) {
        return apiRequest(`/api/entities/${object.id}`, "PATCH", data);
      }
      return apiRequest("/api/entities", "POST", data);
    },
    onSuccess: () => {
      toast({ title: `Object ${isEdit ? 'updated' : 'created'} successfully` });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: `Failed to ${isEdit ? 'update' : 'create'} object`,
        description: error?.message || "Please check object details and try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedDynamicFields = dynamicFields
      .map((field) => ({ key: field.key.trim(), value: field.value.trim() }))
      .filter((field) => field.key.length > 0);

    const mergedMetadata = {
      ...(metadata || {}),
      icon: formData.objectIcon.trim() || undefined,
      materiality: formData.materiality,
      categories: uniqueList(categories),
      images: uniqueList(objectImages).slice(0, 6),
      customFields: normalizedDynamicFields,
      dynamicData: normalizedDynamicFields.reduce<Record<string, string>>((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {}),
    };

    saveMutation.mutate({
      title: formData.title,
      entityTypeId: formData.entityTypeId,
      description: formData.description,
      aliases: allAliases,
      slug: toKebabSlug(formData.title),
      isVerified: formData.isVerified,
      isPublic: formData.isPublic,
      imageUrl: objectImages[0] || undefined,
      metadata: mergedMetadata,
    });
  };

  const addAlias = () => {
    const next = aliasInput.trim();
    if (!next) return;
    setManualAliases((current) => uniqueList([...current, next]));
    setAliasInput("");
  };

  const removeAlias = (alias: string) => {
    setManualAliases((current) => current.filter((item) => item.toLowerCase() !== alias.toLowerCase()));
  };

  const addCategory = () => {
    const next = categoryInput.trim();
    if (!next) return;
    setCategories((current) => uniqueList([...current, next]));
    setCategoryInput("");
  };

  const removeCategory = (category: string) => {
    setCategories((current) => current.filter((item) => item.toLowerCase() !== category.toLowerCase()));
  };

  const addImage = () => {
    const next = imageInput.trim();
    if (!next) return;
    if (!/^https?:\/\//i.test(next)) {
      toast({ title: "Image URL must start with http:// or https://", variant: "destructive" });
      return;
    }

    setObjectImages((current) => {
      const merged = uniqueList([...current, next]).slice(0, 6);
      if (merged.length === current.length && !current.includes(next)) {
        toast({ title: "Only 6 object images are allowed", variant: "destructive" });
      }
      return merged;
    });
    setImageInput("");
  };

  const removeImage = (image: string) => {
    setObjectImages((current) => current.filter((item) => item !== image));
  };

  const addDynamicField = () => {
    setDynamicFields((current) => [...current, { id: `field-${Date.now()}-${current.length}`, key: "", value: "" }]);
  };

  const removeDynamicField = (fieldId: string) => {
    setDynamicFields((current) => {
      const next = current.filter((field) => field.id !== fieldId);
      return next.length > 0 ? next : [{ id: `field-${Date.now()}`, key: "", value: "" }];
    });
  };

  const updateDynamicField = (fieldId: string, patch: Partial<DynamicField>) => {
    setDynamicFields((current) => current.map((field) => (field.id === fieldId ? { ...field, ...patch } : field)));
  };

  const handleDragStart = (list: "images" | "fields", index: number) => {
    setDragSource({ list, index });
  };

  const handleDrop = (list: "images" | "fields", dropIndex: number) => {
    if (!dragSource || dragSource.list !== list) return;
    if (list === "images") {
      setObjectImages((current) => reorderItems(current, dragSource.index, dropIndex));
    } else {
      setDynamicFields((current) => reorderItems(current, dragSource.index, dropIndex));
    }
    setDragSource(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Object Name *</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          data-testid="input-object-title"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Object Type (tag only one) *</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {objectTypes.map((type) => {
            const selected = formData.entityTypeId === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, entityTypeId: type.id })}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${selected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                data-testid={`tag-object-type-${type.slug}`}
              >
                {type.name}
              </button>
            );
          })}
        </div>
        {!formData.entityTypeId && (
          <p className="text-xs text-red-600 mt-1">Select one object type.</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Aliases</label>
        <div className="mt-2 flex gap-2">
          <Input
            value={aliasInput}
            onChange={(e) => setAliasInput(e.target.value)}
            placeholder="Add alias and press Add"
            data-testid="input-object-aliases"
          />
          <Button type="button" variant="secondary" onClick={addAlias} data-testid="button-add-alias">Add</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Plural alias is auto-generated from Object Name.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {allAliases.length === 0 ? (
            <span className="text-xs text-gray-500">No aliases yet</span>
          ) : (
            allAliases.map((alias) => {
              const isAuto = autoPluralAlias && alias.toLowerCase() === autoPluralAlias.toLowerCase();
              return (
                <Badge key={alias} variant={isAuto ? "default" : "secondary"} className="flex items-center gap-1">
                  {alias}
                  {!isAuto && (
                    <button
                      type="button"
                      onClick={() => removeAlias(alias)}
                      className="ml-1 text-xs"
                      aria-label={`Remove alias ${alias}`}
                    >
                      x
                    </button>
                  )}
                </Badge>
              );
            })
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Object Icon</label>
        <Input
          value={formData.objectIcon}
          onChange={(e) => setFormData({ ...formData, objectIcon: e.target.value })}
          placeholder="e.g., globe, building, person"
          data-testid="input-object-icon"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Object Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          data-testid="input-object-description"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Object Images (up to 6)</label>
        <div className="mt-2 flex gap-2">
          <Input
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="https://..."
            data-testid="input-object-image-url"
          />
          <Button type="button" variant="secondary" onClick={addImage} data-testid="button-add-object-image">Add</Button>
        </div>
        <div className="mt-2 space-y-2">
          {objectImages.length === 0 ? (
            <p className="text-xs text-gray-500">No images added</p>
          ) : objectImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="flex items-center gap-2 border rounded px-2 py-1"
              draggable
              onDragStart={() => handleDragStart("images", index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop("images", index)}
              data-testid={`row-object-image-${index}`}
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
              <span className="text-xs flex-1 truncate">{image}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(image)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Configuration</label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="materiality"
              checked={formData.materiality === "tangible"}
              onChange={() => setFormData({ ...formData, materiality: "tangible" })}
            />
            Tangible
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="materiality"
              checked={formData.materiality === "intangible"}
              onChange={() => setFormData({ ...formData, materiality: "intangible" })}
            />
            Intangible
          </label>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Object Category (tag multiple)</label>
        <div className="mt-2 flex gap-2">
          <Input
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            placeholder="Add category and press Add"
            data-testid="input-object-category"
          />
          <Button type="button" variant="secondary" onClick={addCategory} data-testid="button-add-object-category">Add</Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.length === 0 ? (
            <span className="text-xs text-gray-500">No categories</span>
          ) : (
            categories.map((category) => (
              <Badge key={category} variant="secondary" className="flex items-center gap-1">
                {category}
                <button
                  type="button"
                  onClick={() => removeCategory(category)}
                  className="ml-1 text-xs"
                  aria-label={`Remove category ${category}`}
                >
                  x
                </button>
              </Badge>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Custom Fields (scalable dataset)</label>
          <Button type="button" variant="secondary" size="sm" onClick={addDynamicField} data-testid="button-add-custom-field">
            <Plus className="h-3 w-3 mr-1" />
            Add Field
          </Button>
        </div>
        <div className="mt-2 space-y-2">
          {dynamicFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-[24px_1fr_1fr_40px] gap-2 items-center border rounded px-2 py-2"
              draggable
              onDragStart={() => handleDragStart("fields", index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop("fields", index)}
              data-testid={`row-custom-field-${index}`}
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
              <Input
                value={field.key}
                onChange={(e) => updateDynamicField(field.id, { key: e.target.value })}
                placeholder="Field name"
              />
              <Input
                value={field.value}
                onChange={(e) => updateDynamicField(field.id, { value: e.target.value })}
                placeholder="Field value"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeDynamicField(field.id)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
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
