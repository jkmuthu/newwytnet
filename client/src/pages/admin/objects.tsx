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
import { GripVertical, Network, Plus, Search, Tag, Trash2, Edit, BarChart3, Settings as SettingsIcon, Database, Eye, Upload, Users } from "lucide-react";

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
  tagCount: number;
  imageUrl?: string;
  metadata?: {
    iconUrl?: string;
    images?: string[];
    materiality?: "tangible" | "intangible";
    customFields?: Array<{ key: string; type?: string; value: string; options?: string[] }>;
    [key: string]: any;
  };
  entityType?: ObjectType;
}

interface ObjectGroupItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  objectCount: number;
  objects: Array<{ id: string; title: string }>;
}

type CustomFieldType = "text" | "textarea" | "number" | "date" | "boolean" | "email" | "url" | "select";

interface DynamicField {
  id: string;
  key: string;
  type: CustomFieldType;
  value: string;
  optionsText?: string;
}

interface BulkGraphReport {
  created: string[];
  reused: string[];
  linked: string[];
  skipped: string[];
  failed: string[];
}

const DEFAULT_OBJECT_ICON = "/assets/default-object-icon.svg";
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const DESCRIPTION_STOP_WORDS = new Set(["is", "was", "that"]);

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
  const [bulkGraphInput, setBulkGraphInput] = useState(
    "World > India > Tamilnadu > Madurai\nIndia = Russia",
  );
  const [bulkGraphTypeId, setBulkGraphTypeId] = useState<string>("");
  const [bulkGraphReport, setBulkGraphReport] = useState<BulkGraphReport | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupObjectSearch, setGroupObjectSearch] = useState("");
  const [groupEntityIds, setGroupEntityIds] = useState<string[]>([]);

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

  const { data: groupsData, isLoading: isGroupsLoading } = useQuery<{ groups: ObjectGroupItem[] }>({
    queryKey: ["/api/entities/groups"],
  });

  const { data: allObjectsData } = useQuery<{ entities: ObjectItem[] }>({
    queryKey: ["/api/entities", "groups-picker"],
    queryFn: async () => {
      const response = await fetch("/api/entities?limit=500", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch objects for groups");
      return response.json();
    },
  });

  const objectGroups = groupsData?.groups || [];
  const allObjectsForGroups = allObjectsData?.entities || [];
  const selectedGroupObjects = allObjectsForGroups.filter((obj) => groupEntityIds.includes(obj.id));
  const groupObjectSuggestions = groupObjectSearch.trim()
    ? allObjectsForGroups
        .filter((obj) => !groupEntityIds.includes(obj.id))
        .filter((obj) => obj.title.toLowerCase().includes(groupObjectSearch.trim().toLowerCase()))
        .slice(0, 8)
    : [];

  useEffect(() => {
    if (!bulkGraphTypeId && objectTypes.length > 0) {
      setBulkGraphTypeId(objectTypes[0].id);
    }
  }, [objectTypes, bulkGraphTypeId]);

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

  const parseStrictApiJson = async (response: Response, action: string) => {
    const raw = await response.text();
    const contentType = response.headers.get("content-type") || "";
    const looksLikeHtml = raw.trim().startsWith("<!DOCTYPE") || raw.trim().startsWith("<html");

    if (!response.ok) {
      throw new Error(raw || `Failed to ${action}`);
    }

    if (!contentType.includes("application/json") || looksLikeHtml) {
      throw new Error(`Server returned HTML for ${action}.`);
    }

    try {
      return JSON.parse(raw);
    } catch {
      throw new Error(`Server returned invalid JSON for ${action}.`);
    }
  };

  const saveTypeMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: typeFormData.name.trim(),
        slug: (typeFormData.slug.trim() || toKebabSlug(typeFormData.name)).slice(0, 100),
        description: typeFormData.description.trim() || undefined,
        icon: typeFormData.icon.trim() || undefined,
        color: typeFormData.color.trim() || undefined,
      };

      if (editingType) {
        const response = await apiRequest(`/api/entities/types/${editingType.id}`, "PATCH", payload);
        return parseStrictApiJson(response, "update object type");
      }
      const response = await apiRequest("/api/entities/types", "POST", payload);
      return parseStrictApiJson(response, "create object type");
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
    mutationFn: async (typeId: string) => {
      const response = await apiRequest(`/api/entities/types/${typeId}`, "DELETE");
      return parseStrictApiJson(response, "delete object type");
    },
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
      const raw = await response.text();

      if (!response.ok) {
        throw new Error(raw || "Failed to fetch delete impact");
      }

      const contentType = response.headers.get("content-type") || "";
      const looksLikeHtml = raw.trim().startsWith("<!DOCTYPE") || raw.trim().startsWith("<html");
      if (!contentType.includes("application/json") || looksLikeHtml) {
        // Fallback: compute delete impact in client using loaded objects/types.
        const type = objectTypes.find((item) => item.id === typeId);
        if (!type) {
          throw new Error("Object type not found in current list.");
        }
        if (type.isSystem) {
          throw new Error("System object types cannot be deleted.");
        }

        const objectCount = objects.filter((obj) => obj.entityTypeId === typeId).length;
        const replacementTypes = objectTypes.filter((item) => item.id !== typeId);

        return {
          success: true,
          impact: {
            type,
            objectCount,
            replacementTypes,
          },
          fallbackMode: true,
        };
      }

      try {
        return JSON.parse(raw);
      } catch {
        throw new Error("Delete impact API returned invalid JSON. Please restart local server and try again.");
      }
    },
    onSuccess: (payload: any) => {
      setDeleteImpact(payload.impact as TypeDeleteImpact);
      setReplacementTypeId("");
      if (payload?.fallbackMode) {
        toast({ title: "Using local fallback for delete impact" });
      }
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
    mutationFn: async () => {
      if (!deleteImpact) throw new Error("No delete impact loaded");

      // Try dedicated endpoint first.
      try {
        const response = await apiRequest(`/api/entities/types/${deleteImpact.type.id}/delete-with-replacement`, "POST", { replacementTypeId });
        return await parseStrictApiJson(response, "delete object type with replacement");
      } catch (error: any) {
        const rawMessage = String(error?.message || "");
        const looksLikeStaleRoute =
          rawMessage.includes("<!DOCTYPE") ||
          rawMessage.includes("<html") ||
          rawMessage.includes("Cannot POST") ||
          rawMessage.includes("404:") ||
          rawMessage.includes("returned HTML") ||
          rawMessage.includes("invalid JSON");
        if (!looksLikeStaleRoute) {
          throw error;
        }

        // Fallback path for older/stale runtime: reassign objects then delete type.
        const affected = objects.filter((obj) => obj.entityTypeId === deleteImpact.type.id);
        for (const obj of affected) {
          const patchResponse = await apiRequest(`/api/entities/${obj.id}`, "PATCH", { entityTypeId: replacementTypeId });
          await parseStrictApiJson(patchResponse, "reassign object type");
        }
        const deleteResponse = await apiRequest(`/api/entities/types/${deleteImpact.type.id}`, "DELETE");
        await parseStrictApiJson(deleteResponse, "delete object type");

        return { success: true, fallbackMode: true };
      }
    },
    onSuccess: async (payload: any) => {
      toast({
        title: payload?.fallbackMode ? "Object type deleted (fallback mode)" : "Object type deleted with replacement",
      });
      setDeleteImpact(null);
      setReplacementTypeId("");
      await queryClient.invalidateQueries({ queryKey: ["/api/entities/types"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error?.message || "Please choose a valid replacement type and ensure API server is running.",
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

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const name = groupName.trim();
      if (!name) throw new Error("Object group name is required");

      const response = await apiRequest("/api/entities/groups", "POST", {
        name,
        slug: toKebabSlug(name),
        description: groupDescription.trim() || undefined,
        entityIds: groupEntityIds,
      });
      return parseStrictApiJson(response, "create object group");
    },
    onSuccess: async () => {
      toast({ title: "Object group created" });
      setGroupName("");
      setGroupDescription("");
      setGroupObjectSearch("");
      setGroupEntityIds([]);
      await queryClient.invalidateQueries({ queryKey: ["/api/entities/groups"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create object group",
        description: error?.message || "Please check name and tagged objects",
        variant: "destructive",
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiRequest(`/api/entities/groups/${groupId}`, "DELETE");
      return parseStrictApiJson(response, "delete object group");
    },
    onSuccess: async () => {
      toast({ title: "Object group deleted" });
      await queryClient.invalidateQueries({ queryKey: ["/api/entities/groups"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete object group",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const bulkGraphMutation = useMutation({
    mutationFn: async () => {
      const lines = bulkGraphInput
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) {
        throw new Error("Add at least one hierarchy line.");
      }

      if (!bulkGraphTypeId) {
        throw new Error("Select object type for new objects.");
      }

      const parsedNodes: string[] = [];
      const parentEdges: Array<{ parent: string; child: string }> = [];
      const friendEdges: Array<{ left: string; right: string }> = [];

      for (const line of lines) {
        if (line.includes(">")) {
          const chain = line.split(">").map((part) => part.trim()).filter(Boolean);
          if (chain.length < 2) {
            throw new Error(`Invalid hierarchy line: ${line}`);
          }
          parsedNodes.push(...chain);
          for (let i = 1; i < chain.length; i += 1) {
            parentEdges.push({ parent: chain[i - 1], child: chain[i] });
          }
          continue;
        }

        if (line.includes("=")) {
          const pair = line.split("=").map((part) => part.trim()).filter(Boolean);
          if (pair.length !== 2) {
            throw new Error(`Invalid friend line: ${line}`);
          }
          parsedNodes.push(pair[0], pair[1]);
          friendEdges.push({ left: pair[0], right: pair[1] });
          continue;
        }

        throw new Error(`Unsupported line format: ${line}`);
      }

      const uniqueNodes = uniqueList(parsedNodes);
      const report: BulkGraphReport = { created: [], reused: [], linked: [], skipped: [], failed: [] };

      const entitiesMap = new Map<string, { id: string; title: string }>();
      const readRes = await fetch("/api/entities?limit=500", { credentials: "include" });
      if (!readRes.ok) throw new Error("Failed to fetch existing objects for bulk run.");
      const readPayload = await readRes.json();
      const existingEntities: ObjectItem[] = Array.isArray(readPayload?.entities) ? readPayload.entities : [];
      for (const entity of existingEntities) {
        entitiesMap.set(entity.title.trim().toLowerCase(), { id: entity.id, title: entity.title });
      }

      const nodeIdByName = new Map<string, string>();

      for (const rawTitle of uniqueNodes) {
        const normalizedKey = rawTitle.trim().toLowerCase();
        const existing = entitiesMap.get(normalizedKey);
        if (existing) {
          nodeIdByName.set(rawTitle, existing.id);
          report.reused.push(rawTitle);
          continue;
        }

        try {
          const response = await apiRequest("/api/entities", "POST", {
            title: rawTitle,
            aliases: [buildPluralAlias(rawTitle)].filter(Boolean),
            slug: toKebabSlug(rawTitle),
            entityTypeId: bulkGraphTypeId,
            description: "",
            metadata: {},
          });
          const payload = await response.json();
          const id = payload?.entity?.id;
          if (!id) {
            report.failed.push(`Create ${rawTitle}: missing id in response`);
            continue;
          }
          nodeIdByName.set(rawTitle, id);
          entitiesMap.set(normalizedKey, { id, title: rawTitle });
          report.created.push(rawTitle);
        } catch (error: any) {
          const fallback = entitiesMap.get(normalizedKey);
          if (fallback) {
            nodeIdByName.set(rawTitle, fallback.id);
            report.reused.push(rawTitle);
            continue;
          }
          report.failed.push(`Create ${rawTitle}: ${error?.message || "failed"}`);
        }
      }

      const createRelationship = async (sourceEntityId: string, targetEntityId: string, relationshipType: "parent" | "friend", label: string) => {
        try {
          await apiRequest("/api/entities/relationships", "POST", {
            sourceEntityId,
            targetEntityId,
            relationshipType,
            isBidirectional: relationshipType === "friend",
            metadata: {},
            strength: 1,
            isActive: true,
          });
          report.linked.push(label);
        } catch (error: any) {
          const message = String(error?.message || "failed");
          if (message.includes("already") || message.includes("409:")) {
            report.skipped.push(label);
            return;
          }
          report.failed.push(`${label}: ${message}`);
        }
      };

      for (const edge of parentEdges) {
        const childId = nodeIdByName.get(edge.child);
        const parentId = nodeIdByName.get(edge.parent);
        const label = `${edge.parent} > ${edge.child}`;
        if (!childId || !parentId) {
          report.failed.push(`${label}: unresolved node id`);
          continue;
        }
        await createRelationship(childId, parentId, "parent", label);
      }

      for (const edge of friendEdges) {
        const leftId = nodeIdByName.get(edge.left);
        const rightId = nodeIdByName.get(edge.right);
        const label = `${edge.left} = ${edge.right}`;
        if (!leftId || !rightId) {
          report.failed.push(`${label}: unresolved node id`);
          continue;
        }
        await createRelationship(leftId, rightId, "friend", label);
      }

      return report;
    },
    onSuccess: async (report) => {
      setBulkGraphReport(report);
      await queryClient.invalidateQueries({ queryKey: ["/api/entities"] });

      if (report.failed.length > 0) {
        toast({
          title: "Bulk graph completed with issues",
          description: `${report.created.length} created, ${report.linked.length} links, ${report.failed.length} failed`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Bulk graph completed",
        description: `${report.created.length} created, ${report.reused.length} reused, ${report.linked.length} linked`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bulk graph failed",
        description: error?.message || "Could not process graph input",
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

  const openTypeObjects = (typeId: string) => {
    setSelectedType(typeId);
    setActiveTab("objects-list");
  };

  const addEntityToGroupDraft = (entityId: string) => {
    setGroupEntityIds((current) => (current.includes(entityId) ? current : [...current, entityId]));
    setGroupObjectSearch("");
  };

  const removeEntityFromGroupDraft = (entityId: string) => {
    setGroupEntityIds((current) => current.filter((id) => id !== entityId));
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
        <TabsList className={`grid w-full ${(activeTab === "object-form" || activeTab === "object-view") ? "grid-cols-6" : "grid-cols-5"}`}>
          <TabsTrigger value="objects-list" data-testid="tab-objects-list">
            <Database className="h-4 w-4 mr-2" />
            Objects List
          </TabsTrigger>
          <TabsTrigger value="object-groups" data-testid="tab-object-groups">
            <Users className="h-4 w-4 mr-2" />
            Object Groups
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
                <CardTitle className="text-sm font-medium text-gray-600">With Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-described-objects">
                  {objects.filter(e => !!e.description && e.description.trim().length > 0).length}
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
                      <TableHead>Object Icon</TableHead>
                      <TableHead>Object Name</TableHead>
                      <TableHead>Aliases (count)</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Childs (count)</TableHead>
                      <TableHead>Friends (count)</TableHead>
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

        {/* Object Groups Tab */}
        <TabsContent value="object-groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Object Group</CardTitle>
              <CardDescription>
                Group objects for dropdowns, single-select, multi-select, and other platform flows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Object Group Name *</label>
                  <Input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g., Onboarding Locations"
                    data-testid="input-object-group-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Input
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Where this group is used"
                    data-testid="input-object-group-description"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Tag Objects</label>
                <div className="space-y-2 mt-1">
                  <Input
                    value={groupObjectSearch}
                    onChange={(e) => setGroupObjectSearch(e.target.value)}
                    placeholder="Search object to tag"
                    data-testid="input-object-group-search"
                  />
                  {groupObjectSuggestions.length > 0 && (
                    <div className="border rounded max-h-40 overflow-y-auto" data-testid="list-object-group-suggestions">
                      {groupObjectSuggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                          onClick={() => addEntityToGroupDraft(item.id)}
                          data-testid={`item-object-group-suggestion-${item.id}`}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1" data-testid="list-object-group-selected">
                    {selectedGroupObjects.length > 0 ? (
                      selectedGroupObjects.map((item) => (
                        <Badge key={item.id} variant="secondary" className="text-xs flex items-center gap-1">
                          {item.title}
                          <button type="button" onClick={() => removeEntityFromGroupDraft(item.id)}>x</button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No tagged objects yet</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Button
                  type="button"
                  onClick={() => createGroupMutation.mutate()}
                  disabled={!groupName.trim() || createGroupMutation.isPending}
                  data-testid="button-create-object-group"
                >
                  {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Object Groups</CardTitle>
              <CardDescription>One object can belong to multiple groups.</CardDescription>
            </CardHeader>
            <CardContent>
              {isGroupsLoading ? (
                <div className="text-sm text-muted-foreground">Loading groups...</div>
              ) : objectGroups.length === 0 ? (
                <div className="text-sm text-muted-foreground">No object groups yet.</div>
              ) : (
                <div className="space-y-3" data-testid="list-object-groups">
                  {objectGroups.map((group) => (
                    <div key={group.id} className="border rounded p-3 space-y-2" data-testid={`row-object-group-${group.id}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">{group.name}</div>
                          {group.description && <div className="text-xs text-muted-foreground">{group.description}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{group.objectCount} objects</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Delete object group \"${group.name}\"?`)) {
                                deleteGroupMutation.mutate(group.id);
                              }
                            }}
                            disabled={deleteGroupMutation.isPending}
                            data-testid={`button-delete-object-group-${group.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {group.objects.length > 0 ? (
                          group.objects.slice(0, 20).map((obj) => (
                            <Badge key={`${group.id}-${obj.id}`} variant="secondary" className="text-xs">{obj.title}</Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No objects tagged</span>
                        )}
                        {group.objects.length > 20 && (
                          <Badge variant="secondary" className="text-xs">+{group.objects.length - 20}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Objects</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {objectTypes.map((type) => (
                      <TableRow key={type.id} data-testid={`row-object-type-${type.slug}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`bg-${type.color}-100 text-${type.color}-700`}>
                              {type.name}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs rounded border px-2 py-0.5 text-muted-foreground">{type.icon || "icon"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {type.description || "No description"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-medium">{getObjectCountByType(type.id)}</span>
                        </TableCell>
                        <TableCell>
                          {type.isSystem ? (
                            <Badge variant="secondary">System</Badge>
                          ) : (
                            <Badge variant="outline">Custom</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openTypeObjects(type.id)}
                              data-testid={`button-open-type-objects-${type.id}`}
                            >
                              Open
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditTypeForm(type)}
                              data-testid={`button-edit-object-type-${type.id}`}
                            >
                              <Edit className="h-3.5 w-3.5 text-blue-600" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (type.isSystem) {
                                  toast({
                                    title: "System type is locked",
                                    description: "System object types cannot be deleted.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                fetchDeleteImpactMutation.mutate(type.id);
                              }}
                              disabled={fetchDeleteImpactMutation.isPending}
                              data-testid={`button-delete-object-type-${type.id}`}
                            >
                              <Trash2 className={`h-3.5 w-3.5 ${type.isSystem ? "text-red-300" : "text-red-600"}`} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                Object Visibility
              </CardTitle>
              <CardDescription>Configure object visibility settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <SettingsIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
                <p className="text-sm">
                  Object visibility options, validation rules, and system preferences will be available here.
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
                  <ObjectDetailsView
                    object={viewingObject}
                    objectType={objectTypes.find((t) => t.id === viewingObject.entityTypeId)}
                    onDeleted={closeViewTab}
                  />
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
  const objectType = objectTypes.find(t => t.id === object.entityTypeId);

  const { data: relationshipsData } = useQuery<{ relationships: any[] }>({
    queryKey: ["/api/entities", object.id, "relationships", "list-row"],
    queryFn: async () => {
      const response = await fetch(`/api/entities/${object.id}/relationships`, { credentials: "include" });
      if (!response.ok) return { relationships: [] };
      return response.json();
    },
  });

  const metadata = object.metadata || {};
  const iconUrl = typeof metadata.iconUrl === "string" && metadata.iconUrl.trim() ? metadata.iconUrl : DEFAULT_OBJECT_ICON;
  const relationships = relationshipsData?.relationships || [];
  const parentRel = relationships.find((rel: any) => String(rel.type || rel.relationshipType).toLowerCase() === "parent");
  const childCount = relationships.filter((rel: any) => String(rel.type || rel.relationshipType).toLowerCase() === "child").length;
  const friendCount = relationships.filter((rel: any) => String(rel.type || rel.relationshipType).toLowerCase() === "friend").length;
  const aliasCount = Array.isArray(object.aliases) ? object.aliases.length : 0;

  return (
    <TableRow data-testid={`row-object-${object.slug}`}>
      <TableCell>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onToggleSelect(object.id, e.target.checked)}
          aria-label={`Select ${object.title}`}
        />
      </TableCell>
      <TableCell>
        <img src={iconUrl} alt={`${object.title} icon`} className="h-8 w-8 rounded border object-cover" />
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
        <Badge variant="secondary" className="text-xs">{aliasCount}</Badge>
      </TableCell>
      <TableCell>
        {objectType ? (
          <Badge variant="outline" data-testid={`badge-object-type-${object.id}`}>
            {objectType.name}
          </Badge>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm">{parentRel?.targetEntityTitle || "Main"}</span>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs">{childCount}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs">{friendCount}</Badge>
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
        </div>
      </TableCell>
    </TableRow>
  );
}

// Object Details View Component
function ObjectDetailsView({ object, objectType, onDeleted }: { object: ObjectItem; objectType?: ObjectType; onDeleted?: () => void }) {
  const { toast } = useToast();
  const { data: relationshipsData } = useQuery<{ relationships: any[] }>({
    queryKey: ["/api/entities", object.id, "relationships"],
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/api/entities/${object.id}`, "DELETE"),
    onSuccess: async () => {
      toast({ title: "Object deleted successfully" });
      await queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
      onDeleted?.();
    },
    onError: () => {
      toast({ title: "Failed to delete object", variant: "destructive" });
    },
  });

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${object.title}"?`)) {
      deleteMutation.mutate();
    }
  };

  const relationships = relationshipsData?.relationships || [];
  const metadata = object.metadata || {};
  const objectImages = Array.isArray(metadata.images)
    ? metadata.images.filter((img: unknown) => typeof img === "string" && img.trim())
    : object.imageUrl
      ? [object.imageUrl]
      : [];
  const customFields = Array.isArray(metadata.customFields)
    ? metadata.customFields.filter((f: any) => f && typeof f.key === "string")
    : [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {object.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{object.description || "No description"}</p>
        <div className="mt-3">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            data-testid={`button-delete-object-view-${object.id}`}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteMutation.isPending ? "Deleting..." : "Delete Object"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Object Type</label>
            <div className="mt-1">
              {objectType && (
                <Badge variant="outline">{objectType.name}</Badge>
              )}
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

        {(metadata.iconUrl || metadata.materiality) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  const MAIN_PARENT = "__main__";
  const [parentTargetId, setParentTargetId] = useState<string>(MAIN_PARENT);
  const [parentQuery, setParentQuery] = useState("");
  const [childInput, setChildInput] = useState("");
  const [friendInput, setFriendInput] = useState("");
  const [isSavingParent, setIsSavingParent] = useState(false);

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
    mutationFn: (payload: { targetEntityId: string; relationshipType: "parent" | "child" | "friend" }) => {
      return apiRequest("/api/entities/relationships", "POST", {
        sourceEntityId: entity.id,
        targetEntityId: payload.targetEntityId,
        relationshipType: payload.relationshipType,
        isBidirectional: payload.relationshipType === "friend",
        metadata: {},
        strength: 1,
        isActive: true,
      });
    },
    onSuccess: async () => {
      toast({ title: "Relationship added" });
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

  const getRelType = (rel: any): string => String(rel.type || rel.relationshipType || "").toLowerCase();

  const parentRelationships = relationships.filter((rel: any) => getRelType(rel) === "parent");
  const childRelationships = relationships.filter((rel: any) => getRelType(rel) === "child");
  const friendRelationships = relationships.filter((rel: any) => getRelType(rel) === "friend");

  useEffect(() => {
    const currentParent = parentRelationships[0]?.targetEntityId;
    setParentTargetId(currentParent || MAIN_PARENT);
  }, [entity.id, relationshipsData?.relationships]);

  const parentSuggestions = useMemo(() => {
    const q = parentQuery.trim().toLowerCase();
    if (!q) return [] as ObjectItem[];
    return allEntities
      .filter((item) => item.id !== entity.id && item.title.toLowerCase().includes(q))
      .slice(0, 8);
  }, [allEntities, parentQuery]);

  const childSuggestions = useMemo(() => {
    const q = childInput.trim().toLowerCase();
    if (!q) return [] as ObjectItem[];
    const existing = new Set(childRelationships.map((rel: any) => rel.targetEntityId));
    return allEntities
      .filter((item) => item.id !== entity.id && item.title.toLowerCase().includes(q) && !existing.has(item.id))
      .slice(0, 8);
  }, [allEntities, childInput, relationshipsData?.relationships]);

  const friendSuggestions = useMemo(() => {
    const q = friendInput.trim().toLowerCase();
    if (!q) return [] as ObjectItem[];
    const existing = new Set(friendRelationships.map((rel: any) => rel.targetEntityId));
    return allEntities
      .filter((item) => item.id !== entity.id && item.title.toLowerCase().includes(q) && !existing.has(item.id))
      .slice(0, 8);
  }, [allEntities, friendInput, relationshipsData?.relationships]);

  const saveParent = async () => {
    try {
      setIsSavingParent(true);

      for (const rel of parentRelationships) {
        if (parentTargetId === MAIN_PARENT || rel.targetEntityId !== parentTargetId) {
          await apiRequest(`/api/entities/relationships/${rel.id}`, "DELETE");
        }
      }

      if (parentTargetId !== MAIN_PARENT) {
        const hasCurrentParent = parentRelationships.some((rel) => rel.targetEntityId === parentTargetId);
        if (!hasCurrentParent) {
          await relationshipMutation.mutateAsync({ targetEntityId: parentTargetId, relationshipType: "parent" });
        }
      }

      toast({ title: "Parent updated" });
      await queryClient.invalidateQueries({ queryKey: ["/api/entities", entity.id, "relationships", "editor"] });
    } catch (error: any) {
      toast({
        title: "Failed to update parent",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSavingParent(false);
    }
  };

  const addRelationshipTag = async (type: "child" | "friend", targetId: string) => {
    if (!targetId) return;

    const current = type === "child" ? childRelationships : friendRelationships;
    if (current.some((rel: any) => rel.targetEntityId === targetId)) {
      toast({ title: "Already tagged", description: "This object is already linked." });
      return;
    }

    try {
      await relationshipMutation.mutateAsync({ targetEntityId: targetId, relationshipType: type });
      if (type === "child") setChildInput("");
      if (type === "friend") setFriendInput("");
    } catch {
      // onError toast from mutation handles feedback
    }
  };

  const removeRelationshipTag = async (relationshipId: string) => {
    try {
      await deleteMutation.mutateAsync(relationshipId);
    } catch {
      // onError toast from mutation handles feedback
    }
  };

  const getTitleById = (id: string) => allEntities.find((item) => item.id === id)?.title || id;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold">Assign Relationship</h4>
        <p className="text-xs text-muted-foreground mt-1">Parent default is Main. Search and pick one parent, then tag multiple child/friend with auto-save.</p>
      </div>

      <div className="space-y-2 border rounded p-3">
        <label className="text-sm font-medium">Parent * (Default: Main)</label>
        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_120px] gap-2 items-start">
          <Button
            type="button"
            variant={parentTargetId === MAIN_PARENT ? "default" : "outline"}
            onClick={() => {
              setParentTargetId(MAIN_PARENT);
              setParentQuery("");
            }}
            data-testid="button-parent-main"
          >
            Main
          </Button>
          <div className="space-y-1">
            <Input
              value={parentQuery}
              onChange={(e) => setParentQuery(e.target.value)}
              placeholder="Type to find parent object"
              data-testid="input-parent-search"
            />
            {parentSuggestions.length > 0 && (
              <div className="border rounded max-h-32 overflow-y-auto">
                {parentSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => {
                      setParentTargetId(item.id);
                      setParentQuery(item.title);
                    }}
                    data-testid={`item-parent-suggestion-${item.id}`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button type="button" onClick={saveParent} disabled={isSavingParent} data-testid="button-save-parent">
            {isSavingParent ? "Saving..." : "Save Parent"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Selected parent: {parentTargetId === MAIN_PARENT ? "Main" : getTitleById(parentTargetId)}
        </p>
      </div>

      <div className="space-y-2 border rounded p-3">
        <label className="text-sm font-medium">Tag Childs (multiple)</label>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_100px] gap-2 items-start">
          <div className="space-y-1">
            <Input
              value={childInput}
              onChange={(e) => setChildInput(e.target.value)}
              placeholder="Type to tag child objects"
              onKeyDown={(e) => {
                if (e.key === "Enter" && childSuggestions[0]) {
                  e.preventDefault();
                  void addRelationshipTag("child", childSuggestions[0].id);
                }
              }}
              data-testid="input-child-tag"
            />
            {childSuggestions.length > 0 && (
              <div className="border rounded max-h-32 overflow-y-auto" data-testid="list-child-suggestions">
                {childSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => void addRelationshipTag("child", item.id)}
                    data-testid={`item-child-suggestion-${item.id}`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => childSuggestions[0] && void addRelationshipTag("child", childSuggestions[0].id)}
            disabled={!childSuggestions[0] || relationshipMutation.isPending}
            data-testid="button-add-child-tag"
          >
            Add Tag
          </Button>
        </div>
        {childRelationships.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {childRelationships.map((rel: any) => (
              <Badge key={rel.id} variant="secondary" className="text-xs flex items-center gap-1">
                {rel.targetEntityTitle || rel.targetEntityId}
                <button type="button" onClick={() => void removeRelationshipTag(rel.id)}>x</button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 border rounded p-3">
        <label className="text-sm font-medium">Tag Friends (multiple)</label>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_100px] gap-2 items-start">
          <div className="space-y-1">
            <Input
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
              placeholder="Type to tag friend objects"
              onKeyDown={(e) => {
                if (e.key === "Enter" && friendSuggestions[0]) {
                  e.preventDefault();
                  void addRelationshipTag("friend", friendSuggestions[0].id);
                }
              }}
              data-testid="input-friend-tag"
            />
            {friendSuggestions.length > 0 && (
              <div className="border rounded max-h-32 overflow-y-auto" data-testid="list-friend-suggestions">
                {friendSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => void addRelationshipTag("friend", item.id)}
                    data-testid={`item-friend-suggestion-${item.id}`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => friendSuggestions[0] && void addRelationshipTag("friend", friendSuggestions[0].id)}
            disabled={!friendSuggestions[0] || relationshipMutation.isPending}
            data-testid="button-add-friend-tag"
          >
            Add Tag
          </Button>
        </div>
        {friendRelationships.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {friendRelationships.map((rel: any) => (
              <Badge key={rel.id} variant="secondary" className="text-xs flex items-center gap-1">
                {rel.targetEntityTitle || rel.targetEntityId}
                <button type="button" onClick={() => void removeRelationshipTag(rel.id)}>x</button>
              </Badge>
            ))}
          </div>
        )}
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
  onBack,
  onSuccess 
}: { 
  object?: ObjectItem;
  objectTypes: ObjectType[]; 
  onBack: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isEdit = !!object;
  const MAIN_PARENT = "__main__";

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
  });
  const [manualAliases, setManualAliases] = useState<string[]>(object?.aliases || []);
  const [aliasInput, setAliasInput] = useState("");
  const [objectImages, setObjectImages] = useState<string[]>(initialImages);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isIconUploading, setIsIconUploading] = useState(false);
  const bulkImageInputRef = useRef<HTMLInputElement>(null);
  const slotImageInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [activeImageSlotIndex, setActiveImageSlotIndex] = useState<number | null>(null);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>(
    initialCustomFields.length > 0 ? initialCustomFields : [{ id: `field-${Date.now()}`, key: "", type: "text", value: "", optionsText: "" }],
  );
  const [dragSource, setDragSource] = useState<{ list: "fields"; index: number } | null>(null);
  const [draftParentTargetId, setDraftParentTargetId] = useState<string>(MAIN_PARENT);
  const [draftParentQuery, setDraftParentQuery] = useState("");
  const [draftChildInput, setDraftChildInput] = useState("");
  const [draftFriendInput, setDraftFriendInput] = useState("");
  const [draftChildIds, setDraftChildIds] = useState<string[]>([]);
  const [draftFriendIds, setDraftFriendIds] = useState<string[]>([]);

  const { data: allEntitiesData } = useQuery<{ entities: ObjectItem[] }>({
    queryKey: ["/api/entities", "object-form-relationship-drafts", object?.id || "new"],
    queryFn: async () => {
      const response = await fetch("/api/entities?limit=200", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load objects");
      return response.json();
    },
  });

  const allEntities = useMemo(
    () => (allEntitiesData?.entities || []).filter((item) => !object || item.id !== object.id),
    [allEntitiesData?.entities, object?.id],
  );

  const autoPluralAlias = useMemo(() => buildPluralAlias(formData.title), [formData.title]);
  const allAliases = useMemo(
    () => uniqueList([...manualAliases, ...(autoPluralAlias ? [autoPluralAlias] : [])]),
    [manualAliases, autoPluralAlias],
  );
  const descriptionTagWords = useMemo(() => {
    const words = formData.description
      .split(/[^a-zA-Z0-9]+/)
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word.length > 2 && !DESCRIPTION_STOP_WORDS.has(word));
    return uniqueList(words).slice(0, 30);
  }, [formData.description]);

  const imageSlots = useMemo(() => Array.from({ length: 6 }, (_, idx) => objectImages[idx] || ""), [objectImages]);

  const draftParentSuggestions = useMemo(() => {
    const q = draftParentQuery.trim().toLowerCase();
    if (!q) return [] as ObjectItem[];
    return allEntities.filter((item) => item.title.toLowerCase().includes(q)).slice(0, 8);
  }, [allEntities, draftParentQuery]);

  const draftChildSuggestions = useMemo(() => {
    const q = draftChildInput.trim().toLowerCase();
    if (!q) return [] as ObjectItem[];
    const blocked = new Set([draftParentTargetId, ...draftChildIds, ...draftFriendIds]);
    return allEntities
      .filter((item) => item.title.toLowerCase().includes(q) && !blocked.has(item.id))
      .slice(0, 8);
  }, [allEntities, draftChildInput, draftParentTargetId, draftChildIds, draftFriendIds]);

  const draftFriendSuggestions = useMemo(() => {
    const q = draftFriendInput.trim().toLowerCase();
    if (!q) return [] as ObjectItem[];
    const blocked = new Set([draftParentTargetId, ...draftFriendIds, ...draftChildIds]);
    return allEntities
      .filter((item) => item.title.toLowerCase().includes(q) && !blocked.has(item.id))
      .slice(0, 8);
  }, [allEntities, draftFriendInput, draftParentTargetId, draftFriendIds, draftChildIds]);

  const getEntityTitleById = (id: string) => allEntities.find((item) => item.id === id)?.title || id;
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit) {
        return apiRequest(`/api/entities/${object.id}`, "PATCH", data);
      }
      return apiRequest("/api/entities", "POST", data);
    },
    onError: (error: any) => {
      toast({
        title: `Failed to ${isEdit ? 'update' : 'create'} object`,
        description: error?.message || "Please check object details and try again.",
        variant: "destructive",
      });
    }
  });

  const addDraftRelationshipTag = (type: "child" | "friend", targetId: string) => {
    if (!targetId) return;
    if (draftParentTargetId === targetId) {
      toast({ title: "Parent already selected", description: "Choose a different object for tags.", variant: "destructive" });
      return;
    }

    if (type === "child") {
      if (draftChildIds.includes(targetId)) return;
      setDraftChildIds((current) => [...current, targetId]);
      setDraftChildInput("");
      return;
    }

    if (draftFriendIds.includes(targetId)) return;
    setDraftFriendIds((current) => [...current, targetId]);
    setDraftFriendInput("");
  };

  const removeDraftRelationshipTag = (type: "child" | "friend", targetId: string) => {
    if (type === "child") {
      setDraftChildIds((current) => current.filter((id) => id !== targetId));
      return;
    }

    setDraftFriendIds((current) => current.filter((id) => id !== targetId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      images: uniqueList(objectImages).slice(0, 6),
      autoTaggableWords: descriptionTagWords,
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

    try {
      const saveResponse = await saveMutation.mutateAsync({
        title: formData.title,
        entityTypeId: formData.entityTypeId,
        description: formData.description,
        aliases: allAliases,
        slug: toKebabSlug(formData.title),
        imageUrl: objectImages[0] || undefined,
        metadata: mergedMetadata,
      });

      const savePayload = await saveResponse.json().catch(() => null);
      const createdEntityId: string | undefined = isEdit ? object?.id : savePayload?.entity?.id;

      const relationshipTasks = !isEdit && createdEntityId
        ? [
            ...(draftParentTargetId !== MAIN_PARENT ? [{ type: "parent" as const, targetId: draftParentTargetId }] : []),
            ...draftChildIds.map((targetId) => ({ type: "child" as const, targetId })),
            ...draftFriendIds.map((targetId) => ({ type: "friend" as const, targetId })),
          ]
        : [];

      const relationshipFailures: string[] = [];
      for (const task of relationshipTasks) {
        try {
          await apiRequest("/api/entities/relationships", "POST", {
            sourceEntityId: createdEntityId,
            targetEntityId: task.targetId,
            relationshipType: task.type,
            isBidirectional: task.type === "friend",
            metadata: {},
            strength: 1,
            isActive: true,
          });
        } catch (error: any) {
          relationshipFailures.push(`${task.type}: ${getEntityTitleById(task.targetId)} (${error?.message || "failed"})`);
        }
      }

      if (relationshipTasks.length === 0) {
        toast({ title: `Object ${isEdit ? "updated" : "created"} successfully` });
      } else if (relationshipFailures.length === 0) {
        toast({ title: "Object created with relationships" });
      } else {
        toast({
          title: "Object created, some relationships failed",
          description: relationshipFailures.slice(0, 3).join(" | "),
          variant: "destructive",
        });
      }

      onSuccess();
    } catch {
      // Handled by mutation onError
    }
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

  const uploadSingleImage = async (file: File): Promise<string> => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      throw new Error(`${file.name} has unsupported image type`);
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`${file.name} exceeds 5MB`);
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
    const url = typeof data.url === "string" ? data.url.trim() : "";
    if (!url) {
      throw new Error("Upload response did not include image URL");
    }

    return url;
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
        try {
          const url = await uploadSingleImage(file);
          uploadedUrls.push(url);
        } catch (error: any) {
          toast({ title: error?.message || `Upload failed for ${file.name}`, variant: "destructive" });
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
      if (bulkImageInputRef.current) {
        bulkImageInputRef.current.value = "";
      }
    }
  };

  const replaceImageAtSlot = async (slotIndex: number, file: File) => {
    setIsImageUploading(true);
    try {
      const url = await uploadSingleImage(file);
      setObjectImages((current) => {
        const next = [...current];
        while (next.length < 6) next.push("");
        next[slotIndex] = url;
        return next.filter((item) => !!item).slice(0, 6);
      });
      toast({ title: `Image ${slotIndex + 1} updated` });
    } catch (error: any) {
      toast({ title: "Image update failed", description: error?.message || "Could not update image", variant: "destructive" });
    } finally {
      setIsImageUploading(false);
      setActiveImageSlotIndex(null);
      if (slotImageInputRef.current) {
        slotImageInputRef.current.value = "";
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

  const handleDragStart = (list: "fields", index: number) => {
    setDragSource({ list, index });
  };

  const handleDrop = (list: "fields", dropIndex: number) => {
    if (!dragSource || dragSource.list !== list) return;
    setDynamicFields((current) => reorderItems(current, dragSource.index, dropIndex));
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
            <label className="text-sm font-medium">Aliases *</label>
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
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              data-testid="input-object-description"
            />
            <p className="text-xs text-muted-foreground mt-1">Words excluding "is", "was", and "that" are auto-taggable while composing.</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {descriptionTagWords.length === 0 ? (
                <span className="text-xs text-gray-500">No auto tags yet</span>
              ) : (
                descriptionTagWords.map((word) => (
                  <Badge key={word} variant="secondary" className="text-xs">{word}</Badge>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Object Images (up to 6)</label>
            <input
              ref={bulkImageInputRef}
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
            <input
              ref={slotImageInputRef}
              type="file"
              accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && activeImageSlotIndex !== null) {
                  void replaceImageAtSlot(activeImageSlotIndex, file);
                }
              }}
              data-testid="input-replace-object-image"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">6 fixed slots, click any slot to add or replace image.</p>
              <Button type="button" variant="secondary" onClick={() => bulkImageInputRef.current?.click()} data-testid="button-upload-object-images">
                {isImageUploading ? "Uploading..." : "Upload Images"}
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
              {imageSlots.map((imageUrl, index) => (
                <button
                  key={`object-image-slot-${index}`}
                  type="button"
                  className="relative border rounded p-2 text-left hover:bg-muted/40"
                  onClick={() => {
                    setActiveImageSlotIndex(index);
                    slotImageInputRef.current?.click();
                  }}
                  data-testid={`slot-object-image-${index + 1}`}
                >
                  <div className="aspect-[4/3] w-full rounded border bg-gray-50 overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                      <img src={imageUrl} alt={`Object image ${index + 1}`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">Image {index + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{imageUrl ? "Click to change" : "Click to add"}</span>
                    {imageUrl && (
                      <span
                        role="button"
                        tabIndex={0}
                        className="text-xs text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(imageUrl);
                        }}
                      >
                        Remove
                      </span>
                    )}
                  </div>
                </button>
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
            <h4 className="font-medium">Object Icon</h4>
            <div className="flex items-center gap-3 border rounded p-3">
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

          <div className="border rounded p-3 space-y-3">
            <h4 className="font-medium">Object Visibility * (Default: Tangible)</h4>
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
          </div>

          <div className="border rounded p-3 space-y-3">
            <h4 className="font-medium">Object Type * (Single)</h4>
            <div className="flex flex-wrap gap-2">
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
            {!formData.entityTypeId && <p className="text-xs text-red-600">Select one object type.</p>}
          </div>

          <div className="border rounded p-3">
            {isEdit && object ? (
              <ObjectRelationshipsEditor entity={object} />
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Assign Relationship</h4>
                  <p className="text-xs text-muted-foreground mt-1">Relationships will be linked automatically right after object creation.</p>
                </div>

                <div className="space-y-2 border rounded p-3">
                  <label className="text-sm font-medium">Parent * (Default: Main)</label>
                  <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-2 items-start">
                    <Button
                      type="button"
                      variant={draftParentTargetId === MAIN_PARENT ? "default" : "outline"}
                      onClick={() => {
                        setDraftParentTargetId(MAIN_PARENT);
                        setDraftParentQuery("");
                      }}
                      data-testid="button-draft-parent-main"
                    >
                      Main
                    </Button>
                    <div className="space-y-1">
                      <Input
                        value={draftParentQuery}
                        onChange={(e) => setDraftParentQuery(e.target.value)}
                        placeholder="Type to find parent object"
                        data-testid="input-draft-parent-search"
                      />
                      {draftParentSuggestions.length > 0 && (
                        <div className="border rounded max-h-32 overflow-y-auto" data-testid="list-draft-parent-suggestions">
                          {draftParentSuggestions.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                              onClick={() => {
                                setDraftParentTargetId(item.id);
                                setDraftParentQuery(item.title);
                              }}
                            >
                              {item.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border rounded p-3">
                  <label className="text-sm font-medium">Tag Childs</label>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_100px] gap-2 items-start">
                    <div className="space-y-1">
                      <Input
                        value={draftChildInput}
                        onChange={(e) => setDraftChildInput(e.target.value)}
                        placeholder="Type to tag child objects"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && draftChildSuggestions[0]) {
                            e.preventDefault();
                            addDraftRelationshipTag("child", draftChildSuggestions[0].id);
                          }
                        }}
                        data-testid="input-draft-child-tag"
                      />
                      {draftChildSuggestions.length > 0 && (
                        <div className="border rounded max-h-32 overflow-y-auto" data-testid="list-draft-child-suggestions">
                          {draftChildSuggestions.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                              onClick={() => addDraftRelationshipTag("child", item.id)}
                            >
                              {item.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => draftChildSuggestions[0] && addDraftRelationshipTag("child", draftChildSuggestions[0].id)}
                      disabled={!draftChildSuggestions[0]}
                      data-testid="button-draft-add-child-tag"
                    >
                      Add
                    </Button>
                  </div>
                  {draftChildIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {draftChildIds.map((id) => (
                        <Badge key={id} variant="secondary" className="text-xs flex items-center gap-1">
                          {getEntityTitleById(id)}
                          <button type="button" onClick={() => removeDraftRelationshipTag("child", id)}>x</button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 border rounded p-3">
                  <label className="text-sm font-medium">Tag Friends</label>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_100px] gap-2 items-start">
                    <div className="space-y-1">
                      <Input
                        value={draftFriendInput}
                        onChange={(e) => setDraftFriendInput(e.target.value)}
                        placeholder="Type to tag friend objects"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && draftFriendSuggestions[0]) {
                            e.preventDefault();
                            addDraftRelationshipTag("friend", draftFriendSuggestions[0].id);
                          }
                        }}
                        data-testid="input-draft-friend-tag"
                      />
                      {draftFriendSuggestions.length > 0 && (
                        <div className="border rounded max-h-32 overflow-y-auto" data-testid="list-draft-friend-suggestions">
                          {draftFriendSuggestions.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                              onClick={() => addDraftRelationshipTag("friend", item.id)}
                            >
                              {item.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => draftFriendSuggestions[0] && addDraftRelationshipTag("friend", draftFriendSuggestions[0].id)}
                      disabled={!draftFriendSuggestions[0]}
                      data-testid="button-draft-add-friend-tag"
                    >
                      Add
                    </Button>
                  </div>
                  {draftFriendIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {draftFriendIds.map((id) => (
                        <Badge key={id} variant="secondary" className="text-xs flex items-center gap-1">
                          {getEntityTitleById(id)}
                          <button type="button" onClick={() => removeDraftRelationshipTag("friend", id)}>x</button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
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
