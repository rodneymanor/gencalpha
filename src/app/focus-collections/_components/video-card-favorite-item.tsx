"use client";

import { Star, StarOff } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { Video } from "@/lib/collections";

interface VideoCardFavoriteItemProps {
  video: Video;
  onToggleFavorite: (video: Video) => void;
}

export function VideoCardFavoriteItem({ video, onToggleFavorite }: VideoCardFavoriteItemProps) {
  return (
    <DropdownMenuItem
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite(video);
      }}
    >
      {video.favorite ? (
        <>
          <StarOff className="mr-2 h-4 w-4" />
          Remove from favorites
        </>
      ) : (
        <>
          <Star className="mr-2 h-4 w-4" />
          Add to favorites
        </>
      )}
    </DropdownMenuItem>
  );
}
