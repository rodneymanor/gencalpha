"use client";

// Content Card Component with Thumbnail and Status Indicators

import React from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  Play,
  Clock,
  Eye,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader2,
  MoreVertical,
  GripVertical,
  ExternalLink,
  Tag,
  Calendar,
  Pin,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { ContentItem, TranscriptionStatus } from "../types";

interface ContentCardProps {
  item: ContentItem;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDraggable?: boolean;
  viewMode: "grid" | "list";
}

// Transcription status indicator component
const TranscriptionIndicator: React.FC<{ status: TranscriptionStatus; progress?: number }> = ({ status, progress }) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-neutral-500",
      bgColor: "bg-neutral-100",
      label: "Pending",
    },
    processing: {
      icon: Loader2,
      color: "text-primary-600",
      bgColor: "bg-primary-100",
      label: "Processing",
      animate: true,
    },
    complete: {
      icon: CheckCircle,
      color: "text-success-600",
      bgColor: "bg-success-100",
      label: "Complete",
    },
    failed: {
      icon: AlertCircle,
      color: "text-destructive-600",
      bgColor: "bg-destructive-100",
      label: "Failed",
    },
    none: {
      icon: null,
      color: "",
      bgColor: "",
      label: "",
    },
  };

  const config = statusConfig[status];
  if (!config.icon) return null;

  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-1 rounded-full px-2 py-1", config.bgColor)}>
      <Icon className={cn("h-3 w-3", config.color, config.animate && "animate-spin")} />
      <span className={cn("text-xs font-medium", config.color)}>
        {config.label}
        {status === "processing" && progress !== undefined && ` (${Math.round(progress)}%)`}
      </span>
    </div>
  );
};

// Platform badge component
const PlatformBadge: React.FC<{ platform: string }> = ({ platform }) => {
  const platformColors = {
    youtube: "bg-red-100 text-red-700 border-red-200",
    tiktok: "bg-neutral-900 text-neutral-50",
    instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    twitter: "bg-blue-100 text-blue-700 border-blue-200",
    linkedin: "bg-blue-600 text-white",
    genc: "bg-brand-100 text-brand-700 border-brand-200",
    unknown: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };

  return (
    <Badge
      className={cn(
        "text-xs font-medium capitalize",
        platformColors[platform as keyof typeof platformColors] || platformColors.unknown,
      )}
    >
      {platform}
    </Badge>
  );
};

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  isSelected,
  onSelect,
  onClick,
  onEdit,
  onDelete,
  isDraggable = true,
  viewMode,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format view count
  const formatCount = (count?: number) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (viewMode === "list") {
    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
        className={cn(
          "group relative flex items-center gap-4 p-4",
          "border border-neutral-200 bg-neutral-50",
          "rounded-[var(--radius-card)]",
          "hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]",
          "transition-all duration-200",
          isSelected && "border-primary-400 bg-primary-50",
        )}
      >
        {/* Drag handle */}
        {isDraggable && (
          <div {...attributes} {...listeners} className="cursor-grab touch-none active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-neutral-400" />
          </div>
        )}

        {/* Selection checkbox */}
        <Checkbox checked={isSelected} onCheckedChange={onSelect} className="border-neutral-300" />

        {/* Thumbnail */}
        <div
          className="relative h-20 w-32 flex-shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-button)] bg-neutral-200"
          onClick={onClick}
        >
          {item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.title || "Content thumbnail"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Play className="h-8 w-8 text-neutral-400" />
            </div>
          )}
          {item.duration && (
            <span className="absolute right-1 bottom-1 rounded bg-black/70 px-1 text-xs text-white">
              {formatDuration(item.duration)}
            </span>
          )}
        </div>

        {/* Content info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium text-neutral-900">{item.title || "Untitled"}</h3>
              {item.creator && <p className="mt-1 text-xs text-neutral-600">{item.creator.name}</p>}
              <div className="mt-2 flex items-center gap-3">
                <PlatformBadge platform={item.platform} />
                <TranscriptionIndicator
                  status={item.transcription?.status || "none"}
                  progress={item.transcription?.progress}
                />
                {item.category && (
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              {item.viewCount !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatCount(item.viewCount)}
                </span>
              )}
              {item.likeCount !== undefined && (
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {formatCount(item.likeCount)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(item.savedAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-[var(--radius-button)] p-1 transition-colors hover:bg-neutral-200">
              <MoreVertical className="h-4 w-4 text-neutral-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onClick}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Tag className="mr-2 h-4 w-4" />
              Edit Tags
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative",
        "border border-neutral-200 bg-neutral-50",
        "rounded-[var(--radius-card)]",
        "hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]",
        "transition-all duration-200",
        "overflow-hidden",
        isSelected && "border-primary-400 bg-primary-50",
        item.isSystemContent && "border-brand-200 bg-gradient-to-br from-brand-50 to-primary-50",
        item.isPinned && "border-primary-300",
      )}
    >
      {/* Drag handle */}
      {isDraggable && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 cursor-grab touch-none rounded-[var(--radius-button)] bg-white/90 p-1 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-neutral-600" />
        </div>
      )}

      {/* Selection checkbox */}
      <div className="absolute top-2 right-2 z-10">
        <Checkbox checked={isSelected} onCheckedChange={onSelect} className="border-neutral-300 bg-white/90" />
      </div>

      {/* Pinned indicator */}
      {item.isPinned && (
        <div className="absolute top-2 left-12 z-10 rounded-full bg-primary-500 p-1.5">
          <Pin className="h-3 w-3 text-white" />
        </div>
      )}

      {/* System content indicator */}
      {item.isSystemContent && (
        <div className="absolute top-2 left-2 z-10 rounded-full bg-brand-500 p-1.5">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative aspect-video cursor-pointer bg-neutral-200" onClick={onClick}>
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.title || "Content thumbnail"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="h-12 w-12 text-neutral-400" />
          </div>
        )}
        {item.duration && (
          <span className="absolute right-2 bottom-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            {formatDuration(item.duration)}
          </span>
        )}
        {item.usedAt && (
          <div className="bg-success-500 absolute top-2 left-2 rounded-full px-2 py-1 text-xs text-white">Used</div>
        )}
      </div>

      {/* Content info */}
      <div className="p-3">
        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-neutral-900">{item.title || "Untitled"}</h3>

        {item.creator && (
          <div className="mb-2 flex items-center gap-2">
            {item.creator.avatarUrl ? (
              <img src={item.creator.avatarUrl} alt={item.creator.name} className="h-5 w-5 rounded-full" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-neutral-300" />
            )}
            <span className="text-xs text-neutral-600">{item.creator.name}</span>
          </div>
        )}

        {/* Status and platform */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <PlatformBadge platform={item.platform} />
          <TranscriptionIndicator
            status={item.transcription?.status || "none"}
            progress={item.transcription?.progress}
          />
        </div>

        {/* Content/Transcript snippet */}
        {(item.content || item.transcription?.text) && (
          <p className="mb-2 line-clamp-2 text-xs text-neutral-600">
            {item.content || item.transcription.text}
          </p>
        )}

        {/* Metrics */}
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            {item.viewCount !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatCount(item.viewCount)}
              </span>
            )}
            {item.likeCount !== undefined && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {formatCount(item.likeCount)}
              </span>
            )}
          </div>
          <span className="text-xs">{formatDistanceToNow(new Date(item.savedAt), { addSuffix: true })}</span>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Actions menu */}
      <div className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-[var(--radius-button)] bg-white/90 p-1 shadow-sm transition-colors hover:bg-white">
              <MoreVertical className="h-4 w-4 text-neutral-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onClick}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Tag className="mr-2 h-4 w-4" />
              Edit Tags
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};
