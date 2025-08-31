"use client";

import React from "react";

import { formatDistanceToNow } from "date-fns";
import {
  X,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  Calendar,
  Tag,
  FileText,
  Video,
  Image,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { ContentItem } from "../types";

interface ContentViewerProps {
  item: ContentItem | null;
  onClose: () => void;
  onEdit?: (item: ContentItem) => void;
  onDelete?: (id: string) => void;
  onCopyTranscript?: (text: string) => void;
}

// Format count for display
const formatCount = (count?: number) => {
  if (!count) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export const ContentViewer: React.FC<ContentViewerProps> = ({
  item,
  onClose,
  onEdit,
  onDelete,
  onCopyTranscript,
}) => {
  if (!item) return null;

  const handleCopyTranscript = () => {
    const textToCopy = item.content || item.transcription?.text || "";
    if (textToCopy && onCopyTranscript) {
      onCopyTranscript(textToCopy);
      navigator.clipboard.writeText(textToCopy);
    }
  };

  const handleOpenExternal = () => {
    if (item.url) {
      window.open(item.url, "_blank");
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-neutral-900">Content Details</h2>
        <button
          onClick={onClose}
          className="rounded-[var(--radius-button)] p-1.5 transition-colors hover:bg-neutral-100"
        >
          <X className="h-5 w-5 text-neutral-600" />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Title and Description */}
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              {item.title || "Untitled Content"}
            </h3>
            {item.description && (
              <p className="text-neutral-600">{item.description}</p>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Platform
                </span>
                <div className="mt-1">
                  <Badge className="capitalize">{item.platform}</Badge>
                </div>
              </div>

              {item.category && (
                <div>
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Category
                  </span>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              )}

              {item.creator && (
                <div>
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Creator
                  </span>
                  <p className="mt-1 text-sm text-neutral-900">{item.creator.name}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Saved
                </span>
                <div className="mt-1 flex items-center gap-1 text-sm text-neutral-600">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(item.savedAt), { addSuffix: true })}
                </div>
              </div>

              {item.duration && (
                <div>
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Duration
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-sm text-neutral-600">
                    <Clock className="h-3 w-3" />
                    {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, "0")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metrics */}
          {(item.viewCount !== undefined || item.likeCount !== undefined || item.commentCount !== undefined) && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-neutral-900 mb-3">Engagement Metrics</h4>
                <div className="grid grid-cols-3 gap-4">
                  {item.viewCount !== undefined && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-neutral-500 mb-1">
                        <Eye className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-semibold text-neutral-900">
                        {formatCount(item.viewCount)}
                      </p>
                      <p className="text-xs text-neutral-500">Views</p>
                    </div>
                  )}
                  {item.likeCount !== undefined && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-neutral-500 mb-1">
                        <Heart className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-semibold text-neutral-900">
                        {formatCount(item.likeCount)}
                      </p>
                      <p className="text-xs text-neutral-500">Likes</p>
                    </div>
                  )}
                  {item.commentCount !== undefined && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-neutral-500 mb-1">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-semibold text-neutral-900">
                        {formatCount(item.commentCount)}
                      </p>
                      <p className="text-xs text-neutral-500">Comments</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-neutral-900 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Transcript/Content */}
          {(item.content || item.transcription?.text) && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-neutral-900">
                    {item.isSystemContent ? "Content" : "Transcript"}
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyTranscript}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                    {item.content || item.transcription?.text}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Thumbnail */}
          {item.thumbnailUrl && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-neutral-900 mb-3">Preview</h4>
                <div className="rounded-[var(--radius-card)] overflow-hidden border border-neutral-200">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title || "Content thumbnail"}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="border-t border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenExternal}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open Original
          </Button>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            {onDelete && !item.isSystemContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="gap-2 text-destructive-600 hover:text-destructive-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};