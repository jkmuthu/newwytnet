import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog } from "lucide-react";

export default function AdminAdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Users</h1>
        <p className="text-muted-foreground">Manage administrative user accounts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Admin Accounts
          </CardTitle>
          <CardDescription>View and manage admin user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Admin user management interface coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
