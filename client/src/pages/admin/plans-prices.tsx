import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Star,
  Settings,
  Grid3x3,
  List,
  Zap,
  TrendingUp,
  AlertCircle,
  Info
} from "lucide-react";

// Types based on schema
interface AppRegistry {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  planCount?: number; // Added from backend
}

interface PricingPlan {
  id: string;
  appId: string;
  planName: string;
  planBatch: string;
  description: string;
  basePrice: string;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  features: string[];
  limits: any;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  pricingTypes?: PricingPlanType[];
}

interface PricingPlanType {
  id: string;
  pricingPlanId: string;
  type: 'free' | 'one_output' | 'onetime' | 'monthly' | 'yearly' | 'trial';
  price: string;
  billingInterval: string;
  trialDays: number;
  usageLimit: number | null;
  isActive: boolean;
  createdAt: string;
}

interface AppFeature {
  id: string;
  appId: string;
  name: string;
  description?: string;
  featureKey: string;
  category?: string;
  hasQuota: boolean;
  defaultQuota?: number;
  quotaUnit?: string;
  isActive: boolean;
  access?: {
    isEnabled: boolean;
    hasCustomQuota: boolean;
    customQuota?: number;
  };
}

export default function PlansAndPrices() {
  const [selectedApp, setSelectedApp] = useState<AppRegistry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const { toast } = useToast();

  // Fetch apps
  const { data: apps = [], isLoading: isLoadingApps } = useQuery<AppRegistry[]>({
    queryKey: ['/api/admin/pricing/apps'],
    select: (data: any) => data.apps || []
  });

  // Fetch pricing plans for selected app
  const { data: plans = [], isLoading: isLoadingPlans } = useQuery<PricingPlan[]>({
    queryKey: ['/api/admin/pricing/plans', selectedApp?.id],
    enabled: !!selectedApp,
    select: (data: any) => data.plans || []
  });

  // Filter apps
  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || app.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(apps.map(app => app.category).filter(Boolean)))];

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: (planId: string) => apiRequest(`/api/admin/pricing/plans/${planId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/plans', selectedApp?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/apps'] }); // Update app plan counts
      toast({
        title: "Success",
        description: "Pricing plan deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete pricing plan",
        variant: "destructive",
      });
    }
  });

  const getPricingTypeColor = (type: string) => {
    const colors = {
      free: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      one_output: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      onetime: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      monthly: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      yearly: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      trial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const formatPrice = (price: string, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="flex h-full bg-background" data-testid="plans-prices-page">
      {/* Left Panel - Apps Grid */}
      <div className="w-2/5 border-r border-border bg-muted/30">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Plans & Prices</h1>
            <p className="text-muted-foreground" data-testid="text-page-description">
              Manage pricing plans for all apps
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-background">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Apps</p>
                    <p className="text-xl font-bold" data-testid="text-total-apps">{apps.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Plans</p>
                    <p className="text-xl font-bold" data-testid="text-total-plans">{plans.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Active</p>
                    <p className="text-xl font-bold" data-testid="text-active-apps">{apps.filter(a => a.isActive).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search apps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-apps"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="flex-1" data-testid="select-category-filter">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat} data-testid={`option-category-${cat}`}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-view-grid"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  data-testid="button-view-list"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Apps Grid/List */}
          <ScrollArea className="h-[calc(100vh-400px)]">
            {isLoadingApps ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-loading-apps">
                Loading apps...
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-3 gap-3" : "space-y-2"}>
                {filteredApps.map((app) => (
                  <Card
                    key={app.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedApp?.id === app.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedApp(app)}
                    data-testid={`card-app-${app.slug}`}
                  >
                    <CardContent className={viewMode === "grid" ? "p-3 text-center" : "p-3 flex items-center gap-3"}>
                      <div className={`${viewMode === "grid" ? 'mx-auto mb-2' : ''} w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center`}>
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm truncate" data-testid={`text-app-name-${app.slug}`}>
                          {app.name}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Badge variant="outline" className="text-xs" data-testid={`badge-category-${app.slug}`}>
                            {app.category || 'Uncategorized'}
                          </Badge>
                          {(app.planCount || 0) > 0 && (
                            <Badge variant="secondary" className="text-xs" data-testid={`badge-plan-count-${app.slug}`}>
                              {app.planCount} plans
                            </Badge>
                          )}
                        </div>
                        {!app.isActive && (
                          <Badge variant="destructive" className="text-xs mt-1" data-testid={`badge-inactive-${app.slug}`}>
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Right Panel - Pricing Plans */}
      <div className="flex-1 p-6">
        {!selectedApp ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground" data-testid="text-no-app-selected">
              Select an app to manage pricing
            </h3>
            <p className="text-muted-foreground mt-2">
              Choose an app from the left panel to view and manage its pricing plans
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected App Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" data-testid="text-selected-app-name">{selectedApp.name}</h2>
                    <p className="text-muted-foreground" data-testid="text-selected-app-description">
                      {selectedApp.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" data-testid="badge-selected-app-category">
                    {selectedApp.category || 'Uncategorized'}
                  </Badge>
                  <Badge variant={selectedApp.isActive ? "default" : "secondary"} data-testid="badge-selected-app-status">
                    {selectedApp.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              <Button onClick={() => setIsCreatePlanOpen(true)} data-testid="button-create-plan">
                <Plus className="h-4 w-4 mr-2" />
                Add Pricing Plan
              </Button>
            </div>

            <Separator />

            {/* Pricing Plans */}
            {isLoadingPlans ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-loading-plans">
                Loading pricing plans...
              </div>
            ) : plans.length === 0 ? (
              <Card className="bg-muted/30" data-testid="card-no-plans">
                <CardContent className="py-12 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No pricing plans</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first pricing plan for this app
                  </p>
                  <Button onClick={() => setIsCreatePlanOpen(true)} data-testid="button-create-first-plan">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Pricing Plan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden transition-all hover:shadow-lg ${
                      plan.isFeatured ? 'ring-2 ring-yellow-400' : ''
                    }`}
                    data-testid={`card-plan-${plan.id}`}
                  >
                    {plan.isFeatured && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-semibold rounded-bl-lg" data-testid={`badge-featured-${plan.id}`}>
                        <Star className="h-3 w-3 inline mr-1" />
                        Featured
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl flex items-center gap-2" data-testid={`text-plan-name-${plan.id}`}>
                            {plan.planBatch && (
                              <span className="text-2xl font-bold text-primary">{plan.planBatch}</span>
                            )}
                            {plan.planName}
                          </CardTitle>
                          <CardDescription className="mt-1" data-testid={`text-plan-description-${plan.id}`}>
                            {plan.description || 'No description'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Base Price */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">Base Price</p>
                        <p className="text-2xl font-bold" data-testid={`text-plan-price-${plan.id}`}>
                          {formatPrice(plan.basePrice, plan.currency)}
                        </p>
                      </div>

                      {/* Pricing Types */}
                      {plan.pricingTypes && plan.pricingTypes.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-muted-foreground">Pricing Options</p>
                          <div className="flex flex-wrap gap-2">
                            {plan.pricingTypes.map((type) => (
                              <Badge
                                key={type.id}
                                className={getPricingTypeColor(type.type)}
                                data-testid={`badge-pricing-type-${type.id}`}
                              >
                                {type.type.replace('_', ' ')} - {formatPrice(type.price, plan.currency)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      {plan.features && plan.features.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-muted-foreground">Features</p>
                          <ul className="space-y-1">
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2" data-testid={`text-plan-feature-${plan.id}-${idx}`}>
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                            {plan.features.length > 3 && (
                              <li className="text-sm text-muted-foreground">
                                +{plan.features.length - 3} more features
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Status & Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge
                          variant={plan.isActive ? "default" : "secondary"}
                          data-testid={`badge-plan-status-${plan.id}`}
                        >
                          {plan.isActive ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                          )}
                        </Badge>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPlan(plan)}
                            data-testid={`button-edit-plan-${plan.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this pricing plan?')) {
                                deletePlanMutation.mutate(plan.id);
                              }
                            }}
                            data-testid={`button-delete-plan-${plan.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
      </div>

      {/* Create/Edit Plan Dialog */}
      <PlanFormDialog
        open={isCreatePlanOpen || !!editingPlan}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreatePlanOpen(false);
            setEditingPlan(null);
          }
        }}
        appId={selectedApp?.id}
        appName={selectedApp?.name}
        plan={editingPlan}
      />
    </div>
  );
}

// Plan Form Dialog Component
function PlanFormDialog({
  open,
  onOpenChange,
  appId,
  appName,
  plan
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId?: string;
  appName?: string;
  plan?: PricingPlan | null;
}) {
  const [formData, setFormData] = useState({
    planName: plan?.planName || '',
    planBatch: plan?.planBatch || '',
    description: plan?.description || '',
    basePrice: plan?.basePrice || '0',
    currency: plan?.currency || 'INR',
    isActive: plan?.isActive ?? true,
    isFeatured: plan?.isFeatured ?? false,
    sortOrder: plan?.sortOrder || 0,
    features: plan?.features?.join('\n') || '',
  });

  // Pricing Types state
  const [pricingTypes, setPricingTypes] = useState<{
    free: { enabled: boolean; price: string };
    one_output: { enabled: boolean; price: string };
    onetime: { enabled: boolean; price: string };
    monthly: { enabled: boolean; price: string };
    yearly: { enabled: boolean; price: string };
    trial: { enabled: boolean; price: string; trialDays: number; convertsTo: string };
  }>({
    free: { enabled: false, price: '0' },
    one_output: { enabled: false, price: '0' },
    onetime: { enabled: false, price: '0' },
    monthly: { enabled: false, price: '0' },
    yearly: { enabled: false, price: '0' },
    trial: { enabled: false, price: '0', trialDays: 7, convertsTo: '' },
  });

  // App Features state
  const [selectedFeatures, setSelectedFeatures] = useState<{
    [key: string]: {
      enabled: boolean;
      hasCustomQuota: boolean;
      customQuota: number;
    };
  }>({});

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { toast } = useToast();

  // Fetch app features
  const { data: appFeatures = [], isLoading: isLoadingFeatures } = useQuery<AppFeature[]>({
    queryKey: ['/api/admin/features', appId],
    enabled: !!appId && open,
    select: (data: any) => data.features || []
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        planName: plan?.planName || '',
        planBatch: plan?.planBatch || '',
        description: plan?.description || '',
        basePrice: plan?.basePrice || '0',
        currency: plan?.currency || 'INR',
        isActive: plan?.isActive ?? true,
        isFeatured: plan?.isFeatured ?? false,
        sortOrder: plan?.sortOrder || 0,
        features: plan?.features?.join('\n') || '',
      });
      setValidationErrors([]);
    }
  }, [open, plan]);

  // Validate pricing types
  const validatePricingTypes = () => {
    const errors: string[] = [];
    const enabledTypes = Object.entries(pricingTypes).filter(([_, v]) => v.enabled);
    
    if (enabledTypes.length === 0) {
      errors.push("At least one pricing type must be selected");
    }

    // Free and paid mutual exclusivity
    if (pricingTypes.free.enabled && enabledTypes.length > 1) {
      errors.push("Free plan cannot be combined with paid pricing types");
    }

    // Trial validation
    if (pricingTypes.trial.enabled) {
      if (!pricingTypes.trial.convertsTo) {
        errors.push("Trial plan must specify which paid plan it converts to");
      }
      if (parseFloat(pricingTypes.trial.price) !== 0) {
        errors.push("Trial plan price must be 0");
      }
    }

    // Yearly discount validation
    if (pricingTypes.monthly.enabled && pricingTypes.yearly.enabled) {
      const monthlyPrice = parseFloat(pricingTypes.monthly.price);
      const yearlyPrice = parseFloat(pricingTypes.yearly.price);
      const monthlyAnnual = monthlyPrice * 12;
      
      if (yearlyPrice >= monthlyAnnual) {
        errors.push(`Yearly price (${yearlyPrice}) should be less than monthly annual (${monthlyAnnual.toFixed(2)}) to offer a discount`);
      }
    }

    // Minimum price validation
    Object.entries(pricingTypes).forEach(([type, data]) => {
      if (data.enabled && parseFloat(data.price) < 0) {
        errors.push(`${type.replace('_', ' ')} price cannot be negative`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Handle pricing type toggle
  const handlePricingTypeToggle = (type: keyof typeof pricingTypes) => {
    setPricingTypes(prev => {
      const newTypes = { ...prev };
      
      // Toggle the selected type
      newTypes[type].enabled = !newTypes[type].enabled;
      
      // Apply mutual exclusivity rules
      if (type === 'free' && newTypes.free.enabled) {
        // If free is enabled, disable all paid types
        Object.keys(newTypes).forEach(key => {
          if (key !== 'free') {
            newTypes[key as keyof typeof pricingTypes].enabled = false;
          }
        });
      } else if (type !== 'free' && newTypes[type].enabled) {
        // If any paid type is enabled, disable free
        newTypes.free.enabled = false;
      }
      
      return newTypes;
    });
  };

  const createPlanMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/pricing/plans', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/plans', appId] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/apps'] }); // Update app plan counts
      toast({
        title: "Success",
        description: "Pricing plan created successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create pricing plan",
        variant: "destructive",
      });
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/admin/pricing/plans/${plan?.id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/plans', appId] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/apps'] }); // Update app plan counts
      toast({
        title: "Success",
        description: "Pricing plan updated successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update pricing plan",
        variant: "destructive",
      });
    }
  });

  const updatePlanFeaturesMutation = useMutation({
    mutationFn: ({ planId, features }: { planId: string; features: any[] }) =>
      apiRequest(`/api/admin/plans/${planId}/features`, 'PATCH', { features }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Plan features updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update plan features",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate pricing types
    if (!validatePricingTypes()) {
      return;
    }

    const submitData = {
      appId,
      planName: formData.planName,
      planBatch: formData.planBatch,
      description: formData.description,
      basePrice: formData.basePrice,
      currency: formData.currency,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      sortOrder: formData.sortOrder,
      features: formData.features.split('\n').filter(f => f.trim()),
    };

    try {
      let planId = plan?.id;
      
      if (plan) {
        await updatePlanMutation.mutateAsync(submitData);
      } else {
        const result: any = await createPlanMutation.mutateAsync(submitData);
        planId = result.plan?.id;
      }

      // Update features if plan was created/updated successfully
      if (planId) {
        const featuresToUpdate = Object.entries(selectedFeatures)
          .filter(([_, data]) => data.enabled)
          .map(([featureId, data]) => ({
            featureId,
            isEnabled: true,
            hasCustomQuota: data.hasCustomQuota,
            customQuota: data.hasCustomQuota ? data.customQuota : null,
          }));

        if (featuresToUpdate.length > 0) {
          await updatePlanFeaturesMutation.mutateAsync({
            planId,
            features: featuresToUpdate,
          });
        }
      }
    } catch (error) {
      console.error('Error submitting plan:', error);
    }
  };

  // Check if any paid type is enabled
  const anyPaidTypeEnabled = pricingTypes.one_output.enabled || 
                            pricingTypes.onetime.enabled || 
                            pricingTypes.monthly.enabled || 
                            pricingTypes.yearly.enabled;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" data-testid="dialog-plan-form">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">
            {plan ? 'Edit Pricing Plan' : 'Create Pricing Plan'} {appName && `- ${appName}`}
          </DialogTitle>
          <DialogDescription>
            {plan ? 'Update the pricing plan details' : 'Add a new pricing plan for the selected app'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <form onSubmit={handleSubmit} className="space-y-6 pr-4">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive" data-testid="alert-validation-errors">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planName">Plan Name *</Label>
                  <Input
                    id="planName"
                    value={formData.planName}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                    placeholder="e.g., Basic, Pro, Enterprise"
                    required
                    data-testid="input-plan-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planBatch">Plan Badge</Label>
                  <Input
                    id="planBatch"
                    value={formData.planBatch}
                    onChange={(e) => setFormData({ ...formData, planBatch: e.target.value })}
                    placeholder="e.g., ₹, +, -"
                    maxLength={2}
                    data-testid="input-plan-batch"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this pricing plan..."
                  rows={3}
                  data-testid="input-plan-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="0.00"
                    required
                    data-testid="input-plan-price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger id="currency" data-testid="select-plan-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR" data-testid="option-currency-inr">INR (₹)</SelectItem>
                      <SelectItem value="USD" data-testid="option-currency-usd">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing Types */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Pricing Types *</h3>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Free */}
                <div className={`border rounded-lg p-4 ${pricingTypes.free.enabled ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox
                      id="type-free"
                      checked={pricingTypes.free.enabled}
                      onCheckedChange={() => handlePricingTypeToggle('free')}
                      disabled={anyPaidTypeEnabled}
                      data-testid="checkbox-pricing-type-free"
                    />
                    <Label htmlFor="type-free" className="font-semibold">Free</Label>
                    {anyPaidTypeEnabled && (
                      <Badge variant="outline" className="text-xs">Disabled (paid types selected)</Badge>
                    )}
                  </div>
                  {pricingTypes.free.enabled && (
                    <p className="text-sm text-muted-foreground">No payment required</p>
                  )}
                </div>

                {/* Pay-per-use */}
                <div className={`border rounded-lg p-4 ${pricingTypes.one_output.enabled ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox
                      id="type-one-output"
                      checked={pricingTypes.one_output.enabled}
                      onCheckedChange={() => handlePricingTypeToggle('one_output')}
                      disabled={pricingTypes.free.enabled}
                      data-testid="checkbox-pricing-type-one-output"
                    />
                    <Label htmlFor="type-one-output" className="font-semibold">Pay-per-use</Label>
                  </div>
                  {pricingTypes.one_output.enabled && (
                    <div className="space-y-2">
                      <Label htmlFor="price-one-output">Unit Price</Label>
                      <Input
                        id="price-one-output"
                        type="number"
                        step="0.01"
                        value={pricingTypes.one_output.price}
                        onChange={(e) => setPricingTypes(prev => ({
                          ...prev,
                          one_output: { ...prev.one_output, price: e.target.value }
                        }))}
                        placeholder="0.00"
                        data-testid="input-price-one-output"
                      />
                    </div>
                  )}
                </div>

                {/* One-time */}
                <div className={`border rounded-lg p-4 ${pricingTypes.onetime.enabled ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox
                      id="type-onetime"
                      checked={pricingTypes.onetime.enabled}
                      onCheckedChange={() => handlePricingTypeToggle('onetime')}
                      disabled={pricingTypes.free.enabled}
                      data-testid="checkbox-pricing-type-onetime"
                    />
                    <Label htmlFor="type-onetime" className="font-semibold">One-time</Label>
                  </div>
                  {pricingTypes.onetime.enabled && (
                    <div className="space-y-2">
                      <Label htmlFor="price-onetime">Price</Label>
                      <Input
                        id="price-onetime"
                        type="number"
                        step="0.01"
                        value={pricingTypes.onetime.price}
                        onChange={(e) => setPricingTypes(prev => ({
                          ...prev,
                          onetime: { ...prev.onetime, price: e.target.value }
                        }))}
                        placeholder="0.00"
                        data-testid="input-price-onetime"
                      />
                    </div>
                  )}
                </div>

                {/* Monthly */}
                <div className={`border rounded-lg p-4 ${pricingTypes.monthly.enabled ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox
                      id="type-monthly"
                      checked={pricingTypes.monthly.enabled}
                      onCheckedChange={() => handlePricingTypeToggle('monthly')}
                      disabled={pricingTypes.free.enabled}
                      data-testid="checkbox-pricing-type-monthly"
                    />
                    <Label htmlFor="type-monthly" className="font-semibold">Monthly</Label>
                  </div>
                  {pricingTypes.monthly.enabled && (
                    <div className="space-y-2">
                      <Label htmlFor="price-monthly">Monthly Price</Label>
                      <Input
                        id="price-monthly"
                        type="number"
                        step="0.01"
                        value={pricingTypes.monthly.price}
                        onChange={(e) => setPricingTypes(prev => ({
                          ...prev,
                          monthly: { ...prev.monthly, price: e.target.value }
                        }))}
                        placeholder="0.00"
                        data-testid="input-price-monthly"
                      />
                    </div>
                  )}
                </div>

                {/* Yearly */}
                <div className={`border rounded-lg p-4 ${pricingTypes.yearly.enabled ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox
                      id="type-yearly"
                      checked={pricingTypes.yearly.enabled}
                      onCheckedChange={() => handlePricingTypeToggle('yearly')}
                      disabled={pricingTypes.free.enabled}
                      data-testid="checkbox-pricing-type-yearly"
                    />
                    <Label htmlFor="type-yearly" className="font-semibold">Yearly</Label>
                  </div>
                  {pricingTypes.yearly.enabled && (
                    <div className="space-y-2">
                      <Label htmlFor="price-yearly">Yearly Price</Label>
                      <Input
                        id="price-yearly"
                        type="number"
                        step="0.01"
                        value={pricingTypes.yearly.price}
                        onChange={(e) => setPricingTypes(prev => ({
                          ...prev,
                          yearly: { ...prev.yearly, price: e.target.value }
                        }))}
                        placeholder="0.00"
                        data-testid="input-price-yearly"
                      />
                      {pricingTypes.monthly.enabled && (
                        <p className="text-xs text-muted-foreground">
                          Suggested: Less than {(parseFloat(pricingTypes.monthly.price || '0') * 12).toFixed(2)} for discount
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Trial */}
                <div className={`border rounded-lg p-4 ${pricingTypes.trial.enabled ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox
                      id="type-trial"
                      checked={pricingTypes.trial.enabled}
                      onCheckedChange={() => handlePricingTypeToggle('trial')}
                      disabled={pricingTypes.free.enabled}
                      data-testid="checkbox-pricing-type-trial"
                    />
                    <Label htmlFor="type-trial" className="font-semibold">Trial</Label>
                  </div>
                  {pricingTypes.trial.enabled && (
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="trial-days">Trial Days</Label>
                        <Input
                          id="trial-days"
                          type="number"
                          value={pricingTypes.trial.trialDays}
                          onChange={(e) => setPricingTypes(prev => ({
                            ...prev,
                            trial: { ...prev.trial, trialDays: parseInt(e.target.value) || 0 }
                          }))}
                          placeholder="7"
                          data-testid="input-trial-days"
                        />
                      </div>
                      <div>
                        <Label htmlFor="trial-converts-to">Converts to</Label>
                        <Select
                          value={pricingTypes.trial.convertsTo}
                          onValueChange={(value) => setPricingTypes(prev => ({
                            ...prev,
                            trial: { ...prev.trial, convertsTo: value }
                          }))}
                        >
                          <SelectTrigger id="trial-converts-to" data-testid="select-trial-converts-to">
                            <SelectValue placeholder="Select plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {pricingTypes.monthly.enabled && (
                              <SelectItem value="monthly" data-testid="option-converts-monthly">Monthly</SelectItem>
                            )}
                            {pricingTypes.yearly.enabled && (
                              <SelectItem value="yearly" data-testid="option-converts-yearly">Yearly</SelectItem>
                            )}
                            {pricingTypes.onetime.enabled && (
                              <SelectItem value="onetime" data-testid="option-converts-onetime">One-time</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Features Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Features</h3>
              
              {isLoadingFeatures ? (
                <div className="text-center py-4 text-muted-foreground">Loading features...</div>
              ) : appFeatures.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No features defined for this app. Features can be managed in the app settings.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {appFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className={`border rounded-lg p-4 ${selectedFeatures[feature.id]?.enabled ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`feature-${feature.id}`}
                          checked={selectedFeatures[feature.id]?.enabled || false}
                          onCheckedChange={(checked) => {
                            setSelectedFeatures(prev => ({
                              ...prev,
                              [feature.id]: {
                                enabled: !!checked,
                                hasCustomQuota: prev[feature.id]?.hasCustomQuota || false,
                                customQuota: prev[feature.id]?.customQuota || feature.defaultQuota || 0,
                              }
                            }));
                          }}
                          data-testid={`checkbox-feature-${feature.id}`}
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`feature-${feature.id}`} className="font-semibold">
                              {feature.name}
                            </Label>
                            {feature.category && (
                              <Badge variant="outline" className="text-xs" data-testid={`badge-feature-category-${feature.id}`}>
                                {feature.category}
                              </Badge>
                            )}
                          </div>
                          {feature.description && (
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          )}
                          
                          {/* Quota Settings */}
                          {feature.hasQuota && selectedFeatures[feature.id]?.enabled && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`quota-${feature.id}`}
                                  checked={selectedFeatures[feature.id]?.hasCustomQuota || false}
                                  onCheckedChange={(checked) => {
                                    setSelectedFeatures(prev => ({
                                      ...prev,
                                      [feature.id]: {
                                        ...prev[feature.id],
                                        hasCustomQuota: !!checked,
                                        customQuota: prev[feature.id]?.customQuota || feature.defaultQuota || 0,
                                      }
                                    }));
                                  }}
                                  data-testid={`checkbox-custom-quota-${feature.id}`}
                                />
                                <Label htmlFor={`quota-${feature.id}`} className="text-sm">
                                  Custom quota for this plan
                                </Label>
                              </div>
                              {selectedFeatures[feature.id]?.hasCustomQuota && (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    value={selectedFeatures[feature.id]?.customQuota || 0}
                                    onChange={(e) => {
                                      setSelectedFeatures(prev => ({
                                        ...prev,
                                        [feature.id]: {
                                          ...prev[feature.id],
                                          customQuota: parseInt(e.target.value) || 0,
                                        }
                                      }));
                                    }}
                                    placeholder={`Default: ${feature.defaultQuota || 0}`}
                                    className="w-32"
                                    data-testid={`input-custom-quota-${feature.id}`}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {feature.quotaUnit || 'units'}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Legacy Features (text-based) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legacy Features (Text)</h3>
              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  rows={4}
                  data-testid="input-plan-features"
                />
              </div>
            </div>

            <Separator />

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Display Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  data-testid="input-plan-sort-order"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                    data-testid="checkbox-plan-active"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: !!checked })}
                    data-testid="checkbox-plan-featured"
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-plan">
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
            data-testid="button-submit-plan"
          >
            {createPlanMutation.isPending || updatePlanMutation.isPending ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
