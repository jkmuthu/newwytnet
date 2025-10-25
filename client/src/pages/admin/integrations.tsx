import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Plug, 
  CheckCircle2, 
  XCircle,
  Settings,
  ExternalLink,
  CreditCard,
  MessageSquare,
  Database,
  Brain,
  BarChart3,
  Map,
  Headphones,
  Users,
  TestTube
} from "lucide-react";

interface Integration {
  id: string;
  display_id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  provider: string;
  is_active: boolean;
  is_configured: boolean;
  config_fields: Record<string, string>;
  credentials: Record<string, string>;
  documentation_url: string | null;
  created_at: string;
}

export default function AdminIntegrations() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configData, setConfigData] = useState<Record<string, string>>({});
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testPrompt, setTestPrompt] = useState("");
  const [testResult, setTestResult] = useState("");
  const { toast } = useToast();

  const { data: integrationsData, isLoading } = useQuery({
    queryKey: ['/api/admin/integrations'],
    queryFn: async () => {
      const response = await fetch('/api/admin/integrations', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch integrations');
      }
      return response.json();
    },
  });

  const configureIntegrationMutation = useMutation({
    mutationFn: async (data: { id: string; credentials: Record<string, string> }) => {
      return await apiRequest(`/api/admin/integrations/${data.id}/configure`, 'POST', data.credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/integrations'] });
      setSelectedIntegration(null);
      setConfigData({});
      toast({
        title: "Success",
        description: "Integration configured successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to configure integration",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/integrations/${id}/toggle`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/integrations'] });
      toast({
        title: "Success",
        description: "Integration status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update integration status",
        variant: "destructive",
      });
    },
  });

  const testAIMutation = useMutation({
    mutationFn: async (data: { model: string; prompt: string }) => {
      return await apiRequest('/api/admin/ai/test', 'POST', data);
    },
    onSuccess: (data: any) => {
      setTestResult(data.response || 'Test completed successfully');
      toast({
        title: "AI Test Successful",
        description: "Model responded correctly",
      });
    },
    onError: () => {
      toast({
        title: "AI Test Failed",
        description: "Failed to get response from AI model",
        variant: "destructive",
      });
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment':
        return <CreditCard className="h-5 w-5" />;
      case 'communication':
        return <MessageSquare className="h-5 w-5" />;
      case 'storage':
        return <Database className="h-5 w-5" />;
      case 'ai-ml':
        return <Brain className="h-5 w-5" />;
      case 'analytics':
        return <BarChart3 className="h-5 w-5" />;
      case 'maps':
        return <Map className="h-5 w-5" />;
      case 'support':
        return <Headphones className="h-5 w-5" />;
      case 'crm':
        return <Users className="h-5 w-5" />;
      default:
        return <Plug className="h-5 w-5" />;
    }
  };

  const integrations = (integrationsData?.integrations || []) as Integration[];
  const categories = Array.from(new Set(integrations.map((i: Integration) => i.category))) as string[];

  const groupedIntegrations = categories.reduce<Record<string, Integration[]>>((acc, category) => {
    acc[category] = integrations.filter((i: Integration) => i.category === category);
    return acc;
  }, {});

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration);
    // Pre-fill with existing credentials if available
    setConfigData(integration.credentials || {});
  };

  const handleSaveConfig = () => {
    if (selectedIntegration) {
      configureIntegrationMutation.mutate({
        id: selectedIntegration.id,
        credentials: configData,
      });
    }
  };

  const handleTest = (integration: Integration) => {
    setSelectedIntegration(integration);
    setTestDialogOpen(true);
    setTestPrompt("Hello, please respond with a brief greeting.");
    setTestResult("");
  };

  const runTest = () => {
    if (selectedIntegration && testPrompt) {
      testAIMutation.mutate({
        model: selectedIntegration.slug,
        prompt: testPrompt,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground">Connect external services and APIs to your platform</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading integrations...</div>
      ) : (
        <Tabs defaultValue={categories[0]} className="space-y-4">
          <TabsList className="grid w-full grid-cols-8 lg:w-auto lg:inline-grid">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} data-testid={`tab-${category}`}>
                {getCategoryIcon(category)}
                <span className="ml-2 hidden lg:inline">{category.replace('-', ' ')}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedIntegrations[category]?.map((integration: Integration) => (
                  <Card key={integration.id} data-testid={`card-integration-${integration.slug}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(integration.category)}
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {integration.provider}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {integration.is_configured ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {integration.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <Badge variant={integration.is_active ? "default" : "outline"}>
                          {integration.is_active ? "Active" : "Inactive"}
                        </Badge>
                        
                        <div className="flex gap-2">
                          {integration.documentation_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(integration.documentation_url!, '_blank')}
                              data-testid={`button-docs-${integration.slug}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          {integration.category === 'ai-ml' && integration.is_active ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTest(integration)}
                                data-testid={`button-test-${integration.slug}`}
                              >
                                <TestTube className="h-3 w-3 mr-1" />
                                Test
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => toggleActiveMutation.mutate(integration.id)}
                                data-testid={`button-deactivate-${integration.slug}`}
                              >
                                Deactivate
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConfigure(integration)}
                              data-testid={`button-configure-${integration.slug}`}
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              {integration.is_configured ? 'Update' : 'Configure'}
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        ID: {integration.display_id}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Dialog open={!!selectedIntegration} onOpenChange={(open) => !open && setSelectedIntegration(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Enter your API credentials and configuration details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedIntegration && Object.entries(selectedIntegration.config_fields).map(([key, type]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                <Input
                  id={key}
                  type={type === 'password' ? 'password' : type === 'email' ? 'email' : 'text'}
                  value={configData[key] || ''}
                  onChange={(e) => setConfigData({ ...configData, [key]: e.target.value })}
                  placeholder={`Enter ${key}`}
                  data-testid={`input-${key}`}
                />
              </div>
            ))}
            
            {selectedIntegration?.documentation_url && (
              <div className="mt-2">
                <a
                  href={selectedIntegration.documentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View documentation
                </a>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedIntegration(null)} data-testid="button-cancel-config">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveConfig} 
              disabled={configureIntegrationMutation.isPending}
              data-testid="button-save-config"
            >
              {configureIntegrationMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Send a test prompt to verify the AI integration is working correctly
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-prompt">Test Prompt</Label>
              <Textarea
                id="test-prompt"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter a test prompt..."
                rows={4}
                data-testid="textarea-test-prompt"
              />
            </div>
            {testResult && (
              <div className="space-y-2">
                <Label>Response</Label>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{testResult}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)} data-testid="button-cancel-test">
              Close
            </Button>
            <Button 
              onClick={runTest} 
              disabled={testAIMutation.isPending || !testPrompt}
              data-testid="button-run-test"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {testAIMutation.isPending ? "Testing..." : "Run Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
