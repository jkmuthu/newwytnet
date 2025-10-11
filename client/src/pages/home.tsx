import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Shield, Rocket, CheckCircle, ArrowRight, Users, BarChart3, Star, TrendingUp, Heart, Award, Clock, Sparkles } from "lucide-react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useQuery } from "@tanstack/react-query";
import { fetchEnabledPlatformModules } from "@/lib/api";

export default function Home() {
  const { isMobile } = useDeviceDetection();
  
  const { data: enabledModules = [], isLoading, error } = useQuery({
    queryKey: ['platform-modules', 'enabled'],
    queryFn: fetchEnabledPlatformModules,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950">
      
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-gradient-to-bl from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mobile Sticky CTA */}
      {isMobile && (
        <div className="fixed bottom-20 left-4 right-4 z-40">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-4 flex items-center justify-between backdrop-blur-xl border border-white/20">
            <div className="text-white">
              <p className="text-sm font-bold">Start Free Assessment</p>
              <p className="text-xs opacity-90">No signup required</p>
            </div>
            <Link href="/assessment">
              <Button size="sm" className="bg-white/90 hover:bg-white text-purple-600 font-semibold" data-testid="mobile-sticky-cta">
                <Brain className="h-4 w-4 mr-1" />
                Start
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className={`relative px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12 pt-16' : 'py-24 pt-32'}`}>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          
          {/* Floating Badge */}
          <div className="flex justify-center mb-8 animate-bounce">
            <Badge className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-6 py-2.5 text-sm font-bold shadow-2xl border-0 rounded-full" data-testid="badge-free-forever">
              <Sparkles className="h-4 w-4 mr-2 animate-spin" style={{ animationDuration: '3s' }} />
              100% FREE FOREVER
            </Badge>
          </div>

          {/* Logo with Glow Effect */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img 
                src="/wytnet-logo.png" 
                alt="WytNet" 
                className={`relative ${isMobile ? 'h-14' : 'h-16'} w-auto drop-shadow-2xl`}
                loading="eager"
              />
            </div>
          </div>

          {/* Tagline */}
          <p className={`${isMobile ? 'text-base' : 'text-xl'} text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-8 font-bold tracking-wide`}>
            Get Done for Better LifeStyle & Best WorkStyle
          </p>

          {/* Main Headline */}
          <h1 className={`${isMobile ? 'text-3xl' : 'text-6xl md:text-7xl'} font-black mb-8 leading-tight`}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient">
              Transform Your
            </span>
            <br />
            <span className="text-gray-900 dark:text-white drop-shadow-lg">
              Productivity
            </span>
          </h1>

          {/* Subheadline */}
          <p className={`${isMobile ? 'text-lg' : 'text-2xl'} text-gray-700 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-medium`}>
            Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold">10+ professional tools</span> instantly.
            <br className="hidden md:block" />
            No registration. No fees. Just pure productivity.
          </p>

          {/* Trust Signals with Modern Design */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-xl border border-white/20 hover:scale-110 transition-transform" data-testid="trust-users">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-gray-900 dark:text-white">5,247 Users</span>
            </div>
            <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-xl border border-white/20 hover:scale-110 transition-transform" data-testid="trust-security">
              <Shield className="h-5 w-5 text-emerald-600" />
              <span className="font-bold text-gray-900 dark:text-white">Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-xl border border-white/20 hover:scale-110 transition-transform" data-testid="trust-rating">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span className="font-bold text-gray-900 dark:text-white">4.9/5 Rating</span>
            </div>
          </div>

          {/* CTAs with Modern Design */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/assessment">
              <Button 
                size="lg"
                className={`${isMobile ? 'w-full' : ''} px-10 py-7 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white text-lg font-bold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 rounded-2xl border-0 group`}
                data-testid="button-primary-cta"
              >
                <Brain className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                Start Free Assessment
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/ai-directory">
              <Button 
                variant="outline" 
                size="lg" 
                className={`${isMobile ? 'w-full' : ''} px-10 py-7 text-lg font-bold bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 rounded-2xl shadow-xl group`}
                data-testid="button-secondary-cta"
              >
                <Zap className="h-5 w-5 mr-2 group-hover:text-yellow-500 transition-colors" />
                Browse All Tools
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-full px-6 py-3 border border-amber-500/20">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              <strong className="text-amber-600">47</strong> users online now
            </span>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className={`relative ${isMobile ? 'py-16 px-4' : 'py-24 px-4 sm:px-6 lg:px-8'} z-10`}>
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2">
              <Rocket className="h-4 w-4 mr-2" />
              Available Tools
            </Badge>
            <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-black text-gray-900 dark:text-white mb-4`}>
              Your Productivity Arsenal
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Professional-grade tools, completely free
            </p>
          </div>

          {/* Tools Grid */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
            {isLoading ? (
              [...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border-0 shadow-2xl" data-testid={`skeleton-card-${index}`}>
                  <CardHeader>
                    <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl"></div>
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mt-4"></div>
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mt-2"></div>
                  </CardHeader>
                </Card>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-16" data-testid="tools-error-state">
                <div className="text-red-500 mb-4">
                  <Shield className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Unable to Load Tools</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Connection issue detected</p>
                <Button onClick={() => window.location.reload()} data-testid="button-retry-tools">
                  Retry Loading
                </Button>
              </div>
            ) : enabledModules.filter(module => module.category === 'wytapps').map((module) => {
              
              if (module.id === 'qr-generator') {
                return (
                  <Card key={module.id} className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 hover:scale-105 overflow-hidden rounded-3xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl">
                          📱
                        </div>
                        <Badge className="bg-emerald-500 text-white border-0 font-bold">FREE</Badge>
                      </div>
                      <CardTitle className="text-2xl font-black text-gray-900 dark:text-white">{module.name}</CardTitle>
                      <CardDescription className="text-base text-gray-600 dark:text-gray-400">{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                          Instant QR generation
                        </div>
                        <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                          Multiple formats
                        </div>
                        <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                          Custom styling
                        </div>
                      </div>
                      <Link href={module.route}>
                        <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-6 rounded-xl shadow-xl" data-testid="button-qr-generator">
                          Generate QR Code
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              }

              if (module.id === 'assessment') {
                return (
                  <Card key={module.id} className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 hover:scale-105 overflow-hidden rounded-3xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                          <Brain className="h-8 w-8 text-white" />
                        </div>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 font-bold animate-pulse">LIVE</Badge>
                      </div>
                      <CardTitle className="text-2xl font-black text-gray-900 dark:text-white">{module.name}</CardTitle>
                      <CardDescription className="text-base text-gray-600 dark:text-gray-400">{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                          15-question assessment
                        </div>
                        <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                          Personality insights
                        </div>
                        <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                          Career recommendations
                        </div>
                      </div>
                      <Link href={module.route}>
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-6 rounded-xl shadow-xl" data-testid="button-start-assessment">
                          Start Assessment
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card key={module.id} className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-105 overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl">
                        🚀
                      </div>
                      <Badge className="bg-purple-500 text-white border-0 font-bold">{module.pricing === 'free' ? 'FREE' : module.pricing}</Badge>
                    </div>
                    <CardTitle className="text-2xl font-black text-gray-900 dark:text-white">{module.name}</CardTitle>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-400">{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <Link href={module.route}>
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-6 rounded-xl shadow-xl" data-testid={`button-${module.id}`}>
                        Explore Tool
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`relative ${isMobile ? 'py-16 px-4' : 'py-24 px-4 sm:px-6 lg:px-8'} bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950/20 z-10`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-black text-gray-900 dark:text-white mb-4`}>
              Why Choose WytNet?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Built for the modern professional
            </p>
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'md:grid-cols-3 gap-8'}`}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl p-8 text-center hover:scale-105 transition-transform">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">Instant access to all tools. No waiting, no loading.</p>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl p-8 text-center hover:scale-105 transition-transform">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">100% Secure</h3>
              <p className="text-gray-600 dark:text-gray-400">Bank-level encryption protects your data.</p>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl p-8 text-center hover:scale-105 transition-transform">
              <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Forever Free</h3>
              <p className="text-gray-600 dark:text-gray-400">No hidden charges. No subscriptions. Ever.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={`relative ${isMobile ? 'py-16 px-4' : 'py-24 px-4 sm:px-6 lg:px-8'} z-10`}>
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-0 shadow-2xl rounded-3xl p-12">
            <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-black text-white mb-6`}>
              Ready to Boost Your Productivity?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of professionals using WytNet daily
            </p>
            <Link href="/assessment">
              <Button 
                size="lg"
                className="px-12 py-7 bg-white text-purple-600 hover:bg-gray-100 text-xl font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all"
                data-testid="button-final-cta"
              >
                <Brain className="h-6 w-6 mr-3" />
                Get Started Free
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
