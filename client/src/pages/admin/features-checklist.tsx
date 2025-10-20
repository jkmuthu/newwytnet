import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, ChevronDown, ChevronRight, ExternalLink, CheckCircle2, Circle, AlertCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeatureTask {
  id: string;
  displayId: string | null;
  name: string;
  description: string | null;
  url: string | null;
  expectedUrlPattern: string | null;
  urlPatternValid: boolean | null;
  agentTested: boolean;
  agentTestedAt: string | null;
  agentTestedBy: string | null;
  agentTestComments: string | null;
  jkmTested: boolean;
  jkmTestedAt: string | null;
  jkmTestComments: string | null;
  status: string;
  orderIndex: number;
  isBlocked: boolean;
  blockedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Feature {
  id: string;
  displayId: string | null;
  name: string;
  description: string | null;
  category: string | null;
  priority: string;
  status: string;
  totalTasks: number;
  completedTasks: number;
  agentTestedTasks: number;
  jkmTestedTasks: number;
  estimatedHours: number | null;
  actualHours: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: FeatureTask[];
}

const featureFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

const taskFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  url: z.string().optional(),
  expectedUrlPattern: z.string().optional(),
});

type FeatureFormValues = z.infer<typeof featureFormSchema>;
type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function FeaturesChecklistPage() {
  const { toast } = useToast();
  const [openFeatures, setOpenFeatures] = useState<Set<string>>(new Set());
  const [createFeatureOpen, setCreateFeatureOpen] = useState(false);
  const [editFeatureOpen, setEditFeatureOpen] = useState(false);
  const [deleteFeatureId, setDeleteFeatureId] = useState<string | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [selectedTask, setSelectedTask] = useState<FeatureTask | null>(null);

  // Fetch all features with tasks
  const { data: features, isLoading } = useQuery<Feature[]>({
    queryKey: ["/api/admin/features"],
  });

  // Feature form
  const featureForm = useForm<FeatureFormValues>({
    resolver: zodResolver(featureFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      priority: "medium",
    },
  });

  // Task form
  const taskForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: "",
      description: "",
      url: "",
      expectedUrlPattern: "",
    },
  });

  // Create feature mutation
  const createFeatureMutation = useMutation({
    mutationFn: async (data: FeatureFormValues) => {
      const response = await fetch("/api/admin/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create feature");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/features"] });
      setCreateFeatureOpen(false);
      featureForm.reset();
      toast({
        title: "Feature created",
        description: "New feature has been added to the checklist.",
      });
    },
  });

  // Update feature mutation
  const updateFeatureMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FeatureFormValues }) => {
      const response = await fetch(`/api/admin/features/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update feature");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/features"] });
      setEditFeatureOpen(false);
      toast({
        title: "Feature updated",
        description: "Feature has been updated successfully.",
      });
    },
  });

  // Delete feature mutation
  const deleteFeatureMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/features/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete feature");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/features"] });
      setDeleteFeatureId(null);
      toast({
        title: "Feature deleted",
        description: "Feature has been removed from the checklist.",
      });
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async ({ featureId, data }: { featureId: string; data: TaskFormValues }) => {
      const response = await fetch(`/api/admin/features/${featureId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/features"] });
      setCreateTaskOpen(false);
      taskForm.reset();
      toast({
        title: "Task created",
        description: "New task has been added to the feature.",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TaskFormValues }) => {
      const response = await fetch(`/api/admin/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/features"] });
      setEditTaskOpen(false);
      toast({
        title: "Task updated",
        description: "Task has been updated successfully.",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/features"] });
      setDeleteTaskId(null);
      toast({
        title: "Task deleted",
        description: "Task has been removed from the feature.",
      });
    },
  });

  // Update test status mutation
  const updateTestStatusMutation = useMutation({
    mutationFn: async ({ taskId, testType, tested }: { taskId: string; testType: 'agent' | 'jkm'; tested: boolean }) => {
      const response = await fetch(`/api/admin/tasks/${taskId}/test`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testType, tested }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update test status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/features"] });
    },
  });

  const toggleFeature = (featureId: string) => {
    const newOpen = new Set(openFeatures);
    if (newOpen.has(featureId)) {
      newOpen.delete(featureId);
    } else {
      newOpen.add(featureId);
    }
    setOpenFeatures(newOpen);
  };

  const handleEditFeature = (feature: Feature) => {
    setSelectedFeature(feature);
    featureForm.reset({
      name: feature.name,
      description: feature.description || "",
      category: feature.category || "",
      priority: feature.priority as any,
    });
    setEditFeatureOpen(true);
  };

  const handleEditTask = (task: FeatureTask) => {
    setSelectedTask(task);
    taskForm.reset({
      name: task.name,
      description: task.description || "",
      url: task.url || "",
      expectedUrlPattern: task.expectedUrlPattern || "",
    });
    setEditTaskOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-500';
      case 'on_hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressPercentage = (feature: Feature) => {
    if (feature.totalTasks === 0) return 0;
    return Math.round((feature.completedTasks / feature.totalTasks) * 100);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Features Checklist</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track project features and testing status
          </p>
        </div>
        
        <Dialog open={createFeatureOpen} onOpenChange={(open) => {
          setCreateFeatureOpen(open);
          if (!open) featureForm.reset();
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-feature" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Feature</DialogTitle>
            </DialogHeader>
            <Form {...featureForm}>
              <form onSubmit={featureForm.handleSubmit((data) => createFeatureMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={featureForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-feature-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={featureForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} data-testid="input-feature-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={featureForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Authentication, UI/UX" data-testid="input-feature-category" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={featureForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-feature-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createFeatureMutation.isPending} data-testid="button-submit-feature">
                  {createFeatureMutation.isPending ? "Creating..." : "Create Feature"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Feature Dialog */}
      <Dialog open={editFeatureOpen} onOpenChange={(open) => {
        setEditFeatureOpen(open);
        if (!open) featureForm.reset();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Feature</DialogTitle>
          </DialogHeader>
          <Form {...featureForm}>
            <form onSubmit={featureForm.handleSubmit((data) => {
              if (selectedFeature) {
                updateFeatureMutation.mutate({ id: selectedFeature.id, data });
              }
            })} className="space-y-4">
              <FormField
                control={featureForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-feature-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={featureForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="input-edit-feature-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={featureForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-feature-category" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={featureForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-feature-priority">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={updateFeatureMutation.isPending} data-testid="button-update-feature">
                {updateFeatureMutation.isPending ? "Updating..." : "Update Feature"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Feature Confirmation */}
      <AlertDialog open={!!deleteFeatureId} onOpenChange={() => setDeleteFeatureId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feature?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this feature and all its tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-feature">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteFeatureId) {
                  deleteFeatureMutation.mutate(deleteFeatureId);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
              data-testid="button-confirm-delete-feature"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Task Dialog */}
      <Dialog open={createTaskOpen} onOpenChange={(open) => {
        setCreateTaskOpen(open);
        if (!open) taskForm.reset();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Task to {selectedFeature?.name}</DialogTitle>
          </DialogHeader>
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit((data) => {
              if (selectedFeature) {
                createTaskMutation.mutate({ featureId: selectedFeature.id, data });
              }
            })} className="space-y-4">
              <FormField
                control={taskForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-task-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} data-testid="input-task-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL (for testing)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="/admin/features" data-testid="input-task-url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="expectedUrlPattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected URL Pattern</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="/admin/*" data-testid="input-task-pattern" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={createTaskMutation.isPending} data-testid="button-submit-task">
                {createTaskMutation.isPending ? "Adding..." : "Add Task"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editTaskOpen} onOpenChange={(open) => {
        setEditTaskOpen(open);
        if (!open) taskForm.reset();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit((data) => {
              if (selectedTask) {
                updateTaskMutation.mutate({ id: selectedTask.id, data });
              }
            })} className="space-y-4">
              <FormField
                control={taskForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-task-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} data-testid="input-edit-task-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL (for testing)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-task-url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="expectedUrlPattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected URL Pattern</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-task-pattern" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={updateTaskMutation.isPending} data-testid="button-update-task">
                {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-task">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTaskId) {
                  deleteTaskMutation.mutate(deleteTaskId);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
              data-testid="button-confirm-delete-task"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Features List */}
      <div className="space-y-4">
        {features?.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No features yet. Click "Add Feature" to get started.
            </p>
          </Card>
        )}

        {features?.map((feature) => (
          <Collapsible
            key={feature.id}
            open={openFeatures.has(feature.id)}
            onOpenChange={() => toggleFeature(feature.id)}
          >
            <Card className="overflow-hidden">
              <CollapsibleTrigger className="w-full p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" data-testid={`feature-${feature.displayId}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {openFeatures.has(feature.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 text-left space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {feature.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getPriorityColor(feature.priority)}>
                          {feature.priority}
                        </Badge>
                        <Badge className={getStatusColor(feature.status)}>
                          {feature.status}
                        </Badge>
                        {feature.displayId && (
                          <Badge variant="outline" className="text-xs">
                            {feature.displayId}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {feature.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progress: {feature.completedTasks}/{feature.totalTasks} tasks
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getProgressPercentage(feature)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${getProgressPercentage(feature)}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Agent Tested: {feature.agentTestedTasks}/{feature.totalTasks}</span>
                        <span>JKM Tested: {feature.jkmTestedTasks}/{feature.totalTasks}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditFeature(feature)}
                      data-testid={`button-edit-feature-${feature.displayId}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteFeatureId(feature.id)}
                      data-testid={`button-delete-feature-${feature.displayId}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 md:p-6 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Tasks</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedFeature(feature);
                        taskForm.reset();
                        setCreateTaskOpen(true);
                      }}
                      data-testid="button-add-task"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                  </div>

                  {feature.tasks.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No tasks yet. Click "Add Task" to create one.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {feature.tasks.map((task) => (
                        <Card key={task.id} className="p-4" data-testid={`task-${task.displayId}`}>
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="font-medium text-gray-900 dark:text-white">
                                    {task.name}
                                  </h5>
                                  {task.displayId && (
                                    <Badge variant="outline" className="text-xs">
                                      {task.displayId}
                                    </Badge>
                                  )}
                                  {task.url && (
                                    <a
                                      href={task.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm"
                                      data-testid={`link-test-${task.displayId}`}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      Test
                                    </a>
                                  )}
                                  {task.url && !task.urlPatternValid && (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      URL pattern mismatch
                                    </Badge>
                                  )}
                                </div>
                                {task.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditTask(task)}
                                  data-testid={`button-edit-task-${task.displayId}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeleteTaskId(task.id)}
                                  data-testid={`button-delete-task-${task.displayId}`}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={task.agentTested}
                                  onCheckedChange={(checked) => {
                                    updateTestStatusMutation.mutate({
                                      taskId: task.id,
                                      testType: 'agent',
                                      tested: checked as boolean,
                                    });
                                  }}
                                  id={`agent-${task.id}`}
                                  data-testid={`checkbox-agent-${task.displayId}`}
                                />
                                <label
                                  htmlFor={`agent-${task.id}`}
                                  className="text-sm font-medium cursor-pointer flex items-center gap-1"
                                >
                                  {task.agentTested ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-gray-400" />
                                  )}
                                  Agent Tested
                                </label>
                              </div>

                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={task.jkmTested}
                                  onCheckedChange={(checked) => {
                                    updateTestStatusMutation.mutate({
                                      taskId: task.id,
                                      testType: 'jkm',
                                      tested: checked as boolean,
                                    });
                                  }}
                                  id={`jkm-${task.id}`}
                                  data-testid={`checkbox-jkm-${task.displayId}`}
                                />
                                <label
                                  htmlFor={`jkm-${task.id}`}
                                  className="text-sm font-medium cursor-pointer flex items-center gap-1"
                                >
                                  {task.jkmTested ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-gray-400" />
                                  )}
                                  JKM Tested
                                </label>
                              </div>
                            </div>

                            {(task.agentTestedBy || task.agentTestComments || task.jkmTestComments) && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pt-2">
                                {task.agentTestedBy && (
                                  <p>Agent: {task.agentTestedBy} {task.agentTestedAt && `at ${new Date(task.agentTestedAt).toLocaleString()}`}</p>
                                )}
                                {task.agentTestComments && (
                                  <p className="italic">"{task.agentTestComments}"</p>
                                )}
                                {task.jkmTestComments && (
                                  <p className="italic">JKM: "{task.jkmTestComments}"</p>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
