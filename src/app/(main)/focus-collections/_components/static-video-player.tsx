"use client";

import React from "react";

import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

// Corrected import path
import { VideoInspirationPlayerWrapperFloating } from "../../../../components/video/video-inspiration-player";

interface StaticVideoPlayerProps {
  video: Video;
  className?: string;
}

export function StaticVideoPlayer({ video, className }: StaticVideoPlayerProps) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-[var(--radius-card)]", className)}>
      <div className="h-full w-full">
        <VideoInspirationPlayerWrapperFloating video={video} />
      </div>
    </div>
  );
}
