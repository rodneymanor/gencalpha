// Content Inbox Data Adapter
// Transforms ContentInbox items to LibraryItem format for the unified Library

import { ContentItem } from "@/components/content-inbox/types";
import { LibraryItem } from "./types";

/**
 * Maps ContentInbox Platform to LibraryItem type
 */
function mapPlatformToType(platform: string): LibraryItem["type"] {
  switch (platform.toLowerCase()) {
    case "tiktok":
    case "instagram":
    case "youtube":
      return "video";
    case "twitter":
    case "x":
      return "note";
    case "manual":
      return "note";
    default:
      return "link";
  }
}

/**
 * Determines category based on content source and platform
 */
function determineCategory(item: ContentItem): LibraryItem["category"] {
  if (item.isSystemContent) {
    return "idea";
  }
  
  // Video content from social platforms is typically inspiration/ideas
  if (["tiktok", "instagram", "youtube"].includes(item.platform.toLowerCase())) {
    return "idea";
  }
  
  // Manual entries could be ideas, scripts, or hooks based on tags
  if (item.platform.toLowerCase() === "manual") {
    if (item.tags?.includes("script")) return "script";
    if (item.tags?.includes("hooks")) return "hooks";
    return "idea";
  }
  
  return "idea";
}

/**
 * Determines status based on content item properties
 */
function determineStatus(item: ContentItem): LibraryItem["status"] {
  if (item.isSystemContent) {
    return "published";
  }
  
  if (item.usedAt) {
    return "published"; // Has been used in content creation
  }
  
  if (item.viewedAt) {
    return "reviewing"; // Has been viewed but not used
  }
  
  return "draft"; // Saved but not yet reviewed
}

/**
 * Transforms a ContentItem to a LibraryItem
 */
// eslint-disable-next-line complexity
export function contentToLibraryItem(content: ContentItem): LibraryItem {
  const type = mapPlatformToType(content.platform);
  const category = determineCategory(content);
  const status = determineStatus(content);
  
  // Estimate size based on content
  let estimatedSize: number | undefined;
  if (content.transcription?.text) {
    estimatedSize = content.transcription.text.length * 2; // Rough estimate
  } else if (content.content) {
    estimatedSize = content.content.length * 2;
  } else if (content.description) {
    estimatedSize = content.description.length * 2;
  }
  
  return {
    id: content.id,
    title: content.title ?? `${content.platform} Content`,
    description: content.description ?? content.content ?? (content.transcription?.text ? content.transcription.text.slice(0, 200) + "..." : undefined),
    type,
    category,
    status,
    author: {
      id: content.creator?.id ?? "external",
      name: content.creator?.name ?? content.creator?.handle ?? "External Creator",
      avatar: content.creator?.avatarUrl,
    },
    tags: [
      "captured", // Mark as captured/external content
      content.platform.toLowerCase(),
      ...(content.tags ?? []),
      ...(content.isPinned ? ["pinned"] : []),
      ...(content.transcription?.status === "completed" ? ["transcribed"] : []),
      ...(content.creator?.verified ? ["verified-creator"] : []),
    ].filter(Boolean),
    createdAt: new Date(content.savedAt),
    updatedAt: new Date(content.usedAt ?? content.viewedAt ?? content.savedAt),
    lastAccessedAt: content.viewedAt ? new Date(content.viewedAt) : undefined,
    size: estimatedSize,
    duration: content.duration,
    viewCount: content.viewCount ?? 0,
    rating: undefined, // Could be added based on user feedback
    progress: content.transcription?.progress,
    url: `/idea-inbox?item=${content.id}`, // Link to view in context
    thumbnail: content.thumbnailUrl,
    collaborators: [],
    metadata: {
      wordCount: content.transcription?.text ? content.transcription.text.split(" ").length : undefined,
      pageCount: undefined,
      format: content.platform,
      language: "English", // Could be detected
      // Additional metadata specific to content
      platform: content.platform,
      originalUrl: content.url,
      transcriptionStatus: content.transcription?.status,
      likes: content.likeCount,
      comments: content.commentCount,
    },
  };
}

/**
 * Transforms an array of ContentItems to LibraryItems
 */
export function contentsToLibraryItems(contents: ContentItem[]): LibraryItem[] {
  return contents.map(contentToLibraryItem);
}

/**
 * Enhanced data combiner that includes ContentInbox items
 */
export function combineAllDataSources(
  chats: unknown[], // ChatConversation[]
  contents: ContentItem[],
  mockData: LibraryItem[]
): LibraryItem[] {
  // Import the existing chat adapter
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { chatsToLibraryItems } = require("./chat-adapter") as { 
    chatsToLibraryItems: (chats: unknown[]) => LibraryItem[] 
  };
  
  const chatItems = chatsToLibraryItems(chats);
  const contentItems = contentsToLibraryItems(contents);
  
  // Combine and sort by updatedAt date, with pinned items first
  return [...chatItems, ...contentItems, ...mockData]
    .sort((a, b) => {
      // Pinned items first
      const aPinned = a.tags.includes("pinned");
      const bPinned = b.tags.includes("pinned");
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      // Then sort by date (with safety check for valid dates)
      const aTime = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
      const bTime = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
      return bTime - aTime;
    });
}
