import { useState, useEffect } from 'react';
import { Switch, Route, Redirect, useLocation } from "wouter";
import PanelLayout from "./PanelLayout";
import AppPanelRouter from "./AppPanelRouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AppPurchaseModal from "@/components/marketplace/AppPurchaseModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import WytWallPostForm from "@/components/WytWallPostForm";
import PaymentHistory from "@/components/payments/PaymentHistory";
import MyPosts from "./pages/my-posts";
import PostDetail from "./pages/post-detail";
import MyWallet from "./pages/my-wallet";
import MyPoints from "./pages/my-points";
import MyWytAppsPage from "./pages/my-wytapps";
import WytAppWorkspace from "./pages/wytapp-workspace";
import WytSiteWorkspace from "./pages/wytsite-workspace";
import WytSitePageEditor from "./pages/wytsite-page-editor";
import MyAccount from "./pages/my-account";
import MyProfile from "./pages/my-profile";
import MyOrgsPage from "./pages/my-orgs";
import { Link } from "wouter";
import { 
  LayoutDashboard, 
  Zap, 
  AppWindow, 
  Wallet, 
  Settings, 
  User, 
  Users,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Crown,
  Edit,
  Bell,
  Shield,
  Smartphone,
  Monitor,
  QrCode,
  Bot,
  Briefcase,
  Calendar,
  Package,
  Plus,
  Building,
  FileText,
  MessageSquare,
  Send,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// My Dash - Comprehensive Dashboard
function MyPanelDashboard() {
  const { user } = useAuth();
  
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchOnWindowFocus: false,
  });
  
  const { data: recentActivity } = useQuery({
    queryKey: ['/api/dashboard/activity'],
    refetchOnWindowFocus: false,
  });
  
  const quickActions = [
    { icon: QrCode, label: 'QR Generator', href: '/a/wytqrc', color: 'bg-blue-500' },
    { icon: Bot, label: 'AI Directory', href: '/ai-directory', color: 'bg-green-500' },
    { icon: Briefcase, label: 'WytApps', href: '/wytapps', color: 'bg-purple-500' },
    { icon: CreditCard, label: 'Payments', href: '/payments', color: 'bg-orange-500' },
  ];
  
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {(user as any)?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className="opacity-90">
          Manage your WytNet experience from your personal dashboard
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Apps Used</p>
                <p className="text-2xl font-bold">{(stats as any)?.appsUsed ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded">
                <AppWindow className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Apps Installed</p>
                <p className="text-2xl font-bold">{(stats as any)?.appsInstalled ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded">
                <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">My Orgs</p>
                <p className="text-2xl font-bold">{(stats as any)?.orgsCount ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded">
                <Crown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                <p className="text-sm font-bold">{(stats as any)?.plan || 'Free'}</p>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => window.open(action.href, '_blank')}
              >
                <div className={`p-2 rounded ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {((recentActivity as any)?.data || []).length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Start using WytApps to see activity here</p>
                </div>
              ) : (
                ((recentActivity as any)?.data || []).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-full ${
                        activity.status === 'success' ? 'bg-green-100 dark:bg-green-900' :
                        activity.status === 'info' ? 'bg-blue-100 dark:bg-blue-900' :
                        'bg-gray-100 dark:bg-gray-900'
                      }`}>
                        <CheckCircle className={`h-3 w-3 ${
                          activity.status === 'success' ? 'text-green-600 dark:text-green-400' :
                          activity.status === 'info' ? 'text-blue-600 dark:text-blue-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <span className="text-sm">{activity.action}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Welcome to WytNet!</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Complete your profile to get started</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Account Verified</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Your account is fully activated</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Post Responses List Component - Shows all offers with conversation threads in the dialog
function PostResponsesList({ postId }: { postId: string }) {
  const { toast } = useToast();
  
  const { data: responsesData, isLoading, refetch } = useQuery({
    queryKey: ['/api/wytwall/posts', postId, 'all-responses'],
    queryFn: async () => {
      const res = await fetch(`/api/wytwall/posts/${postId}/all-responses`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch responses');
      return res.json();
    },
  });

  const offers = (responsesData as any)?.offers || [];
  const summary = (responsesData as any)?.summary;

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="font-medium mb-2">No responses yet</h3>
        <p className="text-sm text-muted-foreground">
          When someone makes an offer on this post, you'll see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      {summary && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {summary.pendingCount} pending
          </Badge>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {summary.acceptedCount} accepted
          </Badge>
          <span className="text-sm text-muted-foreground ml-auto">
            {summary.totalResponders} total responder{summary.totalResponders !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Offers List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {offers.map((offer: any) => (
          <Card key={offer.id} className="p-4" data-testid={`response-offer-${offer.id}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={offer.offererProfileImage} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {offer.offererName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium text-sm">{offer.offererName || 'Anonymous'}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(offer.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Badge className={
                offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }>
                {offer.status}
              </Badge>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{offer.message}</p>
            
            {offer.proposedPrice && (
              <Badge variant="outline" className="text-green-700 border-green-300 mb-2">
                Proposed: {offer.proposedPrice}
              </Badge>
            )}

            {offer.messageCount > 0 && (
              <div className="text-xs text-muted-foreground mb-2">
                💬 {offer.messageCount} message{offer.messageCount !== 1 ? 's' : ''} in conversation
              </div>
            )}

            {/* Accept/Reject buttons for pending offers */}
            {offer.status === 'pending' && (
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={async () => {
                    try {
                      await fetch(`/api/wytwall/offers/${offer.id}/respond`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ action: 'accept' })
                      });
                      toast({ title: "Offer accepted!" });
                      refetch();
                    } catch (e) {
                      toast({ title: "Error", variant: "destructive" });
                    }
                  }}
                  data-testid={`button-accept-response-${offer.id}`}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={async () => {
                    try {
                      await fetch(`/api/wytwall/offers/${offer.id}/respond`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ action: 'reject' })
                      });
                      toast({ title: "Offer rejected" });
                      refetch();
                    } catch (e) {
                      toast({ title: "Error", variant: "destructive" });
                    }
                  }}
                  data-testid={`button-reject-response-${offer.id}`}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            )}

            {/* Conversation Thread */}
            <OfferConversation offerId={offer.id} isPostAuthor={true} />
          </Card>
        ))}
      </div>
    </div>
  );
}

// Post Engagement Badge Component - Shows messages/responders count (e.g., "22/7")
function PostEngagementBadge({ postId }: { postId: string }) {
  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['/api/wytwall/posts', postId, 'metrics'],
    queryFn: async () => {
      const res = await fetch(`/api/wytwall/posts/${postId}/metrics`, { credentials: 'include' });
      if (!res.ok) return { metrics: { messages: 0, responders: 0, reactions: 0 } };
      return res.json();
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  const metrics = (metricsData as any)?.metrics;

  if (isLoading) {
    return <span className="text-xs text-gray-400">...</span>;
  }

  if (!metrics || (metrics.messages === 0 && metrics.responders === 0)) {
    return <span className="text-xs text-gray-400">-</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div 
        className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full font-medium cursor-help"
        title={`${metrics.messages} messages from ${metrics.responders} responder${metrics.responders !== 1 ? 's' : ''}`}
      >
        <MessageSquare className="h-3 w-3" />
        <span>{metrics.messages}/{metrics.responders}</span>
      </div>
      {metrics.reactions > 0 && (
        <div className="flex items-center gap-1 text-xs bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 px-2 py-1 rounded-full">
          <span>👍 {metrics.reactions}</span>
        </div>
      )}
    </div>
  );
}

// Responded Post Card Component - Groups all conversations under one post
function RespondedPostCard({
  postId,
  postOwnerName,
  postOwnerProfileImage,
  postDescription,
  postType,
  postCategory,
  postCreatedAt,
  offers,
  hasAccepted,
  getCategoryLabel
}: {
  postId: string;
  postOwnerName: string;
  postOwnerProfileImage?: string;
  postDescription: string;
  postType: string;
  postCategory?: string;
  postCreatedAt: string;
  offers: any[];
  hasAccepted: boolean;
  getCategoryLabel: (cat: string) => string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`responded-post-${postId}`}>
      {/* Collapsible Post Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        data-testid={`toggle-post-${postId}`}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={postOwnerProfileImage} />
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {postOwnerName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 dark:text-white">
                {postOwnerName || 'Anonymous'}
              </span>
              <span className="text-xs text-muted-foreground">
                posted {new Date(postCreatedAt).toLocaleDateString()}
              </span>
              <Badge className={
                postType === 'need' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                  : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
              } variant="secondary">
                {postType === 'need' ? 'Need' : 'Offer'}
              </Badge>
            </div>
            {/* Post Title/Description */}
            <p className="mt-2 text-gray-900 dark:text-white font-medium line-clamp-2">
              {postDescription || 'No description'}
            </p>
            {postCategory && (
              <Badge variant="outline" className="mt-2 text-xs">
                {getCategoryLabel(postCategory)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Conversation count badge */}
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              <MessageSquare className="h-3 w-3 mr-1" />
              {offers.length}
            </Badge>
            {/* Status indicator */}
            {hasAccepted && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                <Check className="h-3 w-3 mr-1" />
                Accepted
              </Badge>
            )}
            {/* Expand/Collapse arrow */}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
      </button>
      
      {/* Collapsible Conversations Section */}
      {isExpanded && (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {offers.map((offer: any, index: number) => (
            <div key={offer.id} className="relative" data-testid={`conversation-${offer.id}`}>
              {/* Timeline connector line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800" />
              
              {/* Your Response */}
              <div className="p-4 pl-12 relative">
                {/* Timeline dot */}
                <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900 shadow-sm z-10" />
                
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Your Response</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </span>
                      <Badge className={`text-xs ${
                        offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                        offer.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                      }`}>
                        {offer.status}
                      </Badge>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                      <p className="text-sm text-gray-800 dark:text-gray-200">{offer.message}</p>
                      {offer.proposedPrice && (
                        <Badge variant="outline" className="mt-2 text-green-700 border-green-300 dark:text-green-400 dark:border-green-700">
                          Proposed: {offer.proposedPrice}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Conversation Thread */}
                <div className="mt-3 ml-0">
                  <OfferConversation offerId={offer.id} isPostAuthor={false} defaultExpanded={index === 0} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// Offer Conversation Thread Component
function OfferConversation({ offerId, isPostAuthor, defaultExpanded = true }: { offerId: string; isPostAuthor: boolean; defaultExpanded?: boolean }) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { data: commentsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/wytwall/offers', offerId, 'comments'],
    queryFn: async () => {
      const res = await fetch(`/api/wytwall/offers/${offerId}/comments`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
    enabled: isExpanded,
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
    <div className="mt-3 border-t pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        data-testid={`toggle-conversation-${offerId}`}
      >
        <MessageSquare className="h-4 w-4" />
        {isExpanded ? 'Hide' : 'View'} Conversation
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading conversation...</div>
          ) : comments.length === 0 ? (
            <div className="text-sm text-muted-foreground p-3 bg-gray-50 dark:bg-gray-800 rounded">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comments.map((comment: any) => (
                <div 
                  key={comment.id} 
                  className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                  data-testid={`comment-${comment.id}`}
                >
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={comment.userProfileImage} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                      {comment.userName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{comment.userName || 'Anonymous'}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                      {comment.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply Input */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              data-testid={`input-reply-${offerId}`}
            />
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              data-testid={`button-send-reply-${offerId}`}
            >
              {isSending ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// My WytWall - Personal Needs/Offers Stream with Tabs
function MyPanelWytWall() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  const [defaultPostType, setDefaultPostType] = useState<"need" | "offer">("need");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [renewDays, setRenewDays] = useState<number>(7);
  const [closeReason, setCloseReason] = useState<string>("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  
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
  
  const { data: postsData, isLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['/api/wytwall/my-posts'],
  });

  // Fetch PUBLIC bucket list items from OTHER users for Matches tab
  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ['/api/bucket-list/public'],
    enabled: activeTab === "matches",
  });

  // Fetch offers received on my posts
  const { data: receivedOffersData, isLoading: receivedLoading, refetch: refetchReceived } = useQuery({
    queryKey: ['/api/wytwall/offers/received'],
    enabled: activeTab === "received",
  });

  // Fetch offers I've sent
  const { data: sentOffersData, isLoading: sentLoading, refetch: refetchSent } = useQuery({
    queryKey: ['/api/wytwall/offers/sent'],
    enabled: activeTab === "sent",
  });

  // Fetch offer summary for badge counts
  const { data: offerSummaryData } = useQuery({
    queryKey: ['/api/wytwall/offers/summary'],
  });

  // Fetch metrics for selected post (to check if it has responses)
  const { data: selectedPostMetrics } = useQuery({
    queryKey: ['/api/wytwall/posts', selectedPost?.id, 'metrics'],
    queryFn: async () => {
      if (!selectedPost?.id) return { metrics: { messages: 0, responders: 0, reactions: 0 } };
      const res = await fetch(`/api/wytwall/posts/${selectedPost.id}/metrics`, { credentials: 'include' });
      if (!res.ok) return { metrics: { messages: 0, responders: 0, reactions: 0 } };
      return res.json();
    },
    enabled: !!selectedPost?.id,
    staleTime: 30000,
  });

  const hasResponses = ((selectedPostMetrics as any)?.metrics?.responders || 0) > 0;

  const posts = (postsData as any)?.posts || [];
  const bucketMatches = (matchesData as any)?.items || [];
  const receivedOffers = (receivedOffersData as any)?.offers || [];
  const sentOffers = (sentOffersData as any)?.offers || [];
  const offerSummary = offerSummaryData as any;

  const handleViewPost = (post: any) => {
    setSelectedPost(post);
    setEditCategory(post.category);
    setEditDescription(post.description);
    setIsEditMode(false);
    setIsViewDialogOpen(true);
  };

  const handleEditPost = async () => {
    if (!selectedPost) return;
    try {
      const response = await fetch(`/api/wytwall/posts/${selectedPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ category: editCategory, description: editDescription }),
      });
      if (response.ok) {
        toast({ title: "Post updated successfully" });
        refetchPosts();
        setIsEditMode(false);
        setIsViewDialogOpen(false);
      } else {
        toast({ title: "Failed to update post", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error updating post", variant: "destructive" });
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    try {
      const response = await fetch(`/api/wytwall/posts/${selectedPost.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        toast({ title: "Post deleted successfully" });
        refetchPosts();
        setIsDeleteDialogOpen(false);
        setIsViewDialogOpen(false);
        setSelectedPost(null);
      } else {
        toast({ title: "Failed to delete post", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error deleting post", variant: "destructive" });
    }
  };

  const handleToggleActive = async (postId: string) => {
    try {
      const response = await fetch(`/api/wytwall/posts/${postId}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        toast({ 
          title: data.message,
          description: data.post.isActive 
            ? "Your post is now visible on WytWall" 
            : "Your post is now hidden from WytWall"
        });
        refetchPosts();
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(data.post);
        }
      } else {
        toast({ title: "Failed to update post status", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error updating post status", variant: "destructive" });
    }
  };

  const handleRenewPost = async () => {
    if (!selectedPost || !renewDays) return;
    try {
      const response = await fetch(`/api/wytwall/posts/${selectedPost.id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ validityDays: renewDays }),
      });
      if (response.ok) {
        const data = await response.json();
        toast({ title: "Success", description: data.message || "Post renewed successfully" });
        refetchPosts();
        setIsRenewDialogOpen(false);
        setIsViewDialogOpen(false);
        setSelectedPost(null);
      } else {
        const errorData = await response.json();
        toast({ title: "Failed to renew post", description: errorData.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error renewing post", variant: "destructive" });
    }
  };

  const handleClosePost = async () => {
    if (!selectedPost || !closeReason) return;
    try {
      const response = await fetch(`/api/wytwall/posts/${selectedPost.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ closedReason: closeReason }),
      });
      if (response.ok) {
        const data = await response.json();
        toast({ title: "Success", description: data.message || "Post closed successfully" });
        refetchPosts();
        setIsCloseDialogOpen(false);
        setIsViewDialogOpen(false);
        setSelectedPost(null);
      } else {
        const errorData = await response.json();
        toast({ title: "Failed to close post", description: errorData.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error closing post", variant: "destructive" });
    }
  };

  const getDaysRemaining = (post: any) => {
    if (!post?.expiresAt) return null;
    const now = new Date();
    const expiresAt = new Date(post.expiresAt);
    const diffTime = expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getEffectiveStatus = (post: any) => {
    const daysRemaining = getDaysRemaining(post);
    if (post?.status === 'closed') return 'closed';
    if (daysRemaining !== null && daysRemaining <= 0) return 'expired';
    return post?.status || 'active';
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

  const getCategoryLabel = (category: string) => {
    const all = [...needCategories, ...offerCategories];
    return all.find(c => c.value === category)?.label || category;
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My WytWall</h1>
              <p className="text-white/90 text-sm">Your personal needs & offers stream</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation - Reorganized: My Posts, Responded, Matches, Add Post */}
      <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts" data-testid="tab-posts">My Posts</TabsTrigger>
          <TabsTrigger value="sent" data-testid="tab-sent">Responded</TabsTrigger>
          <TabsTrigger value="matches" data-testid="tab-matches">Matches</TabsTrigger>
          <TabsTrigger value="add-post" data-testid="tab-add-post">Add Post</TabsTrigger>
        </TabsList>

        {/* Matches Tab Content */}
        <TabsContent value="matches" className="mt-6 space-y-4">
          {matchesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                </Card>
              ))}
            </div>
          ) : bucketMatches.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-12 w-12 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Matches Found</h3>
              <p className="text-muted-foreground mb-4">
                No other users have shared public bucket list items yet. Check back later to discover opportunities!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
                <p className="text-sm text-purple-900 dark:text-purple-100">
                  <strong>WytMatch:</strong> Discover other users' needs and goals - your skills could be their solution!
                </p>
              </div>
              {bucketMatches.map((match: any) => (
                <Card key={match.id} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-purple-500" data-testid={`match-card-${match.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Bucket List Match
                        </Badge>
                        {match.category && <Badge variant="outline">{match.category}</Badge>}
                        {match.isDone && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className={`font-semibold text-lg mb-2 ${match.isDone ? 'line-through text-muted-foreground' : ''}`}>
                        {match.title}
                      </h3>
                      {match.description && (
                        <p className="text-muted-foreground text-sm mb-2">{match.description}</p>
                      )}
                      {match.targetDate && (
                        <div className="text-xs text-muted-foreground">
                          Target: {new Date(match.targetDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="outline" data-testid={`button-connect-${match.id}`}>
                      <Package className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Posts Tab Content - All posts are public, show enable/disable toggle */}
        <TabsContent value="posts" className="mt-6">
          {isLoading ? (
            <Card>
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                ))}
              </div>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">Click "Add Post" to create your first need or offer</p>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Category</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Date</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Eng.</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {posts.map((post: any) => (
                      <tr key={post.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${post.isActive === false ? 'opacity-60' : ''}`} data-testid={`post-row-${post.id}`}>
                        <td className="px-3 py-3">
                          <Badge className={`text-xs ${post.postType === 'need' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                            {post.postType === 'need' ? 'Need' : 'Offer'}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                          <span className="line-clamp-1">{getCategoryLabel(post.category)}</span>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[200px]">
                          <span className="line-clamp-2 break-words">{post.description}</span>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-3 hidden lg:table-cell">
                          {post.isActive !== false ? (
                            <PostEngagementBadge postId={post.id} />
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => handleToggleActive(post.id)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                              post.isActive !== false 
                                ? 'bg-green-500' 
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                            data-testid={`toggle-active-${post.id}`}
                            title={post.isActive !== false ? 'Click to disable' : 'Click to enable'}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                post.isActive !== false ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewPost(post)}
                            data-testid={`button-view-${post.id}`}
                            className="h-8 px-2"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Add Post Tab Content */}
        <TabsContent value="add-post" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Post</CardTitle>
            </CardHeader>
            <CardContent>
              <WytWallPostForm 
                defaultPostType={defaultPostType}
                onSuccess={() => setActiveTab("posts")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responded Tab - Grouped by Post with Collapsible Conversations */}
        <TabsContent value="sent" className="mt-6">
          {sentLoading ? (
            <Card>
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                ))}
              </div>
            </Card>
          ) : sentOffers.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No responses yet</h3>
              <p className="text-muted-foreground mb-4">Posts you've responded to will appear here</p>
              <Button onClick={() => window.location.href = '/wytwall'} data-testid="button-browse-wytwall">
                Browse WytWall
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {Object.keys(sentOffers.reduce((acc: any, o: any) => ({ ...acc, [o.postId]: true }), {})).length} posts
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {sentOffers.length} conversations
                </Badge>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {sentOffers.filter((o: any) => o.status === 'accepted').length} accepted
                </Badge>
              </div>
              
              {/* Group offers by postId and render one card per post */}
              {Object.entries(
                sentOffers.reduce((groups: Record<string, any[]>, offer: any) => {
                  const postId = offer.postId;
                  if (!groups[postId]) groups[postId] = [];
                  groups[postId].push(offer);
                  return groups;
                }, {} as Record<string, any[]>)
              ).map(([postId, offersForPost]: [string, any[]]) => {
                const firstOffer = offersForPost[0];
                const hasAccepted = offersForPost.some((o: any) => o.status === 'accepted');
                
                return (
                  <RespondedPostCard 
                    key={postId}
                    postId={postId}
                    postOwnerName={firstOffer.postOwnerName}
                    postOwnerProfileImage={firstOffer.postOwnerProfileImage}
                    postDescription={firstOffer.postDescription}
                    postType={firstOffer.postType}
                    postCategory={firstOffer.postCategory}
                    postCreatedAt={firstOffer.postCreatedAt || firstOffer.createdAt}
                    offers={offersForPost}
                    hasAccepted={hasAccepted}
                    getCategoryLabel={getCategoryLabel}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View/Edit Post Dialog - Enhanced with Responses Tab */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditMode ? 'Edit Post' : 'Post Details'}
              {selectedPost && (
                <Badge className={selectedPost.postType === 'need' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                  {selectedPost.postType === 'need' ? 'Need' : 'Offer'}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="details" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="details">Post Details</TabsTrigger>
                  <TabsTrigger value="responses" disabled={!selectedPost.isPublic}>
                    Responses
                    {selectedPost.isPublic && <PostEngagementBadge postId={selectedPost.id} />}
                  </TabsTrigger>
                </TabsList>
                
                {/* Post Details Tab */}
                <TabsContent value="details" className="flex-1 overflow-y-auto mt-0">
                  <div className="space-y-4 py-2">
                    {isEditMode ? (
                      <>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={editCategory} onValueChange={setEditCategory}>
                            <SelectTrigger data-testid="select-edit-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {(selectedPost.postType === 'need' ? needCategories : offerCategories).map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            maxLength={200}
                            data-testid="input-edit-description"
                          />
                          <p className="text-xs text-muted-foreground">{editDescription.length}/200 characters</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground text-sm">Category</Label>
                            <p className="font-medium">{getCategoryLabel(selectedPost.category)}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-sm">Status</Label>
                            <div className="mt-1 flex gap-2">
                              <Badge className={selectedPost.isActive !== false ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}>
                                {selectedPost.isActive !== false ? 'Active' : 'Disabled'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Description</Label>
                          <p className="mt-1">{selectedPost.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>Created: {new Date(selectedPost.createdAt).toLocaleDateString()}</div>
                          <div>Expires: {new Date(selectedPost.expiresAt).toLocaleDateString()}</div>
                        </div>
                        
                        {/* Post Visibility Section */}
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">Post Visibility</p>
                              <p className="text-xs text-muted-foreground">
                                {selectedPost.isActive !== false 
                                  ? "Your post is visible on WytWall marketplace" 
                                  : "Your post is hidden from WytWall"}
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              variant={selectedPost.isActive !== false ? "outline" : "default"}
                              onClick={() => handleToggleActive(selectedPost.id)}
                              data-testid="button-toggle-visibility"
                              className={selectedPost.isActive !== false ? "" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"}
                            >
                              {selectedPost.isActive !== false ? "Disable Post" : "Enable Post"}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Post Lifecycle Section */}
                        {getEffectiveStatus(selectedPost) !== 'closed' && (
                          <div className="border-t pt-4 mt-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div>
                                <p className="font-medium text-sm">Post Lifecycle</p>
                                <p className="text-xs text-muted-foreground">
                                  {getEffectiveStatus(selectedPost) === 'expired' 
                                    ? "Your post has expired. Renew to make it visible again." 
                                    : `${getDaysRemaining(selectedPost)} days remaining`}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => { setRenewDays(7); setIsRenewDialogOpen(true); }}
                                  data-testid="button-renew-post"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                  Renew
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => { setCloseReason(""); setIsCloseDialogOpen(true); }}
                                  data-testid="button-close-post"
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Close Post
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Show closed status info */}
                        {getEffectiveStatus(selectedPost) === 'closed' && (
                          <div className="border-t pt-4 mt-4">
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <X className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">This post has been closed</span>
                              </div>
                              {selectedPost.closedReason && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Reason: {CLOSE_REASONS.find(r => r.value === selectedPost.closedReason)?.label || selectedPost.closedReason}
                                </p>
                              )}
                              {selectedPost.closedAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Closed on {new Date(selectedPost.closedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="flex justify-between pt-4 border-t mt-4">
                    {isEditMode ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditMode(false)}>Cancel</Button>
                        <Button onClick={handleEditPost} data-testid="button-save-edit">Save Changes</Button>
                      </>
                    ) : (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => setIsDeleteDialogOpen(true)} 
                                  disabled={hasResponses}
                                  data-testid="button-delete"
                                >
                                  Delete
                                </Button>
                              </div>
                            </TooltipTrigger>
                            {hasResponses && (
                              <TooltipContent>
                                <p>Cannot delete posts with active conversations</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        <Button onClick={() => setIsEditMode(true)} data-testid="button-edit">
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>
                
                {/* Responses Tab - All offers with conversation threads */}
                <TabsContent value="responses" className="flex-1 overflow-y-auto mt-0">
                  <PostResponsesList postId={selectedPost.id} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeletePost} data-testid="button-confirm-delete">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Renew Post Dialog */}
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
              <Select 
                value={renewDays.toString()} 
                onValueChange={(value) => setRenewDays(parseInt(value))}
              >
                <SelectTrigger id="validity">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {VALIDITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPost && (
              <p className="text-sm text-muted-foreground">
                Your post will be visible until {new Date(Date.now() + renewDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleRenewPost}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-renew"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Renew Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Post Dialog */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-orange-600" />
              Close Post
            </DialogTitle>
            <DialogDescription>
              Closing this post will remove it from WytWall. Please select a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Why are you closing this post?</Label>
              <div className="space-y-2">
                {CLOSE_REASONS.map((reason) => (
                  <div
                    key={reason.value}
                    onClick={() => setCloseReason(reason.value)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      closeReason === reason.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    data-testid={`close-reason-${reason.value}`}
                  >
                    <p className="font-medium text-sm">{reason.label}</p>
                    <p className="text-xs text-muted-foreground">{reason.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleClosePost}
              disabled={!closeReason}
              className="bg-orange-600 hover:bg-orange-700"
              data-testid="button-confirm-close"
            >
              <X className="h-4 w-4 mr-1" />
              Close Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// My WytApps Marketplace - where users can browse and purchase apps
function MyPanelMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseModalApp, setPurchaseModalApp] = useState<any>(null);
  
  // Mock marketplace data - will be replaced with API calls
  const marketplaceApps = [
    {
      id: 'qr-generator',
      name: 'QR Generator',
      description: 'Generate QR codes for URLs, text, and more with advanced customization',
      category: 'utilities',
      icon: 'QrCode',
      pricing: [
        { type: 'free', price: 0, usageLimit: 5, label: 'Free - 5 uses' },
        { type: 'pay_per_use', price: 2, usageLimit: 1, label: '₹2 per generation' }
      ],
      features: ['Custom colors', 'Multiple formats', 'Bulk generation'],
      rating: 4.8,
      users: 1247,
      owned: false
    },
    {
      id: 'ai-directory',
      name: 'AI Directory',
      description: 'Curated collection of 500+ AI tools and services',
      category: 'ai-tools',
      icon: 'Bot',
      pricing: [
        { type: 'free', price: 0, usageLimit: null, label: 'Free forever' }
      ],
      features: ['500+ AI tools', 'Regular updates', 'Category filters'],
      rating: 4.9,
      users: 3456,
      owned: true
    },
    {
      id: 'disc-assessment',
      name: 'DISC Assessment',
      description: 'Professional personality assessment with detailed reports',
      category: 'assessment',
      icon: 'Activity',
      pricing: [
        { type: 'one_time', price: 299, usageLimit: null, label: '₹299 one-time' }
      ],
      features: ['Detailed report', 'PDF export', '24/7 access'],
      rating: 4.7,
      users: 892,
      owned: false
    },
    {
      id: 'business-card-designer',
      name: 'Business Card Designer',
      description: 'Create professional business cards with AI assistance',
      category: 'design',
      icon: 'Briefcase',
      pricing: [
        { type: 'monthly', price: 99, usageLimit: null, label: '₹99/month' },
        { type: 'yearly', price: 999, usageLimit: null, label: '₹999/year' }
      ],
      features: ['AI templates', 'Print-ready files', 'Brand consistency'],
      rating: 4.6,
      users: 567,
      owned: false
    },
    {
      id: 'invoice-generator',
      name: 'Invoice Generator',
      description: 'Professional invoicing with payment tracking',
      category: 'business',
      icon: 'CreditCard',
      pricing: [
        { type: 'pay_per_use', price: 5, usageLimit: 1, label: '₹5 per invoice' },
        { type: 'monthly', price: 199, usageLimit: null, label: '₹199/month unlimited' }
      ],
      features: ['Payment tracking', 'Tax compliance', 'Client portal'],
      rating: 4.5,
      users: 234,
      owned: false
    }
  ];
  
  const categories = [
    { id: 'all', label: 'All Apps', count: marketplaceApps.length },
    { id: 'utilities', label: 'Utilities', count: marketplaceApps.filter(t => t.category === 'utilities').length },
    { id: 'ai-tools', label: 'AI Apps', count: marketplaceApps.filter(t => t.category === 'ai-tools').length },
    { id: 'assessment', label: 'Assessment', count: marketplaceApps.filter(t => t.category === 'assessment').length },
    { id: 'design', label: 'Design', count: marketplaceApps.filter(t => t.category === 'design').length },
    { id: 'business', label: 'Business', count: marketplaceApps.filter(t => t.category === 'business').length }
  ];
  
  const filteredApps = marketplaceApps
    .filter(tool => selectedCategory === 'all' || tool.category === selectedCategory)
    .filter(tool => tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   tool.description.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      QrCode, Bot, Activity, Briefcase, CreditCard
    };
    return iconMap[iconName] || QrCode;
  };
  
  const getPricingColor = (type: string) => {
    switch (type) {
      case 'free': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pay_per_use': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'monthly': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'yearly': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'one_time': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">WytApps Marketplace</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse and purchase apps to enhance your workflow</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>
      
      {/* Marketplace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold">{marketplaceApps.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available Apps</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold">{marketplaceApps.filter(t => t.owned).length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Owned Apps</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold">{marketplaceApps.filter(t => t.pricing.some(p => p.type === 'free')).length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Free Apps</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-2xl font-bold">{Math.round(marketplaceApps.reduce((acc, t) => acc + t.rating, 0) / marketplaceApps.length * 10) / 10}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredApps.map((tool) => {
          const IconComponent = getIconComponent(tool.icon);
          const cheapestPrice = tool.pricing.reduce((min, p) => p.price < min.price ? p : min);
          
          return (
            <Card key={tool.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>⭐ {tool.rating}</span>
                        <span>•</span>
                        <span>{tool.users} users</span>
                      </div>
                    </div>
                  </div>
                  {tool.owned && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Owned
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tool.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">FEATURES</p>
                    <div className="flex flex-wrap gap-1">
                      {tool.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">PRICING</p>
                    <div className="space-y-2">
                      {tool.pricing.map((pricing, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <Badge className={getPricingColor(pricing.type)}>
                            {pricing.label}
                          </Badge>
                          {!tool.owned && (
                            <Button 
                              size="sm" 
                              variant={pricing.type === 'free' ? 'outline' : 'default'}
                              className="ml-2"
                              onClick={() => setPurchaseModalApp(tool)}
                            >
                              {pricing.type === 'free' ? 'Get Free' : 'Purchase'}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {tool.owned && (
                  <Button className="w-full mt-4" variant="default">
                    <AppWindow className="h-4 w-4 mr-2" />
                    Open Tool
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredApps.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No apps found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
      
      {/* Purchase Modal */}
      {purchaseModalApp && (
        <AppPurchaseModal
          app={purchaseModalApp}
          isOpen={!!purchaseModalApp}
          onClose={() => setPurchaseModalApp(null)}
          onPurchaseSuccess={() => {
            // Refresh the apps data
            window.location.reload(); // Simple refresh for now
          }}
        />
      )}
    </div>
  );
}

// My WytApps now uses the imported component
const MyPanelWytApps = MyWytAppsPage;

// My Wallet - Payment and Billing
function MyPanelWallet() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Wallet</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage payments, subscriptions, and billing</p>
        </div>
        <Button>
          <CreditCard className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold">₹299</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Plan</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold">23</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Days Left</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold">Starter</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Tier</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="subscription" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Starter Plan</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Perfect for individuals</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Renews on Oct 21, 2025</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">₹299/month</p>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Change Plan
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment-history">
          <PaymentHistory />
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Billing Email</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">user@example.com</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Payment Method</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">•••• •••• •••• 1234</p>
                  </div>
                </div>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Billing Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// My Account - Profile and Settings
function MyPanelAccount() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const { data: profile } = useQuery({
    queryKey: ['/api/account/profile'],
    refetchOnWindowFocus: false,
  });

  const usernameForm = useForm<{ username: string }>({
    defaultValues: { username: '' },
  });

  const passwordForm = useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  // Pre-fill username when profile loads
  useEffect(() => {
    if ((profile as any)?.username) {
      usernameForm.reset({ username: (profile as any).username });
    }
  }, [profile]);

  const updateUsernameMutation = useMutation({
    mutationFn: async (data: { username: string }) => {
      return await apiRequest('PATCH', '/api/account/username', data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Username updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/account/profile'] });
      setIsChangingUsername(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update username', variant: 'destructive' });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest('PATCH', '/api/account/password', data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Password updated successfully' });
      passwordForm.reset();
      setIsChangingPassword(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update password', variant: 'destructive' });
    },
  });

  const onUsernameSubmit = (data: { username: string }) => {
    if (!data.username || data.username.length < 3) {
      toast({ title: 'Error', description: 'Username must be at least 3 characters', variant: 'destructive' });
      return;
    }
    updateUsernameMutation.mutate(data);
  };

  const onPasswordSubmit = (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (data.newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    updatePasswordMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword });
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account credentials and security</p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {/* Username Section */}
        <Card data-testid="card-username">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Username
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isChangingUsername ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current username</p>
                  <p className="text-lg font-medium mt-1" data-testid="text-current-username">
                    {(profile as any)?.username || 'Not set'}
                  </p>
                </div>
                <Button 
                  onClick={() => setIsChangingUsername(true)}
                  variant="outline"
                  data-testid="button-change-username"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Change Username
                </Button>
              </div>
            ) : (
              <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="username" className="text-sm font-medium">New Username</label>
                  <input
                    id="username"
                    type="text"
                    {...usernameForm.register('username')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="Enter new username"
                    data-testid="input-username"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={updateUsernameMutation.isPending}
                    data-testid="button-save-username"
                  >
                    {updateUsernameMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsChangingUsername(false)}
                    data-testid="button-cancel-username"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card data-testid="card-password">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isChangingPassword ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Password</p>
                  <p className="text-lg font-medium mt-1">••••••••</p>
                </div>
                <Button 
                  onClick={() => setIsChangingPassword(true)}
                  variant="outline"
                  data-testid="button-change-password"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            ) : (
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="Enter current password"
                    data-testid="input-current-password"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register('newPassword')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="Enter new password"
                    data-testid="input-new-password"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="Confirm new password"
                    data-testid="input-confirm-password"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={updatePasswordMutation.isPending}
                    data-testid="button-save-password"
                  >
                    {updatePasswordMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      passwordForm.reset();
                      setIsChangingPassword(false);
                    }}
                    data-testid="button-cancel-password"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Email Section - Read Only */}
        <Card data-testid="card-email">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Email Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your email address</p>
              <p className="text-lg font-medium mt-1" data-testid="text-email">{(user as any)?.email}</p>
              <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MyPanelProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/account/profile'],
    refetchOnWindowFocus: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', '/api/account/profile', data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Profile updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/account/profile'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update profile', variant: 'destructive' });
    },
  });

  const profileForm = useForm({
    defaultValues: {
      bio: (profile as any)?.bio || '',
      location: (profile as any)?.location || '',
      website: (profile as any)?.website || '',
      company: (profile as any)?.company || '',
      jobTitle: (profile as any)?.jobTitle || '',
      phone: (profile as any)?.phone || '',
      address: (profile as any)?.address || '',
      city: (profile as any)?.city || '',
      state: (profile as any)?.state || '',
      country: (profile as any)?.country || '',
      zipCode: (profile as any)?.zipCode || '',
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      const p = profile as any;
      profileForm.reset({
        bio: p.bio || '',
        location: p.location || '',
        website: p.website || '',
        company: p.company || '',
        jobTitle: p.jobTitle || '',
        phone: p.phone || '',
        address: p.address || '',
        city: p.city || '',
        state: p.state || '',
        country: p.country || '',
        zipCode: p.zipCode || '',
      });
    }
  }, [profile]);

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Update your detailed profile information</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <p>Loading profile...</p>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={profileForm.handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            {/* Personal Information */}
            <Card data-testid="card-personal-info">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                  <textarea
                    id="bio"
                    {...profileForm.register('bio')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    rows={3}
                    placeholder="Tell us about yourself"
                    data-testid="input-bio"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="text-sm font-medium">Location</label>
                  <input
                    id="location"
                    type="text"
                    {...profileForm.register('location')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="City, Country"
                    data-testid="input-location"
                  />
                </div>
                <div>
                  <label htmlFor="website" className="text-sm font-medium">Website</label>
                  <input
                    id="website"
                    type="url"
                    {...profileForm.register('website')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="https://example.com"
                    data-testid="input-website"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    {...profileForm.register('phone')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="+1 234 567 8900"
                    data-testid="input-phone"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card data-testid="card-professional-info">
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="text-sm font-medium">Company</label>
                  <input
                    id="company"
                    type="text"
                    {...profileForm.register('company')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="Company name"
                    data-testid="input-company"
                  />
                </div>
                <div>
                  <label htmlFor="jobTitle" className="text-sm font-medium">Job Title</label>
                  <input
                    id="jobTitle"
                    type="text"
                    {...profileForm.register('jobTitle')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="Your role"
                    data-testid="input-job-title"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card data-testid="card-address-info">
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="text-sm font-medium">Street Address</label>
                  <input
                    id="address"
                    type="text"
                    {...profileForm.register('address')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="123 Main St"
                    data-testid="input-address"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="text-sm font-medium">City</label>
                  <input
                    id="city"
                    type="text"
                    {...profileForm.register('city')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="City"
                    data-testid="input-city"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="text-sm font-medium">State / Province</label>
                  <input
                    id="state"
                    type="text"
                    {...profileForm.register('state')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="State"
                    data-testid="input-state"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="text-sm font-medium">Country</label>
                  <input
                    id="country"
                    type="text"
                    {...profileForm.register('country')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="Country"
                    data-testid="input-country"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="text-sm font-medium">ZIP / Postal Code</label>
                  <input
                    id="zipCode"
                    type="text"
                    {...profileForm.register('zipCode')}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="12345"
                    data-testid="input-zip-code"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

function MyPanelSettings() {
  return <MyPanelAccount />;
}

function MyPanelProjects() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your personal and team projects</p>
        </div>
        <Button>
          <AppWindow className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No projects yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first project to get started</p>
            <Button>
              <AppWindow className="h-4 w-4 mr-2" />
              Create First Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrgPanelDashboard() {
  const orgname = window.location.pathname.split('/o/')[1]?.split('/')[0] || '';
  
  const { data: orgsData, isLoading } = useQuery({
    queryKey: ['/api/user/organizations'],
  });
  
  const organization = (orgsData as any)?.organizations?.find(
    (org: any) => org.slug === orgname || org.name.toLowerCase().replace(/\s+/g, '-') === orgname
  );

  const { data: membersData } = useQuery({
    queryKey: ['/api/user/organizations', organization?.id, 'members'],
    queryFn: async () => {
      if (!organization?.id) return { members: [] };
      const res = await fetch(`/api/user/organizations/${organization.id}/members`);
      return res.json();
    },
    enabled: !!organization?.id,
  });

  const teamCount = (membersData as any)?.members?.length || 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Organization Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The organization "{orgname}" could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Team Members",
      value: teamCount,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Apps Installed",
      value: 0,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Active Projects",
      value: 0,
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Status",
      value: organization.status === 'active' ? 'Active' : 'Pending',
      icon: Shield,
      color: organization.status === 'active' ? "text-green-600" : "text-yellow-600",
      bgColor: organization.status === 'active' ? "bg-green-100 dark:bg-green-900/30" : "bg-yellow-100 dark:bg-yellow-900/30",
      isText: true,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-white/20 rounded-lg flex items-center justify-center">
            <Building className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{organization.name}</h1>
            <p className="text-white/80">{organization.description || 'Manage your organization workspace'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-1" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                      {stat.isText ? stat.value : (stat.value as number).toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={`/o/${orgname}/team`}>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Team Members
              </Button>
            </Link>
            <Link href={`/o/${orgname}/wytapps`}>
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Browse Apps
              </Button>
            </Link>
            <Link href={`/o/${orgname}/profile`}>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Organization Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Organization Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Type</span>
              <span className="font-medium">{organization.orgType || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Location</span>
              <span className="font-medium">{organization.location || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Email</span>
              <span className="font-medium">{organization.email || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Visibility</span>
              <span className={`font-medium ${organization.isPublic ? 'text-green-600' : 'text-gray-600'}`}>
                {organization.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrgPanelSettings() {
  const [, params] = useLocation();
  const { toast } = useToast();
  const orgname = window.location.pathname.split('/o/')[1]?.split('/')[0] || '';
  
  const { data: orgsData, isLoading } = useQuery({
    queryKey: ['/api/user/organizations'],
  });
  
  const organization = (orgsData as any)?.organizations?.find(
    (org: any) => org.slug === orgname || org.name.toLowerCase().replace(/\s+/g, '-') === orgname
  );
  
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(`/api/user/organizations/${organization?.id}`, 'PUT', data);
      return response;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Organization updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/user/organizations'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update organization", variant: "destructive" });
    },
  });
  
  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      orgType: '',
      businessTypes: [] as string[],
      location: '',
      email: '',
      website: '',
      isPublic: false,
    },
  });
  
  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name || '',
        slug: organization.slug || '',
        description: organization.description || '',
        orgType: organization.orgType || '',
        businessTypes: organization.businessTypes || [],
        location: organization.location || '',
        email: organization.email || '',
        website: organization.website || '',
        isPublic: organization.isPublic || false,
      });
    }
  }, [organization]);
  
  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };
  
  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-pulse">Loading organization settings...</div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!organization) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Organization Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The organization "{orgname}" could not be found or you don't have access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage {organization.name}'s settings and preferences</p>
        </div>
        {organization.isPublic && (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Public at wytnet.com/o/{organization.slug}
          </Badge>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization Name</label>
                <input
                  {...form.register('name')}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Enter organization name"
                  data-testid="input-org-name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">wytnet.com/o/</span>
                  <input
                    {...form.register('slug')}
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                    placeholder="my-organization"
                    data-testid="input-org-slug"
                  />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  {...form.register('description')}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  rows={3}
                  placeholder="Describe your organization"
                  data-testid="input-org-description"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization Type</label>
                <select
                  {...form.register('orgType')}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  data-testid="select-org-type"
                >
                  <option value="">Select type</option>
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="LLP">LLP</option>
                  <option value="Pvt Ltd">Pvt Ltd</option>
                  <option value="Public Ltd">Public Ltd</option>
                  <option value="Trust / NGO">Trust / NGO</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <input
                  {...form.register('location')}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  placeholder="City, Country"
                  data-testid="input-org-location"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  {...form.register('email')}
                  type="email"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  placeholder="contact@organization.com"
                  data-testid="input-org-email"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <input
                  {...form.register('website')}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  placeholder="https://www.organization.com"
                  data-testid="input-org-website"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                  <div>
                    <label className="text-sm font-medium">Public Organization</label>
                    <p className="text-sm text-gray-500">Make your organization page visible at wytnet.com/o/{form.watch('slug')}</p>
                  </div>
                  <input
                    type="checkbox"
                    {...form.register('isPublic')}
                    className="h-5 w-5"
                    data-testid="checkbox-org-public"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Organization</p>
              <p className="text-sm text-gray-500">Permanently delete this organization and all its data</p>
            </div>
            <Button variant="destructive" data-testid="button-delete-org">Delete Organization</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrgPanelMembers() {
  const orgname = window.location.pathname.split('/o/')[1]?.split('/')[0] || '';
  const { toast } = useToast();
  
  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [viewMemberDialogOpen, setViewMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('analyst');
  
  // First get organizations to find the org ID
  const { data: orgsData, isLoading: orgsLoading } = useQuery({
    queryKey: ['/api/user/organizations'],
  });
  
  const organization = (orgsData as any)?.organizations?.find(
    (org: any) => org.slug === orgname || org.name.toLowerCase().replace(/\s+/g, '-') === orgname
  );

  // Then fetch members
  const { data: membersData, isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ['/api/user/organizations', organization?.id, 'members'],
    queryFn: async () => {
      if (!organization?.id) return { members: [], currentUserRole: 'member' };
      const res = await fetch(`/api/user/organizations/${organization.id}/members`);
      return res.json();
    },
    enabled: !!organization?.id,
  });

  const members = (membersData as any)?.members || [];
  const currentUserRole = (membersData as any)?.currentUserRole || 'member';
  const isOwner = (membersData as any)?.isOwner || false;

  // Invite team mutation
  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const res = await fetch(`/api/user/organizations/${organization.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to invite team member');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Invite sent', description: 'Team member has been invited successfully' });
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('analyst');
      refetchMembers();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleInviteTeam = () => {
    if (!inviteEmail) return;
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const handleViewMember = (member: any) => {
    setSelectedMember(member);
    setViewMemberDialogOpen(true);
  };

  if (orgsLoading || membersLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="space-y-2 mt-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Organization Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The organization could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'analyst':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'custom':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Our Team</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage team members, roles and permissions
          </p>
        </div>
        {isOwner && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-invite-team">
                <Users className="h-4 w-4 mr-2" />
                Invite Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Add a new team member to {organization?.name || 'your organization'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="team@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    data-testid="input-invite-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger data-testid="select-invite-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {inviteRole === 'admin' && 'Full access to manage organization and apps'}
                    {inviteRole === 'analyst' && 'View and analyze data across apps'}
                    {inviteRole === 'custom' && 'Custom permissions configured separately'}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleInviteTeam} 
                  disabled={inviteMutation.isPending || !inviteEmail}
                  data-testid="button-send-invite"
                >
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No team members yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Invite team members to collaborate on your organization.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Team Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {members.map((member: any, index: number) => (
                    <tr key={member.userId || index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                            {member.userAvatar ? (
                              <img src={member.userAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              member.userName?.charAt(0)?.toUpperCase() || '?'
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {member.userName || 'Unknown User'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {member.userEmail || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {member.userDisplayId || member.userId?.slice(0, 8) || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(member.role)}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewMember(member)}
                          data-testid={`button-view-member-${member.userId}`}
                        >
                          View
                        </Button>
                        {isOwner && member.role !== 'owner' && (
                          <Button variant="ghost" size="sm" className="text-blue-600" data-testid={`button-edit-member-${member.userId}`}>
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Member Dialog */}
      <Dialog open={viewMemberDialogOpen} onOpenChange={setViewMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Team Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-medium">
                  {selectedMember.userAvatar ? (
                    <img src={selectedMember.userAvatar} alt="" className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    selectedMember.userName?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedMember.userName || 'Unknown User'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedMember.userEmail || ''}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">User ID</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {selectedMember.userDisplayId || selectedMember.userId?.slice(0, 8) || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Role</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(selectedMember.role)}`}>
                    {selectedMember.role}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Joined</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedMember.joinedAt ? new Date(selectedMember.joinedAt).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedMember.isActive !== false ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'}`}>
                    {selectedMember.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewMemberDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrgPanelProjects() {
  return (
    <div className="p-6">
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AppWindow className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Organization Projects
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Create and manage shared projects across your organization with team collaboration.
            </p>
            <Button className="mt-6">
              Create Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder components for missing pages
function MyPanelDuties() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Duties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Duties and responsibilities tracking coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

function MyPanelWytScore() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>My WytScore</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">WytScore metrics and analytics coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

function MyPanelCircle() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Circle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Social circles and connections coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

function MyPanelWytGames() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>My WytGames</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Games and activities coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

function OrgPanelWytWall() {
  const [activeTab, setActiveTab] = useState("posts");
  const [postType, setPostType] = useState<"all" | "need" | "offer">("all");
  const [defaultPostType, setDefaultPostType] = useState<"need" | "offer">("need");
  
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['/api/wytwall/org-posts', postType !== "all" ? postType : undefined],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (postType !== "all") {
        params.set('postType', postType);
      }
      return await fetch(`/api/wytwall/org-posts?${params.toString()}`).then(r => r.json());
    },
  });

  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ['/api/bucket-list/org-public'],
    enabled: activeTab === "matches",
  });

  const posts = (postsData as any)?.posts || [];
  const bucketMatches = (matchesData as any)?.items || [];
  
  const needsCount = posts.filter((p: any) => p.postType === 'need').length;
  const offersCount = posts.filter((p: any) => p.postType === 'offer').length;
  
  const filteredPosts = postType === "all" ? posts : posts.filter((p: any) => p.postType === postType);
  
  return (
    <div className="p-6 space-y-6">
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Our WytWall</h1>
              <p className="text-white/90 text-sm">Organization needs & offers stream</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="matches" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matches" data-testid="tab-org-matches">Matches</TabsTrigger>
          <TabsTrigger value="posts" data-testid="tab-org-posts">Posts</TabsTrigger>
          <TabsTrigger value="add-post" data-testid="tab-org-add-post">Add Post</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="mt-6 space-y-4">
          {matchesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                </Card>
              ))}
            </div>
          ) : bucketMatches.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Matches Found</h3>
              <p className="text-muted-foreground mb-4">
                No matching opportunities found yet. Check back later!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {bucketMatches.map((match: any) => (
                <Card key={match.id} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Match</Badge>
                        {match.category && <Badge variant="outline">{match.category}</Badge>}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{match.title}</h3>
                      {match.description && <p className="text-muted-foreground text-sm">{match.description}</p>}
                    </div>
                    <Button size="sm" variant="outline">Connect</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="mt-6 space-y-4">
          <div className="flex gap-2 mb-4">
            <Button variant={postType === "all" ? "default" : "outline"} onClick={() => setPostType("all")} size="sm">
              All ({posts.length})
            </Button>
            <Button variant={postType === "need" ? "default" : "outline"} onClick={() => setPostType("need")} size="sm">
              Needs ({needsCount})
            </Button>
            <Button variant={postType === "offer" ? "default" : "outline"} onClick={() => setPostType("offer")} size="sm">
              Offers ({offersCount})
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">Start by posting your first organizational {postType === "all" ? "need or offer" : postType}</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post: any) => (
                <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={post.postType === 'need' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}>
                          {post.postType === 'need' ? 'Need' : 'Offer'}
                        </Badge>
                        <Badge variant="outline">{post.category || 'Other'}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">{post.description}</p>
                    </div>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add-post" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Organization Post</CardTitle>
            </CardHeader>
            <CardContent>
              <WytWallPostForm 
                defaultPostType={defaultPostType}
                onSuccess={() => setActiveTab("posts")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrgPanelDuties() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Our Duties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Organization duties and responsibilities tracking coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// HUB PANEL COMPONENTS - /h/:hubname/*
// ============================================================

function HubPanelDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Hub Dashboard</h1>
        <p className="opacity-90">Manage your hub community and content</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded">
                <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                <AppWindow className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Apps</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Posts Today</p>
                <p className="text-2xl font-bold">89</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded">
                <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Growth</p>
                <p className="text-2xl font-bold">+15%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Hub Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Recent hub activity and engagement metrics...</p>
        </CardContent>
      </Card>
    </div>
  );
}

function HubPanelWytWall() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Hub WytWall</h1>
        <p className="text-gray-600 dark:text-gray-400">Community posts and discussions</p>
      </div>
      
      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="add-post">Add Post</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center py-8">
                Hub community posts will appear here...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="matches" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center py-8">
                Member matches based on needs and offers...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add-post" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Hub Post</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Post creation form for hub members...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HubPanelWytApps() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Hub Apps</h1>
        <p className="text-gray-600 dark:text-gray-400">Apps available in this hub</p>
      </div>
      
      <Tabs defaultValue="added" className="w-full">
        <TabsList>
          <TabsTrigger value="added">Added Apps</TabsTrigger>
          <TabsTrigger value="available">Available Apps</TabsTrigger>
        </TabsList>
        
        <TabsContent value="added" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <AppWindow className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold">WytPass</h3>
                <p className="text-sm text-muted-foreground">Authentication</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <LayoutDashboard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold">WytPanel</h3>
                <p className="text-sm text-muted-foreground">Dashboard</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold">WytWall</h3>
                <p className="text-sm text-muted-foreground">Community</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="available" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center py-8">
                Browse and add more apps to this hub...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HubPanelTeam() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Hub Team</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage hub administrators and moderators</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">Hub Owner</p>
                  <p className="text-sm text-muted-foreground">owner@wytnet.com</p>
                </div>
              </div>
              <Badge>Owner</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Admin User</p>
                  <p className="text-sm text-muted-foreground">admin@wytnet.com</p>
                </div>
              </div>
              <Badge variant="secondary">Admin</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HubPanelProfile() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Hub Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure hub settings and branding</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Hub Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Hub Name</label>
              <p className="text-lg mt-1">WytLife Hub</p>
            </div>
            <div>
              <label className="text-sm font-medium">Hub URL</label>
              <p className="text-lg mt-1">wytlife.wytnet.com</p>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="text-muted-foreground mt-1">A community for lifestyle and wellness enthusiasts</p>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <div className="mt-1">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
              </div>
            </div>
          </div>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Hub Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * PanelRouter handles WytPanel routes for authenticated users
 * 
 * NEW URL Structure (/p/*):
 * - /p/                = Dashboard
 * - /p/my/*            = Personal workspace
 * - /p/org/:id/*       = Organization workspace
 * - /p/app/:slug/*     = App workspace (authenticated)
 * 
 * Legacy routes still supported:
 * - /u/:username/*     = User panel
 * - /o/:orgname/*      = Org panel
 * - /h/:hubname/*      = Hub panel
 */
export default function PanelRouter() {
  return (
    <PanelLayout>
      <Switch>
      {/* ============================================ */}
      {/* NEW PANEL ROUTES (/p/*)                     */}
      {/* ============================================ */}
      {/* /p/ - Main dashboard */}
      <Route path="/p" component={MyPanelDashboard} />
      
      {/* /p/my/* - Personal workspace */}
      <Route path="/p/my" component={MyPanelDashboard} />
      <Route path="/p/my/dashboard" component={MyPanelDashboard} />
      <Route path="/p/my/wytwall/:postId" component={PostDetail} />
      <Route path="/p/my/wytwall" component={MyPanelWytWall} />
      <Route path="/p/my/posts" component={MyPosts} />
      <Route path="/p/my/duties" component={MyPanelDuties} />
      <Route path="/p/my/wytscore" component={MyPanelWytScore} />
      <Route path="/p/my/circle" component={MyPanelCircle} />
      <Route path="/p/my/wallet" component={MyWallet} />
      <Route path="/p/my/points" component={MyPoints} />
      <Route path="/p/my/wytapps/:slug" component={WytAppWorkspace} />
      <Route path="/p/my/wytapps" component={MyPanelWytApps} />
      <Route path="/p/app/wytsite/:siteId/edit" component={WytSitePageEditor} />
      <Route path="/p/app/wytsite/:siteId/design" component={WytSitePageEditor} />
      <Route path="/p/app/wytsite/:siteId/settings" component={WytSitePageEditor} />
      <Route path="/p/app/wytsite" component={WytSiteWorkspace} />
      <Route path="/p/my/orgs" component={MyOrgsPage} />
      <Route path="/p/my/wytgames" component={MyPanelWytGames} />
      <Route path="/p/my/profile" component={MyProfile} />
      <Route path="/p/my/settings" component={MyAccount} />
      <Route path="/p/my/account" component={MyAccount} />

      {/* /p/org/:id/* - Organization workspace */}
      <Route path="/p/org" component={OrgPanelDashboard} />
      <Route path="/p/org/:orgId" component={OrgPanelDashboard} />
      <Route path="/p/org/:orgId/dashboard" component={OrgPanelDashboard} />
      <Route path="/p/org/:orgId/wytapps" component={MyPanelWytApps} />
      <Route path="/p/org/:orgId/team" component={OrgPanelMembers} />
      <Route path="/p/org/:orgId/settings" component={OrgPanelSettings} />

      {/* /p/app/:slug/* - App workspace (authenticated) */}
      <Route path="/p/app/:appSlug/:rest*" component={AppPanelRouter} />
      <Route path="/p/app/:appSlug" component={AppPanelRouter} />

      {/* ============================================ */}
      {/* LEGACY PANEL ROUTES (backward compatibility) */}
      {/* ============================================ */}
      {/* User Panel routes - /u/:username/* */}
      <Route path="/u/:username" component={MyPanelDashboard} />
      <Route path="/u/:username/dashboard" component={MyPanelDashboard} />
      <Route path="/u/:username/wytwall/:postId" component={PostDetail} />
      <Route path="/u/:username/wytwall" component={MyPanelWytWall} />
      <Route path="/u/:username/posts" component={MyPosts} />
      <Route path="/u/:username/duties" component={MyPanelDuties} />
      <Route path="/u/:username/wytscore" component={MyPanelWytScore} />
      <Route path="/u/:username/circle" component={MyPanelCircle} />
      <Route path="/u/:username/wallet" component={MyWallet} />
      <Route path="/u/:username/points" component={MyPoints} />
      <Route path="/u/:username/wytapps/:slug" component={WytAppWorkspace} />
      <Route path="/u/:username/wytapps" component={MyPanelWytApps} />
      <Route path="/u/:username/orgs" component={MyOrgsPage} />
      <Route path="/u/:username/wytgames" component={MyPanelWytGames} />
      <Route path="/u/:username/profile" component={MyProfile} />
      <Route path="/u/:username/settings" component={MyAccount} />
      <Route path="/u/:username/account" component={MyAccount} />

      {/* Organization Panel routes - /o/:orgname/* */}
      <Route path="/o/:orgname" component={OrgPanelDashboard} />
      <Route path="/o/:orgname/dashboard" component={OrgPanelDashboard} />
      <Route path="/o/:orgname/wytapps" component={MyPanelWytApps} />
      <Route path="/o/:orgname/team" component={OrgPanelMembers} />
      <Route path="/o/:orgname/settings" component={OrgPanelSettings} />
      <Route path="/o/:orgname/profile" component={OrgPanelSettings} />
      
      {/* Hub Panel routes - /h/:hubname/* */}
      <Route path="/h/:hubname" component={HubPanelDashboard} />
      <Route path="/h/:hubname/dashboard" component={HubPanelDashboard} />
      <Route path="/h/:hubname/wytwall" component={HubPanelWytWall} />
      <Route path="/h/:hubname/wytapps" component={HubPanelWytApps} />
      <Route path="/h/:hubname/team" component={HubPanelTeam} />
      <Route path="/h/:hubname/profile" component={HubPanelProfile} />

      {/* Legacy App Panel route */}
      <Route path="/apppanel/:rest*" component={AppPanelRouter} />

        {/* 404 fallback for panel routes */}
        <Route>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Panel Route Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                The requested panel route does not exist
              </p>
            </div>
          </div>
        </Route>
      </Switch>
    </PanelLayout>
  );
}