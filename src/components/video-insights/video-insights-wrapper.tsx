"use client";

import { useVideoInsights } from "@/contexts/video-insights-context";
import { VideoInsightsPanel } from "./video-insights-panel";

interface VideoInsightsWrapperProps {
  onRemixScript?: (video: any) => void;
}

export function VideoInsightsWrapper({ onRemixScript }: VideoInsightsWrapperProps) {
  const { selectedVideo, isOpen, closePanel } = useVideoInsights();

  const handleRemixScript = (video: any) => {
    console.log("🎬 Remix Script for video:", video.title);
    onRemixScript?.(video);
    // TODO: Implement script remixing functionality
  };

  return (
    <VideoInsightsPanel
      video={selectedVideo}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closePanel();
        }
      }}
      onRemixScript={handleRemixScript}
    />
  );
}