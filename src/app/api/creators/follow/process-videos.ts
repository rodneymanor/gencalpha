// Video processing helpers
// - Responsible for transforming raw platform payloads into normalized video objects
// - Handles Bunny CDN uploads and thumbnail handling

import { streamToBunnyFromUrl, uploadBunnyThumbnailWithRetry } from "@/lib/bunny-stream";
import { type CreatorVideo } from "@/lib/creator-service";
import { scrapeVideoUrl } from "@/lib/unified-video-scraper";

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

        // Build original post URL and use UnifiedVideoScraper as single source of truth
        const isInstagram = !!(rawVideo.media ?? rawVideo.code ?? rawVideo.pk);
        const originalUrl = isInstagram
          ? `https://www.instagram.com/reel/${rawVideo.media?.code ?? rawVideo.code}/`
          : `https://www.tiktok.com/@${rawVideo.author?.username ?? rawVideo.author?.uniqueId}/video/${
              rawVideo.id ?? rawVideo.aweme_id
            }`;

        const scraped = await scrapeVideoUrl(originalUrl);
        const videoUrl = scraped.videoUrl;
        const thumbnailUrl = scraped.thumbnailUrl ?? "";

        if (!videoUrl) {
          console.log("⚠️ [FOLLOW_CREATOR] Skipping video - unified scraper did not return a video URL");
          return null;
        }

        const platform = (scraped.platform === "instagram" ? "instagram" : "tiktok") as const;
        const platformVideoId =
          rawVideo.media?.id ?? rawVideo.id ?? rawVideo.pk ?? rawVideo.aweme_id ?? scraped.shortCode ?? "";
        const titleCandidate = isInstagram
          ? rawVideo.media?.caption?.text
          : (rawVideo.desc ?? rawVideo.description ?? scraped.title);
        const title = (titleCandidate ?? scraped.title ?? (isInstagram ? "Instagram Reel" : "TikTok Video")).slice(
          0,
          100,
        );
        const description =
          (isInstagram ? rawVideo.media?.caption?.text : (rawVideo.desc ?? rawVideo.description)) ??
          scraped.description ??
          "";
        const hashtags = scraped.hashtags?.length ? scraped.hashtags : extractHashtags(description ?? "");
        const duration = scraped.metadata?.duration ?? rawVideo.media?.video_duration ?? rawVideo.video?.duration ?? 0;
        const metrics = {
          views: scraped.metrics?.views ?? rawVideo.media?.play_count ?? rawVideo.stats?.playCount ?? 0,
          likes: scraped.metrics?.likes ?? rawVideo.media?.like_count ?? rawVideo.stats?.diggCount ?? 0,
          comments: scraped.metrics?.comments ?? rawVideo.media?.comment_count ?? rawVideo.stats?.commentCount ?? 0,
          shares: scraped.metrics?.shares ?? rawVideo.media?.reshare_count ?? rawVideo.stats?.shareCount ?? 0,
          saves: rawVideo.save_count ?? 0,
        };
        const author = isInstagram
          ? {
              username:
                rawVideo.media?.user?.username ??
                rawVideo.user?.username ??
                rawVideo.owner?.username ??
                scraped.author ??
                "",
              displayName:
                rawVideo.media?.user?.full_name ?? rawVideo.user?.full_name ?? rawVideo.owner?.full_name ?? "",
              isVerified:
                rawVideo.media?.user?.is_verified ??
                rawVideo.user?.is_verified ??
                rawVideo.owner?.is_verified ??
                scraped.metadata?.isVerified ??
                false,
              followerCount:
                rawVideo.user?.follower_count ?? rawVideo.owner?.follower_count ?? scraped.metadata?.followerCount ?? 0,
            }
          : {
              username: rawVideo.author?.username ?? rawVideo.author?.uniqueId ?? scraped.author ?? "",
              displayName: rawVideo.author?.nickname ?? "",
              isVerified: rawVideo.author?.verified ?? scraped.metadata?.isVerified ?? false,
              followerCount: rawVideo.author?.stats?.followerCount ?? scraped.metadata?.followerCount ?? 0,
            };
        const publishedAt = isInstagram
          ? rawVideo.media?.taken_at
            ? new Date(rawVideo.media.taken_at * 1000).toISOString()
            : rawVideo.taken_at
              ? new Date(rawVideo.taken_at * 1000).toISOString()
              : (scraped.metadata?.timestamp ?? new Date().toISOString())
          : rawVideo.createTime
            ? new Date(rawVideo.createTime * 1000).toISOString()
            : (scraped.metadata?.timestamp ?? new Date().toISOString());

        const videoData = {
          platform,
          platformVideoId,
          originalUrl,
          title,
          description,
          hashtags,
          duration,
          metrics,
          author,
          publishedAt,
        } as const;

        console.log(`🐰 [FOLLOW_CREATOR] Uploading video to Bunny.net`);
        const filename = `${platform}_${platformVideoId}_${Date.now()}.mp4`;
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
