import { NextRequest, NextResponse } from "next/server";

import { getCachedRSSData } from "@/lib/db/rss-cache";
import { rssParser, type Category, RSS_FEEDS } from "@/lib/rss-service";

export async function GET(request: NextRequest, { params }: { params: Promise<{ category: string }> }) {
  try {
    const { category: categoryParam } = await params;
    const category = categoryParam as Category;

    // Validate category
    if (!RSS_FEEDS[category]) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category: ${category}. Available categories: ${Object.keys(RSS_FEEDS).join(", ")}`,
        },
        { status: 400 },
      );
    }

    // First try to get cached data
    const cachedData = await getCachedRSSData(category);

    if (cachedData && cachedData.items.length > 0) {
      // Return cached data
      return NextResponse.json({
        success: true,
        category,
        items: cachedData.items,
        count: cachedData.items.length,
        cached: true,
        lastUpdated: cachedData.lastUpdated,
        nextUpdate: cachedData.nextUpdate,
        timestamp: new Date().toISOString(),
      });
    }

    // Fallback to fetching fresh data if cache miss
    console.log(`Cache miss for ${category}, fetching fresh data...`);
    const items = await rssParser.fetchCategoryFeeds(category);

    // Store in cache for next time
    if (items.length > 0) {
      const { storeCachedRSSData } = await import("@/lib/db/rss-cache");
      const topics = items.slice(0, 10).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description.substring(0, 100) + "...",
        source: item.source,
        pubDate: item.pubDate,
        relevanceScore: item.relevanceScore,
      }));
      await storeCachedRSSData(category, items, topics);
    }

    return NextResponse.json({
      success: true,
      category,
      items,
      count: items.length,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("RSS feeds error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
