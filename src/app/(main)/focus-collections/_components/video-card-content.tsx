"use client";

import Image from "next/image";

import { Play, Eye } from "lucide-react";

import { generateBunnyThumbnailUrl } from "@/lib/bunny-stream";
import type { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

interface VideoCardContentProps {
  video: Video;
  isHovered: boolean;
  formatNumber: (num: number | undefined) => string;
}

export function VideoCardContent({ video, isHovered, formatNumber }: VideoCardContentProps) {
  const bunnyThumbnail = video.guid ? generateBunnyThumbnailUrl(video.guid) : null;
  const thumbnailSrc = bunnyThumbnail ?? video.thumbnailUrl ?? null;
  return (
    <div className="absolute inset-0">
      {/* Thumbnail */}
      {thumbnailSrc ? (
        <Image
          src={thumbnailSrc}
          alt={video.title}
          fill
          className={cn("object-cover transition-transform duration-200", isHovered && "scale-105")}
        />
      ) : (
        <div className="bg-muted flex h-full w-full items-center justify-center">
          <Play className="text-muted-foreground h-12 w-12 opacity-50" />
        </div>
      )}

      {/* Bottom Section - Video Info */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="line-clamp-2 font-sans text-sm font-medium text-white">{video.title}</h3>

          {/* Metrics */}
          <VideoMetrics metrics={video.metrics} formatNumber={formatNumber} />

          {/* Duration */}
          {video.duration && <div className="text-xs text-white/60">{video.duration}</div>}
        </div>
      </div>
    </div>
  );
}

interface VideoMetricsProps {
  metrics?: Video["metrics"];
  formatNumber: (num: number | undefined) => string;
}

function VideoMetrics({ metrics, formatNumber }: VideoMetricsProps) {
  if (!metrics) return null;
  const hasViews = metrics.views > 0;
  const hasLikes = metrics.likes > 0;
  const hasComments = metrics.comments > 0;
  if (!hasViews && !hasLikes && !hasComments) return null;
  return (
    <div className="flex items-center gap-3 text-xs text-white/80">
      {hasViews && (
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {formatNumber(metrics.views)}
        </span>
      )}
      {hasLikes && <span>❤️ {formatNumber(metrics.likes)}</span>}
      {hasComments && <span>💬 {formatNumber(metrics.comments)}</span>}
    </div>
  );
}
