import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Palette, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Eye, 
  EyeOff,
  Sparkles,
  Sun,
  Moon
} from "lucide-react";

interface Theme {
  id: string;
  displayId: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  isActive: boolean;
  isDefault: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  mode: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminThemes() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    mode: "light",
    primaryColor: "#0066FF",
    secondaryColor: "#FF6B00",
    accentColor: "#00D4FF",
    backgroundColor: "#FFFFFF",
    textColor: "#1A1A1A",
    fontFamily: "Inter",
  });
  const { toast } = useToast();

  const { data: themesData, isLoading } = useQuery<{
    success: boolean;
    themes: Theme[];
  }>({
    queryKey: ['/api/admin/themes'],
  });

  const createThemeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('/api/admin/themes', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/themes'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Theme created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create theme",
        variant: "destructive",
      });
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      return await apiRequest(`/api/admin/themes/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/themes'] });
      setEditingTheme(null);
      resetForm();
      toast({
        title: "Success",
        description: "Theme updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive",
      });
    },
  });

  const deleteThemeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/themes/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/themes'] });
      toast({
        title: "Success",
        description: "Theme deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete theme",
        variant: "destructive",
      });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/themes/${id}/set-default`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/themes'] });
      toast({
        title: "Success",
        description: "Default theme updated",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/themes/${id}/toggle-status`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/themes'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      mode: "light",
      primaryColor: "#0066FF",
      secondaryColor: "#FF6B00",
      accentColor: "#00D4FF",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      fontFamily: "Inter",
    });
  };

  const handleEdit = (theme: Theme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      slug: theme.slug,
      description: theme.description || "",
      mode: theme.mode,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      fontFamily: theme.fontFamily,
    });
  };

  const handleSubmit = () => {
    if (editingTheme) {
      updateThemeMutation.mutate({ id: editingTheme.id, data: formData });
    } else {
      createThemeMutation.mutate(formData);
    }
  };

  const themes = themesData?.themes || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Theme Management</h1>
          <p className="text-muted-foreground">Manage platform themes and customization</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)} 
          data-testid="button-create-theme"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Theme
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading themes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <Card key={theme.id} className="relative overflow-hidden" data-testid={`card-theme-${theme.id}`}>
              <div 
                className="h-24 w-full transition-colors"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 50%, ${theme.accentColor} 100%)` 
                }}
              />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {theme.name}
                      {theme.mode === 'light' ? (
                        <Sun className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Moon className="h-4 w-4 text-blue-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">{theme.displayId}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    {theme.isDefault && (
                      <Badge variant="default" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                    {theme.type === 'system' && (
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        System
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {theme.description && (
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                )}

                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-md border" 
                    style={{ backgroundColor: theme.primaryColor }}
                    title="Primary Color"
                  />
                  <div 
                    className="w-8 h-8 rounded-md border" 
                    style={{ backgroundColor: theme.secondaryColor }}
                    title="Secondary Color"
                  />
                  <div 
                    className="w-8 h-8 rounded-md border" 
                    style={{ backgroundColor: theme.accentColor }}
                    title="Accent Color"
                  />
                  <div 
                    className="w-8 h-8 rounded-md border" 
                    style={{ backgroundColor: theme.backgroundColor }}
                    title="Background Color"
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  Font: {theme.fontFamily} • Used {theme.usageCount} times
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(theme)}
                    data-testid={`button-edit-theme-${theme.id}`}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  {!theme.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDefaultMutation.mutate(theme.id)}
                      data-testid={`button-set-default-${theme.id}`}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Set Default
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleStatusMutation.mutate(theme.id)}
                    data-testid={`button-toggle-status-${theme.id}`}
                  >
                    {theme.isActive ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Button>

                  {theme.type !== 'system' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteThemeMutation.mutate(theme.id)}
                      data-testid={`button-delete-theme-${theme.id}`}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen || !!editingTheme} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingTheme(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTheme ? "Edit Theme" : "Create New Theme"}
            </DialogTitle>
            <DialogDescription>
              {editingTheme ? "Update theme settings" : "Create a new custom theme for your platform"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Theme Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Custom Theme"
                  data-testid="input-theme-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="my-custom-theme"
                  data-testid="input-theme-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the theme"
                data-testid="input-theme-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mode">Mode</Label>
                <Select value={formData.mode} onValueChange={(value) => setFormData({ ...formData, mode: value })}>
                  <SelectTrigger data-testid="select-theme-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Input
                  id="fontFamily"
                  value={formData.fontFamily}
                  onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                  placeholder="Inter"
                  data-testid="input-theme-font"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                    data-testid="input-primary-color"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    placeholder="#0066FF"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                    data-testid="input-secondary-color"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    placeholder="#FF6B00"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                    data-testid="input-accent-color"
                  />
                  <Input
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    placeholder="#00D4FF"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                    data-testid="input-bg-color"
                  />
                  <Input
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    placeholder="#FFFFFF"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="textColor"
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer"
                  data-testid="input-text-color"
                />
                <Input
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  placeholder="#1A1A1A"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingTheme(null);
                resetForm();
              }}
              data-testid="button-cancel-theme"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createThemeMutation.isPending || updateThemeMutation.isPending}
              data-testid="button-save-theme"
            >
              {createThemeMutation.isPending || updateThemeMutation.isPending ? "Saving..." : "Save Theme"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
