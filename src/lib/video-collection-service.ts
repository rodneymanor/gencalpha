// Client-side video collection service
// Uses API routes for server-side Firebase Admin operations

export interface VideoCollectionResult {
  success: boolean;
  videoId?: string;
  message: string;
  error?: string;
  fallbackUsed?: boolean;
}

export interface VideoProcessingData {
  originalUrl: string;
  platform: string;
  addedAt: string;
  processing?: {
    scrapeAttempted: boolean;
    transcriptAttempted: boolean;
    components: {
      hook: string;
      bridge: string;
      nugget: string;
      wta: string;
    };
  };
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    saves: number;
  };
}

export class VideoCollectionService {
  /**
   * Add a video to collection using API endpoint
   */
  static async addVideoToCollection(
    userId: string,
    collectionId: string,
    videoData: VideoProcessingData,
  ): Promise<VideoCollectionResult> {
    try {
      // Validate input data
      const validation = this.validateVideoData(videoData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.error ?? "Invalid video data",
          error: validation.error,
        };
      }

      // Call API endpoint to add video
      const response = await fetch("/api/videos/add-to-collection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          collectionId,
          videoData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to add video:", result);
        return {
          success: false,
          message: result.message ?? "Failed to add video to collection",
          error: result.error,
        };
      }

      return result;
    } catch (error) {
      console.error("❌ [VIDEO_COLLECTION] Unexpected error:", error);
      return {
        success: false,
        message: "Failed to add video to collection",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Validate video data
   */
  private static validateVideoData(videoData: VideoProcessingData): { isValid: boolean; error?: string } {
    if (!videoData.originalUrl) {
      return { isValid: false, error: "Video URL is required" };
    }

    try {
      new URL(videoData.originalUrl);
    } catch {
      return { isValid: false, error: "Invalid video URL format" };
    }

    if (!videoData.platform) {
      return { isValid: false, error: "Platform is required" };
    }

    const supportedPlatforms = ["TikTok", "Instagram", "tiktok", "instagram", "youtube", "unknown"];
    if (!supportedPlatforms.includes(videoData.platform)) {
      return { isValid: false, error: "Unsupported platform" };
    }

    return { isValid: true };
  }

  /**
   * Validate platform URL
   */
  static validatePlatformUrl(url: string): { isValid: boolean; platform?: string; error?: string } {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      if (hostname.includes("tiktok.com")) {
        return { isValid: true, platform: "tiktok" };
      }

      if (hostname.includes("instagram.com")) {
        return { isValid: true, platform: "instagram" };
      }

      if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        return { isValid: true, platform: "youtube" };
      }

      return {
        isValid: false,
        error: "Only TikTok, Instagram, and YouTube videos are currently supported",
      };
    } catch {
      return {
        isValid: false,
        error: "Invalid URL format",
      };
    }
  }

  /**
   * Create video processing data from URL
   */
  static createVideoDataFromUrl(url: string): VideoProcessingData {
    const validation = this.validatePlatformUrl(url);

    return {
      originalUrl: url,
      platform: validation.platform ?? "unknown",
      addedAt: new Date().toISOString(),
      processing: {
        scrapeAttempted: false,
        transcriptAttempted: false,
        components: {
          hook: "",
          bridge: "",
          nugget: "",
          wta: "",
        },
      },
      metrics: {
        views: 0,
        likes: 0,
        comments: 0,
        saves: 0,
      },
    };
  }
}
