import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Code, ExternalLink, Download, Zap, Shield, Users, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

export default function Documentation() {
  // Set page-specific SEO meta tags
  useEffect(() => {
    document.title = "Documentation - WytNet Platform | Developer Guide";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Complete documentation for WytNet platform. Developer guides, API references, integration tutorials, and technical documentation for building with WytNet.');
    }
    
    return () => {
      // Reset to default meta tags on cleanup
      document.title = "WytNet - Multi-Tenant SaaS Platform | Free Assessment Tools";
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Build scalable SaaS applications with WytNet\'s multi-tenant platform. Start with free assessment tools, productivity suites, and specialized business utilities.');
      }
    };
  }, []);

  const documentationSections = [
    {
      title: "Getting Started",
      description: "Quick start guide to begin using WytNet tools and platform",
      icon: Zap,
      color: "text-green-500",
      topics: [
        "Platform Overview",
        "Account Setup",
        "First Steps Guide",
        "Basic Configuration"
      ]
    },
    {
      title: "User Guides",
      description: "Step-by-step guides for all WytNet tools and features",
      icon: Users,
      color: "text-blue-500",
      topics: [
        "QR Code Generator",
        "AI Directory",
        "Assessment Tools",
        "Business Tools"
      ]
    },
    {
      title: "Developer Resources",
      description: "Technical documentation for developers and integrators",
      icon: Code,
      color: "text-purple-500",
      topics: [
        "API Documentation",
        "Integration Guide",
        "SDK References",
        "Code Examples"
      ]
    },
    {
      title: "Security & Privacy",
      description: "Security protocols, privacy policies, and compliance information",
      icon: Shield,
      color: "text-orange-500",
      topics: [
        "Data Security",
        "Privacy Controls",
        "Compliance Standards",
        "Best Practices"
      ]
    }
  ];

  const quickLinks = [
    { title: "API Reference", href: "/api", description: "Complete API documentation", external: false },
    { title: "Support Center", href: "/help", description: "Get help and support", external: false },
    { title: "Community Forum", href: "/community", description: "Join the community", external: false },
    { title: "GitHub Repository", href: "https://github.com/wytnet", description: "Source code and examples", external: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Documentation
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Everything you need to know about WytNet platform. From quick start guides to 
            advanced developer documentation, we've got you covered.
          </p>

          <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            <span>Last updated: December 2024</span>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {documentationSections.map((section, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <section.icon className={`h-6 w-6 ${section.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {section.title}
                        </CardTitle>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">{section.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{topic}</span>
                        <Badge variant="outline" className="text-xs">Guide</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Jump directly to the resources you need
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {quickLinks.map((link, index) => (
              <div key={index}>
                {link.external ? (
                  <a 
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    data-testid={`link-${link.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <Card className="border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {link.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {link.description}
                            </p>
                          </div>
                          <ExternalLink className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ) : (
                  <Link href={link.href}>
                    <Card className="border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {link.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {link.description}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need More Help?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                Contact Support
              </Button>
            </Link>
            <Link href="/api">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                API Reference
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}