import { NextRequest, NextResponse } from "next/server";

import { authenticateWithFirebaseToken } from "@/lib/firebase-auth-helpers";
import { UserProfileService } from "@/lib/user-profile-service";

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
  }

  const token = authHeader.substring(7);
  
  try {
    return await authenticateWithFirebaseToken(token);
  } catch (error) {
    console.error("❌ [Keywords API] Firebase auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Error response
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";

    if (!query.trim()) {
      return NextResponse.json({ keywords: [] });
    }

    const keywords = await UserProfileService.searchKeywords(query);
    return NextResponse.json({ keywords });
  } catch (error) {
    console.error("❌ [API] Error searching keywords:", error);
    return NextResponse.json(
      { error: "Failed to search keywords" },
      { status: 500 }
    );
  }
}