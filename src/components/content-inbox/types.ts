// Content Inbox Types

export type Platform = "youtube" | "tiktok" | "instagram" | "twitter" | "linkedin" | "genc" | "unknown";

export type TranscriptionStatus = "pending" | "processing" | "complete" | "failed" | "none";

export type ContentCategory = "inspiration" | "competitor" | "trending" | "educational";

export type ViewMode = "grid" | "list";

export interface Creator {
  id: string;
  name: string;
  platform: Platform;
  handle?: string;
  avatarUrl?: string;
  verified?: boolean;
}

export interface ContentItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
  content?: string; // For system content like getting started note
  thumbnailUrl?: string;
  platform: Platform;
  creator?: Creator;
  transcription?: {
    status: TranscriptionStatus;
    text?: string;
    progress?: number;
    error?: string;
  };
  category?: ContentCategory;
  tags?: string[];
  savedAt: Date;
  viewedAt?: Date;
  usedAt?: Date;
  duration?: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  order?: number;
  isSystemContent?: boolean; // Flag for system-generated content
  isPinned?: boolean; // Keep important content at the top
}

export interface FilterOptions {
  platforms?: Platform[];
  creators?: string[];
  categories?: ContentCategory[];
  transcriptionStatus?: TranscriptionStatus[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  searchQuery?: string;
  tags?: string[];
}

export interface SortOptions {
  field: "savedAt" | "viewCount" | "likeCount" | "duration" | "custom";
  direction: "asc" | "desc";
}

export interface BulkAction {
  type: "delete" | "categorize" | "markUsed" | "addTags" | "removeTags";
  payload?: any;
}

export interface ContentInboxState {
  items: ContentItem[];
  selectedIds: Set<string>;
  filters: FilterOptions;
  sort: SortOptions;
  viewMode: ViewMode;
  isLoading: boolean;
  hasMore: boolean;
  page: number;
}
