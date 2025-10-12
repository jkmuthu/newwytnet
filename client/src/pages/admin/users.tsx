import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users as UsersIcon, Settings, Award, Shield, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface User {
  id: string;
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
}

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState("users");

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

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage all users, profile fields, and points configuration</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="users" className="flex items-center gap-2" data-testid="tab-users-list">
            <UsersIcon className="h-4 w-4" />
            Users List
          </TabsTrigger>
          <TabsTrigger value="profile-fields" className="flex items-center gap-2" data-testid="tab-profile-fields">
            <Settings className="h-4 w-4" />
            Profile Fields
          </TabsTrigger>
          <TabsTrigger value="points-setup" className="flex items-center gap-2" data-testid="tab-points-setup">
            <Award className="h-4 w-4" />
            Points Setup
          </TabsTrigger>
        </TabsList>

        {/* Users List Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
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
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading users...</div>
              ) : !usersData?.users || usersData.users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No users found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.users.map((user) => (
                        <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
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
                                      Super Admin
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{user.whatsappNumber}</div>
                              <div className="text-muted-foreground">{user.country}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {user.isVerified ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm text-green-600">Verified</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-400">Unverified</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Fields Tab */}
        <TabsContent value="profile-fields">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Profile Fields Configuration
              </CardTitle>
              <CardDescription>Manage profile fields, completion tracking, and points allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Profile Completion System</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Configure which profile fields are required and how much each field contributes to the overall profile completion percentage.
                    Users earn points based on their profile completion.
                  </p>
                </div>
                
                <div className="text-muted-foreground py-8 text-center">
                  Profile fields management interface coming soon...
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Points Setup Tab */}
        <TabsContent value="points-setup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Points Configuration
              </CardTitle>
              <CardDescription>Configure points allocation for profile completion and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">WytPoints Economy</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Set point values for completing profile fields, engagement activities, and other user actions.
                    Points can be used in the marketplace and for premium features.
                  </p>
                </div>

                <div className="text-muted-foreground py-8 text-center">
                  Points setup interface coming soon...
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
