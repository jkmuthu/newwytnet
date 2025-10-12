import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Plus, Edit2, Trash2, Eye, Coins } from "lucide-react";

const needSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.enum(["jobs", "real_estate", "b2b_supply", "service", "other"]),
  location: z.string().optional(),
  budget: z.string().optional(),
});

type NeedForm = z.infer<typeof needSchema>;

export default function MyNeeds() {
  const [editingNeed, setEditingNeed] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch user's needs
  const { data: needsData, isLoading } = useQuery({
    queryKey: ["/api/needs/my-needs"],
  });

  const form = useForm<NeedForm>({
    resolver: zodResolver(needSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "other",
      location: "",
      budget: "",
    },
  });

  const createNeedMutation = useMutation({
    mutationFn: async (data: NeedForm) => {
      const response = await fetch("/api/needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/needs/my-needs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      toast({
        title: "Need Created! 🎉",
        description: `Your need has been posted successfully!`,
      });
      form.reset();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create need",
        variant: "destructive",
      });
    },
  });

  const updateNeedMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: NeedForm }) => {
      const response = await fetch(`/api/needs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/needs/my-needs"] });
      toast({
        title: "Need Updated",
        description: "Your need has been updated successfully",
      });
      form.reset();
      setEditingNeed(null);
      setDialogOpen(false);
    },
  });

  const deleteNeedMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/needs/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/needs/my-needs"] });
      toast({
        title: "Need Deleted",
        description: "Your need has been removed",
      });
    },
  });

  const handleSubmit = (data: NeedForm) => {
    if (editingNeed) {
      updateNeedMutation.mutate({ id: editingNeed.id, data });
    } else {
      createNeedMutation.mutate(data);
    }
  };

  const handleEdit = (need: any) => {
    setEditingNeed(need);
    form.reset({
      title: need.title,
      description: need.description,
      category: need.category,
      location: need.location || "",
      budget: need.budget ? need.budget.toString() : "",
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingNeed(null);
    form.reset();
    setDialogOpen(true);
  };

  const needs = Array.isArray(needsData) ? needsData : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MyNeeds</h1>
          <p className="text-muted-foreground">
            Share what you need and earn WytPoints for every post!
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} data-testid="button-create-need">
              <Plus className="h-4 w-4 mr-2" />
              Post a Need
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingNeed ? "Edit Need" : "Post a New Need"}
              </DialogTitle>
              <DialogDescription>
                Share what you're looking for with the community. Earn WytPoints for every post!
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Looking for a web developer"
                          data-testid="input-need-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-need-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="jobs">Jobs</SelectItem>
                          <SelectItem value="real_estate">Real Estate</SelectItem>
                          <SelectItem value="b2b_supply">B2B Supply</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe what you need in detail..."
                          rows={5}
                          data-testid="textarea-need-description"
                        />
                      </FormControl>
                      <FormDescription>
                        Provide as much detail as possible to get better responses
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Mumbai, India"
                            data-testid="input-need-location"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., ₹50,000"
                            data-testid="input-need-budget"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingNeed(null);
                      form.reset();
                    }}
                    data-testid="button-cancel-need"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createNeedMutation.isPending || updateNeedMutation.isPending}
                    data-testid="button-submit-need"
                  >
                    {createNeedMutation.isPending || updateNeedMutation.isPending
                      ? "Saving..."
                      : editingNeed
                      ? "Update Need"
                      : "Post Need"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Points Info */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm">
              <span className="font-semibold">Earn Points!</span> You get WytPoints for every
              need you post. Help others discover what you're looking for!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Needs List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : needs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No needs yet</h3>
            <p className="text-muted-foreground mb-4">
              Start sharing what you're looking for and earn WytPoints!
            </p>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Need
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {needs.map((need: any) => (
            <Card key={need.id} data-testid={`card-need-${need.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{need.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="outline" className="mr-2">
                        {need.category}
                      </Badge>
                      <Badge
                        variant={
                          need.status === "active"
                            ? "default"
                            : need.status === "fulfilled"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {need.status}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {need.description}
                </p>
                {(need.location || need.budget) && (
                  <div className="flex flex-wrap gap-2 mb-4 text-sm text-muted-foreground">
                    {need.location && <span>📍 {need.location}</span>}
                    {need.budget && <span>💰 {need.budget}</span>}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(need)}
                    data-testid={`button-edit-need-${need.id}`}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this need?")) {
                        deleteNeedMutation.mutate(need.id);
                      }
                    }}
                    data-testid={`button-delete-need-${need.id}`}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
