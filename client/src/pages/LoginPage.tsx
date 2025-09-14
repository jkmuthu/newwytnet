import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Github, Mail } from "lucide-react";

export default function LoginPage() {
  const handleOAuthLogin = () => {
    // Redirect to Replit OAuth login which supports Google, GitHub, X, Apple, email/password
    window.location.href = '/api/login';
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/wytnet-logo.png" 
              alt="WytNet" 
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to WytNet</CardTitle>
          <CardDescription>
            Sign in to access your personal dashboard and create projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleOAuthLogin}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            data-testid="button-oauth-login"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Sign in with OAuth
          </Button>
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Supports Google, GitHub, X, Apple & Email
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              variant="ghost" 
              onClick={handleBackToHome}
              className="w-full"
              data-testid="button-back-home"
            >
              ← Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}