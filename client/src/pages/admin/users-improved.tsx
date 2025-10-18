import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users as UsersIcon, Eye, Ban, Trash2, Shield, Clock, Mail, Phone, Calendar, Activity, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

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

export default function AdminUsersImproved() {
  const [userStatusFilter, setUserStatusFilter] = useState<'active' | 'admins' | 'banned' | 'trash'>('active');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
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
  const trashCount = usersData?.users?.filter(u => u.status === 'trash').length || 0;

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage all users and view detailed analytics</p>
      </div>

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
            </TabsList>
          </Tabs>

          {/* Users Table */}
          {isLoading ? (
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
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
    </div>
  );
}
