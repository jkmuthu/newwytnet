import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap, Brain, QrCode, Calculator, CreditCard, Target, RotateCcw, Quote, Star } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { fetchEnabledPlatformModules } from "@/lib/api";

export default function WytApps() {
  // Fetch enabled modules from API
  const { data: enabledModules = [], isLoading, error } = useQuery({
    queryKey: ['platform-modules', 'enabled'],
    queryFn: fetchEnabledPlatformModules,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter only WytApps
  const wytApps = enabledModules.filter(module => module.category === 'wytapps');

  const getAppIcon = (appId: string) => {
    switch (appId) {
      case 'qr-generator': return <QrCode className="h-8 w-8" />;
      case 'assessment': return <Brain className="h-8 w-8" />;
      case 'ai-directory': return <Zap className="h-8 w-8" />;
      case 'invoice-generator': return <CreditCard className="h-8 w-8" />;
      case 'expense-calculator': return <Calculator className="h-8 w-8" />;
      case 'business-card-designer': return <CreditCard className="h-8 w-8" />;
      case 'habit-tracker': return <Target className="h-8 w-8" />;
      case 'unit-converter': return <RotateCcw className="h-8 w-8" />;
      case 'quote-generator': return <Quote className="h-8 w-8" />;
      case 'astro-predictor': return <Star className="h-8 w-8" />;
      default: return <Zap className="h-8 w-8" />;
    }
  };

  const getAppColor = (appId: string) => {
    switch (appId) {
      case 'qr-generator': return 'from-emerald-500 to-teal-600';
      case 'assessment': return 'from-blue-500 to-purple-600';
      case 'ai-directory': return 'from-green-500 to-emerald-600';
      case 'invoice-generator': return 'from-purple-500 to-pink-600';
      case 'expense-calculator': return 'from-green-500 to-blue-600';
      case 'business-card-designer': return 'from-blue-500 to-indigo-600';
      case 'habit-tracker': return 'from-teal-500 to-cyan-600';
      case 'unit-converter': return 'from-orange-500 to-red-600';
      case 'quote-generator': return 'from-pink-500 to-rose-600';
      case 'astro-predictor': return 'from-yellow-500 to-orange-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                FREE
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            WytApps
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Powerful, free tools designed for <strong>Better Lifestyle and Best Workstyle</strong>. 
            No registration required - start using instantly to boost your productivity and streamline your work.
          </p>
          
          <div className="flex items-center justify-center space-x-8 mb-8 text-sm">
            <div className="flex items-center text-green-600 font-medium">
              <CheckCircle className="h-5 w-5 mr-2" />
              100% Free Forever
            </div>
            <div className="flex items-center text-blue-600 font-medium">
              <Zap className="h-5 w-5 mr-2" />
              No Registration Needed
            </div>
            <div className="flex items-center text-purple-600 font-medium">
              <Target className="h-5 w-5 mr-2" />
              Instant Results
            </div>
          </div>
        </div>
      </section>

      {/* Apps Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Available WytApps
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose from our collection of productivity tools. Each app is crafted to solve specific challenges in your daily work and personal life.
            </p>
          </div>

          {isLoading ? (
            // Loading skeleton
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-6 w-32 bg-gray-200 rounded"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-4 w-full bg-gray-200 rounded"></div>
                      ))}
                    </div>
                    <div className="h-12 w-full bg-gray-200 rounded mt-6"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <Zap className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load WytApps</h3>
              <p className="text-gray-600 dark:text-gray-300">Please refresh the page to try again.</p>
            </div>
          ) : wytApps.length === 0 ? (
            // No apps available
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Zap className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No WytApps Available</h3>
              <p className="text-gray-600 dark:text-gray-300">All WytApps are currently being updated. Check back soon!</p>
            </div>
          ) : (
            // Apps grid
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wytApps.map((app) => (
                <Card key={app.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg bg-white dark:bg-gray-800">
                  <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`h-12 w-12 bg-gradient-to-r ${getAppColor(app.id)} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {getAppIcon(app.id)}
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 font-medium">
                        {app.pricing === 'free' ? 'FREE' : app.pricing.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{app.name}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {app.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {app.features?.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      )) || (
                        <>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                            Easy to use interface
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                            Instant results
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                            No registration required
                          </div>
                        </>
                      )}
                    </div>
                    <Link href={app.route}>
                      <Button className={`w-full bg-gradient-to-r ${getAppColor(app.id)} hover:shadow-lg transition-all duration-300 text-white font-medium py-3`} data-testid={`button-${app.id}`}>
                        Use {app.name}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Boost Your Productivity?
          </h2>
          <p className="text-blue-100 mb-8 text-lg leading-relaxed">
            Join thousands of professionals using WytApps to work smarter. 
            All tools are free, secure, and designed for maximum efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ai-directory">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-8">
                Explore AI Directory
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/assessment">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 font-medium px-8">
                Try Free Assessment
                <Brain className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}