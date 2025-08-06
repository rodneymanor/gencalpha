"use client";

import { Star, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Video } from "@/lib/collections";

import { VideoCardMenuItems } from "./video-card-menu-items";

interface VideoCardActionsProps {
  video: Video;
  isHovered: boolean;
  onClick: (video: Video) => void;
  onToggleFavorite?: (video: Video) => void;
  onMove?: (video: Video) => void;
  onCopy?: (video: Video) => void;
  onDelete?: (video: Video) => void;
  canWrite?: boolean;
  canDelete?: boolean;
}

export function VideoCardActions({
  video,
  isHovered,
  onClick,
  onToggleFavorite,
  onMove,
  onCopy,
  onDelete,
  canWrite = true,
  canDelete = true,
}: VideoCardActionsProps) {
  return (
    <div className="absolute top-3 right-3 left-3 flex items-start justify-between">
      <div className="flex flex-col gap-2">{video.favorite && <Star className="fill-brand text-brand h-4 w-4" />}</div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 bg-white/20 backdrop-blur-sm transition-opacity hover:bg-white/30 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <VideoCardMenuItems
            video={video}
            onClick={onClick}
            onToggleFavorite={onToggleFavorite}
            onMove={onMove}
            onCopy={onCopy}
            onDelete={onDelete}
            canWrite={canWrite}
            canDelete={canDelete}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
