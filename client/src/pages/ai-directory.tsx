import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  Star, 
  ExternalLink, 
  Calendar,
  Globe,
  Edit,
  Trash2,
  Download,
  Upload,
  Zap,
  Clock,
  TrendingUp,
  Eye
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  pricing: 'Free' | 'Freemium' | 'Paid' | 'Open Source';
  rating: number;
  features: string[];
  tags: string[];
  lastUpdated: Date;
  addedDate: Date;
  isVerified: boolean;
  logo?: string;
  screenshots?: string[];
  usage: number;
  trending: boolean;
}

const AI_CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: '🤖' },
  { id: 'text-generation', name: 'Text Generation', icon: '📝' },
  { id: 'image-generation', name: 'Image Generation', icon: '🎨' },
  { id: 'video-editing', name: 'Video Editing', icon: '🎬' },
  { id: 'audio-processing', name: 'Audio Processing', icon: '🎵' },
  { id: 'code-assistant', name: 'Code Assistant', icon: '💻' },
  { id: 'data-analysis', name: 'Data Analysis', icon: '📊' },
  { id: 'chatbots', name: 'Chatbots', icon: '💬' },
  { id: 'productivity', name: 'Productivity', icon: '⚡' },
  { id: 'marketing', name: 'Marketing', icon: '📈' },
  { id: 'design', name: 'Design', icon: '🎯' },
  { id: 'research', name: 'Research', icon: '🔬' },
  { id: 'education', name: 'Education', icon: '🎓' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'finance', name: 'Finance', icon: '💰' },
];

export default function AIDirectory() {
  const { toast } = useToast();
  const [aiTools, setAiTools] = useState<AITool[]>([]);
  const [filteredTools, setFilteredTools] = useState<AITool[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pricingFilter, setPricingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // New AI Tool Form
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    category: '',
    url: '',
    pricing: 'Free' as const,
    features: [] as string[],
    tags: [] as string[],
  });

  const [featureInput, setFeatureInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Initialize with sample data
  useEffect(() => {
    const sampleTools: AITool[] = [
      {
        id: '1',
        name: 'ChatGPT',
        description: 'Advanced conversational AI for text generation, coding, and creative writing',
        category: 'text-generation',
        url: 'https://chat.openai.com',
        pricing: 'Freemium',
        rating: 4.8,
        features: ['Natural Language Processing', 'Code Generation', 'Creative Writing', 'Multi-language Support'],
        tags: ['conversational', 'gpt', 'openai', 'popular'],
        lastUpdated: new Date('2024-01-15'),
        addedDate: new Date('2023-01-01'),
        isVerified: true,
        usage: 15420,
        trending: true,
      },
      {
        id: '2',
        name: 'Midjourney',
        description: 'AI-powered image generation from text descriptions with artistic styles',
        category: 'image-generation',
        url: 'https://midjourney.com',
        pricing: 'Paid',
        rating: 4.7,
        features: ['Text-to-Image', 'Art Styles', 'High Resolution', 'Discord Integration'],
        tags: ['art', 'creative', 'discord', 'premium'],
        lastUpdated: new Date('2024-01-20'),
        addedDate: new Date('2023-03-15'),
        isVerified: true,
        usage: 12300,
        trending: true,
      },
      {
        id: '3',
        name: 'GitHub Copilot',
        description: 'AI pair programmer that helps you write code faster with intelligent suggestions',
        category: 'code-assistant',
        url: 'https://github.com/features/copilot',
        pricing: 'Paid',
        rating: 4.6,
        features: ['Code Completion', 'Multiple Languages', 'IDE Integration', 'Context Aware'],
        tags: ['coding', 'github', 'productivity', 'developer'],
        lastUpdated: new Date('2024-01-18'),
        addedDate: new Date('2023-02-10'),
        isVerified: true,
        usage: 8900,
        trending: false,
      },
      {
        id: '4',
        name: 'Stable Diffusion',
        description: 'Open-source text-to-image diffusion model for generating detailed images',
        category: 'image-generation',
        url: 'https://stability.ai',
        pricing: 'Open Source',
        rating: 4.5,
        features: ['Open Source', 'Local Running', 'Customizable', 'High Quality'],
        tags: ['open-source', 'diffusion', 'local', 'free'],
        lastUpdated: new Date('2024-01-22'),
        addedDate: new Date('2023-04-01'),
        isVerified: true,
        usage: 7650,
        trending: false,
      },
      {
        id: '5',
        name: 'Notion AI',
        description: 'AI-powered writing assistant integrated into Notion workspace',
        category: 'productivity',
        url: 'https://notion.so/ai',
        pricing: 'Freemium',
        rating: 4.4,
        features: ['Writing Assistant', 'Notion Integration', 'Content Generation', 'Workflow Automation'],
        tags: ['productivity', 'writing', 'notion', 'workspace'],
        lastUpdated: new Date('2024-01-16'),
        addedDate: new Date('2023-05-20'),
        isVerified: true,
        usage: 5480,
        trending: true,
      },
    ];

    setAiTools(sampleTools);
    setFilteredTools(sampleTools);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = aiTools;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    // Pricing filter
    if (pricingFilter !== 'all') {
      filtered = filtered.filter(tool => tool.pricing === pricingFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return b.usage - a.usage;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.addedDate.getTime() - a.addedDate.getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredTools(filtered);
  }, [aiTools, selectedCategory, searchQuery, pricingFilter, sortBy]);

  const addFeature = () => {
    if (featureInput.trim() && !newTool.features.includes(featureInput.trim())) {
      setNewTool(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (feature: string) => {
    setNewTool(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !newTool.tags.includes(tagInput.trim())) {
      setNewTool(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setNewTool(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addNewTool = () => {
    if (!newTool.name || !newTool.description || !newTool.url) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const tool: AITool = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...newTool,
      rating: 0,
      lastUpdated: new Date(),
      addedDate: new Date(),
      isVerified: false,
      usage: 0,
      trending: false,
    };

    setAiTools(prev => [tool, ...prev]);
    setNewTool({
      name: '',
      description: '',
      category: '',
      url: '',
      pricing: 'Free',
      features: [],
      tags: [],
    });
    setIsAddDialogOpen(false);

    toast({
      title: "AI Tool Added!",
      description: "New AI tool has been added to the directory.",
    });
  };

  const autoFetchAITools = async () => {
    setIsAutoFetching(true);
    
    // Simulate auto-fetch from web sources
    setTimeout(() => {
      const newTools: AITool[] = [
        {
          id: `auto_${Date.now()}_1`,
          name: 'Claude 3',
          description: 'Anthropic\'s latest AI assistant with improved reasoning and safety',
          category: 'text-generation',
          url: 'https://claude.ai',
          pricing: 'Freemium',
          rating: 4.7,
          features: ['Advanced Reasoning', 'Safety Focused', 'Long Context', 'Code Understanding'],
          tags: ['anthropic', 'safety', 'reasoning', 'new'],
          lastUpdated: new Date(),
          addedDate: new Date(),
          isVerified: true,
          usage: 320,
          trending: true,
        },
        {
          id: `auto_${Date.now()}_2`,
          name: 'Runway ML',
          description: 'AI-powered creative tools for video generation and editing',
          category: 'video-editing',
          url: 'https://runwayml.com',
          pricing: 'Freemium',
          rating: 4.5,
          features: ['Video Generation', 'AI Editing', 'Creative Tools', 'Collaboration'],
          tags: ['video', 'creative', 'editing', 'ml'],
          lastUpdated: new Date(),
          addedDate: new Date(),
          isVerified: true,
          usage: 150,
          trending: true,
        },
      ];

      setAiTools(prev => [...newTools, ...prev]);
      setLastSyncTime(new Date());
      setIsAutoFetching(false);

      toast({
        title: "Sync Complete!",
        description: `${newTools.length} new AI tools discovered and added.`,
      });
    }, 3000);
  };

  const getPricingColor = (pricing: string) => {
    const colors = {
      'Free': 'bg-green-100 text-green-800 border-green-200',
      'Freemium': 'bg-blue-100 text-blue-800 border-blue-200',
      'Paid': 'bg-orange-100 text-orange-800 border-orange-200',
      'Open Source': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[pricing as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">AI Directory</h1>
            <p className="text-xl text-muted-foreground">
              Discover the best AI tools and services with auto-sync updates and manual curation
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last sync: {lastSyncTime.toLocaleString()}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                {aiTools.length} AI tools
              </Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-card rounded-lg border p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search AI tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-ai"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-ai">
                        <Plus className="h-4 w-4 mr-2" />
                        Add AI Tool
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New AI Tool</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="tool-name">Name *</Label>
                            <Input
                              id="tool-name"
                              data-testid="input-tool-name"
                              value={newTool.name}
                              onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="AI Tool Name"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="tool-category">Category *</Label>
                            <Select value={newTool.category} onValueChange={(value) => setNewTool(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger data-testid="select-tool-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {AI_CATEGORIES.filter(cat => cat.id !== 'all').map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.icon} {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="tool-description">Description *</Label>
                          <Textarea
                            id="tool-description"
                            data-testid="input-tool-description"
                            value={newTool.description}
                            onChange={(e) => setNewTool(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe what this AI tool does..."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="tool-url">Website URL *</Label>
                            <Input
                              id="tool-url"
                              data-testid="input-tool-url"
                              value={newTool.url}
                              onChange={(e) => setNewTool(prev => ({ ...prev, url: e.target.value }))}
                              placeholder="https://example.com"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="tool-pricing">Pricing Model</Label>
                            <Select value={newTool.pricing} onValueChange={(value: any) => setNewTool(prev => ({ ...prev, pricing: value }))}>
                              <SelectTrigger data-testid="select-tool-pricing">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Free">Free</SelectItem>
                                <SelectItem value="Freemium">Freemium</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Open Source">Open Source</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="feature-input">Features</Label>
                          <div className="flex gap-2 mb-2">
                            <Input
                              id="feature-input"
                              data-testid="input-feature"
                              value={featureInput}
                              onChange={(e) => setFeatureInput(e.target.value)}
                              placeholder="Add a feature..."
                              onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                            />
                            <Button type="button" onClick={addFeature} size="sm">Add</Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {newTool.features.map((feature) => (
                              <Badge key={feature} variant="secondary" className="cursor-pointer">
                                {feature}
                                <button
                                  type="button"
                                  onClick={() => removeFeature(feature)}
                                  className="ml-2 text-xs"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="tag-input">Tags</Label>
                          <div className="flex gap-2 mb-2">
                            <Input
                              id="tag-input"
                              data-testid="input-tag"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              placeholder="Add a tag..."
                              onKeyPress={(e) => e.key === 'Enter' && addTag()}
                            />
                            <Button type="button" onClick={addTag} size="sm">Add</Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {newTool.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="cursor-pointer">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-2 text-xs"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={addNewTool} data-testid="button-save-tool">
                            Add AI Tool
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    onClick={autoFetchAITools}
                    disabled={isAutoFetching}
                    data-testid="button-auto-sync"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isAutoFetching ? 'animate-spin' : ''}`} />
                    {isAutoFetching ? 'Syncing...' : 'Auto Sync'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="select-category-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pricing-filter">Pricing</Label>
                <Select value={pricingFilter} onValueChange={setPricingFilter}>
                  <SelectTrigger data-testid="select-pricing-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pricing</SelectItem>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Freemium">Freemium</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Open Source">Open Source</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort-filter">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger data-testid="select-sort-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">🔥 Trending</SelectItem>
                    <SelectItem value="rating">⭐ Rating</SelectItem>
                    <SelectItem value="newest">🆕 Newest</SelectItem>
                    <SelectItem value="name">📝 Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  {filteredTools.length} Tools
                </Button>
              </div>
            </div>
          </div>

          {/* AI Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <Card key={tool.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        {tool.trending && (
                          <Badge variant="destructive" className="text-xs px-2 py-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                        {tool.isVerified && (
                          <Badge variant="secondary" className="text-xs px-2 py-1">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {getRatingStars(tool.rating)}
                          <span className="text-sm text-muted-foreground ml-1">
                            {tool.rating > 0 ? tool.rating.toFixed(1) : 'New'}
                          </span>
                        </div>
                        
                        <Badge className={getPricingColor(tool.pricing)} variant="outline">
                          {tool.pricing}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(tool.url, '_blank')}
                      data-testid={`button-visit-${tool.id}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tool.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {tool.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{tool.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {tool.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium">Key Features:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tool.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {tool.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{tool.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {tool.usage.toLocaleString()} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated {tool.lastUpdated.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No AI Tools Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms, or add a new AI tool to get started.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First AI Tool
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}