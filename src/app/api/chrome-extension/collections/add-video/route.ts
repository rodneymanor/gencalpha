import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { buildInternalUrl } from "@/lib/utils/url";

interface AddVideoBody {
  videoUrl: string;
  collectionTitle: string;
  title?: string;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.user.uid;

    const { videoUrl, collectionTitle, title }: AddVideoBody = await request.json();

    if (!videoUrl || !collectionTitle) {
      return NextResponse.json({ success: false, error: "videoUrl and collectionTitle are required" }, { status: 400 });
    }

    if (!isAdminInitialized) {
      return NextResponse.json({ success: false, error: "Firebase Admin not configured" }, { status: 500 });
    }
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Admin DB not available" }, { status: 500 });
    }

    // Find or create collection by title for this user
    const snapshot = await adminDb
      .collection("collections")
      .where("userId", "==", userId)
      .where("title", "==", collectionTitle.trim())
      .limit(1)
      .get();

    let collectionId: string;
    if (!snapshot.empty) {
      collectionId = snapshot.docs[0].id;
    } else {
      const now = new Date();
      const docRef = await adminDb.collection("collections").add({
        title: collectionTitle.trim(),
        description: "",
        userId,
        videoCount: 0,
        createdAt: now,
        updatedAt: now,
      });
      collectionId = docRef.id;
    }

    // Forward to core add-video workflow
    const headers: HeadersInit = { "content-type": "application/json" };
    const apiKey = request.headers.get("x-api-key");
    const authHeader = request.headers.get("authorization");
    if (apiKey) headers["x-api-key"] = apiKey;
    if (authHeader) headers["authorization"] = authHeader;

    const res = await fetch(buildInternalUrl("/api/add-video-to-collection"), {
      method: "POST",
      headers,
      body: JSON.stringify({ videoUrl, collectionId, title }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("❌ [Chrome Add Video to Collection] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to add video to collection" }, { status: 500 });
  }
}
