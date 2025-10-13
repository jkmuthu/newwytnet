
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Lock, BookOpen, CheckCircle, Clock, AlertCircle, Code, Database, Shield, Filter, Search, ExternalLink, MessageSquare, ArrowUpDown, Edit, Save } from "lucide-react";

type StatusType = "tested-live" | "tested-preview" | "completed" | "in-error" | "priority-1" | "priority-2" | "priority-3" | "in-progress" | "planned";
type AreaType = "public" | "user-panel" | "admin-panel" | "api" | "core";

interface Feature {
  id: string;
  title: string;
  description: string;
  area: AreaType;
  status: StatusType;
  testReportUrl?: string;
  comments?: string;
  lastUpdated: string;
  assignee?: string;
}

export default function DevDocumentation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArea, setFilterArea] = useState<AreaType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<StatusType | "all">("all");
  const [sortField, setSortField] = useState<"title" | "status" | "lastUpdated">("lastUpdated");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [editDialog, setEditDialog] = useState(false);

  // Load features from localStorage or use defaults
  const [features, setFeatures] = useState<Feature[]>(() => {
    const stored = localStorage.getItem('wytnet-features');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return getDefaultFeatures();
      }
    }
    return getDefaultFeatures();
  });

  // Save features to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('wytnet-features', JSON.stringify(features));
  }, [features]);

  useEffect(() => {
    document.title = "Development Documentation - WytNet Platform";
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = "wytnet@dev2025";
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const getStatusBadge = (status: StatusType) => {
    const statusConfig = {
      "tested-live": { label: "✓ Tested Live", variant: "default" as const, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      "tested-preview": { label: "⚡ Tested Preview", variant: "secondary" as const, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      "completed": { label: "✓ Completed", variant: "outline" as const, color: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" },
      "in-error": { label: "✗ Error", variant: "destructive" as const, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      "priority-1": { label: "P1 - Critical", variant: "destructive" as const, color: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100" },
      "priority-2": { label: "P2 - High", variant: "secondary" as const, color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
      "priority-3": { label: "P3 - Medium", variant: "outline" as const, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      "in-progress": { label: "⚙ In Progress", variant: "secondary" as const, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
      "planned": { label: "📋 Planned", variant: "outline" as const, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" }
    };
    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getAreaBadge = (area: AreaType) => {
    const areaConfig = {
      "public": { label: "🌐 Public", color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
      "user-panel": { label: "👤 User Panel", color: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
      "admin-panel": { label: "⚙️ Admin Panel", color: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
      "api": { label: "🔌 API", color: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" },
      "core": { label: "🔧 Core", color: "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300" }
    };
    const config = areaConfig[area];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  function getDefaultFeatures(): Feature[] {
    return [
      // Public Pages
    {
      id: "pub-001",
      title: "WytWall Public Landing",
      description: "Public offer/need listing and marketplace",
      area: "public",
      status: "priority-1",
      comments: "Critical for launch - integrate with /wytwall route",
      lastUpdated: "2025-01-13"
    },
    {
      id: "pub-002",
      title: "Home Page Enhancement",
      description: "Modern hero section with CTAs",
      area: "public",
      status: "completed",
      testReportUrl: "/",
      lastUpdated: "2025-01-12"
    },
    {
      id: "pub-003",
      title: "Pricing Page",
      description: "Subscription plans and pricing display",
      area: "public",
      status: "tested-live",
      testReportUrl: "/pricing",
      lastUpdated: "2025-01-10"
    },
    {
      id: "pub-004",
      title: "Features Showcase",
      description: "Platform features and capabilities",
      area: "public",
      status: "tested-live",
      testReportUrl: "/features",
      lastUpdated: "2025-01-10"
    },

    // User Panel
    {
      id: "user-001",
      title: "My Profile Management",
      description: "User profile editing and photo upload",
      area: "user-panel",
      status: "in-error",
      comments: "Photo upload failing - storage path issue",
      testReportUrl: "/mypanel/profile",
      lastUpdated: "2025-01-13"
    },
    {
      id: "user-002",
      title: "My Offers Management",
      description: "Create, edit, delete user offers",
      area: "user-panel",
      status: "tested-preview",
      testReportUrl: "/mypanel/offers",
      lastUpdated: "2025-01-12"
    },
    {
      id: "user-003",
      title: "My Needs Management",
      description: "Create, edit, delete user needs",
      area: "user-panel",
      status: "tested-preview",
      testReportUrl: "/mypanel/needs",
      lastUpdated: "2025-01-12"
    },
    {
      id: "user-004",
      title: "WytPoints System",
      description: "Points earning and redemption",
      area: "user-panel",
      status: "priority-2",
      comments: "Backend logic completed, UI integration pending",
      lastUpdated: "2025-01-11"
    },
    {
      id: "user-005",
      title: "Wallet Integration",
      description: "Virtual wallet for transactions",
      area: "user-panel",
      status: "priority-2",
      lastUpdated: "2025-01-11"
    },

    // Admin Panel
    {
      id: "admin-001",
      title: "User Management",
      description: "Admin user CRUD operations",
      area: "admin-panel",
      status: "tested-live",
      testReportUrl: "/admin/users",
      lastUpdated: "2025-01-12"
    },
    {
      id: "admin-002",
      title: "Tenant Management",
      description: "Multi-tenant administration",
      area: "admin-panel",
      status: "tested-live",
      testReportUrl: "/admin/tenants",
      lastUpdated: "2025-01-12"
    },
    {
      id: "admin-003",
      title: "Platform Analytics",
      description: "Usage statistics and reporting",
      area: "admin-panel",
      status: "in-progress",
      testReportUrl: "/admin/analytics",
      lastUpdated: "2025-01-13"
    },
    {
      id: "admin-004",
      title: "Billing & Subscriptions",
      description: "Payment and subscription management",
      area: "admin-panel",
      status: "priority-1",
      comments: "Razorpay integration 80% complete",
      lastUpdated: "2025-01-13"
    },
    {
      id: "admin-005",
      title: "System Monitoring",
      description: "Real-time system health dashboard",
      area: "admin-panel",
      status: "priority-3",
      lastUpdated: "2025-01-10"
    },

    // API & Core
    {
      id: "api-001",
      title: "WytID Validation Service",
      description: "Universal identity validation API",
      area: "api",
      status: "tested-live",
      testReportUrl: "/api/wytid/validate",
      lastUpdated: "2025-01-12"
    },
    {
      id: "api-002",
      title: "Search API Enhancement",
      description: "Meilisearch integration optimization",
      area: "api",
      status: "priority-1",
      comments: "Mock service working, need production Meilisearch",
      lastUpdated: "2025-01-13"
    },
    {
      id: "core-001",
      title: "WytPass Authentication",
      description: "Multi-method auth (Email/Google/WhatsApp)",
      area: "core",
      status: "tested-live",
      lastUpdated: "2025-01-12"
    },
    {
      id: "core-002",
      title: "Multi-tenant RLS",
      description: "Row Level Security implementation",
      area: "core",
      status: "tested-live",
      lastUpdated: "2025-01-11"
    }
    ];
  }

  const updateFeatureStatus = (featureId: string, newStatus: StatusType) => {
    setFeatures(prev => prev.map(f => 
      f.id === featureId 
        ? { ...f, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] }
        : f
    ));
  };

  const updateFeature = (featureId: string, updates: Partial<Feature>) => {
    setFeatures(prev => prev.map(f => 
      f.id === featureId 
        ? { ...f, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
        : f
    ));
  };

  const handleEditFeature = (feature: Feature) => {
    setEditingFeature({ ...feature });
    setEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingFeature) {
      updateFeature(editingFeature.id, editingFeature);
      setEditDialog(false);
      setEditingFeature(null);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Reset all features to default values? This cannot be undone.')) {
      setFeatures(getDefaultFeatures());
    }
  };

  const changeLogs = [
    {
      date: "2025-01-13",
      version: "v1.6.0",
      changes: [
        "Enhanced documentation with advanced tracking system",
        "Added spreadsheet-like feature management interface",
        "Implemented status filtering and area-based organization",
        "Added test report URLs and comments tracking"
      ],
      author: "Development Team"
    },
    {
      date: "2025-01-13",
      version: "v1.5.0",
      changes: [
        "Added password-protected development documentation",
        "Implemented comprehensive change log tracking",
        "Created structured documentation sections",
        "Enhanced mobile layouts for Admin and Panel portals"
      ],
      author: "Development Team"
    }
  ];

  const filteredFeatures = features
    .filter(f => 
      (filterArea === "all" || f.area === filterArea) &&
      (filterStatus === "all" || f.status === filterStatus) &&
      (searchTerm === "" || 
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortField === "title") return a.title.localeCompare(b.title);
      if (sortField === "status") return a.status.localeCompare(b.status);
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">Protected Documentation</CardTitle>
            <p className="text-muted-foreground mt-2">
              Enter password to access development documentation
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <Button type="submit" className="w-full">
                Access Documentation
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Development Documentation
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                WytNet Platform - Advanced Feature Tracking & Status Management
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={isEditMode ? "default" : "outline"} 
                onClick={() => setIsEditMode(!isEditMode)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditMode ? "Editing" : "Edit Mode"}
              </Button>
              <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
                <Lock className="h-4 w-4 mr-2" />
                Lock
              </Button>
            </div>
          </div>

          <Tabs defaultValue="features" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="features">Feature Tracker</TabsTrigger>
              <TabsTrigger value="changelog">Change Logs</TabsTrigger>
              <TabsTrigger value="standards">Standards</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Feature & Task Management
                  </CardTitle>
                  <div className="flex flex-col md:flex-row gap-4 mt-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search features by title, description, or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={filterArea} onValueChange={(v) => setFilterArea(v as typeof filterArea)}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by Area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Areas</SelectItem>
                        <SelectItem value="public">Public Pages</SelectItem>
                        <SelectItem value="user-panel">User Panel</SelectItem>
                        <SelectItem value="admin-panel">Admin Panel</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="core">Core</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="tested-live">Tested Live</SelectItem>
                        <SelectItem value="tested-preview">Tested Preview</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in-error">In Error</SelectItem>
                        <SelectItem value="priority-1">Priority 1</SelectItem>
                        <SelectItem value="priority-2">Priority 2</SelectItem>
                        <SelectItem value="priority-3">Priority 3</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-24">ID</TableHead>
                          <TableHead className="w-64">
                            <Button variant="ghost" size="sm" onClick={() => setSortField("title")}>
                              Feature <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>Area</TableHead>
                          <TableHead>
                            <Button variant="ghost" size="sm" onClick={() => setSortField("status")}>
                              Status <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button variant="ghost" size="sm" onClick={() => setSortField("lastUpdated")}>
                              Last Updated <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFeatures.map((feature) => (
                          <TableRow key={feature.id}>
                            <TableCell className="font-mono text-xs">{feature.id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{feature.title}</div>
                                <div className="text-sm text-muted-foreground">{feature.description}</div>
                                {feature.comments && (
                                  <div className="flex items-start gap-1 mt-1 text-xs text-amber-600 dark:text-amber-400">
                                    <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>{feature.comments}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getAreaBadge(feature.area)}</TableCell>
                            <TableCell>
                              {isEditMode ? (
                                <Select 
                                  value={feature.status} 
                                  onValueChange={(value) => updateFeatureStatus(feature.id, value as StatusType)}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="tested-live">✓ Tested Live</SelectItem>
                                    <SelectItem value="tested-preview">⚡ Tested Preview</SelectItem>
                                    <SelectItem value="completed">✓ Completed</SelectItem>
                                    <SelectItem value="in-error">✗ Error</SelectItem>
                                    <SelectItem value="priority-1">P1 - Critical</SelectItem>
                                    <SelectItem value="priority-2">P2 - High</SelectItem>
                                    <SelectItem value="priority-3">P3 - Medium</SelectItem>
                                    <SelectItem value="in-progress">⚙ In Progress</SelectItem>
                                    <SelectItem value="planned">📋 Planned</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                getStatusBadge(feature.status)
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{feature.lastUpdated}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {feature.testReportUrl && (
                                  <Button variant="ghost" size="sm" asChild>
                                    <a href={feature.testReportUrl} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                                {isEditMode && (
                                  <Button variant="ghost" size="sm" onClick={() => handleEditFeature(feature)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredFeatures.length} of {features.length} features
                    </div>
                    {isEditMode && (
                      <Button variant="outline" size="sm" onClick={resetToDefaults}>
                        Reset to Defaults
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{features.filter(f => f.status === "tested-live").length}</div>
                    <div className="text-sm text-muted-foreground">Tested Live</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">{features.filter(f => f.status.startsWith("priority")).length}</div>
                    <div className="text-sm text-muted-foreground">High Priority</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-orange-600">{features.filter(f => f.status === "in-error").length}</div>
                    <div className="text-sm text-muted-foreground">In Error</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-600">{features.filter(f => f.status === "in-progress").length}</div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="changelog" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Change Logs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {changeLogs.map((log, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Badge variant="outline">{log.version}</Badge>
                          <span className="text-sm text-muted-foreground ml-2">{log.date}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">by {log.author}</span>
                      </div>
                      <ul className="space-y-1">
                        {log.changes.map((change, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="standards" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Development Standards & Policies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Status Guidelines
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        {getStatusBadge("tested-live")} - Feature deployed and tested in production
                      </li>
                      <li className="flex items-center gap-2">
                        {getStatusBadge("tested-preview")} - Feature tested in preview/staging environment
                      </li>
                      <li className="flex items-center gap-2">
                        {getStatusBadge("completed")} - Development complete, pending testing
                      </li>
                      <li className="flex items-center gap-2">
                        {getStatusBadge("in-error")} - Feature has bugs/errors requiring attention
                      </li>
                      <li className="flex items-center gap-2">
                        {getStatusBadge("priority-1")} - Critical priority for immediate implementation
                      </li>
                      <li className="flex items-center gap-2">
                        {getStatusBadge("priority-2")} - High priority for near-term implementation
                      </li>
                      <li className="flex items-center gap-2">
                        {getStatusBadge("priority-3")} - Medium priority for future implementation
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Area Categories
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        {getAreaBadge("public")} - Public-facing pages (/, /features, /pricing, etc.)
                      </li>
                      <li className="flex items-center gap-2">
                        {getAreaBadge("user-panel")} - User dashboard (/mypanel/*, /orgpanel/*)
                      </li>
                      <li className="flex items-center gap-2">
                        {getAreaBadge("admin-panel")} - Admin dashboard (/admin/*)
                      </li>
                      <li className="flex items-center gap-2">
                        {getAreaBadge("api")} - API endpoints and services
                      </li>
                      <li className="flex items-center gap-2">
                        {getAreaBadge("core")} - Core platform functionality
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Edit Feature Dialog */}
          <Dialog open={editDialog} onOpenChange={setEditDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Feature</DialogTitle>
                <DialogDescription>
                  Update feature details, status, test URLs, and comments
                </DialogDescription>
              </DialogHeader>
              {editingFeature && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Feature ID</label>
                    <Input value={editingFeature.id} disabled className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input 
                      value={editingFeature.title} 
                      onChange={(e) => setEditingFeature({...editingFeature, title: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      value={editingFeature.description} 
                      onChange={(e) => setEditingFeature({...editingFeature, description: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select 
                      value={editingFeature.status} 
                      onValueChange={(value) => setEditingFeature({...editingFeature, status: value as StatusType})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tested-live">✓ Tested Live</SelectItem>
                        <SelectItem value="tested-preview">⚡ Tested Preview</SelectItem>
                        <SelectItem value="completed">✓ Completed</SelectItem>
                        <SelectItem value="in-error">✗ Error</SelectItem>
                        <SelectItem value="priority-1">P1 - Critical</SelectItem>
                        <SelectItem value="priority-2">P2 - High</SelectItem>
                        <SelectItem value="priority-3">P3 - Medium</SelectItem>
                        <SelectItem value="in-progress">⚙ In Progress</SelectItem>
                        <SelectItem value="planned">📋 Planned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Test Report URL</label>
                    <Input 
                      value={editingFeature.testReportUrl || ''} 
                      onChange={(e) => setEditingFeature({...editingFeature, testReportUrl: e.target.value})}
                      placeholder="/path/to/feature or external URL"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Comments</label>
                    <Textarea 
                      value={editingFeature.comments || ''} 
                      onChange={(e) => setEditingFeature({...editingFeature, comments: e.target.value})}
                      placeholder="Add notes, issues, or updates..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assignee (Optional)</label>
                    <Input 
                      value={editingFeature.assignee || ''} 
                      onChange={(e) => setEditingFeature({...editingFeature, assignee: e.target.value})}
                      placeholder="Developer name or team"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  );
}
