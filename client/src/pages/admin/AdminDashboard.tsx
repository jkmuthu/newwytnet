import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Building2, 
  Settings, 
  Plug, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Server,
  Database
} from "lucide-react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import AdminLayout from './AdminLayout';

interface DashboardStats {
  totalUsers: number;
  activeTenants: number;
  enabledModules: number;
  configuredIntegrations: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: string;
    responseTime: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'user_login' | 'module_toggle' | 'integration_update' | 'tenant_created';
    description: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'success';
  }>;
}

export default function AdminDashboard() {
  const { isMobile } = useDeviceDetection();

  const { data: dashboardData, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: userInfo } = useQuery<{
    id: string;
    name: string;
    role: string;
    isSuperAdmin: boolean;
  }>({
    queryKey: ['/api/auth/admin/user'],
  });

  if (isLoading) {
    return (
      <AdminLayout user={userInfo}>
        <div className="space-y-6">
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: dashboardData?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Active Tenants",
      value: dashboardData?.activeTenants || 0,
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Enabled Modules",
      value: dashboardData?.enabledModules || 0,
      icon: Settings,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "API Integrations",
      value: dashboardData?.configuredIntegrations || 0,
      icon: Plug,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  const getHealthStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_login': return <Users className="h-4 w-4" />;
      case 'module_toggle': return <Settings className="h-4 w-4" />;
      case 'integration_update': return <Plug className="h-4 w-4" />;
      case 'tenant_created': return <Building2 className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout user={userInfo}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitor and manage your WytNet platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-1 ${isMobile ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'} gap-4`}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold mt-2" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className={isMobile ? "grid w-full grid-cols-2" : "grid w-full grid-cols-4"}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
            {!isMobile && <TabsTrigger value="activity">Recent Activity</TabsTrigger>}
            {!isMobile && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-2'} gap-6`}>
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-manage-modules">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Platform Modules
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-configure-integrations">
                    <Plug className="h-4 w-4 mr-2" />
                    Configure API Integrations
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-view-users">
                    <Users className="h-4 w-4 mr-2" />
                    View User Management
                  </Button>
                  {!isMobile && (
                    <Button variant="outline" className="w-full justify-start" data-testid="button-tenant-overview">
                      <Building2 className="h-4 w-4 mr-2" />
                      Tenant Overview
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Status
                  </CardTitle>
                  <CardDescription>
                    Current platform health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Health</span>
                    {getHealthStatusBadge(dashboardData?.systemHealth?.status || 'unknown')}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Uptime</span>
                      <span className="font-medium">{dashboardData?.systemHealth?.uptime || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span className="font-medium">{dashboardData?.systemHealth?.responseTime || 0}ms</span>
                    </div>
                  </div>
                  
                  <Progress value={85} className="w-full" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Platform performance: 85% optimal
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health Monitor
                </CardTitle>
                <CardDescription>
                  Real-time health metrics and diagnostics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-700 dark:text-green-300">API Services</p>
                    <p className="text-sm text-green-600">All operational</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-blue-700 dark:text-blue-300">Database</p>
                    <p className="text-sm text-blue-600">Healthy</p>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="font-semibold text-yellow-700 dark:text-yellow-300">Background Jobs</p>
                    <p className="text-sm text-yellow-600">3 pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest administrative actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.recentActivity?.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-gray-500 dark:text-gray-400">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                      </div>
                      <Badge variant={activity.severity === 'success' ? 'default' : 'secondary'}>
                        {activity.severity}
                      </Badge>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity to display</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Platform Analytics
                </CardTitle>
                <CardDescription>
                  Usage metrics and performance insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics dashboard coming soon</p>
                  <p className="text-sm">Advanced metrics and reporting features in development</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}