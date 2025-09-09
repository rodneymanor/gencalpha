import { NextRequest } from "next/server";

import { pickSmallest540PerItem, searchTikTok, TikTokFilterOptions } from "@/lib/tiktok/search";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") || "Artificial intelligence tips";
  const cursor = Number(searchParams.get("cursor") || 0);
  const searchId = Number(searchParams.get("search_id") || 0);

  try {
    const resp = await searchTikTok(keyword, cursor, searchId);
    const filter: TikTokFilterOptions = {};
    if (searchParams.get("minViews")) filter.minViews = Number(searchParams.get("minViews"));
    if (searchParams.get("maxViews")) filter.maxViews = Number(searchParams.get("maxViews"));
    if (searchParams.get("minLikes")) filter.minLikes = Number(searchParams.get("minLikes"));
    if (searchParams.get("maxDurationSec")) filter.maxDurationSec = Number(searchParams.get("maxDurationSec"));
    if (searchParams.get("withinDays")) filter.withinDays = Number(searchParams.get("withinDays"));
    const videos = pickSmallest540PerItem(resp, Object.keys(filter).length ? filter : undefined);
    return Response.json({ ok: true, keyword, count: videos.length, videos }, { status: 200 });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || "Unknown error" }, { status: 500 });
  }
}
