import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Coins, TrendingUp, Users, Activity, Plus, Minus, RefreshCw } from "lucide-react";

// Form schema for manual balance adjustment
const adjustBalanceSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  amount: z.number().int("Amount must be an integer"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

type AdjustBalanceForm = z.infer<typeof adjustBalanceSchema>;

export default function AdminWytPoints() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("statistics");
  
  const { user } = useWhatsAppAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch statistics
  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/points/statistics'],
  });

  // Fetch all wallets
  const { data: walletsData, isLoading: walletsLoading } = useQuery({
    queryKey: ['/api/admin/points/wallets'],
  });

  // Fetch specific user wallet details
  const { data: userWalletData, isLoading: userWalletLoading } = useQuery({
    queryKey: ['/api/admin/points/wallet', selectedUserId],
    enabled: !!selectedUserId && activeTab === "user-details",
  });

  // Adjust balance mutation
  const adjustBalanceMutation = useMutation({
    mutationFn: async (data: AdjustBalanceForm) => {
      return apiRequest('POST', '/api/admin/points/adjust', data);
    },
    onSuccess: () => {
      toast({
        title: "Balance adjusted successfully",
        description: "The user's points balance has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/points/wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/points/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/points/statistics'] });
      setAdjustDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to adjust balance",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Form
  const form = useForm<AdjustBalanceForm>({
    resolver: zodResolver(adjustBalanceSchema),
    defaultValues: {
      userId: "",
      amount: 0,
      reason: "",
    },
  });

  const handleAdjustBalance = (data: AdjustBalanceForm) => {
    adjustBalanceMutation.mutate(data);
  };

  const handleViewUserDetails = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab("user-details");
  };

  const wallets = walletsData?.success ? walletsData.wallets : [];
  const stats = statistics?.success ? statistics.data : null;
  const userWallet = userWalletData?.success ? userWalletData.data : null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 overflow-y-auto">
        <Header 
          user={user} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <div className="p-4 lg:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Coins className="h-8 w-8 text-yellow-600" />
                WytPoints Management
              </h1>
              <p className="text-muted-foreground">Monitor and manage the WytPoints economy system</p>
            </div>
            <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-adjust-balance">
                  <Plus className="h-4 w-4 mr-2" />
                  Adjust Balance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manual Balance Adjustment</DialogTitle>
                  <DialogDescription>
                    Manually credit or debit points from a user's wallet. Use positive numbers to credit, negative to debit.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAdjustBalance)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User ID</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter user ID" data-testid="input-user-id" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="e.g. 100 or -50"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-amount"
                            />
                          </FormControl>
                          <FormDescription>
                            Positive for credit, negative for debit
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="e.g. Compensation for reported issue"
                              rows={3}
                              data-testid="textarea-reason"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAdjustDialogOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={adjustBalanceMutation.isPending}
                        data-testid="button-submit"
                      >
                        {adjustBalanceMutation.isPending ? "Processing..." : "Adjust Balance"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="statistics" data-testid="tab-statistics">
                <TrendingUp className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
              <TabsTrigger value="wallets" data-testid="tab-wallets">
                <Users className="h-4 w-4 mr-2" />
                All Wallets
              </TabsTrigger>
              <TabsTrigger value="user-details" data-testid="tab-user-details" disabled={!selectedUserId}>
                <Activity className="h-4 w-4 mr-2" />
                User Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="statistics" className="space-y-4">
              {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-8 bg-muted animate-pulse rounded w-16"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <CardDescription>Total Wallets</CardDescription>
                      <CardTitle className="text-3xl" data-testid="text-total-wallets">
                        {stats?.totalWallets || 0}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Active user wallets</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardDescription>Total Points</CardDescription>
                      <CardTitle className="text-3xl text-yellow-600" data-testid="text-total-points">
                        {stats?.totalPointsInCirculation?.toLocaleString() || 0}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Points in circulation</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardDescription>Total Earned</CardDescription>
                      <CardTitle className="text-3xl text-green-600" data-testid="text-total-earned">
                        {stats?.totalPointsEarned?.toLocaleString() || 0}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Lifetime points earned</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardDescription>Total Spent</CardDescription>
                      <CardTitle className="text-3xl text-red-600" data-testid="text-total-spent">
                        {stats?.totalPointsSpent?.toLocaleString() || 0}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Lifetime points spent</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="wallets">
              <Card>
                <CardHeader>
                  <CardTitle>All User Wallets</CardTitle>
                  <CardDescription>View and manage user point balances</CardDescription>
                </CardHeader>
                <CardContent>
                  {walletsLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
                      ))}
                    </div>
                  ) : wallets.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No wallets found</p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead className="text-right">Lifetime Earned</TableHead>
                            <TableHead className="text-right">Lifetime Spent</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {wallets.map((wallet: any) => (
                            <TableRow key={wallet.id}>
                              <TableCell className="font-mono text-sm" data-testid={`text-user-id-${wallet.userId}`}>
                                {wallet.userId.substring(0, 8)}...
                              </TableCell>
                              <TableCell className="text-right font-semibold" data-testid={`text-balance-${wallet.userId}`}>
                                <Badge variant="outline" className="text-yellow-600">
                                  {wallet.balance.toLocaleString()} pts
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-green-600">
                                {wallet.lifetimeEarned.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-red-600">
                                {wallet.lifetimeSpent.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewUserDetails(wallet.userId)}
                                  data-testid={`button-view-${wallet.userId}`}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="user-details">
              {selectedUserId && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Wallet Details</CardTitle>
                      <CardDescription>User ID: {selectedUserId}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userWalletLoading ? (
                        <div className="space-y-2">
                          <div className="h-4 bg-muted animate-pulse rounded w-40"></div>
                          <div className="h-4 bg-muted animate-pulse rounded w-32"></div>
                        </div>
                      ) : userWallet ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Current Balance</p>
                            <p className="text-2xl font-bold text-yellow-600" data-testid="text-user-balance">
                              {userWallet.wallet?.balance.toLocaleString() || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Lifetime Earned</p>
                            <p className="text-2xl font-bold text-green-600">
                              {userWallet.wallet?.lifetimeEarned.toLocaleString() || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Lifetime Spent</p>
                            <p className="text-2xl font-bold text-red-600">
                              {userWallet.wallet?.lifetimeSpent.toLocaleString() || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Transactions</p>
                            <p className="text-2xl font-bold">
                              {userWallet.transactions?.length || 0}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Wallet not found for this user</p>
                      )}
                    </CardContent>
                  </Card>

                  {userWallet?.transactions && userWallet.transactions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>Recent points transactions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Balance After</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {userWallet.transactions.map((tx: any) => (
                                <TableRow key={tx.id}>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {new Date(tx.createdAt).toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{tx.type}</Badge>
                                  </TableCell>
                                  <TableCell className="text-sm">{tx.description || '-'}</TableCell>
                                  <TableCell className={`text-right font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                  </TableCell>
                                  <TableCell className="text-right">{tx.balanceAfter}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
