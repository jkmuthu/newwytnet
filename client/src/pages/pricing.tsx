import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Heart, Zap, Crown, Star, Gift, Users, Globe } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
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
    document.title = "Pricing - From ₹0 to Industry's Lowest Cost | WytNet";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'WytNet pricing starts from ₹0 with industry\'s lowest cost. Multi-currency support with professional productivity tools. No hidden fees, transparent pricing.');
    }
    
    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute('content', 'WytNet Pricing - From ₹0 to Industry\'s Lowest Cost');
    if (ogDescription) ogDescription.setAttribute('content', 'Transparent pricing from ₹0 with multi-currency support. Industry\'s lowest cost for professional productivity tools.');
    
    return () => {
      // Reset to default meta tags on cleanup
      document.title = "WytNet - Multi-Tenant SaaS Platform | Free Assessment Tools";
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Build scalable SaaS applications with WytNet\'s multi-tenant platform. Start with free assessment tools, productivity suites, and specialized business utilities.');
      }
    };
  }, []);
  const freeFeatures = [
    "All 10+ WytApps completely free",
    "No registration or signup required", 
    "Unlimited usage with no restrictions",
    "Mobile and desktop optimized",
    "Instant access and results",
    "Professional quality output",
    "Regular updates and new tools",
    "Community support",
    "Export and download capabilities",
    "Cross-platform compatibility"
  ];

  const upcomingFeatures = [
    {
      title: "WytHubs Premium",
      description: "Advanced hub features for businesses",
      icon: Crown,
      color: "text-yellow-500",
      status: "Coming 2025"
    },
    {
      title: "Enterprise Solutions", 
      description: "Custom tools and white-label options",
      icon: Star,
      color: "text-purple-500",
      status: "Coming Soon"
    },
    {
      title: "API Access",
      description: "Integrate WytApps into your applications", 
      icon: Zap,
      color: "text-blue-500",
      status: "In Development"
    }
  ];

  const faqs = [
    {
      question: "Why is everything free?",
      answer: "We believe powerful productivity tools should be accessible to everyone. WytNet is built on the principle that professional-quality software shouldn't have barriers."
    },
    {
      question: "Will there always be a free tier?",
      answer: "Absolutely! All current WytApps will remain 100% free forever. We may add premium features in the future, but the core tools will always be free."
    },
    {
      question: "How do you sustain the platform?",
      answer: "WytNet is currently supported by our development team's commitment to democratizing access to productivity tools. Future premium features may help sustain growth."
    },
    {
      question: "Can I use WytApps for commercial purposes?", 
      answer: "Yes! All WytApps are free for personal and commercial use. Generate invoices, QR codes, business cards - everything is business-ready."
    },
    {
      question: "Do you collect or sell my data?",
      answer: "Never. We don't store your data, track your usage for advertising, or sell information. Your privacy is completely protected."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Gift className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                FREE
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            From ₹0 to Industry's Lowest Cost
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Professional productivity tools starting from <strong>₹0 with industry's most competitive pricing</strong>. 
            Multi-currency support, transparent costs, no hidden fees. Scale from free tools to enterprise solutions.
          </p>
          
          {/* Currency Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4 text-gray-500 mr-2" />
                {(Object.entries(currencies) as [CurrencyCode, typeof currencies[CurrencyCode]][]).map(([code, currency]) => (
                  <button
                    key={code}
                    onClick={() => setSelectedCurrency(code)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedCurrency === code
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    data-testid={`currency-${code.toLowerCase()}`}
                  >
                    {currency.flag} {currency.symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 mb-8 text-lg">
            <div className="flex items-center text-green-600 font-bold">
              <Heart className="h-6 w-6 mr-2" />
              From {currencies[selectedCurrency].symbol}0
            </div>
            <div className="flex items-center text-blue-600 font-bold">
              <Zap className="h-6 w-6 mr-2" />
              Industry's Lowest Cost
            </div>
            <div className="flex items-center text-purple-600 font-bold">
              <CheckCircle className="h-6 w-6 mr-2" />
              Multi-Currency Support
            </div>
          </div>
        </div>
      </section>

      {/* Main Pricing Card */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-green-200 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 relative overflow-hidden">
            {/* Badge */}
            <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-2 rounded-bl-2xl font-bold">
              FOREVER FREE
            </div>
            
            <CardHeader className="text-center pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                All WytApps
              </CardTitle>
              <div className="text-6xl font-bold text-green-600 mb-2">
                {currencies[selectedCurrency].symbol}0
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Forever Free • Industry's Lowest Cost • {currencies[selectedCurrency].name}
              </p>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Included Tools</h4>
                  <div className="space-y-2">
                    {freeFeatures.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Platform Benefits</h4>
                  <div className="space-y-2">
                    {freeFeatures.slice(5).map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/wytapps">
                  <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 py-4 text-lg">
                    Start Using WytApps Now
                    <ArrowRight className="h-6 w-6 ml-3" />
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  From {currencies[selectedCurrency].symbol}0 • Industry's best value • Instant access
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cost Comparison Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Industry's Most Competitive Pricing
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Compare our pricing with competitors. We offer the lowest cost in the industry while maintaining premium quality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center border-2 border-red-200 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                Competitors
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Traditional Tools</CardTitle>
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {currencies[selectedCurrency].symbol}29-99/month
                </div>
                <p className="text-gray-600 dark:text-gray-300">Per tool subscription</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• Limited features</p>
                  <p>• Monthly commitments</p>
                  <p>• Multiple subscriptions</p>
                  <p>• Setup complexity</p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-green-200 shadow-xl relative scale-105">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                WytNet
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl text-gray-900 dark:text-white">All WytApps</CardTitle>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {currencies[selectedCurrency].symbol}0
                </div>
                <p className="text-gray-600 dark:text-gray-300">Forever free with premium quality</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p className="text-green-600 font-medium">• All features included</p>
                  <p className="text-green-600 font-medium">• No time limits</p>
                  <p className="text-green-600 font-medium">• Single platform</p>
                  <p className="text-green-600 font-medium">• Instant access</p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-yellow-200 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                Enterprise
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Custom Solutions</CardTitle>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {currencies[selectedCurrency].symbol}999+/month
                </div>
                <p className="text-gray-600 dark:text-gray-300">Complex enterprise packages</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• High setup costs</p>
                  <p>• Long contracts</p>
                  <p>• Training required</p>
                  <p>• Maintenance fees</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg inline-block">
              <p className="text-green-800 dark:text-green-200 font-bold text-lg">
                💰 Save {currencies[selectedCurrency].symbol}348+ per year by choosing WytNet
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm mt-2">
                Based on average competitor pricing for similar tool suites
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Plans */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Scaling with Your Needs
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Start free and scale up. We're building premium features that maintain our industry-leading cost efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {upcomingFeatures.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{feature.title}</CardTitle>
                  <Badge variant="outline" className="w-fit mx-auto mt-2">{feature.status}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Want to be notified about new features? Join our community.
            </p>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-2">
                Stay Updated
                <Users className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Everything you need to know about WytNet's pricing philosophy.
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            No pricing decisions to make, no plans to compare. Just start using the tools you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/wytapps">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-green-50 px-8">
                Browse All WytApps
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/qr-generator">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-8">
                Try QR Generator
                <Zap className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}