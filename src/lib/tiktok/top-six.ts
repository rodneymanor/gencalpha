import { normalizeCategory, KEYWORD_POOLS } from "@/data/keyword-pools";
import { rotateKeywords } from "@/lib/keyword-rotation";

import { pickSmallest540PerItem, searchTikTok } from "./search";

export type RankedVideo = ReturnType<typeof pickSmallest540PerItem>[number] & {
  score: number;
  keyword: string;
};

const NEWS_REGEX =
  /\b(news|breaking|headline|update|press|politic|election|war|crime|weather|forecast|daily\s+news)\b/i;

function isNonNews(desc?: string): boolean {
  if (!desc) return true;
  return !NEWS_REGEX.test(desc);
}

// Heuristic English detector for short descriptions.
// Returns true if text appears to be English based on ASCII ratio and common word/vowel presence.
function isLikelyEnglish(desc?: string): boolean {
  if (!desc) return false;
  const text = String(desc).trim();
  if (!text) return false;
  const asciiLetters = (text.match(/[A-Za-z]/g) || []).length;
  const nonAscii = (text.match(/[^\x00-\x7F]/g) || []).length;
  const total = text.length || 1;
  const asciiRatio = asciiLetters / total;
  // Basic word/vowel checks
  const hasVowel = /[aeiouAEIOU]/.test(text);
  const hasSpace = /\s/.test(text);
  const commonWords = /(the|and|for|with|this|that|you|your|how|why|tips|guide|best|make|learn|today)/i.test(text);
  // Thresholds tuned for short social captions
  if (nonAscii > 0 && asciiRatio < 0.6) return false;
  return (asciiRatio >= 0.5 && hasVowel && hasSpace) || commonWords;
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

export async function getTopSixFromRotatedKeywords(options?: {
  force?: boolean;
  category?: string;
}): Promise<RankedVideo[]> {
  // Simple in-process cache + in-flight coalescing to avoid RapidAPI bursts
  // Cache key is the rotation day + keywords list
  type CacheEntry = { key: string; at: number; result: RankedVideo[] };
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  // Module-level singletons (on purpose). These persist for the life of the server process.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = globalThis as any;
  if (!g.__topSixState) {
    g.__topSixState = { inFlight: null as Promise<RankedVideo[]> | null, last: null as CacheEntry | null };
  }

  const state = g.__topSixState as { inFlight: Promise<RankedVideo[]> | null; last: CacheEntry | null };

  // If a computation is currently in-flight, await it instead of starting a new one
  if (state.inFlight) {
    return await state.inFlight;
  }

  const compute = async (bypassCache: boolean): Promise<RankedVideo[]> => {
    const cat = normalizeCategory(options?.category || undefined);
    let keywords: string[] = [];
    let day = "n/a";
    try {
      const rotation = await rotateKeywords({ count: 3, category: cat });
      keywords = rotation?.keywords ?? [];
      day = (rotation as any)?.date ?? "n/a";
    } catch {
      // Fallback: pick from static pools (dev without Admin)
      const pool = (cat ? KEYWORD_POOLS[cat] : KEYWORD_POOLS["content-creation"]) || [];
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      keywords = shuffled.slice(0, 3);
      day = new Date().toISOString().slice(0, 10);
    }
    const cacheKey = `${day}::${cat ?? "all"}::${keywords.join("|")}`;

    // Serve from recent cache when available
    if (!bypassCache && state.last && state.last.key === cacheKey && Date.now() - state.last.at < CACHE_TTL_MS) {
      return state.last.result;
    }

    console.log(
      `🔁 [TopSix] rotateKeywords -> date=${day} category=${cat ?? "all"} keywords=${keywords.length} (${keywords.join(", ")})`,
    );

    const all: RankedVideo[] = [];
    for (const kw of keywords) {
      try {
        const resp = await searchTikTok(kw, 0, 0);
        // Prefer fresher and reasonable-length videos
        const items = pickSmallest540PerItem(resp, { withinDays: 180, maxDurationSec: 240 });
        console.log(
          `🔎 [TopSix] keyword="${kw}" -> resp_code=${resp?.status_code ?? "n/a"} raw=${resp?.data?.length ?? 0} filtered=${items.length}`,
        );

        for (const it of items) {
          if (!isNonNews(it.description)) continue;
          if (!isLikelyEnglish(it.description)) continue;
          const durationPenalty = it.duration && it.duration > 180 ? 0.6 : 1;
          const score = successScore(it.views, it.likes) * recencyWeight(it.createdAt) * durationPenalty;
          all.push({ ...it, score, keyword: kw });
        }
        // Tiny delay between external requests to be gentle and reduce 429s
        await new Promise((r) => setTimeout(r, 200));
      } catch (e) {
        // continue with others
      }
    }

    // Dedup by itemId
    const byId = new Map<string, RankedVideo>();
    for (const v of all) {
      if (v.itemId && (!byId.has(v.itemId) || byId.get(v.itemId)!.score < v.score)) {
        byId.set(v.itemId, v);
      }
    }

    const ranked = Array.from(byId.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    state.last = { key: cacheKey, at: Date.now(), result: ranked };
    return ranked;
  };

  // Start computation and share the same promise across concurrent callers
  state.inFlight = compute(Boolean(options?.force))
    .catch((err) => {
      throw err;
    })
    .finally(() => {
      state.inFlight = null;
    });

  return await state.inFlight;
}

// Fetch and rank top six for a specific keyword (ad-hoc search)
export async function getTopSixForKeyword(keyword: string): Promise<RankedVideo[]> {
  const kw = String(keyword || "").trim();
  if (!kw) return [];

  try {
    const resp = await searchTikTok(kw, 0, 0);
    const items = pickSmallest540PerItem(resp, { withinDays: 180, maxDurationSec: 240 });
    const all: RankedVideo[] = [];
    for (const it of items) {
      if (!isNonNews(it.description)) continue;
      if (!isLikelyEnglish(it.description)) continue;
      const durationPenalty = it.duration && it.duration > 180 ? 0.6 : 1;
      const score = successScore(it.views, it.likes) * recencyWeight(it.createdAt) * durationPenalty;
      all.push({ ...it, score, keyword: kw });
    }

    const byId = new Map<string, RankedVideo>();
    for (const v of all) {
      if (v.itemId && (!byId.has(v.itemId) || byId.get(v.itemId)!.score < v.score)) {
        byId.set(v.itemId, v);
      }
    }
    return Array.from(byId.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  } catch {
    return [];
  }
}
