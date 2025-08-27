import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Shield, Rocket, CheckCircle, ArrowRight, Users, Globe, BarChart3, Smartphone } from "lucide-react";
import Header from "@/components/layout/header";

export default function Home() {
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="px-6 py-2 text-sm font-medium">
              🚀 Platform Launch - Free Tools Available
            </Badge>
          </div>
          
          <div className="flex justify-center mb-8">
            <img 
              src="/wytnet-logo.png" 
              alt="WytNet - Multi-SaaS Engine" 
              className="h-16 md:h-20 w-auto"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Multi-SaaS Engine
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The ultimate platform for building, managing, and scaling SaaS applications. 
            Get started with our free productivity tools and assessment modules.
          </p>

          {/* Platform Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <Button 
                variant={activeView === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('desktop')}
                className="mr-1"
                data-testid="button-desktop-view"
              >
                <Globe className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button 
                variant={activeView === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('mobile')}
                data-testid="button-mobile-view"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile PWA
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" data-testid="button-try-assessment">
                <Brain className="h-5 w-5 mr-2" />
                Try Free Assessment
              </Button>
            </Link>
            <Button variant="outline" size="lg" data-testid="button-view-tools">
              <Zap className="h-5 w-5 mr-2" />
              Explore Tools
            </Button>
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
            {/* Assessment Module */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Brain className="h-8 w-8 text-blue-600" />
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                    Live
                  </Badge>
                </div>
                <CardTitle>DISC Assessment</CardTitle>
                <CardDescription>
                  Professional personality assessment with detailed insights and career recommendations.
                </CardDescription>
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
                <Link href="/assessment">
                  <Button className="w-full mt-4" data-testid="button-start-assessment">
                    Start Assessment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* RealBro Property Brother */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    🏠
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100">
                    Demo
                  </Badge>
                </div>
                <CardTitle>RealBro Property Brother</CardTitle>
                <CardDescription>
                  Tamil Nadu property management platform for real estate brokers and professionals.
                </CardDescription>
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
                <Link href="/realbro">
                  <Button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700" data-testid="button-start-realbro">
                    Try RealBro Demo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* WytDuty Enterprise */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    ✓
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    Enterprise
                  </Badge>
                </div>
                <CardTitle>WytDuty Enterprise</CardTitle>
                <CardDescription>
                  Advanced duty and task management with approvals, calendar, and enterprise reporting.
                </CardDescription>
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
                <Link href="/wytduty">
                  <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800" data-testid="button-start-wytduty">
                    Try WytDuty Demo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
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