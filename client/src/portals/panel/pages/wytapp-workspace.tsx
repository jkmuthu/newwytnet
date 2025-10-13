import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, FileText, CreditCard, Zap, Package, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserApp {
  installation: {
    id: string;
    userId: string;
    appSlug: string;
    installedAt: string;
    status: string;
    subscriptionTier: string;
  };
  app: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    pricing: string;
    features: string[];
    route: string;
    status: string;
  };
}

export default function WytAppWorkspace() {
  const { slug } = useParams();

  // Fetch user's installed apps to verify access
  const { data: myAppsData, isLoading, error } = useQuery({
    queryKey: ['/api/apps/my-apps'],
  });

  const myApps: UserApp[] = (myAppsData as any)?.apps || [];
  const userApp = myApps.find(ua => ua.app.id === slug);

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Award,
      FileText,
      CreditCard,
      Zap,
      Package,
    };
    const IconComponent = icons[iconName] || Package;
    return <IconComponent className="h-8 w-8" />;
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: 'from-purple-500 to-purple-700',
      orange: 'from-orange-500 to-orange-700',
      blue: 'from-blue-500 to-blue-700',
      yellow: 'from-yellow-500 to-yellow-700',
      green: 'from-green-500 to-green-700',
    };
    return colorMap[color] || 'from-blue-500 to-purple-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (error || !userApp) {
    return (
      <div className="space-y-6">
        <Link href="/mypanel/wytapps">
          <Button variant="ghost" data-testid="button-back-apps">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My WytApps
          </Button>
        </Link>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error ? "Failed to load app workspace" : "App not found or not installed. Please install the app from My WytApps."}
          </AlertDescription>
        </Alert>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-center">
              This app is not available in your workspace
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { app, installation } = userApp;

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Link href="/mypanel/wytapps">
          <Button variant="ghost" data-testid="button-back-apps">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My WytApps
          </Button>
        </Link>
        <Badge variant={app.pricing === 'free' ? 'default' : 'secondary'}>
          {installation.subscriptionTier.toUpperCase()}
        </Badge>
      </div>

      {/* App Header */}
      <div className="flex items-center gap-4">
        <div className={`h-16 w-16 bg-gradient-to-br ${getColorClass(app.color)} rounded-xl flex items-center justify-center text-white shadow-lg`}>
          {getIconComponent(app.icon)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-app-name">
            {app.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{app.description}</p>
        </div>
      </div>

      {/* App Workspace Content */}
      <Card>
        <CardHeader>
          <CardTitle>App Workspace</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Render app-specific workspace based on app ID */}
          {slug === 'wytscore' && <WytScoreWorkspace />}
          {slug === 'wytwallet' && <WytWalletWorkspace />}
          {slug === 'wytpoints' && <WytPointsWorkspace />}
          {slug === 'wytduty' && <WytDutyWorkspace />}
          
          {/* Default workspace for unknown apps */}
          {!['wytscore', 'wytwallet', 'wytpoints', 'wytduty'].includes(slug || '') && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Workspace Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                The workspace for {app.name} is being built. Check back soon!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {app.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Individual app workspace components
function WytScoreWorkspace() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Award Points & Recognition</h3>
      <p className="text-gray-600 dark:text-gray-300">
        Use WytScore to award points to team members, track achievements, and recognize excellence.
      </p>
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardContent className="p-6">
            <Award className="h-10 w-10 text-orange-500 mb-3" />
            <h4 className="font-semibold mb-2">Total Points Awarded</h4>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Award className="h-10 w-10 text-orange-500 mb-3" />
            <h4 className="font-semibold mb-2">Awards Given</h4>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>
      <Alert>
        <AlertDescription>
          WytScore workspace features are coming soon. You'll be able to award points, create recognition badges, and track team achievements.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function WytWalletWorkspace() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Financial Management</h3>
      <p className="text-gray-600 dark:text-gray-300">
        Manage your finances, track expenses, and monitor your budget with WytWallet.
      </p>
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-6">
            <CreditCard className="h-10 w-10 text-blue-500 mb-3" />
            <h4 className="font-semibold mb-2">Balance</h4>
            <p className="text-3xl font-bold">₹0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <CreditCard className="h-10 w-10 text-green-500 mb-3" />
            <h4 className="font-semibold mb-2">Income</h4>
            <p className="text-3xl font-bold">₹0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <CreditCard className="h-10 w-10 text-red-500 mb-3" />
            <h4 className="font-semibold mb-2">Expenses</h4>
            <p className="text-3xl font-bold">₹0</p>
          </CardContent>
        </Card>
      </div>
      <Alert>
        <AlertDescription>
          WytWallet workspace features are coming soon. You'll be able to track transactions, set budgets, and generate financial reports.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function WytPointsWorkspace() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Points Economy</h3>
      <p className="text-gray-600 dark:text-gray-300">
        View and manage your WytPoints, the universal currency for rewards and redemption.
      </p>
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardContent className="p-6">
            <Zap className="h-10 w-10 text-yellow-500 mb-3" />
            <h4 className="font-semibold mb-2">Total WytPoints</h4>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Zap className="h-10 w-10 text-yellow-500 mb-3" />
            <h4 className="font-semibold mb-2">Points This Month</h4>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>
      <Alert>
        <AlertDescription>
          WytPoints workspace features are coming soon. You'll be able to view detailed points history, redeem rewards, and track earnings.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function WytDutyWorkspace() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Task Management</h3>
      <p className="text-gray-600 dark:text-gray-300">
        Organize your duties, assign tasks, and track completion with WytDuty.
      </p>
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-6">
            <FileText className="h-10 w-10 text-purple-500 mb-3" />
            <h4 className="font-semibold mb-2">Total Tasks</h4>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <FileText className="h-10 w-10 text-green-500 mb-3" />
            <h4 className="font-semibold mb-2">Completed</h4>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <FileText className="h-10 w-10 text-orange-500 mb-3" />
            <h4 className="font-semibold mb-2">Pending</h4>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>
      <Alert>
        <AlertDescription>
          WytDuty workspace features are coming soon. You'll be able to create tasks, assign duties, and monitor progress.
        </AlertDescription>
      </Alert>
    </div>
  );
}
