import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface Payment {
  id: string;
  amount: string;
  currency: string;
  status: string;
  method: string;
  createdAt: string;
  paidAt?: string;
  receipt?: string;
  orderId?: string;
}

export default function PaymentHistory() {
  const { data: payments, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/payments/history'],
    refetchOnWindowFocus: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatAmount = (amount: string, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading payment history...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">Failed to load payment history</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const paymentList = payments?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paymentList.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No payment history found
          </div>
        ) : (
          <div className="space-y-4">
            {paymentList.map((payment: Payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {formatAmount(payment.amount, payment.currency)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                    {payment.receipt && (
                      <div className="text-xs text-gray-400">
                        Receipt: {payment.receipt}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                    {payment.method && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        via {payment.method}
                      </div>
                    )}
                  </div>
                  
                  {payment.status === 'completed' && (
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}