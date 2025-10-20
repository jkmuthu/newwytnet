import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ChevronDown, ChevronRight, ExternalLink, CheckCircle2, Circle, AlertCircle } from "lucide-react";
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

export default function FeaturesChecklistPage() {
  const { toast } = useToast();
  const [openFeatures, setOpenFeatures] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  // Fetch all features with tasks
  const { data: features, isLoading } = useQuery<Feature[]>({
    queryKey: ["/api/admin/features"],
  });

  // Create feature mutation
  const createFeatureMutation = useMutation({
    mutationFn: async (data: any) => {
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
      setCreateDialogOpen(false);
      toast({
        title: "Feature created",
        description: "New feature has been added to the checklist.",
      });
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async ({ featureId, data }: { featureId: string; data: any }) => {
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
      setCreateTaskDialogOpen(false);
      toast({
        title: "Task created",
        description: "New task has been added to the feature.",
      });
    },
  });

  // Update test status mutation
  const updateTestStatusMutation = useMutation({
    mutationFn: async ({ taskId, testType, tested, comments }: { taskId: string; testType: 'agent' | 'jkm'; tested: boolean; comments?: string }) => {
      const response = await fetch(`/api/admin/tasks/${taskId}/test`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testType, tested, comments }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update test status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/features"] });
      toast({
        title: "Test status updated",
        description: "Task testing status has been updated.",
      });
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
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createFeatureMutation.mutate({
                name: formData.get('name'),
                description: formData.get('description'),
                category: formData.get('category'),
                priority: formData.get('priority'),
              });
            }} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input name="name" required data-testid="input-feature-name" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea name="description" rows={3} data-testid="input-feature-description" />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input name="category" placeholder="e.g., Authentication, UI/UX" data-testid="input-feature-category" />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger data-testid="select-feature-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createFeatureMutation.isPending} data-testid="button-submit-feature">
                {createFeatureMutation.isPending ? "Creating..." : "Create Feature"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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

                    {/* Progress Bar */}
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
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 md:p-6 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Tasks</h4>
                    <Dialog open={createTaskDialogOpen && selectedFeatureId === feature.id} onOpenChange={(open) => {
                      setCreateTaskDialogOpen(open);
                      if (open) setSelectedFeatureId(feature.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" data-testid="button-add-task">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add Task to {feature.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          createTaskMutation.mutate({
                            featureId: feature.id,
                            data: {
                              name: formData.get('name'),
                              description: formData.get('description'),
                              url: formData.get('url') || undefined,
                              expectedUrlPattern: formData.get('expectedUrlPattern') || undefined,
                            },
                          });
                        }} className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Task Name *</label>
                            <Input name="name" required data-testid="input-task-name" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea name="description" rows={2} data-testid="input-task-description" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">URL (for testing)</label>
                            <Input name="url" placeholder="/admin/features" data-testid="input-task-url" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Expected URL Pattern</label>
                            <Input name="expectedUrlPattern" placeholder="/admin/*" data-testid="input-task-pattern" />
                          </div>
                          <Button type="submit" className="w-full" disabled={createTaskMutation.isPending} data-testid="button-submit-task">
                            {createTaskMutation.isPending ? "Adding..." : "Add Task"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
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
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                              {/* Agent Tested */}
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

                              {/* JKM Tested */}
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
