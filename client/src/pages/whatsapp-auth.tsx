import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle, Shield, CheckCircle, AlertCircle, Phone, User, Globe, ArrowRight, Timer } from 'lucide-react';

interface AuthStep {
  step: 'register' | 'otp-sent' | 'verify-otp' | 'success';
}

interface RegistrationData {
  name: string;
  country: string;
  whatsappNumber: string;
}

interface OTPResponse {
  success: boolean;
  sessionId: string;
  whatsappLink: string;
  whatsappNumber: string;
  expiresIn: number;
  isNewUser: boolean;
}

interface User {
  id: string;
  name: string;
  country: string;
  whatsappNumber: string;
  isVerified: boolean;
}

const countries = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
];

export default function WhatsAppAuth() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<AuthStep['step']>('register');
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    name: '',
    country: 'IN',
    whatsappNumber: '',
  });
  const [otpData, setOtpData] = useState<OTPResponse | null>(null);
  const [enteredOTP, setEnteredOTP] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  // Timer for OTP expiry
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Send OTP mutation
  const sendOTPMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const response = await fetch('/api/auth/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send OTP');
      }

      return response.json();
    },
    onSuccess: (response: OTPResponse) => {
      setOtpData(response);
      setTimeLeft(response.expiresIn);
      setCurrentStep('otp-sent');
      
      toast({
        title: 'OTP Generated!',
        description: response.isNewUser 
          ? 'Welcome to WytNet! Your OTP is ready to share.'
          : 'Welcome back! Your OTP is ready to share.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to generate OTP',
        variant: 'destructive',
      });
    },
  });

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: async (data: { whatsappNumber: string; otp: string }) => {
      const response = await fetch('/api/auth/whatsapp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify OTP');
      }

      return response.json();
    },
    onSuccess: (response: { user: User }) => {
      setUser(response.user);
      setCurrentStep('success');
      
      toast({
        title: 'Login Successful!',
        description: `Welcome to WytNet, ${response.user.name}!`,
      });

      // Redirect to dashboard after a moment
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid or expired OTP',
        variant: 'destructive',
      });
    },
  });

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    if (!registrationData.whatsappNumber.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your WhatsApp number',
        variant: 'destructive',
      });
      return;
    }

    sendOTPMutation.mutate(registrationData);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enteredOTP.trim() || enteredOTP.length !== 6) {
      toast({
        title: 'Validation Error',
        description: 'Please enter the 6-digit OTP',
        variant: 'destructive',
      });
      return;
    }

    if (!otpData) return;

    verifyOTPMutation.mutate({
      whatsappNumber: otpData.whatsappNumber,
      otp: enteredOTP,
    });
  };

  const handleOpenWhatsApp = () => {
    if (otpData?.whatsappLink) {
      window.open(otpData.whatsappLink, '_blank');
    }
  };

  const selectedCountry = countries.find(c => c.code === registrationData.country) || countries[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold">WytNet</h1>
          </div>
          <p className="text-muted-foreground">
            {currentStep === 'register' && 'Sign in with WhatsApp OTP'}
            {currentStep === 'otp-sent' && 'Check your WhatsApp'}
            {currentStep === 'verify-otp' && 'Enter your OTP'}
            {currentStep === 'success' && 'Welcome aboard!'}
          </p>
        </div>

        {/* Registration Step */}
        {currentStep === 'register' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Register / Login
              </CardTitle>
              <CardDescription>
                Enter your details to receive WhatsApp OTP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Country
                  </Label>
                  <Select
                    value={registrationData.country}
                    onValueChange={(value) => setRegistrationData(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger data-testid="select-country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.name} ({country.dialCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    WhatsApp Number *
                  </Label>
                  <div className="flex">
                    <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                      <span className="text-sm font-mono">{selectedCountry.dialCode}</span>
                    </div>
                    <Input
                      id="whatsapp"
                      value={registrationData.whatsappNumber}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                      placeholder={registrationData.country === 'IN' ? '9876543210' : 'Enter phone number'}
                      className="rounded-l-none"
                      data-testid="input-whatsapp"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {registrationData.country === 'IN' 
                      ? 'Enter 10 digits starting with 6, 7, 8, or 9'
                      : 'Enter your phone number without country code'
                    }
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={sendOTPMutation.isPending}
                  data-testid="button-send-otp"
                >
                  {sendOTPMutation.isPending ? (
                    'Generating OTP...'
                  ) : (
                    <>
                      Login / Register
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* OTP Sent Step */}
        {currentStep === 'otp-sent' && otpData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                OTP Generated
              </CardTitle>
              <CardDescription>
                Share the OTP message to yourself on WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <MessageCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Step 1:</strong> Click the button below to open WhatsApp
                  <br />
                  <strong>Step 2:</strong> Send the pre-filled OTP message to yourself
                  <br />
                  <strong>Step 3:</strong> Come back here and enter the OTP
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleOpenWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700"
                data-testid="button-open-whatsapp"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Open WhatsApp & Share OTP
              </Button>

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('verify-otp')}
                  data-testid="button-proceed-verify"
                >
                  I've sent the message - Proceed to verify
                </Button>
              </div>

              {timeLeft > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  OTP expires in {formatTime(timeLeft)}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* OTP Verification Step */}
        {currentStep === 'verify-otp' && otpData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Enter OTP
              </CardTitle>
              <CardDescription>
                Enter the 6-digit OTP from your WhatsApp message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">6-Digit OTP</Label>
                  <Input
                    id="otp"
                    value={enteredOTP}
                    onChange={(e) => setEnteredOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                    data-testid="input-otp"
                  />
                  <p className="text-xs text-center text-muted-foreground">
                    Sent to {otpData.whatsappNumber}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyOTPMutation.isPending || enteredOTP.length !== 6}
                  data-testid="button-verify-otp"
                >
                  {verifyOTPMutation.isPending ? 'Verifying...' : 'Verify & Login'}
                </Button>

                <div className="text-center space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep('otp-sent')}
                    className="text-sm"
                  >
                    Back to WhatsApp sharing
                  </Button>
                  
                  {timeLeft <= 0 ? (
                    <div>
                      <p className="text-sm text-red-500 mb-2">OTP expired</p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentStep('register');
                          setEnteredOTP('');
                          setOtpData(null);
                        }}
                        className="text-sm"
                      >
                        Generate new OTP
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Timer className="h-4 w-4" />
                      Expires in {formatTime(timeLeft)}
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {currentStep === 'success' && user && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-6 w-6" />
                Login Successful!
              </CardTitle>
              <CardDescription className="text-green-600">
                Welcome to WytNet Multi-SaaS Platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-green-700">
                    Hello, {user.name}!
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-700">
                    {user.whatsappNumber}
                  </Badge>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    You're being redirected to your dashboard...
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Note */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Secure WhatsApp OTP • No SMS costs • Your privacy protected
          </p>
        </div>
      </div>
    </div>
  );
}