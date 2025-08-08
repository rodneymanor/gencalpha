/* eslint-disable max-lines */
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { formatTimestamp } from "./collections-helpers";
import { db } from "./firebase";
import { getAdminDb, isAdminInitialized } from "./firebase-admin";

export interface CreatorProfile {
  id?: string;
  platform: "instagram" | "tiktok";
  username: string;
  displayName?: string;
  platformUserId: string; // Instagram user ID or TikTok username
  profilePictureUrl?: string;
  followerCount?: number;
  isVerified?: boolean;
  bio?: string;
  externalUrl?: string;
  lastFetchedAt?: string;
  videoCount: number;
  totalViews?: number;
  totalLikes?: number;
  averageViews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorFollowRelationship {
  id?: string;
  userId: string;
  creatorId: string;
  platform: "instagram" | "tiktok";
  followedAt: string;
  isActive: boolean;
  notificationsEnabled?: boolean;
  lastVideoFetchedAt?: string;
}

export interface CreatorVideo {
  id?: string;
  creatorId: string;
  platform: "instagram" | "tiktok";
  platformVideoId: string;
  originalUrl: string;
  iframeUrl?: string; // Bunny.net iframe URL
  directUrl?: string; // Direct CDN URL
  thumbnailUrl: string;
  title: string;
  description?: string;
  hashtags?: string[];
  duration?: number;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
  };
  author: {
    username: string;
    displayName?: string;
    isVerified?: boolean;
    followerCount?: number;
  };
  publishedAt: string;
  fetchedAt: string;
  bunnyVideoGuid?: string;
  processedAt?: string;
}

export class CreatorService {
  private static readonly CREATORS_PATH = "creators";
  private static readonly CREATOR_FOLLOWS_PATH = "creator_follows";
  private static readonly CREATOR_VIDEOS_PATH = "creator_videos";

  /**
   * Create or update a creator profile
   */
  static async createOrUpdateCreator(
    platform: "instagram" | "tiktok",
    username: string,
    platformUserId: string,
    additionalData: Partial<CreatorProfile> = {},
  ): Promise<string> {
    try {
      console.log(`🎭 [CREATOR_SERVICE] Creating/updating creator: ${username} on ${platform}`);

      // Check if creator already exists
      const existingCreator = await this.getCreatorByPlatformId(platform, platformUserId);

      if (existingCreator) {
        console.log(`✅ [CREATOR_SERVICE] Creator exists, updating: ${existingCreator.id}`);
        const adminDb = getAdminDb();
        const useAdmin = isAdminInitialized && adminDb;
        if (useAdmin) {
          await adminDb
            .collection(CreatorService.CREATORS_PATH)
            .doc(existingCreator.id!)
            .update({
              ...additionalData,
              username,
              lastFetchedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
        } else {
          await this.updateCreator(existingCreator.id!, {
            ...additionalData,
            username,
            lastFetchedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        return existingCreator.id!;
      }

      // Create new creator
      const creatorData: Omit<CreatorProfile, "id"> = {
        platform,
        username,
        platformUserId,
        videoCount: 0,
        ...additionalData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastFetchedAt: new Date().toISOString(),
      };

      const adminDb = getAdminDb();
      const useAdmin = isAdminInitialized && adminDb;
      if (useAdmin) {
        const docRef = await adminDb.collection(this.CREATORS_PATH).add({
          ...creatorData,
        });
        console.log(`✅ [CREATOR_SERVICE] (admin) Creator created with ID: ${docRef.id}`);
        return docRef.id;
      } else {
        if (!db) {
          throw new Error("Firebase client database not available");
        }
        const docRef = await addDoc(collection(db, this.CREATORS_PATH), {
          ...creatorData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastFetchedAt: serverTimestamp(),
        });
        console.log(`✅ [CREATOR_SERVICE] Creator created with ID: ${docRef.id}`);
        return docRef.id;
      }
    } catch (error) {
      console.error(`❌ [CREATOR_SERVICE] Error creating/updating creator:`, error);
      throw new Error("Failed to create or update creator");
    }
  }

  /**
   * Get creator by platform and platform user ID
   */
  static async getCreatorByPlatformId(
    platform: "instagram" | "tiktok",
    platformUserId: string,
  ): Promise<CreatorProfile | null> {
    try {
      const adminDb = getAdminDb();
      const useAdmin = isAdminInitialized && adminDb;

      if (useAdmin) {
        const snapshot = await adminDb
          .collection(this.CREATORS_PATH)
          .where("platform", "==", platform)
          .where("platformUserId", "==", platformUserId)
          .limit(1)
          .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        const data = doc.data();
        return this.transformCreatorData(doc.id, data);
      }

      if (!db) {
        throw new Error("Firebase client database not available");
      }

      const q = query(
        collection(db, this.CREATORS_PATH),
        where("platform", "==", platform),
        where("platformUserId", "==", platformUserId),
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: formatTimestamp(doc.data().createdAt),
        updatedAt: formatTimestamp(doc.data().updatedAt),
        lastFetchedAt: doc.data().lastFetchedAt ? formatTimestamp(doc.data().lastFetchedAt) : undefined,
      } as CreatorProfile;
    } catch (error) {
      console.error(`❌ [CREATOR_SERVICE] Error fetching creator:`, error);
      throw new Error("Failed to fetch creator");
    }
  }

  /**
   * Update creator profile
   */
  static async updateCreator(creatorId: string, updates: Partial<CreatorProfile>): Promise<void> {
    try {
      if (!db) {
        throw new Error("Firebase client database not available");
      }

      const docRef = doc(db, this.CREATORS_PATH, creatorId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`❌ [CREATOR_SERVICE] Error updating creator:`, error);
      throw new Error("Failed to update creator");
    }
  }

  /**
   * Follow a creator
   */
  static async followCreator(userId: string, creatorId: string, platform: "instagram" | "tiktok"): Promise<string> {
    try {
      console.log(`👥 [CREATOR_SERVICE] User ${userId} following creator ${creatorId}`);

      // Check if already following
      const existingFollow = await this.getFollowRelationship(userId, creatorId);

      if (existingFollow) {
        if (!existingFollow.isActive) {
          // Reactivate follow
          await this.updateFollowRelationship(existingFollow.id!, { isActive: true });
          return existingFollow.id!;
        }
        return existingFollow.id!;
      }

      // Create new follow relationship
      const followData: Omit<CreatorFollowRelationship, "id"> = {
        userId,
        creatorId,
        platform,
        followedAt: new Date().toISOString(),
        isActive: true,
        notificationsEnabled: true,
      };

      if (!db) {
        throw new Error("Firebase client database not available");
      }

      const docRef = await addDoc(collection(db, this.CREATOR_FOLLOWS_PATH), {
        ...followData,
        followedAt: serverTimestamp(),
      });

      console.log(`✅ [CREATOR_SERVICE] Follow relationship created: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error(`❌ [CREATOR_SERVICE] Error following creator:`, error);
      throw new Error("Failed to follow creator");
    }
  }

  /**
   * Get follow relationship between user and creator
   */
  static async getFollowRelationship(userId: string, creatorId: string): Promise<CreatorFollowRelationship | null> {
    try {
      if (!db) {
        throw new Error("Firebase client database not available");
      }

      const q = query(
        collection(db, this.CREATOR_FOLLOWS_PATH),
        where("userId", "==", userId),
        where("creatorId", "==", creatorId),
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        followedAt: formatTimestamp(doc.data().followedAt),
        lastVideoFetchedAt: doc.data().lastVideoFetchedAt ? formatTimestamp(doc.data().lastVideoFetchedAt) : undefined,
      } as CreatorFollowRelationship;
    } catch (error) {
      console.error(`❌ [CREATOR_SERVICE] Error fetching follow relationship:`, error);
      throw new Error("Failed to fetch follow relationship");
    }
  }

  /**
   * Update follow relationship
   */
  static async updateFollowRelationship(followId: string, updates: Partial<CreatorFollowRelationship>): Promise<void> {
    try {
      if (!db) {
        throw new Error("Firebase client database not available");
      }

      const docRef = doc(db, this.CREATOR_FOLLOWS_PATH, followId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error(`❌ [CREATOR_SERVICE] Error updating follow relationship:`, error);
      throw new Error("Failed to update follow relationship");
    }
  }

  /**
   * Get all creators followed by a user
   */
  static async getFollowedCreators(userId: string): Promise<CreatorProfile[]> {
    try {
      console.log(`👥 [CREATOR_SERVICE] Fetching followed creators for user: ${userId}`);

      const followsSnapshot = await this.fetchFollowRelationships(userId);

      if (followsSnapshot.empty) {
        console.log(`📭 [CREATOR_SERVICE] No followed creators found for user: ${userId}`);
        return [];
      }

      const creatorIds = followsSnapshot.docs.map((doc: { data(): { creatorId: string } }) => doc.data().creatorId);
      console.log(`📝 [CREATOR_SERVICE] Found ${creatorIds.length} followed creators`);

      const creators = await this.fetchCreatorProfiles(creatorIds);

      console.log(`✅ [CREATOR_SERVICE] Successfully fetched ${creators.length} creator profiles`);
      return creators.sort((a, b) => a.username.localeCompare(b.username));
    } catch (error) {
      console.error(`❌ [CREATOR_SERVICE] Error fetching followed creators:`, error);
      throw new Error("Failed to fetch followed creators");
    }
  }

  /**
   * Fetch follow relationships for a user
   */
  private static async fetchFollowRelationships(userId: string) {
    const adminDb = getAdminDb();
    const useAdmin = isAdminInitialized && adminDb;

    if (useAdmin) {
      console.log(`🔑 [CREATOR_SERVICE] Using admin DB for follows query`);
      return adminDb
        .collection(this.CREATOR_FOLLOWS_PATH)
        .where("userId", "==", userId)
        .where("isActive", "==", true)
        .get();
    }

    console.log(`👤 [CREATOR_SERVICE] Using client DB for follows query`);
    if (!db) {
      throw new Error("Firebase client database not available");
    }
    const followsQuery = query(
      collection(db, this.CREATOR_FOLLOWS_PATH),
      where("userId", "==", userId),
      where("isActive", "==", true),
    );
    return getDocs(followsQuery);
  }

  /**
   * Fetch creator profiles by IDs
   */
  private static async fetchCreatorProfiles(creatorIds: string[]): Promise<CreatorProfile[]> {
    const adminDb = getAdminDb();
    const useAdmin = isAdminInitialized && adminDb;
    const creators: CreatorProfile[] = [];

    for (const creatorId of creatorIds) {
      try {
        const creatorProfile = await this.fetchSingleCreatorProfile(creatorId, useAdmin, adminDb);
        if (creatorProfile) {
          creators.push(creatorProfile);
        }
      } catch (creatorError) {
        console.warn(`⚠️ [CREATOR_SERVICE] Failed to fetch creator ${creatorId}:`, creatorError);
      }
    }

    return creators;
  }

  /**
   * Fetch a single creator profile by ID
   */
  private static async fetchSingleCreatorProfile(
    creatorId: string,
    useAdmin: boolean,
    adminDb: unknown,
  ): Promise<CreatorProfile | null> {
    if (useAdmin && adminDb) {
      return this.fetchCreatorFromAdmin(creatorId, adminDb);
    }
    return this.fetchCreatorFromClient(creatorId);
  }

  /**
   * Fetch creator using admin SDK
   */
  private static async fetchCreatorFromAdmin(creatorId: string, adminDb: unknown): Promise<CreatorProfile | null> {
    const creatorDoc = await (adminDb as any).collection(this.CREATORS_PATH).doc(creatorId).get();
    if (!creatorDoc.exists) return null;

    const data = creatorDoc.data();
    return this.transformCreatorData(creatorDoc.id, data);
  }

  /**
   * Fetch creator using client SDK
   */
  private static async fetchCreatorFromClient(creatorId: string): Promise<CreatorProfile | null> {
    if (!db) return null;

    const creatorDoc = await getDoc(doc(db, this.CREATORS_PATH, creatorId));
    if (!creatorDoc.exists()) return null;

    const data = creatorDoc.data();
    return this.transformCreatorData(creatorDoc.id, data);
  }

  /**
   * Transform creator document data
   */
  private static transformCreatorData(id: string, data: any): CreatorProfile {
    return {
      id,
      ...data,
      createdAt: formatTimestamp(data.createdAt),
      updatedAt: formatTimestamp(data.updatedAt),
      lastFetchedAt: data.lastFetchedAt ? formatTimestamp(data.lastFetchedAt) : undefined,
    } as CreatorProfile;
  }

  /**
   * Store multiple videos for a creator (batch operation)
   */
  static async storeCreatorVideos(
    creatorId: string,
    videos: Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt">[],
  ): Promise<CreatorVideo[]> {
    try {
      console.log(`🎬 [CREATOR_SERVICE] Storing ${videos.length} videos for creator ${creatorId}`);

      if (!db) {
        throw new Error("Firebase client database not available");
      }

      const batch = writeBatch(db);
      const createdVideos: CreatorVideo[] = [];
      const now = new Date().toISOString();

      for (const video of videos) {
        const videoRef = doc(collection(db, this.CREATOR_VIDEOS_PATH));
        const videoData = {
          ...video,
          creatorId,
          fetchedAt: now,
        };

        batch.set(videoRef, {
          ...videoData,
          fetchedAt: serverTimestamp(),
        });

        createdVideos.push({
          id: videoRef.id,
          ...videoData,
          fetchedAt: now,
        });
      }

      await batch.commit();

      // Update creator video count
      await this.updateCreator(creatorId, {
        videoCount: videos.length,
        lastFetchedAt: now,
      });

      console.log(`✅ [CREATOR_SERVICE] Successfully stored ${videos.length} videos`);
      return createdVideos;
    } catch (error) {
      console.error(`❌ [CREATOR_SERVICE] Error storing creator videos:`, error);
      throw new Error("Failed to store creator videos");
    }
  }

  /**
   * Get videos for a creator
   */
  static async getCreatorVideos(creatorId: string, limit: number = 20): Promise<CreatorVideo[]> {
    try {
      const q = query(
        collection(db!, this.CREATOR_VIDEOS_PATH),
        where("creatorId", "==", creatorId),
        orderBy("publishedAt", "desc"),
      );

      const querySnapshot = await getDocs(q);

      const videos = querySnapshot.docs.slice(0, limit).map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fetchedAt: formatTimestamp(doc.data().fetchedAt),
        publishedAt: formatTimestamp(doc.data().publishedAt),
        processedAt: doc.data().processedAt ? formatTimestamp(doc.data().processedAt) : undefined,
      })) as CreatorVideo[];

      return videos;
    } catch (error) {
      console.error(`❌ [CREATOR_SERVICE] Error fetching creator videos:`, error);
      throw new Error("Failed to fetch creator videos");
    }
  }

  /**
   * Get all videos from followed creators for a user
   */
  static async getFollowedCreatorsVideos(userId: string, limit: number = 50): Promise<CreatorVideo[]> {
    try {
      // Get followed creators
      const followedCreators = await this.getFollowedCreators(userId);

      if (followedCreators.length === 0) {
        return [];
      }

      const creatorIds = followedCreators.map((creator) => creator.id!);

      // Get videos from all followed creators
      // Note: This is a simplified approach. In production, you might want to implement
      // pagination and more sophisticated querying
      const allVideos: CreatorVideo[] = [];

      for (const creatorId of creatorIds) {
        const videos = await this.getCreatorVideos(creatorId, 10); // Get latest 10 from each
        allVideos.push(...videos);
      }

      // Sort by published date and limit
      return allVideos
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error(`❌ [CREATOR_SERVICE] Error fetching followed creators' videos:`, error);
      throw new Error("Failed to fetch followed creators' videos");
    }
  }

  /**
   * Unfollow a creator
   */
  static async unfollowCreator(userId: string, creatorId: string): Promise<void> {
    try {
      const followRelationship = await this.getFollowRelationship(userId, creatorId);

      if (followRelationship) {
        await this.updateFollowRelationship(followRelationship.id!, { isActive: false });
      }
    } catch (error) {
      console.error(`❌ [CREATOR_SERVICE] Error unfollowing creator:`, error);
      throw new Error("Failed to unfollow creator");
    }
  }

  /**
   * Search creators by username
   */
  static async searchCreators(
    searchTerm: string,
    platform?: "instagram" | "tiktok",
    limit: number = 20,
  ): Promise<CreatorProfile[]> {
    try {
      let q;

      if (platform) {
        q = query(collection(db!, this.CREATORS_PATH), where("platform", "==", platform), orderBy("username"));
      } else {
        q = query(collection(db!, this.CREATORS_PATH), orderBy("username"));
      }

      const querySnapshot = await getDocs(q);

      // Client-side filtering for username search (Firestore doesn't support full-text search)
      const creators = (
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: formatTimestamp(doc.data().createdAt),
          updatedAt: formatTimestamp(doc.data().updatedAt),
          lastFetchedAt: doc.data().lastFetchedAt ? formatTimestamp(doc.data().lastFetchedAt) : undefined,
        })) as CreatorProfile[]
      )
        .filter(
          (creator) =>
            creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (creator.displayName && creator.displayName.toLowerCase().includes(searchTerm.toLowerCase())),
        )
        .slice(0, limit);

      return creators;
    } catch (error) {
      console.error(`❌ [CREATOR_SERVICE] Error searching creators:`, error);
      throw new Error("Failed to search creators");
    }
  }
}
