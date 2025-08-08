/**
 * Global Rate Limiter for RapidAPI Instagram calls
 * Ensures only ONE Instagram RapidAPI call happens at a time across the entire application
 */

interface QueuedRequest<T = unknown> {
  operation: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
  key: string;
}

class GlobalRateLimiter {
  private queue: QueuedRequest<any>[] = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private readonly minInterval: number;

  constructor(requestsPerSecond: number = 1) {
    this.minInterval = 1000 / requestsPerSecond; // 1000ms for 1 req/sec
  }

  /**
   * Add a request to the global queue
   */
  async enqueue<T>(operation: () => Promise<T>, key: string = "default"): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        operation,
        resolve: resolve as (value: T) => void,
        reject,
        key,
      };

      this.queue.push(request);
      console.log(`📋 [GLOBAL_RATE_LIMITER] Queued request '${key}' (queue length: ${this.queue.length})`);

      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the queue one request at a time
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`🔄 [GLOBAL_RATE_LIMITER] Starting queue processing (${this.queue.length} items)`);

    while (this.queue.length > 0) {
      const request = this.queue.shift()!;

      try {
        // Ensure minimum interval between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minInterval) {
          const waitTime = this.minInterval - timeSinceLastRequest;
          console.log(`⏳ [GLOBAL_RATE_LIMITER] Waiting ${waitTime}ms before processing '${request.key}'`);
          await this.sleep(waitTime);
        }

        console.log(`🚀 [GLOBAL_RATE_LIMITER] Processing request '${request.key}'`);

        // Update last request time BEFORE executing (not after)
        this.lastRequestTime = Date.now();

        // Execute the operation
        const result = await request.operation();

        // Resolve the promise
        request.resolve(result);

        console.log(`✅ [GLOBAL_RATE_LIMITER] Completed request '${request.key}' (${this.queue.length} remaining)`);
      } catch (error) {
        console.error(`❌ [GLOBAL_RATE_LIMITER] Failed request '${request.key}':`, error);
        request.reject(error);
      }

      // Small buffer between requests to be safe
      await this.sleep(100);
    }

    this.isProcessing = false;
    console.log(`✨ [GLOBAL_RATE_LIMITER] Queue processing completed`);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      lastRequestTime: this.lastRequestTime,
      timeSinceLastRequest: Date.now() - this.lastRequestTime,
    };
  }

  /**
   * Clear the queue (emergency use)
   */
  clearQueue() {
    console.log(`🧹 [GLOBAL_RATE_LIMITER] Clearing queue (${this.queue.length} items)`);
    this.queue.forEach((request) => {
      request.reject(new Error("Queue cleared"));
    });
    this.queue = [];
    this.isProcessing = false;
  }
}

// Global instances
// Single shared RapidAPI limiter so ALL RapidAPI calls (Instagram, TikTok, etc.) share the same bucket
// Use a conservative cadence of 1 request every 2 seconds to avoid provider-side burst detection
export const rapidApiGlobalRateLimiter = new GlobalRateLimiter(0.5); // 1 request / 2s
// Retain provider-specific instances if needed for future differentiation (unused by default wrappers)
export const instagramGlobalRateLimiter = new GlobalRateLimiter(1);
export const tiktokGlobalRateLimiter = new GlobalRateLimiter(1);

/**
 * Wrapper for Instagram RapidAPI calls - ensures only one call at a time globally
 */
export async function withGlobalInstagramRateLimit<T>(
  operation: () => Promise<T>,
  key: string = "instagram-api",
): Promise<T> {
  return rapidApiGlobalRateLimiter.enqueue(operation, key);
}

/**
 * Wrapper for TikTok RapidAPI calls
 */
export async function withGlobalTikTokRateLimit<T>(
  operation: () => Promise<T>,
  key: string = "tiktok-api",
): Promise<T> {
  return rapidApiGlobalRateLimiter.enqueue(operation, key);
}

/**
 * Generic RapidAPI wrapper - use when the provider-specific wrapper is not appropriate
 */
export async function withGlobalRapidApiLimit<T>(
  operation: () => Promise<T>,
  key: string = "rapidapi-global",
): Promise<T> {
  return rapidApiGlobalRateLimiter.enqueue(operation, key);
}

/**
 * Enhanced retry with exponential backoff for 429 errors
 */
export async function retryWithGlobalBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  key: string = "retry-operation",
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      const shouldRetry = checkIfRetryable(error, key);
      if (!shouldRetry) {
        throw error;
      }

      const delay = calculateDelay(error, attempt, baseDelay);
      await waitForDelay(delay, key, attempt + 2, maxRetries + 1);
    }
  }

  throw lastError ?? new Error("Operation failed after all retries");
}

function checkIfRetryable(error: unknown, key: string): boolean {
  const errorStr = String(error).toLowerCase();
  const errorMsg = (error instanceof Error ? error.message : "").toLowerCase();

  // Don't retry on permanent errors
  if (
    errorStr.includes("not found") ||
    errorStr.includes("unauthorized") ||
    errorStr.includes("forbidden") ||
    errorMsg.includes("not found") ||
    errorMsg.includes("unauthorized") ||
    errorMsg.includes("forbidden")
  ) {
    console.log(`🚫 [GLOBAL_RETRY] Not retrying permanent error for '${key}'`);
    return false;
  }

  return true;
}

function calculateDelay(error: unknown, attempt: number, baseDelay: number): number {
  const errorStr = String(error).toLowerCase();
  const errorMsg = (error instanceof Error ? error.message : "").toLowerCase();

  // Special handling for 429 (rate limit) errors
  if (
    errorStr.includes("429") ||
    errorStr.includes("rate limit") ||
    errorStr.includes("too many requests") ||
    errorMsg.includes("429") ||
    errorMsg.includes("rate limit") ||
    errorMsg.includes("too many requests")
  ) {
    return Math.min(30000, baseDelay * Math.pow(3, attempt)); // Exponential backoff with max 30s
  }

  return Math.min(10000, baseDelay * Math.pow(2, attempt)); // Max 10s delay
}

async function waitForDelay(delay: number, key: string, nextAttempt: number, totalAttempts: number): Promise<void> {
  console.log(`⏳ [GLOBAL_RETRY] Retrying '${key}' in ${delay}ms (attempt ${nextAttempt}/${totalAttempts})...`);
  await new Promise((resolve) => setTimeout(resolve, delay));
}
