import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, Plus, Edit, Trash2, Users, Key, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Role {
  id: string;
  displayId: string;
  name: string;
  description: string | null;
  scope: string;
  isSystem: boolean;
  isActive: boolean;
  permissions?: Permission[];
}

interface Permission {
  id: string;
  displayId: string;
  resource: string;
  action: string;
  scope: string;
  description: string | null;
}

interface UserRole {
  role: Role;
  assignedAt: string;
  expiresAt: string | null;
}

export default function AdminRolesPermissions() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("roles");
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery<{ success: boolean; roles: Role[] }>({
    queryKey: ["/api/admin/roles"],
  });

  // Fetch permissions
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery<{
    success: boolean;
    permissions: Permission[];
    grouped: Record<string, Permission[]>;
  }>({
    queryKey: ["/api/admin/permissions"],
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      const { permissionIds, ...roleData } = data;
      
      // Create the role
      const createResponse = await apiRequest("/api/admin/roles", "POST", roleData);
      const createResult = await createResponse.json();
      
      // If permissions were selected, assign them
      if (permissionIds && permissionIds.length > 0 && createResult.role) {
        await apiRequest(
          `/api/admin/roles/${createResult.role.id}/permissions`,
          "POST",
          { permissionIds }
        );
      }
      
      return createResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setCreateRoleOpen(false);
      toast({ title: "Role created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create role", description: error.message, variant: "destructive" });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/admin/roles/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setEditRoleOpen(false);
      toast({ title: "Role updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update role", description: error.message, variant: "destructive" });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/roles/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({ title: "Role deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete role", description: error.message, variant: "destructive" });
    },
  });

  // Assign permissions mutation
  const assignPermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      apiRequest(`/api/admin/roles/${roleId}/permissions`, "POST", { permissionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({ title: "Permissions assigned successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to assign permissions",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const roles = rolesData?.roles || [];
  const permissions = permissionsData?.permissions || [];
  const groupedPermissions = permissionsData?.grouped || {};

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-heading">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage user roles and access control</p>
        </div>
        <Button onClick={() => setCreateRoleOpen(true)} data-testid="button-create-role">
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Roles</CardTitle>
                  <CardDescription>Configure roles and their permissions</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-roles"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {rolesLoading ? (
                <div className="text-center py-8">Loading roles...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Display ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role.id} data-testid={`row-role-${role.id}`}>
                        <TableCell>
                          <Badge variant="outline">{role.displayId}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {role.description || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{role.scope}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{role.permissions?.length || 0} assigned</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={role.isActive ? "default" : "secondary"}>
                            {role.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRole(role);
                                setEditRoleOpen(true);
                              }}
                              data-testid={`button-edit-${role.id}`}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {!role.isSystem && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (confirm(`Delete role "${role.name}"?`)) {
                                    deleteRoleMutation.mutate(role.id);
                                  }
                                }}
                                data-testid={`button-delete-${role.id}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
      </div>

      {/* Create Role Dialog */}
      <CreateRoleDialog
        open={createRoleOpen}
        onOpenChange={setCreateRoleOpen}
        permissions={permissions}
        groupedPermissions={groupedPermissions}
        onSubmit={(data) => createRoleMutation.mutate(data)}
        isLoading={createRoleMutation.isPending}
      />

      {/* Edit Role Dialog */}
      {selectedRole && (
        <EditRoleDialog
          open={editRoleOpen}
          onOpenChange={setEditRoleOpen}
          role={selectedRole}
          permissions={permissions}
          groupedPermissions={groupedPermissions}
          onUpdate={(data) => updateRoleMutation.mutate({ id: selectedRole.id, data })}
          onAssignPermissions={(permissionIds) =>
            assignPermissionsMutation.mutate({ roleId: selectedRole.id, permissionIds })
          }
          isLoading={updateRoleMutation.isPending || assignPermissionsMutation.isPending}
        />
      )}
    </div>
  );
}

// Helper to get a nice label for resources - simplified flat structure
function getResourceLabel(resource: string): string {
  const labels: Record<string, string> = {
    "users": "Users",
    "organizations": "Organizations",
    "entities": "Entities",
    "datasets": "DataSets",
    "media": "Media",
    "modules": "Modules",
    "apps": "Apps",
    "hubs": "Hubs",
    "cms": "CMS",
    "themes": "Themes",
    "integrations": "Integrations",
    "pricing": "Pricing",
    "help-support": "Help & Support",
    "analytics": "Analytics",
    "roles-permissions": "Roles & Permissions",
    "system-security": "System & Security",
  };
  return labels[resource] || resource.charAt(0).toUpperCase() + resource.slice(1);
}

// Create Role Dialog Component with Table-based Permission Matrix
function CreateRoleDialog({
  open,
  onOpenChange,
  permissions,
  groupedPermissions,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions: Permission[];
  groupedPermissions: Record<string, Permission[]>;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    scope: "engine",
    isActive: true,
  });
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, Set<string>>>({});

  // Filter engine-scoped permissions
  const engineResources = Object.entries(groupedPermissions).filter(([resource, perms]) => 
    perms.some(p => p.scope === 'engine')
  );

  const actions = ['view', 'create', 'edit', 'delete'];

  const handleSubmit = async () => {
    // Convert selected permissions to array of IDs
    const permissionIds = Object.values(selectedPermissions)
      .flatMap((actions) => Array.from(actions));
    
    // Submit role data with selected permissions
    await onSubmit({ ...formData, permissionIds });
    
    // Reset form
    setFormData({ name: "", description: "", scope: "engine", isActive: true });
    setSelectedPermissions({});
  };

  const togglePermission = (resource: string, action: string, permId: string) => {
    setSelectedPermissions((prev) => {
      const resourcePerms = new Set(prev[resource] || []);
      if (resourcePerms.has(permId)) {
        resourcePerms.delete(permId);
      } else {
        resourcePerms.add(permId);
      }
      return {
        ...prev,
        [resource]: resourcePerms,
      };
    });
  };

  const isPermissionSelected = (resource: string, permId: string) => {
    return selectedPermissions[resource]?.has(permId) || false;
  };

  // Select/deselect all permissions for a specific action
  const toggleAllForAction = (action: string) => {
    const allPermIdsForAction: { resource: string; permId: string }[] = [];
    
    // Collect all permission IDs for this action across all resources
    engineResources.forEach(([resource, perms]) => {
      const perm = perms.find(p => p.action === action && p.scope === 'engine');
      if (perm) {
        allPermIdsForAction.push({ resource, permId: perm.id });
      }
    });

    // Check if all are currently selected
    const allSelected = allPermIdsForAction.every(({ resource, permId }) => 
      isPermissionSelected(resource, permId)
    );

    // Toggle all
    setSelectedPermissions((prev) => {
      const updated = { ...prev };
      allPermIdsForAction.forEach(({ resource, permId }) => {
        if (!updated[resource]) {
          updated[resource] = new Set();
        }
        if (allSelected) {
          updated[resource].delete(permId);
        } else {
          updated[resource].add(permId);
        }
      });
      return updated;
    });
  };

  // Check if all permissions for an action are selected
  const isAllSelectedForAction = (action: string) => {
    let hasAny = false;
    let allSelected = true;
    
    engineResources.forEach(([resource, perms]) => {
      const perm = perms.find(p => p.action === action && p.scope === 'engine');
      if (perm) {
        hasAny = true;
        if (!isPermissionSelected(resource, perm.id)) {
          allSelected = false;
        }
      }
    });
    
    return hasAny && allSelected;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Engine Role</DialogTitle>
          <DialogDescription>Define role details and assign permissions</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Role Name and Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                placeholder="e.g., Content Manager, Analytics Viewer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="input-role-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Role Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the role's responsibilities and access level..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                data-testid="input-role-description"
              />
            </div>
          </div>

          {/* Permission Matrix Table */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Permissions Matrix</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Sections</TableHead>
                    <TableHead className="text-center w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span>View</span>
                        <Checkbox
                          checked={isAllSelectedForAction('view')}
                          onCheckedChange={() => toggleAllForAction('view')}
                          data-testid="checkbox-select-all-view"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span>Create</span>
                        <Checkbox
                          checked={isAllSelectedForAction('create')}
                          onCheckedChange={() => toggleAllForAction('create')}
                          data-testid="checkbox-select-all-create"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span>Edit</span>
                        <Checkbox
                          checked={isAllSelectedForAction('edit')}
                          onCheckedChange={() => toggleAllForAction('edit')}
                          data-testid="checkbox-select-all-edit"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span>Delete</span>
                        <Checkbox
                          checked={isAllSelectedForAction('delete')}
                          onCheckedChange={() => toggleAllForAction('delete')}
                          data-testid="checkbox-select-all-delete"
                        />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engineResources.map(([resource, perms]) => {
                    // Group permissions by action for this resource
                    const permsByAction = perms.reduce((acc, perm) => {
                      if (perm.scope === 'engine') {
                        acc[perm.action] = perm.id;
                      }
                      return acc;
                    }, {} as Record<string, string>);

                    return (
                      <TableRow key={resource}>
                        <TableCell className="font-medium">{getResourceLabel(resource)}</TableCell>
                        {actions.map((action) => {
                          const permId = permsByAction[action];
                          return (
                            <TableCell key={action} className="text-center">
                              {permId ? (
                                <Checkbox
                                  checked={isPermissionSelected(resource, permId)}
                                  onCheckedChange={() => togglePermission(resource, action, permId)}
                                  data-testid={`checkbox-${resource}-${action}`}
                                />
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !formData.name}
            data-testid="button-create-role"
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Role Dialog Component
function EditRoleDialog({
  open,
  onOpenChange,
  role,
  permissions,
  groupedPermissions,
  onUpdate,
  onAssignPermissions,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  permissions: Permission[];
  groupedPermissions: Record<string, Permission[]>;
  onUpdate: (data: any) => void;
  onAssignPermissions: (permissionIds: string[]) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: role.name,
    description: role.description || "",
    isActive: role.isActive,
  });

  // Initialize selected permissions using the same structure as CreateRoleDialog
  const initializePermissions = () => {
    const permsByResource: Record<string, Set<string>> = {};
    const rolePermIds = role.permissions?.map((p) => p.id) || [];
    
    Object.entries(groupedPermissions).forEach(([resource, perms]) => {
      const resourcePerms = new Set<string>();
      perms.forEach((perm) => {
        if (rolePermIds.includes(perm.id)) {
          resourcePerms.add(perm.id);
        }
      });
      if (resourcePerms.size > 0) {
        permsByResource[resource] = resourcePerms;
      }
    });
    
    return permsByResource;
  };

  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, Set<string>>>(
    initializePermissions()
  );

  // Filter engine-scoped permissions
  const engineResources = Object.entries(groupedPermissions).filter(([resource, perms]) => 
    perms.some(p => p.scope === 'engine')
  );

  const actions = ['view', 'create', 'edit', 'delete'];

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleAssignPermissions = () => {
    // Convert selected permissions to array of IDs
    const permissionIds = Object.values(selectedPermissions)
      .flatMap((actions) => Array.from(actions));
    onAssignPermissions(permissionIds);
  };

  const togglePermission = (resource: string, action: string, permId: string) => {
    setSelectedPermissions((prev) => {
      const resourcePerms = new Set(prev[resource] || []);
      if (resourcePerms.has(permId)) {
        resourcePerms.delete(permId);
      } else {
        resourcePerms.add(permId);
      }
      return {
        ...prev,
        [resource]: resourcePerms,
      };
    });
  };

  const isPermissionSelected = (resource: string, permId: string) => {
    return selectedPermissions[resource]?.has(permId) || false;
  };

  // Select/deselect all permissions for a specific action
  const toggleAllForAction = (action: string) => {
    const allPermIdsForAction: { resource: string; permId: string }[] = [];
    
    // Collect all permission IDs for this action across all resources
    engineResources.forEach(([resource, perms]) => {
      const perm = perms.find(p => p.action === action && p.scope === 'engine');
      if (perm) {
        allPermIdsForAction.push({ resource, permId: perm.id });
      }
    });

    // Check if all are currently selected
    const allSelected = allPermIdsForAction.every(({ resource, permId }) => 
      isPermissionSelected(resource, permId)
    );

    // Toggle all
    setSelectedPermissions((prev) => {
      const updated = { ...prev };
      allPermIdsForAction.forEach(({ resource, permId }) => {
        if (!updated[resource]) {
          updated[resource] = new Set();
        }
        if (allSelected) {
          updated[resource].delete(permId);
        } else {
          updated[resource].add(permId);
        }
      });
      return updated;
    });
  };

  // Check if all permissions for an action are selected
  const isAllSelectedForAction = (action: string) => {
    let hasAny = false;
    let allSelected = true;
    
    engineResources.forEach(([resource, perms]) => {
      const perm = perms.find(p => p.action === action && p.scope === 'engine');
      if (perm) {
        hasAny = true;
        if (!isPermissionSelected(resource, perm.id)) {
          allSelected = false;
        }
      }
    });
    
    return hasAny && allSelected;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Role: {role.name}</DialogTitle>
          <DialogDescription>{role.displayId}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Role Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-edit-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="input-edit-description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                  data-testid="checkbox-active"
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} data-testid="button-update-role">
                  {isLoading ? "Updating..." : "Update Role"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="permissions" className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3">Permissions Matrix</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Sections</TableHead>
                      <TableHead className="text-center w-[100px]">
                        <div className="flex flex-col items-center gap-1">
                          <span>View</span>
                          <Checkbox
                            checked={isAllSelectedForAction('view')}
                            onCheckedChange={() => toggleAllForAction('view')}
                            data-testid="checkbox-select-all-view-edit"
                          />
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-[100px]">
                        <div className="flex flex-col items-center gap-1">
                          <span>Create</span>
                          <Checkbox
                            checked={isAllSelectedForAction('create')}
                            onCheckedChange={() => toggleAllForAction('create')}
                            data-testid="checkbox-select-all-create-edit"
                          />
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-[100px]">
                        <div className="flex flex-col items-center gap-1">
                          <span>Edit</span>
                          <Checkbox
                            checked={isAllSelectedForAction('edit')}
                            onCheckedChange={() => toggleAllForAction('edit')}
                            data-testid="checkbox-select-all-edit-edit"
                          />
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-[100px]">
                        <div className="flex flex-col items-center gap-1">
                          <span>Delete</span>
                          <Checkbox
                            checked={isAllSelectedForAction('delete')}
                            onCheckedChange={() => toggleAllForAction('delete')}
                            data-testid="checkbox-select-all-delete-edit"
                          />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {engineResources.map(([resource, perms]) => {
                      // Group permissions by action for this resource
                      const permsByAction = perms.reduce((acc, perm) => {
                        if (perm.scope === 'engine') {
                          acc[perm.action] = perm.id;
                        }
                        return acc;
                      }, {} as Record<string, string>);

                      return (
                        <TableRow key={resource}>
                          <TableCell className="font-medium">{getResourceLabel(resource)}</TableCell>
                          {actions.map((action) => {
                            const permId = permsByAction[action];
                            return (
                              <TableCell key={action} className="text-center">
                                {permId ? (
                                  <Checkbox
                                    checked={isPermissionSelected(resource, permId)}
                                    onCheckedChange={() => togglePermission(resource, action, permId)}
                                    data-testid={`checkbox-edit-${resource}-${action}`}
                                  />
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignPermissions} disabled={isLoading} data-testid="button-assign-permissions">
                {isLoading ? "Saving..." : "Save Permissions"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
