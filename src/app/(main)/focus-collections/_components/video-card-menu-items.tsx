"use client";

import { Eye } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { Video } from "@/lib/collections";

import { VideoCardActionItems } from "./video-card-action-items";
import { VideoCardFavoriteItem } from "./video-card-favorite-item";

interface VideoCardMenuItemsProps {
  video: Video;
  onClick: (video: Video) => void;
  onToggleFavorite?: (video: Video) => void;
  onMove?: (video: Video) => void;
  onCopy?: (video: Video) => void;
  onDelete?: (video: Video) => void;
  canWrite?: boolean;
  canDelete?: boolean;
}

export function VideoCardMenuItems({
  video,
  onClick,
  onToggleFavorite,
  onMove,
  onCopy,
  onDelete,
  canWrite = true,
  canDelete = true,
}: VideoCardMenuItemsProps) {
  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation();
          onClick(video);
        }}
      >
        <Eye className="mr-2 h-4 w-4" />
        View Insights
      </DropdownMenuItem>

      {canWrite && onToggleFavorite && <VideoCardFavoriteItem video={video} onToggleFavorite={onToggleFavorite} />}

      <VideoCardActionItems
        video={video}
        onMove={onMove}
        onCopy={onCopy}
        onDelete={onDelete}
        canWrite={canWrite}
        canDelete={canDelete}
      />
    </>
  );
}
