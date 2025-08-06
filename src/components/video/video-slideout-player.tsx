"use client";

import React, { useState, useEffect } from "react";

import { cn } from "@/lib/utils";

// Import the VideoInspirationPlayer component
import { VideoInspirationPlayerWrapperFloating } from "./video-inspiration-player";

interface FloatingVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoData?: {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    duration: string;
    views: string;
    platform: "tiktok" | "instagram" | "youtube";
    author: string;
    followers: string;
  };
  className?: string;
}

export function FloatingVideoPlayer({ isOpen, onClose, videoData, className }: FloatingVideoPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Dummy data fallback following Clarity Design System
  const defaultVideoData = {
    id: "sample-1",
    title: "Master React Components in 60 Seconds",
    url: "https://www.youtube.com/embed/wA_24AIXqgM",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop",
    duration: "58",
    views: "2.1M",
    platform: "tiktok" as const,
    author: "The Art of Code",
    followers: "1.2M",
  };

  const video = videoData ?? defaultVideoData;

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
        isExpanded ? "w-[min(70vw,900px)]" : "w-[min(420px,90vw)]",
        className,
      )}
    >
      {/* Video Player - Full Height */}
      <div className="h-full w-full">
        <VideoInspirationPlayerWrapperFloating />
      </div>
    </div>
  );
}

// Hook for managing floating video state
export function useFloatingVideo() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<FloatingVideoPlayerProps["videoData"] | null>(null);

  const openVideo = (videoData?: FloatingVideoPlayerProps["videoData"]) => {
    setCurrentVideo(videoData ?? null);
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
