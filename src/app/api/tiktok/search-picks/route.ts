import { NextRequest } from "next/server";

import { getProcessedScriptsForKeyword } from "@/lib/daily-picks";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("keyword") || searchParams.get("q") || "";
    const userId = searchParams.get("userId") || "public";
    const { scripts } = await getProcessedScriptsForKeyword({ keyword, userId });
    return Response.json(
      { ok: true, count: scripts.length, scripts, query: keyword },
      { status: 200 },
    );
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "Failed to get search picks" }, { status: 500 });
  }
}

