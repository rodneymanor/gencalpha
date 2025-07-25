import { NextRequest, NextResponse } from "next/server";
import { ApifyClient, APIFY_ACTORS } from "@/lib/apify";

export interface TikTokScraperRequest {
  profiles?: string[];
  hashtags?: string[];
  resultsPerPage?: number;
  proxyConfiguration?: {
    useApifyProxy: boolean;
  };
}

export interface TikTokScraperResponse {
  success: boolean;
  data?: unknown[];
  error?: string;
  timestamp: string;
  debug?: {
    actorUsed: string;
    inputSent: object;
    rawResponse: unknown;
    responseType: string;
    itemCount: number;
  };
}

async function scrapeTikTokGeneral(input: TikTokScraperRequest): Promise<unknown[]> {
  const client = new ApifyClient();
  
  console.log("🎯 TikTok Scraper called with input:", JSON.stringify(input, null, 2));
  
  // Build the input according to clockworks~tiktok-scraper schema
  const apifyInput: Record<string, unknown> = {
    proxyConfiguration: {
      useApifyProxy: true
    }
  };

  // Add profiles if provided
  if (input.profiles && input.profiles.length > 0) {
    apifyInput.profiles = input.profiles;
    console.log("📱 Added profiles:", input.profiles);
  }

  // Add hashtags if provided  
  if (input.hashtags && input.hashtags.length > 0) {
    apifyInput.hashtags = input.hashtags;
    console.log("🏷️ Added hashtags:", input.hashtags);
  }

  // Add results per page
  if (input.resultsPerPage) {
    apifyInput.resultsPerPage = input.resultsPerPage;
    console.log("📄 Results per page:", input.resultsPerPage);
  }

  console.log("🚀 Final Apify input:", JSON.stringify(apifyInput, null, 2));
  console.log("🎭 Using actor:", APIFY_ACTORS.TIKTOK_SCRAPER);

  const results = await client.runActor(APIFY_ACTORS.TIKTOK_SCRAPER, apifyInput, true);
  
  console.log("📥 Raw response from Apify:");
  console.log("📊 Response type:", typeof results);
  console.log("📊 Is array:", Array.isArray(results));
  console.log("📊 Response length:", Array.isArray(results) ? results.length : "N/A");
  console.log("📊 Raw response sample:", JSON.stringify(results, null, 2));
  
  if (!Array.isArray(results)) {
    console.log("⚠️ Response is not an array, wrapping in array");
    return [results];
  }

  console.log("✅ Returning array with", results.length, "items");
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const body: TikTokScraperRequest = await request.json();
    
    console.log("🎯 TikTok Scraper API called with:", JSON.stringify(body, null, 2));

    if (!body.profiles && !body.hashtags) {
      return NextResponse.json(
        {
          success: false,
          error: "Either profiles or hashtags is required",
          timestamp: new Date().toISOString(),
        } satisfies TikTokScraperResponse,
        { status: 400 }
      );
    }

    const results = await scrapeTikTokGeneral(body);

    const response: TikTokScraperResponse = {
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
      debug: {
        actorUsed: APIFY_ACTORS.TIKTOK_SCRAPER,
        inputSent: body,
        rawResponse: results,
        responseType: typeof results,
        itemCount: Array.isArray(results) ? results.length : 1,
      },
    };

    console.log("✅ Successfully scraped", results.length, "TikTok items");
    
    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ TikTok scraper failed:", error);
    
    const response: TikTokScraperResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profiles = searchParams.get("profiles")?.split(",");
  const hashtags = searchParams.get("hashtags")?.split(",");
  const resultsPerPage = searchParams.get("resultsPerPage") ? parseInt(searchParams.get("resultsPerPage")!) : undefined;

  if (!profiles && !hashtags) {
    return NextResponse.json(
      {
        success: false,
        error: "Either profiles or hashtags parameter is required",
        timestamp: new Date().toISOString(),
      } satisfies TikTokScraperResponse,
      { status: 400 }
    );
  }

  try {
    const results = await scrapeTikTokGeneral({
      profiles,
      hashtags,
      resultsPerPage,
    });

    const response: TikTokScraperResponse = {
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ TikTok scraper failed:", error);
    
    const response: TikTokScraperResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}