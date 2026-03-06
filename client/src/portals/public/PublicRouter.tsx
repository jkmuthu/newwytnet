import { Switch, Route, Redirect, useLocation } from "wouter";
import { useEffect } from "react";
import PublicLayout from "./PublicLayout";
import { useAuth } from "@/hooks/useAuth";
import { saveReturnUrl } from "@/lib/authUtils";

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
import WytPassLoginPage from "@/pages/wytpass-login";
import EmailOTPLoginPage from "@/pages/email-otp-login";
import Documentation from "@/pages/documentation";
import APIReference from "@/pages/api-reference";
import UserAuthMethods from "@/pages/user-auth-methods";
import NotFound from "@/pages/not-found";
import ComingSoon from "@/pages/coming-soon";
// Import the DevDocumentation component
import DevDocumentation from "@/pages/dev-documentation";
import DashboardPage from "@/pages/dashboard";
import PresentationViewer from "@/pages/presentation-viewer";

// Account pages
import MyAccountPage from "@/pages/account/MyAccountPage";

// Tool pages
import Assessment from "@/pages/assessment";
import QRGenerator from "@/pages/qr-generator";
import WytAiTrademark from "@/pages/wytai-trademark";
import TMNumbering from "@/pages/tm-numbering";
import RealBro from "@/pages/realbro";
import RealBroEnhanced from "@/pages/realbro-enhanced";
import WytDuty from "@/pages/wytduty";
import WytDutyEnhanced from "@/pages/wytduty-enhanced";
import WytApps from "@/pages/wytapps";
import AppDetail from "@/pages/app-detail";
import MobileAppPage from "@/pages/MobileAppPage";
import SearchPage from "@/pages/search";
import PaymentsPage from "@/pages/payments";
import TestPaymentLink from "@/pages/test-payment-link";
import WytWall from "@/pages/wytwall";
import WytWallPost from "@/pages/wytwall-post";
import WytLife from "@/pages/wytlife";
import WytHubs from "@/pages/wythubs";

/**
 * ProtectedRoute - Redirects to login if not authenticated, saves return URL
 */
function ProtectedRoute({ children, path }: { children: React.ReactNode; path: string }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Save the current URL for post-login redirect
      saveReturnUrl(path);
      setLocation('/login');
    }
  }, [user, isLoading, path, setLocation]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - will redirect via useEffect
  if (!user) {
    return null;
  }

  // Authenticated - render protected content
  return <>{children}</>;
}

/**
 * PublicRouter handles all public routes accessible to guests and basic authenticated users
 * Routes: '/', '/features', '/pricing', '/login', '/auth/*', '/tools/*'
 */
export default function PublicRouter() {
  return (
    <PublicLayout>
      <Switch>
      {/* Landing/Home routes */}
      <Route path="/" component={WytWall} />
      <Route path="/home" component={WytWall} />
      <Route path="/landing" component={Landing} />

      {/* Company/Product pages */}
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/help" component={Help} />

      {/* WytHubs - Specialized Platform Hubs */}
      <Route path="/wythubs" component={WytHubs} />
      <Route path="/hub-discovery" component={WytHubs} />

      {/* WytLife - Lifestyle & Community */}
      <Route path="/wytlife" component={WytLife} />
      <Route path="/status" component={Status} />

      {/* Legal pages */}
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/refund" component={RefundPolicy} />
      <Route path="/shipping" component={ShippingPolicy} />

      {/* Documentation and API */}
      <Route path="/docs" component={Documentation} />
      <Route path="/devdoc" component={DevDocumentation} />
      <Route path="/dev-documentation" component={DevDocumentation} />
      <Route path="/api" component={APIReference} />
      <Route path="/api-reference" component={APIReference} />

      {/* Authentication routes */}
      <Route path="/login" component={WytPassLoginPage} />
      <Route path="/email-otp-login" component={EmailOTPLoginPage} />
      <Route path="/user-auth-methods" component={UserAuthMethods} />

      {/* Account pages - Protected */}
      <Route path="/account">
        <ProtectedRoute path="/account">
          <MyAccountPage />
        </ProtectedRoute>
      </Route>
      <Route path="/account/:tab">
        {(params) => (
          <ProtectedRoute path={`/account/${params.tab}`}>
            <MyAccountPage />
          </ProtectedRoute>
        )}
      </Route>

      {/* Tool routes - redirect to new /a/:slug public app routes */}
      <Route path="/engine">
        {() => <Redirect to="/e" />}
      </Route>
      <Route path="/engine/:rest*">
        {(params: any) => <Redirect to={`/e/${params['rest*'] || ''}`} />}
      </Route>
      <Route path="/assessment" component={() => { window.location.href = "/a/wytassessor"; return null; }} />
      <Route path="/qr-generator" component={() => { window.location.href = "/a/wytqrc"; return null; }} />
      <Route path="/wytai-trademark" component={WytAiTrademark} />
      <Route path="/tm-numbering" component={TMNumbering} />
      <Route path="/realbro" component={RealBro} />
      <Route path="/realbro/enhanced" component={RealBroEnhanced} />
      <Route path="/wytduty" component={WytDuty} />
      <Route path="/wytduty/enhanced" component={WytDutyEnhanced} />
      <Route path="/wytapps" component={WytApps} />
      <Route path="/app/:id" component={AppDetail} />
      {/* Hub routes removed - replaced with WytLife */}
      {/* <Route path="/hubs" component={HubDiscovery} /> */}
      {/* <Route path="/hub/:slug" component={HubDetail} /> */}
      <Route path="/mobile-app" component={MobileAppPage} />
      <Route path="/search" component={SearchPage} />

      {/* Payment routes */}
      <Route path="/payments" component={PaymentsPage} />
      <Route path="/plans" component={PaymentsPage} />
      <Route path="/pricing-plans" component={PaymentsPage} />
      <Route path="/test-payment" component={TestPaymentLink} />

      {/* WytWall Marketplace - Also available at /wytwall */}
      <Route path="/wytwall/:postId" component={WytWallPost} />
      <Route path="/wytwall" component={WytWall} />

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

      {/* Presentation viewer routes */}
      <Route path="/presentations" component={PresentationViewer} />
      <Route path="/investor-presentation" component={PresentationViewer} />

        {/* 404 fallback */}
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}