import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RazorpayCheckout from '@/components/payments/RazorpayCheckout';
import PaymentHistory from '@/components/payments/PaymentHistory';
import { Check, Star, Zap, Crown, CreditCard, History, Package } from 'lucide-react';

const samplePlans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals getting started',
    price: '₹299',
    originalPrice: '₹399',
    interval: 'month',
    badge: 'Most Popular',
    features: [
      '5 WytApps modules',
      '1 Custom WytApp',
      'Basic Analytics',
      'Email Support',
      '5GB Storage',
    ],
    recommended: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing businesses and teams',
    price: '₹799',
    originalPrice: '₹999',
    interval: 'month',
    badge: 'Best Value',
    features: [
      'Unlimited WytApps',
      '10 Custom WytApps',
      'Advanced Analytics',
      'Priority Support',
      '50GB Storage',
      'API Access',
      'Custom Branding',
    ],
    recommended: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: '₹1,999',
    originalPrice: '₹2,499',
    interval: 'month',
    badge: 'Premium',
    features: [
      'Everything in Professional',
      'Unlimited WytApps',
      'White-label Solution',
      'Dedicated Support',
      '500GB Storage',
      'Custom Integrations',
      'SLA Guarantee',
      'Advanced Security',
    ],
    recommended: false,
  },
];

export default function PaymentsPage() {
  const { isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please log in to access payment features
            </p>
            <Button>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = (data: any) => {
    setShowCheckout(false);
    setSelectedPlan(null);
    // Refresh payment history or redirect to success page
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Unlock the full potential of WytNet with our flexible pricing plans
        </p>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="checkout" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Checkout
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {samplePlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.recommended 
                    ? 'border-blue-500 shadow-lg scale-105' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {plan.id === 'starter' && <Zap className="h-5 w-5 text-blue-500" />}
                    {plan.id === 'professional' && <Star className="h-5 w-5 text-green-500" />}
                    {plan.id === 'enterprise' && <Crown className="h-5 w-5 text-purple-500" />}
                    {plan.name}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-gray-500 line-through text-sm">
                        {plan.originalPrice}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">per {plan.interval}</p>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanSelect(plan.id)}
                    className="w-full"
                    variant={plan.recommended ? 'default' : 'outline'}
                  >
                    Choose {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="checkout">
          <div className="max-w-md mx-auto">
            {showCheckout && selectedPlan ? (
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Selected Plan</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {samplePlans.find(p => p.id === selectedPlan)?.name} - {samplePlans.find(p => p.id === selectedPlan)?.price}
                  </p>
                </Card>
                
                <RazorpayCheckout
                  amount={299} // This should be dynamic based on selected plan
                  planId={selectedPlan}
                  onSuccess={handlePaymentSuccess}
                  onError={(error) => console.error('Payment error:', error)}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Select a plan to proceed with checkout
                  </p>
                  <Button onClick={() => {/* Switch to plans tab */}}>
                    Browse Plans
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <PaymentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}