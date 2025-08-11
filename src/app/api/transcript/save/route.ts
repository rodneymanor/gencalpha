import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

interface SaveBody {
  transcript?: string;
  sourceUrl?: string;
  platform?: "TikTok" | "Instagram" | "Unknown";
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.user.uid;

    const { transcript, sourceUrl, platform = "Unknown" }: SaveBody = await request.json();
    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ success: false, error: "Transcript is required" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    if (!isAdminInitialized || adminDb == null) {
      return NextResponse.json({ success: false, error: "Admin SDK not configured" }, { status: 500 });
    }

    const ref = await adminDb.collection("transcripts").add({
      userId,
      sourceUrl: sourceUrl ?? null,
      platform,
      transcript,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, transcriptId: ref.id });
  } catch (error) {
    console.error("❌ [TRANSCRIPT_SAVE] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save transcript" }, { status: 500 });
  }
}
