/**
 * Unified Video Scraper Service
 * Single interface for both TikTok and Instagram video scraping via Apify
 */

export interface UnifiedVideoResult {
  platform: "tiktok" | "instagram";
  shortCode: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  author: string;
  description: string;
  hashtags: string[];
  metrics: {
    likes: number;
    views: number;
    comments: number;
    shares: number;
    saves?: number;
  };
  metadata: {
    duration?: number;
    timestamp?: string;
    location?: string;
    isVerified?: boolean;
    followerCount?: number;
  };
  rawData: any; // Original Apify response for debugging
}

export interface ScraperOptions {
  timeout?: number;
  retryCount?: number;
  includeMetrics?: boolean;
}

export class UnifiedVideoScraper {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    // Auto-detect base URL for API calls
    this.baseUrl = baseUrl || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  }

  /**
   * Main scraping method - detects platform and routes to appropriate scraper
   */
  async scrapeUrl(url: string, options: ScraperOptions = {}): Promise<UnifiedVideoResult> {
    console.log("🔍 [UNIFIED_SCRAPER] Starting scrape for URL:", url);

    const platform = this.detectPlatform(url);

    if (platform === "unsupported") {
      throw new Error(`Unsupported URL format: ${url}. Only TikTok and Instagram videos are supported.`);
    }

    console.log("🎯 [UNIFIED_SCRAPER] Platform detected:", platform);

    try {
      let result: UnifiedVideoResult;

      if (platform === "instagram") {
        result = await this.scrapeInstagram(url, options);
      } else {
        result = await this.scrapeTikTok(url, options);
      }

      console.log("✅ [UNIFIED_SCRAPER] Scraping successful for:", platform);
      return result;
    } catch (error) {
      console.error(`❌ [UNIFIED_SCRAPER] ${platform} scraping failed:`, error);
      throw new Error(
        `Failed to scrape ${platform} video: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Scrape Instagram video using the new RapidAPI shortcode endpoint
   */
  private async scrapeInstagram(url: string, options: ScraperOptions = {}): Promise<UnifiedVideoResult> {
    console.log("📸 [UNIFIED_SCRAPER] Scraping Instagram URL with RapidAPI shortcode endpoint...");

    // Extract shortcode from Instagram URL - much simpler approach
    const shortcode = this.extractShortcode(url);
    if (!shortcode) {
      throw new Error("Could not extract shortcode from Instagram URL");
    }

    console.log(`🔍 [UNIFIED_SCRAPER] Extracted Instagram shortcode: ${shortcode}`);

    // Call the RapidAPI Instagram endpoint using shortcode
    const response = await fetch(`https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/post?shortcode=${shortcode}`, {
      method: "GET",
      headers: {
        'x-rapidapi-host': 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || ''
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [UNIFIED_SCRAPER] RapidAPI request failed:", response.status, errorText);
      throw new Error(`Instagram API request failed: ${response.status} ${response.statusText}`);
    }

    const instagramData = await response.json();
    console.log("✅ [UNIFIED_SCRAPER] Instagram data retrieved successfully");

    // Extract video URL with improved size optimization
    let videoUrl = "";
    let selectionMethod = "";
    
    // Process Instagram video versions - prioritize dash manifest for smallest size
    const standardVersions = instagramData.video_versions || [];
    const dashVersions = instagramData.video_dash_manifest?.video_versions || [];
    
    // Combine all available versions, with dash versions first (usually smaller)
    const allVersions = [...dashVersions, ...standardVersions];
    
    console.log('📹 [UNIFIED_SCRAPER] Available standard video versions:',
      standardVersions.map((v: any) => `${v.width}x${v.height} (${v.bandwidth} bandwidth, ${(v.width || 0) * (v.height || 0)} pixels)`));
    
    console.log('📹 [UNIFIED_SCRAPER] Available dash video versions:',
      dashVersions.map((v: any) => `${v.width}x${v.height} (${v.bandwidth} bandwidth, ${(v.width || 0) * (v.height || 0)} pixels)`));

    let selectedVersion: any = null;
    
    if (allVersions.length > 0) {
      // Sort by bandwidth (lowest first) to get the smallest file
      // Dash versions are prioritized since they're typically much smaller
      const sortedVersions = allVersions.sort((a: any, b: any) => (a.bandwidth || 0) - (b.bandwidth || 0));
      selectedVersion = sortedVersions[0];
      
      const versionSource = dashVersions.includes(selectedVersion) ? 'dash manifest' : 'standard';
      console.log(`📹 [UNIFIED_SCRAPER] Selected smallest version from ${versionSource}: ${selectedVersion.width}x${selectedVersion.height} (bandwidth: ${selectedVersion.bandwidth}, ${(selectedVersion.width || 0) * (selectedVersion.height || 0)} pixels)`);
      
      videoUrl = selectedVersion?.url || "";
      selectionMethod = `${versionSource} (${selectedVersion.width}x${selectedVersion.height}, ${selectedVersion.bandwidth} bandwidth)`;
    }
    
    // Log what data is available for debugging
    console.log('📊 [UNIFIED_SCRAPER] Instagram data structure analysis:');
    console.log('  - standard video_versions:', standardVersions.length, 'found');
    console.log('  - dash video_versions:', dashVersions.length, 'found');
    console.log('  - video_dash_manifest:', instagramData.video_dash_manifest ? 'available' : 'not found');
    console.log('  - Selection method:', selectionMethod);
    
    // Extract thumbnail URL
    const thumbnailUrl = instagramData.image_versions2?.candidates?.[0]?.url || "";
    
    // Extract hashtags from caption
    const caption = instagramData.caption?.text || "";
    const hashtags = this.extractHashtagsFromText(caption);

    return {
      platform: "instagram",
      shortCode: instagramData.code || shortcode,
      videoUrl,
      thumbnailUrl,
      title: caption || `Video by @${instagramData.user?.username}`,
      author: instagramData.user?.username || "unknown",
      description: caption,
      hashtags,
      metrics: {
        likes: instagramData.like_count || 0,
        views: instagramData.play_count || 0,
        comments: instagramData.comment_count || 0,
        shares: instagramData.reshare_count || 0,
      },
      metadata: {
        duration: instagramData.video_duration || 0,
        timestamp: instagramData.taken_at ? new Date(instagramData.taken_at * 1000).toISOString() : undefined,
        isVerified: instagramData.user?.is_verified || false,
        followerCount: 0, // Not available in this endpoint
      },
      rawData: instagramData,
    };
  }

  /**
   * Scrape Instagram post/reel by shortcode using a more direct approach
   */
  private async scrapeInstagramPost(url: string, shortcode: string): Promise<UnifiedVideoResult> {
    console.log(`📋 [UNIFIED_SCRAPER] Scraping Instagram post with shortcode: ${shortcode}`);

    // Try the Instagram post scraper first - we'll create this endpoint
    try {
      const response = await fetch(`${this.baseUrl}/api/apify/instagram/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, shortcode }),
      });

      if (response.ok) {
        const apiResult = await response.json();
        if (apiResult.success && apiResult.data) {
          const instagramData = apiResult.data;

          return {
            platform: "instagram",
            shortCode: shortcode,
            videoUrl: instagramData.videoUrl || instagramData.videoUrlBackup || "",
            thumbnailUrl: instagramData.thumbnailUrl || instagramData.imageUrl || instagramData.displayUrl || "",
            title: instagramData.caption || `Video by @${instagramData.ownerUsername}`,
            author: instagramData.ownerUsername || "unknown",
            description: instagramData.caption || "",
            hashtags: instagramData.hashtags || [],
            metrics: {
              likes: instagramData.likesCount || 0,
              views: instagramData.videoViewCount || 0,
              comments: instagramData.commentsCount || 0,
              shares: 0,
            },
            metadata: {
              timestamp: instagramData.timestamp,
              location: instagramData.location?.name,
            },
            rawData: instagramData,
          };
        }
      }
    } catch (error) {
      console.log(`⚠️ [UNIFIED_SCRAPER] Instagram post scraper failed, falling back: ${error}`);
    }

    // For now, throw an error to indicate we need a different approach
    console.log(`❌ [UNIFIED_SCRAPER] Instagram post URLs are not yet supported`);
    throw new Error(
      `Instagram post URLs are not supported yet. ` +
        `Please use Instagram reel URLs instead (look for /reel/ in the URL). ` +
        `Post URLs with /p/ are not compatible with our current video processing system.`,
    );
  }

  /**
   * Scrape TikTok video using Apify scraper endpoint with postURLs
   */
  private async scrapeTikTok(url: string, options: ScraperOptions = {}): Promise<UnifiedVideoResult> {
    console.log("🎵 [UNIFIED_SCRAPER] Scraping TikTok URL...");

    const response = await fetch(`${this.baseUrl}/api/apify/tiktok/scraper`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoUrls: [url], // This gets mapped to postURLs in the API
        resultsPerPage: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "API request failed" }));
      throw new Error(errorData.error || `TikTok API error: ${response.status}`);
    }

    const apiResult = await response.json();

    if (!apiResult.success || !apiResult.data || apiResult.data.length === 0) {
      throw new Error("No TikTok data returned from Apify");
    }

    const tiktokData = apiResult.data[0]; // First result

    // Extract video URL from videoMeta.downloadAddr (primary) with fallbacks
    const videoUrl =
      tiktokData["videoMeta.downloadAddr"] ||
      tiktokData.videoMeta?.downloadAddr ||
      tiktokData.videoMeta?.subtitleLinks?.[0]?.downloadLink ||
      tiktokData.videoUrl ||
      tiktokData.playAddr ||
      "";

    // Extract thumbnail URL from videoMeta.coverUrl with fallbacks
    const thumbnailUrl =
      tiktokData["videoMeta.coverUrl"] ||
      tiktokData.videoMeta?.coverUrl ||
      tiktokData.covers?.[0] ||
      tiktokData.dynamicCover ||
      tiktokData.originCover ||
      "";

    return {
      platform: "tiktok",
      shortCode: tiktokData.id ?? "unknown",
      videoUrl,
      thumbnailUrl,
      title: tiktokData.text ?? tiktokData.desc ?? tiktokData.title ?? `TikTok by @${tiktokData.authorMeta?.name}`,
      author: tiktokData.authorMeta?.name ?? tiktokData.author?.uniqueId ?? tiktokData.author?.nickname ?? "unknown",
      description: tiktokData.text ?? tiktokData.desc ?? tiktokData.title ?? "",
      hashtags:
        tiktokData.textExtra?.filter((item: any) => item.hashtagName)?.map((item: any) => item.hashtagName) ?? [],
      metrics: {
        likes: tiktokData.diggCount ?? tiktokData.stats?.diggCount ?? tiktokData.digg_count ?? 0,
        views: tiktokData.playCount ?? tiktokData.stats?.playCount ?? tiktokData.play_count ?? 0,
        comments: tiktokData.commentCount ?? tiktokData.stats?.commentCount ?? tiktokData.comment_count ?? 0,
        shares: tiktokData.shareCount ?? tiktokData.stats?.shareCount ?? tiktokData.share_count ?? 0,
        saves: tiktokData.collectCount ?? tiktokData.stats?.collectCount ?? 0,
      },
      metadata: {
        duration:
          tiktokData["videoMeta.duration"] ??
          tiktokData.videoMeta?.duration ??
          tiktokData.video?.duration ??
          tiktokData.musicMeta?.duration ??
          0,
        timestamp: tiktokData.createTime
          ? new Date(tiktokData.createTime * 1000).toISOString()
          : tiktokData.createTimeISO,
        isVerified: tiktokData.authorMeta?.verified ?? tiktokData.author?.verified ?? false,
        followerCount: tiktokData.authorMeta?.fans ?? tiktokData.authorStats?.followerCount ?? 0,
      },
      rawData: tiktokData,
    };
  }

  /**
   * Detect platform from URL
   */
  static detectPlatform(url: string): "tiktok" | "instagram" | "unsupported" {
    const lowerUrl = url.toLowerCase();

    // Instagram patterns
    if (
      lowerUrl.includes("instagram.com") &&
      (lowerUrl.includes("/reel") || lowerUrl.includes("/p/") || lowerUrl.includes("/tv/"))
    ) {
      return "instagram";
    }

    // TikTok patterns
    if (lowerUrl.includes("tiktok.com") || lowerUrl.includes("vm.tiktok.com")) {
      return "tiktok";
    }

    return "unsupported";
  }

  // Instance method for convenience
  detectPlatform(url: string): "tiktok" | "instagram" | "unsupported" {
    return UnifiedVideoScraper.detectPlatform(url);
  }

  /**
   * Validate if URL is supported
   */
  static validateUrl(url: string): boolean {
    return this.detectPlatform(url) !== "unsupported";
  }

  /**
   * Extract Instagram shortcode from URL
   */
  private extractShortcode(url: string): string | null {
    const match = url.match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    return match ? match[2] : null;
  }

  /**
   * Extract Instagram media ID from URL - converts shortcode to media ID
   */
  private extractInstagramMediaId(url: string): string | null {
    // Try to extract shortcode first
    const shortcode = this.extractShortcode(url);
    if (!shortcode) return null;

    // If URL already contains the media ID format (number_number), extract it
    const mediaIdMatch = url.match(/\/([0-9]+_[0-9]+)/);
    if (mediaIdMatch) {
      return mediaIdMatch[1];
    }

    // Convert shortcode to media ID using base62 decoding
    try {
      const mediaId = this.shortcodeToMediaId(shortcode);
      return mediaId;
    } catch (error) {
      console.error("❌ [UNIFIED_SCRAPER] Failed to convert shortcode to media ID:", error);
      return null;
    }
  }

  /**
   * Convert Instagram shortcode to media ID using base62 decoding
   */
  private shortcodeToMediaId(shortcode: string): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let decoded = 0;
    
    for (let i = 0; i < shortcode.length; i++) {
      const char = shortcode[i];
      const index = alphabet.indexOf(char);
      if (index === -1) {
        throw new Error(`Invalid character in shortcode: ${char}`);
      }
      decoded = decoded * 64 + index;
    }
    
    // Instagram media IDs are typically in format: {decoded}_user_id
    // Since we don't have the user ID, we'll try to use the shortcode directly
    // or use a fallback approach
    
    // For now, return just the decoded number as string
    // In practice, you might need additional logic to construct the full media ID
    return decoded.toString();
  }

  /**
   * Extract hashtags from text content
   */
  private extractHashtagsFromText(text: string): string[] {
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  }

  /**
   * Get detailed URL validation patterns for frontend
   */
  static getUrlPatterns() {
    return {
      instagram: /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+/,
      tiktok:
        /^https?:\/\/(www\.)?(tiktok\.com\/@[\w.-]+\/video\/\d+|vm\.tiktok\.com\/[A-Za-z0-9]+|tiktok\.com\/t\/[A-Za-z0-9]+)/,
    };
  }

  /**
   * Enhanced URL validation with specific error messages
   */
  static validateUrlWithMessage(url: string): { valid: boolean; message?: string; platform?: string } {
    if (!url || url.trim() === "") {
      return { valid: false, message: "URL is required" };
    }

    try {
      new URL(url); // Basic URL format validation
    } catch {
      return { valid: false, message: "Please enter a valid URL" };
    }

    // Check if it's an Apify storage URL (contains video file from scraping)
    const isApifyStorageUrl = url.includes('api.apify.com/v2/key-value-stores/') && url.includes('/records/video-');
    
    if (isApifyStorageUrl) {
      console.log("🔍 [UNIFIED_SCRAPER] Detected Apify storage URL for direct video download");
      return { valid: true, platform: "apify_storage" };
    }

    // Check if it's a direct Instagram CDN video URL (already scraped)
    const isInstagramCdnUrl = url.includes('scontent-') && url.includes('.cdninstagram.com') && url.includes('.mp4');
    
    if (isInstagramCdnUrl) {
      console.log("🔍 [UNIFIED_SCRAPER] Detected Instagram CDN URL for direct video download");
      return { valid: true, platform: "instagram_cdn" };
    }

    // Check if it's a direct TikTok CDN video URL (already scraped)
    const isTikTokCdnUrl = (url.includes('tiktokcdn.com') || url.includes('tiktokv.com') || url.includes('muscdn.com')) && url.includes('.mp4');
    
    if (isTikTokCdnUrl) {
      console.log("🔍 [UNIFIED_SCRAPER] Detected TikTok CDN URL for direct video download");
      return { valid: true, platform: "tiktok_cdn" };
    }

    // Check for Instagram post URLs specifically
    if (url.includes("instagram.com") && url.match(/\/p\/[A-Za-z0-9_-]+/)) {
      return {
        valid: false,
        message:
          "Instagram post URLs are not supported yet. Please use Instagram reel URLs instead (look for /reel/ in the URL).",
      };
    }

    const platform = this.detectPlatform(url);

    if (platform === "unsupported") {
      return {
        valid: false,
        message: "Only TikTok, Instagram, and Apify storage video URLs are supported",
      };
    }

    return { valid: true, platform };
  }
}

/**
 * Factory function for easy usage
 */
export function createUnifiedVideoScraper(baseUrl?: string): UnifiedVideoScraper {
  return new UnifiedVideoScraper(baseUrl);
}

/**
 * Utility function for quick single URL scraping
 */
export async function scrapeVideoUrl(url: string, options: ScraperOptions = {}): Promise<UnifiedVideoResult> {
  const scraper = createUnifiedVideoScraper();
  return await scraper.scrapeUrl(url, options);
}
