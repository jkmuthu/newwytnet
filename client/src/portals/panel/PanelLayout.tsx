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

export type WorkspaceType = 'personal' | 'organization' | 'app' | 'hub';

export interface WorkspaceContext {
  type: WorkspaceType;
  id: string;
  name: string;
  orgId?: string;
  appSlug?: string;
  appName?: string;
  hubSlug?: string;
  hubName?: string;
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
    name: 'WytPanel'
  });

  // Helper to convert slug to display name
  const slugToDisplayName = (slug: string): string => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // App name mappings
  const appNameMap: Record<string, string> = {
    'wytduty': 'WytDuty',
    'wytqrc': 'WytQRC',
    'wytpass': 'WytPass',
    'wytwall': 'WytWall',
    'wytassessor': 'WytAssessor',
    'wytassesser': 'WytAssesser',
    'wytbuilder': 'WytBuilder',
    'wytlife': 'WytLife',
    'assessment': 'Assessment',
    'qr-generator': 'QR Generator',
    'ai-directory': 'AI Directory',
  };

  // Auto-detect workspace based on current route
  useEffect(() => {
    // Normalize location path (ensure leading slash)
    const normalizedPath = location.startsWith('/') ? location : `/${location}`;
    
    // NEW: Check for /a/:appname (App Panel)
    const appMatch = normalizedPath.match(/^\/a\/([^\/]+)/);
    if (appMatch) {
      const appSlug = appMatch[1];
      const appDisplayName = appNameMap[appSlug] || slugToDisplayName(appSlug);
      
      setCurrentWorkspace({
        type: 'app',
        id: `app-${appSlug}`,
        name: appDisplayName,
        appSlug,
        appName: appDisplayName
      });
      return;
    }
    
    // Check for /h/:hubname (Hub Panel)
    const hubMatch = normalizedPath.match(/^\/h\/([^\/]+)/);
    if (hubMatch) {
      const hubSlug = hubMatch[1];
      const hubDisplayName = slugToDisplayName(hubSlug);
      
      setCurrentWorkspace({
        type: 'hub',
        id: `hub-${hubSlug}`,
        name: `${hubDisplayName} Hub`,
        hubSlug,
        hubName: hubDisplayName
      });
      return;
    }
    
    // NEW: Check for /o/:orgname (Org Panel)
    const orgMatch = normalizedPath.match(/^\/o\/([^\/]+)/);
    if (orgMatch) {
      const orgSlug = orgMatch[1];
      const orgDisplayName = orgSlug === 'default' ? 'Organization' : slugToDisplayName(orgSlug);
      
      setCurrentWorkspace({
        type: 'organization',
        id: `org-${orgSlug}`,
        name: orgDisplayName,
        orgId: orgSlug
      });
      return;
    }
    
    // Check for /u/* (User Panel) - clean URLs, no username in path
    if (normalizedPath === '/u' || normalizedPath.startsWith('/u/')) {
      setCurrentWorkspace({
        type: 'personal',
        id: 'me',
        name: 'WytPanel'
      });
      return;
    }
    
    // Legacy: Check for /apppanel/ routes
    if (normalizedPath.includes('/apppanel/')) {
      const appSlug = normalizedPath.split('/apppanel/')[1]?.split('/')[0] || '';
      const appDisplayName = appNameMap[appSlug] || slugToDisplayName(appSlug);
      
      setCurrentWorkspace({
        type: 'app',
        id: `app-${appSlug}`,
        name: appDisplayName,
        appSlug,
        appName: appDisplayName
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
        name: 'WytPanel'
      });
    } else if (normalizedPath.includes('/panel/org')) {
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
        name: 'WytPanel'
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