import { NextRequest } from "next/server";

import { seedKeywordPool } from "@/lib/keyword-rotation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const keywords: unknown = body?.keywords;
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return Response.json({ ok: false, error: "keywords must be a non-empty array" }, { status: 400 });
    }
    const list = keywords.map((k) => String(k)).filter((k) => k.trim().length > 0);
    if (list.length === 0) {
      return Response.json({ ok: false, error: "no valid keywords provided" }, { status: 400 });
    }
    await seedKeywordPool(list);
    return Response.json({ ok: true, added: list.length });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "Failed to seed keyword pool" }, { status: 500 });
  }
}
