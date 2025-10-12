import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

// Authentication Context Providers
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

// Portal Routers
import PublicRouter from "@/portals/public/PublicRouter";
import PanelRouter from "@/portals/panel/PanelRouter";
import AdminRouter from "@/portals/admin/AdminRouter";

// Profile Wizard
import ProfileWizard from "@/components/ProfileWizard";

/**
 * PortalRouter - Top-level router that determines which portal to use
 * Routes are separated into three distinct portals with no content mixing
 */
function PortalRouter() {
  const [showWizard, setShowWizard] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  useEffect(() => {
    // Show wizard if user is authenticated and profile is not complete
    if (user && !(user as any)?.profileComplete) {
      setShowWizard(true);
    } else {
      setShowWizard(false);
    }
  }, [user]);

  return (
    <>
      <Switch>
        {/* Admin Portal - Routes: /admin, /admin/* */}
        <Route path="/admin" component={AdminRouter} />
        <Route path="/admin/:rest*" component={AdminRouter} />
        
        {/* Panel Portal - MyPanel and OrgPanel Routes */}
        <Route path="/mypanel/:rest*">
          {(params) => <PanelRouter />}
        </Route>
        <Route path="/orgpanel/:rest*">
          {(params) => <PanelRouter />}
        </Route>
        
        {/* Legacy panel routes - redirect to new structure */}
        <Route path="/panel/:rest*">
          {(params) => <PanelRouter />}
        </Route>
        
        {/* Dashboard redirect - Move legacy /dashboard to mypanel */}
        <Route path="/dashboard">
          {() => <Redirect to="/mypanel/dashboard" />}
        </Route>
        
        {/* Analytics redirect - Move legacy /analytics to admin */}
        <Route path="/analytics">
          {() => <Redirect to="/admin/analytics" />}
        </Route>
        
        {/* Public Portal - All other routes: /, /features, /pricing, /login, tools, etc. */}
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
 * Supports dual sessions: users can be both regular users AND admins simultaneously
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Wrap with authentication providers to support dual sessions */}
      <AuthProvider>
        {/* Note: AuthProvider already wraps UserAuthProvider internally */}
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <PortalRouter />
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;