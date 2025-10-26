
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, Info, AlertTriangle, XCircle, Filter, Download } from "lucide-react";

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

export default function AllLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;

  const { data: logsData, isLoading } = useQuery<{
    logs: AuditLog[];
    total: number;
    limit: number;
    offset: number;
  }>({
    queryKey: [
      '/api/admin/audit-logs',
      {
        search: searchTerm || undefined,
        action: actionFilter === 'all' ? undefined : actionFilter,
        resource: resourceFilter === 'all' ? undefined : resourceFilter,
        limit: logsPerPage,
        offset: (currentPage - 1) * logsPerPage
      }
    ],
  });

  const logs = logsData?.logs || [];
  const totalLogs = logsData?.total || 0;
  const totalPages = Math.ceil(totalLogs / logsPerPage);

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

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (actionFilter && actionFilter !== 'all') params.append('action', actionFilter);
    if (resourceFilter && resourceFilter !== 'all') params.append('resource', resourceFilter);
    params.append('format', 'csv');

    window.open(`/api/admin/audit-logs/export?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All System Logs</h1>
          <p className="text-muted-foreground">Comprehensive audit trail of all platform activities</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={(value) => {
              setActionFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={(value) => {
              setResourceFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
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
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Activity Logs
          </CardTitle>
          <CardDescription>
            Showing {Math.min((currentPage - 1) * logsPerPage + 1, totalLogs)} to {Math.min(currentPage * logsPerPage, totalLogs)} of {totalLogs.toLocaleString()} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No logs found matching your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getActionBadge(log.action) as any} className="text-xs">
                        {log.action}
                      </Badge>
                      <span className="text-sm font-medium">{log.resource}</span>
                      {log.resourceId && (
                        <span className="text-xs text-muted-foreground">
                          ({log.resourceId})
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">User:</span>
                        {log.user?.name || log.userId || 'System'}
                      </span>
                      {log.ipAddress && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">IP:</span>
                          <span className="font-mono">{log.ipAddress}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Time:</span>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    {log.details && Object.keys(log.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
