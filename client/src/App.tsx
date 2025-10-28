import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

// Authentication Context Providers
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { HubAdminAuthProvider } from "@/contexts/HubAdminAuthContext";

// Portal Routers
import PublicRouter from "@/portals/public/PublicRouter";
import PanelRouter from "@/portals/panel/PanelRouter";
import EngineRouter from "@/portals/admin/AdminRouter"; // Engine = Super Admin Panel
import HubAdminRouter from "@/portals/hub-admin/HubAdminRouter"; // Hub Admin = WytNet.com Hub Admin

// Profile Wizard
import ProfileWizard from "@/components/ProfileWizard";

// Page Components
import APIReference from "@/pages/api-reference";
import Documentation from "@/pages/documentation";
import DevDocumentation from "@/pages/dev-documentation";

/**
 * PortalRouter - Top-level router that determines which portal to use
 * Routes are separated into distinct portals:
 * - /engine/* = Engine Admin (Super Admin Panel for platform infrastructure)
 * - /admin/* = Hub Admin (WytNet.com hub content management)
 * - /mypanel/*, /orgpanel/* = User/Org Panel
 * - / = WytNet Hub (First Hub built on Engine)
 */
function PortalRouter() {
  const [showWizard, setShowWizard] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  useEffect(() => {
    // Wizard disabled - user will build better form in admin
    setShowWizard(false);
  }, [user]);

  useEffect(() => {
    console.log('[PortalRouter] Current path:', window.location.pathname);
  }, []);

  return (
    <>
      <Switch>
        {/* Engine Portal - Routes: /engine, /engine/* (Super Admin Panel) */}
        <Route path="/engine">
          {() => {
            console.log('[PortalRouter] Matched /engine route');
            return <EngineRouter />;
          }}
        </Route>
        <Route path="/engine/:rest*">
          {(params) => {
            console.log('[PortalRouter] Matched /engine/:rest* route with params:', params);
            return <EngineRouter />;
          }}
        </Route>
        
        {/* Hub Admin Portal - Routes: /admin, /admin/* (Default Hub Admin - WytNet.com) */}
        <Route path="/admin" component={HubAdminRouter} />
        <Route path="/admin/:rest*" component={HubAdminRouter} />

        {/* Panel Portal - MyPanel and OrgPanel Routes */}
        <Route path="/mypanel" component={PanelRouter} />
        <Route path="/mypanel/:rest*" component={PanelRouter} />
        <Route path="/orgpanel" component={PanelRouter} />
        <Route path="/orgpanel/:rest*" component={PanelRouter} />

        {/* Legacy panel routes - redirect to new structure */}
        <Route path="/panel" component={PanelRouter} />
        <Route path="/panel/:rest*" component={PanelRouter} />

        {/* Dashboard redirect - Move legacy /dashboard to mypanel */}
        <Route path="/dashboard">
          {() => <Redirect to="/mypanel/dashboard" />}
        </Route>

        {/* Analytics redirect - Move legacy /analytics to engine */}
        <Route path="/analytics">
          {() => <Redirect to="/engine/analytics" />}
        </Route>

        {/* API Reference */}
        <Route path="/api" component={APIReference} />

        {/* Documentation */}
        <Route path="/documentation" component={Documentation} />

        {/* Dev Documentation */}
        <Route path="/dev-docs" component={DevDocumentation} />

        {/* Hub-Specific Admin Routes: /:hubSlug/admin/* (e.g., /wytnet/admin, /ownernet/admin) */}
        <Route path="/:hubSlug/admin" component={HubAdminRouter} />
        <Route path="/:hubSlug/admin/:rest*" component={HubAdminRouter} />

        {/* Public Portal - All routes including root: /, /features, /pricing, /login, tools, etc. */}
        <Route>
          {(params) => <PublicRouter />}
        </Route>
      </Switch>

      {/* Profile Wizard - Shows when user is authenticated but profile incomplete */}
      <ProfileWizard open={showWizard} onClose={() => setShowWizard(false)} />
    </>
  );
}

/**
 * App - Main application component with authentication providers and portal routing
 * Supports triple sessions: users can be regular users, hub admins, AND super admins simultaneously
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Wrap with authentication providers to support triple sessions */}
      <AuthProvider>
        {/* Note: AuthProvider already wraps UserAuthProvider internally */}
        <AdminAuthProvider>
          <HubAdminAuthProvider>
            <TooltipProvider>
              <Toaster />
              <PortalRouter />
            </TooltipProvider>
          </HubAdminAuthProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;