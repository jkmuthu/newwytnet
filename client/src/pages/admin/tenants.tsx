import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, Eye, Users, Settings, Activity, Calendar, Globe, Mail, Phone, MapPin, Shield, Plus, Edit2, Trash2, Save } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TrashView } from "@/components/shared/TrashView";

interface OrgRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  permissions: {
    [appSlug: string]: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
    };
  };
  createdAt?: string;
}

const DEFAULT_ORG_APPS = [
  { slug: 'dashboard', name: 'Dashboard' },
  { slug: 'wytwall', name: 'WytWall' },
  { slug: 'wytapps', name: 'WytApps' },
  { slug: 'team', name: 'Team Management' },
  { slug: 'projects', name: 'Projects' },
  { slug: 'billing', name: 'Billing' },
  { slug: 'settings', name: 'Settings' },
];

const DEFAULT_ORG_ROLES: OrgRole[] = [
  {
    id: 'owner',
    name: 'Owner',
    slug: 'owner',
    description: 'Full access to all organization features. Cannot be modified.',
    isSystem: true,
    permissions: DEFAULT_ORG_APPS.reduce((acc, app) => ({
      ...acc,
      [app.slug]: { view: true, add: true, edit: true, delete: true }
    }), {}),
  },
  {
    id: 'admin',
    name: 'Admin',
    slug: 'admin',
    description: 'Can manage team members and most organization settings.',
    isSystem: true,
    permissions: DEFAULT_ORG_APPS.reduce((acc, app) => ({
      ...acc,
      [app.slug]: { view: true, add: true, edit: true, delete: app.slug !== 'billing' }
    }), {}),
  },
  {
    id: 'analyst',
    name: 'Analyst',
    slug: 'analyst',
    description: 'Can view data and create reports. Limited editing access.',
    isSystem: true,
    permissions: DEFAULT_ORG_APPS.reduce((acc, app) => ({
      ...acc,
      [app.slug]: { view: true, add: app.slug === 'wytwall', edit: false, delete: false }
    }), {}),
  },
  {
    id: 'custom',
    name: 'Custom',
    slug: 'custom',
    description: 'Fully customizable permissions set by the organization owner.',
    isSystem: true,
    permissions: DEFAULT_ORG_APPS.reduce((acc, app) => ({
      ...acc,
      [app.slug]: { view: true, add: false, edit: false, delete: false }
    }), {}),
  },
];

interface Organization {
  id: string;
  displayId?: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'trash';
  settings?: any;
  createdAt: string;
  industry?: string;
  employees?: number;
  website?: string;
  email?: string;
  phone?: string;
  location?: string;
  teamMembers?: number;
  deletedAt: string | null;
  deletedBy: string | null;
  deleteReason: string | null;
}


export default function AdminTenants() {
  const [orgStatusFilter, setOrgStatusFilter] = useState<'active' | 'inactive' | 'trash' | 'settings'>('active');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isOrgDetailOpen, setIsOrgDetailOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<OrgRole | null>(null);
  const [orgRoles, setOrgRoles] = useState<OrgRole[]>(DEFAULT_ORG_ROLES);
  const { toast } = useToast();

  // Fetch org roles settings from API
  const { data: orgRolesData } = useQuery({
    queryKey: ['/api/admin/settings/org-roles'],
  });

  // Update local state when data is fetched
  useEffect(() => {
    if ((orgRolesData as any)?.roles) {
      setOrgRoles((orgRolesData as any).roles);
    }
  }, [orgRolesData]);

  // Save org roles mutation
  const saveRolesMutation = useMutation({
    mutationFn: async (roles: OrgRole[]) => {
      return await apiRequest('/api/admin/settings/org-roles', 'POST', { roles });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/org-roles'] });
      toast({ title: "Success", description: "Organization roles saved successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to save roles", variant: "destructive" });
    }
  });

  const handleEditRole = (role: OrgRole) => {
    setEditingRole({ ...role, permissions: { ...role.permissions } });
    setIsEditRoleOpen(true);
  };

  const handleSaveRole = () => {
    if (!editingRole) return;
    
    const updatedRoles = orgRoles.map(r => 
      r.id === editingRole.id ? editingRole : r
    );
    setOrgRoles(updatedRoles);
    saveRolesMutation.mutate(updatedRoles);
    setIsEditRoleOpen(false);
    setEditingRole(null);
  };

  const handlePermissionChange = (appSlug: string, permission: 'view' | 'add' | 'edit' | 'delete', value: boolean) => {
    if (!editingRole) return;
    
    const newPermissions = { ...editingRole.permissions };
    if (!newPermissions[appSlug]) {
      newPermissions[appSlug] = { view: false, add: false, edit: false, delete: false };
    }
    newPermissions[appSlug] = { ...newPermissions[appSlug], [permission]: value };
    
    // If removing view, remove all other permissions
    if (permission === 'view' && !value) {
      newPermissions[appSlug] = { view: false, add: false, edit: false, delete: false };
    }
    
    setEditingRole({ ...editingRole, permissions: newPermissions });
  };

  const getRoleBadgeColor = (slug: string) => {
    switch (slug) {
      case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'analyst': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    }
  };

  const { data: orgsData, isLoading } = useQuery({
    queryKey: ['/api/admin/organizations'],
  });

  // Trash management queries and mutations
  const { data: trashOrgsData, isLoading: isLoadingTrash } = useQuery<{
    success: boolean;
    tenants: Organization[];
    count: number;
  }>({
    queryKey: ['/api/admin/trash/tenants'],
  });

  const restoreOrgMutation = useMutation({
    mutationFn: async (orgId: string) => {
      return await apiRequest(`/api/admin/trash/tenants/${orgId}/restore`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trash/tenants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/organizations'] });
      toast({ title: "Success", description: "Organization restored successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to restore organization", variant: "destructive" });
    }
  });

  const permanentlyDeleteOrgMutation = useMutation({
    mutationFn: async (orgId: string) => {
      return await apiRequest(`/api/admin/trash/tenants/${orgId}/permanent`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trash/tenants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/organizations'] });
      toast({ title: "Success", description: "Organization permanently deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete organization", variant: "destructive" });
    }
  });

  const organizations = ((orgsData as any)?.organizations || []) as Organization[];
  const filteredOrgs = organizations.filter((org: Organization) => org.status === orgStatusFilter);

  const handleViewOrg = (org: Organization) => {
    setSelectedOrg(org);
    setIsOrgDetailOpen(true);
  };

  const getOrgInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Inactive</Badge>;
      case 'trash':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Trash</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">All Orgs</h1>
        <p className="text-muted-foreground">Manage all organizations and teams</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            All Organizations
            <Badge variant="secondary" className="ml-2">
              {organizations.length} total
            </Badge>
          </CardTitle>
          <CardDescription>View and manage all organizations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Filter Tabs */}
          <Tabs value={orgStatusFilter} onValueChange={(value) => setOrgStatusFilter(value as any)} className="w-full">
            <TabsList>
              <TabsTrigger value="active" data-testid="tab-orgs-active">
                Active ({organizations.filter(o => o.status === 'active').length})
              </TabsTrigger>
              <TabsTrigger value="inactive" data-testid="tab-orgs-inactive">
                Inactive ({organizations.filter(o => o.status === 'inactive').length})
              </TabsTrigger>
              <TabsTrigger value="trash" data-testid="tab-orgs-trash">
                Trash ({trashOrgsData?.count || 0})
              </TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-orgs-settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="mt-6">
              <div className="space-y-6">
                {/* Organization Roles & Permissions */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Organization User Roles & Permissions
                        </CardTitle>
                        <CardDescription>
                          Define roles and their permissions for all organizations. Changes apply globally.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Roles List */}
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-[200px]">Role</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="w-[120px] text-center">Permissions</TableHead>
                              <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orgRoles.map((role) => (
                              <TableRow key={role.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Badge className={getRoleBadgeColor(role.slug)}>
                                      {role.name}
                                    </Badge>
                                    {role.isSystem && (
                                      <Badge variant="outline" className="text-xs">System</Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {role.description}
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-sm text-muted-foreground">
                                    {Object.values(role.permissions || {}).filter((p: any) => p.view).length} apps
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRole(role)}
                                    disabled={role.slug === 'owner'}
                                    data-testid={`button-edit-role-${role.slug}`}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Info Note */}
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Note:</strong> These role settings apply globally to all organizations. 
                          The <strong>Owner</strong> role always has full permissions and cannot be modified. 
                          When you update permissions here, they will be used for new team member invitations.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Default Organization Settings</CardTitle>
                    <CardDescription>Configure default settings for new organizations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Allow team member invitations</p>
                          <p className="text-sm text-muted-foreground">Organization owners can invite team members</p>
                        </div>
                        <Switch defaultChecked data-testid="switch-allow-invites" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable WytWall for organizations</p>
                          <p className="text-sm text-muted-foreground">Organizations can post on WytWall</p>
                        </div>
                        <Switch defaultChecked data-testid="switch-enable-wytwall" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable billing management</p>
                          <p className="text-sm text-muted-foreground">Organizations can manage their billing</p>
                        </div>
                        <Switch defaultChecked data-testid="switch-enable-billing" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Trash View for deleted organizations */}
          {orgStatusFilter === 'settings' ? null : orgStatusFilter === 'trash' ? (
            <TrashView
              items={trashOrgsData?.tenants || []}
              isLoading={isLoadingTrash}
              entityType="Organization"
              onRestore={async (id: string) => { await restoreOrgMutation.mutateAsync(id); }}
              onPermanentDelete={async (id: string) => { await permanentlyDeleteOrgMutation.mutateAsync(id); }}
              renderItemName={(org: Organization) => org.name}
              renderItemDetails={(org: Organization) => (
                <div className="text-sm text-muted-foreground">
                  {org.displayId && <span className="font-mono">{org.displayId}</span>}
                  {org.industry && <span className="ml-2">• {org.industry}</span>}
                </div>
              )}
            />
          ) : (
            <>
              {/* Organizations Table */}
              {filteredOrgs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {orgStatusFilter} organizations found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Team Members</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrgs.map((org) => (
                        <TableRow key={org.id} data-testid={`row-org-${org.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-purple-600 text-white">
                                  {getOrgInitials(org.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{org.name}</div>
                                <div className="text-sm text-muted-foreground font-mono">{org.displayId}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{org.industry}</Badge>
                          </TableCell>
                          <TableCell>{org.employees} employees</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{org.teamMembers}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(org.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(org.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrg(org)}
                              data-testid={`button-view-org-${org.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Organization Detail Modal */}
      <Dialog open={isOrgDetailOpen} onOpenChange={setIsOrgDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-purple-600 text-white">
                  {selectedOrg && getOrgInitials(selectedOrg.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  {selectedOrg?.name}
                  {selectedOrg?.displayId && (
                    <Badge variant="outline" className="font-mono">{selectedOrg.displayId}</Badge>
                  )}
                </div>
                <div className="text-sm font-normal text-muted-foreground">{selectedOrg?.slug}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-4 w-4" />
                        <span>Industry</span>
                      </div>
                      <div className="font-medium">{selectedOrg?.industry}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Employees</span>
                      </div>
                      <div className="font-medium">{selectedOrg?.employees} employees</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </div>
                      <div className="font-medium text-sm break-all">
                        <a href={selectedOrg?.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedOrg?.website}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Location</span>
                      </div>
                      <div className="font-medium">{selectedOrg?.location}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                      <div className="font-medium text-sm">{selectedOrg?.email}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>Phone</span>
                      </div>
                      <div className="font-medium">{selectedOrg?.phone}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="team" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Team Members</span>
                    <Badge variant="secondary">{selectedOrg?.teamMembers} members</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Team member management will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Status</h3>
                      <p className="text-sm text-muted-foreground">Current organization status</p>
                    </div>
                    {selectedOrg && getStatusBadge(selectedOrg.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Created</h3>
                      <p className="text-sm text-muted-foreground">Organization creation date</p>
                    </div>
                    <div className="text-sm">
                      {selectedOrg?.createdAt && format(new Date(selectedOrg.createdAt), 'PPP')}
                    </div>
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
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Role Permissions Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Edit Role: {editingRole?.name}
            </DialogTitle>
            <DialogDescription>
              Configure permissions for this role. Changes will apply globally to all organizations.
            </DialogDescription>
          </DialogHeader>

          {editingRole && (
            <div className="space-y-6 py-4">
              {/* Role Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roleDescription">Description</Label>
                  <Textarea
                    id="roleDescription"
                    value={editingRole.description}
                    onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                    placeholder="Role description"
                    className="h-20"
                    data-testid="input-role-description"
                  />
                </div>
              </div>

              {/* Permissions Matrix */}
              <div className="space-y-3">
                <Label>App Permissions</Label>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[180px]">App / Feature</TableHead>
                        <TableHead className="w-[100px] text-center">View</TableHead>
                        <TableHead className="w-[100px] text-center">Add</TableHead>
                        <TableHead className="w-[100px] text-center">Edit</TableHead>
                        <TableHead className="w-[100px] text-center">Delete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {DEFAULT_ORG_APPS.map((app) => {
                        const perms = editingRole.permissions[app.slug] || { view: false, add: false, edit: false, delete: false };
                        return (
                          <TableRow key={app.slug}>
                            <TableCell className="font-medium">{app.name}</TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perms.view}
                                onCheckedChange={(checked) => handlePermissionChange(app.slug, 'view', !!checked)}
                                data-testid={`checkbox-${app.slug}-view`}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perms.add}
                                disabled={!perms.view}
                                onCheckedChange={(checked) => handlePermissionChange(app.slug, 'add', !!checked)}
                                data-testid={`checkbox-${app.slug}-add`}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perms.edit}
                                disabled={!perms.view}
                                onCheckedChange={(checked) => handlePermissionChange(app.slug, 'edit', !!checked)}
                                data-testid={`checkbox-${app.slug}-edit`}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={perms.delete}
                                disabled={!perms.view}
                                onCheckedChange={(checked) => handlePermissionChange(app.slug, 'delete', !!checked)}
                                data-testid={`checkbox-${app.slug}-delete`}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground">
                  If "View" is disabled, the app/feature will be hidden from users with this role.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={saveRolesMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveRolesMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
