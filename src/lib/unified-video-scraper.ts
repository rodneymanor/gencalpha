/**
 * Unified Video Scraper Service
 * Single interface for both TikTok and Instagram video scraping via Apify
 */

export interface UnifiedVideoResult {
  platform: 'tiktok' | 'instagram';
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

  constructor(baseUrl: string = '') {
    // Auto-detect base URL for API calls
    this.baseUrl = baseUrl || (
      process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
    );
  }

  /**
   * Main scraping method - detects platform and routes to appropriate scraper
   */
  async scrapeUrl(url: string, options: ScraperOptions = {}): Promise<UnifiedVideoResult> {
    console.log('🔍 [UNIFIED_SCRAPER] Starting scrape for URL:', url);

    const platform = this.detectPlatform(url);
    
    if (platform === 'unsupported') {
      throw new Error(`Unsupported URL format: ${url}. Only TikTok and Instagram videos are supported.`);
    }

    console.log('🎯 [UNIFIED_SCRAPER] Platform detected:', platform);

    try {
      let result: UnifiedVideoResult;

      if (platform === 'instagram') {
        result = await this.scrapeInstagram(url, options);
      } else {
        result = await this.scrapeTikTok(url, options);
      }

      console.log('✅ [UNIFIED_SCRAPER] Scraping successful for:', platform);
      return result;

    } catch (error) {
      console.error(`❌ [UNIFIED_SCRAPER] ${platform} scraping failed:`, error);
      throw new Error(`Failed to scrape ${platform} video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Scrape Instagram video using Apify reel endpoint
   */
  private async scrapeInstagram(url: string, options: ScraperOptions = {}): Promise<UnifiedVideoResult> {
    console.log('📸 [UNIFIED_SCRAPER] Scraping Instagram URL...');

    const response = await fetch(`${this.baseUrl}/api/apify/instagram/reel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'API request failed' }));
      throw new Error(errorData.error || `Instagram API error: ${response.status}`);
    }

    const apiResult = await response.json();

    if (!apiResult.success || !apiResult.data || apiResult.data.length === 0) {
      throw new Error('No Instagram data returned from Apify');
    }

    const instagramData = apiResult.data[0]; // First result

    return {
      platform: 'instagram',
      shortCode: instagramData.shortCode || this.extractShortcode(url) || 'unknown',
      videoUrl: instagramData.videoUrl || instagramData.videoUrlBackup || '',
      thumbnailUrl: instagramData.thumbnailUrl || instagramData.imageUrl || instagramData.displayUrl || '',
      title: instagramData.caption || `Video by @${instagramData.ownerUsername}`,
      author: instagramData.ownerUsername || 'unknown',
      description: instagramData.caption || '',
      hashtags: instagramData.hashtags || [],
      metrics: {
        likes: instagramData.likesCount || 0,
        views: instagramData.videoViewCount || 0,
        comments: instagramData.commentsCount || 0,
        shares: 0, // Instagram doesn't provide shares in API
      },
      metadata: {
        duration: instagramData.videoDurationSeconds,
        timestamp: instagramData.timestamp,
        location: instagramData.location?.name,
        isVerified: false, // Not available in current Apify response
      },
      rawData: instagramData,
    };
  }

  /**
   * Scrape TikTok video using Apify scraper endpoint with postURLs
   */
  private async scrapeTikTok(url: string, options: ScraperOptions = {}): Promise<UnifiedVideoResult> {
    console.log('🎵 [UNIFIED_SCRAPER] Scraping TikTok URL...');

    const response = await fetch(`${this.baseUrl}/api/apify/tiktok/scraper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        videoUrls: [url], // This gets mapped to postURLs in the API
        resultsPerPage: 1 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'API request failed' }));
      throw new Error(errorData.error || `TikTok API error: ${response.status}`);
    }

    const apiResult = await response.json();

    if (!apiResult.success || !apiResult.data || apiResult.data.length === 0) {
      throw new Error('No TikTok data returned from Apify');
    }

    const tiktokData = apiResult.data[0]; // First result

    // Extract video URL from subtitleLinks (TikTok's video download link)
    const videoUrl = tiktokData.videoMeta?.subtitleLinks?.[0]?.downloadLink 
      || tiktokData.videoUrl 
      || tiktokData.playAddr 
      || '';

    return {
      platform: 'tiktok',
      shortCode: tiktokData.id ?? 'unknown',
      videoUrl,
      thumbnailUrl: tiktokData.videoMeta?.coverUrl ?? tiktokData.covers?.[0] ?? tiktokData.dynamicCover ?? tiktokData.originCover ?? '',
      title: tiktokData.text ?? tiktokData.desc ?? tiktokData.title ?? `TikTok by @${tiktokData.authorMeta?.name}`,
      author: tiktokData.authorMeta?.name ?? tiktokData.author?.uniqueId ?? tiktokData.author?.nickname ?? 'unknown',
      description: tiktokData.text ?? tiktokData.desc ?? tiktokData.title ?? '',
      hashtags: tiktokData.textExtra?.filter((item: any) => item.hashtagName)?.map((item: any) => item.hashtagName) ?? [],
      metrics: {
        likes: tiktokData.diggCount ?? tiktokData.stats?.diggCount ?? tiktokData.digg_count ?? 0,
        views: tiktokData.playCount ?? tiktokData.stats?.playCount ?? tiktokData.play_count ?? 0,
        comments: tiktokData.commentCount ?? tiktokData.stats?.commentCount ?? tiktokData.comment_count ?? 0,
        shares: tiktokData.shareCount ?? tiktokData.stats?.shareCount ?? tiktokData.share_count ?? 0,
        saves: tiktokData.collectCount ?? tiktokData.stats?.collectCount ?? 0,
      },
      metadata: {
        duration: tiktokData.videoMeta?.duration ?? tiktokData.video?.duration ?? tiktokData.musicMeta?.duration ?? 0,
        timestamp: tiktokData.createTime ? new Date(tiktokData.createTime * 1000).toISOString() : tiktokData.createTimeISO,
        isVerified: tiktokData.authorMeta?.verified ?? tiktokData.author?.verified ?? false,
        followerCount: tiktokData.authorMeta?.fans ?? tiktokData.authorStats?.followerCount ?? 0,
      },
      rawData: tiktokData,
    };
  }

  /**
   * Detect platform from URL
   */
  static detectPlatform(url: string): 'tiktok' | 'instagram' | 'unsupported' {
    const lowerUrl = url.toLowerCase();

    // Instagram patterns
    if (lowerUrl.includes('instagram.com') && 
        (lowerUrl.includes('/reel') || lowerUrl.includes('/p/') || lowerUrl.includes('/tv/'))) {
      return 'instagram';
    }

    // TikTok patterns
    if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('vm.tiktok.com')) {
      return 'tiktok';
    }

    return 'unsupported';
  }

  // Instance method for convenience
  detectPlatform(url: string): 'tiktok' | 'instagram' | 'unsupported' {
    return UnifiedVideoScraper.detectPlatform(url);
  }

  /**
   * Validate if URL is supported
   */
  static validateUrl(url: string): boolean {
    return this.detectPlatform(url) !== 'unsupported';
  }

  /**
   * Extract Instagram shortcode from URL
   */
  private extractShortcode(url: string): string | null {
    const match = url.match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    return match ? match[2] : null;
  }

  /**
   * Get detailed URL validation patterns for frontend
   */
  static getUrlPatterns() {
    return {
      instagram: /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+/,
      tiktok: /^https?:\/\/(www\.)?(tiktok\.com\/@[\w.-]+\/video\/\d+|vm\.tiktok\.com\/[A-Za-z0-9]+|tiktok\.com\/t\/[A-Za-z0-9]+)/,
    };
  }

  /**
   * Enhanced URL validation with specific error messages
   */
  static validateUrlWithMessage(url: string): { valid: boolean; message?: string; platform?: string } {
    if (!url || url.trim() === '') {
      return { valid: false, message: 'URL is required' };
    }

    try {
      new URL(url); // Basic URL format validation
    } catch {
      return { valid: false, message: 'Please enter a valid URL' };
    }

    const platform = this.detectPlatform(url);
    
    if (platform === 'unsupported') {
      return { 
        valid: false, 
        message: 'Only TikTok and Instagram video URLs are supported' 
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