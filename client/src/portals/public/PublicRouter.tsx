import { Switch, Route } from "wouter";
import PublicLayout from "./PublicLayout";

// Import existing page components
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import Contact from "@/pages/contact";
import About from "@/pages/about";
import Help from "@/pages/help";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import RefundPolicy from "@/pages/refund";
import ShippingPolicy from "@/pages/shipping";
import Status from "@/pages/status";
import LoginPage from "@/pages/LoginPage";
import WytPassLoginPage from "@/pages/wytpass-login";
import EmailOTPLoginPage from "@/pages/email-otp-login";
import Documentation from "@/pages/documentation";
import APIReference from "@/pages/api-reference";
import WhatsAppAuth from "@/pages/whatsapp-auth";
import UserAuthMethods from "@/pages/user-auth-methods";
import NotFound from "@/pages/not-found";
import ComingSoon from "@/pages/coming-soon";

// Tool pages
import Assessment from "@/pages/assessment";
import QRGenerator from "@/pages/qr-generator";
import AIDirectory from "@/pages/ai-directory";
import WytAiTrademark from "@/pages/wytai-trademark";
import TMNumbering from "@/pages/tm-numbering";
import RealBro from "@/pages/realbro";
import RealBroEnhanced from "@/pages/realbro-enhanced";
import WytDuty from "@/pages/wytduty";
import WytDutyEnhanced from "@/pages/wytduty-enhanced";
import WytApps from "@/pages/wytapps";
import AppDetail from "@/pages/app-detail";
import HubDiscovery from "@/pages/hub-discovery";
import HubDetail from "@/pages/hub-detail";
import MobileAppPage from "@/pages/MobileAppPage";
import SearchPage from "@/pages/search";
import PaymentsPage from "@/pages/payments";

/**
 * PublicRouter handles all public routes accessible to guests and basic authenticated users
 * Routes: '/', '/features', '/pricing', '/login', '/auth/*', '/tools/*'
 */
export default function PublicRouter() {
  return (
    <PublicLayout>
      <Switch>
      {/* Landing/Home routes */}
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/landing" component={Landing} />

      {/* Company/Product pages */}
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/help" component={Help} />
      <Route path="/status" component={Status} />
      
      {/* Legal pages */}
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/refund" component={RefundPolicy} />
      <Route path="/shipping" component={ShippingPolicy} />
      
      {/* Documentation and API */}
      <Route path="/docs" component={Documentation} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/api" component={APIReference} />
      <Route path="/api-reference" component={APIReference} />

      {/* Authentication routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/wytpass-login" component={WytPassLoginPage} />
      <Route path="/wytpass" component={WytPassLoginPage} />
      <Route path="/email-otp-login" component={EmailOTPLoginPage} />
      <Route path="/auth/whatsapp" component={WhatsAppAuth} />
      <Route path="/whatsapp-auth" component={WhatsAppAuth} />
      <Route path="/user-auth-methods" component={UserAuthMethods} />

      {/* Tool routes */}
      <Route path="/tools" component={AIDirectory} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/qr-generator" component={QRGenerator} />
      <Route path="/ai-directory" component={AIDirectory} />
      <Route path="/wytai-trademark" component={WytAiTrademark} />
      <Route path="/tm-numbering" component={TMNumbering} />
      <Route path="/realbro" component={RealBro} />
      <Route path="/realbro/enhanced" component={RealBroEnhanced} />
      <Route path="/wytduty" component={WytDuty} />
      <Route path="/wytduty/enhanced" component={WytDutyEnhanced} />
      <Route path="/wytapps" component={WytApps} />
      <Route path="/app/:id" component={AppDetail} />
      <Route path="/hubs" component={HubDiscovery} />
      <Route path="/hub/:slug" component={HubDetail} />
      <Route path="/mobile-app" component={MobileAppPage} />
      <Route path="/search" component={SearchPage} />

      {/* Payment routes */}
      <Route path="/payments" component={PaymentsPage} />
      <Route path="/plans" component={PaymentsPage} />
      <Route path="/pricing-plans" component={PaymentsPage} />

      {/* Coming Soon routes for tools in development */}
      <Route path="/business-card-designer" component={ComingSoon} />
      <Route path="/expense-calculator" component={ComingSoon} />
      <Route path="/habit-tracker" component={ComingSoon} />
      <Route path="/invoice-generator" component={ComingSoon} />
      <Route path="/astro-predictor" component={ComingSoon} />
      <Route path="/quote-generator" component={ComingSoon} />
      <Route path="/unit-converter" component={ComingSoon} />

      {/* Legacy route redirects to prevent 404s */}
      <Route path="/astro-pre" component={() => { window.location.href = "/"; return null; }} />
      <Route path="/business" component={() => { window.location.href = "/"; return null; }} />
      <Route path="/invoice-c" component={() => { window.location.href = "/"; return null; }} />

        {/* 404 fallback */}
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}