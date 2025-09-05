import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Assessment from "@/pages/assessment";
import RealBro from "@/pages/realbro";
import RealBroEnhanced from "@/pages/realbro-enhanced";
import WytDuty from "@/pages/wytduty";
import WytDutyEnhanced from "@/pages/wytduty-enhanced";
import AdminAnalytics from "@/pages/admin-analytics";
import QRGenerator from "@/pages/qr-generator";
import AIDirectory from "@/pages/ai-directory";
import WytAiTrademark from "@/pages/wytai-trademark";
import TMNumbering from "@/pages/tm-numbering";
import WhatsAppAuth from "@/pages/whatsapp-auth";
import UserAuthMethods from "@/pages/user-auth-methods";
import SearchPage from "@/pages/search";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

// Admin pages
import AdminCMS from "@/pages/admin/cms";
import AdminModules from "@/pages/admin/modules";
import AdminApps from "@/pages/admin/apps";
import AdminHubs from "@/pages/admin/hubs";
import AdminSystemOverview from "@/pages/admin/system-overview";
import AdminUsers from "@/pages/admin/users";
import AdminTenants from "@/pages/admin/tenants";

// Role-based dashboard component
function RoleBasedDashboard() {
  const { isAuthenticated, isLoading, isSuperAdmin, role } = useWhatsAppAuth();
  
  // For authenticated users, show dashboard directly
  // For non-authenticated users, show home page
  if (isAuthenticated) {
    return <Dashboard />;
  }
  
  return <Home />;
}

function Router() {
  const { isAuthenticated, isLoading } = useWhatsAppAuth();
  const { isMobile } = useDeviceDetection();

  return (
    <Switch>
      {/* Root route with role-based dashboards */}
      <Route path="/" component={RoleBasedDashboard} />
      
      {/* Public routes - no authentication required */}
      <Route path="/home" component={Home} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/realbro" component={RealBro} />
      <Route path="/realbro/enhanced" component={RealBroEnhanced} />
      <Route path="/wytduty" component={WytDuty} />
      <Route path="/wytduty/enhanced" component={WytDutyEnhanced} />
      <Route path="/qr-generator" component={QRGenerator} />
      <Route path="/ai-directory" component={AIDirectory} />
      <Route path="/wytai-trademark" component={WytAiTrademark} />
      <Route path="/tm-numbering" component={TMNumbering} />
      <Route path="/auth/whatsapp" component={WhatsAppAuth} />
      <Route path="/whatsapp-auth" component={WhatsAppAuth} />
      <Route path="/search" component={SearchPage} />
      
      {/* Protected routes - authentication required */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Dashboard} />
      <Route path="/analytics" component={AdminAnalytics} />
      <Route path="/user-auth-methods" component={UserAuthMethods} />
      <Route path="/landing" component={Landing} />
      
      {/* Admin routes */}
      <Route path="/admin/cms" component={AdminCMS} />
      <Route path="/admin/modules" component={AdminModules} />
      <Route path="/admin/apps" component={AdminApps} />
      <Route path="/admin/hubs" component={AdminHubs} />
      <Route path="/admin/system-overview" component={AdminSystemOverview} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/tenants" component={AdminTenants} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
