import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Search, Sparkles, TrendingUp, Zap, Package } from "lucide-react";
import WytWallLayout from "@/components/wytwall/WytWallLayout";
import FiltersPanel from "@/components/wytwall/FiltersPanel";
import NeedCard from "@/components/wytwall/NeedCard";
import OfferCard from "@/components/wytwall/OfferCard";
import PromotionsPanel from "@/components/wytwall/PromotionsPanel";

export default function WytWall() {
  const { user } = useAuthContext();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [postType, setPostType] = useState<"all" | "needs" | "offers">("all");

  // Build query params conditionally to avoid undefined values
  const needsQueryParams = selectedCategory !== 'all' ? { category: selectedCategory } : {};
  const offersQueryParams = selectedCategory !== 'all' ? { category: selectedCategory } : {};

  const { data: needsData, isLoading: needsLoading } = useQuery({
    queryKey: user 
      ? ['/api/needs', needsQueryParams]
      : ['/api/needs/public', needsQueryParams],
    enabled: postType === "all" || postType === "needs",
  });

  const { data: offersData, isLoading: offersLoading } = useQuery({
    queryKey: user 
      ? ['/api/offers', offersQueryParams]
      : ['/api/offers/public', offersQueryParams],
    enabled: postType === "all" || postType === "offers",
  });

  const allNeeds = (needsData as any)?.needs || [];
  const allOffers = (offersData as any)?.offers || [];
  
  // Merge counts from both needs and offers
  const needsCounts = (needsData as any)?.counts || {};
  const offersCounts = (offersData as any)?.counts || {};
  const counts: Record<string, number> = {};
  
  // Combine counts for each category
  const allCategories = new Set([...Object.keys(needsCounts), ...Object.keys(offersCounts)]);
  allCategories.forEach(cat => {
    counts[cat] = (needsCounts[cat] || 0) + (offersCounts[cat] || 0);
  });
  
  // Combine and sort by date
  const allPosts = [...allNeeds.map((n: any) => ({ ...n, type: 'need' })), ...allOffers.map((o: any) => ({ ...o, type: 'offer' }))].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredPosts = searchQuery.trim()
    ? allPosts.filter((post: any) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allPosts;

  const posts = postType === "all" ? filteredPosts :
    filteredPosts.filter((p: any) => p.type === (postType === "needs" ? "need" : "offer"));

  const isLoading = needsLoading || offersLoading;

  const handleMakeOffer = (needId: string) => {
    console.log('Make offer on need:', needId);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handlePostNeed = () => {
    if (!user) {
      navigate('/login');
    } else {
      console.log('Post new need');
    }
  };

  // Left Panel - Filters
  const leftPanel = (
    <FiltersPanel
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
      categoryCounts={counts}
    />
  );

  // Center Panel - Needs Stream
  const centerPanel = (
    <div className="space-y-6">
      
      {/* Modern Header with Glassmorphism */}
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
        
        {/* Floating orbs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        
        <CardContent className="relative p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="h-10 w-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  WytWall
                  <TrendingUp className="h-5 w-5 animate-bounce" />
                </h1>
                <p className="text-white/90 text-xs font-medium">Offers Stream</p>
              </div>
            </div>
            
            {/* Search Bar in Header */}
            <div className="hidden md:flex relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                type="text"
                placeholder="Search needs by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-10 text-sm border-0 bg-white/20 backdrop-blur-xl text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/50 rounded-xl"
                data-testid="input-search-needs"
              />
            </div>

            <Button
              onClick={handlePostNeed}
              className="bg-white/90 hover:bg-white text-purple-600 font-bold shadow-xl hover:scale-105 transition-all rounded-xl backdrop-blur-xl h-9 text-sm flex-shrink-0"
              data-testid="button-post-need"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Post Need</span>
              <span className="sm:hidden">Post</span>
            </Button>
          </div>
          
          {/* Mobile Search Bar (below header on mobile) */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                type="text"
                placeholder="Search needs by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-10 text-sm border-0 bg-white/20 backdrop-blur-xl text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/50 rounded-xl w-full"
                data-testid="input-search-needs-mobile"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Pills for Mobile */}
      <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'jobs', 'real_estate', 'b2b_supply', 'service'].map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap rounded-full px-5 py-2 font-bold transition-all ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl border-0 scale-105"
                : "bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border-0 text-gray-700 dark:text-gray-300 hover:scale-105"
            }`}
            data-testid={`mobile-category-${cat}`}
          >
            {cat === 'all' ? 'All' : cat.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Needs Stream */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border-0 shadow-xl rounded-2xl">
              <Skeleton className="h-32 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="relative overflow-hidden border-0 shadow-2xl rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-pink-950/20"></div>
          <CardContent className="relative p-16 text-center">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Zap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
              No posts found
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
              {selectedCategory === 'all' 
                ? "Be the first to post in the marketplace and connect with the community!" 
                : `No posts in the ${selectedCategory.replace('_', ' ')} category yet. Be the pioneer!`}
            </p>
            {user && (
              <Button
                onClick={handlePostNeed}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-10 py-6 rounded-2xl shadow-2xl hover:scale-105 transition-all"
                data-testid="button-post-first-need"
              >
                <Plus className="h-6 w-6 mr-3" />
                Post to Marketplace
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => (
            post.type === 'need' ? (
              <NeedCard
                key={post.id}
                need={post}
                isAuthenticated={!!user}
                onMakeOffer={handleMakeOffer}
                onLogin={handleLogin}
              />
            ) : (
              <OfferCard
                key={post.id}
                offer={post}
                isAuthenticated={!!user}
                onViewOffer={(offerId) => console.log('View offer:', offerId)}
                onLogin={handleLogin}
              />
            )
          ))}
        </div>
      )}

      {/* Load More with Modern Design */}
      {posts.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            className="w-full lg:w-auto px-10 py-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-xl hover:scale-105 transition-all rounded-xl font-bold text-lg"
            data-testid="button-load-more"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Load More
          </Button>
        </div>
      )}
    </div>
  );

  // Right Panel - Promotions
  const rightPanel = (
    <PromotionsPanel isAuthenticated={!!user} />
  );

  return (
    <>
      <WytWallLayout
        leftPanel={leftPanel}
        centerPanel={centerPanel}
        rightPanel={rightPanel}
      />
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }
      `}</style>
    </>
  );
}
