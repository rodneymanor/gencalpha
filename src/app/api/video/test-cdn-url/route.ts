import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ success: false, error: "Missing url" }, { status: 400 });
    }

    const parsed = new URL(url);
    const isTikTok = parsed.hostname.includes("tiktok");

    const baseHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      // Prefer video content types explicitly
      Accept: "video/mp4,video/*;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    };
    const h1 = isTikTok
      ? { ...baseHeaders, Referer: "https://www.tiktok.com/", Origin: "https://www.tiktok.com" }
      : baseHeaders;

    // HEAD check
    let headStatus = 0;
    let headOk = false;
    try {
      const headRes = await fetch(url, { method: "HEAD", headers: h1, redirect: "follow" as any });
      headStatus = headRes.status;
      headOk = headRes.ok;
    } catch (e) {}

    // Partial GET (512KB)
    const getHeaders = { ...h1, Range: "bytes=0-524287" };
    const getRes = await fetch(url, { method: "GET", headers: getHeaders, redirect: "follow" as any });
    const contentType = getRes.headers.get("content-type") ?? undefined;
    const contentLength = getRes.headers.get("content-length") ?? undefined;
    const status = getRes.status;
    const ok = getRes.ok;
    let size = 0;
    if (ok) {
      const buf = await getRes.arrayBuffer();
      size = buf.byteLength;
    }

    return NextResponse.json(
      {
        success: ok,
        url,
        head: { ok: headOk, status: headStatus },
        get: { ok, status, size, contentType, contentLength },
        headersUsed: Object.keys(getHeaders),
      },
      { status: ok ? 200 : 400 },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
