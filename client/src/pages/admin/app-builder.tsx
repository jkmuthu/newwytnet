import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bot, Send, Sparkles, Code, Database, Layout, Plus, Folder } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  createdAt: string;
}

/**
 * AdminAppBuilder - AI-powered app creation interface
 * Features: Chat with AI to generate apps, manage projects, view code
 */
export default function AdminAppBuilder() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'வணக்கம்! 👋 I\'m your WytNet App Builder AI Assistant. I can help you create new apps within the WytNet ecosystem. Tell me what you\'d like to build!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Fetch user's app projects
  const { data: projects, isLoading: projectsLoading } = useQuery<{ projects: Project[] }>({
    queryKey: ['/api/ai-builder/projects'],
    enabled: true,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/ai-builder/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          projectId: currentProjectId,
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);
      
      // If a project was created, update the projects list
      if (data.projectCreated) {
        queryClient.invalidateQueries({ queryKey: ['/api/ai-builder/projects'] });
        setCurrentProjectId(data.projectId);
        toast({
          title: "Project Created!",
          description: `New app project "${data.projectName}" has been created.`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    sendMessageMutation.mutate(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-purple-600" />
            App Builder
            <Badge variant="secondary" className="ml-2">AI Powered</Badge>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Build apps with AI - Chat to create database schemas, APIs, and UI components
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100%-6rem)]">
        {/* Projects Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Folder className="h-4 w-4" />
              My Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="p-4 space-y-2">
                {projectsLoading ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : projects?.projects && projects.projects.length > 0 ? (
                  projects.projects.map((project) => (
                    <Button
                      key={project.id}
                      variant={currentProjectId === project.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => setCurrentProjectId(project.id)}
                      data-testid={`project-${project.slug}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{project.name}</div>
                        <div className="text-xs text-gray-500 truncate">{project.description}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {project.status}
                        </Badge>
                      </div>
                    </Button>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No projects yet. Start chatting to create your first app!
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI Assistant
            </CardTitle>
            <CardDescription>
              Ask me to create CRUD apps, APIs, UI components - all within WytNet framework
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role !== 'user' && (
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.role === 'system'
                          ? 'bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-800'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-blue-600">You</span>
                      </div>
                    )}
                  </div>
                ))}
                {sendMessageMutation.isPending && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-purple-600 animate-pulse" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <Separator />

            {/* Input Area */}
            <div className="p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Describe the app you want to build... (e.g., 'Create a simple inventory management system with products and categories')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[60px] resize-none"
                  disabled={sendMessageMutation.isPending}
                  data-testid="chat-input"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || sendMessageMutation.isPending}
                  className="gap-2"
                  data-testid="send-message"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  PostgreSQL + Drizzle
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Code className="h-3 w-3 mr-1" />
                  TypeScript + React
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Layout className="h-3 w-3 mr-1" />
                  shadcn/ui
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
