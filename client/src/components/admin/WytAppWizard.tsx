import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  ChevronLeft,
  ChevronRight,
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
} from "lucide-react";

// Wizard schema for all 6 screens
const wizardSchema = z.object({
  // Screen 1: Basic Info
  name: z.string().min(1, "App name is required"),
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().optional(),
  icon: z.string().optional(),
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
      icon: "Package",
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
    enabled: !!appId && mode === "update",
  });

  // Populate form with existing app data when in update mode
  useEffect(() => {
    if (existingApp && mode === "update") {
      console.log("Loading existing app data:", existingApp);
      form.reset({
        name: existingApp.name || "",
        slug: existingApp.slug || "",
        description: existingApp.description || "",
        icon: existingApp.icon || "Package",
        category: existingApp.category || "",
        visibilityMode: (existingApp.visibilityMode as any) || "engine_only",
        selectedHubs: existingApp.selectedHubs || [],
        accessPanels: existingApp.accessPanels || [],
        moduleIds: existingApp.moduleIds || [],
        features: existingApp.features || [],
        pricingModel: (existingApp.pricingModel as any) || "free",
        pricingDetails: existingApp.pricingDetails,
        version: existingApp.version || "1.0.0",
        changelog: "",
      });
    }
  }, [existingApp, mode]);

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
      
      return await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          wizardCompleted: currentStep === 6,
          wizardStep: currentStep,
        }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      toast({
        title: mode === "create" ? "App Created" : "App Updated",
        description: `WytApp ${mode === "create" ? "created" : "updated"} successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {mode === "create" ? "Create New WytApp" : "Update WytApp"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Build your app step-by-step with our intelligent wizard"
              : "Update your app configuration using the wizard"}
          </DialogDescription>
        </DialogHeader>

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

// Screen 1: Basic Info
function Screen1BasicInfo({ form, onNameChange }: { form: any; onNameChange: (name: string) => void }) {
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

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Describe what your app does..."
                rows={4}
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-app-icon">
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Package">Package</SelectItem>
                  <SelectItem value="Calculator">Calculator</SelectItem>
                  <SelectItem value="FileSignature">File Signature</SelectItem>
                  <SelectItem value="QrCode">QR Code</SelectItem>
                  <SelectItem value="Users">Users</SelectItem>
                  <SelectItem value="Grid3x3">Grid</SelectItem>
                  <SelectItem value="Bot">Bot</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-app-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="developer">Developer Tools</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
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
