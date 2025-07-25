import { NextRequest, NextResponse } from "next/server";

import { ApifyClient, validateApifyInput, APIFY_ACTORS } from "@/lib/apify";

export interface InstagramReelData {
  id: string;
  shortcode: string;
  url: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  duration?: number;
  username: string;
}

function mapToInstagramReel(item: unknown): InstagramReelData {
  const data = item as any;
  return {
    id: data.id ?? "",
    shortcode: data.shortcode ?? "",
    url: data.url ?? "",
    videoUrl: data.videoUrl ?? data.video_url ?? "",
    thumbnailUrl: data.thumbnailUrl ?? data.thumbnail_url ?? "",
    caption: data.caption ?? "",
    timestamp: data.timestamp ?? data.taken_at_timestamp ?? "",
    likesCount: data.likesCount ?? data.like_count ?? 0,
    commentsCount: data.commentsCount ?? data.comment_count ?? 0,
    viewsCount: data.viewsCount ?? data.view_count,
    duration: data.duration ?? data.video_duration,
    username: data.username ?? data.owner?.username ?? "",
  };
}

function downloadVideosInBackground(reels: InstagramReelData[]): void {
  const client = new ApifyClient();
  setTimeout(async () => {
    for (const reel of reels) {
      if (reel.videoUrl) {
        try {
          await client.downloadMedia(reel.videoUrl);
          console.log(`✅ Downloaded video for reel: ${reel.id}`);
        } catch (error) {
          console.error(`❌ Failed to download video for reel ${reel.id}:`, error);
        }
      }
    }
  }, 100);
}

export interface InstagramReelRequest {
  url?: string;
  urls?: string[];
  username?: string;
  resultsLimit?: number;
  downloadVideo?: boolean;
}

export interface InstagramReelResponse {
  success: boolean;
  data?: InstagramReelData[];
  error?: string;
  timestamp: string;
}

async function scrapeInstagramReel(input: InstagramReelRequest): Promise<InstagramReelData[]> {
  const client = new ApifyClient();

  // Instagram reel scraper requires username field (not directUrls)
  let usernames: string[] = [];

  if (input.username) {
    usernames = [input.username];
  } else if (input.url || input.urls) {
    // Instagram reel scraper requires usernames, not URLs
    // If URLs are provided, inform user they need to provide usernames instead
    throw new Error(
      "Instagram reel scraper requires usernames, not URLs. " +
        "Please provide the Instagram username(s) whose reels you want to scrape.",
    );
  } else {
    throw new Error("Username is required for Instagram reel scraping");
  }

  if (usernames.length === 0) {
    throw new Error("No valid usernames found");
  }

  const apifyInput = {
    username: usernames,
    resultsLimit: input.resultsLimit ?? 5,
    proxyConfiguration: {
      useApifyProxy: true,
    },
  };

  validateApifyInput(apifyInput, ["username"]);

  console.log(`🎬 Scraping Instagram reels with input:`, apifyInput);

  const results = await client.runActor(APIFY_ACTORS.INSTAGRAM_REEL, apifyInput, true);

  if (!Array.isArray(results)) {
    throw new Error("Invalid response format from Apify");
  }

  const reels: InstagramReelData[] = results.map((item: unknown): InstagramReelData => mapToInstagramReel(item));

  if (input.downloadVideo) {
    console.log("🎥 Downloading video files...");

    downloadVideosInBackground(reels);
  }

  return reels;
}

export async function POST(request: NextRequest) {
  try {
    const body: InstagramReelRequest = await request.json();

    console.log("🎯 Instagram Reel API called with:", body);

    if (!body.url && !body.urls && !body.username) {
      return NextResponse.json(
        {
          success: false,
          error: "Either url, urls, or username is required",
          timestamp: new Date().toISOString(),
        } satisfies InstagramReelResponse,
        { status: 400 },
      );
    }

    const reels = await scrapeInstagramReel(body);

    const response: InstagramReelResponse = {
      success: true,
      data: reels,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Successfully scraped ${reels.length} Instagram reels`);

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Instagram reel scraping failed:", error);

    const response: InstagramReelResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const urls = searchParams.get("urls")?.split(",");
  const username = searchParams.get("username");
  const resultsLimit = searchParams.get("resultsLimit") ? parseInt(searchParams.get("resultsLimit")!) : undefined;
  const downloadVideo = searchParams.get("downloadVideo") === "true";

  if (!url && !urls && !username) {
    return NextResponse.json(
      {
        success: false,
        error: "Either url, urls, or username parameter is required",
        timestamp: new Date().toISOString(),
      } satisfies InstagramReelResponse,
      { status: 400 },
    );
  }

  try {
    const reels = await scrapeInstagramReel({
      url,
      urls,
      username,
      resultsLimit,
      downloadVideo,
    });

    const response: InstagramReelResponse = {
      success: true,
      data: reels,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Instagram reel scraping failed:", error);

    const response: InstagramReelResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}
