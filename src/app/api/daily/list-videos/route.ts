import { NextRequest, NextResponse } from "next/server";

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    if (!isAdminInitialized) {
      return NextResponse.json({ success: false, error: "Firebase not initialised" }, { status: 500 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Admin DB unavailable" }, { status: 500 });
    }

    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 30;

    // Fetch latest videos ordered by createdAt descending
    const snapshot = await adminDb
      .collection("dailyVideos")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const videos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, videos });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[daily-list-videos]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
