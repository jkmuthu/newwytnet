import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User, Key, Mail, Pencil, CheckCircle, XCircle } from "lucide-react";

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
    </div>
  );
}
