// Types for Follow Creator workflow
// - This file centralizes request/response contracts used by the orchestrator route

export interface FollowCreatorRequest {
  username: string;
  platform?: "instagram" | "tiktok";
  userId?: string;
}

export interface FollowCreatorResponse {
  success: boolean;
  creator?: {
    id: string;
    username: string;
    platform: "instagram" | "tiktok";
    displayName?: string;
    followerCount?: number;
  };
  videos?: Array<{
    id: string;
    thumbnailUrl: string;
    videoUrl: string;
    title: string;
    metrics: {
      views: number;
      likes: number;
      comments: number;
      shares: number;
    };
  }>;
  followId?: string;
  error?: string;
  details?: string;
}
