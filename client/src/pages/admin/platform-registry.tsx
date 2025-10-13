
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Edit, Eye, Settings, Globe, User, Shield, Check, X, Clock } from "lucide-react";

type VisibilityType = "public" | "user" | "admin" | "all";
type StatusType = "active" | "inactive" | "development" | "maintenance";
type ManageByType = "admin" | "system" | "user" | "auto";

interface PlatformItem {
  id: string;
  name: string;
  type: "page" | "feature" | "app" | "api";
  path: string;
  visibility: VisibilityType[];
  managedBy: ManageByType;
  status: StatusType;
  description: string;
  relatedTo?: string[];
  lastUpdated: string;
}

export default function AdminPlatformRegistry() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editDialog, setEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PlatformItem | null>(null);

  // Sample registry data - will be replaced with API
  const [registryItems, setRegistryItems] = useState<PlatformItem[]>([
    {
      id: "page-home",
      name: "Home Page",
      type: "page",
      path: "/",
      visibility: ["public"],
      managedBy: "admin",
      status: "active",
      description: "Main landing page with drag-drop CMS",
      relatedTo: ["cms-builder"],
      lastUpdated: "2025-01-13"
    },
    {
      id: "page-about",
      name: "About Page",
      type: "page",
      path: "/about",
      visibility: ["public"],
      managedBy: "admin",
      status: "active",
      description: "Company information page",
      relatedTo: ["cms-builder"],
      lastUpdated: "2025-01-12"
    },
    {
      id: "page-wytwall",
      name: "WytWall (Marketplace)",
      type: "page",
      path: "/wytwall",
      visibility: ["public", "user"],
      managedBy: "system",
      status: "active",
      description: "Offer/Need marketplace listing",
      relatedTo: ["needs-service", "offers-service"],
      lastUpdated: "2025-01-13"
    },
    {
      id: "feature-login",
      name: "Login/Registration",
      type: "feature",
      path: "/login",
      visibility: ["public"],
      managedBy: "system",
      status: "active",
      description: "WytPass authentication system",
      relatedTo: ["wytpass-auth", "admin-approval"],
      lastUpdated: "2025-01-12"
    },
    {
      id: "panel-my-profile",
      name: "My Profile",
      type: "page",
      path: "/mypanel/profile",
      visibility: ["user"],
      managedBy: "user",
      status: "active",
      description: "User profile management",
      relatedTo: ["profile-service"],
      lastUpdated: "2025-01-13"
    },
    {
      id: "admin-users",
      name: "User Management",
      type: "page",
      path: "/admin/users",
      visibility: ["admin"],
      managedBy: "admin",
      status: "active",
      description: "Admin user CRUD operations",
      relatedTo: ["user-service"],
      lastUpdated: "2025-01-12"
    },
    {
      id: "cms-builder",
      name: "CMS Builder",
      type: "feature",
      path: "/admin/cms",
      visibility: ["admin"],
      managedBy: "admin",
      status: "active",
      description: "Drag-drop page builder",
      relatedTo: ["page-home", "page-about"],
      lastUpdated: "2025-01-10"
    },
    {
      id: "app-qr-generator",
      name: "QR Generator",
      type: "app",
      path: "/qr-generator",
      visibility: ["public", "user"],
      managedBy: "system",
      status: "active",
      description: "QR code generation tool",
      relatedTo: ["wytapps"],
      lastUpdated: "2025-01-11"
    },
    {
      id: "api-wytid",
      name: "WytID Validation API",
      type: "api",
      path: "/api/wytid/validate",
      visibility: ["all"],
      managedBy: "system",
      status: "active",
      description: "Universal identity validation",
      relatedTo: ["wytpass-auth"],
      lastUpdated: "2025-01-12"
    }
  ]);

  const getVisibilityBadge = (visibility: VisibilityType) => {
    const config = {
      public: { icon: Globe, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Public" },
      user: { icon: User, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", label: "User" },
      admin: { icon: Shield, color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", label: "Admin" },
      all: { icon: Globe, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "All" }
    };
    const { icon: Icon, color, label } = config[visibility];
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getStatusBadge = (status: StatusType) => {
    const config = {
      active: { icon: Check, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      inactive: { icon: X, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
      development: { icon: Clock, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      maintenance: { icon: Settings, color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" }
    };
    const { icon: Icon, color } = config[status];
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getManagedByBadge = (managedBy: ManageByType) => {
    const colors = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      system: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      user: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      auto: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    };
    return <Badge className={colors[managedBy]}>Managed by: {managedBy}</Badge>;
  };

  const filteredItems = registryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleEdit = (item: PlatformItem) => {
    setSelectedItem({ ...item });
    setEditDialog(true);
  };

  const handleSave = () => {
    if (selectedItem) {
      setRegistryItems(prev => 
        prev.map(item => item.id === selectedItem.id ? selectedItem : item)
      );
      setEditDialog(false);
      setSelectedItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Registry</h1>
        <p className="text-muted-foreground">Centralized management of all pages, features, apps and APIs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{registryItems.filter(i => i.type === "page").length}</div>
            <div className="text-sm text-muted-foreground">Pages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{registryItems.filter(i => i.type === "feature").length}</div>
            <div className="text-sm text-muted-foreground">Features</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{registryItems.filter(i => i.type === "app").length}</div>
            <div className="text-sm text-muted-foreground">Apps</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{registryItems.filter(i => i.status === "active").length}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Registry Items</CardTitle>
          <CardDescription>View and manage all platform components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, path, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="page">Pages</SelectItem>
                <SelectItem value="feature">Features</SelectItem>
                <SelectItem value="app">Apps</SelectItem>
                <SelectItem value="api">APIs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Registry Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name & Path</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Management</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.path}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.visibility.map(v => (
                          <div key={v}>{getVisibilityBadge(v)}</div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getManagedByBadge(item.managedBy)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.lastUpdated}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={item.path} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredItems.length} of {registryItems.length} items
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Registry Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={selectedItem.name}
                  onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={selectedItem.description}
                  onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={selectedItem.status}
                  onValueChange={(v) => setSelectedItem({ ...selectedItem, status: v as StatusType })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Managed By</label>
                <Select
                  value={selectedItem.managedBy}
                  onValueChange={(v) => setSelectedItem({ ...selectedItem, managedBy: v as ManageByType })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
