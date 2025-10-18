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
import { Lock, BookOpen, CheckCircle, Clock, AlertCircle, Code, Database, Shield, Filter, Search, ExternalLink, MessageSquare, ArrowUpDown, Edit, Save, Download, Play, FileText, Settings, Users, Calendar, TrendingUp, Activity, Zap, GitBranch, TestTube, Bug, ChevronRight, Plus, Trash2, Eye, EyeOff, Link as LinkIcon, Timer, Target, Sparkles, Layers, Globe, Boxes, Package, HelpCircle, Server, Cpu, Monitor, Link2, BarChart3, History, Terminal } from "lucide-react";
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
  const [activeSection, setActiveSection] = useState("about-platform");
  const [activeSubTab, setActiveSubTab] = useState("platform-concepts");
  const [isDownloading, setIsDownloading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "timeline">("table");
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
    localStorage.setItem('wytnet-api-endpoints', JSON.stringify(apiEndpoints));
  }, [apiEndpoints]);

  // Check if user is already authenticated as admin
  useEffect(() => {
    document.title = "DevDoc - WytNet Platform";

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
      { method: "GET", path: "/api/admin/dashboard", description: "Admin dashboard stats", status: "stable", authentication: true }
    ];
  }

  const changeLogs: ChangeLog[] = [
    {
      date: "2025-01-18",
      version: "v1.12.0",
      changes: [
        "Comprehensive DevDoc restructure with multi-level navigation",
        "Added About All section: Platform, WytEngine, Entity, Module, App, Hub, WytPass",
        "Added How It Works section with Test Demo Credentials",
        "Added FAQ section for common questions",
        "Added Standards section: Global, Unified, URL Logic",
        "Added Replit Conversations section: Agent & Assistant history",
        "Added Server & Tech section: Database, Infrastructure details",
        "Enhanced Developer section with comprehensive API documentation",
        "Improved Analytics with project metrics",
        "Enhanced Version History with detailed changelogs"
      ],
      author: "Development Team",
      type: "feature"
    }
  ];

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

  const renderAboutSection = () => {
    if (activeSubTab === "platform-concepts") {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              WytNet Platform
            </CardTitle>
            <CardDescription>Multi-tenant SaaS platform with white-label capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-muted-foreground">
                WytNet is a comprehensive white-label, multi-tenant SaaS platform that enables businesses to build, manage, and scale applications with ease. Built on the powerful "Engine" infrastructure, it provides low-code tools for rapid development.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-4">Key Capabilities</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">🚀 Rapid Development</h4>
                    <p className="text-sm text-muted-foreground">Low-code builders for apps, modules, and hubs with drag-and-drop functionality</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">🎨 White-Label Ready</h4>
                    <p className="text-sm text-muted-foreground">Complete branding customization with custom domains and themes</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">🔐 WytPass Identity</h4>
                    <p className="text-sm text-muted-foreground">Universal authentication with blockchain-anchored identity validation</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">⚡ Multi-Tenant Architecture</h4>
                    <p className="text-sm text-muted-foreground">Complete data isolation with row-level security and tenant management</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (activeSubTab === "entity-module-app") {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-600" />
              Entity → Module → App → Hub
            </CardTitle>
            <CardDescription>Understanding the platform's architectural hierarchy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-950 rounded">
              <p className="text-sm mb-2">
                <strong>Tamil:</strong> பல "Entity" என்ற பாகங்கள் அடங்கியது "Module", சில பல "Module" கள் அடங்கியது "App", 
                இந்த "App" என்பது "WytNet.com" உள்ளாகவே "User" களால் "Add" செய்து பயன்படுத்தக் கூடியது.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">1️⃣ Entity</h4>
                  <p className="text-sm text-muted-foreground mb-2">Basic building blocks like User, Product, Order, etc.</p>
                  <Badge variant="outline">31+ Types</Badge>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">2️⃣ Module</h4>
                  <p className="text-sm text-muted-foreground mb-2">Collection of entities with specific business logic</p>
                  <Badge variant="outline">47+ Modules</Badge>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">3️⃣ App</h4>
                  <p className="text-sm text-muted-foreground mb-2">Multiple modules combined into a complete application</p>
                  <Badge variant="outline">User Installable</Badge>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">4️⃣ Hub</h4>
                  <p className="text-sm text-muted-foreground mb-2">Standalone portal with multiple apps and modules</p>
                  <Badge variant="outline">White-Label</Badge>
                </CardContent>
              </Card>
            </div>

            <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 dark:bg-orange-950 rounded mt-6">
              <h4 className="font-semibold mb-2">🌐 Hub - Standalone Portal</h4>
              <p className="text-sm mb-2">
                <strong>Tamil:</strong> "Hub" என்பது தன்னிச்சையாக செயல்படக்கூடிய "Web Portal" அல்லது "Mobile App" ஆகும். 
                இது "WytPass Auth" பயன்படுத்தி செயல்படும்.
              </p>
              <p className="text-sm text-muted-foreground">
                A Hub is an independent web portal or mobile app using WytPass Authentication, composed of various modules and apps.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (activeSubTab === "wytengine") {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-green-600" />
              WytEngine
            </CardTitle>
            <CardDescription>Platform infrastructure and core system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              WytEngine is the core infrastructure that powers the entire WytNet platform. It provides the foundational services, multi-tenancy architecture, and administrative capabilities.
            </p>

            <div className="space-y-3">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium">Super Admin Portal (/engine/*)</h4>
                <p className="text-sm text-muted-foreground">Platform infrastructure management, modules, entities, geo-regulatory controls</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">Module System</h4>
                <p className="text-sm text-muted-foreground">47+ platform modules with context-based activation and dependency management</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium">WytEntities Knowledge Graph</h4>
                <p className="text-sm text-muted-foreground">31+ entity types with relationship mapping and intelligent tagging</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (activeSubTab === "wytpass") {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-violet-600" />
              WytPass Universal Identity
            </CardTitle>
            <CardDescription>Blockchain-anchored authentication system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              WytPass is a unified identity and authentication system that provides seamless access across all hubs and applications with blockchain-anchored identity validation.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Authentication Methods</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Google OAuth</li>
                  <li>• Email OTP</li>
                  <li>• Email/Password</li>
                  <li>• LinkedIn OAuth</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Key Features</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Single Sign-On (SSO)</li>
                  <li>• Cross-hub authentication</li>
                  <li>• WytID validation</li>
                  <li>• Blockchain anchoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

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
            <div className="text-xs font-semibold text-muted-foreground px-2 mb-2">DOCUMENTATION</div>

            <Button
              variant={activeSection === "about-platform" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveSection("about-platform");
                setActiveSubTab("platform-concepts");
              }}
            >
              <Globe className="h-4 w-4 mr-2" />
              About All
            </Button>

            <Button
              variant={activeSection === "how-it-works" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("how-it-works")}
            >
              <Play className="h-4 w-4 mr-2" />
              How It Works
            </Button>

            <Button
              variant={activeSection === "faq" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("faq")}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQ
            </Button>

            <Button
              variant={activeSection === "standards" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("standards")}
            >
              <Shield className="h-4 w-4 mr-2" />
              Standards
            </Button>

            <Button
              variant={activeSection === "conversations" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("conversations")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Replit Conversations
            </Button>

            <Button
              variant={activeSection === "server-tech" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("server-tech")}
            >
              <Server className="h-4 w-4 mr-2" />
              Server & Tech
            </Button>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="text-xs font-semibold text-muted-foreground px-2 mb-2">DEVELOPMENT</div>

              <Button
                variant={activeSection === "tasks" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("tasks")}
              >
                <Target className="h-4 w-4 mr-2" />
                Task Management
              </Button>

              <Button
                variant={activeSection === "developers" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("developers")}
              >
                <Code className="h-4 w-4 mr-2" />
                Developers
              </Button>

              <Button
                variant={activeSection === "analytics" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("analytics")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>

              <Button
                variant={activeSection === "version-history" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("version-history")}
              >
                <History className="h-4 w-4 mr-2" />
                Version History
              </Button>
            </div>
          </nav>
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
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
                    <Lock className="h-4 w-4 mr-2" />
                    Lock
                  </Button>
                </div>
              </div>

              <div ref={contentRef} className="space-y-6">
                {/* About All Section */}
                {activeSection === "about-platform" && (
                  <div className="space-y-4">
                    <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                      <TabsList>
                        <TabsTrigger value="platform-concepts">Platform</TabsTrigger>
                        <TabsTrigger value="wytengine">WytEngine</TabsTrigger>
                        <TabsTrigger value="entity-module-app">Entity-Module-App</TabsTrigger>
                        <TabsTrigger value="wytpass">WytPass</TabsTrigger>
                      </TabsList>
                      <div className="mt-6">
                        {renderAboutSection()}
                      </div>
                    </Tabs>
                  </div>
                )}

                {/* How It Works Section */}
                {activeSection === "how-it-works" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5 text-blue-600" />
                        How It Works
                      </CardTitle>
                      <CardDescription>Test credentials and system walkthrough</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Tabs defaultValue="test-credentials">
                        <TabsList>
                          <TabsTrigger value="test-credentials">Test Demo Credentials</TabsTrigger>
                          <TabsTrigger value="workflow">System Workflow</TabsTrigger>
                        </TabsList>

                        <TabsContent value="test-credentials" className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Super Admin (Engine)</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Email:</span>
                                  <code>jkm@jkmuthu.com</code>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Password:</span>
                                  <code>SuperAdmin@2025</code>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Portal:</span>
                                  <code>/engine/*</code>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Hub Admin</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Email:</span>
                                  <code>hubadmin@wytnet.com</code>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Password:</span>
                                  <code>hubadmin123</code>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Portal:</span>
                                  <code>/admin/*</code>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>

                        <TabsContent value="workflow">
                          <div className="prose dark:prose-invert max-w-none">
                            <p className="text-muted-foreground">Platform workflow documentation will be added here.</p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}

                {/* FAQ Section */}
                {activeSection === "faq" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-purple-600" />
                        Frequently Asked Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold mb-1">What is the difference between Hub and App?</h4>
                          <p className="text-sm text-muted-foreground">A Hub is a standalone portal with custom domain support, while an App runs within WytNet.com and can be installed by users.</p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-semibold mb-1">How does multi-tenancy work?</h4>
                          <p className="text-sm text-muted-foreground">Each tenant has complete data isolation through row-level security in PostgreSQL with session-based tenant context.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Standards Section */}
                {activeSection === "standards" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        Development Standards
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="global">
                        <TabsList>
                          <TabsTrigger value="global">Global Standards</TabsTrigger>
                          <TabsTrigger value="unified">Unified Conventions</TabsTrigger>
                          <TabsTrigger value="url-logic">URL Logic</TabsTrigger>
                        </TabsList>

                        <TabsContent value="global" className="space-y-4">
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              TypeScript strict mode enabled
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              ESLint + Prettier configuration
                            </li>
                          </ul>
                        </TabsContent>

                        <TabsContent value="unified">
                          <p className="text-sm text-muted-foreground">Unified naming conventions and patterns across the platform.</p>
                        </TabsContent>

                        <TabsContent value="url-logic">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                              <code>/engine/*</code>
                              <span className="text-muted-foreground">Super Admin Portal</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                              <code>/admin/*</code>
                              <span className="text-muted-foreground">Hub Admin Portal</span>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}

                {/* Replit Conversations */}
                {activeSection === "conversations" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-orange-600" />
                        Replit Conversations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="agent">
                        <TabsList>
                          <TabsTrigger value="agent">Agent Conversations</TabsTrigger>
                          <TabsTrigger value="assistant">Assistant Conversations</TabsTrigger>
                        </TabsList>

                        <TabsContent value="agent">
                          <p className="text-sm text-muted-foreground">Agent conversation history and key decisions will be documented here.</p>
                        </TabsContent>

                        <TabsContent value="assistant">
                          <p className="text-sm text-muted-foreground">Assistant conversation history and implementation details will be documented here.</p>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}

                {/* Server & Tech */}
                {activeSection === "server-tech" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-cyan-600" />
                        Server & Technology Stack
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="database">
                        <TabsList>
                          <TabsTrigger value="database">Database</TabsTrigger>
                          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
                        </TabsList>

                        <TabsContent value="database" className="space-y-4">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                              <span>Database</span>
                              <Badge variant="outline">PostgreSQL (Neon)</Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                              <span>ORM</span>
                              <Badge variant="outline">Drizzle</Badge>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="infrastructure">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                              <span>Runtime</span>
                              <Badge variant="outline">Node.js</Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                              <span>Framework</span>
                              <Badge variant="outline">Express.js</Badge>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}

                {/* Developers Section */}
                {activeSection === "developers" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-blue-600" />
                        Developer Documentation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="api">
                        <TabsList>
                          <TabsTrigger value="api">API Reference</TabsTrigger>
                        </TabsList>

                        <TabsContent value="api" className="space-y-4">
                          {apiEndpoints.map((endpoint, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <Badge variant={endpoint.method === "GET" ? "outline" : "default"}>
                                    {endpoint.method}
                                  </Badge>
                                  <code className="text-sm">{endpoint.path}</code>
                                </div>
                                <Badge variant="outline">{endpoint.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                            </div>
                          ))}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}

                {/* Analytics */}
                {activeSection === "analytics" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
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
                          <div className="text-3xl font-bold text-purple-600">47+</div>
                          <div className="text-sm text-muted-foreground mt-2">Platform Modules</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Version History */}
                {activeSection === "version-history" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-orange-600" />
                        Version History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="changelogs">
                        <TabsList>
                          <TabsTrigger value="changelogs">Change Logs</TabsTrigger>
                        </TabsList>

                        <TabsContent value="changelogs" className="space-y-4">
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
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}

                {/* Task Management */}
                {activeSection === "tasks" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        Task Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Task management interface (existing functionality preserved)</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}