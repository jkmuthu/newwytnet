import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WytWallPostForm from "@/components/WytWallPostForm";
import { Package, Plus, Loader2 } from "lucide-react";

export default function MyPosts() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"all" | "need" | "offer">("all");
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [defaultPostType, setDefaultPostType] = useState<"need" | "offer">("need");

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['/api/wytwall/my-posts'],
  });

  const posts = (postsData as any)?.posts || [];
  
  const needsCount = posts.filter((p: any) => p.postType === 'need').length;
  const offersCount = posts.filter((p: any) => p.postType === 'offer').length;

  const filteredPosts = activeTab === "all" 
    ? posts 
    : posts.filter((p: any) => p.postType === activeTab);

  const handleOpenPostDialog = (type: "need" | "offer") => {
    setDefaultPostType(type);
    setIsPostDialogOpen(true);
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      need_job: "Need a Job",
      house_for_rent: "House for Rent",
      require_service: "Require a Service",
      product_for_use: "Product for my Use",
      bulk_supply: "Product for Bulk Supply",
      selling_bike: "Selling my Bike",
      selling_car: "Selling my Car",
      selling_property: "Selling my Property",
      renting_house: "Renting my House",
      providing_service: "Providing Service",
      other: "Other",
    };
    return labels[category] || category;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">My Posts</h1>
                <p className="text-white/90 text-sm">Manage your needs & offers</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleOpenPostDialog('need')}
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl"
                data-testid="button-post-need"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Need
              </Button>
              <Button 
                onClick={() => handleOpenPostDialog('offer')}
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl"
                data-testid="button-post-offer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Offer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" data-testid="tab-all">
            All Posts ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="need" data-testid="tab-needs">
            Needs ({needsCount})
          </TabsTrigger>
          <TabsTrigger value="offer" data-testid="tab-offers">
            Offers ({offersCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading posts...</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                No {activeTab === "all" ? "posts" : activeTab === "need" ? "needs" : "offers"} yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start by posting your first {activeTab === "all" ? "need or offer" : activeTab === "need" ? "need" : "offer"}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => handleOpenPostDialog('need')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Need
                </Button>
                <Button onClick={() => handleOpenPostDialog('offer')} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Offer
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post: any) => (
                <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow" data-testid={`post-card-${post.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={post.postType === 'need' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}>
                          {post.postType === 'need' ? 'Need' : 'Offer'}
                        </Badge>
                        <Badge variant="outline">{getCategoryLabel(post.category)}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{post.description}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate(`/u/me/wytwall/${post.id}`)}
                      data-testid={`button-view-${post.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Post Creation Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create a Post</DialogTitle>
          </DialogHeader>
          <WytWallPostForm 
            defaultPostType={defaultPostType}
            onSuccess={() => setIsPostDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
