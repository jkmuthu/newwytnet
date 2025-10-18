import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Shield, Settings, Upload } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Redirect } from "wouter";
import { useEffect } from "react";

// Schema for profile update
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  profileImageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

// Schema for password update
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Schema for preferences
const preferencesSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
});

interface User {
  id: string;
  name: string | null;
  email: string | null;
  profileImageUrl: string | null;
}

export default function MyAccountPage() {
  const { toast } = useToast();

  // Fetch current user (use /api/auth/user, not /api/user)
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  // Profile form - use defaultValues instead of values to prevent reset on every render
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      profileImageUrl: "",
    },
  });

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Preferences form
  const preferencesForm = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      theme: "system" as const,
    },
  });

  // Update form values when user data loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        email: user.email || "",
        profileImageUrl: user.profileImageUrl || "",
      });
    }
  }, [user, profileForm]);

  // Update profile mutation
  const profileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      return await apiRequest("/api/account/profile", "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      return await apiRequest("/api/account/password", "PATCH", data);
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update password. Please check your current password.",
        variant: "destructive",
      });
    },
  });

  // Update preferences mutation (client-side only for now - stored in localStorage)
  const preferencesMutation = useMutation({
    mutationFn: async (data: z.infer<typeof preferencesSchema>) => {
      // Store preferences in localStorage for now
      localStorage.setItem('user_preferences', JSON.stringify(data));
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved locally.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Show loading state
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated (after all hooks)
  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" data-testid="tab-preferences">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account's profile information and avatar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="text-2xl">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label htmlFor="profileImageUrl">Profile Photo URL</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="profileImageUrl"
                        placeholder="https://example.com/avatar.jpg"
                        {...profileForm.register("profileImageUrl")}
                        data-testid="input-avatar-url"
                      />
                      <Button variant="outline" size="icon" data-testid="button-upload-avatar">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    {profileForm.formState.errors.profileImageUrl && (
                      <p className="text-sm text-destructive mt-1">
                        {profileForm.formState.errors.profileImageUrl.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Profile Form */}
                <form onSubmit={profileForm.handleSubmit((data) => profileMutation.mutate(data))} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...profileForm.register("name")}
                      data-testid="input-name"
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register("email")}
                      data-testid="input-email"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={profileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {profileMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Ensure your account is using a strong password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit((data) => passwordMutation.mutate(data))} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...passwordForm.register("currentPassword")}
                      data-testid="input-current-password"
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register("newPassword")}
                      data-testid="input-new-password"
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register("confirmPassword")}
                      data-testid="input-confirm-password"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={passwordMutation.isPending}
                    data-testid="button-change-password"
                  >
                    {passwordMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Account Preferences</CardTitle>
                <CardDescription>
                  Manage your notification and display preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={preferencesForm.handleSubmit((data) => preferencesMutation.mutate(data))} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailNotifications" className="cursor-pointer">
                          Email Notifications
                        </Label>
                        <input
                          id="emailNotifications"
                          type="checkbox"
                          {...preferencesForm.register("emailNotifications")}
                          className="h-4 w-4"
                          data-testid="checkbox-email-notifications"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pushNotifications" className="cursor-pointer">
                          Push Notifications
                        </Label>
                        <input
                          id="pushNotifications"
                          type="checkbox"
                          {...preferencesForm.register("pushNotifications")}
                          className="h-4 w-4"
                          data-testid="checkbox-push-notifications"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Appearance</h3>
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <select
                        id="theme"
                        {...preferencesForm.register("theme")}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        data-testid="select-theme"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={preferencesMutation.isPending}
                    data-testid="button-save-preferences"
                  >
                    {preferencesMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Preferences
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
