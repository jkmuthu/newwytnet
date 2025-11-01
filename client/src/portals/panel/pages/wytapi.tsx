import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Key, 
  BarChart3, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Plus,
  Activity,
  TrendingUp,
  Zap
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function WytApiPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  const { data: keysData, isLoading: keysLoading } = useQuery({
    queryKey: ["/api/wytapi/keys"],
  });

  const { data: usageData } = useQuery({
    queryKey: ["/api/wytapi/usage/current"],
  });

  const { data: statsData } = useQuery({
    queryKey: ["/api/wytapi/usage/stats"],
  });

  const { data: tiersData } = useQuery({
    queryKey: ["/api/wytapi/tiers"],
  });

  const createKeyMutation = useMutation({
    mutationFn: (name: string) =>
      apiRequest("/api/wytapi/keys", "POST", { name, tier: "free" }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wytapi/keys"] });
      setNewApiKey(data.key.key);
      setKeyName("");
      toast({
        title: "API Key Created",
        description: "Save this key securely. You won't be able to see it again!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: (keyId: string) =>
      apiRequest(`/api/wytapi/keys/${keyId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wytapi/keys"] });
      toast({
        title: "API Key Revoked",
        description: "The API key has been successfully revoked.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke API key",
        variant: "destructive",
      });
    },
  });

  const regenerateKeyMutation = useMutation({
    mutationFn: (keyId: string) =>
      apiRequest(`/api/wytapi/keys/${keyId}/regenerate`, "POST"),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wytapi/keys"] });
      setNewApiKey(data.key.key);
      toast({
        title: "API Key Regenerated",
        description: "Save this new key securely. The old key is no longer valid!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate API key",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const handleCreateKey = () => {
    if (!keyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your API key",
        variant: "destructive",
      });
      return;
    }
    createKeyMutation.mutate(keyName);
  };

  const currentTier = usageData?.tier || "free";
  const usage = usageData?.usage || 0;
  const limit = usageData?.limit || 0;
  const percentage = usageData?.percentage || "0";

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">WytApi Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your API keys, monitor usage, and access platform datasets programmatically
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{currentTier}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {limit.toLocaleString()} requests/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {percentage}% of limit used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.stats?.totalRequests?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Success rate: {statsData?.stats?.successRate || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access
              </CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-api-key">
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Generate a new API key for your applications
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      data-testid="input-key-name"
                      placeholder="e.g., Production App, Development"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                    />
                  </div>
                  {newApiKey && (
                    <div className="space-y-2">
                      <Label>Your API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newApiKey}
                          readOnly
                          data-testid="input-new-api-key"
                          className="font-mono text-sm"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(newApiKey)}
                          data-testid="button-copy-new-key"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-500">
                        ⚠️ Save this key securely! You won't be able to see it again.
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  {!newApiKey ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateKey}
                        disabled={createKeyMutation.isPending}
                        data-testid="button-confirm-create"
                      >
                        Create Key
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setCreateDialogOpen(false);
                        setNewApiKey(null);
                      }}
                      data-testid="button-close-dialog"
                    >
                      Close
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {keysLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading keys...</p>
          ) : keysData?.keys?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No API keys yet. Create one to get started!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keysData?.keys?.map((key: any) => (
                  <TableRow key={key.id} data-testid={`row-api-key-${key.id}`}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {key.keyPrefix}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {key.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={key.status === "active" ? "default" : "destructive"}
                      >
                        {key.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {key.lastUsedAt
                        ? new Date(key.lastUsedAt).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => regenerateKeyMutation.mutate(key.id)}
                          disabled={key.status !== "active"}
                          data-testid={`button-regenerate-${key.id}`}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => revokeKeyMutation.mutate(key.id)}
                          disabled={key.status !== "active"}
                          data-testid={`button-revoke-${key.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pricing Tiers
          </CardTitle>
          <CardDescription>
            Upgrade your tier for higher limits and advanced features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiersData?.tiers?.map((tier: any) => (
              <Card
                key={tier.id}
                className={
                  tier.tier === currentTier
                    ? "border-primary shadow-md"
                    : "border-muted"
                }
              >
                <CardHeader>
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {tier.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      ₹{tier.priceMonthly}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ {tier.requestsPerMonth.toLocaleString()} requests/month</li>
                    <li>✓ {tier.requestsPerMinute} requests/minute</li>
                    <li>✓ {tier.maxApiKeys} API keys</li>
                    {tier.features?.slice(0, 3).map((feature: string, idx: number) => (
                      <li key={idx}>✓ {feature}</li>
                    ))}
                  </ul>
                  {tier.tier === currentTier && (
                    <Badge className="mt-4">Current Plan</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
