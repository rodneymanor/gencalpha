import { NextRequest, NextResponse } from "next/server";

import { FieldValue } from "firebase-admin/firestore";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

type Role = "user" | "assistant" | "system";

interface SaveMessageBody {
  role: Role;
  content: string;
  metadata?: Record<string, unknown>;
}

interface SaveMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
): Promise<NextResponse<SaveMessageResponse>> {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<SaveMessageResponse>;
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

    const body: SaveMessageBody = await request.json();
    if (!body?.role || !body?.content?.trim()) {
      return NextResponse.json({ success: false, error: "role and content required" }, { status: 400 });
    }

    const now = new Date().toISOString();

    const messageRef = await adminDb
      .collection("chat_conversations")
      .doc(conversationId)
      .collection("messages")
      .add({
        role: body.role,
        content: body.content,
        metadata: body.metadata ?? {},
        createdAt: now,
        userId: authResult.user.uid,
      });

    // Update conversation aggregates
    const convRef = adminDb.collection("chat_conversations").doc(conversationId);
    await convRef.update({ updatedAt: now, lastMessageAt: now, messagesCount: FieldValue.increment(1) });

    return NextResponse.json({ success: true, messageId: messageRef.id });
  } catch (error) {
    console.error("❌ [CHAT] Save message error:", error);
    return NextResponse.json({ success: false, error: "Failed to save message" }, { status: 500 });
  }
}
