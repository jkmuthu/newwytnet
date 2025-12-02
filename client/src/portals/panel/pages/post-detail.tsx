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
import { ArrowLeft, Edit, Trash2, Calendar, Clock, Package, AlertTriangle, Loader2, RefreshCw, X, CheckCircle, RotateCcw } from "lucide-react";

const CLOSE_REASONS = [
  { value: "done_wytnet", label: "Done with WytNet", description: "Found what you needed through WytNet" },
  { value: "done_elsewhere", label: "Done elsewhere", description: "Fulfilled outside WytNet" },
  { value: "dropped", label: "Dropped the plan", description: "No longer needed" },
  { value: "fulfilled", label: "Request fulfilled", description: "Successfully completed" },
];

const VALIDITY_OPTIONS = [
  { value: 7, label: "7 days" },
  { value: 15, label: "15 days" },
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
];

export default function PostDetail() {
  const [, navigate] = useLocation();
  const params = useParams();
  const postId = params.postId;
  const { toast } = useToast();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [renewDays, setRenewDays] = useState<number>(7);
  const [closeReason, setCloseReason] = useState<string>("");

  const { data: postData, isLoading } = useQuery({
    queryKey: ['/api/wytwall/posts', postId],
    enabled: !!postId,
  });

  const post = (postData as any)?.post;

  const updateMutation = useMutation({
    mutationFn: async (data: { category: string; description: string }) => {
      return apiRequest(`/api/wytwall/posts/${postId}`, 'PATCH', data);
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
      return apiRequest(`/api/wytwall/posts/${postId}`, 'DELETE');
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

  const renewMutation = useMutation({
    mutationFn: async ({ validityDays }: { validityDays: number }) => {
      return apiRequest(`/api/wytwall/posts/${postId}/renew`, 'POST', { validityDays });
    },
    onSuccess: (data: any) => {
      toast({ title: "Success", description: data.message || "Post renewed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/wytwall/posts', postId] });
      queryClient.invalidateQueries({ queryKey: ['/api/wytwall/my-posts'] });
      setIsRenewDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to renew post", variant: "destructive" });
    }
  });

  const closeMutation = useMutation({
    mutationFn: async ({ closedReason }: { closedReason: string }) => {
      return apiRequest(`/api/wytwall/posts/${postId}/close`, 'POST', { closedReason });
    },
    onSuccess: (data: any) => {
      toast({ title: "Success", description: data.message || "Post closed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/wytwall/posts', postId] });
      queryClient.invalidateQueries({ queryKey: ['/api/wytwall/my-posts'] });
      setIsCloseDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to close post", variant: "destructive" });
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

  const handleRenew = () => {
    if (renewDays) {
      renewMutation.mutate({ validityDays: renewDays });
    }
  };

  const handleClose = () => {
    if (closeReason) {
      closeMutation.mutate({ closedReason: closeReason });
    }
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

  const getClosedReasonLabel = (reason: string) => {
    const found = CLOSE_REASONS.find(r => r.value === reason);
    return found?.label || reason;
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

  const getDaysRemaining = () => {
    if (!post?.expiresAt) return null;
    const now = new Date();
    const expiresAt = new Date(post.expiresAt);
    const diffTime = expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getEffectiveStatus = () => {
    const daysRemaining = getDaysRemaining();
    if (post?.status === 'closed') return 'closed';
    if (daysRemaining !== null && daysRemaining <= 0) return 'expired';
    return post?.status || 'active';
  };

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
  const daysRemaining = getDaysRemaining();
  const effectiveStatus = getEffectiveStatus();

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/u/me/wytwall')}
        className="mb-2"
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My WytWall
      </Button>

      {/* Post Detail Card */}
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className={`absolute inset-0 ${post.postType === 'need' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600' : 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600'}`}></div>
        <CardContent className="relative p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
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
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {effectiveStatus !== 'closed' && (
                <Button 
                  onClick={handleOpenEdit}
                  className="flex-1 sm:flex-none bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl"
                  size="sm"
                  data-testid="button-edit-post"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              <Button 
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="destructive"
                className="flex-1 sm:flex-none bg-red-500/80 hover:bg-red-600"
                size="sm"
                data-testid="button-delete-post"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Banner */}
      {effectiveStatus === 'closed' && (
        <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <X className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">This post has been closed</p>
              {post.closedReason && (
                <p className="text-sm text-gray-500">Reason: {getClosedReasonLabel(post.closedReason)}</p>
              )}
              {post.closedAt && (
                <p className="text-xs text-gray-400">Closed on {new Date(post.closedAt).toLocaleDateString()}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {effectiveStatus === 'expired' && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">This post has expired</p>
                <p className="text-sm text-red-500">Renew to make it visible again on WytWall</p>
              </div>
            </div>
            <Button 
              onClick={() => { setRenewDays(7); setIsRenewDialogOpen(true); }}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="sm"
              data-testid="button-renew-expired"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Renew
            </Button>
          </CardContent>
        </Card>
      )}

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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-sm">Status</Label>
              <div className="mt-1 flex items-center gap-2">
                {effectiveStatus === 'active' && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
                {effectiveStatus === 'expired' && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Expired
                  </Badge>
                )}
                {effectiveStatus === 'closed' && (
                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    <X className="h-3 w-3 mr-1" />
                    Closed
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Validity</Label>
              <p className="text-foreground mt-1">{post.validityDays} days</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Created: {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {effectiveStatus === 'closed' ? 'Closed' : effectiveStatus === 'expired' ? 'Expired' : `Expires: ${new Date(post.expiresAt).toLocaleDateString()}`}
              </span>
            </div>
          </div>

          {daysRemaining !== null && daysRemaining > 0 && effectiveStatus === 'active' && (
            <div className={`p-3 rounded-lg ${daysRemaining <= 3 ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'}`}>
              <div className="flex items-center gap-2">
                {daysRemaining <= 3 ? (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span className={`text-sm font-medium ${daysRemaining <= 3 ? 'text-orange-700 dark:text-orange-300' : 'text-green-700 dark:text-green-300'}`}>
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                </span>
              </div>
            </div>
          )}

          {post.renewedCount > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RotateCcw className="h-4 w-4" />
              <span className="text-sm">Renewed {post.renewedCount} time{post.renewedCount !== 1 ? 's' : ''}</span>
              {post.renewedAt && (
                <span className="text-xs text-muted-foreground">
                  (Last: {new Date(post.renewedAt).toLocaleDateString()})
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {effectiveStatus !== 'closed' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Post Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button 
              onClick={() => { setRenewDays(7); setIsRenewDialogOpen(true); }}
              variant="outline"
              className="flex-1 sm:flex-none"
              data-testid="button-renew"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {effectiveStatus === 'expired' ? 'Renew Post' : 'Extend Validity'}
            </Button>
            <Button 
              onClick={() => { setCloseReason(''); setIsCloseDialogOpen(true); }}
              variant="outline"
              className="flex-1 sm:flex-none text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              data-testid="button-close"
            >
              <X className="h-4 w-4 mr-2" />
              Close Post
            </Button>
          </CardContent>
        </Card>
      )}

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

      {/* Renew Dialog */}
      <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-green-600" />
              {effectiveStatus === 'expired' ? 'Renew Post' : 'Extend Validity'}
            </DialogTitle>
            <DialogDescription>
              {effectiveStatus === 'expired' 
                ? 'Reactivate your expired post to make it visible on WytWall again.'
                : 'Extend the validity of your post to keep it active longer.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="validity">Extend for</Label>
              <Select value={renewDays.toString()} onValueChange={(v) => setRenewDays(parseInt(v))}>
                <SelectTrigger data-testid="select-renew-days">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {VALIDITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRenew} 
              disabled={renewMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-renew"
            >
              {renewMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Renewing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {effectiveStatus === 'expired' ? 'Renew' : 'Extend'} for {renewDays} days
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Post Dialog */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-orange-600" />
              Close Post
            </DialogTitle>
            <DialogDescription>
              Mark this post as closed. Select a reason below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Why are you closing this post?</Label>
              <div className="space-y-2">
                {CLOSE_REASONS.map((reason) => (
                  <div
                    key={reason.value}
                    onClick={() => setCloseReason(reason.value)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      closeReason === reason.value 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    data-testid={`option-close-${reason.value}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        closeReason === reason.value ? 'border-orange-500' : 'border-gray-300'
                      }`}>
                        {closeReason === reason.value && (
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{reason.label}</p>
                        <p className="text-xs text-muted-foreground">{reason.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleClose} 
              disabled={closeMutation.isPending || !closeReason}
              className="bg-orange-600 hover:bg-orange-700"
              data-testid="button-confirm-close"
            >
              {closeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Close Post
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
