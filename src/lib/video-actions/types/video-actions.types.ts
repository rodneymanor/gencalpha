/**
 * Video Actions Types
 * Common interfaces and types for all video action operations
 */

// Supported video action types
export type VideoActionType = "transcribe" | "ideas" | "hooks";

// Video platform types
export type VideoPlatform = "tiktok" | "instagram" | "instagram_cdn" | "tiktok_cdn" | "unsupported";

// URL validation result interface
export interface VideoUrlValidation {
  valid: boolean;
  platform?: VideoPlatform;
  message?: string;
  error?: string;
}

// Base video input interface
export interface VideoActionInput {
  url: string;
  platform?: VideoPlatform;
}

// Generic orchestrator result interface
export interface VideoActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    originalUrl: string;
    platform: VideoPlatform;
    processedAt: Date;
    duration?: number;
  };
}

// Transcription specific types
export interface TranscriptionResult {
  transcript: string;
  components?: any[];
  contentMetadata?: any;
  visualContext?: any;
  scriptData?: any;
}

// Ideas generation result
export interface IdeasResult {
  ideas: string;
  markdown: string;
}

// Hooks generation result
export interface HooksResult {
  hooks: Array<{
    text: string;
    rating: number;
    focus: string;
    rationale: string;
  }>;
  topHook: {
    text: string;
    rating: number;
  };
  markdown: string;
}

// Orchestrator configuration
export interface VideoActionConfig {
  validateUrl?: boolean;
  retryAttempts?: number;
  timeout?: number;
  enableLogging?: boolean;
}

// Progress tracking interface
export interface VideoActionProgress {
  step: string;
  progress: number;
  message: string;
  error?: string;
}

// Common error types
export enum VideoActionError {
  INVALID_URL = "INVALID_URL",
  UNSUPPORTED_PLATFORM = "UNSUPPORTED_PLATFORM",
  SCRAPING_FAILED = "SCRAPING_FAILED",
  TRANSCRIPTION_FAILED = "TRANSCRIPTION_FAILED",
  API_ERROR = "API_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
}

// Error details interface
export interface VideoActionErrorDetails {
  code: VideoActionError;
  message: string;
  originalError?: Error;
  url?: string;
  platform?: VideoPlatform;
  timestamp: Date;
}