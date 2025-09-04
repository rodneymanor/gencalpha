import { TranscriptionOrchestrator } from "@/lib/video-actions/orchestrators/transcription-orchestrator";
import type { VideoActionInput } from "@/lib/video-actions/types";
import { detectSocialUrl } from "@/lib/utils/lightweight-url-detector";
import { formatScriptWithComponents, createFallbackTranscript } from "../utils/formatters";
import { ORCHESTRATOR_CONFIG } from "../utils/constants";

export interface TranscriptionResult {
  success: boolean;
  script: string;
  title: string;
  rawTranscript?: string;
  error?: string;
}

export interface TranscriptionCallbacks {
  onStart: () => void;
  onComplete: (result: TranscriptionResult) => void;
  onError: (error: string) => void;
  onFinally: () => void;
}

/**
 * Service class for handling video transcription operations
 * Consolidates transcription logic from lines 74-165
 */
export class TranscriptionService {
  private orchestrator: TranscriptionOrchestrator;

  constructor() {
    this.orchestrator = new TranscriptionOrchestrator({
      enableLogging: ORCHESTRATOR_CONFIG.ENABLE_LOGGING,
      timeout: ORCHESTRATOR_CONFIG.TIMEOUT,
    });
  }

  /**
   * Checks if a given input is a valid video URL that can be transcribed
   */
  isVideoUrl(input: string): boolean {
    const urlDetection = detectSocialUrl(input.trim());
    return urlDetection.isValid && (urlDetection.platform === "instagram" || urlDetection.platform === "tiktok");
  }

  /**
   * Processes a video URL for transcription
   * Replaces the complex logic from lines 87-157
   */
  async processVideoUrl(url: string, callbacks: TranscriptionCallbacks): Promise<void> {
    const trimmed = url.trim();
    const urlDetection = detectSocialUrl(trimmed);

    if (!this.isVideoUrl(trimmed)) {
      callbacks.onError("Invalid video URL");
      return;
    }

    console.log("🎬 [TranscriptionService] Video URL detected, starting transcription flow:", trimmed);
    console.log("🔍 [TranscriptionService] URL Detection result:", urlDetection);

    callbacks.onStart();

    try {
      console.log("🚀 [TranscriptionService] Creating TranscriptionOrchestrator...");
      console.log("🎯 [TranscriptionService] Starting orchestrator execution...");

      // Execute transcription workflow
      const input: VideoActionInput = {
        url: trimmed,
        platform: urlDetection.platform as "tiktok" | "instagram",
      };

      const result = await this.orchestrator.execute(input);

      console.log("🎯 [TranscriptionService] Orchestrator execution completed, result:", result);

      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Transcription failed");
      }

      console.log("✅ [TranscriptionService] Transcription completed:", result.data);
      console.log("🔍 [TranscriptionService] ScriptData:", result.data.scriptData);
      console.log("🔍 [TranscriptionService] Raw transcript:", result.data.transcript);

      // Process the transcription result
      const transcriptionResult = this.processTranscriptionResult(
        result.data,
        urlDetection.platform || "unknown"
      );

      callbacks.onComplete(transcriptionResult);

    } catch (error) {
      console.error("❌ [TranscriptionService] Transcription failed:", error);
      const errorMessage = `Transcription failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      callbacks.onError(errorMessage);
    } finally {
      callbacks.onFinally();
    }
  }

  /**
   * Processes the raw transcription data into a structured result
   * Consolidates the result processing logic from lines 115-157
   */
  private processTranscriptionResult(
    data: any,
    platform: string
  ): TranscriptionResult {
    console.log("🔍 [TranscriptionService] Processing transcription result");
    console.log("🔍 [TranscriptionService] Full data object:", data);
    
    const scriptData = data.scriptData;
    const rawTranscript = data.transcript;

    console.log("🔍 [TranscriptionService] Script data:", scriptData);
    console.log("🔍 [TranscriptionService] Raw transcript length:", rawTranscript?.length || 0);

    if (scriptData) {
      try {
        console.log("✅ [TranscriptionService] ScriptData found, processing components");
        // Only use formatted components, never the original transcript
        let formattedScript = "";
        
        if (scriptData.components && scriptData.components.length > 0) {
          console.log("🔍 [TranscriptionService] Components found:", scriptData.components.length);
          console.log("🔍 [TranscriptionService] Component details:", scriptData.components.map((c: any) => ({ 
            id: c.id, 
            type: c.type, 
            label: c.label,
            contentLength: c.content?.length || 0 
          })));
          
          formattedScript = formatScriptWithComponents(scriptData.components);
          console.log("🔍 [TranscriptionService] Formatted script length:", formattedScript.length);
          console.log("🔍 [TranscriptionService] Formatted script preview:", formattedScript.substring(0, 200));
        } else {
          console.log("⚠️ [TranscriptionService] No components found, using fallback");
          // If no components, create a basic structure from the raw transcript
          formattedScript = createFallbackTranscript(rawTranscript, scriptData.fullScript);
          console.log("🔍 [TranscriptionService] Fallback script:", formattedScript.substring(0, 200));
        }
        
        const result = {
          success: true,
          script: formattedScript,
          title: scriptData.title ?? `Transcript from ${platform}`,
          rawTranscript: rawTranscript,
        };
        
        console.log("✅ [TranscriptionService] Returning successful result");
        return result;
      } catch (stateError) {
        console.error("❌ [TranscriptionService] Error processing ScriptData:", stateError);
        throw stateError;
      }
    } else if (rawTranscript) {
      try {
        console.log("⚠️ [TranscriptionService] No ScriptData, using raw transcript");
        console.log("🔍 [TranscriptionService] Raw transcript preview:", rawTranscript.substring(0, 200));
        
        const result = {
          success: true,
          script: `## Transcript\n${rawTranscript}`,
          title: `Transcript from ${platform}`,
          rawTranscript: rawTranscript,
        };
        
        console.log("✅ [TranscriptionService] Returning raw transcript result");
        return result;
      } catch (stateError) {
        console.error("❌ [TranscriptionService] Error processing raw transcript:", stateError);
        throw stateError;
      }
    } else {
      console.error("❌ [TranscriptionService] No script data or transcript found in result");
      console.error("❌ [TranscriptionService] Available keys in data:", Object.keys(data || {}));
      console.error("❌ [TranscriptionService] ScriptData structure:", scriptData);
      console.error("❌ [TranscriptionService] Raw transcript:", rawTranscript);
      throw new Error("No transcript content available - check API endpoints");
    }
  }
}
