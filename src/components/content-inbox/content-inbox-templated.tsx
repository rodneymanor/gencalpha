"use client";

// Content Inbox - Templated Version
// Refactored to use the DataTableTemplate for better reusability

import React, { useState, useMemo } from "react";

import { formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Pin,
  Sparkles,
  FileText,
  Video,
  Image,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Tag as TagIcon,
  FolderPlus,
  Filter,
  ArrowUpNarrowWide,
  Plus,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

import {
  DataTableTemplate,
  DataTableTemplateConfig,
  BaseItem,
  ColumnConfig,
  BulkActionConfig,
} from "@/components/templates/data-table-template";
import { Badge } from "@/components/ui/badge";
import { UnifiedSlideout, ClaudeArtifactConfig } from "@/components/ui/unified-slideout";

import { AddIdeaPanel } from "./components/AddIdeaPanel";
import { ContentViewer } from "./components/content-viewer";
import { useContentItems, useDeleteContent, useBulkAction } from "./hooks/use-content-inbox";
import { ContentItem, Platform } from "./types";

// Extend ContentItem to match BaseItem interface
interface TemplatedContentItem extends ContentItem, BaseItem {}

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
    <Badge className={`text-xs font-medium capitalize ${config.bg} ${config.text} ${config.border}`}>
      {platform === "genc" ? "Gen.C" : platform}
    </Badge>
  );
};

// Get content type icon
const getContentTypeIcon = (item: ContentItem) => {
  if (item.platform === "genc" || item.platform === "unknown" || !item.url) {
    return <FileText className="h-4 w-4 text-neutral-500" />;
  }
  if (item.platform === "youtube" || item.platform === "tiktok") {
    return <Video className="h-4 w-4 text-neutral-500" />;
  }
  if (item.platform === "instagram") {
    return <Image className="h-4 w-4 text-neutral-500" />;
  }
  return <ExternalLink className="h-4 w-4 text-neutral-500" />;
};

// Get content type label
const getContentTypeLabel = (item: ContentItem): string => {
  if (item.platform === "genc" || item.platform === "unknown" || !item.url) {
    return "Note";
  }
  if (item.platform === "youtube" || item.platform === "tiktok") {
    return "Video";
  }
  if (item.platform === "instagram") {
    return "Photo";
  }
  if (item.platform === "twitter" || item.platform === "linkedin") {
    return "Post";
  }
  return "Link";
};

interface ContentInboxTemplatedProps {
  className?: string;
}

export const ContentInboxTemplated: React.FC<ContentInboxTemplatedProps> = ({ className }) => {
  const [isAddSlideoutOpen, setIsAddSlideoutOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ field: "savedAt", direction: "desc" as const });

  // Fetch data
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = useContentItems(
    filters,
    sort,
  );

  const deleteContentMutation = useDeleteContent();
  const bulkActionMutation = useBulkAction();

  // Flatten pages into items array
  const items = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items ?? []) as TemplatedContentItem[];
  }, [data]);

  // Column configuration
  const columns: ColumnConfig<TemplatedContentItem>[] = [
    {
      key: "title",
      header: "Title",
      width: "min-w-[300px]",
      sortable: true,
      searchable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {item.isPinned && <Pin className="text-primary-500 h-3 w-3" />}
            {item.isSystemContent && <Sparkles className="text-brand-500 h-3 w-3" />}
            {getContentTypeIcon(item)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="line-clamp-1 font-medium text-neutral-900">{item.title ?? "Untitled"}</span>
            {item.description && <span className="line-clamp-1 text-xs text-neutral-600">{item.description}</span>}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: "w-[100px]",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          {getContentTypeIcon(item)}
          <span className="text-sm text-neutral-700">{getContentTypeLabel(item)}</span>
        </div>
      ),
    },
    {
      key: "platform",
      header: "Platform",
      width: "w-[120px]",
      render: (item) => <PlatformBadge platform={item.platform} />,
    },
    {
      key: "savedAt",
      header: "Created",
      width: "w-[120px]",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1 text-xs text-neutral-600">
          <Calendar className="h-3 w-3" />
          {formatDistanceToNow(new Date(item.savedAt), { addSuffix: true })}
        </div>
      ),
    },
    {
      key: "transcription",
      header: "Status",
      width: "w-[120px]",
      render: (item) => {
        const status = item.transcription?.status;
        if (status === "complete" || item.isSystemContent) {
          return (
            <div className="flex items-center gap-1.5">
              <CheckCircle className="text-success-600 h-3.5 w-3.5" />
              <span className="text-success-700 text-xs">Ready</span>
            </div>
          );
        }
        if (status === "processing") {
          return (
            <div className="flex items-center gap-1.5">
              <Clock className="text-warning-600 h-3.5 w-3.5 animate-pulse" />
              <span className="text-warning-700 text-xs">Processing</span>
            </div>
          );
        }
        if (status === "failed") {
          return (
            <div className="flex items-center gap-1.5">
              <AlertCircle className="text-destructive-600 h-3.5 w-3.5" />
              <span className="text-destructive-700 text-xs">Failed</span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-xs text-neutral-500">Pending</span>
          </div>
        );
      },
    },
  ];

  // Bulk actions configuration
  const bulkActions: BulkActionConfig<TemplatedContentItem>[] = [
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      variant: "destructive",
      confirmRequired: true,
      handler: async (items) => {
        const ids = items.map((item) => item.id);
        await deleteContentMutation.mutateAsync(ids);
        toast.success(`Deleted ${items.length} items`);
      },
    },
    {
      key: "categorize",
      label: "Categorize",
      icon: <FolderPlus className="mr-2 h-4 w-4" />,
      handler: async (items) => {
        // In a real implementation, this would open a dialog
        const ids = items.map((item) => item.id);
        await bulkActionMutation.mutateAsync({
          ids,
          action: { type: "categorize", payload: { category: "inspiration" } },
        });
        toast.success("Items categorized");
      },
    },
    {
      key: "addTags",
      label: "Add Tags",
      icon: <TagIcon className="mr-2 h-4 w-4" />,
      handler: async (items) => {
        // In a real implementation, this would open a dialog
        const ids = items.map((item) => item.id);
        await bulkActionMutation.mutateAsync({
          ids,
          action: { type: "addTags", payload: { tags: ["important"] } },
        });
        toast.success("Tags added");
      },
    },
  ];

  // Template configuration
  const templateConfig: DataTableTemplateConfig<TemplatedContentItem> = {
    title: "Idea Inbox",
    description: "Manage your content ideas and inspirations",
    icon: <Inbox className="h-6 w-6" />,

    columns,

    filters: [
      {
        key: "platform",
        label: "Platform",
        type: "multiselect",
        icon: <Filter className="mr-2 h-4 w-4" />,
        options: [
          { value: "youtube", label: "YouTube" },
          { value: "tiktok", label: "TikTok" },
          { value: "instagram", label: "Instagram" },
          { value: "twitter", label: "Twitter" },
          { value: "linkedin", label: "LinkedIn" },
        ],
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "pending", label: "Pending" },
          { value: "processing", label: "Processing" },
          { value: "complete", label: "Complete" },
          { value: "failed", label: "Failed" },
        ],
      },
      {
        key: "category",
        label: "Category",
        type: "multiselect",
        icon: <TagIcon className="mr-2 h-4 w-4" />,
        options: [
          { value: "inspiration", label: "Inspiration" },
          { value: "competitor", label: "Competitor" },
          { value: "trending", label: "Trending" },
          { value: "educational", label: "Educational" },
        ],
      },
      {
        key: "date",
        label: "Date",
        type: "daterange",
        icon: <Calendar className="mr-2 h-4 w-4" />,
      },
      {
        key: "sort",
        label: "Sort",
        type: "select",
        icon: <ArrowUpNarrowWide className="mr-2 h-4 w-4" />,
        options: [
          { value: "savedAt", label: "Date Created" },
          { value: "title", label: "Title" },
          { value: "platform", label: "Platform" },
        ],
      },
    ],

    enableSearch: true,
    searchPlaceholder: "Search by title, creator, or transcript...",
    searchFields: ["title", "description", "content"],

    defaultSort: { field: "savedAt", direction: "desc" },

    viewModes: ["table", "grid", "list"],
    defaultViewMode: "table",

    bulkActions,

    enableSelection: true,
    enableBulkActions: true,
    enableInfiniteScroll: true,

    emptyState: {
      title: "No content saved yet",
      description: "Start building your content library by adding videos and links you want to reference later.",
      icon: <Inbox className="h-16 w-16" />,
      action: {
        label: "Add First Content",
        handler: () => setIsAddSlideoutOpen(true),
      },
    },

    addAction: {
      label: "New Idea",
      icon: <Plus className="mr-2 h-4 w-4" />,
      handler: () => setIsAddSlideoutOpen(true),
    },

    onItemClick: (item) => setSelectedItem(item),

    className,
  };

  // Data result for the template
  const dataResult = {
    items,
    isLoading,
    isError,
    hasMore: hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    totalCount: data?.pages?.[0]?.totalCount,
  };

  return (
    <>
      <DataTableTemplate
        config={templateConfig}
        data={dataResult}
        events={{
          onFilterChange: setFilters,
          onSortChange: setSort,
        }}
        className={className}
      />

      {/* Content Viewer Slideout */}
      <UnifiedSlideout
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        config={{
          ...ClaudeArtifactConfig,
          width: "lg",
          showHeader: false,
          showCloseButton: false,
        }}
      >
        <ContentViewer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={() => {
            setSelectedItem(null);
            toast.info("Edit functionality coming soon");
          }}
          onDelete={async (id) => {
            await deleteContentMutation.mutateAsync([id]);
            setSelectedItem(null);
            toast.success("Content deleted");
          }}
          onCopyTranscript={() => toast.success("Transcript copied to clipboard")}
        />
      </UnifiedSlideout>

      {/* Add Idea Panel */}
      <AddIdeaPanel
        isOpen={isAddSlideoutOpen}
        onClose={() => setIsAddSlideoutOpen(false)}
        onSuccess={() => refetch()}
      />
    </>
  );
};
