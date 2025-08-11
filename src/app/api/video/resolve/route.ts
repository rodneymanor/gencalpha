import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { scrapeVideoUrl } from "@/lib/unified-video-scraper";

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;

    const { url } = await request.json();
    if (!url) return NextResponse.json({ success: false, error: "url is required" }, { status: 400 });

    const decodedUrl = decodeURIComponent(url);
    const result = await scrapeVideoUrl(decodedUrl).catch((e: unknown) => {
      console.error("❌ [VIDEO_RESOLVE] scrape error:", e);
      return null;
    });
    if (!result) return NextResponse.json({ success: false, error: "Failed to resolve video" }, { status: 500 });

    return NextResponse.json({
      success: true,
      platform: result.platform,
      videoUrl: result.videoUrl,
      thumbnailUrl: result.thumbnailUrl,
      title: result.title,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error("❌ [VIDEO_RESOLVE] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to resolve video" }, { status: 500 });
  }
}
