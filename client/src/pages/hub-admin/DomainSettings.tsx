import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe, Plus, Trash2, Check, AlertCircle, ExternalLink, 
  Copy, RefreshCw, Shield, Loader2 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface HubDomain {
  id: string;
  domain: string;
  domainType: string;
  isPrimary: boolean;
  status: 'pending' | 'verifying' | 'active' | 'failed' | 'expired';
  verificationToken: string;
  verifiedAt: string | null;
  sslStatus: string;
  dnsRecords: Array<{ type: string; name: string; value: string; required: boolean }>;
  createdAt: string;
}

export default function DomainSettings() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const { data, isLoading, refetch } = useQuery<{ success: boolean; domains: HubDomain[] }>({
    queryKey: ['/api/hub-admin/domains'],
  });

  const addDomainMutation = useMutation({
    mutationFn: async (domainData: { domain: string; isPrimary: boolean }) => {
      return apiRequest('/api/hub-admin/domains', {
        method: 'POST',
        body: JSON.stringify(domainData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub-admin/domains'] });
      setIsAddDialogOpen(false);
      setNewDomain("");
      setIsPrimary(false);
      toast({
        title: "Domain Added",
        description: "Configure DNS settings and verify your domain.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add domain",
        variant: "destructive",
      });
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      return apiRequest(`/api/hub-admin/domains/${domainId}/verify`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub-admin/domains'] });
      toast({
        title: "Domain Verified",
        description: "Your domain is now active!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Please check your DNS settings",
        variant: "destructive",
      });
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      return apiRequest(`/api/hub-admin/domains/${domainId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub-admin/domains'] });
      toast({
        title: "Domain Removed",
        description: "The domain has been removed from your hub.",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending Setup</Badge>;
      case 'verifying':
        return <Badge className="bg-blue-500">Verifying</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const domains = data?.domains || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Custom Domains</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Connect your own domains to your hub
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-domain">
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Domain</DialogTitle>
              <DialogDescription>
                Enter your domain name. You'll need to configure DNS after adding.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  data-testid="input-domain"
                />
                <p className="text-xs text-muted-foreground">
                  Enter without http:// or www. (e.g., mysite.com)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPrimary" className="text-sm">Set as primary domain</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => addDomainMutation.mutate({ domain: newDomain, isPrimary })}
                disabled={!newDomain || addDomainMutation.isPending}
                data-testid="button-submit-domain"
              >
                {addDomainMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Add Domain
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : domains.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Custom Domains</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Add your own domain to make your hub accessible at a custom URL. 
              Your visitors will see your brand, not ours.
            </p>
            <Button className="mt-6" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Domain
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <Card key={domain.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {domain.domain}
                        {domain.isPrimary && (
                          <Badge variant="outline" className="text-xs">Primary</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {getStatusBadge(domain.status)}
                        {domain.sslStatus === 'active' && (
                          <span className="flex items-center text-green-600 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            SSL Active
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {domain.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => verifyDomainMutation.mutate(domain.id)}
                        disabled={verifyDomainMutation.isPending}
                        data-testid={`button-verify-${domain.id}`}
                      >
                        {verifyDomainMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Verify
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                      data-testid={`button-visit-${domain.id}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-600"
                      onClick={() => deleteDomainMutation.mutate(domain.id)}
                      data-testid={`button-delete-${domain.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {domain.status === 'pending' && domain.dnsRecords && domain.dnsRecords.length > 0 && (
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>DNS Configuration Required</AlertTitle>
                    <AlertDescription>
                      <p className="mb-3">Add these DNS records to your domain registrar (Cloudflare, GoDaddy, etc.):</p>
                      <div className="bg-muted rounded-lg p-3 space-y-2 text-sm font-mono">
                        {domain.dnsRecords.map((record, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span>
                              <span className="text-blue-600">{record.type}</span>
                              {' '}
                              <span className="text-gray-600">{record.name}</span>
                              {' → '}
                              <span className="text-green-600">{record.value}</span>
                            </span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => copyToClipboard(record.value)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        After adding DNS records, wait 5-10 minutes for propagation, then click "Verify".
                      </p>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 text-lg">
            How Custom Domains Work
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p><strong>1. Add your domain</strong> - Enter your domain name above</p>
          <p><strong>2. Configure DNS</strong> - Add the provided DNS records at your domain registrar</p>
          <p><strong>3. Verify</strong> - Click verify once DNS propagates (usually 5-10 minutes)</p>
          <p><strong>4. Done!</strong> - Your hub is now accessible at your custom domain with SSL</p>
          <p className="text-xs mt-4 text-blue-600 dark:text-blue-400">
            We recommend using Cloudflare for easy DNS management and free SSL.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
