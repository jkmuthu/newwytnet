import { useHubAdminAuth } from "@/contexts/HubAdminAuthContext";
import HubAdminLogin from "@/pages/hub-admin/HubAdminLogin";
import { Loader2 } from "lucide-react";

/**
 * HubAdminGate - Guards hub admin routes and shows login form when not authenticated
 * For WytNet.com Hub administrators only
 */
export default function HubAdminGate({ children }: { children: React.ReactNode }) {
  const { isHubAdminAuthenticated, isLoading } = useHubAdminAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated: show login form
  if (!isHubAdminAuthenticated) {
    return <HubAdminLogin />;
  }

  // Authenticated: show hub admin content
  return <>{children}</>;
}
