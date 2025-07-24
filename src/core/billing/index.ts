/**
 * Billing Service Layer
 * Centralized billing, credits, and usage tracking
 */

// Credits Service
export {
  initializeUserCredits,
  getUserCredits,
  canPerformAction,
  deductCredits,
  refundCredits,
  getUsageStats,
  trackUsageAndDeductCredits,
  type CreditCheckResult,
  type CreditDeductionResult,
  type CreditRefundResult,
} from "./credits";

// Usage Tracking Service
export {
  trackUsage,
  calculateCost,
  estimateTokens,
  checkRateLimit,
  getUserDailyUsage,
  getUserUsageStats,
  getSystemUsage,
  trackApiUsage,
  type UsageRecord,
  type DailyUsageStats,
  type UserUsageStats,
  type RateLimitConfig,
} from "./usage";

// Re-export types for convenience
export type { CreditOperation } from "@/types/usage-tracking";

// Billing service instance for easy importing
import * as creditsService from "./credits";
import * as usageService from "./usage";

export const billingService = {
  ...creditsService,
  ...usageService,
  // Alias for backward compatibility
  checkCredits: creditsService.canPerformAction,
};