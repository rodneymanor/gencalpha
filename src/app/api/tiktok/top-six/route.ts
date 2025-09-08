import { NextRequest } from 'next/server';
import { getTopSixFromRotatedKeywords } from '@/lib/tiktok/top-six';

export async function GET(_req: NextRequest) {
  try {
    const videos = await getTopSixFromRotatedKeywords();
    return Response.json({ ok: true, count: videos.length, videos }, { status: 200 });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'Failed to compute top six' }, { status: 500 });
  }
}

