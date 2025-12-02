import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import WytWallPostForm from "@/components/WytWallPostForm";
import { Package, Plus, Loader2, RefreshCw, X, Clock, AlertTriangle, CheckCircle, Calendar, RotateCcw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export default function MyPosts() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"all" | "need" | "offer">("all");
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [defaultPostType, setDefaultPostType] = useState<"need" | "offer">("need");
  
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [renewDays, setRenewDays] = useState<number>(7);
  const [closeReason, setCloseReason] = useState<string>("");

  const { data: postsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/wytwall/my-posts'],
  });

  const renewMutation = useMutation({
    mutationFn: async ({ postId, validityDays }: { postId: string; validityDays: number }) => {
      return apiRequest(`/api/wytwall/posts/${postId}/renew`, 'POST', { validityDays });
    },
    onSuccess: (data: any) => {
      toast({ title: "Success", description: data.message || "Post renewed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/wytwall/my-posts'] });
      setIsRenewDialogOpen(false);
      setSelectedPost(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to renew post", variant: "destructive" });
    }
  });

  const closeMutation = useMutation({
    mutationFn: async ({ postId, closedReason }: { postId: string; closedReason: string }) => {
      return apiRequest(`/api/wytwall/posts/${postId}/close`, 'POST', { closedReason });
    },
    onSuccess: (data: any) => {
      toast({ title: "Success", description: data.message || "Post closed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/wytwall/my-posts'] });
      setIsCloseDialogOpen(false);
      setSelectedPost(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to close post", variant: "destructive" });
    }
  });

  const posts = (postsData as any)?.posts || [];
  
  const needsCount = posts.filter((p: any) => p.postType === 'need').length;
  const offersCount = posts.filter((p: any) => p.postType === 'offer').length;

  const filteredPosts = activeTab === "all" 
    ? posts 
    : posts.filter((p: any) => p.postType === activeTab);

  const handleOpenPostDialog = (type: "need" | "offer") => {
    setDefaultPostType(type);
    setIsPostDialogOpen(true);
  };

  const handleOpenRenewDialog = (post: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPost(post);
    setRenewDays(7);
    setIsRenewDialogOpen(true);
  };

  const handleOpenCloseDialog = (post: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPost(post);
    setCloseReason("");
    setIsCloseDialogOpen(true);
  };

  const handleRenew = () => {
    if (selectedPost && renewDays) {
      renewMutation.mutate({ postId: selectedPost.id, validityDays: renewDays });
    }
  };

  const handleClose = () => {
    if (selectedPost && closeReason) {
      closeMutation.mutate({ postId: selectedPost.id, closedReason: closeReason });
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

  const getStatusBadge = (post: any) => {
    if (post.status === 'closed') {
      return (
        <Badge className="bg-gray-500 text-white">
          <X className="h-3 w-3 mr-1" />
          Closed
        </Badge>
      );
    }
    if (post.status === 'expired') {
      return (
        <Badge className="bg-red-500 text-white">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }
    if (post.isExpiringSoon) {
      return (
        <Badge className="bg-orange-500 text-white">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {post.daysRemaining} day{post.daysRemaining !== 1 ? 's' : ''} left
        </Badge>
      );
    }
    if (post.status === 'active') {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return <Badge variant="outline">{post.status}</Badge>;
  };

  const getDaysRemainingBadge = (post: any) => {
    if (post.status === 'closed' || post.status === 'expired') return null;
    if (post.daysRemaining === null) return null;
    
    if (post.daysRemaining > 3) {
      return (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {post.daysRemaining} days remaining
        </span>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <CardContent className="relative p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">My Posts</h1>
                <p className="text-white/90 text-sm">Manage your needs & offers</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => handleOpenPostDialog('need')}
                className="flex-1 sm:flex-none bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl"
                size="sm"
                data-testid="button-post-need"
              >
                <Plus className="h-4 w-4 mr-1" />
                Need
              </Button>
              <Button 
                onClick={() => handleOpenPostDialog('offer')}
                className="flex-1 sm:flex-none bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl"
                size="sm"
                data-testid="button-post-offer"
              >
                <Plus className="h-4 w-4 mr-1" />
                Offer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" data-testid="tab-all">
            All ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="need" data-testid="tab-needs">
            Needs ({needsCount})
          </TabsTrigger>
          <TabsTrigger value="offer" data-testid="tab-offers">
            Offers ({offersCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 md:mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading posts...</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="p-8 md:p-12 text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                No {activeTab === "all" ? "posts" : activeTab === "need" ? "needs" : "offers"} yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start by posting your first {activeTab === "all" ? "need or offer" : activeTab === "need" ? "need" : "offer"}
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button onClick={() => handleOpenPostDialog('need')} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Need
                </Button>
                <Button onClick={() => handleOpenPostDialog('offer')} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Offer
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredPosts.map((post: any) => (
                <Card 
                  key={post.id} 
                  className={`p-4 md:p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                    post.status === 'closed' ? 'opacity-60 bg-gray-50 dark:bg-gray-900/50' : 
                    post.status === 'expired' ? 'border-red-200 dark:border-red-900' : ''
                  }`}
                  onClick={() => navigate(`/u/me/wytwall/${post.id}`)}
                  data-testid={`post-card-${post.id}`}
                >
                  <div className="space-y-3">
                    {/* Post Header */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={post.postType === 'need' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}>
                        {post.postType === 'need' ? 'Need' : 'Offer'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{getCategoryLabel(post.category)}</Badge>
                      {getStatusBadge(post)}
                      {post.renewedCount > 0 && (
                        <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Renewed {post.renewedCount}x
                        </Badge>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-foreground line-clamp-2">{post.description}</p>
                    
                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {getDaysRemainingBadge(post)}
                        {post.status === 'closed' && post.closedReason && (
                          <span className="text-gray-500">
                            Closed: {getClosedReasonLabel(post.closedReason)}
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {(post.status === 'expired' || post.status === 'active') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => handleOpenRenewDialog(post, e)}
                            className="text-xs"
                            data-testid={`button-renew-${post.id}`}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Renew
                          </Button>
                        )}
                        {post.status !== 'closed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => handleOpenCloseDialog(post, e)}
                            className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            data-testid={`button-close-${post.id}`}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Close
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => { e.stopPropagation(); navigate(`/u/me/wytwall/${post.id}`); }}
                          className="text-xs"
                          data-testid={`button-view-${post.id}`}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Post Creation Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create a Post</DialogTitle>
          </DialogHeader>
          <WytWallPostForm 
            defaultPostType={defaultPostType}
            onSuccess={() => setIsPostDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Renew Dialog */}
      <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-green-600" />
              Renew Post
            </DialogTitle>
            <DialogDescription>
              Extend the validity of your post to keep it active on WytWall.
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
            {selectedPost && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">{selectedPost.postType === 'need' ? 'Need' : 'Offer'}: {getCategoryLabel(selectedPost.category)}</p>
                <p className="text-muted-foreground line-clamp-2">{selectedPost.description}</p>
              </div>
            )}
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
                  Renew for {renewDays} days
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
              Mark this post as closed. You can select a reason below.
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
            {selectedPost && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">{selectedPost.postType === 'need' ? 'Need' : 'Offer'}: {getCategoryLabel(selectedPost.category)}</p>
                <p className="text-muted-foreground line-clamp-2">{selectedPost.description}</p>
              </div>
            )}
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
