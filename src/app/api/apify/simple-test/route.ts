import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, url } = await request.json();

    const token = process.env.APIFY_TOKEN;
    if (!token) {
      throw new Error("Apify token not configured");
    }

    let apiUrl: string;
    let inputData: object;

    if (username) {
      // Instagram profile scraping
      apiUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}`;
      inputData = {
        usernames: [username],
        proxyConfiguration: {
          useApifyProxy: true,
        },
      };
    } else if (url) {
      // Instagram reel scraping
      apiUrl = `https://api.apify.com/v2/acts/apify~instagram-reel-scraper/run-sync-get-dataset-items?token=${token}`;
      inputData = {
        directUrls: [url],
        proxyConfiguration: {
          useApifyProxy: true,
        },
      };
    } else {
      throw new Error("Either username or url is required");
    }

    console.log("🚀 Making direct Apify API call...");
    console.log("📍 URL:", apiUrl.replace(token, "TOKEN_HIDDEN"));
    console.log("📝 Input:", JSON.stringify(inputData, null, 2));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputData),
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", errorText);
      throw new Error(`Apify API error: ${response.status} - ${errorText}`);
    }

    const results = await response.json();
    console.log("✅ Got results:", results.length, "items");

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Simple test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const url = searchParams.get("url");

  return POST(
    new NextRequest(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify({ username, url }),
    }),
  );
}
