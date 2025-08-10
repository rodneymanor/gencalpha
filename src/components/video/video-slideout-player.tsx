"use client";

import React, { useEffect, useState } from "react";

import { Film } from "lucide-react";

import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

// Import the VideoInspirationPlayer component
import { VideoInspirationPlayerWrapperFloating } from "./video-inspiration-player";

interface FloatingVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  video?: Video | null;
  className?: string;
  // overlay: fixed panel that sits above content (used on Daily page)
  // sticky: sticks within a right-hand column (used on Focus Collections)
  mode?: "fixed" | "sticky";
  // When true, pressing Escape should NOT close the panel
  disableEscapeClose?: boolean;
}

export function FloatingVideoPlayer({
  isOpen,
  onClose,
  video,
  className,
  mode = "fixed",
  disableEscapeClose = false,
}: FloatingVideoPlayerProps) {
  // Overlay should not push layout; no-op effect (kept for possible future side effects)
  useEffect(() => {
    return;
  }, [isOpen, mode]);

  // Handle escape key (optional)
  useEffect(() => {
    if (disableEscapeClose) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [disableEscapeClose, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        mode === "fixed"
          ? cn(
              "fixed right-4 z-50",
              // 16px padding above and below to match Clarity spacing
              "top-4 bottom-4",
              "transition-all duration-500 ease-out",
              "rounded-[var(--radius-card)]",
              "h-[calc(100vh-32px)]",
              "w-[min(420px,76.5vw)]",
            )
          : cn(
              // Sticky variant for collections page
              "sticky top-4",
              "w-full",
              // Constrain height within viewport; allow inner scroll
              "max-h-[calc(100vh-32px)]",
              "rounded-[var(--radius-card)]",
            ),
        className,
      )}
    >
      <div className={cn("h-full w-full")}>
        {video ? (
          <VideoInspirationPlayerWrapperFloating video={video} />
        ) : (
          <div className="bg-card text-foreground flex h-full w-full items-center justify-center rounded-[var(--radius-card)] border p-6 text-center shadow-[var(--shadow-soft-drop)]">
            <div>
              <Film className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
              <h3 className="mb-1 text-base font-semibold">Select a video to preview</h3>
              <p className="text-muted-foreground text-sm">Choose a video from the grid to open details and actions.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for managing floating video state
export function useFloatingVideo() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  const openVideo = (videoData: Video) => {
    setCurrentVideo(videoData);
    setIsOpen(true);
  };

  const closeVideo = () => {
    setIsOpen(false);
    // Keep the video data until the close animation completes
    setTimeout(() => setCurrentVideo(null), 300);
  };

  return {
    isOpen,
    currentVideo,
    openVideo,
    closeVideo,
  };
}

// Simplified layout component
export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  return <div className="relative min-h-screen">{children}</div>;
}

// Legacy exports for backward compatibility
export const VideoSlideoutPlayer = FloatingVideoPlayer;
export const useVideoSlideout = useFloatingVideo;
export const SlideoutLayout = ResponsiveLayout;
