import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminSystemOverview from "./system-overview";
import AdminSystemLogs from "./system-logs-real";
import AdminSystemMonitor from "./system-monitor";
import AdminSystemStatus from "./system-status";
import AdminSecurity from "./security";
import AdminDatabaseSync from "./database-sync";

export default function AdminSystemSecurity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System & Security</h1>
        <p className="text-muted-foreground">Monitor system health, logs, and security settings</p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-system-overview">System Overview</TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-system-logs">System Logs</TabsTrigger>
          <TabsTrigger value="monitor" data-testid="tab-system-monitor">System Monitor</TabsTrigger>
          <TabsTrigger value="status" data-testid="tab-system-status">System Status</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
          <TabsTrigger value="database-sync" data-testid="tab-database-sync">Database Sync</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <AdminSystemOverview />
        </TabsContent>
        
        <TabsContent value="logs">
          <AdminSystemLogs />
        </TabsContent>
        
        <TabsContent value="monitor">
          <AdminSystemMonitor />
        </TabsContent>
        
        <TabsContent value="status">
          <AdminSystemStatus />
        </TabsContent>
        
        <TabsContent value="security">
          <AdminSecurity />
        </TabsContent>
        
        <TabsContent value="database-sync">
          <AdminDatabaseSync />
        </TabsContent>
      </Tabs>
    </div>
  );
}
