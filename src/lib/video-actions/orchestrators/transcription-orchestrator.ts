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

      // Step 4: Convert to script data format (with optional AI analysis)
      const scriptData = await this.convertTranscriptToScriptData(transcript, input.url);

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
   * Analyzes the transcript to extract script components
   */
  private async convertTranscriptToScriptData(transcript: string, url: string): Promise<ScriptData> {
    let components: ScriptComponent[];
    
    // Try to use AI analysis if enabled and available
    if (this.config.useAiAnalysis ?? true) {
      try {
        components = await this.analyzeTranscriptWithAI(transcript, url);
        if (this.config.enableLogging) {
          console.log("✅ [TRANSCRIPTION_ORCHESTRATOR] AI analysis successful");
        }
      } catch (error) {
        if (this.config.enableLogging) {
          console.warn("⚠️ [TRANSCRIPTION_ORCHESTRATOR] AI analysis failed, falling back to basic extraction:", error);
        }
        // Fallback to basic extraction
        components = this.extractScriptComponents(transcript);
      }
    } else {
      // Use basic extraction
      components = this.extractScriptComponents(transcript);
    }
    
    // Process all components to add metrics
    const processedComponents = processScriptComponents(components);

    // Calculate total metrics
    const totalWords = processedComponents.reduce((sum, comp) => sum + (comp.wordCount ?? 0), 0);
    const totalDuration = processedComponents.reduce((sum, comp) => sum + (comp.estimatedDuration ?? 0), 0);

    return {
      id: `transcript-${Date.now()}`,
      title: "Video Script Analysis",
      fullScript: transcript,
      components: processedComponents,
      metrics: {
        totalWords,
        totalDuration,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ["transcript", "video", "analyzed"],
      metadata: {
        originalUrl: url,
        platform: "video",
        genre: "transcript",
      },
    };
  }

  /**
   * Extract script components from transcript text
   * Attempts to identify hook, bridge, nugget, and CTA sections
   */
  private extractScriptComponents(transcript: string): ScriptComponent[] {
    const components: ScriptComponent[] = [];
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) {
      // If no sentences found, return the full transcript as a single component
      return [{
        id: "transcript-full",
        type: "custom",
        label: "Full Transcript",
        content: transcript,
        icon: "T",
      }];
    }

    // Determine component distribution based on transcript length
    const totalSentences = sentences.length;
    let hookEnd = 1;
    let bridgeEnd = 2;
    let nuggetEnd = totalSentences - 1;
    
    if (totalSentences >= 4) {
      // For longer transcripts, use proportional distribution
      hookEnd = Math.max(1, Math.floor(totalSentences * 0.15)); // First 15% for hook
      bridgeEnd = hookEnd + Math.max(1, Math.floor(totalSentences * 0.20)); // Next 20% for bridge
      nuggetEnd = Math.min(totalSentences - 1, bridgeEnd + Math.ceil(totalSentences * 0.50)); // Next 50% for nugget
      // Last 15% for CTA
    }

    // Extract Hook (opening that grabs attention)
    if (sentences.length > 0) {
      const hookContent = sentences.slice(0, hookEnd).join('. ').trim() + '.';
      components.push({
        id: "hook-extracted",
        type: "hook",
        label: "Hook (Opening)",
        content: hookContent,
        icon: "H",
        metadata: {
          extractedFrom: "transcript",
          sentenceRange: [0, hookEnd],
        },
      });
    }

    // Extract Bridge (transition to main content)
    if (sentences.length > hookEnd) {
      const bridgeContent = sentences.slice(hookEnd, bridgeEnd).join('. ').trim() + '.';
      components.push({
        id: "bridge-extracted",
        type: "bridge",
        label: "Bridge (Context)",
        content: bridgeContent,
        icon: "B",
        metadata: {
          extractedFrom: "transcript",
          sentenceRange: [hookEnd, bridgeEnd],
        },
      });
    }

    // Extract Golden Nugget (main value/content)
    if (sentences.length > bridgeEnd) {
      const nuggetContent = sentences.slice(bridgeEnd, nuggetEnd).join('. ').trim() + '.';
      components.push({
        id: "nugget-extracted",
        type: "nugget",
        label: "Golden Nugget (Main Content)",
        content: nuggetContent,
        icon: "G",
        metadata: {
          extractedFrom: "transcript",
          sentenceRange: [bridgeEnd, nuggetEnd],
        },
      });
    }

    // Extract Call to Action (closing/next steps)
    if (sentences.length > nuggetEnd) {
      const ctaContent = sentences.slice(nuggetEnd).join('. ').trim() + '.';
      components.push({
        id: "cta-extracted",
        type: "cta",
        label: "Call to Action",
        content: ctaContent,
        icon: "C",
        metadata: {
          extractedFrom: "transcript",
          sentenceRange: [nuggetEnd, totalSentences],
        },
      });
    }

    // Also include the full transcript as a separate component for reference
    components.push({
      id: "transcript-full",
      type: "custom",
      label: "Full Transcript",
      content: transcript,
      icon: "T",
      metadata: {
        isFullTranscript: true,
      },
    });

    return components;
  }

  /**
   * Analyze transcript using AI to extract better script components
   */
  private async analyzeTranscriptWithAI(transcript: string, url: string): Promise<ScriptComponent[]> {
    const response = await fetch("/api/video/analyze-transcript", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript, url }),
    });

    if (!response.ok) {
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.components) {
      throw new Error(result.error || "AI analysis failed");
    }

    return result.components as ScriptComponent[];
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