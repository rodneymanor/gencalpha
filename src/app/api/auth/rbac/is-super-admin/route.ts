import { NextRequest, NextResponse } from "next/server";

import { RBACService } from "@/core/auth/rbac";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const isSuperAdmin = await RBACService.isSuperAdmin(userId);
    return NextResponse.json({ isSuperAdmin });
  } catch (error) {
    console.error("❌ [RBAC API] Error checking super admin status:", error);
    return NextResponse.json({ isSuperAdmin: false });
  }
}
