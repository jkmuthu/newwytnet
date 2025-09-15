import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, User } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function DevAuthButton() {
  const [showDevAuth, setShowDevAuth] = useState(false);
  const [name, setName] = useState('Super Admin');
  const [phone, setPhone] = useState('+91XXXXXXXXXX');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const handleDevLogin = async () => {
    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter both name and phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create/update the development user
      const response = await fetch('/api/auth/whatsapp/dev-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          whatsappNumber: phone.trim(),
          country: 'India',
        }),
      });

      if (response.ok) {
        toast({
          title: "Development Login Successful",
          description: `Logged in as ${name} with Super Admin privileges`,
        });
        
        // Refresh the page to update auth state
        window.location.reload();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to log in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!showDevAuth) {
    return (
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setShowDevAuth(true)}
          className="flex items-center space-x-2"
          data-testid="button-dev-auth"
        >
          <Shield className="h-4 w-4" />
          <span>Development Login</span>
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Development mode only - for testing Super Admin access
        </p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span>Development Login</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dev-name">Name</Label>
          <Input
            id="dev-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            data-testid="input-dev-name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dev-phone">WhatsApp Number</Label>
          <Input
            id="dev-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91XXXXXXXXXX"
            data-testid="input-dev-phone"
          />
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleDevLogin}
            disabled={isLoading}
            className="flex-1"
            data-testid="button-dev-login"
          >
            <User className="h-4 w-4 mr-2" />
            {isLoading ? 'Logging in...' : 'Login as Super Admin'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowDevAuth(false)}
            disabled={isLoading}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          This creates a development session with Super Admin privileges
        </p>
      </CardContent>
    </Card>
  );
}