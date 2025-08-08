"use client";

import React, { useEffect } from "react";

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
}

export function FloatingVideoPlayer({ isOpen, onClose, video, className, mode = "fixed" }: FloatingVideoPlayerProps) {
  // Update body margin when slideout opens/closes to push content over (fixed mode only)
  useEffect(() => {
    if (mode === "sticky") return; // Sticky variant does not manipulate body margin
    const body = document.body;
    if (isOpen) {
      // Standard container width + padding for margin
      const panelWidth = Math.min(420, window.innerWidth * 0.9);
      const totalWidth = panelWidth + 32; // 32px for right padding (right-4 = 16px + some buffer)

      // Add transition and margin to push content
      body.style.transition = "margin-right 300ms ease-out";
      body.style.marginRight = `${totalWidth}px`;
    } else {
      // Remove margin when closed
      body.style.marginRight = "0px";
      // Clean up transition after animation
      setTimeout(() => {
        body.style.transition = "";
      }, 300);
    }

    // Cleanup on unmount
    return () => {
      body.style.marginRight = "0px";
      body.style.transition = "";
    };
  }, [isOpen, mode]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        mode === "fixed"
          ? cn(
              "fixed right-4 z-50",
              // 16px padding above and below to match Clarity spacing
              "top-4 bottom-4",
              "transition-all duration-300 ease-out",
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
