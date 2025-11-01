import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Rocket, 
  Settings, 
  ArrowRight,
  Grid3x3,
  Plus
} from "lucide-react";

export default function AppPanelHome() {
  const [, setLocation] = useLocation();

  const { data: addedApps, isLoading } = useQuery<{ apps: any[] }>({
    queryKey: ["/api/panel/apps/added"],
  });

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading your apps...</p>
        </div>
      </div>
    );
  }

  const apps = addedApps?.apps || [];

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Apps</h1>
          <p className="text-muted-foreground">
            Access and manage your installed applications
          </p>
        </div>
        <Button
          onClick={() => setLocation("/mypanel/my-wytapps")}
          data-testid="button-discover-apps"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add More Apps
        </Button>
      </div>

      {apps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Grid3x3 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Apps Added Yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Start by adding apps from the WytApps marketplace to access their features
            </p>
            <Button onClick={() => setLocation("/mypanel/my-wytapps")}>
              <Plus className="h-4 w-4 mr-2" />
              Browse Apps
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app: any) => (
            <Card
              key={app.id}
              className="hover:shadow-lg transition-all cursor-pointer group"
              data-testid={`card-app-${app.slug}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                      <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">
                        {app.category?.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-2">
                  {app.description}
                </CardDescription>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setLocation(`/apppanel/${app.slug}`)}
                    className="flex-1"
                    data-testid={`button-open-${app.slug}`}
                  >
                    <span>Open App</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setLocation(`/apppanel/${app.slug}/settings`)}
                    data-testid={`button-settings-${app.slug}`}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
