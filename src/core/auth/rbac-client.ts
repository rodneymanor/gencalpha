/**
 * Client-side RBAC Service
 * Handles role-based access control for the frontend
 */

import { type Collection, type Video } from "@/lib/collections";

export interface RBACContext {
  userId: string;
  role: string;
  accessibleCoaches: string[];
  isSuperAdmin: boolean;
}

export interface CollectionAccessResult {
  collections: Collection[];
  accessibleCoaches: string[];
}

export interface VideoAccessResult {
  videos: Video[];
  lastDoc?: any;
  totalCount: number;
}

export class RBACClientService {
  /**
   * Get RBAC context for a user via API
   */
  static async getRBACContext(userId: string): Promise<RBACContext> {
    const response = await fetch("/api/auth/rbac/context", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to get RBAC context");
    }

    return response.json();
  }

  /**
   * Get collections accessible to a user via API
   */
  static async getUserCollections(userId: string): Promise<CollectionAccessResult> {
    const response = await fetch("/api/collections/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to get user collections");
    }

    return response.json();
  }

  /**
   * Get videos accessible to a user via API
   */
  static async getCollectionVideos(
    userId: string,
    collectionId?: string,
    videoLimit?: number,
    lastDocId?: string,
  ): Promise<VideoAccessResult> {
    const response = await fetch("/api/videos/collection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        collectionId,
        videoLimit,
        lastDocId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get collection videos");
    }

    return response.json();
  }

  /**
   * Check if user can perform an action on a resource via API
   */
  static async canPerformAction(
    userId: string,
    action: "read" | "write" | "delete",
    resourceType: "collection" | "video" | "user",
    resourceId?: string,
  ): Promise<boolean> {
    const response = await fetch("/api/auth/rbac/can-perform", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        action,
        resourceType,
        resourceId,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.canPerform;
  }

  /**
   * Check if user is super admin via API
   */
  static async isSuperAdmin(userId: string): Promise<boolean> {
    const response = await fetch("/api/auth/rbac/is-super-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.isSuperAdmin;
  }
}
