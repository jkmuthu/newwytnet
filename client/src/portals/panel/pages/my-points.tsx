import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award, 
  TrendingUp, 
  Users, 
  Copy, 
  CheckCircle, 
  Clock, 
  Gift,
  Trophy,
  Star,
  Zap,
  Share2,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  metadata: any;
  createdAt: string;
}

interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
}

export default function MyPoints() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch points wallet data
  const { data: walletResponse, isLoading: isLoadingWallet } = useQuery<{
    success: boolean;
    data: {
      wallet: { balance: number; lifetimeEarned: number; lifetimeSpent: number };
      recentTransactions: PointsTransaction[];
    };
  }>({
    queryKey: ['/api/points/wallet'],
  });

  // Fetch transaction history
  const { data: transactionsResponse, isLoading: isLoadingTransactions } = useQuery<{
    success: boolean;
    transactions: PointsTransaction[];
  }>({
    queryKey: ['/api/points/transactions'],
  });

  // Fetch referral code
  const { data: referralCodeResponse, isLoading: isLoadingReferralCode } = useQuery<{
    success: boolean;
    referralCode: string;
    referralLink: string;
  }>({
    queryKey: ['/api/points/referral/code'],
  });

  // Fetch user's referrals
  const { data: referralsResponse, isLoading: isLoadingReferrals } = useQuery<{
    success: boolean;
    referrals: Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      profileImageUrl: string;
      createdAt: string;
    }>;
    totalReferrals: number;
  }>({
    queryKey: ['/api/points/referrals'],
  });

  // Fetch points config for opportunities
  const { data: pointsConfigResponse } = useQuery<{
    success: boolean;
    configs: Array<{ id: string; action: string; points: number; isActive: boolean }>;
  }>({
    queryKey: ['/api/points/config'],
  });

  // Extract data from responses
  const walletData = walletResponse?.data;
  const transactions = transactionsResponse?.transactions || [];
  const referralCode = referralCodeResponse?.referralCode;
  const referralLink = referralCodeResponse?.referralLink;
  const referrals = referralsResponse?.referrals || [];
  const totalReferrals = referralsResponse?.totalReferrals || 0;

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      toast({ title: "Copied!", description: "Referral code copied to clipboard" });
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      toast({ title: "Copied!", description: "Referral link copied to clipboard" });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareReferral = () => {
    if (navigator.share && referralLink) {
      navigator.share({
        title: 'Join WytNet with my referral link',
        text: 'Join WytNet and get points as a welcome bonus!',
        url: referralLink,
      }).catch(() => {
        // Fallback to copy
        copyReferralLink();
      });
    } else {
      copyReferralLink();
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'registration':
      case 'welcome':
        return <Gift className="h-4 w-4" />;
      case 'profile_50':
      case 'profile_75':
      case 'profile_100':
        return <Star className="h-4 w-4" />;
      case 'daily_login':
        return <Clock className="h-4 w-4" />;
      case 'referral_join':
        return <Users className="h-4 w-4" />;
      case 'post_need':
      case 'post_offer':
        return <Zap className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">My Points</h1>
        <p className="text-muted-foreground">Manage your WytPoints, track earnings, and grow through referrals</p>
      </div>

      {/* Points Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Current Balance</p>
                <p className="text-4xl font-bold mt-2">
                  {isLoadingWallet ? '...' : walletData?.wallet?.balance || 0}
                </p>
                <p className="text-sm opacity-80 mt-1">WytPoints</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Trophy className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  +{isLoadingWallet ? '...' : walletData?.wallet?.lifetimeEarned || 0}
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
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  -{isLoadingWallet ? '...' : walletData?.wallet?.lifetimeSpent || 0}
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earn" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earn" data-testid="tab-earn-points">
            <Award className="h-4 w-4 mr-2" />
            Earn Points
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-points-history">
            <Clock className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="referrals" data-testid="tab-referrals">
            <Users className="h-4 w-4 mr-2" />
            Referrals
          </TabsTrigger>
        </TabsList>

        {/* Earn Points Tab */}
        <TabsContent value="earn" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Ways to Earn Points
              </CardTitle>
              <CardDescription>Complete these actions to earn WytPoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pointsConfigResponse?.configs && pointsConfigResponse.configs.length > 0 ? (
                  pointsConfigResponse.configs
                    .filter(config => config.isActive)
                    .map((config) => (
                      <div
                        key={config.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`opportunity-${config.action}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 rounded-full border-2 border-blue-500" />
                          <div>
                            <p className="font-medium capitalize">{config.action.replace(/_/g, ' ')}</p>
                            <p className="text-sm text-muted-foreground">Earn points by this action</p>
                          </div>
                        </div>
                        <Badge
                          variant="default"
                          className="text-lg px-3 py-1"
                        >
                          +{config.points}
                        </Badge>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No earning opportunities available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>Your complete points activity</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No transactions yet</div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      data-testid={`transaction-${transaction.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.amount > 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                        }`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.createdAt), 'MMM dd, yyyy • hh:mm a')}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={transaction.amount > 0 ? "default" : "destructive"}
                        className="text-lg"
                      >
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
          {/* Referral Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold">{totalReferrals}</p>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-2xl font-bold">{totalReferrals}</p>
                  <p className="text-sm text-muted-foreground">Active Referrals</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="bg-orange-100 dark:bg-orange-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Your Referral Link
              </CardTitle>
              <CardDescription>Invite friends and earn points for each successful referral</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Referral Code</label>
                <div className="flex gap-2">
                  <Input
                    value={isLoadingReferralCode ? 'Loading...' : referralCode || 'N/A'}
                    readOnly
                    className="font-mono"
                    data-testid="input-referral-code"
                  />
                  <Button
                    onClick={copyReferralCode}
                    variant="outline"
                    size="icon"
                    disabled={!referralCode}
                    data-testid="button-copy-code"
                  >
                    {copiedCode ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Referral Link</label>
                <div className="flex gap-2">
                  <Input
                    value={isLoadingReferralCode ? 'Loading...' : referralLink || 'N/A'}
                    readOnly
                    data-testid="input-referral-link"
                  />
                  <Button
                    onClick={copyReferralLink}
                    variant="outline"
                    size="icon"
                    data-testid="button-copy-link"
                  >
                    {copiedLink ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={shareReferral}
                    data-testid="button-share"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Share your referral link with friends</li>
                  <li>• They sign up using your link and get 5 welcome points</li>
                  <li>• You earn 5 points when they complete their registration</li>
                  <li>• Track all your referrals in real-time</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
