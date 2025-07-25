"use client";

import { ReactNode } from "react";

import { AuthProvider } from "@/contexts/auth-context";
import { VideoProcessingProvider } from "@/contexts/video-processing-context";

export default function MainLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AuthProvider>
      <VideoProcessingProvider>{children}</VideoProcessingProvider>
    </AuthProvider>
  );
}
