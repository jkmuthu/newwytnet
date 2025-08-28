import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Clock, 
  FileText, 
  Users, 
  Building2, 
  Smartphone,
  Database,
  Globe,
  Image,
  Copyright,
  Hash,
  Loader2,
  AlertCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';

// Search result interfaces
interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  url?: string;
  tenantId?: string;
  category?: string;
  status?: string;
  createdAt?: string;
  _formatted?: {
    title?: string;
    description?: string;
    content?: string;
  };
}

interface SearchResponse {
  hits: SearchResult[];
  query: string;
  processingTimeMs: number;
  hitsPerPage: number;
  page: number;
  totalPages: number;
  totalHits: number;
  facetDistribution?: Record<string, Record<string, number>>;
}

interface SearchStats {
  indexes: Record<string, {
    numberOfDocuments: number;
    isIndexing: boolean;
    fieldDistribution: Record<string, number>;
  }>;
}

// Search categories with their respective indexes
const SEARCH_CATEGORIES = [
  { 
    key: 'global', 
    label: 'All Content', 
    icon: Globe,
    description: 'Search across all content types'
  },
  { 
    key: 'tenants', 
    label: 'Organizations', 
    icon: Building2,
    description: 'Search organizations and tenants'
  },
  { 
    key: 'users', 
    label: 'Users', 
    icon: Users,
    description: 'Search registered users'
  },
  { 
    key: 'whatsapp-users', 
    label: 'WhatsApp Users', 
    icon: Smartphone,
    description: 'Search WhatsApp authenticated users'
  },
  { 
    key: 'models', 
    label: 'CRUD Models', 
    icon: Database,
    description: 'Search CRUD modules and models'
  },
  { 
    key: 'pages', 
    label: 'CMS Pages', 
    icon: FileText,
    description: 'Search CMS pages and content'
  },
  { 
    key: 'apps', 
    label: 'Applications', 
    icon: Globe,
    description: 'Search applications and modules'
  },
  { 
    key: 'trademarks', 
    label: 'Trademarks', 
    icon: Copyright,
    description: 'Search trademark database'
  },
  { 
    key: 'tm-numbers', 
    label: 'TM Numbers', 
    icon: Hash,
    description: 'Search TMNumber11 generated numbers'
  },
  { 
    key: 'media', 
    label: 'Media Files', 
    icon: Image,
    description: 'Search uploaded media and files'
  },
];

export default function SearchInterface() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('global');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchStats, setSearchStats] = useState<SearchResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wytnet_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('wytnet_recent_searches', JSON.stringify(updated));
  };

  // Get search statistics
  const { data: indexStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/search/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false,
  });

  // Get search suggestions with debouncing
  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (query.trim() && query.length >= 2) {
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/search/suggestions/${category}?q=${encodeURIComponent(query)}&limit=5`);
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Failed to get suggestions:', error);
          setSuggestions([]);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [query, category]);

  // Perform search
  const performSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchStats(null);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);
    
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '20',
        offset: '0',
      });

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const endpoint = category === 'global' 
        ? `/api/search/global?${params}`
        : `/api/search/${category}?${params}`;

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      
      setSearchResults(data.hits);
      setSearchStats(data);
      saveRecentSearch(searchQuery);
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setSearchStats(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  // Handle recent search click
  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    performSearch(recentQuery);
  };

  // Clear search results
  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setSearchStats(null);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  // Get category info
  const selectedCategory = SEARCH_CATEGORIES.find(cat => cat.key === category);
  const CategoryIcon = selectedCategory?.icon || Globe;

  // Get result icon based on type
  const getResultIcon = (type: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      tenant: Building2,
      user: Users,
      whatsapp_user: Smartphone,
      model: Database,
      page: FileText,
      app: Globe,
      trademark: Copyright,
      tm_number: Hash,
      media: Image,
    };
    
    return iconMap[type] || FileText;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            WytNet Search
          </CardTitle>
          <CardDescription>
            Production-ready search across all platform content with Meilisearch
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <div className="flex">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEARCH_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <SelectItem key={cat.key} value={cat.key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    ref={searchInputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${selectedCategory?.label.toLowerCase()}...`}
                    className="rounded-l-none"
                    data-testid="input-search"
                  />
                </div>
                
                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-48 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                        data-testid={`suggestion-${index}`}
                      >
                        <Search className="inline h-4 w-4 mr-2 text-gray-400" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                disabled={isSearching}
                data-testid="button-search"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
              
              {(query || searchResults.length > 0) && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearSearch}
                  data-testid="button-clear"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Category Description */}
            {selectedCategory && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CategoryIcon className="h-4 w-4" />
                {selectedCategory.description}
              </div>
            )}
          </form>

          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Recent Searches</h4>
              <div className="flex flex-wrap gap-2">
                {recentSearches.slice(0, 5).map((recentQuery, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleRecentSearchClick(recentQuery)}
                    className="h-8"
                    data-testid={`recent-search-${index}`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {recentQuery}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Statistics */}
      {indexStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Search Index Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(indexStats.indexes).map(([key, stats]) => {
                const category = SEARCH_CATEGORIES.find(cat => cat.key.toUpperCase() === key);
                const Icon = category?.icon || Database;
                
                return (
                  <div key={key} className="text-center space-y-2">
                    <Icon className="h-8 w-8 mx-auto text-primary" />
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{stats.numberOfDocuments.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {category?.label || key}
                      </p>
                      {stats.isIndexing && (
                        <Badge variant="secondary" className="text-xs">
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Indexing
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchStats && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Search Results
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{searchStats.totalHits} results</span>
                <span>{searchStats.processingTimeMs}ms</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isSearching ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((result) => {
                  const ResultIcon = getResultIcon(result.type);
                  const formattedResult = result._formatted || {};
                  
                  return (
                    <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <ResultIcon className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 
                              className="font-semibold text-lg"
                              dangerouslySetInnerHTML={{ 
                                __html: formattedResult.title || result.title 
                              }}
                            />
                            <Badge variant="outline" className="text-xs">
                              {result.type.replace('_', ' ')}
                            </Badge>
                            {result.status && (
                              <Badge variant={result.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                {result.status}
                              </Badge>
                            )}
                          </div>
                          
                          {(formattedResult.description || result.description) && (
                            <p 
                              className="text-muted-foreground"
                              dangerouslySetInnerHTML={{ 
                                __html: formattedResult.description || result.description 
                              }}
                            />
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {result.category && (
                              <span className="flex items-center gap-1">
                                <Filter className="h-3 w-3" />
                                {result.category}
                              </span>
                            )}
                            {result.createdAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(result.createdAt).toLocaleDateString()}
                              </span>
                            )}
                            {result.url && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => window.open(result.url, '_blank')}
                              >
                                View →
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination info */}
                {searchStats.totalPages > 1 && (
                  <div className="text-center text-sm text-muted-foreground">
                    Page {searchStats.page} of {searchStats.totalPages} 
                    ({searchStats.totalHits} total results)
                  </div>
                )}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No results found for "{searchStats.query}". Try different keywords or check spelling.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4" />
            Search Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SearchHealthStatus />
        </CardContent>
      </Card>
    </div>
  );
}

// Search health status component
function SearchHealthStatus() {
  const { data: healthData, isLoading, error } = useQuery({
    queryKey: ['/api/search/health'],
    refetchInterval: 10000, // Check every 10 seconds
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking search service...
      </div>
    );
  }

  if (error || !healthData) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="h-4 w-4" />
        Search service unavailable
      </div>
    );
  }

  const isHealthy = healthData.status === 'healthy';

  return (
    <div className={`flex items-center gap-2 text-sm ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
      <div className={`h-2 w-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
      {isHealthy ? 'Search service operational' : 'Search service degraded'}
      <span className="text-muted-foreground">
        • Updated {new Date(healthData.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
}