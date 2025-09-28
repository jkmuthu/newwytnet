import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Users, Zap, ArrowRight, Star, CheckCircle, Award } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          
          {/* Enterprise Badge */}
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow-lg" data-testid="badge-enterprise">
              <Star className="h-4 w-4 mr-2" />
              ENTERPRISE READY
            </Badge>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/wytnet-logo.png" 
              alt="WytNet - Multi-Tenant SaaS Platform" 
              className="h-16 w-auto transition-transform hover:scale-105"
              loading="eager"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Build the Future
            </span>
            <br />
            <span className="text-gray-700 dark:text-gray-300 text-2xl md:text-3xl">
              of SaaS Applications
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            The ultimate <strong>multi-tenant platform</strong> for rapidly building, deploying, and scaling 
            enterprise-grade SaaS applications with zero infrastructure complexity.
          </p>

          {/* Trust Signals for Enterprise */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2" data-testid="trust-multi-tenant">
              <Users className="h-4 w-4 text-purple-500" />
              <span>Multi-Tenant Ready</span>
            </div>
            <div className="flex items-center gap-2" data-testid="trust-enterprise-security">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2" data-testid="trust-low-code">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>Low-Code Builder</span>
            </div>
            <div className="flex items-center gap-2" data-testid="trust-scalable">
              <Award className="h-4 w-4 text-orange-500" />
              <span>Auto-Scaling</span>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="flex justify-center">
            <Button 
              onClick={handleLogin}
              size="xl"
              className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              data-testid="button-primary-login"
            >
              Start Building Now
              <ArrowRight className="h-5 w-5 ml-3" />
            </Button>
          </div>
          
          {/* Secondary messaging */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            No credit card required • Enterprise trial available
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-cubes text-blue-600 text-xl"></i>
              </div>
              <CardTitle>CRUD Builder</CardTitle>
              <CardDescription>
                Define data models with JSON DSL and generate full CRUD operations automatically
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-edit text-green-600 text-xl"></i>
              </div>
              <CardTitle>CMS Builder</CardTitle>
              <CardDescription>
                Drag-and-drop page builder with rich blocks for creating beautiful content
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-mobile-alt text-purple-600 text-xl"></i>
              </div>
              <CardTitle>App Builder</CardTitle>
              <CardDescription>
                Compose modules into complete applications with pricing and deployment
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-network-wired text-orange-600 text-xl"></i>
              </div>
              <CardTitle>Hub Builder</CardTitle>
              <CardDescription>
                Create cross-tenant hubs and marketplaces with advanced moderation
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Everything you need to build the next generation of SaaS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">Multi-Tenant</div>
              <p className="text-muted-foreground">Complete isolation and customization per tenant</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">Low-Code</div>
              <p className="text-muted-foreground">Build powerful applications without extensive coding</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">Scalable</div>
              <p className="text-muted-foreground">Enterprise-ready architecture and security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
