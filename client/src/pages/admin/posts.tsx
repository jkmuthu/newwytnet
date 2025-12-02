import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Search, 
  Eye, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Calendar,
  User,
  MessageCircle,
  Heart,
  Package,
  ShoppingBag,
  Filter,
  RefreshCw,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Post {
  id: string;
  postType: 'need' | 'offer';
  postFor: 'personal' | 'organization';
  category: string;
  description: string;
  location: string | null;
  validityDays: number | null;
  expiresAt: string | null;
  status: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userProfileImage: string | null;
  offersCount: number;
  reactionsCount: number;
}

interface PostStats {
  totalPosts: number;
  activePosts: number;
  needPosts: number;
  offerPosts: number;
  totalOffers: number;
}

interface Category {
  category: string;
  count: number;
}

export default function AllPosts() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [postTypeFilter, setPostTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const limit = 20;

  const { data: postsData, isLoading, refetch } = useQuery<{
    success: boolean;
    posts: Post[];
    categories: Category[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>({
    queryKey: ['/api/admin/posts', { page, search: searchQuery, postType: postTypeFilter, status: statusFilter, category: categoryFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchQuery) params.append('search', searchQuery);
      if (postTypeFilter) params.append('postType', postTypeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      
      const response = await fetch(`/api/admin/posts?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    }
  });

  const { data: statsData } = useQuery<{ success: boolean; stats: PostStats }>({
    queryKey: ['/api/admin/posts/stats'],
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ postId, data }: { postId: string; data: { status?: string; isPublic?: boolean } }) => {
      return await apiRequest(`/api/admin/posts/${postId}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/posts/stats'] });
      toast({ title: "Success", description: "Post updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update post", variant: "destructive" });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest(`/api/admin/posts/${postId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/posts/stats'] });
      setIsDeleteDialogOpen(false);
      setSelectedPost(null);
      toast({ title: "Success", description: "Post deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete post", variant: "destructive" });
    }
  });

  const posts = postsData?.posts || [];
  const categories = postsData?.categories || [];
  const pagination = postsData?.pagination;
  const stats = statsData?.stats;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
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

  const handleViewPost = (post: Post) => {
    setSelectedPost(post);
    setIsViewDialogOpen(true);
  };

  const handleDeletePost = (post: Post) => {
    setSelectedPost(post);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleStatus = (post: Post) => {
    const newStatus = post.status === 'active' ? 'inactive' : 'active';
    updatePostMutation.mutate({ postId: post.id, data: { status: newStatus } });
  };

  const handleTogglePublic = (post: Post) => {
    updatePostMutation.mutate({ postId: post.id, data: { isPublic: !post.isPublic } });
  };

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setPostTypeFilter("");
    setStatusFilter("");
    setCategoryFilter("");
    setPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            All Posts
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and moderate WytWall posts across the platform
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" data-testid="button-refresh-posts">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalPosts || 0}</p>
                <p className="text-sm text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.activePosts || 0}</p>
                <p className="text-sm text-muted-foreground">Active Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.needPosts || 0}</p>
                <p className="text-sm text-muted-foreground">Need Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.offerPosts || 0}</p>
                <p className="text-sm text-muted-foreground">Offer Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalOffers || 0}</p>
                <p className="text-sm text-muted-foreground">Total Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                  data-testid="input-search-posts"
                />
              </div>
              <Button onClick={handleSearch} data-testid="button-search">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={postTypeFilter} onValueChange={(v) => { setPostTypeFilter(v === 'all' ? '' : v); setPage(1); }}>
                <SelectTrigger className="w-[130px]" data-testid="select-post-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="need">Need</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
                <SelectTrigger className="w-[130px]" data-testid="select-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v === 'all' ? '' : v); setPage(1); }}>
                <SelectTrigger className="w-[180px]" data-testid="select-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category} value={cat.category}>
                      {getCategoryLabel(cat.category)} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={resetFilters} data-testid="button-reset-filters">
                <Filter className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="max-w-[300px]">Description</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Eng.</TableHead>
                    <TableHead className="text-center">Public</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id} data-testid={`row-post-${post.id}`}>
                      <TableCell>
                        <Badge variant={post.postType === 'need' ? 'default' : 'secondary'} className={post.postType === 'need' ? 'bg-purple-500' : 'bg-green-500'}>
                          {post.postType === 'need' ? 'Need' : 'Offer'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getCategoryLabel(post.category)}</span>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate text-sm" title={post.description}>{post.description}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={post.userProfileImage || undefined} />
                            <AvatarFallback>{post.userName?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{post.userName || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{post.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(post.createdAt), 'MMM d, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {post.offersCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.reactionsCount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={post.isPublic}
                          onCheckedChange={() => handleTogglePublic(post)}
                          data-testid={`switch-public-${post.id}`}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={post.status === 'active' ? 'default' : 'secondary'} className={post.status === 'active' ? 'bg-green-500' : ''}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${post.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewPost(post)} data-testid={`menu-view-${post.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(post)} data-testid={`menu-toggle-${post.id}`}>
                              {post.status === 'active' ? (
                                <>
                                  <ToggleLeft className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeletePost(post)} className="text-red-600" data-testid={`menu-delete-${post.id}`}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} posts
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      data-testid="button-prev-page"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={page >= pagination.totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Post Details
            </DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedPost.userProfileImage || undefined} />
                  <AvatarFallback>{selectedPost.userName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedPost.userName || 'Unknown User'}</p>
                  <p className="text-sm text-muted-foreground">{selectedPost.userEmail}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant={selectedPost.postType === 'need' ? 'default' : 'secondary'} className={selectedPost.postType === 'need' ? 'bg-purple-500' : 'bg-green-500'}>
                    {selectedPost.postType === 'need' ? 'Need' : 'Offer'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{getCategoryLabel(selectedPost.category)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedPost.status === 'active' ? 'default' : 'secondary'}>
                    {selectedPost.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Visibility</p>
                  <Badge variant={selectedPost.isPublic ? 'default' : 'secondary'}>
                    {selectedPost.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{format(new Date(selectedPost.createdAt), 'MMM d, yyyy HH:mm')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Engagement</p>
                  <p className="font-medium">{selectedPost.offersCount} responses, {selectedPost.reactionsCount} reactions</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="p-3 bg-muted rounded-lg">{selectedPost.description}</p>
              </div>
              
              {selectedPost.location && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Location</p>
                  <p className="p-3 bg-muted rounded-lg">{selectedPost.location}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Post
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone. All associated responses and reactions will also be deleted.
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm line-clamp-3">{selectedPost.description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Posted by {selectedPost.userName} on {format(new Date(selectedPost.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} data-testid="button-cancel-delete">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedPost && deletePostMutation.mutate(selectedPost.id)}
              disabled={deletePostMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deletePostMutation.isPending ? 'Deleting...' : 'Delete Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
