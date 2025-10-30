import { ReactNode, useState, useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useAuth } from "@/hooks/useAuth";
import PanelHeader from "./PanelHeader";
import PanelSidebar from "./PanelSidebar";
import PanelMobileLayout from "./PanelMobileLayout";

interface PanelLayoutProps {
  children: ReactNode;
}

export type WorkspaceType = 'personal' | 'organization' | 'app';

export interface WorkspaceContext {
  type: WorkspaceType;
  id: string;
  name: string;
  orgId?: string;
  appSlug?: string;
  appName?: string;
}

/**
 * PanelLayout - Layout for authenticated user workspaces
 * Features: Workspace switcher, personal/org navigation, user profile management
 */
export default function PanelLayout({ children }: PanelLayoutProps) {
  const { isMobile } = useDeviceDetection();
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceContext>({
    type: 'personal',
    id: 'me',
    name: 'My Panel'
  });

  // Auto-detect workspace based on current route
  useEffect(() => {
    // Normalize location path (ensure leading slash)
    const normalizedPath = location.startsWith('/') ? location : `/${location}`;
    
    // Check for App Panel first (most specific)
    if (normalizedPath.includes('/apppanel/')) {
      // Extract app slug from URL: /apppanel/wytduty -> wytduty
      const appSlug = normalizedPath.split('/apppanel/')[1]?.split('/')[0] || '';
      const appNameMap: Record<string, string> = {
        'wytduty': 'WytDuty',
        'wytqrc': 'WytQRC',
        'wytassesser': 'WytAssesser',
        'wytbuilder': 'WytBuilder',
        'wytlife': 'WytLife',
        // Add more apps as needed
      };
      
      setCurrentWorkspace({
        type: 'app',
        id: `app-${appSlug}`,
        name: appNameMap[appSlug] || 'App Panel',
        appSlug,
        appName: appNameMap[appSlug]
      });
    } else if (normalizedPath.includes('/orgpanel')) {
      setCurrentWorkspace({
        type: 'organization',
        id: 'org',
        name: 'Org Panel'
      });
    } else if (normalizedPath.includes('/mypanel')) {
      setCurrentWorkspace({
        type: 'personal',
        id: 'me',
        name: 'My Panel'
      });
    } else if (normalizedPath.includes('/panel/org')) {
      // Handle legacy /panel/org routes before redirect
      setCurrentWorkspace({
        type: 'organization',
        id: 'org',
        name: 'Org Panel'
      });
    } else {
      // Default to personal for /panel and /panel/me routes
      setCurrentWorkspace({
        type: 'personal',
        id: 'me',
        name: 'My Panel'
      });
    }
  }, [location]);

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Use mobile-specific layout for small screens
  if (isMobile) {
    return (
      <PanelMobileLayout 
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
      >
        {children}
      </PanelMobileLayout>
    );
  }

  // Desktop layout with sidebar
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PanelHeader 
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <div className="flex">
        <PanelSidebar
          currentWorkspace={currentWorkspace}
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
    </div>
  );
}