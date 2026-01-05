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

/**
 * PortalRouter - Top-level router that determines which portal to use
 * 
 * URL ARCHITECTURE:
 * ================
 * PUBLIC ROUTES (No auth required):
 * - /*              = Public pages (homepage, marketing, login)
 * - /a/:slug        = Public app access (if free + public)
 * - /h/:slug        = Public hub pages
 * 
 * PANEL ROUTES (/p/* - User auth required):
 * - /p/             = User dashboard
 * - /p/my/*         = Personal workspace (My Panel)
 * - /p/org/:id/*    = Organization workspace
 * - /p/app/:slug/*  = App workspace (authenticated app access)
 * 
 * ENGINE ROUTES (/e/* or /engine/* - Super Admin auth required):
 * - /e/*            = Engine Admin shorthand
 * - /engine/*       = Engine Admin full path
 * 
 * HUB ADMIN ROUTES (/admin/* - Hub Admin auth required):
 * - /admin/*        = Hub Admin panel
 * 
 * LEGACY ROUTES (Redirects for backward compatibility):
 * - /mypanel/*      → /p/my/*
 * - /orgpanel/*     → /p/org/*
 * - /apppanel/*     → /p/app/*
 * - /u/:username/*  → Panel routes
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
        {/* PANEL ROUTES (/p/*) - Authenticated Users   */}
        {/* ============================================ */}
        {/* Main panel dashboard */}
        <Route path="/p" component={PanelRouter} />
        <Route path="/p/:rest*" component={PanelRouter} />

        {/* Legacy panel routes - still supported */}
        <Route path="/u/:username" component={PanelRouter} />
        <Route path="/u/:username/:rest*" component={PanelRouter} />

        {/* Organization Panel - /o/:orgname/* (smart routing for public/private orgs) */}
        <Route path="/o/:orgname">
          {(params: { orgname: string }) => <OrgRouteHandler orgname={params.orgname} />}
        </Route>
        <Route path="/o/:orgname/:rest*">
          {(params: { orgname: string; 'rest*': string }) => <OrgRouteHandler orgname={params.orgname} rest={params['rest*']} />}
        </Route>

        {/* ============================================ */}
        {/* PUBLIC APP ROUTES (/a/:slug) - No Auth      */}
        {/* ============================================ */}
        {/* Public app access - renders with minimal layout, no sidebar */}
        <Route path="/a/:slug" component={PublicAppPage} />
        <Route path="/a/:slug/:rest*" component={PublicAppPage} />

        {/* WytSite Public Renderer - /site/:subdomain */}
        <Route path="/site/:subdomain" component={SiteRenderer} />
        <Route path="/site/:subdomain/:slug" component={SiteRenderer} />

        {/* Public Hub Panel - /h/:hubname/* */}
        <Route path="/h/:hubname" component={PanelRouter} />
        <Route path="/h/:hubname/:rest*" component={PanelRouter} />

        {/* ============================================ */}
        {/* LEGACY ROUTES - Backward Compatibility      */}
        {/* ============================================ */}
        {/* /mypanel/* → /p/my/* */}
        <Route path="/mypanel">
          {() => <Redirect to="/p/my" />}
        </Route>
        <Route path="/mypanel/:rest*">
          {(params: any) => <Redirect to={`/p/my/${params['rest*'] || ''}`} />}
        </Route>
        {/* /orgpanel/* → /p/org/* */}
        <Route path="/orgpanel">
          {() => <Redirect to="/p/org" />}
        </Route>
        <Route path="/orgpanel/:rest*">
          {(params: any) => <Redirect to={`/p/org/${params['rest*'] || ''}`} />}
        </Route>
        {/* /apppanel/* → /p/app/* */}
        <Route path="/apppanel/:rest*">
          {(params: any) => <Redirect to={`/p/app/${params['rest*'] || 'dashboard'}`} />}
        </Route>
        {/* /panel/* → /p/* */}
        <Route path="/panel">
          {() => <Redirect to="/p" />}
        </Route>
        <Route path="/panel/:rest*">
          {(params: any) => <Redirect to={`/p/${params['rest*'] || ''}`} />}
        </Route>

        {/* Dashboard redirect - Move legacy /dashboard to panel */}
        <Route path="/dashboard">
          {() => <Redirect to="/p/my/dashboard" />}
        </Route>

        {/* Analytics redirect - Move legacy /analytics to engine */}
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