import { pickSmallest540PerItem, searchTikTok } from './search';
import { rotateKeywords } from '@/lib/keyword-rotation';

export type RankedVideo = ReturnType<typeof pickSmallest540PerItem>[number] & {
  score: number;
  keyword: string;
};

const NEWS_REGEX = /\b(news|breaking|headline|update|press|politic|election|war|crime|weather|forecast|daily\s+news)\b/i;

function isNonNews(desc?: string): boolean {
  if (!desc) return true;
  return !NEWS_REGEX.test(desc);
}

function recencyWeight(createdAt?: number): number {
  if (!createdAt) return 0.8; // unknown, slight penalty
  const now = Math.floor(Date.now() / 1000);
  const days = (now - createdAt) / (24 * 3600);
  // 0 days => 1.0, 180 days => ~0.5, 365 days => ~0.3
  return Math.max(0.2, Math.min(1, 1 - days / 365));
}

function successScore(views = 0, likes = 0): number {
  // Log-scaled views plus likes weight
  const v = Math.log10(Math.max(views, 1)); // 0..~7
  const l = Math.log10(Math.max(likes, 1));
  return v * 1.0 + l * 0.7;
}

export async function getTopSixFromRotatedKeywords(): Promise<RankedVideo[]> {
  // Fallback keywords to ensure Daily Picks work even without Firestore rotation
  const DEFAULT_KEYWORDS: string[] = [
    'viral hooks',
    'content marketing tips',
    'short form video ideas',
    'tiktok growth tips',
    'storytelling techniques',
    'youtube shorts ideas',
    'instagram reels trends',
  ];

  let keywords: string[] = [];
  try {
    const rotation = await rotateKeywords({ count: 3 });
    keywords = rotation?.keywords ?? [];
  } catch (_e) {
    // If Firestore admin is not initialized or rotation fails, continue with fallback
    keywords = [];
  }

  if (!keywords.length) {
    keywords = DEFAULT_KEYWORDS;
  }

  const all: RankedVideo[] = [];
  for (const kw of keywords) {
    try {
      const resp = await searchTikTok(kw, 0, 0);
      const items = pickSmallest540PerItem(resp);

      for (const it of items) {
        if (!isNonNews(it.description)) continue;
        // Basic sanity: duration under 3 min preferred but not mandatory; we apply into score
        const durationPenalty = it.duration && it.duration > 180 ? 0.6 : 1;
        const score = successScore(it.views, it.likes) * recencyWeight(it.createdAt) * durationPenalty;
        all.push({ ...it, score, keyword: kw });
      }
    } catch (e) {
      // continue with others
    }
  }

  // Dedup by itemId
  const byId = new Map<string, RankedVideo>();
  for (const v of all) {
    if (v.itemId && (!byId.has(v.itemId) || (byId.get(v.itemId)!.score < v.score))) {
      byId.set(v.itemId, v);
    }
  }

  const ranked = Array.from(byId.values()).sort((a, b) => b.score - a.score);
  const top = ranked.slice(0, 6);

  // Ultimate fallback: if nothing was found from the API, synthesize items from default keywords
  if (top.length === 0) {
    const synth = (DEFAULT_KEYWORDS.slice(0, 6).map((kw, i) => ({
      itemId: `kw-${i + 1}`,
      description: kw,
      duration: undefined,
      gearName: undefined,
      dataSize: undefined,
      url: undefined,
      views: 0,
      likes: 0,
      createdAt: undefined,
      used540: false,
      score: 0.5,
      keyword: kw,
    })) as RankedVideo[]);
    return synth;
  }

  return top;
}
