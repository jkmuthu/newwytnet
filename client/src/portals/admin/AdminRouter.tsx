import { Switch, Route } from "wouter";
import AdminLayout from "./AdminLayout";
import AdminGate from "./AdminGate";

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

// Placeholder for integrations page
function AdminIntegrations() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          API Integrations
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          API integrations management will be implemented here
        </p>
      </div>
    </div>
  );
}

// Placeholder for billing page
function AdminBilling() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Billing & Subscriptions
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Billing management will be implemented here
        </p>
      </div>
    </div>
  );
}

// Placeholder for logs page
function AdminLogs() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          System Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          System logs viewer will be implemented here
        </p>
      </div>
    </div>
  );
}

// Placeholder for security page
function AdminSecurity() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Security Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Security settings will be implemented here
        </p>
      </div>
    </div>
  );
}

// Placeholder for themes page
function AdminThemes() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Theme Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Theme customization will be implemented here
        </p>
      </div>
    </div>
  );
}

// Placeholder for media page
function AdminMedia() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Media Library
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Media management will be implemented here
        </p>
      </div>
    </div>
  );
}

// Placeholder for global settings page
function AdminGlobalSettings() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Global Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Global platform settings will be implemented here
        </p>
      </div>
    </div>
  );
}

// Placeholder for system monitor page
function AdminSystemMonitor() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          System Monitor
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Real-time system monitoring will be implemented here
        </p>
      </div>
    </div>
  );
}

// Placeholder for AI management page
function AdminAI() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          AI Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          AI configuration and management will be implemented here
        </p>
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