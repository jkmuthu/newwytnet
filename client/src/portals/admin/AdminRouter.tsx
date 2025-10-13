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
import AdminDatasetManagement from "@/pages/admin/dataset-management";

// Import admin analytics (legacy)
import AdminAnalytics from "@/pages/admin-analytics";

// Import new admin pages
import AdminAppBuilder from "@/pages/admin/app-builder";
import AdminMedia from "@/pages/admin/media";
import AdminThemes from "@/pages/admin/themes";
import AdminPlansPrices from "@/pages/admin/plans-prices";
import AdminHelpSupport from "@/pages/admin/help-support";
import AdminBillingPage from "@/pages/admin/billing";
import AdminTransactions from "@/pages/admin/transactions";
import AdminGlobalSettings from "@/pages/admin/global-settings";
import AdminRolesPermissions from "@/pages/admin/roles-permissions";
import AdminAdminUsers from "@/pages/admin/admin-users";
import AdminBackups from "@/pages/admin/backups";
import AdminSystemLogs from "@/pages/admin/system-logs";
import AdminSystemMonitor from "@/pages/admin/system-monitor";
import AdminSystemStatus from "@/pages/admin/system-status";
import AdminSecurity from "@/pages/admin/security";
import AdminPlatformRegistry from "@/pages/admin/platform-registry";

// Keep AdminIntegrations, AdminLogs, and AdminAI as inline components for now
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

// System Logs viewer (keep as inline for now)
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

// Keep AdminAI as inline for now
function AdminAI() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🤖 AI Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage AI features and integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>AI Models</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {['GPT-4', 'DALL-E', 'Whisper', 'Embeddings'].map((model) => (
              <div key={model} className="flex items-center justify-between">
                <span className="text-sm">{model}</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            ))}
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
 * AdminRouter - Handles all admin routes
 */
export default function AdminRouter() {
  return (
    <AdminGate>
      <AdminLayout>
        <Switch>
          {/* Main admin dashboard */}
          <Route path="/admin" component={AdminDashboard} />

          {/* Data Management Routes */}
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/tenants" component={AdminTenants} />
          <Route path="/admin/datasets" component={AdminDatasetManagement} />
          <Route path="/admin/media" component={AdminMedia} />

          {/* Platform Management Routes */}
          <Route path="/admin/app-builder" component={AdminAppBuilder} />
          <Route path="/admin/modules" component={AdminModules} />
          <Route path="/admin/apps" component={AdminApps} />
          <Route path="/admin/hubs" component={AdminHubs} />
          <Route path="/admin/cms" component={AdminCMS} />
          <Route path="/admin/themes" component={AdminThemes} />

          {/* Operations Routes */}
          <Route path="/admin/plans-prices" component={AdminPlansPrices} />
          <Route path="/admin/help-support" component={AdminHelpSupport} />
          <Route path="/admin/billing" component={AdminBillingPage} />
          <Route path="/admin/transactions" component={AdminTransactions} />
          <Route path="/admin/analytics" component={AdminAnalytics} />

          {/* System & Config Routes */}
          <Route path="/admin/platform-registry" component={AdminPlatformRegistry} />
          <Route path="/admin/integrations" component={AdminIntegrations} />
          <Route path="/admin/seo-settings" component={AdminSeoSettings} />
          <Route path="/admin/global-settings" component={AdminGlobalSettings} />
          <Route path="/admin/roles-permissions" component={AdminRolesPermissions} />
          <Route path="/admin/admin-users" component={AdminAdminUsers} />
          <Route path="/admin/backups" component={AdminBackups} />
          <Route path="/admin/system-logs" component={AdminSystemLogs} />
          <Route path="/admin/system-monitor" component={AdminSystemMonitor} />
          <Route path="/admin/system-status" component={AdminSystemStatus} />
          <Route path="/admin/security" component={AdminSecurity} />

          {/* Legacy/Other Routes */}
          <Route path="/admin/wytpoints" component={AdminWytPoints} />
          <Route path="/admin/system-overview" component={AdminSystemOverview} />
          <Route path="/admin/logs" component={AdminLogs} />
          <Route path="/admin/ai" component={AdminAI} />

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
