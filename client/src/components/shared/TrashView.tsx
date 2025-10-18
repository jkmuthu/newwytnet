import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface TrashItem {
  id: string;
  deletedAt: string | null;
  deletedBy: string | null;
  deleteReason: string | null;
  [key: string]: any;
}

interface TrashViewProps<T extends TrashItem> {
  items: T[];
  entityType: string;
  isLoading: boolean;
  onRestore: (id: string) => Promise<void>;
  onPermanentDelete: (id: string) => Promise<void>;
  renderItemName: (item: T) => string;
  renderItemDetails?: (item: T) => React.ReactNode;
}

export function TrashView<T extends TrashItem>({
  items,
  entityType,
  isLoading,
  onRestore,
  onPermanentDelete,
  renderItemName,
  renderItemDetails,
}: TrashViewProps<T>) {
  const { toast } = useToast();
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const getDaysUntilPermanentDeletion = (deletedAt: string | null) => {
    if (!deletedAt) return null;
    
    const deleted = new Date(deletedAt);
    const permanent = new Date(deleted.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
    const now = new Date();
    const daysLeft = Math.ceil((permanent.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    
    return { daysLeft, permanentDate: permanent };
  };

  const handleRestore = async (item: T) => {
    setRestoring(item.id);
    try {
      await onRestore(item.id);
    } catch (error) {
      toast({
        title: "Restore failed",
        description: error instanceof Error ? error.message : "Failed to restore item",
        variant: "destructive",
      });
    } finally {
      setRestoring(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedItem) return;
    
    setDeleting(selectedItem.id);
    try {
      await onPermanentDelete(selectedItem.id);
      setShowDeleteDialog(false);
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const openDeleteDialog = (item: T) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-trash-title">Trash</CardTitle>
          <CardDescription>Loading deleted {entityType}...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-trash-title">Trash</CardTitle>
          <CardDescription>No deleted {entityType} found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Trash2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Deleted {entityType} will appear here and be automatically removed after 90 days.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-trash-title">Trash</CardTitle>
          <CardDescription>
            {items.length} deleted {entityType}. Items are automatically permanently deleted after 90 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  {renderItemDetails && <TableHead>Details</TableHead>}
                  <TableHead>Deleted By</TableHead>
                  <TableHead>Deleted</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Auto-Delete In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const deletionInfo = getDaysUntilPermanentDeletion(item.deletedAt);
                  const isRestoringThis = restoring === item.id;
                  const isDeletingThis = deleting === item.id;
                  
                  return (
                    <TableRow key={item.id} data-testid={`row-trash-item-${item.id}`}>
                      <TableCell className="font-medium" data-testid={`text-item-name-${item.id}`}>
                        {renderItemName(item)}
                      </TableCell>
                      {renderItemDetails && (
                        <TableCell>{renderItemDetails(item)}</TableCell>
                      )}
                      <TableCell data-testid={`text-deleted-by-${item.id}`}>
                        {item.deletedBy || 'Unknown'}
                      </TableCell>
                      <TableCell data-testid={`text-deleted-at-${item.id}`}>
                        {item.deletedAt
                          ? formatDistanceToNow(new Date(item.deletedAt), { addSuffix: true })
                          : 'Unknown'}
                      </TableCell>
                      <TableCell data-testid={`text-delete-reason-${item.id}`}>
                        {item.deleteReason || (
                          <span className="text-muted-foreground text-sm">No reason provided</span>
                        )}
                      </TableCell>
                      <TableCell data-testid={`text-auto-delete-${item.id}`}>
                        {deletionInfo && (
                          <div>
                            {deletionInfo.daysLeft > 0 ? (
                              <Badge variant={deletionInfo.daysLeft <= 7 ? "destructive" : "secondary"}>
                                {deletionInfo.daysLeft} days
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Pending deletion</Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(item)}
                            disabled={isRestoringThis || isDeletingThis}
                            data-testid={`button-restore-${item.id}`}
                          >
                            <RefreshCw className={`h-4 w-4 mr-1 ${isRestoringThis ? 'animate-spin' : ''}`} />
                            {isRestoringThis ? 'Restoring...' : 'Restore'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(item)}
                            disabled={isRestoringThis || isDeletingThis}
                            data-testid={`button-delete-permanent-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete Permanently
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Permanently Delete {entityType}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <strong>{selectedItem && renderItemName(selectedItem)}</strong> and remove all associated data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              disabled={!!deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleting ? 'Deleting...' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
