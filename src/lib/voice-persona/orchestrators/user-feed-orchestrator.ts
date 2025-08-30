/**
 * User Feed Orchestrator
 * Handles retrieval and processing of user social media feeds for persona analysis
 */

import { postJson } from "@/lib/http/post-json";
import { transcribeVideoUrl } from "@/lib/video-actions";

import { UserIdentifier, UserFeedAnalysis, VideoAnalysisData, PersonaAnalysisConfig } from "../types";

/**
 * Default configuration for user feed analysis
 */
const DEFAULT_CONFIG: PersonaAnalysisConfig = {
  batchSize: 5,
  maxVideos: 30,
  cacheTTL: 604800, // 7 days
  rateLimit: {
    requestsPerMinute: 10,
    burstLimit: 3,
  },
  analysis: {
    minTranscriptLength: 50,
    patternSensitivity: "medium",
    enableEmotionalAnalysis: true,
  },
};

/**
 * TikTok API response types (matching existing route)
 */
interface TikTokUserFeedResponse {
  success: boolean;
  userInfo?: {
    id: string;
    username: string;
    nickname: string;
    avatar: string;
    signature: string;
    verified: boolean;
    privateAccount: boolean;
    stats: {
      followingCount: number;
      followerCount: number;
      heartCount: number;
      videoCount: number;
      diggCount: number;
      heart: number;
    };
  };
  videos?: Array<{
    id: string;
    description: string;
    createTime: number;
    duration: number;
    cover: string;
    playUrl: string;
    downloadUrl: string;
    stats: {
      diggCount: number;
      shareCount: number;
      commentCount: number;
      playCount: number;
      collectCount: number;
    };
    music: {
      id: string;
      title: string;
      author: string;
      playUrl: string;
      cover: string;
      original: boolean;
      duration: number;
    };
    challenges: Array<{
      id: string;
      title: string;
      description: string;
      cover: string;
    }>;
    hashtags: Array<{
      id: string;
      name: string;
      start: number;
      end: number;
    }>;
    author: {
      id: string;
      username: string;
      nickname: string;
      avatar: string;
      verified: boolean;
      signature: string;
      stats: {
        followingCount: number;
        followerCount: number;
        heartCount: number;
        videoCount: number;
        diggCount: number;
        heart: number;
      };
    };
  }>;
  metadata?: {
    totalVideos: number;
    processedTime: number;
    fetchedAt: string;
  };
  error?: string;
  timestamp: string;
}

/**
 * User Feed Orchestrator Class
 */
export class UserFeedOrchestrator {
  private config: PersonaAnalysisConfig;

  constructor(config: Partial<PersonaAnalysisConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main orchestration method - retrieves user feed and processes videos for transcription
   */
  async analyzeFeed(userIdentifier: UserIdentifier): Promise<UserFeedAnalysis> {
    console.log(`🎭 [FEED_ORCHESTRATOR] Starting analysis for ${userIdentifier.handle} on ${userIdentifier.platform}`);

    const analysisStartTime = new Date().toISOString();

    const analysis: UserFeedAnalysis = {
      userIdentifier,
      videos: [],
      totalVideos: 0,
      processedVideos: 0,
      failedVideos: 0,
      analysisStarted: analysisStartTime,
      status: "processing",
    };

    try {
      // Step 1: Retrieve user feed based on platform
      const feedData = await this.retrieveUserFeed(userIdentifier);

      if (!feedData) {
        throw new Error(`Failed to retrieve ${userIdentifier.platform} feed for ${userIdentifier.handle}`);
      }

      analysis.totalVideos = feedData.length;
      console.log(`📊 [FEED_ORCHESTRATOR] Retrieved ${feedData.length} videos from ${userIdentifier.platform}`);

      // Step 2: Process videos in batches
      const videosToProcess = feedData.slice(0, this.config.maxVideos);
      const processedVideos = await this.processVideoBatches(videosToProcess, userIdentifier.platform);

      // Step 3: Update analysis results
      analysis.videos = processedVideos.successful;
      analysis.processedVideos = processedVideos.successful.length;
      analysis.failedVideos = processedVideos.failed.length;
      analysis.analysisCompleted = new Date().toISOString();
      analysis.status = "completed";

      console.log(
        `✅ [FEED_ORCHESTRATOR] Analysis completed: ${analysis.processedVideos}/${analysis.totalVideos} videos processed`,
      );

      return analysis;
    } catch (error) {
      console.error(`❌ [FEED_ORCHESTRATOR] Analysis failed:`, error);

      analysis.status = "failed";
      analysis.analysisCompleted = new Date().toISOString();

      throw new Error(`Feed analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Retrieve user feed from appropriate platform
   */
  private async retrieveUserFeed(userIdentifier: UserIdentifier): Promise<any[]> {
    switch (userIdentifier.platform) {
      case "tiktok":
        return await this.retrieveTikTokFeed(userIdentifier.handle);
      case "instagram":
        // TODO: Implement Instagram feed retrieval when available
        throw new Error("Instagram feed analysis is not yet implemented");
      default:
        throw new Error(`Unsupported platform: ${userIdentifier.platform}`);
    }
  }

  /**
   * Retrieve TikTok user feed using existing API route
   */
  private async retrieveTikTokFeed(username: string): Promise<any[]> {
    console.log(`🎵 [FEED_ORCHESTRATOR] Fetching TikTok feed for @${username}`);

    try {
      const response: TikTokUserFeedResponse = await postJson("/api/tiktok/user-feed", {
        username,
        count: this.config.maxVideos,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch TikTok user feed");
      }

      if (!response.videos || response.videos.length === 0) {
        throw new Error("No videos found in user feed");
      }

      return response.videos;
    } catch (error) {
      console.error(`❌ [FEED_ORCHESTRATOR] TikTok feed retrieval failed:`, error);
      throw error;
    }
  }

  /**
   * Process videos in batches for transcription
   */
  private async processVideoBatches(
    videos: any[],
    platform: string,
  ): Promise<{
    successful: VideoAnalysisData[];
    failed: { video: any; error: string }[];
  }> {
    console.log(`⚙️ [FEED_ORCHESTRATOR] Processing ${videos.length} videos in batches of ${this.config.batchSize}`);

    const successful: VideoAnalysisData[] = [];
    const failed: { video: any; error: string }[] = [];

    // Process videos in batches to respect rate limits
    for (let i = 0; i < videos.length; i += this.config.batchSize) {
      const batch = videos.slice(i, i + this.config.batchSize);
      console.log(
        `📦 [FEED_ORCHESTRATOR] Processing batch ${Math.floor(i / this.config.batchSize) + 1}/${Math.ceil(videos.length / this.config.batchSize)}`,
      );

      const batchPromises = batch.map(async (video) => {
        try {
          const analysisData = await this.processSingleVideo(video, platform);
          return { success: true, data: analysisData };
        } catch (error) {
          console.error(`❌ [FEED_ORCHESTRATOR] Video processing failed for ${video.id}:`, error);
          return {
            success: false,
            video,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      // Process batch results
      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          if (result.value.success) {
            successful.push(result.value.data);
          } else {
            failed.push({
              video: result.value.video,
              error: result.value.error,
            });
          }
        } else {
          failed.push({
            video: batch[index],
            error: result.reason?.message || "Promise rejected",
          });
        }
      });

      // Rate limiting delay between batches
      if (i + this.config.batchSize < videos.length) {
        const delayMs = (60 / this.config.rateLimit.requestsPerMinute) * 1000 * this.config.batchSize;
        console.log(`⏳ [FEED_ORCHESTRATOR] Rate limiting delay: ${delayMs}ms`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    console.log(
      `📊 [FEED_ORCHESTRATOR] Batch processing completed: ${successful.length} successful, ${failed.length} failed`,
    );

    return { successful, failed };
  }

  /**
   * Process a single video for transcription
   */
  private async processSingleVideo(video: any, platform: string): Promise<VideoAnalysisData> {
    console.log(`🎬 [FEED_ORCHESTRATOR] Processing video ${video.id}`);

    // Construct TikTok URL for unified scraper
    const videoUrl = `https://www.tiktok.com/@${video.author.username}/video/${video.id}`;

    try {
      // Use our video actions orchestrator for transcription
      const transcriptionResult = await transcribeVideoUrl(videoUrl);

      if (!transcriptionResult.success || !transcriptionResult.data) {
        throw new Error(transcriptionResult.error || "Transcription failed");
      }

      // Filter out transcripts that are too short
      const transcript = transcriptionResult.data.transcript;
      if (transcript.length < this.config.analysis.minTranscriptLength) {
        throw new Error(
          `Transcript too short: ${transcript.length} characters (minimum: ${this.config.analysis.minTranscriptLength})`,
        );
      }

      const analysisData: VideoAnalysisData = {
        videoId: video.id,
        url: videoUrl,
        transcript,
        duration: video.duration,
        engagement: {
          views: video.stats.playCount,
          likes: video.stats.diggCount,
          comments: video.stats.commentCount,
        },
        metadata: {
          capturedAt: new Date().toISOString(),
          platform: platform as any,
        },
      };

      console.log(`✅ [FEED_ORCHESTRATOR] Successfully processed video ${video.id} (${transcript.length} chars)`);
      return analysisData;
    } catch (error) {
      console.error(`❌ [FEED_ORCHESTRATOR] Failed to process video ${video.id}:`, error);
      throw error;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PersonaAnalysisConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): PersonaAnalysisConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for easy usage
 */
export function createUserFeedOrchestrator(config?: Partial<PersonaAnalysisConfig>): UserFeedOrchestrator {
  return new UserFeedOrchestrator(config);
}

/**
 * Convenience function for single feed analysis
 */
export async function analyzeUserFeed(
  userIdentifier: UserIdentifier,
  config?: Partial<PersonaAnalysisConfig>,
): Promise<UserFeedAnalysis> {
  const orchestrator = createUserFeedOrchestrator(config);
  return await orchestrator.analyzeFeed(userIdentifier);
}
