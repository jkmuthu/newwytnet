import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
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

  // Community Submission Form
  const [communityTool, setCommunityTool] = useState({
    name: '',
    description: '',
    category: '',
    url: '',
    pricing: 'Free' as const,
    features: [] as string[],
    tags: [] as string[],
    submitterName: '',
    submitterEmail: '',
    reason: '',
  });

  const [featureInput, setFeatureInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [communityFeatureInput, setCommunityFeatureInput] = useState('');
  const [communityTagInput, setCommunityTagInput] = useState('');

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

  const submitCommunityTool = () => {
    if (!communityTool.name || !communityTool.description || !communityTool.url || !communityTool.submitterName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const submission: CommunitySubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      toolData: {
        name: communityTool.name,
        description: communityTool.description,
        category: communityTool.category,
        url: communityTool.url,
        pricing: communityTool.pricing,
        features: communityTool.features,
        tags: communityTool.tags,
      },
      submittedBy: communityTool.submitterName,
      submittedAt: new Date(),
      status: 'pending',
      votes: { up: 0, down: 0 }
    };

    setCommunitySubmissions(prev => [submission, ...prev]);
    setCommunityTool({
      name: '',
      description: '',
      category: '',
      url: '',
      pricing: 'Free',
      features: [],
      tags: [],
      submitterName: '',
      submitterEmail: '',
      reason: '',
    });
    setIsSubmissionDialogOpen(false);

    toast({
      title: "🎉 Submission Received!",
      description: "Your AI tool submission is now under community review. Thank you for contributing!",
    });
  };

  const approveSubmission = (submissionId: string) => {
    const submission = communitySubmissions.find(s => s.id === submissionId);
    if (!submission) return;

    const newTool: AITool = {
      id: `community_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: submission.toolData.name!,
      description: submission.toolData.description!,
      category: submission.toolData.category!,
      url: submission.toolData.url!,
      pricing: submission.toolData.pricing!,
      rating: 0,
      features: submission.toolData.features || [],
      tags: submission.toolData.tags || [],
      lastUpdated: new Date(),
      addedDate: new Date(),
      isVerified: false,
      usage: 0,
      trending: false,
      source: 'community',
      status: 'active',
      upvotes: submission.votes.up,
      downvotes: submission.votes.down,
      submittedBy: submission.submittedBy,
      communityScore: 0,
      autoCategories: [submission.toolData.category!],
    };

    setAiTools(prev => [newTool, ...prev]);
    setCommunitySubmissions(prev => prev.map(s => 
      s.id === submissionId ? { ...s, status: 'approved' as const } : s
    ));

    toast({
      title: "✅ Submission Approved!",
      description: `${newTool.name} has been added to the directory.`,
    });
  };

  const voteOnTool = (toolId: string, voteType: 'up' | 'down') => {
    setAiTools(prev => prev.map(tool => {
      if (tool.id === toolId) {
        const newUpvotes = voteType === 'up' ? tool.upvotes + 1 : tool.upvotes;
        const newDownvotes = voteType === 'down' ? tool.downvotes + 1 : tool.downvotes;
        const newCommunityScore = parseFloat(((newUpvotes / (newUpvotes + newDownvotes)) * 5).toFixed(1));
        
        return {
          ...tool,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          communityScore: newCommunityScore
        };
      }
      return tool;
    }));

    toast({
      title: voteType === 'up' ? "👍 Upvoted!" : "👎 Downvoted!",
      description: "Thank you for your feedback!",
    });
  };

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
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl mb-6">
              <Bot className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              AI Tools Directory
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The most comprehensive, community-driven directory of AI tools with real-time discovery, 
              automated categorization, and intelligent recommendations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span>Auto-Sync: {autoSyncEnabled ? 'ON' : 'OFF'}</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Last sync: {lastSyncTime.toLocaleDateString()}</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
                <Database className="h-4 w-4 text-purple-500" />
                <span>{aiTools.filter(t => t.status === 'active').length} Active Tools</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span>{communitySubmissions.filter(s => s.status === 'pending').length} Pending Reviews</span>
              </Badge>
            </div>
          </div>

          {/* Navigation Tabs and Content */}
          <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)} className="w-full">
            <div className="mb-8">
              <TabsList className="grid w-full grid-cols-2 lg:w-fit lg:grid-cols-2 mx-auto">
                <TabsTrigger value="directory" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Directory
                </TabsTrigger>
                <TabsTrigger value="community" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Community
                  {communitySubmissions.filter(s => s.status === 'pending').length > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 min-w-5 text-xs">
                      {communitySubmissions.filter(s => s.status === 'pending').length}
                    </Badge>
                  )}
                </TabsTrigger>
                {/* Admin tab removed from public frontend - only available in Super Admin Panel */}
              </TabsList>
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

          {/* Controls */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6 mb-8">
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
                  <Dialog open={isSubmissionDialogOpen} onOpenChange={setIsSubmissionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" data-testid="button-submit-community">
                        <Users className="h-4 w-4 mr-2" />
                        Submit Tool
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                          <Users className="h-5 w-5 text-purple-600" />
                          Submit AI Tool to Community
                        </DialogTitle>
                        <p className="text-muted-foreground">
                          Help grow our directory by submitting new AI tools for community review and approval.
                        </p>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Submission Guidelines</h4>
                          <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                            <li>• Tool must be publicly accessible and functional</li>
                            <li>• Provide accurate description and categorization</li>
                            <li>• Include contact information for verification</li>
                            <li>• Community will vote on your submission</li>
                          </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="community-tool-name">Tool Name *</Label>
                            <Input
                              id="community-tool-name"
                              value={communityTool.name}
                              onChange={(e) => setCommunityTool(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="AI Tool Name"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="community-tool-category">Category *</Label>
                            <Select value={communityTool.category} onValueChange={(value) => setCommunityTool(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger>
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
                          <Label htmlFor="community-tool-description">Description *</Label>
                          <Textarea
                            id="community-tool-description"
                            value={communityTool.description}
                            onChange={(e) => setCommunityTool(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Detailed description of what this AI tool does and its main features..."
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="community-tool-url">Website URL *</Label>
                            <Input
                              id="community-tool-url"
                              value={communityTool.url}
                              onChange={(e) => setCommunityTool(prev => ({ ...prev, url: e.target.value }))}
                              placeholder="https://example.com"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="community-pricing">Pricing Model *</Label>
                            <Select value={communityTool.pricing} onValueChange={(value: any) => setCommunityTool(prev => ({ ...prev, pricing: value }))}>
                              <SelectTrigger>
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

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="submitter-name">Your Name *</Label>
                            <Input
                              id="submitter-name"
                              value={communityTool.submitterName}
                              onChange={(e) => setCommunityTool(prev => ({ ...prev, submitterName: e.target.value }))}
                              placeholder="Your full name"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="submitter-email">Your Email</Label>
                            <Input
                              id="submitter-email"
                              type="email"
                              value={communityTool.submitterEmail}
                              onChange={(e) => setCommunityTool(prev => ({ ...prev, submitterEmail: e.target.value }))}
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="submission-reason">Why should this tool be included?</Label>
                          <Textarea
                            id="submission-reason"
                            value={communityTool.reason}
                            onChange={(e) => setCommunityTool(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Explain why this tool would be valuable to the community..."
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button 
                            onClick={submitCommunityTool}
                            className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Submit for Review
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsSubmissionDialogOpen(false)}
                            className="px-8"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" data-testid="button-add-ai">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tool
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-purple-600" />
                          Submit AI Tool
                        </DialogTitle>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Add your AI tool - we'll auto-fetch category, description, and other details from your links!</p>
                          <p className="text-xs">✅ Secure: Only accepts http/https URLs for safety</p>
                        </div>
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
                <Label htmlFor="source-filter">Source</Label>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger data-testid="select-source-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="auto-crawl">🤖 Auto-Crawled</SelectItem>
                    <SelectItem value="community">👥 Community</SelectItem>
                    <SelectItem value="manual">✏️ Manual</SelectItem>
                    <SelectItem value="curator">👑 Curated</SelectItem>
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
                    <SelectItem value="community-score">💖 Community Score</SelectItem>
                    <SelectItem value="upvotes">👍 Most Upvoted</SelectItem>
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

          {/* Content Views */}
          <TabsContent value="directory" className="space-y-6">
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

                          {/* Source Badge */}
                          <Badge variant="outline" className="text-xs">
                            {tool.source === 'auto-crawl' && '🤖'}
                            {tool.source === 'community' && '👥'}
                            {tool.source === 'manual' && '✏️'}
                            {tool.source === 'curator' && '👑'}
                            {tool.source.charAt(0).toUpperCase() + tool.source.slice(1).replace('-', ' ')}
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
                        className="hover:bg-purple-100 dark:hover:bg-purple-900/20"
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
                      
                      {/* Community Voting */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {tool.usage.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-red-500" />
                            {tool.communityScore.toFixed(1)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => voteOnTool(tool.id, 'up')}
                            className="h-7 w-7 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                          >
                            <span className="text-green-600">👍</span>
                          </Button>
                          <span className="text-xs font-medium text-green-600">{tool.upvotes}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => voteOnTool(tool.id, 'down')}
                            className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 ml-2"
                          >
                            <span className="text-red-600">👎</span>
                          </Button>
                          <span className="text-xs font-medium text-red-600">{tool.downvotes}</span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Updated {tool.lastUpdated.toLocaleDateString()}
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
          </TabsContent>

          {/* Community Submissions View */}
          <TabsContent value="community" className="space-y-6">
            <div className="grid gap-6">
              <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    Community Submissions
                    <Badge variant="secondary">{communitySubmissions.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {communitySubmissions.map((submission) => (
                    <div key={submission.id} className="border rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{submission.toolData.name}</h4>
                            <Badge 
                              variant={submission.status === 'pending' ? 'destructive' : submission.status === 'approved' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{submission.toolData.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>By: {submission.submittedBy}</span>
                            <span>Submitted: {submission.submittedAt.toLocaleDateString()}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">👍 {submission.votes.up}</span>
                              <span className="text-red-600">👎 {submission.votes.down}</span>
                            </div>
                          </div>
                        </div>
                        {/* Admin approval buttons moved to Super Admin panel - not shown in public frontend */}
                      </div>
                    </div>
                  ))}

                  {communitySubmissions.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="font-semibold mb-2">No submissions yet</h3>
                      <p className="text-muted-foreground">Community submissions will appear here for review and voting.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Admin Panel View */}
          <TabsContent value="admin" className="space-y-6">
            <div className="grid gap-6">
              {/* Auto-Sync Settings */}
              <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Auto-Sync Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Automatic Crawling</h4>
                      <p className="text-sm text-muted-foreground">Enable periodic discovery of new AI tools</p>
                    </div>
                    <Switch checked={autoSyncEnabled} onCheckedChange={setAutoSyncEnabled} />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{aiTools.filter(t => t.source === 'auto-crawl').length}</div>
                      <div className="text-sm text-muted-foreground">Auto-Crawled</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">{aiTools.filter(t => t.source === 'community').length}</div>
                      <div className="text-sm text-muted-foreground">Community Added</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{aiTools.filter(t => t.status === 'active').length}</div>
                      <div className="text-sm text-muted-foreground">Active Tools</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Crawl Sessions */}
              <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-green-600" />
                    Recent Crawl Sessions
                    <Badge variant="secondary">{crawlSessions.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {crawlSessions.map((session) => (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={session.status === 'completed' ? 'default' : session.status === 'running' ? 'secondary' : 'destructive'}
                            >
                              {session.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {session.status === 'running' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                              {session.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </Badge>
                            <span className="text-sm font-medium">Session {session.id.split('_')[1]}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {session.startTime.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Sources:</span>
                            <div className="font-medium">{session.sources.length}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Found:</span>
                            <div className="font-medium text-green-600">{session.toolsFound}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Updated:</span>
                            <div className="font-medium text-blue-600">{session.toolsUpdated}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <div className="font-medium">
                              {session.endTime ? `${Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000)}s` : 'Running...'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {crawlSessions.length === 0 && (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="font-semibold mb-2">No crawl sessions yet</h3>
                        <p className="text-muted-foreground">Crawl session logs will appear here when auto-sync runs.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}