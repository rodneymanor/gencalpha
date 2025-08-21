import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

interface UpdateTitleBody {
  title: string;
}

interface UpdateTitleResponse {
  success: boolean;
  error?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
): Promise<NextResponse<UpdateTitleResponse>> {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<UpdateTitleResponse>;
    }

    const { conversationId } = await params;
    if (!conversationId) {
      return NextResponse.json({ success: false, error: "conversationId required" }, { status: 400 });
    }

    if (!isAdminInitialized) {
      return NextResponse.json({ success: false, error: "Admin SDK not configured" }, { status: 500 });
    }
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const body: UpdateTitleBody = await request.json();
    if (!body?.title?.trim()) {
      return NextResponse.json({ success: false, error: "title required" }, { status: 400 });
    }

    // Check if conversation exists and belongs to user
    const convDoc = await adminDb.collection("chat_conversations").doc(conversationId).get();
    if (!convDoc.exists) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    const convData = convDoc.data();
    if (convData?.userId !== authResult.user.uid) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // Truncate title if too long
    let cleanTitle = body.title.trim();
    if (cleanTitle.length > 60) {
      cleanTitle = cleanTitle.substring(0, 57) + "...";
    }

    // Update title
    const now = new Date().toISOString();
    await adminDb.collection("chat_conversations").doc(conversationId).update({
      title: cleanTitle,
      updatedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [CHAT] Update title error:", error);
    return NextResponse.json({ success: false, error: "Failed to update title" }, { status: 500 });
  }
}
