import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Database, RefreshCw, Loader2, AlertTriangle, Play } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HealthCheckResult {
  table: string;
  count: number;
  status: 'populated' | 'empty' | 'error';
}

interface HealthCheckResponse {
  success: boolean;
  summary: {
    total: number;
    populated: number;
    empty: number;
    errors: number;
    needsReseeding: boolean;
  };
  tables: HealthCheckResult[];
}

interface SeedingResult {
  service: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  duration?: number;
}

interface ReseedResponse {
  success: boolean;
  message: string;
  summary: {
    total: number;
    success: number;
    errors: number;
    totalDuration: number;
  };
  results: SeedingResult[];
}

export default function AdminDatabaseSync() {
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [lastReseedResult, setLastReseedResult] = useState<ReseedResponse | null>(null);

  const healthQuery = useQuery<HealthCheckResponse>({
    queryKey: ['/api/admin/reseed/health'],
    refetchInterval: 60000,
  });

  const reseedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/admin/reseed', 'POST');
      return await response.json() as ReseedResponse;
    },
    onSuccess: (data) => {
      setLastReseedResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reseed/health'] });
      toast({
        title: data.success ? "Re-seeding Complete" : "Re-seeding Completed with Errors",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Re-seeding Failed",
        description: error.message || "An error occurred during re-seeding",
        variant: "destructive",
      });
    },
  });

  const handleReseed = () => {
    setShowConfirmDialog(false);
    reseedMutation.mutate();
  };

  const getStatusBadge = (status: 'populated' | 'empty' | 'error') => {
    switch (status) {
      case 'populated':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Populated</Badge>;
      case 'empty':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Empty</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Error</Badge>;
    }
  };

  const getResultBadge = (status: 'success' | 'error' | 'skipped') => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Error</Badge>;
      case 'skipped':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Skipped</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Database Sync & Re-seeding</CardTitle>
                <CardDescription>
                  Synchronize master data between development and production databases
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => healthQuery.refetch()}
              disabled={healthQuery.isFetching}
              data-testid="btn-refresh-health"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${healthQuery.isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {healthQuery.data?.summary?.needsReseeding && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Database Sync Required</AlertTitle>
              <AlertDescription>
                Some database tables are empty or have errors. Click "Re-seed All" to populate missing data.
                This is common after a fresh production deployment.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              {healthQuery.data?.summary && (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{healthQuery.data.summary.populated} Populated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">{healthQuery.data.summary.empty} Empty</span>
                  </div>
                  {healthQuery.data.summary.errors > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">{healthQuery.data.summary.errors} Errors</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={reseedMutation.isPending}
              data-testid="btn-reseed-all"
            >
              {reseedMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Re-seeding...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Re-seed All
                </>
              )}
            </Button>
          </div>

          {healthQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Checking database health...</span>
            </div>
          ) : healthQuery.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to check database health. Please try again.</AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Table</th>
                    <th className="text-left p-3 font-medium">Records</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {healthQuery.data?.tables.map((table) => (
                    <tr key={table.table} className="hover:bg-muted/30">
                      <td className="p-3 font-mono text-sm">{table.table}</td>
                      <td className="p-3">{table.count}</td>
                      <td className="p-3">{getStatusBadge(table.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {lastReseedResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastReseedResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              Last Re-seed Result
            </CardTitle>
            <CardDescription>
              Completed in {(lastReseedResult.summary.totalDuration / 1000).toFixed(2)}s - 
              {lastReseedResult.summary.success} success, {lastReseedResult.summary.errors} errors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Service</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Duration</th>
                    <th className="text-left p-3 font-medium">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lastReseedResult.results.map((result, index) => (
                    <tr key={index} className="hover:bg-muted/30">
                      <td className="p-3 font-medium">{result.service}</td>
                      <td className="p-3">{getResultBadge(result.status)}</td>
                      <td className="p-3">{result.duration ? `${result.duration}ms` : '-'}</td>
                      <td className="p-3 text-sm text-muted-foreground">{result.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Re-seeding</DialogTitle>
            <DialogDescription>
              This will re-run all seeding services to populate master data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Navigation Menus</li>
                <li>Platform Settings</li>
                <li>Platform Integrations</li>
                <li>Platform Themes</li>
                <li>Platform Hubs</li>
                <li>Permissions & Roles</li>
                <li>Modules & Entities</li>
              </ul>
              <p className="mt-3">
                This operation is safe and will only insert missing data or update existing records.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReseed} data-testid="btn-confirm-reseed">
              <Play className="h-4 w-4 mr-2" />
              Start Re-seeding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
