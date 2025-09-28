import { Switch, Route, Redirect } from "wouter";
import PanelLayout from "./PanelLayout";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentHistory from "@/components/payments/PaymentHistory";
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

// My WytTools - Tools Management
function MyPanelWytTools() {
  const toolsUsage = [
    { name: 'QR Generator', usage: 24, lastUsed: '2 hours ago', category: 'Utilities', active: true },
    { name: 'AI Directory', usage: 18, lastUsed: '1 day ago', category: 'AI Tools', active: true },
    { name: 'DISC Assessment', usage: 7, lastUsed: '3 days ago', category: 'Assessment', active: true },
    { name: 'Business Card Designer', usage: 0, lastUsed: 'Never', category: 'Design', active: false },
  ];
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">My WytTools</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your tools usage and preferences</p>
        </div>
        <Button>
          <QrCode className="h-4 w-4 mr-2" />
          Explore Tools
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold">{toolsUsage.filter(t => t.active).length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Tools</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold">{toolsUsage.reduce((sum, tool) => sum + tool.usage, 0)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Usage</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold">QR Gen</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Most Used</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tools Usage Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {toolsUsage.map((tool, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tool.active ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-900'
                  }`}>
                    <QrCode className={`h-5 w-5 ${
                      tool.active ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tool.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{tool.usage} uses</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last: {tool.lastUsed}</p>
                  </div>
                  <Badge variant={tool.active ? 'default' : 'secondary'}>
                    {tool.active ? 'Active' : 'Coming Soon'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          My Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Personal settings will be implemented here
        </p>
      </div>
    </div>
  );
}

function MyPanelProjects() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          My Projects
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Personal projects management will be implemented here
        </p>
      </div>
    </div>
  );
}

function OrgPanelDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Organization Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Organization dashboard will be implemented here
        </p>
      </div>
    </div>
  );
}

function OrgPanelSettings() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Organization Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Organization settings will be implemented here
        </p>
      </div>
    </div>
  );
}

function OrgPanelMembers() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Organization Members
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Member management will be implemented here
        </p>
      </div>
    </div>
  );
}

function OrgPanelProjects() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Organization Projects
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Organization projects will be implemented here
        </p>
      </div>
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
      <Route path="/panel/me/wallet" component={MyPanelWallet} />
      <Route path="/panel/me/account" component={MyPanelAccount} />

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