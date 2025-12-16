import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ImageUploadCrop } from "./ImageUploadCrop";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Check,
  Sparkles,
  Package,
  Eye,
  Users,
  DollarSign,
  GitBranch,
  Save,
  Brain,
  Globe,
  Lock,
  Building2,
  User,
  Layers,
  Zap,
  X,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Shield,
  FileText,
  Bell,
  Settings,
  Database,
  Cloud,
  Key,
  Mail,
  MessageSquare,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Wallet,
  CreditCard,
  ShoppingCart,
  Tag,
  Star,
  Heart,
  Bookmark,
  Share2,
  Link2,
  QrCode,
  Smartphone,
  Monitor,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Activity,
  Briefcase,
  GraduationCap,
  Building,
  Home,
  Map,
  Navigation,
  Search,
  Filter,
  List,
  Grid,
  Layout,
  Palette,
  Code,
  Terminal,
  FileCode,
  FolderOpen,
} from "lucide-react";

// Wizard schema for all 6 screens
const wizardSchema = z.object({
  // Screen 1: Basic Info
  name: z.string().min(1, "App name is required"),
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().optional(),
  icon: z.string().optional(), // Icon image URL
  image: z.string().optional(), // App logo/image URL
  banner: z.string().optional(), // Banner image URL
  category: z.string().optional(),

  // Screen 2: Visibility & Access Control
  visibilityMode: z.enum(["engine_only", "wytnet_hub", "all_hubs", "selected_hubs", "public"]).default("engine_only"),
  selectedHubs: z.array(z.string()).default([]),
  accessPanels: z.array(z.string()).default([]), // ['user_panel', 'org_panel']

  // Screen 3: AI Module Selection
  moduleIds: z.array(z.string()).default([]),

  // Screen 4: Features
  features: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    enabled: z.boolean().default(true),
  })).default([]),

  // Screen 5: Dynamic Pricing
  pricingModel: z.enum(["free", "one_time", "subscription", "pay_per_use", "custom"]).default("free"),
  appType: z.enum(["core", "premium"]).default("premium"),
  isCoreApp: z.boolean().default(false),
  isAutoAssigned: z.boolean().default(false),
  pricingPlans: z.array(z.object({
    id: z.string().optional(),
    planName: z.string(),
    planSlug: z.string().optional().nullable(),
    planType: z.enum(["free", "monthly", "yearly", "one_time", "pay_per_use"]),
    price: z.string(),
    currency: z.string().default("INR"),
    billingInterval: z.string().optional().nullable(),
    usageLimit: z.number().optional().nullable(),
    usageUnit: z.string().optional().nullable(),
    features: z.any().optional().nullable(),
    isDefault: z.boolean().default(false),
  })).optional().default([]),
  pricingDetails: z.object({
    amount: z.number().optional(),
    currency: z.string().default("INR"),
    interval: z.string().optional(),
  }).optional(),

  // Screen 6: Versioning
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Must be semantic version (e.g., 1.0.0)").default("1.0.0"),
  changelog: z.string().optional(),
});

type WizardFormData = z.infer<typeof wizardSchema>;

// Type for existing app data from API
interface ExistingAppData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  category?: string;
  visibilityMode?: string;
  selectedHubs?: string[];
  accessPanels?: string[];
  moduleIds?: string[];
  features?: Array<{ name: string; description?: string; enabled: boolean }>;
  pricingModel?: string;
  pricingDetails?: {
    amount?: number;
    currency?: string;
    interval?: string;
  };
  version?: string;
  [key: string]: any;
}

interface WytAppWizardProps {
  open: boolean;
  onClose: () => void;
  appId?: string; // If editing existing app
  mode?: "create" | "update";
}

export function WytAppWizard({ open, onClose, appId, mode = "create" }: WytAppWizardProps) {
  const { toast } = useToast();

  const form = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
      image: "",
      banner: "",
      category: "",
      visibilityMode: "engine_only",
      selectedHubs: [],
      accessPanels: [],
      moduleIds: [],
      features: [],
      pricingModel: "free",
      appType: "premium",
      isCoreApp: false,
      isAutoAssigned: false,
      pricingPlans: [],
      version: "1.0.0",
      changelog: "",
    },
  });

  // Load existing app data if editing
  const { data: existingApp, isLoading: isLoadingApp } = useQuery<ExistingAppData>({
    queryKey: ["/api/admin/apps", appId],
    enabled: !!appId && mode === "update" && open,
  });

  // Reset form state when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        slug: "",
        description: "",
        icon: "",
        image: "",
        banner: "",
        category: "",
        visibilityMode: "engine_only",
        selectedHubs: [],
        accessPanels: [],
        moduleIds: [],
        features: [],
        pricingModel: "free",
        appType: "premium",
        isCoreApp: false,
        isAutoAssigned: false,
        pricingPlans: [],
        version: "1.0.0",
        changelog: "",
      });
    }
  }, [open]);

  // Populate form with existing app data when in update mode
  useEffect(() => {
    if (existingApp && mode === "update" && open) {
      console.log("Loading existing app data:", existingApp);
      form.reset({
        name: existingApp.name || "",
        slug: existingApp.slug || "",
        description: existingApp.description || "",
        icon: existingApp.icon || "",
        image: (existingApp as any).image || "",
        banner: (existingApp as any).banner || "",
        category: existingApp.category || "",
        visibilityMode: (existingApp.visibilityMode as any) || "engine_only",
        selectedHubs: existingApp.selectedHubs || [],
        accessPanels: existingApp.accessPanels || [],
        moduleIds: existingApp.moduleIds || [],
        features: existingApp.features || [],
        pricingModel: (existingApp.pricingModel as any) || "free",
        appType: (existingApp as any).appType || "premium",
        isCoreApp: (existingApp as any).isCoreApp || false,
        isAutoAssigned: (existingApp as any).isAutoAssigned || false,
        pricingPlans: (existingApp as any).pricingPlans || [],
        pricingDetails: existingApp.pricingDetails,
        version: existingApp.version || "1.0.0",
        changelog: (existingApp as any).changelog || "",
      });
    }
  }, [existingApp, mode, appId, open]);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    form.setValue("slug", slug);
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: WizardFormData) => {
      const endpoint = mode === "create" 
        ? "/api/admin/apps"
        : `/api/admin/apps/${appId}`;
      
      const method = mode === "create" ? "POST" : "PUT";
      
      const payload = {
        ...data,
        pricingPlans: data.pricingPlans || [],
        wizardCompleted: true,
      };
      
      console.log(`Saving app (${method} ${endpoint}):`, payload);
      
      return await apiRequest(endpoint, method, payload);
    },
    onSuccess: (response) => {
      console.log("Save successful:", response);
      toast({
        title: mode === "create" ? "App Created" : "App Updated",
        description: `WytApp ${mode === "create" ? "created" : "updated"} successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
      onClose();
    },
    onError: (error: any) => {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save app",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    // Ensure pricingPlans is always an array before validation
    const currentPricingPlans = form.getValues("pricingPlans");
    if (!currentPricingPlans || !Array.isArray(currentPricingPlans)) {
      form.setValue("pricingPlans", []);
    }
    form.handleSubmit((data) => saveMutation.mutate(data))();
  };

  // Get the app name for the title (from form or existing data)
  const currentAppName = form.watch("name") || existingApp?.name || "WytApp";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {mode === "create" ? "Create New WytApp" : `Update ${currentAppName}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Configure your app settings across different sections"
              : `Update your app configuration`}
          </DialogDescription>
        </DialogHeader>
        
        {/* Loading state for update mode */}
        {mode === "update" && isLoadingApp ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading app data...</span>
          </div>
        ) : (
          <>
            {/* Tab-based Editor */}
            <Form {...form}>
              <form className="space-y-6">
                <Tabs defaultValue="basic-info" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="basic-info" className="flex items-center gap-1" data-testid="tab-basic-info">
                      <Package className="h-4 w-4" />
                      <span className="hidden md:inline">Basic</span>
                    </TabsTrigger>
                    <TabsTrigger value="visibility" className="flex items-center gap-1" data-testid="tab-visibility">
                      <Eye className="h-4 w-4" />
                      <span className="hidden md:inline">Visibility</span>
                    </TabsTrigger>
                    <TabsTrigger value="modules" className="flex items-center gap-1" data-testid="tab-modules">
                      <Layers className="h-4 w-4" />
                      <span className="hidden md:inline">Modules</span>
                    </TabsTrigger>
                    <TabsTrigger value="features" className="flex items-center gap-1" data-testid="tab-features">
                      <Zap className="h-4 w-4" />
                      <span className="hidden md:inline">Features</span>
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="flex items-center gap-1" data-testid="tab-pricing">
                      <DollarSign className="h-4 w-4" />
                      <span className="hidden md:inline">Pricing</span>
                    </TabsTrigger>
                    <TabsTrigger value="version" className="flex items-center gap-1" data-testid="tab-version">
                      <GitBranch className="h-4 w-4" />
                      <span className="hidden md:inline">Version</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-6">
                    <TabsContent value="basic-info">
                      <Screen1BasicInfo form={form} onNameChange={handleNameChange} />
                    </TabsContent>
                    <TabsContent value="visibility">
                      <Screen2Visibility form={form} />
                    </TabsContent>
                    <TabsContent value="modules">
                      <Screen3Modules form={form} />
                    </TabsContent>
                    <TabsContent value="features">
                      <Screen4Features form={form} />
                    </TabsContent>
                    <TabsContent value="pricing">
                      <Screen5Pricing form={form} />
                    </TabsContent>
                    <TabsContent value="version">
                      <Screen6Versioning form={form} />
                    </TabsContent>
                  </div>
                </Tabs>
              </form>
            </Form>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="button"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                data-testid="button-save-app"
              >
                <Save className="h-4 w-4 mr-1" />
                {saveMutation.isPending ? "Saving..." : (mode === "create" ? "Create App" : "Save Changes")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Inline Editor Component (for full-page editing without popup)
interface WytAppEditorProps {
  appId?: string;
  mode?: "create" | "update";
  onClose: () => void;
  onSave?: () => void;
}

export function WytAppEditor({ appId, mode = "create", onClose, onSave }: WytAppEditorProps) {
  const { toast } = useToast();

  const form = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
      image: "",
      banner: "",
      category: "",
      visibilityMode: "engine_only",
      selectedHubs: [],
      accessPanels: [],
      moduleIds: [],
      features: [],
      pricingModel: "free",
      appType: "premium",
      isCoreApp: false,
      isAutoAssigned: false,
      pricingPlans: [],
      version: "1.0.0",
      changelog: "",
    },
  });

  const { data: existingApp, isLoading: isLoadingApp } = useQuery<ExistingAppData>({
    queryKey: ["/api/admin/apps", appId],
    enabled: !!appId && mode === "update",
  });

  useEffect(() => {
    if (existingApp && mode === "update") {
      console.log("Loading existing app data:", existingApp);
      form.reset({
        name: existingApp.name || "",
        slug: existingApp.slug || "",
        description: existingApp.description || "",
        icon: existingApp.icon || "",
        image: (existingApp as any).image || "",
        banner: (existingApp as any).banner || "",
        category: existingApp.category || "",
        visibilityMode: (existingApp.visibilityMode as any) || "engine_only",
        selectedHubs: existingApp.selectedHubs || [],
        accessPanels: existingApp.accessPanels || [],
        moduleIds: existingApp.moduleIds || [],
        features: existingApp.features || [],
        pricingModel: (existingApp.pricingModel as any) || "free",
        appType: (existingApp as any).appType || "premium",
        isCoreApp: (existingApp as any).isCoreApp || false,
        isAutoAssigned: (existingApp as any).isAutoAssigned || false,
        pricingPlans: (existingApp as any).pricingPlans || [],
        pricingDetails: existingApp.pricingDetails,
        version: existingApp.version || "1.0.0",
        changelog: (existingApp as any).changelog || "",
      });
    }
  }, [existingApp, mode, appId]);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    form.setValue("slug", slug);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: WizardFormData) => {
      const endpoint = mode === "create" 
        ? "/api/admin/apps"
        : `/api/admin/apps/${appId}`;
      
      const method = mode === "create" ? "POST" : "PUT";
      
      const payload = {
        ...data,
        pricingPlans: data.pricingPlans || [],
        wizardCompleted: true,
      };
      
      console.log(`Saving app (${method} ${endpoint}):`, payload);
      
      return await apiRequest(endpoint, method, payload);
    },
    onSuccess: (response) => {
      console.log("Save successful:", response);
      toast({
        title: mode === "create" ? "App Created" : "App Updated",
        description: `WytApp ${mode === "create" ? "created" : "updated"} successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
      onSave?.();
      onClose();
    },
    onError: (error: any) => {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save app",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    // Ensure pricingPlans is always an array before validation
    const currentPricingPlans = form.getValues("pricingPlans");
    if (!currentPricingPlans || !Array.isArray(currentPricingPlans)) {
      form.setValue("pricingPlans", []);
    }
    
    form.handleSubmit(
      (data) => {
        console.log("Form valid, saving data:", data);
        saveMutation.mutate(data);
      },
      (errors) => {
        console.error("Form validation errors:", errors);
        const errorMessages = Object.entries(errors)
          .map(([field, error]) => `${field}: ${(error as any)?.message}`)
          .join(", ");
        toast({
          title: "Validation Error",
          description: errorMessages || "Please check form fields",
          variant: "destructive",
        });
      }
    )();
  };

  const currentAppName = form.watch("name") || existingApp?.name || "WytApp";

  if (mode === "update" && isLoadingApp) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading app data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-back">
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-semibold">
              {mode === "create" ? "Create New WytApp" : `Edit: ${currentAppName}`}
            </h2>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={saveMutation.isPending}
          data-testid="button-save-app"
        >
          <Save className="h-4 w-4 mr-1" />
          {saveMutation.isPending ? "Saving..." : (mode === "create" ? "Create App" : "Save Changes")}
        </Button>
      </div>

      <Separator />

      {/* Tab-based Editor */}
      <Form {...form}>
        <form className="space-y-6">
          <Tabs defaultValue="basic-info" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic-info" className="flex items-center gap-1" data-testid="tab-basic-info">
                <Package className="h-4 w-4" />
                <span className="hidden md:inline">Basic</span>
              </TabsTrigger>
              <TabsTrigger value="visibility" className="flex items-center gap-1" data-testid="tab-visibility">
                <Eye className="h-4 w-4" />
                <span className="hidden md:inline">Visibility</span>
              </TabsTrigger>
              <TabsTrigger value="modules" className="flex items-center gap-1" data-testid="tab-modules">
                <Layers className="h-4 w-4" />
                <span className="hidden md:inline">Modules</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-1" data-testid="tab-features">
                <Zap className="h-4 w-4" />
                <span className="hidden md:inline">Features</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-1" data-testid="tab-pricing">
                <DollarSign className="h-4 w-4" />
                <span className="hidden md:inline">Pricing</span>
              </TabsTrigger>
              <TabsTrigger value="version" className="flex items-center gap-1" data-testid="tab-version">
                <GitBranch className="h-4 w-4" />
                <span className="hidden md:inline">Version</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="basic-info">
                <Screen1BasicInfo form={form} onNameChange={handleNameChange} />
              </TabsContent>
              <TabsContent value="visibility">
                <Screen2Visibility form={form} />
              </TabsContent>
              <TabsContent value="modules">
                <Screen3Modules form={form} />
              </TabsContent>
              <TabsContent value="features">
                <Screen4Features form={form} />
              </TabsContent>
              <TabsContent value="pricing">
                <Screen5Pricing form={form} />
              </TabsContent>
              <TabsContent value="version">
                <Screen6Versioning form={form} />
              </TabsContent>
            </div>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

// Lucide Icon Picker Component
const ICON_OPTIONS = [
  { name: "package", icon: Package, label: "Package" },
  { name: "shield", icon: Shield, label: "Shield" },
  { name: "file-text", icon: FileText, label: "Document" },
  { name: "bell", icon: Bell, label: "Notifications" },
  { name: "settings", icon: Settings, label: "Settings" },
  { name: "database", icon: Database, label: "Database" },
  { name: "cloud", icon: Cloud, label: "Cloud" },
  { name: "key", icon: Key, label: "Key" },
  { name: "mail", icon: Mail, label: "Mail" },
  { name: "message-square", icon: MessageSquare, label: "Chat" },
  { name: "calendar", icon: Calendar, label: "Calendar" },
  { name: "bar-chart", icon: BarChart3, label: "Analytics" },
  { name: "pie-chart", icon: PieChart, label: "Reports" },
  { name: "trending-up", icon: TrendingUp, label: "Growth" },
  { name: "wallet", icon: Wallet, label: "Wallet" },
  { name: "credit-card", icon: CreditCard, label: "Payments" },
  { name: "shopping-cart", icon: ShoppingCart, label: "Cart" },
  { name: "tag", icon: Tag, label: "Tag" },
  { name: "star", icon: Star, label: "Star" },
  { name: "heart", icon: Heart, label: "Favorite" },
  { name: "bookmark", icon: Bookmark, label: "Bookmark" },
  { name: "share", icon: Share2, label: "Share" },
  { name: "link", icon: Link2, label: "Link" },
  { name: "qr-code", icon: QrCode, label: "QR Code" },
  { name: "smartphone", icon: Smartphone, label: "Mobile" },
  { name: "monitor", icon: Monitor, label: "Desktop" },
  { name: "server", icon: Server, label: "Server" },
  { name: "cpu", icon: Cpu, label: "Processing" },
  { name: "hard-drive", icon: HardDrive, label: "Storage" },
  { name: "wifi", icon: Wifi, label: "Network" },
  { name: "activity", icon: Activity, label: "Activity" },
  { name: "briefcase", icon: Briefcase, label: "Business" },
  { name: "graduation-cap", icon: GraduationCap, label: "Education" },
  { name: "building", icon: Building, label: "Organization" },
  { name: "home", icon: Home, label: "Home" },
  { name: "map", icon: Map, label: "Map" },
  { name: "navigation", icon: Navigation, label: "Navigation" },
  { name: "search", icon: Search, label: "Search" },
  { name: "filter", icon: Filter, label: "Filter" },
  { name: "list", icon: List, label: "List" },
  { name: "grid", icon: Grid, label: "Grid" },
  { name: "layout", icon: Layout, label: "Layout" },
  { name: "palette", icon: Palette, label: "Design" },
  { name: "code", icon: Code, label: "Code" },
  { name: "terminal", icon: Terminal, label: "Terminal" },
  { name: "file-code", icon: FileCode, label: "Script" },
  { name: "folder", icon: FolderOpen, label: "Folder" },
  { name: "users", icon: Users, label: "Users" },
  { name: "user", icon: User, label: "User" },
  { name: "lock", icon: Lock, label: "Security" },
  { name: "globe", icon: Globe, label: "Web" },
  { name: "zap", icon: Zap, label: "Power" },
  { name: "layers", icon: Layers, label: "Layers" },
  { name: "eye", icon: Eye, label: "View" },
  { name: "sparkles", icon: Sparkles, label: "AI" },
];

function LucideIconPicker({ 
  value, 
  onChange 
}: { 
  value?: string; 
  onChange: (iconName: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredIcons = ICON_OPTIONS.filter(icon => 
    icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedIcon = ICON_OPTIONS.find(i => i.name === value);
  const IconComponent = selectedIcon?.icon || Package;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div 
          className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${
            value ? 'border-primary bg-primary/10' : 'border-dashed border-muted-foreground/30 hover:border-primary/50'
          }`}
          onClick={() => setIsOpen(!isOpen)}
          data-testid="button-select-icon"
        >
          <IconComponent className={`h-8 w-8 ${value ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{selectedIcon?.label || 'Select an icon'}</p>
          <p className="text-xs text-muted-foreground">Click to choose from library</p>
        </div>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            data-testid="button-clear-icon"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="mt-2">
          <CardContent className="p-3">
            <Input
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-3"
              data-testid="input-search-icons"
            />
            <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
              {filteredIcons.map((iconOption) => {
                const Icon = iconOption.icon;
                return (
                  <div
                    key={iconOption.name}
                    className={`p-2 rounded-lg cursor-pointer transition-all flex items-center justify-center ${
                      value === iconOption.name 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      onChange(iconOption.name);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    title={iconOption.label}
                    data-testid={`icon-option-${iconOption.name}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Screen 1: Basic Info - Improved Layout
function Screen1BasicInfo({ form, onNameChange }: { form: any; onNameChange: (name: string) => void }) {
  const [visualAssetsOpen, setVisualAssetsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const slugValue = form.watch("slug");
  const descriptionValue = form.watch("description") || "";
  const MAX_DESCRIPTION_LENGTH = 500;
  
  const fullUrl = slugValue ? `wytnet.com/apps/${slugValue}` : "wytnet.com/apps/your-app-slug";
  
  const copyUrl = () => {
    navigator.clipboard.writeText(`https://${fullUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" data-testid="wizard-screen-1">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Basic Information
        </h3>
        <p className="text-sm text-muted-foreground">
          Let's start with the essentials. Give your app a name and description.
        </p>
      </div>

      {/* Two Column Layout for Name/Slug and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>App Name *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Invoice Generator"
                    onChange={(e) => {
                      field.onChange(e);
                      onNameChange(e.target.value);
                    }}
                    data-testid="input-app-name"
                  />
                </FormControl>
                <FormDescription>
                  A clear, descriptive name for your application
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Slug *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="invoice-generator"
                    data-testid="input-app-slug"
                  />
                </FormControl>
                <FormDescription>
                  Auto-generated from name. Used in URLs (lowercase, hyphens only)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* URL Preview */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <code className="text-sm flex-1 truncate">{fullUrl}</code>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copyUrl}
              className="flex-shrink-0"
              data-testid="button-copy-url"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <CategorySelector 
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Icon Selection */}
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>App Icon</FormLabel>
                <LucideIconPicker
                  value={field.value || ""}
                  onChange={field.onChange}
                />
                <FormDescription>
                  Choose an icon from the library or upload a custom one below
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Description - Full Width with Character Counter */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Description</FormLabel>
              <span className={`text-xs ${
                descriptionValue.length > MAX_DESCRIPTION_LENGTH 
                  ? 'text-red-500' 
                  : 'text-muted-foreground'
              }`}>
                {descriptionValue.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Describe what your app does, its key features, and who it's for..."
                rows={3}
                className="resize-none"
                data-testid="textarea-app-description"
              />
            </FormControl>
            <FormDescription>
              Help users understand your app's purpose and features
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      {/* Collapsible Visual Assets Section */}
      <Collapsible open={visualAssetsOpen} onOpenChange={setVisualAssetsOpen}>
        <CollapsibleTrigger asChild>
          <div 
            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
            data-testid="collapsible-visual-assets"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-md font-semibold">Visual Assets</h4>
                <p className="text-sm text-muted-foreground">
                  Add custom images for logo and banner (optional)
                </p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${visualAssetsOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-card">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App Logo</FormLabel>
                  <FormDescription className="text-xs">
                    Primary logo (recommended: 1200x600px)
                  </FormDescription>
                  <ImageUploadCrop
                    value={field.value || ""}
                    onChange={field.onChange}
                    aspectRatio={2}
                    label="Upload Logo"
                    width={180}
                    height={90}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="banner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image</FormLabel>
                  <FormDescription className="text-xs">
                    Wide banner for marketing (recommended: 1920x600px)
                  </FormDescription>
                  <ImageUploadCrop
                    value={field.value || ""}
                    onChange={field.onChange}
                    aspectRatio={16/5}
                    label="Upload Banner"
                    width={180}
                    height={56}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Category Selector with instant creation
function CategorySelector({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const categories = [
    "productivity",
    "finance",
    "communication",
    "utilities",
    "developer",
    "ai-tools",
    "core-platform",
    "social",
    "business",
    "education",
    "storage",
    "web-development"
  ];

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-');
      onChange(slug);
      setNewCategoryName("");
      setShowNewCategory(false);
    }
  };

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger data-testid="select-app-category">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </SelectItem>
          ))}
          <Separator className="my-2" />
          <div 
            className="px-2 py-1.5 text-sm hover:bg-accent cursor-pointer rounded-sm flex items-center gap-2"
            onClick={() => setShowNewCategory(true)}
          >
            <Sparkles className="h-4 w-4" />
            Add New Category
          </div>
        </SelectContent>
      </Select>

      {showNewCategory && (
        <div className="flex gap-2">
          <Input
            placeholder="Enter category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <Button type="button" size="sm" onClick={handleAddCategory}>
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setShowNewCategory(false);
              setNewCategoryName("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Screen 2: Visibility & Access Control
function Screen2Visibility({ form }: { form: any }) {
  const visibilityMode = form.watch("visibilityMode");

  return (
    <div className="space-y-6" data-testid="wizard-screen-2">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Visibility & Access Control
        </h3>
        <p className="text-sm text-muted-foreground">
          Control where your app appears and who can access it
        </p>
      </div>

      <FormField
        control={form.control}
        name="visibilityMode"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Visibility Mode *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-3"
                data-testid="radio-group-visibility-mode"
              >
                <Card className={`cursor-pointer ${field.value === "engine_only" ? "border-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="engine_only" id="engine_only" />
                      <div className="flex-1">
                        <Label htmlFor="engine_only" className="flex items-center gap-2 cursor-pointer">
                          <Lock className="h-4 w-4" />
                          <span className="font-semibold">Engine Only</span>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Available only in Engine Admin panel (Super Admin)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer ${field.value === "wytnet_hub" ? "border-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="wytnet_hub" id="wytnet_hub" />
                      <div className="flex-1">
                        <Label htmlFor="wytnet_hub" className="flex items-center gap-2 cursor-pointer">
                          <Building2 className="h-4 w-4" />
                          <span className="font-semibold">WytNet Hub</span>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Available in WytNet.com hub only
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer ${field.value === "all_hubs" ? "border-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="all_hubs" id="all_hubs" />
                      <div className="flex-1">
                        <Label htmlFor="all_hubs" className="flex items-center gap-2 cursor-pointer">
                          <Globe className="h-4 w-4" />
                          <span className="font-semibold">All Hubs</span>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Available across all platform hubs
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer ${field.value === "selected_hubs" ? "border-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="selected_hubs" id="selected_hubs" />
                      <div className="flex-1">
                        <Label htmlFor="selected_hubs" className="flex items-center gap-2 cursor-pointer">
                          <Layers className="h-4 w-4" />
                          <span className="font-semibold">Selected Hubs</span>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Choose specific hubs where app is available
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer ${field.value === "public" ? "border-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="public" id="public" />
                      <div className="flex-1">
                        <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                          <Users className="h-4 w-4" />
                          <span className="font-semibold">Public</span>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Publicly accessible to all users (no login required)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {visibilityMode === "selected_hubs" && (
        <FormField
          control={form.control}
          name="selectedHubs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Hubs</FormLabel>
              <div className="space-y-2">
                {["wytnet", "ownernet", "devhub", "marketplace"].map((hub) => (
                  <div key={hub} className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value?.includes(hub)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...(field.value || []), hub]
                          : (field.value || []).filter((h: string) => h !== hub);
                        field.onChange(newValue);
                      }}
                      data-testid={`checkbox-hub-${hub}`}
                    />
                    <Label className="capitalize">{hub}</Label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <Separator />

      <FormField
        control={form.control}
        name="accessPanels"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Panel Access</FormLabel>
            <FormDescription>
              Allow users to access this app from their personal or organization panels
            </FormDescription>
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value?.includes("user_panel")}
                  onCheckedChange={(checked) => {
                    const newValue = checked
                      ? [...(field.value || []), "user_panel"]
                      : (field.value || []).filter((p: string) => p !== "user_panel");
                    field.onChange(newValue);
                  }}
                  data-testid="checkbox-panel-user"
                />
                <Label>
                  <User className="h-4 w-4 inline mr-1" />
                  User Panel (My WytApps)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value?.includes("org_panel")}
                  onCheckedChange={(checked) => {
                    const newValue = checked
                      ? [...(field.value || []), "org_panel"]
                      : (field.value || []).filter((p: string) => p !== "org_panel");
                    field.onChange(newValue);
                  }}
                  data-testid="checkbox-panel-org"
                />
                <Label>
                  <Building2 className="h-4 w-4 inline mr-1" />
                  Organization Panel (Team Collaboration)
                </Label>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// Screen 3: Module Selection
function Screen3Modules({ form }: { form: any }) {
  const { data: modulesResponse, isLoading } = useQuery({
    queryKey: ["/api/admin/platform-modules"],
  });
  
  const modules = (modulesResponse as any)?.modules || [];
  const selectedModules = form.watch("moduleIds") || [];

  return (
    <div className="space-y-6" data-testid="wizard-screen-3">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-500" />
          Module Selection
        </h3>
        <p className="text-sm text-muted-foreground">
          Select platform modules to include in your app. Each module adds specific functionality.
        </p>
      </div>

      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <span className="text-sm font-medium">Selected Modules</span>
        <Badge variant="secondary">{selectedModules.length} selected</Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Loading modules...</span>
        </div>
      ) : modules.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No platform modules available</p>
            <p className="text-sm mt-1">Create modules in the Modules section first</p>
          </CardContent>
        </Card>
      ) : (
        <FormField
          control={form.control}
          name="moduleIds"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {modules.map((module: any) => {
                  const isSelected = field.value?.includes(module.id);
                  return (
                    <Card 
                      key={module.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                      onClick={() => {
                        const newValue = isSelected
                          ? (field.value || []).filter((id: string) => id !== module.id)
                          : [...(field.value || []), module.id];
                        field.onChange(newValue);
                      }}
                      data-testid={`card-module-${module.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}>
                            {isSelected ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <span className="text-lg">{module.icon || "📦"}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{module.name}</p>
                              {module.category && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {module.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {module.description || "No description available"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}

// Screen 4: Features
function Screen4Features({ form }: { form: any }) {
  const defaultFeatures = [
    { id: "offline", name: "Offline Support", description: "Allow app to work without internet connection", icon: Wifi },
    { id: "notifications", name: "Push Notifications", description: "Send notifications to users", icon: Bell },
    { id: "analytics", name: "Analytics", description: "Track user behavior and app usage", icon: BarChart3 },
    { id: "export", name: "Data Export", description: "Allow users to export their data", icon: FileText },
    { id: "api", name: "API Access", description: "Provide API endpoints for external integrations", icon: Code },
    { id: "realtime", name: "Real-time Updates", description: "Live data synchronization across devices", icon: Activity },
    { id: "sharing", name: "Sharing", description: "Allow users to share content", icon: Share2 },
    { id: "search", name: "Search", description: "Full-text search functionality", icon: Search },
    { id: "multiuser", name: "Multi-user", description: "Support for team collaboration", icon: Users },
    { id: "customization", name: "Customization", description: "Allow users to customize their experience", icon: Palette },
  ];

  const features = form.watch("features") || [];

  const toggleFeature = (featureId: string, featureName: string, featureDescription: string) => {
    const existingIndex = features.findIndex((f: any) => f.name === featureName);
    if (existingIndex >= 0) {
      const newFeatures = features.filter((_: any, i: number) => i !== existingIndex);
      form.setValue("features", newFeatures);
    } else {
      form.setValue("features", [...features, { name: featureName, description: featureDescription, enabled: true }]);
    }
  };

  const isFeatureEnabled = (featureName: string) => {
    return features.some((f: any) => f.name === featureName && f.enabled);
  };

  return (
    <div className="space-y-6" data-testid="wizard-screen-4">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          App Features
        </h3>
        <p className="text-sm text-muted-foreground">
          Enable the capabilities your app will support
        </p>
      </div>

      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <span className="text-sm font-medium">Enabled Features</span>
        <Badge variant="secondary">{features.filter((f: any) => f.enabled).length} enabled</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {defaultFeatures.map((feature) => {
          const isEnabled = isFeatureEnabled(feature.name);
          const IconComponent = feature.icon;
          return (
            <Card 
              key={feature.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isEnabled ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "hover:border-primary/50"
              }`}
              onClick={() => toggleFeature(feature.id, feature.name, feature.description)}
              data-testid={`card-feature-${feature.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isEnabled ? "bg-green-500 text-white" : "bg-muted"
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{feature.name}</p>
                      {isEnabled && <Check className="h-4 w-4 text-green-600" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {features.length > 0 && (
        <Card className="bg-muted/30">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Custom Features</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex flex-wrap gap-2">
              {features.filter((f: any) => f.enabled).map((feature: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  <Check className="h-3 w-3" />
                  {feature.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Screen 5: Dynamic Pricing with Plans
function Screen5Pricing({ form }: { form: any }) {
  const pricingPlans = form.watch("pricingPlans") || [];
  const pricingModel = form.watch("pricingModel");
  const isCoreApp = form.watch("isCoreApp");

  const addPlan = (planType: string) => {
    const newPlan = {
      planName: planType === "free" ? "Free" : planType === "monthly" ? "Monthly" : planType === "yearly" ? "Yearly" : "Pay Per Use",
      planSlug: planType,
      planType: planType,
      price: planType === "free" ? "0" : "10",
      currency: "INR",
      isDefault: pricingPlans.length === 0,
    };
    form.setValue("pricingPlans", [...pricingPlans, newPlan]);
  };

  const updatePlan = (index: number, field: string, value: any) => {
    const updated = [...pricingPlans];
    updated[index] = { ...updated[index], [field]: value };
    form.setValue("pricingPlans", updated);
  };

  const removePlan = (index: number) => {
    const updated = pricingPlans.filter((_: any, i: number) => i !== index);
    form.setValue("pricingPlans", updated);
  };

  return (
    <div className="space-y-6" data-testid="wizard-screen-5">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Dynamic Pricing
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure pricing plans for your app. Changes are tracked with full audit trail.
        </p>
      </div>

      {/* App Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${isCoreApp ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "hover:border-primary/50"}`}
          onClick={() => {
            form.setValue("isCoreApp", true);
            form.setValue("isAutoAssigned", true);
            form.setValue("appType", "core");
            form.setValue("pricingModel", "free");
            form.setValue("pricingPlans", [{ planName: "Free", planSlug: "free", planType: "free", price: "0", currency: "INR", isDefault: true }]);
          }}
          data-testid="card-core-app"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Core App</p>
                <p className="text-xs text-muted-foreground">Free & auto-assigned to all users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${!isCoreApp ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "hover:border-primary/50"}`}
          onClick={() => {
            form.setValue("isCoreApp", false);
            form.setValue("isAutoAssigned", false);
            form.setValue("appType", "premium");
          }}
          data-testid="card-premium-app"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Premium App</p>
                <p className="text-xs text-muted-foreground">Configurable pricing plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans */}
      {!isCoreApp && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Pricing Plans</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => addPlan("free")} data-testid="button-add-free-plan">
                + Free
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => addPlan("monthly")} data-testid="button-add-monthly-plan">
                + Monthly
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => addPlan("yearly")} data-testid="button-add-yearly-plan">
                + Yearly
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => addPlan("pay_per_use")} data-testid="button-add-payperuse-plan">
                + Pay Per Use
              </Button>
            </div>
          </div>

          {pricingPlans.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-muted-foreground">
                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No pricing plans configured</p>
                <p className="text-sm">Add plans using the buttons above</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pricingPlans.map((plan: any, index: number) => (
                <Card key={index} className="relative">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-4 items-end">
                      <div>
                        <Label className="text-xs">Plan Name</Label>
                        <Input
                          value={plan.planName}
                          onChange={(e) => updatePlan(index, "planName", e.target.value)}
                          placeholder="Plan name"
                          data-testid={`input-plan-name-${index}`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select value={plan.planType} onValueChange={(v) => updatePlan(index, "planType", v)}>
                          <SelectTrigger data-testid={`select-plan-type-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                            <SelectItem value="one_time">One-Time</SelectItem>
                            <SelectItem value="pay_per_use">Pay Per Use</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Price (₹)</Label>
                        <Input
                          type="number"
                          value={plan.price}
                          onChange={(e) => updatePlan(index, "price", e.target.value)}
                          placeholder="0"
                          disabled={plan.planType === "free"}
                          data-testid={`input-plan-price-${index}`}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removePlan(index)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`button-remove-plan-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pricing Summary */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Activity className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Pricing Audit Trail</p>
              <p className="text-xs text-muted-foreground">
                All pricing changes are automatically tracked with previous/new values, timestamps, and who made the change.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Screen 6: Versioning
function Screen6Versioning({ form }: { form: any }) {
  return (
    <div className="space-y-6" data-testid="wizard-screen-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Version & Release
        </h3>
        <p className="text-sm text-muted-foreground">
          Set the version number and describe what's new
        </p>
      </div>

      <FormField
        control={form.control}
        name="version"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Version *</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="1.0.0"
                data-testid="input-version"
              />
            </FormControl>
            <FormDescription>
              Semantic versioning (MAJOR.MINOR.PATCH)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="changelog"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Changelog</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="What's new in this version?"
                rows={6}
                data-testid="textarea-changelog"
              />
            </FormControl>
            <FormDescription>
              Document new features, improvements, and bug fixes
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Ready to Launch</p>
              <p className="text-sm text-muted-foreground">
                You've completed all wizard steps. Click "Create App" to finalize.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
