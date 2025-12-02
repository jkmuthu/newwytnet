import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Clock, Calendar, Package, MessageSquare, ThumbsUp, Users, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WytWallPost() {
  const { user } = useAuthContext();
  const [, navigate] = useLocation();
  const params = useParams();
  const postId = params.postId;
  const { toast } = useToast();
  
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [offerMessage, setOfferMessage] = useState("");

  const { data: postData, isLoading } = useQuery({
    queryKey: ['/api/wytwall/posts', postId, 'public'],
    queryFn: async () => {
      const res = await fetch(`/api/wytwall/posts/${postId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch post');
      return res.json();
    },
    enabled: !!postId,
  });

  const post = (postData as any)?.post;
  const isOwner = user && post && String(user.id) === String(post.userId);

  const submitOfferMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest(`/api/wytwall/posts/${postId}/offers`, 'POST', { message });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Your offer has been submitted!" });
      setIsOfferDialogOpen(false);
      setOfferMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/wytwall/posts', postId] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to submit offer", 
        variant: "destructive" 
      });
    }
  });

  const handleSubmitOffer = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!offerMessage.trim()) {
      toast({ title: "Please enter a message", variant: "destructive" });
      return;
    }
    submitOfferMutation.mutate(offerMessage.trim());
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Post not found</h3>
          <p className="text-muted-foreground mb-4">This post may have been deleted or doesn't exist.</p>
          <Button onClick={() => navigate('/')} data-testid="button-back-home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to WytWall
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-2"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to WytWall
        </Button>

        <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
          <div className={`absolute inset-0 ${post.postType === 'need' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600' : 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600'}`}></div>
          <CardContent className="relative p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 ring-4 ring-white/30">
                <AvatarImage src={post.user?.profileImageUrl} />
                <AvatarFallback className="bg-white/20 text-white font-bold text-lg">
                  {post.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className="bg-white/20 text-white border-0">
                    {post.postType === 'need' ? 'Need' : 'Offer'}
                  </Badge>
                  <Badge className="bg-white/30 text-white border-0">
                    {getCategoryLabel(post.category)}
                  </Badge>
                </div>
                <p className="text-white/90 text-sm">
                  Posted by {post.user?.name || 'Anonymous'}
                </p>
                <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {post.description}
              </p>
            </div>

            {post.location && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>{post.location}</span>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{post.reactionCount || 0} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{post.offersCount || 0} responses</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Expires: {new Date(post.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isOwner && (
          <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Interested in this {post.postType === 'need' ? 'need' : 'offer'}?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Send a message to connect with the poster
              </p>
              <Button
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    setIsOfferDialogOpen(true);
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg"
                data-testid="button-make-offer"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                {user ? "I'm Interested" : "Login to Respond"}
              </Button>
            </CardContent>
          </Card>
        )}

        {isOwner && (
          <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                This is your post
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage your post from My WytWall
              </p>
              <Button
                onClick={() => navigate('/u/me/wytwall')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg"
                data-testid="button-manage-post"
              >
                <Users className="h-5 w-5 mr-2" />
                Manage in My WytWall
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Express Your Interest
            </DialogTitle>
            <DialogDescription>
              Send a message to let the poster know you're interested
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Hi, I'm interested in your post. I can help with..."
                rows={4}
                className="resize-none"
                data-testid="input-offer-message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOfferDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitOffer}
              disabled={submitOfferMutation.isPending || !offerMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              data-testid="button-submit-offer"
            >
              {submitOfferMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
