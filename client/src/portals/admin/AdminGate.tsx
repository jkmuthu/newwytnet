import { useAdminAuth } from "@/contexts/AdminAuthContext";
import WytPassLoginForm from "@/components/auth/WytPassLoginForm";
import { Loader2 } from "lucide-react";

/**
 * AdminGate - Guards admin routes and shows unified WytPass login when not authenticated
 * Simplified enterprise pattern: /engine shows login OR dashboard based on auth state
 */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated: show unified WytPass login form
  if (!isAdminAuthenticated) {
    return <WytPassLoginForm />;
  }

  // Authenticated: show admin content
  return <>{children}</>;
}
