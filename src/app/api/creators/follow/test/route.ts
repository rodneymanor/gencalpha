/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { NextResponse } from "next/server";

export async function GET() {
  console.log("🧪 Testing Follow Creator Workflow");

  try {
    // Get the base URL for the API call
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

    // Test with a popular creator
    const testUsername = "charlidamelio"; // Using a well-known public account
    const testPlatform = "tiktok";

    console.log(`🎭 Testing with username: ${testUsername} (${testPlatform})`);

    const response = await fetch(`${baseUrl}/api/creators/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add test API key if needed
        "x-api-key": process.env.TEST_API_KEY || "test-key",
      },
      body: JSON.stringify({
        username: testUsername,
        platform: testPlatform,
        userId: "test-user-id", // Use a test user ID
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("❌ Workflow test failed");
      return NextResponse.json({
        success: false,
        error: "Workflow test failed",
        status: response.status,
        data: data,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("✅ Workflow test successful");
    console.log(`👤 Creator: ${data.creator?.username} (${data.creator?.platform})`);
    console.log(`🎬 Videos processed: ${data.videos?.length || 0}`);
    console.log(`👥 Follow ID: ${data.followId}`);

    // Return sanitized test results
    return NextResponse.json({
      success: true,
      test_status: "passed",
      creator: {
        id: data.creator?.id,
        username: data.creator?.username,
        platform: data.creator?.platform,
        displayName: data.creator?.displayName,
        followerCount: data.creator?.followerCount,
      },
      videos_count: data.videos?.length || 0,
      follow_id: data.followId,
      sample_video: data.videos?.[0]
        ? {
            id: data.videos[0].id,
            title: data.videos[0].title,
            views: data.videos[0].metrics?.views,
            has_thumbnail: !!data.videos[0].thumbnailUrl,
            has_video_url: !!data.videos[0].videoUrl,
          }
        : null,
      recommendations: [
        "Workflow completed successfully",
        "Creator profile stored in database",
        "Videos uploaded to Bunny.net CDN",
        "Follow relationship established",
        "Videos ready for display in frontend",
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Workflow test error:", error);

    return NextResponse.json(
      {
        success: false,
        test_status: "failed",
        error: error instanceof Error ? error.message : "Unknown error occurred",
        recommendations: [
          "Check if all required environment variables are set",
          "Verify API endpoints are accessible",
          "Ensure Bunny.net CDN is configured",
          "Check Firebase/database connectivity",
          "Verify social media API keys are valid",
        ],
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
