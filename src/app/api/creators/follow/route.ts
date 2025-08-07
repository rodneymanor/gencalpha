/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-useless-escape */
import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { streamToBunnyFromUrl, uploadBunnyThumbnailWithRetry } from "@/lib/bunny-stream";
import { CreatorService, type CreatorVideo } from "@/lib/creator-service";

interface FollowCreatorRequest {
  username: string;
  platform?: "instagram" | "tiktok"; // Optional - will be auto-detected if not provided
  userId?: string; // Optional - will be extracted from auth if not provided
}

interface FollowCreatorResponse {
  success: boolean;
  creator?: {
    id: string;
    username: string;
    platform: "instagram" | "tiktok";
    displayName?: string;
    followerCount?: number;
  };
  videos?: Array<{
    id: string;
    thumbnailUrl: string;
    videoUrl: string;
    title: string;
    metrics: {
      views: number;
      likes: number;
      comments: number;
      shares: number;
    };
  }>;
  followId?: string;
  error?: string;
  details?: string;
}

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
    const processedVideos = await processVideosWithBunnyUpload(videosResult.videos!);

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
 * Detect platform from username patterns
 */
function detectPlatformFromUsername(username: string): "instagram" | "tiktok" {
  const cleanUsername = username.replace("@", "").toLowerCase();

  // Simple heuristics - can be improved
  if (cleanUsername.includes("insta") || cleanUsername.includes("ig")) {
    return "instagram";
  }

  if (cleanUsername.includes("tiktok") || cleanUsername.includes("tt")) {
    return "tiktok";
  }

  // Default to Instagram for now
  return "instagram";
}

/**
 * Fetch Instagram user ID from username
 */
async function fetchInstagramUserId(username: string): Promise<{
  success: boolean;
  userId?: string;
  metadata?: any;
  error?: string;
}> {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/instagram/user-id?username=${encodeURIComponent(username)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      userId: data.user_id,
      metadata: {
        displayName: data.username,
      },
    };
  } catch (error) {
    console.error("❌ [FOLLOW_CREATOR] Instagram user ID fetch failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetch creator videos from platform APIs
 */
async function fetchCreatorVideos(
  platform: "instagram" | "tiktok",
  platformUserId: string,
  username: string,
): Promise<{
  success: boolean;
  videos?: any[];
  error?: string;
}> {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

    if (platform === "instagram") {
      const response = await fetch(
        `${baseUrl}/api/instagram/user-reels?user_id=${encodeURIComponent(platformUserId)}&include_feed_video=true`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      // Extract videos from Instagram API response
      const videos = data.data?.items?.slice(0, 10) || [];
      return {
        success: true,
        videos,
      };
    } else {
      // TikTok
      const response = await fetch(`${baseUrl}/api/tiktok/user-feed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          count: 10,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        videos: data.videos || [],
      };
    }
  } catch (error) {
    console.error(`❌ [FOLLOW_CREATOR] ${platform} videos fetch failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Process videos with Bunny.net upload
 */

async function processVideosWithBunnyUpload(
  rawVideos: any[],
): Promise<Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt">[]> {
  const processedVideos: Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt">[] = [];

  console.log(`🔄 [FOLLOW_CREATOR] Processing ${rawVideos.length} videos for Bunny upload`);

  // Process videos in parallel with concurrency limit
  const concurrencyLimit = 3;
  const chunks = [];

  for (let i = 0; i < rawVideos.length; i += concurrencyLimit) {
    chunks.push(rawVideos.slice(i, i + concurrencyLimit));
  }

  for (const chunk of chunks) {
    const chunkPromises = chunk.map(async (rawVideo, index) => {
      try {
        console.log(`📹 [FOLLOW_CREATOR] Processing video ${index + 1}/${rawVideos.length}`);

        // Extract video metadata first
        let videoData;
        let videoUrl: string;
        let thumbnailUrl: string;

        // Platform-specific data extraction
        if (rawVideo.video_url || rawVideo.media_url) {
          // Instagram format
          videoUrl = rawVideo.video_url || rawVideo.media_url;
          thumbnailUrl = rawVideo.thumbnail_url || rawVideo.image_versions2?.candidates?.[0]?.url || "";

          videoData = {
            platform: "instagram" as const,
            platformVideoId: rawVideo.id || rawVideo.pk || "",
            originalUrl: `https://www.instagram.com/p/${rawVideo.code || rawVideo.id}/`,
            title: rawVideo.caption?.text?.substring(0, 100) || "Instagram Reel",
            description: rawVideo.caption?.text || "",
            hashtags: extractHashtags(rawVideo.caption?.text || ""),
            duration: rawVideo.video_duration || 0,
            metrics: {
              views: rawVideo.view_count || rawVideo.play_count || 0,
              likes: rawVideo.like_count || 0,
              comments: rawVideo.comment_count || 0,
              shares: rawVideo.share_count || 0,
              saves: rawVideo.save_count || 0,
            },
            author: {
              username: rawVideo.user?.username || rawVideo.owner?.username || "",
              displayName: rawVideo.user?.full_name || rawVideo.owner?.full_name || "",
              isVerified: rawVideo.user?.is_verified || rawVideo.owner?.is_verified || false,
              followerCount: rawVideo.user?.follower_count || rawVideo.owner?.follower_count || 0,
            },
            publishedAt: rawVideo.taken_at
              ? new Date(rawVideo.taken_at * 1000).toISOString()
              : new Date().toISOString(),
          };
        } else {
          // TikTok format
          videoUrl = rawVideo.video?.playAddr || rawVideo.video?.downloadAddr || "";
          thumbnailUrl = rawVideo.video?.cover || rawVideo.video?.dynamicCover || "";

          videoData = {
            platform: "tiktok" as const,
            platformVideoId: rawVideo.id || rawVideo.aweme_id || "",
            originalUrl: `https://www.tiktok.com/@${rawVideo.author?.username}/video/${rawVideo.id}`,
            title: rawVideo.desc || rawVideo.description || "TikTok Video",
            description: rawVideo.desc || rawVideo.description || "",
            hashtags: rawVideo.textExtra?.map((tag: any) => tag.hashtagName).filter(Boolean) || [],
            duration: rawVideo.video?.duration || 0,
            metrics: {
              views: rawVideo.stats?.playCount || 0,
              likes: rawVideo.stats?.diggCount || 0,
              comments: rawVideo.stats?.commentCount || 0,
              shares: rawVideo.stats?.shareCount || 0,
            },
            author: {
              username: rawVideo.author?.username || rawVideo.author?.uniqueId || "",
              displayName: rawVideo.author?.nickname || "",
              isVerified: rawVideo.author?.verified || false,
              followerCount: rawVideo.author?.stats?.followerCount || 0,
            },
            publishedAt: rawVideo.createTime
              ? new Date(rawVideo.createTime * 1000).toISOString()
              : new Date().toISOString(),
          };
        }

        // Skip if no video URL
        if (!videoUrl) {
          console.log(`⚠️ [FOLLOW_CREATOR] Skipping video - no video URL found`);
          return null;
        }

        // Upload to Bunny.net
        console.log(`🐰 [FOLLOW_CREATOR] Uploading video to Bunny.net`);
        const bunnyResult = await streamToBunnyFromUrl(
          videoUrl,
          `${videoData.platform}_${videoData.platformVideoId}_${Date.now()}.mp4`,
        );

        const finalThumbnailUrl = thumbnailUrl;
        let bunnyVideoGuid: string | undefined;

        if (bunnyResult) {
          console.log(`✅ [FOLLOW_CREATOR] Video uploaded to Bunny successfully`);

          // Extract GUID from iframe URL for thumbnail upload
          const guidMatch = bunnyResult.iframeUrl.match(/\/embed\/[^\/]+\/([^\/\?]+)/);
          if (guidMatch) {
            bunnyVideoGuid = guidMatch[1];

            // Upload custom thumbnail if available
            if (thumbnailUrl) {
              console.log(`🖼️ [FOLLOW_CREATOR] Uploading custom thumbnail`);
              const thumbnailSuccess = await uploadBunnyThumbnailWithRetry(bunnyVideoGuid, thumbnailUrl);
              if (thumbnailSuccess) {
                console.log(`✅ [FOLLOW_CREATOR] Custom thumbnail uploaded`);
              }
            }
          }

          return {
            ...videoData,
            iframeUrl: bunnyResult.iframeUrl,
            directUrl: bunnyResult.directUrl,
            thumbnailUrl: finalThumbnailUrl,
            bunnyVideoGuid,
            processedAt: new Date().toISOString(),
          };
        } else {
          console.log(`⚠️ [FOLLOW_CREATOR] Bunny upload failed, storing with original URL`);
          return {
            ...videoData,
            thumbnailUrl: finalThumbnailUrl,
          };
        }
      } catch (error) {
        console.error(`❌ [FOLLOW_CREATOR] Error processing video:`, error);
        return null;
      }
    });

    const chunkResults = await Promise.allSettled(chunkPromises);

    chunkResults.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        processedVideos.push(result.value);
      }
    });
  }

  console.log(`✅ [FOLLOW_CREATOR] Successfully processed ${processedVideos.length}/${rawVideos.length} videos`);
  return processedVideos;
}

/**
 * Extract hashtags from text
 */
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map((tag) => tag.substring(1)) : [];
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
