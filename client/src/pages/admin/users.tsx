import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";

export default function AdminUsers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useWhatsAppAuth();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 overflow-y-auto">
        <Header 
          user={user} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage all users across tenants</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Complete user management system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">User management interface will be implemented here.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}