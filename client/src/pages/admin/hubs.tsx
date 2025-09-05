import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import HubBuilder from "@/components/builders/hub-builder";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";

export default function AdminHubs() {
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
            <h1 className="text-3xl font-bold text-foreground">Hub Builder</h1>
            <p className="text-muted-foreground">Create cross-tenant hubs and marketplaces</p>
          </div>
          
          <div className="bg-card rounded-lg border border-border">
            <HubBuilder />
          </div>
        </div>
      </main>
    </div>
  );
}