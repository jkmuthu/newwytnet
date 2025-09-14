import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SeoSetting, InsertSeoSetting } from "@shared/schema";
import { Globe, Image, Search, Twitter, FileText, Code } from "lucide-react";

export default function SeoSettings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<InsertSeoSetting>>({
    siteName: "",
    siteDescription: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    faviconUrl: "",
    ogImageUrl: "",
    ogTitle: "",
    ogDescription: "",
    twitterHandle: "",
    twitterCardType: "summary_large_image",
    canonicalUrl: "",
    robotsMeta: "index, follow",
    structuredData: {},
    customHeadTags: "",
    isActive: true
  });

  // Fetch current SEO settings
  const { data: seoSettings, isLoading } = useQuery<SeoSetting>({
    queryKey: ["/api/admin/seo-settings"]
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (seoSettings) {
      setFormData({
        ...seoSettings,
        structuredData: seoSettings.structuredData || {}
      });
    }
  }, [seoSettings]);

  // Update SEO settings mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<InsertSeoSetting>) => 
      apiRequest("/api/admin/seo-settings", "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo-settings"] });
      toast({
        title: "SEO Settings Updated",
        description: "Your SEO settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update SEO settings",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof InsertSeoSetting, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">SEO Settings</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Settings</h1>
          <p className="text-muted-foreground">
            Manage your website's SEO, social media, and metadata settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={formData.isActive ? "default" : "secondary"}>
            {formData.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="meta" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Meta Tags
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Configure your website's basic information and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      placeholder="Your Website Name"
                      value={formData.siteName || ""}
                      onChange={(e) => handleInputChange("siteName", e.target.value)}
                      data-testid="input-site-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="canonicalUrl">Canonical URL</Label>
                    <Input
                      id="canonicalUrl"
                      placeholder="https://example.com"
                      value={formData.canonicalUrl || ""}
                      onChange={(e) => handleInputChange("canonicalUrl", e.target.value)}
                      data-testid="input-canonical-url"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    placeholder="Brief description of your website"
                    value={formData.siteDescription || ""}
                    onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                    rows={3}
                    data-testid="textarea-site-description"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive || false}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                    data-testid="switch-is-active"
                  />
                  <Label htmlFor="isActive">Enable SEO Settings</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meta" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Meta Tags & Search Engine Optimization
                </CardTitle>
                <CardDescription>
                  Configure meta tags for better search engine visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="Page title for search engines"
                    value={formData.metaTitle || ""}
                    onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                    data-testid="input-meta-title"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: 50-60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Brief description for search engine results"
                    value={formData.metaDescription || ""}
                    onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                    rows={3}
                    data-testid="textarea-meta-description"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: 150-160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input
                    id="metaKeywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={formData.metaKeywords || ""}
                    onChange={(e) => handleInputChange("metaKeywords", e.target.value)}
                    data-testid="input-meta-keywords"
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate keywords with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="robotsMeta">Robots Meta</Label>
                  <Input
                    id="robotsMeta"
                    placeholder="index, follow"
                    value={formData.robotsMeta || ""}
                    onChange={(e) => handleInputChange("robotsMeta", e.target.value)}
                    data-testid="input-robots-meta"
                  />
                  <p className="text-sm text-muted-foreground">
                    Controls how search engines crawl your site
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="h-5 w-5" />
                  Social Media & Open Graph
                </CardTitle>
                <CardDescription>
                  Configure how your content appears when shared on social media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ogTitle">Open Graph Title</Label>
                    <Input
                      id="ogTitle"
                      placeholder="Title for social media sharing"
                      value={formData.ogTitle || ""}
                      onChange={(e) => handleInputChange("ogTitle", e.target.value)}
                      data-testid="input-og-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitterHandle">Twitter Handle</Label>
                    <Input
                      id="twitterHandle"
                      placeholder="@yourusername"
                      value={formData.twitterHandle || ""}
                      onChange={(e) => handleInputChange("twitterHandle", e.target.value)}
                      data-testid="input-twitter-handle"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ogDescription">Open Graph Description</Label>
                  <Textarea
                    id="ogDescription"
                    placeholder="Description for social media sharing"
                    value={formData.ogDescription || ""}
                    onChange={(e) => handleInputChange("ogDescription", e.target.value)}
                    rows={3}
                    data-testid="textarea-og-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterCardType">Twitter Card Type</Label>
                  <select
                    id="twitterCardType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.twitterCardType || "summary_large_image"}
                    onChange={(e) => handleInputChange("twitterCardType", e.target.value)}
                    data-testid="select-twitter-card-type"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary with Large Image</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Images & Media
                </CardTitle>
                <CardDescription>
                  Upload and configure images for your website and social media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input
                    id="faviconUrl"
                    placeholder="https://example.com/favicon.ico"
                    value={formData.faviconUrl || ""}
                    onChange={(e) => handleInputChange("faviconUrl", e.target.value)}
                    data-testid="input-favicon-url"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: 32x32px or 16x16px ICO file
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ogImageUrl">Open Graph Image URL</Label>
                  <Input
                    id="ogImageUrl"
                    placeholder="https://example.com/og-image.jpg"
                    value={formData.ogImageUrl || ""}
                    onChange={(e) => handleInputChange("ogImageUrl", e.target.value)}
                    data-testid="input-og-image-url"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: 1200x630px for optimal social media display
                  </p>
                </div>

                {formData.faviconUrl && (
                  <div className="p-4 border rounded-lg">
                    <Label className="text-sm font-medium">Favicon Preview</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <img 
                        src={formData.faviconUrl} 
                        alt="Favicon" 
                        className="w-8 h-8"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {formData.siteName || "Your Website"}
                      </span>
                    </div>
                  </div>
                )}

                {formData.ogImageUrl && (
                  <div className="p-4 border rounded-lg">
                    <Label className="text-sm font-medium">Open Graph Preview</Label>
                    <div className="mt-2 max-w-md">
                      <img 
                        src={formData.ogImageUrl} 
                        alt="OG Image" 
                        className="w-full h-auto rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="font-medium text-sm">
                          {formData.ogTitle || formData.metaTitle || "Title"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formData.ogDescription || formData.metaDescription || "Description"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>
                  Configure structured data and custom HTML head tags
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customHeadTags">Custom Head Tags</Label>
                  <Textarea
                    id="customHeadTags"
                    placeholder='<meta name="custom" content="value">'
                    value={formData.customHeadTags || ""}
                    onChange={(e) => handleInputChange("customHeadTags", e.target.value)}
                    rows={5}
                    className="font-mono text-sm"
                    data-testid="textarea-custom-head-tags"
                  />
                  <p className="text-sm text-muted-foreground">
                    Add custom HTML tags to the &lt;head&gt; section
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Structured Data (JSON-LD)</Label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Coming soon: Visual structured data editor for rich snippets
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      <FileText className="h-4 w-4 mr-2" />
                      Configure Structured Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="min-w-[120px]"
              data-testid="button-save-seo-settings"
            >
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  );
}