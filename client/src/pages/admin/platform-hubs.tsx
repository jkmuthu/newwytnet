import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Plus, Settings, Users, Search, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PlatformHub {
  id: string;
  displayId: string;
  name: string;
  description: string | null;
  domain: string;
  status: string;
  isActive: boolean;
  admins?: HubAdmin[];
  settings: any;
  createdAt: string;
}

interface HubAdmin {
  userId: string;
  assignedAt: string;
  user: {
    displayId: string;
    username: string;
    email: string;
  };
}

interface User {
  id: string;
  displayId: string;
  username: string;
  email: string;
}

export default function AdminPlatformHubs() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHub, setSelectedHub] = useState<PlatformHub | null>(null);
  const [assignAdminOpen, setAssignAdminOpen] = useState(false);

  // Fetch platform hubs
  const { data: hubsData, isLoading: hubsLoading } = useQuery<{ success: boolean; hubs: PlatformHub[] }>({
    queryKey: ["/api/admin/platform-hubs"],
  });

  // Fetch all users (for admin assignment)
  const { data: usersData } = useQuery<{ success: boolean; users: User[] }>({
    queryKey: ["/api/admin/users"],
  });

  // Assign hub admin mutation
  const assignAdminMutation = useMutation({
    mutationFn: ({ hubId, userId }: { hubId: string; userId: string }) =>
      apiRequest(`/api/admin/platform-hubs/${hubId}/admins`, "POST", { userId }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-hubs"] });
      
      // Update selectedHub with fresh data from refetched hubs
      const updatedHubsData = queryClient.getQueryData<{ success: boolean; hubs: PlatformHub[] }>([
        "/api/admin/platform-hubs",
      ]);
      const updatedHub = updatedHubsData?.hubs.find((h) => h.id === variables.hubId);
      if (updatedHub) {
        setSelectedHub(updatedHub);
      }
      
      toast({ title: "Hub admin assigned successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to assign hub admin",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove hub admin mutation
  const removeAdminMutation = useMutation({
    mutationFn: ({ hubId, userId }: { hubId: string; userId: string }) =>
      apiRequest(`/api/admin/platform-hubs/${hubId}/admins/${userId}`, "DELETE"),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-hubs"] });
      
      // Update selectedHub with fresh data from refetched hubs
      const updatedHubsData = queryClient.getQueryData<{ success: boolean; hubs: PlatformHub[] }>([
        "/api/admin/platform-hubs",
      ]);
      const updatedHub = updatedHubsData?.hubs.find((h) => h.id === variables.hubId);
      if (updatedHub) {
        setSelectedHub(updatedHub);
      }
      
      toast({ title: "Hub admin removed successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove hub admin",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const hubs = hubsData?.hubs || [];
  const users = usersData?.users || [];

  const filteredHubs = hubs.filter((hub) =>
    hub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hub.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-heading">
            Platform Hubs
          </h1>
          <p className="text-muted-foreground">Manage all hubs and their administrators</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Hubs ({hubs.length})</CardTitle>
              <CardDescription>View and manage hub administrators</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-hubs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hubsLoading ? (
            <div className="text-center py-8">Loading hubs...</div>
          ) : filteredHubs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hubs found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display ID</TableHead>
                  <TableHead>Hub Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admins</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHubs.map((hub) => (
                  <TableRow key={hub.id} data-testid={`row-hub-${hub.id}`}>
                    <TableCell>
                      <Badge variant="outline">{hub.displayId}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{hub.name}</div>
                        {hub.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {hub.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{hub.domain}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={hub.isActive ? "default" : "secondary"}>
                        {hub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{hub.admins?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedHub(hub);
                          setAssignAdminOpen(true);
                        }}
                        data-testid={`button-manage-${hub.id}`}
                      >
                        <ShieldCheck className="h-3 w-3 mr-2" />
                        Manage Admins
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Admin Dialog */}
      {selectedHub && (
        <Dialog open={assignAdminOpen} onOpenChange={setAssignAdminOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Hub Administrators</DialogTitle>
              <DialogDescription>
                {selectedHub.name} ({selectedHub.displayId})
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Current Admins */}
              <div>
                <h3 className="font-semibold mb-3">Current Administrators</h3>
                {selectedHub.admins && selectedHub.admins.length > 0 ? (
                  <div className="space-y-2">
                    {selectedHub.admins.map((admin) => (
                      <div
                        key={admin.userId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`admin-${admin.userId}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{admin.user.username}</div>
                            <div className="text-sm text-muted-foreground">{admin.user.email}</div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Remove ${admin.user.username} as hub admin?`)) {
                              removeAdminMutation.mutate({
                                hubId: selectedHub.id,
                                userId: admin.userId,
                              });
                            }
                          }}
                          data-testid={`button-remove-${admin.userId}`}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No administrators assigned yet
                  </div>
                )}
              </div>

              {/* Assign New Admin */}
              <div>
                <h3 className="font-semibold mb-3">Assign New Administrator</h3>
                <AssignAdminForm
                  users={users}
                  currentAdmins={selectedHub.admins || []}
                  onAssign={(userId) => {
                    assignAdminMutation.mutate({ hubId: selectedHub.id, userId });
                  }}
                  isLoading={assignAdminMutation.isPending}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignAdminOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Assign Admin Form Component
function AssignAdminForm({
  users,
  currentAdmins,
  onAssign,
  isLoading,
}: {
  users: User[];
  currentAdmins: HubAdmin[];
  onAssign: (userId: string) => void;
  isLoading: boolean;
}) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const currentAdminUserIds = new Set(currentAdmins.map((a) => a.userId));
  const availableUsers = users.filter((u) => !currentAdminUserIds.has(u.id));

  const handleAssign = () => {
    if (selectedUserId) {
      onAssign(selectedUserId);
      setSelectedUserId("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Select User</Label>
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger data-testid="select-user">
            <SelectValue placeholder="Choose a user to assign..." />
          </SelectTrigger>
          <SelectContent>
            {availableUsers.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                All users are already assigned as admins
              </div>
            ) : (
              availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.username}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleAssign}
        disabled={!selectedUserId || isLoading}
        className="w-full"
        data-testid="button-assign-admin"
      >
        {isLoading ? "Assigning..." : "Assign as Hub Admin"}
      </Button>
    </div>
  );
}
