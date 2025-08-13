import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { scrapeVideoUrl, UnifiedVideoScraper } from "@/lib/unified-video-scraper";

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;

    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ success: false, error: "url is required" });
    }

    const decodedUrl = decodeURIComponent(url);
    const platform = UnifiedVideoScraper.detectPlatform(decodedUrl);

    // Friendly early exit when RapidAPI key is missing for Instagram
    if (platform === "instagram" && !process.env.RAPIDAPI_KEY) {
      console.warn("⚠️ [VIDEO_RESOLVE] Missing RAPIDAPI_KEY for Instagram resolve");
      return NextResponse.json({
        success: false,
        platform,
        error: "rapidapi_key_missing",
        message:
          "Instagram resolve is temporarily unavailable on the server. Please add RAPIDAPI_KEY or try TikTok URLs.",
      });
    }

    try {
      const result = await scrapeVideoUrl(decodedUrl);
      return NextResponse.json({
        success: true,
        platform: result.platform,
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl,
        title: result.title,
        metadata: result.metadata,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("❌ [VIDEO_RESOLVE] scrape error:", msg);

      // Normalize RapidAPI 401s and similar auth errors into friendly client-safe responses
      const isRapid401 = /Instagram RapidAPI failed:\s*401|Invalid API key/i.test(msg);
      if (isRapid401) {
        return NextResponse.json({
          success: false,
          platform,
          error: "rapidapi_auth",
          message:
            "Instagram service is unavailable due to server credentials. We're on it — meanwhile you can paste a direct video URL if you have one.",
        });
      }

      return NextResponse.json({
        success: false,
        platform,
        error: "resolve_failed",
        message: "We couldn't resolve this video right now. Please try again shortly.",
      });
    }
  } catch (error) {
    console.error("❌ [VIDEO_RESOLVE] Error:", error);
    // Always return 200 to avoid client fetch throwing; indicate failure via success=false
    return NextResponse.json({ success: false, error: "Failed to resolve video" });
  }
}
