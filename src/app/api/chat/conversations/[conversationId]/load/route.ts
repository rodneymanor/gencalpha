import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

interface LoadConversationResponse {
  success: boolean;
  conversation?: {
    id: string;
    title: string | null;
    status: "untitled" | "saved";
    persona: string | null;
    messages: Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      createdAt: string;
    }>;
  };
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
): Promise<NextResponse<LoadConversationResponse>> {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<LoadConversationResponse>;
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

    // Fetch conversation
    const convDoc = await adminDb.collection("chat_conversations").doc(conversationId).get();
    if (!convDoc.exists) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    const convData = convDoc.data();
    if (convData?.userId !== authResult.user.uid) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // Fetch messages
    const messagesSnapshot = await adminDb
      .collection("chat_conversations")
      .doc(conversationId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role as "user" | "assistant",
        content: data.content,
        createdAt: data.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversationId,
        title: convData.title,
        status: convData.status as "untitled" | "saved",
        persona: convData.persona,
        messages,
      },
    });
  } catch (error) {
    console.error("❌ [CHAT] Load conversation error:", error);
    return NextResponse.json({ success: false, error: "Failed to load conversation" }, { status: 500 });
  }
}
