import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function WytSitePage() {
  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['/api/wytsite/templates'],
  });

  const templates: Template[] = (templatesData as any)?.templates || [];

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
            <Link href="/login">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" data-testid="button-start-building">
                Start Building Free
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" data-testid="button-view-templates">
              View Templates
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white dark:bg-gray-800">
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

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Choose Your Template
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
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div 
                    className="h-40 bg-gradient-to-br flex items-center justify-center"
                    style={{
                      background: template.defaultTheme?.primaryColor 
                        ? `linear-gradient(135deg, ${template.defaultTheme.primaryColor} 0%, ${template.defaultTheme.secondaryColor || template.defaultTheme.primaryColor} 100%)`
                        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                    }}
                  >
                    <Globe className="h-16 w-16 text-white opacity-50 group-hover:opacity-75 transition-opacity" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(template.features as string[])?.slice(0, 3).map((feature: string) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto mb-12">
            Start free, upgrade when you need more. No hidden fees.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'ring-2 ring-indigo-600 shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
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
                  <Link href="/login">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      data-testid={`button-pricing-${plan.name.toLowerCase()}`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Your Website?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of users who have created beautiful websites with WytSite.
            Start for free, no credit card required.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100" data-testid="button-cta-start">
              Get Started Now
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
