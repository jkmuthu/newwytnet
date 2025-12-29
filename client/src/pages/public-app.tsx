import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  QrCode, ArrowRight, CheckCircle, Lock, LogIn, Star, Zap, 
  Shield, Crown, Globe, Download
} from "lucide-react";

import QRGenerator from "./qr-generator";

interface PublicAppData {
  success: boolean;
  app: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    category: string;
    features: any[];
    isCoreApp: boolean;
    isPublic: boolean;
  };
  accessLevel: 'functional' | 'marketing';
  hasFreePlan: boolean;
  pricingPlans: Array<{
    id: string;
    planName: string;
    planType: string;
    planTier: string;
    price: string;
    currency: string;
    features: any;
  }>;
}

export default function PublicAppPage() {
  // Get slug from URL path - works for both /a/:slug and /a/:slug/subpath
  const [location] = useLocation();
  const pathParts = location.split('/').filter(Boolean);
  // Path: /a/wytqrc or /a/wytqrc/generate => ['a', 'wytqrc'] or ['a', 'wytqrc', 'generate']
  const slug = pathParts[1]; // Always the second part after 'a'

  const { data, isLoading, error } = useQuery<PublicAppData>({
    queryKey: ['/api/public/apps', slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">App Not Found</h2>
            <p className="text-muted-foreground mb-4">This app doesn't exist or is not publicly available.</p>
            <Button asChild>
              <Link href="/wytapps">Browse WytApps</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { app, accessLevel, hasFreePlan, pricingPlans } = data;

  // If accessLevel is 'functional', render the actual app component
  if (accessLevel === 'functional') {
    // Route to the specific app component based on slug
    if (slug === 'wytqrc') {
      return <QRGenerator />;
    }
    // Add more apps here as needed
    // Default fallback for functional apps without specific component
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">{app.name}</CardTitle>
              <p className="text-muted-foreground">{app.description}</p>
            </CardHeader>
            <CardContent className="text-center">
              <Badge className="bg-green-500">Free & Public</Badge>
              <p className="mt-4 text-sm text-muted-foreground">
                This app is available for free. Full functionality coming soon!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Marketing page for non-free or non-public apps
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-2xl mb-6 shadow-xl">
              {app.slug === 'wytqrc' ? (
                <QrCode className="h-10 w-10 text-white" />
              ) : (
                <Zap className="h-10 w-10 text-white" />
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {app.name}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {app.description || `Powerful ${app.category} tool on the WytNet platform`}
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <Badge variant="outline" className="text-sm">
                {app.category}
              </Badge>
              {app.isCoreApp && (
                <Badge className="bg-green-500">Core App</Badge>
              )}
            </div>
          </div>

          {/* Features */}
          {app.features && app.features.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(app.features as any[]).filter(f => f.enabled).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{feature.name}</p>
                        {feature.description && (
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Pricing Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pricingPlans.map((plan) => (
                  <Card key={plan.id} className={`${plan.planType === 'free' ? 'border-green-500' : ''}`}>
                    <CardContent className="p-6 text-center">
                      <h3 className="font-bold text-lg mb-2">{plan.planName}</h3>
                      <div className="text-3xl font-bold mb-2">
                        {plan.planType === 'free' ? 'Free' : `₹${plan.price}`}
                        {plan.planType === 'pay_per_use' && <span className="text-sm font-normal">/use</span>}
                        {plan.planType === 'monthly' && <span className="text-sm font-normal">/mo</span>}
                        {plan.planType === 'yearly' && <span className="text-sm font-normal">/yr</span>}
                      </div>
                      <Badge variant="outline">{plan.planTier}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Get Started with {app.name}</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {hasFreePlan 
                  ? "Sign in to access this app with your free WytNet account. Upgrade anytime for premium features."
                  : "Sign in to your WytNet account and subscribe to start using this powerful tool."
                }
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-purple-600">
                  <Link href="/auth">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/wytapps">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Browse More Apps
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
