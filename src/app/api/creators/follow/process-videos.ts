// Video processing helpers
// - Responsible for transforming raw platform payloads into normalized video objects
// - Handles Bunny CDN uploads and thumbnail handling

import { streamToBunnyFromUrl, uploadBunnyThumbnailWithRetry } from "@/lib/bunny-stream";
import { type CreatorVideo } from "@/lib/creator-service";

import { extractLowestQualityFromDashManifest } from "./dash-parser";
import { extractHashtags } from "./hashtags";

export async function processVideosWithBunnyUpload(
  rawVideos: any[],
): Promise<Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt">[]> {
  const processedVideos: Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt">[] = [];

  console.log(`🔄 [FOLLOW_CREATOR] Processing ${rawVideos.length} videos for Bunny upload`);

  const concurrencyLimit = 3;
  const chunks: any[][] = [];
  for (let i = 0; i < rawVideos.length; i += concurrencyLimit) {
    chunks.push(rawVideos.slice(i, i + concurrencyLimit));
  }

  for (const chunk of chunks) {
    const chunkPromises = chunk.map(async (rawVideo, index) => {
      try {
        console.log(`📹 [FOLLOW_CREATOR] Processing video ${index + 1}/${rawVideos.length}`);

        console.log(`🔍 [FOLLOW_CREATOR] Raw video structure:`, {
          hasMedia: !!rawVideo.media,
          hasVideoDashManifest: !!rawVideo.media?.video_dash_manifest,
          dashManifestLength: rawVideo.media?.video_dash_manifest?.length ?? 0,
          hasVideoVersions: !!rawVideo.media?.video_versions,
          videoVersionsCount: rawVideo.media?.video_versions?.length ?? 0,
          firstVideoUrl: rawVideo.media?.video_versions?.[0]?.url,
          hasImageVersions: !!rawVideo.media?.image_versions2,
          thumbnailCandidatesCount: rawVideo.media?.image_versions2?.candidates?.length ?? 0,
          firstThumbnailUrl: rawVideo.media?.image_versions2?.candidates?.[0]?.url,
          platformId: rawVideo.media?.id ?? rawVideo.id,
          code: rawVideo.media?.code ?? rawVideo.code,
        });

        let videoData: any;
        let videoUrl: string;
        let thumbnailUrl: string;

        if (
          rawVideo.media?.video_dash_manifest ||
          rawVideo.media?.video_versions?.[0]?.url ||
          rawVideo.video_url ||
          rawVideo.media_url
        ) {
          let dashVideoUrl: string | null = null;
          if (rawVideo.media?.video_dash_manifest) {
            dashVideoUrl = extractLowestQualityFromDashManifest(rawVideo.media.video_dash_manifest);
          }

          videoUrl =
            dashVideoUrl ?? rawVideo.media?.video_versions?.[0]?.url ?? rawVideo.video_url ?? rawVideo.media_url ?? "";
          thumbnailUrl = rawVideo.media?.image_versions2?.candidates?.[0]?.url ?? rawVideo.thumbnail_url ?? "";

          if (dashVideoUrl) {
            console.log("🎯 [FOLLOW_CREATOR] Using DASH manifest video URL (lowest quality)");
          } else if (rawVideo.media?.video_versions?.[0]?.url) {
            console.log("🎯 [FOLLOW_CREATOR] Using video_versions[0] URL (fallback)");
          } else {
            console.log("🎯 [FOLLOW_CREATOR] Using legacy video URL properties (fallback)");
          }

          videoData = {
            platform: "instagram" as const,
            platformVideoId: rawVideo.media?.id ?? rawVideo.id ?? rawVideo.pk ?? "",
            originalUrl: `https://www.instagram.com/reel/${rawVideo.media?.code ?? rawVideo.code}/`,
            title: rawVideo.media?.caption?.text?.substring(0, 100) ?? "Instagram Reel",
            description: rawVideo.media?.caption?.text ?? "",
            hashtags: extractHashtags(rawVideo.media?.caption?.text ?? ""),
            duration: rawVideo.media?.video_duration ?? rawVideo.video_duration ?? 0,
            metrics: {
              views: rawVideo.media?.play_count ?? rawVideo.view_count ?? rawVideo.play_count ?? 0,
              likes: rawVideo.media?.like_count ?? rawVideo.like_count ?? 0,
              comments: rawVideo.media?.comment_count ?? rawVideo.comment_count ?? 0,
              shares: rawVideo.media?.reshare_count ?? rawVideo.share_count ?? 0,
              saves: rawVideo.save_count ?? 0,
            },
            author: {
              username: rawVideo.media?.user?.username ?? rawVideo.user?.username ?? rawVideo.owner?.username ?? "",
              displayName:
                rawVideo.media?.user?.full_name ?? rawVideo.user?.full_name ?? rawVideo.owner?.full_name ?? "",
              isVerified:
                rawVideo.media?.user?.is_verified ?? rawVideo.user?.is_verified ?? rawVideo.owner?.is_verified ?? false,
              followerCount: rawVideo.user?.follower_count ?? rawVideo.owner?.follower_count ?? 0,
            },
            publishedAt: rawVideo.media?.taken_at
              ? new Date(rawVideo.media.taken_at * 1000).toISOString()
              : rawVideo.taken_at
                ? new Date(rawVideo.taken_at * 1000).toISOString()
                : new Date().toISOString(),
          };
        } else {
          videoUrl = rawVideo.video?.playAddr ?? rawVideo.video?.downloadAddr ?? "";
          thumbnailUrl = rawVideo.video?.cover ?? rawVideo.video?.dynamicCover ?? "";

          videoData = {
            platform: "tiktok" as const,
            platformVideoId: rawVideo.id ?? rawVideo.aweme_id ?? "",
            originalUrl: `https://www.tiktok.com/@${rawVideo.author?.username}/video/${rawVideo.id}`,
            title: rawVideo.desc ?? rawVideo.description ?? "TikTok Video",
            description: rawVideo.desc ?? rawVideo.description ?? "",
            hashtags: rawVideo.textExtra?.map((tag: any) => tag.hashtagName).filter(Boolean) ?? [],
            duration: rawVideo.video?.duration ?? 0,
            metrics: {
              views: rawVideo.stats?.playCount ?? 0,
              likes: rawVideo.stats?.diggCount ?? 0,
              comments: rawVideo.stats?.commentCount ?? 0,
              shares: rawVideo.stats?.shareCount ?? 0,
            },
            author: {
              username: rawVideo.author?.username ?? rawVideo.author?.uniqueId ?? "",
              displayName: rawVideo.author?.nickname ?? "",
              isVerified: rawVideo.author?.verified ?? false,
              followerCount: rawVideo.author?.stats?.followerCount ?? 0,
            },
            publishedAt: rawVideo.createTime
              ? new Date(rawVideo.createTime * 1000).toISOString()
              : new Date().toISOString(),
          };
        }

        if (!videoUrl) {
          console.log(`⚠️ [FOLLOW_CREATOR] Skipping video - no video URL found`);
          return null;
        }

        console.log(`🐰 [FOLLOW_CREATOR] Uploading video to Bunny.net`);
        const filename = `${videoData.platform}_${videoData.platformVideoId}_${Date.now()}.mp4`;
        const bunnyResult = await streamToBunnyFromUrl(videoUrl, filename);

        const finalThumbnailUrl = thumbnailUrl;
        let bunnyVideoGuid: string | undefined;

        if (bunnyResult) {
          console.log(`✅ [FOLLOW_CREATOR] Video uploaded to Bunny successfully`);
          const guidMatch = bunnyResult.iframeUrl.match(/\/embed\/[^/]+\/([^/?]+)/);
          if (guidMatch) {
            bunnyVideoGuid = guidMatch[1];
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
          } as Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt">;
        }

        console.log(`⚠️ [FOLLOW_CREATOR] Bunny upload failed, storing with original URL`);
        return {
          ...videoData,
          thumbnailUrl: finalThumbnailUrl,
        } as Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt">;
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

export async function processInstagramVideosWithImmediateDownload(
  rawVideos: any[],
): Promise<Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt">[]> {
  console.log(`📥 [INSTAGRAM_IMMEDIATE] Starting immediate download for ${rawVideos.length} Instagram videos`);

  const processedVideos: Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt">[] = [];

  for (let index = 0; index < rawVideos.length; index++) {
    const rawVideo = rawVideos[index];
    try {
      console.log(`📥 [INSTAGRAM_IMMEDIATE] Processing video ${index + 1}/${rawVideos.length}`);

      let videoUrl = "";
      let thumbnailUrl = "";

      const dashManifest = rawVideo.media?.video_dash_manifest;
      if (dashManifest) {
        console.log("🔍 [INSTAGRAM_IMMEDIATE] Found DASH manifest, extracting lowest quality");
        const dashVideoUrl = extractLowestQualityFromDashManifest(dashManifest);
        if (dashVideoUrl) {
          videoUrl = dashVideoUrl;
          console.log("✅ [INSTAGRAM_IMMEDIATE] Using DASH manifest URL");
        }
      }

      if (!videoUrl && rawVideo.media?.video_versions?.[0]?.url) {
        videoUrl = rawVideo.media.video_versions[0].url;
        console.log("✅ [INSTAGRAM_IMMEDIATE] Using video_versions[0] URL");
      }

      if (rawVideo.media?.image_versions2?.candidates?.[0]?.url) {
        thumbnailUrl = rawVideo.media.image_versions2.candidates[0].url;
      }

      if (!videoUrl) {
        console.log(`⚠️ [INSTAGRAM_IMMEDIATE] No video URL found, skipping video ${index + 1}`);
        continue;
      }

      console.log(`🔗 [INSTAGRAM_IMMEDIATE] Video URL extracted: ${videoUrl.substring(0, 100)}...`);
      console.log(`⚡ [INSTAGRAM_IMMEDIATE] Immediate download and upload for video ${index + 1}`);

      const platformVideoId = rawVideo.media?.id ?? rawVideo.id ?? rawVideo.pk ?? "";
      const filename = `instagram_${platformVideoId ?? "video"}_${Date.now()}.mp4`;
      const bunnyResult = await streamToBunnyFromUrl(videoUrl, filename);

      const videoData: Omit<CreatorVideo, "id" | "creatorId" | "fetchedAt"> = {
        platform: "instagram" as const,
        platformVideoId,
        originalUrl: `https://www.instagram.com/reel/${rawVideo.media?.code ?? rawVideo.code}/`,
        title: rawVideo.media?.caption?.text?.substring(0, 100) ?? "Instagram Reel",
        description: rawVideo.media?.caption?.text ?? "",
        hashtags: extractHashtags(rawVideo.media?.caption?.text ?? ""),
        duration: rawVideo.media?.video_duration ?? rawVideo.video_duration ?? 0,
        metrics: {
          views: rawVideo.media?.play_count ?? rawVideo.view_count ?? rawVideo.play_count ?? 0,
          likes: rawVideo.media?.like_count ?? rawVideo.like_count ?? 0,
          comments: rawVideo.media?.comment_count ?? rawVideo.comment_count ?? 0,
          shares: rawVideo.media?.reshare_count ?? rawVideo.share_count ?? 0,
          saves: rawVideo.save_count ?? 0,
        },
        author: {
          username: rawVideo.media?.user?.username ?? rawVideo.user?.username ?? rawVideo.owner?.username ?? "",
          displayName: rawVideo.media?.user?.full_name ?? rawVideo.user?.full_name ?? rawVideo.owner?.full_name ?? "",
          isVerified:
            rawVideo.media?.user?.is_verified ?? rawVideo.user?.is_verified ?? rawVideo.owner?.is_verified ?? false,
          followerCount: rawVideo.user?.follower_count ?? rawVideo.owner?.follower_count ?? 0,
        },
        publishedAt: rawVideo.media?.taken_at
          ? new Date(rawVideo.media.taken_at * 1000).toISOString()
          : rawVideo.taken_at
            ? new Date(rawVideo.taken_at * 1000).toISOString()
            : new Date().toISOString(),
        thumbnailUrl, // include to satisfy type contract
      };

      if (bunnyResult) {
        console.log(`✅ [INSTAGRAM_IMMEDIATE] Video ${index + 1} uploaded to Bunny successfully`);

        const guidMatch = bunnyResult.iframeUrl.match(/\/embed\/[^/]+\/([^/?]+)/);
        let bunnyVideoGuid: string | undefined;
        if (guidMatch) {
          bunnyVideoGuid = guidMatch[1];
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
          bunnyVideoGuid,
          processedAt: new Date().toISOString(),
        });
      } else {
        console.log(`⚠️ [INSTAGRAM_IMMEDIATE] Bunny upload failed for video ${index + 1}, storing with original URL`);
        processedVideos.push({
          ...videoData,
        });
      }

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
