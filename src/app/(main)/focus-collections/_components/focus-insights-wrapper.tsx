"use client";

import React from "react";

import { Eye } from "lucide-react";

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
      <div className={cn("bg-card flex h-full items-center justify-center p-6", className)}>
        <div className="text-center">
          <Eye className="text-muted-foreground mx-auto mb-3 h-8 w-8 opacity-60" />
          <h3 className="mb-1 font-sans text-base font-semibold">No video selected</h3>
          <p className="text-muted-foreground text-sm">
            Click any video in the grid to preview it here and generate full insights on demand.
          </p>
        </div>
      </div>
    );
  }

  return <StaticVideoPlayer video={video} className={className} />;
}
