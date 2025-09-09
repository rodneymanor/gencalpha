import { NextRequest } from "next/server";

import { rotateKeywords } from "@/lib/keyword-rotation";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const count = Number(searchParams.get("count") || 3);
  const date = searchParams.get("date") || undefined; // e.g., 2025-09-09 for testing
  const force = searchParams.get("force") === "true";
  try {
    const result = await rotateKeywords({ count, date, force });
    return Response.json({ ok: true, ...result });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "Rotation failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const count = Number(body?.count ?? 3);
    const date = body?.date as string | undefined;
    const force = Boolean(body?.force);
    const result = await rotateKeywords({ count, date, force });
    return Response.json({ ok: true, ...result });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "Rotation failed" }, { status: 500 });
  }
}
