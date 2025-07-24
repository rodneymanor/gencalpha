import { NextRequest, NextResponse } from "next/server";

import { RBACService } from "@/core/auth/rbac";

export async function POST(request: NextRequest) {
  try {
    const { userId, action, resourceType, resourceId } = await request.json();

    if (!userId || !action || !resourceType) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const canPerform = await RBACService.canPerformAction(userId, action, resourceType, resourceId);
    return NextResponse.json({ canPerform });
  } catch (error) {
    console.error("❌ [RBAC API] Error checking permissions:", error);
    return NextResponse.json({ canPerform: false });
  }
}
