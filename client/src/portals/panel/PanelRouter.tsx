import { useState, useEffect } from 'react';
import { Switch, Route, Redirect, useLocation } from "wouter";
import PanelLayout from "./PanelLayout";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WytWallPostForm from "@/components/WytWallPostForm";
import PaymentHistory from "@/components/payments/PaymentHistory";
import MyPosts from "./pages/my-posts";
import MyWallet from "./pages/my-wallet";
import MyPoints from "./pages/my-points";
import MyWytAppsPage from "./pages/my-wytapps";
import MyWytHubs from "./pages/my-wythubs";
import WytAppWorkspace from "./pages/wytapp-workspace";
import MyAccount from "./pages/my-account";
import MyProfile from "./pages/my-profile";
import { 
  LayoutDashboard, 
  Zap, 
  AppWindow, 
  Wallet, 
  Settings, 
  User, 
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
  Plus
} from "lucide-react";

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
    { icon: QrCode, label: 'QR Generator', href: '/qr-generator', color: 'bg-blue-500' },
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
                <p className="text-2xl font-bold">{(stats as any)?.appsUsed || 12}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Apps Created</p>
                <p className="text-2xl font-bold">{(stats as any)?.appsCreated || 3}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Usage</p>
                <p className="text-2xl font-bold">{(stats as any)?.monthlyUsage || 47}%</p>
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
                <p className="text-sm font-bold">{(stats as any)?.plan || 'Starter'}</p>
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
              {((recentActivity as any)?.data || [
                { action: 'Generated QR Code', time: '2 hours ago', status: 'success' },
                { action: 'Created WytApp Project', time: '1 day ago', status: 'success' },
                { action: 'Used AI Directory', time: '2 days ago', status: 'success' },
                { action: 'Updated Profile', time: '3 days ago', status: 'info' },
              ]).map((activity: any, index: number) => (
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
              ))}
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

// My WytWall - Personal Needs/Offers Stream
function MyPanelWytWall() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [postType, setPostType] = useState<"all" | "need" | "offer">("all");
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [defaultPostType, setDefaultPostType] = useState<"need" | "offer">("need");
  
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['/api/wytwall/my-posts', postType !== "all" ? postType : undefined],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (postType !== "all") {
        params.set('postType', postType);
      }
      return await fetch(`/api/wytwall/my-posts?${params.toString()}`).then(r => r.json());
    },
  });

  const posts = (postsData as any)?.posts || [];
  
  const needsCount = posts.filter((p: any) => p.postType === 'need').length;
  const offersCount = posts.filter((p: any) => p.postType === 'offer').length;
  
  const handleOpenPostDialog = (type: "need" | "offer") => {
    setDefaultPostType(type);
    setIsPostDialogOpen(true);
  };

  const filteredPosts = postType === "all" ? posts : posts.filter((p: any) => p.postType === postType);
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">My WytWall</h1>
                <p className="text-white/90 text-sm">Your personal needs & offers stream</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleOpenPostDialog('need')}
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl"
                data-testid="button-post-need"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Need
              </Button>
              <Button 
                onClick={() => handleOpenPostDialog('offer')}
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl"
                data-testid="button-post-offer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Offer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={postType === "all" ? "default" : "outline"}
          onClick={() => setPostType("all")}
          className="rounded-full"
          data-testid="filter-all"
        >
          All Posts ({posts.length})
        </Button>
        <Button
          variant={postType === "need" ? "default" : "outline"}
          onClick={() => setPostType("need")}
          className="rounded-full"
          data-testid="filter-needs"
        >
          Needs ({needsCount})
        </Button>
        <Button
          variant={postType === "offer" ? "default" : "outline"}
          onClick={() => setPostType("offer")}
          className="rounded-full"
          data-testid="filter-offers"
        >
          Offers ({offersCount})
        </Button>
      </div>

      {/* Posts Stream */}
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
          <h3 className="text-lg font-medium mb-2">No {postType === "all" ? "posts" : postType === "need" ? "needs" : "offers"} yet</h3>
          <p className="text-muted-foreground mb-4">Start by posting your first {postType === "all" ? "need or offer" : postType === "need" ? "need" : "offer"}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => handleOpenPostDialog('need')}>
              <Plus className="h-4 w-4 mr-2" />
              Post Need
            </Button>
            <Button onClick={() => handleOpenPostDialog('offer')} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Post Offer
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post: any) => (
            <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow" data-testid={`post-card-${post.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={post.postType === 'need' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                      {post.postType === 'need' ? 'Need' : 'Offer'}
                    </Badge>
                    <Badge variant="outline">{post.category || 'Other'}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">{post.description}</p>
                </div>
                <Button size="sm" variant="outline" data-testid={`button-view-${post.id}`}>View Details</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

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
                              onClick={() => setPurchaseModalTool(tool)}
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
    if (profile?.username) {
      usernameForm.reset({ username: profile.username });
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
                    {profile?.username || 'Not set'}
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
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
      company: profile?.company || '',
      jobTitle: profile?.jobTitle || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      city: profile?.city || '',
      state: profile?.state || '',
      country: profile?.country || '',
      zipCode: profile?.zipCode || '',
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        company: profile.company || '',
        jobTitle: profile.jobTitle || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        zipCode: profile.zipCode || '',
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
  return (
    <div className="p-6">
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Organization Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Manage your organization's workspace, projects, and team members from one centralized dashboard.
            </p>
            <Button className="mt-6">
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrgPanelSettings() {
  return (
    <div className="p-6">
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Organization Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Configure your organization's preferences, branding, and access controls.
            </p>
            <Button className="mt-6">
              Configure Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrgPanelMembers() {
  return (
    <div className="p-6">
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Organization Members
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Invite team members, manage roles and permissions, and collaborate effectively.
            </p>
            <Button className="mt-6">
              Invite Members
            </Button>
          </div>
        </CardContent>
      </Card>
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

const MyPanelWytHubs = MyWytHubs;

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

/**
 * PanelRouter handles WytPanel routes for authenticated users
 * Routes: '/mypanel/*', '/orgpanel/*'
 */
export default function PanelRouter() {
  return (
    <PanelLayout>
      <Switch>
      {/* Redirect old routes to new structure */}
      <Route path="/panel">
        <Redirect to="/mypanel" />
      </Route>
      <Route path="/panel/me/:rest*">
        {(params) => <Redirect to={`/mypanel/${params.rest || ''}`} />}
      </Route>
      <Route path="/panel/org/:rest*">
        {(params) => <Redirect to={`/orgpanel/${params.rest || ''}`} />}
      </Route>
      <Route path="/panel/org">
        <Redirect to="/orgpanel" />
      </Route>

      {/* My Panel routes - Personal dashboard and features */}
      <Route path="/mypanel" component={MyPanelDashboard} />
      <Route path="/mypanel/dashboard" component={MyPanelDashboard} />
      <Route path="/mypanel/wytwall" component={MyPanelWytWall} />
      <Route path="/mypanel/posts" component={MyPosts} />
      <Route path="/mypanel/duties" component={MyPanelDuties} />
      <Route path="/mypanel/wytscore" component={MyPanelWytScore} />
      <Route path="/mypanel/circle" component={MyPanelCircle} />
      <Route path="/mypanel/wallet" component={MyWallet} />
      <Route path="/mypanel/points" component={MyPoints} />
      <Route path="/mypanel/wytapps/:slug" component={WytAppWorkspace} />
      <Route path="/mypanel/wytapps" component={MyPanelWytApps} />
      <Route path="/mypanel/wythubs" component={MyPanelWytHubs} />
      <Route path="/mypanel/wytgames" component={MyPanelWytGames} />
      <Route path="/mypanel/profile" component={MyProfile} />
      <Route path="/mypanel/account" component={MyAccount} />

      {/* Organization Panel routes - Team/organization features */}
      <Route path="/orgpanel" component={OrgPanelDashboard} />
      <Route path="/orgpanel/dashboard" component={OrgPanelDashboard} />
      <Route path="/orgpanel/wytwall" component={OrgPanelDashboard} />
      <Route path="/orgpanel/posts" component={MyPosts} />
      <Route path="/orgpanel/duties" component={OrgPanelDuties} />
      <Route path="/orgpanel/wytapps" component={MyPanelWytApps} />
      <Route path="/orgpanel/wallet" component={MyWallet} />
      <Route path="/orgpanel/team" component={OrgPanelMembers} />
      <Route path="/orgpanel/profile" component={OrgPanelSettings} />
      <Route path="/orgpanel/account" component={OrgPanelSettings} />

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