import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Search, Sparkles, TrendingUp, Zap, MapPin, Brain, QrCode, BarChart3, Award, Star, Gift, Rocket, ArrowRight, Users, Shield } from "lucide-react";
import WytWallLayout from "@/components/wytwall/WytWallLayout";
import NeedCard from "@/components/wytwall/NeedCard";

export default function Home() {
  const { user } = useAuthContext();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Fetch needs for WytWall stream
  const needsUrl = user ? '/api/needs' : '/api/needs/public';
  const needsQueryUrl = selectedCategory !== 'all' 
    ? `${needsUrl}?category=${selectedCategory}` 
    : needsUrl;

  const { data: needsData, isLoading } = useQuery({
    queryKey: [needsQueryUrl],
    enabled: true,
  });

  const allNeeds = (needsData as any)?.needs || [];
  const counts = (needsData as any)?.counts || {};
  
  // Apply all filters: category, search, location, and price range
  const needs = allNeeds.filter((need: any) => {
    // Category filter
    if (selectedCategory !== 'all') {
      if (need.category !== selectedCategory) return false;
    }

    // Search filter
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      const query = trimmedQuery.toLowerCase();
      const matchesSearch = 
        (need.title || '').toLowerCase().includes(query) ||
        (need.description || '').toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Location filter
    const trimmedLocation = locationFilter.trim();
    if (trimmedLocation) {
      const matchesLocation = 
        (need.location || '').toLowerCase().includes(trimmedLocation.toLowerCase());
      if (!matchesLocation) return false;
    }

    return true;
  });

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
      navigate('/mypanel/posts');
    }
  };

  // Left Panel - Filters
  const leftPanel = (
    <div className="space-y-6">
      {/* Filters Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Filters</h2>
      </div>

      {/* Categories Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Categories
        </h3>
        <div className="space-y-2">
          {[
            { id: 'all', label: 'All Needs', icon: '📋' },
            { id: 'jobs', label: 'Jobs', icon: '💼' },
            { id: 'real_estate', label: 'Real Estate', icon: '🏠' },
            { id: 'b2b_supply', label: 'B2B Supply', icon: '🏢' },
            { id: 'service', label: 'Services', icon: '⚙️' },
            { id: 'other', label: 'Other', icon: '📦' },
          ].map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setSelectedCategory(category.id)}
              data-testid={`filter-category-${category.id}`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="flex-1 text-left font-medium">{category.label}</span>
              {counts[category.id] > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {counts[category.id]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </h3>
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full"
            data-testid="input-location-filter"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Filter by city, state, or region
          </div>
        </div>
      </div>
    </div>
  );

  // Center Panel - WytWall Stream
  const centerPanel = (
    <div className="space-y-3 sm:space-y-6">
      
      {/* Modern Header - Compact on mobile */}
      <Card className="relative overflow-hidden border-0 shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
        <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-white/10 rounded-full blur-2xl sm:blur-3xl"></div>
        
        <CardContent className="relative p-4 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="h-10 w-10 sm:h-14 sm:w-14 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-black text-white flex items-center gap-1.5 sm:gap-2">
                  WytWall
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 animate-bounce" />
                </h1>
                <p className="text-white/90 text-xs sm:text-sm font-medium hidden sm:block">Offers Stream Marketplace</p>
              </div>
            </div>
            <Button
              onClick={handlePostNeed}
              className="bg-white/90 hover:bg-white text-purple-600 font-bold shadow-xl hover:scale-105 transition-all rounded-lg sm:rounded-xl backdrop-blur-xl px-3 sm:px-4 h-9 sm:h-10 text-sm"
              data-testid="button-add-post"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add Post</span>
              <span className="sm:hidden">Post</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar - Compact on mobile */}
      <Card className="border-0 shadow-lg sm:shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl">
        <CardContent className="p-2.5 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base border-0 bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500"
              data-testid="input-search-needs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Needs Stream */}
      {isLoading ? (
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 sm:p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border-0 shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl">
              <Skeleton className="h-20 sm:h-32 w-full rounded-lg sm:rounded-xl" />
            </Card>
          ))}
        </div>
      ) : needs.length === 0 ? (
        <Card className="relative overflow-hidden border-0 shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-pink-950/20"></div>
          <CardContent className="relative p-8 sm:p-16 text-center">
            <div className="mb-4 sm:mb-8">
              <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl sm:shadow-2xl">
                <Zap className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2 sm:mb-4">
              No needs found
            </h3>
            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-4 sm:mb-8">
              Be the first to post a need in the marketplace!
            </p>
            {user && (
              <Button
                onClick={handlePostNeed}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-10 py-6 rounded-2xl shadow-2xl hover:scale-105 transition-all"
                data-testid="button-add-first-post"
              >
                <Plus className="h-6 w-6 mr-3" />
                Add Your First Post
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

  // Mobile Categories - horizontal scrollable filter chips with scroll shadow
  const mobileCategories = (
    <div className="relative">
      <div 
        className="flex gap-2 overflow-x-auto pb-2 px-1 snap-x snap-mandatory" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {[
          { id: 'all', label: 'All' },
          { id: 'jobs', label: 'jobs' },
          { id: 'real_estate', label: 'real estate' },
          { id: 'b2b_supply', label: 'b2b supply' },
          { id: 'service', label: 'service' },
          { id: 'other', label: 'other' },
        ].map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap touch-manipulation snap-start min-h-[40px] ${
              selectedCategory === category.id
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95"
            }`}
            data-testid={`mobile-filter-${category.id}`}
          >
            {category.label}
          </button>
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none" />
    </div>
  );

  // Right Panel - Promotional Cards
  const rightPanel = (
    <div className="space-y-6">
      {/* Quick Links Header */}
      <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
        <Sparkles className="h-5 w-5" />
        <h2 className="text-lg font-bold">Quick Links</h2>
      </div>

      {/* Join and Get WytPass */}
      <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 shadow-xl hover:scale-105 transition-all rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Join and Get WytPass</h3>
              <p className="text-sm text-white/90">Sign up today and get your WytPass identity</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-white/90 hover:bg-white text-purple-600 font-bold shadow-lg rounded-xl"
            data-testid="button-join-wytpass"
          >
            Sign Up Free
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Earn WytPoints to Become a WytStar */}
      <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 border-0 shadow-xl hover:scale-105 transition-all rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center flex-shrink-0">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Earn WytPoints to Become a WytStar</h3>
              <p className="text-sm text-white/90">Contribute to the marketplace and climb the leaderboard!</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/wytpoints')}
            className="w-full bg-white/90 hover:bg-white text-orange-600 font-bold shadow-lg rounded-xl"
            data-testid="button-earn-wytpoints"
          >
            View Leaderboard
            <Star className="h-4 w-4 ml-2 fill-current" />
          </Button>
        </CardContent>
      </Card>

      {/* Create QR Codes Using WytQRC App */}
      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-xl hover:scale-105 transition-all rounded-2xl overflow-hidden cursor-pointer" onClick={() => navigate('/qr-generator')}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center flex-shrink-0">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Create QR Codes Using WytQRC App</h3>
              <p className="text-sm text-white/90">Generate QR codes instantly</p>
            </div>
          </div>
          <Button
            onClick={(e) => { e.stopPropagation(); navigate('/qr-generator'); }}
            className="w-full bg-white/90 hover:bg-white text-emerald-600 font-bold shadow-lg rounded-xl"
            data-testid="button-qr-generator"
          >
            QR Generator
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Assess your DISC Using WytApp's "Assess DISC" */}
      <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 shadow-xl hover:scale-105 transition-all rounded-2xl overflow-hidden cursor-pointer" onClick={() => navigate('/assessment')}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Assess your DISC Using WytApp's "Assess DISC"</h3>
              <p className="text-sm text-white/90">Discover your personality type</p>
            </div>
          </div>
          <Button
            onClick={(e) => { e.stopPropagation(); navigate('/assessment'); }}
            className="w-full bg-white/90 hover:bg-white text-purple-600 font-bold shadow-lg rounded-xl"
            data-testid="button-disc-assessment"
          >
            DISC Assessment
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <WytWallLayout
        leftPanel={leftPanel}
        centerPanel={centerPanel}
        rightPanel={rightPanel}
        mobileCategories={mobileCategories}
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
