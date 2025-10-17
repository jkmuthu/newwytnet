import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Settings, Globe, Mail, CreditCard, Shield, Code } from "lucide-react";

interface PlatformSetting {
  id: string;
  key: string;
  value: string | null;
  parsedValue: any;
  type: string;
  category: string;
  label: string | null;
  description: string | null;
  isPublic: boolean;
  isEditable: boolean;
  updatedAt: string;
}

export default function AdminGlobalSettingsReal() {
  const [selectedSetting, setSelectedSetting] = useState<PlatformSetting | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
  });

  const settings = ((settingsData as any)?.settings || []) as PlatformSetting[];
  const grouped = ((settingsData as any)?.grouped || {}) as Record<string, PlatformSetting[]>;

  const updateSettingMutation = useMutation({
    mutationFn: async (data: { id: string; value: string }) => {
      return await apiRequest(`/api/admin/settings/${data.id}`, 'PUT', { value: data.value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      setEditDialogOpen(false);
      setSelectedSetting(null);
      setJsonError(null);
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.error || "Failed to update setting";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (setting: PlatformSetting) => {
    if (!setting.isEditable) {
      toast({
        title: "Cannot Edit",
        description: "This setting is read-only",
        variant: "destructive",
      });
      return;
    }

    setSelectedSetting(setting);
    
    // Set initial value based on type
    if (setting.type === 'json') {
      setEditValue(setting.value ? JSON.stringify(setting.parsedValue, null, 2) : '{}');
    } else if (setting.type === 'boolean') {
      setEditValue(setting.value || 'false');
    } else {
      setEditValue(setting.value || "");
    }
    
    setJsonError(null);
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedSetting) return;

    // Validate based on type
    if (selectedSetting.type === 'json') {
      try {
        JSON.parse(editValue);
        setJsonError(null);
      } catch (e) {
        setJsonError("Invalid JSON format");
        return;
      }
    } else if (selectedSetting.type === 'number') {
      if (isNaN(Number(editValue))) {
        toast({
          title: "Invalid Value",
          description: "Please enter a valid number",
          variant: "destructive",
        });
        return;
      }
    }

    updateSettingMutation.mutate({
      id: selectedSetting.id,
      value: editValue,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general':
        return <Globe className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'payment':
        return <CreditCard className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'api':
        return <Code className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const formatValue = (setting: PlatformSetting) => {
    if (!setting.value) {
      return <span className="text-muted-foreground italic">Not set</span>;
    }

    if (setting.type === 'boolean') {
      return <Badge variant={setting.parsedValue ? 'default' : 'secondary'}>
        {setting.parsedValue ? 'Enabled' : 'Disabled'}
      </Badge>;
    } else if (setting.type === 'json') {
      return <pre className="text-sm font-mono bg-muted p-2 rounded max-w-md overflow-auto">
        {JSON.stringify(setting.parsedValue, null, 2)}
      </pre>;
    } else {
      return <span className="text-sm font-mono">{setting.value}</span>;
    }
  };

  const categories = Object.keys(grouped);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Global Settings</h1>
        <p className="text-muted-foreground">Configure platform-wide settings</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading settings...</div>
      ) : categories.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Platform Settings
            </CardTitle>
            <CardDescription>Manage global platform configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              No settings configured yet. Settings will be seeded on next server start.
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={categories[0]} className="space-y-4">
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} data-testid={`tab-${category}`}>
                {getCategoryIcon(category)}
                <span className="ml-2 capitalize">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <span className="capitalize">{category} Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {grouped[category]?.map((setting) => (
                      <div 
                        key={setting.id} 
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        data-testid={`setting-${setting.key}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{setting.label || setting.key}</h4>
                            {setting.isPublic && (
                              <Badge variant="outline" className="text-xs">Public</Badge>
                            )}
                            {!setting.isEditable && (
                              <Badge variant="secondary" className="text-xs">Read-only</Badge>
                            )}
                            <Badge variant="outline" className="text-xs capitalize">{setting.type}</Badge>
                          </div>
                          {setting.description && (
                            <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                          )}
                          <div className="mt-2">
                            {formatValue(setting)}
                          </div>
                        </div>
                        {setting.isEditable && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(setting)}
                            data-testid={`button-edit-${setting.key}`}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Setting</DialogTitle>
            <DialogDescription>
              {selectedSetting?.label || selectedSetting?.key}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="value">
                Value {selectedSetting?.type && <span className="text-muted-foreground">({selectedSetting.type})</span>}
              </Label>
              {selectedSetting?.type === 'boolean' ? (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editValue === 'true'}
                    onCheckedChange={(checked) => setEditValue(String(checked))}
                    data-testid="switch-setting-value"
                  />
                  <Label>{editValue === 'true' ? 'Enabled' : 'Disabled'}</Label>
                </div>
              ) : selectedSetting?.type === 'json' ? (
                <div className="space-y-2">
                  <Textarea
                    id="value"
                    value={editValue}
                    onChange={(e) => {
                      setEditValue(e.target.value);
                      setJsonError(null);
                    }}
                    rows={10}
                    className="font-mono text-sm"
                    data-testid="textarea-setting-value"
                  />
                  {jsonError && (
                    <p className="text-sm text-destructive">{jsonError}</p>
                  )}
                </div>
              ) : (
                <Input
                  id="value"
                  type={selectedSetting?.type === 'number' ? 'number' : 'text'}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  data-testid="input-setting-value"
                />
              )}
            </div>
            {selectedSetting?.description && (
              <p className="text-sm text-muted-foreground">{selectedSetting.description}</p>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditDialogOpen(false);
                setJsonError(null);
              }}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateSettingMutation.isPending || !!jsonError}
              data-testid="button-save-setting"
            >
              {updateSettingMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
