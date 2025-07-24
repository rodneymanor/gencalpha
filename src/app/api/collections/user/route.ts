import { NextRequest, NextResponse } from "next/server";

import { RBACService } from "@/core/auth/rbac";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const result = await RBACService.getUserCollections(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ [Collections API] Error getting user collections:", error);
    return NextResponse.json({ error: "Failed to get collections" }, { status: 500 });
  }
}
