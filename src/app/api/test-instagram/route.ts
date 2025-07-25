import { NextRequest, NextResponse } from "next/server";

import {
  ApifyInstagramScraper,
  createApifyInstagramScraper,
  type ApifyInstagramResult,
} from "@/lib/apify-instagram-scraper";

interface TestInstagramRequest {
  url: string;
  method?: "sync" | "async";
}

interface TestInstagramResponse {
  success: boolean;
  data?: {
    shortCode: string;
    caption: string;
    likesCount: number;
    videoViewCount?: number;
    hashtags: string[];
    videoUrl?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    author: {
      username: string;
      fullName: string;
    };
    timestamp: string;
  };
  error?: string;
  rawData?: any;
}

export async function POST(request: NextRequest): Promise<NextResponse<TestInstagramResponse>> {
  console.log("🧪 [TEST-INSTAGRAM] Starting Instagram URL test...");

  try {
    const { url, method = "sync" }: TestInstagramRequest = await request.json();

    if (!url) {
      console.error("❌ [TEST-INSTAGRAM] No URL provided");
      return NextResponse.json(
        {
          success: false,
          error: "URL is required",
        },
        { status: 400 }
      );
    }

    // Validate Instagram URL
    if (!ApifyInstagramScraper.isValidInstagramUrl(url)) {
      console.error("❌ [TEST-INSTAGRAM] Invalid Instagram URL:", url);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Instagram URL format. Please provide a valid Instagram reel, post, or profile URL.",
        },
        { status: 400 }
      );
    }

    console.log("🔍 [TEST-INSTAGRAM] Testing URL:", url);
    console.log("🔧 [TEST-INSTAGRAM] Method:", method);

    // Check if Apify token is configured
    if (!process.env.APIFY_TOKEN) {
      console.error("❌ [TEST-INSTAGRAM] APIFY_TOKEN not configured");
      return NextResponse.json(
        {
          success: false,
          error: "Apify API token not configured. Please set APIFY_TOKEN environment variable.",
          rawData: { envVars: Object.keys(process.env).filter(key => key.includes('APIFY')) },
        },
        { status: 500 }
      );
    }

    // Log token status (first/last 4 chars for security)
    const token = process.env.APIFY_TOKEN;
    const tokenPreview = token.length > 8 ? `${token.slice(0, 4)}...${token.slice(-4)}` : 'SHORT_TOKEN';
    console.log("🔑 [TEST-INSTAGRAM] Using Apify token:", tokenPreview, `(${token.length} chars)`);
    
    // Validate token format (Apify tokens are typically 40+ chars)
    if (token.length < 20) {
      console.error("❌ [TEST-INSTAGRAM] Apify token appears to be too short");
      return NextResponse.json(
        {
          success: false,
          error: "Apify API token appears to be invalid (too short). Please check your APIFY_TOKEN configuration.",
          rawData: { tokenLength: token.length },
        },
        { status: 500 }
      );
    }

    const scraper = createApifyInstagramScraper();
    let results: ApifyInstagramResult[];

    if (method === "sync") {
      // Use synchronous method for quick testing
      console.log("⚡ [TEST-INSTAGRAM] Using sync method...");
      results = await scraper.scrapeSyncQuick(url, {
        resultsType: "details",
        resultsLimit: 1,
      });
    } else {
      // Use asynchronous method for larger jobs
      console.log("🔄 [TEST-INSTAGRAM] Using async method...");
      results = await scraper.scrapeComplete(url, {
        resultsType: "details",
        resultsLimit: 1,
      });
    }

    if (!results || results.length === 0) {
      console.error("❌ [TEST-INSTAGRAM] No results returned from Apify");
      return NextResponse.json({
        success: false,
        error: "No data found for this Instagram URL. The post might be private or deleted.",
        rawData: results,
      });
    }

    const result = results[0];
    console.log("✅ [TEST-INSTAGRAM] Successfully scraped Instagram data");
    console.log("📊 [TEST-INSTAGRAM] Result summary:");
    console.log("  - Short Code:", result.shortCode);
    console.log("  - Author:", result.ownerUsername);
    console.log("  - Likes:", result.likesCount);
    console.log("  - Has Video:", result.isVideo);
    console.log("  - Video URL:", result.videoUrl ? "Yes" : "No");

    // Extract video/image URLs
    const videoUrl = ApifyInstagramScraper.getVideoUrl(result);
    const imageUrl = ApifyInstagramScraper.getImageUrl(result);
    const thumbnailUrl = ApifyInstagramScraper.getThumbnailUrl(result);

    const responseData = {
      shortCode: result.shortCode,
      caption: result.caption || "",
      likesCount: result.likesCount,
      videoViewCount: result.videoViewCount,
      hashtags: result.hashtags || [],
      videoUrl: videoUrl || undefined,
      imageUrl: imageUrl || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      author: {
        username: result.ownerUsername,
        fullName: result.ownerFullName || result.ownerUsername,
      },
      timestamp: result.timestamp,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      rawData: result, // Include raw data for debugging
    });
  } catch (error) {
    console.error("❌ [TEST-INSTAGRAM] Error:", error);

    let errorMessage = "Failed to scrape Instagram URL";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific Apify errors
      if (error.message.includes("401")) {
        errorMessage = "Invalid Apify API token. Please check your APIFY_TOKEN configuration.";
        statusCode = 401;
      } else if (error.message.includes("403")) {
        errorMessage = "Access denied. The Apify Actor might be private or your token lacks permissions.";
        statusCode = 403;
      } else if (error.message.includes("429")) {
        errorMessage = "Rate limit exceeded. Please try again later or upgrade your Apify plan.";
        statusCode = 429;
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. The Instagram URL might be slow to process or invalid.";
        statusCode = 408;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        rawData: error,
      },
      { status: statusCode }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: "Instagram URL Tester API",
    description: "POST an Instagram URL to test Apify's Instagram Scraper",
    example: {
      url: "https://www.instagram.com/reel/C5eGEVIOS8b/",
      method: "sync", // or "async"
    },
    endpoints: {
      "POST /api/test-instagram": "Test Instagram URL scraping",
    },
    requirements: {
      "APIFY_TOKEN": "Required environment variable",
    },
  });
}