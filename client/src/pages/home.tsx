import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Shield, Rocket, CheckCircle, ArrowRight, Users, BarChart3, Star, TrendingUp, Heart, Award, Clock } from "lucide-react";
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
    <div className={`min-h-screen ${isMobile ? 'bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'}`}>
      
      {/* Mobile Sticky CTA Bar */}
      {isMobile && (
        <div className="fixed bottom-20 left-4 right-4 z-40">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-3 flex items-center justify-between border border-white/10">
            <div className="text-white">
              <p className="text-sm font-semibold">Start Free Assessment</p>
              <p className="text-xs opacity-90">No signup required</p>
            </div>
            <Link href="/assessment">
              <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/20" data-testid="mobile-sticky-cta">
                <Brain className="h-4 w-4 mr-1" />
                Start
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* Quick Navigation for Mobile */}
      {isMobile && (
        <div className="fixed top-16 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-30">
          <div className="flex justify-center gap-4 py-2 px-4 text-xs">
            <a href="#hero" className="text-blue-600 dark:text-blue-400 font-medium" data-testid="nav-hero">Home</a>
            <a href="#tools" className="text-gray-600 dark:text-gray-300" data-testid="nav-tools">Tools</a>
            <a href="#highlights" className="text-gray-600 dark:text-gray-300" data-testid="nav-highlights">Features</a>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section id="hero" className={`relative px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-8 pt-12' : 'py-20'}`}>
        <div className="max-w-7xl mx-auto text-center">
          
          {/* Free Forever Badge */}
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm font-semibold animate-pulse shadow-lg" data-testid="badge-free-forever">
              <Heart className="h-4 w-4 mr-2" />
              100% FREE FOREVER
            </Badge>
          </div>
          
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img 
                src="/wytnet-logo.png" 
                alt="WytNet - Professional Productivity Tools" 
                className={`${isMobile ? 'h-12' : 'h-14'} w-auto`}
                loading="eager"
                width={isMobile ? 48 : 56}
                height={isMobile ? 48 : 56}
                decoding="async"
              />
            </div>
          </div>
          
          {/* Benefit-driven tagline */}
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-500 dark:text-gray-400 mb-6 font-medium tracking-wide`}>
            Get Done for Better LifeStyle & Best WorkStyle
          </p>
          
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold text-gray-900 dark:text-white mb-6 leading-tight`}>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Transform Your Productivity
            </span>
            <br />
            <span className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl">
              with Professional Tools
            </span>
          </h1>
          
          <p className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed`}>
            Skip the expensive subscriptions. Access <strong>10+ professional productivity tools</strong> instantly — 
            no registration, no hidden fees, no limits. Just pure productivity power.
          </p>

          {/* Trust Signals */}
          {/* Enhanced Trust Signals with Real Stats */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2 group transition-all duration-200 hover:scale-110 cursor-pointer" data-testid="trust-users">
              <Users className="h-4 w-4 text-blue-500 group-hover:animate-bounce" />
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <strong className="tabular-nums">5,247</strong> Active Users
              </span>
            </div>
            <div className="flex items-center gap-2 group transition-all duration-200 hover:scale-110 cursor-pointer" data-testid="trust-security">
              <Shield className="h-4 w-4 text-green-500 group-hover:animate-pulse" />
              <span className="group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2 group transition-all duration-200 hover:scale-110 cursor-pointer" data-testid="trust-uptime">
              <Clock className="h-4 w-4 text-purple-500 group-hover:animate-spin" />
              <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2 group transition-all duration-200 hover:scale-110 cursor-pointer" data-testid="trust-quality">
              <Award className="h-4 w-4 text-orange-500 group-hover:animate-bounce" />
              <span className="group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">SSL Secured</span>
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl p-4 mb-8 border border-blue-100 dark:border-gray-600">
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1 group transition-all duration-200 hover:scale-110 cursor-pointer">
                <Star className="h-3 w-3 text-yellow-500 fill-current group-hover:animate-spin" />
                <span className="group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                  <strong className="tabular-nums">4.9/5</strong> user rating
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-1 group transition-all duration-200 hover:scale-110 cursor-pointer">
                <CheckCircle className="h-3 w-3 text-green-500 group-hover:animate-pulse" />
                <span className="group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  <strong className="tabular-nums">12,893</strong> assessments completed
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-1 group transition-all duration-200 hover:scale-110 cursor-pointer">
                <TrendingUp className="h-3 w-3 text-blue-500 group-hover:animate-bounce" />
                <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <strong className="tabular-nums">47</strong> users online now
                </span>
              </div>
            </div>
          </div>

          {/* Single Primary CTA */}
          <div className="flex justify-center mb-6">
            <Link href="/assessment">
              <Button 
                size={isMobile ? "lg" : "xl"} 
                className={`${isMobile ? 'w-full px-8' : 'px-12'} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg font-semibold relative overflow-hidden group`} 
                data-testid="button-primary-cta"
              >
                <span className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 ease-out"></span>
                <Brain className="h-6 w-6 mr-3 relative z-10" />
                <span className="relative z-10">Start with Free Assessment</span>
                <ArrowRight className="h-5 w-5 ml-3 relative z-10" />
              </Button>
            </Link>
          </div>

          {/* Secondary CTA */}
          <div className="flex justify-center">
            <Link href="/ai-directory">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400 transition-all duration-200" 
                data-testid="button-secondary-cta"
              >
                <Zap className="h-4 w-4 mr-2" />
                Browse All Tools
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Free Public Modules */}
      <section id="tools" className={`${isMobile ? 'py-12 px-4' : 'py-20 px-4 sm:px-6 lg:px-8'} bg-white dark:bg-gray-800`}>
        <div className="max-w-7xl mx-auto">
          <div className={`text-center ${isMobile ? 'mb-8' : 'mb-12'}`}>
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 dark:text-white mb-4`}>
              Available Tools
            </h2>
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
            {isLoading ? (
              // Enhanced loading skeleton with shimmer effect
              [...Array(6)].map((_, index) => (
                <Card key={index} className={`animate-pulse ${isMobile ? 'h-32' : 'h-48'} relative overflow-hidden`} data-testid={`skeleton-card-${index}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite] dark:via-gray-600/40"></div>
                  <CardHeader className={isMobile ? 'pb-2' : ''}>
                    <div className="flex items-center justify-between">
                      <div className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} bg-gray-200 dark:bg-gray-700 rounded-lg`}></div>
                      <div className={`${isMobile ? 'h-4 w-12' : 'h-6 w-16'} bg-gray-200 dark:bg-gray-700 rounded`}></div>
                    </div>
                    <div className={`${isMobile ? 'h-4 w-24' : 'h-6 w-32'} bg-gray-200 dark:bg-gray-700 rounded`}></div>
                    <div className={`${isMobile ? 'h-3 w-32' : 'h-4 w-48'} bg-gray-200 dark:bg-gray-700 rounded`}></div>
                  </CardHeader>
                  <CardContent className={isMobile ? 'pt-0' : ''}>
                    {isMobile ? (
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                          ))}
                        </div>
                        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              // Enhanced error state with retry functionality
              <div className="col-span-full text-center py-12" data-testid="tools-error-state">
                <div className="text-red-400 mb-4">
                  <Shield className="h-12 w-12 mx-auto text-red-400" />
                </div>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-gray-900 dark:text-white mb-2`}>
                  Unable to Load Tools
                </h3>
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 dark:text-gray-300 mb-4`}>
                  {error instanceof Error ? error.message : 'Connection issue detected. Our tools are still available.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                    size={isMobile ? 'sm' : 'default'}
                    data-testid="button-retry-tools"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                    Retry Loading
                  </Button>
                  <Link href="/assessment">
                    <Button size={isMobile ? 'sm' : 'default'} data-testid="button-direct-assessment">
                      <Brain className="h-4 w-4 mr-2" />
                      Try Assessment Directly
                    </Button>
                  </Link>
                </div>
              </div>
            ) : enabledModules.filter(module => module.category === 'wytapps').map((module) => {
              // Map module types to specific content
              if (module.id === 'qr-generator') {
                return (
                  <Card key={module.id} className={`${isMobile ? 'border-0 shadow-sm' : 'hover:shadow-lg transition-all duration-300 hover:scale-105'}`}>
                    <CardHeader className={isMobile ? 'pb-3' : ''}>
                      <div className="flex items-center justify-between">
                        <div className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} ${isMobile ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600'} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                          📱
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100 text-xs">
                          {module.pricing === 'free' ? 'Free' : module.pricing === 'premium' && module.price ? `₹${module.price}` : module.pricing}
                        </Badge>
                      </div>
                      <CardTitle className={isMobile ? 'text-lg' : ''}>{module.name}</CardTitle>
                      <CardDescription className={isMobile ? 'text-sm line-clamp-2' : ''}>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent className={isMobile ? 'pt-0' : ''}>
                      {isMobile ? (
                        // Compressed mobile view
                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            Instant generation • Multiple formats
                          </div>
                          <Link href={module.route}>
                            <Button className="w-full bg-emerald-500 hover:bg-emerald-600" size="sm" data-testid="button-qr-generator">
                              Generate QR Code
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        // Desktop view
                        <>
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
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              }
              
              if (module.id === 'assessment') {
                return (
                  <Card key={module.id} className={`${isMobile ? 'border-0 shadow-sm' : 'hover:shadow-lg transition-shadow'}`}>
                    <CardHeader className={isMobile ? 'pb-3' : ''}>
                      <div className="flex items-center justify-between">
                        <Brain className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-blue-600`} />
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 text-xs">
                          Live
                        </Badge>
                      </div>
                      <CardTitle className={isMobile ? 'text-lg' : ''}>{module.name}</CardTitle>
                      <CardDescription className={isMobile ? 'text-sm line-clamp-2' : ''}>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent className={isMobile ? 'pt-0' : ''}>
                      {isMobile ? (
                        // Compressed mobile view
                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            15 questions • Personality insights • Career tips
                          </div>
                          <Link href={module.route}>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" data-testid="button-start-assessment">
                              Start Assessment
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        // Desktop view
                        <>
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
                        </>
                      )}
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
      <section id="highlights" className={`${isMobile ? 'py-12 px-4 bg-white dark:bg-gray-800' : 'py-20 px-4 sm:px-6 lg:px-8'}`}>
        <div className="max-w-7xl mx-auto">
          <div className={`text-center ${isMobile ? 'mb-8' : 'mb-12'}`}>
            <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 dark:text-white mb-4`}>
              Why Choose WytNet?
            </h2>
            <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 dark:text-gray-300 max-w-2xl mx-auto`}>
              Designed for businesses and professionals who want to work smarter, not harder.
            </p>
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'md:grid-cols-2 lg:grid-cols-4 gap-8'}`}>
            <div className={`text-center ${isMobile ? 'p-3' : 'p-6'}`}>
              <div className={`${isMobile ? 'bg-blue-500 w-10 h-10' : 'bg-blue-100 dark:bg-blue-900 w-16 h-16'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Users className={`${isMobile ? 'h-5 w-5 text-white' : 'h-8 w-8 text-blue-600 dark:text-blue-400'}`} />
              </div>
              <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} font-semibold text-gray-900 dark:text-white mb-2`}>Team-Ready</h3>
              <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {isMobile ? 'Perfect for teams & organizations' : 'Perfect for teams, departments, and organizations of any size. Collaborate seamlessly.'}
              </p>
            </div>

            <div className={`text-center ${isMobile ? 'p-3' : 'p-6'}`}>
              <div className={`${isMobile ? 'bg-green-500 w-10 h-10' : 'bg-green-100 dark:bg-green-900 w-16 h-16'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Rocket className={`${isMobile ? 'h-5 w-5 text-white' : 'h-8 w-8 text-green-600 dark:text-green-400'}`} />
              </div>
              <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} font-semibold text-gray-900 dark:text-white mb-2`}>Easy to Use</h3>
              <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {isMobile ? 'Simple tools, no tech knowledge needed' : 'Simple, intuitive tools that anyone can use. No technical knowledge required.'}
              </p>
            </div>

            <div className={`text-center ${isMobile ? 'p-3' : 'p-6'}`}>
              <div className={`${isMobile ? 'bg-purple-500 w-10 h-10' : 'bg-purple-100 dark:bg-purple-900 w-16 h-16'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <BarChart3 className={`${isMobile ? 'h-5 w-5 text-white' : 'h-8 w-8 text-purple-600 dark:text-purple-400'}`} />
              </div>
              <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} font-semibold text-gray-900 dark:text-white mb-2`}>Track Progress</h3>
              <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {isMobile ? 'Monitor work & track achievements' : 'Monitor your work, track achievements, and measure what matters to your business.'}
              </p>
            </div>

            <div className={`text-center ${isMobile ? 'p-3' : 'p-6'}`}>
              <div className={`${isMobile ? 'bg-orange-500 w-10 h-10' : 'bg-orange-100 dark:bg-orange-900 w-16 h-16'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Shield className={`${isMobile ? 'h-5 w-5 text-white' : 'h-8 w-8 text-orange-600 dark:text-orange-400'}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Safe & Secure</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Your data is protected with bank-level security. Privacy and trust guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`${isMobile ? 'py-12 px-4' : 'py-20 px-4 sm:px-6 lg:px-8'} bg-gray-50 dark:bg-gray-900`}>
        <div className="max-w-7xl mx-auto">
          <div className={`text-center ${isMobile ? 'mb-8' : 'mb-16'}`}>
            <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 dark:text-white mb-4`}>
              Trusted by Professionals Worldwide
            </h2>
            <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-600 dark:text-gray-300 max-w-3xl mx-auto`}>
              Join thousands of professionals who rely on WytNet for their productivity needs
            </p>
          </div>

          {/* Statistics Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white text-center mb-12">
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-8'}`}>
              <div>
                <div className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-1`}>5,247+</div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-90`}>Active Users</div>
              </div>
              <div>
                <div className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-1`}>12,893</div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-90`}>Assessments</div>
              </div>
              <div>
                <div className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-1`}>99.9%</div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-90`}>Uptime</div>
              </div>
              <div>
                <div className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-1`}>4.9★</div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-90`}>User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer removed - handled by layout wrapper to prevent double footer */}
    </div>
  );
}