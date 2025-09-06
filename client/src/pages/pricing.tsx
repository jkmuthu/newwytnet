import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Heart, Zap, Crown, Star, Gift, Users } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function Pricing() {
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
            Simple, Transparent Pricing
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Professional productivity tools shouldn't break the bank. That's why <strong>everything is free</strong> - 
            no hidden costs, no premium tiers, no subscriptions. Just powerful tools when you need them.
          </p>

          <div className="flex items-center justify-center space-x-8 mb-8 text-lg">
            <div className="flex items-center text-green-600 font-bold">
              <Heart className="h-6 w-6 mr-2" />
              100% Free
            </div>
            <div className="flex items-center text-blue-600 font-bold">
              <Zap className="h-6 w-6 mr-2" />
              No Signup Needed
            </div>
            <div className="flex items-center text-purple-600 font-bold">
              <CheckCircle className="h-6 w-6 mr-2" />
              Unlimited Usage
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
              <div className="text-6xl font-bold text-green-600 mb-2">$0</div>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Forever • No limits • No catches</p>
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
                  No credit card • No email required • Instant access
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Future Plans */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What's Coming Next
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              While all current tools remain free, we're working on advanced features for power users and businesses.
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