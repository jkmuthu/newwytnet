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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Info,
  Eye,
  Ban,
  BarChart3
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
  planCount?: number;
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

interface PricingMatrix {
  plans: PricingPlan[];
  features: AppFeature[];
  accessMatrix: Record<string, Record<string, {
    isEnabled: boolean;
    hasCustomQuota: boolean;
    customQuota?: number | null;
  }>>;
}

interface PlanColumnData {
  plan: PricingPlan;
  isActive: boolean;
  pricingTypes: {
    monthly?: { enabled: boolean; price: string };
    yearly?: { enabled: boolean; price: string };
    trial?: { enabled: boolean; days: number };
  };
}

export default function PlansAndPrices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fullViewApp, setFullViewApp] = useState<AppRegistry | null>(null);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const { toast } = useToast();

  // Fetch apps
  const { data: apps = [], isLoading: isLoadingApps } = useQuery<AppRegistry[]>({
    queryKey: ['/api/admin/pricing/apps'],
    select: (data: any) => data.apps || []
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

  // Calculate total plans
  const totalPlans = apps.reduce((sum, app) => sum + (app.planCount || 0), 0);

  return (
    <div className="h-full bg-background p-6" data-testid="plans-prices-page">
      {/* Header Section */}
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Plans & Prices</h1>
          <p className="text-muted-foreground mt-1" data-testid="page-description">
            Manage pricing plans for all apps - Enable/disable default plans and set prices in the matrix
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Apps</p>
                  <p className="text-2xl font-bold" data-testid="stat-total-apps">{apps.length}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Plans</p>
                  <p className="text-2xl font-bold" data-testid="stat-total-plans">{totalPlans}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Apps</p>
                  <p className="text-2xl font-bold" data-testid="stat-active-apps">
                    {apps.filter(app => app.isActive).length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search apps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-apps"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]" data-testid="select-category-filter">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} data-testid={`option-category-${cat}`}>
                  {cat === "all" ? "All Categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Apps List View Table */}
      <Card>
        <CardHeader>
          <CardTitle>Apps List View</CardTitle>
          <CardDescription>All registered apps with pricing plans</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingApps ? (
            <div className="text-center py-12 text-muted-foreground" data-testid="text-loading-apps">
              Loading apps...
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No apps found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>App</TableHead>
                  <TableHead>Added Pricing Plans</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.map((app, index) => (
                  <AppTableRow
                    key={app.id}
                    app={app}
                    index={index}
                    onFullView={() => setFullViewApp(app)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Full View Dialog */}
      {fullViewApp && (
        <FullViewDialog
          app={fullViewApp}
          open={!!fullViewApp}
          onOpenChange={(open) => !open && setFullViewApp(null)}
          onCreatePlan={() => setIsCreatePlanOpen(true)}
          onEditPlan={(plan) => setEditingPlan(plan)}
        />
      )}

      {/* Create/Edit Plan Dialog */}
      <PlanFormDialog
        open={isCreatePlanOpen || !!editingPlan}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreatePlanOpen(false);
            setEditingPlan(null);
          }
        }}
        appId={fullViewApp?.id}
        appName={fullViewApp?.name}
        plan={editingPlan}
      />
    </div>
  );
}

// App Table Row Component
function AppTableRow({ 
  app, 
  index, 
  onFullView 
}: { 
  app: AppRegistry; 
  index: number; 
  onFullView: () => void;
}) {
  const { toast } = useToast();

  // Fetch plans for this app to show summary
  const { data: plans = [] } = useQuery<PricingPlan[]>({
    queryKey: ['/api/admin/pricing/plans', app.id],
    select: (data: any) => data.plans || []
  });

  // Toggle app active status
  const toggleActiveMutation = useMutation({
    mutationFn: (isActive: boolean) => 
      apiRequest(`/api/admin/apps/${app.id}`, 'PATCH', { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/apps'] });
      toast({ title: "Success", description: "App status updated" });
    }
  });

  // Toggle promo card status
  const togglePromoMutation = useMutation({
    mutationFn: (isPromo: boolean) => 
      apiRequest(`/api/admin/apps/${app.id}`, 'PATCH', { 
        metadata: { ...app.metadata, isPromoCard: isPromo } 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/apps'] });
      toast({ title: "Success", description: "Promo card status updated" });
    }
  });

  const formatPrice = (price: string, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${parseFloat(price).toFixed(0)}`;
  };

  return (
    <TableRow data-testid={`row-app-${app.id}`}>
      <TableCell className="font-medium" data-testid={`text-app-number-${index + 1}`}>
        {index + 1}
      </TableCell>
      <TableCell>
        <div className="flex items-start gap-3">
          <div className="text-2xl">{app.icon}</div>
          <div className="flex-1">
            <div className="font-semibold" data-testid={`text-app-name-${app.id}`}>
              {app.name}
            </div>
            <div className="text-sm text-muted-foreground" data-testid={`text-app-description-${app.id}`}>
              {app.description}
            </div>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" data-testid={`badge-app-category-${app.id}`}>
                {app.category}
              </Badge>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {plans.length === 0 ? (
          <span className="text-sm text-muted-foreground">No pricing plans</span>
        ) : (
          <div className="flex flex-col gap-1">
            {plans.map((plan) => (
              <div key={plan.id} className="text-sm" data-testid={`text-plan-summary-${plan.id}`}>
                <span className="font-medium">{plan.planName}:</span>{' '}
                {formatPrice(plan.basePrice, plan.currency)}
                {plan.pricingTypes && plan.pricingTypes.length > 0 && (
                  <span className="text-muted-foreground">
                    {' '}({plan.pricingTypes.map(pt => pt.type).join(', ')})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center gap-1 mr-2">
            <Checkbox
              checked={app.isActive}
              onCheckedChange={(checked) => toggleActiveMutation.mutate(!!checked)}
              data-testid={`checkbox-active-${app.id}`}
            />
            <label className="text-xs text-muted-foreground cursor-pointer">
              Active
            </label>
          </div>
          <div className="flex items-center gap-1 mr-2">
            <Checkbox
              checked={app.metadata?.isPromoCard || false}
              onCheckedChange={(checked) => togglePromoMutation.mutate(!!checked)}
              data-testid={`checkbox-promo-${app.id}`}
            />
            <label className="text-xs text-muted-foreground cursor-pointer">
              Promo Card
            </label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onFullView}
            data-testid={`button-full-view-${app.id}`}
          >
            <Eye className="h-4 w-4 mr-1" />
            Full View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!app.isActive}
            onClick={() => toggleActiveMutation.mutate(false)}
            data-testid={`button-disable-${app.id}`}
          >
            <Ban className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Matrix Table Component - Unified Features & Plans Interface
function MatrixTable({ appId }: { appId: string }) {
  const { toast } = useToast();
  const [matrixData, setMatrixData] = useState<PricingMatrix | null>(null);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch matrix data
  const { data, isLoading } = useQuery<PricingMatrix>({
    queryKey: ['/api/admin/pricing/matrix', appId],
    select: (response: any) => ({
      plans: response.plans || [],
      features: response.features || [],
      accessMatrix: response.accessMatrix || {},
    }),
  });

  // Initialize matrix data when fetched
  useEffect(() => {
    if (data) {
      setMatrixData(data);
    }
  }, [data]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (matrixUpdate: any) => 
      apiRequest(`/api/admin/pricing/matrix/${appId}`, 'POST', matrixUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/matrix', appId] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/apps'] });
      toast({ title: "Saved", description: "Matrix updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save matrix", variant: "destructive" });
    }
  });

  // Auto-save with debounce
  const handleSave = (planId: string, updates: any) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    
    const timeout = setTimeout(() => {
      saveMutation.mutate({
        plans: [{
          planId,
          ...updates
        }]
      });
    }, 1000);
    
    setSaveTimeout(timeout);
  };

  // Toggle plan active status
  const togglePlanActive = (planId: string, isActive: boolean) => {
    if (!matrixData) return;

    const updatedPlans = matrixData.plans.map(p => 
      p.id === planId ? { ...p, isActive } : p
    );
    setMatrixData({ ...matrixData, plans: updatedPlans });
    handleSave(planId, { isActive });
  };

  // Toggle pricing type
  const togglePricingType = (planId: string, type: string, enabled: boolean, price?: string) => {
    if (!matrixData) return;

    const plan = matrixData.plans.find(p => p.id === planId);
    if (!plan) return;

    let pricingTypes = plan.pricingTypes || [];
    
    if (enabled) {
      // Add or update pricing type
      const existing = pricingTypes.find(pt => pt.type === type);
      if (existing) {
        pricingTypes = pricingTypes.map(pt => 
          pt.type === type ? { ...pt, price: price || pt.price } : pt
        );
      } else {
        pricingTypes = [...pricingTypes, {
          id: '',
          pricingPlanId: planId,
          type: type as any,
          price: price || '0',
          billingInterval: type === 'monthly' ? 'month' : type === 'yearly' ? 'year' : '',
          trialDays: type === 'trial' ? 7 : 0,
          usageLimit: null,
          isActive: true,
          createdAt: new Date().toISOString()
        }];
      }
    } else {
      // Remove pricing type
      pricingTypes = pricingTypes.filter(pt => pt.type !== type);
    }

    const updatedPlans = matrixData.plans.map(p =>
      p.id === planId ? { ...p, pricingTypes } : p
    );
    setMatrixData({ ...matrixData, plans: updatedPlans });
    handleSave(planId, { pricingTypes });
  };

  // Update pricing type price
  const updatePrice = (planId: string, type: string, price: string) => {
    if (!matrixData) return;

    const plan = matrixData.plans.find(p => p.id === planId);
    if (!plan) return;

    const pricingTypes = (plan.pricingTypes || []).map(pt =>
      pt.type === type ? { ...pt, price } : pt
    );

    const updatedPlans = matrixData.plans.map(p =>
      p.id === planId ? { ...p, pricingTypes } : p
    );
    setMatrixData({ ...matrixData, plans: updatedPlans });
    handleSave(planId, { pricingTypes });
  };

  // Toggle feature for plan
  const toggleFeature = (planId: string, featureId: string, isEnabled: boolean) => {
    if (!matrixData) return;

    const newAccessMatrix = { ...matrixData.accessMatrix };
    if (!newAccessMatrix[planId]) {
      newAccessMatrix[planId] = {};
    }

    newAccessMatrix[planId][featureId] = {
      isEnabled,
      hasCustomQuota: newAccessMatrix[planId][featureId]?.hasCustomQuota || false,
      customQuota: newAccessMatrix[planId][featureId]?.customQuota || null,
    };

    setMatrixData({ ...matrixData, accessMatrix: newAccessMatrix });
    handleSave(planId, { featureAccess: newAccessMatrix[planId] });
  };

  // Update feature quota
  const updateQuota = (planId: string, featureId: string, quota: number) => {
    if (!matrixData) return;

    const newAccessMatrix = { ...matrixData.accessMatrix };
    if (!newAccessMatrix[planId]) {
      newAccessMatrix[planId] = {};
    }

    newAccessMatrix[planId][featureId] = {
      ...(newAccessMatrix[planId][featureId] || { isEnabled: true, hasCustomQuota: false }),
      hasCustomQuota: true,
      customQuota: quota,
    };

    setMatrixData({ ...matrixData, accessMatrix: newAccessMatrix });
    handleSave(planId, { featureAccess: newAccessMatrix[planId] });
  };

  // Get plan icon based on name/batch
  const getPlanIcon = (plan: PricingPlan) => {
    const name = (plan.planBatch || plan.planName).toLowerCase();
    if (name.includes('free')) return '⭐';
    if (name.includes('trial')) return '🎁';
    if (name.includes('basic')) return '📦';
    if (name.includes('plus')) return '➕';
    if (name.includes('pro')) return '⚡';
    if (name.includes('premium') || name.includes('prime')) return '👑';
    if (name.includes('enterprise')) return '🏢';
    return '💎';
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading matrix...
      </div>
    );
  }

  if (!matrixData || matrixData.plans.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No pricing plans found for this app. Please create plans first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative">
      <ScrollArea className="h-[500px] w-full">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 bg-background z-20">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Features
                </div>
              </TableHead>
              {matrixData.plans.map((plan) => (
                <TableHead key={plan.id} className="min-w-[180px] text-center">
                  <div className="space-y-2">
                    {/* Plan Header */}
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl">{getPlanIcon(plan)}</span>
                      <span className="font-bold">{plan.planBatch || plan.planName}</span>
                    </div>

                    {/* Activate Plan Toggle */}
                    <div className="flex items-center justify-center gap-1">
                      <Checkbox
                        checked={plan.isActive}
                        onCheckedChange={(checked) => togglePlanActive(plan.id, !!checked)}
                        data-testid={`checkbox-activate-plan-${plan.id}`}
                      />
                      <span className="text-xs text-muted-foreground">Activate Plan</span>
                    </div>
                  </div>
                </TableHead>
              ))}
            </TableRow>

            {/* Pricing Types Row */}
            <TableRow className="bg-muted/50">
              <TableHead className="sticky left-0 bg-muted/50 z-20">
                <span className="text-sm font-medium">Price (in ₹)</span>
              </TableHead>
              {matrixData.plans.map((plan) => {
                const monthlyType = plan.pricingTypes?.find(pt => pt.type === 'monthly');
                const yearlyType = plan.pricingTypes?.find(pt => pt.type === 'yearly');
                const trialType = plan.pricingTypes?.find(pt => pt.type === 'trial');
                const freeType = plan.pricingTypes?.find(pt => pt.type === 'free');

                return (
                  <TableHead key={plan.id} className="p-2">
                    <div className="space-y-2">
                      {/* Free Plan */}
                      {freeType ? (
                        <div className="text-center font-semibold text-green-600">₹0/-</div>
                      ) : (
                        <>
                          {/* Monthly */}
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={!!monthlyType}
                              onCheckedChange={(checked) => togglePricingType(plan.id, 'monthly', !!checked, '0')}
                              data-testid={`checkbox-monthly-${plan.id}`}
                            />
                            <span className="text-xs">Monthly</span>
                            {monthlyType && (
                              <Input
                                type="number"
                                value={monthlyType.price}
                                onChange={(e) => updatePrice(plan.id, 'monthly', e.target.value)}
                                className="h-6 w-20 text-xs"
                                data-testid={`input-monthly-price-${plan.id}`}
                              />
                            )}
                          </div>

                          {/* Yearly */}
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={!!yearlyType}
                              onCheckedChange={(checked) => togglePricingType(plan.id, 'yearly', !!checked, '0')}
                              data-testid={`checkbox-yearly-${plan.id}`}
                            />
                            <span className="text-xs">Yearly</span>
                            {yearlyType && (
                              <Input
                                type="number"
                                value={yearlyType.price}
                                onChange={(e) => updatePrice(plan.id, 'yearly', e.target.value)}
                                className="h-6 w-20 text-xs"
                                data-testid={`input-yearly-price-${plan.id}`}
                              />
                            )}
                          </div>

                          {/* Trial */}
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={!!trialType}
                              onCheckedChange={(checked) => togglePricingType(plan.id, 'trial', !!checked, '0')}
                              data-testid={`checkbox-trial-${plan.id}`}
                            />
                            <span className="text-xs">Trial</span>
                            {trialType && (
                              <span className="text-xs">Days [{trialType.trialDays}]</span>
                            )}
                          </div>
                        </>
                      )}
                      
                      <Button
                        size="sm"
                        className="w-full h-6 text-xs"
                        onClick={() => handleSave(plan.id, {})}
                        disabled={saveMutation.isPending}
                        data-testid={`button-save-plan-${plan.id}`}
                      >
                        {saveMutation.isPending ? 'Saving...' : 'SAVE'}
                      </Button>
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>

            {/* Features Header Row */}
            <TableRow className="bg-muted">
              <TableHead className="sticky left-0 bg-muted z-20">
                <span className="text-sm font-semibold">No</span>
              </TableHead>
              {matrixData.plans.map((plan) => (
                <TableHead key={plan.id} className="text-center bg-muted">
                  <span className="text-sm font-semibold">
                    {getPlanIcon(plan)} {plan.planBatch || plan.planName.split(' ')[0]}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {matrixData.features.map((feature, index) => (
              <TableRow key={feature.id}>
                <TableCell className="sticky left-0 bg-background z-10">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{index + 1}. {feature.name}</div>
                    {feature.description && (
                      <div className="text-xs text-muted-foreground">{feature.description}</div>
                    )}
                  </div>
                </TableCell>
                {matrixData.plans.map((plan) => {
                  const access = matrixData.accessMatrix[plan.id]?.[feature.id];
                  const isEnabled = access?.isEnabled || false;

                  return (
                    <TableCell key={plan.id} className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Checkbox
                          checked={isEnabled}
                          onCheckedChange={(checked) => toggleFeature(plan.id, feature.id, !!checked)}
                          data-testid={`checkbox-feature-${plan.id}-${feature.id}`}
                        />
                        {isEnabled && feature.hasQuota && (
                          <Input
                            type="number"
                            value={access?.customQuota || feature.defaultQuota || 0}
                            onChange={(e) => updateQuota(plan.id, feature.id, parseInt(e.target.value) || 0)}
                            className="h-6 w-16 text-xs text-center"
                            placeholder={feature.quotaUnit || 'qty'}
                            data-testid={`input-quota-${plan.id}-${feature.id}`}
                          />
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Conditions Note */}
      <Alert className="mt-4">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Conditions:</strong> If Activate Plan is enabled, the entire column is active. 
          Check/uncheck features to enable/disable them. 
          For Free plans, all pricing options are disabled (₹0/-).
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Full View Dialog with Tabs
function FullViewDialog({
  app,
  open,
  onOpenChange,
  onCreatePlan,
  onEditPlan
}: {
  app: AppRegistry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePlan: () => void;
  onEditPlan: (plan: PricingPlan) => void;
}) {
  const { toast } = useToast();

  // Fetch plans for this app
  const { data: plans = [], isLoading: isLoadingPlans } = useQuery<PricingPlan[]>({
    queryKey: ['/api/admin/pricing/plans', app.id],
    select: (data: any) => data.plans || []
  });

  // Fetch features for this app
  const { data: features = [], isLoading: isLoadingFeatures } = useQuery<AppFeature[]>({
    queryKey: ['/api/admin/features', app.id],
    select: (data: any) => data.features || []
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: (planId: string) => apiRequest(`/api/admin/pricing/plans/${planId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/plans', app.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/apps'] });
      toast({ title: "Success", description: "Pricing plan deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete pricing plan", variant: "destructive" });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{app.icon}</span>
            <div>
              <DialogTitle className="text-2xl" data-testid="dialog-title-full-view">
                {app.name}
              </DialogTitle>
              <DialogDescription data-testid="dialog-description-full-view">
                {app.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="matrix" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matrix" data-testid="tab-features-plans-matrix">
              Features & Plans
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Features & Plans Matrix */}
          <TabsContent value="matrix" className="mt-4">
            <MatrixTable appId={app.id} />
          </TabsContent>

          {/* Tab 2: Old Pricing Plans (kept for reference, can be removed later) */}
          <TabsContent value="old-plans" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">All Pricing Plans</h3>
              <Button onClick={onCreatePlan} data-testid="button-create-plan-tab">
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              {isLoadingPlans ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading pricing plans...
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Pricing Plans</p>
                  <p className="text-sm mt-2">Create your first pricing plan</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                  {plans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`relative overflow-hidden transition-all hover:shadow-lg ${
                        plan.isFeatured ? 'ring-2 ring-yellow-400' : ''
                      }`}
                      data-testid={`card-plan-${plan.id}`}
                    >
                      {plan.isFeatured && (
                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-semibold rounded-bl-lg">
                          <Star className="h-3 w-3 inline mr-1" />
                          Featured
                        </div>
                      )}
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl flex items-center gap-2">
                              {plan.planBatch && (
                                <span className="text-2xl font-bold text-primary">{plan.planBatch}</span>
                              )}
                              {plan.planName}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {plan.description || 'No description'}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Base Price */}
                        <div>
                          <div className="text-sm text-muted-foreground">Base Price</div>
                          <div className="text-2xl font-bold">
                            {formatPrice(plan.basePrice, plan.currency)}
                          </div>
                        </div>

                        {/* Pricing Types */}
                        {plan.pricingTypes && plan.pricingTypes.length > 0 && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">Pricing Types</div>
                            <div className="flex flex-wrap gap-2">
                              {plan.pricingTypes.map((pt) => (
                                <Badge
                                  key={pt.id}
                                  className={getPricingTypeColor(pt.type)}
                                >
                                  {pt.type.replace('_', ' ').toUpperCase()}
                                  {pt.price !== '0' && ` - ${formatPrice(pt.price, plan.currency)}`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Status */}
                        <div className="flex gap-2">
                          {plan.isActive ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditPlan(plan)}
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
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Tab 2: Features for Plans */}
          <TabsContent value="features" className="mt-4">
            <ScrollArea className="h-[400px]">
              {isLoadingFeatures ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading features...
                </div>
              ) : features.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Features</p>
                  <p className="text-sm mt-2">This app doesn't have any features configured</p>
                </div>
              ) : (
                <div className="space-y-4 pr-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Feature mapping for plans coming soon. This will allow you to assign specific features to different pricing plans.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-3">
                    {features.map((feature) => (
                      <Card key={feature.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{feature.name}</h4>
                              {feature.description && (
                                <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">{feature.featureKey}</Badge>
                                {feature.hasQuota && (
                                  <Badge variant="secondary">
                                    Quota: {feature.defaultQuota} {feature.quotaUnit}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Tab 3: Analytics */}
          <TabsContent value="analytics" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Analytics Coming Soon</p>
                <p className="text-sm mt-2">Installation counts and usage statistics will be available here</p>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Plan Form Dialog Component (reusing existing implementation)
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

  const [pricingTypes, setPricingTypes] = useState<{
    type: 'free' | 'one_output' | 'onetime' | 'monthly' | 'yearly' | 'trial';
    price: string;
    billingInterval: string;
    trialDays: number;
    usageLimit: number | null;
    isActive: boolean;
  }[]>(plan?.pricingTypes?.map(pt => ({
    type: pt.type,
    price: pt.price,
    billingInterval: pt.billingInterval,
    trialDays: pt.trialDays,
    usageLimit: pt.usageLimit,
    isActive: pt.isActive
  })) || []);

  const { toast } = useToast();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && plan) {
      setFormData({
        planName: plan.planName,
        planBatch: plan.planBatch,
        description: plan.description,
        basePrice: plan.basePrice,
        currency: plan.currency,
        isActive: plan.isActive,
        isFeatured: plan.isFeatured,
        sortOrder: plan.sortOrder,
        features: plan.features?.join('\n') || '',
      });
      setPricingTypes(plan.pricingTypes?.map(pt => ({
        type: pt.type,
        price: pt.price,
        billingInterval: pt.billingInterval,
        trialDays: pt.trialDays,
        usageLimit: pt.usageLimit,
        isActive: pt.isActive
      })) || []);
    } else if (!open) {
      setFormData({
        planName: '',
        planBatch: '',
        description: '',
        basePrice: '0',
        currency: 'INR',
        isActive: true,
        isFeatured: false,
        sortOrder: 0,
        features: '',
      });
      setPricingTypes([]);
    }
  }, [open, plan]);

  // Fetch apps for dropdown
  const { data: apps = [] } = useQuery<AppRegistry[]>({
    queryKey: ['/api/admin/pricing/apps'],
    select: (data: any) => data.apps || []
  });

  const [selectedAppId, setSelectedAppId] = useState(appId || plan?.appId || '');

  // Sync selectedAppId with appId/plan changes
  useEffect(() => {
    if (open) {
      setSelectedAppId(appId || plan?.appId || '');
    }
  }, [open, appId, plan]);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/pricing/plans', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/apps'] });
      toast({ title: "Success", description: "Pricing plan created successfully" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create pricing plan",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/admin/pricing/plans/${plan?.id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing/apps'] });
      toast({ title: "Success", description: "Pricing plan updated successfully" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing plan",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAppId) {
      toast({
        title: "Validation Error",
        description: "Please select an app",
        variant: "destructive",
      });
      return;
    }

    if (!formData.planName.trim()) {
      toast({
        title: "Validation Error",
        description: "Plan name is required",
        variant: "destructive",
      });
      return;
    }

    const planData = {
      appId: selectedAppId,
      planName: formData.planName,
      planBatch: formData.planBatch,
      description: formData.description,
      basePrice: formData.basePrice,
      currency: formData.currency,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      sortOrder: formData.sortOrder,
      features: formData.features.split('\n').filter(f => f.trim()),
      pricingTypes: pricingTypes.filter(pt => pt.type) // Only include pricing types with a type selected
    };

    if (plan) {
      updateMutation.mutate(planData);
    } else {
      createMutation.mutate(planData);
    }
  };

  const addPricingType = () => {
    setPricingTypes([...pricingTypes, {
      type: 'free',
      price: '0',
      billingInterval: '',
      trialDays: 0,
      usageLimit: null,
      isActive: true
    }]);
  };

  const removePricingType = (index: number) => {
    setPricingTypes(pricingTypes.filter((_, i) => i !== index));
  };

  const updatePricingType = (index: number, field: string, value: any) => {
    const updated = [...pricingTypes];
    updated[index] = { ...updated[index], [field]: value };
    setPricingTypes(updated);
  };

  const selectedAppName = apps.find(a => a.id === selectedAppId)?.name || appName || 'App';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title-plan-form">
            {plan ? 'Edit' : 'Create'} Pricing Plan{selectedAppName && ` - ${selectedAppName}`}
          </DialogTitle>
          <DialogDescription>
            Configure pricing details and options for your app
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <form onSubmit={handleSubmit} className="space-y-6 pr-4">
            {/* App Selection (only show if not editing and no appId provided) */}
            {!plan && !appId && (
              <div className="space-y-2">
                <Label htmlFor="app">Select App *</Label>
                <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                  <SelectTrigger id="app" data-testid="select-app">
                    <SelectValue placeholder="Choose an app" />
                  </SelectTrigger>
                  <SelectContent>
                    {apps.map((app) => (
                      <SelectItem key={app.id} value={app.id} data-testid={`option-app-${app.id}`}>
                        {app.icon} {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Basic Plan Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  value={formData.planName}
                  onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                  placeholder="e.g., Basic, Pro, Enterprise"
                  data-testid="input-plan-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planBatch">Plan Batch (Optional)</Label>
                <Input
                  id="planBatch"
                  value={formData.planBatch}
                  onChange={(e) => setFormData({ ...formData, planBatch: e.target.value })}
                  placeholder="e.g., P1, P2"
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
                data-testid="textarea-description"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  data-testid="input-base-price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger id="currency" data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing Types */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Pricing Types</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPricingType}
                  data-testid="button-add-pricing-type"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Type
                </Button>
              </div>

              {pricingTypes.map((pt, index) => (
                <Card key={index}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={pt.type}
                            onValueChange={(value) => updatePricingType(index, 'type', value)}
                          >
                            <SelectTrigger data-testid={`select-pricing-type-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="one_output">One Output</SelectItem>
                              <SelectItem value="onetime">One-time</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                              <SelectItem value="trial">Trial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={pt.price}
                            onChange={(e) => updatePricingType(index, 'price', e.target.value)}
                            data-testid={`input-pricing-price-${index}`}
                          />
                        </div>

                        {pt.type === 'trial' && (
                          <div className="space-y-2">
                            <Label>Trial Days</Label>
                            <Input
                              type="number"
                              value={pt.trialDays}
                              onChange={(e) => updatePricingType(index, 'trialDays', parseInt(e.target.value) || 0)}
                              data-testid={`input-trial-days-${index}`}
                            />
                          </div>
                        )}

                        {pt.type === 'one_output' && (
                          <div className="space-y-2">
                            <Label>Usage Limit</Label>
                            <Input
                              type="number"
                              value={pt.usageLimit || ''}
                              onChange={(e) => updatePricingType(index, 'usageLimit', parseInt(e.target.value) || null)}
                              placeholder="Number of outputs"
                              data-testid={`input-usage-limit-${index}`}
                            />
                          </div>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePricingType(index)}
                        data-testid={`button-remove-pricing-type-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                rows={4}
                data-testid="textarea-features"
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                  data-testid="checkbox-is-active"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Active Plan</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: !!checked })}
                  data-testid="checkbox-is-featured"
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">Featured Plan</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                data-testid="input-sort-order"
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            data-testid="button-submit-plan"
          >
            {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (plan ? 'Update' : 'Create')} Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
