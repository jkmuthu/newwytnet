import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Play, 
  Download, 
  Star, 
  CheckCircle, 
  Shield, 
  Smartphone, 
  Globe, 
  Heart,
  Share2,
  ExternalLink,
  Zap,
  Users,
  Award,
  Clock,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import AppPurchaseModal from "@/components/marketplace/AppPurchaseModal";

interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  developer: string;
  version: string;
  rating: number;
  ratingCount: number;
  downloads: number;
  size: string;
  lastUpdated: string;
  screenshots: string[];
  videoUrl?: string;
  features: string[];
  permissions: string[];
  pricing: Array<{
    id: string;
    type: string;
    price: number;
    originalPrice?: number;
    duration?: string;
    features: string[];
  }>;
  owned?: boolean;
  isVerified: boolean;
  isPopular: boolean;
}

export default function AppDetail() {
  const params = useParams();
  const { toast } = useToast();
  const [selectedPricing, setSelectedPricing] = useState<string>('');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(0);

  // Fetch app details from marketplace API
  const { data: app, isLoading, error } = useQuery<MarketplaceApp>({
    queryKey: ['marketplace-app', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/marketplace/apps/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch app details');
      }
      return response.json();
    },
    enabled: !!params.id
  });

  const handlePurchase = (pricingId: string) => {
    setSelectedPricing(pricingId);
    setIsPurchaseModalOpen(true);
  };

  const handleShare = () => {
    navigator.share?.({
      title: app?.name,
      text: app?.description,
      url: window.location.href
    }).catch(() => {
      // Fallback to copy URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "App link has been copied to clipboard.",
      });
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `₹${price}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-10 w-10 bg-gray-200 rounded"></div>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">App not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The app you're looking for doesn't exist or has been removed.</p>
          <Link href="/wytapps">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to WytApps
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/wytapps">
              <Button variant="ghost" size="sm" data-testid="back-button">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/wytapps" className="hover:text-gray-900 dark:hover:text-white">WytApps</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900 dark:text-white">{app.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* App Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Smartphone className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-2xl">{app.name}</CardTitle>
                        {app.isVerified && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {app.isPopular && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Award className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{app.developer}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{app.rating}</span>
                          <span className="text-gray-500">({app.ratingCount})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4 text-gray-400" />
                          <span>{app.downloads.toLocaleString()}+ downloads</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare} data-testid="share-button">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" data-testid="favorite-button">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  {app.description}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Screenshots & Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Screenshots & Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="screenshots" className="w-full">
                  <TabsList>
                    <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
                    {app.videoUrl && <TabsTrigger value="demo">Demo Video</TabsTrigger>}
                  </TabsList>
                  
                  <TabsContent value="screenshots" className="mt-6">
                    <div className="space-y-4">
                      {/* Main screenshot */}
                      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        {app.screenshots[selectedScreenshot] ? (
                          <img 
                            src={app.screenshots[selectedScreenshot]} 
                            alt={`${app.name} screenshot ${selectedScreenshot + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Smartphone className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Screenshot thumbnails */}
                      {app.screenshots.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                          {app.screenshots.map((screenshot, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedScreenshot(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                                selectedScreenshot === index 
                                  ? 'border-blue-500' 
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                              data-testid={`screenshot-${index}`}
                            >
                              <img 
                                src={screenshot} 
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {app.videoUrl && (
                    <TabsContent value="demo" className="mt-6">
                      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        <video 
                          controls 
                          className="w-full h-full"
                          poster={app.screenshots[0]}
                        >
                          <source src={app.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About this app</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {app.longDescription || app.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Key Features</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {app.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {app.permissions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Permissions</h4>
                    <div className="space-y-2">
                      {app.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Shield className="h-4 w-4 flex-shrink-0" />
                          <span>{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Pricing Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.pricing.map((pricing) => (
                  <div 
                    key={pricing.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPricing === pricing.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedPricing(pricing.id)}
                    data-testid={`pricing-${pricing.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{pricing.type}</h4>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatPrice(pricing.price)}</div>
                        {pricing.originalPrice && pricing.originalPrice > pricing.price && (
                          <div className="text-sm text-gray-500 line-through">
                            ₹{pricing.originalPrice}
                          </div>
                        )}
                        {pricing.duration && (
                          <div className="text-xs text-gray-500">/{pricing.duration}</div>
                        )}
                      </div>
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {pricing.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <Separator />

                {app.owned ? (
                  <Button className="w-full" disabled data-testid="owned-button">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Already Owned
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => handlePurchase(selectedPricing || app.pricing[0]?.id)}
                      disabled={!selectedPricing && app.pricing.length > 1}
                      data-testid="purchase-button"
                    >
                      {selectedPricing 
                        ? `Get ${app.pricing.find(p => p.id === selectedPricing)?.type || 'App'}` 
                        : 'Select Plan'
                      }
                    </Button>
                    {app.pricing.some(p => p.type === 'free') && (
                      <Button variant="outline" className="w-full" data-testid="try-free-button">
                        <Play className="h-4 w-4 mr-2" />
                        Try Free Version
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* App Info */}
            <Card>
              <CardHeader>
                <CardTitle>App Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Version</span>
                  <span className="font-medium">{app.version}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Size</span>
                  <span className="font-medium">{app.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Category</span>
                  <span className="font-medium capitalize">{app.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Updated</span>
                  <span className="font-medium">{app.lastUpdated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Downloads</span>
                  <span className="font-medium">{app.downloads.toLocaleString()}+</span>
                </div>
              </CardContent>
            </Card>

            {/* Developer */}
            <Card>
              <CardHeader>
                <CardTitle>Developer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{app.developer}</div>
                    <Button variant="link" className="p-0 h-auto text-blue-600" data-testid="view-developer">
                      View other apps
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {app && (
        <AppPurchaseModal
          app={{
            id: app.id,
            name: app.name,
            description: app.description,
            pricing: app.pricing,
            developer: app.developer
          }}
          selectedPricing={selectedPricing}
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
        />
      )}
    </div>
  );
}