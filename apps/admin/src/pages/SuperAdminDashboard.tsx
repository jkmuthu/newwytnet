import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Building2, 
  Layers, 
  Activity, 
  Settings, 
  Shield, 
  TrendingUp, 
  Clock,
  Database,
  Monitor,
  RefreshCw,
  UserCheck,
  AlertTriangle,
  Link,
  Ban,
  CheckCircle,
  XCircle,
  Key,
  Eye,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Plug,
  CreditCard,
  Save,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import MobileAdminLayout from '@/components/admin/MobileAdminLayout';
import { MobileAdminCard, QuickActionCard } from '@/components/admin/MobileAdminCard';
import DevAuthButton from '@/components/admin/DevAuthButton';

interface DashboardData {
  statistics: {
    totalUsers: number;
    totalTenants: number;
    totalApps: number;
    totalHubs: number;
    platformModules: number;
  };
  platformModules: Array<{
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
    category: string;
    version: string;
  }>;
  recentActivity: Array<{
    id: string;
    name: string;
    email: string;
    joinedAt: string;
    role: string;
    type: string;
  }>;
  systemMetrics: {
    uptime: number;
    memoryUsage: any;
    cpuLoad: number;
    activeConnections: number;
    timestamp: string;
  };
}

interface SocialAuthData {
  statistics: {
    totalSocialUsers: number;
    pendingVerifications: number;
    linkedAccounts: number;
    blockedProviders: number;
  };
  providers: Array<{
    provider: string;
    name: string;
    enabled: boolean;
    userCount: number;
    lastActivity: string;
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    socialProviders: string[];
    isVerified: boolean;
    whatsappNumber: string;
    lastLogin: string;
    status: 'verified' | 'pending' | 'suspended';
  }>;
  auditLog: Array<{
    id: string;
    userId: string;
    action: string;
    provider: string;
    timestamp: string;
    details: string;
  }>;
}

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isMobile } = useDeviceDetection();
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // API Integrations state
  const [authSettings, setAuthSettings] = useState({
    google: { clientId: '', clientSecret: '' },
    facebook: { appId: '', appSecret: '' },
    linkedin: { clientId: '', clientSecret: '' },
    whatsapp: { token: '', phoneId: '' },
    sms: { twilioSid: '', twilioToken: '' }
  });
  
  const [paymentSettings, setPaymentSettings] = useState({
    razorpay: { keyId: '', keySecret: '' },
    gpay: { merchantId: '', apiKey: '' },
    bhim: { merchantId: '', apiKey: '' }
  });

  // Load dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery<{
    success: boolean;
    dashboard: DashboardData;
  }>({
    queryKey: ['/api/admin/dashboard'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Load users data
  const { data: usersData, isLoading: usersLoading } = useQuery<{
    success: boolean;
    users: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
      lastLoginAt: string;
      tenantId: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>({
    queryKey: ['/api/admin/users'],
    enabled: selectedTab === 'users',
  });

  // Load tenants data
  const { data: tenantsData, isLoading: tenantsLoading } = useQuery<{
    success: boolean;
    tenants: Array<{
      id: string;
      name: string;
      slug: string;
      status: string;
      createdAt: string;
      settings: any;
    }>;
  }>({
    queryKey: ['/api/admin/tenants'],
    enabled: selectedTab === 'tenants',
  });

  // Load social auth data
  const { data: socialAuthData, isLoading: socialAuthLoading } = useQuery<{
    success: boolean;
    socialAuth: SocialAuthData;
  }>({
    queryKey: ['/api/admin/social-auth'],
    enabled: selectedTab === 'social-auth',
    refetchInterval: 60000, // Refresh every minute for security monitoring
  });
  
  // Load API integrations data
  const { data: apiIntegrationsData, isLoading: apiIntegrationsLoading } = useQuery<{
    success: boolean;
    data: Array<any>;
  }>({
    queryKey: ['/api/admin/api-integrations'],
    enabled: selectedTab === 'api-integrations',
  });

  // Platform module toggle mutation
  const toggleModuleMutation = useMutation({
    mutationFn: async ({ moduleId, enabled }: { moduleId: string; enabled: boolean }) => {
      return await fetch(`/api/platform-modules/${moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: enabled }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      toast({ title: 'Platform module updated successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error updating platform module',
        description: 'Please try again later',
        variant: 'destructive'
      });
    },
  });

  // Social auth provider toggle mutation
  const toggleSocialProviderMutation = useMutation({
    mutationFn: async ({ provider, enabled }: { provider: string; enabled: boolean }) => {
      return await fetch(`/api/admin/social-auth/provider/${provider}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/social-auth'] });
      toast({ title: 'Social provider updated successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error updating social provider',
        description: 'Please try again later',
        variant: 'destructive'
      });
    },
  });

  // Unlink social account mutation
  const unlinkSocialAccountMutation = useMutation({
    mutationFn: async ({ userId, provider }: { userId: string; provider: string }) => {
      return await fetch(`/api/admin/social-auth/unlink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, provider }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/social-auth'] });
      toast({ title: 'Social account unlinked successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error unlinking social account',
        description: 'Please try again later',
        variant: 'destructive'
      });
    },
  });
  
  // Save API integrations mutations
  const saveAuthSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const integrations = [
        {
          provider: 'google_auth',
          credentials: { clientId: settings.google.clientId, clientSecret: settings.google.clientSecret },
          isEnabled: !!(settings.google.clientId && settings.google.clientSecret)
        },
        {
          provider: 'facebook_auth',
          credentials: { appId: settings.facebook.appId, appSecret: settings.facebook.appSecret },
          isEnabled: !!(settings.facebook.appId && settings.facebook.appSecret)
        },
        {
          provider: 'linkedin_auth',
          credentials: { clientId: settings.linkedin.clientId, clientSecret: settings.linkedin.clientSecret },
          isEnabled: !!(settings.linkedin.clientId && settings.linkedin.clientSecret)
        },
        {
          provider: 'whatsapp_auth',
          credentials: { token: settings.whatsapp.token, phoneId: settings.whatsapp.phoneId },
          isEnabled: !!(settings.whatsapp.token && settings.whatsapp.phoneId)
        },
        {
          provider: 'sms_otp',
          credentials: { twilioSid: settings.sms.twilioSid, twilioToken: settings.sms.twilioToken },
          isEnabled: !!(settings.sms.twilioSid && settings.sms.twilioToken)
        }
      ];
      
      return await fetch('/api/admin/api-integrations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrations }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-integrations'] });
      toast({ title: 'Authentication settings saved successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error saving authentication settings',
        description: 'Please try again later',
        variant: 'destructive'
      });
    },
  });
  
  const savePaymentSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const integrations = [
        {
          provider: 'razorpay',
          credentials: { keyId: settings.razorpay.keyId, keySecret: settings.razorpay.keySecret },
          isEnabled: !!(settings.razorpay.keyId && settings.razorpay.keySecret)
        },
        {
          provider: 'gpay_direct',
          credentials: { merchantId: settings.gpay.merchantId, apiKey: settings.gpay.apiKey },
          isEnabled: !!(settings.gpay.merchantId && settings.gpay.apiKey)
        },
        {
          provider: 'bhim_direct',
          credentials: { merchantId: settings.bhim.merchantId, apiKey: settings.bhim.apiKey },
          isEnabled: !!(settings.bhim.merchantId && settings.bhim.apiKey)
        }
      ];
      
      return await fetch('/api/admin/api-integrations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrations }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-integrations'] });
      toast({ title: 'Payment settings saved successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error saving payment settings',
        description: 'Please try again later',
        variant: 'destructive'
      });
    },
  });

  const handleModuleToggle = (moduleId: string, enabled: boolean) => {
    toggleModuleMutation.mutate({ moduleId, enabled });
  };
  
  // Load existing API integrations data
  useEffect(() => {
    if (apiIntegrationsData?.data) {
      const integrations = apiIntegrationsData.data;
      
      // Parse existing settings
      integrations.forEach((integration: any) => {
        const { provider, credentials } = integration;
        
        switch (provider) {
          case 'google_auth':
            setAuthSettings(prev => ({
              ...prev,
              google: {
                clientId: credentials.clientId === '***configured***' ? '' : credentials.clientId || '',
                clientSecret: credentials.clientSecret === '***configured***' ? '' : credentials.clientSecret || ''
              }
            }));
            break;
          case 'facebook_auth':
            setAuthSettings(prev => ({
              ...prev,
              facebook: {
                appId: credentials.appId === '***configured***' ? '' : credentials.appId || '',
                appSecret: credentials.appSecret === '***configured***' ? '' : credentials.appSecret || ''
              }
            }));
            break;
          case 'linkedin_auth':
            setAuthSettings(prev => ({
              ...prev,
              linkedin: {
                clientId: credentials.clientId === '***configured***' ? '' : credentials.clientId || '',
                clientSecret: credentials.clientSecret === '***configured***' ? '' : credentials.clientSecret || ''
              }
            }));
            break;
          case 'whatsapp_auth':
            setAuthSettings(prev => ({
              ...prev,
              whatsapp: {
                token: credentials.token === '***configured***' ? '' : credentials.token || '',
                phoneId: credentials.phoneId === '***configured***' ? '' : credentials.phoneId || ''
              }
            }));
            break;
          case 'sms_otp':
            setAuthSettings(prev => ({
              ...prev,
              sms: {
                twilioSid: credentials.twilioSid === '***configured***' ? '' : credentials.twilioSid || '',
                twilioToken: credentials.twilioToken === '***configured***' ? '' : credentials.twilioToken || ''
              }
            }));
            break;
          case 'razorpay':
            setPaymentSettings(prev => ({
              ...prev,
              razorpay: {
                keyId: credentials.keyId === '***configured***' ? '' : credentials.keyId || '',
                keySecret: credentials.keySecret === '***configured***' ? '' : credentials.keySecret || ''
              }
            }));
            break;
          case 'gpay_direct':
            setPaymentSettings(prev => ({
              ...prev,
              gpay: {
                merchantId: credentials.merchantId === '***configured***' ? '' : credentials.merchantId || '',
                apiKey: credentials.apiKey === '***configured***' ? '' : credentials.apiKey || ''
              }
            }));
            break;
          case 'bhim_direct':
            setPaymentSettings(prev => ({
              ...prev,
              bhim: {
                merchantId: credentials.merchantId === '***configured***' ? '' : credentials.merchantId || '',
                apiKey: credentials.apiKey === '***configured***' ? '' : credentials.apiKey || ''
              }
            }));
            break;
        }
      });
    }
  }, [apiIntegrationsData]);
  
  const handleSaveAuthSettings = () => {
    saveAuthSettingsMutation.mutate(authSettings);
  };
  
  const handleSavePaymentSettings = () => {
    savePaymentSettingsMutation.mutate(paymentSettings);
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemoryUsage = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)} MB`;
  };

  if (dashboardError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied: Super Admin privileges required to view this dashboard.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <DevAuthButton />
        </div>
      </div>
    );
  }

  if (dashboardLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading Super Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  const dashboard = dashboardData?.dashboard;

  return (
    <div className="container mx-auto p-6 max-w-7xl" data-testid="admin-dashboard">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="dashboard-title">
            <Shield className="h-8 w-8 text-blue-600" />
            WytNet Super Admin
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete system administration and control panel
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Activity className="h-3 w-3 mr-1" />
          System Online
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-fit lg:grid-cols-6">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="tenants" data-testid="tab-tenants">
            <Building2 className="h-4 w-4 mr-2" />
            Tenants
          </TabsTrigger>
          <TabsTrigger value="modules" data-testid="tab-modules">
            <Layers className="h-4 w-4 mr-2" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="social-auth" data-testid="tab-social-auth">
            <Link className="h-4 w-4 mr-2" />
            Social Auth
          </TabsTrigger>
          <TabsTrigger value="api-integrations" data-testid="tab-api-integrations">
            <Plug className="h-4 w-4 mr-2" />
            API Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card data-testid="stat-users">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard?.statistics.totalUsers || 0}</div>
              </CardContent>
            </Card>

            <Card data-testid="stat-tenants">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tenants</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard?.statistics.totalTenants || 0}</div>
              </CardContent>
            </Card>

            <Card data-testid="stat-apps">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Apps</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard?.statistics.totalApps || 0}</div>
              </CardContent>
            </Card>

            <Card data-testid="stat-hubs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hubs</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard?.statistics.totalHubs || 0}</div>
              </CardContent>
            </Card>

            <Card data-testid="stat-modules">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Modules</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard?.statistics.platformModules || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="font-medium">
                    {dashboard?.systemMetrics ? formatUptime(dashboard.systemMetrics.uptime) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Memory Usage</span>
                  <span className="font-medium">
                    {dashboard?.systemMetrics ? formatMemoryUsage(dashboard.systemMetrics.memoryUsage.heapUsed) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">CPU Load</span>
                  <span className="font-medium">
                    {dashboard?.systemMetrics ? `${(dashboard.systemMetrics.cpuLoad * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Connections</span>
                  <span className="font-medium">
                    {dashboard?.systemMetrics?.activeConnections || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboard?.recentActivity?.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">{activity.name}</p>
                          <p className="text-xs text-muted-foreground">{activity.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {activity.role}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage all registered users across all tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading users...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.users?.map((user) => (
                      <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {user.lastLoginAt 
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Management</CardTitle>
              <CardDescription>
                Manage all tenant organizations and their settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tenantsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading tenants...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenantsData?.tenants?.map((tenant) => (
                      <TableRow key={tenant.id} data-testid={`tenant-row-${tenant.id}`}>
                        <TableCell className="font-medium">{tenant.name}</TableCell>
                        <TableCell className="font-mono text-sm">{tenant.slug}</TableCell>
                        <TableCell>
                          <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                            {tenant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Modules</CardTitle>
              <CardDescription>
                Control which platform modules are enabled system-wide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboard?.platformModules?.map((module) => (
                  <Card key={module.id} className="border-2" data-testid={`module-${module.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <Switch
                          checked={module.isEnabled}
                          onCheckedChange={(enabled) => handleModuleToggle(module.id, enabled)}
                          disabled={toggleModuleMutation.isPending}
                          data-testid={`module-toggle-${module.id}`}
                        />
                      </div>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{module.category}</Badge>
                        <span className="text-muted-foreground">v{module.version}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social-auth" className="space-y-6">
          {/* Social Auth Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card data-testid="stat-social-users">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Social Users</CardTitle>
                <Link className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{socialAuthData?.socialAuth?.statistics.totalSocialUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Total linked accounts</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-pending-verifications">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {socialAuthData?.socialAuth?.statistics.pendingVerifications || 0}
                </div>
                <p className="text-xs text-muted-foreground">Mobile verification required</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-verified-accounts">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {socialAuthData?.socialAuth?.statistics.linkedAccounts || 0}
                </div>
                <p className="text-xs text-muted-foreground">Fully verified accounts</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-security-alerts">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security</CardTitle>
                <Shield className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {socialAuthData?.socialAuth?.statistics.blockedProviders || 0}
                </div>
                <p className="text-xs text-muted-foreground">Blocked attempts</p>
              </CardContent>
            </Card>
          </div>

          {/* Provider Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Social Provider Management
              </CardTitle>
              <CardDescription>
                Control social authentication providers and their security policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialAuthLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading provider data...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socialAuthData?.socialAuth?.providers?.map((provider) => (
                      <Card key={provider.provider} className="border-2" data-testid={`provider-${provider.provider}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-sm font-semibold">
                                  {provider.provider.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <CardTitle className="text-lg">{provider.name}</CardTitle>
                            </div>
                            <Switch
                              checked={provider.enabled}
                              onCheckedChange={(enabled) => 
                                toggleSocialProviderMutation.mutate({ 
                                  provider: provider.provider, 
                                  enabled 
                                })
                              }
                              disabled={toggleSocialProviderMutation.isPending}
                              data-testid={`provider-toggle-${provider.provider}`}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Users:</span>
                              <span className="font-medium">{provider.userCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Last Activity:</span>
                              <span className="font-medium">
                                {provider.lastActivity 
                                  ? new Date(provider.lastActivity).toLocaleDateString()
                                  : 'No activity'
                                }
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Status:</span>
                              <Badge variant={provider.enabled ? 'default' : 'secondary'}>
                                {provider.enabled ? 'Active' : 'Disabled'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Mobile-First Security Policy
              </CardTitle>
              <CardDescription>
                WytNet enforces strict mobile verification for all social authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Mobile-First Policy Active:</strong> All social authentication requires verified mobile numbers via OTP
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Ban className="h-4 w-4 text-red-500" />
                      Blocked Features
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Synthetic mobile number generation</li>
                      <li>• Auto-verification without OTP</li>
                      <li>• Provider-only authentication</li>
                      <li>• Bypass mobile verification</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Security Features
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Real mobile number validation</li>
                      <li>• WhatsApp OTP verification</li>
                      <li>• Encrypted token storage</li>
                      <li>• Account linking protection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Account Audit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Social Account Audit
              </CardTitle>
              <CardDescription>
                Monitor and manage user social authentication accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {socialAuthLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading user data...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Providers</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {socialAuthData?.socialAuth?.users?.map((user) => (
                      <TableRow key={user.id} data-testid={`social-user-row-${user.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{user.whatsappNumber || 'Not linked'}</span>
                            {user.isVerified ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.socialProviders.map((provider) => (
                              <Badge key={provider} variant="outline" className="text-xs">
                                {provider}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.status === 'verified' ? 'default' : 
                              user.status === 'pending' ? 'secondary' : 'destructive'
                            }
                            data-testid={`user-status-${user.id}`}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.socialProviders.map((provider) => (
                              <Button
                                key={provider}
                                variant="outline"
                                size="sm"
                                onClick={() => 
                                  unlinkSocialAccountMutation.mutate({ 
                                    userId: user.id, 
                                    provider 
                                  })
                                }
                                disabled={unlinkSocialAccountMutation.isPending}
                                data-testid={`unlink-${provider}-${user.id}`}
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Unlink {provider}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Security Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Security Audit Log
              </CardTitle>
              <CardDescription>
                Real-time monitoring of social authentication activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {socialAuthLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading audit log...</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {socialAuthData?.socialAuth?.auditLog?.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                      data-testid={`audit-entry-${entry.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="text-sm font-medium">{entry.action}</p>
                          <p className="text-xs text-muted-foreground">
                            User: {entry.userId} • Provider: {entry.provider}
                          </p>
                          <p className="text-xs text-muted-foreground">{entry.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-integrations" className="space-y-6">
          {/* Authentication Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Authentication Services
              </CardTitle>
              <CardDescription>
                Configure API keys for authentication providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Google Auth */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-red-600">G</span>
                    </div>
                    Google OAuth
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Google Client ID"
                      value={authSettings.google.clientId}
                      onChange={(e) => setAuthSettings(prev => ({
                        ...prev,
                        google: { ...prev.google, clientId: e.target.value }
                      }))}
                      data-testid="input-google-client-id"
                    />
                    <Input
                      type="password"
                      placeholder="Google Client Secret"
                      value={authSettings.google.clientSecret}
                      onChange={(e) => setAuthSettings(prev => ({
                        ...prev,
                        google: { ...prev.google, clientSecret: e.target.value }
                      }))}
                      data-testid="input-google-client-secret"
                    />
                  </div>
                </div>

                {/* Facebook Auth */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">f</span>
                    </div>
                    Facebook OAuth
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Facebook App ID"
                      value={authSettings.facebook.appId}
                      onChange={(e) => setAuthSettings(prev => ({
                        ...prev,
                        facebook: { ...prev.facebook, appId: e.target.value }
                      }))}
                      data-testid="input-facebook-app-id"
                    />
                    <Input
                      type="password"
                      placeholder="Facebook App Secret"
                      value={authSettings.facebook.appSecret}
                      onChange={(e) => setAuthSettings(prev => ({
                        ...prev,
                        facebook: { ...prev.facebook, appSecret: e.target.value }
                      }))}
                      data-testid="input-facebook-app-secret"
                    />
                  </div>
                </div>

                {/* LinkedIn Auth */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-700">in</span>
                    </div>
                    LinkedIn OAuth
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="LinkedIn Client ID"
                      value={authSettings.linkedin.clientId}
                      onChange={(e) => setAuthSettings(prev => ({
                        ...prev,
                        linkedin: { ...prev.linkedin, clientId: e.target.value }
                      }))}
                      data-testid="input-linkedin-client-id"
                    />
                    <Input
                      type="password"
                      placeholder="LinkedIn Client Secret"
                      value={authSettings.linkedin.clientSecret}
                      onChange={(e) => setAuthSettings(prev => ({
                        ...prev,
                        linkedin: { ...prev.linkedin, clientSecret: e.target.value }
                      }))}
                      data-testid="input-linkedin-client-secret"
                    />
                  </div>
                </div>

                {/* WhatsApp Auth */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-green-600">W</span>
                    </div>
                    WhatsApp Business
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="WhatsApp Business API Token"
                      value={authSettings.whatsapp.token}
                      onChange={(e) => setAuthSettings(prev => ({
                        ...prev,
                        whatsapp: { ...prev.whatsapp, token: e.target.value }
                      }))}
                      data-testid="input-whatsapp-token"
                    />
                    <Input
                      type="text"
                      placeholder="Phone Number ID"
                      value={authSettings.whatsapp.phoneId}
                      onChange={(e) => setAuthSettings(prev => ({
                        ...prev,
                        whatsapp: { ...prev.whatsapp, phoneId: e.target.value }
                      }))}
                      data-testid="input-whatsapp-phone-id"
                    />
                  </div>
                </div>

                {/* SMS OTP */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-600">SMS</span>
                    </div>
                    SMS OTP Service
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Twilio Account SID"
                      value={authSettings.sms.twilioSid}
                      onChange={(e) => setAuthSettings(prev => ({
                        ...prev,
                        sms: { ...prev.sms, twilioSid: e.target.value }
                      }))}
                      data-testid="input-twilio-sid"
                    />
                    <Input
                      type="password"
                      placeholder="Twilio Auth Token"
                      value={authSettings.sms.twilioToken}
                      onChange={(e) => setAuthSettings(prev => ({
                        ...prev,
                        sms: { ...prev.sms, twilioToken: e.target.value }
                      }))}
                      data-testid="input-twilio-token"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="flex items-center gap-2" 
                  onClick={handleSaveAuthSettings}
                  disabled={saveAuthSettingsMutation.isPending}
                  data-testid="button-save-auth-settings"
                >
                  <Save className="h-4 w-4" />
                  {saveAuthSettingsMutation.isPending ? 'Saving...' : 'Save Authentication Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Payment Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Services
              </CardTitle>
              <CardDescription>
                Configure API keys for payment processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Razorpay */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">R</span>
                    </div>
                    Razorpay
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Razorpay Key ID"
                      value={paymentSettings.razorpay.keyId}
                      onChange={(e) => setPaymentSettings(prev => ({
                        ...prev,
                        razorpay: { ...prev.razorpay, keyId: e.target.value }
                      }))}
                      data-testid="input-razorpay-key-id"
                    />
                    <Input
                      type="password"
                      placeholder="Razorpay Key Secret"
                      value={paymentSettings.razorpay.keySecret}
                      onChange={(e) => setPaymentSettings(prev => ({
                        ...prev,
                        razorpay: { ...prev.razorpay, keySecret: e.target.value }
                      }))}
                      data-testid="input-razorpay-key-secret"
                    />
                  </div>
                </div>

                {/* GPay Direct */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-green-600">G</span>
                    </div>
                    Google Pay (Direct)
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="GPay Merchant ID"
                      value={paymentSettings.gpay.merchantId}
                      onChange={(e) => setPaymentSettings(prev => ({
                        ...prev,
                        gpay: { ...prev.gpay, merchantId: e.target.value }
                      }))}
                      data-testid="input-gpay-merchant-id"
                    />
                    <Input
                      type="password"
                      placeholder="GPay API Key"
                      value={paymentSettings.gpay.apiKey}
                      onChange={(e) => setPaymentSettings(prev => ({
                        ...prev,
                        gpay: { ...prev.gpay, apiKey: e.target.value }
                      }))}
                      data-testid="input-gpay-api-key"
                    />
                  </div>
                </div>

                {/* BHIM Pay Direct */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-orange-600">B</span>
                    </div>
                    BHIM Pay (Direct)
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="BHIM Merchant ID"
                      value={paymentSettings.bhim.merchantId}
                      onChange={(e) => setPaymentSettings(prev => ({
                        ...prev,
                        bhim: { ...prev.bhim, merchantId: e.target.value }
                      }))}
                      data-testid="input-bhim-merchant-id"
                    />
                    <Input
                      type="password"
                      placeholder="BHIM API Key"
                      value={paymentSettings.bhim.apiKey}
                      onChange={(e) => setPaymentSettings(prev => ({
                        ...prev,
                        bhim: { ...prev.bhim, apiKey: e.target.value }
                      }))}
                      data-testid="input-bhim-api-key"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="flex items-center gap-2" 
                  onClick={handleSavePaymentSettings}
                  disabled={savePaymentSettingsMutation.isPending}
                  data-testid="button-save-payment-settings"
                >
                  <Save className="h-4 w-4" />
                  {savePaymentSettingsMutation.isPending ? 'Saving...' : 'Save Payment Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> All API keys are encrypted and stored securely. 
              Only Super Admin users can view and modify these settings.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}