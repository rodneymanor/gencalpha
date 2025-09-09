import { NextRequest } from "next/server";

import { KeywordQuerySchema, saveKeywordQuery } from "@/lib/keyword-queries";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = KeywordQuerySchema.parse(body);
    const saved = await saveKeywordQuery(parsed);
    return Response.json({ ok: true, data: saved }, { status: 201 });
  } catch (err: any) {
    const message = err?.issues?.length ? err.issues : err?.message || "Invalid request";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
