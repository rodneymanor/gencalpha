/**
 * API Key Authentication Service
 * Centralized API key validation and rate limiting
 */

import { createHash } from "crypto";

import { NextResponse } from "next/server";

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { UserManagementAdminService } from "@/lib/user-management-admin";

export interface ApiKeyDocument {
  createdAt: string;
  status: "active" | "disabled";
  lastUsed?: string;
  requestCount: number;
  violations: number;
  lockoutUntil?: string;
  revokedAt?: string;
}

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: string;
  displayName?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  resetTime?: string;
  requestCount?: number;
  violationsCount?: number;
}

export interface ApiKeyValidationResult {
  user: AuthenticatedUser;
  rateLimitResult: RateLimitResult;
}

export class ApiKeyAuthService {
  private static readonly RATE_LIMIT_PER_MINUTE = 50;
  private static readonly VIOLATION_LOCKOUT_HOURS = 1;
  private static readonly MAX_VIOLATIONS = 2;

  /**
   * Validate API key and return user context
   */
  static async validateApiKey(
    apiKey: string,
  ): Promise<{ user: AuthenticatedUser; rateLimitResult: RateLimitResult } | null> {
    if (!apiKey || !apiKey.startsWith("gencbeta_")) {
      console.log("❌ [API Auth] Invalid API key format");
      return null;
    }

    if (!isAdminInitialized) {
      console.error("❌ [API Auth] Firebase Admin SDK not initialized");
      return null;
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      console.error("❌ [API Auth] Admin database not available");
      return null;
    }

    try {
      // Hash the API key to look up in database
      const hash = createHash("sha256").update(apiKey).digest("hex");
      console.log("🔍 [API Auth] Looking up API key hash:", hash.substring(0, 8) + "...");

      // Since we store API keys using the hash as document ID, we need to find which user owns this key
      // We'll search through all users to find the API key document
      const usersCollection = adminDb.collection("users");
      const usersSnapshot = await usersCollection.get();

      let apiKeyDoc: FirebaseFirestore.DocumentSnapshot | null = null;
      let userId: string | null = null;

      // Check each user's apiKeys subcollection for this hash
      for (const userDoc of usersSnapshot.docs) {
        const keyRef = userDoc.ref.collection("apiKeys").doc(hash);
        const keySnapshot = await keyRef.get();

        if (keySnapshot.exists) {
          apiKeyDoc = keySnapshot;
          userId = userDoc.id;
          break;
        }
      }

      if (!apiKeyDoc || !apiKeyDoc.exists || !userId) {
        console.log("❌ [API Auth] API key not found");
        return null;
      }

      const keyData = apiKeyDoc.data() as ApiKeyDocument;

      // Check if key is active
      if (keyData.status !== "active") {
        console.log("❌ [API Auth] API key is disabled");
        return null;
      }

      console.log("🔍 [API Auth] API key belongs to user:", userId);

      // Get user profile
      const userProfile = await UserManagementAdminService.getUserProfile(userId);
      if (!userProfile) {
        console.log("❌ [API Auth] User profile not found for API key");
        return null;
      }

      // Check rate limiting and violations
      const rateLimitResult = await this.checkRateLimit(apiKeyDoc.ref, keyData);

      if (!rateLimitResult.allowed) {
        console.log("🚫 [API Auth] Request blocked by rate limiting:", rateLimitResult.reason);
        return {
          user: {
            uid: userProfile.uid,
            email: userProfile.email,
            role: userProfile.role,
            displayName: userProfile.displayName,
          },
          rateLimitResult,
        };
      }

      // Update API key usage
      await this.updateApiKeyUsage(apiKeyDoc.ref, keyData);

      console.log("✅ [API Auth] API key validated successfully for user:", userProfile.email);

      return {
        user: {
          uid: userProfile.uid,
          email: userProfile.email,
          role: userProfile.role,
          displayName: userProfile.displayName,
        },
        rateLimitResult,
      };
    } catch (error) {
      console.error("❌ [API Auth] Error validating API key:", error);
      return null;
    }
  }

  /**
   * Check rate limiting with escalating violations policy
   */
  private static async checkRateLimit(
    apiKeyRef: FirebaseFirestore.DocumentReference,
    keyData: ApiKeyDocument,
  ): Promise<RateLimitResult> {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneHourFromNow = new Date(now.getTime() + this.VIOLATION_LOCKOUT_HOURS * 60 * 60 * 1000);

    // Check if currently in lockout period
    if (keyData.lockoutUntil) {
      const lockoutEnd = new Date(keyData.lockoutUntil);
      if (now < lockoutEnd) {
        console.log("🚫 [Rate Limit] User is in lockout period until:", keyData.lockoutUntil);
        return {
          allowed: false,
          reason: "Account temporarily locked due to rate limit violations",
          resetTime: keyData.lockoutUntil,
          violationsCount: keyData.violations,
        };
      } else {
        // Lockout period has expired, reset violations
        console.log("🔄 [Rate Limit] Lockout period expired, resetting violations");
        await apiKeyRef.update({
          violations: 0,
          lockoutUntil: null,
        });
        keyData.violations = 0;
        keyData.lockoutUntil = undefined;
      }
    }

    // Get request count for the current minute window
    // For production, you'd want to use a more sophisticated sliding window
    // For now, we'll use a simple minute-based counter that resets
    const lastUsed = keyData.lastUsed ? new Date(keyData.lastUsed) : null;
    const isNewMinute = !lastUsed || lastUsed < oneMinuteAgo;

    const currentRequestCount = isNewMinute ? 1 : (keyData.requestCount || 0) + 1;

    // Check if exceeding rate limit
    if (!isNewMinute && currentRequestCount > this.RATE_LIMIT_PER_MINUTE) {
      // Rate limit exceeded - record violation
      const newViolations = keyData.violations + 1;
      console.log(`🚫 [Rate Limit] Rate limit exceeded! Violation #${newViolations}`);

      if (newViolations >= this.MAX_VIOLATIONS) {
        // Trigger lockout
        console.log("🔒 [Rate Limit] Max violations reached, triggering lockout");
        await apiKeyRef.update({
          violations: newViolations,
          lockoutUntil: oneHourFromNow.toISOString(),
        });

        return {
          allowed: false,
          reason: "Account locked due to repeated rate limit violations",
          resetTime: oneHourFromNow.toISOString(),
          violationsCount: newViolations,
        };
      } else {
        // Record violation but allow request
        await apiKeyRef.update({
          violations: newViolations,
        });

        return {
          allowed: false,
          reason: `Rate limit exceeded. Violation ${newViolations}/${this.MAX_VIOLATIONS}`,
          violationsCount: newViolations,
        };
      }
    }

    // Request is allowed
    return {
      allowed: true,
      requestCount: currentRequestCount,
      violationsCount: keyData.violations,
    };
  }

  /**
   * Update API key usage statistics
   */
  private static async updateApiKeyUsage(
    apiKeyRef: FirebaseFirestore.DocumentReference,
    keyData: ApiKeyDocument,
  ): Promise<void> {
    const now = new Date();
    const lastUsed = keyData.lastUsed ? new Date(keyData.lastUsed) : null;
    const isNewMinute = !lastUsed || lastUsed < new Date(now.getTime() - 60 * 1000);

    const updateData: Partial<ApiKeyDocument> = {
      lastUsed: now.toISOString(),
      requestCount: isNewMinute ? 1 : (keyData.requestCount || 0) + 1,
    };

    await apiKeyRef.update(updateData);
  }

  /**
   * Extract API key from request headers
   */
  static extractApiKey(request: Request): string | null {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    const apiKeyHeader = request.headers.get("x-api-key");
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    return null;
  }

  /**
   * Authenticate request with API key
   */
  static async authenticateRequest(request: Request): Promise<ApiKeyValidationResult | NextResponse> {
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const validationResult = await this.validateApiKey(apiKey);

    if (!validationResult) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    if (!validationResult.rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          details: validationResult.rateLimitResult.reason,
          resetTime: validationResult.rateLimitResult.resetTime,
        },
        { status: 429 },
      );
    }

    return validationResult;
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function authenticateWithApiKey(
  apiKey: string,
): Promise<{ user: AuthenticatedUser; rateLimitResult: RateLimitResult } | NextResponse> {
  const validationResult = await ApiKeyAuthService.validateApiKey(apiKey);

  if (!validationResult) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  if (!validationResult.rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        details: validationResult.rateLimitResult.reason,
        resetTime: validationResult.rateLimitResult.resetTime,
      },
      { status: 429 },
    );
  }

  return validationResult;
}

/**
 * Legacy function for backward compatibility
 */
export async function authenticateApiKey(
  request: Request,
): Promise<{ user: AuthenticatedUser; rateLimitResult: RateLimitResult } | NextResponse> {
  return ApiKeyAuthService.authenticateRequest(request);
}
