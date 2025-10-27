import { useHubAdminAuth } from "@/contexts/HubAdminAuthContext";
import WytPassLoginForm from "@/components/auth/WytPassLoginForm";
import { Loader2 } from "lucide-react";

/**
 * HubAdminGate - Guards hub admin routes and shows unified WytPass login when not authenticated
 * For WytNet.com Hub administrators
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

  // Not authenticated: show unified WytPass login form
  if (!isHubAdminAuthenticated) {
    return <WytPassLoginForm />;
  }

  // Authenticated: show hub admin content
  return <>{children}</>;
}
