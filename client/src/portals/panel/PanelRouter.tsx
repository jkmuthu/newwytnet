import { useState } from 'react';
import { Switch, Route, Redirect } from "wouter";
import PanelLayout from "./PanelLayout";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import AppPurchaseModal from "@/components/marketplace/AppPurchaseModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentHistory from "@/components/payments/PaymentHistory";
import MyNeeds from "./pages/my-needs";
import MyOffers from "./pages/my-offers";
import MyWallet from "./pages/my-wallet";
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
  Calendar
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Tools Used</p>
                <p className="text-2xl font-bold">{(stats as any)?.toolsUsed || 12}</p>
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

// My WytTools - Marketplace where users can browse and purchase tools
function MyPanelWytTools() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseModalTool, setPurchaseModalTool] = useState<any>(null);
  
  // Mock marketplace data - will be replaced with API calls
  const marketplaceTools = [
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
    { id: 'all', label: 'All Tools', count: marketplaceTools.length },
    { id: 'utilities', label: 'Utilities', count: marketplaceTools.filter(t => t.category === 'utilities').length },
    { id: 'ai-tools', label: 'AI Tools', count: marketplaceTools.filter(t => t.category === 'ai-tools').length },
    { id: 'assessment', label: 'Assessment', count: marketplaceTools.filter(t => t.category === 'assessment').length },
    { id: 'design', label: 'Design', count: marketplaceTools.filter(t => t.category === 'design').length },
    { id: 'business', label: 'Business', count: marketplaceTools.filter(t => t.category === 'business').length }
  ];
  
  const filteredTools = marketplaceTools
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
          <h1 className="text-2xl font-bold mb-2">WytTools Marketplace</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse and purchase tools to enhance your workflow</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tools..."
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
              <p className="text-2xl font-bold">{marketplaceTools.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available Tools</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold">{marketplaceTools.filter(t => t.owned).length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Owned Tools</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold">{marketplaceTools.filter(t => t.pricing.some(p => p.type === 'free')).length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Free Tools</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-2xl font-bold">{Math.round(marketplaceTools.reduce((acc, t) => acc + t.rating, 0) / marketplaceTools.length * 10) / 10}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
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
      
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tools found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
      
      {/* Purchase Modal */}
      {purchaseModalTool && (
        <AppPurchaseModal
          app={purchaseModalTool}
          isOpen={!!purchaseModalTool}
          onClose={() => setPurchaseModalTool(null)}
          onPurchaseSuccess={() => {
            // Refresh the tools data
            window.location.reload(); // Simple refresh for now
          }}
        />
      )}
    </div>
  );
}

// My WytApps - Applications Management
function MyPanelWytApps() {
  const myApps = [
    { name: 'Personal Portfolio', status: 'Published', lastModified: '2 days ago', views: 127 },
    { name: 'Business Landing', status: 'Draft', lastModified: '1 week ago', views: 0 },
    { name: 'Event Manager', status: 'In Review', lastModified: '3 days ago', views: 45 },
  ];
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">My WytApps</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage your applications</p>
        </div>
        <Button>
          <AppWindow className="h-4 w-4 mr-2" />
          Create New App
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <AppWindow className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold">{myApps.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Apps</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold">{myApps.filter(app => app.status === 'Published').length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold">{myApps.reduce((sum, app) => sum + app.views, 0)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myApps.map((app, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <AppWindow className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">{app.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Modified: {app.lastModified}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{app.views} views</p>
                    <Badge variant={app.status === 'Published' ? 'default' : 
                                 app.status === 'Draft' ? 'secondary' : 'outline'}>
                      {app.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your profile and account settings</p>
        </div>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{(user as any)?.email?.split('@')[0] || 'User'}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{(user as any)?.email}</p>
                    <Badge variant="outline">Verified</Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{(user as any)?.email?.split('@')[0] || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{(user as any)?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Member Since</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">September 2025</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Plan</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Starter</p>
                  </div>
                </div>
                
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Login Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of new sign-ins</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Enabled
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Enabled
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Marketing Communications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Product updates and offers</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Data Export</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Download your data</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Request Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Connected Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="font-medium">Chrome on Windows</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current session • India</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <h3 className="font-medium">Mobile Safari</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">2 days ago • India</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Revoke
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MyPanelProfile() {
  return <MyPanelAccount />;
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

/**
 * PanelRouter handles WytPanel routes for authenticated users
 * Routes: '/panel/me/*', '/panel/org/:orgId/*'
 */
export default function PanelRouter() {
  return (
    <PanelLayout>
      <Switch>
      {/* Redirect /panel to /panel/me */}
      <Route path="/panel">
        <Redirect to="/panel/me" />
      </Route>

      {/* My Panel routes - Personal dashboard and features */}
      <Route path="/panel/me" component={MyPanelDashboard} />
      <Route path="/panel/me/dashboard" component={MyPanelDashboard} />
      <Route path="/panel/me/profile" component={MyPanelProfile} />
      <Route path="/panel/me/settings" component={MyPanelSettings} />
      <Route path="/panel/me/projects" component={MyPanelProjects} />
      <Route path="/panel/me/wyttools" component={MyPanelWytTools} />
      <Route path="/panel/me/wytapps" component={MyPanelWytApps} />
      <Route path="/panel/me/wallet" component={MyWallet} />
      <Route path="/panel/me/account" component={MyPanelAccount} />
      <Route path="/panel/me/my-needs" component={MyNeeds} />
      <Route path="/panel/me/my-offers" component={MyOffers} />

      {/* Organization Panel routes - Team/organization features */}
      <Route path="/panel/org/:orgId">
        {(params) => <OrgPanelDashboard />}
      </Route>
      <Route path="/panel/org/:orgId/dashboard">
        {(params) => <OrgPanelDashboard />}
      </Route>
      <Route path="/panel/org/:orgId/settings">
        {(params) => <OrgPanelSettings />}
      </Route>
      <Route path="/panel/org/:orgId/members">
        {(params) => <OrgPanelMembers />}
      </Route>
      <Route path="/panel/org/:orgId/projects">
        {(params) => <OrgPanelProjects />}
      </Route>

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