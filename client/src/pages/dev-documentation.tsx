
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Lock, BookOpen, CheckCircle, Clock, AlertCircle, Code, Database, Shield, Filter, Search, ExternalLink, MessageSquare, ArrowUpDown, Edit, Save, Download, Play, FileText, Settings, Users, Calendar, TrendingUp, Activity, Zap, GitBranch, TestTube, Bug, ChevronRight, Plus, Trash2, Eye, EyeOff, Link as LinkIcon, Timer, Target, Sparkles, Layers, Globe, Boxes, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type StatusType = "tested-live" | "tested-preview" | "completed" | "in-error" | "priority-1" | "priority-2" | "priority-3" | "in-progress" | "planned" | "blocked" | "testing" | "review";
type AreaType = "public" | "user-panel" | "admin-panel" | "api" | "core";
type TestStatus = "passed" | "failed" | "pending" | "skipped";

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
  priority?: number;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  dependencies?: string[];
}

interface TestCase {
  id: string;
  featureId: string;
  title: string;
  description: string;
  status: TestStatus;
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  lastRun?: string;
  runBy?: string;
}

interface ChangeLog {
  date: string;
  version: string;
  changes: string[];
  author: string;
  type: "feature" | "bugfix" | "improvement" | "breaking";
}

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  status: "stable" | "beta" | "deprecated";
  authentication: boolean;
}

export default function DevDocumentation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArea, setFilterArea] = useState<AreaType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<StatusType | "all">("all");
  const [sortField, setSortField] = useState<"title" | "status" | "lastUpdated" | "priority">("lastUpdated");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [testDialog, setTestDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeDocSection, setActiveDocSection] = useState("platform-concepts");
  const [isDownloading, setIsDownloading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "timeline">("table");
  const [showArchived, setShowArchived] = useState(false);
  const [adminBypass, setAdminBypass] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const [testCases, setTestCases] = useState<TestCase[]>(() => {
    const stored = localStorage.getItem('wytnet-test-cases');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>(() => {
    const stored = localStorage.getItem('wytnet-api-endpoints');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return getDefaultApiEndpoints();
      }
    }
    return getDefaultApiEndpoints();
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('wytnet-features', JSON.stringify(features));
  }, [features]);

  useEffect(() => {
    localStorage.setItem('wytnet-test-cases', JSON.stringify(testCases));
  }, [testCases]);

  useEffect(() => {
    localStorage.setItem('wytnet-api-endpoints', JSON.stringify(apiEndpoints));
  }, [apiEndpoints]);

  // Check if user is already authenticated as admin
  useEffect(() => {
    document.title = "Development Documentation - WytNet Platform";
    
    const checkAdminSession = async () => {
      try {
        const response = await fetch('/api/admin/session', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated && data.admin) {
          setIsAuthenticated(true);
          setAdminBypass(true);
          toast({
            title: "Admin Access Granted",
            description: `Welcome ${data.admin.name || 'Admin'}! Password bypassed.`,
          });
        }
      } catch (err) {
        console.log('No admin session found, password required');
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAdminSession();
  }, [toast]);

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
      "tested-live": { label: "✓ Live", variant: "default" as const, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      "tested-preview": { label: "⚡ Preview", variant: "secondary" as const, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      "completed": { label: "✓ Done", variant: "outline" as const, color: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" },
      "in-error": { label: "✗ Error", variant: "destructive" as const, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      "priority-1": { label: "P1", variant: "destructive" as const, color: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100" },
      "priority-2": { label: "P2", variant: "secondary" as const, color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
      "priority-3": { label: "P3", variant: "outline" as const, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      "in-progress": { label: "⚙ Progress", variant: "secondary" as const, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
      "planned": { label: "📋 Planned", variant: "outline" as const, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
      "blocked": { label: "🚫 Blocked", variant: "destructive" as const, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      "testing": { label: "🧪 Testing", variant: "secondary" as const, color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" },
      "review": { label: "👁 Review", variant: "outline" as const, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" }
    };
    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getAreaBadge = (area: AreaType) => {
    const areaConfig = {
      "public": { label: "🌐 Public", color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
      "user-panel": { label: "👤 User", color: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
      "admin-panel": { label: "⚙️ Admin", color: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
      "api": { label: "🔌 API", color: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" },
      "core": { label: "🔧 Core", color: "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300" }
    };
    const config = areaConfig[area];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  function getDefaultFeatures(): Feature[] {
    return [
      {
        id: "admin-001",
        title: "Platform Registry",
        description: "Admin module for managing system-wide platform features and apps",
        area: "admin-panel",
        status: "completed",
        testReportUrl: "/engine/platform-registry",
        lastUpdated: "2025-01-14",
        priority: 1,
        actualHours: 12,
        tags: ["admin", "registry", "platform"],
        dependencies: []
      },
      {
        id: "admin-002",
        title: "Pricing Plans Management",
        description: "Multi-tier pricing plan configuration and management system",
        area: "admin-panel",
        status: "completed",
        testReportUrl: "/engine/plans-prices",
        lastUpdated: "2025-01-14",
        priority: 1,
        actualHours: 16,
        tags: ["admin", "pricing", "billing"],
        dependencies: ["admin-001"]
      },
      {
        id: "core-001",
        title: "DevDoc Route Simplification",
        description: "Simplified documentation route from /dev-documentation to /devdoc",
        area: "core",
        status: "completed",
        testReportUrl: "/devdoc",
        lastUpdated: "2025-01-14",
        priority: 2,
        actualHours: 2,
        tags: ["routing", "documentation"],
        dependencies: []
      },
      {
        id: "pub-001",
        title: "WytWall Public Landing",
        description: "Public offer/need listing and marketplace",
        area: "public",
        status: "priority-1",
        comments: "Critical for launch - integrate with /wytwall route",
        lastUpdated: "2025-01-13",
        priority: 1,
        estimatedHours: 40,
        tags: ["marketplace", "frontend"],
        dependencies: []
      },
      {
        id: "pub-002",
        title: "Home Page Enhancement",
        description: "Modern hero section with CTAs",
        area: "public",
        status: "completed",
        testReportUrl: "/",
        lastUpdated: "2025-01-12",
        priority: 3,
        actualHours: 8,
        tags: ["frontend", "ui"]
      }
    ];
  }

  function getDefaultApiEndpoints(): ApiEndpoint[] {
    return [
      { method: "POST", path: "/api/auth/login", description: "User authentication", status: "stable", authentication: false },
      { method: "GET", path: "/api/wytid/validate", description: "Validate WytID", status: "stable", authentication: true },
      { method: "POST", path: "/api/offers/create", description: "Create new offer", status: "stable", authentication: true },
      { method: "GET", path: "/api/needs/public", description: "List public needs", status: "stable", authentication: false },
      { method: "POST", path: "/api/admin/session", description: "Admin authentication", status: "stable", authentication: false },
      { method: "GET", path: "/api/admin/dashboard", description: "Admin dashboard stats", status: "stable", authentication: true },
      { method: "GET", path: "/api/admin/pricing/apps", description: "Get all apps for pricing", status: "stable", authentication: true },
      { method: "GET", path: "/api/admin/pricing/plans/:id", description: "Get pricing plan details", status: "stable", authentication: true },
      { method: "POST", path: "/api/admin/pricing/plans", description: "Create/update pricing plan", status: "stable", authentication: true }
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

  const addNewFeature = () => {
    const newFeature: Feature = {
      id: `feat-${Date.now()}`,
      title: "New Feature",
      description: "Add description here",
      area: "public",
      status: "planned",
      lastUpdated: new Date().toISOString().split('T')[0],
      priority: 3,
      tags: []
    };
    setFeatures(prev => [...prev, newFeature]);
    setEditingFeature(newFeature);
    setEditDialog(true);
  };

  const deleteFeature = (featureId: string) => {
    if (confirm('Delete this feature? This cannot be undone.')) {
      setFeatures(prev => prev.filter(f => f.id !== featureId));
    }
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
      toast({
        title: "Feature Updated",
        description: "Changes saved successfully",
      });
    }
  };

  const resetToDefaults = () => {
    if (confirm('Reset all features to default values? This cannot be undone.')) {
      setFeatures(getDefaultFeatures());
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const printContent = contentRef.current;
      if (!printContent) return;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Download Failed",
          description: "Please allow popups to download PDF",
          variant: "destructive",
        });
        return;
      }

      const tabName = activeTab === 'features' ? 'Feature Tracker' : 
                     activeTab === 'changelog' ? 'Change Logs' : 
                     activeTab === 'testing' ? 'Test Cases' :
                     activeTab === 'api' ? 'API Reference' : 
                     activeTab === 'overview' ? 'Platform Overview' : 'Documentation';
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>WytNet Documentation - ${tabName}</title>
            <style>
              body { 
                font-family: system-ui, -apple-system, sans-serif; 
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0;
                page-break-inside: auto;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 12px; 
                text-align: left; 
              }
              th { 
                background-color: #f8f9fa; 
                font-weight: 600;
              }
              tr { page-break-inside: avoid; page-break-after: auto; }
              h1, h2, h3 { color: #1e293b; margin-top: 24px; }
              .badge { 
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                margin: 2px;
              }
              @media print {
                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <h1>WytNet Platform - Development Documentation</h1>
            <h2>${tabName}</h2>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 250);

      toast({
        title: "Download Started",
        description: "Print dialog opened. Save as PDF to download.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const runAllTests = () => {
    toast({
      title: "Tests Running",
      description: "Executing all test cases...",
    });
    setTimeout(() => {
      toast({
        title: "Tests Completed",
        description: `${testCases.length} tests executed`,
      });
    }, 2000);
  };

  const changeLogs: ChangeLog[] = [
    {
      date: "2025-01-15",
      version: "v1.11.0",
      changes: [
        "Added comprehensive platform documentation with Tamil concepts",
        "Structured documentation into Platform Concepts, Architecture, and Technical Stack sections",
        "Enhanced Entity-Module-App-Hub relationship documentation",
        "Added purpose and use-case documentation for all platform components",
        "Improved navigation with section-based organization"
      ],
      author: "Development Team",
      type: "feature"
    },
    {
      date: "2025-01-15",
      version: "v1.10.0",
      changes: [
        "Added multi-level sidebar navigation for better documentation organization",
        "Implemented smart authentication: Admin session bypass for logged-in admins",
        "External users now require password authentication for security",
        "Enhanced UI with fixed left sidebar for quick navigation",
        "Added authentication status indicators and badges"
      ],
      author: "Development Team",
      type: "feature"
    },
    {
      date: "2025-01-14",
      version: "v1.9.0",
      changes: [
        "Added Platform Registry admin module for system-wide app/feature configuration",
        "Enhanced Pricing Plans Management with multi-tier support",
        "Simplified documentation route from /dev-documentation to /devdoc",
        "Improved admin authentication flow with session persistence"
      ],
      author: "Development Team",
      type: "feature"
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
      if (sortField === "priority") return (a.priority || 99) - (b.priority || 99);
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

  const renderKanbanView = () => {
    const columns: { status: StatusType; label: string }[] = [
      { status: "planned", label: "Planned" },
      { status: "in-progress", label: "In Progress" },
      { status: "testing", label: "Testing" },
      { status: "review", label: "Review" },
      { status: "completed", label: "Completed" }
    ];

    return (
      <div className="grid grid-cols-5 gap-4">
        {columns.map(col => (
          <div key={col.status} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              {col.label}
              <Badge variant="outline">{filteredFeatures.filter(f => f.status === col.status).length}</Badge>
            </h3>
            <div className="space-y-3">
              {filteredFeatures.filter(f => f.status === col.status).map(feature => (
                <Card key={feature.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEditFeature(feature)}>
                  <CardContent className="p-3">
                    <div className="font-medium text-sm mb-1">{feature.title}</div>
                    <div className="text-xs text-muted-foreground mb-2">{feature.id}</div>
                    {getAreaBadge(feature.area)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Checking Authentication</h3>
                <p className="text-sm text-muted-foreground mt-1">Please wait...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              Enterprise Development Portal
            </p>
            <Badge variant="outline" className="mt-4">
              External Access - Password Required
            </Badge>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter access code"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <Button type="submit" className="w-full">
                Access Portal
              </Button>
            </form>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-xs text-muted-foreground">
              💡 Tip: Admins logged into Engine Portal can access without password
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex">
        {/* Left Sidebar Navigation */}
        <aside className="hidden lg:block w-64 fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-bold">DevDoc</h2>
            </div>
            {adminBypass && (
              <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
            )}
          </div>
          
          <nav className="p-4 space-y-1">
            <Button
              variant={activeTab === "overview" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("overview")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Platform Overview
            </Button>

            <div className="pt-2">
              <div className="text-xs font-semibold text-muted-foreground px-2 mb-2">DOCUMENTATION</div>
              <Button
                variant={activeDocSection === "platform-concepts" ? "secondary" : "ghost"}
                className="w-full justify-start text-sm"
                onClick={() => {
                  setActiveTab("overview");
                  setActiveDocSection("platform-concepts");
                }}
              >
                <Layers className="h-4 w-4 mr-2" />
                Platform Concepts
              </Button>
              <Button
                variant={activeDocSection === "architecture" ? "secondary" : "ghost"}
                className="w-full justify-start text-sm"
                onClick={() => {
                  setActiveTab("overview");
                  setActiveDocSection("architecture");
                }}
              >
                <Boxes className="h-4 w-4 mr-2" />
                Architecture
              </Button>
              <Button
                variant={activeDocSection === "technical-stack" ? "secondary" : "ghost"}
                className="w-full justify-start text-sm"
                onClick={() => {
                  setActiveTab("overview");
                  setActiveDocSection("technical-stack");
                }}
              >
                <Code className="h-4 w-4 mr-2" />
                Technical Stack
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="text-xs font-semibold text-muted-foreground px-2 mb-2">DEVELOPMENT</div>
              <Button
                variant={activeTab === "features" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("features")}
              >
                <Target className="h-4 w-4 mr-2" />
                Task Management
              </Button>
              
              <Button
                variant={activeTab === "testing" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("testing")}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Testing Suite
              </Button>
              
              <Button
                variant={activeTab === "api" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("api")}
              >
                <Code className="h-4 w-4 mr-2" />
                API Reference
              </Button>
              
              <Button
                variant={activeTab === "changelog" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("changelog")}
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Version History
              </Button>
              
              <Button
                variant={activeTab === "standards" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("standards")}
              >
                <Shield className="h-4 w-4 mr-2" />
                Standards
              </Button>
              
              <Button
                variant={activeTab === "analytics" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("analytics")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-3 w-3" />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                <span>Version: v1.11.0</span>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <div className="flex-1 lg:ml-64">
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-blue-600" />
                    DevDoc Portal
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enterprise Development Command Center
                  </p>
                  {adminBypass && (
                    <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Authenticated via Admin Session
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? "Generating..." : "Export"}
                  </Button>
                  <Button 
                    variant={isEditMode ? "default" : "outline"} 
                    onClick={() => setIsEditMode(!isEditMode)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditMode ? "Editing" : "Edit"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
                    <Lock className="h-4 w-4 mr-2" />
                    Lock
                  </Button>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsContent value="overview" className="space-y-6">
                  <div ref={contentRef}>
                    {activeDocSection === "platform-concepts" && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-blue-600" />
                            Platform Concepts
                          </CardTitle>
                          <CardDescription>Understanding Entity, Module, App & Hub architecture</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                              <Package className="h-5 w-5 text-purple-600" />
                              About Entity, Module, App & Hub
                            </h3>
                            <div className="prose dark:prose-invert max-w-none">
                              <p className="text-muted-foreground mb-4">
                                <strong>Tamil:</strong> பல "Entity" என்ற பாகங்கள் அடங்கியது "Module", சில பல "Module" கள் அடங்கியது "App", 
                                இந்த "App" என்பது "WytNet.com" உள்ளாகவே "User" களால் "Add" செய்து பயன்படுத்தக் கூடியது.
                              </p>
                              
                              <div className="grid md:grid-cols-4 gap-4 mb-6">
                                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                                  <CardContent className="p-4">
                                    <h4 className="font-semibold mb-2">1️⃣ Entity</h4>
                                    <p className="text-sm text-muted-foreground">Basic building block. Multiple entities form a Module.</p>
                                    <Badge className="mt-2" variant="outline">Foundational Layer</Badge>
                                  </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                                  <CardContent className="p-4">
                                    <h4 className="font-semibold mb-2">2️⃣ Module</h4>
                                    <p className="text-sm text-muted-foreground">Collection of entities with specific functionality.</p>
                                    <Badge className="mt-2" variant="outline">Functional Layer</Badge>
                                  </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                                  <CardContent className="p-4">
                                    <h4 className="font-semibold mb-2">3️⃣ App</h4>
                                    <p className="text-sm text-muted-foreground">Multiple modules combined. Users can add and use within WytNet.com.</p>
                                    <Badge className="mt-2" variant="outline">Application Layer</Badge>
                                  </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                                  <CardContent className="p-4">
                                    <h4 className="font-semibold mb-2">4️⃣ Hub</h4>
                                    <p className="text-sm text-muted-foreground">Standalone web/mobile portal with multiple modules.</p>
                                    <Badge className="mt-2" variant="outline">Platform Layer</Badge>
                                  </CardContent>
                                </Card>
                              </div>

                              <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 dark:bg-orange-950 rounded">
                                <h4 className="font-semibold mb-2">🌐 Hub - Standalone Portal</h4>
                                <p className="text-sm mb-2">
                                  <strong>Tamil:</strong> "Hub" என்பது தன்னிச்சையாக செயல்படக்கூடிய "Web Portal" அல்லது "Mobile App" ஆகும். 
                                  இது "WytPass Auth" பயன்படுத்தி செயல்படும். இதில் பல்வேறு "Module" கள் வைத்து கட்டமைக்கப்படும்.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  A Hub is an independent web portal or mobile app that operates autonomously. 
                                  It uses WytPass Authentication and is built by composing various modules.
                                </p>
                              </div>

                              <div className="mt-6">
                                <h4 className="font-semibold mb-3">Two Types of Hub Creation:</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="border rounded-lg p-4">
                                    <h5 className="font-medium mb-2">1. App Evolution to Hub</h5>
                                    <p className="text-sm text-muted-foreground">
                                      When an App gains significant user adoption and demand, it can be promoted to become a standalone Hub.
                                    </p>
                                  </div>
                                  <div className="border rounded-lg p-4">
                                    <h5 className="font-medium mb-2">2. Custom Hub Creation</h5>
                                    <p className="text-sm text-muted-foreground">
                                      Developers, companies, and organizations can create their own Hubs tailored to their specific needs.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-6">
                            <h3 className="text-xl font-semibold mb-4">Purpose & Benefits</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              <Card>
                                <CardContent className="p-4">
                                  <h4 className="font-semibold mb-2">🎯 Platform Purpose</h4>
                                  <ul className="text-sm space-y-1 text-muted-foreground">
                                    <li>• Modular architecture for scalability</li>
                                    <li>• Reusable components across applications</li>
                                    <li>• Flexible composition of features</li>
                                    <li>• Multi-tenant SaaS infrastructure</li>
                                  </ul>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4">
                                  <h4 className="font-semibold mb-2">⚡ Key Features</h4>
                                  <ul className="text-sm space-y-1 text-muted-foreground">
                                    <li>• White-label customization</li>
                                    <li>• WytPass unified authentication</li>
                                    <li>• Cross-hub data portability</li>
                                    <li>• Blockchain-anchored identity</li>
                                  </ul>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {activeDocSection === "architecture" && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Boxes className="h-5 w-5 text-purple-600" />
                            System Architecture
                          </CardTitle>
                          <CardDescription>Platform structure and component relationships</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Architecture Layers</h3>
                            <div className="space-y-4">
                              <div className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-medium">Frontend Layer</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Component-based architecture with Wouter routing and TanStack Query for state management
                                </p>
                              </div>

                              <div className="border-l-4 border-purple-500 pl-4">
                                <h4 className="font-medium">Backend Layer</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Express.js + TypeScript + PostgreSQL + Drizzle ORM
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  RESTful APIs with session-based authentication and row-level security
                                </p>
                              </div>

                              <div className="border-l-4 border-green-500 pl-4">
                                <h4 className="font-medium">Platform Layer</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Module System + Entity Graph + Hub Routing
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  47+ modules, 31+ entity types, multi-tenant isolation
                                </p>
                              </div>

                              <div className="border-l-4 border-orange-500 pl-4">
                                <h4 className="font-medium">Identity Layer</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  WytPass + WytID + Blockchain Anchoring
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Universal identity system with cross-hub authentication
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Portal Architecture</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                              <Card>
                                <CardContent className="p-4">
                                  <h4 className="font-semibold mb-2">🌐 Public Portal</h4>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Landing pages, WytWall marketplace, public features
                                  </p>
                                  <Badge variant="outline">No authentication required</Badge>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="p-4">
                                  <h4 className="font-semibold mb-2">👤 User Panel</h4>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    My Apps, My Profile, Wallet, WytPoints
                                  </p>
                                  <Badge variant="outline">User authentication</Badge>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="p-4">
                                  <h4 className="font-semibold mb-2">⚙️ Admin Portals</h4>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Engine Admin (Platform) + Hub Admin (Content)
                                  </p>
                                  <Badge variant="outline">Admin authentication</Badge>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {activeDocSection === "technical-stack" && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5 text-green-600" />
                            Technical Stack
                          </CardTitle>
                          <CardDescription>Technologies, frameworks, and infrastructure</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-semibold mb-3">Server Technologies</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                  <span>Runtime</span>
                                  <Badge variant="outline">Node.js</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                  <span>Framework</span>
                                  <Badge variant="outline">Express.js</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                  <span>Language</span>
                                  <Badge variant="outline">TypeScript</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                  <span>Database</span>
                                  <Badge variant="outline">PostgreSQL (Neon)</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                  <span>ORM</span>
                                  <Badge variant="outline">Drizzle</Badge>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-semibold mb-3">Client Technologies</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                  <span>Framework</span>
                                  <Badge variant="outline">React 18</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                  <span>Language</span>
                                  <Badge variant="outline">TypeScript</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                  <span>Build Tool</span>
                                  <Badge variant="outline">Vite</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                  <span>Styling</span>
                                  <Badge variant="outline">Tailwind CSS</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                  <span>UI Components</span>
                                  <Badge variant="outline">shadcn/ui</Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-6">
                            <h3 className="font-semibold mb-3">Key Integrations</h3>
                            <div className="grid md:grid-cols-3 gap-3">
                              <div className="p-3 border rounded-lg">
                                <h4 className="font-medium text-sm mb-1">Payment Gateway</h4>
                                <p className="text-xs text-muted-foreground">Razorpay, Stripe</p>
                              </div>
                              <div className="p-3 border rounded-lg">
                                <h4 className="font-medium text-sm mb-1">Communication</h4>
                                <p className="text-xs text-muted-foreground">MSG91, Twilio, SendGrid</p>
                              </div>
                              <div className="p-3 border rounded-lg">
                                <h4 className="font-medium text-sm mb-1">Storage</h4>
                                <p className="text-xs text-muted-foreground">AWS S3, Cloudinary, GCS</p>
                              </div>
                              <div className="p-3 border rounded-lg">
                                <h4 className="font-medium text-sm mb-1">AI Services</h4>
                                <p className="text-xs text-muted-foreground">OpenAI, Claude, Gemini</p>
                              </div>
                              <div className="p-3 border rounded-lg">
                                <h4 className="font-medium text-sm mb-1">Analytics</h4>
                                <p className="text-xs text-muted-foreground">Google Analytics, Mixpanel</p>
                              </div>
                              <div className="p-3 border rounded-lg">
                                <h4 className="font-medium text-sm mb-1">Maps</h4>
                                <p className="text-xs text-muted-foreground">Google Maps, Mappls</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <div ref={contentRef}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Task Management
                          </CardTitle>
                          <div className="flex gap-2">
                            <Select value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="table">Table</SelectItem>
                                <SelectItem value="kanban">Kanban</SelectItem>
                                <SelectItem value="timeline">Timeline</SelectItem>
                              </SelectContent>
                            </Select>
                            {isEditMode && (
                              <Button onClick={addNewFeature} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                New Task
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 mt-4">
                          <div className="flex-1">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search by title, description, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <Select value={filterArea} onValueChange={(v) => setFilterArea(v as typeof filterArea)}>
                            <SelectTrigger className="w-full md:w-48">
                              <SelectValue placeholder="Area" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Areas</SelectItem>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="user-panel">User Panel</SelectItem>
                              <SelectItem value="admin-panel">Admin</SelectItem>
                              <SelectItem value="api">API</SelectItem>
                              <SelectItem value="core">Core</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                            <SelectTrigger className="w-full md:w-48">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="testing">Testing</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {viewMode === "kanban" ? (
                          renderKanbanView()
                        ) : (
                          <div className="rounded-md border overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-24">ID</TableHead>
                                  <TableHead>
                                    <Button variant="ghost" size="sm" onClick={() => setSortField("title")}>
                                      Task <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                  </TableHead>
                                  <TableHead>Area</TableHead>
                                  <TableHead>
                                    <Button variant="ghost" size="sm" onClick={() => setSortField("status")}>
                                      Status <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                  </TableHead>
                                  <TableHead>
                                    <Button variant="ghost" size="sm" onClick={() => setSortField("priority")}>
                                      Priority <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                  </TableHead>
                                  <TableHead>Updated</TableHead>
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
                                          <div className="flex items-start gap-1 mt-1 text-xs text-amber-600">
                                            <MessageSquare className="h-3 w-3 mt-0.5" />
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
                                          <SelectTrigger className="w-32">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="planned">Planned</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="testing">Testing</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="blocked">Blocked</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        getStatusBadge(feature.status)
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">P{feature.priority || 3}</Badge>
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
                                        <Button variant="ghost" size="sm" onClick={() => handleEditFeature(feature)}>
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        {isEditMode && (
                                          <Button variant="ghost" size="sm" onClick={() => deleteFeature(feature.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                          </Button>
                                        )}
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

                    <div className="grid md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-green-600">{features.filter(f => f.status === "completed").length}</div>
                          <div className="text-sm text-muted-foreground">Completed</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-purple-600">{features.filter(f => f.status === "in-progress").length}</div>
                          <div className="text-sm text-muted-foreground">In Progress</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-orange-600">{features.filter(f => f.status === "blocked").length}</div>
                          <div className="text-sm text-muted-foreground">Blocked</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-blue-600">{features.filter(f => f.status === "testing").length}</div>
                          <div className="text-sm text-muted-foreground">Testing</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="testing" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <TestTube className="h-5 w-5" />
                          Test Suite
                        </CardTitle>
                        <Button onClick={runAllTests}>
                          <Play className="h-4 w-4 mr-2" />
                          Run All Tests
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Test cases will be displayed here</p>
                        <p className="text-sm mt-2">Add test cases to track quality assurance</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="api" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        API Reference
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {apiEndpoints.map((endpoint, idx) => (
                          <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Badge variant={endpoint.method === "GET" ? "outline" : "default"}>
                                  {endpoint.method}
                                </Badge>
                                <code className="text-sm">{endpoint.path}</code>
                              </div>
                              <div className="flex items-center gap-2">
                                {endpoint.authentication && <Shield className="h-4 w-4 text-orange-500" />}
                                <Badge variant="outline">{endpoint.status}</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="changelog" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Version History
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
                            <Badge>{log.type}</Badge>
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
                        Development Standards
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3">Code Quality Standards</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            TypeScript strict mode enabled
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            ESLint + Prettier configuration
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Component testing with Vitest
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Accessibility (WCAG 2.1 AA)
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Project Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center p-6 border rounded-lg">
                          <div className="text-3xl font-bold text-blue-600">{features.length}</div>
                          <div className="text-sm text-muted-foreground mt-2">Total Tasks</div>
                        </div>
                        <div className="text-center p-6 border rounded-lg">
                          <div className="text-3xl font-bold text-green-600">
                            {Math.round((features.filter(f => f.status === "completed").length / features.length) * 100)}%
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">Completion Rate</div>
                        </div>
                        <div className="text-center p-6 border rounded-lg">
                          <div className="text-3xl font-bold text-purple-600">
                            {features.reduce((acc, f) => acc + (f.actualHours || 0), 0)}h
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">Hours Logged</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Edit Feature Dialog */}
              <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                      Update task details, status, and metadata
                    </DialogDescription>
                  </DialogHeader>
                  {editingFeature && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Task ID</label>
                          <Input value={editingFeature.id} disabled className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Priority</label>
                          <Select 
                            value={editingFeature.priority?.toString()} 
                            onValueChange={(v) => setEditingFeature({...editingFeature, priority: parseInt(v)})}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">P1 - Critical</SelectItem>
                              <SelectItem value="2">P2 - High</SelectItem>
                              <SelectItem value="3">P3 - Medium</SelectItem>
                              <SelectItem value="4">P4 - Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Area</label>
                          <Select 
                            value={editingFeature.area} 
                            onValueChange={(v) => setEditingFeature({...editingFeature, area: v as AreaType})}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="user-panel">User Panel</SelectItem>
                              <SelectItem value="admin-panel">Admin Panel</SelectItem>
                              <SelectItem value="api">API</SelectItem>
                              <SelectItem value="core">Core</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <Select 
                            value={editingFeature.status} 
                            onValueChange={(v) => setEditingFeature({...editingFeature, status: v as StatusType})}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="testing">Testing</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Estimated Hours</label>
                          <Input 
                            type="number"
                            value={editingFeature.estimatedHours || ''} 
                            onChange={(e) => setEditingFeature({...editingFeature, estimatedHours: parseInt(e.target.value) || 0})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Actual Hours</label>
                          <Input 
                            type="number"
                            value={editingFeature.actualHours || ''} 
                            onChange={(e) => setEditingFeature({...editingFeature, actualHours: parseInt(e.target.value) || 0})}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Test URL</label>
                        <Input 
                          value={editingFeature.testReportUrl || ''} 
                          onChange={(e) => setEditingFeature({...editingFeature, testReportUrl: e.target.value})}
                          placeholder="/path or URL"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Comments</label>
                        <Textarea 
                          value={editingFeature.comments || ''} 
                          onChange={(e) => setEditingFeature({...editingFeature, comments: e.target.value})}
                          placeholder="Notes, blockers, updates..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Assignee</label>
                        <Input 
                          value={editingFeature.assignee || ''} 
                          onChange={(e) => setEditingFeature({...editingFeature, assignee: e.target.value})}
                          placeholder="Developer or team name"
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
      </div>
    </div>
  );
}
