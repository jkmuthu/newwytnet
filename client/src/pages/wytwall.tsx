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
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                WytWall Stream
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {user ? "Post your needs, discover opportunities" : "Getin . . . Get Done"}
              </p>
            </div>
            <Button
              onClick={handlePostNeed}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-post-need"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Need
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search needs by keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
          data-testid="input-search-needs"
        />
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            // Will implement mobile filter sheet
            console.log('Open mobile filters');
          }}
          data-testid="button-mobile-filters"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters & Categories
        </Button>
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
                ? "bg-blue-600 text-white"
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
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No needs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedCategory === 'all' 
                ? "Be the first to post a need in the marketplace!" 
                : `No needs in the ${selectedCategory.replace('_', ' ')} category yet.`}
            </p>
            {user && (
              <Button
                onClick={handlePostNeed}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-post-first-need"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post a Need
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
