import { CollectionsService, Video, VideoInsights, VideoComponents, ContentMetadata } from "./collections";
import { CollectionsRBACService } from "./collections-rbac";

export class VideoInsightsService {
  /**
   * Get a single video with all insights data
   */
  static async getVideoWithInsights(userId: string, videoId: string): Promise<Video> {
    try {
      const video = await CollectionsService.getVideo(userId, videoId);
      if (!video) {
        throw new Error("Video not found");
      }

      // Ensure all required fields exist with proper defaults
      return {
        ...video,
        transcript: video.transcript || "",
        components: video.components || {
          hook: "",
          bridge: "",
          nugget: "",
          wta: "",
        },
        metrics: video.metrics || {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
          saves: 0,
        },
        metadata: video.metadata || {
          originalUrl: video.originalUrl || "",
          platform: video.platform || "",
          downloadedAt: video.addedAt || "",
          author: "",
          duration: video.duration || 0,
          description: "",
          hashtags: [],
        },
        visualContext: video.visualContext || "",
      };
    } catch (error) {
      console.error("Error fetching video insights:", error);
      throw error;
    }
  }

  /**
   * Get videos from a collection with insights data
   */
  static async getCollectionVideosWithInsights(userId: string, collectionId?: string): Promise<Video[]> {
    try {
      const result = await CollectionsRBACService.getCollectionVideos(userId, collectionId);
      return result.videos.map((video) => ({
        ...video,
        transcript: video.transcript || "",
        components: video.components || {
          hook: "",
          bridge: "",
          nugget: "",
          wta: "",
        },
        metrics: video.metrics || {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
          saves: 0,
        },
        metadata: video.metadata || {
          originalUrl: video.originalUrl || "",
          platform: video.platform || "",
          downloadedAt: video.addedAt || "",
          author: "",
          duration: video.duration || 0,
          description: "",
          hashtags: [],
        },
        visualContext: video.visualContext || "",
      }));
    } catch (error) {
      console.error("Error fetching collection videos:", error);
      throw error;
    }
  }

  /**
   * Update video insights data
   */
  static async updateVideoInsights(
    userId: string,
    videoId: string,
    insights: {
      transcript?: string;
      components?: Partial<VideoComponents>;
      visualContext?: string;
      metrics?: Partial<VideoInsights>;
      metadata?: Partial<ContentMetadata>;
    },
  ): Promise<void> {
    try {
      const updates: Partial<Video> = {};

      if (insights.transcript !== undefined) {
        updates.transcript = insights.transcript;
      }

      if (insights.components) {
        // Get existing components and merge with new ones
        const existingVideo = await CollectionsService.getVideo(userId, videoId);
        updates.components = {
          ...existingVideo?.components,
          ...insights.components,
        };
      }

      if (insights.visualContext !== undefined) {
        updates.visualContext = insights.visualContext;
      }

      if (insights.metrics) {
        // Get existing metrics and merge with new ones
        const existingVideo = await CollectionsService.getVideo(userId, videoId);
        updates.metrics = {
          ...existingVideo?.metrics,
          ...insights.metrics,
        };
      }

      if (insights.metadata) {
        // Get existing metadata and merge with new ones
        const existingVideo = await CollectionsService.getVideo(userId, videoId);
        updates.metadata = {
          ...existingVideo?.metadata,
          ...insights.metadata,
        };
      }

      await CollectionsService.updateVideo(userId, videoId, updates);
    } catch (error) {
      console.error("Error updating video insights:", error);
      throw error;
    }
  }

  /**
   * Get video engagement rate calculation
   */
  static calculateEngagementRate(metrics: VideoInsights): number {
    const { likes, comments, shares, views, saves } = metrics;
    if (views === 0) return 0;

    const totalEngagements = likes + comments + shares + saves;
    return Math.round((totalEngagements / views) * 100 * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get video with calculated engagement rate
   */
  static async getVideoWithCalculatedEngagement(userId: string, videoId: string): Promise<Video> {
    const video = await this.getVideoWithInsights(userId, videoId);

    if (video.metrics) {
      const engagementRate = this.calculateEngagementRate(video.metrics);
      video.metrics = {
        ...video.metrics,
        engagementRate,
      };
    }

    return video;
  }
}
