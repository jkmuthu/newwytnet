import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Plus, Edit, Trash2, DollarSign, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface App {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon: string;
}

interface PricingPlanType {
  id: string;
  type: string;
  price: string;
  billingInterval?: string;
  trialDays?: number;
  isActive: boolean;
}

interface PricingPlan {
  id: string;
  appId: string;
  planName: string;
  planBatch: string;
  description?: string;
  basePrice: string;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  features: string[];
  pricingTypes: PricingPlanType[];
}

export default function AdminPlansPrices() {
  const { toast } = useToast();
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);

  // Form state
  const [planName, setPlanName] = useState("");
  const [planBatch, setPlanBatch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Record<string, boolean>>({
    free: false,
    one_output: false,
    onetime: false,
    monthly: false,
    yearly: false,
    trial: false,
  });
  const [prices, setPrices] = useState<Record<string, string>>({
    free: "0",
    one_output: "",
    onetime: "",
    monthly: "",
    yearly: "",
    trial: "",
  });
  const [trialDays, setTrialDays] = useState("");

  // Fetch apps
  const { data: appsData, isLoading: appsLoading } = useQuery<{ apps: App[] }>({
    queryKey: ["/api/admin/pricing/apps"],
  });

  // Fetch plans for selected app
  const { data: plansData, isLoading: plansLoading } = useQuery<{ plans: PricingPlan[] }>({
    queryKey: ["/api/admin/pricing/plans", selectedAppId],
    enabled: !!selectedAppId,
  });

  // Create/Update plan mutation
  const savePlanMutation = useMutation({
    mutationFn: async () => {
      const pricingTypes = Object.entries(selectedTypes)
        .filter(([_, selected]) => selected)
        .map(([type, _]) => ({
          type,
          price: prices[type] || "0",
          billingInterval: type === "monthly" ? "monthly" : type === "yearly" ? "yearly" : type === "onetime" ? "onetime" : undefined,
          trialDays: type === "trial" ? parseInt(trialDays) || 0 : undefined,
        }));

      const planData = {
        appId: selectedAppId,
        planName,
        planBatch,
        basePrice: prices[Object.keys(selectedTypes).find(k => selectedTypes[k]) || "free"] || "0",
        currency: "INR",
        pricingTypes,
      };

      if (editingPlan) {
        const response = await apiRequest(
          `/api/admin/pricing/plans/${editingPlan.id}`,
          "PATCH",
          planData
        );
        return response.json();
      } else {
        const response = await apiRequest(
          "/api/admin/pricing/plans",
          "POST",
          planData
        );
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/plans", selectedAppId] });
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: editingPlan ? "Plan Updated!" : "Plan Created!",
        description: `Pricing plan has been ${editingPlan ? "updated" : "created"} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save plan",
        variant: "destructive",
      });
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest(
        `/api/admin/pricing/plans/${planId}`,
        "DELETE"
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/plans", selectedAppId] });
      toast({
        title: "Plan Deleted!",
        description: "Pricing plan has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setPlanName("");
    setPlanBatch("");
    setSelectedTypes({
      free: false,
      one_output: false,
      onetime: false,
      monthly: false,
      yearly: false,
      trial: false,
    });
    setPrices({
      free: "0",
      one_output: "",
      onetime: "",
      monthly: "",
      yearly: "",
      trial: "",
    });
    setTrialDays("");
    setEditingPlan(null);
  };

  const handleCreateNew = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const handleEdit = (plan: PricingPlan) => {
    setPlanName(plan.planName);
    setPlanBatch(plan.planBatch);
    
    const types: Record<string, boolean> = {
      free: false,
      one_output: false,
      onetime: false,
      monthly: false,
      yearly: false,
      trial: false,
    };
    const priceVals: Record<string, string> = { ...prices };

    plan.pricingTypes.forEach(pt => {
      types[pt.type] = true;
      priceVals[pt.type] = pt.price;
      if (pt.type === "trial" && pt.trialDays) {
        setTrialDays(pt.trialDays.toString());
      }
    });

    setSelectedTypes(types);
    setPrices(priceVals);
    setEditingPlan(plan);
    setShowCreateDialog(true);
  };

  const handleSave = () => {
    if (!planName.trim()) {
      toast({
        title: "Validation Error",
        description: "Plan name is required",
        variant: "destructive",
      });
      return;
    }

    if (!Object.values(selectedTypes).some(v => v)) {
      toast({
        title: "Validation Error",
        description: "Please select at least one pricing type",
        variant: "destructive",
      });
      return;
    }

    savePlanMutation.mutate();
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    setSelectedTypes(prev => ({ ...prev, [type]: checked }));
    if (type === "free" && checked) {
      setPrices(prev => ({ ...prev, free: "0" }));
    }
  };

  const handlePriceChange = (type: string, value: string) => {
    setPrices(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-blue-600" />
          Pricing Plans Setup
        </h1>
        <p className="text-muted-foreground mt-2">Configure pricing plans for all WytNet apps</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Select App
            </div>
            {selectedAppId && (
              <Button onClick={handleCreateNew} className="gap-2" data-testid="button-new-plan">
                <Plus className="h-4 w-4" />
                New Plan
              </Button>
            )}
          </CardTitle>
          <CardDescription>Choose an app to manage its pricing plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="app-select" className="min-w-24">App Name</Label>
              <Select
                value={selectedAppId}
                onValueChange={setSelectedAppId}
              >
                <SelectTrigger className="flex-1" data-testid="select-app">
                  <SelectValue placeholder="Select an app" />
                </SelectTrigger>
                <SelectContent>
                  {appsData?.apps.map((app) => (
                    <SelectItem key={app.id} value={app.id} data-testid={`app-option-${app.slug}`}>
                      {app.icon} {app.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Plans List */}
            {selectedAppId && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Existing Plans</h3>
                {plansLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading plans...</div>
                ) : plansData?.plans && plansData.plans.length > 0 ? (
                  <div className="grid gap-4">
                    {plansData.plans.map((plan) => (
                      <Card key={plan.id} className="border-l-4 border-l-blue-600" data-testid={`plan-card-${plan.id}`}>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold text-lg">{plan.planName}</h4>
                                {plan.planBatch && (
                                  <Badge variant="outline" className="text-lg">{plan.planBatch}</Badge>
                                )}
                                {plan.isFeatured && (
                                  <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                                )}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {plan.pricingTypes.map((pt) => (
                                  <Badge key={pt.id} variant="secondary" className="text-sm">
                                    {pt.type.replace('_', ' ').toUpperCase()}: ₹{pt.price}
                                    {pt.billingInterval && ` (${pt.billingInterval})`}
                                    {pt.trialDays && ` - ${pt.trialDays} days`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(plan)}
                                data-testid={`edit-plan-${plan.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deletePlanMutation.mutate(plan.id)}
                                disabled={deletePlanMutation.isPending}
                                data-testid={`delete-plan-${plan.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    No pricing plans yet. Click "New Plan" to create one.
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit" : "Create New"} Pricing Plan</DialogTitle>
            <DialogDescription>
              Configure pricing options for the selected app
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name *</Label>
                <Input
                  id="plan-name"
                  placeholder="e.g., Free, Plus, Pro"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  data-testid="input-plan-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-batch">Plan Batch</Label>
                <Input
                  id="plan-batch"
                  placeholder="e.g., ₹, +, -"
                  value={planBatch}
                  onChange={(e) => setPlanBatch(e.target.value)}
                  data-testid="input-plan-batch"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold">Pricing Types</h4>
              <p className="text-sm text-muted-foreground">
                Note: Primary Currency is INR
              </p>

              {/* Free */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="type-free"
                    checked={selectedTypes.free}
                    onCheckedChange={(checked) => handleTypeChange("free", !!checked)}
                    data-testid="checkbox-free"
                  />
                  <Label htmlFor="type-free" className="cursor-pointer font-medium">
                    Free
                  </Label>
                </div>
              </div>

              {/* One Output (Pay per use) */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="type-one-output"
                    checked={selectedTypes.one_output}
                    onCheckedChange={(checked) => handleTypeChange("one_output", !!checked)}
                    data-testid="checkbox-one-output"
                  />
                  <Label htmlFor="type-one-output" className="cursor-pointer font-medium">
                    One Output (Pay per use)
                  </Label>
                </div>
                {selectedTypes.one_output && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="₹ 10"
                      value={prices.one_output}
                      onChange={(e) => handlePriceChange("one_output", e.target.value)}
                      className="w-32"
                      data-testid="input-price-one-output"
                    />
                  </div>
                )}
              </div>

              {/* Onetime */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="type-onetime"
                    checked={selectedTypes.onetime}
                    onCheckedChange={(checked) => handleTypeChange("onetime", !!checked)}
                    data-testid="checkbox-onetime"
                  />
                  <Label htmlFor="type-onetime" className="cursor-pointer font-medium">
                    Onetime Purchase
                  </Label>
                </div>
                {selectedTypes.onetime && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="₹ 499"
                      value={prices.onetime}
                      onChange={(e) => handlePriceChange("onetime", e.target.value)}
                      className="w-32"
                      data-testid="input-price-onetime"
                    />
                  </div>
                )}
              </div>

              {/* Monthly */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="type-monthly"
                    checked={selectedTypes.monthly}
                    onCheckedChange={(checked) => handleTypeChange("monthly", !!checked)}
                    data-testid="checkbox-monthly"
                  />
                  <Label htmlFor="type-monthly" className="cursor-pointer font-medium">
                    Monthly Subscription
                  </Label>
                </div>
                {selectedTypes.monthly && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="₹ 99/mo"
                      value={prices.monthly}
                      onChange={(e) => handlePriceChange("monthly", e.target.value)}
                      className="w-32"
                      data-testid="input-price-monthly"
                    />
                  </div>
                )}
              </div>

              {/* Yearly */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="type-yearly"
                    checked={selectedTypes.yearly}
                    onCheckedChange={(checked) => handleTypeChange("yearly", !!checked)}
                    data-testid="checkbox-yearly"
                  />
                  <Label htmlFor="type-yearly" className="cursor-pointer font-medium">
                    Yearly Subscription
                  </Label>
                </div>
                {selectedTypes.yearly && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="₹ 999/yr"
                      value={prices.yearly}
                      onChange={(e) => handlePriceChange("yearly", e.target.value)}
                      className="w-32"
                      data-testid="input-price-yearly"
                    />
                  </div>
                )}
              </div>

              {/* Trial Days */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="type-trial"
                    checked={selectedTypes.trial}
                    onCheckedChange={(checked) => handleTypeChange("trial", !!checked)}
                    data-testid="checkbox-trial"
                  />
                  <Label htmlFor="type-trial" className="cursor-pointer font-medium">
                    Trial Days
                  </Label>
                </div>
                {selectedTypes.trial && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="7 days"
                      value={trialDays}
                      onChange={(e) => setTrialDays(e.target.value)}
                      className="w-32"
                      data-testid="input-trial-days"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={savePlanMutation.isPending}
              data-testid="button-cancel-plan"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={savePlanMutation.isPending}
              data-testid="button-save-plan"
            >
              {savePlanMutation.isPending ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
