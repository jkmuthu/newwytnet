import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap, Crown, Star, Blocks, Code2, Users, Globe, Rocket, Shield } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";

export default function Pricing() {
  const currencies = {
    INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
    USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
    GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' }
  } as const;
  
  type CurrencyCode = keyof typeof currencies;
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('INR');
  
  // Set page-specific SEO meta tags
  useEffect(() => {
    document.title = "Pricing - Modular Platform with Flexible Plans | WytNet";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'WytNet offers flexible pricing from free tools to enterprise solutions. Activate only the modules you need with transparent pay-per-use API pricing.');
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute('content', 'WytNet Pricing - From Free to Enterprise');
    if (ogDescription) ogDescription.setAttribute('content', 'Flexible pricing plans with modular features. Activate only what you need, scale as you grow.');
    
    return () => {
      document.title = "WytNet - Multi-Tenant SaaS Platform | Free Assessment Tools";
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Build scalable SaaS applications with WytNet\'s multi-tenant platform. Start with free assessment tools, productivity suites, and specialized business utilities.');
      }
    };
  }, []);

  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Perfect for individuals and small projects",
      icon: Star,
      features: [
        "Access to all free WytApps",
        "WytPass authentication",
        "Community support",
        "Mobile & desktop access",
        "Basic features & tools",
        "No credit card required"
      ],
      cta: "Get Started Free",
      ctaLink: "/login",
      popular: false,
      color: "from-gray-500 to-gray-600"
    },
    {
      name: "Pro",
      price: 999,
      priceUSD: 12,
      description: "For professionals and growing teams",
      icon: Rocket,
      features: [
        "Everything in Free, plus:",
        "Activate up to 10 modules",
        "Premium WytApps access",
        "Priority support",
        "Advanced analytics",
        "Custom app installations",
        "API access (pay-per-use)"
      ],
      cta: "Start Pro Trial",
      ctaLink: "/login",
      popular: true,
      color: "from-blue-500 to-purple-600"
    },
    {
      name: "Enterprise",
      price: null,
      description: "Custom solutions for large organizations",
      icon: Crown,
      features: [
        "Everything in Pro, plus:",
        "Unlimited module activation",
        "White-label branding",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantees",
        "Volume API discounts"
      ],
      cta: "Contact Sales",
      ctaLink: "/contact",
      popular: false,
      color: "from-purple-600 to-pink-600"
    }
  ];

  const moduleCategories = [
    {
      name: "Authentication & Identity",
      modules: ["WytPass Auth", "WytID Validation", "Social Login"],
      icon: Shield
    },
    {
      name: "Payment Gateways",
      modules: ["Razorpay", "Stripe", "PayPal"],
      icon: Zap
    },
    {
      name: "Content & Media",
      modules: ["Logo Uploader", "Image Optimizer", "File Storage"],
      icon: Blocks
    },
    {
      name: "Data Management",
      modules: ["WytData APIs", "CSV Importer", "Backup Service"],
      icon: Code2
    }
  ];

  const apiPricing = [
    {
      tier: "Starter",
      requests: "10,000 requests/month",
      price: 0,
      priceUSD: 0,
      features: ["Rate limit: 100 req/min", "Basic endpoints", "Community support"]
    },
    {
      tier: "Growth",
      requests: "100,000 requests/month",
      price: 2999,
      priceUSD: 35,
      features: ["Rate limit: 500 req/min", "All endpoints", "Email support"]
    },
    {
      tier: "Scale",
      requests: "1M+ requests/month",
      price: null,
      features: ["Custom rate limits", "Dedicated infrastructure", "24/7 support"]
    }
  ];

  const faqs = [
    {
      question: "How does modular activation work?",
      answer: "WytNet uses a WordPress-style plugin architecture. Activate only the modules you need across Platform, Hub, App, or Game contexts. Pay only for what you use."
    },
    {
      question: "What's the difference between modules and apps?",
      answer: "Modules are small, focused plugins (e.g., payment gateway, auth system). WytApps are complete standalone applications. You can activate modules to build custom WytApps."
    },
    {
      question: "How does API pricing work?",
      answer: "Each module exposes REST API endpoints. We charge based on API usage similar to Google Cloud Console. Free tier includes 10,000 requests/month across all modules."
    },
    {
      question: "Can I switch plans anytime?",
      answer: "Yes! Upgrade or downgrade your plan at any time. Changes are prorated, and you only pay for what you use."
    },
    {
      question: "What happens if I exceed my API limits?",
      answer: "We'll notify you as you approach limits. You can either upgrade your plan or pay for additional requests. No surprise charges - you stay in control."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Blocks className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                MODULAR
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Pay Only for What You Use
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Modular platform with <strong>flexible pricing</strong>. Activate modules across contexts, 
            access powerful APIs, and scale from free tools to enterprise solutions.
          </p>
          
          {/* Currency Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border-2 border-blue-200 dark:border-blue-700">
              <div className="text-center mb-2">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">💰 Multi-Currency Pricing</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4 text-gray-500 mr-2" />
                {(Object.entries(currencies) as [CurrencyCode, typeof currencies[CurrencyCode]][]).map(([code, currency]) => (
                  <button
                    key={code}
                    onClick={() => setSelectedCurrency(code)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                      selectedCurrency === code
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    data-testid={`currency-${code.toLowerCase()}`}
                  >
                    {code === 'INR' && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded-full">
                        ★
                      </div>
                    )}
                    {currency.flag} {currency.symbol}
                    {code === 'INR' && (
                      <span className="block text-xs text-green-600 dark:text-green-400 font-bold">Default</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Start free, upgrade as you grow. All plans include core features with flexible module activation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden border-2 ${
                  plan.popular ? 'border-blue-500 shadow-2xl scale-105' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.price === null ? 'Custom' : `${currencies[selectedCurrency].symbol}${selectedCurrency === 'INR' ? plan.price : (plan.priceUSD || plan.price)}`}
                    {plan.price !== null && <span className="text-lg text-gray-500 dark:text-gray-400">/month</span>}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {plan.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircle className={`h-5 w-5 ${plan.popular ? 'text-blue-500' : 'text-green-500'} mr-3 flex-shrink-0 mt-0.5`} />
                        <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link href={plan.ctaLink}>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Module Library */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              60+ Modules Across 9 Categories
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Activate modules like WordPress plugins. Pay only for what you use across Platform, Hub, App, and Game contexts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {moduleCategories.map((category, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center mb-3">
                    <category.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.modules.map((module, i) => (
                      <Badge key={i} variant="secondary" className="mr-2 mb-2">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8">
                Explore Module Library
                <Blocks className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* API Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              API-as-a-Service Pricing
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Each module exposes REST APIs. Pay per usage, similar to Google Cloud Console.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {apiPricing.map((tier, index) => (
              <Card key={index} className="text-center border-2 border-gray-200 dark:border-gray-700">
                <CardHeader className="pt-8">
                  <CardTitle className="text-xl text-gray-900 dark:text-white mb-2">{tier.tier}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {tier.price === null ? 'Custom' : `${currencies[selectedCurrency].symbol}${selectedCurrency === 'INR' ? tier.price : tier.priceUSD}`}
                    {tier.price !== null && <span className="text-sm text-gray-500">/month</span>}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{tier.requests}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 text-left">
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg inline-block">
              <p className="text-blue-800 dark:text-blue-200 font-bold text-lg">
                📊 Transparent Usage Analytics & Real-Time Billing
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                Monitor your API usage in real-time. No surprise bills. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Everything you need to know about WytNet's modular pricing.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build on WytNet?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Start free, activate modules as you need them, and scale with transparent pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8">
                Talk to Sales
                <Users className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
