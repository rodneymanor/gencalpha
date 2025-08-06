"use client";

import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Import the VideoInspirationPlayer component
import VideoInspirationPlayerWrapper from './video-inspiration-player';

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
    platform: 'tiktok' | 'instagram' | 'youtube';
    author: string;
    followers: string;
  };
  className?: string;
}

// eslint-disable-next-line complexity
export function FloatingVideoPlayer({ 
  isOpen, 
  onClose, 
  videoData,
  className 
}: FloatingVideoPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Dummy data fallback following Clarity Design System
  const defaultVideoData = {
    id: 'sample-1',
    title: 'Master React Components in 60 Seconds',
    url: 'https://www.youtube.com/embed/wA_24AIXqgM',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop',
    duration: '58',
    views: '2.1M',
    platform: 'tiktok' as const,
    author: 'The Art of Code',
    followers: '1.2M'
  };

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const video = videoData || defaultVideoData;

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        // Force re-calculation of layout
        document.documentElement.style.setProperty(
          '--floating-player-width', 
          isExpanded ? 'min(60vw, 800px)' : 'min(420px, 90vw)'
        );
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, isExpanded]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="floating-video-container">
      {/* Floating Video Player */}
      <div
        className={cn(
          "fixed top-4 right-4 z-50",
          "bg-background border border-border shadow-[var(--shadow-soft-drop)]",
          "rounded-[var(--radius-card)] overflow-hidden",
          "transition-all duration-300 ease-out",
          isExpanded 
            ? "w-[min(60vw,800px)] h-[min(80vh,600px)]" 
            : "w-[min(420px,90vw)] h-[min(70vh,500px)]",
          className
        )}
      >
        {/* Floating Header */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0"></div>
            <h3 className="font-sans font-medium text-foreground truncate text-sm">
              {video.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground h-7 w-7 p-0 rounded-[var(--radius-button)]"
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
              <span className="sr-only">{isExpanded ? 'Minimize' : 'Maximize'}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground h-7 w-7 p-0 rounded-[var(--radius-button)]"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Video Player Content */}
        <div className="flex-1 overflow-hidden h-[calc(100%-52px)]">
          <div className="h-full">
            <VideoInspirationPlayerWrapper />
          </div>
        </div>
      </div>

      {/* Layout Integration Spacer */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          "fixed top-0 right-0 z-40 pointer-events-none",
          isExpanded 
            ? "w-[min(62vw,820px)] h-[min(82vh,620px)]"
            : "w-[min(440px,92vw)] h-[min(72vh,520px)]"
        )}
      />
    </div>
  );
}

// Hook for managing floating video state
export function useFloatingVideo() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<FloatingVideoPlayerProps['videoData'] | null>(null);

  const openVideo = (videoData?: FloatingVideoPlayerProps['videoData']) => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    setCurrentVideo(videoData || null);
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
    closeVideo
  };
}

// Layout component that integrates with floating video
export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen transition-all duration-300 ease-out responsive-layout">
      {children}
    </div>
  );
}

// Legacy exports for backward compatibility
export const VideoSlideoutPlayer = FloatingVideoPlayer;
export const useVideoSlideout = useFloatingVideo;
export const SlideoutLayout = ResponsiveLayout;