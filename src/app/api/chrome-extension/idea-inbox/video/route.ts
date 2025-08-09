import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { notesService } from "@/lib/services/notes-service";
import { UnifiedVideoScraper, scrapeVideoUrl } from "@/lib/unified-video-scraper";

interface VideoIdeaBody {
  url: string;
  title?: string;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.user.uid;

    const { url, title, tags = [] }: VideoIdeaBody = await request.json();
    if (!url) {
      return NextResponse.json({ success: false, error: "url is required" }, { status: 400 });
    }

    const decodedUrl = decodeURIComponent(url);
    const validation = UnifiedVideoScraper.validateUrlWithMessage(decodedUrl);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.message }, { status: 400 });
    }

    // Only TikTok/Instagram for now (per product scope)
    if (!["tiktok", "instagram", "tiktok_cdn", "instagram_cdn"].includes(validation.platform)) {
      return NextResponse.json(
        { success: false, error: "Only TikTok and Instagram URLs are supported" },
        { status: 400 },
      );
    }

    // Scrape metadata (no upload/processing here)
    const videoData = await scrapeVideoUrl(decodedUrl).catch(() => null);

    const noteId = await notesService.createNote(userId, {
      title: (title ?? `Idea from ${validation.platform}`).trim(),
      content: decodedUrl,
      tags: tags.filter((t) => t && t.trim()),
      type: "idea_inbox",
      source: "inbox",
      starred: false,
      metadata: {
        videoUrl: decodedUrl,
        thumbnailUrl: (videoData as any)?.thumbnailUrl,
        duration: (videoData as any)?.additionalMetadata?.duration,
        viewCount: (videoData as any)?.metrics?.views,
        publishedAt: (videoData as any)?.metadata?.publishedAt,
      },
    });

    const note = await notesService.getNote(noteId, userId);
    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error) {
    console.error("❌ [Chrome Idea Inbox Video] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save video idea" }, { status: 500 });
  }
}
