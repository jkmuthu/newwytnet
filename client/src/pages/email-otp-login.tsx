import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import EmailOTPForm from "@/components/auth/EmailOTPForm";

export default function EmailOTPLoginPage() {
  const { user, isLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      window.location.href = "/";
    }
  }, [user, isLoading]);

  // Don't render anything while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if user is already logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* WytNet Logo/Header */}
        <div className="text-center space-y-2">
          <img 
            src="/wytnet-logo.png" 
            alt="WytNet" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            WytPass
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Secure Email OTP Authentication
          </p>
        </div>

        {/* Email OTP Form */}
        <EmailOTPForm 
          onBack={() => window.location.href = "/wytpass-login"} 
        />

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}