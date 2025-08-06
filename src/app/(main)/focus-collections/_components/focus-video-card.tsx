"use client";

import { useState } from "react";

import { Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

import { VideoCardActions } from "./video-card-actions";
import { VideoCardContent } from "./video-card-content";

interface FocusVideoCardProps {
  video: Video;
  isSelected?: boolean;
  onClick: (video: Video) => void;
  onToggleFavorite?: (video: Video) => void;
  onMove?: (video: Video) => void;
  onCopy?: (video: Video) => void;
  onDelete?: (video: Video) => void;
  canWrite?: boolean;
  canDelete?: boolean;
  className?: string;
}

// Helper functions
const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return "0";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

const getPlatformBadgeColor = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "tiktok":
      return "bg-primary text-primary-foreground";
    case "instagram":
      return "bg-secondary text-secondary-foreground";
    case "youtube":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function FocusVideoCard({
  video,
  isSelected = false,
  onClick,
  onToggleFavorite,
  onMove,
  onCopy,
  onDelete,
  canWrite = true,
  canDelete = true,
  className,
}: FocusVideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    onClick(video);
  };

  const handleDoubleClick = () => {
    // Could open fullscreen modal in the future
    onClick(video);
  };

  return (
    <div
      className={cn(
        "group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-[var(--radius-card)] transition-all duration-200",
        isSelected
          ? "ring-secondary scale-[1.02] shadow-[var(--shadow-soft-drop)] ring-2"
          : "hover:scale-[1.02] hover:shadow-[var(--shadow-soft-drop)]",
        "bg-card",
        className,
      )}
      onClick={handleCardClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <VideoCardContent video={video} isHovered={isHovered} formatNumber={formatNumber} />

      {/* Overlay */}
      <div className={cn("absolute inset-0 transition-colors duration-200", isHovered ? "bg-black/50" : "bg-black/0")}>
        {/* Play Button */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
            <Play className="h-6 w-6 fill-white text-white" />
          </Button>
        </div>

        {/* Platform Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={video.platform.toLowerCase() === "instagram" ? "instagram" : undefined}
            className={cn(
              "font-sans text-xs",
              video.platform.toLowerCase() !== "instagram" ? getPlatformBadgeColor(video.platform) : "",
            )}
          >
            {video.platform}
          </Badge>
        </div>

        {/* Actions */}
        <VideoCardActions
          video={video}
          isHovered={isHovered}
          onClick={onClick}
          onToggleFavorite={onToggleFavorite}
          onMove={onMove}
          onCopy={onCopy}
          onDelete={onDelete}
          canWrite={canWrite}
          canDelete={canDelete}
        />

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2">
            <div className="bg-secondary h-3 w-3 rounded-full shadow-[var(--shadow-soft-drop)]" />
          </div>
        )}
      </div>
    </div>
  );
}
