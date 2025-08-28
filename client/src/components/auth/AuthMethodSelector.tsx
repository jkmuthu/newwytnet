import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Settings, Shield, Smartphone, Mail, MessageCircle } from 'lucide-react';
import { DEFAULT_AUTH_METHODS, type AuthMethod } from '@shared/authMethods';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface AuthMethodSelectorProps {
  currentMethods?: AuthMethod[];
  onMethodSelect: (method: AuthMethod) => void;
  onMethodToggle: (methodId: string, enabled: boolean) => void;
  mode: 'login' | 'management';
}

export default function AuthMethodSelector({
  currentMethods = DEFAULT_AUTH_METHODS,
  onMethodSelect,
  onMethodToggle,
  mode = 'login'
}: AuthMethodSelectorProps) {
  const { isMobile, isTablet } = useDeviceDetection();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const getMethodIcon = (iconStr: string, methodId: string) => {
    switch (methodId) {
      case 'whatsapp-otp':
        return <MessageCircle className="h-6 w-6 text-green-600" />;
      case 'magic-email':
        return <Mail className="h-6 w-6 text-blue-600" />;
      case 'sms-otp':
        return <Smartphone className="h-6 w-6 text-purple-600" />;
      case 'google-oauth':
        return <div className="h-6 w-6 bg-red-500 rounded text-white flex items-center justify-center text-xs font-bold">G</div>;
      case 'facebook-oauth':
        return <div className="h-6 w-6 bg-blue-700 rounded text-white flex items-center justify-center text-xs font-bold">f</div>;
      default:
        return <Shield className="h-6 w-6 text-gray-500" />;
    }
  };

  const enabledMethods = currentMethods.filter(method => method.enabled);
  const disabledMethods = currentMethods.filter(method => !method.enabled);

  if (mode === 'login') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Choose Login Method</h2>
          <p className="text-muted-foreground">
            Select your preferred way to access WytNet
          </p>
        </div>

        {enabledMethods.length === 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">No authentication methods enabled</p>
                  <p className="text-sm text-orange-600">Contact your administrator to enable login methods.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {enabledMethods.map((method) => (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedMethod === method.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
              } ${method.primary ? 'border-green-500 bg-green-50' : ''}`}
              onClick={() => {
                setSelectedMethod(method.id);
                onMethodSelect(method);
              }}
              data-testid={`auth-method-${method.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {getMethodIcon(method.icon, method.id)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{method.name}</h3>
                      {method.primary && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {method.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {enabledMethods.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            🔒 Your data is protected with enterprise-grade security
          </div>
        )}
      </div>
    );
  }

  // Management mode
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Authentication Methods</h3>
          <p className="text-sm text-muted-foreground">
            Configure available login methods for your users
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      {/* Enabled Methods */}
      {enabledMethods.length > 0 && (
        <div>
          <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Active Methods ({enabledMethods.length})
          </h4>
          <div className="space-y-2">
            {enabledMethods.map((method) => (
              <Card key={method.id} className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getMethodIcon(method.icon, method.id)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{method.name}</span>
                          {method.primary && (
                            <Badge variant="secondary" className="text-xs bg-green-600 text-white">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={method.enabled}
                        onCheckedChange={(enabled) => onMethodToggle(method.id, enabled)}
                        data-testid={`toggle-${method.id}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Separator */}
      {enabledMethods.length > 0 && disabledMethods.length > 0 && (
        <Separator className="my-6" />
      )}

      {/* Disabled Methods */}
      {disabledMethods.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-600 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Available Methods ({disabledMethods.length})
          </h4>
          <div className="space-y-2">
            {disabledMethods.map((method) => (
              <Card key={method.id} className="border-gray-200 bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 opacity-60">
                      {getMethodIcon(method.icon, method.id)}
                      <div>
                        <span className="font-medium">{method.name}</span>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={method.enabled}
                        onCheckedChange={(enabled) => onMethodToggle(method.id, enabled)}
                        data-testid={`toggle-${method.id}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900">Security Recommendations</h5>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Enable at least 2 authentication methods for redundancy</li>
              <li>• WhatsApp OTP is cost-effective and secure for most users</li>
              <li>• Social logins require API configuration in settings</li>
              <li>• SMS OTP may have charges - configure billing alerts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}