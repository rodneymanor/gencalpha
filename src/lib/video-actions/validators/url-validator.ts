/**
 * Video URL Validator
 * Centralized validation for video URLs using unified scraper pattern
 */

import { UnifiedVideoScraper } from "@/lib/unified-video-scraper";

import { VideoUrlValidation, VideoPlatform, VideoActionError, VideoActionErrorDetails } from "../types";

/**
 * Validates a video URL using the unified scraper validation logic
 * Mirrors the pattern from @src/app/api/video/add-to-queue/route.ts
 */
export function validateVideoUrl(url: string): VideoUrlValidation {
  console.log("🔍 [URL_VALIDATOR] Validating video URL:", url);

  try {
    // Use the unified scraper's validation method
    const validation = UnifiedVideoScraper.validateUrlWithMessage(url);

    const result: VideoUrlValidation = {
      valid: validation.valid,
      platform: validation.platform as VideoPlatform,
      message: validation.message,
    };

    if (result.valid) {
      console.log("✅ [URL_VALIDATOR] URL is valid for platform:", result.platform);
    } else {
      console.log("❌ [URL_VALIDATOR] URL validation failed:", result.message);
    }

    return result;
  } catch (error) {
    console.error("❌ [URL_VALIDATOR] Validation error:", error);

    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown validation error",
    };
  }
}

/**
 * Validates URL and throws detailed error if invalid
 */
export function validateVideoUrlOrThrow(url: string): VideoPlatform {
  const validation = validateVideoUrl(url);

  if (!validation.valid) {
    const errorDetails: VideoActionErrorDetails = {
      code: VideoActionError.INVALID_URL,
      message: validation.message || validation.error || "Invalid video URL",
      url,
      timestamp: new Date(),
    };

    throw new Error(`URL Validation Failed: ${errorDetails.message}`);
  }

  return validation.platform!;
}

/**
 * Check if URL is supported (convenience method)
 */
export function isVideoUrlSupported(url: string): boolean {
  return validateVideoUrl(url).valid;
}

/**
 * Get supported platform from URL without full validation
 */
export function detectVideoPlatform(url: string): VideoPlatform {
  return UnifiedVideoScraper.detectPlatform(url) as VideoPlatform;
}

/**
 * Get validation patterns for frontend use
 */
export function getVideoUrlPatterns() {
  return UnifiedVideoScraper.getUrlPatterns();
}

/**
 * Comprehensive URL validation with detailed error reporting
 */
export function validateVideoUrlDetailed(url: string): {
  valid: boolean;
  platform?: VideoPlatform;
  error?: VideoActionErrorDetails;
  suggestions?: string[];
} {
  try {
    const validation = validateVideoUrl(url);

    if (validation.valid) {
      return {
        valid: true,
        platform: validation.platform,
      };
    }

    // Generate suggestions based on the error
    const suggestions: string[] = [];
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes("instagram") && !lowerUrl.includes("/reel")) {
      suggestions.push("Try using an Instagram Reel URL instead (look for /reel/ in the URL)");
    }

    if (lowerUrl.includes("youtube")) {
      suggestions.push("YouTube URLs are not supported. Please use TikTok or Instagram URLs.");
    }

    if (!lowerUrl.includes("http")) {
      suggestions.push("Make sure to include the full URL starting with https://");
    }

    const errorDetails: VideoActionErrorDetails = {
      code: VideoActionError.INVALID_URL,
      message: validation.message || validation.error || "Invalid video URL",
      url,
      timestamp: new Date(),
    };

    return {
      valid: false,
      error: errorDetails,
      suggestions,
    };
  } catch (error) {
    const errorDetails: VideoActionErrorDetails = {
      code: VideoActionError.API_ERROR,
      message: error instanceof Error ? error.message : "Unknown error during validation",
      originalError: error instanceof Error ? error : undefined,
      url,
      timestamp: new Date(),
    };

    return {
      valid: false,
      error: errorDetails,
    };
  }
}
