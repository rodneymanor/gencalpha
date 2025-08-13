import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

interface CreateConversationBody {
  persona?: string | null;
  initialPrompt?: string | null;
}

interface CreateConversationResponse {
  success: boolean;
  conversationId?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateConversationResponse>> {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<CreateConversationResponse>;
    }

    if (!isAdminInitialized) {
      return NextResponse.json({ success: false, error: "Admin SDK not configured" }, { status: 500 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const body: CreateConversationBody = await request.json();
    const now = new Date().toISOString();

    const docRef = await adminDb.collection("chat_conversations").add({
      userId: authResult.user.uid,
      persona: body.persona ?? null,
      initialPrompt: body.initialPrompt ?? null,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      messagesCount: 0,
    });

    return NextResponse.json({ success: true, conversationId: docRef.id });
  } catch (error) {
    console.error("❌ [CHAT] Create conversation error:", error);
    return NextResponse.json({ success: false, error: "Failed to create conversation" }, { status: 500 });
  }
}
