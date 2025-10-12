import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminRolesPermissions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Roles & Permissions</h1>
        <p className="text-muted-foreground">Manage user roles and access control</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Access Control
          </CardTitle>
          <CardDescription>Configure roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Roles and permissions management interface coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
