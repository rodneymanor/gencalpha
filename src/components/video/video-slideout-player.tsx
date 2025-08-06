"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Heart, MessageCircle, Share2, Lightbulb, Play, List, X, Maximize2, Minimize2 } from "lucide-react";
import { cn } from '@/lib/utils';
import { AdvancedSlidingSwitch, SwitchOption } from "@/components/ui/advanced-sliding-switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.95-6.43-2.88-1.59-1.94-2.2-4.42-1.8-6.83.39-2.4 1.91-4.45 3.72-5.96 1.95-1.64 4.59-2.5 7.1-2.45v4.03c-1.11.02-2.21.22-3.23.62-.65.25-1.26.6-1.81 1.02-.33.25-.65.52-.96.81-.02-3.2.01-6.39-.01-9.58Z" />
  </svg>
);

// Metric Component
const Metric = ({ icon, value }: { icon: React.ReactNode; value: string }) => (
  <div className="text-muted-foreground flex items-center gap-1.5">
    {icon}
    <span className="text-xs font-medium">{value}</span>
  </div>
);

// Video Player View for constrained container
const VideoPlayerView = ({ videoUrl, views, likes, comments, shares }: any) => (
  <div className="flex h-full flex-col">
    <div className="relative aspect-[9/16] w-full flex-shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-black shadow-[var(--shadow-input)]">
      <iframe
        className="absolute top-0 left-0 h-full w-full"
        src={videoUrl}
        title="Video Player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
    <div className="mt-3 grid flex-shrink-0 grid-cols-4 gap-2 px-1">
      <Metric icon={<Eye className="h-4 w-4" />} value={views} />
      <Metric icon={<Heart className="h-4 w-4" />} value={likes} />
      <Metric icon={<MessageCircle className="h-4 w-4" />} value={comments} />
      <Metric icon={<Share2 className="h-4 w-4" />} value={shares} />
    </div>
    <div className="mt-4 flex-shrink-0">
      <Button variant="outline" className="h-10 w-full text-sm font-semibold">
        Remix
      </Button>
    </div>
  </div>
);

// Insights Panel View for constrained container
const InsightsPanelView = (props: any) => (
  <div className="h-full overflow-y-auto pr-2 text-sm">
    <h2 className="text-foreground mb-3 text-lg font-bold">Social Media Insights</h2>

    <div className="space-y-5">
      <div>
        <h3 className="text-foreground mb-2 flex items-center gap-2 font-semibold">
          <Lightbulb className="text-secondary h-4 w-4" />
          Hook Ideas
        </h3>
        <ul className="text-muted-foreground list-inside list-disc space-y-1">
          <li>"You won't believe this one simple trick for..."</li>
          <li>"Are you making this common mistake when...?"</li>
          <li>"Stop wasting time on [problem], do this instead."</li>
        </ul>
      </div>

      <div>
        <h3 className="text-foreground mb-2 flex items-center gap-2 font-semibold">
          <List className="text-secondary h-4 w-4" />
          Metrics
        </h3>
        <div className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex justify-between">
            <span>Likes:</span> <span className="text-foreground font-medium">{props.likes}</span>
          </div>
          <div className="flex justify-between">
            <span>Comments:</span> <span className="text-foreground font-medium">{props.comments}</span>
          </div>
          <div className="flex justify-between">
            <span>Views:</span> <span className="text-foreground font-medium">{props.views}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-foreground mb-2 font-semibold">Caption</h3>
        <p className="bg-muted rounded-[var(--radius-card)] border p-3 text-xs">{props.caption}</p>
      </div>
    </div>
  </div>
);

// Constrained Video Player for Floating Container
function ConstrainedVideoPlayer({ videoData }: { videoData: any }) {
  const [showInsights, setShowInsights] = useState(false);

  const switchOptions: SwitchOption[] = [
    { value: "ghost-write", icon: <Play className="h-4 w-4" />, tooltip: "Video" },
    { value: "web-search", icon: <Lightbulb className="h-4 w-4" />, tooltip: "Insights" },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-background text-foreground font-sans">
      <motion.div
        className="h-full w-full flex flex-col"
        animate={{ width: showInsights ? "100%" : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className="h-full rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] flex flex-col">
          <CardContent className="p-4 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 border-b pb-4 flex-shrink-0">
              <TikTokIcon className="text-foreground h-8 w-8 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{videoData.creatorName}</div>
                <div className="text-muted-foreground text-xs">{videoData.followers} Followers</div>
              </div>
              <AdvancedSlidingSwitch 
                options={switchOptions} 
                onChange={() => setShowInsights((prev) => !prev)} 
              />
            </div>

            {/* Content */}
            <div className="mt-4 flex-1 min-h-0">
              {showInsights ? <InsightsPanelView {...videoData} /> : <VideoPlayerView {...videoData} />}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export function FloatingVideoPlayer({ 
  isOpen, 
  onClose, 
  videoData,
  className 
}: FloatingVideoPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Dummy data fallback
  const defaultVideoData = {
    creatorName: "The Art of Code",
    followers: "1.2M", 
    videoUrl: "https://www.youtube.com/embed/wA_24AIXqgM",
    views: "2.1M",
    likes: "180K",
    comments: "1,245",
    shares: "24.3K",
    saves: "95K",
    engagementRate: "8.5%",
    duration: "58",
    caption: "Here's a quick look at how to build animated UIs with React and Tailwind CSS. It's easier than you think! #react #tailwind #webdev"
  };

  const finalVideoData = videoData || defaultVideoData;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

        {/* Floating Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "relative z-10 floating-video-player",
            isExpanded 
              ? "w-[min(90vw,800px)] h-[min(85vh,700px)]" 
              : "w-[min(420px,90vw)] h-[min(600px,80vh)]",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Controls */}
          <div className="absolute -top-12 left-0 right-0 flex items-center justify-between text-white z-20">
            <div className="text-sm font-medium opacity-80">
              Video Player
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0 text-white hover:bg-white/10"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <ConstrainedVideoPlayer videoData={finalVideoData} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for managing floating video state
export function useFloatingVideo() {
  const [isOpen, setIsOpen] = useState(false);
  const [videoData, setVideoData] = useState(null);

  const openVideo = (data?: any) => {
    setVideoData(data);
    setIsOpen(true);
  };

  const closeVideo = () => {
    setIsOpen(false);
    setVideoData(null);
  };

  return {
    isOpen,
    videoData,
    openVideo,
    closeVideo,
  };
}

// Responsive Layout Component for pushing content
export function ResponsiveLayout({ 
  children, 
  isVideoOpen = false 
}: { 
  children: React.ReactNode;
  isVideoOpen?: boolean;
}) {
  return (
    <motion.div
      animate={{ 
        marginRight: isVideoOpen ? "440px" : "0px" 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="transition-all duration-300 ease-out"
    >
      {children}
    </motion.div>
  );
}
