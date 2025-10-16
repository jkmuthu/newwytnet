import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  FileText, 
  Link2,
  Loader2
} from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: any;
}

interface AIAssistantChatProps {
  resourceType: 'module' | 'app';
  resourceId: string;
  resourceName: string;
  onApplySuggestions?: (suggestions: any) => void;
}

export function AIAssistantChat({ 
  resourceType, 
  resourceId, 
  resourceName,
  onApplySuggestions 
}: AIAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your AI assistant for improving "${resourceName}". I can help you with:\n\n• Suggesting better titles and descriptions\n• Recommending appropriate categories\n• Reviewing dependencies\n• Drafting changelogs\n• Planning next version improvements\n\nHow can I help you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/${resourceType}s/${resourceId}/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(-5)
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        suggestions: data.suggestions
      }]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { 
      label: 'Suggest Title', 
      icon: Sparkles,
      prompt: 'Can you suggest a better, more descriptive title for this module?' 
    },
    { 
      label: 'Review Dependencies', 
      icon: Link2,
      prompt: 'Review the dependencies and suggest improvements or additions' 
    },
    { 
      label: 'Draft Changelog', 
      icon: FileText,
      prompt: 'Help me draft a changelog for the next version based on recent improvements' 
    }
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">AI Assistant</h3>
          <p className="text-xs text-muted-foreground">
            Powered by GPT-4
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            onClick={() => sendMessage(action.prompt)}
            disabled={isLoading}
            className="text-xs"
            data-testid={`button-quick-${action.label.toLowerCase().replace(' ', '-')}`}
          >
            <action.icon className="h-3 w-3 mr-1" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto pr-2"
        style={{ maxHeight: '400px' }}
      >
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="p-1.5 bg-primary/10 rounded-full h-fit">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            
            <div className={`flex flex-col gap-2 max-w-[80%]`}>
              <Card className={`p-3 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </Card>
              
              {message.suggestions && onApplySuggestions && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onApplySuggestions(message.suggestions)}
                  className="self-start"
                  data-testid="button-apply-suggestions"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Apply Suggestions
                </Button>
              )}
            </div>

            {message.role === 'user' && (
              <div className="p-1.5 bg-primary rounded-full h-fit">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="p-1.5 bg-primary/10 rounded-full h-fit">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <Card className="p-3 bg-muted">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage(input)}
          placeholder="Ask for suggestions..."
          disabled={isLoading}
          className="flex-1"
          data-testid="input-ai-message"
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          size="icon"
          data-testid="button-send-message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
