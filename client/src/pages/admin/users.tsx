import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users as UsersIcon, Settings, Award, Shield, CheckCircle, XCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  profileCompletionPercentage?: number;
}

interface ProfileField {
  id: string;
  fieldName: string;
  fieldLabel: string;
  weightPercentage: number;
  isRequired: boolean;
  tabSection: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState("users");
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<ProfileField | null>(null);
  const [fieldFormData, setFieldFormData] = useState({
    fieldName: "",
    fieldLabel: "",
    weightPercentage: 0,
    isRequired: false,
    tabSection: "personal"
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

  const { data: profileFieldsData, isLoading: isLoadingFields } = useQuery<{
    success: boolean;
    fields: ProfileField[];
  }>({
    queryKey: ['/api/admin/profile-fields'],
  });

  const createFieldMutation = useMutation({
    mutationFn: async (data: typeof fieldFormData) => {
      const response = await fetch('/api/admin/profile-fields', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create field');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/profile-fields'] });
      toast({ title: "Success", description: "Profile field created successfully" });
      setIsFieldDialogOpen(false);
      resetFieldForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create profile field", variant: "destructive" });
    }
  });

  const updateFieldMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<typeof fieldFormData> }) => {
      const response = await fetch(`/api/admin/profile-fields/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.updates),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update field');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/profile-fields'] });
      toast({ title: "Success", description: "Profile field updated successfully" });
      setIsFieldDialogOpen(false);
      resetFieldForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile field", variant: "destructive" });
    }
  });

  const deleteFieldMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/profile-fields/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete field');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/profile-fields'] });
      toast({ title: "Success", description: "Profile field deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete profile field", variant: "destructive" });
    }
  });

  const resetFieldForm = () => {
    setFieldFormData({
      fieldName: "",
      fieldLabel: "",
      weightPercentage: 0,
      isRequired: false,
      tabSection: "personal"
    });
    setEditingField(null);
  };

  const openEditDialog = (field: ProfileField) => {
    setEditingField(field);
    setFieldFormData({
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      weightPercentage: field.weightPercentage,
      isRequired: field.isRequired,
      tabSection: field.tabSection
    });
    setIsFieldDialogOpen(true);
  };

  const handleFieldSubmit = () => {
    if (editingField) {
      updateFieldMutation.mutate({
        id: editingField.id,
        updates: {
          fieldLabel: fieldFormData.fieldLabel,
          weightPercentage: fieldFormData.weightPercentage,
          isRequired: fieldFormData.isRequired,
          tabSection: fieldFormData.tabSection
        }
      });
    } else {
      createFieldMutation.mutate(fieldFormData);
    }
  };

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
                        <TableHead>Profile Completion</TableHead>
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
                            <div className="space-y-1 min-w-[120px]">
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Profile Fields Configuration
                  </CardTitle>
                  <CardDescription>Manage profile fields, completion tracking, and points allocation</CardDescription>
                </div>
                <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetFieldForm(); setIsFieldDialogOpen(true); }} data-testid="button-add-field">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-field-form">
                    <DialogHeader>
                      <DialogTitle>{editingField ? 'Edit Profile Field' : 'Add Profile Field'}</DialogTitle>
                      <DialogDescription>
                        {editingField ? 'Update the profile field configuration' : 'Create a new profile field for completion tracking'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fieldName">Field Name (Database Key)</Label>
                        <Input
                          id="fieldName"
                          value={fieldFormData.fieldName}
                          onChange={(e) => setFieldFormData({ ...fieldFormData, fieldName: e.target.value })}
                          placeholder="e.g., bio, location, website"
                          disabled={!!editingField}
                          data-testid="input-field-name"
                        />
                        <p className="text-xs text-muted-foreground">Must match the database field name exactly</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fieldLabel">Display Label</Label>
                        <Input
                          id="fieldLabel"
                          value={fieldFormData.fieldLabel}
                          onChange={(e) => setFieldFormData({ ...fieldFormData, fieldLabel: e.target.value })}
                          placeholder="e.g., Biography, Location, Website"
                          data-testid="input-field-label"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weightPercentage">Weight Percentage (0-100)</Label>
                        <Input
                          id="weightPercentage"
                          type="number"
                          min="0"
                          max="100"
                          value={fieldFormData.weightPercentage}
                          onChange={(e) => setFieldFormData({ ...fieldFormData, weightPercentage: parseInt(e.target.value) || 0 })}
                          data-testid="input-weight-percentage"
                        />
                        <p className="text-xs text-muted-foreground">How much this field contributes to profile completion</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tabSection">Tab Section</Label>
                        <Select
                          value={fieldFormData.tabSection}
                          onValueChange={(value) => setFieldFormData({ ...fieldFormData, tabSection: value })}
                        >
                          <SelectTrigger id="tabSection" data-testid="select-tab-section">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personal">Personal Information</SelectItem>
                            <SelectItem value="professional">Professional Information</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isRequired"
                          checked={fieldFormData.isRequired}
                          onCheckedChange={(checked) => setFieldFormData({ ...fieldFormData, isRequired: checked })}
                          data-testid="switch-is-required"
                        />
                        <Label htmlFor="isRequired">Required Field</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsFieldDialogOpen(false)} data-testid="button-cancel-field">
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleFieldSubmit} 
                        disabled={createFieldMutation.isPending || updateFieldMutation.isPending}
                        data-testid="button-save-field"
                      >
                        {(createFieldMutation.isPending || updateFieldMutation.isPending) ? 'Saving...' : 'Save Field'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
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

                {isLoadingFields ? (
                  <div className="text-center py-8 text-muted-foreground">Loading profile fields...</div>
                ) : !profileFieldsData?.fields || profileFieldsData.fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No profile fields configured. Click "Add Field" to create one.
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field Name</TableHead>
                          <TableHead>Display Label</TableHead>
                          <TableHead>Weight %</TableHead>
                          <TableHead>Section</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profileFieldsData.fields.map((field) => (
                          <TableRow key={field.id} data-testid={`row-field-${field.id}`}>
                            <TableCell className="font-mono text-sm">{field.fieldName}</TableCell>
                            <TableCell>{field.fieldLabel}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{field.weightPercentage}%</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={field.tabSection === 'personal' ? 'default' : 'outline'}>
                                {field.tabSection === 'personal' ? 'Personal' : 'Professional'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {field.isRequired ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(field)}
                                  data-testid={`button-edit-${field.id}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Delete field "${field.fieldLabel}"?`)) {
                                      deleteFieldMutation.mutate(field.id);
                                    }
                                  }}
                                  data-testid={`button-delete-${field.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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
