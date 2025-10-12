import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeadphonesIcon } from "lucide-react";

export default function AdminHelpSupport() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">Manage support tickets and help resources</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeadphonesIcon className="h-5 w-5" />
            Support Center
          </CardTitle>
          <CardDescription>View and manage support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Help and support management interface coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
