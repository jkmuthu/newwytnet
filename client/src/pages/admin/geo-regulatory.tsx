import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Globe, Shield, AlertTriangle, Plus, Trash2, Edit, 
  CheckCircle2, XCircle, FileText, TrendingUp
} from "lucide-react";

export default function GeoRegulatoryControl() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const { toast } = useToast();

  // Fetch rules
  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['/api/geo-regulatory/rules'],
  });

  // Fetch compliance logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['/api/geo-regulatory/compliance-logs'],
  });

  // Fetch templates
  const { data: templatesData } = useQuery({
    queryKey: ['/api/geo-regulatory/templates'],
  });

  // Delete rule mutation
  const deleteMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      return apiRequest(`/api/geo-regulatory/rules/${ruleId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/geo-regulatory/rules'] });
      toast({
        title: "Rule Deleted",
        description: "Geo-regulatory rule has been deleted successfully.",
      });
    }
  });

  // Create rule mutation
  const createMutation = useMutation({
    mutationFn: async (ruleData: any) => {
      return apiRequest('/api/geo-regulatory/rules', {
        method: 'POST',
        body: JSON.stringify(ruleData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/geo-regulatory/rules'] });
      setShowCreateDialog(false);
      toast({
        title: "Rule Created",
        description: "Geo-regulatory rule has been created successfully.",
      });
    }
  });

  const handleCreateRule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const ruleData = {
      countryCode: formData.get('countryCode'),
      stateCode: formData.get('stateCode') || null,
      regionName: formData.get('regionName'),
      complianceTemplate: selectedTemplate || formData.get('complianceTemplate'),
      complianceLevel: formData.get('complianceLevel') || 'basic',
      dataResidency: formData.get('dataResidency') === 'on',
      dataExportAllowed: formData.get('dataExportAllowed') === 'on',
      governmentMonitoringEnabled: formData.get('governmentMonitoringEnabled') === 'on',
      isActive: true,
      enforcementLevel: formData.get('enforcementLevel') || 'warn',
      notes: formData.get('notes') || ''
    };
    
    createMutation.mutate(ruleData);
  };

  const applyTemplate = (templateKey: string) => {
    setSelectedTemplate(templateKey);
  };

  const rules = rulesData?.rules || [];
  const logs = logsData?.logs || [];
  const templates = templatesData?.templates || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-indigo-600" />
            Geo-Regulatory Control
          </h1>
          <p className="text-muted-foreground mt-1">
            Multi-country compliance, data sovereignty, and geographic access control
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-rule">
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Geo-Regulatory Rule</DialogTitle>
              <DialogDescription>
                Define country/state-specific compliance rules and restrictions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="countryCode">Country Code *</Label>
                  <Input
                    id="countryCode"
                    name="countryCode"
                    placeholder="IN, US, GB, etc."
                    required
                    data-testid="input-country-code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stateCode">State/Province Code</Label>
                  <Input
                    id="stateCode"
                    name="stateCode"
                    placeholder="TN, CA, etc."
                    data-testid="input-state-code"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regionName">Region Name *</Label>
                <Input
                  id="regionName"
                  name="regionName"
                  placeholder="India, Tamil Nadu, California, etc."
                  required
                  data-testid="input-region-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complianceTemplate">Compliance Template</Label>
                <Select name="complianceTemplate" value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger data-testid="select-compliance-template">
                    <SelectValue placeholder="Select template or custom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    {Object.keys(templates).map(key => (
                      <SelectItem key={key} value={key}>{templates[key].name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complianceLevel">Compliance Level</Label>
                <Select name="complianceLevel" defaultValue="basic">
                  <SelectTrigger data-testid="select-compliance-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="strict">Strict</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dataResidency">Data Residency Required</Label>
                  <Switch id="dataResidency" name="dataResidency" data-testid="switch-data-residency" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="dataExportAllowed">Data Export Allowed</Label>
                  <Switch id="dataExportAllowed" name="dataExportAllowed" defaultChecked data-testid="switch-data-export" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="governmentMonitoringEnabled">Government Monitoring</Label>
                  <Switch id="governmentMonitoringEnabled" name="governmentMonitoringEnabled" data-testid="switch-government-monitoring" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enforcementLevel">Enforcement Level</Label>
                <Select name="enforcementLevel" defaultValue="warn">
                  <SelectTrigger data-testid="select-enforcement-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="log">Log Only</SelectItem>
                    <SelectItem value="warn">Warn</SelectItem>
                    <SelectItem value="block">Block</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Internal notes about this rule..."
                  rows={3}
                  data-testid="textarea-notes"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-rule">
                  {createMutation.isPending ? 'Creating...' : 'Create Rule'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.filter((r: any) => r.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(rules.map((r: any) => r.countryCode)).size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Events</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Regulatory Rules</TabsTrigger>
          <TabsTrigger value="logs">Compliance Logs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          {rulesLoading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Loading rules...</p>
              </CardContent>
            </Card>
          ) : rules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No regulatory rules defined yet</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Rules ({rules.length})</CardTitle>
                <CardDescription>Manage country/state-specific compliance rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rules.map((rule: any) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`rule-card-${rule.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{rule.regionName}</h3>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{rule.countryCode}</Badge>
                          {rule.stateCode && <Badge variant="outline">{rule.stateCode}</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Template: {rule.complianceTemplate || 'Custom'}</span>
                          <span>Level: {rule.complianceLevel}</span>
                          <span>Enforcement: {rule.enforcementLevel}</span>
                          {rule.dataResidency && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                              <Shield className="h-3 w-3 mr-1" />
                              Data Residency
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(rule.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${rule.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Audit Logs</CardTitle>
              <CardDescription>Track regulatory events and government access</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <p className="text-center text-muted-foreground py-4">Loading logs...</p>
              ) : logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No compliance logs yet</p>
              ) : (
                <div className="space-y-2">
                  {logs.slice(0, 50).map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded text-sm" data-testid={`log-${log.id}`}>
                      <Badge variant={log.severity === 'critical' ? 'destructive' : log.severity === 'warning' ? 'secondary' : 'outline'}>
                        {log.severity}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium">{log.eventType} - {log.action}</div>
                        <div className="text-muted-foreground text-xs mt-1">
                          {log.countryCode} {log.stateCode && `/ ${log.stateCode}`} | {log.result} | {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {log.governmentAccess && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Gov Access
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(templates).map(([key, template]: [string, any]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Applicable Regions:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.applicableRegions.map((region: string) => (
                        <Badge key={region} variant="outline">{region}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Requirements:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Data Residency: {template.requirements.dataResidency ? 'Required' : 'Optional'}</li>
                      <li>• Data Export: {template.requirements.dataExportAllowed ? 'Allowed' : 'Restricted'}</li>
                      <li>• Minimum Age: {template.requirements.minimumAge}</li>
                      <li>• Retention: {template.requirements.retentionDays ? `${template.requirements.retentionDays} days` : 'Unlimited'}</li>
                    </ul>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      applyTemplate(key);
                      setShowCreateDialog(true);
                    }}
                    data-testid={`button-apply-template-${key}`}
                  >
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
