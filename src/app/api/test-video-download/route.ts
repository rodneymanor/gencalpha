import { NextRequest, NextResponse } from "next/server";

import { VideoDownloader } from "@/core/video/downloader";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 [TEST-DOWNLOAD] Starting test video download (no auth required)");

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
    }

    console.log("🎥 [TEST-DOWNLOAD] Processing video download request for:", url);

    const result = await VideoDownloader.download(url);

    if (!result) {
      return NextResponse.json({ 
        error: "Failed to download video",
        details: "VideoDownloader returned null result"
      }, { status: 500 });
    }

    console.log("✅ [TEST-DOWNLOAD] Video download completed successfully");

    return NextResponse.json({
      success: true,
      videoData: result.videoData,
      metrics: result.metrics,
      additionalMetadata: result.additionalMetadata,
      testMode: true
    });
  } catch (error) {
    console.error("❌ [TEST-DOWNLOAD] Download error:", error);
    return NextResponse.json(
      {
        error: "Failed to download video",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        testMode: true
      },
      { status: 500 },
    );
  }
}