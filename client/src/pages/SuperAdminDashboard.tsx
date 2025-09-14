import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  BarChart3
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

  const handleModuleToggle = (moduleId: string, enabled: boolean) => {
    toggleModuleMutation.mutate({ moduleId, enabled });
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
        <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
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
      </Tabs>
    </div>
  );
}