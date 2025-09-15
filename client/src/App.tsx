import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";
import { AuthProvider } from "@/contexts/AuthContext";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import AppLayout from "@/components/layout/AppLayout";
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
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/not-found";
import MobileAppPage from "@/pages/MobileAppPage";
import ComingSoon from "@/pages/coming-soon";

// New content pages
import WytApps from "@/pages/wytapps";
import About from "@/pages/about";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Help from "@/pages/help";
import Status from "@/pages/status";

// Admin pages
import AdminCMS from "@/pages/admin/cms";
import AdminModules from "@/pages/admin/modules";
import AdminApps from "@/pages/admin/apps";
import AdminHubs from "@/pages/admin/hubs";
import AdminSystemOverview from "@/pages/admin/system-overview";
import AdminUsers from "@/pages/admin/users";
import AdminTenants from "@/pages/admin/tenants";
import AdminSeoSettings from "@/pages/admin/seo-settings";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

// Role-based dashboard component
function RoleBasedDashboard() {
  const { isAuthenticated, isLoading, isSuperAdmin, role } = useWhatsAppAuth();
  const { isMobile } = useDeviceDetection();
  
  // For authenticated users, show dashboard directly (already has its own layout)
  if (isAuthenticated) {
    // Dashboard has its own complete layout including header - render it standalone
    return <Dashboard />;
  }
  
  // For non-authenticated users, show home page (AppLayout applied by LayoutWrapper)
  return <Home />;
}

function Router() {
  const { isAuthenticated, isLoading } = useWhatsAppAuth();
  const { isMobile } = useDeviceDetection();

  const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    return <AppLayout>{children}</AppLayout>;
  };

  return (
    <Switch>
      {/* Routes with their own layouts - NO LayoutWrapper (self-contained) */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/super-admin" component={SuperAdminDashboard} />
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Login page */}
      <Route path="/login">
        <LayoutWrapper>
          <LoginPage />
        </LayoutWrapper>
      </Route>
      
      {/* All other routes - WITH LayoutWrapper */}
      <Route>
        {(params) => (
          <LayoutWrapper>
            <Switch>
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
        
        {/* Legacy route redirects to prevent 404s */}
        <Route path="/astro-pre" component={() => { window.location.href = "/"; return null; }} />
        <Route path="/business" component={() => { window.location.href = "/"; return null; }} />
        <Route path="/invoice-c" component={() => { window.location.href = "/"; return null; }} />
        
        {/* Content pages */}
        <Route path="/wytapps" component={WytApps} />
        <Route path="/mobile-app" component={MobileAppPage} />
        <Route path="/about" component={About} />
        <Route path="/features" component={Features} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/help" component={Help} />
        <Route path="/status" component={Status} />
        
        {/* Coming Soon routes for tools in development */}
        <Route path="/business-card-designer" component={ComingSoon} />
        <Route path="/expense-calculator" component={ComingSoon} />
        <Route path="/habit-tracker" component={ComingSoon} />
        <Route path="/invoice-generator" component={ComingSoon} />
        <Route path="/astro-predictor" component={ComingSoon} />
        <Route path="/quote-generator" component={ComingSoon} />
        <Route path="/unit-converter" component={ComingSoon} />
        
        {/* Protected routes - authentication required (dashboard has its own layout) */}
        <Route path="/analytics" component={AdminAnalytics} />
        <Route path="/user-auth-methods" component={UserAuthMethods} />
        <Route path="/landing" component={Landing} />
        
        {/* Admin sub-routes (with main layout) */}
        <Route path="/admin/cms" component={AdminCMS} />
        <Route path="/admin/modules" component={AdminModules} />
        <Route path="/admin/apps" component={AdminApps} />
        <Route path="/admin/hubs" component={AdminHubs} />
        <Route path="/admin/system-overview" component={AdminSystemOverview} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/tenants" component={AdminTenants} />
        <Route path="/admin/seo-settings" component={AdminSeoSettings} />
        
              {/* Root route with role-based dashboards - MOVED TO END */}
              <Route path="/">
                <RoleBasedDashboard />
              </Route>
              
              <Route component={NotFound} />
              </Switch>
            </LayoutWrapper>
          )}
      </Route>
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
