import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

interface ListConversationsResponse {
  success: boolean;
  conversations?: Array<{
    id: string;
    title: string | null;
    status: "untitled" | "saved";
    lastMessageAt: string;
    messagesCount: number;
    createdAt: string;
  }>;
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<ListConversationsResponse>> {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<ListConversationsResponse>;
    }

    if (!isAdminInitialized) {
      return NextResponse.json({ success: false, error: "Admin SDK not configured" }, { status: 500 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    // Fetch only saved conversations (not untitled ones)
    const snapshot = await adminDb
      .collection("chat_conversations")
      .where("userId", "==", authResult.user.uid)
      .where("status", "==", "saved")
      .orderBy("lastMessageAt", "desc")
      .limit(50)
      .get();

    const conversations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title ?? "Untitled Chat",
        status: data.status as "untitled" | "saved",
        lastMessageAt: data.lastMessageAt,
        messagesCount: data.messagesCount ?? 0,
        createdAt: data.createdAt,
      };
    });

    return NextResponse.json({ success: true, conversations });
  } catch (error) {
    console.error("❌ [CHAT] List conversations error:", error);
    return NextResponse.json({ success: false, error: "Failed to list conversations" }, { status: 500 });
  }
}
