import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, LogIn } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

interface AdminUserInfo {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin' | 'moderator';
  isSuperAdmin: boolean;
}

export default function ProtectedAdminRoute({ children, requiredRole = 'admin' }: ProtectedAdminRouteProps) {
  const [, setLocation] = useLocation();

  // Check admin authentication status
  const { data: authData, isLoading, error } = useQuery<{
    success: boolean;
    user?: AdminUserInfo;
    message?: string;
  }>({
    queryKey: ['/api/auth/admin/status'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && (!authData?.success || !authData?.user)) {
      setLocation('/admin/login');
    }
  }, [authData, isLoading, setLocation]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Checking Authentication</h3>
                <p className="text-sm text-gray-500 mt-1">Please wait...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authentication error
  if (error || !authData?.success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              You need to log in to access this area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error?.message || authData?.message || 'Please log in to continue'}
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={() => setLocation('/admin/login')} 
              className="w-full"
              data-testid="button-admin-login"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Go to Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authorization check - insufficient role
  if (authData.user && requiredRole === 'super_admin' && !authData.user.isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              Access Denied
            </CardTitle>
            <CardDescription>
              Insufficient permissions to access this area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You need super admin privileges to access this section.
                Current role: <span className="font-medium capitalize">{authData.user.role}</span>
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setLocation('/admin')} 
                className="flex-1"
                data-testid="button-back-to-admin"
              >
                Back to Admin
              </Button>
              <Button 
                onClick={() => setLocation('/admin/login')} 
                className="flex-1"
                data-testid="button-switch-account"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Switch Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated and authorized - render protected content
  return <>{children}</>;
}