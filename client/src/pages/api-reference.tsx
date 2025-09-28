import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Server, Key, Book, Zap, Shield, Database, ArrowRight, Copy, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useEffect, useState } from "react";

export default function APIReference() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  // Set page-specific SEO meta tags
  useEffect(() => {
    document.title = "API Reference - WytNet Platform | Developer API";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Complete API reference for WytNet platform. RESTful API endpoints, authentication, rate limits, and integration examples for developers.');
    }
    
    return () => {
      // Reset to default meta tags on cleanup
      document.title = "WytNet - Multi-Tenant SaaS Platform | Free Assessment Tools";
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Build scalable SaaS applications with WytNet\'s multi-tenant platform. Start with free assessment tools, productivity suites, and specialized business utilities.');
      }
    };
  }, []);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const apiEndpoints = [
    {
      category: "Authentication",
      description: "User authentication and session management",
      endpoints: [
        { method: "POST", path: "/api/auth/login", description: "User login" },
        { method: "POST", path: "/api/auth/logout", description: "User logout" },
        { method: "GET", path: "/api/auth/user", description: "Get current user" },
        { method: "POST", path: "/api/auth/refresh", description: "Refresh auth token" }
      ]
    },
    {
      category: "Tools & Services",
      description: "WytNet tool APIs and service endpoints",
      endpoints: [
        { method: "POST", path: "/api/qr/generate", description: "Generate QR codes" },
        { method: "GET", path: "/api/ai-directory", description: "AI tools directory" },
        { method: "POST", path: "/api/assessment/start", description: "Start assessment" },
        { method: "GET", path: "/api/assessment/results", description: "Get assessment results" }
      ]
    },
    {
      category: "Platform Management",
      description: "Platform configuration and module management",
      endpoints: [
        { method: "GET", path: "/api/platform-modules/enabled", description: "Get enabled modules" },
        { method: "POST", path: "/api/platform-modules", description: "Create platform module" },
        { method: "PUT", path: "/api/platform-modules/:id", description: "Update platform module" },
        { method: "DELETE", path: "/api/platform-modules/:id", description: "Delete platform module" }
      ]
    },
    {
      category: "Search & Discovery",
      description: "Search functionality across platform content",
      endpoints: [
        { method: "GET", path: "/api/search/global", description: "Global search" },
        { method: "GET", path: "/api/search/suggestions", description: "Search suggestions" },
        { method: "GET", path: "/api/search/trademark", description: "Trademark search" },
        { method: "GET", path: "/api/search/statistics", description: "Search statistics" }
      ]
    }
  ];

  const codeExamples = [
    {
      title: "Authentication",
      language: "javascript",
      code: `// Login example
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'your-username',
    password: 'your-password'
  }),
  credentials: 'include'
});

const data = await response.json();
console.log('Login successful:', data);`
    },
    {
      title: "Generate QR Code",
      language: "javascript", 
      code: `// QR Code generation
const response = await fetch('/api/qr/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'https://wytnet.com',
    size: 256,
    format: 'png'
  }),
  credentials: 'include'
});

const qrData = await response.json();
console.log('QR Code generated:', qrData.qrCode);`
    },
    {
      title: "Search Platform",
      language: "javascript",
      code: `// Global search example
const response = await fetch('/api/search/global?q=productivity&limit=10', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'
});

const results = await response.json();
console.log('Search results:', results.hits);`
    }
  ];

  const features = [
    {
      title: "RESTful API",
      description: "Standard HTTP methods and status codes",
      icon: Server,
      color: "text-blue-500"
    },
    {
      title: "Authentication",
      description: "Secure session-based authentication",
      icon: Shield,
      color: "text-green-500"
    },
    {
      title: "Rate Limiting",
      description: "Fair usage policies and rate limits",
      icon: Zap,
      color: "text-yellow-500"
    },
    {
      title: "Multi-tenant",
      description: "Tenant-aware API endpoints",
      icon: Database,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Code className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            API Reference
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Complete REST API documentation for WytNet platform. Build powerful integrations 
            with our comprehensive API endpoints and developer tools.
          </p>

          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2">v1.0</Badge>
              <span>API Version</span>
            </div>
            <div className="flex items-center">
              <Server className="h-4 w-4 mr-2" />
              <span>REST API</span>
            </div>
          </div>
        </div>
      </section>

      {/* API Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              API Features
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Modern REST API built for developers
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              API Endpoints
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Available endpoints organized by category
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {apiEndpoints.map((category, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    {category.category}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {category.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.endpoints.map((endpoint, endpointIndex) => (
                      <div key={endpointIndex} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Badge 
                              variant={endpoint.method === 'GET' ? 'outline' : 'default'}
                              className={`text-xs ${
                                endpoint.method === 'GET' ? 'text-green-600' :
                                endpoint.method === 'POST' ? 'text-blue-600' :
                                endpoint.method === 'PUT' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                              {endpoint.path}
                            </code>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 ml-16">
                            {endpoint.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(endpoint.path, `${category.category}-${endpointIndex}`)}
                          data-testid={`copy-${endpoint.method.toLowerCase()}-${endpoint.path.replace(/\//g, '-')}`}
                        >
                          {copiedEndpoint === `${category.category}-${endpointIndex}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Code Examples
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Get started quickly with these code examples
            </p>
          </div>
          
          <div className="grid lg:grid-cols-1 gap-8">
            {codeExamples.map((example, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    {example.title}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(example.code, `example-${index}`)}
                    data-testid={`copy-example-${index}`}
                  >
                    {copiedEndpoint === `example-${index}` ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    Copy
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{example.code}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Building?
          </h2>
          <p className="text-purple-100 mb-8 text-lg">
            Get your API credentials and start integrating with WytNet today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
                Get API Access
                <Key className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                <Book className="h-5 w-5 mr-2" />
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}