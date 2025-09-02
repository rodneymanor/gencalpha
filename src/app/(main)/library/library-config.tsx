// Library Configuration
// Separated configuration for the Library page to maintain clean code organization

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
  Zap,
  Sparkles,
  Globe,
  Play,
  Camera,
  Music,
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

// Platform icon mapping
const PlatformIcon: Record<string, React.ReactNode> = {
  chat: <MessageSquare className="h-3 w-3" />,
  tiktok: <Music className="h-3 w-3" />,
  instagram: <Camera className="h-3 w-3" />,
  youtube: <Play className="h-3 w-3" />,
  twitter: <Globe className="h-3 w-3" />,
  manual: <Edit className="h-3 w-3" />,
};

// Platform badge component
const PlatformBadge: React.FC<{ platform: string; className?: string }> = ({ platform, className = "" }) => {
  const icon = PlatformIcon[platform] ?? <Globe className="h-3 w-3" />;
  const label = platform.charAt(0).toUpperCase() + platform.slice(1);
  
  return (
    <div className={`inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 ${className}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
};

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
          {item.tags.includes('chat') ? <MessageSquare className="h-4 w-4" /> : TypeIcon[item.type]}
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
              {/* Show platform badge first if it exists */}
              {item.tags.find(tag => ['tiktok', 'instagram', 'youtube', 'twitter', 'chat', 'manual'].includes(tag)) && (
                <PlatformBadge 
                  platform={item.tags.find(tag => ['tiktok', 'instagram', 'youtube', 'twitter', 'chat', 'manual'].includes(tag))!}
                />
              )}
              {/* Show other tags */}
              {item.tags
                .filter(tag => !['captured', 'generated', 'tiktok', 'instagram', 'youtube', 'twitter', 'chat', 'manual'].includes(tag))
                .slice(0, 2)
                .map((tag) => (
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
    render: (item) => {
      const platformTag = item.tags.find(tag => ['tiktok', 'instagram', 'youtube', 'twitter', 'chat', 'manual'].includes(tag));
      const icon = platformTag ? PlatformIcon[platformTag] : TypeIcon[item.type];
      const label = platformTag === 'chat' ? 'Chat' : item.type;
      
      return (
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-sm capitalize text-neutral-700">{label}</span>
        </div>
      );
    },
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
    key: "status",
    header: "Status",
    width: "w-[120px]",
  },
  {
    key: "createdAt",
    header: "Created Date",
    width: "w-[150px]",
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-1 text-xs text-neutral-600">
        <Calendar className="h-3 w-3" />
        {formatDistanceToNow(item.createdAt, { addSuffix: true })}
      </div>
    ),
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
  description: "All your content in one place - chats, inspiration, and resources",
  icon: <BookOpen className="h-6 w-6" />,
  
  columns,
  
  filters: [
    {
      key: "contentSource",
      label: "Source",
      type: "multiselect",
      icon: <Zap className="mr-2 h-4 w-4" />,
      options: [
        { value: "chat", label: "Chat Conversations" },
        { value: "captured", label: "Captured Content" },
      ],
    },
    {
      key: "type",
      label: "Type",
      type: "multiselect",
      icon: <Filter className="mr-2 h-4 w-4" />,
      options: [
        { value: "chat", label: "Chat" },
        { value: "tiktok", label: "TikTok" },
        { value: "instagram", label: "Instagram" },
        { value: "note", label: "Note" },
      ],
    },
    {
      key: "platform",
      label: "Platform",
      type: "multiselect",
      icon: <Globe className="mr-2 h-4 w-4" />,
      options: [
        { value: "tiktok", label: "TikTok" },
        { value: "instagram", label: "Instagram" },
        { value: "youtube", label: "YouTube" },
        { value: "twitter", label: "Twitter/X" },
      ],
    },
    {
      key: "category",
      label: "Category",
      type: "multiselect",
      icon: <FolderOpen className="mr-2 h-4 w-4" />,
      options: [
        { value: "idea", label: "Idea" },
        { value: "script", label: "Script" },
        { value: "hooks", label: "Hooks" },
      ],
    },
  ],
  
  statusConfig,
  statusField: "status",
  
  enableSearch: true,
  searchPlaceholder: "Search all your content - chats, videos, ideas, and resources...",
  searchFields: ["title", "description"],
  
  defaultSort: { field: "updatedAt", direction: "desc" },
  sortOptions: [
    { field: "title", label: "Title" },
    { field: "updatedAt", label: "Last Modified" },
    { field: "createdAt", label: "Date Created" },
  ],
  
  
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
    title: "Your unified library awaits",
    description: "All your content will appear here - chat conversations, captured inspiration from social media, and saved resources.",
    icon: <Sparkles className="h-16 w-16" />,
    action: {
      label: "Start Creating",
      handler: () => {
        window.location.href = "/write";
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