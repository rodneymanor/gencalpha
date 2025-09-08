import { NextRequest } from 'next/server'
import { seedKeywordPool, seedKeywordPoolForCategory } from '@/lib/keyword-rotation'
import { KEYWORD_POOLS } from '@/data/keyword-pools'

// One-time seeding endpoint for a curated, multi-category keyword pool.
// Call: GET /api/keywords/pool/seed-defaults
export async function GET(_req: NextRequest) {
  try {
    // Seed legacy generic pool for backward compatibility (content-creation focus)
    const legacyKeywords = KEYWORD_POOLS['content-creation']
    await seedKeywordPool(legacyKeywords)

    // Seed all categorized pools
    let total = legacyKeywords.length
    for (const [category, list] of Object.entries(KEYWORD_POOLS)) {
      await seedKeywordPoolForCategory(category, list as string[])
      total += (list as string[]).length
    }

    return Response.json({ ok: true, added: total, message: 'Categorized keyword pools seeded' })
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message || 'Failed to seed default keyword pool' },
      { status: 500 },
    )
  }
}
