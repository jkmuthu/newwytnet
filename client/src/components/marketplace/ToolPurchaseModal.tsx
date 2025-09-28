import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RazorpayCheckout from '@/components/payments/RazorpayCheckout';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  CreditCard, 
  Zap, 
  Clock, 
  Calendar,
  CheckCircle,
  Star,
  Users,
  Shield,
  Info
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  pricing: Array<{
    type: string;
    price: number;
    usageLimit: number | null;
    label: string;
  }>;
  features: string[];
  rating: number;
  users: number;
  owned: boolean;
}

interface ToolPurchaseModalProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
}

export default function ToolPurchaseModal({ 
  tool, 
  isOpen, 
  onClose, 
  onPurchaseSuccess 
}: ToolPurchaseModalProps) {
  const [selectedPricing, setSelectedPricing] = useState(tool.pricing[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const purchaseMutation = useMutation({
    mutationFn: async (purchaseData: any) => {
      const response = await apiRequest('/api/marketplace/purchase', 'POST', purchaseData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase successful!",
        description: `${tool.name} has been added to your collection.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/tools'] });
      onPurchaseSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFreePurchase = async () => {
    if (selectedPricing.type !== 'free') return;
    
    setIsProcessing(true);
    try {
      await purchaseMutation.mutateAsync({
        toolId: tool.id,
        pricingType: 'free',
        amount: 0,
        currency: 'INR',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpaySuccess = async (paymentData: any) => {
    setIsProcessing(true);
    try {
      await purchaseMutation.mutateAsync({
        toolId: tool.id,
        pricingType: selectedPricing.type,
        amount: selectedPricing.price,
        currency: 'INR',
        paymentId: paymentData.razorpay_payment_id,
        orderId: paymentData.razorpay_order_id,
        signature: paymentData.razorpay_signature,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPricingIcon = (type: string) => {
    switch (type) {
      case 'free': return CheckCircle;
      case 'pay_per_use': return Zap;
      case 'monthly': return Calendar;
      case 'yearly': return Calendar;
      case 'one_time': return CreditCard;
      default: return CreditCard;
    }
  };

  const getPricingColor = (type: string) => {
    switch (type) {
      case 'free': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'pay_per_use': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'monthly': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200';
      case 'yearly': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
      case 'one_time': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      QrCode: CreditCard, // Fallback for now
      Bot: CreditCard,
      Activity: CreditCard,
      Briefcase: CreditCard,
      CreditCard: CreditCard
    };
    return iconMap[iconName] || CreditCard;
  };

  const IconComponent = getIconComponent(tool.icon);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span>Purchase {tool.name}</span>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-normal">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{tool.rating}</span>
                <span>•</span>
                <Users className="h-4 w-4" />
                <span>{tool.users} users</span>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            {tool.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tool Features */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tool.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose Your Plan</h3>
            
            <Tabs defaultValue={tool.pricing[0].type} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-auto p-1">
                {tool.pricing.map((pricing) => {
                  const PricingIcon = getPricingIcon(pricing.type);
                  return (
                    <TabsTrigger
                      key={pricing.type}
                      value={pricing.type}
                      className="flex flex-col items-center gap-1 p-3 h-auto"
                      onClick={() => setSelectedPricing(pricing)}
                    >
                      <PricingIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{pricing.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {tool.pricing.map((pricing) => (
                <TabsContent key={pricing.type} value={pricing.type} className="mt-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {getPricingIcon(pricing.type)({ className: "h-5 w-5" })}
                            {pricing.label}
                          </CardTitle>
                          <CardDescription>
                            {pricing.type === 'free' && 'Get started with basic features'}
                            {pricing.type === 'pay_per_use' && 'Pay only when you use the tool'}
                            {pricing.type === 'monthly' && 'Unlimited access for one month'}
                            {pricing.type === 'yearly' && 'Best value - unlimited access for one year'}
                            {pricing.type === 'one_time' && 'Lifetime access with one-time payment'}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          {pricing.price > 0 ? (
                            <div>
                              <span className="text-2xl font-bold">₹{pricing.price}</span>
                              {pricing.type === 'monthly' && <span className="text-sm text-gray-600">/month</span>}
                              {pricing.type === 'yearly' && <span className="text-sm text-gray-600">/year</span>}
                              {pricing.type === 'pay_per_use' && <span className="text-sm text-gray-600">/use</span>}
                            </div>
                          ) : (
                            <Badge className={getPricingColor('free')}>Free</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {pricing.usageLimit && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                          <Info className="h-4 w-4 text-amber-600" />
                          <span className="text-sm text-amber-800 dark:text-amber-200">
                            Limited to {pricing.usageLimit} {pricing.usageLimit === 1 ? 'use' : 'uses'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800 dark:text-green-200">
                          Secure payment processing with Razorpay
                        </span>
                      </div>

                      {/* Purchase Button */}
                      <div className="pt-4">
                        {pricing.type === 'free' ? (
                          <Button
                            onClick={handleFreePurchase}
                            disabled={isProcessing || purchaseMutation.isPending}
                            className="w-full"
                            size="lg"
                          >
                            {isProcessing ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Adding to Collection...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Get Free Access
                              </>
                            )}
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <Button 
                              onClick={() => {
                                // For now, show a simple purchase flow
                                // Will integrate with existing RazorpayCheckout component
                                toast({
                                  title: "Purchase initiated",
                                  description: `Proceeding to payment for ${tool.name}`,
                                });
                                
                                // Simulate successful purchase for development
                                setTimeout(() => {
                                  handleRazorpaySuccess({
                                    razorpay_payment_id: 'pay_demo_' + Date.now(),
                                    razorpay_order_id: 'order_demo_' + Date.now(),
                                    razorpay_signature: 'sig_demo_' + Date.now(),
                                  });
                                }, 1000);
                              }}
                              className="w-full" 
                              size="lg"
                              disabled={isProcessing || purchaseMutation.isPending}
                            >
                              {isProcessing ? (
                                <>
                                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Purchase for ₹{pricing.price}
                                </>
                              )}
                            </Button>
                            <p className="text-xs text-gray-500 text-center">
                              Demo mode - Click to simulate purchase
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Instant Access</p>
              <p className="text-xs text-gray-600">Start using immediately</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Secure Payment</p>
              <p className="text-xs text-gray-600">256-bit SSL encryption</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">24/7 Support</p>
              <p className="text-xs text-gray-600">Help when you need it</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}