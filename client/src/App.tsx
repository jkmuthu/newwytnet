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

// Organization Route Handler (handles public vs private org routing)
import OrgRouteHandler from "@/components/OrgRouteHandler";

// Profile Wizard
import ProfileWizard from "@/components/ProfileWizard";

// Page Components
import APIReference from "@/pages/api-reference";
import Documentation from "@/pages/documentation";
import DevDocumentation from "@/pages/dev-documentation";

// Public App Page (for /a/:slug public access)
import PublicAppPage from "@/pages/public-app";

// WytSite Renderer (for /site/:subdomain public access)
import SiteRenderer from "@/pages/site-renderer";

// Public Hub Landing (for /h/:hubname public access)
import PublicHubPage from "@/pages/public-hub";

/**
 * PortalRouter - Top-level router that determines which portal to use
 * 
 * URL ARCHITECTURE (single-letter prefixes):
 * ==========================================
 * PUBLIC ROUTES (No auth required):
 * - /*              = Public pages (homepage, marketing, login)
 * - /a/:slug        = Public app page (if free + public, exact match only)
 * - /h/:hubname     = Public hub landing page
 * 
 * USER PANEL (/u/* - User auth required):
 * - /u/dashboard    = Personal dashboard
 * - /u/wytapps      = My apps
 * - /u/orgs         = My organizations
 * - /u/hubs         = My hubs
 * - /u/profile      = My profile
 * - /u/settings     = My account settings
 * 
 * APP WORKSPACE (/a/:slug/* - User auth required for sub-paths):
 * - /a/:slug/:rest* = App workspace (authenticated)
 * 
 * ORG PANEL (/o/:orgname/* - User auth required):
 * - /o/:orgname/*   = Organization workspace
 * 
 * HUB PANEL (/h/:hubname/* - User auth required for sub-paths):
 * - /h/:hubname/*   = Hub workspace (authenticated)
 * 
 * ENGINE ROUTES (/e/* - Super Admin auth required):
 * - /e/*            = Engine Admin
 * 
 * HUB ADMIN ROUTES (/admin/* - Hub Admin auth required):
 * - /admin/*        = Hub Admin panel
 * 
 * LEGACY ROUTES (Redirects for backward compatibility):
 * - /p/my/*         → /u/*
 * - /p/app/*        → /a/*
 * - /p/hub/*        → /h/*
 * - /p/org/*        → /o/*
 * - /mypanel/*      → /u/*
 * - /orgpanel/*     → /o/*
 * - /apppanel/*     → /a/*
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

  return (
    <>
      <Switch>
        {/* ============================================ */}
        {/* ENGINE ADMIN ROUTES - Super Admin Only      */}
        {/* ============================================ */}
        {/* Short alias: /e/* */}
        <Route path="/e" component={EngineRouter} />
        <Route path="/e/:rest*" component={EngineRouter} />
        {/* Full path: /engine/* */}
        <Route path="/engine" component={EngineRouter} />
        <Route path="/engine/:rest*" component={EngineRouter} />
        
        {/* ============================================ */}
        {/* HUB ADMIN ROUTES - Hub Admin Only           */}
        {/* ============================================ */}
        <Route path="/admin" component={HubAdminRouter} />
        <Route path="/admin/:rest*" component={HubAdminRouter} />

        {/* ============================================ */}
        {/* USER PANEL ROUTES (/u/*) - Authenticated   */}
        {/* ============================================ */}
        <Route path="/u" component={PanelRouter} />
        <Route path="/u/:rest*" component={PanelRouter} />

        {/* Organization Panel - /o/:orgname/* */}
        <Route path="/o/:orgname">
          {(params: { orgname: string }) => <OrgRouteHandler orgname={params.orgname} />}
        </Route>
        <Route path="/o/:orgname/:rest*">
          {(params: { orgname: string; 'rest*': string }) => <OrgRouteHandler orgname={params.orgname} rest={params['rest*']} />}
        </Route>

        {/* ============================================ */}
        {/* APP ROUTES (/a/:slug) - Smart routing       */}
        {/* /a/:slug        → Public app page           */}
        {/* /a/:slug/*      → Authenticated workspace   */}
        {/* ============================================ */}
        <Route path="/a/:slug" component={PublicAppPage} />
        <Route path="/a/:slug/:rest*" component={PanelRouter} />

        {/* WytSite Public Renderer */}
        <Route path="/site/:subdomain" component={SiteRenderer} />
        <Route path="/site/:subdomain/:slug" component={SiteRenderer} />
        <Route path="/wytsite/:subdomain" component={SiteRenderer} />
        <Route path="/wytsite/:subdomain/:slug" component={SiteRenderer} />

        {/* Hub Routes - /h/:hubname (smart: public landing or panel) */}
        <Route path="/h/:hubname" component={PublicHubPage} />
        <Route path="/h/:hubname/:rest*" component={PanelRouter} />

        {/* ============================================ */}
        {/* LEGACY ROUTES - Backward Compatibility      */}
        {/* ============================================ */}
        {/* /p/* → PanelRouter (internal redirects handle /p/my/* → /u/* etc.) */}
        <Route path="/p" component={PanelRouter} />
        <Route path="/p/:rest*" component={PanelRouter} />
        {/* /mypanel/* → /u/* */}
        <Route path="/mypanel">
          {() => <Redirect to="/u" />}
        </Route>
        <Route path="/mypanel/:rest*">
          {(params: any) => <Redirect to={`/u/${params['rest*'] || ''}`} />}
        </Route>
        {/* /orgpanel/* → /o/* */}
        <Route path="/orgpanel">
          {() => <Redirect to="/o" />}
        </Route>
        <Route path="/orgpanel/:rest*">
          {(params: any) => <Redirect to={`/o/${params['rest*'] || ''}`} />}
        </Route>
        {/* /apppanel/* → /a/* */}
        <Route path="/apppanel/:rest*">
          {(params: any) => <Redirect to={`/a/${params['rest*'] || ''}`} />}
        </Route>
        {/* /panel/* → /u/* */}
        <Route path="/panel">
          {() => <Redirect to="/u" />}
        </Route>
        <Route path="/panel/:rest*">
          {(params: any) => <Redirect to={`/u/${params['rest*'] || ''}`} />}
        </Route>

        {/* Dashboard redirect */}
        <Route path="/dashboard">
          {() => <Redirect to="/u/dashboard" />}
        </Route>

        {/* Analytics redirect */}
        <Route path="/analytics">
          {() => <Redirect to="/e/analytics" />}
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