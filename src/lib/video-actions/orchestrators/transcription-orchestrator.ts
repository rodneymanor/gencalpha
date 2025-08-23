/**
 * Transcription Orchestrator
 * Handles the complete transcription workflow for video actions
 */

import { validateVideoUrlOrThrow } from "../validators";
import { transcribeVideo } from "@/components/write-chat/services/video-service";
import { processScriptComponents } from "@/hooks/use-script-analytics";
import { ScriptData, ScriptComponent } from "@/types/script-panel";
import {
  VideoActionInput,
  VideoActionResult,
  TranscriptionResult,
  VideoActionError,
  VideoActionErrorDetails,
  VideoActionConfig,
} from "../types";

/**
 * Default configuration for transcription orchestrator
 */
const DEFAULT_CONFIG: VideoActionConfig = {
  validateUrl: true,
  retryAttempts: 1,
  timeout: 120000, // 2 minutes
  enableLogging: true,
};

/**
 * Main transcription orchestrator class
 */
export class TranscriptionOrchestrator {
  private config: VideoActionConfig;

  constructor(config: Partial<VideoActionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute complete transcription workflow
   */
  async execute(input: VideoActionInput): Promise<VideoActionResult<TranscriptionResult>> {
    const startTime = Date.now();
    
    if (this.config.enableLogging) {
      console.log("🎬 [TRANSCRIPTION_ORCHESTRATOR] Starting transcription for:", input.url);
    }

    try {
      // Step 1: Validate URL
      if (this.config.validateUrl) {
        const platform = validateVideoUrlOrThrow(input.url);
        if (this.config.enableLogging) {
          console.log("✅ [TRANSCRIPTION_ORCHESTRATOR] URL validated for platform:", platform);
        }
      }

      // Step 2: Scrape video to get CDN URL via server-side API
      if (this.config.enableLogging) {
        console.log("🔍 [TRANSCRIPTION_ORCHESTRATOR] Scraping video URL via API...");
      }
      
      const scraperResult = await this.scrapeVideoViaApi(input.url);
      
      if (!scraperResult.videoUrl) {
        throw new Error("Unable to extract video URL from social media link");
      }

      if (this.config.enableLogging) {
        console.log("✅ [TRANSCRIPTION_ORCHESTRATOR] Video scraped successfully, CDN URL obtained");
      }

      // Step 3: Transcribe using CDN URL
      if (this.config.enableLogging) {
        console.log("📝 [TRANSCRIPTION_ORCHESTRATOR] Starting transcription...");
      }

      const transcript = await transcribeVideo({
        url: scraperResult.videoUrl,
        platform: scraperResult.platform,
      });

      if (this.config.enableLogging) {
        console.log("✅ [TRANSCRIPTION_ORCHESTRATOR] Transcription completed successfully");
      }

      // Step 4: Convert to script data format
      const scriptData = this.convertTranscriptToScriptData(transcript, input.url);

      const duration = Date.now() - startTime;

      const result: VideoActionResult<TranscriptionResult> = {
        success: true,
        data: {
          transcript,
          scriptData,
          contentMetadata: scraperResult.metadata,
        },
        metadata: {
          originalUrl: input.url,
          platform: scraperResult.platform,
          processedAt: new Date(),
          duration,
        },
      };

      if (this.config.enableLogging) {
        console.log(`🎉 [TRANSCRIPTION_ORCHESTRATOR] Transcription completed in ${duration}ms`);
      }

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown transcription error";

      if (this.config.enableLogging) {
        console.error(`❌ [TRANSCRIPTION_ORCHESTRATOR] Failed after ${duration}ms:`, error);
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
   * Convert transcript to ScriptData format for the script panel
   */
  private convertTranscriptToScriptData(transcript: string, url: string): ScriptData {
    // Create a simple script component from the transcript
    const transcriptComponent: ScriptComponent = {
      id: "transcript-full",
      type: "transcript",
      label: "Full Transcript",
      content: transcript,
      icon: "T",
    };

    // Process the component to add metrics
    const processedComponents = processScriptComponents([transcriptComponent]);

    // Calculate total metrics
    const totalWords = processedComponents.reduce((sum, comp) => sum + (comp.wordCount ?? 0), 0);
    const totalDuration = processedComponents.reduce((sum, comp) => sum + (comp.estimatedDuration ?? 0), 0);

    return {
      id: `transcript-${Date.now()}`,
      title: "Video Transcript",
      fullScript: transcript,
      components: processedComponents,
      metrics: {
        totalWords,
        totalDuration,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ["transcript", "video"],
      metadata: {
        originalUrl: url,
        platform: "video",
        genre: "transcript",
      },
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
export function createTranscriptionOrchestrator(config?: Partial<VideoActionConfig>): TranscriptionOrchestrator {
  return new TranscriptionOrchestrator(config);
}

/**
 * Convenience function for single transcription
 */
export async function transcribeVideoUrl(
  url: string,
  config?: Partial<VideoActionConfig>
): Promise<VideoActionResult<TranscriptionResult>> {
  const orchestrator = createTranscriptionOrchestrator(config);
  return await orchestrator.execute({ url });
}