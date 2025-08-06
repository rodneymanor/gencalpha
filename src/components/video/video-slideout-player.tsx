"use client";

import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Import the VideoInspirationPlayer component
import VideoInspirationPlayerWrapper from './video-inspiration-player';

interface VideoSlideoutPlayerProps {
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

export function VideoSlideoutPlayer({ 
  isOpen, 
  onClose, 
  videoData,
  className 
}: VideoSlideoutPlayerProps) {
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

  const video = videoData || defaultVideoData;

  // Handle body scroll and layout adjustments
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Add class to root to handle layout adjustments
      document.documentElement.classList.add('slideout-open');
      if (isExpanded) {
        document.documentElement.classList.add('slideout-expanded');
      } else {
        document.documentElement.classList.remove('slideout-expanded');
      }
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.classList.remove('slideout-open', 'slideout-expanded');
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.classList.remove('slideout-open', 'slideout-expanded');
    };
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

  return (
    <>
      {/* Layout Pusher - This pushes the main content */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          isOpen && !isExpanded && "mr-96 md:mr-[420px] lg:mr-[480px]",
          isOpen && isExpanded && "mr-[75vw] lg:mr-[60vw] xl:mr-[50vw]"
        )}
        style={{
          marginRight: isOpen 
            ? (isExpanded ? 'min(75vw, 75%)' : 'min(480px, 100vw)')
            : '0'
        }}
      />

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300 ease-out",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Slideout Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-screen bg-background border-l border-border shadow-[var(--shadow-soft-drop)] z-50",
          "transition-all duration-300 ease-out",
          // Width and transform based on state
          isOpen ? "translate-x-0" : "translate-x-full",
          isExpanded 
            ? "w-[75vw] lg:w-[60vw] xl:w-[50vw]" 
            : "w-full sm:w-96 md:w-[420px] lg:w-[480px]",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0"></div>
            <h2 className="font-sans font-medium text-foreground truncate text-sm">
              {video.title}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0 rounded-[var(--radius-button)]"
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              <span className="sr-only">{isExpanded ? 'Minimize' : 'Maximize'}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0 rounded-[var(--radius-button)]"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Video Player Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full">
            <VideoInspirationPlayerWrapper />
          </div>
        </div>
      </div>
    </>
  );
}

// Hook for managing slideout state
export function useVideoSlideout() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoSlideoutPlayerProps['videoData'] | null>(null);

  const openSlideout = (videoData?: VideoSlideoutPlayerProps['videoData']) => {
    setCurrentVideo(videoData || null);
    setIsOpen(true);
  };

  const closeSlideout = () => {
    setIsOpen(false);
    // Keep the video data until the close animation completes
    setTimeout(() => setCurrentVideo(null), 300);
  };

  return {
    isOpen,
    currentVideo,
    openSlideout,
    closeSlideout
  };
}

// Layout component that handles content pushing
export function SlideoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen transition-all duration-300 ease-out slideout-layout">
      {children}
    </div>
  );
}