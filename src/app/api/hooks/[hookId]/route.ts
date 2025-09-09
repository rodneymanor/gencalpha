import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ hookId: string }> }) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;

    const { hookId } = await params;
    if (!hookId) {
      return NextResponse.json({ success: false, error: "hookId required" }, { status: 400 });
    }

    if (!isAdminInitialized) {
      return NextResponse.json({ success: false, error: "Admin SDK not configured" }, { status: 500 });
    }
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const ref = adminDb.collection("hook_generations").doc(hookId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ success: true });
    const data = snap.data() as { userId?: string } | undefined;
    if (!data || data.userId !== authResult.user.uid) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [HOOKS] Delete hook generation error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete hook generation" }, { status: 500 });
  }
}
