import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive } from "lucide-react";

export default function AdminBackups() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Backups</h1>
        <p className="text-muted-foreground">Manage system backups and restoration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backup Management
          </CardTitle>
          <CardDescription>Create and restore system backups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Backup management interface coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
