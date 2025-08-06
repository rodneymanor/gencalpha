"use client";

import { Trash2, Copy, Move } from "lucide-react";

import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import type { Video } from "@/lib/collections";

interface VideoCardActionItemsProps {
  video: Video;
  onMove?: (video: Video) => void;
  onCopy?: (video: Video) => void;
  onDelete?: (video: Video) => void;
  canWrite?: boolean;
  canDelete?: boolean;
}

export function VideoCardActionItems({
  video,
  onMove,
  onCopy,
  onDelete,
  canWrite = true,
  canDelete = true,
}: VideoCardActionItemsProps) {
  const hasWriteActions = Boolean(onMove) || Boolean(onCopy);

  return (
    <>
      {canWrite && hasWriteActions && (
        <>
          <DropdownMenuSeparator />
          {onMove && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onMove(video);
              }}
            >
              <Move className="mr-2 h-4 w-4" />
              Move to Collection
            </DropdownMenuItem>
          )}
          {onCopy && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onCopy(video);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy to Collection
            </DropdownMenuItem>
          )}
        </>
      )}

      {canDelete && onDelete && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete(video);
            }}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}
