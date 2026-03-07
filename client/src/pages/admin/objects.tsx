import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { GripVertical, Network, Plus, Search, Tag, CheckCircle, Circle, Trash2, Edit, BarChart3, Settings as SettingsIcon, Database, Eye, Upload } from "lucide-react";

interface ObjectType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

interface TypeDeleteImpact {
  type: ObjectType;
  objectCount: number;
  replacementTypes: ObjectType[];
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
    iconUrl?: string;
    images?: string[];
    materiality?: "tangible" | "intangible";
    categories?: string[];
    customFields?: Array<{ key: string; type?: string; value: string; options?: string[] }>;
    [key: string]: any;
  };
  entityType?: ObjectType;
}

type CustomFieldType = "text" | "textarea" | "number" | "date" | "boolean" | "email" | "url" | "select";

interface DynamicField {
  id: string;
  key: string;
  type: CustomFieldType;
  value: string;
  optionsText?: string;
}

const DEFAULT_OBJECT_ICON = "/assets/default-object-icon.svg";
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

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
  const [editingObject, setEditingObject] = useState<ObjectItem | undefined>(undefined);
  const [viewingObject, setViewingObject] = useState<ObjectItem | undefined>(undefined);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [mergeTargetId, setMergeTargetId] = useState<string>("");
  const [isTypeFormOpen, setIsTypeFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<ObjectType | undefined>(undefined);
  const [typeFormData, setTypeFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    color: "gray",
  });
  const [deleteImpact, setDeleteImpact] = useState<TypeDeleteImpact | null>(null);
  const [replacementTypeId, setReplacementTypeId] = useState<string>("");

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
  const selectedObjects = objects.filter((obj) => selectedObjectIds.includes(obj.id));

  useEffect(() => {
    setSelectedObjectIds((current) => current.filter((id) => objects.some((obj) => obj.id === id)));
  }, [objects]);

  useEffect(() => {
    if (mergeTargetId && !selectedObjectIds.includes(mergeTargetId)) {
      setMergeTargetId("");
    }
  }, [selectedObjectIds, mergeTargetId]);

  // Get object count by type
  const getObjectCountByType = (typeId: string) => {
    return objects.filter(e => e.entityTypeId === typeId).length;
  };

  const openCreateForm = () => {
    setFormMode("create");
    setEditingObject(undefined);
    setActiveTab("object-form");
  };

  const openEditForm = (object: ObjectItem) => {
    setFormMode("edit");
    setEditingObject(object);
    setActiveTab("object-form");
  };

  const closeObjectForm = () => {
    setEditingObject(undefined);
    setFormMode("create");
    setActiveTab("objects-list");
  };

  const openViewTab = (object: ObjectItem) => {
    setViewingObject(object);
    setActiveTab("object-view");
  };

  const closeViewTab = () => {
    setViewingObject(undefined);
    setActiveTab("objects-list");
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
    closeObjectForm();
  };

  const openCreateTypeForm = () => {
    setEditingType(undefined);
    setTypeFormData({ name: "", slug: "", description: "", icon: "", color: "gray" });
    setIsTypeFormOpen(true);
  };

  const openEditTypeForm = (type: ObjectType) => {
    setEditingType(type);
    setTypeFormData({
      name: type.name || "",
      slug: type.slug || "",
      description: type.description || "",
      icon: type.icon || "",
      color: type.color || "gray",
    });
    setIsTypeFormOpen(true);
  };

  const closeTypeForm = () => {
    setEditingType(undefined);
    setIsTypeFormOpen(false);
  };

  const saveTypeMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: typeFormData.name.trim(),
        slug: (typeFormData.slug.trim() || toKebabSlug(typeFormData.name)).slice(0, 100),
        description: typeFormData.description.trim() || undefined,
        icon: typeFormData.icon.trim() || undefined,
        color: typeFormData.color.trim() || undefined,
      };

      if (editingType) {
        return apiRequest(`/api/entities/types/${editingType.id}`, "PATCH", payload);
      }
      return apiRequest("/api/entities/types", "POST", payload);
    },
    onSuccess: async () => {
      toast({ title: `Object type ${editingType ? "updated" : "created"} successfully` });
      closeTypeForm();
      await queryClient.invalidateQueries({ queryKey: ["/api/entities/types"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
    },
    onError: (error: any) => {
      toast({
        title: `Failed to ${editingType ? "update" : "create"} object type`,
        description: error?.message || "Please check type details and try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTypeMutation = useMutation({
    mutationFn: (typeId: string) => apiRequest(`/api/entities/types/${typeId}`, "DELETE"),
    onSuccess: async () => {
      toast({ title: "Object type deleted successfully" });
      await queryClient.invalidateQueries({ queryKey: ["/api/entities/types"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete object type",
        description: error?.message || "System types cannot be deleted.",
        variant: "destructive",
      });
    },
  });

  const fetchDeleteImpactMutation = useMutation({
    mutationFn: async (typeId: string) => {
      const response = await fetch(`/api/entities/types/${typeId}/delete-impact`, { credentials: 'include' });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch delete impact");
      }
      return response.json();
    },
    onSuccess: (payload: any) => {
      setDeleteImpact(payload.impact as TypeDeleteImpact);
      setReplacementTypeId("");
    },
    onError: (error: any) => {
      toast({
        title: "Cannot prepare delete",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteWithReplacementMutation = useMutation({
    mutationFn: () => {
      if (!deleteImpact) throw new Error("No delete impact loaded");
      return apiRequest(`/api/entities/types/${deleteImpact.type.id}/delete-with-replacement`, "POST", { replacementTypeId });
    },
    onSuccess: async () => {
      toast({ title: "Object type deleted with replacement" });
      setDeleteImpact(null);
      setReplacementTypeId("");
      await queryClient.invalidateQueries({ queryKey: ["/api/entities/types"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error?.message || "Please choose a valid replacement type.",
        variant: "destructive",
      });
    },
  });

  const mergeMutation = useMutation({
    mutationFn: () => {
      const sourceEntityIds = selectedObjectIds.filter((id) => id !== mergeTargetId);
      return apiRequest("/api/entities/merge", "POST", { targetEntityId: mergeTargetId, sourceEntityIds });
    },
    onSuccess: async () => {
      toast({ title: "Objects merged successfully" });
      setSelectedObjectIds([]);
      setMergeTargetId("");
      await queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Merge failed",
        description: error?.message || "Please check selected objects and try again.",
        variant: "destructive",
      });
    },
  });

  const toggleObjectSelection = (objectId: string, checked: boolean) => {
    setSelectedObjectIds((current) => {
      if (checked) {
        return current.includes(objectId) ? current : [...current, objectId];
      }
      return current.filter((id) => id !== objectId);
    });
  };

  const toggleSelectAllVisible = (checked: boolean) => {
    if (!checked) {
      setSelectedObjectIds([]);
      return;
    }
    setSelectedObjectIds(objects.map((obj) => obj.id));
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
        <Button onClick={openCreateForm} data-testid="button-create-object">
          <Plus className="h-4 w-4 mr-2" />
          Create Object
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${(activeTab === "object-form" || activeTab === "object-view") ? "grid-cols-5" : "grid-cols-4"}`}>
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
          {activeTab === "object-form" && (
            <TabsTrigger value="object-form" data-testid="tab-object-form">
              <Edit className="h-4 w-4 mr-2" />
              Object Form
            </TabsTrigger>
          )}
          {activeTab === "object-view" && (
            <TabsTrigger value="object-view" data-testid="tab-object-view">
              <Eye className="h-4 w-4 mr-2" />
              Object View
            </TabsTrigger>
          )}
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

          {selectedObjectIds.length >= 2 && (
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_280px_160px] gap-3 items-center">
                  <div className="text-sm">
                    <span className="font-medium">{selectedObjectIds.length}</span> objects selected for merge.
                    <span className="text-muted-foreground"> Choose canonical target object.</span>
                  </div>
                  <Select value={mergeTargetId} onValueChange={setMergeTargetId}>
                    <SelectTrigger data-testid="select-merge-target">
                      <SelectValue placeholder="Select target object" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedObjects.map((obj) => (
                        <SelectItem key={obj.id} value={obj.id}>{obj.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    disabled={!mergeTargetId || selectedObjectIds.length < 2 || mergeMutation.isPending}
                    onClick={() => mergeMutation.mutate()}
                    data-testid="button-merge-objects"
                  >
                    {mergeMutation.isPending ? "Merging..." : "Merge Selected"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
                      <TableHead className="w-[60px]">
                        <input
                          type="checkbox"
                          checked={objects.length > 0 && selectedObjectIds.length === objects.length}
                          onChange={(e) => toggleSelectAllVisible(e.target.checked)}
                          aria-label="Select all objects"
                        />
                      </TableHead>
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
                        onView={openViewTab}
                        onEdit={openEditForm}
                        isSelected={selectedObjectIds.includes(object.id)}
                        onToggleSelect={toggleObjectSelection}
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
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle>Object Types</CardTitle>
                  <CardDescription>Core object types in the knowledge graph</CardDescription>
                </div>
                <Button type="button" onClick={openCreateTypeForm} data-testid="button-add-object-type">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Type
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isTypeFormOpen && (
                <div className="border rounded-lg p-4 mb-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Type Name *</label>
                      <Input
                        value={typeFormData.name}
                        onChange={(e) => setTypeFormData((current) => ({
                          ...current,
                          name: e.target.value,
                          slug: editingType ? current.slug : toKebabSlug(e.target.value),
                        }))}
                        placeholder="e.g., Topic"
                        data-testid="input-type-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Slug *</label>
                      <Input
                        value={typeFormData.slug}
                        onChange={(e) => setTypeFormData((current) => ({ ...current, slug: toKebabSlug(e.target.value) }))}
                        placeholder="e.g., topic"
                        data-testid="input-type-slug"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Type Icon</label>
                      <Input
                        value={typeFormData.icon}
                        onChange={(e) => setTypeFormData((current) => ({ ...current, icon: e.target.value }))}
                        placeholder="e.g., tag, globe, briefcase"
                        data-testid="input-type-icon"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Color</label>
                      <Input
                        value={typeFormData.color}
                        onChange={(e) => setTypeFormData((current) => ({ ...current, color: e.target.value }))}
                        placeholder="e.g., blue, emerald, slate"
                        data-testid="input-type-color"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={typeFormData.description}
                      onChange={(e) => setTypeFormData((current) => ({ ...current, description: e.target.value }))}
                      rows={2}
                      placeholder="Short description"
                      data-testid="input-type-description"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      disabled={!typeFormData.name.trim() || !typeFormData.slug.trim() || saveTypeMutation.isPending}
                      onClick={() => saveTypeMutation.mutate()}
                      data-testid="button-save-object-type"
                    >
                      {saveTypeMutation.isPending ? "Saving..." : (editingType ? "Update Type" : "Create Type")}
                    </Button>
                    <Button type="button" variant="outline" onClick={closeTypeForm} data-testid="button-cancel-object-type">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {deleteImpact && (
                <div className="border rounded-lg p-4 mb-4 space-y-3 bg-red-50/50" data-testid="panel-delete-type-impact">
                  <div>
                    <h4 className="font-semibold text-red-700">Delete Object Type: {deleteImpact.type.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      This type currently has <span className="font-medium">{deleteImpact.objectCount}</span> objects.
                      Choose a replacement type to move them before delete.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Replacement Type *</label>
                    <Select value={replacementTypeId} onValueChange={setReplacementTypeId}>
                      <SelectTrigger data-testid="select-replacement-type">
                        <SelectValue placeholder="Select replacement type" />
                      </SelectTrigger>
                      <SelectContent>
                        {deleteImpact.replacementTypes.map((item) => (
                          <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={!replacementTypeId || deleteWithReplacementMutation.isPending}
                      onClick={() => deleteWithReplacementMutation.mutate()}
                      data-testid="button-confirm-delete-type"
                    >
                      {deleteWithReplacementMutation.isPending ? "Deleting..." : "Delete With Replacement"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDeleteImpact(null);
                        setReplacementTypeId("");
                      }}
                      data-testid="button-cancel-delete-type"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {objectTypes.map((type) => (
                  <div
                    key={type.id}
                    className="p-3 border rounded-lg hover:border-purple-400 transition-colors"
                    onClick={() => {
                      setSelectedType(type.id);
                      setActiveTab("objects-list");
                    }}
                    data-testid={`card-object-type-${type.slug}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs rounded border px-2 py-0.5 text-muted-foreground">{type.icon || "icon"}</span>
                        <Badge variant="outline" className={`bg-${type.color}-100 text-${type.color}-700`}>
                          {type.name}
                        </Badge>
                        {type.isSystem && <CheckCircle className="h-3 w-3 text-green-600" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditTypeForm(type);
                          }}
                          data-testid={`button-edit-object-type-${type.id}`}
                        >
                          <Edit className="h-3.5 w-3.5 text-blue-600" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={type.isSystem || fetchDeleteImpactMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchDeleteImpactMutation.mutate(type.id);
                          }}
                          data-testid={`button-delete-object-type-${type.id}`}
                        >
                          <Trash2 className={`h-3.5 w-3.5 ${type.isSystem ? "text-gray-300" : "text-red-600"}`} />
                        </Button>
                      </div>
                    </div>
                    {type.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1 mb-1">{type.description}</div>
                    )}
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

        <TabsContent value="object-form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{formMode === "edit" ? "Edit Object" : "Create New Object"}</CardTitle>
              <CardDescription>
                {formMode === "edit" ? "Update object information in-place" : "Add a new object to the knowledge graph"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ObjectForm
                object={editingObject}
                objectTypes={objectTypes}
                allObjects={objects}
                onBack={closeObjectForm}
                onSuccess={handleFormSuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="object-view" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Object Details</CardTitle>
              <CardDescription>View complete object information and graph links</CardDescription>
            </CardHeader>
            <CardContent>
              {viewingObject ? (
                <>
                  <ObjectDetailsView object={viewingObject} objectType={objectTypes.find((t) => t.id === viewingObject.entityTypeId)} />
                  <div className="pt-3">
                    <Button variant="outline" type="button" onClick={closeViewTab} data-testid="button-close-object-view">
                      Back To Objects List
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No object selected.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Object Row Component with Edit capability
function ObjectRow({ object, objectTypes, onView, onEdit, isSelected, onToggleSelect }: { object: ObjectItem; objectTypes: ObjectType[]; onView: (object: ObjectItem) => void; onEdit: (object: ObjectItem) => void; isSelected: boolean; onToggleSelect: (objectId: string, checked: boolean) => void }) {
  const { toast } = useToast();

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
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onToggleSelect(object.id, e.target.checked)}
            aria-label={`Select ${object.title}`}
          />
          {object.isVerified ? (
            <CheckCircle className="h-4 w-4 text-green-600" data-testid={`icon-verified-${object.id}`} />
          ) : (
            <Circle className="h-4 w-4 text-gray-300" />
          )}
        </div>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(object)}
            data-testid={`button-view-object-${object.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(object)}
            data-testid={`button-edit-object-${object.id}`}
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>
          
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
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {object.isVerified && <CheckCircle className="h-5 w-5 text-green-600" />}
          {object.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{object.description || "No description"}</p>
      </div>

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

        {(metadata.iconUrl || metadata.materiality || categories.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Object Icon</label>
              <div className="mt-2">
                <img
                  src={typeof metadata.iconUrl === "string" && metadata.iconUrl.trim() ? metadata.iconUrl : DEFAULT_OBJECT_ICON}
                  alt="Object icon"
                  className="h-12 w-12 rounded border object-cover"
                />
              </div>
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

function ObjectRelationshipsEditor({ entity }: { entity: ObjectItem }) {
  const { toast } = useToast();
  const [targetEntityId, setTargetEntityId] = useState<string>("");
  const [relationshipType, setRelationshipType] = useState<"parent" | "child" | "friend">("friend");

  const { data: allEntitiesData } = useQuery<{ entities: ObjectItem[] }>({
    queryKey: ["/api/entities", "relationship-editor", entity.id],
    queryFn: async () => {
      const response = await fetch("/api/entities?limit=200", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load objects");
      return response.json();
    },
  });

  const { data: relationshipsData } = useQuery<{ relationships: any[] }>({
    queryKey: ["/api/entities", entity.id, "relationships", "editor"],
    queryFn: async () => {
      const response = await fetch(`/api/entities/${entity.id}/relationships`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load relationships");
      return response.json();
    },
  });

  const relationshipMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        sourceEntityId: entity.id,
        targetEntityId,
        relationshipType,
        isBidirectional: relationshipType === "friend",
        metadata: {},
        strength: 1,
        isActive: true,
      };

      return apiRequest("/api/entities/relationships", "POST", payload);
    },
    onSuccess: async () => {
      toast({ title: "Relationship added" });
      setTargetEntityId("");
      await queryClient.invalidateQueries({ queryKey: ["/api/entities", entity.id, "relationships", "editor"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add relationship",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (relationshipId: string) => apiRequest(`/api/entities/relationships/${relationshipId}`, "DELETE"),
    onSuccess: async () => {
      toast({ title: "Relationship removed" });
      await queryClient.invalidateQueries({ queryKey: ["/api/entities", entity.id, "relationships", "editor"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove relationship",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const allEntities = (allEntitiesData?.entities || []).filter((item) => item.id !== entity.id);
  const relationships = relationshipsData?.relationships || [];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold">Parent / Child / Friend</h4>
        <p className="text-xs text-muted-foreground mt-1">Manage graph relationships directly from this object.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Select value={relationshipType} onValueChange={(value) => setRelationshipType(value as "parent" | "child" | "friend")}>
          <SelectTrigger data-testid="select-relationship-type">
            <SelectValue placeholder="Relationship type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="parent">Parent</SelectItem>
            <SelectItem value="child">Child</SelectItem>
            <SelectItem value="friend">Friend</SelectItem>
          </SelectContent>
        </Select>

        <Select value={targetEntityId} onValueChange={setTargetEntityId}>
          <SelectTrigger data-testid="select-relationship-target">
            <SelectValue placeholder="Select target object" />
          </SelectTrigger>
          <SelectContent>
            {allEntities.map((item) => (
              <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          onClick={() => relationshipMutation.mutate()}
          disabled={!targetEntityId || relationshipMutation.isPending}
          data-testid="button-add-relationship"
        >
          {relationshipMutation.isPending ? "Adding..." : "Add Relationship"}
        </Button>
      </div>

      <div className="space-y-2">
        {relationships.length === 0 ? (
          <p className="text-xs text-muted-foreground">No relationships yet.</p>
        ) : (
          relationships.map((rel: any) => (
            <div key={rel.id} className="flex items-center justify-between border rounded px-3 py-2" data-testid={`row-relationship-${rel.id}`}>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="capitalize">{rel.type || rel.relationshipType}</Badge>
                <span>{rel.targetEntityTitle || rel.targetEntityId}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(rel.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-relationship-${rel.id}`}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Object Form Component (for both Create and Edit)
function ObjectForm({ 
  object, 
  objectTypes, 
  allObjects,
  onBack,
  onSuccess 
}: { 
  object?: ObjectItem;
  objectTypes: ObjectType[]; 
  allObjects: ObjectItem[];
  onBack: () => void;
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
        type: (["text", "textarea", "number", "date", "boolean", "email", "url", "select"] as string[]).includes(String(field.type || ""))
          ? (field.type as CustomFieldType)
          : "text",
        value: String(field.value || ""),
        optionsText: Array.isArray(field.options) ? field.options.join(", ") : "",
      }))
    : [];

  const [formData, setFormData] = useState({
    title: object?.title || "",
    entityTypeId: object?.entityTypeId || objectTypes[0]?.id || "",
    description: object?.description || "",
    objectIconUrl: typeof metadata.iconUrl === "string" && metadata.iconUrl.trim() ? metadata.iconUrl : DEFAULT_OBJECT_ICON,
    materiality: metadata.materiality === "intangible" ? "intangible" : "tangible",
    isVerified: object?.isVerified || false,
    isPublic: object?.isPublic ?? true,
  });
  const [manualAliases, setManualAliases] = useState<string[]>(object?.aliases || []);
  const [aliasInput, setAliasInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [objectImages, setObjectImages] = useState<string[]>(initialImages);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isIconUploading, setIsIconUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<string[]>(Array.isArray(metadata.categories) ? metadata.categories : []);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>(
    initialCustomFields.length > 0 ? initialCustomFields : [{ id: `field-${Date.now()}`, key: "", type: "text", value: "", optionsText: "" }],
  );
  const [dragSource, setDragSource] = useState<{ list: "images" | "fields"; index: number } | null>(null);

  const autoPluralAlias = useMemo(() => buildPluralAlias(formData.title), [formData.title]);
  const allAliases = useMemo(
    () => uniqueList([...manualAliases, ...(autoPluralAlias ? [autoPluralAlias] : [])]),
    [manualAliases, autoPluralAlias],
  );
  const categorySuggestions = useMemo(() => {
    const query = categoryInput.trim().toLowerCase();
    if (query.length < 1) return [];

    const matches = uniqueList(
      allObjects
        .map((obj) => obj.title)
        .filter((title) => !!title && title.toLowerCase().includes(query)),
    );

    return matches
      .filter((title) => !categories.some((c) => c.toLowerCase() === title.toLowerCase()))
      .slice(0, 8);
  }, [allObjects, categories, categoryInput]);

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
      .map((field) => ({
        key: field.key.trim(),
        type: field.type,
        value: field.value.trim(),
        options: field.type === "select"
          ? uniqueList((field.optionsText || "").split(",").map((opt) => opt.trim()).filter(Boolean))
          : undefined,
      }))
      .filter((field) => field.key.length > 0);

    const mergedMetadata = {
      ...(metadata || {}),
      iconUrl: formData.objectIconUrl || DEFAULT_OBJECT_ICON,
      materiality: formData.materiality,
      categories: uniqueList(categories),
      images: uniqueList(objectImages).slice(0, 6),
      customFields: normalizedDynamicFields,
      dynamicData: normalizedDynamicFields.reduce<Record<string, string | number | boolean>>((acc, field) => {
        if (field.type === "number") {
          const num = Number(field.value);
          acc[field.key] = Number.isFinite(num) ? num : field.value;
        } else if (field.type === "boolean") {
          acc[field.key] = field.value === "true";
        } else {
          acc[field.key] = field.value;
        }
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

  const addCategoryFromSuggestion = (value: string) => {
    const next = value.trim();
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

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (objectImages.length >= 6) {
      toast({ title: "Only 6 object images are allowed", variant: "destructive" });
      return;
    }

    setIsImageUploading(true);
    try {
      const remainingSlots = Math.max(0, 6 - objectImages.length);
      const selected = fileArray.slice(0, remainingSlots);

      const uploadedUrls: string[] = [];
      for (const file of selected) {
        if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
          toast({ title: `${file.name} has unsupported image type`, variant: "destructive" });
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast({ title: `${file.name} exceeds 5MB`, variant: "destructive" });
          continue;
        }

        const form = new FormData();
        form.append("file", file);
        form.append("directory", "objects/images");

        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: form,
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Upload failed for ${file.name}`);
        }

        const data = await res.json();
        if (typeof data.url === "string" && data.url.trim()) {
          uploadedUrls.push(data.url.trim());
        }
      }

      if (uploadedUrls.length > 0) {
        setObjectImages((current) => uniqueList([...current, ...uploadedUrls]).slice(0, 6));
        toast({ title: `${uploadedUrls.length} image(s) uploaded` });
      }

      if (fileArray.length > remainingSlots) {
        toast({ title: "Only first 6 images are kept", variant: "destructive" });
      }
    } catch (error: any) {
      toast({
        title: "Image upload failed",
        description: error?.message || "Could not upload image",
        variant: "destructive",
      });
    } finally {
      setIsImageUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const uploadIcon = async (file: File) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      toast({ title: "Icon type not allowed (png, jpg, webp, gif, svg)", variant: "destructive" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Icon must be 2MB or smaller", variant: "destructive" });
      return;
    }

    setIsIconUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("directory", "objects/icons");

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Icon upload failed");
      }

      const data = await res.json();
      const url = typeof data.url === "string" && data.url.trim() ? data.url.trim() : "";
      if (!url) {
        throw new Error("Upload response did not include image URL");
      }

      setFormData((current) => ({ ...current, objectIconUrl: url }));
      toast({ title: "Icon uploaded" });
    } catch (error: any) {
      toast({
        title: "Icon upload failed",
        description: error?.message || "Could not upload icon",
        variant: "destructive",
      });
    } finally {
      setIsIconUploading(false);
      if (iconInputRef.current) {
        iconInputRef.current.value = "";
      }
    }
  };

  const removeImage = (image: string) => {
    setObjectImages((current) => current.filter((item) => item !== image));
  };

  const addDynamicField = () => {
    setDynamicFields((current) => [...current, { id: `field-${Date.now()}-${current.length}`, key: "", type: "text", value: "", optionsText: "" }]);
  };

  const removeDynamicField = (fieldId: string) => {
    setDynamicFields((current) => {
      const next = current.filter((field) => field.id !== fieldId);
      return next.length > 0 ? next : [{ id: `field-${Date.now()}`, key: "", type: "text", value: "", optionsText: "" }];
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
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        <div className="lg:col-span-6 space-y-4">
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
            <div className="mt-2 flex items-center gap-3 border rounded p-3">
              <img
                src={formData.objectIconUrl || DEFAULT_OBJECT_ICON}
                alt="Object icon"
                className="h-14 w-14 rounded border object-cover"
              />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Default icon shown until you upload a custom icon.</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => iconInputRef.current?.click()}
                    data-testid="button-upload-object-icon"
                  >
                    {isIconUploading ? "Uploading..." : "Change Icon"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData((current) => ({ ...current, objectIconUrl: DEFAULT_OBJECT_ICON }))}
                    data-testid="button-reset-object-icon"
                  >
                    Use Default
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Allowed: png/jpg/webp/gif/svg, max 2MB.</p>
              </div>
            </div>
            <input
              ref={iconInputRef}
              type="file"
              accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void uploadIcon(file);
                }
              }}
              data-testid="input-upload-object-icon"
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
            <div
              className="mt-2 rounded-lg border border-dashed p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.length) {
                  void uploadFiles(e.dataTransfer.files);
                }
              }}
              data-testid="dropzone-object-images"
            >
              <Upload className="h-5 w-5 mx-auto mb-2 text-gray-500" />
              <p className="text-sm font-medium">Drag and drop image files here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse (png/jpg/webp/gif/svg, max 5MB each)</p>
              {isImageUploading && <p className="text-xs mt-2">Uploading...</p>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  void uploadFiles(e.target.files);
                }
              }}
              data-testid="input-upload-object-images"
            />
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

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Custom Fields (all field types)</label>
              <Button type="button" variant="secondary" size="sm" onClick={addDynamicField} data-testid="button-add-custom-field">
                <Plus className="h-3 w-3 mr-1" />
                Add Field
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {dynamicFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border rounded p-2"
                  draggable
                  onDragStart={() => handleDragStart("fields", index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop("fields", index)}
                  data-testid={`row-custom-field-${index}`}
                >
                  <div className="grid grid-cols-[24px_1fr_180px_40px] gap-2 items-center">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Input
                      value={field.key}
                      onChange={(e) => updateDynamicField(field.id, { key: e.target.value })}
                      placeholder="Field name"
                    />
                    <Select value={field.type} onValueChange={(value) => updateDynamicField(field.id, { type: value as CustomFieldType, value: "", optionsText: field.type === "select" ? field.optionsText : "" })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Field type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeDynamicField(field.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {field.type === "textarea" && (
                      <Textarea
                        value={field.value}
                        onChange={(e) => updateDynamicField(field.id, { value: e.target.value })}
                        rows={2}
                        placeholder="Field value"
                      />
                    )}

                    {field.type === "number" && (
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => updateDynamicField(field.id, { value: e.target.value })}
                        placeholder="Number value"
                      />
                    )}

                    {field.type === "date" && (
                      <Input
                        type="date"
                        value={field.value}
                        onChange={(e) => updateDynamicField(field.id, { value: e.target.value })}
                      />
                    )}

                    {field.type === "boolean" && (
                      <Select value={field.value || "false"} onValueChange={(value) => updateDynamicField(field.id, { value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {(field.type === "email" || field.type === "url" || field.type === "text") && (
                      <Input
                        type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
                        value={field.value}
                        onChange={(e) => updateDynamicField(field.id, { value: e.target.value })}
                        placeholder="Field value"
                      />
                    )}

                    {field.type === "select" && (
                      <>
                        <Input
                          value={field.optionsText || ""}
                          onChange={(e) => updateDynamicField(field.id, { optionsText: e.target.value })}
                          placeholder="Options (comma separated)"
                        />
                        <Select value={field.value} onValueChange={(value) => updateDynamicField(field.id, { value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose option" />
                          </SelectTrigger>
                          <SelectContent>
                            {uniqueList((field.optionsText || "").split(",").map((opt) => opt.trim()).filter(Boolean)).map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" type="button" onClick={onBack} data-testid="button-close-object-form-top">
              Back To Objects List
            </Button>
          </div>

          <div className="border rounded p-3 space-y-3">
            <h4 className="font-medium">Configuration</h4>
            <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-4 pt-1">
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
          </div>

          <div className="border rounded p-3 space-y-3">
            <h4 className="font-medium">Object Category (multiple)</h4>
            <div className="flex gap-2">
              <Input
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="Type to find existing objects/tags"
                data-testid="input-object-category"
              />
              <Button type="button" variant="secondary" onClick={addCategory} data-testid="button-add-object-category">Add</Button>
            </div>
            {categorySuggestions.length > 0 && (
              <div className="border rounded max-h-40 overflow-y-auto" data-testid="list-category-suggestions">
                {categorySuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => addCategoryFromSuggestion(suggestion)}
                    data-testid={`item-category-suggestion-${toKebabSlug(suggestion)}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
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

          <div className="border rounded p-3">
            {isEdit && object ? (
              <ObjectRelationshipsEditor entity={object} />
            ) : (
              <div className="space-y-1">
                <h4 className="font-medium">Relationships Assignment</h4>
                <p className="text-xs text-muted-foreground">Create the object first, then assign parent/child/friend relationships here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saveMutation.isPending} data-testid="button-submit-object">
          {saveMutation.isPending ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Object" : "Create Object")}
        </Button>
      </div>
    </form>
  );
}
