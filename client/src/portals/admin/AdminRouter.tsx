import { Switch, Route } from "wouter";
import AdminLayout from "./AdminLayout";

// Import existing admin components
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/users";
import AdminTenants from "@/pages/admin/tenants";
import AdminModules from "@/pages/admin/modules";
import AdminApps from "@/pages/admin/apps";
import AdminHubs from "@/pages/admin/hubs";
import AdminCMS from "@/pages/admin/cms";
import AdminSystemOverview from "@/pages/admin/system-overview";
import AdminSeoSettings from "@/pages/admin/seo-settings";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
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

/**
 * AdminRouter handles all admin portal routes for super admins and admins
 * Routes: '/admin/login', '/admin/*'
 */
export default function AdminRouter() {
  return (
    <Switch>
      {/* Admin Login - standalone route without layout */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* All other admin routes wrapped in AdminLayout */}
      <Route>
        {(params) => (
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
      
      {/* Configuration routes */}
      <Route path="/admin/seo-settings" component={AdminSeoSettings} />
      <Route path="/admin/billing" component={AdminBilling} />
      
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
        )}
      </Route>
    </Switch>
  );
}