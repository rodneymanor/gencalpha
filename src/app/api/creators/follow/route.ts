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

    let processedVideos: Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt">[];

    // For Instagram, download videos immediately to prevent URL expiration
    if (detectedPlatform === "instagram") {
      console.log("📥 [FOLLOW_CREATOR] Instagram detected - downloading videos immediately to prevent URL expiration");
      processedVideos = await processInstagramVideosWithImmediateDownload(videosResult.videos!);
    } else {
      processedVideos = await processVideosWithBunnyUpload(videosResult.videos!);
    }

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
 * Parse Instagram DASH manifest to extract lowest quality video URL
 */
function extractLowestQualityFromDashManifest(manifest: string): string | null {
  try {
    console.log("🔍 [DASH_PARSER] Parsing DASH manifest for lowest quality video");

    // Look for the 240p representation with FBQualityLabel="240p"
    const regex240p = /<Representation[^>]*FBQualityLabel="240p"[^>]*>[\s\S]*?<BaseURL[^>]*>(.*?)<\/BaseURL>/i;
    const match240p = manifest.match(regex240p);

    if (match240p && match240p[1]) {
      const videoUrl = match240p[1].trim();
      console.log("✅ [DASH_PARSER] Found 240p video URL from DASH manifest");
      return videoUrl;
    }

    // Fallback: Look for any representation with lowest bandwidth/resolution
    const representationRegex = /<Representation[^>]*bandwidth="(\d+)"[^>]*>[\s\S]*?<BaseURL[^>]*>(.*?)<\/BaseURL>/gi;
    const representations: { bandwidth: number; url: string }[] = [];

    let match;
    while ((match = representationRegex.exec(manifest)) !== null) {
      const bandwidth = parseInt(match[1]);
      const url = match[2].trim();
      if (url && bandwidth) {
        representations.push({ bandwidth, url });
      }
    }

    if (representations.length > 0) {
      // Sort by bandwidth (ascending) to get the lowest quality
      representations.sort((a, b) => a.bandwidth - b.bandwidth);
      const lowestQuality = representations[0];
      console.log(`✅ [DASH_PARSER] Found lowest bandwidth video (${lowestQuality.bandwidth}) from DASH manifest`);
      return lowestQuality.url;
    }

    console.log("⚠️ [DASH_PARSER] No video URLs found in DASH manifest");
    return null;
  } catch (error) {
    console.error("❌ [DASH_PARSER] Error parsing DASH manifest:", error);
    return null;
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

        // Debug: Log the structure of the raw video data
        console.log(`🔍 [FOLLOW_CREATOR] Raw video structure:`, {
          hasMedia: !!rawVideo.media,
          hasVideoDashManifest: !!rawVideo.media?.video_dash_manifest,
          dashManifestLength: rawVideo.media?.video_dash_manifest?.length || 0,
          hasVideoVersions: !!rawVideo.media?.video_versions,
          videoVersionsCount: rawVideo.media?.video_versions?.length || 0,
          firstVideoUrl: rawVideo.media?.video_versions?.[0]?.url,
          hasImageVersions: !!rawVideo.media?.image_versions2,
          thumbnailCandidatesCount: rawVideo.media?.image_versions2?.candidates?.length || 0,
          firstThumbnailUrl: rawVideo.media?.image_versions2?.candidates?.[0]?.url,
          platformId: rawVideo.media?.id || rawVideo.id,
          code: rawVideo.media?.code || rawVideo.code,
        });

        // Extract video metadata first
        let videoData;
        let videoUrl: string;
        let thumbnailUrl: string;

        // Platform-specific data extraction
        if (
          rawVideo.media?.video_dash_manifest ||
          rawVideo.media?.video_versions?.[0]?.url ||
          rawVideo.video_url ||
          rawVideo.media_url
        ) {
          // Instagram format - prioritize DASH manifest for lowest quality, fallback to video_versions
          let dashVideoUrl: string | null = null;

          if (rawVideo.media?.video_dash_manifest) {
            dashVideoUrl = extractLowestQualityFromDashManifest(rawVideo.media.video_dash_manifest);
          }

          videoUrl =
            dashVideoUrl || rawVideo.media?.video_versions?.[0]?.url || rawVideo.video_url || rawVideo.media_url;
          thumbnailUrl = rawVideo.media?.image_versions2?.candidates?.[0]?.url || rawVideo.thumbnail_url || "";

          // Log which video source was used
          if (dashVideoUrl) {
            console.log("🎯 [FOLLOW_CREATOR] Using DASH manifest video URL (lowest quality)");
          } else if (rawVideo.media?.video_versions?.[0]?.url) {
            console.log("🎯 [FOLLOW_CREATOR] Using video_versions[0] URL (fallback)");
          } else {
            console.log("🎯 [FOLLOW_CREATOR] Using legacy video URL properties (fallback)");
          }

          videoData = {
            platform: "instagram" as const,
            platformVideoId: rawVideo.media?.id || rawVideo.id || rawVideo.pk || "",
            originalUrl: `https://www.instagram.com/reel/${rawVideo.media?.code || rawVideo.code}/`,
            title: rawVideo.media?.caption?.text?.substring(0, 100) || "Instagram Reel",
            description: rawVideo.media?.caption?.text || "",
            hashtags: extractHashtags(rawVideo.media?.caption?.text || ""),
            duration: rawVideo.media?.video_duration || rawVideo.video_duration || 0,
            metrics: {
              views: rawVideo.media?.play_count || rawVideo.view_count || rawVideo.play_count || 0,
              likes: rawVideo.media?.like_count || rawVideo.like_count || 0,
              comments: rawVideo.media?.comment_count || rawVideo.comment_count || 0,
              shares: rawVideo.media?.reshare_count || rawVideo.share_count || 0,
              saves: rawVideo.save_count || 0,
            },
            author: {
              username: rawVideo.media?.user?.username || rawVideo.user?.username || rawVideo.owner?.username || "",
              displayName:
                rawVideo.media?.user?.full_name || rawVideo.user?.full_name || rawVideo.owner?.full_name || "",
              isVerified:
                rawVideo.media?.user?.is_verified || rawVideo.user?.is_verified || rawVideo.owner?.is_verified || false,
              followerCount: rawVideo.user?.follower_count || rawVideo.owner?.follower_count || 0,
            },
            publishedAt: rawVideo.media?.taken_at
              ? new Date(rawVideo.media.taken_at * 1000).toISOString()
              : rawVideo.taken_at
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
 * Process Instagram videos with immediate download to prevent URL expiration
 */
async function processInstagramVideosWithImmediateDownload(
  rawVideos: any[],
): Promise<Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt">[]> {
  console.log(`📥 [INSTAGRAM_IMMEDIATE] Starting immediate download for ${rawVideos.length} Instagram videos`);

  const processedVideos: Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt">[] = [];

  // Process videos one by one to prevent URL expiration
  for (let index = 0; index < rawVideos.length; index++) {
    const rawVideo = rawVideos[index];

    try {
      console.log(`📥 [INSTAGRAM_IMMEDIATE] Processing video ${index + 1}/${rawVideos.length}`);

      // Extract video URL immediately
      let videoUrl = "";
      let thumbnailUrl = "";

      // Check for DASH manifest first (lowest quality)
      const dashManifest = rawVideo.media?.video_dash_manifest;
      if (dashManifest) {
        console.log("🔍 [INSTAGRAM_IMMEDIATE] Found DASH manifest, extracting lowest quality");
        const dashVideoUrl = extractLowestQualityFromDashManifest(dashManifest);
        if (dashVideoUrl) {
          videoUrl = dashVideoUrl;
          console.log("✅ [INSTAGRAM_IMMEDIATE] Using DASH manifest URL");
        }
      }

      // Fallback to video_versions
      if (!videoUrl && rawVideo.media?.video_versions?.[0]?.url) {
        videoUrl = rawVideo.media.video_versions[0].url;
        console.log("✅ [INSTAGRAM_IMMEDIATE] Using video_versions[0] URL");
      }

      // Extract thumbnail URL
      if (rawVideo.media?.image_versions2?.candidates?.[0]?.url) {
        thumbnailUrl = rawVideo.media.image_versions2.candidates[0].url;
      }

      if (!videoUrl) {
        console.log(`⚠️ [INSTAGRAM_IMMEDIATE] No video URL found, skipping video ${index + 1}`);
        continue;
      }

      console.log(`🔗 [INSTAGRAM_IMMEDIATE] Video URL extracted: ${videoUrl.substring(0, 100)}...`);

      // IMMEDIATELY download and upload to Bunny.net while URL is fresh
      console.log(`⚡ [INSTAGRAM_IMMEDIATE] Immediate download and upload for video ${index + 1}`);
      const bunnyResult = await streamToBunnyFromUrl(videoUrl);

      // Build video metadata
      const videoData: Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt"> = {
        platform: "instagram" as const,
        platformVideoId: rawVideo.media?.id || rawVideo.id || rawVideo.pk || "",
        originalUrl: `https://www.instagram.com/reel/${rawVideo.media?.code || rawVideo.code}/`,
        title: rawVideo.media?.caption?.text?.substring(0, 100) || "Instagram Reel",
        description: rawVideo.media?.caption?.text || "",
        hashtags: extractHashtags(rawVideo.media?.caption?.text || ""),
        duration: rawVideo.media?.video_duration || rawVideo.video_duration || 0,
        metrics: {
          views: rawVideo.media?.play_count || rawVideo.view_count || rawVideo.play_count || 0,
          likes: rawVideo.media?.like_count || rawVideo.like_count || 0,
          comments: rawVideo.media?.comment_count || rawVideo.comment_count || 0,
          shares: rawVideo.media?.reshare_count || rawVideo.share_count || 0,
          saves: rawVideo.save_count || 0,
        },
        author: {
          username: rawVideo.media?.user?.username || rawVideo.user?.username || rawVideo.owner?.username || "",
          displayName: rawVideo.media?.user?.full_name || rawVideo.user?.full_name || rawVideo.owner?.full_name || "",
          isVerified:
            rawVideo.media?.user?.is_verified || rawVideo.user?.is_verified || rawVideo.owner?.is_verified || false,
          followerCount: rawVideo.user?.follower_count || rawVideo.owner?.follower_count || 0,
        },
        publishedAt: rawVideo.media?.taken_at
          ? new Date(rawVideo.media.taken_at * 1000).toISOString()
          : rawVideo.taken_at
            ? new Date(rawVideo.taken_at * 1000).toISOString()
            : new Date().toISOString(),
      };

      if (bunnyResult) {
        console.log(`✅ [INSTAGRAM_IMMEDIATE] Video ${index + 1} uploaded to Bunny successfully`);

        // Extract GUID for thumbnail upload
        const guidMatch = bunnyResult.iframeUrl.match(/\/embed\/[^\/]+\/([^\/\?]+)/);
        let bunnyVideoGuid: string | undefined;

        if (guidMatch) {
          bunnyVideoGuid = guidMatch[1];

          // Upload custom thumbnail if available
          if (thumbnailUrl) {
            console.log(`🖼️ [INSTAGRAM_IMMEDIATE] Uploading custom thumbnail for video ${index + 1}`);
            const thumbnailSuccess = await uploadBunnyThumbnailWithRetry(bunnyVideoGuid, thumbnailUrl);
            if (thumbnailSuccess) {
              console.log(`✅ [INSTAGRAM_IMMEDIATE] Custom thumbnail uploaded for video ${index + 1}`);
            }
          }
        }

        processedVideos.push({
          ...videoData,
          iframeUrl: bunnyResult.iframeUrl,
          directUrl: bunnyResult.directUrl,
          thumbnailUrl,
          bunnyVideoGuid,
          processedAt: new Date().toISOString(),
        });
      } else {
        console.log(`⚠️ [INSTAGRAM_IMMEDIATE] Bunny upload failed for video ${index + 1}, storing with original URL`);
        processedVideos.push({
          ...videoData,
          thumbnailUrl,
        });
      }

      // Small delay to prevent overwhelming the system
      if (index < rawVideos.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`❌ [INSTAGRAM_IMMEDIATE] Error processing video ${index + 1}:`, error);
      continue;
    }
  }

  console.log(`✅ [INSTAGRAM_IMMEDIATE] Successfully processed ${processedVideos.length}/${rawVideos.length} videos`);
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
