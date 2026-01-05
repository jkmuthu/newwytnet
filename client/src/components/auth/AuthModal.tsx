import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Mail, Sparkles, X } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const otpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
});

const verifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type OTPFormData = z.infer<typeof otpSchema>;
type VerifyOTPFormData = z.infer<typeof verifyOtpSchema>;

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  onSuccess?: () => void;
  returnPath?: string;
  hubSlug?: string;
}

export default function AuthModal({ 
  open, 
  onClose, 
  defaultTab = "login", 
  onSuccess,
  returnPath,
  hubSlug 
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpName, setOtpName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: "", name: "" },
  });

  const verifyOtpForm = useForm<VerifyOTPFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("/api/auth/login", "POST", data);
      return response.json();
    },
    onSuccess: (userData) => {
      toast({ title: "Welcome back!", description: `Signed in as ${userData.name}` });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({ title: "Login failed", description: error.message || "Invalid email or password", variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await apiRequest("/api/auth/register", "POST", data);
      return response.json();
    },
    onSuccess: (userData) => {
      toast({ title: "Welcome!", description: `Account created for ${userData.name}` });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({ title: "Registration failed", description: error.message || "Unable to create account", variant: "destructive" });
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (data: OTPFormData) => {
      const response = await apiRequest("/api/auth/send-email-otp", "POST", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      setOtpSent(true);
      setOtpEmail(variables.email);
      setOtpName(variables.name || "");
      toast({ title: "OTP Sent", description: `Verification code sent to ${variables.email}` });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send OTP", description: error.message, variant: "destructive" });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: VerifyOTPFormData) => {
      const response = await apiRequest("/api/auth/verify-email-otp", "POST", {
        email: otpEmail,
        otp: data.otp,
        name: otpName,
      });
      return response.json();
    },
    onSuccess: (userData) => {
      toast({ title: "Verified!", description: `Welcome, ${userData.user?.name || "User"}!` });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({ title: "Verification failed", description: error.message || "Invalid OTP", variant: "destructive" });
    },
  });

  const handleGoogleLogin = () => {
    const redirectUrl = returnPath || (hubSlug ? `/h/${hubSlug}` : "/");
    sessionStorage.setItem("authReturnUrl", redirectUrl);
    window.location.href = "/api/auth/google";
  };

  const resetOtpFlow = () => {
    setOtpSent(false);
    setOtpEmail("");
    setOtpName("");
    verifyOtpForm.reset();
    otpForm.reset();
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending || sendOtpMutation.isPending || verifyOtpMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              WytPass
            </DialogTitle>
            <p className="text-indigo-100 text-sm">Universal Identity System</p>
          </DialogHeader>
        </div>

        <div className="p-6">
          {authMethod === "password" ? (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" data-testid="modal-tab-login">Sign In</TabsTrigger>
                <TabsTrigger value="register" data-testid="modal-tab-register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" data-testid="modal-input-email" {...field} />
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
                                placeholder="••••••••" 
                                data-testid="modal-input-password"
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading} data-testid="modal-button-login">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" data-testid="modal-input-name" {...field} />
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
                            <Input type="email" placeholder="your@email.com" data-testid="modal-input-reg-email" {...field} />
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
                            <Input type="password" placeholder="••••••••" data-testid="modal-input-reg-password" {...field} />
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
                            <Input type="password" placeholder="••••••••" data-testid="modal-input-confirm-password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading} data-testid="modal-button-register">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => { setAuthMethod("password"); resetOtpFlow(); }} className="mb-2">
                ← Back to password login
              </Button>
              
              {!otpSent ? (
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit((data) => sendOtpMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={otpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" data-testid="modal-otp-email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={otpForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name (for new accounts)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" data-testid="modal-otp-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...verifyOtpForm}>
                  <form onSubmit={verifyOtpForm.handleSubmit((data) => verifyOtpMutation.mutate(data))} className="space-y-4">
                    <p className="text-sm text-gray-600">Enter the 6-digit code sent to <strong>{otpEmail}</strong></p>
                    <FormField
                      control={verifyOtpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="000000" 
                              maxLength={6} 
                              className="text-center text-2xl tracking-widest"
                              data-testid="modal-otp-code"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify OTP"}
                    </Button>
                    <Button type="button" variant="ghost" className="w-full" onClick={resetOtpFlow}>
                      Use different email
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleGoogleLogin} className="gap-2" data-testid="modal-button-google">
                <SiGoogle className="h-4 w-4" />
                Google
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setAuthMethod(authMethod === "otp" ? "password" : "otp")}
                className="gap-2"
                data-testid="modal-button-otp"
              >
                <Mail className="h-4 w-4" />
                Email OTP
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
