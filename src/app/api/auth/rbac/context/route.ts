import { NextRequest, NextResponse } from "next/server";

import { RBACService } from "@/core/auth/rbac";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const context = await RBACService.getRBACContext(userId);
    return NextResponse.json(context);
  } catch (error) {
    console.error("❌ [RBAC API] Error getting RBAC context:", error);
    return NextResponse.json({ error: "Failed to get RBAC context" }, { status: 500 });
  }
}
