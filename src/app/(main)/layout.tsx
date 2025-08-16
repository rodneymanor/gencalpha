"use client";

import { ReactNode } from "react";

import { VideoProcessingNotifier } from "@/components/notifications/video-processing-notifier";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { VideoProcessingProvider } from "@/contexts/video-processing-context";

export default function MainLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <VideoProcessingProvider>
          <VideoProcessingNotifier />
          {children}
        </VideoProcessingProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
