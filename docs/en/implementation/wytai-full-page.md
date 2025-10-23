---
requiredLevel: developer
---

# Implementation Guide: WytAI Agent Full Page

**Phase**: 2 of 3  
**Timeline**: 2-3 weeks  
**Status**: Implementation Ready  
**Prerequisites**: Phase 1 (Engine Panel Consolidation) complete

---

## Overview

This guide provides step-by-step instructions for transforming the WytAI Agent from a floating chat widget into a comprehensive full-page interface with advanced features including voice input, file uploads, code execution, and deep context integration.

---

## Architecture Summary

```
/engine/wytai
├── Conversations Sidebar (300px)
│   ├── New Chat Button
│   ├── Search Bar
│   └── Conversation Groups (Today, Yesterday, Last 7 Days, etc.)
├── Main Chat Area
│   ├── Message Thread
│   ├── Code Blocks with Syntax Highlighting
│   ├── File Attachments
│   └── Multi-Modal Input Area
└── Inspector Panel (optional, 300px)
    ├── Conversation Info
    ├── Token Usage
    └── Model Stats
```

---

## Step 1: Create Page Structure

### 1.1 Create Main Page Component

**Create**: `client/src/pages/engine-admin/wytai.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConversationsSidebar } from '@/components/wytai/ConversationsSidebar';
import { ChatInterface } from '@/components/wytai/ChatInterface';
import { WytAIHeader } from '@/components/wytai/WytAIHeader';
import { InspectorPanel } from '@/components/wytai/InspectorPanel';

export default function WytAIPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showInspector, setShowInspector] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="h-screen flex flex-col bg-background">
      <WytAIHeader 
        onToggleInspector={() => setShowInspector(!showInspector)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {!sidebarCollapsed && (
          <ConversationsSidebar
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
          />
        )}
        
        <ChatInterface
          conversationId={activeConversationId}
          onCreateConversation={setActiveConversationId}
        />
        
        {showInspector && (
          <InspectorPanel conversationId={activeConversationId} />
        )}
      </div>
    </div>
  );
}
```

### 1.2 Add Route

**Update**: `client/src/App.tsx`

```typescript
import WytAIPage from './pages/engine-admin/wytai';

// In routes
<Route path="/engine/wytai" component={WytAIPage} />
```

---

## Step 2: Conversations Sidebar

### 2.1 Create Conversations Sidebar Component

**Create**: `client/src/components/wytai/ConversationsSidebar.tsx`

```typescript
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, MessageSquare, Trash2 } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

interface Conversation {
  id: string;
  title: string;
  lastMessageAt: Date;
  messagesCount: number;
}

interface ConversationsSidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function ConversationsSidebar({
  activeConversationId,
  onSelectConversation,
}: ConversationsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: conversations, isLoading } = useQuery<{ data: Conversation[] }>({
    queryKey: ['/api/admin/wytai/conversations'],
  });
  
  const createConversation = useMutation({
    mutationFn: () => apiRequest('/api/admin/wytai/conversations', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Conversation' }),
    }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wytai/conversations'] });
      onSelectConversation(data.data.id);
    },
  });
  
  const deleteConversation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/wytai/conversations/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wytai/conversations'] });
    },
  });
  
  // Group conversations by date
  const groupedConversations = (conversations?.data || []).reduce((acc, conv) => {
    const date = new Date(conv.lastMessageAt);
    let group = 'Older';
    
    if (isToday(date)) group = 'Today';
    else if (isYesterday(date)) group = 'Yesterday';
    else if (isThisWeek(date)) group = 'This Week';
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(conv);
    
    return acc;
  }, {} as Record<string, Conversation[]>);
  
  const filteredConversations = searchQuery
    ? conversations?.data.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;
  
  return (
    <div className="w-80 border-r border-border flex flex-col bg-background">
      <div className="p-4 space-y-4">
        <Button
          onClick={() => createConversation.mutate()}
          className="w-full"
          data-testid="button-new-conversation"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-conversations"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="px-2">
          {filteredConversations ? (
            filteredConversations.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                onClick={() => onSelectConversation(conv.id)}
                onDelete={() => deleteConversation.mutate(conv.id)}
              />
            ))
          ) : (
            Object.entries(groupedConversations).map(([group, convs]) => (
              <div key={group} className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  {group}
                </div>
                {convs.map(conv => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onClick={() => onSelectConversation(conv.id)}
                    onDelete={() => deleteConversation.mutate(conv.id)}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`
        group relative p-3 rounded-lg cursor-pointer mb-1
        ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}
      `}
      onClick={onClick}
      data-testid={`conversation-${conversation.id}`}
    >
      <div className="flex items-start gap-3">
        <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{conversation.title}</div>
          <div className="text-xs text-muted-foreground">
            {conversation.messagesCount} messages
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          data-testid={`button-delete-${conversation.id}`}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
```

---

## Step 3: Chat Interface

### 3.1 Create Chat Interface Component

**Create**: `client/src/components/wytai/ChatInterface.tsx`

```typescript
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { WelcomeScreen } from './WelcomeScreen';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  metadata?: any;
}

interface ChatInterfaceProps {
  conversationId: string | null;
  onCreateConversation: (id: string) => void;
}

export function ChatInterface({
  conversationId,
  onCreateConversation,
}: ChatInterfaceProps) {
  const [streamingMessage, setStreamingMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: messages } = useQuery<{ data: Message[] }>({
    queryKey: ['/api/admin/wytai/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
  });
  
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) {
        // Create new conversation first
        const conv = await apiRequest('/api/admin/wytai/conversations', {
          method: 'POST',
          body: JSON.stringify({ title: content.slice(0, 50) }),
        });
        onCreateConversation(conv.data.id);
        return sendToConversation(conv.data.id, content);
      }
      
      return sendToConversation(conversationId, content);
    },
  });
  
  async function sendToConversation(convId: string, content: string) {
    // Add user message to conversation
    await apiRequest(`/api/admin/wytai/conversations/${convId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        role: 'user',
        content,
      }),
    });
    
    // Stream AI response
    const response = await fetch('/api/admin/wytai/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          ...(messages?.data || []).map(m => ({
            role: m.role,
            content: m.content,
          })),
          { role: 'user', content },
        ],
        conversationId: convId,
      }),
    });
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullResponse += data.content;
              setStreamingMessage(fullResponse);
            }
          }
        }
      }
    }
    
    setStreamingMessage('');
    queryClient.invalidateQueries({
      queryKey: ['/api/admin/wytai/conversations', convId, 'messages']
    });
  }
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);
  
  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col">
        <WelcomeScreen onSendMessage={(msg) => sendMessage.mutate(msg)} />
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col bg-background">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <MessageList
          messages={messages?.data || []}
          streamingMessage={streamingMessage}
        />
      </ScrollArea>
      
      <InputArea
        onSendMessage={(msg) => sendMessage.mutate(msg)}
        isLoading={sendMessage.isPending || !!streamingMessage}
      />
    </div>
  );
}
```

### 3.2 Create Message List Component

**Create**: `client/src/components/wytai/MessageList.tsx`

```typescript
import { MessageCircle, Bot } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  metadata?: any;
}

interface MessageListProps {
  messages: Message[];
  streamingMessage?: string;
}

export function MessageList({ messages, streamingMessage }: MessageListProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {streamingMessage && (
        <MessageBubble
          message={{
            id: 'streaming',
            role: 'assistant',
            content: streamingMessage,
            createdAt: new Date(),
          }}
          isStreaming
        />
      )}
    </div>
  );
}

function MessageBubble({
  message,
  isStreaming = false,
}: {
  message: Message;
  isStreaming?: boolean;
}) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
        <div
          className={`
            inline-block p-4 rounded-lg
            ${isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
            }
          `}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
          
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
          )}
        </div>
        
        <div className="text-xs text-muted-foreground mt-1">
          {format(new Date(message.createdAt), 'HH:mm')}
        </div>
      </div>
      
      {isUser && (
        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          <MessageCircle className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
```

---

## Step 4: Multi-Modal Input

### 4.1 Create Input Area Component

**Create**: `client/src/components/wytai/InputArea.tsx`

```typescript
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Mic, StopCircle } from 'lucide-react';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { FileUploader } from './FileUploader';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function InputArea({ onSendMessage, isLoading }: InputAreaProps) {
  const [input, setInput] = useState('');
  const [showFileUploader, setShowFileUploader] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
  } = useVoiceInput({
    onTranscript: (text) => setInput(text),
  });
  
  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="border-t border-border p-4 bg-background">
      <div className="max-w-4xl mx-auto space-y-2">
        {showFileUploader && (
          <FileUploader
            onUploadComplete={(files) => {
              console.log('Files uploaded:', files);
              setShowFileUploader(false);
            }}
          />
        )}
        
        <div className="flex gap-2 items-end">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowFileUploader(!showFileUploader)}
            data-testid="button-attach-file"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask WytAI anything..."
            className="flex-1 min-h-[60px] max-h-[200px] resize-none"
            disabled={isLoading}
            data-testid="textarea-message-input"
          />
          
          <Button
            size="icon"
            variant="ghost"
            onClick={isListening ? stopListening : startListening}
            className={isListening ? 'text-red-500' : ''}
            data-testid="button-voice-input"
          >
            {isListening ? (
              <StopCircle className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            data-testid="button-send-message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        
        {isListening && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Listening... (speak now)
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4.2 Create Voice Input Hook

**Create**: `client/src/hooks/use-voice-input.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseVoiceInputOptions {
  onTranscript: (text: string) => void;
  language?: string;
}

export function useVoiceInput({ onTranscript, language = 'en-US' }: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      setTranscript(transcript);
      onTranscript(transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    setRecognition(recognition);
  }, [language, onTranscript]);
  
  const startListening = useCallback(() => {
    if (recognition) {
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  }, [recognition]);
  
  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);
  
  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: !!recognition,
  };
}
```

---

## Step 5: Code Rendering

### 5.1 Install Monaco Editor

```bash
npm install @monaco-editor/react
npm install --save-dev monaco-editor
```

### 5.2 Create Code Block Component

**Create**: `client/src/components/wytai/CodeBlock.tsx`

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Play } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface CodeBlockProps {
  code: string;
  language: string;
  onExecute?: (code: string) => void;
}

export function CodeBlock({ code, language, onExecute }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative group my-4 rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between bg-muted px-4 py-2 border-b border-border">
        <div className="text-sm font-mono text-muted-foreground">
          {language}
        </div>
        <div className="flex gap-2">
          {onExecute && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onExecute(code)}
              data-testid="button-run-code"
            >
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={copyToClipboard}
            data-testid="button-copy-code"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <Editor
        height="auto"
        language={language}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          fontSize: 14,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
```

---

## Step 6: Context Integration

### 6.1 Create Context Provider

**Create**: `client/src/providers/ContextProvider.tsx`

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface PageContext {
  path: string;
  pageName: string;
  entity?: string;
  action?: string;
}

interface WytAIContext {
  pageContext: PageContext;
  updateContext: () => void;
}

const WytAIContextContext = createContext<WytAIContext | null>(null);

export function WytAIContextProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [pageContext, setPageContext] = useState<PageContext>({
    path: location,
    pageName: 'Unknown',
  });
  
  const updateContext = () => {
    const pageName = getPageName(location);
    const entity = extractEntity(location);
    const action = extractAction(location);
    
    setPageContext({
      path: location,
      pageName,
      entity,
      action,
    });
  };
  
  useEffect(() => {
    updateContext();
  }, [location]);
  
  return (
    <WytAIContextContext.Provider value={{ pageContext, updateContext }}>
      {children}
    </WytAIContextContext.Provider>
  );
}

export function useWytAIContext() {
  const context = useContext(WytAIContextContext);
  if (!context) {
    throw new Error('useWytAIContext must be used within WytAIContextProvider');
  }
  return context;
}

function getPageName(path: string): string {
  const pageNames: Record<string, string> = {
    '/engine/modules': 'Module Builder',
    '/engine/apps': 'App Builder',
    '/engine/hubs': 'Hub Builder',
    // ... add more mappings
  };
  
  return pageNames[path] || 'Engine Admin';
}

function extractEntity(path: string): string | undefined {
  const match = path.match(/\/engine\/(\w+)/);
  return match?.[1];
}

function extractAction(path: string): string | undefined {
  if (path.includes('/create')) return 'create';
  if (path.includes('/edit')) return 'edit';
  if (path.match(/\/\d+$/)) return 'view';
  return 'list';
}
```

---

## Step 7: Testing

### 7.1 Component Tests

```typescript
describe('WytAI Full Page', () => {
  it('should render main layout', () => {
    render(<WytAIPage />);
    
    expect(screen.getByTestId('button-new-conversation')).toBeInTheDocument();
    expect(screen.getByTestId('textarea-message-input')).toBeInTheDocument();
  });
  
  it('should create new conversation', async () => {
    render(<WytAIPage />);
    
    fireEvent.click(screen.getByTestId('button-new-conversation'));
    
    await waitFor(() => {
      expect(screen.getByText('New Conversation')).toBeInTheDocument();
    });
  });
  
  it('should send message', async () => {
    render(<WytAIPage />);
    
    const input = screen.getByTestId('textarea-message-input');
    fireEvent.change(input, { target: { value: 'Hello WytAI' } });
    
    fireEvent.click(screen.getByTestId('button-send-message'));
    
    await waitFor(() => {
      expect(screen.getByText('Hello WytAI')).toBeInTheDocument();
    });
  });
});
```

---

## Deployment Checklist

- [ ] Full page layout implemented
- [ ] Conversations sidebar functional
- [ ] Chat interface with streaming
- [ ] Voice input working
- [ ] File upload implemented
- [ ] Code blocks with syntax highlighting
- [ ] Context integration complete
- [ ] All tests passing
- [ ] Mobile responsive
- [ ] Performance optimized

---

## Next Steps

After completing Phase 2:
- [WytBuilder Implementation](/en/implementation/wytbuilder-implementation)

---

## References

- [PRD: Self-Service Platform](/en/prd/self-service-platform)
- [WytAI Agent Architecture](/en/architecture/wytai-agent)
- [Context Management](/en/architecture/context-management)
