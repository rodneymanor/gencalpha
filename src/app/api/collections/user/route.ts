import { NextRequest, NextResponse } from "next/server";

import { RBACService } from "@/core/auth/rbac";
import { isAdminInitialized } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    // Safely parse body to avoid 'Unexpected end of JSON input' on aborted requests
    const raw = await request.text();
    const { userId } = raw ? JSON.parse(raw) : {};
    console.log("🔍 [Collections API] Request for user:", userId);

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if Firebase Admin is initialized
    console.log("🔍 [Collections API] Firebase Admin initialized:", isAdminInitialized);
    if (!isAdminInitialized) {
      console.warn("⚠️ [Collections API] Firebase Admin not initialized - returning empty collections");
      return NextResponse.json({
        collections: [],
        accessibleCoaches: [],
      });
    }

    console.log("🔍 [Collections API] Calling RBACService.getUserCollections");
    const result = await RBACService.getUserCollections(userId);
    console.log("🔍 [Collections API] Result:", result.collections.length, "collections");
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
