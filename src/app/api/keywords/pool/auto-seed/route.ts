import { NextRequest } from 'next/server';
import { seedKeywordPool, seedPoolFromKeywordQueries } from '@/lib/keyword-rotation';

// GET triggers auto-seed from keyword_queries with optional limit
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') || 50);
  try {
    const result = await seedPoolFromKeywordQueries({ limit });
    return Response.json({ ok: true, ...result });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'Auto-seed failed' }, { status: 500 });
  }
}

// POST supports two modes:
// 1) { keywords: string[] } to seed explicit list
// 2) { limit?: number } to seed from keyword_queries
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (Array.isArray(body?.keywords)) {
      const keywords = (body.keywords as unknown[]).map(String).filter((k) => k.trim().length > 0);
      await seedKeywordPool(keywords);
      return Response.json({ ok: true, added: keywords.length, keywords });
    }
    const limit = Number(body?.limit ?? 50);
    const result = await seedPoolFromKeywordQueries({ limit });
    return Response.json({ ok: true, ...result });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'Auto-seed failed' }, { status: 500 });
  }
}

