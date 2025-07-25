"use client";

import Image from "next/image";

import { Play, Clock, User, ExternalLink, Heart, MessageCircle, Share, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video } from "@/lib/collections";

// Left column with video and metrics beside it
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
        <div className="flex h-full gap-4">
          {/* Video Preview */}
          <div className="bg-muted relative flex-1 overflow-hidden rounded-lg">
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
          </div>

          {/* Metrics beside video */}
          {video.metrics && (
            <div className="flex flex-col items-center justify-center gap-4">
              {/* Likes */}
              <div className="flex flex-col items-center gap-1">
                <div className="bg-muted hover:bg-muted/80 flex h-8 w-8 items-center justify-center rounded-full transition-all">
                  <Heart className="text-foreground h-4 w-4" />
                </div>
                <span className="text-foreground text-xs font-medium">{formatNumber(video.metrics.likes)}</span>
              </div>

              {/* Comments */}
              <div className="flex flex-col items-center gap-1">
                <div className="bg-muted hover:bg-muted/80 flex h-8 w-8 items-center justify-center rounded-full transition-all">
                  <MessageCircle className="text-foreground h-4 w-4" />
                </div>
                <span className="text-foreground text-xs font-medium">{formatNumber(video.metrics.comments)}</span>
              </div>

              {/* Shares */}
              <div className="flex flex-col items-center gap-1">
                <div className="bg-muted hover:bg-muted/80 flex h-8 w-8 items-center justify-center rounded-full transition-all">
                  <Share className="text-foreground h-4 w-4" />
                </div>
                <span className="text-foreground text-xs font-medium">{formatNumber(video.metrics.shares)}</span>
              </div>

              {/* Views */}
              <div className="flex flex-col items-center gap-1">
                <div className="bg-muted hover:bg-muted/80 flex h-8 w-8 items-center justify-center rounded-full transition-all">
                  <Eye className="text-foreground h-4 w-4" />
                </div>
                <span className="text-foreground text-xs font-medium">{formatNumber(video.metrics.views)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
