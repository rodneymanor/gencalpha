export interface UnifiedVideoResult {
  platform: "tiktok" | "instagram";
  shortCode: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  author: string;
  description: string;
  hashtags: string[];
  metrics: {
    likes: number;
    views: number;
    comments: number;
    shares: number;
    saves?: number;
  };
  metadata: {
    duration?: number; // seconds
    timestamp?: string; // ISO
    location?: string;
    isVerified?: boolean;
    followerCount?: number;
  };
  rawData: any;
}

export interface ScraperOptions {
  timeout?: number;
  retryCount?: number;
  includeMetrics?: boolean;
}

