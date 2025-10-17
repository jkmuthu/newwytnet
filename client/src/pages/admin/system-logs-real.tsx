import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Search, Filter, AlertCircle, Info, AlertTriangle, XCircle } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  userId: string | null;
  user?: {
    name: string;
    email: string;
  };
}

export default function AdminSystemLogsReal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['/api/admin/audit-logs', { search: searchTerm, action: actionFilter, resource: resourceFilter }],
  });

  const logs = ((logsData as any)?.logs || []) as AuditLog[];

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return <Info className="h-4 w-4 text-blue-500" />;
    if (action.includes('update')) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (action.includes('delete')) return <XCircle className="h-4 w-4 text-red-500" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const getActionBadge = (action: string) => {
    if (action.includes('create')) return 'default';
    if (action.includes('update')) return 'secondary';
    if (action.includes('delete')) return 'destructive';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Logs</h1>
        <p className="text-muted-foreground">View all system activity and audit trails</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-logs"
            />
          </div>
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-action-filter">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-resource-filter">
            <SelectValue placeholder="Filter by resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="users">Users</SelectItem>
            <SelectItem value="modules">Modules</SelectItem>
            <SelectItem value="apps">Apps</SelectItem>
            <SelectItem value="hubs">Hubs</SelectItem>
            <SelectItem value="themes">Themes</SelectItem>
            <SelectItem value="integrations">Integrations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No logs found</div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`log-entry-${log.id}`}
                >
                  {getActionIcon(log.action)}
                  <span className="text-sm text-muted-foreground min-w-[80px]">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                  <Badge variant={getActionBadge(log.action) as any}>
                    {log.action}
                  </Badge>
                  <span className="text-sm flex-1">
                    {log.resource} {log.resourceId && `(${log.resourceId})`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {log.user?.name || log.userId || 'System'}
                  </span>
                  {log.ipAddress && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {log.ipAddress}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
