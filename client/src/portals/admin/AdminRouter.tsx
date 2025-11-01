import { Switch, Route, Redirect } from "wouter";
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
import AppDetailPage from "@/pages/admin/app-detail";
import AppLifecycle from "@/pages/admin/app-lifecycle";
import AdminCMS from "@/pages/admin/cms";
import AdminSystemOverview from "@/pages/admin/system-overview";
import AdminSystemSecurity from "@/pages/admin/system-security";
import AdminFinance from "@/pages/admin/finance";
import AdminWytPoints from "@/pages/admin/wytpoints";
import AdminDatasetManagement from "@/pages/admin/dataset-management-improved";
import AdminObjects from "@/pages/admin/objects";
import TrademarkManagement from "@/pages/admin/trademark-management";

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
import AdminGlobalSettingsReal from "@/pages/admin/global-settings-real";
import AdminRolesPermissions from "@/pages/admin/roles-permissions";
import AdminPlatformHubs from "@/pages/admin/platform-hubs";
import AdminAdminUsers from "@/pages/admin/admin-users";
import AdminBackups from "@/pages/admin/backups";
import AdminAuditLogs from "@/pages/admin/audit-logs";
import AdminSystemMonitor from "@/pages/admin/system-monitor";
import AdminSystemStatus from "@/pages/admin/system-status";
import AdminSecurity from "@/pages/admin/security";
import AdminGeoRegulatory from "@/pages/admin/geo-regulatory";
import AdminProfile from "@/pages/admin/profile";
import AdminSettings from "@/pages/admin/settings";
import AdminAccount from "@/pages/admin/account";
import AdminSearch from "@/pages/admin/search";
import AdminNotifications from "@/pages/admin/notifications";
import AdminIntegrations from "@/pages/admin/integrations";
import AdminSystemLogsReal from "@/pages/admin/system-logs-real";
import FeaturesChecklistPage from "@/pages/admin/features-checklist";
import QATestingTrackerPage from "@/pages/admin/qa-testing-tracker";
import ApiLibraryPage from "@/pages/admin/api-library";
import AllLogsPage from '@/pages/admin/all-logs';

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
          
          {/* Redirect /engine/dashboard to /engine */}
          <Route path="/engine/dashboard">
            {() => <Redirect to="/engine" />}
          </Route>

          {/* Admin Profile & Settings */}
          <Route path="/engine/profile" component={AdminProfile} />
          <Route path="/engine/settings" component={AdminSettings} />
          <Route path="/engine/account" component={AdminAccount} />
          <Route path="/engine/search" component={AdminSearch} />
          <Route path="/engine/notifications" component={AdminNotifications} />

          {/* Data Management Routes */}
          <Route path="/engine/users" component={AdminUsers} />
          <Route path="/engine/tenants" component={AdminTenants} />
          <Route path="/engine/datasets" component={AdminDatasetManagement} />
          <Route path="/engine/trademarks" component={TrademarkManagement} />
          <Route path="/engine/objects" component={AdminObjects} />
          <Route path="/engine/media" component={AdminMedia} />

          {/* Platform Management Routes */}
          <Route path="/engine/app-builder" component={AdminAppBuilder} />
          <Route path="/engine/modules" component={AdminModules} />
          
          {/* Apps routes - most specific first */}
          <Route path="/engine/apps/:slug/lifecycle" component={AppLifecycle} />
          <Route path="/engine/apps/:slug" component={AppDetailPage} />
          <Route path="/engine/apps" component={AdminApps} />
          
          <Route path="/engine/api-library" component={ApiLibraryPage} />
          <Route path="/engine/cms" component={AdminCMS} />
          <Route path="/engine/themes" component={AdminThemes} />

          {/* Operations Routes */}
          <Route path="/engine/plans-prices" component={AdminPlansPrices} />
          <Route path="/engine/help-support" component={AdminHelpSupport} />
          <Route path="/engine/finance" component={AdminFinance} />
          <Route path="/engine/billing" component={AdminBillingPage} />
          <Route path="/engine/transactions" component={AdminTransactions} />
          <Route path="/engine/analytics" component={AdminAnalytics} />
          <Route path="/engine/all-logs" component={AllLogsPage} />


          {/* System & Config Routes */}
          <Route path="/engine/system-security" component={AdminSystemSecurity} />
          <Route path="/engine/platform-hubs" component={AdminPlatformHubs} />
          <Route path="/engine/integrations" component={AdminIntegrations} />
          <Route path="/engine/geo-regulatory" component={AdminGeoRegulatory} />
          {/* <Route path="/engine/seo-settings" component={AdminSeoSettings} /> Removed this route */}
          <Route path="/engine/global-settings" component={AdminGlobalSettingsReal} />
          <Route path="/engine/roles-permissions" component={AdminRolesPermissions} />
          <Route path="/engine/admin-users" component={AdminAdminUsers} />
          <Route path="/engine/backups" component={AdminBackups} />
          <Route path="/engine/audit-logs" component={AdminAuditLogs} />
          <Route path="/engine/system-logs" component={AdminSystemLogsReal} />
          <Route path="/engine/system-monitor" component={AdminSystemMonitor} />
          <Route path="/engine/system-status" component={AdminSystemStatus} />
          <Route path="/engine/security" component={AdminSecurity} />

          {/* Project Management Routes */}
          <Route path="/engine/features-checklist" component={FeaturesChecklistPage} />
          <Route path="/engine/qa-testing-tracker" component={QATestingTrackerPage} />

          {/* Legacy/Other Routes */}
          <Route path="/engine/wytpoints" component={AdminWytPoints} />
          <Route path="/engine/system-overview" component={AdminSystemOverview} />
          <Route path="/engine/logs" component={AdminSystemLogsReal} />

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