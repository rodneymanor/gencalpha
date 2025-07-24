import { NextRequest, NextResponse } from "next/server";

import { RBACService } from "@/core/auth/rbac";
import { isAdminInitialized } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { userId, collectionId, videoLimit, lastDocId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if Firebase Admin is initialized
    if (!isAdminInitialized) {
      console.warn("⚠️ [Videos API] Firebase Admin not initialized - returning empty videos");
      return NextResponse.json({
        videos: [],
        totalCount: 0,
      });
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
    // Return empty videos instead of error to prevent UI breaking
    return NextResponse.json({
      videos: [],
      totalCount: 0,
    });
  }
}
