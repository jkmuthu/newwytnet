import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Search, Sparkles, TrendingUp, Zap, Package, ChevronLeft, ChevronRight, MessageSquare, Send, Users } from "lucide-react";
import WytWallLayout from "@/components/wytwall/WytWallLayout";
import FiltersPanel from "@/components/wytwall/FiltersPanel";
import NeedCard from "@/components/wytwall/NeedCard";
import OfferCard from "@/components/wytwall/OfferCard";
import PromotionsPanel from "@/components/wytwall/PromotionsPanel";
import HomeContentSections from "@/components/wytwall/HomeContentSections";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Inline Conversation Component for WytWall Dialog (one thread per user per post)
function OfferConversationInline({ offerId }: { offerId: string }) {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { data: commentsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/wytwall/offers', offerId, 'comments'],
    queryFn: async () => {
      const res = await fetch(`/api/wytwall/offers/${offerId}/comments`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
  });

  const comments = (commentsData as any)?.comments || [];

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    try {
      const res = await fetch(`/api/wytwall/offers/${offerId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      
      if (res.ok) {
        setNewMessage("");
        refetch();
        toast({ title: "Message sent!" });
      } else {
        toast({ title: "Failed to send message", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error sending message", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 py-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Messages List */}
      <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No messages yet. Start the conversation below.
          </p>
        ) : (
          comments.map((comment: any) => (
            <div
              key={comment.id}
              className={`p-3 rounded-lg ${
                comment.isFromPostAuthor
                  ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 ml-4'
                  : 'bg-gray-100 dark:bg-gray-800 mr-4'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={comment.user?.profileImageUrl} />
                  <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                    {comment.user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {comment.user?.name || 'Anonymous'}
                </span>
                {comment.isFromPostAuthor && (
                  <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700">
                    Post Owner
                  </Badge>
                )}
                <span className="text-[10px] text-gray-400 ml-auto">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{comment.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Reply Input */}
      <div className="flex gap-2 pt-2 border-t">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          disabled={isSending}
          className="flex-1"
          data-testid="input-conversation-message"
        />
        <Button
          onClick={handleSendMessage}
          disabled={isSending || !newMessage.trim()}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-send-message"
        >
          {isSending ? '...' : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

// Response Thread Component for post owners - Facebook-style expanded comments
function ResponseThread({ offer }: { offer: any }) {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const { data: commentsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/wytwall/offers', offer.id, 'comments'],
    queryFn: async () => {
      const res = await fetch(`/api/wytwall/offers/${offer.id}/comments`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
  });

  const comments = (commentsData as any)?.comments || [];

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    try {
      const res = await fetch(`/api/wytwall/offers/${offer.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      
      if (res.ok) {
        setNewMessage("");
        setShowReplyInput(false);
        refetch();
        toast({ title: "Reply sent!" });
      } else {
        toast({ title: "Failed to send reply", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error sending reply", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Offer Header - The initial message from responder */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={offer.offererProfileImage} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
              {offer.offererName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                {offer.offererName || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(offer.createdAt).toLocaleDateString()}
              </span>
              {offer.proposedPrice && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs">
                  {offer.proposedPrice}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{offer.message}</p>
          </div>
        </div>
      </div>

      {/* Conversation Thread - Facebook-style comments */}
      <div className="p-3">
        {isLoading ? (
          <div className="text-xs text-gray-500 py-2">Loading conversation...</div>
        ) : comments.length > 0 ? (
          <div className="space-y-2 mb-3">
            {comments.map((comment: any) => (
              <div 
                key={comment.id} 
                className={`flex gap-2 ${comment.isFromPostAuthor ? '' : 'flex-row-reverse'}`}
              >
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarImage src={comment.user?.profileImageUrl} />
                  <AvatarFallback className={`text-xs ${comment.isFromPostAuthor ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {comment.user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[80%] ${comment.isFromPostAuthor ? '' : 'text-right'}`}>
                  <div className={`inline-block px-3 py-2 rounded-2xl text-sm ${
                    comment.isFromPostAuthor 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-gray-900 dark:text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    {comment.message}
                  </div>
                  <div className={`text-[10px] text-gray-400 mt-0.5 px-2 ${comment.isFromPostAuthor ? '' : 'text-right'}`}>
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Reply Input - Always visible for quick replies like Facebook */}
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Write a reply..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={isSending}
            className="flex-1 h-9 text-sm rounded-full bg-gray-100 dark:bg-gray-700 border-0"
            data-testid={`input-reply-${offer.id}`}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
            size="sm"
            className="h-9 w-9 p-0 rounded-full bg-purple-600 hover:bg-purple-700"
            data-testid={`button-send-reply-${offer.id}`}
          >
            {isSending ? '...' : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WytWall() {
  const { user } = useAuthContext();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [postType, setPostType] = useState<"all" | "needs" | "offers">("all");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 10;
  
  // Make Offer Dialog state
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [offerMessage, setOfferMessage] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  
  // Existing offer/conversation state (one thread per user per post)
  const [existingOffer, setExistingOffer] = useState<any>(null);
  const [isCheckingOffer, setIsCheckingOffer] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  
  // View All Responses Dialog state (for post owners)
  const [responsesDialogOpen, setResponsesDialogOpen] = useState(false);
  const [responsesPost, setResponsesPost] = useState<any>(null);
  const [allResponses, setAllResponses] = useState<any[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);

  // Build query URLs with proper query string parameters
  const needsUrl = user ? '/api/needs' : '/api/needs/public';
  const offersUrl = user ? '/api/offers' : '/api/offers/public';
  
  const needsQueryUrl = selectedCategory !== 'all' 
    ? `${needsUrl}?category=${selectedCategory}` 
    : needsUrl;
  
  const offersQueryUrl = selectedCategory !== 'all' 
    ? `${offersUrl}?category=${selectedCategory}` 
    : offersUrl;

  // Also fetch public wytwall posts (user-published posts)
  const wytWallPublicUrl = selectedCategory !== 'all'
    ? `/api/wytwall/public?category=${selectedCategory}`
    : '/api/wytwall/public';

  const { data: needsData, isLoading: needsLoading } = useQuery({
    queryKey: [needsQueryUrl],
    enabled: postType === "all" || postType === "needs",
  });

  const { data: offersData, isLoading: offersLoading } = useQuery({
    queryKey: [offersQueryUrl],
    enabled: postType === "all" || postType === "offers",
  });

  // Fetch public wytwall posts
  const { data: wytWallData, isLoading: wytWallLoading } = useQuery({
    queryKey: [wytWallPublicUrl],
  });

  const allNeeds = (needsData as any)?.needs || [];
  const allOffers = (offersData as any)?.offers || [];
  const wytWallPosts = (wytWallData as any)?.posts || [];
  
  // Merge counts from needs, offers, and wytwall posts
  const needsCounts = (needsData as any)?.counts || {};
  const offersCounts = (offersData as any)?.counts || {};
  const wytWallCounts = (wytWallData as any)?.counts || {};
  const counts: Record<string, number> = {};
  
  // Combine counts for each category
  const allCategories = new Set([...Object.keys(needsCounts), ...Object.keys(offersCounts), ...Object.keys(wytWallCounts)]);
  allCategories.forEach(cat => {
    counts[cat] = (needsCounts[cat] || 0) + (offersCounts[cat] || 0) + (wytWallCounts[cat] || 0);
  });
  
  // Transform wytwall posts to match the format
  const transformedWytWallPosts = wytWallPosts.map((p: any) => ({
    ...p,
    type: p.postType, // 'need' or 'offer'
    title: p.description.substring(0, 50) + (p.description.length > 50 ? '...' : ''),
    isWytWallPost: true, // Flag to identify these posts
  }));
  
  // Combine and sort by date
  const allPosts = [
    ...allNeeds.map((n: any) => ({ ...n, type: 'need' })), 
    ...allOffers.map((o: any) => ({ ...o, type: 'offer' })),
    ...transformedWytWallPosts
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate location counts
  const locationCounts: Record<string, number> = {};
  allPosts.forEach((post: any) => {
    if (post.location) {
      const location = post.location.trim();
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    }
  });

  let filteredPosts = allPosts;

  // Apply search filter
  if (searchQuery.trim()) {
    filteredPosts = filteredPosts.filter((post: any) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply location filter
  if (selectedLocation) {
    filteredPosts = filteredPosts.filter((post: any) =>
      post.location?.toLowerCase().includes(selectedLocation.toLowerCase())
    );
  }

  const posts = postType === "all" ? filteredPosts :
    filteredPosts.filter((p: any) => p.type === (postType === "needs" ? "need" : "offer"));

  // Pagination
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, endIndex);

  const isLoading = needsLoading || offersLoading || wytWallLoading;

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePostTypeChange = (type: "all" | "needs" | "offers") => {
    setPostType(type);
    setCurrentPage(1);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setCurrentPage(1);
  };

  // Mutation for submitting offers
  const submitOfferMutation = useMutation({
    mutationFn: async (data: { postId: string; message: string; price?: string }) => {
      return await apiRequest('/api/wytwall/offers', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Offer Sent!",
        description: "Your offer has been sent to the post owner.",
      });
      setOfferDialogOpen(false);
      setOfferMessage("");
      setOfferPrice("");
      setSelectedPost(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send offer",
        variant: "destructive",
      });
    },
  });

  const handleMakeOffer = async (post: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setSelectedPost(post);
    setIsCheckingOffer(true);
    setExistingOffer(null);
    setConversationMode(false);
    
    try {
      // Check if user already has an offer on this post
      const res = await fetch(`/api/wytwall/posts/${post.id}/my-offer`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.offer) {
          // User has existing offer - show conversation mode
          setExistingOffer(data.offer);
          setConversationMode(true);
        }
      }
    } catch (error) {
      console.error('Error checking existing offer:', error);
    } finally {
      setIsCheckingOffer(false);
      setOfferDialogOpen(true);
    }
  };

  const handleSubmitOffer = () => {
    if (!selectedPost || !offerMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a message for your offer.",
        variant: "destructive",
      });
      return;
    }
    submitOfferMutation.mutate({
      postId: selectedPost.id,
      message: offerMessage,
      price: offerPrice || undefined,
    });
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // Handler for post owner to view all responses
  const handleViewResponses = async (post: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setResponsesPost(post);
    setIsLoadingResponses(true);
    setAllResponses([]);
    setResponsesDialogOpen(true);
    
    try {
      const res = await fetch(`/api/wytwall/posts/${post.id}/all-responses`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAllResponses(data.offers || []);
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast({
        title: "Error",
        description: "Failed to load responses",
        variant: "destructive",
      });
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const handlePostNeed = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/u/me/wytwall');
    }
  };

  // Left Panel - Filters
  const leftPanel = (
    <FiltersPanel
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
      categoryCounts={counts}
      selectedLocation={selectedLocation}
      onLocationChange={handleLocationChange}
      locationCounts={locationCounts}
    />
  );

  // Center Panel - Needs Stream
  const centerPanel = (
    <div className="space-y-6">
      
      {/* Modern Header with Glassmorphism */}
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
        
        {/* Floating orbs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        
        <CardContent className="relative p-2 sm:p-2.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="h-8 w-8 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  WytWall
                  <TrendingUp className="h-4 w-4 animate-bounce" />
                </h1>
              </div>
            </div>
            
            {/* Search Bar in Header */}
            <div className="hidden md:flex relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-8 text-sm border-0 bg-white/20 backdrop-blur-xl text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/50 rounded-xl"
                data-testid="input-search-needs"
              />
            </div>

            <Button
              onClick={handlePostNeed}
              className="bg-white/90 hover:bg-white text-purple-600 font-bold shadow-xl hover:scale-105 transition-all rounded-xl backdrop-blur-xl h-8 text-sm flex-shrink-0"
              data-testid="button-post-need"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Post</span>
              <span className="sm:hidden">Post</span>
            </Button>
          </div>
          
          {/* Mobile Search Bar (below header on mobile) */}
          <div className="md:hidden mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-8 text-sm border-0 bg-white/20 backdrop-blur-xl text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/50 rounded-xl w-full"
                data-testid="input-search-needs-mobile"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Pills for Mobile */}
      <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'jobs', 'real_estate', 'b2b_supply', 'service'].map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(cat)}
            className={`whitespace-nowrap rounded-full px-5 py-2 font-bold transition-all ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl border-0 scale-105"
                : "bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border-0 text-gray-700 dark:text-gray-300 hover:scale-105"
            }`}
            data-testid={`mobile-category-${cat}`}
          >
            {cat === 'all' ? 'All' : cat.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Needs Stream */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border-0 shadow-xl rounded-2xl">
              <Skeleton className="h-32 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="relative overflow-hidden border-0 shadow-2xl rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-pink-950/20"></div>
          <CardContent className="relative p-16 text-center">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Zap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
              No posts found
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
              {selectedCategory === 'all' 
                ? "Be the first to post on WytWall and connect with the community!" 
                : `No posts in the ${selectedCategory.replace('_', ' ')} category yet. Be the pioneer!`}
            </p>
            {user && (
              <Button
                onClick={handlePostNeed}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-10 py-6 rounded-2xl shadow-2xl hover:scale-105 transition-all"
                data-testid="button-post-to-wytwall"
              >
                <Plus className="h-6 w-6 mr-3" />
                Post to WytWall
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedPosts.map((post: any) => (
            post.type === 'need' ? (
              <NeedCard
                key={post.id}
                need={post}
                isAuthenticated={!!user}
                currentUserId={user?.id}
                onMakeOffer={handleMakeOffer}
                onViewResponses={handleViewResponses}
                onLogin={handleLogin}
                isCollapsed={false}
              />
            ) : (
              <OfferCard
                key={post.id}
                offer={post}
                isAuthenticated={!!user}
                currentUserId={user?.id}
                onViewOffer={() => navigate(`/wytwall/${post.displayId || post.id}`)}
                onLogin={handleLogin}
                isCollapsed={false}
              />
            )
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, totalPosts)} of {totalPosts} posts
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-prev-page"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[2.5rem] ${
                    currentPage === page
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                      : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0"
                  } shadow-lg hover:scale-105 transition-all`}
                  data-testid={`button-page-${page}`}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-next-page"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Additional Home Content Sections */}
      <HomeContentSections isAuthenticated={!!user} />
    </div>
  );

  // Right Panel - Promotions
  const rightPanel = (
    <PromotionsPanel isAuthenticated={!!user} />
  );

  return (
    <>
      <WytWallLayout
        leftPanel={leftPanel}
        centerPanel={centerPanel}
        rightPanel={rightPanel}
      />
      
      {/* Make Offer / Continue Conversation Dialog */}
      <Dialog open={offerDialogOpen} onOpenChange={(open) => {
        setOfferDialogOpen(open);
        if (!open) {
          setExistingOffer(null);
          setConversationMode(false);
          setOfferMessage("");
          setOfferPrice("");
        }
      }}>
        <DialogContent className={conversationMode ? "sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col" : "sm:max-w-[500px]"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              {conversationMode ? 'Your Conversation' : 'Make an Offer'}
            </DialogTitle>
            <DialogDescription>
              {conversationMode 
                ? "Continue your conversation with the post owner. You can only have one thread per post."
                : "Send your offer to the post owner. They will be notified and can respond to you."
              }
            </DialogDescription>
          </DialogHeader>
          
          {isCheckingOffer ? (
            <div className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Checking for existing conversation...</p>
            </div>
          ) : selectedPost && (
            <div className={`space-y-4 ${conversationMode ? 'flex-1 overflow-y-auto' : ''}`}>
              {/* Post Summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                  {selectedPost.title || selectedPost.description?.substring(0, 50)}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Posted by {selectedPost.user?.name || 'Anonymous'}
                </p>
              </div>
              
              {conversationMode && existingOffer ? (
                /* Existing Conversation View */
                <div className="space-y-4">
                  {/* Your Original Offer */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Your Original Offer</span>
                      <span className="text-xs text-gray-500">
                        {new Date(existingOffer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{existingOffer.message}</p>
                    {existingOffer.proposedPrice && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
                        Proposed: {existingOffer.proposedPrice}
                      </p>
                    )}
                  </div>
                  
                  {/* Conversation Thread */}
                  <OfferConversationInline offerId={existingOffer.id} />
                </div>
              ) : (
                /* New Offer Form */
                <>
                  {/* Offer Message */}
                  <div className="space-y-2">
                    <Label htmlFor="offer-message">Your Message *</Label>
                    <Textarea
                      id="offer-message"
                      placeholder="Describe your offer, qualifications, or how you can help..."
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      rows={4}
                      className="resize-none"
                      data-testid="textarea-offer-message"
                    />
                  </div>
                  
                  {/* Price (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="offer-price">Proposed Price (Optional)</Label>
                    <Input
                      id="offer-price"
                      type="text"
                      placeholder="e.g., ₹5000 or $100"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      data-testid="input-offer-price"
                    />
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOfferDialogOpen(false)}
              data-testid="button-cancel-offer"
            >
              {conversationMode ? 'Close' : 'Cancel'}
            </Button>
            {!conversationMode && (
              <Button
                onClick={handleSubmitOffer}
                disabled={submitOfferMutation.isPending || !offerMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                data-testid="button-submit-offer"
              >
                {submitOfferMutation.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Offer
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View All Responses Dialog (for post owners) - Facebook-style comments */}
      <Dialog open={responsesDialogOpen} onOpenChange={(open) => {
        setResponsesDialogOpen(open);
        if (!open) {
          setResponsesPost(null);
          setAllResponses([]);
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              All Responses
            </DialogTitle>
            <DialogDescription>
              View and respond to all offers on your post. Each conversation is private between you and the responder.
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingResponses ? (
            <div className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Loading responses...</p>
            </div>
          ) : responsesPost && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {/* Post Summary */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                  {responsesPost.title || responsesPost.description?.substring(0, 50)}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {responsesPost.description?.substring(0, 100)}{responsesPost.description?.length > 100 ? '...' : ''}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                    {allResponses.length} response{allResponses.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
              
              {allResponses.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No responses yet. Share your post to get more visibility!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allResponses.map((offer: any) => (
                    <ResponseThread key={offer.id} offer={offer} />
                  ))}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResponsesDialogOpen(false)}
              data-testid="button-close-responses"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }
      `}</style>
    </>
  );
}
