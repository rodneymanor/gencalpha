"use client";

import { Loader2, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

interface VideoInsightsHeaderProps {
  video: Video;
  isLoading: boolean;
  formatNumber: (n: number | undefined) => string;
}

// Map platform to design system colors for brand consistency
const platformBadgeStyles: Record<string, string> = {
  tiktok: "bg-primary text-primary-foreground",
  instagram: "bg-secondary text-secondary-foreground",
  youtube: "bg-destructive text-destructive-foreground",
  twitter: "bg-secondary text-secondary-foreground",
  default: "bg-accent text-accent-foreground",
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
            <span className="text-sm font-semibold">{video.metadata?.author ?? "Unknown Creator"}</span>
            <Badge
              className={cn(
                "capitalize",
                platformBadgeStyles[video.platform.toLowerCase()] ?? platformBadgeStyles.default,
              )}
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
