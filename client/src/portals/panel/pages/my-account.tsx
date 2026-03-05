import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User, Key, Mail, Pencil, CheckCircle, XCircle, Globe, Lock, Eye, MessageSquare } from "lucide-react";

interface UserProfile {
  username?: string;
}

export default function MyAccount() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Username form state
  const [newUsername, setNewUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch user profile
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/account/profile"],
  });

  // Fetch privacy settings
  const { data: privacyData, isLoading: privacyLoading } = useQuery({
    queryKey: ["/api/account/privacy"],
  });

  const privacy = (privacyData as any)?.privacy || { profile: 'private', wytwall: 'private' };

  // Update privacy mutation
  const updatePrivacyMutation = useMutation({
    mutationFn: async (settings: { profile?: string; wytwall?: string }) => {
      return await apiRequest("/api/account/privacy", "PATCH", settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/account/privacy"] });
      toast({ title: "Privacy updated", description: "Your visibility settings have been saved." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update privacy", variant: "destructive" });
    },
  });

  // Username availability check with debounce
  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(`/api/account/username/check?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Change username mutation
  const changeUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      return await apiRequest("/api/account/username", "PATCH", { username });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Username updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/account/profile"] });
      setUsernameDialogOpen(false);
      setNewUsername("");
      setUsernameAvailable(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
    },
  });

  // Change password mutation (set or update password)
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { newPassword: string }) => {
      return await apiRequest("/api/account/password", "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setPasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  const handleUsernameSubmit = () => {
    if (!newUsername || newUsername.length < 3) {
      toast({
        title: "Error",
        description: "Username must be at least 3 characters",
        variant: "destructive",
      });
      return;
    }

    if (!usernameAvailable) {
      toast({
        title: "Error",
        description: "This username is not available",
        variant: "destructive",
      });
      return;
    }

    changeUsernameMutation.mutate(newUsername);
  };

  const handlePasswordSubmit = () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({ newPassword });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Account</h1>
        <p className="text-muted-foreground mt-2">Manage your account credentials and security</p>
      </div>

      {/* Username Section */}
      <Card data-testid="card-username-section">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Username</CardTitle>
          </div>
          <CardDescription>Current username</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="text-lg font-medium" data-testid="text-current-username">
                {profile?.username || "Not set"}
              </p>
            </div>
            <Dialog open={usernameDialogOpen} onOpenChange={setUsernameDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-change-username">
                  <Pencil className="h-4 w-4 mr-2" />
                  Change Username
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Username</DialogTitle>
                  <DialogDescription>
                    Choose a unique username for your account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-username">New Username</Label>
                    <Input
                      id="new-username"
                      value={newUsername}
                      onChange={(e) => {
                        setNewUsername(e.target.value);
                        checkUsername(e.target.value);
                      }}
                      placeholder="Enter new username"
                      data-testid="input-new-username"
                    />
                    {checkingUsername && (
                      <p className="text-sm text-muted-foreground">Checking availability...</p>
                    )}
                    {usernameAvailable === true && newUsername.length >= 3 && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Username is available
                      </p>
                    )}
                    {usernameAvailable === false && newUsername.length >= 3 && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Username is already taken
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleUsernameSubmit} 
                    disabled={changeUsernameMutation.isPending || !usernameAvailable}
                    data-testid="button-save-username"
                  >
                    {changeUsernameMutation.isPending ? "Saving..." : "Save Username"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card data-testid="card-password-section">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>Password</CardTitle>
          </div>
          <CardDescription>Password</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Password</p>
              <p className="text-lg font-medium">••••••••</p>
            </div>
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-change-password">
                  <Pencil className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Password</DialogTitle>
                  <DialogDescription>
                    Set a password to login with your username instead of social login
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      data-testid="input-new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      data-testid="input-confirm-password"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handlePasswordSubmit} 
                    disabled={changePasswordMutation.isPending}
                    data-testid="button-save-password"
                  >
                    {changePasswordMutation.isPending ? "Saving..." : "Set Password"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Email Section */}
      <Card data-testid="card-email-section">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Address</CardTitle>
          </div>
          <CardDescription>Your email address</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-lg font-medium" data-testid="text-email">
              {(user as any)?.email || "Not available"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Visibility Section */}
      <Card data-testid="card-privacy-section">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <CardTitle>Privacy &amp; Visibility</CardTitle>
          </div>
          <CardDescription>
            Control who can see your profile and activity on WytNet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {privacyLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
                  </div>
                  <div className="h-6 w-11 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Public Profile toggle */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-0.5 p-1.5 rounded-lg ${privacy.profile === 'public' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {privacy.profile === 'public'
                      ? <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
                      : <Lock className="h-4 w-4 text-gray-400" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">Public Profile</p>
                      <Badge
                        variant={privacy.profile === 'public' ? 'default' : 'secondary'}
                        className={`text-xs px-1.5 py-0 ${privacy.profile === 'public' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200' : ''}`}
                      >
                        {privacy.profile === 'public' ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {privacy.profile === 'public'
                        ? `Anyone can view your profile at wytnet.com/u/${(profile as any)?.username || 'your-username'}`
                        : 'Your profile page is hidden from the public'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={privacy.profile === 'public'}
                  onCheckedChange={(checked) =>
                    updatePrivacyMutation.mutate({ profile: checked ? 'public' : 'private' })
                  }
                  disabled={updatePrivacyMutation.isPending}
                  data-testid="toggle-profile-visibility"
                />
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800" />

              {/* WytWall toggle */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-0.5 p-1.5 rounded-lg ${privacy.wytwall === 'public' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <MessageSquare className={`h-4 w-4 ${privacy.wytwall === 'public' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">WytWall Posts</p>
                      <Badge
                        variant={privacy.wytwall === 'public' ? 'default' : 'secondary'}
                        className={`text-xs px-1.5 py-0 ${privacy.wytwall === 'public' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200' : ''}`}
                      >
                        {privacy.wytwall === 'public' ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {privacy.wytwall === 'public'
                        ? 'Your WytWall posts are visible to everyone'
                        : 'Your WytWall posts are only visible to you and your connections'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={privacy.wytwall === 'public'}
                  onCheckedChange={(checked) =>
                    updatePrivacyMutation.mutate({ wytwall: checked ? 'public' : 'private' })
                  }
                  disabled={updatePrivacyMutation.isPending}
                  data-testid="toggle-wytwall-visibility"
                />
              </div>

              <p className="text-xs text-muted-foreground pt-1">
                More visibility controls coming soon — WytApps, WytHubs, and more.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
