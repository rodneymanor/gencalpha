"use client";

import React from "react";

import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

import { StaticVideoPlayer } from "./static-video-player";

interface FocusInsightsWrapperProps {
  video: Video | null;
  className?: string;
}

export function FocusInsightsWrapper({ video, className }: FocusInsightsWrapperProps) {
  if (!video) {
    return (
      <div className={cn("bg-background flex h-full items-center justify-center p-6", className)}>
        <div className="text-center">
          <p className="text-muted-foreground">Select a video to see its insights</p>
        </div>
      </div>
    );
  }

  return <StaticVideoPlayer video={video} className={className} />;
}
