import { Switch, Route } from "wouter";
import AdminLayout from "./AdminLayout";
import AdminGate from "./AdminGate";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

// Import existing admin components
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/users";
import AdminTenants from "@/pages/admin/tenants";
import AdminModules from "@/pages/admin/modules";
import AdminApps from "@/pages/admin/apps";
import AdminHubs from "@/pages/admin/hubs";
import AdminCMS from "@/pages/admin/cms";
import AdminSystemOverview from "@/pages/admin/system-overview";
import AdminSeoSettings from "@/pages/admin/seo-settings";
import AppManagement from "@/pages/admin/AppManagement";
import AdminWytPoints from "@/pages/admin/wytpoints";

// Import admin analytics (legacy)
import AdminAnalytics from "@/pages/admin-analytics";

// API Integrations management page
function AdminIntegrations() {
  const integrations = [
    { name: 'Google OAuth', status: 'active', lastSync: '2 hours ago', icon: '🔐' },
    { name: 'Razorpay Payment', status: 'active', lastSync: '5 minutes ago', icon: '💳' },
    { name: 'MSG91 Email/SMS', status: 'active', lastSync: '1 hour ago', icon: '📧' },
    { name: 'Meilisearch', status: 'degraded', lastSync: '3 days ago', icon: '🔍' },
    { name: 'WhatsApp Business', status: 'inactive', lastSync: 'Never', icon: '💬' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔌 API Integrations</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage third-party service integrations</p>
      </div>

      <div className="grid gap-4">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{integration.icon}</span>
                <div>
                  <h3 className="font-semibold">{integration.name}</h3>
                  <p className="text-sm text-gray-500">Last sync: {integration.lastSync}</p>
                </div>
              </div>
              <Badge className={
                integration.status === 'active' ? 'bg-green-100 text-green-800' :
                integration.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }>
                {integration.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Billing & Subscriptions page
function AdminBilling() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">💳 Billing & Subscriptions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage platform billing and payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Enterprise</p>
            <p className="text-sm text-gray-500 mt-1">Unlimited users & modules</p>
            <Badge className="mt-3 bg-green-100 text-green-800">Active</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹1,24,500</p>
            <p className="text-sm text-green-600 mt-1">↑ 23% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">All Clear</p>
            <p className="text-sm text-gray-500 mt-1">0 failed payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['INV-2025-001 - ₹24,500 - Paid', 'INV-2025-002 - ₹32,000 - Paid', 'INV-2025-003 - ₹18,900 - Pending'].map((invoice) => (
              <div key={invoice} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-sm">{invoice}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// System Logs viewer
function AdminLogs() {
  const logs = [
    { time: '14:32:15', level: 'info', message: 'User login successful', module: 'Auth' },
    { time: '14:30:42', level: 'warn', message: 'High API usage detected', module: 'Platform' },
    { time: '14:28:11', level: 'error', message: 'Payment gateway timeout', module: 'Razorpay' },
    { time: '14:25:33', level: 'info', message: 'Database backup completed', module: 'System' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📋 System Logs</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Centralized system and audit logs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-4 p-2 border-b last:border-0">
                <span className="text-sm text-gray-500">{log.time}</span>
                <Badge className={
                  log.level === 'error' ? 'bg-red-100 text-red-800' :
                  log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }>{log.level}</Badge>
                <span className="text-sm flex-1">{log.message}</span>
                <span className="text-xs text-gray-500">{log.module}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Security Settings page
function AdminSecurity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔒 Security Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Platform security configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">MFA Adoption Rate</span>
              <span className="font-semibold">78%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Sessions</span>
              <span className="font-semibold">142</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Failed Login Attempts</span>
              <span className="font-semibold text-yellow-600">23</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">SSL Status</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Firewall</span>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Rate Limiting</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Theme Management page
function AdminThemes() {
  const themes = [
    { name: 'Default Light', status: 'active', tenants: 5 },
    { name: 'Dark Mode', status: 'active', tenants: 3 },
    { name: 'WytNet Brand', status: 'active', tenants: 1 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🎨 Theme Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Customize platform themes and branding</p>
      </div>

      <div className="grid gap-4">
        {themes.map((theme) => (
          <Card key={theme.name}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-semibold">{theme.name}</h3>
                <p className="text-sm text-gray-500">{theme.tenants} tenants using</p>
              </div>
              <Badge className="bg-green-100 text-green-800">{theme.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Media Library page
function AdminMedia() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📁 Media Library</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage platform media and assets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2.4 GB</p>
            <p className="text-sm text-gray-500 mt-1">of 50 GB limit</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: "5%"}}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,247</p>
            <p className="text-sm text-gray-500 mt-1">Images, videos, docs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">34</p>
            <p className="text-sm text-gray-500 mt-1">In last 24 hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Global Settings page for super admin
function AdminGlobalSettings() {
  const settings = [
    { key: 'Platform Name', value: 'WytNet', category: 'Branding' },
    { key: 'Support Email', value: 'support@wytnet.com', category: 'Contact' },
    { key: 'Max Tenants', value: 'Unlimited', category: 'Limits' },
    { key: 'WytPoints Rate', value: '₹1 = 10 points', category: 'Economy' },
    { key: 'Session Timeout', value: '24 hours', category: 'Security' },
    { key: 'File Upload Limit', value: '50 MB', category: 'Storage' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🔧 Global Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Super Admin platform configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Configuration</CardTitle>
          <CardDescription>Global settings affecting all tenants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{setting.key}</p>
                  <p className="text-sm text-gray-500">{setting.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{setting.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {['WytPoints System', 'Multi-tenant Mode', 'AI Features', 'Analytics Tracking'].map((feature) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm">{feature}</span>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Environment</span>
              <span className="font-semibold">Development</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Version</span>
              <span className="font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Database</span>
              <span className="font-semibold">PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Cache</span>
              <span className="font-semibold">In-Memory</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// System Monitor page with real-time health metrics
function AdminSystemMonitor() {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['/api/admin/system-health'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const services = [
    { name: 'Express Server', status: 'operational', uptime: '99.9%', responseTime: '45ms' },
    { name: 'PostgreSQL Database', status: 'operational', uptime: '99.8%', responseTime: '12ms' },
    { name: 'Meilisearch', status: 'degraded', uptime: '98.5%', responseTime: '120ms' },
    { name: 'WytPass Auth', status: 'operational', uptime: '100%', responseTime: '65ms' },
    { name: 'Razorpay Gateway', status: 'operational', uptime: '99.7%', responseTime: '210ms' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'degraded': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'down': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="h-8 w-8 text-blue-600" />
          System Monitor
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Real-time system health and performance metrics</p>
      </div>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{service.name}</CardTitle>
                <Badge className={getStatusColor(service.status)}>
                  {service.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                <span className="font-semibold">{service.uptime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                <span className="font-semibold">{service.responseTime}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Resources */}
      <Card>
        <CardHeader>
          <CardTitle>System Resources</CardTitle>
          <CardDescription>Current resource utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-gray-600">32%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: "32%"}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-gray-600">58%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: "58%"}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-gray-600">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: "45%"}}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// AI Management page
function AdminAI() {
  const aiModels = [
    { name: 'GPT-4 Turbo', status: 'active', usage: '12,543 requests', success: '99.2%' },
    { name: 'Claude 3.5 Sonnet', status: 'active', usage: '8,234 requests', success: '98.8%' },
    { name: 'Gemini Pro', status: 'inactive', usage: '0 requests', success: 'N/A' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🤖 AI Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Configure AI models and services</p>
      </div>

      <div className="grid gap-4">
        {aiModels.map((model) => (
          <Card key={model.name}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex-1">
                <h3 className="font-semibold">{model.name}</h3>
                <div className="flex gap-6 mt-2 text-sm text-gray-600">
                  <span>Usage: {model.usage}</span>
                  <span>Success Rate: {model.success}</span>
                </div>
              </div>
              <Badge className={
                model.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }>
                {model.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>AI Quota</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">78%</p>
            <p className="text-sm text-gray-500 mt-1">20,777 of 27,000 requests used</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-purple-600 h-2 rounded-full" style={{width: "78%"}}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {['Smart Search', 'Content Generation', 'Chat Assistant', 'Image Analysis'].map((feature) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm">{feature}</span>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * AdminRouter - Simplified enterprise pattern
 * Single route /admin shows login form OR admin dashboard based on auth state
 */
export default function AdminRouter() {
  return (
    <AdminGate>
      <AdminLayout>
        <Switch>
          {/* Main admin dashboard */}
          <Route path="/admin" component={AdminDashboard} />

          {/* Core admin management routes */}
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/tenants" component={AdminTenants} />
          <Route path="/admin/modules" component={AdminModules} />
          
          {/* Platform management routes */}
          <Route path="/admin/apps" component={AdminApps} />
          <Route path="/admin/hubs" component={AdminHubs} />
          <Route path="/admin/cms" component={AdminCMS} />
          
          {/* System administration routes */}
          <Route path="/admin/system-overview" component={AdminSystemOverview} />
          <Route path="/admin/integrations" component={AdminIntegrations} />
          <Route path="/admin/security" component={AdminSecurity} />
          <Route path="/admin/logs" component={AdminLogs} />
          
          {/* WytPoints Management */}
          <Route path="/admin/wytpoints" component={AdminWytPoints} />
          
          {/* Super Admin Only Routes */}
          <Route path="/admin/global-settings" component={AdminGlobalSettings} />
          <Route path="/admin/monitor" component={AdminSystemMonitor} />
          
          {/* Configuration routes */}
          <Route path="/admin/seo-settings" component={AdminSeoSettings} />
          <Route path="/admin/themes" component={AdminThemes} />
          <Route path="/admin/media" component={AdminMedia} />
          <Route path="/admin/billing" component={AdminBilling} />
          <Route path="/admin/ai" component={AdminAI} />
          
          {/* Legacy analytics route */}
          <Route path="/admin/analytics" component={AdminAnalytics} />

          {/* 404 fallback for admin routes */}
          <Route>
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Admin Route Not Found
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  The requested admin route does not exist
                </p>
              </div>
            </div>
          </Route>
        </Switch>
      </AdminLayout>
    </AdminGate>
  );
}