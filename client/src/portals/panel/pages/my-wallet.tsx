import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Calendar,
  AlertCircle 
} from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  metadata?: any;
}

export default function MyWallet() {
  // Fetch points balance
  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useQuery({
    queryKey: ["/api/wallet/balance"],
  });

  // Fetch transaction history
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useQuery({
    queryKey: ["/api/points/transactions"],
  });

  const balance = balanceError ? null : ((balanceData as any)?.balance ?? 0);
  const transactions = transactionsError ? [] : ((transactionsData as any)?.transactions || []);

  const getTransactionIcon = (amount: number) => {
    const isCredit = amount > 0;
    return isCredit ? (
      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
      </div>
    ) : (
      <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
        <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>
    );
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'post_need': 'Posted Need',
      'post_offer': 'Posted Offer',
      'profile_completion': 'Profile Completion',
      'manual_credit': 'Manual Credit',
      'manual_debit': 'Manual Debit',
      'offer_deletion_refund': 'Offer Refund',
      'recharge': 'Recharge',
    };
    return labels[type] || type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          WytWallet
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your WytPoints and view transaction history
        </p>
      </div>

      {/* Error Alerts */}
      {balanceError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load balance. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      )}

      {transactionsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load transaction history. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      )}

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-2">Available Balance</p>
              {balanceLoading ? (
                <div className="h-12 w-32 bg-purple-400 animate-pulse rounded" />
              ) : balanceError ? (
                <h2 className="text-5xl font-bold text-red-300">Error</h2>
              ) : (
                <h2 className="text-5xl font-bold" data-testid="text-balance">
                  {balance}
                  <span className="text-2xl ml-2">WytPoints</span>
                </h2>
              )}
            </div>
            <div className="bg-white/20 p-4 rounded-full">
              <Coins className="h-12 w-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid - Only show if no error */}
      {!transactionsError && !transactionsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Earned</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-earned">
                    +{transactions.filter((t: Transaction) => t.amount > 0).reduce((sum: number, t: Transaction) => sum + t.amount, 0)}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-spent">
                    -{Math.abs(transactions.filter((t: Transaction) => t.amount < 0).reduce((sum: number, t: Transaction) => sum + t.amount, 0))}
                  </p>
                </div>
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-transaction-count">
                    {transactions.length}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
              ))}
            </div>
          ) : transactionsError ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Failed to Load Transactions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Unable to retrieve your transaction history. Please refresh the page.
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Transactions Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction: Transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-testid={`transaction-${transaction.id}`}
                >
                  <div className="flex items-center gap-4">
                    {getTransactionIcon(transaction.amount)}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white" data-testid={`text-transaction-type-${transaction.id}`}>
                        {getTypeLabel(transaction.type)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-transaction-desc-${transaction.id}`}>
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy • hh:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold ${getTransactionColor(transaction.amount)}`}
                      data-testid={`text-transaction-amount-${transaction.id}`}
                    >
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">WytPoints</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
