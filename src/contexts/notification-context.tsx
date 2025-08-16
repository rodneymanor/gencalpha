"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export interface NotificationItem {
  id: string;
  type:
    | "video_added"
    | "collection_created"
    | "creator_added"
    | "processing_complete"
    | "processing_failed"
    | "idea_added";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: {
    videoId?: string;
    collectionId?: string;
    creatorId?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    jobId?: string;
  };
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, "id" | "timestamp" | "read">) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const MAX_NOTIFICATIONS = 50;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("app_notifications");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const validNotifications = parsed.map((n: Partial<NotificationItem>) => ({
          ...n,
          timestamp: new Date((n as { timestamp: string }).timestamp),
        }));
        setNotifications(validNotifications);
      } catch (error) {
        console.error("Failed to load notifications from storage:", error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("app_notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<NotificationItem, "id" | "timestamp" | "read">) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      return updated;
    });

    console.log("🔔 Added notification:", newNotification.title);
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem("app_notifications");
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const value: NotificationContextType = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
    }),
    [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification, clearAll],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
