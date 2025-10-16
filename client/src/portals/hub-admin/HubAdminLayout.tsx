import { ReactNode, useState } from "react";
import { Redirect } from "wouter";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useHubAdminAuth } from "@/contexts/HubAdminAuthContext";
import HubAdminHeader from "./HubAdminHeader";
import HubAdminSidebar from "./HubAdminSidebar";

interface HubAdminLayoutProps {
  children: ReactNode;
}

/**
 * HubAdminLayout - Layout for WytNet.com Hub Admin portal pages
 * Features: Hub admin authentication, hub content navigation, hub management tools
 */
export default function HubAdminLayout({ children }: HubAdminLayoutProps) {
  const { isMobile } = useDeviceDetection();
  const { isHubAdminAuthenticated, isLoading, hubAdminUser } = useHubAdminAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading hub admin panel...</p>
        </div>
      </div>
    );
  }

  // Redirect to hub admin login if not authenticated
  if (!isHubAdminAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  // Desktop layout with sidebar
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <HubAdminHeader 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <div className="flex">
        <HubAdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="p-6">
            {/* Hub admin indicator */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Hub Administration - {hubAdminUser?.hubName || 'WytNet.com'}
                </span>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
