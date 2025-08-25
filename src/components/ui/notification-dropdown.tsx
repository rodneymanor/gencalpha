"use client";

import React from 'react';

import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  CheckCircle,
  Video,
  FolderPlus,
  UserPlus,
  XCircle,
  Lightbulb,
  MoreHorizontal,
  Check,
  Trash2
} from 'lucide-react';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type NotificationItem as NotificationItemType } from "@/contexts/notification-context";
import { cn } from "@/lib/utils";

const getNotificationIcon = (type: NotificationItemType["type"]) => {
  switch (type) {
    case "video_added":
      return <Video className="w-4 h-4 text-blue-500" />;
    case "collection_created":
      return <FolderPlus className="w-4 h-4 text-green-500" />;
    case "creator_added":
      return <UserPlus className="w-4 h-4 text-purple-500" />;
    case "processing_complete":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "processing_failed":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "idea_added":
      return <Lightbulb className="w-4 h-4 text-yellow-500" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
};

interface NotificationDropdownProps {
  className?: string;
}

const NotificationItem = ({ notification, onMarkAsRead }: {
  notification: NotificationItemType;
  onMarkAsRead: (id: string) => void;
}) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data?.collectionId) {
      window.location.href = `/collections?id=${notification.data.collectionId}`;
    } else if (notification.data?.videoId) {
      window.location.href = `/library?video=${notification.data.videoId}`;
    }
  };

  return (
    <DropdownMenuItem
      className={cn(
        "flex items-start gap-3 p-4 cursor-pointer border-b last:border-b-0 h-auto",
        !notification.read && "bg-accent/50"
      )}
      onClick={handleClick}
    >
      <div className="mt-0.5 flex-shrink-0">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-foreground leading-tight">
            {notification.title}
          </p>
          {!notification.read && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1" />
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {notification.message}
        </p>

        <p className="text-xs text-muted-foreground mt-2">
          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
        </p>
      </div>
    </DropdownMenuItem>
  );
};

const NotificationTrigger = ({ unreadCount, className }: { unreadCount: number; className?: string }) => (
  <button
    className={cn(
      "relative flex w-8 h-8 cursor-pointer items-center justify-center rounded-[var(--radius-button)] border border-border bg-background hover:bg-muted transition-colors duration-200",
      className
    )}
    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
  >
    <Bell className="w-4 h-4 text-foreground" />
    {unreadCount > 0 && (
      <Badge
        variant="destructive"
        className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center rounded-full"
      >
        {unreadCount > 9 ? '9+' : unreadCount}
      </Badge>
    )}
  </button>
);

const NotificationHeader = ({ unreadCount, notifications, markAllAsRead, clearAll }: {
  unreadCount: number;
  notifications: NotificationItemType[];
  markAllAsRead: () => void;
  clearAll: () => void;
}) => (
  <div className="flex items-center justify-between p-4 border-b">
    <div>
      <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
      {unreadCount > 0 && (
        <p className="text-xs text-muted-foreground mt-0.5">
          {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>

    {notifications.length > 0 && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {unreadCount > 0 && (
            <DropdownMenuItem onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={clearAll} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear all
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )}
  </div>
);

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NotificationTrigger unreadCount={unreadCount} className={className} />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-0" align="end" side="bottom" sideOffset={8}>
        <NotificationHeader
          unreadCount={unreadCount}
          notifications={notifications}
          markAllAsRead={markAllAsRead}
          clearAll={clearAll}
        />

        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              You&apos;ll see updates about new videos, collections, and more here
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="py-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {notifications.length > 0 && (
          <div className="p-3 bg-muted/50 text-center border-t">
            <p className="text-xs text-muted-foreground">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''} total
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}