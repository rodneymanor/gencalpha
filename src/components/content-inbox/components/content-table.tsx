"use client";

import React from "react";

import { formatDistanceToNow } from "date-fns";
import {
  Eye,
  Heart,
  Calendar,
  Pin,
  Sparkles,
  ExternalLink,
  FileText,
  Video,
  Image,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { ContentItem, Platform } from "../types";

interface ContentTableProps {
  items: ContentItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onItemClick: (item: ContentItem) => void;
  isLoading?: boolean;
}

// Platform badge component
const PlatformBadge: React.FC<{ platform: Platform }> = ({ platform }) => {
  const platformConfig = {
    youtube: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
    tiktok: { bg: "bg-neutral-900", text: "text-neutral-50", border: "border-neutral-800" },
    instagram: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
    twitter: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    linkedin: { bg: "bg-blue-600", text: "text-white", border: "border-blue-700" },
    genc: { bg: "bg-brand-100", text: "text-brand-700", border: "border-brand-200" },
    unknown: { bg: "bg-neutral-100", text: "text-neutral-600", border: "border-neutral-200" },
  };

  const config = platformConfig[platform] || platformConfig.unknown;
  
  return (
    <Badge
      className={cn(
        "text-xs font-medium capitalize",
        config.bg,
        config.text,
        config.border,
      )}
    >
      {platform === "genc" ? "Gen.C" : platform}
    </Badge>
  );
};

// Content type icon
const ContentTypeIcon: React.FC<{ item: ContentItem }> = ({ item }) => {
  // Determine content type based on available data
  if (item.thumbnailUrl || item.platform === "youtube" || item.platform === "tiktok") {
    return <Video className="h-4 w-4 text-neutral-500" />;
  }
  if (item.platform === "instagram") {
    return <Image className="h-4 w-4 text-neutral-500" />;
  }
  return <FileText className="h-4 w-4 text-neutral-500" />;
};

// Format count for display
const formatCount = (count?: number) => {
  if (!count) return "—";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export const ContentTable: React.FC<ContentTableProps> = ({
  items,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onItemClick,
  isLoading = false,
}) => {
  const allSelected = items.length > 0 && items.every(item => selectedIds.has(item.id));
  const someSelected = items.some(item => selectedIds.has(item.id));

  return (
    <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-neutral-200">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                indeterminate={!allSelected && someSelected}
                onCheckedChange={onSelectAll}
                className="border-neutral-300"
              />
            </TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-32">Platform</TableHead>
            <TableHead className="w-32">Category</TableHead>
            <TableHead className="w-24 text-right">Views</TableHead>
            <TableHead className="w-24 text-right">Likes</TableHead>
            <TableHead className="w-32">Saved</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const isSystemContent = item.isSystemContent;
            const isPinned = item.isPinned;

            return (
              <TableRow
                key={item.id}
                className={cn(
                  "cursor-pointer hover:bg-neutral-100 transition-colors",
                  isSelected && "bg-primary-50 hover:bg-primary-100",
                  isSystemContent && "bg-gradient-to-r from-brand-50 to-primary-50",
                )}
                onClick={() => onItemClick(item)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onToggleSelect(item.id, !!checked)}
                    className="border-neutral-300"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {isPinned && (
                      <Pin className="h-3 w-3 text-primary-500" />
                    )}
                    {isSystemContent && (
                      <Sparkles className="h-3 w-3 text-brand-500" />
                    )}
                    <ContentTypeIcon item={item} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-neutral-900 line-clamp-1">
                      {item.title ?? "Untitled"}
                    </span>
                    {item.description && (
                      <span className="text-xs text-neutral-600 line-clamp-1">
                        {item.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <PlatformBadge platform={item.platform} />
                </TableCell>
                <TableCell>
                  {item.category && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.category}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right text-sm text-neutral-600">
                  {formatCount(item.viewCount)}
                </TableCell>
                <TableCell className="text-right text-sm text-neutral-600">
                  {formatCount(item.likeCount)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(item.savedAt), { addSuffix: true })}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <button className="p-1 hover:bg-neutral-200 rounded transition-colors">
                    <ExternalLink className="h-4 w-4 text-neutral-600" />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {items.length === 0 && !isLoading && (
        <div className="py-12 text-center">
          <p className="text-neutral-600">No content items yet</p>
          <p className="text-sm text-neutral-500 mt-1">
            Add your first piece of content to get started
          </p>
        </div>
      )}
    </div>
  );
};