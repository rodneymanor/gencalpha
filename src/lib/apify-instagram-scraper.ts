/**
 * Apify Instagram Scraper Integration
 * Uses Apify's "Instagram Scraper" Actor (apify~instagram-scraper)
 */

export interface ApifyInstagramInput {
  directUrls: string[];
  resultsType?: "posts" | "comments" | "details" | "mentions" | "stories";
  resultsLimit?: number;
  onlyPostsNewerThan?: string;
  isUserReelFeedURL?: boolean;
  proxyConfiguration?: {
    useApifyProxy?: boolean;
    apifyProxyGroups?: string[];
    apifyProxyCountry?: string;
  };
}

export interface ApifyInstagramResult {
  shortCode: string;
  caption?: string;
  hashtags: string[];
  likesCount: number;
  videoViewCount?: number;
  commentsCount: number;
  timestamp: string;
  displayUrl?: string;
  videoUrl?: string;
  videoUrlBackup?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  ownerUsername: string;
  ownerFullName?: string;
  isVideo: boolean;
  videoDurationSeconds?: number;
  location?: {
    name: string;
    id: string;
  };
  mentions: string[];
  url: string;
}

export interface ApifyRunInfo {
  id: string;
  actId: string;
  actorId?: string;
  userId?: string;
  status: "READY" | "RUNNING" | "SUCCEEDED" | "FAILED" | "TIMED-OUT" | "ABORTED";
  statusMessage?: string;
  defaultDatasetId: string;
  defaultKeyValueStoreId?: string;
  defaultRequestQueueId?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  buildId?: string;
  exitCode?: number;
  meta?: {
    origin?: string;
    clientIp?: string;
    userAgent?: string;
  };
  stats?: {
    inputBodyLen?: number;
    restartCount?: number;
    resurrectCount?: number;
    memAvgBytes?: number;
    memMaxBytes?: number;
    memCurrentBytes?: number;
    cpuAvgUsage?: number;
    cpuMaxUsage?: number;
    cpuCurrentUsage?: number;
    netRxBytes?: number;
    netTxBytes?: number;
    durationMillis?: number;
    runTimeSecs?: number;
    metamorph?: number;
    computeUnits?: number;
  };
}

export class ApifyInstagramScraper {
  private readonly apiToken: string;
  private readonly actorId = "apify~instagram-scraper";
  private readonly baseUrl = "https://api.apify.com/v2";

  constructor(apiToken: string) {
    if (!apiToken) {
      throw new Error("Apify API token is required");
    }
    this.apiToken = apiToken;
  }

  /**
   * Quick synchronous scraping for single URLs (≤60s timeout for testing)
   * Perfect for testing and small jobs
   */
  async scrapeSyncQuick(
    urls: string | string[],
    options: Partial<ApifyInstagramInput> = {},
  ): Promise<ApifyInstagramResult[]> {
    console.log("🚀 [APIFY] Starting sync quick scrape for URLs:", urls);

    const urlArray = Array.isArray(urls) ? urls : [urls];

    const input: ApifyInstagramInput = {
      directUrls: urlArray,
      resultsType: "details",
      resultsLimit: 1,
      proxyConfiguration: { useApifyProxy: true },
      ...options,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ [APIFY] Request timeout after 60s, aborting...");
      controller.abort();
    }, 60000); // 1 minute timeout for testing

    try {
      console.log("📡 [APIFY] Making request to:", `${this.baseUrl}/acts/${this.actorId}/run-sync-get-dataset-items`);
      console.log("🔧 [APIFY] Request parameters:", { memory: 1024, timeout: 60 });
      console.log("📝 [APIFY] Input data:", JSON.stringify(input, null, 2));

      const response = await fetch(
        `${this.baseUrl}/acts/${this.actorId}/run-sync-get-dataset-items?token=${this.apiToken}&memory=1024&timeout=60`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Instagram-Scraper-Test/1.0",
          },
          body: JSON.stringify(input),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      console.log("📥 [APIFY] Response status:", response.status);
      console.log("📋 [APIFY] Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorDetails = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          errorDetails += ` - ${errorText}`;
          console.error("❌ [APIFY] Error response body:", errorText);
        } catch {
          console.error("❌ [APIFY] Could not read error response body");
        }
        throw new Error(`Apify API error: ${errorDetails}`);
      }

      const results: ApifyInstagramResult[] = await response.json();
      console.log("✅ [APIFY] Sync scrape completed, got", results.length, "results");

      if (results.length > 0) {
        console.log("🔍 [APIFY] First result sample:", {
          shortCode: results[0].shortCode,
          ownerUsername: results[0].ownerUsername,
          isVideo: results[0].isVideo,
          hasVideoUrl: !!results[0].videoUrl,
          hasImageUrl: !!results[0].imageUrl,
        });
      }

      return results;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.error("❌ [APIFY] Request timed out after 60 seconds");
          throw new Error(
            "Request timed out. Instagram scraping took too long - try using async method for complex requests.",
          );
        } else if (error.message.includes("fetch")) {
          console.error("❌ [APIFY] Network error:", error.message);
          throw new Error("Network error connecting to Apify API. Please check your internet connection.");
        }
      }

      console.error("❌ [APIFY] Sync scrape failed:", error);
      throw error;
    }
  }

  /**
   * Asynchronous scraping for larger jobs
   * Returns run info, use pollRun() and getResults() to fetch data
   */
  async scrapeAsync(urls: string | string[], options: Partial<ApifyInstagramInput> = {}): Promise<ApifyRunInfo> {
    console.log("🚀 [APIFY] Starting async scrape for URLs:", urls);

    const urlArray = Array.isArray(urls) ? urls : [urls];

    const input: ApifyInstagramInput = {
      directUrls: urlArray,
      resultsType: "details",
      resultsLimit: 50,
      proxyConfiguration: { useApifyProxy: true },
      ...options,
    };

    const response = await fetch(`${this.baseUrl}/acts/${this.actorId}/runs?token=${this.apiToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apify API error: ${response.status} - ${errorText}`);
    }

    const rawResponse = await response.json();
    console.log("✅ [APIFY] Raw response received");

    // Apify API wraps the run info in a 'data' property
    const runInfo: ApifyRunInfo = rawResponse.data;
    console.log("🔍 [APIFY] Parsed run info ID:", runInfo.id);

    if (!runInfo?.id) {
      console.error("❌ [APIFY] Missing run ID in response:", JSON.stringify(rawResponse, null, 2));
      throw new Error(
        `Failed to get run ID from Apify response. Expected data.id but got: ${JSON.stringify(rawResponse)}`,
      );
    }

    console.log("✅ [APIFY] Async run started successfully:", runInfo.id);
    return runInfo;
  }

  /**
   * Poll run status until completion
   */
  async pollRun(runId: string, maxWaitTime = 600000): Promise<ApifyRunInfo> {
    console.log("⏳ [APIFY] Polling run:", runId);

    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const response = await fetch(`${this.baseUrl}/actor-runs/${runId}?token=${this.apiToken}`);

      if (!response.ok) {
        throw new Error(`Failed to poll run status: ${response.status}`);
      }

      const rawResponse = await response.json();
      const runInfo: ApifyRunInfo = rawResponse.data ?? rawResponse;
      console.log("🔄 [APIFY] Run status:", runInfo.status);

      if (runInfo.status === "SUCCEEDED") {
        console.log("✅ [APIFY] Run completed successfully");
        return runInfo;
      }

      if (runInfo.status === "FAILED" || runInfo.status === "TIMED-OUT" || runInfo.status === "ABORTED") {
        throw new Error(`Apify run failed with status: ${runInfo.status}`);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error("Polling timeout exceeded");
  }

  /**
   * Get results from completed run
   */
  async getResults(datasetId: string): Promise<ApifyInstagramResult[]> {
    console.log("📥 [APIFY] Fetching results from dataset:", datasetId);

    const response = await fetch(
      `${this.baseUrl}/datasets/${datasetId}/items?clean=true&format=json&token=${this.apiToken}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch results: ${response.status}`);
    }

    const results: ApifyInstagramResult[] = await response.json();
    console.log("✅ [APIFY] Fetched", results.length, "results");

    return results;
  }

  /**
   * Complete async workflow: start → poll → get results
   */
  async scrapeComplete(
    urls: string | string[],
    options: Partial<ApifyInstagramInput> = {},
  ): Promise<ApifyInstagramResult[]> {
    try {
      const runInfo = await this.scrapeAsync(urls, options);
      console.log("🔍 [APIFY] Got run info, attempting to poll...");
      const completedRun = await this.pollRun(runInfo.id);
      console.log("✅ [APIFY] Polling completed, fetching results...");
      return await this.getResults(completedRun.defaultDatasetId);
    } catch (error) {
      console.error("❌ [APIFY] scrapeComplete error:", error);
      throw error;
    }
  }

  /**
   * Extract video download URL from result
   */
  static getVideoUrl(result: ApifyInstagramResult): string | null {
    return result.videoUrl ?? result.videoUrlBackup ?? null;
  }

  /**
   * Extract image URL from result
   */
  static getImageUrl(result: ApifyInstagramResult): string | null {
    return result.imageUrl ?? result.displayUrl ?? null;
  }

  /**
   * Extract thumbnail URL from result
   */
  static getThumbnailUrl(result: ApifyInstagramResult): string | null {
    return result.thumbnailUrl ?? result.displayUrl ?? null;
  }

  /**
   * Check if Instagram URL is valid
   */
  static isValidInstagramUrl(url: string): boolean {
    const instagramPattern = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+/;
    return instagramPattern.test(url);
  }

  /**
   * Extract shortcode from Instagram URL
   */
  static extractShortcode(url: string): string | null {
    const match = url.match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    return match ? match[2] : null;
  }
}

/**
 * Factory function to create scraper instance
 */
export function createApifyInstagramScraper(): ApifyInstagramScraper {
  const apiToken = process.env.APIFY_TOKEN;

  if (!apiToken) {
    throw new Error("APIFY_TOKEN environment variable is not set. Please configure your Apify API token.");
  }

  return new ApifyInstagramScraper(apiToken);
}

/**
 * Utility function for quick single URL scraping
 */
export async function scrapeInstagramUrl(url: string): Promise<ApifyInstagramResult | null> {
  if (!ApifyInstagramScraper.isValidInstagramUrl(url)) {
    throw new Error("Invalid Instagram URL");
  }

  const scraper = createApifyInstagramScraper();
  const results = await scraper.scrapeSyncQuick(url);

  return results.length > 0 ? results[0] : null;
}
