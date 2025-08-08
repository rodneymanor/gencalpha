/*
 * TikTok RapidAPI helper: fetch by videoId and normalize to UnifiedVideoResult
 */
import { UnifiedVideoResult } from "@/lib/types/video-scraper";

const TIKTOK_HOST = "tiktok-scrapper-videos-music-challenges-downloader.p.rapidapi.com";

export function extractTikTokVideoId(inputUrl: string): string | null {
  try {
    const url = new URL(inputUrl);
    // Patterns: https://www.tiktok.com/@user/video/1234567890
    const path = url.pathname;
    const directMatch = path.match(/\/video\/(\d+)/);
    if (directMatch) return directMatch[1];

    // vm.tiktok.com short links or tiktok.com/t/
    // We cannot follow redirects server-side reliably without fetch; caller can resolve separately if needed.
    // As a best-effort, return null to indicate resolution required.
    if (url.hostname.includes("vm.tiktok.com") || path.startsWith("/t/")) {
      return null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function resolveTikTokShortLink(shortUrl: string): Promise<string | null> {
  // Attempt to resolve via HEAD first, then GET without following infinite redirects.
  try {
    const headResp = await fetch(shortUrl, { method: "HEAD", redirect: "follow" as RequestRedirect });
    if (headResp.url && /\/video\/\d+/.test(new URL(headResp.url).pathname)) {
      return headResp.url;
    }
  } catch {}
  try {
    const getResp = await fetch(shortUrl, { method: "GET", redirect: "follow" as RequestRedirect });
    if (getResp.url && /\/video\/\d+/.test(new URL(getResp.url).pathname)) {
      return getResp.url;
    }
  } catch {}
  return null;
}

export async function fetchTikTokRapidApiById(videoId: string): Promise<any> {
  const url = `https://${TIKTOK_HOST}/video/${encodeURIComponent(videoId)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY ?? "",
      "x-rapidapi-host": TIKTOK_HOST,
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`TikTok RapidAPI request failed: ${response.status} ${response.statusText} ${text}`);
  }
  return response.json();
}

export function selectLowestBitratePlayUrl(awemeDetail: any): string | "" {
  const bitRates: any[] = awemeDetail?.video?.bit_rate ?? [];
  if (!Array.isArray(bitRates) || bitRates.length === 0) {
    // fallback to play_addr or download_addr
    const playList: string[] = awemeDetail?.video?.play_addr?.url_list ?? [];
    const dlList: string[] = awemeDetail?.video?.download_addr?.url_list ?? [];
    return (playList[0] ?? dlList[0] ?? "");
  }
  const sorted = [...bitRates].sort((a, b) => (a.bit_rate ?? 0) - (b.bit_rate ?? 0));
  const lowest = sorted[0];
  const playList: string[] = lowest?.play_addr?.url_list ?? [];
  return playList[0] ?? "";
}

export function mapTikTokToUnified(awemeDetail: any): UnifiedVideoResult {
  const awemeId: string = awemeDetail?.aweme_id ?? "unknown";
  const desc: string = awemeDetail?.desc ?? "";
  const statistics = awemeDetail?.statistics ?? {};
  const author = awemeDetail?.author ?? {};

  const thumbnailUrl =
    awemeDetail?.video?.cover?.url_list?.[0] ??
    awemeDetail?.video?.origin_cover?.url_list?.[0] ??
    "";

  const hashtags: string[] = Array.isArray(awemeDetail?.text_extra)
    ? awemeDetail.text_extra.filter((t: any) => t?.hashtag_name).map((t: any) => t.hashtag_name)
    : [];

  const durationMs: number = awemeDetail?.video?.duration ?? 0;
  const durationSec = durationMs ? Math.round(durationMs / 1000) : 0;

  const videoUrl = selectLowestBitratePlayUrl(awemeDetail);

  return {
    platform: "tiktok",
    shortCode: awemeId,
    videoUrl,
    thumbnailUrl,
    title: desc || `TikTok by @${author?.unique_id ?? author?.nickname ?? "unknown"}`,
    author: author?.unique_id ?? author?.nickname ?? String(awemeDetail?.author_user_id ?? "unknown"),
    description: desc,
    hashtags,
    metrics: {
      likes: statistics?.digg_count ?? 0,
      views: statistics?.play_count ?? 0,
      comments: statistics?.comment_count ?? 0,
      shares: statistics?.share_count ?? 0,
      saves: statistics?.collect_count ?? 0,
    },
    metadata: {
      duration: durationSec,
      timestamp: awemeDetail?.create_time ? new Date(awemeDetail.create_time * 1000).toISOString() : undefined,
      isVerified: (author?.verification_type ?? 0) === 1,
      followerCount: undefined,
    },
    rawData: awemeDetail,
  };
}

