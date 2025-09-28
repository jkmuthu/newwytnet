import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';

interface RazorpayCheckoutProps {
  amount?: number;
  planId?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  interval: string;
  features: string[];
}

export default function RazorpayCheckout({ 
  amount: propAmount, 
  planId: propPlanId,
  onSuccess,
  onError 
}: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState(propPlanId || '');
  const [customAmount, setCustomAmount] = useState(propAmount?.toString() || '');
  const [currency, setCurrency] = useState('INR');
  const { toast } = useToast();

  // Load plans on component mount
  React.useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/payments/plans');
      const result = await response.json();
      
      if (result.success) {
        setPlans(result.data);
        if (result.data.length > 0 && !selectedPlanId) {
          setSelectedPlanId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const getSelectedPlan = () => {
    return plans.find(plan => plan.id === selectedPlanId);
  };

  const getPaymentAmount = () => {
    if (propAmount) return propAmount;
    if (selectedPlanId) {
      const plan = getSelectedPlan();
      return plan ? parseFloat(plan.price) : 0;
    }
    return parseFloat(customAmount) || 0;
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!getPaymentAmount() || getPaymentAmount() <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway');
      }

      // Create order
      const orderResponse = await apiRequest('/api/payments/create-order', 'POST', {
        amount: getPaymentAmount(),
        currency,
        planId: selectedPlanId || undefined,
        receipt: `WYT-${Date.now()}`,
        notes: {
          planName: getSelectedPlan()?.name || 'Custom Payment',
        },
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const orderData = await orderResponse.json();
      const { orderId, razorpayOrderId, key } = orderData.data;

      // Configure Razorpay options
      const options = {
        key,
        amount: getPaymentAmount() * 100, // Convert to paisa
        currency,
        name: 'WytNet',
        description: getSelectedPlan()?.name || 'Payment',
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await apiRequest('/api/payments/verify', 'POST', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              toast({
                title: 'Payment Successful!',
                description: 'Your payment has been processed successfully.',
              });
              
              onSuccess?.(verifyData.data);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Payment Verification Failed',
              description: error instanceof Error ? error.message : 'Please contact support',
              variant: 'destructive',
            });
            onError?.(error instanceof Error ? error.message : 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            toast({
              title: 'Payment Cancelled',
              description: 'Payment was cancelled by user',
              variant: 'destructive',
            });
          },
        },
        prefill: {
          name: 'WytNet User',
          email: 'user@wytnet.com',
        },
        theme: {
          color: '#4F46E5',
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to initiate payment',
        variant: 'destructive',
      });
      onError?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Selection */}
        {!propPlanId && plans.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="plan-select">Select Plan</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - ₹{plan.price}/{plan.interval}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Custom Amount (if no fixed amount) */}
        {!propAmount && !selectedPlanId && (
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex gap-2">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹</SelectItem>
                  <SelectItem value="USD">$</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>
          </div>
        )}

        {/* Payment Summary */}
        {(getPaymentAmount() > 0) && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <h3 className="font-medium">Payment Summary</h3>
            {getSelectedPlan() && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Plan: {getSelectedPlan()?.name}
              </div>
            )}
            <div className="text-lg font-semibold">
              {currency === 'INR' ? '₹' : '$'}{getPaymentAmount().toFixed(2)}
            </div>
          </div>
        )}

        {/* Security Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Shield className="h-4 w-4" />
          <span>Secured by Razorpay SSL encryption</span>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handlePayment}
          disabled={isLoading || getPaymentAmount() <= 0}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Pay {currency === 'INR' ? '₹' : '$'}{getPaymentAmount().toFixed(2)}
            </>
          )}
        </Button>

        {/* Accepted Payment Methods */}
        <div className="text-center text-xs text-gray-500">
          We accept all major cards, UPI, Net Banking & Wallets
        </div>
      </CardContent>
    </Card>
  );
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}