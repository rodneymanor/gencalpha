import { NextRequest, NextResponse } from 'next/server'
import { pickSmallest540PerItem } from '@/lib/tiktok/search'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || 'Artificial intelligence tips'
  const cursor = Number(searchParams.get('cursor') || 0)
  const searchId = Number(searchParams.get('search_id') || 0)
  const overrideKey = searchParams.get('key') || undefined

  const key = overrideKey || process.env.RAPIDAPI_TIKTOK_KEY || process.env.RAPIDAPI_KEY
  if (!key) {
    return NextResponse.json(
      { ok: false, error: 'Missing RapidAPI key. Provide ?key=... or set RAPIDAPI_KEY.' },
      { status: 400 },
    )
  }

  const host = 'tiktok-api23.p.rapidapi.com'
  const url = `https://${host}/api/search/general?keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&search_id=${searchId}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': host,
      },
    })

    const text = await res.text()
    let parsed: any = null
    let items540: any[] = []
    let dataCount = 0
    try {
      parsed = JSON.parse(text)
      dataCount = Array.isArray(parsed?.data) ? parsed.data.length : 0
      items540 = pickSmallest540PerItem(parsed)
    } catch (e) {
      // keep parsed as null
    }

    return NextResponse.json(
      {
        ok: true,
        requested: { keyword, cursor, searchId },
        status: { code: res.status, text: res.statusText },
        counts: { rawItems: dataCount, filtered540: items540.length },
        url,
        parsed, // full JSON from API (can be large)
        filtered540: items540, // normalized picks with .url where available
      },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'RapidAPI request failed', url },
      { status: 500 },
    )
  }
}

