import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, XCircle, Hash, Search, Plus, AlertCircle, Info } from 'lucide-react';

interface TMNumber {
  tmnumber11: string;
  classCc: string;
  countryCcc: string;
  productPpppp: string;
  checkD: string;
  title: string;
  longDesc?: string;
  keywords: string[];
  segmentKey?: string;
  createdAt: string;
}

interface NiceClassification {
  classNumber: string;
  title: string;
  description: string;
  category: string;
}

interface ValidationResult {
  isValid: boolean;
  reason?: string;
  components?: {
    class: string;
    country: string;
    product: string;
    check: string;
  };
}

export default function TMNumberingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('generate');
  
  // Generate form state
  const [generateForm, setGenerateForm] = useState({
    class: '',
    country: '356', // Default to India
    title: '',
    longDesc: '',
    keywords: '',
    segmentKey: '',
  });

  // Validation form state
  const [validationNumber, setValidationNumber] = useState('');
  
  // Search form state
  const [searchForm, setSearchForm] = useState({
    class: '',
    country: '',
    keyword: '',
    segment: '',
    status: 'active',
  });

  // Get Nice Classifications
  const { data: classifications } = useQuery({
    queryKey: ['/api/tm/classes'],
  });

  // Search TMNumbers
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/tm/numbers', searchForm],
    enabled: false, // Manual trigger
  });

  // Validate TMNumber
  const { data: validationResult, isLoading: isValidating } = useQuery({
    queryKey: ['/api/tm/numbers/validate', validationNumber],
    enabled: validationNumber.length === 11,
  });

  // Generate TMNumber mutation
  const generateMutation = useMutation({
    mutationFn: async (data: typeof generateForm) => {
      const keywords = data.keywords.split(',').map(k => k.trim()).filter(k => k);
      const response = await fetch('/api/tm/numbers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class: data.class.padStart(2, '0'),
          country: data.country,
          title: data.title,
          longDesc: data.longDesc || undefined,
          keywords,
          segmentKey: data.segmentKey || undefined,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate TMNumber11');
      }
      
      return response.json();
    },
    onSuccess: (response: any) => {
      toast({
        title: 'TMNumber11 Generated!',
        description: `Successfully generated ${response.tmNumber.tmnumber11}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tm/numbers'] });
      
      // Reset form
      setGenerateForm({
        class: '',
        country: '356',
        title: '',
        longDesc: '',
        keywords: '',
        segmentKey: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate TMNumber11',
        variant: 'destructive',
      });
    },
  });

  // Trigger search
  const triggerSearch = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/tm/numbers', searchForm] });
    queryClient.refetchQueries({ queryKey: ['/api/tm/numbers', searchForm] });
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateForm.class || !generateForm.title) {
      toast({
        title: 'Validation Error',
        description: 'Class and title are required',
        variant: 'destructive',
      });
      return;
    }
    generateMutation.mutate(generateForm);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Hash className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold">TMNumber11™</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          WytAi's proprietary numbering system with Luhn check digit validation for trademark classification and tracking
        </p>
        
        {/* Format explanation */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              TMNumber11 Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="font-mono text-2xl font-bold tracking-widest">
                <span className="text-blue-600">CC</span>
                <span className="text-green-600">CCC</span>
                <span className="text-purple-600">PPPPP</span>
                <span className="text-orange-600">D</span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <Badge variant="outline" className="mb-1">Class</Badge>
                  <div className="text-xs text-muted-foreground">01-45</div>
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">Country</Badge>
                  <div className="text-xs text-muted-foreground">ISO Numeric</div>
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">Product</Badge>
                  <div className="text-xs text-muted-foreground">Sequence</div>
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">Check</Badge>
                  <div className="text-xs text-muted-foreground">Luhn Digit</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="validate" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Validate
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate New TMNumber11</CardTitle>
              <CardDescription>
                Create a new TMNumber11 with automatic Luhn check digit calculation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="class">Nice Classification*</Label>
                    <Select
                      value={generateForm.class}
                      onValueChange={(value) => setGenerateForm(prev => ({ ...prev, class: value }))}
                    >
                      <SelectTrigger data-testid="select-classification">
                        <SelectValue placeholder="Select class (01-45)" />
                      </SelectTrigger>
                      <SelectContent>
                        {(classifications as any)?.classifications?.map((cls: NiceClassification) => (
                          <SelectItem key={cls.classNumber} value={cls.classNumber}>
                            Class {cls.classNumber} - {cls.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country Code*</Label>
                    <Select
                      value={generateForm.country}
                      onValueChange={(value) => setGenerateForm(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger data-testid="select-country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="356">356 - India</SelectItem>
                        <SelectItem value="840">840 - United States</SelectItem>
                        <SelectItem value="826">826 - United Kingdom</SelectItem>
                        <SelectItem value="276">276 - Germany</SelectItem>
                        <SelectItem value="250">250 - France</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Product Title*</Label>
                  <Input
                    id="title"
                    value={generateForm.title}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter product or service title"
                    data-testid="input-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDesc">Description</Label>
                  <Textarea
                    id="longDesc"
                    value={generateForm.longDesc}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, longDesc: e.target.value }))}
                    placeholder="Detailed description (optional)"
                    data-testid="textarea-description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      value={generateForm.keywords}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, keywords: e.target.value }))}
                      placeholder="keyword1, keyword2, keyword3"
                      data-testid="input-keywords"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="segmentKey">Segment Key</Label>
                    <Input
                      id="segmentKey"
                      value={generateForm.segmentKey}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, segmentKey: e.target.value }))}
                      placeholder="business segment (optional)"
                      data-testid="input-segment"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={generateMutation.isPending}
                  className="w-full"
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? 'Generating...' : 'Generate TMNumber11'}
                </Button>
              </form>

              {/* Show generated result */}
              {generateMutation.data && (
                <Card className="mt-6 border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Generated Successfully!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-3xl font-mono font-bold tracking-widest text-green-800">
                          {(generateMutation.data as any)?.tmNumber?.tmnumber11}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Title:</strong> {(generateMutation.data as any)?.tmNumber?.title}
                        </div>
                        <div>
                          <strong>Segment:</strong> {(generateMutation.data as any)?.tmNumber?.segmentKey || 'None'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validate Tab */}
        <TabsContent value="validate">
          <Card>
            <CardHeader>
              <CardTitle>Validate TMNumber11</CardTitle>
              <CardDescription>
                Check if a TMNumber11 is valid and view its components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="validationNumber">TMNumber11</Label>
                <Input
                  id="validationNumber"
                  value={validationNumber}
                  onChange={(e) => setValidationNumber(e.target.value)}
                  placeholder="Enter 11-digit TMNumber11"
                  maxLength={11}
                  data-testid="input-validation-number"
                />
              </div>

              {validationNumber.length === 11 && (
                <Card className={`${(validationResult as any)?.validation?.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      {(validationResult as any)?.validation?.isValid ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <div>
                        <div className={`font-semibold ${(validationResult as any)?.validation?.isValid ? 'text-green-800' : 'text-red-800'}`}>
                          {(validationResult as any)?.validation?.isValid ? 'Valid TMNumber11' : 'Invalid TMNumber11'}
                        </div>
                        {(validationResult as any)?.validation?.reason && (
                          <div className="text-sm text-muted-foreground">
                            {(validationResult as any).validation.reason}
                          </div>
                        )}
                      </div>
                    </div>

                    {(validationResult as any)?.validation?.components && (
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs">Class</Label>
                          <div className="font-mono text-lg">{(validationResult as any).validation.components.class}</div>
                        </div>
                        <div>
                          <Label className="text-xs">Country</Label>
                          <div className="font-mono text-lg">{(validationResult as any).validation.components.country}</div>
                        </div>
                        <div>
                          <Label className="text-xs">Product</Label>
                          <div className="font-mono text-lg">{(validationResult as any).validation.components.product}</div>
                        </div>
                        <div>
                          <Label className="text-xs">Check</Label>
                          <div className="font-mono text-lg">{(validationResult as any).validation.components.check}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search TMNumbers</CardTitle>
              <CardDescription>
                Find existing TMNumbers by classification, country, or keywords
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Classification</Label>
                  <Select
                    value={searchForm.class}
                    onValueChange={(value) => setSearchForm(prev => ({ ...prev, class: value }))}
                  >
                    <SelectTrigger data-testid="select-search-class">
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All classes</SelectItem>
                      {(classifications as any)?.classifications?.map((cls: NiceClassification) => (
                        <SelectItem key={cls.classNumber} value={cls.classNumber}>
                          Class {cls.classNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select
                    value={searchForm.country}
                    onValueChange={(value) => setSearchForm(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger data-testid="select-search-country">
                      <SelectValue placeholder="All countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All countries</SelectItem>
                      <SelectItem value="356">India</SelectItem>
                      <SelectItem value="840">United States</SelectItem>
                      <SelectItem value="826">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Keyword</Label>
                  <Input
                    value={searchForm.keyword}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, keyword: e.target.value }))}
                    placeholder="Search in titles"
                    data-testid="input-search-keyword"
                  />
                </div>
              </div>

              <Button onClick={triggerSearch} disabled={isSearching} data-testid="button-search">
                {isSearching ? 'Searching...' : 'Search TMNumbers'}
              </Button>

              {/* Search Results */}
              {searchResults && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Search Results</h3>
                    <Badge variant="outline">{(searchResults as any)?.total || 0} results</Badge>
                  </div>

                  <div className="grid gap-4">
                    {(searchResults as any)?.results?.map((tmNumber: TMNumber) => (
                      <Card key={tmNumber.tmnumber11}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="font-mono text-xl font-bold">
                                  {tmNumber.tmnumber11}
                                </div>
                                <Badge variant="secondary">
                                  Class {tmNumber.classCc}
                                </Badge>
                              </div>
                              <div className="font-semibold">{tmNumber.title}</div>
                              {tmNumber.longDesc && (
                                <div className="text-sm text-muted-foreground">
                                  {tmNumber.longDesc}
                                </div>
                              )}
                              {tmNumber.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {tmNumber.keywords.map((keyword: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              {tmNumber.segmentKey && (
                                <div>Segment: {tmNumber.segmentKey}</div>
                              )}
                              <div>Country: {tmNumber.countryCcc}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}