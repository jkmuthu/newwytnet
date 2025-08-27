import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Key, Users, FileText, Activity, Plus, Eye, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Form schemas
const createEntitySchema = z.object({
  type: z.enum(['person', 'org', 'asset', 'document']),
  meta: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const createProofSchema = z.object({
  entityId: z.string().uuid("Invalid entity ID"),
  proofType: z.enum(['hash', 'signature', 'blockchain_anchor', 'notary']),
  proofData: z.object({
    hash: z.string().optional(),
    signature: z.string().optional(),
    publicKey: z.string().optional(),
    algorithm: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
  expiresAt: z.string().optional(),
});

export default function WytIDManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [createEntityOpen, setCreateEntityOpen] = useState(false);
  const [createProofOpen, setCreateProofOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/wytid/stats'],
  });

  const { data: entities, isLoading: entitiesLoading } = useQuery({
    queryKey: ['/api/wytid/entities'],
  });

  // Forms
  const createEntityForm = useForm({
    resolver: zodResolver(createEntitySchema),
    defaultValues: {
      type: 'person' as const,
      meta: {
        name: '',
        description: '',
        category: '',
        tags: [],
      },
    },
  });

  const createProofForm = useForm({
    resolver: zodResolver(createProofSchema),
    defaultValues: {
      entityId: '',
      proofType: 'hash' as const,
      proofData: {
        hash: '',
        signature: '',
        publicKey: '',
        algorithm: 'SHA-256',
        metadata: {},
      },
    },
  });

  // Mutations
  const createEntityMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createEntitySchema>) => {
      return apiRequest('/api/wytid/entities', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "WytID entity created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wytid/entities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wytid/stats'] });
      setCreateEntityOpen(false);
      createEntityForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create entity",
        variant: "destructive",
      });
    },
  });

  const createProofMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createProofSchema>) => {
      const payload = {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      };
      return apiRequest('/api/wytid/proofs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "WytID proof created and anchored successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wytid/stats'] });
      setCreateProofOpen(false);
      createProofForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create proof",
        variant: "destructive",
      });
    },
  });

  const handleCreateEntity = (data: z.infer<typeof createEntitySchema>) => {
    createEntityMutation.mutate(data);
  };

  const handleCreateProof = (data: z.infer<typeof createProofSchema>) => {
    createProofMutation.mutate(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-wytid-management">WytID Management</h1>
          <p className="text-muted-foreground">Universal Identity & Validation System</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createEntityOpen} onOpenChange={setCreateEntityOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-entity">
                <Plus className="h-4 w-4 mr-2" />
                Create Entity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create WytID Entity</DialogTitle>
                <DialogDescription>
                  Create a new identity entity with unique identifier and metadata.
                </DialogDescription>
              </DialogHeader>
              <Form {...createEntityForm}>
                <form onSubmit={createEntityForm.handleSubmit(handleCreateEntity)} className="space-y-4">
                  <FormField
                    control={createEntityForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entity Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-entity-type">
                              <SelectValue placeholder="Select entity type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="person">Person</SelectItem>
                            <SelectItem value="org">Organization</SelectItem>
                            <SelectItem value="asset">Asset</SelectItem>
                            <SelectItem value="document">Document</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createEntityForm.control}
                    name="meta.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Entity name" {...field} data-testid="input-entity-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createEntityForm.control}
                    name="meta.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Entity description" {...field} data-testid="textarea-entity-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createEntityForm.control}
                    name="meta.category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Entity category" {...field} data-testid="input-entity-category" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateEntityOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createEntityMutation.isPending} data-testid="button-submit-entity">
                      {createEntityMutation.isPending ? "Creating..." : "Create Entity"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="entities" data-testid="tab-entities">Entities</TabsTrigger>
          <TabsTrigger value="verification" data-testid="tab-verification">Verification</TabsTrigger>
          <TabsTrigger value="api-keys" data-testid="tab-api-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-total-entities">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entities</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-entities">
                  {stats?.totalEntities || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.recentActivity || 0} in last 7 days
                </p>
              </CardContent>
            </Card>
            <Card data-testid="card-total-proofs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Proofs</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-proofs">
                  {stats?.totalProofs || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Blockchain anchored
                </p>
              </CardContent>
            </Card>
            <Card data-testid="card-total-transfers">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-transfers">
                  {stats?.totalTransfers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cross-tenant activity
                </p>
              </CardContent>
            </Card>
            <Card data-testid="card-verification-api">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Public API</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">
                  Verification enabled
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="card-entity-types">
              <CardHeader>
                <CardTitle>Entity Types</CardTitle>
                <CardDescription>Distribution of entity types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats?.entitiesByType && Object.entries(stats.entitiesByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="capitalize">{type}</span>
                    <Badge variant="secondary" data-testid={`badge-entity-type-${type}`}>{count}</Badge>
                  </div>
                ))}
                {(!stats?.entitiesByType || Object.keys(stats.entitiesByType).length === 0) && (
                  <p className="text-sm text-muted-foreground">No entities created yet</p>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-proof-types">
              <CardHeader>
                <CardTitle>Proof Types</CardTitle>
                <CardDescription>Distribution of proof types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats?.proofsByType && Object.entries(stats.proofsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                    <Badge variant="secondary" data-testid={`badge-proof-type-${type}`}>{count}</Badge>
                  </div>
                ))}
                {(!stats?.proofsByType || Object.keys(stats.proofsByType).length === 0) && (
                  <p className="text-sm text-muted-foreground">No proofs created yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entities" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" data-testid="title-entity-list">WytID Entities</h2>
            <Dialog open={createProofOpen} onOpenChange={setCreateProofOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-create-proof">
                  <Shield className="h-4 w-4 mr-2" />
                  Create Proof
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Proof</DialogTitle>
                  <DialogDescription>
                    Create a blockchain-anchored proof for an entity.
                  </DialogDescription>
                </DialogHeader>
                <Form {...createProofForm}>
                  <form onSubmit={createProofForm.handleSubmit(handleCreateProof)} className="space-y-4">
                    <FormField
                      control={createProofForm.control}
                      name="entityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entity</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-proof-entity">
                                <SelectValue placeholder="Select entity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {entities && entities.map((entity: any) => (
                                <SelectItem key={entity.id} value={entity.id}>
                                  {entity.meta?.name || entity.identifier} ({entity.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createProofForm.control}
                      name="proofType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proof Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-proof-type">
                                <SelectValue placeholder="Select proof type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hash">Hash</SelectItem>
                              <SelectItem value="signature">Digital Signature</SelectItem>
                              <SelectItem value="blockchain_anchor">Blockchain Anchor</SelectItem>
                              <SelectItem value="notary">Notary</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createProofForm.control}
                      name="proofData.hash"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Hash</FormLabel>
                          <FormControl>
                            <Input placeholder="SHA-256 hash of the data" {...field} data-testid="input-proof-hash" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setCreateProofOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createProofMutation.isPending} data-testid="button-submit-proof">
                        {createProofMutation.isPending ? "Creating..." : "Create Proof"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {entitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : entities && entities.length > 0 ? (
              entities.map((entity: any) => (
                <Card key={entity.id} data-testid={`card-entity-${entity.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {entity.meta?.name || 'Unnamed Entity'}
                          <Badge variant="outline" data-testid={`badge-entity-type-${entity.type}`}>
                            {entity.type}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{entity.meta?.description}</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(entity.identifier)}
                        data-testid={`button-copy-identifier-${entity.id}`}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {entity.identifier}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Created:</span>
                        <p className="text-muted-foreground">
                          {new Date(entity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <p className="text-muted-foreground">
                          {entity.meta?.category || 'None'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No entities yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first WytID entity to start managing identities.
                  </p>
                  <Button onClick={() => setCreateEntityOpen(true)} data-testid="button-create-first-entity">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Entity
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card data-testid="card-public-verification">
            <CardHeader>
              <CardTitle>Public Verification API</CardTitle>
              <CardDescription>
                Verify WytID entities using public endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Verification Endpoint</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value="GET /api/public/wytid/verify/{identifier}"
                    className="font-mono text-sm"
                    data-testid="input-verification-endpoint"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard("GET /api/public/wytid/verify/{identifier}")}
                    data-testid="button-copy-endpoint"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Example Response</Label>
                <Textarea
                  readOnly
                  value={JSON.stringify({
                    valid: true,
                    entity: {
                      identifier: "WYT-ABC123",
                      type: "person",
                      meta: { name: "John Doe" }
                    },
                    proofs: [
                      {
                        proofType: "blockchain_anchor",
                        txHash: "0x123...",
                        issuedAt: "2024-01-01T00:00:00Z"
                      }
                    ],
                    lastVerified: "2024-01-01T00:00:00Z",
                    warnings: []
                  }, null, 2)}
                  className="font-mono text-xs"
                  rows={12}
                  data-testid="textarea-example-response"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card data-testid="card-api-key-management">
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>
                Manage API keys for external verification access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">API Key Management</h3>
                <p className="text-muted-foreground mb-4">
                  Create and manage API keys for external systems to verify WytID entities.
                </p>
                <Button data-testid="button-create-api-key">
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}