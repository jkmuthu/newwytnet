import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Package, Edit, Trash2, MapPin, DollarSign, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const offerSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["jobs", "real_estate", "b2b_supply", "service", "other"]),
  location: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().default("INR"),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface Offer {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  price?: string;
  currency: string;
  status: string;
  createdAt: string;
}

export default function MyOffers() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // Fetch user's offers
  const { data: offersData, isLoading } = useQuery({
    queryKey: ["/api/offers/my-offers"],
  });

  const offers = Array.isArray(offersData) ? offersData : [];

  // Create form
  const createForm = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "service",
      location: "",
      price: "",
      currency: "USD",
    },
  });

  // Edit form
  const editForm = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "service",
      location: "",
      price: "",
      currency: "USD",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      return apiRequest("POST", "/api/offers", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers/my-offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      setIsCreateOpen(false);
      createForm.reset();
      const pointsSpent = data.pointsSpent || 5;
      toast({
        title: "Offer Posted Successfully!",
        description: `You spent ${pointsSpent} WytPoints to post this offer.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to post offer",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OfferFormData> }) => {
      return apiRequest("PUT", `/api/offers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers/my-offers"] });
      setIsEditOpen(false);
      setSelectedOffer(null);
      toast({
        title: "Offer Updated",
        description: "Your offer has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update offer",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/offers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers/my-offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      setIsDeleteOpen(false);
      setSelectedOffer(null);
      toast({
        title: "Offer Deleted",
        description: "Your offer has been deleted and points refunded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete offer",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (offer: Offer) => {
    setSelectedOffer(offer);
    editForm.reset({
      title: offer.title,
      description: offer.description,
      category: offer.category as any,
      location: offer.location || "",
      price: offer.price || "",
      currency: offer.currency || "INR",
    });
    setIsEditOpen(true);
  };

  const handleDelete = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsDeleteOpen(true);
  };

  const onCreateSubmit = (data: OfferFormData) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: OfferFormData) => {
    if (selectedOffer) {
      updateMutation.mutate({ id: selectedOffer.id, data });
    }
  };

  const confirmDelete = () => {
    if (selectedOffer) {
      deleteMutation.mutate(selectedOffer.id);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      jobs: "Jobs",
      real_estate: "Real Estate",
      b2b_supply: "B2B Supply",
      service: "Service",
      other: "Other",
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: "default",
      closed: "secondary",
      fulfilled: "outline",
    };
    return (
      <Badge variant={variants[status] || "default"} data-testid={`badge-status-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            MyOffers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Post what you can offer and connect with those who need it
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          data-testid="button-create-offer"
        >
          <Package className="mr-2 h-4 w-4" />
          Post an Offer
        </Button>
      </div>

      {/* Points Info */}
      <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Posting an offer costs WytPoints. Make sure you have enough points before posting.
        </AlertDescription>
      </Alert>

      {/* Offers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Offers Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
              Start posting what you can offer to connect with those who need your services or products.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-offer">
              <Package className="mr-2 h-4 w-4" />
              Post Your First Offer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer: Offer) => (
            <Card key={offer.id} className="hover:shadow-lg transition-shadow" data-testid={`card-offer-${offer.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid={`text-title-${offer.id}`}>{offer.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {getCategoryLabel(offer.category)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(offer.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2" data-testid={`text-description-${offer.id}`}>
                  {offer.description}
                </p>
                <div className="space-y-2 mb-4">
                  {offer.location && (
                    <div className="flex items-center text-sm text-gray-500" data-testid={`text-location-${offer.id}`}>
                      <MapPin className="h-4 w-4 mr-2" />
                      {offer.location}
                    </div>
                  )}
                  {offer.price && (
                    <div className="flex items-center text-sm text-gray-500" data-testid={`text-price-${offer.id}`}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      {offer.currency} {offer.price}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(offer)}
                    className="flex-1"
                    data-testid={`button-edit-${offer.id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(offer)}
                    className="flex-1 text-red-600 hover:text-red-700"
                    data-testid={`button-delete-${offer.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post an Offer</DialogTitle>
            <DialogDescription>
              Share what you can offer to help others. Note: This will cost WytPoints.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Professional Web Development Services" {...field} data-testid="input-create-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-create-category">
                          <SelectValue placeholder="Select category" />
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
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what you're offering in detail..."
                        className="min-h-[100px]"
                        {...field}
                        data-testid="textarea-create-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mumbai, India" {...field} data-testid="input-create-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5000" type="number" {...field} data-testid="input-create-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  data-testid="button-cancel-create"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  data-testid="button-submit-create"
                >
                  {createMutation.isPending ? "Posting..." : "Post Offer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
            <DialogDescription>
              Update your offer details
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-category">
                          <SelectValue />
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
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="min-h-[100px]"
                        {...field}
                        data-testid="textarea-edit-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-edit-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Offer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this offer? This action cannot be undone. Points spent will be refunded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
