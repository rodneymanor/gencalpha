"use client";

import Image from "next/image";

import { Play, Clock, User, ExternalLink, Heart, MessageCircle, Share, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video } from "@/lib/collections";

// Left column with video and Instagram-style metrics overlay
export function VideoPreviewWithMetrics({ video }: { video: Video }) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex h-full flex-col p-4">
        <div className="bg-muted relative mb-3 flex-1 overflow-hidden rounded-lg">
          {video.thumbnailUrl ? (
            <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center">
              <div className="text-muted-foreground text-center">
                <Play className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">No Preview</p>
              </div>
            </div>
          )}

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
              <Play className="h-6 w-6 fill-white text-white" />
            </Button>
          </div>

          {/* Instagram-style metrics overlay on right side */}
          {video.metrics && (
            <div className="absolute right-4 bottom-4 flex flex-col items-center gap-4">
              {/* Likes */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium text-white drop-shadow-lg">
                  {formatNumber(video.metrics.likes)}
                </span>
              </div>

              {/* Comments */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium text-white drop-shadow-lg">
                  {formatNumber(video.metrics.comments)}
                </span>
              </div>

              {/* Shares */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60">
                  <Share className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium text-white drop-shadow-lg">
                  {formatNumber(video.metrics.shares)}
                </span>
              </div>

              {/* Views */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium text-white drop-shadow-lg">
                  {formatNumber(video.metrics.views)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <User className="h-4 w-4" />
            <span>{video.metadata?.author ?? "Unknown"}</span>
          </div>
          {video.duration && (
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm">
            <ExternalLink className="h-4 w-4" />
            <a
              href={video.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View Original
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
