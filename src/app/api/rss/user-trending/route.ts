import { NextRequest, NextResponse } from "next/server";

import { getAuth } from "firebase-admin/auth";

import { adminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { rssParser, type Category, type TrendingTopic } from "@/lib/rss-service";

export async function GET(request: NextRequest) {
  try {
    // Extract Firebase ID token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authorization header required",
        },
        { status: 401 },
      );
    }

    const idToken = authHeader.substring(7);

    if (!isAdminInitialized) {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase Admin SDK not configured",
        },
        { status: 500 },
      );
    }

    // Verify Firebase ID token
    const auth = getAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Firebase token",
        },
        { status: 401 },
      );
    }

    const userId = decodedToken.uid;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "8");

    // First try to get cached user trending data
    const { getUserTrendingCache } = await import("@/lib/db/rss-cache");
    const cachedUserData = await getUserTrendingCache(userId);

    if (cachedUserData && cachedUserData.topics.length > 0) {
      // Return cached data
      return NextResponse.json({
        success: true,
        topics: cachedUserData.topics.slice(0, limit),
        categories: cachedUserData.categories,
        count: Math.min(cachedUserData.topics.length, limit),
        cached: true,
        lastUpdated: cachedUserData.lastUpdated,
        nextUpdate: cachedUserData.nextUpdate,
        timestamp: new Date().toISOString(),
      });
    }

    // Fallback to generating fresh data if cache miss
    console.log(`Cache miss for user ${userId}, generating fresh trending data...`);

    // Get user brand settings to determine their preferred categories
    let userCategories: Category[] = [];

    try {
      const settingsDoc = await adminDb.collection("userBrandSettings").doc(userId).get();
      if (settingsDoc.exists) {
        const settings = settingsDoc.data();
        userCategories = settings?.selectedCategories ?? [];
      }
    } catch (error) {
      console.error("Error fetching user brand settings:", error);
    }

    // Fallback to default categories if user has none selected
    if (userCategories.length === 0) {
      userCategories = ["ai", "business"];
    }

    // Try to get from category cache first
    const { getCachedRSSData } = await import("@/lib/db/rss-cache");
    const allTopics: TrendingTopic[] = [];

    for (const category of userCategories) {
      // First try cached data
      const cachedCategoryData = await getCachedRSSData(category);

      if (cachedCategoryData && cachedCategoryData.topics.length > 0) {
        allTopics.push(...cachedCategoryData.topics.slice(0, 5));
      } else {
        // Fallback to live fetch
        try {
          const topics = await rssParser.getTrendingTopics(category, 5);
          allTopics.push(...topics);
        } catch (error) {
          console.error(`Error fetching trending topics for ${category}:`, error);
        }
      }
    }

    // Sort by relevance score and limit results
    const sortedTopics = allTopics.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);

    // Cache the results for next time
    if (sortedTopics.length > 0) {
      const { storeUserTrendingCache } = await import("@/lib/db/rss-cache");
      await storeUserTrendingCache(userId, sortedTopics, userCategories);
    }

    return NextResponse.json({
      success: true,
      topics: sortedTopics,
      categories: userCategories,
      count: sortedTopics.length,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("User trending topics error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
