/**
 * Hooks Generation Orchestrator
 * Handles the complete hooks generation workflow for video actions
 */

import { validateVideoUrlOrThrow } from "../validators";
import { scrapeVideoUrl } from "@/lib/unified-video-scraper";
import { transcribeVideo, generateHooks } from "@/components/write-chat/services/video-service";
import {
  VideoActionInput,
  VideoActionResult,
  HooksResult,
  VideoActionError,
  VideoActionErrorDetails,
  VideoActionConfig,
} from "../types";

/**
 * Default configuration for hooks orchestrator
 */
const DEFAULT_CONFIG: VideoActionConfig = {
  validateUrl: true,
  retryAttempts: 1,
  timeout: 120000, // 2 minutes
  enableLogging: true,
};

/**
 * Hooks generation orchestrator class
 */
export class HooksOrchestrator {
  private config: VideoActionConfig;

  constructor(config: Partial<VideoActionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute complete hooks generation workflow
   */
  async execute(input: VideoActionInput): Promise<VideoActionResult<HooksResult>> {
    const startTime = Date.now();
    
    if (this.config.enableLogging) {
      console.log("🎣 [HOOKS_ORCHESTRATOR] Starting hooks generation for:", input.url);
    }

    try {
      // Step 1: Validate URL
      if (this.config.validateUrl) {
        const platform = validateVideoUrlOrThrow(input.url);
        if (this.config.enableLogging) {
          console.log("✅ [HOOKS_ORCHESTRATOR] URL validated for platform:", platform);
        }
      }

      // Step 2: Scrape video to get CDN URL
      if (this.config.enableLogging) {
        console.log("🔍 [HOOKS_ORCHESTRATOR] Scraping video URL...");
      }
      
      const scraperResult = await scrapeVideoUrl(input.url);
      
      if (!scraperResult.videoUrl) {
        throw new Error("Unable to extract video URL from social media link");
      }

      if (this.config.enableLogging) {
        console.log("✅ [HOOKS_ORCHESTRATOR] Video scraped successfully, CDN URL obtained");
      }

      // Step 3: Transcribe using CDN URL
      if (this.config.enableLogging) {
        console.log("📝 [HOOKS_ORCHESTRATOR] Starting transcription...");
      }

      const transcript = await transcribeVideo({
        url: scraperResult.videoUrl,
        platform: scraperResult.platform,
      });

      if (this.config.enableLogging) {
        console.log("✅ [HOOKS_ORCHESTRATOR] Transcription completed successfully");
      }

      // Step 4: Generate hooks
      if (this.config.enableLogging) {
        console.log("🎣 [HOOKS_ORCHESTRATOR] Generating hooks...");
      }

      const hooksResp = await generateHooks({ transcript });
      
      // Format hooks for display
      const list = hooksResp.hooks.map((h, i) => `${i + 1}. ${h.text} — ${h.rating}/100 (${h.focus})`).join("\n");
      const markdown = `# Hooks\n\n${list}\n\n**Top Hook:** ${hooksResp.topHook.text} (${hooksResp.topHook.rating}/100)`;

      const duration = Date.now() - startTime;

      const result: VideoActionResult<HooksResult> = {
        success: true,
        data: {
          hooks: hooksResp.hooks,
          topHook: hooksResp.topHook,
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
        console.log(`🎉 [HOOKS_ORCHESTRATOR] Hooks generation completed in ${duration}ms`);
      }

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown hooks generation error";

      if (this.config.enableLogging) {
        console.error(`❌ [HOOKS_ORCHESTRATOR] Failed after ${duration}ms:`, error);
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
          platform: input.platform || "unknown",
          processedAt: new Date(),
          duration,
        },
      };
    }
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
export function createHooksOrchestrator(config?: Partial<VideoActionConfig>): HooksOrchestrator {
  return new HooksOrchestrator(config);
}

/**
 * Convenience function for single hooks generation
 */
export async function generateVideoHooks(
  url: string,
  config?: Partial<VideoActionConfig>
): Promise<VideoActionResult<HooksResult>> {
  const orchestrator = createHooksOrchestrator(config);
  return await orchestrator.execute({ url });
}