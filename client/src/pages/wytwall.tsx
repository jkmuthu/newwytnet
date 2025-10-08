import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Search } from "lucide-react";
import WytWallLayout from "@/components/wytwall/WytWallLayout";
import FiltersPanel from "@/components/wytwall/FiltersPanel";
import NeedCard from "@/components/wytwall/NeedCard";
import PromotionsPanel from "@/components/wytwall/PromotionsPanel";

export default function WytWall() {
  const { user } = useAuthContext();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch needs based on authentication status
  const { data: needsData, isLoading } = useQuery({
    queryKey: user ? ['/api/needs', selectedCategory] : ['/api/needs/public', selectedCategory],
    enabled: true,
  });

  const allNeeds = (needsData as any)?.needs || [];
  const counts = (needsData as any)?.counts || {};
  
  // Filter needs by search query
  const needs = searchQuery.trim()
    ? allNeeds.filter((need: any) =>
        need.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        need.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allNeeds;

  const handleMakeOffer = (needId: string) => {
    // Navigate to offer creation (will be implemented later)
    console.log('Make offer on need:', needId);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handlePostNeed = () => {
    if (!user) {
      navigate('/login');
    } else {
      // Navigate to post need page (will be implemented later)
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
    <div className="space-y-4">
      
      {/* Header with Post Need Button */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 border-0 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Stream of WytWall
              </h1>
              <p className="text-sm text-blue-100 dark:text-blue-200 mt-1">
                {user ? "Post your needs, discover opportunities" : "Get in. Get it done."}
              </p>
            </div>
            <Button
              onClick={handlePostNeed}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-md"
              data-testid="button-post-need"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Post Need</span>
              <span className="sm:hidden">Post</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter in One Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search needs by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            data-testid="input-search-needs"
          />
        </div>
        
        {/* Filter Button for Mobile */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            className="px-3 whitespace-nowrap"
            onClick={() => {
              // Will implement mobile filter sheet
              console.log('Open mobile filters');
            }}
            data-testid="button-mobile-filters"
          >
            <Filter className="h-4 w-4 mr-1" />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      {/* Category Tabs for Mobile */}
      <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'jobs', 'real_estate', 'b2b_supply', 'service'].map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-gray-700 dark:text-gray-300"
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
            <Card key={i} className="p-6">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      ) : needs.length === 0 ? (
        <Card className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full flex items-center justify-center">
                <svg
                  className="h-10 w-10 text-blue-500 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No needs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              {selectedCategory === 'all' 
                ? "Be the first to post a need in the marketplace and connect with solution providers!" 
                : `No needs in the ${selectedCategory.replace('_', ' ')} category yet. Be the pioneer!`}
            </p>
            {user && (
              <Button
                onClick={handlePostNeed}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                data-testid="button-post-first-need"
              >
                <Plus className="h-5 w-5 mr-2" />
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

      {/* Load More */}
      {needs.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            className="w-full lg:w-auto"
            data-testid="button-load-more"
          >
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
    <WytWallLayout
      leftPanel={leftPanel}
      centerPanel={centerPanel}
      rightPanel={rightPanel}
    />
  );
}
