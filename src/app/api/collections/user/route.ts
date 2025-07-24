import { NextRequest, NextResponse } from "next/server";

import { RBACService } from "@/core/auth/rbac";
import { isAdminInitialized } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if Firebase Admin is initialized
    if (!isAdminInitialized) {
      console.warn("⚠️ [Collections API] Firebase Admin not initialized - returning empty collections");
      return NextResponse.json({
        collections: [],
        accessibleCoaches: [],
      });
    }

    const result = await RBACService.getUserCollections(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ [Collections API] Error getting user collections:", error);
    // Return empty collections instead of error to prevent UI breaking
    return NextResponse.json({
      collections: [],
      accessibleCoaches: [],
    });
  }
}
