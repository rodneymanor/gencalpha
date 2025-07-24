import { NextRequest, NextResponse } from "next/server";

import { RBACService } from "@/core/auth/rbac";

export async function POST(request: NextRequest) {
  try {
    const { userId, collectionId, videoLimit, lastDocId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Note: lastDocId handling would need to be implemented if using pagination
    // For now, we'll ignore it as the original service doesn't support simple string IDs for cursors
    const result = await RBACService.getCollectionVideos(
      userId,
      collectionId,
      videoLimit,
      undefined, // lastDoc cursor not supported via API for now
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ [Videos API] Error getting collection videos:", error);
    return NextResponse.json({ error: "Failed to get videos" }, { status: 500 });
  }
}
