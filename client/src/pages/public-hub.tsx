import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AuthModal from "@/components/auth/AuthModal";
import {
  Globe,
  Sparkles,
  Palette,
  Smartphone,
  Search,
  Zap,
  ChevronRight,
  Check,
  Loader2,
  ArrowRight,
  Layout,
  Users,
  Star,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  category: string;
  defaultTheme: any;
  features: string[];
}

interface WytSiteLandingProps {
  user?: any;
}

function WytSiteLanding({ user }: WytSiteLandingProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const queryClient = useQueryClient();

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['/api/wytsite/templates'],
  });

  const templates: Template[] = (templatesData as any)?.templates || [];
  const isLoggedIn = !!user;

  const openLogin = () => {
    setAuthTab("login");
    setAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthTab("register");
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Design",
      description: "Generate stunning websites with AI assistance. Just describe what you want.",
    },
    {
      icon: Palette,
      title: "Drag & Drop Editor",
      description: "Build your site visually with our intuitive drag-and-drop page editor.",
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "All sites automatically adapt to any screen size for perfect mobile experience.",
    },
    {
      icon: Search,
      title: "SEO Optimized",
      description: "Built-in SEO tools to help your site rank higher in search results.",
    },
    {
      icon: Globe,
      title: "Custom Domains",
      description: "Connect your own domain or use our free subdomain for your website.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized hosting ensures your site loads quickly for all visitors.",
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      features: [
        "1 Website",
        "5 Pages per site",
        "WytSite subdomain",
        "Basic templates",
        "Community support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "₹299",
      period: "/month",
      features: [
        "5 Websites",
        "50 Pages per site",
        "Custom domain",
        "All templates",
        "Priority support",
        "Analytics",
        "Remove WytSite branding",
      ],
      cta: "Upgrade to Pro",
      popular: true,
    },
    {
      name: "Business",
      price: "₹999",
      period: "/month",
      features: [
        "Unlimited Websites",
        "Unlimited Pages",
        "Multiple custom domains",
        "Advanced templates",
        "Dedicated support",
        "Advanced analytics",
        "Team collaboration",
        "API access",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">WytSite</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600">Features</a>
            <a href="#templates" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600">Templates</a>
            <a href="#pricing" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link href="/a/wytsite">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" data-testid="button-my-sites">
                    My Sites
                  </Button>
                </Link>
                <Link href="/u/dashboard">
                  <Button variant="ghost" size="sm" data-testid="button-dashboard">Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={openLogin} data-testid="button-login">Log in</Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={openSignup} data-testid="button-signup">
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            AI-Powered Website Builder
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Build Beautiful Websites
            <span className="block text-indigo-600">In Minutes, Not Days</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Create stunning, professional websites with our AI-powered builder. 
            No coding required. Choose from beautiful templates and customize with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <Link href="/a/wytsite">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" data-testid="button-start-building">
                  Go to My Sites
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" onClick={openSignup} data-testid="button-start-building">
                Start Building Free
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            <a href="#templates">
              <Button size="lg" variant="outline" data-testid="button-view-templates">
                View Templates
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything You Need to Build
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto mb-12">
            Powerful features to create, customize, and publish your website with confidence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Beautiful Templates
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto mb-12">
            Start with a professionally designed template and make it your own.
          </p>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div 
                    className="h-40 flex items-center justify-center"
                    style={{
                      background: template.defaultTheme?.primaryColor 
                        ? `linear-gradient(135deg, ${template.defaultTheme.primaryColor} 0%, ${template.defaultTheme.secondaryColor || template.defaultTheme.primaryColor} 100%)`
                        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                    }}
                  >
                    <Layout className="h-12 w-12 text-white/80" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.features?.slice(0, 3).map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{feature}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {templates.length === 0 && (
                <>
                  {['Business Pro', 'Portfolio Modern', 'Landing Page'].map((name, i) => (
                    <Card key={i} className="overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Layout className="h-12 w-12 text-white/80" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Professional template for your business</p>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <section id="pricing" className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto mb-12">
            Choose the plan that fits your needs. Start free and upgrade as you grow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'ring-2 ring-indigo-600 shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isLoggedIn ? (
                    <Link href="/a/wytsite">
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                        data-testid={`button-plan-${plan.name.toLowerCase()}`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={openSignup}
                      data-testid={`button-plan-${plan.name.toLowerCase()}`}
                    >
                      {plan.cta}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build Your Website?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of businesses already using WytSite to create their online presence.
          </p>
          {isLoggedIn ? (
            <Link href="/a/wytsite">
              <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100" data-testid="button-cta-signup">
                Go to My Sites
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100" onClick={openSignup} data-testid="button-cta-signup">
              Get Started Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </section>

      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">WytSite</span>
              </div>
              <p className="text-sm text-gray-400">Build beautiful websites in minutes with AI-powered tools.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#templates" className="hover:text-white">Templates</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about"><a className="hover:text-white">About</a></Link></li>
                <li><Link href="/contact"><a className="hover:text-white">Contact</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy"><a className="hover:text-white">Privacy Policy</a></Link></li>
                <li><Link href="/terms"><a className="hover:text-white">Terms of Service</a></Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} WytSite. A product of WytNet. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AuthModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authTab}
        onSuccess={handleAuthSuccess}
        hubSlug="wytsite"
        returnPath="/h/wytsite"
      />
    </div>
  );
}

interface DefaultHubLandingProps {
  hubSlug: string;
  user?: any;
}

function DefaultHubLanding({ hubSlug, user }: DefaultHubLandingProps) {
  const isLoggedIn = !!user;
  const { data: hubData, isLoading } = useQuery({
    queryKey: ['/api/platform-hubs/public', hubSlug],
    queryFn: async () => {
      const res = await fetch(`/api/platform-hubs/public/${hubSlug}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const hub = hubData?.hub;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white capitalize">{hub?.name || hubSlug}</span>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link href={`/h/${hubSlug}/dashboard`}>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Go to Hub</Button>
                </Link>
                <Link href="/u/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to {hub?.name || hubSlug}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          {hub?.description || 'Join our community and explore amazing features.'}
        </p>
        <div className="flex gap-4 justify-center">
          {isLoggedIn ? (
            <Link href={`/h/${hubSlug}/dashboard`}>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Enter Hub
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  Join Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">Sign In</Button>
              </Link>
            </>
          )}
        </div>
      </section>

      <footer className="py-8 border-t">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {hub?.name || hubSlug}. Powered by WytNet.</p>
        </div>
      </footer>
    </div>
  );
}

export default function PublicHubPage() {
  const params = useParams();
  const hubSlug = params.hubname as string;

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (hubSlug === 'wytsite') {
    return <WytSiteLanding user={user} />;
  }

  return <DefaultHubLanding hubSlug={hubSlug} user={user} />;
}
