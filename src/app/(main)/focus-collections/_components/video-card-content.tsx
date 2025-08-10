"use client";

import Image from "next/image";

import { Play, Eye } from "lucide-react";

import type { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

interface VideoCardContentProps {
  video: Video;
  isHovered: boolean;
  formatNumber: (num: number | undefined) => string;
}

export function VideoCardContent({ video, isHovered, formatNumber }: VideoCardContentProps) {
  return (
    <div className="absolute inset-0">
      {/* Static Thumbnail */}
      {video.thumbnailUrl ? (
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          className={cn("object-cover transition-transform duration-200", isHovered && "scale-105")}
          priority={false}
        />
      ) : (
        <div className="bg-muted flex h-full w-full items-center justify-center">
          <Play className="text-muted-foreground h-12 w-12 opacity-50" />
        </div>
      )}

      {/* Animated Preview on hover (if available) */}
      {video.previewUrl && (
        <Image
          src={video.previewUrl}
          alt={`${video.title} preview`}
          fill
          className={cn("object-cover transition-opacity duration-200", isHovered ? "opacity-100" : "opacity-0")}
          priority={false}
        />
      )}

      {/* Views metric bottom-left only */}
      {video.metrics?.views !== undefined && video.metrics.views > 0 && (
        <div className="absolute bottom-2 left-2">
          <div className="rounded-pill flex items-center gap-1 px-2 py-1 text-white">
            <Eye className="h-3 w-3" />
            <span className="font-sans text-sm font-semibold">{formatNumber(video.metrics.views)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
