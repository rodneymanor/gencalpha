import { NextResponse } from "next/server";

export async function GET() {
  console.log("🔍 Validating TikTok User Feed API configuration");

  try {
    // Check if RapidAPI key is available
    const rapidApiKey = process.env.RAPIDAPI_KEY ?? "7d8697833dmsh0919d85dc19515ap1175f7jsn0f8bb6dae84e";

    console.log("🔑 API Key available:", !!rapidApiKey);
    console.log("🔑 API Key prefix:", rapidApiKey.substring(0, 10) + "...");

    // Test the API endpoint directly
    const testUsername = "charlidamelio";
    const apiUrl = `https://tiktok-scrapper-videos-music-challenges-downloader.p.rapidapi.com/user/tiktok/feed?username=${encodeURIComponent(testUsername)}&count=1`;

    console.log(`🌐 Testing API URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "tiktok-scrapper-videos-music-challenges-downloader.p.rapidapi.com",
        "x-rapidapi-key": rapidApiKey,
      },
    });

    const responseText = await response.text();
    console.log(`📡 Response Status: ${response.status}`);
    console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      return NextResponse.json({
        validation: "failed",
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText.substring(0, 500), // First 500 chars
        recommendations: [
          "Check if RapidAPI key is valid",
          "Verify the API endpoint is correct",
          "Check if the API service is available",
          "Ensure proper headers are set",
        ],
        timestamp: new Date().toISOString(),
      });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json({
        validation: "partially_successful",
        status: response.status,
        error: "Response is not valid JSON",
        response: responseText.substring(0, 500),
        parseError: parseError instanceof Error ? parseError.message : "Unknown parse error",
        timestamp: new Date().toISOString(),
      });
    }

    console.log("✅ API validation successful");

    return NextResponse.json({
      validation: "successful",
      api_response: {
        status: response.status,
        data_structure: {
          has_user: !!parsedData.data?.user,
          has_videos: !!parsedData.data?.videos,
          video_count: parsedData.data?.videos?.length ?? 0,
          user_info: parsedData.data?.user
            ? {
                username: parsedData.data.user.uniqueId,
                nickname: parsedData.data.user.nickname,
                verified: parsedData.data.user.verified,
                followers: parsedData.data.stats?.followerCount,
              }
            : null,
        },
        sample_video: parsedData.data?.videos?.[0]
          ? {
              id: parsedData.data.videos[0].id,
              desc_preview: parsedData.data.videos[0].desc?.substring(0, 100),
              duration: parsedData.data.videos[0].video?.duration,
              stats: parsedData.data.videos[0].stats,
            }
          : null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("💥 Validation failed:", error);

    return NextResponse.json({
      validation: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      troubleshooting: [
        "Check network connectivity",
        "Verify API key permissions",
        "Check rate limiting",
        "Ensure proper environment setup",
      ],
      timestamp: new Date().toISOString(),
    });
  }
}
