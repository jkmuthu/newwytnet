import { useState, useRef, useEffect } from "react";
import { X, Send, Mic, MicOff, Sparkles, Minimize2, Maximize2, Settings, Paperclip, Trash2, MessageSquare, Info, Download, Plus, History, Edit2, MoreVertical, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { WorkflowEngine, workflows, type WorkflowState, type WorkflowStep } from "@/lib/workflows";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useLocation } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: { name: string; type: string; url: string; size: number }[];
}

type ChatMode = "free" | "guided";

interface Conversation {
  id: string;
  displayId: string;
  title: string;
  model: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper function to group conversations by date
function groupConversationsByDate(conversations: Conversation[]): Record<string, Conversation[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const groups: Record<string, Conversation[]> = {
    'இன்று': [],
    'நேற்று': [],
    'கடந்த 7 நாட்கள்': [],
    'கடந்த 30 நாட்கள்': [],
    'பழையவை': [],
  };

  conversations.forEach(conv => {
    const convDate = new Date(conv.createdAt);
    const convDateOnly = new Date(convDate.getFullYear(), convDate.getMonth(), convDate.getDate());

    if (convDateOnly.getTime() === today.getTime()) {
      groups['இன்று'].push(conv);
    } else if (convDateOnly.getTime() === yesterday.getTime()) {
      groups['நேற்று'].push(conv);
    } else if (convDate >= sevenDaysAgo) {
      groups['கடந்த 7 நாட்கள்'].push(conv);
    } else if (convDate >= thirtyDaysAgo) {
      groups['கடந்த 30 நாட்கள்'].push(conv);
    } else {
      groups['பழையவை'].push(conv);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}

export default function WytAIAgent() {
  const { isMobile } = useDeviceDetection();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "settings">("chat");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [chatMode, setChatMode] = useState<ChatMode>("free");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "வணக்கம்! நான் WytAI Agent. உங்கள் Engine-ஐ மேம்படுத்த உதவுவதற்காக இங்கு இருக்கிறேன். எப்படி உதவலாம்?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  
  // Chat History State
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workflowEngineRef = useRef<WorkflowEngine>(new WorkflowEngine());
  const { toast} = useToast();

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery<{success: boolean; conversations: Conversation[]}>({
    queryKey: ["/api/admin/wytai/conversations"],
    enabled: isOpen, // Only fetch when WytAI is open
  });
  const conversations = conversationsData?.conversations || [];

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (data: { title?: string; model?: string }) => {
      return apiRequest("/api/admin/wytai/conversations", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wytai/conversations"] });
    },
  });

  // Update conversation mutation (rename, archive)
  const updateConversationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title?: string; model?: string; isArchived?: boolean } }) => {
      return apiRequest(`/api/admin/wytai/conversations/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wytai/conversations"] });
      setEditingConversationId(null);
    },
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/wytai/conversations/${id}`, "DELETE");
    },
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wytai/conversations"] });
      if (activeConversation && activeConversation.id === deletedId) {
        setActiveConversation(null);
        // Reset to default welcome message
        setMessages([{
          role: "assistant",
          content: "வணக்கம்! நான் WytAI Agent. உங்கள் Engine-ஐ மேம்படுத்த உதவுவதற்காக இங்கு இருக்கிறேன். எப்படி உதவலாம்?",
          timestamp: new Date(),
        }]);
      }
    },
  });

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'ta-IN'; // Tamil language

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice recognition failed",
          description: "Please try typing instead",
          variant: "destructive",
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to toggle chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        if (!isOpen) {
          setActiveTab("chat");
          setIsMinimized(false);
        }
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);


  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleVoice = () => {
    if (!recognition) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValid = file.size <= 5 * 1024 * 1024; // 5MB limit
      if (!isValid) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive",
        });
      }
      return isValid;
    });
    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "வணக்கம்! நான் WytAI Agent. உங்கள் Engine-ஐ மேம்படுத்த உதவுவதற்காக இங்கு இருக்கிறேன். எப்படி உதவலாம்?",
        timestamp: new Date(),
      },
    ]);
    setAttachments([]);
    workflowEngineRef.current.resetWorkflow();
    setWorkflowState(null);
    toast({
      title: "Chat cleared",
      description: "Conversation history has been reset",
    });
  };

  // Conversation Management Functions
  const handleNewChat = async () => {
    try {
      const response: any = await createConversationMutation.mutateAsync({
        title: "New Conversation",
        model: selectedModel,
      });
      const newConversation = response.conversation;
      setActiveConversation(newConversation);
      // Reset messages to welcome
      setMessages([{
        role: "assistant",
        content: "வணக்கம்! நான் WytAI Agent. உங்கள் Engine-ஐ மேம்படுத்த உதவுவதற்காக இங்கு இருக்கிறேன். எப்படி உதவலாம்?",
        timestamp: new Date(),
      }]);
      setAttachments([]);
      workflowEngineRef.current.resetWorkflow();
      setWorkflowState(null);
      toast({
        title: "New conversation created",
        description: "Started a fresh chat",
      });
    } catch (error: any) {
      toast({
        title: "Failed to create conversation",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleSwitchConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    // TODO: Load messages from backend when message persistence is implemented
    // For now, just reset to welcome message
    setMessages([{
      role: "assistant",
      content: "வணக்கம்! நான் WytAI Agent. உங்கள் Engine-ஐ மேம்படுத்த உதவுவதற்காக இங்கு இருக்கிறேன். எப்படி உதவலாம்?",
      timestamp: new Date(),
    }]);
    setAttachments([]);
    setSelectedModel(conversation.model);
  };

  const handleStartEditing = (conversation: Conversation) => {
    setEditingConversationId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const handleSaveTitle = async (conversationId: string) => {
    if (!editingTitle.trim()) {
      toast({
        title: "Title required",
        description: "Conversation title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateConversationMutation.mutateAsync({
        id: conversationId,
        data: { title: editingTitle.trim() },
      });
      toast({
        title: "Conversation renamed",
        description: "Title updated successfully",
      });
      // Update active conversation if it's the one being edited
      if (activeConversation?.id === conversationId) {
        setActiveConversation({ ...activeConversation, title: editingTitle.trim() });
      }
    } catch (error: any) {
      toast({
        title: "Failed to rename",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversationMutation.mutateAsync(conversationId);
      toast({
        title: "Conversation deleted",
        description: "Chat history removed",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const startWorkflow = (workflowId: string) => {
    const state = workflowEngineRef.current.startWorkflow(workflowId);
    setWorkflowState(state);
    
    const currentStep = workflowEngineRef.current.getCurrentStep();
    if (currentStep) {
      const workflowInfo = workflows[workflowId];
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `${workflowInfo.icon} **${workflowInfo.name}** தொடங்கியது!\n\n${currentStep.icon} **${currentStep.title}**\n${currentStep.prompt}`,
          timestamp: new Date(),
        },
      ]);
    }

    // Switch to chat tab
    setActiveTab("chat");
  };

  const handleWorkflowResponse = (response: string) => {
    const result = workflowEngineRef.current.processResponse(response);
    
    if (result.error) {
      toast({
        title: "சரிபார்ப்பு பிழை",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    // Update workflow state
    const newState = workflowEngineRef.current.getState();
    setWorkflowState(newState);

    if (result.isComplete) {
      // Workflow completed
      const context = newState?.context;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ **வெற்றிகரமாக உருவாக்கப்பட்டது!**\n\n**உருவாக்கப்பட்டவை:**\n- ${context.type === 'module' ? '📦 Module' : context.type === 'app' ? '📱 App' : '🌐 Hub'}: ${context.name}\n- விவரம்: ${context.description}\n\n**அடுத்து என்ன செய்யலாம்:**\n→ Test செய்யலாம்\n→ மேலும் features சேர்க்கலாம்\n→ Hub-இல் deploy செய்யலாம்`,
          timestamp: new Date(),
        },
      ]);
      workflowEngineRef.current.resetWorkflow();
      setWorkflowState(null);
    } else if (result.nextStep) {
      // Show next step
      if (result.nextStep.id === 'ai-analysis') {
        // Trigger AI analysis
        handleAIAnalysis();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `${result.nextStep?.icon} **${result.nextStep?.title}**\n${result.nextStep?.prompt}`,
            timestamp: new Date(),
          },
        ]);
      }
    }
  };

  const handleAIAnalysis = async () => {
    const context = workflowEngineRef.current.getState()?.context;
    
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `🤖 **AI பகுப்பாய்வு செய்கிறது...**\n\nஉங்கள் ${context.type} "${context.name}" -க்கு தேவையானவற்றை பகுப்பாய்வு செய்கிறேன்...`,
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);

    try {
      // Detect current page context
      const pageContext = {
        path: location,
        pageName: location.includes('/admin/users') ? 'User Management' :
                  location.includes('/admin/modules') ? 'Module Library' :
                  location.includes('/admin/apps') ? 'Apps Management' :
                  location.includes('/admin/hubs') ? 'Hubs Management' :
                  location.includes('/admin/tenants') ? 'Tenants & Organizations' :
                  location.includes('/admin/global-settings') ? 'Global Settings' :
                  location.includes('/admin/themes') ? 'Themes' :
                  location.includes('/admin/analytics') ? 'Analytics' :
                  location.includes('/admin/system') ? 'System & Security' :
                  location.includes('/admin') ? 'Engine Admin Panel' : 'Unknown Page',
      };

      const response = await apiRequest("/api/admin/wytai/chat", "POST", {
        messages: [
          {
            role: "user",
            content: `Analyze requirements for creating a ${context.type} named "${context.name}" with description: "${context.description}". List all required entities, models, APIs, and database tables needed.`
          }
        ],
        model: selectedModel,
        mode: chatMode,
        pageContext,
      });

      const data = await response.json();

      if (data.success && data.message) {
        const requirements = data.message;
        
        // Store requirements in context
        if (workflowEngineRef.current.getState()) {
          workflowEngineRef.current.getState()!.context.requirements = requirements;
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `📋 **தேவைகள் பட்டியல்:**\n\n${requirements}\n\n✅ இவை எல்லாம் தயாரிக்கவா?`,
            timestamp: new Date(),
          },
        ]);

        // Move to next step
        const result = workflowEngineRef.current.processResponse('analysis-complete');
        setWorkflowState(workflowEngineRef.current.getState());
      }
    } catch (error: any) {
      toast({
        title: "AI பகுப்பாய்வு தோல்வி",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    // Check if workflow is active
    if (workflowState?.isActive) {
      const currentStep = workflowEngineRef.current.getCurrentStep();
      
      // Add user message
      const userMessage: Message = {
        role: "user",
        content: input.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      
      // Handle workflow response
      if (currentStep?.type === 'choice' && currentStep.options) {
        // For choice steps, validate that response matches one of the options
        const selectedOption = currentStep.options.find(opt => 
          opt.value.toLowerCase() === input.trim().toLowerCase() || 
          opt.label.toLowerCase().includes(input.trim().toLowerCase())
        );
        
        if (selectedOption) {
          handleWorkflowResponse(selectedOption.value);
        } else {
          toast({
            title: "தவறான தேர்வு",
            description: "தயவுசெய்து கொடுக்கப்பட்ட விருப்பங்களில் ஒன்றை தேர்ந்தெடுக்கவும்",
            variant: "destructive",
          });
        }
      } else {
        // For input steps, just pass the response
        handleWorkflowResponse(input.trim());
      }
      return;
    }

    // Build attachment metadata
    const attachmentData = attachments.map(file => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      size: file.size,
    }));

    // Build message content with attachment info
    let messageContent = input.trim();
    if (attachmentData.length > 0) {
      const attachmentInfo = attachmentData.map(a => `[Attachment: ${a.name} (${(a.size / 1024).toFixed(1)}KB)]`).join('\n');
      messageContent = messageContent ? `${messageContent}\n\n${attachmentInfo}` : attachmentInfo;
    }

    const userMessage: Message = {
      role: "user",
      content: messageContent,
      timestamp: new Date(),
      attachments: attachmentData,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    try {
      // Detect current page context
      const pageContext = {
        path: location,
        pageName: location.includes('/admin/users') ? 'User Management' :
                  location.includes('/admin/modules') ? 'Module Library' :
                  location.includes('/admin/apps') ? 'Apps Management' :
                  location.includes('/admin/hubs') ? 'Hubs Management' :
                  location.includes('/admin/tenants') ? 'Tenants & Organizations' :
                  location.includes('/admin/global-settings') ? 'Global Settings' :
                  location.includes('/admin/themes') ? 'Themes' :
                  location.includes('/admin/analytics') ? 'Analytics' :
                  location.includes('/admin/system') ? 'System & Security' :
                  location.includes('/admin') ? 'Engine Admin Panel' : 'Unknown Page',
      };

      const response = await apiRequest("/api/admin/wytai/chat", "POST", {
        messages: messages
          .concat(userMessage)
          .map((m) => ({ role: m.role, content: m.content })),
        model: selectedModel,
        mode: chatMode,
        pageContext,
      });

      const data = await response.json();

      if (data.success && data.message) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Update usage stats if available
        if (data.stats) {
          setUsageStats(data.stats);
        }
      } else {
        // Handle specific error codes
        if (data.code === "ACCESS_DENIED") {
          toast({
            title: "Access Denied",
            description: "WytAI Agent is only available for Super Admins.",
            variant: "destructive",
          });
        } else if (data.code === "RATE_LIMIT_EXCEEDED") {
          toast({
            title: "Rate Limit Exceeded",
            description: data.error || "You have exceeded your usage limit.",
            variant: "destructive",
          });
          if (data.stats) {
            setUsageStats(data.stats);
          }
        } else {
          throw new Error(data.error || "Failed to get response");
        }
      }
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group conversations by date for hamburger menu
  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <>
      {/* Floating Button - Always visible when chat is closed */}
      {!isOpen && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(true);
                }}
                className={`fixed ${isMobile ? 'bottom-4 right-4 h-12 w-12' : 'bottom-6 right-6 h-14 w-14'} rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 z-50`}
                data-testid="button-open-wytai"
              >
                <Sparkles className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
              </Button>
            </TooltipTrigger>
            {!isMobile && (
              <TooltipContent side="left">
                <p>Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">Ctrl+K</kbd> to open WytAI</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Chat Window - Visible when open */}
      {isOpen && (
        <Card
      className={`fixed ${
        isMobile 
          ? 'inset-0 rounded-none' 
          : isMinimized 
            ? 'bottom-6 right-6 w-80' 
            : 'bottom-6 right-6 w-[420px]'
      } ${
        isMobile 
          ? 'h-screen' 
          : isMinimized ? 'h-16' : 'h-[650px] max-h-[900px]'
      } shadow-2xl z-50 flex transition-all duration-300 overflow-hidden`}
      data-testid="card-wytai-agent"
    >
      {!isMinimized && (
        <>
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-white/20 text-white mr-1"
                      data-testid="button-open-history"
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[320px] sm:w-[400px] p-0">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle>Chat History</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col h-[calc(100vh-80px)]">
                      {/* New Chat Button */}
                      <div className="p-4 border-b">
                        <Button
                          onClick={() => {
                            handleNewChat();
                            setIsHistorySheetOpen(false);
                          }}
                          className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          data-testid="button-new-chat"
                        >
                          <Plus className="h-4 w-4" />
                          New Chat
                        </Button>
                      </div>

                      {/* Conversations List */}
                      <ScrollArea className="flex-1">
                        {conversationsLoading ? (
                          <div className="space-y-2 p-4">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                            ))}
                          </div>
                        ) : conversations.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <History className="h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-sm font-medium">No conversations yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Start a new chat to begin</p>
                          </div>
                        ) : (
                          <div className="p-4 space-y-6">
                            {Object.entries(groupedConversations).map(([dateGroup, convs]) => (
                              <div key={dateGroup}>
                                <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                                  {dateGroup}
                                </h4>
                                <div className="space-y-1">
                                  {convs.map((conversation) => (
                                    <div
                                      key={conversation.id}
                                      className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                                        activeConversation?.id === conversation.id
                                          ? 'bg-purple-100 dark:bg-purple-900/30'
                                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                      }`}
                                      onClick={() => {
                                        handleSwitchConversation(conversation);
                                        setIsHistorySheetOpen(false);
                                      }}
                                      data-testid={`conversation-${conversation.id}`}
                                    >
                                      {editingConversationId === conversation.id ? (
                                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                          <Input
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            onKeyPress={(e) => {
                                              if (e.key === 'Enter') {
                                                handleSaveTitle(conversation.id);
                                              } else if (e.key === 'Escape') {
                                                setEditingConversationId(null);
                                              }
                                            }}
                                            className="h-8 text-sm"
                                            autoFocus
                                            data-testid="input-rename-conversation"
                                          />
                                          <Button
                                            onClick={() => handleSaveTitle(conversation.id)}
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium truncate">{conversation.title}</p>
                                              <p className="text-xs text-muted-foreground">
                                                {conversation.model} • {new Date(conversation.updatedAt).toLocaleString('ta-IN', { month: 'short', day: 'numeric' })}
                                              </p>
                                            </div>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                                                  data-testid={`button-conversation-menu-${conversation.id}`}
                                                >
                                                  <MoreVertical className="h-4 w-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartEditing(conversation);
                                                  }}
                                                  data-testid="menuitem-rename"
                                                >
                                                  <Edit2 className="h-4 w-4 mr-2" />
                                                  Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteConversation(conversation.id);
                                                  }}
                                                  className="text-red-600"
                                                  data-testid="menuitem-delete"
                                                >
                                                  <Trash2 className="h-4 w-4 mr-2" />
                                                  Delete
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </SheetContent>
                </Sheet>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">
                    {activeConversation ? activeConversation.title : 'WytAI Agent'}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs mt-0.5 bg-white/20 text-white border-0">
                    {selectedModel.includes('gpt') ? 'OpenAI' : selectedModel.includes('claude') ? 'Claude' : 'Gemini'} • Tamil & English
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("settings")}
                  className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                  data-testid="button-settings-quick"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                    data-testid="button-minimize"
                  >
                    {isMinimized ? (
                      <Maximize2 className="h-4 w-4" />
                    ) : (
                      <Minimize2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                  data-testid="button-close-wytai"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabs - Chat and Settings */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "settings")} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
              <TabsTrigger value="chat" className="gap-2" data-testid="tab-chat">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden min-h-0">
              {/* Messages - Scrollable Area with fixed height */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0" ref={scrollRef}>
                <div className="space-y-4 pb-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                      data-testid={`message-${message.role}-${index}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-foreground border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((att, i) => (
                              <div key={i} className="space-y-1">
                                {att.type.startsWith('image/') ? (
                                  <>
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block"
                                    >
                                      <img src={att.url} alt={att.name} className="w-20 h-20 object-cover rounded mt-1 border-2 border-white/20" />
                                    </a>
                                    <p className="text-xs opacity-80">
                                      {att.name} ({(att.size / 1024).toFixed(1)}KB)
                                    </p>
                                  </>
                                ) : (
                                  <a
                                    href={att.url}
                                    download={att.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs opacity-90 hover:opacity-100 hover:underline"
                                  >
                                    <Download className="h-3 w-3" />
                                    {att.name} ({(att.size / 1024).toFixed(1)}KB)
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                          </div>
                          <span className="text-xs text-muted-foreground">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Workflow Choice Buttons */}
                {workflowState?.isActive && !isLoading && (() => {
                  const currentStep = workflowEngineRef.current.getCurrentStep();
                  if (currentStep?.type === 'choice' && currentStep.options) {
                    return (
                      <div className="px-4 pb-3 flex flex-wrap gap-2">
                        {currentStep.options.map((option) => (
                          <Button
                            key={option.value}
                            onClick={() => {
                              setInput(option.label);
                              // Auto-send after a brief delay to show the input
                              setTimeout(() => sendMessage(), 100);
                            }}
                            variant="outline"
                            className="text-sm h-auto py-2 px-3"
                            data-testid={`button-choice-${option.value}`}
                          >
                            {option.icon && <span className="mr-2">{option.icon}</span>}
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Attachments Preview - Sticky above input */}
              {attachments.length > 0 && (
                <div className="px-3 sm:px-4 pb-2 flex gap-2 flex-wrap border-t bg-gray-50 dark:bg-gray-900/50 pt-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 text-xs">
                      <Paperclip className="h-3 w-3" />
                      <span className="max-w-[100px] truncate">{file.name}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input - Sticky at bottom */}
              <div className="p-3 sm:p-4 border-t bg-gray-50 dark:bg-gray-900/50 pb-safe">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isLoading ? "AI is typing... You can prepare your next message" : "Type in Tamil or English... (Shift+Enter for new line)"}
                      className="resize-none min-h-[60px] text-sm sm:text-base"
                      rows={2}
                      data-testid="textarea-message"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                      variant="outline"
                      className="h-[28px]"
                      data-testid="button-attach"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={toggleVoice}
                      size="sm"
                      variant={isListening ? "destructive" : "outline"}
                      className="h-[28px]"
                      data-testid="button-voice"
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={sendMessage}
                      size="sm"
                      disabled={!input.trim() && attachments.length === 0}
                      className={`h-[28px] ${isLoading ? 'opacity-50' : ''} bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700`}
                      data-testid="button-send"
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    🎤 Voice • 📎 Attachments • ⌨️ Ctrl+K
                  </p>
                  <Button
                    onClick={clearChat}
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    data-testid="button-clear-chat"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </TabsContent>

            <TabsContent value="settings" className="flex-1 m-0 overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-safe">
                  {/* Page Context Display */}
                  <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      📍 Current Page Context
                    </h4>
                    <p className="text-sm text-foreground">
                      {location.includes('/admin/users') ? '👥 User Management' :
                       location.includes('/admin/modules') ? '🧩 Module Library' :
                       location.includes('/admin/apps') ? '📱 Apps Management' :
                       location.includes('/admin/hubs') ? '🌐 Hubs Management' :
                       location.includes('/admin/tenants') ? '🏢 Tenants & Organizations' :
                       location.includes('/admin/global-settings') ? '⚙️ Global Settings' :
                       location.includes('/admin/themes') ? '🎨 Themes' :
                       location.includes('/admin/analytics') ? '📊 Analytics' :
                       location.includes('/admin/system') ? '🔒 System & Security' :
                       location.includes('/admin') ? '⚡ Engine Admin Panel' : '❓ Unknown Page'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      AI knows you're on this page and can help with page-specific tasks
                    </p>
                  </div>

                  {/* Chat Mode Selector */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      💬 Chat Mode
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setChatMode("free")}
                        variant={chatMode === "free" ? "default" : "outline"}
                        className={chatMode === "free" ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" : ""}
                        data-testid="button-mode-free"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Free Chat
                      </Button>
                      <Button
                        onClick={() => setChatMode("guided")}
                        variant={chatMode === "guided" ? "default" : "outline"}
                        className={chatMode === "guided" ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" : ""}
                        data-testid="button-mode-guided"
                      >
                        🎯 Guided Mode
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1 mt-2">
                      {chatMode === "free" ? (
                        <>
                          <p className="font-semibold">Free Chat Mode:</p>
                          <p>• Ask anything, chat naturally</p>
                          <p>• No structured questions</p>
                          <p>• Flexible conversation flow</p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold">Guided Mode:</p>
                          <p>• AI asks structured questions</p>
                          <p>• You provide answers step-by-step</p>
                          <p>• Systematic problem-solving</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Model Selector */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Model தேர்வு
                    </h4>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="w-full" data-testid="select-model">
                        <SelectValue placeholder="Select AI Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o" data-testid="option-gpt-4o">
                          GPT-4o (OpenAI) - Fast & Powerful
                        </SelectItem>
                        <SelectItem value="gpt-4o-mini" data-testid="option-gpt-4o-mini">
                          GPT-4o Mini (OpenAI) - Faster & Cheaper
                        </SelectItem>
                        <SelectItem value="claude-3-5-sonnet-20241022" data-testid="option-claude">
                          Claude 3.5 Sonnet (Anthropic) - Best Reasoning
                        </SelectItem>
                        <SelectItem value="gemini-2.0-flash-exp" data-testid="option-gemini">
                          Gemini 2.0 Flash (Google) - Latest & Fast
                        </SelectItem>
                        <SelectItem value="gemini-1.5-pro" data-testid="option-gemini-pro">
                          Gemini 1.5 Pro (Google) - Large Context
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      Choose the AI model that best fits your needs
                    </p>
                  </div>

                  {/* Workflow Selector */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        🚀 Guided Workflows
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Step-by-step வாக Module, App, Hub உருவாக்கவும்
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.values(workflows).map((workflow) => (
                        <Button
                          key={workflow.id}
                          onClick={() => startWorkflow(workflow.id)}
                          disabled={workflowState?.isActive}
                          className="w-full justify-start text-left h-auto py-3"
                          variant={selectedWorkflow === workflow.id ? "default" : "outline"}
                          data-testid={`button-workflow-${workflow.id}`}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <span className="text-2xl">{workflow.icon}</span>
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{workflow.name}</div>
                              <div className="text-xs opacity-80 mt-0.5">{workflow.description}</div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>

                    {workflowState?.isActive && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold">Workflow Progress</span>
                          <span className="text-xs">{workflowEngineRef.current.getProgress().percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${workflowEngineRef.current.getProgress().percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Usage Stats */}
                  {usageStats && (
                    <div className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        📊 Usage Stats
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-3">
                          <div className="text-xs text-muted-foreground mb-1">Daily Usage</div>
                          <div className="text-lg font-bold">
                            {usageStats.daily.used} / {usageStats.daily.limit}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {usageStats.daily.remaining} remaining
                          </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-950/20 rounded p-3">
                          <div className="text-xs text-muted-foreground mb-1">Monthly Usage</div>
                          <div className="text-lg font-bold">
                            {usageStats.monthly.used} / {usageStats.monthly.limit}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {usageStats.monthly.remaining} remaining
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* System Instructions */}
                  <div className="border rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      📋 System Instructions
                    </h4>
                    <div className="text-xs text-muted-foreground space-y-2">
                      <p><strong>Current Mode:</strong> {chatMode === "free" ? "Free Chat (Open Conversation)" : "Guided Mode (Structured Questions)"}</p>
                      <p><strong>Role:</strong> WytAI Agent - Intelligent assistant for WytNet Engine Admin Panel</p>
                      <p><strong>Capabilities:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Suggest improvements to modules, apps, and hubs</li>
                        <li>Generate code snippets for React & Express</li>
                        <li>Help with UI/UX enhancements</li>
                        <li>Provide WytNet architecture guidance</li>
                      </ul>
                      <p><strong>Tech Stack Knowledge:</strong> React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Express.js, PostgreSQL, Drizzle ORM</p>
                      <p><strong>Language Support:</strong> Tamil & English (bilingual)</p>
                      {chatMode === "guided" && (
                        <p className="text-purple-600 dark:text-purple-400"><strong>Guided Mode Active:</strong> AI will ask structured questions to understand your needs systematically</p>
                      )}
                    </div>
                  </div>

                  {/* About */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      WytAI Agent பற்றி
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      WytAI Agent என்பது பல AI மாடல்களுடன் இயங்கும் ஒரு அறிவார்ந்த உதவியாளர். இது OpenAI, Claude, மற்றும் Gemini சக்தியுடன் தமிழ் மற்றும் ஆங்கிலத்தில் உங்களுடன் உரையாட முடியும்.
                    </p>
                  </div>

                  {/* Capabilities */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">✅ என்னால் செய்ய முடியும்</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>Modules, Apps, Hubs ஐ மேம்படுத்த ஆலோசனைகள் வழங்குதல்</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>UI/UX வடிவமைப்பு மற்றும் frontend மேம்பாடுகள் பரிந்துரைத்தல்</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>Feature சிறந்த செய்முறைகள் மற்றும் patterns குறித்து விளக்குதல்</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>Content மற்றும் copy எழுதுவதற்கு உதவுதல்</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>தமிழ் மற்றும் ஆங்கில குரல் உள்ளீடு/வெளியீடு ஆதரவு</span>
                      </li>
                    </ul>
                  </div>

                  {/* Limitations */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">⛔ என்னால் செய்ய முடியாது</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Backend code அல்லது database மாற்றங்கள் செய்தல்</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>நேரடியாக files உருவாக்குதல் அல்லது திருத்துதல்</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Production deployment அல்லது server மேலாண்மை</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Real-time data அணுகுதல் அல்லது external APIs அழைத்தல்</span>
                      </li>
                    </ul>
                  </div>

                  {/* When to Use */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">🎯 எப்போது பயன்படுத்தலாம்</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span><strong>Frontend மேம்பாடுகளுக்கு:</strong> UI components, styles, layouts பரிந்துரைகள்</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span><strong>Content உருவாக்கலுக்கு:</strong> Descriptions, labels, help text எழுதுதல்</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span><strong>விரைவான யோசனைகளுக்கு:</strong> Feature brainstorming மற்றும் planning</span>
                      </li>
                    </ul>
                  </div>

                  {/* Need More Help */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">🤖 Backend/Infrastructure மாற்றங்களுக்கு</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Backend code, database schema, API routes, அல்லது infrastructure மாற்றங்களுக்கு, Replit Agent-ஐ பயன்படுத்தவும்.
                    </p>
                    <div className="bg-white dark:bg-gray-900 rounded p-3 text-xs font-mono">
                      "@agent உதவி வேண்டும்: [உங்கள் கோரிக்கை]"
                    </div>
                  </div>

                  {/* Keyboard Shortcuts */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">⌨️ Keyboard Shortcuts</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Toggle WytAI</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Ctrl+K</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Close WytAI</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Esc</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Send Message</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Enter</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">New Line</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Shift+Enter</kbd>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">💡 Tips</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• குரல் உள்ளீட்டிற்கு Mic பொத்தானை கிளிக் செய்யவும்</li>
                      <li>• Files இணைக்க Paperclip icon பயன்படுத்தவும் (Max 5MB)</li>
                      <li>• Chat history அழிக்க Clear பொத்தானை பயன்படுத்தவும்</li>
                      <li>• தமிழ் மற்றும் ஆங்கிலம் கலந்து பேசலாம்</li>
                      <li>• Images local preview மட்டும் (GPT-க்கு filename மட்டும் அனுப்பப்படும்)</li>
                    </ul>
                  </div>

                  {/* Important Note */}
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold text-sm mb-2 text-yellow-800 dark:text-yellow-200">⚠️ Attachments குறிப்பு</h4>
                    <p className="text-xs text-muted-foreground">
                      தற்போது attachments உங்கள் browser-ல் மட்டுமே preview-க்காக உள்ளது. File names மற்றும் sizes மட்டும் GPT-க்கு context-ஆக அனுப்பப்படும். Full file upload support-க்கு backend integration தேவை.
                    </p>
                  </div>
                </div>
            </TabsContent>
          </Tabs>
          </div>
        </>
      )}
    </Card>
      )}
    </>
  );
}
