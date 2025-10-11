import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Lock, User, Smartphone, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isMobile } = useDeviceDetection();

  // Check if already authenticated - DISABLED TO STOP FLICKERING
  // useEffect(() => {
  //   checkAuthStatus();
  // }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/session', {
        credentials: 'include' // Important: Send cookies with request
      });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          window.location.href = '/admin';
        }
      }
    } catch (error) {
      // Not authenticated, stay on login page
    }
  };

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showMFA) {
      handleMFALogin();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Send cookies with request
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.admin.name}!`,
        });
        
        // Reload to trigger admin dashboard
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFALogin = async () => {
    if (!mfaCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/admin/verify-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Send cookies with request
        body: JSON.stringify({
          email,
          mfaCode: mfaCode.trim(),
          rememberDevice
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Authentication Complete",
          description: `Welcome, ${data.user.name}!`,
        });
        setLocation('/admin');
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetLogin = () => {
    setShowMFA(false);
    setMfaCode('');
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {showMFA ? 'Two-Factor Authentication' : 'Admin Portal'}
          </CardTitle>
          <CardDescription>
            {showMFA 
              ? 'Enter the verification code from your authenticator app'
              : 'Secure access to WytNet administration'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleInitialLogin} className="space-y-4">
            {!showMFA ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@wytnet.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    data-testid="input-email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    data-testid="input-password"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberDevice}
                    onCheckedChange={(checked) => setRememberDevice(checked as boolean)}
                    data-testid="checkbox-remember"
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember this device for 30 days
                  </Label>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Check your authenticator app for the 6-digit verification code
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mfaCode" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Verification Code
                  </Label>
                  <Input
                    id="mfaCode"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    required
                    className="text-center text-lg tracking-widest"
                    data-testid="input-mfa-code"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetLogin}
                  className="w-full"
                  data-testid="button-back-to-login"
                >
                  ← Back to Login
                </Button>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {showMFA ? 'Verifying...' : 'Signing in...'}
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  {showMFA ? 'Verify & Sign In' : 'Sign In to Admin Portal'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t text-center">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Shield className="h-3 w-3" />
              <span>Enterprise-grade security</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Protected by multi-factor authentication
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}