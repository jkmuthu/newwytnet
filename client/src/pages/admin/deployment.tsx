import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Rocket, Server, CheckCircle, Clock, AlertCircle, 
  ExternalLink, History, Loader2, Play, Settings, Save, Copy, Globe
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface DeploymentHistory {
  id: string;
  version: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  buildLogs: string;
  triggeredBy: string;
}

interface ProductionSettings {
  serverIp: string;
  productionUrl: string;
  sshUser: string;
  deployPath: string;
}

export default function DeploymentPage() {
  const { toast } = useToast();
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [settings, setSettings] = useState<ProductionSettings>({
    serverIp: '',
    productionUrl: '',
    sshUser: 'root',
    deployPath: '/var/www/wytnet',
  });

  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useQuery<{ 
    success: boolean; 
    latestDeployment: DeploymentHistory | null;
    serverConfigured: boolean;
    productionUrl: string;
    serverIp: string | null;
    settings?: ProductionSettings;
  }>({
    queryKey: ['/api/admin/deployments/status'],
  });

  const { data: historyData, isLoading: historyLoading } = useQuery<{ success: boolean; deployments: DeploymentHistory[] }>({
    queryKey: ['/api/admin/deployments'],
  });

  useEffect(() => {
    if (statusData?.settings) {
      setSettings(statusData.settings);
    } else if (statusData?.serverIp || statusData?.productionUrl) {
      setSettings(prev => ({
        ...prev,
        serverIp: statusData.serverIp || '',
        productionUrl: statusData.productionUrl || '',
      }));
    }
  }, [statusData]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: ProductionSettings) => {
      return apiRequest('/api/admin/deployments/settings', 'POST', newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deployments/status'] });
      toast({
        title: "Settings Saved",
        description: "Production server settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
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
  const serverConfigured = statusData?.serverConfigured || !!settings.serverIp;
  const productionUrl = settings.productionUrl || statusData?.productionUrl;
  const history = historyData?.deployments || [];

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case 'running':
      case 'active':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
      case 'in_progress':
      case 'building':
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
      case 'building':
        return <Badge className="bg-blue-500">Running</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge variant="secondary">{statusValue}</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard" });
  };

  const setupScript = `#!/bin/bash
# WytNet Production Server Setup Script
# Run this on your DigitalOcean droplet (Ubuntu 22.04)

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Create app directory
sudo mkdir -p ${settings.deployPath || '/var/www/wytnet'}
sudo chown -R $USER:$USER ${settings.deployPath || '/var/www/wytnet'}

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Configure firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "Server setup complete! Now configure Cloudflare DNS to point to this server."
echo "Server IP: $(curl -s ifconfig.me)"`;

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

      <Tabs defaultValue={serverConfigured ? "deploy" : "settings"} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="deploy" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Deploy
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Server Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="space-y-6">
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
                          <span className="font-semibold capitalize">
                            {serverConfigured ? 'Configured' : 'Not Configured'}
                          </span>
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
                  disabled={isDeploying || deployMutation.isPending || !serverConfigured}
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
                {!serverConfigured && (
                  <p className="text-xs text-amber-600 text-center">
                    Configure server settings first to enable deployment
                  </p>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  This will deploy the current development version to production
                </p>
              </CardContent>
            </Card>
          </div>

          {!serverConfigured && (
            <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-900 dark:text-amber-100">Server Setup Required</AlertTitle>
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                Go to the "Server Settings" tab to configure your production server details before deploying.
              </AlertDescription>
            </Alert>
          )}

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
                  <p className="text-sm">Configure server settings and click "Publish to Production"</p>
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
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Production Server Configuration
              </CardTitle>
              <CardDescription>
                Configure your production server details for deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="serverIp">Server IP Address</Label>
                  <Input
                    id="serverIp"
                    placeholder="143.110.xxx.xxx"
                    value={settings.serverIp}
                    onChange={(e) => setSettings(prev => ({ ...prev, serverIp: e.target.value }))}
                    data-testid="input-server-ip"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your DigitalOcean droplet IP address
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productionUrl">Production URL</Label>
                  <Input
                    id="productionUrl"
                    placeholder="https://wytnet.com"
                    value={settings.productionUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, productionUrl: e.target.value }))}
                    data-testid="input-production-url"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your production domain with https://
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sshUser">SSH Username</Label>
                  <Input
                    id="sshUser"
                    placeholder="root"
                    value={settings.sshUser}
                    onChange={(e) => setSettings(prev => ({ ...prev, sshUser: e.target.value }))}
                    data-testid="input-ssh-user"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usually "root" for DigitalOcean droplets
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deployPath">Deployment Path</Label>
                  <Input
                    id="deployPath"
                    placeholder="/var/www/wytnet"
                    value={settings.deployPath}
                    onChange={(e) => setSettings(prev => ({ ...prev, deployPath: e.target.value }))}
                    data-testid="input-deploy-path"
                  />
                  <p className="text-xs text-muted-foreground">
                    Where the app files will be stored on the server
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => saveSettingsMutation.mutate(settings)}
                disabled={saveSettingsMutation.isPending || !settings.serverIp}
                data-testid="button-save-settings"
              >
                {saveSettingsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Server Setup Guide
              </CardTitle>
              <CardDescription>
                One-time setup for your DigitalOcean server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900 dark:text-blue-100">First-Time Setup Instructions</AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-200 space-y-2">
                  <p><strong>Step 1:</strong> Create a DigitalOcean Droplet (Ubuntu 22.04, $12/month Basic plan)</p>
                  <p><strong>Step 2:</strong> Copy the server IP and paste it above</p>
                  <p><strong>Step 3:</strong> SSH into your server and run the setup script below</p>
                  <p><strong>Step 4:</strong> Set up Cloudflare DNS to point your domain to the server IP</p>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Server Setup Script</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(setupScript)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Script
                  </Button>
                </div>
                <Textarea 
                  value={setupScript}
                  readOnly
                  className="font-mono text-xs h-64"
                />
                <p className="text-xs text-muted-foreground">
                  SSH into your server (ssh root@{settings.serverIp || 'YOUR_IP'}) and paste this script
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
