import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  Network, 
  ExternalLink, 
  Search, 
  ArrowLeft, 
  Users, 
  Calendar,
  Tag,
  Star,
  Globe
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

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

interface HubItem {
  id: string;
  hubId: string;
  title: string;
  description?: string;
  url?: string;
  category?: string;
  tags: string[];
  metadata: any;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function HubDetail() {
  const { slug } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: hub, isLoading: hubLoading, error: hubError } = useQuery<MarketplaceHub>({
    queryKey: [`/api/marketplace/hubs/slug/${slug}`],
    enabled: !!slug
  });

  const { data: hubItems, isLoading: itemsLoading, error: itemsError } = useQuery<HubItem[]>({
    queryKey: [`/api/marketplace/hubs/${hub?.id}/items`],
    enabled: !!hub?.id
  });

  if (hubLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-32 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i}>
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

  if (hubError || !hub) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Hub not found</h2>
          <p className="text-muted-foreground mb-4">The hub you're looking for doesn't exist.</p>
          <Link href="/hubs">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hubs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter items based on search and category
  const filteredItems = hubItems?.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    return item.isActive && matchesSearch && matchesCategory;
  }) || [];

  // Get unique categories
  const categories = Array.from(new Set(hubItems?.map(item => item.category).filter(Boolean) || [])) || [];

  const openExternalLink = (url: string, title: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/hubs">
            <Button variant="ghost" className="pl-0" data-testid="button-back-hubs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to WytHubs
            </Button>
          </Link>
        </div>

        {/* Hub Header */}
        <div className="mb-8">
          {hub.coverImage && (
            <div className="h-48 w-full rounded-lg overflow-hidden mb-6 relative">
              <img 
                src={hub.coverImage} 
                alt={hub.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end">
                <div className="p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="h-6 w-6" />
                    {hub.isFeatured && (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100 border-yellow-500/30">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{hub.name}</h1>
                  <p className="text-white/90 max-w-2xl">{hub.description}</p>
                </div>
              </div>
            </div>
          )}

          {!hub.coverImage && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Network className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">{hub.name}</h1>
                {hub.isFeatured && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">{hub.description}</p>
            </div>
          )}

          {/* Hub Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{hub.itemCount} items</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <span>{hub.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Updated {new Date(hub.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-items"
            />
          </div>
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                data-testid="button-filter-all"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category || null)}
                  data-testid={`button-filter-${category?.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Hub Items */}
        {itemsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i}>
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
        ) : itemsError ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-foreground mb-2">Unable to load items</h3>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Network className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery || selectedCategory ? "No items found" : "No items available"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory 
                ? "Try adjusting your search or filter criteria." 
                : "This hub is currently empty."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow" data-testid={`item-${item.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-start justify-between">
                    <span className="flex-1">{item.title}</span>
                    {item.url && <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />}
                  </CardTitle>
                  {item.description && (
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  )}
                  {(item.category || item.tags.length > 0) && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {item.url ? (
                    <Button 
                      className="w-full" 
                      onClick={() => openExternalLink(item.url!, item.title)}
                      data-testid={`button-open-${item.id}`}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      No URL Available
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}