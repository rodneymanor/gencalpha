/*
 * Instagram RapidAPI helper: normalize existing logic and reduce complexity at call-site
 */
import { UnifiedVideoResult } from "@/lib/types/video-scraper";

export function extractInstagramShortcode(url: string): string | null {
  // Support canonical post/reel/tv as well as share links which contain the shortcode
  const match = url.match(/\/(p|reel|reels|tv|share)\/([A-Za-z0-9_-]+)/);
  return match ? match[2] : null;
}

export async function fetchInstagramRapidApiByShortcode(shortcode: string): Promise<any> {
  const resp = await fetch(
    `https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/post?shortcode=${encodeURIComponent(shortcode)}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "instagram-api-fast-reliable-data-scraper.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY ?? "",
      },
    },
  );
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Instagram RapidAPI failed: ${resp.status} ${resp.statusText} ${text}`);
  }
  return resp.json();
}

export function mapInstagramToUnified(
  instagramData: any,
  shortcode: string,
  preferAudioOnly = false,
): UnifiedVideoResult {
  const standardVersions = instagramData?.video_versions ?? [];
  const dashVersions = instagramData?.video_dash_manifest?.video_versions ?? [];
  const allVersions = [...dashVersions, ...standardVersions];

  // Heuristic to detect audio-only variants in IG dash manifest
  const isAudioOnly = (v: any) => {
    const t = String(v?.type || v?.mime_type || v?.content_type || "").toLowerCase();
    const codecs = String(v?.codecs || "").toLowerCase();
    const url = String(v?.url || "").toLowerCase();
    const noDimensions = v?.height === 0 || v?.width === 0 || (v?.height == null && v?.width == null);
    return (
      t.includes("audio") ||
      codecs.includes("mp4a") ||
      url.includes("/audio/") ||
      url.includes("audio_only") ||
      (noDimensions && !t.includes("video"))
    );
  };

  let selected: any | null = null;

  if (allVersions.length > 0) {
    let candidates = allVersions;
    if (preferAudioOnly) {
      const audioOnly = allVersions.filter(isAudioOnly);
      if (audioOnly.length > 0) {
        candidates = audioOnly;
      }
    }
    const sorted = [...candidates].sort((a, b) => (a?.bandwidth ?? 0) - (b?.bandwidth ?? 0));
    selected = sorted[0];
  }

  const videoUrl: string = selected?.url ?? "";
  const thumbnailUrl: string = instagramData?.image_versions2?.candidates?.[0]?.url ?? "";
  const caption: string = instagramData?.caption?.text ?? "";

  return {
    platform: "instagram",
    shortCode: instagramData?.code ?? shortcode,
    videoUrl,
    thumbnailUrl,
    title: caption || `Video by @${instagramData?.user?.username}`,
    author: instagramData?.user?.username ?? "unknown",
    description: caption,
    hashtags: extractHashtagsFromText(caption),
    metrics: {
      likes: instagramData?.like_count ?? 0,
      views: instagramData?.play_count ?? 0,
      comments: instagramData?.comment_count ?? 0,
      shares: instagramData?.reshare_count ?? 0,
    },
    metadata: {
      duration: instagramData?.video_duration ?? 0,
      timestamp: instagramData?.taken_at ? new Date(instagramData.taken_at * 1000).toISOString() : undefined,
      isVerified: instagramData?.user?.is_verified ?? false,
      followerCount: 0,
    },
    rawData: instagramData,
  };
}

function extractHashtagsFromText(text: string): string[] {
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
  const matches = text?.match?.(hashtagRegex);
  return matches ? matches.map((tag: string) => tag.substring(1)) : [];
}
