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
    console.error("❌ [Profile API] Firebase auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Error response
    }

    const profile = await UserProfileService.getUserProfile(authResult.uid);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("❌ [API] Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Error response
    }

    const body = await request.json();
    const { keywords, personalDescription, mainTopics } = body;

    // Validate required fields
    if (!keywords || !Array.isArray(keywords) || keywords.length < 3) {
      return NextResponse.json({ error: "At least 3 keywords are required" }, { status: 400 });
    }

    if (keywords.length > 10) {
      return NextResponse.json({ error: "Maximum 10 keywords allowed" }, { status: 400 });
    }

    await UserProfileService.updateUserProfile(authResult.uid, {
      keywords,
      personalDescription: personalDescription ?? "",
      mainTopics: mainTopics ?? "",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [API] Error updating user profile:", error);
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 });
  }
}
