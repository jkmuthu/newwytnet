import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Edit, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface QATestItem {
  id: string;
  displayId: string | null;
  title: string;
  task: string;
  category: string;
  status: string;
  agentTested: boolean;
  agentTestedAt: string | null;
  agentTestedBy: string | null;
  jkmTested: boolean;
  jkmTestedAt: string | null;
  notes: string | null;
  priority: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

const qaFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  task: z.string().min(1, "Task is required"),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["pending", "in_progress", "done", "blocked"]).default("pending"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  notes: z.string().optional(),
});

type QAFormValues = z.infer<typeof qaFormSchema>;

export default function QATestingTrackerPage() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<QATestItem | null>(null);

  // Fetch all QA test items
  const { data: items, isLoading } = useQuery<QATestItem[]>({
    queryKey: ["/api/admin/qa-test-items"],
  });

  // Form
  const form = useForm<QAFormValues>({
    resolver: zodResolver(qaFormSchema),
    defaultValues: {
      title: "",
      task: "",
      category: "",
      status: "pending",
      priority: "medium",
      notes: "",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: QAFormValues) => {
      const response = await fetch("/api/admin/qa-test-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create QA test item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/qa-test-items"] });
      setCreateOpen(false);
      form.reset();
      toast({
        title: "QA Test Item created",
        description: "New test item has been added.",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: QAFormValues }) => {
      const response = await fetch(`/api/admin/qa-test-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update QA test item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/qa-test-items"] });
      setEditOpen(false);
      toast({
        title: "QA Test Item updated",
        description: "Test item has been updated successfully.",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/qa-test-items/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete QA test item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/qa-test-items"] });
      setDeleteId(null);
      toast({
        title: "QA Test Item deleted",
        description: "Test item has been removed.",
      });
    },
  });

  // Agent test mutation
  const agentTestMutation = useMutation({
    mutationFn: async ({ id, tested }: { id: string; tested: boolean }) => {
      const response = await fetch(`/api/admin/qa-test-items/${id}/agent-test`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tested }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update agent test status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/qa-test-items"] });
      toast({
        title: "Agent test status updated",
        description: "Test status has been updated successfully.",
      });
    },
  });

  // JKM test mutation
  const jkmTestMutation = useMutation({
    mutationFn: async ({ id, jkmTested }: { id: string; jkmTested: boolean }) => {
      const response = await fetch(`/api/admin/qa-test-items/${id}/jkm-test`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jkmTested }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update JKM test status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/qa-test-items"] });
      toast({
        title: "JKM test status updated",
        description: "JKM test status has been updated successfully.",
      });
    },
  });

  const handleCreate = (data: QAFormValues) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: QAFormValues) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data });
    }
  };

  const handleEdit = (item: QATestItem) => {
    setSelectedItem(item);
    form.reset({
      title: item.title,
      task: item.task,
      category: item.category,
      status: item.status as any,
      priority: item.priority as any,
      notes: item.notes || "",
    });
    setEditOpen(true);
  };

  const handleAgentTest = (id: string, currentStatus: boolean) => {
    agentTestMutation.mutate({ id, tested: !currentStatus });
  };

  const handleJKMTest = (id: string, currentStatus: boolean) => {
    jkmTestMutation.mutate({ id, jkmTested: !currentStatus });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      in_progress: "default",
      done: "success",
      blocked: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      low: "secondary",
      medium: "default",
      high: "destructive",
    };
    return <Badge variant={variants[priority] || "default"}>{priority}</Badge>;
  };

  const formatTestStatus = (tested: boolean, testedAt: string | null, testedBy?: string | null) => {
    if (!tested) {
      return <span className="text-gray-400 dark:text-gray-600">Not tested</span>;
    }
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">Tested</span>
        </div>
        {testedAt && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {format(new Date(testedAt), "MMM d, yyyy HH:mm")}
          </span>
        )}
        {testedBy && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            by {testedBy}
          </span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Loading QA Test Items...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              QA Testing Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Simple feature verification and testing workflow
            </p>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-create-test-item">
                <Plus className="h-4 w-4" />
                Add Test Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create QA Test Item</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Checklist Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter title" data-testid="input-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="task"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter task description" rows={3} data-testid="input-task" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Under (Category)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Engine">Engine</SelectItem>
                              <SelectItem value="MyPanel">MyPanel</SelectItem>
                              <SelectItem value="OrgPanel">OrgPanel</SelectItem>
                              <SelectItem value="Public Portal">Public Portal</SelectItem>
                              <SelectItem value="WytAI Agent">WytAI Agent</SelectItem>
                              <SelectItem value="DevDoc">DevDoc</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter additional notes" rows={2} data-testid="input-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create">
                      {createMutation.isPending ? "Creating..." : "Create Test Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
            <div className="text-3xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="stat-total">
              {items?.length || 0}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Agent Tested</div>
            <div className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400" data-testid="stat-agent-tested">
              {items?.filter(i => i.agentTested).length || 0}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">JKM Tested</div>
            <div className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400" data-testid="stat-jkm-tested">
              {items?.filter(i => i.jkmTested).length || 0}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Both Tested</div>
            <div className="text-3xl font-bold mt-2 text-purple-600 dark:text-purple-400" data-testid="stat-both-tested">
              {items?.filter(i => i.agentTested && i.jkmTested).length || 0}
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Checklist Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Under
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Agent Test
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    JKM Test
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {items?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50" data-testid={`row-item-${item.id}`}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {item.displayId}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {item.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                      <div className="line-clamp-2">{item.task}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {item.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {getPriorityBadge(item.priority)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={item.agentTested ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAgentTest(item.id, item.agentTested)}
                          disabled={agentTestMutation.isPending}
                          className="gap-1"
                          data-testid={`button-agent-test-${item.id}`}
                        >
                          {item.agentTested ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                          {item.agentTested ? "Tested" : "Mark"}
                        </Button>
                      </div>
                      {item.agentTestedAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {format(new Date(item.agentTestedAt), "MMM d, HH:mm")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={item.jkmTested ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleJKMTest(item.id, item.jkmTested)}
                          disabled={jkmTestMutation.isPending}
                          className="gap-1"
                          data-testid={`button-jkm-test-${item.id}`}
                        >
                          {item.jkmTested ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                          {item.jkmTested ? "Tested" : "Mark"}
                        </Button>
                      </div>
                      {item.jkmTestedAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {format(new Date(item.jkmTestedAt), "MMM d, HH:mm")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          data-testid={`button-edit-${item.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(item.id)}
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!items || items.length === 0) && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      No QA test items yet. Click "Add Test Item" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit QA Test Item</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Checklist Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="task"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter task description" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Under (Category)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Engine">Engine</SelectItem>
                            <SelectItem value="MyPanel">MyPanel</SelectItem>
                            <SelectItem value="OrgPanel">OrgPanel</SelectItem>
                            <SelectItem value="Public Portal">Public Portal</SelectItem>
                            <SelectItem value="WytAI Agent">WytAI Agent</SelectItem>
                            <SelectItem value="DevDoc">DevDoc</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter additional notes" rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Updating..." : "Update Test Item"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete QA Test Item?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the test item from the tracker.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
