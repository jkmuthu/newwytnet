import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHubAdminAuth } from "@/contexts/HubAdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Home, AlertCircle } from "lucide-react";
import { Link } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * HubAdminLogin - Login page for WytNet.com Hub Admin portal
 * Separate authentication from Engine super admin
 */
export default function HubAdminLogin() {
  const { hubAdminLogin } = useHubAdminAuth();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError("");
      
      const result = await hubAdminLogin(data);
      
      if (!result.success) {
        setError(result.error || "Invalid credentials");
      } else {
        // Login successful, context will handle redirect
        window.location.href = '/admin';
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center space-x-3 cursor-pointer group mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-3">
                  <Home className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  WytNet.com
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Hub Admin Portal
                </div>
              </div>
            </div>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Sign in to manage WytNet.com hub content and settings
          </p>
        </div>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-blue-700 dark:text-blue-400">
              Hub Admin Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Enter your hub admin credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hubadmin@wytnet.com"
                  {...register("email")}
                  disabled={isLoading}
                  data-testid="input-email"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={isLoading}
                  data-testid="input-password"
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In to Hub Admin'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Hub Admin access for WytNet.com content management
              </p>
              <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
                Need super admin access? <Link href="/engine/login" className="text-blue-600 hover:underline">Go to Engine Admin</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Test Credentials: hubadmin@wytnet.com / hubadmin123
          </p>
        </div>
      </div>
    </div>
  );
}
