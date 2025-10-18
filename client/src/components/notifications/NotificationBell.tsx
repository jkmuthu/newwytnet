import { useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
import { Link } from "wouter";

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
}

interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Fetch unread count
  const { data: unreadData } = useQuery<UnreadCountResponse>({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = unreadData?.unreadCount || 0;

  // Fetch notifications when popover is opened
  const { data: notificationsData, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ['/api/notifications'],
    enabled: open,
  });

  const notifications = notificationsData?.notifications || [];

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest(`/api/notifications/${notificationId}/mark-read`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/notifications/mark-all-read', 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      setOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    // You can customize icons based on notification type
    switch (type) {
      case 'wytai':
        return '🤖';
      case 'hub_invite':
        return '🏢';
      case 'points':
        return '💰';
      case 'alert':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative h-9 w-9 p-0"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full px-1 text-xs font-semibold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="h-8 text-xs"
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    notification.isRead 
                      ? 'bg-background hover:bg-muted/50' 
                      : 'bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-${notification.id}`}
                >
                  {notification.link ? (
                    <Link href={notification.link}>
                      <NotificationContent notification={notification} getIcon={getNotificationIcon} />
                    </Link>
                  ) : (
                    <NotificationContent notification={notification} getIcon={getNotificationIcon} />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t px-4 py-2 text-center">
            <Link href="/notifications">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => setOpen(false)}
              >
                View all notifications
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotificationContent({ 
  notification, 
  getIcon 
}: { 
  notification: Notification;
  getIcon: (type: string) => string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 text-2xl">
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm">{notification.title}</p>
          {!notification.isRead && (
            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
