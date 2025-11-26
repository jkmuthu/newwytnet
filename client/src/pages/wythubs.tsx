import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Network, 
  Globe, 
  Users, 
  Building2, 
  Briefcase, 
  ShoppingBag, 
  Code2,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield
} from "lucide-react";
import { Link } from "wouter";

interface PlatformHub {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  domains: string[] | null;
  isActive: boolean;
  createdAt: string;
}

const hubIcons: Record<string, any> = {
  'wytnet': Globe,
  'ownernet': Building2,
  'devhub': Code2,
  'marketplace': ShoppingBag,
  'default': Network
};

const hubColors: Record<string, string> = {
  'wytnet': 'from-blue-500 to-purple-600',
  'ownernet': 'from-green-500 to-teal-600',
  'devhub': 'from-orange-500 to-red-600',
  'marketplace': 'from-pink-500 to-rose-600',
  'default': 'from-gray-500 to-slate-600'
};

export default function WytHubs() {
  const { data: hubs, isLoading, error } = useQuery<PlatformHub[]>({
    queryKey: ["/api/platform-hubs"],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const activeHubs = hubs?.filter(hub => hub.isActive) || [];

  const getHubIcon = (slug: string) => {
    const IconComponent = hubIcons[slug] || hubIcons['default'];
    return <IconComponent className="h-8 w-8" />;
  };

  const getHubColor = (slug: string) => {
    return hubColors[slug] || hubColors['default'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Network className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                NEW
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            WytHubs
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover and connect with <strong>specialized community hubs</strong> tailored for different industries, 
            interests, and use cases. Each hub offers curated apps, content, and networking opportunities.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm">
            <div className="flex items-center text-purple-600 font-medium">
              <CheckCircle className="h-5 w-5 mr-2" />
              White-Label Platforms
            </div>
            <div className="flex items-center text-blue-600 font-medium">
              <Users className="h-5 w-5 mr-2" />
              Community Powered
            </div>
            <div className="flex items-center text-green-600 font-medium">
              <Shield className="h-5 w-5 mr-2" />
              Secure & Trusted
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/hub-discovery">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8" data-testid="button-explore-hubs">
                Explore All Hubs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="px-8" data-testid="button-learn-more">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What are WytHubs Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What are WytHubs?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              WytHubs are specialized digital ecosystems built on the WytNet platform, 
              each serving unique communities with tailored experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle>White-Label Solutions</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600 dark:text-gray-300">
                Each hub operates as an independent platform with custom branding, 
                domains, and configurations while sharing the powerful WytNet infrastructure.
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Community Focus</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600 dark:text-gray-300">
                Connect with like-minded individuals, share resources, and collaborate 
                within purpose-built communities designed for specific industries.
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Curated Apps & Tools</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600 dark:text-gray-300">
                Each hub features carefully selected WytApps and modules relevant 
                to its community, providing everything needed in one place.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Hubs Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Hubs
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our growing network of specialized platforms
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-32 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Unable to load hubs. Please try again later.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeHubs.map((hub) => (
                <Card key={hub.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-lg bg-white dark:bg-gray-800" data-testid={`hub-card-${hub.slug}`}>
                  <div className={`h-24 bg-gradient-to-r ${getHubColor(hub.slug)} flex items-center justify-center`}>
                    <div className="text-white">
                      {getHubIcon(hub.slug)}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      {hub.name}
                      {hub.slug === 'wytnet' && (
                        <Badge variant="secondary" className="text-xs">Main</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {hub.description || `Welcome to ${hub.name} - your specialized digital hub.`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/h/${hub.slug}`}>
                      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors" data-testid={`button-visit-${hub.slug}`}>
                        Visit Hub
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              {activeHubs.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Network className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No hubs available yet. Check back soon!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your Own Hub?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Launch your own white-label platform powered by WytNet's robust infrastructure. 
            Perfect for businesses, communities, and organizations.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary" className="px-8" data-testid="button-contact-us">
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
