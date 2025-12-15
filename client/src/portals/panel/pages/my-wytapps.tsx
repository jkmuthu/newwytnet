import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  Trash2, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Award,
  FileText,
  CreditCard,
  Package,
  ExternalLink
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface App {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category?: string;
  pricing: string;
  price?: number;
  currency?: string;
  features: string[];
  route: string;
  status: string;
  appType?: string;
  isCoreApp?: boolean;
}

interface UserApp {
  installation: {
    id: string;
    userId: string;
    appSlug: string;
    installedAt: string;
    status: string;
    subscriptionTier: string;
  };
  app: App;
}

export default function MyWytApps() {
  const { toast } = useToast();
  const [appToRemove, setAppToRemove] = useState<{ slug: string; name: string } | null>(null);
  const [hasSynced, setHasSynced] = useState(false);

  // Sync mandatory apps on component mount (for existing users)
  useEffect(() => {
    if (!hasSynced) {
      apiRequest('/api/apps/sync-mandatory', 'POST', {})
        .then(() => {
          setHasSynced(true);
          queryClient.invalidateQueries({ queryKey: ['/api/apps/my-apps'] });
        })
        .catch(() => {
          setHasSynced(true);
        });
    }
  }, [hasSynced]);

  // Fetch apps catalog
  const { data: catalogData, isLoading: catalogLoading } = useQuery({
    queryKey: ['/api/apps/catalog'],
  });

  // Fetch user's installed apps
  const { data: myAppsData, isLoading: myAppsLoading } = useQuery({
    queryKey: ['/api/apps/my-apps'],
  });

  const allApps: App[] = (catalogData as any)?.apps || [];
  const myApps: UserApp[] = (myAppsData as any)?.apps || [];
  const installedSlugs = new Set(myApps.map(ua => ua.app?.slug || ua.installation?.appSlug));
  
  // Show all available apps (not already installed)
  const availableApps = allApps.filter(app => !installedSlugs.has(app.slug));

  // Install app mutation
  const installMutation = useMutation({
    mutationFn: async (appSlug: string) => {
      const response = await apiRequest('/api/apps/install', 'POST', { appSlug });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "App Installed",
        description: data?.message || "App has been added to your collection",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/apps/my-apps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/apps/catalog'] });
    },
    onError: (error: any) => {
      toast({
        title: "Installation Failed",
        description: error?.message || "Failed to install app",
        variant: "destructive",
      });
    },
  });

  // Uninstall app mutation
  const uninstallMutation = useMutation({
    mutationFn: async (appSlug: string) => {
      return apiRequest(`/api/apps/uninstall/${appSlug}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "App Removed",
        description: "App has been removed from your collection",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/apps/my-apps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/apps/catalog'] });
      setAppToRemove(null);
    },
    onError: (error: any) => {
      toast({
        title: "Removal Failed",
        description: error.message || "Failed to remove app",
        variant: "destructive",
      });
      setAppToRemove(null);
    },
  });

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Award,
      FileText,
      CreditCard,
      Zap,
      Package,
    };
    const IconComponent = icons[iconName] || Package;
    return <IconComponent className="h-6 w-6" />;
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: 'from-purple-500 to-purple-700',
      orange: 'from-orange-500 to-orange-700',
      blue: 'from-blue-500 to-blue-700',
      yellow: 'from-yellow-500 to-yellow-700',
      green: 'from-green-500 to-green-700',
    };
    return colorMap[color] || 'from-blue-500 to-purple-600';
  };

  const getPricingBadge = (app: App) => {
    // Core apps are always free
    if (app.isCoreApp) {
      return { text: 'FREE', variant: 'default' as const };
    }
    
    const pricing = app.pricing?.toLowerCase() || 'free';
    const price = app.price || 0;
    const currency = app.currency || '₹';
    
    if (pricing === 'free' || price === 0) {
      return { text: 'FREE', variant: 'default' as const };
    }
    
    if (pricing === 'pay_per_use') {
      return { text: `₹${price}/use`, variant: 'secondary' as const };
    }
    
    if (pricing === 'monthly') {
      return { text: `₹${price}/mo`, variant: 'secondary' as const };
    }
    
    if (pricing === 'yearly') {
      return { text: `₹${price}/yr`, variant: 'secondary' as const };
    }
    
    if (pricing === 'one_time') {
      return { text: `₹${price}`, variant: 'secondary' as const };
    }
    
    // Default: show price
    return { text: `${currency} ${price}`, variant: 'secondary' as const };
  };

  const AppCard = ({ app, isInstalled }: { app: App; isInstalled: boolean }) => {
    const pricingBadge = getPricingBadge(app);
    
    return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`card-app-${app.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={`h-12 w-12 bg-gradient-to-br ${getColorClass(app.color)} rounded-xl flex items-center justify-center text-white shadow-md`}>
            {getIconComponent(app.icon)}
          </div>
          <Badge variant={pricingBadge.variant}>
            {pricingBadge.text}
          </Badge>
        </div>
        <CardTitle className="mt-4">{app.name}</CardTitle>
        <CardDescription>{app.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {app.features?.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
{isInstalled ? (
          <div className="space-y-2">
            <Link href={`/a/${app.slug}`} className="block">
              <Button className="w-full" variant="default" data-testid={`button-switch-${app.slug}`}>
                <Package className="h-4 w-4 mr-2" />
                Switch to App
              </Button>
            </Link>
            <div className="flex gap-2">
              <Link href={app.route || `/mypanel/wytapps/${app.slug}`} className="flex-1">
                <Button variant="outline" className="w-full" data-testid={`button-open-${app.slug}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Quick View
                </Button>
              </Link>
              {!app.isCoreApp && app.appType !== 'mandatory' && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => setAppToRemove({ slug: app.slug, name: app.name })}
                  disabled={uninstallMutation.isPending}
                  data-testid={`button-remove-${app.slug}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={() => installMutation.mutate(app.slug)}
            disabled={installMutation.isPending}
            data-testid={`button-add-${app.slug}`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add App
          </Button>
        )}
      </CardContent>
    </Card>
  );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My WytApps</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Browse and manage your installed apps
        </p>
      </div>

      <Tabs defaultValue="my-apps" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="my-apps" data-testid="tab-my-apps">
            Added Apps ({myApps.length})
          </TabsTrigger>
          <TabsTrigger value="available" data-testid="tab-available">
            Available Apps ({availableApps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-apps" className="mt-6">
          {myAppsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : myApps.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Apps Installed
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                  Browse available apps and add them to your collection
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myApps.map(({ app }) => (
                <AppCard key={app.id} app={app} isInstalled={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          {catalogLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : availableApps.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  All Apps Installed
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  You have installed all available apps!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableApps.map((app) => (
                <AppCard key={app.id} app={app} isInstalled={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Removal Confirmation Dialog */}
      <AlertDialog open={!!appToRemove} onOpenChange={(open) => !open && setAppToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Remove {appToRemove?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Removing this app will permanently delete all your data associated with it, including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All created content and settings</li>
                <li>Historical data and records</li>
                <li>Points and achievements earned</li>
              </ul>
              <p className="mt-3 font-semibold text-red-600">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-remove">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => appToRemove && uninstallMutation.mutate(appToRemove.slug)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-remove"
            >
              Remove App
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
