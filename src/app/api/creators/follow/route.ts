/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { CreatorService } from "@/lib/creator-service";

// Orchestrator dependencies
import { fetchCreatorVideos } from "./fetch-videos";
import { fetchInstagramUserId } from "./instagram";
import { detectPlatformFromUsername } from "./platform-detection";
import { processVideosWithBunnyUpload, processInstagramVideosWithImmediateDownload } from "./process-videos";
import type { FollowCreatorRequest, FollowCreatorResponse } from "./types";

// Types are defined in ./types

/**
 * Follow Creator Orchestration Route
 *
 * This route coordinates the entire workflow:
 * 1. Input validation and platform detection
 * 2. Platform-specific user resolution (Instagram ID conversion)
 * 3. Fetch latest content (10 videos)
 * 4. Extract video information using unified scraper
 * 5. Upload to Bunny.net CDN
 * 6. Store in database
 * 7. Create follow relationship
 */
export async function POST(request: NextRequest) {
  console.log("🎭 [FOLLOW_CREATOR] Starting follow creator workflow");

  try {
    // Step 1: Authentication and input validation
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      // Authentication failed, return the error response
      return authResult;
    }

    const body: FollowCreatorRequest = await request.json();
    const { username, platform, userId } = body;

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: "Username is required",
        } satisfies FollowCreatorResponse,
        { status: 400 },
      );
    }

    const finalUserId = userId ?? authResult.user.uid;
    if (!finalUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        } satisfies FollowCreatorResponse,
        { status: 400 },
      );
    }

    console.log(`🔍 [FOLLOW_CREATOR] Processing request for @${username} (platform: ${platform ?? "auto-detect"})`);

    // Step 2: Platform detection and user resolution
    const detectedPlatform = platform ?? detectPlatformFromUsername(username);
    let platformUserId: string;
    let creatorMetadata: any = {};

    if (detectedPlatform === "instagram") {
      console.log("📸 [FOLLOW_CREATOR] Processing Instagram creator");

      // Convert username to Instagram user ID
      const userIdResult = await fetchInstagramUserId(username);
      if (!userIdResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to resolve Instagram user",
            details: userIdResult.error,
          } satisfies FollowCreatorResponse,
          { status: 400 },
        );
      }

      platformUserId = userIdResult.userId!;
      creatorMetadata = userIdResult.metadata ?? {};
    } else {
      console.log("🎵 [FOLLOW_CREATOR] Processing TikTok creator");
      platformUserId = username; // TikTok uses username directly
    }

    // Step 3: Fetch latest content
    console.log("🎬 [FOLLOW_CREATOR] Fetching latest videos");
    const videosResult = await fetchCreatorVideos(detectedPlatform, platformUserId, username);

    if (!videosResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch creator videos",
          details: videosResult.error,
        } satisfies FollowCreatorResponse,
        { status: 500 },
      );
    }

    // Step 4: Process videos - extract metadata and upload to Bunny.net
    console.log(`📹 [FOLLOW_CREATOR] Processing ${videosResult.videos!.length} videos`);

    // For Instagram, download videos immediately to prevent URL expiration
    const processedVideos =
      detectedPlatform === "instagram"
        ? await processInstagramVideosWithImmediateDownload(videosResult.videos!)
        : await processVideosWithBunnyUpload(videosResult.videos!);

    // Step 5: Create or update creator profile
    console.log("👤 [FOLLOW_CREATOR] Creating/updating creator profile");
    const creatorId = await CreatorService.createOrUpdateCreator(detectedPlatform, username, platformUserId, {
      displayName: creatorMetadata.displayName,
      followerCount: creatorMetadata.followerCount,
      isVerified: creatorMetadata.isVerified,
      profilePictureUrl: creatorMetadata.profilePictureUrl,
      bio: creatorMetadata.bio,
      videoCount: processedVideos.length,
    });

    // Step 6: Store videos in database
    console.log("💾 [FOLLOW_CREATOR] Storing videos in database");
    const storedVideos = await CreatorService.storeCreatorVideos(creatorId, processedVideos);

    // Step 7: Create follow relationship
    console.log("👥 [FOLLOW_CREATOR] Creating follow relationship");
    const followId = await CreatorService.followCreator(finalUserId, creatorId, detectedPlatform);

    // Step 8: Get creator profile for response
    const creatorProfile = await CreatorService.getCreatorByPlatformId(detectedPlatform, platformUserId);

    console.log("✅ [FOLLOW_CREATOR] Workflow completed successfully");

    return NextResponse.json({
      success: true,
      creator: {
        id: creatorId,
        username: creatorProfile?.username || username,
        platform: detectedPlatform,
        displayName: creatorProfile?.displayName,
        followerCount: creatorProfile?.followerCount,
      },
      videos: storedVideos.map((video) => ({
        id: video.id!,
        thumbnailUrl: video.thumbnailUrl,
        videoUrl: video.iframeUrl || video.directUrl || video.originalUrl,
        title: video.title,
        metrics: video.metrics,
      })),
      followId,
    } satisfies FollowCreatorResponse);
  } catch (error) {
    console.error("❌ [FOLLOW_CREATOR] Workflow failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      } satisfies FollowCreatorResponse,
      { status: 500 },
    );
  }
}

/**
 * GET method for testing
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const platform = searchParams.get("platform") as "instagram" | "tiktok" | null;

  if (!username) {
    return NextResponse.json(
      {
        success: false,
        error: "Username parameter is required",
      } satisfies FollowCreatorResponse,
      { status: 400 },
    );
  }

  // Forward to POST handler
  const mockRequest = new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify({ username, platform }),
  });

  return POST(mockRequest as NextRequest);
}
