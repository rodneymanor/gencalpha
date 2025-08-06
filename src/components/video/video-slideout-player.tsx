"use client";

import React, { useState, useEffect } from "react";

import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

// Import the VideoInspirationPlayer component
import { VideoInspirationPlayerWrapperFloating } from "./video-inspiration-player";

interface FloatingVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video;
  className?: string;
}

export function FloatingVideoPlayer({ isOpen, onClose, video, className }: FloatingVideoPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Update body margin when slideout opens/closes to push content over
  useEffect(() => {
    const body = document.body;
    if (isOpen) {
      // Calculate panel width + padding for margin
      const panelWidth = isExpanded ? Math.min(window.innerWidth * 0.7, 900) : Math.min(420, window.innerWidth * 0.9);
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
  }, [isOpen, isExpanded]);

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
        "fixed top-[18px] right-4 bottom-[18px] z-50",
        "transition-all duration-300 ease-out",
        "rounded-[var(--radius-card)]",
        "h-[calc(100vh-36px)]",
        isExpanded
          ? "w-[min(59.5vw,900px)]" // 70 vw → 59.5 vw  (-15 %)
          : "w-[min(420px,76.5vw)]", // 90 vw → 76.5 vw (-15 %)
        className,
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Video Player - Full Height */}
      <div className="h-full w-full">
        <VideoInspirationPlayerWrapperFloating video={video} />
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
