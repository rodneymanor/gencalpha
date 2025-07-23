import { NextRequest, NextResponse } from "next/server";

import { DocumentSnapshot } from "firebase/firestore";

import { authenticateApiKey, authenticateFirebaseRequest } from "@/core/auth";
import { RBACService } from "@/lib/rbac-service";

async function authenticateUser(request: NextRequest) {
  try {
    const firebaseUser = await authenticateFirebaseRequest(request);
    if (firebaseUser instanceof NextResponse) {
      return await authenticateApiKey(request);
    }
    return {
      success: true,
      user: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: firebaseUser.customClaims?.role ?? "creator",
      },
    };
  } catch {
    return await authenticateApiKey(request);
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = authResult.user.uid;
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collectionId");
    const limit = parseInt(searchParams.get("limit") ?? "24");
    const lastDocId = searchParams.get("lastDocId");

    console.log("📚 [Collection Videos API] GET request received for user:", userId, "collection:", collectionId);

    // Get videos using RBAC service
    const result = await RBACService.getCollectionVideos(
      userId,
      collectionId ?? undefined,
      limit,
      lastDocId ? ({ id: lastDocId } as DocumentSnapshot) : undefined,
    );

    console.log("✅ [Collection Videos API] Successfully fetched", result.videos.length, "videos");

    return NextResponse.json({
      success: true,
      user: {
        id: authResult.user.uid,
        email: authResult.user.email,
        displayName: authResult.user.displayName,
        role: authResult.user.role,
      },
      videos: result.videos,
      lastDoc: result.lastDoc ? { id: result.lastDoc.id } : null,
      totalCount: result.totalCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [Collection Videos API] Error fetching videos:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
