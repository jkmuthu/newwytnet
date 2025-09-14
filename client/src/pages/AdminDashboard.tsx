import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  Users, 
  Building2, 
  Layers, 
  Settings, 
  Monitor,
  Database,
  Activity,
  BarChart3,
  Menu,
  Shield,
  Lock,
  UserPlus,
  Eye,
  EyeOff,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Link, useLocation } from 'wouter';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  createdAt: string;
  lastLoginAt: string;
  isActive: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

const sidebarItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'System Overview', href: '/admin/system-overview', icon: Monitor },
  { label: 'Global Settings', href: '/admin/system-overview', icon: Settings },
  { label: 'Tenants', href: '/admin/tenants', icon: Building2 },
  { label: 'All Users', href: '/admin/users', icon: Users },
  { label: 'Modules (CRUD)', href: '/admin/modules', icon: Layers },
  { label: 'CMS Builder', href: '/admin/cms', icon: BarChart3 },
  { label: 'App Builder', href: '/admin/apps', icon: Activity },
  { label: 'Hub Builder', href: '/admin/hubs', icon: Database },
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  
  const { isMobile } = useDeviceDetection();
  const { toast } = useToast();

  // Check if already authenticated
  useEffect(() => {
    const adminToken = localStorage.getItem('wytnet_admin_token');
    const adminUser = localStorage.getItem('wytnet_admin_user');
    
    if (adminToken && adminUser) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(adminUser));
    }
  }, []);

  // Load dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  // Load admin users
  const { data: adminUsersData, isLoading: usersLoading } = useQuery<{
    success: boolean;
    users: AdminUser[];
  }>({
    queryKey: ['/api/admin/admin-users'],
    enabled: isAuthenticated && selectedTab === 'users',
  });

  // Admin login with fixed password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('wytnet_admin_token', result.token);
        localStorage.setItem('wytnet_admin_user', JSON.stringify(result.user));
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        toast({ title: 'Welcome back!', description: 'Admin login successful' });
      } else {
        toast({ 
          title: 'Login Failed', 
          description: result.error || 'Invalid credentials',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({ 
        title: 'Login Error', 
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Admin logout
  const handleLogout = () => {
    localStorage.removeItem('wytnet_admin_token');
    localStorage.removeItem('wytnet_admin_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    toast({ title: 'Logged out successfully' });
  };

  // Create admin user mutation
  const createAdminMutation = useMutation({
    mutationFn: async (userData: { username: string; email: string; password: string; role: string; permissions: string[] }) => {
      return await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('wytnet_admin_token')}`
        },
        body: JSON.stringify(userData),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/admin-users'] });
      toast({ title: 'Admin user created successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error creating admin user',
        description: 'Please try again',
        variant: 'destructive'
      });
    },
  });

  // Login form for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative z-[1]">
        <Card className="w-full max-w-md shadow-xl border-0 relative z-[5]">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">WytNet Admin Access</CardTitle>
            <CardDescription>
              Secure administrator login for platform management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                  data-testid="input-admin-username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    data-testid="input-admin-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-base touch-manipulation"
                disabled={isLoading}
                data-testid="button-admin-login"
              >
                {isLoading ? (
                  <>
                    <Shield className="h-4 w-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Admin Login
                  </>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>
      </div>
    );
  }

  // Mobile layout  
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
        {/* Mobile Admin Header - SINGLE HEADER FOR ADMIN */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-[60]">
          <div className="px-4">
            <div className="flex justify-between items-center h-16 min-h-[4rem]">
              <div className="flex items-center space-x-3">
                <img 
                  src="/wytnet-logo.png" 
                  alt="WytNet" 
                  className="h-8 w-auto"
                />
                <div>
                  <p className="text-sm font-medium">Admin Panel</p>
                  <p className="text-xs text-gray-500">{currentUser?.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2 min-w-[2.5rem] min-h-[2.5rem]" data-testid="button-mobile-admin-menu">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 z-[70]">
                    <div className="py-4">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{currentUser?.username}</p>
                          <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
                        </div>
                      </div>
                      
                      <nav className="space-y-2">
                        {/* Show different navigation based on role */}
                        {currentUser?.role === 'super_admin' ? (
                          sidebarItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 touch-manipulation"
                              onClick={() => setSidebarOpen(false)}
                              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <item.icon className="h-5 w-5" />
                              <span>{item.label}</span>
                            </Link>
                          ))
                        ) : (
                          /* Limited navigation for admins */
                          [sidebarItems[0], sidebarItems[3], sidebarItems[4], sidebarItems[5]].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 touch-manipulation"
                              onClick={() => setSidebarOpen(false)}
                              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <item.icon className="h-5 w-5" />
                              <span>{item.label}</span>
                              {item.label === 'All Users' && (
                                <Badge variant="outline" className="ml-auto text-xs">
                                  Limited
                                </Badge>
                              )}
                            </Link>
                          ))
                        )}
                        
                        <div className="pt-4 border-t">
                          <Button 
                            variant="outline" 
                            onClick={handleLogout}
                            className="w-full justify-start py-3 touch-manipulation"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </Button>
                        </div>
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="p-4 relative z-[5] overflow-y-auto min-h-[calc(100vh-4rem)]">
          <AdminDashboardContent 
            dashboardData={dashboardData} 
            isMobile={true}
            onTabChange={setSelectedTab}
            selectedTab={selectedTab}
            currentUser={currentUser}
          />
        </main>
      </div>
    );
  }

  // Desktop layout with sidebar
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex relative">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 relative z-[10]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <img 
              src="/wytnet-logo.png" 
              alt="WytNet" 
              className="h-8 w-auto"
            />
            <div>
              <p className="text-sm font-medium">Admin Panel</p>
              <p className="text-xs text-gray-500">{currentUser?.username}</p>
              <Badge 
                variant={currentUser?.role === 'super_admin' ? 'default' : 'secondary'}
                className="text-xs mt-1"
              >
                {currentUser?.role === 'super_admin' ? '🦸‍♂️ Super Admin' : '👨‍💼 Admin'}
              </Badge>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {/* Show different sections based on role */}
          {currentUser?.role === 'super_admin' && (
            <>
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Super Admin
                </h3>
              </div>

              {sidebarItems.slice(0, 3).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Core Platform
                </h3>
              </div>

              {sidebarItems.slice(3, 6).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Builders
                </h3>
              </div>

              {sidebarItems.slice(6).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </>
          )}

          {/* Limited admin navigation */}
          {currentUser?.role === 'admin' && (
            <>
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Admin Access
                </h3>
              </div>

              {/* Limited navigation for admins */}
              {[sidebarItems[0], sidebarItems[3], sidebarItems[4], sidebarItems[5]].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.label === 'All Users' && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      Limited
                    </Badge>
                  )}
                </Link>
              ))}
            </>
          )}

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </nav>
      </aside>

      {/* Desktop Main Content */}
      <main className="flex-1 p-6 relative z-[5] overflow-y-auto">
        <AdminDashboardContent 
          dashboardData={dashboardData} 
          isMobile={false}
          onTabChange={setSelectedTab}
          selectedTab={selectedTab}
          currentUser={currentUser}
        />
      </main>
    </div>
  );
}

// Dashboard content component
function AdminDashboardContent({ 
  dashboardData, 
  isMobile, 
  onTabChange, 
  selectedTab,
  currentUser
}: { 
  dashboardData: any; 
  isMobile: boolean; 
  onTabChange: (tab: string) => void;
  selectedTab: string;
  currentUser: AdminUser | null;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            WytNet Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Platform administration and management
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Activity className="h-3 w-3 mr-1" />
          System Online
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={onTabChange} className="space-y-6">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4 grid-cols-2'} gap-1`}>
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistics Cards */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4 sm:grid-cols-2 grid-cols-1'}`}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.dashboard?.statistics?.totalTenants || 0}</div>
                <p className="text-xs text-green-600">+0% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deployed Apps</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.dashboard?.statistics?.totalApps || 0}</div>
                <p className="text-xs text-green-600">+0% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Hubs</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.dashboard?.statistics?.totalHubs || 0}</div>
                <p className="text-xs text-green-600">+0% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue (INR)</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹0</div>
                <p className="text-xs text-green-600">+0% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard sections */}
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3 md:grid-cols-2 grid-cols-1'}`}>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  • Manage content with CMS Builder
                </div>
                <div className="text-sm text-gray-600">
                  • Create modules with CRUD Builder
                </div>
                <div className="text-sm text-gray-600">
                  • Build applications
                </div>
                <div className="text-sm text-gray-600">
                  • Configure system settings
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">All services running</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database connected</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API endpoints active</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Authentication working</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  • Platform optimization
                </div>
                <div className="text-sm text-gray-600">
                  • New features added
                </div>
                <div className="text-sm text-gray-600">
                  • Security improvements
                </div>
                <div className="text-sm text-gray-600">
                  • Performance enhancements
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <AdminUsersTab currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="modules">
          <AdminModulesTab currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="system">
          <AdminSystemTab currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Admin Users Tab Component
function AdminUsersTab({ currentUser }: { currentUser: AdminUser | null }) {
  const canCreateUsers = currentUser?.role === 'super_admin';
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: ['read', 'write']
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Admin User
          </CardTitle>
          <CardDescription>
            Add new administrators with specific permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-username">Username</Label>
              <Input
                id="new-username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="admin_user"
              />
            </div>
            <div>
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="admin@wytnet.com"
              />
            </div>
            <div>
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Strong password"
              />
            </div>
            <div>
              <Label htmlFor="new-role">Role</Label>
              <select 
                id="new-role"
                className="w-full p-2 border rounded-md"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          </div>
          {canCreateUsers ? (
            <Button className="w-full md:w-auto">
              <UserPlus className="h-4 w-4 mr-2" />
              Create Admin User
            </Button>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Only Super Admins can create new admin users.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No admin users created yet. Use the form above to create the first admin user.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Modules Tab Component  
function AdminModulesTab({ currentUser }: { currentUser: AdminUser | null }) {
  const canManageModules = currentUser?.role === 'super_admin';
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Modules</CardTitle>
          <CardDescription>
            Manage and configure platform modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'QR Generator', status: 'enabled', users: 150 },
              { name: 'AI Directory', status: 'enabled', users: 89 },
              { name: 'DISC Assessment', status: 'enabled', users: 67 },
              { name: 'CMS Builder', status: 'disabled', users: 12 },
              { name: 'App Builder', status: 'enabled', users: 23 },
              { name: 'Hub Builder', status: 'maintenance', users: 5 },
            ].map((module) => (
              <Card key={module.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{module.name}</h3>
                    <Badge 
                      variant={module.status === 'enabled' ? 'default' : 'secondary'}
                      className={module.status === 'enabled' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {module.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{module.users} active users</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin System Tab Component
function AdminSystemTab({ currentUser }: { currentUser: AdminUser | null }) {
  const canViewSystemInfo = currentUser?.permissions?.includes('all_access') || currentUser?.permissions?.includes('read_access');
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Server Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Server Uptime:</span>
                  <span>0d 0h 45m</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <span>128 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>CPU Load:</span>
                  <span>45.0%</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Connections:</span>
                  <span>42</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Database Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <span className="text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span>Query Performance:</span>
                  <span className="text-green-600">Optimal</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage Used:</span>
                  <span>45%</span>
                </div>
                <div className="flex justify-between">
                  <span>Backup Status:</span>
                  <span className="text-green-600">Current</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}