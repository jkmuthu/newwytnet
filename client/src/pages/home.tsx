import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Shield, Rocket, CheckCircle, ArrowRight, Users, BarChart3, Star, TrendingUp } from "lucide-react";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/MobileNavigation";
import MobileBottomNavigation from "@/components/layout/MobileBottomNavigation";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { getEnabledModules } from "@/utils/moduleStatus";

export default function Home() {
  const { isMobile } = useDeviceDetection();
  const enabledModules = getEnabledModules();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${isMobile ? 'pb-20' : ''}`}>
      {isMobile ? <MobileNavigation /> : <Header />}
      {isMobile && <MobileBottomNavigation />}
      
      {/* Hero Section */}
      <section className={`relative px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-8 pt-4' : 'py-20'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="px-6 py-2 text-sm font-medium animate-pulse">
              🚀 Platform Launch - Free Tools Available
            </Badge>
          </div>
          
          {/* Stats Banner */}
          <div className={`flex justify-center space-x-6 mb-6 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Users className="h-4 w-4 mr-1" />
              <span className="font-medium">1000+ Users</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              <span className="font-medium">4.9/5 Rating</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              <span className="font-medium">Growing Fast</span>
            </div>
          </div>
          
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img 
                src="/wytnet-logo.png" 
                alt="WytNet - Multi-SaaS Engine" 
                className={`${isMobile ? 'h-16' : 'h-20 md:h-24'} w-auto transition-transform hover:scale-105`}
              />
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                LIVE
              </div>
            </div>
          </div>
          
          {/* Small tagline under logo */}
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-500 dark:text-gray-400 mb-6 font-medium tracking-wide`}>
            Get in .. Get Done
          </p>
          
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-5xl'} font-bold text-gray-900 dark:text-white mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight`}>
            WytNet for Better Lifestyle and Workstyle
          </h1>
          
          {/* Trust indicators */}
          <div className={`flex justify-center items-center space-x-4 mb-8 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <div className="flex items-center text-green-600 font-medium">
              <Shield className="h-4 w-4 mr-1" />
              100% Secure
            </div>
            <div className="text-gray-400">•</div>
            <div className="flex items-center text-blue-600 font-medium">
              <Zap className="h-4 w-4 mr-1" />
              No Registration Required
            </div>
            <div className="text-gray-400">•</div>
            <div className="flex items-center text-purple-600 font-medium">
              <Rocket className="h-4 w-4 mr-1" />
              Instant Access
            </div>
          </div>


          <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 justify-center`}>
            <Link href="/assessment">
              <Button 
                size={isMobile ? "default" : "lg"} 
                className={`${isMobile ? 'w-full' : ''} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`} 
                data-testid="button-try-assessment"
              >
                <Brain className="h-5 w-5 mr-2" />
                Try Free Assessment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/ai-directory">
              <Button 
                variant="outline" 
                size={isMobile ? "default" : "lg"} 
                className={`${isMobile ? 'w-full' : ''} border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105`} 
                data-testid="button-view-tools"
              >
                <Zap className="h-5 w-5 mr-2" />
                Explore Tools
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Free Public Modules */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Free Public Modules
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Start using our powerful tools today. No registration required for basic features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enabledModules.map((module) => {
              // Map module types to specific content
              if (module.id === 'qr-generator') {
                return (
                  <Card key={module.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          📱
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
                          {module.pricing === 'free' ? 'Free' : module.pricing === 'premium' ? `₹${module.price}` : module.pricing}
                        </Badge>
                      </div>
                      <CardTitle>{module.name}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Instant QR code generation
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Multiple data types support
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Customizable colors & styles
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Download in multiple formats
                        </div>
                      </div>
                      <Link href={module.route}>
                        <Button className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" data-testid="button-qr-generator">
                          Generate QR Code
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              }
              
              if (module.id === 'assessment') {
                return (
                  <Card key={module.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Brain className="h-8 w-8 text-blue-600" />
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          Live
                        </Badge>
                      </div>
                      <CardTitle>{module.name}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          15-question assessment
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Detailed personality insights
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Career recommendations
                        </div>
                      </div>
                      <Link href={module.route}>
                        <Button className="w-full mt-4" data-testid="button-start-assessment">
                          Start Assessment
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              }
              
              if (module.id === 'realbro') {
                return (
                  <Card key={module.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          🏠
                        </div>
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100">
                          Demo
                        </Badge>
                      </div>
                      <CardTitle>{module.name}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Property listing management
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Broker network & contacts
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Credit-based system
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Tamil language support
                        </div>
                      </div>
                      <Link href={module.route}>
                        <Button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700" data-testid="button-start-realbro">
                          Try RealBro Demo
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              }
              
              if (module.id === 'wytduty') {
                return (
                  <Card key={module.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          ✓
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                          Enterprise
                        </Badge>
                      </div>
                      <CardTitle>{module.name}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Duty assignment & tracking
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Approval workflows
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Calendar & scheduling
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Analytics & reporting
                        </div>
                      </div>
                      <Link href={module.route}>
                        <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800" data-testid="button-start-wytduty">
                          Try WytDuty Demo
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              }
              
              // Generic module card for other modules
              return (
                <Card key={module.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`h-8 w-8 bg-gradient-to-r from-${module.color}-500 to-${module.color}-600 rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                        <i className={`fas fa-${module.icon}`}></i>
                      </div>
                      <Badge className={`bg-${module.color}-100 text-${module.color}-800`}>
                        {module.pricing === 'free' ? 'Free' : module.pricing === 'premium' ? `₹${module.price}` : module.pricing}
                      </Badge>
                    </div>
                    <CardTitle>{module.name}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {module.usage.toLocaleString()} monthly users
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {module.installs.toLocaleString()} total installs
                      </div>
                    </div>
                    <Link href={module.route}>
                      <Button className="w-full mt-4" data-testid={`button-${module.id}`}>
                        Try {module.name}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
            
            {enabledModules.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <i className="fas fa-info-circle text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No modules available</h3>
                <p className="text-gray-600 dark:text-gray-300">All modules are currently disabled by the administrator.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Platform Highlights */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Platform Capabilities
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built for scale, designed for simplicity. WytNet powers the next generation of SaaS applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi-Tenant</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Complete tenant isolation with row-level security and custom domains.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Low-Code</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Visual builders for CRUD operations, CMS, and application composition.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Built-in analytics and reporting for all your applications and modules.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-orange-100 dark:bg-orange-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Enterprise-grade security with role-based access control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/wytnet-logo.png" 
                  alt="WytNet Logo" 
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm">
                The ultimate multi-tenant SaaS platform for building scalable applications.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/assessment">Assessment Tools</Link></li>
                <li>Productivity Suite</li>
                <li>Analytics Dashboard</li>
                <li>API Documentation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Multi-Tenant Architecture</li>
                <li>Low-Code Builders</li>
                <li>Security & Compliance</li>
                <li>Custom Domains</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 WytNet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}