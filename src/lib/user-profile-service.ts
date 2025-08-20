import { doc, updateDoc, getDoc } from "firebase/firestore";

import { db } from "./firebase";

export interface UserProfileExtension {
  keywords?: string[];
  personalDescription?: string;
  mainTopics?: string;
  profileUpdatedAt?: string;
}

export interface ExtendedUserProfile {
  keywords: string[];
  personalDescription: string;
  mainTopics: string;
}

export class UserProfileService {
  private static readonly USERS_PATH = "user_profiles";

  /**
   * Update user profile with keywords, personal description, and main topics
   */
  static async updateUserProfile(userId: string, profileData: Partial<ExtendedUserProfile>): Promise<void> {
    try {
      if (!db) {
        throw new Error("Firebase is not initialized");
      }

      const userRef = doc(db, this.USERS_PATH, userId);

      // Validate keywords minimum requirement
      if (profileData.keywords && profileData.keywords.length < 3) {
        throw new Error("At least 3 keywords are required");
      }

      await updateDoc(userRef, {
        ...profileData,
        profileUpdatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Failed to update user profile");
    }
  }

  /**
   * Get user profile data including extended fields
   */
  static async getUserProfile(userId: string): Promise<ExtendedUserProfile | null> {
    try {
      if (!db) {
        throw new Error("Firebase is not initialized");
      }

      const userRef = doc(db, this.USERS_PATH, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();

      return {
        keywords: data.keywords ?? [],
        personalDescription: data.personalDescription ?? "",
        mainTopics: data.mainTopics ?? "",
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new Error("Failed to fetch user profile");
    }
  }

  /**
   * Search keywords from a predefined list or API
   * This is a placeholder for the actual keyword search implementation
   */
  static async searchKeywords(query: string): Promise<{ id: string; label: string }[]> {
    // Mock implementation - replace with actual API call
    const mockKeywords = [
      "content creation",
      "social media",
      "video editing",
      "marketing",
      "strategy",
      "trends",
      "analytics",
      "branding",
      "storytelling",
      "engagement",
      "viral content",
      "audience growth",
      "creativity",
      "production",
      "editing",
      "cinematography",
      "music",
      "dance",
      "comedy",
      "lifestyle",
      "fashion",
      "food",
      "travel",
      "fitness",
      "technology",
      "education",
      "entertainment",
      "business",
      "entrepreneurship",
    ];

    if (!query.trim()) {
      return [];
    }

    const filtered = mockKeywords
      .filter((keyword) => keyword.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8)
      .map((keyword, index) => ({
        id: `keyword_${index}_${Date.now()}`,
        label: keyword,
      }));

    return filtered;
  }
}
