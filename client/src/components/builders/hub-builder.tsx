import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function HubBuilder() {
  const [hubConfig, setHubConfig] = useState({
    name: 'OwnerNET',
    type: 'directory',
    description: 'A comprehensive directory for property owners and managers to connect, share resources, and collaborate.',
    moderation: {
      contentModeration: true,
      kycVerification: true,
      autoApprove: false,
    },
    revenue: {
      joiningFee: 500,
      transactionFeePercent: 2.5,
      listingFee: 100,
    },
    aggregationRules: [
      { id: '1', name: 'Property Listings', source: 'property.*', filter: 'status=active', status: 'active' },
      { id: '2', name: 'Service Providers', source: 'service.*', filter: 'verified=true', status: 'pending' },
    ]
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hubs } = useQuery({
    queryKey: ["/api/hubs"],
    retry: false,
  });

  const createHubMutation = useMutation({
    mutationFn: async (hubData: any) => {
      return await apiRequest("/api/hubs", "POST", hubData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hub created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hubs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateHub = () => {
    createHubMutation.mutate({
      key: hubConfig.name.toLowerCase().replace(/\s+/g, '-'),
      name: hubConfig.name,
      description: hubConfig.description,
      type: hubConfig.type,
      config: {
        moderation: hubConfig.moderation,
        revenue: hubConfig.revenue,
      },
      aggregationRules: hubConfig.aggregationRules,
      status: 'draft'
    });
  };

  const handleModerationChange = (key: string, value: boolean) => {
    setHubConfig({
      ...hubConfig,
      moderation: {
        ...hubConfig.moderation,
        [key]: value
      }
    });
  };

  const handleRevenueChange = (key: string, value: number) => {
    setHubConfig({
      ...hubConfig,
      revenue: {
        ...hubConfig.revenue,
        [key]: value
      }
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Hub Builder</h2>
          <p className="text-muted-foreground">Create cross-tenant hubs and marketplaces</p>
        </div>
        <Button 
          onClick={handleCreateHub}
          disabled={createHubMutation.isPending}
          data-testid="button-new-hub"
        >
          <i className="fas fa-plus mr-2"></i>
          {createHubMutation.isPending ? "Creating..." : "New Hub"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hub Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hub Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Hub Name</label>
                <Input
                  value={hubConfig.name}
                  onChange={(e) => setHubConfig({...hubConfig, name: e.target.value})}
                  data-testid="input-hub-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Hub Type</label>
                <Select 
                  value={hubConfig.type} 
                  onValueChange={(value) => setHubConfig({...hubConfig, type: value})}
                >
                  <SelectTrigger data-testid="select-hub-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="directory">Directory</SelectItem>
                    <SelectItem value="classifieds">Classifieds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Description</label>
                <Textarea
                  rows={3}
                  value={hubConfig.description}
                  onChange={(e) => setHubConfig({...hubConfig, description: e.target.value})}
                  data-testid="textarea-hub-description"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aggregation Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hubConfig.aggregationRules.map((rule) => (
                <div key={rule.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{rule.name}</span>
                    <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                      {rule.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aggregate {rule.name.toLowerCase()} from tenant "{rule.source.split('.')[0]}" modules
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span>Source: {rule.source} | Filter: {rule.filter}</span>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full border-dashed"
                data-testid="button-add-aggregation-rule"
              >
                <i className="fas fa-plus mr-2"></i>Add Aggregation Rule
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Hub Preview & Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hub Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white text-center">
                  <h2 className="text-lg font-bold">{hubConfig.name} {hubConfig.type === 'directory' ? 'Directory' : 'Hub'}</h2>
                  <p className="text-blue-100 text-sm">Connect with property owners nationwide</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-card p-3 rounded border">
                    <i className="fas fa-home text-blue-600 mb-1"></i>
                    <p className="text-xs font-medium">1,247 Properties</p>
                  </div>
                  <div className="bg-card p-3 rounded border">
                    <i className="fas fa-users text-green-600 mb-1"></i>
                    <p className="text-xs font-medium">892 Members</p>
                  </div>
                </div>
                <div className="text-center">
                  <Button size="sm">Explore {hubConfig.type === 'directory' ? 'Directory' : 'Hub'}</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Moderation & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Content Moderation</span>
                <Switch
                  checked={hubConfig.moderation.contentModeration}
                  onCheckedChange={(checked) => handleModerationChange('contentModeration', checked)}
                  data-testid="switch-content-moderation"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">KYC Verification</span>
                <Switch
                  checked={hubConfig.moderation.kycVerification}
                  onCheckedChange={(checked) => handleModerationChange('kycVerification', checked)}
                  data-testid="switch-kyc-verification"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Auto-approve</span>
                <Switch
                  checked={hubConfig.moderation.autoApprove}
                  onCheckedChange={(checked) => handleModerationChange('autoApprove', checked)}
                  data-testid="switch-auto-approve"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Model</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Joining Fee</label>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    value={hubConfig.revenue.joiningFee}
                    onChange={(e) => handleRevenueChange('joiningFee', Number(e.target.value))}
                    data-testid="input-joining-fee"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Transaction Fee (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={hubConfig.revenue.transactionFeePercent}
                  onChange={(e) => handleRevenueChange('transactionFeePercent', Number(e.target.value))}
                  data-testid="input-transaction-fee"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Listing Fee</label>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    value={hubConfig.revenue.listingFee}
                    onChange={(e) => handleRevenueChange('listingFee', Number(e.target.value))}
                    data-testid="input-listing-fee"
                  />
                  <span className="text-muted-foreground text-sm">per listing</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
