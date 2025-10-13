
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, BookOpen, CheckCircle, Clock, AlertCircle, Code, Database, Shield } from "lucide-react";

export default function DevDocumentation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Development Documentation - WytNet Platform";
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use environment-based password or default
    const correctPassword = "wytnet@dev2025"; // Change this in production
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

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

  const changeLogs = [
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
    },
    {
      date: "2025-01-12",
      version: "v1.4.0",
      changes: [
        "Fixed WytPass login form styling",
        "Updated mobile navigation components",
        "Improved authentication context handling"
      ],
      author: "Development Team"
    }
  ];

  const nextToImplement = [
    {
      title: "WytWall Public Landing Integration",
      priority: "High",
      status: "In Progress",
      description: "Implement WytWall as the primary landing page with public offers and needs",
      estimatedTime: "2-3 days"
    },
    {
      title: "Enhanced Search Functionality",
      priority: "High",
      status: "Planned",
      description: "Optimize Meilisearch integration for global search across all modules",
      estimatedTime: "1 week"
    },
    {
      title: "Payment Gateway Enhancement",
      priority: "Medium",
      status: "Planned",
      description: "Complete Razorpay integration with subscription management",
      estimatedTime: "3-4 days"
    }
  ];

  const upcomingImplementations = [
    {
      title: "WytLife CRM Module",
      category: "Feature",
      description: "Complete CRM system for managing relationships and interactions",
      quarter: "Q1 2025"
    },
    {
      title: "AI-Powered Recommendations",
      category: "Enhancement",
      description: "Implement AI-based matching for offers and needs",
      quarter: "Q2 2025"
    },
    {
      title: "Mobile App PWA Enhancement",
      category: "Platform",
      description: "Enhanced Progressive Web App capabilities",
      quarter: "Q1 2025"
    }
  ];

  const alreadyImplemented = [
    {
      title: "Multi-tenant Architecture",
      date: "Completed",
      description: "Full tenant isolation with Row Level Security (RLS)",
      components: ["Database Schema", "Authentication", "Authorization"]
    },
    {
      title: "WytID Universal Identity System",
      date: "Completed",
      description: "Comprehensive identity validation and management system",
      components: ["Core Packages", "Validation Service", "API Integration"]
    },
    {
      title: "WytPass Authentication",
      date: "Completed",
      description: "Custom white-label authentication with Google OAuth integration",
      components: ["Login/Register", "Session Management", "OAuth Flow"]
    },
    {
      title: "Platform Modules",
      date: "Completed",
      description: "Core platform modules including CRUD builder, App builder, Hub builder",
      components: ["Module Builder", "App Builder", "Hub Builder", "CMS Builder"]
    },
    {
      title: "Assessment Tools",
      date: "Completed",
      description: "Complete assessment framework with DISC personality test",
      components: ["Assessment Service", "Questions DB", "Results Analysis"]
    },
    {
      title: "QR Code Generator",
      date: "Completed",
      description: "Dynamic QR code generation with customization options",
      components: ["Generator Service", "Customization UI", "Download Options"]
    }
  ];

  const standardInstructions = [
    {
      title: "URL Structure",
      items: [
        "Public routes: / (landing), /wytwall, /wytapps, /pricing",
        "Panel routes: /panel/* (user dashboard and features)",
        "Admin routes: /admin/* (system administration)",
        "API routes: /api/* (RESTful endpoints)"
      ]
    },
    {
      title: "Authentication Flow",
      items: [
        "WytPass: Email/Password with Google OAuth",
        "Email OTP: Passwordless authentication",
        "WhatsApp: Phone number verification (planned)",
        "Session management with secure cookies"
      ]
    },
    {
      title: "Development Policies",
      items: [
        "Always use TypeScript for type safety",
        "Follow React best practices with hooks",
        "Use Tailwind CSS for styling",
        "Implement responsive design (mobile-first)",
        "Test authentication flows thoroughly",
        "Document all API endpoints"
      ]
    },
    {
      title: "Deployment Guidelines",
      items: [
        "Deploy on Replit platform",
        "Use port 5000 for development",
        "Bind to 0.0.0.0 for production",
        "Environment variables in Secrets",
        "Database migrations via Drizzle ORM"
      ]
    }
  ];

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
                WytNet Platform - Internal Development & Testing Document
              </p>
            </div>
            <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
              <Lock className="h-4 w-4 mr-2" />
              Lock
            </Button>
          </div>

          <Tabs defaultValue="changelog" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="changelog">Change Logs</TabsTrigger>
              <TabsTrigger value="next">Next to Implement</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="implemented">Implemented</TabsTrigger>
              <TabsTrigger value="standards">Standards</TabsTrigger>
            </TabsList>

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

            <TabsContent value="next" className="space-y-4">
              {nextToImplement.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.priority === "High" ? "destructive" : "secondary"}>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Estimated: {item.estimatedTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {upcomingImplementations.map((item, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge>{item.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>Target: {item.quarter}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="implemented" className="space-y-4">
              {alreadyImplemented.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        {item.title}
                      </CardTitle>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {item.date}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.components.map((component, i) => (
                        <Badge key={i} variant="secondary">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="standards" className="space-y-4">
              {standardInstructions.map((section, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {section.title === "URL Structure" && <Code className="h-5 w-5" />}
                      {section.title === "Authentication Flow" && <Shield className="h-5 w-5" />}
                      {section.title === "Development Policies" && <BookOpen className="h-5 w-5" />}
                      {section.title === "Deployment Guidelines" && <Database className="h-5 w-5" />}
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
