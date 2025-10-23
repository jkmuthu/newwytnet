import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users as UsersIcon, Eye, Ban, Trash2, Shield, Clock, Mail, Phone, Calendar, Activity, BarChart3, Plus, Settings as SettingsIcon, Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TrashView } from "@/components/shared/TrashView";

interface User {
  id: string;
  displayId?: string;
  name: string;
  email: string;
  whatsappNumber: string;
  country: string;
  gender?: string;
  role: string;
  isVerified: boolean;
  isSuperAdmin: boolean;
  profileImageUrl?: string;
  createdAt: string;
  tenantId?: string;
  profileCompletionPercentage?: number;
  updatedAt?: string;
  status?: 'active' | 'banned' | 'trash';
}

interface AuthSettings {
  email_validation_required: boolean;
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_numbers: boolean;
  password_require_special_chars: boolean;
  enabled_auth_providers: string[];
  allow_hub_override_auth: boolean;
}

function SettingsContent() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AuthSettings>({
    email_validation_required: false,
    password_min_length: 8,
    password_require_uppercase: false,
    password_require_numbers: false,
    password_require_special_chars: false,
    enabled_auth_providers: [],
    allow_hub_override_auth: false,
  });

  const { data: authSettings, isLoading } = useQuery<{ success: boolean; settings: AuthSettings }>({
    queryKey: ['/api/admin/settings/authentication'],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<AuthSettings>) => {
      return await apiRequest('PUT', '/api/admin/settings/authentication', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/authentication'] });
      toast({ title: "Success", description: "Authentication settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update settings", variant: "destructive" });
    }
  });

  // Update local state when data is fetched (using useEffect to avoid render-time state updates)
  useEffect(() => {
    if (authSettings?.settings) {
      setSettings(authSettings.settings);
    }
  }, [authSettings]);

  const handleToggleProvider = (provider: string) => {
    const currentProviders = settings.enabled_auth_providers || [];
    const newProviders = currentProviders.includes(provider)
      ? currentProviders.filter(p => p !== provider)
      : [...currentProviders, provider];
    
    setSettings({ ...settings, enabled_auth_providers: newProviders });
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading settings...</div>;
  }

  // OAuth provider configuration status (based on available secrets)
  const oauthSecrets: Record<string, boolean> = {
    'GOOGLE_CLIENT_ID': true,     // Available in environment
    'FACEBOOK_APP_ID': false,      // Missing (in missing_secrets)
    'LINKEDIN_CLIENT_ID': true,    // Available in environment
  };

  const authProviders = [
    { id: 'google', label: 'Google OAuth', secretKey: 'GOOGLE_CLIENT_ID', isConfigured: oauthSecrets['GOOGLE_CLIENT_ID'] },
    { id: 'facebook', label: 'Facebook OAuth', secretKey: 'FACEBOOK_APP_ID', isConfigured: oauthSecrets['FACEBOOK_APP_ID'] },
    { id: 'linkedin', label: 'LinkedIn OAuth', secretKey: 'LINKEDIN_CLIENT_ID', isConfigured: oauthSecrets['LINKEDIN_CLIENT_ID'] },
    { id: 'email_password', label: 'Email + Password', secretKey: null, isConfigured: true },
    { id: 'email_otp', label: 'Email OTP', secretKey: null, isConfigured: true },
    { id: 'whatsapp_otp', label: 'WhatsApp OTP', secretKey: null, isConfigured: true },
    { id: 'sms_otp', label: 'SMS OTP', secretKey: null, isConfigured: true },
  ];

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Authentication & Security Settings
          </h3>
          <p className="text-sm text-muted-foreground">Configure user authentication and security requirements</p>
        </div>
        <Button onClick={handleSave} disabled={updateSettingsMutation.isPending} data-testid="button-save-settings">
          {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Email Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-validation">Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">Users must verify their email before logging in</p>
            </div>
            <Switch
              id="email-validation"
              checked={settings.email_validation_required}
              onCheckedChange={(checked) => setSettings({ ...settings, email_validation_required: checked })}
              data-testid="switch-email-validation"
            />
          </div>
        </CardContent>
      </Card>

      {/* Password Strength */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password Strength Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password-length">Minimum Password Length</Label>
            <Input
              id="password-length"
              type="number"
              min="6"
              max="128"
              value={settings.password_min_length}
              onChange={(e) => setSettings({ ...settings, password_min_length: parseInt(e.target.value) || 8 })}
              data-testid="input-password-length"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password-uppercase">Require Uppercase Letters</Label>
            <Switch
              id="password-uppercase"
              checked={settings.password_require_uppercase}
              onCheckedChange={(checked) => setSettings({ ...settings, password_require_uppercase: checked })}
              data-testid="switch-password-uppercase"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password-numbers">Require Numbers</Label>
            <Switch
              id="password-numbers"
              checked={settings.password_require_numbers}
              onCheckedChange={(checked) => setSettings({ ...settings, password_require_numbers: checked })}
              data-testid="switch-password-numbers"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password-special">Require Special Characters</Label>
            <Switch
              id="password-special"
              checked={settings.password_require_special_chars}
              onCheckedChange={(checked) => setSettings({ ...settings, password_require_special_chars: checked })}
              data-testid="switch-password-special"
            />
          </div>
        </CardContent>
      </Card>

      {/* Authentication Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enabled Authentication Methods</CardTitle>
          <CardDescription>Select which login methods are available to users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {authProviders.map((provider) => (
            <div key={provider.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`provider-${provider.id}`}
                  checked={settings.enabled_auth_providers?.includes(provider.id)}
                  onCheckedChange={() => handleToggleProvider(provider.id)}
                  data-testid={`checkbox-provider-${provider.id}`}
                />
                <Label htmlFor={`provider-${provider.id}`} className="cursor-pointer">{provider.label}</Label>
              </div>
              {provider.secretKey && (
                <Badge variant={provider.isConfigured ? "default" : "secondary"} className="text-xs">
                  {provider.isConfigured ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                  {provider.isConfigured ? "Configured" : "Not Configured"}
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hub Override */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hub-Level Customization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="hub-override">Allow Hub Admins to Override Settings</Label>
              <p className="text-sm text-muted-foreground">Hub administrators can customize authentication settings for their hub</p>
            </div>
            <Switch
              id="hub-override"
              checked={settings.allow_hub_override_auth}
              onCheckedChange={(checked) => setSettings({ ...settings, allow_hub_override_auth: checked })}
              data-testid="switch-hub-override"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminUsersImproved() {
  const [userStatusFilter, setUserStatusFilter] = useState<'active' | 'admins' | 'banned' | 'trash' | 'settings'>('active');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappNumber: '',
    password: '',
    confirmPassword: '',
    roleId: '',
  });
  const { toast } = useToast();

  const { data: usersData, isLoading } = useQuery<{
    success: boolean;
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>({
    queryKey: ['/api/admin/users'],
  });

  // Fetch available roles for dropdown
  const { data: rolesData } = useQuery<{
    success: boolean;
    roles: Array<{
      id: string;
      displayId: string;
      name: string;
      description: string;
      scope: string;
    }>;
  }>({
    queryKey: ['/api/admin/roles/list'],
  });

  // Trash management queries and mutations
  const { data: trashUsersData, isLoading: isLoadingTrash } = useQuery<{
    success: boolean;
    users: User[];
    count: number;
  }>({
    queryKey: ['/api/admin/trash/users'],
  });

  const restoreUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('POST', `/api/admin/trash/users/${userId}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trash/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Success", description: "User restored successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to restore user", variant: "destructive" });
    }
  });

  const permanentlyDeleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('DELETE', `/api/admin/trash/users/${userId}/permanent`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trash/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Success", description: "User permanently deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete user", variant: "destructive" });
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/admin/users/create', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Success", description: "User created successfully" });
      setIsCreateDialogOpen(false);
      setFormData({
        fullName: '',
        email: '',
        whatsappNumber: '',
        password: '',
        confirmPassword: '',
        roleId: '',
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create user", variant: "destructive" });
    }
  });

  // Filter users by tab selection
  const filteredUsers = usersData?.users?.filter(user => {
    const userStatus = user.status || 'active'; // Default to active if no status
    
    if (userStatusFilter === 'active') {
      // Show only regular active users (not super admins)
      return userStatus === 'active' && !user.isSuperAdmin;
    } else if (userStatusFilter === 'admins') {
      // Show only active super admins
      return userStatus === 'active' && user.isSuperAdmin;
    } else {
      // For banned and trash tabs, show all users regardless of admin status
      return userStatus === userStatusFilter;
    }
  }) || [];
  
  // Calculate counts for each tab
  const activeUsersCount = usersData?.users?.filter(u => (!u.status || u.status === 'active') && !u.isSuperAdmin).length || 0;
  const activeAdminsCount = usersData?.users?.filter(u => (!u.status || u.status === 'active') && u.isSuperAdmin).length || 0;
  const bannedCount = usersData?.users?.filter(u => u.status === 'banned').length || 0;
  const trashCount = trashUsersData?.count || 0;

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || 'U';
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
  };

  const banMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to ban user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Success", description: "User banned successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to ban user", variant: "destructive" });
    }
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({ 
        title: "Error", 
        description: "Passwords do not match", 
        variant: "destructive" 
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({ 
        title: "Error", 
        description: "Password must be at least 8 characters long", 
        variant: "destructive" 
      });
      return;
    }

    createUserMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">All Users</h1>
        <p className="text-muted-foreground">View and manage all registered users</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                All Users
                {usersData?.pagination && (
                  <Badge variant="secondary" className="ml-2">
                    {usersData.pagination.total} total
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              className="gap-2"
              data-testid="button-add-user"
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Filter Tabs */}
          <Tabs value={userStatusFilter} onValueChange={(value) => setUserStatusFilter(value as any)} className="w-full">
            <TabsList>
              <TabsTrigger value="active" data-testid="tab-users-active">
                Active Users ({activeUsersCount})
              </TabsTrigger>
              <TabsTrigger value="admins" data-testid="tab-users-admins">
                Active Engine Admins ({activeAdminsCount})
              </TabsTrigger>
              <TabsTrigger value="banned" data-testid="tab-users-banned">
                Banned ({bannedCount})
              </TabsTrigger>
              <TabsTrigger value="trash" data-testid="tab-users-trash">
                Trash ({trashCount})
              </TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-users-settings">
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Settings Tab Content */}
          {userStatusFilter === 'settings' ? (
            <SettingsContent />
          ) : userStatusFilter === 'trash' ? (
            <TrashView
              items={trashUsersData?.users || []}
              entityType="users"
              isLoading={isLoadingTrash}
              onRestore={(id) => restoreUserMutation.mutateAsync(id)}
              onPermanentDelete={(id) => permanentlyDeleteUserMutation.mutateAsync(id)}
              renderItemName={(user) => user.name}
              renderItemDetails={(user) => (
                <div className="flex flex-col gap-1">
                  <span className="text-sm">{user.email}</span>
                  <span className="text-xs text-muted-foreground">{user.displayId}</span>
                </div>
              )}
            />
          ) : isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {userStatusFilter} users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Last Update</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Profile %</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {user.updatedAt ? format(new Date(user.updatedAt), 'MMM dd, HH:mm') : format(new Date(user.createdAt), 'MMM dd, HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400" data-testid={`text-display-id-${user.id}`}>
                          {user.displayId || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {user.profileImageUrl && (
                              <AvatarImage src={user.profileImageUrl} alt={user.name} />
                            )}
                            <AvatarFallback className="bg-blue-600 text-white">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {user.name}
                              {user.isSuperAdmin && (
                                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Super
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 min-w-[100px]">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {user.profileCompletionPercentage || 0}%
                            </span>
                          </div>
                          <Progress 
                            value={user.profileCompletionPercentage || 0} 
                            className="h-2"
                            data-testid={`progress-user-${user.id}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            data-testid={`button-view-${user.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => banMutation.mutate(user.id)}
                            disabled={banMutation.isPending}
                            data-testid={`button-ban-${user.id}`}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            {userStatusFilter === 'banned' ? 'Unban' : 'Ban'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {selectedUser?.profileImageUrl && (
                  <AvatarImage src={selectedUser.profileImageUrl} alt={selectedUser.name} />
                )}
                <AvatarFallback className="bg-blue-600 text-white">
                  {selectedUser && getUserInitials(selectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  {selectedUser?.name}
                  {selectedUser?.displayId && (
                    <Badge variant="outline" className="font-mono">{selectedUser.displayId}</Badge>
                  )}
                </div>
                <div className="text-sm font-normal text-muted-foreground">{selectedUser?.email}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="roles" data-testid="tab-access-roles">Access Roles</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                      <div className="font-medium">{selectedUser?.email}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>WhatsApp</span>
                      </div>
                      <div className="font-medium">{selectedUser?.whatsappNumber || 'N/A'}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>Role</span>
                      </div>
                      <div className="font-medium">
                        <Badge variant="secondary">{selectedUser?.role}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Joined</span>
                      </div>
                      <div className="font-medium">
                        {selectedUser?.createdAt && format(new Date(selectedUser.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {selectedUser?.profileCompletionPercentage || 0}% Complete
                      </span>
                    </div>
                    <Progress value={selectedUser?.profileCompletionPercentage || 0} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Access Roles & Permissions
                  </CardTitle>
                  <CardDescription>
                    Panel access levels for this user across WytNet platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* WytNet User Role - Always active for all users */}
                  <div className="flex items-center justify-between p-4 border rounded-lg" data-testid="role-wytnet-user">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">WytNet User</h3>
                        <p className="text-sm text-muted-foreground">Access to public portal and personal dashboard</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      Active
                    </Badge>
                  </div>

                  {/* Hub Admin Role - Only show if active */}
                  {(selectedUser?.role === 'hub_admin' || selectedUser?.role === 'admin') && (
                    <div className="flex items-center justify-between p-4 border rounded-lg" data-testid="role-hub-admin">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">WytNet Hub Admin</h3>
                          <p className="text-sm text-muted-foreground">Manage hub content, settings, and users</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Active
                      </Badge>
                    </div>
                  )}

                  {/* Engine Super Admin Role - Only show if active */}
                  {selectedUser?.isSuperAdmin && (
                    <div className="flex items-center justify-between p-4 border rounded-lg" data-testid="role-engine-admin">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">WytEngine Super Admin</h3>
                          <p className="text-sm text-muted-foreground">Full platform access and control</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Active
                      </Badge>
                    </div>
                  )}

                  {/* Additional Info */}
                  {selectedUser?.isSuperAdmin && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Super Admin Access</h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            This user has unrestricted access to all platform features including Engine Admin panel, Hub management, user controls, and system settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No recent activity</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Analytics data will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Verified Status</h3>
                      <p className="text-sm text-muted-foreground">User email verification status</p>
                    </div>
                    <Badge variant={selectedUser?.isVerified ? "default" : "secondary"}>
                      {selectedUser?.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Account Status</h3>
                      <p className="text-sm text-muted-foreground">Current account status</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-create-user">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with specified role
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter full name"
                required
                data-testid="input-fullName"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number (Optional)</Label>
              <Input
                id="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="+91 9876543210"
                data-testid="input-whatsappNumber"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="roleId">Role *</Label>
              <Select 
                value={formData.roleId} 
                onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                required
              >
                <SelectTrigger data-testid="select-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {rolesData?.roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 characters"
                required
                data-testid="input-password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                required
                data-testid="input-confirmPassword"
              />
            </div>
            
            <div className="flex gap-2 justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createUserMutation.isPending}
                data-testid="button-submit"
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
