"use client";

import { Eye, RefreshCw } from "lucide-react";

import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useRBAC } from "@/hooks/use-rbac";
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
  const { isSuperAdmin } = useRBAC();
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

      {/* Super-admin reprocess action */}
      {isSuperAdmin && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async (e) => {
              e.stopPropagation();
              try {
                if (!video.id) return;
                const res = await fetch("/api/videos/reprocess", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-internal-secret": process.env.NEXT_PUBLIC_INTERNAL_API_SECRET ?? "",
                  },
                  body: JSON.stringify({ videoId: video.id }),
                });
                if (!res.ok) {
                  console.error("Reprocess failed", await res.text());
                }
              } catch (err) {
                console.error("Reprocess error", err);
              }
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reprocess Video
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}
