/*
 * Instagram RapidAPI helper: normalize existing logic and reduce complexity at call-site
 */
import { UnifiedVideoResult } from "@/lib/types/video-scraper";

export function extractInstagramShortcode(url: string): string | null {
  const match = url.match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
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

export function mapInstagramToUnified(instagramData: any, shortcode: string): UnifiedVideoResult {
  const standardVersions = instagramData?.video_versions ?? [];
  const dashVersions = instagramData?.video_dash_manifest?.video_versions ?? [];
  const allVersions = [...dashVersions, ...standardVersions];

  let selected: any | null = null;
  if (allVersions.length > 0) {
    const sorted = [...allVersions].sort((a, b) => (a?.bandwidth ?? 0) - (b?.bandwidth ?? 0));
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
