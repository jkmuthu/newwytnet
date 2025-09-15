import { useUserAuth } from '@/contexts/UserAuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TestAuthContexts() {
  const {
    user,
    isLoading: userLoading,
    isAuthenticated: userAuthenticated,
    login: userLogin,
    logout: userLogout
  } = useUserAuth();

  const {
    adminUser,
    isLoading: adminLoading,
    isAdminAuthenticated,
    adminLogin,
    adminLogout
  } = useAdminAuth();

  const handleUserLogin = async () => {
    try {
      await userLogin({
        mobileNumber: '9345228184',
        password: 'sadmin12'
      });
    } catch (error) {
      console.error('User login failed:', error);
    }
  };

  const handleAdminLogin = async () => {
    try {
      await adminLogin({
        username: '9345228184',
        password: 'sadmin12'
      });
    } catch (error) {
      console.error('Admin login failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="test-auth-contexts">
      <h2 className="text-2xl font-bold">Authentication Contexts Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Auth Context */}
        <Card data-testid="user-auth-card">
          <CardHeader>
            <CardTitle>User Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p><strong>Loading:</strong> {userLoading ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {userAuthenticated ? 'Yes' : 'No'}</p>
              {user && (
                <div className="mt-2">
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Provider:</strong> {user.provider}</p>
                </div>
              )}
            </div>
            
            <div className="space-x-2">
              {!userAuthenticated ? (
                <Button 
                  onClick={handleUserLogin} 
                  disabled={userLoading}
                  data-testid="button-user-login"
                >
                  Login as User
                </Button>
              ) : (
                <Button 
                  onClick={() => userLogout()} 
                  disabled={userLoading}
                  variant="outline"
                  data-testid="button-user-logout"
                >
                  Logout User
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Auth Context */}
        <Card data-testid="admin-auth-card">
          <CardHeader>
            <CardTitle>Admin Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p><strong>Loading:</strong> {adminLoading ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {isAdminAuthenticated ? 'Yes' : 'No'}</p>
              {adminUser && (
                <div className="mt-2">
                  <p><strong>Admin ID:</strong> {adminUser.id}</p>
                  <p><strong>Name:</strong> {adminUser.name}</p>
                  <p><strong>Role:</strong> {adminUser.role}</p>
                  <p><strong>Is Super Admin:</strong> {adminUser.isSuperAdmin ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
            
            <div className="space-x-2">
              {!isAdminAuthenticated ? (
                <Button 
                  onClick={handleAdminLogin} 
                  disabled={adminLoading}
                  data-testid="button-admin-login"
                >
                  Login as Admin
                </Button>
              ) : (
                <Button 
                  onClick={() => adminLogout()} 
                  disabled={adminLoading}
                  variant="outline"
                  data-testid="button-admin-logout"
                >
                  Logout Admin
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Concurrent Session Test */}
      <Card data-testid="concurrent-session-test">
        <CardHeader>
          <CardTitle>Concurrent Session Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>User Session Active:</strong> {userAuthenticated ? '✅' : '❌'}</p>
            <p><strong>Admin Session Active:</strong> {isAdminAuthenticated ? '✅' : '❌'}</p>
            <p><strong>Both Active:</strong> {userAuthenticated && isAdminAuthenticated ? '✅ Concurrent sessions working!' : '❌'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}