import { ReactNode, useState } from "react";
import { Redirect } from "wouter";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminMobileLayout from "./AdminMobileLayout";
import WytAIAgent from "@/components/wytai/WytAIAgent";

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * AdminLayout - Layout for admin portal pages
 * Features: Admin authentication, admin navigation, system management tools
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isMobile } = useDeviceDetection();
  const { isAdminAuthenticated, isLoading, adminUser } = useAdminAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Redirect to engine login if not authenticated
  if (!isAdminAuthenticated) {
    return <Redirect to="/engine/login" />;
  }

  // Use mobile-specific layout for small screens
  if (isMobile) {
    return (
      <>
        <AdminMobileLayout>
          {children}
        </AdminMobileLayout>
        {/* WytAI Agent - Available on mobile too */}
        <WytAIAgent />
      </>
    );
  }

  // Desktop layout with sidebar
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <div className="flex">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* WytAI Agent - Floating AI Assistant */}
      <WytAIAgent />
    </div>
  );
}