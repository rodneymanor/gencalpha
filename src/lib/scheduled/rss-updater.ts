// RSS Feed Scheduled Updater
import { bulkUpdateRSSCache, getCategoriesNeedingUpdate, storeUserTrendingCache } from "@/lib/db/rss-cache";
import { adminDb } from "@/lib/firebase-admin";
import { rssParser, type Category, RSS_FEEDS } from "@/lib/rss-service";
import type { RSSItem, TrendingTopic } from "@/lib/rss-service";

// Main function to update all RSS feeds
export async function updateAllRSSFeeds() {
  console.log("Starting scheduled RSS feed update...");

  try {
    // Get categories that need updating
    const categoriesToUpdate = await getCategoriesNeedingUpdate();

    if (categoriesToUpdate.length === 0) {
      console.log("All RSS feeds are up to date");
      return { success: true, message: "All feeds up to date", updated: 0 };
    }

    console.log(`Updating ${categoriesToUpdate.length} categories: ${categoriesToUpdate.join(", ")}`);

    // Fetch all feeds in parallel
    const updates = new Map<Category, { items: RSSItem[]; topics: TrendingTopic[] }>();

    const updatePromises = categoriesToUpdate.map(async (category) => {
      try {
        // Fetch fresh data directly without cache
        const items = await fetchCategoryFeedsWithoutCache(category);
        const topics = items.slice(0, 10).map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description.substring(0, 100) + "...",
          source: item.source,
          pubDate: item.pubDate,
          relevanceScore: item.relevanceScore,
        }));

        updates.set(category, { items, topics });
        console.log(`✓ Updated ${category}: ${items.length} items`);
      } catch (error) {
        console.error(`✗ Failed to update ${category}:`, error);
      }
    });

    await Promise.all(updatePromises);

    // Bulk update the cache
    if (updates.size > 0) {
      await bulkUpdateRSSCache(updates);

      // Update user-specific trending caches
      await updateUserTrendingCaches(updates);

      return {
        success: true,
        message: `Updated ${updates.size} categories`,
        updated: updates.size,
        categories: Array.from(updates.keys()),
      };
    }

    return {
      success: false,
      message: "No categories were successfully updated",
      updated: 0,
    };
  } catch (error) {
    console.error("Error in scheduled RSS update:", error);
    return {
      success: false,
      message: (error as Error).message,
      updated: 0,
    };
  }
}

// Fetch category feeds without using cache
async function fetchCategoryFeedsWithoutCache(category: Category): Promise<RSSItem[]> {
  const feeds = RSS_FEEDS[category] || [];
  if (feeds.length === 0) {
    throw new Error(`No feeds configured for category: ${category}`);
  }

  // Fetch all feeds in parallel
  const promises = feeds.map((feedUrl) => rssParser.parseFeed(feedUrl, category));
  const results = await Promise.all(promises);

  // Flatten and combine all items
  let allItems = results.flat();

  // Remove duplicates
  allItems = rssParser.removeDuplicates(allItems);

  // Sort by relevance and recency
  allItems.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  // Return top 30 items
  return allItems.slice(0, 30);
}

// Update user-specific trending caches
async function updateUserTrendingCaches(categoryUpdates: Map<Category, { items: RSSItem[]; topics: TrendingTopic[] }>) {
  try {
    // Get all users with brand settings
    const usersSnapshot = await adminDb.collection("userBrandSettings").get();

    const updatePromises = usersSnapshot.docs.map(async (doc) => {
      const userId = doc.id;
      const settings = doc.data();
      const userCategories = settings?.selectedCategories || ["ai", "business"];

      // Collect trending topics for user's categories
      const userTopics: TrendingTopic[] = [];

      userCategories.forEach((category: Category) => {
        const categoryData = categoryUpdates.get(category);
        if (categoryData) {
          userTopics.push(...categoryData.topics.slice(0, 5));
        }
      });

      // Sort by relevance and limit
      userTopics.sort((a, b) => b.relevanceScore - a.relevanceScore);
      const topUserTopics = userTopics.slice(0, 8);

      // Store user-specific cache
      await storeUserTrendingCache(userId, topUserTopics, userCategories);
    });

    await Promise.all(updatePromises);
    console.log(`Updated trending caches for ${usersSnapshot.size} users`);
  } catch (error) {
    console.error("Error updating user trending caches:", error);
  }
}

// Function to be called by cron job
export async function scheduledRSSUpdate() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting RSS feed update job...`);

  const result = await updateAllRSSFeeds();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[${new Date().toISOString()}] RSS update completed in ${duration}s`, result);

  return result;
}
