import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Bell, 
  BellOff,
  ExternalLink,
  Package,
  Zap
} from "lucide-react";

interface Hub {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  pricing: string;
  price?: number;
  currency?: string;
  features: string[];
  route: string;
  status: string;
  type: string;
}

interface UserSubscription {
  hubId: string;
  subscribedAt: string;
}

export default function MyWytHubs() {
  const { toast } = useToast();
  const [subscribedHubs, setSubscribedHubs] = useState<Set<string>>(new Set());

  // Fetch hubs catalog
  const { data: catalogData, isLoading: catalogLoading } = useQuery({
    queryKey: ['/api/apps/catalog'],
  });

  const allModules: Hub[] = (catalogData as any)?.apps || [];
  
  // Filter to show only WytHubs
  const hubs = allModules.filter(module => 
    module.category === 'wythubs'
  );

  // Subscribe mutation (mock for now)
  const subscribeMutation = useMutation({
    mutationFn: async (hubId: string) => {
      // This would be a real API call
      return { success: true, message: `Subscribed to hub: ${hubId}` };
    },
    onSuccess: (data, hubId) => {
      setSubscribedHubs(prev => new Set(prev).add(hubId));
      toast({
        title: "Subscribed",
        description: "You'll receive updates from this hub",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to subscribe to hub",
        variant: "destructive",
      });
    },
  });

  // Unsubscribe mutation (mock for now)
  const unsubscribeMutation = useMutation({
    mutationFn: async (hubId: string) => {
      return { success: true, message: `Unsubscribed from hub: ${hubId}` };
    },
    onSuccess: (data, hubId) => {
      setSubscribedHubs(prev => {
        const newSet = new Set(prev);
        newSet.delete(hubId);
        return newSet;
      });
      toast({
        title: "Unsubscribed",
        description: "You won't receive updates from this hub",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unsubscribe Failed",
        description: error.message || "Failed to unsubscribe from hub",
        variant: "destructive",
      });
    },
  });

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Zap,
      Package,
    };
    const IconComponent = icons[iconName] || Package;
    return <IconComponent className="h-8 w-8" />;
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: 'from-purple-500 to-purple-700',
      orange: 'from-orange-500 to-orange-700',
      blue: 'from-blue-500 to-blue-700',
      yellow: 'from-yellow-500 to-yellow-700',
      green: 'from-green-500 to-green-700',
      teal: 'from-teal-500 to-teal-700',
      indigo: 'from-indigo-500 to-indigo-700',
    };
    return colorMap[color] || 'from-blue-500 to-purple-600';
  };

  const HubCard = ({ hub }: { hub: Hub }) => {
    const isSubscribed = subscribedHubs.has(hub.id);
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50" data-testid={`card-hub-${hub.id}`}>
        <CardHeader>
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getColorClass(hub.color)} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
            {getIconComponent(hub.icon)}
          </div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 flex items-center gap-2">
                {hub.name}
                {hub.pricing === 'premium' && (
                  <Badge variant="secondary" className="text-xs">
                    Premium
                  </Badge>
                )}
                {hub.pricing === 'freemium' && (
                  <Badge variant="outline" className="text-xs">
                    Freemium
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {hub.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {hub.features && hub.features.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Features:</p>
              <ul className="space-y-1">
                {hub.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {isSubscribed ? (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => unsubscribeMutation.mutate(hub.id)}
                disabled={unsubscribeMutation.isPending}
                data-testid={`button-unsubscribe-${hub.id}`}
              >
                <BellOff className="h-4 w-4 mr-2" />
                Unsubscribe
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={() => subscribeMutation.mutate(hub.id)}
                disabled={subscribeMutation.isPending}
                data-testid={`button-subscribe-${hub.id}`}
              >
                <Bell className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            )}
            
            {hub.route && (
              <Button
                variant="secondary"
                size="icon"
                onClick={() => window.open(hub.route, '_blank')}
                data-testid={`button-open-${hub.id}`}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="heading-wythubs">
            WytHubs
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Subscribe to hubs and stay updated with curated content
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2" data-testid="badge-hub-count">
          {hubs.length} Hubs
        </Badge>
      </div>

      {catalogLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : hubs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Hubs Available
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Check back soon for new hubs
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubs.map(hub => (
            <HubCard key={hub.id} hub={hub} />
          ))}
        </div>
      )}
    </div>
  );
}
