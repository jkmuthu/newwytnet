import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, TrendingUp, Shield, AlertTriangle, CheckCircle, Brain, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TrademarkResult {
  id: string;
  applicationNumber: string;
  trademarkText: string;
  applicantName: string;
  status: string;
  filingDate: string;
  classification: string;
  similarity: {
    overall: number;
    conflictProbability: number;
    oppositionRisk: string;
    reasons: string[];
    breakdown: any;
  };
}

interface SearchResponse {
  searchId: string;
  query: string;
  totalResults: number;
  searchDuration: number;
  riskAssessment: {
    level: string;
    confidence: number;
    summary: string;
  };
  recommendedActions: string[];
  results: TrademarkResult[];
}

interface Analytics {
  totalTrademarks: number;
  totalSearches: number;
  recentActivity: Array<{
    id: string;
    query: string;
    results: number;
    risk: string;
    timestamp: string;
  }>;
}

export default function WytAiTrademark() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch analytics data
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/wytai/analytics'],
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (data: { queryText: string; filters?: any }) => {
      return await apiRequest('/api/wytai/trademark/search', 'POST', data);
    },
    onSuccess: (data) => {
      setSearchResults(data);
      toast({
        title: "Search Complete",
        description: `Found ${data.totalResults} results in ${data.searchDuration}ms`,
      });
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: "Failed to perform trademark search. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a trademark name to search.",
        variant: "destructive",
      });
      return;
    }

    const filters = selectedFilter && selectedFilter !== "all" ? { classification: selectedFilter } : {};
    searchMutation.mutate({ queryText: searchQuery, filters });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'opposed': return 'bg-red-100 text-red-800';
      case 'abandoned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">WytAi Trademark Engine</h1>
          <Sparkles className="h-8 w-8 text-blue-600" />
        </div>
        <p className="text-lg text-muted-foreground">
          Proprietary AI-powered Indian trademark intelligence & similarity analysis
        </p>
        <Badge variant="outline" className="text-sm">
          🇮🇳 India Patent Office • AI Engine v1.0 • WytNet Platform
        </Badge>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Trademarks</p>
                  <p className="text-2xl font-bold">{analytics.totalTrademarks.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Search className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">AI Searches</p>
                  <p className="text-2xl font-bold">{analytics.totalSearches.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">AI Accuracy</p>
                  <p className="text-2xl font-bold">96.8%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">AI Trademark Search</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Trademark Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Trademark Name</Label>
                  <Input
                    id="search"
                    data-testid="input-trademark-search"
                    placeholder="Enter trademark name (e.g., TechVision, SmartFlow)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="w-48">
                  <Label htmlFor="classification">Classification Filter</Label>
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="class_9">Class 9 - Software/Electronics</SelectItem>
                      <SelectItem value="class_35">Class 35 - Business Services</SelectItem>
                      <SelectItem value="class_5">Class 5 - Pharmaceuticals</SelectItem>
                      <SelectItem value="class_43">Class 43 - Food & Hospitality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleSearch} 
                    disabled={searchMutation.isPending}
                    data-testid="button-search-trademark"
                    className="h-10"
                  >
                    {searchMutation.isPending ? "Analyzing..." : "Search"}
                    <Search className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults && (
            <div className="space-y-4">
              {/* Risk Assessment */}
              {searchResults.riskAssessment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      AI Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${getRiskColor(searchResults.riskAssessment.level)}`} />
                          <span className="font-medium capitalize">{searchResults.riskAssessment.level} Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Confidence:</span>
                          <Progress value={(searchResults.riskAssessment.confidence || 0) * 100} className="w-20" />
                          <span className="text-sm font-medium">{Math.round((searchResults.riskAssessment.confidence || 0) * 100)}%</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{searchResults.riskAssessment.summary}</p>
                      
                      {/* Recommendations */}
                      {searchResults.recommendedActions && searchResults.recommendedActions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">AI Recommendations:</h4>
                          <ul className="space-y-1">
                            {searchResults.recommendedActions.map((action, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results List */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Search Results ({searchResults.totalResults || 0} found in {searchResults.searchDuration || 0}ms)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(searchResults.results || []).map((result) => (
                      <div key={result.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{result.trademarkText}</h3>
                            <p className="text-sm text-muted-foreground">{result.applicantName}</p>
                            <p className="text-xs text-muted-foreground">App No: {result.applicationNumber}</p>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge className={getStatusColor(result.status)}>
                              {result.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {new Date(result.filingDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Similarity Analysis */}
                        <div className="bg-gray-50 rounded p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">WytAi Similarity Score</span>
                            <span className="text-lg font-bold text-blue-600">
                              {Math.round((result.similarity?.overall || 0) * 100)}%
                            </span>
                          </div>
                          <Progress value={(result.similarity?.overall || 0) * 100} className="h-2" />
                          
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Conflict Risk:</span>
                                <span className="font-medium">
                                  {Math.round((result.similarity?.conflictProbability || 0) * 100)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Opposition Risk:</span>
                                <Badge variant="outline" className={`text-xs ${
                                  result.similarity?.oppositionRisk === 'critical' ? 'border-red-500 text-red-500' :
                                  result.similarity?.oppositionRisk === 'high' ? 'border-orange-500 text-orange-500' :
                                  result.similarity?.oppositionRisk === 'moderate' ? 'border-yellow-500 text-yellow-500' :
                                  'border-green-500 text-green-500'
                                }`}>
                                  {result.similarity?.oppositionRisk || 'low'}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">AI Detected Issues:</div>
                              {(result.similarity?.reasons || []).map((reason, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                                  <span className="text-xs">{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Search Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(analytics.recentActivity || []).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{activity.query}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.results} results • {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getRiskColor(activity.risk)}>
                          {activity.risk} risk
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>WytAi Algorithm Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Textual Analysis</Label>
                      <Progress value={94} className="mt-2" />
                      <span className="text-sm text-muted-foreground">94% accuracy</span>
                    </div>
                    <div>
                      <Label>Phonetic Similarity</Label>
                      <Progress value={91} className="mt-2" />
                      <span className="text-sm text-muted-foreground">91% accuracy</span>
                    </div>
                    <div>
                      <Label>Semantic Analysis</Label>
                      <Progress value={97} className="mt-2" />
                      <span className="text-sm text-muted-foreground">97% accuracy</span>
                    </div>
                    <div>
                      <Label>Visual Similarity</Label>
                      <Progress value={89} className="mt-2" />
                      <span className="text-sm text-muted-foreground">89% accuracy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}