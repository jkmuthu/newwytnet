import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Search, Sparkles, TrendingUp, Zap, Package, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 10;

  // Build query URLs with proper query string parameters
  const needsUrl = user ? '/api/needs' : '/api/needs/public';
  const offersUrl = user ? '/api/offers' : '/api/offers/public';
  
  const needsQueryUrl = selectedCategory !== 'all' 
    ? `${needsUrl}?category=${selectedCategory}` 
    : needsUrl;
  
  const offersQueryUrl = selectedCategory !== 'all' 
    ? `${offersUrl}?category=${selectedCategory}` 
    : offersUrl;

  const { data: needsData, isLoading: needsLoading } = useQuery({
    queryKey: [needsQueryUrl],
    enabled: postType === "all" || postType === "needs",
  });

  const { data: offersData, isLoading: offersLoading } = useQuery({
    queryKey: [offersQueryUrl],
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

  let filteredPosts = allPosts;

  // Apply search filter
  if (searchQuery.trim()) {
    filteredPosts = filteredPosts.filter((post: any) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply location filter
  if (selectedLocation) {
    filteredPosts = filteredPosts.filter((post: any) =>
      post.location?.toLowerCase().includes(selectedLocation.toLowerCase())
    );
  }

  const posts = postType === "all" ? filteredPosts :
    filteredPosts.filter((p: any) => p.type === (postType === "needs" ? "need" : "offer"));

  // Pagination
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, endIndex);

  const isLoading = needsLoading || offersLoading;

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePostTypeChange = (type: "all" | "needs" | "offers") => {
    setPostType(type);
    setCurrentPage(1);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setCurrentPage(1);
  };

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
      onCategoryChange={handleCategoryChange}
      categoryCounts={counts}
      selectedLocation={selectedLocation}
      onLocationChange={handleLocationChange}
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
        
        <CardContent className="relative p-2 sm:p-2.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="h-8 w-8 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  WytWall
                  <TrendingUp className="h-4 w-4 animate-bounce" />
                </h1>
              </div>
            </div>
            
            {/* Search Bar in Header */}
            <div className="hidden md:flex relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-8 text-sm border-0 bg-white/20 backdrop-blur-xl text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/50 rounded-xl"
                data-testid="input-search-needs"
              />
            </div>

            <Button
              onClick={handlePostNeed}
              className="bg-white/90 hover:bg-white text-purple-600 font-bold shadow-xl hover:scale-105 transition-all rounded-xl backdrop-blur-xl h-8 text-sm flex-shrink-0"
              data-testid="button-post-need"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Post</span>
              <span className="sm:hidden">Post</span>
            </Button>
          </div>
          
          {/* Mobile Search Bar (below header on mobile) */}
          <div className="md:hidden mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-8 text-sm border-0 bg-white/20 backdrop-blur-xl text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/50 rounded-xl w-full"
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
            onClick={() => handleCategoryChange(cat)}
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
          {paginatedPosts.map((post: any) => (
            post.type === 'need' ? (
              <NeedCard
                key={post.id}
                need={post}
                isAuthenticated={!!user}
                onMakeOffer={handleMakeOffer}
                onLogin={handleLogin}
                isCollapsed={true}
              />
            ) : (
              <OfferCard
                key={post.id}
                offer={post}
                isAuthenticated={!!user}
                onViewOffer={(offerId) => console.log('View offer:', offerId)}
                onLogin={handleLogin}
                isCollapsed={true}
              />
            )
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, totalPosts)} of {totalPosts} posts
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-prev-page"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[2.5rem] ${
                    currentPage === page
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                      : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0"
                  } shadow-lg hover:scale-105 transition-all`}
                  data-testid={`button-page-${page}`}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-next-page"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
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
