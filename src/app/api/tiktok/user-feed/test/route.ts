import { NextResponse } from "next/server";

export async function GET() {
  console.log("🧪 Testing TikTok User Feed API");

  try {
    // Get the base URL for the API call
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

    // Test with a popular TikTok user
    const testUsername = "charlidamelio"; // Using a well-known public account

    console.log(`🎭 Testing with username: ${testUsername}`);

    const response = await fetch(`${baseUrl}/api/tiktok/user-feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: testUsername,
        count: 5, // Just fetch 5 videos for testing
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("❌ API test failed");
      return NextResponse.json({
        success: false,
        error: "API call failed",
        status: response.status,
        data: data,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("✅ API test successful");
    console.log(`📊 Retrieved user: ${data.userInfo?.nickname ?? "Unknown"}`);
    console.log(`🎬 Video count: ${data.videos?.length ?? 0}`);

    // Return sanitized test results
    return NextResponse.json({
      success: true,
      test_results: {
        api_working: true,
        user_found: !!data.userInfo,
        videos_retrieved: data.videos?.length ?? 0,
        user_stats: data.userInfo?.stats,
        sample_video: data.videos?.[0]
          ? {
              id: data.videos[0].id,
              description: data.videos[0].description?.substring(0, 100) + "...",
              duration: data.videos[0].duration,
              stats: data.videos[0].stats,
              hashtags_count: data.videos[0].hashtags?.length ?? 0,
              has_music: !!data.videos[0].music?.title,
            }
          : null,
        metadata: data.metadata,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("💥 Test failed:", error);

    return NextResponse.json({
      success: false,
      error: "Test execution failed",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
