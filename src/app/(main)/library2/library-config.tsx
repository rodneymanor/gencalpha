// Library Configuration
// Separated configuration for the Library2 page to maintain clean code organization

import React from "react";
import {
  BookOpen,
  FileText,
  Video,
  Mic,
  Image as ImageIcon,
  Link,
  Plus,
  Edit,
  Trash2,
  Download,
  Share2,
  Star,
  Archive,
  FolderOpen,
  Calendar,
  User,
  Tag,
  Filter,
  Clock,
  CheckCircle,
  Eye,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import {
  DataTableTemplateConfig,
  ColumnConfig,
  BulkActionConfig,
  StatusConfig,
} from "@/components/templates/data-table-template";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { LibraryItem, TypeIcon, formatFileSize, formatDuration } from "./types";

// Column configuration
export const columns: ColumnConfig<LibraryItem>[] = [
  {
    key: "title",
    header: "Title",
    width: "min-w-[300px]",
    sortable: true,
    searchable: true,
    render: (item) => (
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] bg-neutral-100 text-neutral-600">
          {item.tags?.includes('chat') ? <MessageSquare className="h-4 w-4" /> : TypeIcon[item.type]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-900">{item.title}</span>
            {item.rating && item.rating >= 4 && (
              <Star className="h-3 w-3 fill-brand-500 text-brand-500" />
            )}
            {item.progress !== undefined && item.progress > 0 && item.progress < 100 && (
              <div className="flex items-center gap-1">
                <Progress value={item.progress} className="h-1.5 w-12" />
                <span className="text-xs text-neutral-500">{item.progress}%</span>
              </div>
            )}
          </div>
          {item.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-neutral-600">
              {item.description}
            </p>
          )}
          {item.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs text-neutral-500">+{item.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "type",
    header: "Type",
    width: "w-[100px]",
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-1.5">
        {item.tags?.includes('chat') ? <MessageSquare className="h-4 w-4" /> : TypeIcon[item.type]}
        <span className="text-sm capitalize text-neutral-700">
          {item.tags?.includes('chat') ? 'Chat' : item.type}
        </span>
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    width: "w-[120px]",
    sortable: true,
    render: (item) => (
      <Badge variant="outline" className="capitalize">
        {item.category}
      </Badge>
    ),
  },
  {
    key: "author",
    header: "Author",
    width: "w-[150px]",
    sortable: true,
    searchable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700">
          {item.author.name.charAt(0)}
        </div>
        <span className="text-sm text-neutral-700">{item.author.name}</span>
      </div>
    ),
  },
  {
    key: "size",
    header: "Size",
    width: "w-[100px]",
    sortable: true,
    render: (item) => (
      <span className="text-sm text-neutral-600">
        {item.duration ? formatDuration(item.duration) : formatFileSize(item.size)}
      </span>
    ),
  },
  {
    key: "viewCount",
    header: "Views",
    width: "w-[100px]",
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-1">
        <Eye className="h-3 w-3 text-neutral-400" />
        <span className="text-sm text-neutral-600">{item.viewCount}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    width: "w-[120px]",
  },
  {
    key: "updatedAt",
    header: "Last Modified",
    width: "w-[150px]",
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-1 text-xs text-neutral-600">
        <Clock className="h-3 w-3" />
        {formatDistanceToNow(item.updatedAt, { addSuffix: true })}
      </div>
    ),
  },
];

// Bulk actions configuration
export const bulkActions: BulkActionConfig<LibraryItem>[] = [
  {
    key: "delete",
    label: "Delete",
    icon: <Trash2 className="mr-2 h-4 w-4" />,
    variant: "destructive",
    confirmRequired: true,
    confirmMessage: "Are you sure you want to delete these items? This action cannot be undone.",
    handler: async (items) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Deleted ${items.length} items`);
    },
  },
  {
    key: "archive",
    label: "Archive",
    icon: <Archive className="mr-2 h-4 w-4" />,
    handler: async (items) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(`Archived ${items.length} items`);
    },
  },
  {
    key: "share",
    label: "Share",
    icon: <Share2 className="mr-2 h-4 w-4" />,
    handler: async () => {
      toast.info("Share dialog would open here");
    },
  },
  {
    key: "download",
    label: "Download",
    icon: <Download className="mr-2 h-4 w-4" />,
    handler: async (items) => {
      toast.info(`Downloading ${items.length} items...`);
    },
  },
  {
    key: "addTags",
    label: "Add Tags",
    icon: <Tag className="mr-2 h-4 w-4" />,
    handler: async () => {
      toast.info("Tag management dialog would open here");
    },
  },
];

// Status configuration
export const statusConfig: StatusConfig[] = [
  {
    key: "draft",
    label: "Draft",
    color: "neutral",
    icon: <Edit className="mr-1 h-3 w-3" />,
  },
  {
    key: "reviewing",
    label: "Reviewing",
    color: "warning",
    icon: <Clock className="mr-1 h-3 w-3" />,
  },
  {
    key: "published",
    label: "Published",
    color: "success",
    icon: <CheckCircle className="mr-1 h-3 w-3" />,
  },
  {
    key: "archived",
    label: "Archived",
    color: "neutral",
    icon: <Archive className="mr-1 h-3 w-3" />,
  },
];

// Main template configuration
export const getLibraryConfig = (): DataTableTemplateConfig<LibraryItem> => ({
  title: "Library",
  description: "Manage and organize your digital resources",
  icon: <BookOpen className="h-6 w-6" />,
  
  columns,
  
  filters: [
    {
      key: "type",
      label: "Type",
      type: "multiselect",
      icon: <Filter className="mr-2 h-4 w-4" />,
      options: [
        { value: "document", label: "Document" },
        { value: "video", label: "Video" },
        { value: "audio", label: "Audio" },
        { value: "image", label: "Image" },
        { value: "link", label: "Link" },
        { value: "note", label: "Note / Chat" },
      ],
    },
    {
      key: "category",
      label: "Category",
      type: "multiselect",
      icon: <FolderOpen className="mr-2 h-4 w-4" />,
      options: [
        { value: "research", label: "Research" },
        { value: "reference", label: "Reference" },
        { value: "tutorial", label: "Tutorial" },
        { value: "inspiration", label: "Inspiration" },
        { value: "archive", label: "Archive" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { value: "draft", label: "Draft" },
        { value: "reviewing", label: "Reviewing" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      key: "author",
      label: "Author",
      type: "multiselect",
      icon: <User className="mr-2 h-4 w-4" />,
      options: [
        { value: "user-1", label: "Alex Johnson" },
        { value: "user-2", label: "Sarah Chen" },
        { value: "user-3", label: "Mike Williams" },
      ],
    },
    {
      key: "dateRange",
      label: "Date Range",
      type: "daterange",
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      key: "hasRating",
      label: "Has Rating",
      type: "boolean",
    },
  ],
  
  statusConfig,
  statusField: "status",
  
  enableSearch: true,
  searchPlaceholder: "Search library items and chat conversations...",
  searchFields: ["title", "description"],
  
  defaultSort: { field: "updatedAt", direction: "desc" },
  sortOptions: [
    { field: "title", label: "Title" },
    { field: "updatedAt", label: "Last Modified" },
    { field: "createdAt", label: "Date Created" },
    { field: "viewCount", label: "Most Viewed" },
    { field: "size", label: "File Size" },
  ],
  
  viewModes: ["table", "grid", "list"],
  defaultViewMode: "table",
  
  bulkActions,
  
  itemActions: [
    {
      key: "view",
      label: "View",
      icon: <Eye className="mr-2 h-4 w-4" />,
      handler: (item) => {
        toast.info(`Opening ${item.title}`);
      },
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Edit className="mr-2 h-4 w-4" />,
      handler: (item) => {
        toast.info(`Editing ${item.title}`);
      },
    },
    {
      key: "download",
      label: "Download",
      icon: <Download className="mr-2 h-4 w-4" />,
      handler: (item) => {
        toast.success(`Downloading ${item.title}`);
      },
    },
    {
      key: "share",
      label: "Share",
      icon: <Share2 className="mr-2 h-4 w-4" />,
      handler: () => {
        toast.info("Share dialog would open");
      },
    },
    {
      key: "favorite",
      label: "Add to Favorites",
      icon: <Star className="mr-2 h-4 w-4" />,
      handler: (item) => {
        toast.success(`Added ${item.title} to favorites`);
      },
    },
  ],
  
  enableSelection: true,
  enableBulkActions: true,
  enableInfiniteScroll: false,
  enableDragAndDrop: true,
  
  emptyState: {
    title: "No library items or chats yet",
    description: "Start building your knowledge base by adding documents, videos, chats, and other resources.",
    icon: <BookOpen className="h-16 w-16" />,
    action: {
      label: "Add First Item",
      handler: () => {
        toast.info("Add item dialog would open");
      },
    },
  },
  
  addAction: {
    label: "Add Resource",
    icon: <Plus className="mr-2 h-4 w-4" />,
    handler: () => {
      toast.info("Add resource dialog would open");
    },
  },
  
  onItemClick: (item) => {
    console.log("Item clicked:", item);
  },
});