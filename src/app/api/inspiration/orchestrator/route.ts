import { NextRequest, NextResponse } from "next/server";

/**
 * Orchestrator service for personalized inspiration.
 * 1. Fetch recommendations from Browse AI
 * 2. Send each recommended video through /api/process-video
 * Returns both raw recommendations and processing statuses.
 */
export async function POST(request: NextRequest) {
  try {
    const { interest, limit = 10 } = await request.json();

    if (!interest) {
      return NextResponse.json({ error: "`interest` is required" }, { status: 400 });
    }

    // Build absolute URLs to other internal services using request URL as base
    const baseUrl = new URL("../..", request.url).origin; // goes up to /api

    // Step 1: Get recommendations
    const recRes = await fetch(`${baseUrl}/api/inspiration/fetch-recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interest, limit }),
    });

    const recJson = await recRes.json();
    if (!recRes.ok || !recJson.success) {
      return NextResponse.json({ error: "Failed to fetch recommendations", details: recJson }, { status: 500 });
    }

    const recommendations: Array<{ url?: string; videoUrl?: string }> = recJson.data || [];

    // Extract video URLs (naively tries both url & videoUrl fields)
    const videoUrls = recommendations
      .map((item) => item.url || item.videoUrl)
      .filter(Boolean) as string[];

    if (videoUrls.length === 0) {
      return NextResponse.json({ success: true, videos: [], processedResults: [] });
    }

    // Step 2: Process videos in parallel
    const processingPromises = videoUrls.map((videoUrl) =>
      fetch(`${baseUrl}/api/process-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      })
        .then(async (r) => ({ ok: r.ok, json: await r.json() }))
        .catch((err) => ({ ok: false, json: { error: err?.message ?? "unknown" } }))
    );

    const settled = await Promise.allSettled(processingPromises);

    const processedResults = settled.map((res, idx) => {
      if (res.status === "fulfilled") {
        return { videoUrl: videoUrls[idx], ...res.value };
      }
      return { videoUrl: videoUrls[idx], ok: false, json: { error: res.reason } };
    });

    return NextResponse.json({ success: true, videos: recommendations, processedResults });
  } catch (error) {
    console.error("[inspiration-orchestrator]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}