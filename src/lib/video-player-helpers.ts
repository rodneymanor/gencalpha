import { type VideoData } from "@/app/(main)/dashboard/daily/_components/creator-videos-grid";
import { type Video } from "@/lib/collections";

/**
 * Transform VideoData from creator videos to Video format for the video player
 */
export function transformVideoDataToVideo(videoData: VideoData): Video {
  return {
    id: videoData.id,
    originalUrl: videoData.href,
    iframeUrl: videoData.videoSrc || undefined,
    directUrl: videoData.videoSrc || undefined,
    platform: videoData.platform,
    thumbnailUrl: videoData.thumbnail,
    title: videoData.altText,
    caption: videoData.altText,
    hashtags: [],
    metrics: {
      likes: videoData.metrics.likes,
      comments: videoData.metrics.comments,
      shares: videoData.metrics.shares,
      views: videoData.metrics.views,
      saves: videoData.metrics.shares || 0, // Fallback to shares if saves not available
    },
    metadata: {
      originalUrl: videoData.href,
      platform: videoData.platform,
      downloadedAt: new Date().toISOString(),
      author: videoData.author.username,
      description: videoData.altText,
    },
    userId: "", // Will be set by the component
    collectionId: "creator-inspiration",
    addedAt: new Date().toISOString(),
    transcriptionStatus: "pending",
  };
}

/**
 * Format numbers for display (e.g., 1000 -> 1K, 1000000 -> 1M)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}