import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";

// User pages
import Home from "@/pages/home";
import Assessment from "@/pages/assessment";
import QRGenerator from "@/pages/qr-generator";
import AIDirectory from "@/pages/ai-directory";
import ComingSoon from "@/pages/coming-soon";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Help from "@/pages/help";
import Status from "@/pages/status";

function Router() {
  const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    return <AppLayout>{children}</AppLayout>;
  };

  return (
    <LayoutWrapper>
      <Switch>
        {/* User routes */}
        <Route path="/home" component={Home} />
        <Route path="/assessment" component={Assessment} />
        <Route path="/qr-generator" component={QRGenerator} />
        <Route path="/ai-directory" component={AIDirectory} />
        
        {/* Coming Soon routes */}
        <Route path="/business-card-designer" component={ComingSoon} />
        <Route path="/expense-calculator" component={ComingSoon} />
        <Route path="/habit-tracker" component={ComingSoon} />
        <Route path="/invoice-generator" component={ComingSoon} />
        <Route path="/astro-predictor" component={ComingSoon} />
        <Route path="/quote-generator" component={ComingSoon} />
        <Route path="/unit-converter" component={ComingSoon} />
        
        {/* Content pages */}
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/features" component={Features} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/help" component={Help} />
        <Route path="/status" component={Status} />
        
        {/* Default route */}
        <Route path="/" component={Home} />
      </Switch>
    </LayoutWrapper>
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