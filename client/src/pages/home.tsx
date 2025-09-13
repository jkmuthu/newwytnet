import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Shield, Rocket, CheckCircle, ArrowRight, Users, BarChart3, Star, TrendingUp } from "lucide-react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useQuery } from "@tanstack/react-query";
import { fetchEnabledPlatformModules } from "@/lib/api";

export default function Home() {
  const { isMobile } = useDeviceDetection();
  
  // Fetch enabled modules from API
  const { data: enabledModules = [], isLoading, error } = useQuery({
    queryKey: ['platform-modules', 'enabled'],
    queryFn: fetchEnabledPlatformModules,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      
      {/* Hero Section */}
      <section className={`relative px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-8 pt-4' : 'py-20'}`}>
        <div className="max-w-7xl mx-auto text-center">
          
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img 
                src="/wytnet-logo.png" 
                alt="WytNet" 
                className={`${isMobile ? 'h-12' : 'h-14'} w-auto`}
              />
            </div>
          </div>
          
          {/* Small tagline under logo */}
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-500 dark:text-gray-400 mb-6 font-medium tracking-wide`}>
            Get in .. Get Done
          </p>
          
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 dark:text-white mb-6`}>
            Free Tools to Boost Your Productivity
          </h1>
          
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 dark:text-gray-300 mb-6`}>
            No registration required - start using tools instantly
          </p>


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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Available Tools
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading skeleton
              [...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
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
                    <div className="h-10 w-full bg-gray-200 rounded mt-4"></div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              // Error state
              <div className="col-span-full text-center py-12">
                <div className="text-red-400 mb-4">
                  <i className="fas fa-exclamation-triangle text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load modules</h3>
                <p className="text-gray-600 dark:text-gray-300">Please refresh the page to try again.</p>
              </div>
            ) : enabledModules.filter(module => module.category === 'wytapps').map((module) => {
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
                          {module.pricing === 'free' ? 'Free' : module.pricing === 'premium' && module.price ? `₹${module.price}` : module.pricing}
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
              
              if (module.id === 'ai-directory') {
                return (
                  <Card key={module.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          🤖
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          {module.pricing === 'free' ? 'Free' : module.pricing === 'premium' && module.price ? `₹${module.price}` : module.pricing}
                        </Badge>
                      </div>
                      <CardTitle>{module.name}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          200+ AI tools catalog
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Search & filter options
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Tool descriptions & links
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Regular updates
                        </div>
                      </div>
                      <Link href={module.route}>
                        <Button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" data-testid="button-ai-directory">
                          Browse AI Directory
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
                      <div className={`h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                        <i className={`fas fa-${module.icon}`}></i>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {module.pricing === 'free' ? 'Free' : module.pricing === 'premium' && module.price ? `₹${module.price}` : module.pricing}
                      </Badge>
                    </div>
                    <CardTitle>{module.name}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {module.features?.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </div>
                      )) || (
                        <>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {module.usage?.toLocaleString() || 0} monthly users
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {module.installs?.toLocaleString() || 0} total installs
                          </div>
                        </>
                      )}
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
              Why Choose WytNet?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Designed for businesses and professionals who want to work smarter, not harder. Get things done efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Team-Ready</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Perfect for teams, departments, and organizations of any size. Collaborate seamlessly.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Easy to Use</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Simple, intuitive tools that anyone can use. No technical knowledge required.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Monitor your work, track achievements, and measure what matters to your business.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-orange-100 dark:bg-orange-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Safe & Secure</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Your data is protected with bank-level security. Privacy and trust guaranteed.
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
                Smart tools and solutions to improve your lifestyle and boost workplace productivity.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Tools</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/qr-generator">QR Code Generator</Link></li>
                <li><Link href="/assessment">Personality Assessment</Link></li>
                <li><Link href="/ai-directory">AI Directory</Link></li>
                <li>Coming Soon...</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Benefits</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Free to Use</li>
                <li>No Registration Required</li>
                <li>Secure & Private</li>
                <li>Works on All Devices</li>
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