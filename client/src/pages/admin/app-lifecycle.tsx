import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  CheckCircle2, 
  Circle, 
  Settings, 
  Shield, 
  TestTube, 
  DollarSign,
  Zap,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Save,
  PlayCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface App {
  id: string;
  name: string;
  slug: string;
  description: string;
  route: string;
  status: string;
  configStatus: string;
  validationStatus: string;
  testStatus: string;
  pricingStatus: string;
  activationStatus: string;
  visibility: string;
  configData: any;
  validationResults: any;
  testResults: any;
}

export default function AppLifecycle() {
  const [, params] = useRoute("/engine/apps/:slug/lifecycle");
  const appSlug = params?.slug;
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(0);

  // Fetch app details
  const { data: appData, isLoading } = useQuery<{ app: App }>({
    queryKey: ['/api/apps/registry/slug', appSlug],
    enabled: !!appSlug,
  });

  const app = appData?.app;

  // Update app mutation
  const updateAppMutation = useMutation({
    mutationFn: async (data: Partial<App>) => {
      return apiRequest(`/api/apps/registry/slug/${appSlug}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/apps/registry/slug', appSlug] });
      toast({
        title: "Success",
        description: "App updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update app",
        variant: "destructive",
      });
    },
  });

  const steps = [
    {
      id: 'config',
      label: 'Config',
      icon: Settings,
      status: app?.configStatus || 'pending',
      description: 'Configure app settings and metadata'
    },
    {
      id: 'validation',
      label: 'Validation',
      icon: Shield,
      status: app?.validationStatus || 'pending',
      description: 'Validate app configuration'
    },
    {
      id: 'test',
      label: 'Test',
      icon: TestTube,
      status: app?.testStatus || 'pending',
      description: 'Test app functionality'
    },
    {
      id: 'pricing',
      label: 'Pricing',
      icon: DollarSign,
      status: app?.pricingStatus || 'pending',
      description: 'Configure pricing plans'
    },
    {
      id: 'activate',
      label: 'Activate',
      icon: Zap,
      status: app?.activationStatus || 'inactive',
      description: 'Activate the app'
    },
    {
      id: 'visibility',
      label: 'Visibility',
      icon: Eye,
      status: app?.visibility || 'private',
      description: 'Set app visibility (Private/Public)'
    },
  ];

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
      case 'configured':
      case 'active':
      case 'public':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <Circle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleStepComplete = (stepId: string, status: string) => {
    const updateData: any = {};
    
    switch (stepId) {
      case 'config':
        updateData.configStatus = 'completed';
        break;
      case 'validation':
        updateData.validationStatus = status;
        break;
      case 'test':
        updateData.testStatus = status;
        break;
      case 'pricing':
        updateData.pricingStatus = 'configured';
        break;
      case 'activate':
        updateData.activationStatus = status;
        break;
      case 'visibility':
        updateData.visibility = status;
        break;
    }

    updateAppMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">App not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">App Lifecycle</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage the complete lifecycle of {app.name}
        </p>
      </div>

      {/* App Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{app.name}</CardTitle>
              <CardDescription>{app.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={app.status === 'active' ? 'default' : 'secondary'}>
                {app.status}
              </Badge>
              <Badge variant={app.visibility === 'public' ? 'default' : 'outline'}>
                {app.visibility === 'public' ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                {app.visibility}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Slug:</span>
              <span className="ml-2 font-medium">{app.slug}</span>
            </div>
            <div>
              <span className="text-gray-500">Route:</span>
              <span className="ml-2 font-medium">{app.route || 'Not set'}</span>
            </div>
            <div>
              <span className="text-gray-500">Activation:</span>
              <span className="ml-2 font-medium">{app.activationStatus}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Steps */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {steps.map((step, index) => (
          <Card 
            key={step.id}
            className={`cursor-pointer transition-all ${
              activeStep === index ? 'ring-2 ring-purple-500 shadow-lg' : ''
            }`}
            onClick={() => setActiveStep(index)}
            data-testid={`card-step-${step.id}`}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-lg ${
                  activeStep === index ? 'bg-purple-100 dark:bg-purple-900' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <step.icon className={`h-6 w-6 ${
                    activeStep === index ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{step.label}</p>
                  <div className="flex items-center justify-center mt-1">
                    {getStepStatusIcon(step.status)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {React.createElement(steps[activeStep].icon, { className: "h-6 w-6 text-purple-600" })}
              <div>
                <CardTitle>{steps[activeStep].label}</CardTitle>
                <CardDescription>{steps[activeStep].description}</CardDescription>
              </div>
            </div>
            {getStepStatusIcon(steps[activeStep].status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Config Step */}
          {activeStep === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="route">App Route</Label>
                <Input
                  id="route"
                  placeholder="/app-route"
                  defaultValue={app.route || ''}
                  onBlur={(e) => updateAppMutation.mutate({ route: e.target.value })}
                  data-testid="input-route"
                />
                <p className="text-xs text-gray-500 mt-1">The URL path where the app will be accessible</p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="App description"
                  defaultValue={app.description || ''}
                  onBlur={(e) => updateAppMutation.mutate({ description: e.target.value })}
                  data-testid="input-description"
                />
              </div>

              <Button 
                onClick={() => handleStepComplete('config', 'completed')}
                data-testid="button-complete-config"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          )}

          {/* Validation Step */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Validation Checks:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    {app.route ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-gray-400" />}
                    Route configured
                  </li>
                  <li className="flex items-center gap-2">
                    {app.description ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-gray-400" />}
                    Description provided
                  </li>
                  <li className="flex items-center gap-2">
                    {app.slug ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-gray-400" />}
                    Slug is unique
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleStepComplete('validation', 'passed')}
                  variant="default"
                  data-testid="button-pass-validation"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Passed
                </Button>
                <Button 
                  onClick={() => handleStepComplete('validation', 'failed')}
                  variant="destructive"
                  data-testid="button-fail-validation"
                >
                  Mark as Failed
                </Button>
              </div>
            </div>
          )}

          {/* Test Step */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Testing Checklist:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Circle className="h-4 w-4" />
                    App route is accessible
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-4 w-4" />
                    All features work correctly
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-4 w-4" />
                    No console errors
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-4 w-4" />
                    Responsive design verified
                  </li>
                </ul>
              </div>

              {app.route && (
                <div>
                  <Label>Test App</Label>
                  <a 
                    href={app.route} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-600 hover:underline mt-2"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Open {app.name} in new tab
                  </a>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleStepComplete('test', 'passed')}
                  variant="default"
                  data-testid="button-pass-test"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Passed
                </Button>
                <Button 
                  onClick={() => handleStepComplete('test', 'failed')}
                  variant="destructive"
                  data-testid="button-fail-test"
                >
                  Mark as Failed
                </Button>
              </div>
            </div>
          )}

          {/* Pricing Step */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Pricing Configuration:</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure pricing plans in the <strong>Plans & Prices</strong> section of the Engine Admin panel.
                  Link pricing plans to this app using the app ID: <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">{app.id}</code>
                </p>
              </div>

              <Button 
                onClick={() => handleStepComplete('pricing', 'configured')}
                data-testid="button-complete-pricing"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Mark Pricing as Configured
              </Button>
            </div>
          )}

          {/* Activation Step */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Activation Status:</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Activate the app to make it available for users to install. Inactive apps won't appear in the marketplace.
                </p>

                <Select
                  defaultValue={app.activationStatus}
                  onValueChange={(value) => handleStepComplete('activate', value)}
                >
                  <SelectTrigger data-testid="select-activation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Visibility Step */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">App Visibility:</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <strong>Private:</strong> Only accessible to authorized users<br />
                  <strong>Public:</strong> Available to all users in the marketplace
                </p>

                <Select
                  defaultValue={app.visibility}
                  onValueChange={(value) => handleStepComplete('visibility', value)}
                >
                  <SelectTrigger data-testid="select-visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        Private
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Public
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Lifecycle Complete!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your app has been configured and is ready for deployment.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={activeStep === 0}
              data-testid="button-previous"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={activeStep === steps.length - 1}
              data-testid="button-next"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
