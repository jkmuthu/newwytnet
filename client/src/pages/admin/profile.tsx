import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Shield, Clock, Edit } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { format } from "date-fns";

export default function AdminProfile() {
  const { adminUser } = useAdminAuth();

  const getUserInitials = (user: any) => {
    if (!user?.name) return 'A';
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.name[0]?.toUpperCase() || 'A';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Profile</h1>
        <p className="text-muted-foreground">Manage your administrator profile and account details</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-red-200 dark:border-red-800" data-testid="avatar-admin-profile">
                {adminUser?.profileImageUrl && (
                  <AvatarImage src={adminUser.profileImageUrl} alt={adminUser.name || "Admin"} />
                )}
                <AvatarFallback className="bg-red-600 text-white text-2xl">
                  {getUserInitials(adminUser)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{adminUser?.name || "Admin User"}</CardTitle>
                <CardDescription className="text-base">{adminUser?.email}</CardDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{adminUser?.role || 'admin'}</Badge>
                  {adminUser?.isSuperAdmin && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Super Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button data-testid="button-edit-profile">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details" data-testid="tab-profile-details">
            <User className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-profile-activity">
            <Clock className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-profile-security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your admin account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={adminUser?.name || ''} 
                    disabled 
                    data-testid="input-admin-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={adminUser?.email || ''} 
                    disabled 
                    data-testid="input-admin-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role" 
                    value={adminUser?.role || 'admin'} 
                    disabled 
                    data-testid="input-admin-role"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant">Tenant ID</Label>
                  <Input 
                    id="tenant" 
                    value={adminUser?.tenantId || 'N/A'} 
                    disabled 
                    data-testid="input-admin-tenant"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No recent activity to display</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your admin account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" data-testid="button-enable-2fa">Enable 2FA</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Change Password</h3>
                  <p className="text-sm text-muted-foreground">Update your admin password</p>
                </div>
                <Button variant="outline" data-testid="button-change-password">Change Password</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Session Management</h3>
                  <p className="text-sm text-muted-foreground">View and manage active sessions</p>
                </div>
                <Button variant="outline" data-testid="button-view-sessions">View Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
