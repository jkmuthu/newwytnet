import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AdminSystemStatus() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Status</h1>
        <p className="text-muted-foreground">Platform health and status dashboard</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Status Dashboard
          </CardTitle>
          <CardDescription>View platform health and uptime</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            System status dashboard coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
