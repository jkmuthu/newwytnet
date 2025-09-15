import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

// Admin pages
import AdminCMS from "@/pages/cms";
import AdminModules from "@/pages/modules";
import AdminApps from "@/pages/apps";
import AdminHubs from "@/pages/hubs";
import AdminSystemOverview from "@/pages/system-overview";
import AdminUsers from "@/pages/users";
import AdminTenants from "@/pages/tenants";
import AdminSeoSettings from "@/pages/seo-settings";

function Router() {
  return (
    <Switch>
      {/* Super Admin Dashboard */}
      <Route path="/super-admin" component={SuperAdminDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      
      {/* Admin sub-routes */}
      <Route path="/admin/cms" component={AdminCMS} />
      <Route path="/admin/modules" component={AdminModules} />
      <Route path="/admin/apps" component={AdminApps} />
      <Route path="/admin/hubs" component={AdminHubs} />
      <Route path="/admin/system-overview" component={AdminSystemOverview} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/tenants" component={AdminTenants} />
      <Route path="/admin/seo-settings" component={AdminSeoSettings} />
      
      {/* Default route - Super Admin Dashboard */}
      <Route path="/" component={SuperAdminDashboard} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;