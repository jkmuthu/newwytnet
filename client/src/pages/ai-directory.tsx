import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  Eye,
  Users,
  Shield,
  Activity,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Sparkles,
  Target,
  Layers,
  Network,
  Crown,
  Heart,
  MessageSquare
} from "lucide-react";
import { openExternalLink, UTMCampaigns } from "@/lib/utm";

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
  source: 'auto-crawl' | 'community' | 'manual' | 'curator';
  status: 'active' | 'pending' | 'rejected' | 'under-review';
  upvotes: number;
  downvotes: number;
  submittedBy?: string;
  moderatedBy?: string;
  communityScore: number;
  autoCategories: string[];
  crawlData?: {
    lastCrawled: Date;
    changeDetected: boolean;
    healthStatus: 'healthy' | 'warning' | 'error';
  };
}

interface CrawlSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  toolsFound: number;
  toolsUpdated: number;
  errors: string[];
  sources: string[];
}

interface CommunitySubmission {
  id: string;
  toolData: Partial<AITool>;
  submittedBy: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  moderatorNotes?: string;
  votes: { up: number; down: number };
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
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [crawlSessions, setCrawlSessions] = useState<CrawlSession[]>([]);
  const [communitySubmissions, setCommunitySubmissions] = useState<CommunitySubmission[]>([]);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [activeView, setActiveView] = useState<'directory' | 'community' | 'admin'>('directory');

  // New AI Tool Form
  const [newTool, setNewTool] = useState({
    name: '',
    webLink: '',
    androidApp: '',
    iosApp: '',
    // Auto-fetched fields (will be populated by system)
    description: '',
    category: '',
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
        source: 'auto-crawl',
        status: 'active',
        upvotes: 1250,
        downvotes: 45,
        communityScore: 4.7,
        autoCategories: ['text-generation', 'chatbots'],
        crawlData: {
          lastCrawled: new Date(),
          changeDetected: false,
          healthStatus: 'healthy'
        }
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
        source: 'community',
        status: 'active',
        upvotes: 980,
        downvotes: 32,
        submittedBy: 'artist_user_123',
        communityScore: 4.6,
        autoCategories: ['image-generation', 'design'],
        crawlData: {
          lastCrawled: new Date(),
          changeDetected: true,
          healthStatus: 'healthy'
        }
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

    // Apply similar pattern to other sample tools...
    sampleTools.forEach((tool, index) => {
      if (!tool.source) {
        tool.source = index % 3 === 0 ? 'auto-crawl' : index % 3 === 1 ? 'community' : 'manual';
        tool.status = 'active';
        tool.upvotes = Math.floor(Math.random() * 1000) + 100;
        tool.downvotes = Math.floor(Math.random() * 50) + 5;
        tool.communityScore = parseFloat((Math.random() * 2 + 3).toFixed(1));
        tool.autoCategories = [tool.category];
        tool.crawlData = {
          lastCrawled: new Date(),
          changeDetected: Math.random() > 0.7,
          healthStatus: Math.random() > 0.1 ? 'healthy' : 'warning'
        };
      }
    });

    setAiTools(sampleTools);
    setFilteredTools(sampleTools);

    // Initialize sample community submissions
    const sampleSubmissions: CommunitySubmission[] = [
      {
        id: 'sub_1',
        toolData: {
          name: 'Perplexity AI',
          description: 'AI-powered search engine with real-time information',
          category: 'research',
          url: 'https://perplexity.ai',
          pricing: 'Freemium',
          features: ['Real-time Search', 'Source Citations', 'AI Answers'],
          tags: ['search', 'research', 'citations']
        },
        submittedBy: 'researcher_pro',
        submittedAt: new Date(),
        status: 'pending',
        votes: { up: 15, down: 2 }
      }
    ];
    setCommunitySubmissions(sampleSubmissions);
  }, []);

  // Auto-sync scheduler
  useEffect(() => {
    if (!autoSyncEnabled) return;

    const interval = setInterval(() => {
      // Simulate periodic crawling every 30 minutes
      if (Math.random() > 0.7) { // 30% chance to trigger
        performAutoCrawl();
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [autoSyncEnabled]);

  // Filter and search logic
  useEffect(() => {
    let filtered = aiTools.filter(tool => tool.status === 'active');

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    // Pricing filter
    if (pricingFilter !== 'all') {
      filtered = filtered.filter(tool => tool.pricing === pricingFilter);
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(tool => tool.source === sourceFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tool.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
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
        case 'community-score':
          return b.communityScore - a.communityScore;
        case 'newest':
          return b.addedDate.getTime() - a.addedDate.getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'upvotes':
          return b.upvotes - a.upvotes;
        default:
          return 0;
      }
    });

    setFilteredTools(filtered);
  }, [aiTools, selectedCategory, searchQuery, pricingFilter, sourceFilter, sortBy]);

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

  // URL validation helper - ensures safe URLs only (prevents XSS)
  const isValidSafeUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    
    try {
      const parsedUrl = new URL(url.trim());
      // Only allow http and https protocols
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Validation helper - check if at least one valid, safe link is provided
  const hasAtLeastOneLink = () => {
    return isValidSafeUrl(newTool.webLink) || 
           isValidSafeUrl(newTool.androidApp) || 
           isValidSafeUrl(newTool.iosApp);
  };

  // Auto-fetch tool information from provided URLs
  const autoFetchToolInfo = async (url: string) => {
    try {
      // Simulate auto-fetching (in production, this would make real API calls)
      const mockData = {
        description: `AI-powered tool automatically discovered from ${new URL(url).hostname}`,
        category: 'productivity', // Auto-determined category
        pricing: 'Freemium' as const,
        features: ['AI Integration', 'User-Friendly Interface', 'Cloud-Based'],
        tags: ['productivity', 'ai', 'automation'],
      };
      
      return mockData;
    } catch (error) {
      console.error('Auto-fetch failed:', error);
      return null;
    }
  };

  const addNewTool = async () => {
    // Validate required fields
    if (!newTool.name.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a tool name/title.",
        variant: "destructive",
      });
      return;
    }

    if (!hasAtLeastOneLink()) {
      toast({
        title: "No Links Provided",
        description: "Please provide at least one link (Web, Android App, or iOS App).",
        variant: "destructive",
      });
      return;
    }

    // Auto-fetch information from the first available SAFE URL
    const primaryUrl = [newTool.webLink, newTool.androidApp, newTool.iosApp]
      .find(url => isValidSafeUrl(url)) || '';
    
    const autoFetchedData = await autoFetchToolInfo(primaryUrl);

    const tool: AITool = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newTool.name,
      description: autoFetchedData?.description || `AI tool: ${newTool.name}`,
      category: autoFetchedData?.category || 'productivity',
      url: primaryUrl, // Use primary URL for main link
      pricing: autoFetchedData?.pricing || 'Free',
      features: autoFetchedData?.features || [],
      tags: autoFetchedData?.tags || [],
      rating: 0,
      lastUpdated: new Date(),
      addedDate: new Date(),
      isVerified: false,
      usage: 0,
      trending: false,
      source: 'manual',
      status: 'active',
      upvotes: 0,
      downvotes: 0,
      communityScore: 0,
      autoCategories: [autoFetchedData?.category || 'productivity'],
      crawlData: {
        lastCrawled: new Date(),
        changeDetected: false,
        healthStatus: 'healthy'
      }
    };

    setAiTools(prev => [tool, ...prev]);
    setNewTool({
      name: '',
      webLink: '',
      androidApp: '',
      iosApp: '',
      description: '',
      category: '',
      pricing: 'Free',
      features: [],
      tags: [],
    });
    setIsAddDialogOpen(false);

    toast({
      title: "✅ AI Tool Added!",
      description: `${newTool.name} has been added with auto-fetched information.`,
    });
  };

  // Community tool submission functionality removed since Community tab was removed

  // Approval functionality removed since Community tab was removed

  // Voting functionality removed since Community tab was removed

  const performAutoCrawl = useCallback(async () => {
    if (isAutoFetching) return;
    
    setIsAutoFetching(true);
    setCrawlProgress(0);
    
    const crawlSession: CrawlSession = {
      id: `crawl_${Date.now()}`,
      startTime: new Date(),
      status: 'running',
      toolsFound: 0,
      toolsUpdated: 0,
      errors: [],
      sources: ['ProductHunt', 'HackerNews', 'AI News', 'GitHub Trending']
    };

    setCrawlSessions(prev => [crawlSession, ...prev.slice(0, 9)]);

    // Simulate crawling progress
    const progressInterval = setInterval(() => {
      setCrawlProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 500);

    // Simulate actual crawling
    setTimeout(() => {
      const discoveredTools: AITool[] = [
        {
          id: `auto_${Date.now()}_1`,
          name: 'Claude 3 Opus',
          description: 'Anthropic\'s most advanced AI assistant with enhanced reasoning capabilities',
          category: 'text-generation',
          url: 'https://claude.ai',
          pricing: 'Freemium',
          rating: 4.8,
          features: ['Advanced Reasoning', 'Safety Focused', 'Long Context', 'Code Understanding', 'Vision'],
          tags: ['anthropic', 'safety', 'reasoning', 'vision', 'new'],
          lastUpdated: new Date(),
          addedDate: new Date(),
          isVerified: false,
          usage: 0,
          trending: true,
          source: 'auto-crawl',
          status: 'active',
          upvotes: 0,
          downvotes: 0,
          communityScore: 0,
          autoCategories: ['text-generation', 'chatbots'],
          crawlData: {
            lastCrawled: new Date(),
            changeDetected: true,
            healthStatus: 'healthy'
          }
        },
        {
          id: `auto_${Date.now()}_2`,
          name: 'RunwayML Gen-3',
          description: 'Next-generation AI video creation platform with advanced editing capabilities',
          category: 'video-editing',
          url: 'https://runwayml.com',
          pricing: 'Freemium',
          rating: 4.6,
          features: ['Video Generation', 'AI Editing', 'Real-time Effects', 'Collaboration', 'Text-to-Video'],
          tags: ['video', 'creative', 'editing', 'ml', 'generation'],
          lastUpdated: new Date(),
          addedDate: new Date(),
          isVerified: false,
          usage: 0,
          trending: true,
          source: 'auto-crawl',
          status: 'active',
          upvotes: 0,
          downvotes: 0,
          communityScore: 0,
          autoCategories: ['video-editing', 'design'],
          crawlData: {
            lastCrawled: new Date(),
            changeDetected: true,
            healthStatus: 'healthy'
          }
        }
      ];

      // Update crawl session
      const completedSession = {
        ...crawlSession,
        endTime: new Date(),
        status: 'completed' as const,
        toolsFound: discoveredTools.length,
        toolsUpdated: Math.floor(Math.random() * 5),
      };

      setCrawlSessions(prev => [completedSession, ...prev.slice(1)]);
      setAiTools(prev => [...discoveredTools, ...prev]);
      setLastSyncTime(new Date());
      setIsAutoFetching(false);
      setCrawlProgress(100);

      toast({
        title: "🚀 Auto-Crawl Complete!",
        description: `Discovered ${discoveredTools.length} new AI tools. Updated ${completedSession.toolsUpdated} existing tools.`,
      });

      // Reset progress after a delay
      setTimeout(() => setCrawlProgress(0), 2000);
    }, 4000);
  }, [isAutoFetching]);

  const autoFetchAITools = () => {
    performAutoCrawl();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              AI Tools Directory
            </h1>
            <p className="text-sm text-muted-foreground">
              Discover and explore AI tools
            </p>
          </div>


          {/* Auto-Sync Progress */}
          {crawlProgress > 0 && (
            <Card className="mb-8 border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-300">Auto-Crawling in Progress</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Discovering new AI tools across the web...</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Progress value={crawlProgress} className="h-2" />
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{crawlProgress.toFixed(0)}% complete</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compact Controls */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-4 mb-6">
            
            {/* Search Bar and Suggest Button */}
            <div className="flex gap-2 mb-4">
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
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-add-ai">
                    <Plus className="h-4 w-4 mr-1" />
                    Suggest
                  </Button>
                </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-purple-600" />
                          Submit AI Tool
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground space-y-1">
                          <p>Add your AI tool - we'll auto-fetch category, description, and other details from your links!</p>
                          <p className="text-xs">✅ Secure: Only accepts http/https URLs for safety</p>
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {/* Title Field - Required */}
                        <div>
                          <Label htmlFor="tool-name">Title *</Label>
                          <Input
                            id="tool-name"
                            data-testid="input-tool-name"
                            value={newTool.name}
                            onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter AI tool name"
                            className="mt-1"
                          />
                        </div>

                        <div className="border-t pt-4">
                          <p className="text-sm font-medium text-muted-foreground mb-3">
                            Provide at least one link below:
                          </p>
                        </div>

                        {/* Web Link - Optional */}
                        <div>
                          <Label htmlFor="web-link">🌐 Web Link</Label>
                          <Input
                            id="web-link"
                            data-testid="input-web-link"
                            value={newTool.webLink}
                            onChange={(e) => setNewTool(prev => ({ ...prev, webLink: e.target.value }))}
                            placeholder="https://example.com"
                            className={`mt-1 ${newTool.webLink && !isValidSafeUrl(newTool.webLink) ? 'border-red-300 focus:border-red-500' : ''}`}
                          />
                          {newTool.webLink && !isValidSafeUrl(newTool.webLink) && (
                            <p className="text-xs text-red-600 mt-1">Please enter a valid https:// URL</p>
                          )}
                        </div>

                        {/* Android App - Optional */}
                        <div>
                          <Label htmlFor="android-app">📱 Android App</Label>
                          <Input
                            id="android-app"
                            data-testid="input-android-app"
                            value={newTool.androidApp}
                            onChange={(e) => setNewTool(prev => ({ ...prev, androidApp: e.target.value }))}
                            placeholder="https://play.google.com/store/apps/details?id=..."
                            className="mt-1"
                          />
                        </div>

                        {/* iOS App - Optional */}
                        <div>
                          <Label htmlFor="ios-app">📲 iOS App</Label>
                          <Input
                            id="ios-app"
                            data-testid="input-ios-app"
                            value={newTool.iosApp}
                            onChange={(e) => setNewTool(prev => ({ ...prev, iosApp: e.target.value }))}
                            placeholder="https://apps.apple.com/app/id..."
                            className="mt-1"
                          />
                        </div>

                        {/* Auto-fetch notification */}
                        {hasAtLeastOneLink() && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-700 dark:text-blue-300">
                                Category, description, and details will be auto-fetched from your links!
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={addNewTool} 
                            data-testid="button-save-tool"
                            disabled={!newTool.name.trim() || !hasAtLeastOneLink()}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            {!newTool.name.trim() ? "Enter Title" : 
                             !hasAtLeastOneLink() ? "Add Link" : 
                             "✨ Submit Tool"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                </div>
              </div>
            </div>

            {/* Compact Filters Row */}
            <div className="flex items-center justify-between">
              <Tabs defaultValue="all" className="w-fit">
                <TabsList className="grid grid-cols-5 w-fit">
                  <TabsTrigger value="all" className="text-xs px-2" onClick={() => setSelectedCategory('all')}>All</TabsTrigger>
                  <TabsTrigger value="text-generation" className="text-xs px-2" onClick={() => setSelectedCategory('text-generation')}>Text</TabsTrigger>
                  <TabsTrigger value="image-generation" className="text-xs px-2" onClick={() => setSelectedCategory('image-generation')}>Image</TabsTrigger>
                  <TabsTrigger value="code-assistant" className="text-xs px-2" onClick={() => setSelectedCategory('code-assistant')}>Code</TabsTrigger>
                  <TabsTrigger value="productivity" className="text-xs px-2" onClick={() => setSelectedCategory('productivity')}>Tools</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center gap-2">
                <Select value={pricingFilter} onValueChange={setPricingFilter}>
                  <SelectTrigger className="w-20 h-8 text-xs" data-testid="select-pricing-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Freemium">Freemium</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="text-xs text-muted-foreground">
                  {filteredTools.length} tools
                </div>
              </div>
            </div>
          </div>

          {/* AI Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <Card key={tool.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{tool.name}</CardTitle>
                          {tool.trending && (
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                          {tool.isVerified && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
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
                        onClick={() => openExternalLink(tool.url, {
                          ...UTMCampaigns.AI_DIRECTORY,
                          content: tool.name,
                          term: tool.category
                        })}
                        className="hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600"
                        data-testid={`button-visit-${tool.id}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {tool.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20">
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 opacity-50">
                  <Bot className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No AI tools found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Try adjusting your filters or search terms, or submit a new tool to help grow our directory.
                </p>
              </div>
            )}

        </div>
      </main>
    </div>
  );
}