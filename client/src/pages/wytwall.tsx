import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Search, Sparkles, TrendingUp, Zap } from "lucide-react";
import WytWallLayout from "@/components/wytwall/WytWallLayout";
import FiltersPanel from "@/components/wytwall/FiltersPanel";
import NeedCard from "@/components/wytwall/NeedCard";
import PromotionsPanel from "@/components/wytwall/PromotionsPanel";

export default function WytWall() {
  const { user } = useAuthContext();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: needsData, isLoading } = useQuery({
    queryKey: user ? ['/api/needs', selectedCategory] : ['/api/needs/public', selectedCategory],
    enabled: true,
  });

  const allNeeds = (needsData as any)?.needs || [];
  const counts = (needsData as any)?.counts || {};
  
  const needs = searchQuery.trim()
    ? allNeeds.filter((need: any) =>
        need.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        need.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allNeeds;

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  WytWall
                  <TrendingUp className="h-5 w-5 animate-bounce" />
                </h1>
                <p className="text-white/90 text-xs font-medium">Offers Stream Marketplace</p>
              </div>
            </div>
            <Button
              onClick={handlePostNeed}
              className="bg-white/90 hover:bg-white text-purple-600 font-bold shadow-xl hover:scale-105 transition-all rounded-xl backdrop-blur-xl h-9 text-sm"
              data-testid="button-post-need"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Post Need</span>
              <span className="sm:hidden">Post</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modern Search Bar */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search needs by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-0 bg-gray-100 dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500"
                data-testid="input-search-needs"
              />
            </div>
            
            {/* Filter Button for Mobile */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                className="h-12 px-4 border-0 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl"
                onClick={() => console.log('Open mobile filters')}
                data-testid="button-mobile-filters"
              >
                <Filter className="h-5 w-5 mr-2" />
                <span className="font-semibold">Filters</span>
              </Button>
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
      ) : needs.length === 0 ? (
        <Card className="relative overflow-hidden border-0 shadow-2xl rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-pink-950/20"></div>
          <CardContent className="relative p-16 text-center">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Zap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
              No needs found
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
              {selectedCategory === 'all' 
                ? "Be the first to post a need in the marketplace and connect with solution providers!" 
                : `No needs in the ${selectedCategory.replace('_', ' ')} category yet. Be the pioneer!`}
            </p>
            {user && (
              <Button
                onClick={handlePostNeed}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-10 py-6 rounded-2xl shadow-2xl hover:scale-105 transition-all"
                data-testid="button-post-first-need"
              >
                <Plus className="h-6 w-6 mr-3" />
                Post Your First Need
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {needs.map((need: any) => (
            <NeedCard
              key={need.id}
              need={need}
              isAuthenticated={!!user}
              onMakeOffer={handleMakeOffer}
              onLogin={handleLogin}
            />
          ))}
        </div>
      )}

      {/* Load More with Modern Design */}
      {needs.length > 0 && (
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
