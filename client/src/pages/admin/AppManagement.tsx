import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Settings,
  Plus,
  Edit,
  Eye,
  EyeOff,
  IndianRupee,
  Users,
  Activity,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface MarketplaceApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
}

interface AppPricing {
  id: string;
  appId: string;
  pricingType: string;
  price: string;
  currency: string;
  usageLimit: number | null;
  isActive: boolean;
}

interface ExtendedApp extends MarketplaceApp {
  pricing: AppPricing[];
  subscriberCount?: number;
  totalRevenue?: number;
  usageCount?: number;
}

export default function AppManagement() {
  const [selectedApp, setSelectedApp] = useState<ExtendedApp | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for now - will be replaced with real API calls
  const mockApps: ExtendedApp[] = [
    {
      id: '1',
      name: 'QR Generator',
      slug: 'qr-generator',
      description: 'Generate QR codes for URLs, text, and more',
      category: 'utilities',
      icon: 'QrCode',
      isActive: true,
      createdAt: '2025-09-28',
      pricing: [
        { id: '1', appId: '1', pricingType: 'free', price: '0.00', currency: 'INR', usageLimit: 5, isActive: true },
        { id: '2', appId: '1', pricingType: 'pay_per_use', price: '2.00', currency: 'INR', usageLimit: 1, isActive: true }
      ]
    },
    {
      id: '2',
      name: 'AI Directory',
      slug: 'ai-directory',
      description: 'Curated collection of AI tools and services',
      category: 'ai-tools',
      icon: 'Bot',
      isActive: true,
      createdAt: '2025-09-28',
      pricing: [
        { id: '3', appId: '2', pricingType: 'free', price: '0.00', currency: 'INR', usageLimit: null, isActive: true }
      ]
    },
    {
      id: '3',
      name: 'DISC Assessment',
      slug: 'disc-assessment',
      description: 'Professional personality assessment',
      category: 'assessment',
      icon: 'Activity',
      isActive: true,
      createdAt: '2025-09-28',
      pricing: [
        { id: '4', appId: '3', pricingType: 'one_time', price: '299.00', currency: 'INR', usageLimit: null, isActive: true }
      ]
    }
  ];

  const apps = mockApps;
  const isLoading = false;

  const formatPrice = (price: string, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${parseFloat(price).toFixed(2)}`;
  };

  const getPricingTypeColor = (type: string) => {
    switch (type) {
      case 'free': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pay_per_use': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'monthly': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'yearly': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'one_time': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const mockStats = {
    totalApps: apps.length,
    activeApps: apps.filter(t => t.isActive).length,
    totalSubscribers: 156,
    totalRevenue: 45678,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">App Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage marketplace apps, pricing, and availability
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New App
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Apps</p>
                <p className="text-2xl font-bold">{mockStats.totalApps}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Apps</p>
                <p className="text-2xl font-bold">{mockStats.activeApps}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subscribers</p>
                <p className="text-2xl font-bold">{mockStats.totalSubscribers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded">
                <IndianRupee className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold">₹{mockStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="apps">Apps</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="apps">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Apps</CardTitle>
              <CardDescription>
                Manage apps available in the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading apps...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {apps.map((app: ExtendedApp) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{app.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{app.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{app.category}</Badge>
                            <Badge variant={app.isActive ? 'default' : 'secondary'}>
                              {app.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          {app.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Management</CardTitle>
              <CardDescription>
                Configure pricing models for each app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {apps.map((app: ExtendedApp) => (
                  <div key={app.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">{app.name}</h3>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Pricing
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(app.pricing || []).map((pricing: AppPricing) => (
                        <div key={pricing.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getPricingTypeColor(pricing.pricingType)}>
                              {pricing.pricingType.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">{formatPrice(pricing.price, pricing.currency)}</p>
                            {pricing.usageLimit && (
                              <p className="text-sm text-gray-600">{pricing.usageLimit} uses</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  App Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apps.slice(0, 3).map((app: ExtendedApp, index: number) => (
                    <div key={app.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="font-medium">{app.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{45 - index * 8} users</p>
                        <p className="text-sm text-gray-600">₹{(1200 - index * 200).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['utilities', 'ai-tools', 'assessment'].map((category, index) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{category}</span>
                        <span className="text-sm font-medium">₹{(5000 - index * 800).toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${100 - index * 15}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}