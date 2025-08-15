import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { CreatorService } from "@/lib/creator-service";

export async function POST(request: NextRequest) {
  try {
    console.log("🎬 Creator videos API route called");

    // Authenticate the request
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      // Authentication failed, return the error response
      return authResult;
    }

    const { creatorId } = await request.json();

    if (!creatorId) {
      return NextResponse.json({ error: "Creator ID is required" }, { status: 400 });
    }

    console.log(`📹 Fetching videos for creator: ${creatorId}`);

    // Get creator videos using the server-side CreatorService
    const videos = await CreatorService.getCreatorVideos(creatorId, 50);

    console.log(`✅ Found ${videos.length} videos for creator ${creatorId}`);

    return NextResponse.json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error("❌ Error fetching creator videos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch creator videos",
      },
      { status: 500 },
    );
  }
}
