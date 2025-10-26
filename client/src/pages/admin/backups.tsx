import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HardDrive, Download, Trash2, Plus, Loader2, Database, FileArchive, Key, RotateCcw, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Backup } from "@shared/schema";

export default function AdminBackups() {
  const { toast } = useToast();
  const [deleteBackupId, setDeleteBackupId] = useState<string | null>(null);
  const [restoreBackupId, setRestoreBackupId] = useState<string | null>(null);
  const [restoreConfirmed, setRestoreConfirmed] = useState(false);

  // Fetch all backups
  const { data: backups = [], isLoading } = useQuery<Backup[]>({
    queryKey: ["/api/admin/backup/list"],
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/backup/create", "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "Backup Created",
        description: "Full system backup has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backup/list"] });
    },
    onError: (error: any) => {
      toast({
        title: "Backup Failed",
        description: error.message || "Failed to create backup",
        variant: "destructive",
      });
    },
  });

  // Delete backup mutation
  const deleteBackupMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/backup/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Backup Deleted",
        description: "Backup has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backup/list"] });
      setDeleteBackupId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete backup",
        variant: "destructive",
      });
    },
  });

  // Restore backup mutation
  const restoreBackupMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/backup/restore/${id}`, "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "Backup Restored",
        description: "System has been restored from backup successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backup/list"] });
      setRestoreBackupId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Restore Failed",
        description: error.message || "Failed to restore backup",
        variant: "destructive",
      });
    },
  });

  const handleDownload = (backup: Backup) => {
    // Download via direct link
    window.location.href = `/api/admin/backup/download/${backup.id}`;
    toast({
      title: "Download Started",
      description: `Downloading ${backup.filename}`,
    });
  };

  const handleDelete = (id: string) => {
    setDeleteBackupId(id);
  };

  const handleRestore = (id: string) => {
    setRestoreBackupId(id);
    setRestoreConfirmed(false);
  };

  const confirmDelete = () => {
    if (deleteBackupId) {
      deleteBackupMutation.mutate(deleteBackupId);
    }
  };

  const confirmRestore = () => {
    if (restoreBackupId && restoreConfirmed) {
      restoreBackupMutation.mutate(restoreBackupId);
    }
  };

  const closeRestoreDialog = () => {
    setRestoreBackupId(null);
    setRestoreConfirmed(false);
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBackupTypeIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'files':
        return <FileArchive className="h-4 w-4" />;
      case 'credentials':
        return <Key className="h-4 w-4" />;
      default:
        return <HardDrive className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: { variant: "default" as const, label: "Completed" },
      pending: { variant: "secondary" as const, label: "Pending" },
      in_progress: { variant: "outline" as const, label: "In Progress" },
      failed: { variant: "destructive" as const, label: "Failed" },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Backup Management</h1>
          <p className="text-muted-foreground">Create and manage full system backups</p>
        </div>
        <Button
          onClick={() => createBackupMutation.mutate()}
          disabled={createBackupMutation.isPending}
          data-testid="button-create-backup"
        >
          {createBackupMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Backup...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Full Backup
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup Information</CardTitle>
          <CardDescription>
            Full backups include: PostgreSQL database export, all application files (server, client, shared), 
            and a credentials file with all usernames, passwords, and API keys
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Database className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Database Export</p>
              <p className="text-xs text-muted-foreground">Complete PostgreSQL dump</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <FileArchive className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm font-medium">Application Files</p>
              <p className="text-xs text-muted-foreground">Server, client, configs & uploaded assets</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Key className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Credentials File</p>
              <p className="text-xs text-muted-foreground">All usernames, passwords & API keys</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>View and manage all system backups</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No backups found. Create your first backup to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Display ID</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id} data-testid={`row-backup-${backup.id}`}>
                      <TableCell className="font-medium" data-testid={`text-displayid-${backup.id}`}>
                        {backup.displayId}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" data-testid={`text-filename-${backup.id}`}>
                        {backup.filename}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getBackupTypeIcon(backup.backupType)}
                          <span className="capitalize">{backup.backupType}</span>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-filesize-${backup.id}`}>
                        {formatFileSize(backup.fileSize)}
                      </TableCell>
                      <TableCell>{getStatusBadge(backup.status)}</TableCell>
                      <TableCell data-testid={`text-created-${backup.id}`}>
                        {formatDate(backup.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(backup)}
                            data-testid={`button-download-${backup.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRestore(backup.id)}
                            disabled={backup.status !== 'completed'}
                            data-testid={`button-restore-${backup.id}`}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(backup.id)}
                            data-testid={`button-delete-${backup.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteBackupId} onOpenChange={(open) => !open && setDeleteBackupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this backup? This action cannot be undone.
              The backup file will be permanently removed from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!restoreBackupId} onOpenChange={(open) => !open && closeRestoreDialog()}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              Critical: Restore Backup
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                <p className="font-semibold text-amber-800 dark:text-amber-400 mb-2">
                  ⚠️ This is a destructive operation that will:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Replace the entire database with the backup version</li>
                  <li>Permanently overwrite all current data</li>
                  <li>Disconnect all active user sessions immediately</li>
                  <li>Cause system downtime during the restore process</li>
                  <li>Cannot be undone once started</li>
                </ul>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="font-semibold text-red-800 dark:text-red-400 mb-1">
                  🛑 Before proceeding:
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Ensure you have created a current backup of the live system. Any data created after the selected backup will be permanently lost.
                </p>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="restore-confirm"
                  checked={restoreConfirmed}
                  onCheckedChange={(checked) => setRestoreConfirmed(checked === true)}
                  data-testid="checkbox-restore-confirm"
                />
                <label
                  htmlFor="restore-confirm"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I understand this will overwrite all current data and disconnect all users. I have backed up the current system.
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeRestoreDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRestore}
              disabled={!restoreConfirmed || restoreBackupMutation.isPending}
              className="bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
              data-testid="button-confirm-restore"
            >
              {restoreBackupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring System...
                </>
              ) : (
                "Restore Backup"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
