"use client";

import { Play, Eye } from "lucide-react";

import type { Video } from "@/lib/collections";

interface VideoCardContentProps {
  video: Video;
  isHovered: boolean;
  formatNumber: (num: number | undefined) => string;
}

export function VideoCardContent({ video, isHovered, formatNumber }: VideoCardContentProps) {
  return (
    <div className="absolute inset-0">
      {/* Thumbnail */}
      <div className="bg-muted flex h-full w-full items-center justify-center">
        <Play className="text-muted-foreground h-12 w-12 opacity-50" />
      </div>

      {/* Bottom Section - Video Info */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="line-clamp-2 font-sans text-sm font-medium text-white">{video.title}</h3>

          {/* Metrics */}
          {video.metrics && (
            <div className="flex items-center gap-3 text-xs text-white/80">
              {video.metrics.views > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(video.metrics.views)}
                </span>
              )}
              {video.metrics.likes > 0 && <span>❤️ {formatNumber(video.metrics.likes)}</span>}
              {video.metrics.comments > 0 && <span>💬 {formatNumber(video.metrics.comments)}</span>}
            </div>
          )}

          {/* Duration */}
          {video.duration && <div className="text-xs text-white/60">{video.duration}</div>}
        </div>
      </div>
    </div>
  );
}
