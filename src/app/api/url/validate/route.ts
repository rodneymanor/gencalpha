import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { UnifiedVideoScraper } from "@/lib/unified-video-scraper";

type SupportedPlatform = "instagram" | "tiktok";

interface ValidateBody {
  url?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Support both API key and Firebase bearer token
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;

    const { url }: ValidateBody = await request.json();
    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 });
    }

    const decodedUrl = decodeURIComponent(url);
    const validation = UnifiedVideoScraper.validateUrlWithMessage(decodedUrl);

    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        isReachable: false,
        isSupported: false,
        platform: null,
        message: validation.message ?? "Unsupported URL",
      });
    }

    // Only support TikTok/Instagram for now
    const platform = validation.platform ?? "unsupported";
    const isSupported = platform === "tiktok" || platform === "instagram";
    if (!isSupported) {
      return NextResponse.json({
        success: true,
        isReachable: true,
        isSupported: false,
        platform: null,
        message: "Only TikTok and Instagram URLs are supported",
      });
    }

    // Lightweight reachability check (HEAD -> GET fallback)
    let isReachable = false;
    try {
      const head = await fetch(decodedUrl, { method: "HEAD" });
      isReachable = head.ok;
      if (!isReachable) {
        const get = await fetch(decodedUrl, { method: "GET" });
        isReachable = get.ok;
      }
    } catch {
      isReachable = false;
    }

    return NextResponse.json({
      success: true,
      isReachable,
      isSupported: true,
      platform: platform as SupportedPlatform,
      message: isReachable ? "URL is valid and reachable" : "URL appears valid but may be unreachable",
    });
  } catch (error) {
    console.error("❌ [URL_VALIDATE] Error:", error);
    return NextResponse.json({ success: false, error: "Validation failed" }, { status: 500 });
  }
}
