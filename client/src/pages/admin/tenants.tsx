import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminTenants() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tenant Management</h1>
        <p className="text-muted-foreground">Manage multi-tenant organizations</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>Multi-tenant organization management</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Tenant management interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
