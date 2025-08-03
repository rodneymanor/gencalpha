import { NextRequest, NextResponse } from "next/server";

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { processVideoWorkflow } from "../../process-video/route";

interface AddDailyVideoBody {
  videoUrl: string;
  interest?: string;
  title?: string;
  scrapedData?: any;
}

export async function POST(request: NextRequest) {
  try {
    // Verify internal authentication
    const internalSecret = request.headers.get("x-internal-secret");
    if (!internalSecret || internalSecret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { videoUrl, interest, title }: AddDailyVideoBody = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: "videoUrl is required" },
        { status: 400 },
      );
    }

    if (!isAdminInitialized) {
      return NextResponse.json(
        { success: false, error: "Firebase not initialised" },
        { status: 500 },
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: "Admin DB unavailable" },
        { status: 500 },
      );
    }

    // Run consolidated processing workflow (download, CDN upload, transcription, etc.)
    const requestId = Math.random().toString(36).substring(7);
    const finalResult = await processVideoWorkflow(requestId, videoUrl);

    if (!finalResult || !finalResult.success) {
      return NextResponse.json(
        { success: false, error: "Video processing failed", details: finalResult },
        { status: 500 },
      );
    }

    // Prepare Firestore payload
    const payload = {
      videoUrl,
      iframeUrl: finalResult.cdnUrls.iframe,
      directUrl: finalResult.cdnUrls.direct,
      thumbnailUrl: finalResult.cdnUrls.thumbnail,
      platform: finalResult.videoData.platform ?? "unknown",
      title: title ?? finalResult.videoData.title ?? `Video from ${finalResult.videoData.platform ?? "unknown"}`,
      interest: interest ?? null,
      metadata: {
        author: finalResult.videoData.author ?? "unknown",
        views: finalResult.videoData.metrics?.views ?? 0,
        duration: 0,
        originalUrl: videoUrl,
        hashtags: finalResult.videoData.hashtags ?? [],
      },
      createdAt: new Date().toISOString(),
      transcript: finalResult.transcription.transcript,
      transcriptionStatus: finalResult.transcription.transcript ? "completed" : "failed",
      components: finalResult.transcription.components,
    } as const;

    const docRef = await adminDb.collection("dailyVideos").add(payload);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      video: payload,
      cdnUrls: finalResult.cdnUrls,
    });
  } catch (err) {
    console.error("[daily-add-video]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
