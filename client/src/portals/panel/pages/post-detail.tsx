import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Edit, Trash2, Calendar, Clock, Package, AlertTriangle, Loader2 } from "lucide-react";

export default function PostDetail() {
  const [, navigate] = useLocation();
  const params = useParams();
  const postId = params.postId;
  const { toast } = useToast();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data: postData, isLoading } = useQuery({
    queryKey: ['/api/wytwall/posts', postId],
    enabled: !!postId,
  });

  const post = (postData as any)?.post;

  const updateMutation = useMutation({
    mutationFn: async (data: { category: string; description: string }) => {
      return apiRequest(`/api/wytwall/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Post updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/wytwall/posts', postId] });
      queryClient.invalidateQueries({ queryKey: ['/api/wytwall/my-posts'] });
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Failed to update post", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/wytwall/posts/${postId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({ title: "Post deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/wytwall/my-posts'] });
      navigate('/u/me/wytwall');
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete post", description: error.message, variant: "destructive" });
    }
  });

  const handleOpenEdit = () => {
    if (post) {
      setEditCategory(post.category);
      setEditDescription(post.description);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({ category: editCategory, description: editDescription });
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      need_job: "Need a Job",
      house_for_rent: "House for Rent",
      require_service: "Require a Service",
      product_for_use: "Product for my Use",
      bulk_supply: "Product for Bulk Supply",
      selling_bike: "Selling my Bike",
      selling_car: "Selling my Car",
      selling_property: "Selling my Property",
      renting_house: "Renting my House",
      providing_service: "Providing Service",
      other: "Other",
    };
    return labels[category] || category;
  };

  const needCategories = [
    { value: "need_job", label: "Need a Job" },
    { value: "house_for_rent", label: "House for Rent" },
    { value: "require_service", label: "Require a Service" },
    { value: "product_for_use", label: "Product for my Use" },
    { value: "bulk_supply", label: "Product for Bulk Supply" },
    { value: "other", label: "Other" },
  ];

  const offerCategories = [
    { value: "selling_bike", label: "Selling my Bike" },
    { value: "selling_car", label: "Selling my Car" },
    { value: "selling_property", label: "Selling my Property" },
    { value: "renting_house", label: "Renting my House" },
    { value: "providing_service", label: "Providing Service" },
    { value: "other", label: "Other" },
  ];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Post not found</h3>
          <p className="text-muted-foreground mb-4">This post may have been deleted or doesn't exist.</p>
          <Button onClick={() => navigate('/u/me/wytwall')} data-testid="button-back-to-posts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My WytWall
          </Button>
        </Card>
      </div>
    );
  }

  const categories = post.postType === 'need' ? needCategories : offerCategories;

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/u/me/wytwall')}
        className="mb-4"
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My WytWall
      </Button>

      {/* Post Detail Card */}
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className={`absolute inset-0 ${post.postType === 'need' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600' : 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600'}`}></div>
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white border-0">
                    {post.postType === 'need' ? 'Need' : 'Offer'}
                  </Badge>
                  <Badge className="bg-white/30 text-white border-0">
                    {getCategoryLabel(post.category)}
                  </Badge>
                </div>
                <p className="text-white/80 text-sm mt-1">
                  Posted for: {post.postFor === 'organization' ? 'Organization' : 'Personal'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleOpenEdit}
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl"
                data-testid="button-edit-post"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="destructive"
                className="bg-red-500/80 hover:bg-red-600"
                data-testid="button-delete-post"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Content */}
      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-sm">Description</Label>
            <p className="text-foreground mt-1">{post.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-sm">Status</Label>
              <div className="mt-1">
                <Badge variant={post.status === 'active' ? 'default' : 'secondary'}>
                  {post.status}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Validity</Label>
              <p className="text-foreground mt-1">{post.validityDays} days</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Created: {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Expires: {new Date(post.expiresAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update your {post.postType === 'need' ? 'need' : 'offer'} post details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe your need or offer..."
                rows={4}
                maxLength={200}
                data-testid="input-description"
              />
              <p className="text-xs text-muted-foreground">{editDescription.length}/200 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={updateMutation.isPending}
              data-testid="button-save-edit"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Post
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Post'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
