import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AppBuilder from "@/components/builders/app-builder";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";

export default function AdminApps() {
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
            <h1 className="text-3xl font-bold text-foreground">App Builder</h1>
            <p className="text-muted-foreground">Compose modules into complete applications</p>
          </div>
          
          <div className="bg-card rounded-lg border border-border">
            <AppBuilder />
          </div>
        </div>
      </main>
    </div>
  );
}