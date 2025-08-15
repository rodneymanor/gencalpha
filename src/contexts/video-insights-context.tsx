"use client";

import { createContext, useContext, useState, ReactNode } from "react";

import { Video } from "@/lib/collections";

interface VideoInsightsContextType {
  selectedVideo: Video | null;
  isOpen: boolean;
  openPanel: (video: Video) => void;
  closePanel: () => void;
}

const VideoInsightsContext = createContext<VideoInsightsContextType | undefined>(undefined);

export function VideoInsightsProvider({ children }: { children: ReactNode }) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openPanel = (video: Video) => {
    setSelectedVideo(video);
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
    setSelectedVideo(null);
  };

  return (
    <VideoInsightsContext.Provider
      value={{
        selectedVideo,
        isOpen,
        openPanel,
        closePanel,
      }}
    >
      {children}
    </VideoInsightsContext.Provider>
  );
}

export function useVideoInsights() {
  const context = useContext(VideoInsightsContext);
  if (context === undefined) {
    throw new Error("useVideoInsights must be used within a VideoInsightsProvider");
  }
  return context;
}
