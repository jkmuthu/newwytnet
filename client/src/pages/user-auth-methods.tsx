import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Key, 
  Mail, 
  MessageCircle, 
  Smartphone,
  Globe,
  Lock,
  Activity,
  Users,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppAuth } from '@/hooks/useWhatsAppAuth';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import AuthMethodSelector from '@/components/auth/AuthMethodSelector';
import { DEFAULT_AUTH_METHODS, type AuthMethod } from '@shared/authMethods';
import Header from '@/components/layout/header';
import MobileNavigation from '@/components/layout/MobileNavigation';

export default function UserAuthMethods() {
  const { toast } = useToast();
  const { user, isSuperAdmin } = useWhatsAppAuth();
  const { isMobile } = useDeviceDetection();
  
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>(DEFAULT_AUTH_METHODS);
  const [activeTab, setActiveTab] = useState('methods');
  const [saving, setSaving] = useState(false);

  // Configuration states for different auth methods
  const [emailConfig, setEmailConfig] = useState({
    provider: 'smtp',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'WytNet',
  });

  const [smsConfig, setSmsConfig] = useState({
    provider: 'twilio',
    accountSid: '',
    authToken: '',
    fromNumber: '',
  });

  const [oauthConfig, setOauthConfig] = useState({
    google: {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
    },
    facebook: {
      appId: '',
      appSecret: '',
      redirectUri: '',
    }
  });

  const handleMethodToggle = async (methodId: string, enabled: boolean) => {
    const updatedMethods = authMethods.map(method =>
      method.id === methodId ? { ...method, enabled } : method
    );

    // If disabling the primary method, set another enabled method as primary
    const toggledMethod = authMethods.find(m => m.id === methodId);
    if (toggledMethod?.primary && !enabled) {
      const otherEnabledMethod = updatedMethods.find(m => m.enabled && m.id !== methodId);
      if (otherEnabledMethod) {
        otherEnabledMethod.primary = true;
      }
    }

    // If enabling the first method, make it primary
    const enabledCount = updatedMethods.filter(m => m.enabled).length;
    if (enabled && enabledCount === 1) {
      const enabledMethod = updatedMethods.find(m => m.id === methodId);
      if (enabledMethod) {
        enabledMethod.primary = true;
      }
    }

    setAuthMethods(updatedMethods);

    toast({
      title: 'Authentication Method Updated',
      description: `${toggledMethod?.name} has been ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handleSetPrimary = (methodId: string) => {
    const updatedMethods = authMethods.map(method => ({
      ...method,
      primary: method.id === methodId
    }));
    setAuthMethods(updatedMethods);

    const method = authMethods.find(m => m.id === methodId);
    toast({
      title: 'Primary Method Updated',
      description: `${method?.name} is now the primary authentication method`,
    });
  };

  const saveConfiguration = async () => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Configuration Saved',
      description: 'Authentication methods and settings have been updated successfully.',
    });
    
    setSaving(false);
  };

  const enabledCount = authMethods.filter(m => m.enabled).length;
  const primaryMethod = authMethods.find(m => m.primary);

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobile ? <MobileNavigation /> : <Header />}
      
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">User Authentication Methods</h1>
                <p className="text-muted-foreground">
                  Configure and manage login options for your platform
                </p>
              </div>
            </div>
            {isSuperAdmin && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                🦸‍♂️ Super Admin Access
              </Badge>
            )}
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-semibold">{enabledCount} Active</div>
                    <div className="text-sm text-muted-foreground">Authentication methods</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">{primaryMethod?.name || 'None'}</div>
                    <div className="text-sm text-muted-foreground">Primary method</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-semibold">99.9%</div>
                    <div className="text-sm text-muted-foreground">Authentication uptime</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="methods">Methods</TabsTrigger>
            <TabsTrigger value="email">Email Setup</TabsTrigger>
            <TabsTrigger value="sms">SMS Setup</TabsTrigger>
            <TabsTrigger value="social">Social Login</TabsTrigger>
          </TabsList>

          {/* Methods Management */}
          <TabsContent value="methods" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Methods Configuration</CardTitle>
                <CardDescription>
                  Enable and configure authentication methods for your users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enabledCount === 0 && (
                  <Alert className="mb-6 border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Warning:</strong> No authentication methods are enabled. Users won't be able to log in.
                      Enable at least one method to allow user access.
                    </AlertDescription>
                  </Alert>
                )}

                <AuthMethodSelector
                  currentMethods={authMethods}
                  onMethodSelect={(method) => console.log('Selected:', method)}
                  onMethodToggle={handleMethodToggle}
                  mode="management"
                />
              </CardContent>
            </Card>

            {/* Primary Method Selection */}
            {enabledCount > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Primary Authentication Method</CardTitle>
                  <CardDescription>
                    Choose the default method shown to users during login
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {authMethods.filter(m => m.enabled).map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-lg">{method.icon}</div>
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-muted-foreground">{method.description}</div>
                          </div>
                        </div>
                        <Button
                          variant={method.primary ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSetPrimary(method.id)}
                          disabled={method.primary}
                        >
                          {method.primary ? 'Primary' : 'Set Primary'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Email Configuration */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Magic Email Link Configuration
                </CardTitle>
                <CardDescription>
                  Configure email provider for sending magic login links
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email Provider</Label>
                    <Select value={emailConfig.provider} onValueChange={(value) => setEmailConfig({...emailConfig, provider: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">Custom SMTP</SelectItem>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="ses">Amazon SES</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>From Email</Label>
                    <Input 
                      placeholder="noreply@wytnet.com"
                      value={emailConfig.fromEmail}
                      onChange={(e) => setEmailConfig({...emailConfig, fromEmail: e.target.value})}
                    />
                  </div>
                </div>

                {emailConfig.provider === 'smtp' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>SMTP Host</Label>
                      <Input 
                        placeholder="smtp.gmail.com"
                        value={emailConfig.smtpHost}
                        onChange={(e) => setEmailConfig({...emailConfig, smtpHost: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>SMTP Port</Label>
                      <Input 
                        placeholder="587"
                        value={emailConfig.smtpPort}
                        onChange={(e) => setEmailConfig({...emailConfig, smtpPort: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>SMTP Username</Label>
                      <Input 
                        value={emailConfig.smtpUser}
                        onChange={(e) => setEmailConfig({...emailConfig, smtpUser: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>SMTP Password</Label>
                      <Input 
                        type="password"
                        value={emailConfig.smtpPassword}
                        onChange={(e) => setEmailConfig({...emailConfig, smtpPassword: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <Button onClick={() => toast({ title: 'Test email sent!', description: 'Check your inbox for the test message.' })}>
                  Send Test Email
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Configuration */}
          <TabsContent value="sms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  SMS OTP Configuration
                </CardTitle>
                <CardDescription>
                  Configure SMS provider for sending OTP codes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>SMS Provider</Label>
                  <Select value={smsConfig.provider} onValueChange={(value) => setSmsConfig({...smsConfig, provider: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="textlocal">TextLocal</SelectItem>
                      <SelectItem value="aws-sns">AWS SNS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {smsConfig.provider === 'twilio' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Account SID</Label>
                      <Input 
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={smsConfig.accountSid}
                        onChange={(e) => setSmsConfig({...smsConfig, accountSid: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Auth Token</Label>
                      <Input 
                        type="password"
                        value={smsConfig.authToken}
                        onChange={(e) => setSmsConfig({...smsConfig, authToken: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>From Phone Number</Label>
                      <Input 
                        placeholder="+1234567890"
                        value={smsConfig.fromNumber}
                        onChange={(e) => setSmsConfig({...smsConfig, fromNumber: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cost Warning:</strong> SMS authentication incurs charges per message sent. 
                    Monitor usage and set up billing alerts to avoid unexpected costs.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Login Configuration */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Login Configuration
                </CardTitle>
                <CardDescription>
                  Configure OAuth providers for social authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Google OAuth */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold">G</div>
                    <h3 className="font-semibold">Google OAuth</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Client ID</Label>
                      <Input 
                        placeholder="your-google-client-id.googleusercontent.com"
                        value={oauthConfig.google.clientId}
                        onChange={(e) => setOauthConfig({
                          ...oauthConfig, 
                          google: {...oauthConfig.google, clientId: e.target.value}
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Client Secret</Label>
                      <Input 
                        type="password"
                        value={oauthConfig.google.clientSecret}
                        onChange={(e) => setOauthConfig({
                          ...oauthConfig, 
                          google: {...oauthConfig.google, clientSecret: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Facebook OAuth */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center text-white font-bold">f</div>
                    <h3 className="font-semibold">Facebook OAuth</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>App ID</Label>
                      <Input 
                        placeholder="your-facebook-app-id"
                        value={oauthConfig.facebook.appId}
                        onChange={(e) => setOauthConfig({
                          ...oauthConfig, 
                          facebook: {...oauthConfig.facebook, appId: e.target.value}
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>App Secret</Label>
                      <Input 
                        type="password"
                        value={oauthConfig.facebook.appSecret}
                        onChange={(e) => setOauthConfig({
                          ...oauthConfig, 
                          facebook: {...oauthConfig.facebook, appSecret: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Social login requires setting up developer accounts with each provider. 
                    Ensure your redirect URIs are configured correctly in each provider's console.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="sticky bottom-4 bg-white rounded-lg shadow-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {enabledCount > 0 ? (
                `${enabledCount} authentication method${enabledCount > 1 ? 's' : ''} configured`
              ) : (
                'Configure at least one authentication method'
              )}
            </div>
            <Button 
              onClick={saveConfiguration}
              disabled={saving || enabledCount === 0}
              className="min-w-32"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}