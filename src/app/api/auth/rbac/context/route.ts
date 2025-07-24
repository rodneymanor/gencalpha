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
      console.warn("⚠️ [RBAC API] Firebase Admin not initialized - returning default creator context");
      return NextResponse.json({
        userId,
        role: "creator",
        accessibleCoaches: [],
        isSuperAdmin: false,
      });
    }

    const context = await RBACService.getRBACContext(userId);
    return NextResponse.json(context);
  } catch (error) {
    console.error("❌ [RBAC API] Error getting RBAC context:", error);
    // Return default creator context to prevent UI breaking
    return NextResponse.json({
      userId,
      role: "creator",
      accessibleCoaches: [],
      isSuperAdmin: false,
    });
  }
}
