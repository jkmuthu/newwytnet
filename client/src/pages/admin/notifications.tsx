import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, BellOff, Check, CheckCheck, Trash2, AlertCircle, Info, CheckCircle, AlertTriangle, Plus, Send, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  metadata: Record<string, any>;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  unreadCount: number;
}

export default function AdminNotifications() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    type: "info",
    title: "",
    message: "",
    link: "",
    broadcast: true,
  });

  const { data, isLoading, refetch } = useQuery<NotificationsResponse>({
    queryKey: ['/api/admin/notifications'],
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const totalCount = data?.pagination?.total || 0;

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/notifications/mark-all-read', 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/notifications/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      toast({
        title: "Deleted",
        description: "Notification deleted successfully",
      });
    },
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/admin/notifications', 'POST', data);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      toast({
        title: "Success",
        description: response.message || "Notification sent successfully",
      });
      setCreateDialogOpen(false);
      setNewNotification({
        type: "info",
        title: "",
        message: "",
        link: "",
        broadcast: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
      case "system":
        return <Info className="h-5 w-5 text-blue-600" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "error":
      case "security":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "info":
      case "system":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
      case "success":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
      case "warning":
      case "alert":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
      case "error":
      case "security":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800";
    }
  };

  const handleCreateNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "Validation Error",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }
    createNotificationMutation.mutate(newNotification);
  };

  const filterNotifications = (type: string) => {
    if (type === 'all') return notifications;
    if (type === 'unread') return notifications.filter(n => !n.isRead);
    if (type === 'system') return notifications.filter(n => n.type === 'system' || n.type === 'info');
    if (type === 'security') return notifications.filter(n => n.type === 'security' || n.type === 'error' || n.type === 'alert');
    return notifications;
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card 
      className={`${getNotificationColor(notification.type)} ${!notification.isRead ? 'border-l-4' : ''}`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  {notification.title}
                  {!notification.isRead && (
                    <Badge variant="secondary" className="text-xs">New</Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(notification.createdAt), "PPp")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNotificationMutation.mutate(notification.id)}
                  disabled={deleteNotificationMutation.isPending}
                  data-testid={`button-delete-notif-${notification.id}`}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ icon: Icon, message, subMessage }: { icon: any, message: string, subMessage?: string }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12 text-muted-foreground">
          <Icon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">{message}</p>
          {subMessage && <p className="text-sm mt-2">{subMessage}</p>}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount} new</Badge>
            )}
          </h1>
          <p className="text-muted-foreground">System alerts and administrative notifications</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-notification">
                <Plus className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Notification
                </DialogTitle>
                <DialogDescription>
                  Send a notification to all users or specific users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={newNotification.type} 
                    onValueChange={(v) => setNewNotification({...newNotification, type: v})}
                  >
                    <SelectTrigger data-testid="select-notification-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    placeholder="Notification title"
                    data-testid="input-notification-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    placeholder="Notification message..."
                    rows={3}
                    data-testid="input-notification-message"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Link (optional)</Label>
                  <Input
                    id="link"
                    value={newNotification.link}
                    onChange={(e) => setNewNotification({...newNotification, link: e.target.value})}
                    placeholder="/dashboard or https://..."
                    data-testid="input-notification-link"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">This notification will be sent to all active users</span>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateNotification}
                    disabled={createNotificationMutation.isPending}
                    data-testid="button-send-notification"
                  >
                    {createNotificationMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send to All Users
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            onClick={() => markAllAsReadMutation.mutate()} 
            disabled={unreadCount === 0 || markAllAsReadMutation.isPending} 
            data-testid="button-mark-all-read"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" data-testid="button-mute-all">
            <BellOff className="h-4 w-4 mr-2" />
            Mute All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-notif-all">
            All ({totalCount})
          </TabsTrigger>
          <TabsTrigger value="unread" data-testid="tab-notif-unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="system" data-testid="tab-notif-system">
            System
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-notif-security">
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.length === 0 ? (
            <EmptyState 
              icon={Bell} 
              message="No notifications" 
              subMessage="You're all caught up!" 
            />
          ) : (
            notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {filterNotifications('unread').length === 0 ? (
            <EmptyState 
              icon={CheckCheck} 
              message="All caught up!" 
              subMessage="No unread notifications" 
            />
          ) : (
            filterNotifications('unread').map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {filterNotifications('system').length === 0 ? (
            <EmptyState 
              icon={Info} 
              message="No system notifications" 
            />
          ) : (
            filterNotifications('system').map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {filterNotifications('security').length === 0 ? (
            <EmptyState 
              icon={AlertCircle} 
              message="No security alerts" 
            />
          ) : (
            filterNotifications('security').map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
