import { NextRequest } from 'next/server';
import { getTopSixFromRotatedKeywords } from '@/lib/tiktok/top-six';
import { searchTikTok, pickSmallest540PerItem } from '@/lib/tiktok/search';
import { normalizeCategory } from '@/data/keyword-pools';
import { getOrComputeDailyPicks } from '@/lib/daily-picks';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const debug = searchParams.get('debug') === '1' || searchParams.get('debug') === 'true';
    const keyword = searchParams.get('keyword') || 'content marketing';
    const force = searchParams.get('force') === '1' || searchParams.get('force') === 'true';
    const categoryParam = searchParams.get('category') || searchParams.get('topic');
    const category = normalizeCategory(categoryParam || undefined);

    if (debug) {
      console.log(`🐞 [TopSix][Debug] Forcing RapidAPI search for keyword="${keyword}"`);
      const resp = await searchTikTok(keyword, 0, 0);
      const items = pickSmallest540PerItem(resp);
      console.log(
        `🐞 [TopSix][Debug] RapidAPI returned status_code=${resp?.status_code ?? 'n/a'} items=${resp?.data?.length ?? 0}, filtered=${items.length}`,
      );
      return Response.json(
        { ok: true, debug: true, keyword, status_code: resp?.status_code, count: items.length, videos: items },
        { status: 200 },
      );
    }

    // Persist and serve once per day (with optional force to resync)
    const { videos } = await getOrComputeDailyPicks({ category: category ?? undefined, force });
    const keywordsUsed = Array.from(new Set((videos || []).map((v: any) => v.keyword).filter(Boolean)));
    return Response.json(
      { ok: true, count: videos.length, videos, category: category ?? null, keywordsUsed },
      { status: 200 },
    );
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'Failed to compute top six' }, { status: 500 });
  }
}
