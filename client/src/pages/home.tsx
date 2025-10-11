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
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Fetch needs for WytWall stream
  const { data: needsData, isLoading } = useQuery({
    queryKey: user ? ['/api/needs', selectedCategory] : ['/api/needs/public', selectedCategory],
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

    // Price range filter
    if (minPrice && need.budget) {
      if (parseFloat(need.budget) < parseFloat(minPrice)) return false;
    }
    if (maxPrice && need.budget) {
      if (parseFloat(need.budget) > parseFloat(maxPrice)) return false;
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
      console.log('Post new need');
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

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Price Range</h3>
        <div className="space-y-3">
          <Input 
            type="number" 
            placeholder="Min price" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full" 
            data-testid="input-price-min" 
          />
          <Input 
            type="number" 
            placeholder="Max price" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full" 
            data-testid="input-price-max" 
          />
        </div>
      </div>
    </div>
  );

  // Center Panel - WytWall Stream
  const centerPanel = (
    <div className="space-y-6">
      
      {/* Modern Header */}
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        
        <CardContent className="relative p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                  WytWall
                  <TrendingUp className="h-6 w-6 animate-bounce" />
                </h1>
                <p className="text-white/90 text-sm font-medium">Offers Stream Marketplace</p>
              </div>
            </div>
            <Button
              onClick={handlePostNeed}
              className="bg-white/90 hover:bg-white text-purple-600 font-bold shadow-xl hover:scale-105 transition-all rounded-xl backdrop-blur-xl"
              data-testid="button-post-need"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Post Need</span>
              <span className="sm:hidden">Post</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl">
        <CardContent className="p-4">
          <div className="relative">
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
        </CardContent>
      </Card>

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
              Be the first to post a need in the marketplace and connect with solution providers!
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
              <h3 className="text-lg font-bold text-white mb-1">Join WytNet Today</h3>
              <p className="text-sm text-white/90">Create an account to post needs, make offers, and earn rewards</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-white/90 hover:bg-white text-purple-600 font-bold shadow-lg rounded-xl"
            data-testid="button-join-wytnet"
          >
            Sign Up Free
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Earn WytPoints */}
      <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 border-0 shadow-xl hover:scale-105 transition-all rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center flex-shrink-0">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Earn WytStars</h3>
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

      {/* Featured Apps */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Rocket className="h-4 w-4" />
          Featured Apps
        </h3>
        <div className="space-y-3">
          
          {/* AI Directory */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all rounded-xl cursor-pointer" onClick={() => navigate('/ai-directory')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">AI Directory</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Explore AI tools from WytHubs</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          {/* QR Generator */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all rounded-xl cursor-pointer" onClick={() => navigate('/qr-generator')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <QrCode className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">WytQRC App</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Create QR codes instantly</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          {/* DISC Assessment */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all rounded-xl cursor-pointer" onClick={() => navigate('/assessment')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">Assess DISC</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Your personality insights</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Join WytNet CTA (for non-authenticated users) */}
      {!user && (
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0 shadow-xl rounded-2xl">
          <CardContent className="p-6 text-center">
            <Gift className="h-12 w-12 text-white mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Join WytNet Today</h3>
            <p className="text-sm text-white/90 mb-4">Create an account to post needs, make offers, and earn rewards</p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-white/90 hover:bg-white text-purple-600 font-bold shadow-lg rounded-xl"
              data-testid="button-signup-sidebar"
            >
              Sign Up Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
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
