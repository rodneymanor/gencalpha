import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;

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

    // Verify ownership
    const convRef = adminDb.collection("chat_conversations").doc(conversationId);
    const convSnap = await convRef.get();
    if (!convSnap.exists) {
      return NextResponse.json({ success: true }); // Already gone
    }
    const data = convSnap.data() as { userId?: string } | undefined;
    if (!data || data.userId !== authResult.user.uid) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Delete subcollection messages in batches
    // Delete messages in batches of 500
    const messagesRef = convRef.collection("messages");

    while (true) {
      const snap = await messagesRef.limit(500).get();
      if (snap.empty) break;
      const batch = adminDb.batch();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    // Delete the conversation document
    await convRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [CHAT] Delete conversation error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete conversation" }, { status: 500 });
  }
}
