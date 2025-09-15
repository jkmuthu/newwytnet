import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap, Shield, Globe, Users, Smartphone, Clock, Award, Star, Rocket, Heart } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function Features() {
  const mainFeatures = [
    {
      title: "100% Free Forever",
      description: "All WytApps are completely free with no hidden costs, premium tiers, or subscription fees. Professional tools without the professional price tag.",
      icon: Heart,
      color: "text-red-500",
      bgColor: "from-red-500 to-pink-600"
    },
    {
      title: "No Registration Required",
      description: "Start using any tool instantly without creating accounts, providing emails, or going through verification processes. Just click and use.",
      icon: Zap,
      color: "text-blue-500",
      bgColor: "from-blue-500 to-purple-600"
    },
    {
      title: "Mobile Optimized",
      description: "Every WytApp works seamlessly across desktop, tablet, and mobile devices with responsive design and touch-friendly interfaces.",
      icon: Smartphone,
      color: "text-green-500",
      bgColor: "from-green-500 to-emerald-600"
    },
    {
      title: "Instant Results",
      description: "All tools provide immediate output without waiting for processing, rendering, or server-side operations. See results as you work.",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "from-orange-500 to-red-600"
    },
    {
      title: "Enterprise Security",
      description: "Bank-level security with HTTPS encryption, no data storage, and privacy-first design. Your information stays private and secure.",
      icon: Shield,
      color: "text-purple-500",
      bgColor: "from-purple-500 to-indigo-600"
    },
    {
      title: "Global Accessibility",
      description: "Available worldwide with multi-language support, cross-timezone compatibility, and optimized performance from global CDN.",
      icon: Globe,
      color: "text-teal-500",
      bgColor: "from-teal-500 to-cyan-600"
    },
  ];

  const toolCategories = [
    {
      title: "Productivity Tools",
      description: "QR Generator, Unit Converter, Quote Generator",
      icon: Rocket,
      features: ["Instant generation", "Multiple formats", "Export options", "Professional quality"]
    },
    {
      title: "Assessment Tools", 
      description: "DISC Assessment, Astro Predictor",
      icon: Star,
      features: ["Personality insights", "Career guidance", "Detailed reports", "Actionable results"]
    },
    {
      title: "Business Tools",
      description: "Invoice Generator, Expense Calculator, Business Cards",
      icon: Award,
      features: ["Professional templates", "PDF export", "Auto calculations", "Business ready"]
    },
    {
      title: "Lifestyle Tools",
      description: "Habit Tracker, AI Directory",
      icon: Users,
      features: ["Progress tracking", "Goal setting", "Daily insights", "Lifestyle improvement"]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Rocket className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Platform Features
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Discover what makes WytNet the preferred choice for professionals worldwide. 
            Our features are designed for <strong>Better Lifestyle and Best Workstyle</strong>.
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose WytNet?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Every feature is thoughtfully designed to provide maximum value with minimum friction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Tool Categories
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Organized collections of tools for every aspect of your professional and personal life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {toolCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">{category.title}</CardTitle>
                      <p className="text-gray-600 dark:text-gray-300">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {category.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Technical Excellence
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Built on modern architecture for maximum performance, security, and reliability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <Badge className="bg-green-100 text-green-800 text-lg font-bold">{'<1s'}</Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Average load time for all tools</p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <Badge className="bg-blue-100 text-blue-800 text-lg font-bold">99.9%</Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Uptime with enterprise security</p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Globally Accessible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <Badge className="bg-purple-100 text-purple-800 text-lg font-bold">25+</Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Countries served worldwide</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Experience the Features Yourself
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Don't just read about our features - try them! All WytApps are free and ready to use immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/wytapps">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
                Explore All WytApps
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/qr-generator">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8">
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