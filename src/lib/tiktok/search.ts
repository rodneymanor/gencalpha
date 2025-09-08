type BitrateInfo = {
  GearName?: string;
  Bitrate?: number;
  QualityType?: number;
  PlayAddr?: {
    Uri?: string;
    UrlList?: string[];
    DataSize?: number; // bytes
    Width?: number;
    Height?: number;
  };
  CodecType?: string;
};

type TikTokItem = {
  id?: string;
  desc?: string;
  createTime?: number;
  stats?: {
    playCount?: number; // views
    diggCount?: number; // likes
    commentCount?: number;
    shareCount?: number;
  };
  video?: {
    id?: string;
    height?: number;
    width?: number;
    duration?: number;
    ratio?: string;
    bitrateInfo?: BitrateInfo[];
  };
};

type TikTokSearchResponse = {
  status_code?: number;
  data?: Array<{
    type?: number;
    item?: TikTokItem;
  }>;
};

export type PickedVideo = {
  itemId: string | undefined;
  description: string | undefined;
  duration: number | undefined;
  gearName: string | undefined;
  dataSize: number | undefined;
  url: string | undefined;
  views?: number;
  likes?: number;
  createdAt?: number; // epoch seconds
  used540?: boolean; // true if a 540p variant was chosen
};

const RAPIDAPI_HOST = 'tiktok-api23.p.rapidapi.com';

export async function searchTikTok(keyword: string, cursor = 0, searchId = 0): Promise<TikTokSearchResponse> {
  const key = process.env.RAPIDAPI_TIKTOK_KEY || process.env.RAPIDAPI_KEY;
  if (!key) {
    throw new Error('Missing RAPIDAPI_TIKTOK_KEY environment variable');
  }

  const url = `https://${RAPIDAPI_HOST}/api/search/general?keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&search_id=${searchId}`;
  try {
    console.log(`🔎 [RAPIDAPI][TikTok][Search] GET ${url}`);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    });

    console.log(
      `🔎 [RAPIDAPI][TikTok][Search] status: ${res.status} ${res.statusText}`,
    );

    const text = await res.text();
    try {
      const json = JSON.parse(text) as TikTokSearchResponse;
      const count = Array.isArray(json?.data) ? json.data.length : 0;
      console.log(
        `🔎 [RAPIDAPI][TikTok][Search] parsed ok: status_code=${json.status_code ?? res.status}, items=${count}`,
      );
      return json;
    } catch (e) {
      console.warn(
        `⚠️ [RAPIDAPI][TikTok][Search] JSON parse failed. Raw length=${text.length}. Snippet=\n${text.slice(
          0,
          600,
        )}`,
      );
      return { status_code: res.status, data: [] } as TikTokSearchResponse;
    }
  } catch (err) {
    console.error(`❌ [RAPIDAPI][TikTok][Search] Request error:`, err);
    return { status_code: 500, data: [] } as TikTokSearchResponse;
  }
}

// Picks the smallest 540p-like resource, prioritizing GearName that contains 'lowest_540_0',
// then 'normal_540_0', then any containing '540'. Falls back to the globally smallest DataSize.
export function pickSmallest540(resp: TikTokSearchResponse): PickedVideo | undefined {
  if (!resp?.data?.length) return undefined;

  let best: { item: TikTokItem; info: BitrateInfo; size: number } | undefined;

  const scoreGear = (name = ''): number => {
    const n = name.toLowerCase();
    if (n.includes('lowest_540_0')) return 3;
    if (n.includes('normal_540_0')) return 2;
    if (n.includes('540')) return 1;
    return 0;
  };

  for (const entry of resp.data!) {
    const item = entry.item;
    if (!item?.video?.bitrateInfo?.length) continue;
    for (const info of item.video.bitrateInfo) {
      const ds = info?.PlayAddr?.DataSize;
      if (typeof ds !== 'number') continue;
      const s = scoreGear(info.GearName);

      if (!best) {
        best = { item, info, size: ds };
        continue;
      }

      const bestScore = scoreGear(best.info.GearName);
      if (s > bestScore) {
        best = { item, info, size: ds };
      } else if (s === bestScore && ds < best.size) {
        best = { item, info, size: ds };
      }
    }
  }

  if (!best) return undefined;

  const url = best.info?.PlayAddr?.UrlList?.[0];
  return {
    itemId: best.item.id,
    description: best.item.desc,
    duration: best.item.video?.duration,
    gearName: best.info.GearName,
    dataSize: best.info.PlayAddr?.DataSize,
    url,
  };
}

// For each item in the response, pick its smallest 540p-like variant using the same scoring rules.
export type TikTokFilterOptions = {
  minViews?: number; // inclusive
  maxViews?: number; // inclusive
  minLikes?: number; // inclusive
  maxDurationSec?: number; // inclusive
  withinDays?: number; // items created within N days
};

function withinLastDays(epochSeconds: number | undefined, days: number): boolean {
  if (!epochSeconds) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  const threshold = nowSec - days * 24 * 60 * 60;
  return epochSeconds >= threshold;
}

export function pickSmallest540PerItem(
  resp: TikTokSearchResponse,
  opts?: TikTokFilterOptions,
): PickedVideo[] {
  if (!resp?.data?.length) return [];

  const scoreGear = (name = ''): number => {
    const n = name.toLowerCase();
    if (n.includes('lowest_540_0')) return 3;
    if (n.includes('normal_540_0')) return 2;
    if (n.includes('540')) return 1;
    return 0;
  };

  const results: PickedVideo[] = [];
  for (const entry of resp.data!) {
    const item = entry.item;
    const infos = item?.video?.bitrateInfo;
    if (!item || !Array.isArray(infos) || infos.length === 0) continue;

    // Apply basic filters
    const views = item.stats?.playCount ?? 0;
    const likes = item.stats?.diggCount ?? 0;
    const duration = item.video?.duration ?? 0;
    const createdAt = item.createTime; // epoch seconds

    const minViews = opts?.minViews;
    const maxViews = opts?.maxViews;
    const minLikes = opts?.minLikes;
    const maxDurationSec = opts?.maxDurationSec;
    const withinDaysOpt = opts?.withinDays;

    const meetsViews = (minViews == null || views >= minViews) && (maxViews == null || views <= maxViews);
    const meetsLikes = minLikes == null || likes >= minLikes;
    const meetsDuration = maxDurationSec == null || duration <= maxDurationSec;
    const meetsRecency = withinDaysOpt == null || withinLastDays(createdAt, withinDaysOpt);

    if (!(meetsViews && meetsLikes && meetsDuration && meetsRecency)) continue;

    let bestPreferred: { info: BitrateInfo; size: number } | undefined; // 540-related
    let bestAny: { info: BitrateInfo; size: number } | undefined; // any bitrate as fallback
    for (const info of infos) {
      const ds = info?.PlayAddr?.DataSize;
      if (typeof ds !== 'number') continue;
      const s = scoreGear(info.GearName);
      // Track global smallest for fallback
      if (!bestAny || ds < bestAny.size) {
        bestAny = { info, size: ds };
      }
      // Track preferred (540) only
      if (s > 0) {
        if (!bestPreferred) {
          bestPreferred = { info, size: ds };
        } else {
          const bestScore = scoreGear(bestPreferred.info.GearName);
          if (s > bestScore || (s === bestScore && ds < bestPreferred.size)) {
            bestPreferred = { info, size: ds };
          }
        }
      }
    }

    const choice = bestPreferred ?? bestAny;
    if (choice) {
      // Prefer HTTPS URL from UrlList when available
      const urlList = (choice.info?.PlayAddr?.UrlList ?? []).filter((u) => typeof u === 'string');
      let preferredUrl = (urlList.find((u) => u.startsWith('https://')) || urlList[0]) as string | undefined;
      if (preferredUrl && preferredUrl.startsWith('http://')) {
        preferredUrl = 'https://' + preferredUrl.slice('http://'.length);
      }

      results.push({
        itemId: item.id,
        description: item.desc,
        duration: item.video?.duration,
        gearName: choice.info.GearName,
        dataSize: choice.info.PlayAddr?.DataSize,
        url: preferredUrl,
        views,
        likes,
        createdAt,
        used540: Boolean(bestPreferred),
      });
    }
  }

  return results;
}
