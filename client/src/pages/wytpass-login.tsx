import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import WytPassLoginForm from "@/components/auth/WytPassLoginForm";
import { useToast } from "@/hooks/use-toast";

export default function WytPassLoginPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check for OAuth error in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error === 'google_failed') {
      toast({
        title: "Google login failed",
        description: "Please try again or use a different method",
        variant: "destructive",
      });
    } else if (error === 'facebook_failed') {
      toast({
        title: "Facebook login failed", 
        description: "Please try again or use a different method",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading WytPass...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return <WytPassLoginForm />;
}