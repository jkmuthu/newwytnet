import { Switch, Route, Redirect } from "wouter";
import PanelLayout from "./PanelLayout";

// Placeholder components - to be implemented later
function MyPanelDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          My Panel Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Personal dashboard and features will be implemented here
        </p>
      </div>
    </div>
  );
}

function MyPanelProfile() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          User profile management will be implemented here
        </p>
      </div>
    </div>
  );
}

function MyPanelSettings() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          My Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Personal settings will be implemented here
        </p>
      </div>
    </div>
  );
}

function MyPanelProjects() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          My Projects
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Personal projects management will be implemented here
        </p>
      </div>
    </div>
  );
}

function OrgPanelDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Organization Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Organization dashboard will be implemented here
        </p>
      </div>
    </div>
  );
}

function OrgPanelSettings() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Organization Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Organization settings will be implemented here
        </p>
      </div>
    </div>
  );
}

function OrgPanelMembers() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Organization Members
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Member management will be implemented here
        </p>
      </div>
    </div>
  );
}

function OrgPanelProjects() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Organization Projects
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Organization projects will be implemented here
        </p>
      </div>
    </div>
  );
}

/**
 * PanelRouter handles WytPanel routes for authenticated users
 * Routes: '/panel/me/*', '/panel/org/:orgId/*'
 */
export default function PanelRouter() {
  return (
    <PanelLayout>
      <Switch>
      {/* Redirect /panel to /panel/me */}
      <Route path="/panel">
        <Redirect to="/panel/me" />
      </Route>

      {/* My Panel routes - Personal dashboard and features */}
      <Route path="/panel/me" component={MyPanelDashboard} />
      <Route path="/panel/me/dashboard" component={MyPanelDashboard} />
      <Route path="/panel/me/profile" component={MyPanelProfile} />
      <Route path="/panel/me/settings" component={MyPanelSettings} />
      <Route path="/panel/me/projects" component={MyPanelProjects} />

      {/* Organization Panel routes - Team/organization features */}
      <Route path="/panel/org/:orgId">
        {(params) => <OrgPanelDashboard />}
      </Route>
      <Route path="/panel/org/:orgId/dashboard">
        {(params) => <OrgPanelDashboard />}
      </Route>
      <Route path="/panel/org/:orgId/settings">
        {(params) => <OrgPanelSettings />}
      </Route>
      <Route path="/panel/org/:orgId/members">
        {(params) => <OrgPanelMembers />}
      </Route>
      <Route path="/panel/org/:orgId/projects">
        {(params) => <OrgPanelProjects />}
      </Route>

        {/* 404 fallback for panel routes */}
        <Route>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Panel Route Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                The requested panel route does not exist
              </p>
            </div>
          </div>
        </Route>
      </Switch>
    </PanelLayout>
  );
}