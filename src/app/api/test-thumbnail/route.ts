import { NextRequest, NextResponse } from "next/server";

import { uploadBunnyThumbnailWithRetry } from "@/lib/bunny-stream";

export async function POST(request: NextRequest) {
  try {
    const { videoId, thumbnailUrl } = await request.json();

    if (!videoId || !thumbnailUrl) {
      return NextResponse.json({ error: "videoId and thumbnailUrl are required" }, { status: 400 });
    }

    console.log("🧪 [TEST_THUMBNAIL] Testing thumbnail upload");
    console.log("🎬 [TEST_THUMBNAIL] Video ID:", videoId);
    console.log("🖼️ [TEST_THUMBNAIL] Thumbnail URL:", thumbnailUrl);

    const success = await uploadBunnyThumbnailWithRetry(videoId, thumbnailUrl);

    return NextResponse.json({
      success,
      message: success ? "Thumbnail uploaded successfully" : "Thumbnail upload failed",
      videoId,
      thumbnailUrl,
    });
  } catch (error) {
    console.error("❌ [TEST_THUMBNAIL] Error:", error);
    return NextResponse.json(
      {
        error: "Thumbnail upload test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Thumbnail Upload Test API",
    description: "Test endpoint for Bunny CDN thumbnail upload functionality",
    usage: {
      "POST /api/test-thumbnail": {
        body: {
          videoId: "Video GUID from Bunny CDN (required)",
          thumbnailUrl: "URL of thumbnail image to upload (required)",
        },
        response: {
          success: "boolean indicating upload success",
          message: "Success or failure message",
          videoId: "Echo of input video ID",
          thumbnailUrl: "Echo of input thumbnail URL",
        },
      },
    },
    example: {
      videoId: "12345678-1234-5678-9abc-123456789012",
      thumbnailUrl: "https://example.com/thumbnail.jpg",
    },
  });
}
