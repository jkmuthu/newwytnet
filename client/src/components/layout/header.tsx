import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Menu, Search, User, Settings, LogOut, LogIn, UserPlus, Home, Activity, Building, Briefcase, QrCode, Bot, BarChart, Brain } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  company: z.string().optional(),
});

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      company: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      return apiRequest('/api/auth/login', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLoginOpen(false);
      loginForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof registerSchema>) => {
      return apiRequest('/api/auth/register', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setRegisterOpen(false);
      registerForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/auth/logout', 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      // Refresh the page to reset state
      window.location.reload();
    },
  });

  const handleLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const handleRegister = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserInitials = (user: any) => {
    if (!user) return 'U';
    const firstInitial = user?.firstName?.[0] || '';
    const lastInitial = user?.lastName?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img 
                      src="/wytnet-logo.png" 
                      alt="WytNet" 
                      className="h-6 w-auto"
                    />
                    WytNet
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-2">
                  <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                  <Link href="/assessment" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Activity className="h-5 w-5" />
                    <span>Assessment</span>
                  </Link>
                  <Link href="/realbro" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Building className="h-5 w-5" />
                    <span>RealBro</span>
                  </Link>
                  <Link href="/wytduty" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Briefcase className="h-5 w-5" />
                    <span>WytDuty</span>
                  </Link>
                  <Link href="/qr-generator" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <QrCode className="h-5 w-5" />
                    <span>QR Generator</span>
                  </Link>
                  <Link href="/ai-directory" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                    <Bot className="h-5 w-5" />
                    <span>AI Directory</span>
                  </Link>
                  <Link href="/wytai-trademark" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700" onClick={() => setMobileMenuOpen(false)}>
                    <Brain className="h-5 w-5" />
                    <span>WytAi Trademark</span>
                  </Link>
                  {isAuthenticated && (
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
                      <BarChart className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            {onMenuClick && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMenuClick}
                className="lg:hidden"
                data-testid="button-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center" data-testid="link-logo">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">W</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    WytNet
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Center section - Public Navigation */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <nav className="flex items-center justify-center space-x-6">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium" data-testid="nav-home">
                Home
              </Link>
              <Link href="/assessment" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium" data-testid="nav-assessment">
                Assessment
              </Link>
              <Link href="/realbro" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium" data-testid="nav-realbro">
                RealBro
              </Link>
              <Link href="/wytduty" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium" data-testid="nav-wytduty">
                WytDuty
              </Link>
              <Link href="/qr-generator" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium" data-testid="nav-qr-generator">
                QR Generator
              </Link>
              <Link href="/ai-directory" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium" data-testid="nav-ai-directory">
                AI Directory
              </Link>
              <Link href="/wytai-trademark" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-md border border-blue-200 dark:border-blue-700" data-testid="nav-wytai-trademark">
                WytAi Trademark
              </Link>
              {isAuthenticated && (
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium" data-testid="nav-dashboard">
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium" data-testid="text-user-name">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-gray-500 text-xs" data-testid="text-user-email">
                      {user?.email}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="menu-item-profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="menu-item-settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-item-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-enter" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <LogIn className="h-4 w-4 mr-2" />
                      Enter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Log In</DialogTitle>
                      <DialogDescription>
                        Sign in to your WytNet account
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="your.email@example.com" {...field} data-testid="input-login-email" />
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
                                <Input type="password" placeholder="Your password" {...field} data-testid="input-login-password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setLoginOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={loginMutation.isPending} data-testid="button-submit-login">
                            {loginMutation.isPending ? "Signing in..." : "Sign In"}
                          </Button>
                        </div>
                        <div className="pt-4 text-center border-t mt-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            Don't have an account?
                          </p>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setLoginOpen(false);
                              setRegisterOpen(true);
                            }}
                            data-testid="button-switch-to-register"
                            className="w-full"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create Account
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                  <DialogTrigger></DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create Account</DialogTitle>
                      <DialogDescription>
                        Join WytNet to start building amazing applications
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} data-testid="input-register-firstname" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} data-testid="input-register-lastname" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="your.email@example.com" {...field} data-testid="input-register-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Company" {...field} data-testid="input-register-company" />
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
                                <Input type="password" placeholder="At least 6 characters" {...field} data-testid="input-register-password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setRegisterOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={registerMutation.isPending} data-testid="button-submit-register">
                            {registerMutation.isPending ? "Creating..." : "Create Account"}
                          </Button>
                        </div>
                        <div className="pt-4 text-center border-t mt-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            Already have an account?
                          </p>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setRegisterOpen(false);
                              setLoginOpen(true);
                            }}
                            data-testid="button-switch-to-login"
                            className="w-full"
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Sign In
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
