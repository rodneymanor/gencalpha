import { NextRequest, NextResponse } from "next/server";

import { UnifiedVideoScraper } from "@/lib/unified-video-scraper";

interface BatchRequest {
  pageUrls: string[];
  max?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchRequest = await request.json();
    const pageUrls = Array.isArray(body?.pageUrls) ? body.pageUrls.filter(Boolean) : [];
    const max = typeof body?.max === "number" && body.max > 0 ? body.max : 10;

    if (pageUrls.length === 0) {
      return NextResponse.json({ success: false, error: "pageUrls is required" }, { status: 400 });
    }

    const scraper = new UnifiedVideoScraper();
    const transcripts: string[] = [];

    for (const url of pageUrls.slice(0, max)) {
      try {
        const data = await scraper.scrapeUrl(url);
        // Prefer transcription text when available
        const t = (data as any)?.transcription?.text as string | undefined;
        if (t && t.trim().length > 0) {
          transcripts.push(t);
          continue;
        }
        // Fallback to description
        const desc = data.description?.toString() ?? "";
        if (desc.trim().length > 0) {
          transcripts.push(desc);
          continue;
        }
        // As a last resort, attempt to fetch from videoUrl through existing endpoint
        const videoUrl = (data as any)?.videoUrl as string | undefined;
        if (videoUrl) {
          const res = await fetch(`${request.nextUrl.origin}/api/video/transcribe-from-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoUrl }),
          });
          if (res.ok) {
            const j = await res.json();
            if (j?.success && j?.transcript) {
              transcripts.push(j.transcript as string);
            }
          }
        }
      } catch (err) {
        // Continue with next URL
        console.warn("[batch-resolve-and-transcribe] Failed for URL", url, err);
      }
    }

    if (transcripts.length === 0) {
      return NextResponse.json(
        { success: false, error: "No transcripts could be generated from provided URLs" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, transcripts });
  } catch (error) {
    console.error("❌ [batch-resolve-and-transcribe] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

