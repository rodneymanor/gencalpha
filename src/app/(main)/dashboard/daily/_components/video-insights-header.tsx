"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Video } from "@/lib/collections";

interface VideoInsightsHeaderProps {
  video: Video;
  isLoading: boolean;
  formatNumber: (n: number | undefined) => string;
}

// Map platform to CSS variable driven backgrounds for brand consistency
const platformBadgeStyles: Record<string, { bg: string; color?: string }> = {
  tiktok: { bg: "#000", color: "#fff" },
  instagram: { bg: "var(--secondary)" },
  youtube: { bg: "var(--destructive)", color: "var(--accent-foreground)" },
};

export function VideoInsightsHeader({ video, isLoading, formatNumber }: VideoInsightsHeaderProps) {
  return (
    <div className="flex-shrink-0 border-b p-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={video.metadata?.author ? `https://unavatar.io/instagram/${video.metadata.author}` : undefined}
              alt={video.metadata?.author ?? "Creator"}
            />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{video.metadata?.author ?? "Unknown Creator"}</span>
            <Badge
              className="capitalize"
              style={{
                backgroundColor: platformBadgeStyles[video.platform.toLowerCase()]?.bg ?? "var(--accent)",
                color: platformBadgeStyles[video.platform.toLowerCase()]?.color ?? "var(--accent-foreground)",
              }}
            >
              {video.platform}
            </Badge>
          </div>
          {isLoading && <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />}
        </div>

        {video.metrics && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-semibold">{formatNumber(video.metrics.views)}</span>
              <span className="text-muted-foreground">views</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{formatNumber(video.metrics.likes)}</span>
              <span className="text-muted-foreground">likes</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{formatNumber(video.metrics.comments)}</span>
              <span className="text-muted-foreground">comments</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{formatNumber(video.metrics.shares)}</span>
              <span className="text-muted-foreground">shares</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
