import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage all users across tenants</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Complete user management system</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User management interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
