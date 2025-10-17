import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Brain, Sparkles, Settings, CheckCircle2, XCircle, TestTube } from "lucide-react";

interface AIConfig {
  id: string;
  name: string;
  slug: string;
  provider: string;
  model: string;
  isActive: boolean;
  isConfigured: boolean;
  usageCount: number;
  lastUsedAt: string | null;
}

export default function AdminAIManagement() {
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<AIConfig | null>(null);
  const [testPrompt, setTestPrompt] = useState("");
  const [testResult, setTestResult] = useState("");
  const { toast } = useToast();

  // Fetch AI configurations from integrations (filter by category 'ai-ml')
  const { data: integrationsData, isLoading } = useQuery({
    queryKey: ['/api/admin/integrations'],
  });

  const aiIntegrations = (((integrationsData as any)?.integrations || []) as any[]).filter(
    (i) => i.category === 'ai-ml'
  );

  const toggleActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/integrations/${id}/toggle`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/integrations'] });
      toast({
        title: "Success",
        description: "AI integration status updated",
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

  const handleTest = (config: AIConfig) => {
    setSelectedConfig(config);
    setTestDialogOpen(true);
    setTestPrompt("Hello, please respond with a brief greeting.");
    setTestResult("");
  };

  const runTest = () => {
    if (selectedConfig && testPrompt) {
      testAIMutation.mutate({
        model: selectedConfig.slug,
        prompt: testPrompt,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-8 w-8" />
          AI Management
        </h1>
        <p className="text-muted-foreground">Manage AI models and integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Loading AI integrations...
          </div>
        ) : aiIntegrations.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No AI integrations configured
          </div>
        ) : (
          aiIntegrations.map((integration: any) => (
            <Card key={integration.id} data-testid={`card-ai-${integration.slug}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {integration.provider}
                      </CardDescription>
                    </div>
                  </div>
                  <div>
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
                    {integration.is_configured && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTest(integration)}
                        data-testid={`button-test-${integration.slug}`}
                      >
                        <TestTube className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={integration.is_active ? "destructive" : "default"}
                      onClick={() => toggleActiveMutation.mutate(integration.id)}
                      disabled={!integration.is_configured || toggleActiveMutation.isPending}
                      data-testid={`button-toggle-${integration.slug}`}
                    >
                      {integration.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  ID: {integration.display_id}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test AI Model: {selectedConfig?.name}</DialogTitle>
            <DialogDescription>
              Send a test prompt to verify the AI model is working correctly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                <Label>AI Response</Label>
                <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap" data-testid="text-test-result">
                  {testResult}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setTestDialogOpen(false)}
              data-testid="button-close-test"
            >
              Close
            </Button>
            <Button 
              onClick={runTest}
              disabled={!testPrompt || testAIMutation.isPending}
              data-testid="button-run-test"
            >
              {testAIMutation.isPending ? "Testing..." : "Run Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
