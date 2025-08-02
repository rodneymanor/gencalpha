import { NextRequest, NextResponse } from "next/server";

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

interface AddDailyVideoBody {
  videoUrl: string;
  interest?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, interest }: AddDailyVideoBody = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ success: false, error: "videoUrl is required" }, { status: 400 });
    }

    // Call existing heavy workflow (process-video) to get CDN + metrics
    const baseUrl = new URL("..", request.url).origin; // /api

    const processRes = await fetch(`${baseUrl}/api/video/process-video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.INTERNAL_API_SECRET ?? "",
      },
      body: JSON.stringify({ videoUrl }),
    });

    const processJson = await processRes.json();

    if (!processRes.ok || !processJson.success) {
      return NextResponse.json(
        { success: false, error: "Video processing failed", details: processJson },
        { status: 500 },
      );
    }

    // Persist to Firestore in `dailyVideos` collection
    if (!isAdminInitialized) {
      return NextResponse.json({ success: false, error: "Firebase not initialised" }, { status: 500 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Admin DB unavailable" }, { status: 500 });
    }

    const payload = {
      videoUrl,
      iframeUrl: processJson.cdnUrls?.iframe,
      thumbnailUrl: processJson.cdnUrls?.thumbnail,
      platform: processJson.videoData?.platform ?? "tiktok",
      title: processJson.videoData?.title ?? "",
      author: processJson.videoData?.author ?? "",
      metrics: processJson.videoData?.metrics ?? {},
      interest: interest ?? null,
      createdAt: new Date().toISOString(),
    } as Record<string, any>;

    const docRef = await adminDb.collection("dailyVideos").add(payload);

    return NextResponse.json({ success: true, id: docRef.id, video: payload });
  } catch (err) {
    console.error("[daily-add-video]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
