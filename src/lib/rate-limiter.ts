/**
 * Rate Limiter for API calls
 * Ensures we respect rate limits by spacing out requests
 */

interface RateLimitConfig {
  maxRequestsPerSecond: number;
  maxRequestsPerMinute?: number;
}

interface RateLimitEntry {
  lastRequest: number;
  requestCount: number;
  minuteRequestCount: number;
  minuteStart: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private defaultConfig: RateLimitConfig = {
    maxRequestsPerSecond: 1,
    maxRequestsPerMinute: 50,
  };

  /**
   * Wait for rate limit compliance before making a request
   */
  async waitForRateLimit(key: string, config?: Partial<RateLimitConfig>): Promise<void> {
    // Normalize keys for Instagram to enforce a global limit across routes
    if (key.startsWith("instagram-")) {
      key = "instagram-global";
    }
    const finalConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();

    let entry = this.limits.get(key);
    if (!entry) {
      entry = {
        lastRequest: 0,
        requestCount: 0,
        minuteRequestCount: 0,
        minuteStart: now,
      };
      this.limits.set(key, entry);
    }

    // Reset minute counter if needed
    if (now - entry.minuteStart >= 60000) {
      entry.minuteRequestCount = 0;
      entry.minuteStart = now;
    }

    // Check minute limit
    if (finalConfig.maxRequestsPerMinute && entry.minuteRequestCount >= finalConfig.maxRequestsPerMinute) {
      const waitTime = 60000 - (now - entry.minuteStart);
      console.log(`⏳ [RATE_LIMITER] Waiting ${waitTime}ms for minute limit reset`);
      await this.sleep(waitTime);
      entry.minuteRequestCount = 0;
      entry.minuteStart = Date.now();
    }

    // Check second limit
    const timeSinceLastRequest = now - entry.lastRequest;
    const minInterval = 1000 / finalConfig.maxRequestsPerSecond;

    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      console.log(`⏳ [RATE_LIMITER] Waiting ${waitTime}ms for rate limit compliance`);
      await this.sleep(waitTime);
    }

    // Update counters
    entry.lastRequest = Date.now();
    entry.requestCount++;
    entry.minuteRequestCount++;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Reset rate limit for a key (useful for testing)
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Get current rate limit status
   */
  getStatus(key: string): RateLimitEntry | null {
    return this.limits.get(key) ?? null;
  }
}

// Global rate limiter instances
export const instagramRateLimiter = new RateLimiter();
export const rapidApiRateLimiter = new RateLimiter();
export const tiktokRateLimiter = new RateLimiter();
export const generalRateLimiter = new RateLimiter();

/**
 * Rate limit wrapper for Instagram API calls
 */
export async function withInstagramRateLimit<T>(
  operation: () => Promise<T>,
  key: string = "instagram-api",
): Promise<T> {
  // Route through the generic RapidAPI limiter so ALL RapidAPI calls share the same bucket
  return withRapidApiRateLimit(operation, key);
}

/**
 * Rate limit wrapper for TikTok API calls
 */
export async function withTikTokRateLimit<T>(operation: () => Promise<T>, key: string = "tiktok-api"): Promise<T> {
  return withRapidApiRateLimit(operation, key);
}

/**
 * Generic wrapper for ANY RapidAPI call
 */
export async function withRapidApiRateLimit<T>(
  operation: () => Promise<T>,
  key: string = "rapidapi-global",
): Promise<T> {
  await rapidApiRateLimiter.waitForRateLimit(key, {
    maxRequestsPerSecond: 1,
    maxRequestsPerMinute: 50,
  });
  return operation();
}

/**
 * Exponential backoff retry mechanism for API calls
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain error types
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("forbidden")
        ) {
          throw error;
        }
      }

      if (attempt === maxRetries) {
        break;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`🔄 [RETRY] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
