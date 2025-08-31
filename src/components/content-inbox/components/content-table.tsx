"use client";

import React from "react";

import { formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Pin,
  Sparkles,
  ExternalLink,
  FileText,
  Video,
  Image,
  CheckCircle,
  Clock,
  AlertCircle,
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

// Determine content type
const getContentType = (item: ContentItem): { type: string; icon: React.ReactNode } => {
  // Check if it's a note (has content but no URL or platform is unknown/genc)
  if (item.platform === "genc" || item.platform === "unknown" || !item.url) {
    return { 
      type: "Note", 
      icon: <FileText className="h-4 w-4 text-neutral-500" /> 
    };
  }
  
  // Video platforms
  if (item.platform === "youtube" || item.platform === "tiktok") {
    return { 
      type: "Video", 
      icon: <Video className="h-4 w-4 text-neutral-500" /> 
    };
  }
  
  // Image/Photo platforms
  if (item.platform === "instagram") {
    return { 
      type: "Photo", 
      icon: <Image className="h-4 w-4 text-neutral-500" /> 
    };
  }
  
  // Social posts
  if (item.platform === "twitter" || item.platform === "linkedin") {
    return { 
      type: "Post", 
      icon: <FileText className="h-4 w-4 text-neutral-500" /> 
    };
  }
  
  // Default to Link for anything else
  return { 
    type: "Link", 
    icon: <ExternalLink className="h-4 w-4 text-neutral-500" /> 
  };
};

// Content type icon
const ContentTypeIcon: React.FC<{ item: ContentItem }> = ({ item }) => {
  const { icon } = getContentType(item);
  return <>{icon}</>;
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
    <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-neutral-200">
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                indeterminate={!allSelected && someSelected ? true : undefined}
                onCheckedChange={onSelectAll}
                className="border-neutral-300"
              />
            </TableHead>
            <TableHead className="min-w-[300px]">Title</TableHead>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead className="w-[120px]">Platform</TableHead>
            <TableHead className="w-[120px]">Created</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
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
                <TableCell className="min-w-[300px]">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {isPinned && (
                        <Pin className="h-3 w-3 text-primary-500" />
                      )}
                      {isSystemContent && (
                        <Sparkles className="h-3 w-3 text-brand-500" />
                      )}
                      <ContentTypeIcon item={item} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-neutral-900 line-clamp-1 break-words whitespace-normal">
                        {item.title ?? "Untitled"}
                      </span>
                      {item.description && (
                        <span className="text-xs text-neutral-600 line-clamp-1 break-words whitespace-normal">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="w-[100px]">
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const { type, icon } = getContentType(item);
                      return (
                        <>
                          {icon}
                          <span className="text-sm text-neutral-700">{type}</span>
                        </>
                      );
                    })()}
                  </div>
                </TableCell>
                <TableCell className="w-[120px]">
                  <PlatformBadge platform={item.platform} />
                </TableCell>
                <TableCell className="w-[120px]">
                  <div className="flex items-center gap-1 text-xs text-neutral-600 whitespace-normal">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="break-words">{formatDistanceToNow(new Date(item.savedAt), { addSuffix: true })}</span>
                  </div>
                </TableCell>
                <TableCell className="w-[120px]">
                  <div className="flex items-center gap-1.5">
                    {item.transcription?.status === 'completed' || item.isSystemContent ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-success-600" />
                        <span className="text-xs text-success-700">Ready</span>
                      </>
                    ) : item.transcription?.status === 'processing' ? (
                      <>
                        <Clock className="h-3.5 w-3.5 text-warning-600 animate-pulse" />
                        <span className="text-xs text-warning-700">Processing</span>
                      </>
                    ) : item.transcription?.status === 'failed' ? (
                      <>
                        <AlertCircle className="h-3.5 w-3.5 text-destructive-600" />
                        <span className="text-xs text-destructive-700">Failed</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-xs text-neutral-500">Pending</span>
                      </>
                    )}
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
      </div>
      
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