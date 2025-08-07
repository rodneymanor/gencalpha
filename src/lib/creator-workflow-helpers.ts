/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable security/detect-object-injection */
/**
 * Creator Workflow Helpers
 * Utilities for error handling, retry logic, and workflow management
 */

export interface WorkflowError {
  step: string;
  error: string;
  details?: string;
  retryable: boolean;
}

export interface WorkflowResult<T = any> {
  success: boolean;
  data?: T;
  error?: WorkflowError;
  warnings?: string[];
}

export class CreatorWorkflowError extends Error {
  public step: string;
  public retryable: boolean;
  public details?: string;

  constructor(step: string, message: string, retryable: boolean = false, details?: string) {
    super(message);
    this.name = "CreatorWorkflowError";
    this.step = step;
    this.retryable = retryable;
    this.details = details;
  }
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  step: string = "unknown",
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [RETRY] ${step} - Attempt ${attempt}/${maxRetries}`);
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`❌ [RETRY] ${step} - Attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`⏱️ [RETRY] ${step} - Waiting ${Math.round(delay)}ms before retry`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new CreatorWorkflowError(
    step,
    `Failed after ${maxRetries} attempts: ${lastError.message}`,
    false,
    lastError.message,
  );
}

/**
 * Validate platform and username
 */
export function validateCreatorInput(
  username: string,
  platform?: string,
): WorkflowResult<{
  cleanUsername: string;
  detectedPlatform: "instagram" | "tiktok";
}> {
  if (!username || typeof username !== "string") {
    return {
      success: false,
      error: {
        step: "input_validation",
        error: "Username is required and must be a string",
        retryable: false,
      },
    };
  }

  const cleanUsername = username.replace(/^@/, "").trim();

  if (cleanUsername.length === 0) {
    return {
      success: false,
      error: {
        step: "input_validation",
        error: "Username cannot be empty",
        retryable: false,
      },
    };
  }

  if (cleanUsername.length > 30) {
    return {
      success: false,
      error: {
        step: "input_validation",
        error: "Username is too long (max 30 characters)",
        retryable: false,
      },
    };
  }

  // Validate username format
  const usernameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!usernameRegex.test(cleanUsername)) {
    return {
      success: false,
      error: {
        step: "input_validation",
        error: "Username contains invalid characters",
        retryable: false,
      },
    };
  }

  // Platform detection
  let detectedPlatform: "instagram" | "tiktok";
  if (platform) {
    if (platform !== "instagram" && platform !== "tiktok") {
      return {
        success: false,
        error: {
          step: "input_validation",
          error: "Platform must be 'instagram' or 'tiktok'",
          retryable: false,
        },
      };
    }
    detectedPlatform = platform;
  } else {
    // Simple platform detection heuristics
    detectedPlatform = detectPlatformFromUsername(cleanUsername);
  }

  return {
    success: true,
    data: {
      cleanUsername,
      detectedPlatform,
    },
  };
}

/**
 * Platform detection heuristics
 */
function detectPlatformFromUsername(username: string): "instagram" | "tiktok" {
  const lowerUsername = username.toLowerCase();

  // Simple heuristics - can be improved with more sophisticated detection
  if (lowerUsername.includes("insta") || lowerUsername.includes("ig")) {
    return "instagram";
  }

  if (lowerUsername.includes("tiktok") || lowerUsername.includes("tt")) {
    return "tiktok";
  }

  // Default to Instagram for now (can be changed based on usage patterns)
  return "instagram";
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  getTimeToReset(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;

    const oldestRequest = Math.min(...requests);
    const timeToReset = this.windowMs - (Date.now() - oldestRequest);
    return Math.max(0, timeToReset);
  }
}

/**
 * Sanitize error messages for API responses
 */
export function sanitizeError(error: unknown, step: string = "unknown"): WorkflowError {
  if (error instanceof CreatorWorkflowError) {
    return {
      step: error.step,
      error: error.message,
      details: error.details,
      retryable: error.retryable,
    };
  }

  if (error instanceof Error) {
    // Determine if error is retryable based on common patterns
    const retryable = isRetryableError(error);

    return {
      step,
      error: error.message,
      details: error.stack,
      retryable,
    };
  }

  return {
    step,
    error: "Unknown error occurred",
    details: String(error),
    retryable: false,
  };
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    /timeout/i,
    /network/i,
    /connection/i,
    /rate limit/i,
    /429/,
    /502/,
    /503/,
    /504/,
    /ECONNRESET/,
    /ETIMEDOUT/,
    /ENOTFOUND/,
  ];

  return retryablePatterns.some((pattern) => pattern.test(error.message) || pattern.test(error.name));
}

/**
 * Progress tracking utility
 */
export class WorkflowProgress {
  private steps: Array<{ name: string; completed: boolean; error?: string }> = [];
  private currentStep: number = 0;

  constructor(stepNames: string[]) {
    this.steps = stepNames.map((name) => ({ name, completed: false }));
  }

  startStep(stepName: string): void {
    const stepIndex = this.steps.findIndex((step) => step.name === stepName);
    if (stepIndex !== -1) {
      this.currentStep = stepIndex;
      console.log(`🚀 [WORKFLOW] Starting step ${stepIndex + 1}/${this.steps.length}: ${stepName}`);
    }
  }

  completeStep(stepName: string): void {
    const stepIndex = this.steps.findIndex((step) => step.name === stepName);
    if (stepIndex !== -1) {
      this.steps[stepIndex].completed = true;
      console.log(`✅ [WORKFLOW] Completed step ${stepIndex + 1}/${this.steps.length}: ${stepName}`);
    }
  }

  failStep(stepName: string, error: string): void {
    const stepIndex = this.steps.findIndex((step) => step.name === stepName);
    if (stepIndex !== -1) {
      this.steps[stepIndex].error = error;
      console.log(`❌ [WORKFLOW] Failed step ${stepIndex + 1}/${this.steps.length}: ${stepName} - ${error}`);
    }
  }

  getProgress(): {
    current: number;
    total: number;
    percentage: number;
    steps: Array<{ name: string; completed: boolean; error?: string }>;
  } {
    const completed = this.steps.filter((step) => step.completed).length;
    return {
      current: completed,
      total: this.steps.length,
      percentage: Math.round((completed / this.steps.length) * 100),
      steps: this.steps,
    };
  }
}

/**
 * Batch processing utility with concurrency control
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  concurrency: number = 3,
): Promise<Array<{ success: boolean; result?: R; error?: string; index: number }>> {
  const results: Array<{ success: boolean; result?: R; error?: string; index: number }> = [];

  // Process items in chunks
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkPromises = chunk.map(async (item, chunkIndex) => {
      const globalIndex = i + chunkIndex;
      try {
        const result = await processor(item, globalIndex);
        return { success: true, result, index: globalIndex };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          index: globalIndex,
        };
      }
    });

    const chunkResults = await Promise.allSettled(chunkPromises);

    chunkResults.forEach((result, chunkIndex) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        results.push({
          success: false,
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
          index: i + chunkIndex,
        });
      }
    });
  }

  return results.sort((a, b) => a.index - b.index);
}
