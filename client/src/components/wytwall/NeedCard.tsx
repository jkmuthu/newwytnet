import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Clock, DollarSign, MessageSquare, Star, ChevronDown, ChevronUp, Users, ThumbsUp, Send, MessageCircle, Loader2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface NeedCardProps {
  need: any;
  isAuthenticated: boolean;
  currentUserId?: string;
  onMakeOffer?: (need: any) => void;
  onViewResponses?: (need: any) => void;
  onLogin?: () => void;
  isCollapsed?: boolean;
}

export default function NeedCard({ need, isAuthenticated, currentUserId, onMakeOffer, onViewResponses, onLogin, isCollapsed = false }: NeedCardProps) {
  const [expanded, setExpanded] = useState(!isCollapsed);
  const [showConversation, setShowConversation] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationData, setConversationData] = useState<any>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const { toast } = useToast();
  
  // Reaction state (only for wytwall posts with isWytWallPost flag)
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(need.reactionCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  
  // Existing offer state - check if user already made an offer on this post
  const [hasExistingOffer, setHasExistingOffer] = useState(false);
  const [existingOfferId, setExistingOfferId] = useState<string | null>(null);
  const [checkingOffer, setCheckingOffer] = useState(false);
  
  const isWytWallPost = need.isWytWallPost === true;
  
  // Check if current user is the post owner
  const isOwner = currentUserId && need.userId && String(currentUserId) === String(need.userId);
  
  // Fetch initial reaction state for wytwall posts
  useEffect(() => {
    if (isWytWallPost && isAuthenticated) {
      fetch(`/api/wytwall/posts/${need.id}/reactions`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLiked(data.userReacted);
            setLikeCount(data.reactionCount);
          }
        })
        .catch(console.error);
    }
  }, [need.id, isWytWallPost, isAuthenticated]);
  
  // Check if user already has an offer on this post
  useEffect(() => {
    if (isWytWallPost && isAuthenticated && currentUserId && !isOwner) {
      setCheckingOffer(true);
      fetch(`/api/wytwall/posts/${need.id}/my-offer`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.offer) {
            setHasExistingOffer(true);
            setExistingOfferId(data.offer.id);
          }
        })
        .catch(console.error)
        .finally(() => setCheckingOffer(false));
    }
  }, [need.id, isWytWallPost, isAuthenticated, currentUserId, isOwner]);

  // Fetch conversation when expanded
  useEffect(() => {
    if (showConversation && existingOfferId && isAuthenticated) {
      loadConversation();
    }
  }, [showConversation, existingOfferId]);

  const loadConversation = async () => {
    if (!existingOfferId) return;
    setLoadingConversation(true);
    try {
      const res = await fetch(`/api/wytwall/offers/${existingOfferId}/comments`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversationData(data);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      onLogin?.();
      return;
    }
    
    if (!isWytWallPost || isLiking) return;
    
    setIsLiking(true);
    try {
      const res = await fetch(`/api/wytwall/posts/${need.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reactionType: 'like' }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setLiked(data.userReacted);
        setLikeCount(data.reactionCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };
  
  const categoryColors: Record<string, string> = {
    jobs: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    real_estate: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    b2b_supply: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    service: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const handleInterestClick = () => {
    if (!isAuthenticated) {
      onLogin?.();
      return;
    }
    
    if (isOwner) {
      // Post owner wants to view all responses - this opens panel view
      onViewResponses?.(need);
    } else {
      // Toggle inline conversation view
      setShowConversation(!showConversation);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;
    
    setIsSending(true);
    try {
      if (hasExistingOffer && existingOfferId) {
        // Add comment to existing offer
        const res = await fetch(`/api/wytwall/offers/${existingOfferId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ message: message.trim() }),
        });
        
        if (res.ok) {
          setMessage("");
          loadConversation();
          toast({ title: "Message sent!" });
        } else {
          toast({ title: "Failed to send message", variant: "destructive" });
        }
      } else {
        // Create new offer with first message
        const res = await fetch('/api/wytwall/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            postId: need.id, 
            message: message.trim() 
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setMessage("");
          setHasExistingOffer(true);
          setExistingOfferId(data.offer.id);
          toast({ title: "Your interest has been sent!" });
          // Load conversation after creating offer
          setTimeout(() => loadConversation(), 500);
        } else {
          const errData = await res.json();
          toast({ title: errData.error || "Failed to send message", variant: "destructive" });
        }
      }
    } catch (error) {
      toast({ title: "Error sending message", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const comments = conversationData?.comments || [];

  return (
    <Card className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden rounded-xl sm:rounded-2xl" data-testid={`need-card-${need.id}`}>
      <div className="absolute top-0 left-0 w-full h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardHeader className={`px-3 sm:px-6 py-3 sm:py-4 ${expanded ? 'pb-2 sm:pb-3' : 'pb-2'}`}>
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {expanded && (
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-400 transition-all flex-shrink-0">
                <AvatarImage src={need.user?.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold text-xs sm:text-sm">
                  {need.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-gray-900 dark:text-white ${expanded ? 'text-sm sm:text-base' : 'text-sm'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 sm:truncate`}>
                {need.title}
              </h3>
              {expanded && (
                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  <span className="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                    {need.user?.name || "Anonymous"}
                  </span>
                  <span className="text-[11px] sm:text-xs text-gray-400 hidden sm:inline">•</span>
                  <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 hidden sm:flex">
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {formatDistanceToNow(new Date(need.createdAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 font-semibold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5">
              Need
            </Badge>
            <Badge className={`${categoryColors[need.category] || categoryColors.other} font-semibold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5`}>
              {need.category.replace('_', ' ')}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 touch-manipulation"
              data-testid={`button-expand-${need.id}`}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4 pt-0">
            <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {need.description}
            </p>
            
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3">
              {need.location && (
                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                  <MapPin className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">{need.location}</span>
                </div>
              )}
              {need.budget && (
                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                  <DollarSign className="h-3 w-3 text-green-500" />
                  <span className="font-medium">{need.currency} {need.budget}</span>
                </div>
              )}
              {need.isSponsored && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-[10px] sm:text-xs">
                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 fill-yellow-400" />
                  Sponsored
                </Badge>
              )}
            </div>
          </CardContent>

          <CardFooter className="px-3 sm:px-6 border-t border-gray-200 dark:border-gray-700 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-800/50 flex-col">
            {/* Social Action Bar */}
            <div className="w-full flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
              <div className="flex items-center gap-4">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  disabled={isLiking || !isWytWallPost}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                    liked 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  } ${!isWytWallPost ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  data-testid={`button-like-${need.id}`}
                >
                  <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-blue-600 dark:fill-blue-400' : ''}`} />
                  <span>{likeCount > 0 ? likeCount : ''}</span>
                  <span className="hidden sm:inline">{liked ? 'Liked' : 'Like'}</span>
                </button>
                
                {/* Response Count */}
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{need.responseCount || need.offersCount || 0}</span>
                  <span className="hidden sm:inline">response{(need.responseCount || need.offersCount) !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            
            {/* I'm Interested Button */}
            <div className="w-full">
              <Button
                onClick={handleInterestClick}
                className={`w-full font-semibold text-xs sm:text-sm h-9 sm:h-10 ${
                  isOwner
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
                    : showConversation
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      : hasExistingOffer
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
                        : isAuthenticated
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                disabled={checkingOffer || (!isAuthenticated && !onLogin)}
                data-testid={`button-interested-${need.id}`}
              >
                {isOwner ? (
                  <>
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    View Responses
                  </>
                ) : showConversation ? (
                  <>
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Close
                  </>
                ) : hasExistingOffer ? (
                  <>
                    <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Continue Chat
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    {isAuthenticated ? "I'm Interested" : "Login to Respond"}
                  </>
                )}
              </Button>
            </div>

            {/* Inline Conversation Area - Facebook style */}
            {showConversation && !isOwner && (
              <div className="w-full mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                {/* Existing Conversation Thread */}
                {loadingConversation ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Loading conversation...</span>
                  </div>
                ) : comments.length > 0 ? (
                  <div className="max-h-[200px] overflow-y-auto space-y-2 mb-3 pr-1">
                    {comments.map((comment: any) => (
                      <div
                        key={comment.id}
                        className={`p-2.5 rounded-lg ${
                          comment.isFromPostAuthor
                            ? 'bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500 ml-4'
                            : 'bg-gray-100 dark:bg-gray-700/50 mr-4'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={comment.user?.profileImageUrl} />
                            <AvatarFallback className="text-[9px] bg-blue-100 text-blue-700">
                              {comment.user?.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {comment.user?.name || 'Anonymous'}
                          </span>
                          {comment.isFromPostAuthor && (
                            <Badge className="text-[9px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200">
                              Owner
                            </Badge>
                          )}
                          <span className="text-[10px] text-gray-400 ml-auto">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 pl-7">{comment.message}</p>
                      </div>
                    ))}
                  </div>
                ) : hasExistingOffer ? (
                  <p className="text-xs text-gray-500 text-center py-2 mb-2">
                    Your interest was sent. Waiting for response...
                  </p>
                ) : null}

                {/* Message Input */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder={hasExistingOffer ? "Add a message..." : "Hi, I'm interested in your post. I can help with..."}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 text-sm min-h-[60px] max-h-[100px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    data-testid={`input-message-${need.id}`}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isSending}
                    className="bg-blue-600 hover:bg-blue-700 h-auto px-3"
                    data-testid={`button-send-${need.id}`}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
