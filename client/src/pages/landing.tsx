import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <i className="fas fa-cube text-primary-foreground text-2xl"></i>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            WytNet
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The ultimate multi-tenant SaaS platform for building applications, managing content, and creating cross-tenant hubs
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="px-8 py-4 text-lg"
            data-testid="button-login"
          >
            Get Started
          </Button>
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
