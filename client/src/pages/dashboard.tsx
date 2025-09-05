import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import StatsCard from "@/components/ui/stats-card";
import ActivityFeed from "@/components/ui/activity-feed";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isSuperAdmin } = useWhatsAppAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Optional authentication - show login prompt if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Don't force redirect, just show a helpful message
      toast({
        title: "Welcome to WytNet",
        description: "Sign in to access your personal dashboard and create projects.",
      });
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: activities } = useQuery({
    queryKey: ["/api/activity"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow access even without authentication, but show limited functionality

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className="flex-1 overflow-y-auto">
        <Header 
          user={user} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <div className="p-4 lg:p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Active Tenants"
              value={stats?.activeTenants || 0}
              icon="building"
              trend={stats?.tenantsTrend || { value: 0, isPositive: true }}
              color="blue"
            />
            <StatsCard
              title="Deployed Apps"
              value={stats?.deployedApps || 0}
              icon="mobile-alt"
              trend={stats?.appsTrend || { value: 0, isPositive: true }}
              color="green"
            />
            <StatsCard
              title="Active Hubs"
              value={stats?.activeHubs || 0}
              icon="network-wired"
              trend={stats?.hubsTrend || { value: 0, isPositive: true }}
              color="purple"
            />
            <StatsCard
              title="Revenue (INR)"
              value={`₹${stats?.revenue || "0"}`}
              icon="rupee-sign"
              trend={stats?.revenueTrend || { value: 0, isPositive: true }}
              color="yellow"
            />
          </div>

          {/* Welcome Message */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Welcome to WytNet Dashboard
            </h2>
            <p className="text-muted-foreground mb-4">
              Use the sidebar to navigate to different sections and manage your platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Quick Actions</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Manage content with CMS Builder</li>
                  <li>• Create modules with CRUD Builder</li>
                  <li>• Build applications</li>
                  <li>• Configure system settings</li>
                </ul>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">System Status</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All services running</li>
                  <li>• Database connected</li>
                  <li>• API endpoints active</li>
                  <li>• Authentication working</li>
                </ul>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Recent Updates</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Platform optimization</li>
                  <li>• New features added</li>
                  <li>• Security improvements</li>
                  <li>• Performance enhancements</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Activity and Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityFeed activities={activities || []} />
            
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-medium text-foreground mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-foreground">API Gateway</span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-foreground">Database</span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-foreground">Redis Cache</span>
                  </div>
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Warning</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-foreground">File Storage</span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Healthy</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Server Load</span>
                  <span className="text-sm text-muted-foreground">68%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: "68%"}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
