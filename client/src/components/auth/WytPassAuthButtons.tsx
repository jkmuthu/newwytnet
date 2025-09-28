import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";

interface WytPassAuthButtonsProps {
  title?: string;
  description?: string;
  onGoogleLogin?: () => void;
  onEmailOTPLogin?: () => void;
  showEmailLogin?: boolean;
}

export default function WytPassAuthButtons({ 
  title = "Access WytNet with WytPass", 
  description = "Choose your preferred sign-in method",
  onEmailOTPLogin,
  showEmailLogin = true 
}: WytPassAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    setIsLoading("google");
    window.location.href = "/api/auth/google";
  };


  return (
    <Card className="w-full max-w-md mx-auto" data-testid="wytpass-auth-card">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Login Button */}
        <Button 
          onClick={handleGoogleLogin}
          disabled={isLoading !== null}
          className="w-full h-11 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm transition-all duration-200 hover:shadow-md"
          data-testid="button-google-login"
        >
          {isLoading === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <FaGoogle className="h-4 w-4 mr-2 text-red-500" />
          )}
          Continue with Google
        </Button>

        {/* Facebook Login - Disabled until setup */}
        {/* 
        <Button 
          disabled
          className="w-full h-11 bg-gray-300 text-gray-500 cursor-not-allowed"
          data-testid="button-facebook-login-disabled"
        >
          <FaFacebook className="h-4 w-4 mr-2" />
          Facebook Login (Coming Soon)
        </Button>
        */}

        {/* Email OTP Login Button */}
        <Button 
          onClick={onEmailOTPLogin}
          variant="outline"
          className="w-full h-11 text-gray-900 border border-gray-300 hover:bg-gray-50"
          data-testid="button-email-otp-login"
        >
          <Mail className="h-4 w-4 mr-2 text-blue-500" />
          Continue with Email OTP
        </Button>

        {showEmailLogin && (
          <>
            <div className="flex items-center space-x-2">
              <Separator className="flex-1" />
              <span className="text-xs text-gray-500 bg-background px-2">
                OR
              </span>
              <Separator className="flex-1" />
            </div>

            {/* Email/Password Login Button */}
            <Button 
              onClick={() => window.location.href = "/login"}
              variant="outline"
              className="w-full h-11"
              data-testid="button-email-login"
            >
              Continue with Email & Password
            </Button>
          </>
        )}

        {/* WytPass Branding */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500">
            Secured by <span className="font-semibold text-blue-600">WytPass</span> • 
            Universal Identity & Validation
          </p>
        </div>
      </CardContent>
    </Card>
  );
}