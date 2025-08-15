/**
 * Social Media URL Detector
 * Intelligent link detection that differentiates between TikTok, Instagram, YouTube, and general web URLs
 * with robust pattern matching and error handling
 */

export interface URLDetectionResult {
  platform: "tiktok" | "instagram" | "youtube" | "web" | "unknown";
  type: string;
  endpoint: string | null;
  url: string;
  id?: string | null;
  domain?: string | null;
  error?: string;
  isSupported: boolean;
}

export class SocialMediaURLDetector {
  private patterns: Record<string, RegExp[]>;
  private endpoints: Record<string, string>;

  constructor() {
    // URL patterns for different platforms with comprehensive coverage
    this.patterns = {
      tiktok: [
        /^https?:\/\/(www\.|m\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/i,
        /^https?:\/\/(www\.|m\.)?tiktok\.com\/.*\/video\/(\d+)/i,
        /^https?:\/\/vm\.tiktok\.com\/[\w\d]+\/?/i,
        /^https?:\/\/(www\.|m\.)?tiktok\.com\/.*\?.*shareId=(\d+)/i,
        /^https?:\/\/(www\.|m\.)?tiktok\.com\/embed\/(\d+)/i,
        /^https?:\/\/(www\.|m\.)?tiktok\.com\/share\/user\/(\d+)/i,
        /^https?:\/\/(www\.|m\.)?tiktok\.com\/v\/(\d+)/i,
        /^https?:\/\/(www\.|m\.)?tiktok\.com\/h5\/share\/usr\/(\d+)/i,
        /^https?:\/\/(www\.|m\.)?tiktok\.com\/t\/[\w\d]+\/?/i,
      ],
      instagram: [
        // Instagram posts
        /^https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+\/?/i,
        // Instagram reels
        /^https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+\/?/i,
        /^https?:\/\/(www\.)?instagram\.com\/reels\/[\w-]+\/?/i,
        // Instagram TV
        /^https?:\/\/(www\.)?instagram\.com\/tv\/[\w-]+\/?/i,
        // Instagram profiles
        /^https?:\/\/(www\.)?instagram\.com\/[\w.-]+\/?$/i,
        // Instagram stories
        /^https?:\/\/(www\.)?instagram\.com\/stories\/[\w.-]+\/(\d+)/i,
        // Instagram short URLs
        /^https?:\/\/(www\.)?instagr\.am\/p\/[\w-]+\/?/i,
      ],
      youtube: [
        // Regular YouTube videos
        /^https?:\/\/(www\.|m\.)?youtube\.com\/watch\?v=[\w-]+/i,
        // YouTube shorts (new format)
        /^https?:\/\/(www\.|m\.)?youtube\.com\/shorts\/[\w-]+/i,
        // YouTube short URLs
        /^https?:\/\/youtu\.be\/[\w-]+/i,
        // YouTube embed
        /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/i,
        // YouTube mobile
        /^https?:\/\/m\.youtube\.com\/watch\?v=[\w-]+/i,
        // YouTube live
        /^https?:\/\/(www\.)?youtube\.com\/live\/[\w-]+/i,
        // YouTube playlist
        /^https?:\/\/(www\.)?youtube\.com\/playlist\?list=[\w-]+/i,
        // YouTube channel
        /^https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/|@)[\w-]+/i,
      ],
      web: [
        // Generic web URLs (will be checked last)
        /^https?:\/\/[\w.-]+\.[\w]{2,}(\/.*)?$/i,
      ],
    };

    // Endpoints for different platforms
    this.endpoints = {
      tiktok: "/api/video/transcribe",
      instagram: "/api/video/transcribe",
      instagram_reel: "/api/video/transcribe",
      youtube: "/api/transcribe/youtube", // TODO: Implement YouTube scraping
      youtube_shorts: "/api/transcribe/youtube-shorts", // TODO: Implement YouTube shorts scraping
      web: "/api/scrape/web-post", // TODO: Implement web scraping
    };
  }

  /**
   * Detect the platform from a URL with comprehensive error handling
   * @param url - The URL to analyze
   * @returns Detection result with platform, type, and endpoint
   */
  detectPlatform(url: string): URLDetectionResult {
    // Input validation
    if (!url || typeof url !== "string") {
      return {
        platform: "unknown",
        type: "unknown",
        endpoint: null,
        url: "",
        error: "Invalid URL provided - must be a non-empty string",
        isSupported: false,
      };
    }

    // Clean and normalize URL
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      return {
        platform: "unknown",
        type: "unknown",
        endpoint: null,
        url: cleanUrl,
        error: "Empty URL provided",
        isSupported: false,
      };
    }

    // Basic URL format validation
    try {
      new URL(cleanUrl);
    } catch {
      return {
        platform: "unknown",
        type: "unknown",
        endpoint: null,
        url: cleanUrl,
        error: "Invalid URL format - please provide a valid HTTP/HTTPS URL",
        isSupported: false,
      };
    }

    try {
      // Check TikTok patterns
      for (const pattern of this.patterns.tiktok) {
        if (pattern.test(cleanUrl)) {
          const id = this.extractTikTokId(cleanUrl);
          return {
            platform: "tiktok",
            type: "video",
            endpoint: this.endpoints.tiktok,
            url: cleanUrl,
            id,
            isSupported: true,
          };
        }
      }

      // Check Instagram patterns
      for (const pattern of this.patterns.instagram) {
        if (pattern.test(cleanUrl)) {
          const instagramType = this.getInstagramType(cleanUrl);
          const id = this.extractInstagramId(cleanUrl);

          // Check if it's a supported Instagram type
          const isSupported = instagramType === "reel" || instagramType === "post";

          return {
            platform: "instagram",
            type: instagramType,
            endpoint: instagramType === "reel" ? this.endpoints.instagram_reel : this.endpoints.instagram,
            url: cleanUrl,
            id,
            isSupported,
            error: !isSupported
              ? `Instagram ${instagramType}s are not currently supported. Please use Instagram reels or posts.`
              : undefined,
          };
        }
      }

      // Check YouTube patterns
      for (const pattern of this.patterns.youtube) {
        if (pattern.test(cleanUrl)) {
          const youtubeType = this.getYouTubeType(cleanUrl);
          const id = this.extractYouTubeId(cleanUrl);

          return {
            platform: "youtube",
            type: youtubeType,
            endpoint: youtubeType === "shorts" ? this.endpoints.youtube_shorts : this.endpoints.youtube,
            url: cleanUrl,
            id,
            isSupported: false, // TODO: YouTube support not implemented yet
            error: "YouTube video processing is coming soon. Currently only TikTok and Instagram are supported.",
          };
        }
      }

      // Check if it's a generic web URL
      for (const pattern of this.patterns.web) {
        if (pattern.test(cleanUrl)) {
          const domain = this.extractDomain(cleanUrl);
          return {
            platform: "web",
            type: "post",
            endpoint: this.endpoints.web,
            url: cleanUrl,
            domain,
            isSupported: false, // TODO: Web scraping not implemented yet
            error: "Web page processing is coming soon. Currently only TikTok and Instagram are supported.",
          };
        }
      }

      // No patterns matched
      return {
        platform: "unknown",
        type: "unknown",
        endpoint: null,
        url: cleanUrl,
        error: "URL format not recognized. Currently supported: TikTok and Instagram videos.",
        isSupported: false,
      };
    } catch (error) {
      return {
        platform: "unknown",
        type: "unknown",
        endpoint: null,
        url: cleanUrl,
        error: `Error analyzing URL: ${error instanceof Error ? error.message : "Unknown error"}`,
        isSupported: false,
      };
    }
  }

  /**
   * Determine Instagram content type
   */
  private getInstagramType(url: string): string {
    if (/\/reel\//i.test(url) || /\/reels\//i.test(url)) {
      return "reel";
    }
    if (/\/p\//i.test(url)) {
      return "post";
    }
    if (/\/stories\//i.test(url)) {
      return "story";
    }
    if (/\/tv\//i.test(url)) {
      return "tv";
    }
    return "profile";
  }

  /**
   * Determine YouTube content type
   */
  private getYouTubeType(url: string): string {
    if (/\/shorts\//i.test(url)) {
      return "shorts";
    }
    if (/\/live\//i.test(url)) {
      return "live";
    }
    if (/\/playlist\?/i.test(url)) {
      return "playlist";
    }
    if (/\/(c\/|channel\/|user\/|@)/i.test(url)) {
      return "channel";
    }
    return "video";
  }

  /**
   * Extract TikTok video ID
   */
  private extractTikTokId(url: string): string | null {
    // Match various TikTok URL patterns and extract ID
    const patterns = [
      /\/video\/(\d+)/,
      /shareId=(\d+)/,
      /embed\/(\d+)/,
      /user\/(\d+)/,
      /v\/(\d+)/,
      /usr\/(\d+)/,
      /vm\.tiktok\.com\/([\w\d]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Extract Instagram ID
   */
  private extractInstagramId(url: string): string | null {
    const match = url.match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    return match ? match[2] : null;
  }

  /**
   * Extract YouTube video ID
   */
  private extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/).*[?&]v=|youtu\.be\/)([^"&?/\s]{11})/,
      /youtube\.com\/shorts\/([^"&?/\s]{11})/,
      /youtube\.com\/live\/([^"&?/\s]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Extract domain from web URL
   */
  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return null;
    }
  }
}

// Create a singleton instance for use throughout the app
export const urlDetector = new SocialMediaURLDetector();

// Convenience function for quick URL detection
export function detectURL(url: string): URLDetectionResult {
  return urlDetector.detectPlatform(url);
}
