import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  HeadphonesIcon, 
  Plus, 
  BookOpen,
  TicketIcon,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";

interface SupportTicket {
  id: string;
  display_id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string | null;
  priority: string;
  status: string;
  user_name: string | null;
  user_email: string | null;
  assigned_to_name: string | null;
  created_at: string;
}

interface KBArticle {
  id: string;
  display_id: string;
  title: string;
  slug: string;
  content: string;
  category: string | null;
  is_published: boolean;
  views_count: number;
  helpful_count: number;
  author_name: string | null;
  created_at: string;
}

interface SupportStats {
  open_count: string;
  in_progress_count: string;
  waiting_count: string;
  resolved_count: string;
  closed_count: string;
  urgent_count: string;
  total_count: string;
}

export default function AdminHelpSupport() {
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState(false);
  const [ticketFormData, setTicketFormData] = useState({
    subject: "",
    description: "",
    category: "general",
    priority: "medium",
  });
  const [articleFormData, setArticleFormData] = useState({
    title: "",
    slug: "",
    content: "",
    category: "general",
    isPublished: false,
  });
  const { toast } = useToast();

  const { data: ticketsData } = useQuery<{
    success: boolean;
    tickets: SupportTicket[];
  }>({
    queryKey: ['/api/admin/support/tickets'],
  });

  const { data: statsData } = useQuery<{
    success: boolean;
    stats: SupportStats;
  }>({
    queryKey: ['/api/admin/support/stats'],
  });

  const { data: articlesData } = useQuery<{
    success: boolean;
    articles: KBArticle[];
  }>({
    queryKey: ['/api/admin/knowledge-base'],
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: typeof ticketFormData) => {
      return await apiRequest('/api/admin/support/tickets', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support/stats'] });
      setIsCreateTicketOpen(false);
      setTicketFormData({ subject: "", description: "", category: "general", priority: "medium" });
      toast({
        title: "Success",
        description: "Support ticket created successfully",
      });
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: async (data: typeof articleFormData & { authorId: string }) => {
      return await apiRequest('/api/admin/knowledge-base', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base'] });
      setIsCreateArticleOpen(false);
      setArticleFormData({ title: "", slug: "", content: "", category: "general", isPublished: false });
      toast({
        title: "Success",
        description: "Knowledge base article created successfully",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const stats = statsData?.stats;
  const tickets = ticketsData?.tickets || [];
  const articles = articlesData?.articles || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">Manage support tickets and knowledge base</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.in_progress_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.urgent_count}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets" data-testid="tab-tickets">
            <TicketIcon className="h-4 w-4 mr-2" />
            Support Tickets
          </TabsTrigger>
          <TabsTrigger value="kb" data-testid="tab-knowledge-base">
            <BookOpen className="h-4 w-4 mr-2" />
            Knowledge Base
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Tickets</h2>
            <Button onClick={() => setIsCreateTicketOpen(true)} data-testid="button-create-ticket">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>

          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} data-testid={`card-ticket-${ticket.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(ticket.status)}
                        <CardTitle className="text-base">{ticket.subject}</CardTitle>
                      </div>
                      <CardDescription>
                        {ticket.ticket_number} • {ticket.user_email || 'No user'} • {new Date(ticket.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(ticket.priority) as any}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">{ticket.status.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                  {ticket.assigned_to_name && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Assigned to: {ticket.assigned_to_name}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            {tickets.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No support tickets found
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="kb" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Knowledge Base Articles</h2>
            <Button onClick={() => setIsCreateArticleOpen(true)} data-testid="button-create-article">
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </div>

          <div className="grid gap-4">
            {articles.map((article) => (
              <Card key={article.id} data-testid={`card-article-${article.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{article.title}</CardTitle>
                      <CardDescription>
                        {article.display_id} • by {article.author_name || 'Unknown'} • {new Date(article.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {article.is_published ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                      {article.category && (
                        <Badge variant="secondary">{article.category}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{article.content}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{article.views_count} views</span>
                    <span>{article.helpful_count} helpful</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {articles.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No knowledge base articles found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>Create a new support ticket for tracking issues</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={ticketFormData.subject}
                onChange={(e) => setTicketFormData({ ...ticketFormData, subject: e.target.value })}
                placeholder="Brief description of the issue"
                data-testid="input-ticket-subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={ticketFormData.description}
                onChange={(e) => setTicketFormData({ ...ticketFormData, description: e.target.value })}
                placeholder="Detailed description..."
                rows={4}
                data-testid="input-ticket-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={ticketFormData.category} onValueChange={(value) => setTicketFormData({ ...ticketFormData, category: value })}>
                  <SelectTrigger data-testid="select-ticket-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={ticketFormData.priority} onValueChange={(value) => setTicketFormData({ ...ticketFormData, priority: value })}>
                  <SelectTrigger data-testid="select-ticket-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTicketOpen(false)} data-testid="button-cancel-ticket">
              Cancel
            </Button>
            <Button onClick={() => createTicketMutation.mutate(ticketFormData)} data-testid="button-save-ticket">
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateArticleOpen} onOpenChange={setIsCreateArticleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create KB Article</DialogTitle>
            <DialogDescription>Create a new knowledge base article</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={articleFormData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  setArticleFormData({ ...articleFormData, title, slug });
                }}
                placeholder="Article title"
                data-testid="input-article-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={articleFormData.slug}
                onChange={(e) => setArticleFormData({ ...articleFormData, slug: e.target.value })}
                placeholder="article-slug"
                data-testid="input-article-slug"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={articleFormData.content}
                onChange={(e) => setArticleFormData({ ...articleFormData, content: e.target.value })}
                placeholder="Article content (supports Markdown)"
                rows={6}
                data-testid="input-article-content"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kb-category">Category</Label>
              <Select value={articleFormData.category} onValueChange={(value) => setArticleFormData({ ...articleFormData, category: value })}>
                <SelectTrigger data-testid="select-article-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="getting-started">Getting Started</SelectItem>
                  <SelectItem value="tutorials">Tutorials</SelectItem>
                  <SelectItem value="faq">FAQ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateArticleOpen(false)} data-testid="button-cancel-article">
              Cancel
            </Button>
            <Button 
              onClick={() => createArticleMutation.mutate({ ...articleFormData, authorId: "admin" })}
              data-testid="button-save-article"
            >
              Create Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
