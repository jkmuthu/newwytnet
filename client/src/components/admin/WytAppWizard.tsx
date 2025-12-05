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
import { Progress } from "@/components/ui/progress";
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
  ChevronLeft,
  ChevronRight,
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

  // Screen 5: Pricing Models
  pricingModel: z.enum(["free", "one_time", "subscription", "custom"]).default("free"),
  pricingDetails: z.object({
    amount: z.number().optional(),
    currency: z.string().default("INR"),
    interval: z.string().optional(), // 'monthly', 'yearly' for subscription
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
  const [currentStep, setCurrentStep] = useState(1);
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
      version: "1.0.0",
      changelog: "",
    },
  });

  // Load existing app data if editing
  const { data: existingApp, isLoading: isLoadingApp } = useQuery<ExistingAppData>({
    queryKey: ["/api/admin/apps", appId],
    enabled: !!appId && mode === "update" && open,
  });

  // Reset wizard state when dialog closes or appId changes
  useEffect(() => {
    if (!open) {
      // Reset form and step when dialog closes
      setCurrentStep(1);
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
        version: "1.0.0",
        changelog: "",
      });
    }
  }, [open]);

  // Populate form with existing app data when in update mode
  useEffect(() => {
    if (existingApp && mode === "update" && open) {
      console.log("Loading existing app data:", existingApp);
      setCurrentStep(1); // Reset to first step
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
        pricingDetails: existingApp.pricingDetails,
        version: existingApp.version || "1.0.0",
        changelog: existingApp.changelog || "",
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
        wizardCompleted: currentStep === 6,
        wizardStep: currentStep,
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
      if (mode === "create" || currentStep === 6) {
        onClose();
      }
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

  const handleNext = async () => {
    // Validate current step fields
    const fieldsToValidate = getStepFields(currentStep);
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - save everything
        form.handleSubmit((data) => saveMutation.mutate(data))();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    const data = form.getValues();
    saveMutation.mutate(data);
  };

  const progress = (currentStep / 6) * 100;

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
              ? "Build your app step-by-step with our intelligent wizard"
              : `Update your app configuration using the wizard`}
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
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of 6</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between items-center py-4">
          {[
            { num: 1, label: "Basic Info", icon: Package },
            { num: 2, label: "Visibility", icon: Eye },
            { num: 3, label: "Modules", icon: Layers },
            { num: 4, label: "Features", icon: Zap },
            { num: 5, label: "Pricing", icon: DollarSign },
            { num: 6, label: "Version", icon: GitBranch },
          ].map((step) => (
            <div
              key={step.num}
              className={`flex flex-col items-center gap-1 ${
                currentStep === step.num
                  ? "text-primary"
                  : currentStep > step.num
                  ? "text-green-500"
                  : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep === step.num
                    ? "border-primary bg-primary/10"
                    : currentStep > step.num
                    ? "border-green-500 bg-green-500/10"
                    : "border-muted"
                }`}
                data-testid={`wizard-step-indicator-${step.num}`}
              >
                {currentStep > step.num ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs hidden md:block">{step.label}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Form Content */}
        <Form {...form}>
          <form className="space-y-6">
            {currentStep === 1 && <Screen1BasicInfo form={form} onNameChange={handleNameChange} />}
            {currentStep === 2 && <Screen2Visibility form={form} />}
            {currentStep === 3 && <Screen3Modules form={form} />}
            {currentStep === 4 && <Screen4Features form={form} />}
            {currentStep === 5 && <Screen5Pricing form={form} />}
            {currentStep === 6 && <Screen6Versioning form={form} />}
          </form>
        </Form>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              data-testid="wizard-button-previous"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saveMutation.isPending}
              data-testid="wizard-button-save-draft"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Draft
            </Button>

            <Button
              onClick={handleNext}
              disabled={saveMutation.isPending}
              data-testid="wizard-button-next"
            >
              {currentStep === 6 ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  {mode === "create" ? "Create App" : "Update App"}
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get fields to validate for each step
function getStepFields(step: number): (keyof WizardFormData)[] {
  switch (step) {
    case 1:
      return ["name", "slug"];
    case 2:
      return ["visibilityMode"];
    case 3:
      return [];
    case 4:
      return [];
    case 5:
      return ["pricingModel"];
    case 6:
      return ["version"];
    default:
      return [];
  }
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

// Screen 3: AI Module Selection (stub for now)
function Screen3Modules({ form }: { form: any }) {
  const { data: modules } = useQuery({
    queryKey: ["/api/admin/platform-modules"],
  });

  return (
    <div className="space-y-6" data-testid="wizard-screen-3">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          AI Module Selection
        </h3>
        <p className="text-sm text-muted-foreground">
          Select modules for your app. AI will suggest relevant modules based on your app's purpose.
        </p>
      </div>

      <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">AI Suggestions Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Based on your app description, AI will recommend the best modules to include
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FormField
        control={form.control}
        name="moduleIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Modules</FormLabel>
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {Array.isArray(modules) && modules.map((module: any) => (
                <div key={module.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value?.includes(module.id)}
                    onCheckedChange={(checked) => {
                      const newValue = checked
                        ? [...(field.value || []), module.id]
                        : (field.value || []).filter((id: string) => id !== module.id);
                      field.onChange(newValue);
                    }}
                    data-testid={`checkbox-module-${module.id}`}
                  />
                  <Label className="text-sm">{module.name}</Label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// Screen 4: Features (stub)
function Screen4Features({ form }: { form: any }) {
  return (
    <div className="space-y-6" data-testid="wizard-screen-4">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Features
        </h3>
        <p className="text-sm text-muted-foreground">
          Define the key features of your application
        </p>
      </div>

      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Feature management coming in next iteration</p>
          <p className="text-sm mt-2">For now, you can add features manually in the manifest</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Screen 5: Pricing (stub)
function Screen5Pricing({ form }: { form: any }) {
  return (
    <div className="space-y-6" data-testid="wizard-screen-5">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing Model
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose how users will pay for your app
        </p>
      </div>

      <FormField
        control={form.control}
        name="pricingModel"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-2"
                data-testid="radio-group-pricing-model"
              >
                <Card className={`cursor-pointer ${field.value === "free" ? "border-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="free" id="free" />
                      <Label htmlFor="free" className="cursor-pointer font-semibold">
                        Free
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer ${field.value === "one_time" ? "border-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="one_time" id="one_time" />
                      <Label htmlFor="one_time" className="cursor-pointer font-semibold">
                        One-Time Purchase
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer ${field.value === "subscription" ? "border-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="subscription" id="subscription" />
                      <Label htmlFor="subscription" className="cursor-pointer font-semibold">
                        Subscription
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer ${field.value === "custom" ? "border-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="cursor-pointer font-semibold">
                        Custom Pricing
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
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
