import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Mail, Sparkles } from "lucide-react";
import { SiGoogle, SiFacebook, SiLinkedin } from "react-icons/si";
import { apiRequest } from "@/lib/queryClient";
import { getAndClearReturnUrl } from "@/lib/authUtils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  whatsappNumber: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function WytPassLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      whatsappNumber: "",
    },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/auth/login", "POST", data);
      const userData = await response.json();
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
      
      // Check for return URL and redirect
      const returnUrl = getAndClearReturnUrl();
      if (returnUrl) {
        setLocation(returnUrl);
      } else {
        window.location.href = "/";
      }
    } catch (error: any) {
      toast({
        title: "Login failed", 
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/auth/register", "POST", data);
      const userData = await response.json();
      
      toast({
        title: "Registration successful",
        description: `Welcome to WytNet, ${userData.name}!`,
      });
      
      // Check for return URL and redirect
      const returnUrl = getAndClearReturnUrl();
      if (returnUrl) {
        setLocation(returnUrl);
      } else {
        window.location.href = "/";
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Unable to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleEmailOTPLogin = () => {
    window.location.href = "/email-otp-login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* WytPass Header with Animation */}
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            WytPass
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
            Universal Identity & Validation System
          </p>
        </div>

        {/* Login/Register Card - Now First */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-800 shadow-2xl animate-slide-up">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="space-y-3">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 dark:bg-gray-800/50">
                <TabsTrigger 
                  value="login" 
                  data-testid="tab-login"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  data-testid="tab-register"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
                >
                  Register
                </TabsTrigger>
              </TabsList>
              <CardDescription className="text-center text-sm">
                {activeTab === "login" ? "Welcome back! Sign in to your account" : "Create your WytPass account"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <TabsContent value="login" className="space-y-4 animate-fade-in">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email"
                              data-testid="input-login-email"
                              className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                data-testid="input-login-password"
                                className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 pr-10"
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                data-testid="button-toggle-password"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300" 
                      disabled={isLoading}
                      data-testid="button-login-submit"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Sign In
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 animate-fade-in">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name"
                              data-testid="input-register-name"
                              className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email"
                              data-testid="input-register-email"
                              className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="whatsappNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp Number (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+91 9876543210"
                              data-testid="input-register-whatsapp"
                              className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="Create a password"
                              data-testid="input-register-password"
                              className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="Confirm your password"
                              data-testid="input-register-confirm-password"
                              className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300" 
                      disabled={isLoading}
                      data-testid="button-register-submit"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Create Account
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Separator */}
        <div className="relative animate-fade-in">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 text-gray-500 dark:text-gray-400 font-medium">
              Or continue with
            </span>
          </div>
        </div>

        {/* Quick Access Methods - Icon Grid */}
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 shadow-xl animate-slide-up animation-delay-100">
          <CardContent className="pt-6 pb-6">
            <div className="grid grid-cols-4 gap-4">
              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-300 transform hover:scale-110 group"
                data-testid="button-google-login"
              >
                <SiGoogle className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 font-medium">Google</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => window.location.href = "/api/auth/facebook"}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#1877F2] dark:hover:border-[#1877F2] hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-300 transform hover:scale-110 group"
                data-testid="button-facebook-login"
              >
                <SiFacebook className="h-8 w-8 text-[#1877F2] group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 font-medium">Facebook</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => window.location.href = "/api/auth/linkedin"}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#0A66C2] dark:hover:border-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-300 transform hover:scale-110 group"
                data-testid="button-linkedin-login"
              >
                <SiLinkedin className="h-8 w-8 text-[#0A66C2] group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 font-medium">LinkedIn</span>
              </button>

              {/* Email OTP */}
              <button
                onClick={handleEmailOTPLogin}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-300 transform hover:scale-110 group"
                data-testid="button-email-otp"
              >
                <Mail className="h-8 w-8 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 font-medium">Email</span>
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
              Secured by <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">WytPass</span> • Universal Identity & Validation
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 animate-fade-in animation-delay-200">
          <p>
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
