import { NextRequest, NextResponse } from "next/server";

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

// Reprocess a single video by deleting it and re-adding via internal workflow
// Request body: { videoId: string }
export async function POST(request: NextRequest) {
  try {
    const internalSecret = request.headers.get("x-internal-secret");
    if (!internalSecret || internalSecret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminInitialized) {
      return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Admin DB not available" }, { status: 500 });
    }

    const { videoId } = await request.json();
    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    // Load the video
    const videoRef = adminDb.collection("videos").doc(videoId);
    const videoDoc = await videoRef.get();
    if (!videoDoc.exists) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const video = videoDoc.data();
    const { originalUrl, collectionId, userId, title } = video;
    if (!originalUrl || !collectionId || !userId) {
      return NextResponse.json({ error: "Video missing required fields" }, { status: 400 });
    }

    // Delete existing video to force a clean re-run
    await videoRef.delete();

    // Decrement collection count if not all-videos
    if (collectionId !== "all-videos") {
      const collectionRef = adminDb.collection("collections").doc(collectionId);
      await adminDb.runTransaction(async (tx: any) => {
        const cDoc = await tx.get(collectionRef);
        if (cDoc.exists) {
          const currentCount = cDoc.data()?.videoCount ?? 0;
          tx.update(collectionRef, { videoCount: Math.max(0, currentCount - 1), updatedAt: new Date().toISOString() });
        }
      });
    }

    // Re-run processing via internal orchestrator to keep same collection/user
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT ?? 3001}`;
    const res = await fetch(`${baseUrl}/api/internal/video/process-and-add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.INTERNAL_API_SECRET ?? "",
      },
      body: JSON.stringify({ videoUrl: originalUrl, collectionId, userId, title }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "Reprocess failed", details: errText }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, newVideoId: data.videoId, collectionId });
  } catch (error) {
    return NextResponse.json({ error: "Reprocess error" }, { status: 500 });
  }
}
