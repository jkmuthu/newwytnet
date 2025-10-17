import { Switch, Route } from "wouter";
import AdminLayout from "./AdminLayout";
import AdminGate from "./AdminGate";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

// Import existing admin components
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/users-improved";
import AdminTenants from "@/pages/admin/tenants";
import AdminModules from "@/pages/admin/modules";
import AdminApps from "@/pages/admin/apps";
import AdminCMS from "@/pages/admin/cms";
import AdminSystemOverview from "@/pages/admin/system-overview";
import AdminSystemSecurity from "@/pages/admin/system-security";
import AdminFinance from "@/pages/admin/finance";
import AdminSeoSettings from "@/pages/admin/seo-settings";
import AppManagement from "@/pages/admin/AppManagement";
import AdminWytPoints from "@/pages/admin/wytpoints";
import AdminDatasetManagement from "@/pages/admin/dataset-management-improved";
import AdminEntities from "@/pages/admin/entities";

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
import AdminPlatformHubs from "@/pages/admin/platform-hubs";
import AdminAdminUsers from "@/pages/admin/admin-users";
import AdminBackups from "@/pages/admin/backups";
import AdminAuditLogs from "@/pages/admin/audit-logs";
import AdminSystemLogs from "@/pages/admin/system-logs";
import AdminSystemMonitor from "@/pages/admin/system-monitor";
import AdminSystemStatus from "@/pages/admin/system-status";
import AdminSecurity from "@/pages/admin/security";
import AdminPlatformRegistry from "@/pages/admin/platform-registry";
import AdminGeoRegulatory from "@/pages/admin/geo-regulatory";
import AdminProfile from "@/pages/admin/profile";
import AdminSettings from "@/pages/admin/settings";
import AdminAccount from "@/pages/admin/account";
import AdminSearch from "@/pages/admin/search";
import AdminNotifications from "@/pages/admin/notifications";

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
 * AdminRouter (now EngineRouter) - Handles all Engine admin routes
 * This is the Super Admin Panel for managing the Engine infrastructure
 * Note: Component name kept as "AdminRouter" for backwards compatibility,
 * but conceptually this is the Engine administration interface
 */
export default function AdminRouter() {
  return (
    <AdminGate>
      <AdminLayout>
        <Switch>
          {/* Main engine dashboard */}
          <Route path="/engine" component={AdminDashboard} />

          {/* Admin Profile & Settings */}
          <Route path="/engine/profile" component={AdminProfile} />
          <Route path="/engine/settings" component={AdminSettings} />
          <Route path="/engine/account" component={AdminAccount} />
          <Route path="/engine/search" component={AdminSearch} />
          <Route path="/engine/notifications" component={AdminNotifications} />
          <Route path="/engine/help" component={AdminHelpSupport} />

          {/* Data Management Routes */}
          <Route path="/engine/users" component={AdminUsers} />
          <Route path="/engine/tenants" component={AdminTenants} />
          <Route path="/engine/datasets" component={AdminDatasetManagement} />
          <Route path="/engine/entities" component={AdminEntities} />
          <Route path="/engine/media" component={AdminMedia} />

          {/* Platform Management Routes */}
          <Route path="/engine/app-builder" component={AdminAppBuilder} />
          <Route path="/engine/modules" component={AdminModules} />
          <Route path="/engine/apps" component={AdminApps} />
          <Route path="/engine/cms" component={AdminCMS} />
          <Route path="/engine/themes" component={AdminThemes} />

          {/* Operations Routes */}
          <Route path="/engine/plans-prices" component={AdminPlansPrices} />
          <Route path="/engine/help-support" component={AdminHelpSupport} />
          <Route path="/engine/finance" component={AdminFinance} />
          <Route path="/engine/billing" component={AdminBillingPage} />
          <Route path="/engine/transactions" component={AdminTransactions} />
          <Route path="/engine/analytics" component={AdminAnalytics} />

          {/* System & Config Routes */}
          <Route path="/engine/platform-registry" component={AdminPlatformRegistry} />
          <Route path="/engine/system-security" component={AdminSystemSecurity} />
          <Route path="/engine/platform-hubs" component={AdminPlatformHubs} />
          <Route path="/engine/integrations" component={AdminIntegrations} />
          <Route path="/engine/geo-regulatory" component={AdminGeoRegulatory} />
          <Route path="/engine/seo-settings" component={AdminSeoSettings} />
          <Route path="/engine/global-settings" component={AdminGlobalSettings} />
          <Route path="/engine/roles-permissions" component={AdminRolesPermissions} />
          <Route path="/engine/admin-users" component={AdminAdminUsers} />
          <Route path="/engine/backups" component={AdminBackups} />
          <Route path="/engine/audit-logs" component={AdminAuditLogs} />
          <Route path="/engine/system-logs" component={AdminSystemLogs} />
          <Route path="/engine/system-monitor" component={AdminSystemMonitor} />
          <Route path="/engine/system-status" component={AdminSystemStatus} />
          <Route path="/engine/security" component={AdminSecurity} />

          {/* Legacy/Other Routes */}
          <Route path="/engine/wytpoints" component={AdminWytPoints} />
          <Route path="/engine/system-overview" component={AdminSystemOverview} />
          <Route path="/engine/logs" component={AdminLogs} />
          <Route path="/engine/ai" component={AdminAI} />

          {/* 404 fallback for engine routes */}
          <Route>
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Engine Route Not Found
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  The requested engine route does not exist
                </p>
              </div>
            </div>
          </Route>
        </Switch>
      </AdminLayout>
    </AdminGate>
  );
}
