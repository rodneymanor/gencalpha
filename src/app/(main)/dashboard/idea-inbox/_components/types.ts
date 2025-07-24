export interface Idea {
  id: string;
  title: string;
  content: string;
  source: "instagram" | "tiktok" | "youtube" | "blog" | "manual" | "voice" | "import" | "inbox";
  sourceUrl?: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  tags: string[];
  type?: "text" | "voice" | "idea_inbox";
  starred?: boolean;
  metadata?: {
    videoId?: string;
    channelName?: string;
    channelId?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    viewCount?: number;
    publishedAt?: string;
  };
  audioUrl?: string;
  duration?: number;
}

// Database Note interface for type mapping
export interface DatabaseNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  type: "text" | "voice" | "idea_inbox";
  source?: "manual" | "inbox" | "import";
  starred: boolean;
  audioUrl?: string;
  duration?: number;
  metadata?: {
    videoId?: string;
    channelName?: string;
    channelId?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    viewCount?: number;
    publishedAt?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
