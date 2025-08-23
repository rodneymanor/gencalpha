/**
 * Ideas Generation Orchestrator
 * Handles the complete ideas generation workflow for video actions
 */

import { validateVideoUrlOrThrow } from "../validators";
import { transcribeVideo, generateIdeas } from "@/components/write-chat/services/video-service";
import {
  VideoActionInput,
  VideoActionResult,
  IdeasResult,
  VideoActionError,
  VideoActionErrorDetails,
  VideoActionConfig,
} from "../types";

/**
 * Default configuration for ideas orchestrator
 */
const DEFAULT_CONFIG: VideoActionConfig = {
  validateUrl: true,
  retryAttempts: 1,
  timeout: 120000, // 2 minutes
  enableLogging: true,
};

/**
 * Ideas generation orchestrator class
 */
export class IdeasOrchestrator {
  private config: VideoActionConfig;

  constructor(config: Partial<VideoActionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute complete ideas generation workflow
   */
  async execute(input: VideoActionInput): Promise<VideoActionResult<IdeasResult>> {
    const startTime = Date.now();
    
    if (this.config.enableLogging) {
      console.log("💡 [IDEAS_ORCHESTRATOR] Starting ideas generation for:", input.url);
    }

    try {
      // Step 1: Validate URL
      if (this.config.validateUrl) {
        const platform = validateVideoUrlOrThrow(input.url);
        if (this.config.enableLogging) {
          console.log("✅ [IDEAS_ORCHESTRATOR] URL validated for platform:", platform);
        }
      }

      // Step 2: Scrape video to get CDN URL
      if (this.config.enableLogging) {
        console.log("🔍 [IDEAS_ORCHESTRATOR] Scraping video URL...");
      }
      
      const scraperResult = await this.scrapeVideoViaApi(input.url);
      
      if (!scraperResult.videoUrl) {
        throw new Error("Unable to extract video URL from social media link");
      }

      if (this.config.enableLogging) {
        console.log("✅ [IDEAS_ORCHESTRATOR] Video scraped successfully, CDN URL obtained");
      }

      // Step 3: Transcribe using CDN URL
      if (this.config.enableLogging) {
        console.log("📝 [IDEAS_ORCHESTRATOR] Starting transcription...");
      }

      const transcript = await transcribeVideo({
        url: scraperResult.videoUrl,
        platform: scraperResult.platform,
      });

      if (this.config.enableLogging) {
        console.log("✅ [IDEAS_ORCHESTRATOR] Transcription completed successfully");
      }

      // Step 4: Generate content ideas
      if (this.config.enableLogging) {
        console.log("💭 [IDEAS_ORCHESTRATOR] Generating content ideas...");
      }

      const ideas = await generateIdeas({ transcript, url: input.url });
      const markdown = `# Content Ideas\n\n${ideas}`;

      const duration = Date.now() - startTime;

      const result: VideoActionResult<IdeasResult> = {
        success: true,
        data: {
          ideas,
          markdown,
        },
        metadata: {
          originalUrl: input.url,
          platform: scraperResult.platform,
          processedAt: new Date(),
          duration,
        },
      };

      if (this.config.enableLogging) {
        console.log(`🎉 [IDEAS_ORCHESTRATOR] Ideas generation completed in ${duration}ms`);
      }

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown ideas generation error";

      if (this.config.enableLogging) {
        console.error(`❌ [IDEAS_ORCHESTRATOR] Failed after ${duration}ms:`, error);
      }

      // Classify error type
      let errorCode = VideoActionError.API_ERROR;
      if (errorMessage.includes("Invalid") || errorMessage.includes("Unsupported")) {
        errorCode = VideoActionError.INVALID_URL;
      } else if (errorMessage.includes("scrape") || errorMessage.includes("extract")) {
        errorCode = VideoActionError.SCRAPING_FAILED;
      } else if (errorMessage.includes("transcribe") || errorMessage.includes("transcript")) {
        errorCode = VideoActionError.TRANSCRIPTION_FAILED;
      }

      const errorDetails: VideoActionErrorDetails = {
        code: errorCode,
        message: errorMessage,
        originalError: error instanceof Error ? error : undefined,
        url: input.url,
        platform: input.platform,
        timestamp: new Date(),
      };

      return {
        success: false,
        error: errorDetails.message,
        metadata: {
          originalUrl: input.url,
          platform: input.platform ?? "unknown",
          processedAt: new Date(),
          duration,
        },
      };
    }
  }

  /**
   * Scrape video URL via server-side API endpoint
   */
  private async scrapeVideoViaApi(url: string): Promise<{
    videoUrl: string;
    platform: string;
    metadata?: any;
  }> {
    const response = await fetch("/api/internal/video/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Video resolve API failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || result.error || "Video resolve failed");
    }

    return {
      videoUrl: result.videoUrl,
      platform: result.platform,
      metadata: result.metadata,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VideoActionConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for easy usage
 */
export function createIdeasOrchestrator(config?: Partial<VideoActionConfig>): IdeasOrchestrator {
  return new IdeasOrchestrator(config);
}

/**
 * Convenience function for single ideas generation
 */
export async function generateVideoIdeas(
  url: string,
  config?: Partial<VideoActionConfig>
): Promise<VideoActionResult<IdeasResult>> {
  const orchestrator = createIdeasOrchestrator(config);
  return await orchestrator.execute({ url });
}