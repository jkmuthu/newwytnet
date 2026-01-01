import { Switch, Route } from "wouter";
import HubAdminLayout from "./HubAdminLayout";
import HubAdminGate from "./HubAdminGate";
import MediaLibrary from "@/pages/hub-admin/MediaLibrary";
import DomainSettings from "@/pages/hub-admin/DomainSettings";

// Placeholder pages - will be created/moved later
function HubAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">WytNet.com Hub Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your hub content, apps, and settings</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Content</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">156</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Hub Apps</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">12</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Media Files</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">423</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Hub Users</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">1,247</p>
        </div>
      </div>
    </div>
  );
}

/**
 * HubAdminRouter - Routes for Hub Admin portal
 * Supports both URL patterns:
 * - /admin/* (Default hub - WytNet.com)
 * - /:hubSlug/admin/* (Hub-specific routes, e.g., /wytnet/admin, /ownernet/admin)
 */
export default function HubAdminRouter() {
  return (
    <HubAdminGate>
      <HubAdminLayout>
        <Switch>
          {/* Hub-Specific Routes: /:hubSlug/admin/* */}
          <Route path="/:hubSlug/admin" component={HubAdminDashboard} />
          <Route path="/:hubSlug/admin/cms">
            {() => (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CMS Content</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Hub content management coming soon</p>
              </div>
            )}
          </Route>
          <Route path="/:hubSlug/admin/media" component={MediaLibrary} />
          <Route path="/:hubSlug/admin/apps">
            {() => (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hub Apps</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Hub app management coming soon</p>
              </div>
            )}
          </Route>
          <Route path="/:hubSlug/admin/themes">
            {() => (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Themes</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Hub theme management coming soon</p>
              </div>
            )}
          </Route>
          <Route path="/:hubSlug/admin/analytics">
            {() => (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hub Analytics</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Hub analytics coming soon</p>
              </div>
            )}
          </Route>
          <Route path="/:hubSlug/admin/settings">
            {() => (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hub Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Hub settings coming soon</p>
              </div>
            )}
          </Route>
          <Route path="/:hubSlug/admin/seo">
            {() => (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SEO Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Hub SEO settings coming soon</p>
              </div>
            )}
          </Route>
          <Route path="/:hubSlug/admin/domains" component={DomainSettings} />

          {/* Default Routes: /admin/* (WytNet.com - default hub) */}
          <Route path="/admin" component={HubAdminDashboard} />
          <Route path="/admin/cms">
            {() => (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CMS Content</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Hub content management coming soon</p>
              </div>
            )}
          </Route>
          <Route path="/admin/media" component={MediaLibrary} />
          <Route path="/admin/apps">
            {() => (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hub Apps</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Hub app management coming soon</p>
              </div>
            )}
          </Route>
          <Route path="/admin/themes">
            {() => (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Themes</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Hub theme management coming soon</p>
              </div>
            )}
          </Route>
          <Route path="/admin/analytics">
            {() => (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hub Analytics</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Hub analytics coming soon</p>
              </div>
            )}
          </Route>
          <Route path="/admin/settings">
            {() => (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hub Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Hub settings coming soon</p>
              </div>
            )}
          </Route>
          <Route path="/admin/seo">
            {() => (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SEO Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Hub SEO settings coming soon</p>
              </div>
            )}
          </Route>
          <Route path="/admin/domains" component={DomainSettings} />
          
          {/* 404 */}
          <Route>
            {() => (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Hub Admin Route Not Found
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    The requested hub admin route does not exist
                  </p>
                </div>
              </div>
            )}
          </Route>
        </Switch>
      </HubAdminLayout>
    </HubAdminGate>
  );
}
