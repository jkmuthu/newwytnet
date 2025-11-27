import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, 
  Globe, 
  Sparkles, 
  Users, 
  Zap, 
  Star,
  Heart,
  Shield,
  Rocket,
  Building2,
  QrCode,
  Brain,
  Calculator,
  CreditCard,
  Target,
  RotateCcw,
  Quote,
  Grid3X3
} from "lucide-react";
import { useLocation } from "wouter";
import { fetchEnabledPlatformModules, PlatformModule } from "@/lib/api";

interface HomeContentSectionsProps {
  isAuthenticated: boolean;
}

export default function HomeContentSections({ isAuthenticated }: HomeContentSectionsProps) {
  const [, navigate] = useLocation();

  const { data: enabledModules = [], isLoading } = useQuery({
    queryKey: ['platform-modules', 'enabled'],
    queryFn: fetchEnabledPlatformModules,
    staleTime: 5 * 60 * 1000,
  });

  const wytApps = enabledModules.filter(module => module.category === 'wytapps').slice(0, 6);

  const getAppIcon = (appId: string) => {
    switch (appId) {
      case 'qr-generator': return <QrCode className="h-5 w-5" />;
      case 'assessment': return <Brain className="h-5 w-5" />;
      case 'ai-directory': return <Zap className="h-5 w-5" />;
      case 'invoice-generator': return <CreditCard className="h-5 w-5" />;
      case 'expense-calculator': return <Calculator className="h-5 w-5" />;
      case 'business-card-designer': return <CreditCard className="h-5 w-5" />;
      case 'habit-tracker': return <Target className="h-5 w-5" />;
      case 'unit-converter': return <RotateCcw className="h-5 w-5" />;
      case 'quote-generator': return <Quote className="h-5 w-5" />;
      case 'astro-predictor': return <Star className="h-5 w-5" />;
      default: return <Grid3X3 className="h-5 w-5" />;
    }
  };

  const getAppGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
      'from-green-500 to-emerald-600',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="space-y-6 mt-8">
      
      {/* Intro Content Card */}
      <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        
        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome to WytWall
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-4">
                Your digital marketplace for opportunities, services, and connections. 
                Post your needs, discover offers, and connect with a thriving community 
                of professionals and businesses across various industries.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  Growing Community
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium">
                  <Shield className="h-3.5 w-3.5 mr-1.5" />
                  Verified Users
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
                  <Rocket className="h-3.5 w-3.5 mr-1.5" />
                  Smart Matching
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured WytApps Section */}
      <Card className="border-0 shadow-xl rounded-2xl bg-white dark:bg-gray-800 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Featured WytApps</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Boost your productivity with smart tools</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/wytapps')}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
              data-testid="button-view-all-apps"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : wytApps.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wytApps.map((app, index) => (
                <div
                  key={app.id}
                  onClick={() => navigate(`/app/${app.id}`)}
                  className="group cursor-pointer p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-[1.02] hover:shadow-md"
                  data-testid={`app-card-${app.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 bg-gradient-to-br ${getAppGradient(index)} rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      {getAppIcon(app.id)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{app.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{app.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Grid3X3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Apps coming soon!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WytHubs + WytLife Dual Promo Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* WytHubs Promo Card */}
        <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl group hover:scale-[1.02] transition-all cursor-pointer"
              onClick={() => navigate('/wythubs')}
              data-testid="promo-card-wythubs">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          
          <CardContent className="relative p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">WytHubs</h3>
                <p className="text-sm text-white/80 leading-relaxed mb-3">
                  Discover specialized communities and niche platforms built on WytNet ecosystem
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white border-0 text-xs">
                    <Building2 className="h-3 w-3 mr-1" />
                    5+ Active Hubs
                  </Badge>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white/90 hover:bg-white text-blue-600 font-semibold shadow-lg"
              >
                Explore Hubs
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WytLife Promo Card */}
        <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl group hover:scale-[1.02] transition-all cursor-pointer"
              onClick={() => navigate('/wytlife')}
              data-testid="promo-card-wytlife">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          
          <CardContent className="relative p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">WytLife</h3>
                <p className="text-sm text-white/80 leading-relaxed mb-3">
                  Your complete lifestyle companion for health, wellness, and personal growth
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white border-0 text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Coming Soon
                  </Badge>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white/90 hover:bg-white text-pink-600 font-semibold shadow-lg"
              >
                Learn More
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
