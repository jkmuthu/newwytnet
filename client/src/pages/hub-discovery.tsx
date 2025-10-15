import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Network, ExternalLink, Star, Users, TrendingUp, UserPlus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MarketplaceHub {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon?: string;
  coverImage?: string;
  isActive: boolean;
  isFeatured: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function HubDiscovery() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: hubs, isLoading, error } = useQuery<MarketplaceHub[]>({
    queryKey: ["/api/marketplace/hubs"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const subscribeMutation = useMutation({
    mutationFn: (hubId: string) => apiRequest(`/api/hub-subscriptions`, {
      method: 'POST',
      body: JSON.stringify({ hubId })
    }),
    onSuccess: (data) => {
      toast({
        title: "Subscribed Successfully!",
        description: "You can now access this hub from your dashboard.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hub-subscriptions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Could not subscribe to hub. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubscribe = (hubId: string) => {
    if (!user) {
      setLocation('/login?redirect=/hub-discovery');
      return;
    }
    subscribeMutation.mutate(hubId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="error-message-title">Unable to load hubs</h2>
          <p className="text-muted-foreground" data-testid="error-message-description">Please try again later.</p>
        </div>
      </div>
    );
  }

  const featuredHubs = hubs?.filter(hub => hub.isFeatured && hub.isActive) || [];
  const regularHubs = hubs?.filter(hub => !hub.isFeatured && hub.isActive) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Network className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">WytHubs</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover curated collections of tools, resources, and content hubs tailored for different use cases and industries.
          </p>
        </div>

        {/* Featured Hubs */}
        {featuredHubs.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-2xl font-semibold text-foreground">Featured Hubs</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredHubs.map((hub) => (
                <Card key={hub.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`featured-hub-${hub.slug}`}>
                  {hub.coverImage && (
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                      <img 
                        src={hub.coverImage} 
                        alt={hub.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-1">{hub.name}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mb-2">
                          {hub.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{hub.itemCount} items</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {hub.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Link href={`/hub/${hub.slug}`} className="flex-1">
                        <Button variant="outline" className="w-full" data-testid={`button-explore-${hub.slug}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Explore
                        </Button>
                      </Link>
                      <Button 
                        onClick={() => handleSubscribe(hub.id)}
                        disabled={subscribeMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        data-testid={`button-subscribe-${hub.slug}`}
                      >
                        {subscribeMutation.isPending ? (
                          <>Subscribing...</>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            {user ? 'Subscribe' : 'Login to Subscribe'}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Hubs */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h2 className="text-2xl font-semibold text-foreground">All Hubs</h2>
          </div>
          
          {regularHubs.length === 0 ? (
            <div className="text-center py-12">
              <Network className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="empty-state-title">No hubs available</h3>
              <p className="text-muted-foreground" data-testid="empty-state-description">Check back later for new content hubs.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularHubs.map((hub) => (
                <Card key={hub.id} className="overflow-hidden hover:shadow-md transition-shadow" data-testid={`hub-${hub.slug}`}>
                  {hub.coverImage && (
                    <div className="h-24 bg-gradient-to-r from-gray-400 to-gray-600">
                      <img 
                        src={hub.coverImage} 
                        alt={hub.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{hub.name}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {hub.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{hub.itemCount} items</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {hub.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/hub/${hub.slug}`} className="flex-1">
                        <Button variant="outline" className="w-full" data-testid={`button-view-${hub.slug}`}>
                          View
                        </Button>
                      </Link>
                      <Button 
                        onClick={() => handleSubscribe(hub.id)}
                        disabled={subscribeMutation.isPending}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        data-testid={`button-subscribe-regular-${hub.slug}`}
                      >
                        {subscribeMutation.isPending ? (
                          <>Subscribing...</>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1" />
                            {user ? 'Subscribe' : 'Login to Subscribe'}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}