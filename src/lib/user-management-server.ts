import { format } from "date-fns";

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import type { UserProfile } from "@/lib/user-management";

function formatTimestamp(ts: any): string {
  // Admin SDK stores timestamps as Firestore Timestamp objects
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return format(date, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

export class UserManagementService {
  private static readonly USERS_PATH = "user_profiles";

  /**
   * Server-side version – fetch user profile with Admin privileges
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!isAdminInitialized) {
      throw new Error("Firebase Admin not initialised on server");
    }
    const adminDb = getAdminDb();

    const snapshot = await adminDb
      .collection(this.USERS_PATH)
      .where("uid", "==", uid)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data() as Record<string, any>;

    return {
      id: doc.id,
      ...data,
      createdAt: formatTimestamp(data.createdAt),
      updatedAt: formatTimestamp(data.updatedAt),
      lastLoginAt: data.lastLoginAt ? formatTimestamp(data.lastLoginAt) : undefined,
    } as UserProfile;
  }

  static async getUserAccessibleCoaches(userUid: string): Promise<string[]> {
    if (!isAdminInitialized) {
      throw new Error("Firebase Admin not initialised on server");
    }

    const adminDb = getAdminDb();

    // First, get the user profile to check their role
    const userProfile = await this.getUserProfile(userUid);
    if (!userProfile) {
      console.log("❌ [Server] User profile not found:", userUid);
      return [];
    }

    console.log("🔍 [Server] User role:", userProfile.role);

    // Super admins can access all coaches
    if (userProfile.role === "super_admin") {
      const allCoaches = await this.getAllCoaches();
      console.log("🔍 [Server] Super admin - accessible coaches:", allCoaches);
      return allCoaches;
    }

    // Coaches can access themselves
    if (userProfile.role === "coach") {
      return [userUid];
    }

    // For creators, get their assigned coach
    if (userProfile.role === "creator" && userProfile.coachId) {
      return [userProfile.coachId];
    }

    // No accessible coaches for other scenarios
    return [];
  }

  static async getAllCoaches(): Promise<string[]> {
    if (!isAdminInitialized) {
      throw new Error("Firebase Admin not initialised on server");
    }

    const adminDb = getAdminDb();

    try {
      console.log("🔍 [Server] Getting all coaches");

      const coachesQuery = await adminDb
        .collection(this.USERS_PATH)
        .where("role", "==", "coach")
        .where("isActive", "==", true)
        .get();

      const coaches = coachesQuery.docs.map((doc) => doc.data().uid).filter(Boolean);
      console.log("✅ [Server] Found coaches:", coaches.length);

      return coaches;
    } catch (error) {
      console.error("❌ [Server] Error fetching coaches:", error);
      throw new Error("Failed to fetch coaches");
    }
  }
}