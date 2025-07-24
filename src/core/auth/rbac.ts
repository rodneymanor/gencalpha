/**
 * Role-Based Access Control Service
 * Centralized RBAC for collections and resources
 */

import { type Collection, type Video } from "@/lib/collections";
import { formatTimestamp } from "@/lib/collections-helpers";
import { getAdminDb } from "@/lib/firebase-admin";
import { UserManagementService } from "@/lib/user-management-server";

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
  lastDoc?: any; // Firebase Admin SDK document snapshot
  totalCount: number;
}

export class RBACService {
  private static readonly COLLECTIONS_PATH = "collections";
  private static readonly VIDEOS_PATH = "videos";

  /**
   * Get RBAC context for a user
   */
  static async getRBACContext(userId: string): Promise<RBACContext> {
    const userProfile = await UserManagementService.getUserProfile(userId);
    const accessibleCoaches = await UserManagementService.getUserAccessibleCoaches(userId);

    return {
      userId,
      role: userProfile?.role ?? "creator",
      accessibleCoaches,
      isSuperAdmin: userProfile?.role === "super_admin",
    };
  }

  /**
   * Check if user has access to a specific resource
   */
  static async hasAccess(userId: string, resourceType: "collection" | "video", resourceId: string): Promise<boolean> {
    const db = getAdminDb();
    if (!db) {
      console.error("❌ [RBAC] Firebase Admin DB not initialized");
      return false;
    }

    const context = await this.getRBACContext(userId);

    if (context.isSuperAdmin) {
      return true;
    }

    if (context.accessibleCoaches.length === 0) {
      return false;
    }

    // For collections, check if the collection belongs to an accessible coach
    if (resourceType === "collection") {
      const collectionDoc = await db.collection(this.COLLECTIONS_PATH)
        .where("id", "==", resourceId)
        .where("userId", "in", context.accessibleCoaches)
        .get();
      return !collectionDoc.empty;
    }

    // Check if the video belongs to an accessible coach
    const videoDoc = await db.collection(this.VIDEOS_PATH)
      .where("id", "==", resourceId)
      .where("userId", "in", context.accessibleCoaches)
      .get();
    return !videoDoc.empty;
  }

  /**
   * Get collections accessible to a user
   */
  static async getUserCollections(userId: string): Promise<CollectionAccessResult> {
    try {
      const db = getAdminDb();
      if (!db) {
        console.error("❌ [RBAC] Firebase Admin DB not initialized");
        return { collections: [], accessibleCoaches: [] };
      }

      const context = await this.getRBACContext(userId);
      console.log("🔍 [RBAC] User context:", { userId, role: context.role, isSuperAdmin: context.isSuperAdmin });

      if (context.isSuperAdmin) {
        console.log("🔍 [RBAC] Super admin loading all collections");

        // For super admin, get all collections
        const collectionsRef = db.collection(this.COLLECTIONS_PATH);
        const querySnapshot = await collectionsRef.orderBy("updatedAt", "desc").get();

        const collections = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: formatTimestamp(doc.data().createdAt),
          updatedAt: formatTimestamp(doc.data().updatedAt),
        })) as Collection[];

        console.log("✅ [RBAC] Super admin loaded collections:", collections.length);
        return { collections, accessibleCoaches: [] };
      }

      if (context.accessibleCoaches.length === 0) {
        console.log("🔍 [RBAC] No accessible coaches, returning empty");
        return { collections: [], accessibleCoaches: [] };
      }

      const collectionsRef = db.collection(this.COLLECTIONS_PATH);
      const querySnapshot = await collectionsRef
        .where("userId", "in", context.accessibleCoaches)
        .orderBy("updatedAt", "desc")
        .get();

      const collections = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: formatTimestamp(doc.data().createdAt),
        updatedAt: formatTimestamp(doc.data().updatedAt),
      })) as Collection[];

      console.log("✅ [RBAC] Regular user loaded collections:", collections.length);
      return { collections, accessibleCoaches: context.accessibleCoaches };
    } catch (error) {
      console.error("❌ [RBAC] Error fetching collections:", error);
      throw new Error("Failed to fetch collections");
    }
  }

  /**
   * Get videos accessible to a user
   */
  static async getCollectionVideos(
    userId: string,
    collectionId?: string,
    videoLimit?: number,
    lastDoc?: any,
  ): Promise<VideoAccessResult> {
    try {
      console.log("🔍 [RBAC] User ID:", userId, "Limit:", videoLimit, "HasCursor:", !!lastDoc);

      const context = await this.getRBACContext(userId);

      if (context.isSuperAdmin) {
        return this.getSuperAdminVideos(userId, collectionId, videoLimit, lastDoc);
      }

      return this.getRegularUserVideos(userId, collectionId, videoLimit, lastDoc, context);
    } catch (error) {
      console.error("❌ [RBAC] Error fetching videos:", error);
      throw new Error("Failed to fetch videos");
    }
  }

  /**
   * Get videos for super admin users
   */
  private static async getSuperAdminVideos(
    userId: string,
    collectionId?: string,
    videoLimit?: number,
    lastDoc?: any,
  ): Promise<VideoAccessResult> {
    console.log("🔍 [RBAC] Super admin detected - bypassing coach restrictions");

    const db = getAdminDb();
    if (!db) {
      console.error("❌ [RBAC] Firebase Admin DB not initialized");
      return { videos: [], totalCount: 0 };
    }

    let query;
    if (!collectionId || collectionId === "all-videos") {
      console.log("🔍 [RBAC] Super admin loading all videos");
      query = db.collection(this.VIDEOS_PATH).orderBy("addedAt", "desc");
    } else {
      try {
        const { collections } = await this.getUserCollections(userId);
        const targetCollection = collections.find((c) => c.id === collectionId);

        if (!targetCollection) {
          console.log("❌ [RBAC] Collection not found:", collectionId);
          return { videos: [], totalCount: 0 };
        }

        query = db.collection(this.VIDEOS_PATH)
          .where("collectionId", "==", collectionId)
          .where("userId", "==", targetCollection.userId)
          .orderBy("addedAt", "desc");
      } catch (error) {
        console.log("❌ [RBAC] Collection query failed:", error instanceof Error ? error.message : String(error));
        return { videos: [], totalCount: 0 };
      }
    }

    // Apply pagination cursor if provided
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    // Apply limit if specified
    if (videoLimit) {
      query = query.limit(videoLimit);
    }

    const querySnapshot = await query.get();
    let videos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      addedAt: formatTimestamp(doc.data().addedAt),
    })) as Video[];

    // Deduplicate videos for "all-videos" view based on originalUrl
    if (!collectionId || collectionId === "all-videos") {
      videos = this.deduplicateVideosByOriginalUrl(videos);
      console.log("🔄 [RBAC] Deduplicated videos from", querySnapshot.docs.length, "to", videos.length);
    }

    const newLastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : undefined;

    console.log("✅ [RBAC] Super admin loaded videos:", videos.length);
    return { videos, lastDoc: newLastDoc, totalCount: videos.length };
  }


  /**
   * Get videos for regular users (coach/creator)
   */
  private static async getRegularUserVideos(
    userId: string,
    collectionId?: string,
    videoLimit?: number,
    lastDoc?: any,
    context?: RBACContext,
  ): Promise<VideoAccessResult> {
    const db = getAdminDb();
    if (!db) {
      console.error("❌ [RBAC] Firebase Admin DB not initialized");
      return { videos: [], totalCount: 0 };
    }

    const userContext = context ?? (await this.getRBACContext(userId));
    console.log("🔍 [RBAC] Accessible coaches:", userContext.accessibleCoaches);

    if (userContext.accessibleCoaches.length === 0) {
      console.log("❌ [RBAC] No accessible coaches found - returning empty array");
      return { videos: [], totalCount: 0 };
    }

    let query;
    if (!collectionId || collectionId === "all-videos") {
      console.log("🔍 [RBAC] Regular user loading all accessible videos");
      query = db.collection(this.VIDEOS_PATH)
        .where("userId", "in", userContext.accessibleCoaches)
        .orderBy("addedAt", "desc");
    } else {
      console.log("🔍 [RBAC] Regular user loading videos from collection:", collectionId);
      const { collections } = await this.getUserCollections(userId);
      const targetCollection = collections.find((c) => c.id === collectionId);

      if (!targetCollection) {
        console.log("❌ [RBAC] Collection not found:", collectionId);
        return { videos: [], totalCount: 0 };
      }

      query = db.collection(this.VIDEOS_PATH)
        .where("collectionId", "==", collectionId)
        .where("userId", "==", targetCollection.userId)
        .orderBy("addedAt", "desc");
    }

    // Apply pagination cursor if provided
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    // Apply limit if specified
    if (videoLimit) {
      query = query.limit(videoLimit);
    }

    const querySnapshot = await query.get();
    const videos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      addedAt: formatTimestamp(doc.data().addedAt),
    })) as Video[];

    const newLastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : undefined;

    console.log("✅ [RBAC] Regular user loaded videos:", videos.length);
    return { videos, lastDoc: newLastDoc, totalCount: videos.length };
  }


  /**
   * Deduplicate videos by originalUrl, keeping the most recent one
   */
  private static deduplicateVideosByOriginalUrl(videos: Video[]): Video[] {
    const urlToVideoMap = new Map<string, Video>();

    // Process videos in order (already sorted by addedAt desc)
    videos.forEach((video) => {
      const originalUrl = video.originalUrl;
      if (!originalUrl) return;

      // Keep the first occurrence (most recent due to sorting)
      if (!urlToVideoMap.has(originalUrl)) {
        urlToVideoMap.set(originalUrl, video);
      }
    });

    return Array.from(urlToVideoMap.values());
  }

  /**
   * Check if user can perform an action on a resource
   */
  static async canPerformAction(
    userId: string,
    action: "read" | "write" | "delete",
    resourceType: "collection" | "video" | "user",
    resourceId?: string,
  ): Promise<boolean> {
    const context = await this.getRBACContext(userId);

    // Super admin can do everything
    if (context.isSuperAdmin) {
      return true;
    }

    // Check specific resource access if resourceId is provided
    if (resourceId) {
      return this.hasAccess(userId, resourceType as "collection" | "video", resourceId);
    }

    // For general permissions, check role-based access
    switch (action) {
      case "read":
        return context.accessibleCoaches.length > 0 || context.role === "coach";
      case "write":
        return context.role === "coach" || context.role === "creator";
      case "delete":
        return context.role === "coach";
      default:
        return false;
    }
  }

  /**
   * Get accessible coaches for a user
   */
  static async getAccessibleCoaches(userId: string): Promise<string[]> {
    const context = await this.getRBACContext(userId);
    return context.accessibleCoaches;
  }

  /**
   * Check if user is super admin
   */
  static async isSuperAdmin(userId: string): Promise<boolean> {
    const context = await this.getRBACContext(userId);
    return context.isSuperAdmin;
  }
}
