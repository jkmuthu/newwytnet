import { useState, useRef, useEffect } from "react";
import { X, Send, Mic, MicOff, Sparkles, Minimize2, Maximize2, Settings, Paperclip, Trash2, MessageSquare, Info, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: { name: string; type: string; url: string; size: number }[];
}

export default function WytAIAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "settings">("chat");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
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
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    toast({
      title: "Chat cleared",
      description: "Conversation history has been reset",
    });
  };

  const sendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

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
      const response = await apiRequest("/api/admin/wytai/chat", "POST", {
        messages: messages
          .concat(userMessage)
          .map((m) => ({ role: m.role, content: m.content })),
        model: selectedModel,
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

        // Speak the response in Tamil if available
        speakText(data.message);
      } else {
        // Handle specific error codes
        if (data.code === "ACCESS_DENIED") {
          toast({
            title: "Access Denied",
            description: "WytAI is only available for Super Admins and Admins.",
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

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ta-IN'; // Tamil language
      utterance.rate = 0.9;
      
      // Try to find Tamil voice
      const voices = speechSynthesis.getVoices();
      const tamilVoice = voices.find(voice => voice.lang.startsWith('ta'));
      if (tamilVoice) {
        utterance.voice = tamilVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 z-50"
              data-testid="button-open-wytai"
            >
              <Sparkles className="h-6 w-6 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">Ctrl+K</kbd> to open WytAI</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card
      className={`fixed ${
        isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-[420px]'
      } ${
        isMinimized ? 'h-16' : 'h-[650px]'
      } shadow-2xl z-50 flex flex-col transition-all duration-300`}
      data-testid="card-wytai-agent"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">WytAI Agent</h3>
            <Badge variant="secondary" className="text-xs mt-0.5 bg-white/20 text-white border-0">
              {selectedModel.includes('gpt') ? 'OpenAI' : selectedModel.includes('claude') ? 'Claude' : 'Gemini'} • Tamil & English
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
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

      {!isMinimized && (
        <>
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

            <TabsContent value="chat" className="flex-1 flex flex-col m-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                      data-testid={`message-${message.role}-${index}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="px-4 pb-2 flex gap-2 flex-wrap">
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

              {/* Input */}
              <div className="p-4 border-t bg-gray-50 dark:bg-gray-900/50">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type in Tamil or English... (Shift+Enter for new line)"
                      className="resize-none min-h-[60px]"
                      rows={2}
                      disabled={isLoading}
                      data-testid="textarea-message"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                      variant="outline"
                      className="h-[28px]"
                      disabled={isLoading}
                      data-testid="button-attach"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={toggleVoice}
                      size="sm"
                      variant={isListening ? "destructive" : "outline"}
                      className="h-[28px]"
                      disabled={isLoading}
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
                      disabled={(!input.trim() && attachments.length === 0) || isLoading}
                      className="h-[28px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      data-testid="button-send"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
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

            <TabsContent value="settings" className="flex-1 m-0 overflow-auto">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
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
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </>
      )}
    </Card>
  );
}
