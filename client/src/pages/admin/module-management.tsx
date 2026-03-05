import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Copy, Layers, Package, Database, Calendar } from "lucide-react";

interface DynamicModule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  fields: any[];
  entryCount: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  archived: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
};

function moduleColor(name: string): string {
  const colors = [
    "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700",
    "bg-green-100 text-green-700", "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700", "bg-indigo-100 text-indigo-700",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

export default function ModuleManagementPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ modules: DynamicModule[] }>({
    queryKey: ["/api/dynamic-modules"],
  });

  const modules = data?.modules || [];
  const totalEntries = modules.reduce((sum, m) => sum + (m.entryCount || 0), 0);
  const activeCount = modules.filter(m => m.status === "active").length;

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("/api/dynamic-modules", "POST", { name: newName, description: newDesc });
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["/api/dynamic-modules"] });
      setShowCreate(false);
      setNewName("");
      setNewDesc("");
      toast({ title: "Module created", description: `"${data.module.name}" is ready to build.` });
      setLocation(`/engine/module-builder/${data.module.id}`);
    },
    onError: () => toast({ title: "Failed to create module", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/dynamic-modules/${id}`, "DELETE");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/dynamic-modules"] });
      setDeleteId(null);
      toast({ title: "Module deleted" });
    },
    onError: () => toast({ title: "Failed to delete module", variant: "destructive" }),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest(`/api/dynamic-modules/${id}/duplicate`, "POST");
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["/api/dynamic-modules"] });
      toast({ title: "Module duplicated", description: `"${data.module.name}" created.` });
    },
    onError: () => toast({ title: "Failed to duplicate module", variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Module Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage dynamic modules with drag-and-drop form field builder
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Module
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Modules", value: modules.length, icon: Layers },
          { label: "Active", value: activeCount, icon: Package },
          { label: "Total Entries", value: totalEntries.toLocaleString(), icon: Database },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-40" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {modules.map(mod => (
            <Card key={mod.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${moduleColor(mod.name)}`}>
                      {mod.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{mod.name}</h3>
                      <p className="text-xs text-gray-400 font-mono">{mod.slug}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[mod.status] || STATUS_COLORS.draft}`}>
                    {mod.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
                  {mod.description || <span className="italic text-gray-400">No description</span>}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                  <span>{(mod.fields as any[])?.length || 0} fields</span>
                  <span>·</span>
                  <span>{mod.entryCount} entries</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(mod.createdAt).toLocaleDateString("en-US", { month: "short", d: "numeric", year: "numeric" } as any)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1.5"
                    onClick={() => setLocation(`/engine/module-builder/${mod.id}`)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit Module
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-2"
                    onClick={() => duplicateMutation.mutate(mod.id)}
                    title="Duplicate"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteId(mod.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create New Card */}
          <Card
            className="border-dashed border-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            onClick={() => setShowCreate(true)}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[180px] text-gray-400">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-2">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Create New Module</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Module Name *</Label>
              <Input
                placeholder="e.g. Contact Form, Product Feedback"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && newName.trim() && createMutation.mutate()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="What is this module for?"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create & Build"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the module and all its submitted entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete Module
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
