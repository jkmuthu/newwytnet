import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Rocket, Server, CheckCircle, Clock, AlertCircle, 
  RefreshCw, ExternalLink, History, Loader2, Play 
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface DeploymentStatus {
  status: string;
  lastDeployedAt: string | null;
  currentVersion: string;
  serverStatus: string;
  productionUrl: string | null;
}

interface DeploymentHistory {
  id: string;
  version: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  buildLogs: string;
  triggeredBy: string;
}

export default function DeploymentPage() {
  const { toast } = useToast();
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);

  const { data: statusData, isLoading: statusLoading } = useQuery<{ 
    success: boolean; 
    latestDeployment: DeploymentHistory | null;
    serverConfigured: boolean;
    productionUrl: string;
  }>({
    queryKey: ['/api/admin/deployments/status'],
  });

  const { data: historyData, isLoading: historyLoading } = useQuery<{ success: boolean; deployments: DeploymentHistory[] }>({
    queryKey: ['/api/admin/deployments'],
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      setIsDeploying(true);
      setDeploymentProgress(0);
      
      const interval = setInterval(() => {
        setDeploymentProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const result = await apiRequest('/api/admin/deployments/deploy', 'POST');

      clearInterval(interval);
      setDeploymentProgress(100);
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deployments/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deployments'] });
      toast({
        title: "Deployment Successful",
        description: "Your platform is now live on production!",
      });
      setTimeout(() => {
        setIsDeploying(false);
        setDeploymentProgress(0);
      }, 2000);
    },
    onError: (error: any) => {
      setIsDeploying(false);
      setDeploymentProgress(0);
      toast({
        title: "Deployment Failed",
        description: error.message || "Something went wrong during deployment",
        variant: "destructive",
      });
    },
  });

  const latestDeployment = statusData?.latestDeployment;
  const serverConfigured = statusData?.serverConfigured;
  const productionUrl = statusData?.productionUrl;
  const history = historyData?.deployments || [];

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case 'running':
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Server className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (statusValue: string) => {
    switch (statusValue) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-500">Running</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge variant="secondary">{statusValue}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            Publish to Production
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Deploy your WytNet platform to the production server
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Current Status
            </CardTitle>
            <CardDescription>
              Production server and deployment information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Server Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(serverConfigured ? 'active' : 'pending')}
                      <span className="font-semibold capitalize">{serverConfigured ? 'Configured' : 'Not Configured'}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Version</p>
                    <p className="font-semibold text-lg mt-1">{latestDeployment?.version || 'v1.0.0'}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Last Deployed</p>
                    <p className="font-semibold mt-1">
                      {latestDeployment?.completedAt 
                        ? format(new Date(latestDeployment.completedAt), 'PPp')
                        : 'Never deployed'}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Production URL</p>
                    {productionUrl && productionUrl !== 'Not configured' ? (
                      <a 
                        href={productionUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline font-semibold mt-1"
                      >
                        {productionUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="font-semibold text-muted-foreground mt-1">Not configured</p>
                    )}
                  </div>
                </div>

                {isDeploying && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Deploying to production...</span>
                      <span>{deploymentProgress}%</span>
                    </div>
                    <Progress value={deploymentProgress} className="h-2" />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Quick Deploy
            </CardTitle>
            <CardDescription>
              One-click deployment to production
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full h-14 text-lg" 
              size="lg"
              onClick={() => deployMutation.mutate()}
              disabled={isDeploying || deployMutation.isPending}
              data-testid="button-deploy"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Publish to Production
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              This will deploy the current development version to production
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">Production Server Setup Required</AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          To enable publishing, configure the production server settings. We recommend DigitalOcean (~$25/month) 
          with Cloudflare for custom domains and SSL. Contact your administrator for initial setup.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Deployment History
          </CardTitle>
          <CardDescription>
            Recent deployments and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No deployments yet</p>
              <p className="text-sm">Click "Publish to Production" to deploy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((deployment) => (
                <div 
                  key={deployment.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(deployment.status)}
                    <div>
                      <p className="font-medium">{deployment.version}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(deployment.startedAt), 'PPp')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(deployment.status)}
                    <span className="text-sm text-muted-foreground">
                      by {deployment.triggeredBy}
                    </span>
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
