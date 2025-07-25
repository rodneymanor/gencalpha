"use client";

import Image from "next/image";

import { Play, Heart, MessageCircle, Share, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Video } from "@/lib/collections";

interface VideoPreviewWithMetricsProps {
  video: Video;
  className?: string;
}

// Left column with video and metrics beside it
export function VideoPreviewWithMetrics({ video, className }: VideoPreviewWithMetricsProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      {/* Video Preview */}
      <div className="relative h-full w-full">
        {video.thumbnailUrl ? (
          <Image src={video.thumbnailUrl} alt={video.title} fill className="object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-900">
            <div className="text-center text-gray-400">
              <Play className="mx-auto mb-2 h-12 w-12" />
              <p className="text-sm">No Preview</p>
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button size="icon" className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
            <Play className="h-8 w-8 fill-white text-white" />
          </Button>
        </div>

        {/* Metrics Overlay on Right Side */}
        {video.metrics && (
          <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6">
            {/* Likes */}
            <div className="flex flex-col items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
              >
                <Heart className="h-6 w-6 text-white" />
              </Button>
              <span className="text-sm font-semibold text-white drop-shadow-lg">
                {formatNumber(video.metrics.likes)}
              </span>
            </div>

            {/* Comments */}
            <div className="flex flex-col items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
              >
                <MessageCircle className="h-6 w-6 text-white" />
              </Button>
              <span className="text-sm font-semibold text-white drop-shadow-lg">
                {formatNumber(video.metrics.comments)}
              </span>
            </div>

            {/* Shares */}
            <div className="flex flex-col items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
              >
                <Share className="h-6 w-6 text-white" />
              </Button>
              <span className="text-sm font-semibold text-white drop-shadow-lg">
                {formatNumber(video.metrics.shares)}
              </span>
            </div>

            {/* Views */}
            <div className="flex flex-col items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
              >
                <Eye className="h-6 w-6 text-white" />
              </Button>
              <span className="text-sm font-semibold text-white drop-shadow-lg">
                {formatNumber(video.metrics.views)}
              </span>
            </div>
          </div>
        )}

        {/* Bottom Gradient for Better Text Visibility */}
        <div className="absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    </div>
  );
}
