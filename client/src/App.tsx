import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
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
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes - no authentication required */}
      <Route path="/" component={Home} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/realbro" component={RealBro} />
      <Route path="/realbro/enhanced" component={RealBroEnhanced} />
      <Route path="/wytduty" component={WytDuty} />
      <Route path="/wytduty/enhanced" component={WytDutyEnhanced} />
      <Route path="/qr-generator" component={QRGenerator} />
      <Route path="/ai-directory" component={AIDirectory} />
      <Route path="/wytai-trademark" component={WytAiTrademark} />
      <Route path="/tm-numbering" component={TMNumbering} />
      
      {/* Protected routes - authentication required */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Dashboard} />
      <Route path="/analytics" component={AdminAnalytics} />
      <Route path="/landing" component={Landing} />
      
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
