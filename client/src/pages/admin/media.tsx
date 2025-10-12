import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

export default function AdminMedia() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Media Management</h1>
        <p className="text-muted-foreground">Manage all media files and assets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Media Library
          </CardTitle>
          <CardDescription>View and manage all media files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Media management interface coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
