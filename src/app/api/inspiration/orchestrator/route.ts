import { NextRequest, NextResponse } from "next/server";

/**
 * Orchestrator service for personalized inspiration.
 * 1. Fetch recommendations from Browse AI
 * 2. Send each recommended video through /api/process-video
 * Returns both raw recommendations and processing statuses.
 */
export async function POST(request: NextRequest) {
  try {
    const {
      interest: bodyInterest,
      hashtag,
      limit: bodyLimit,
      max_videos,
      robotId: incomingRobotId,
    } = await request.json();

    const interest = bodyInterest ?? hashtag;
    const limit = bodyLimit ?? max_videos ?? 10;
    const robotId = incomingRobotId ?? process.env.BROWSE_AI_ROBOT_ID;

    if (!interest) {
      return NextResponse.json({ error: "`interest` is required" }, { status: 400 });
    }

    // Build absolute URLs to other internal services using request URL as base
    const baseUrl = new URL("../..", request.url).origin; // goes up to /api

    // Step 1: Get recommendations
    const recRes = await fetch(`${baseUrl}/api/inspiration/fetch-recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interest, limit, robotId }),
    });

    const recJson = await recRes.json();
    if (!recRes.ok || !recJson.success) {
      return NextResponse.json({ error: "Failed to fetch recommendations", details: recJson }, { status: 500 });
    }

    const recommendations: Array<{ url?: string; videoUrl?: string }> = recJson.data ?? [];

    // Extract video URLs (naively tries both url & videoUrl fields)
    const videoUrls = recommendations.map((item) => item.url ?? item.videoUrl).filter(Boolean) as string[];

    if (videoUrls.length === 0) {
      return NextResponse.json({ success: true, videos: [], processedResults: [] });
    }

    // Step 2: Process videos SEQUENTIALLY to avoid rate limits
    const requestId = Math.random().toString(36).substring(2, 9);
    console.log(`🎬 [Orchestrator][${requestId}] Processing ${videoUrls.length} videos sequentially`);
    const processedResults: Array<{ videoUrl: string; ok: boolean; json: any }> = [];
    for (const videoUrl of videoUrls) {
      try {
        console.log(`🎬 [Orchestrator][${requestId}] ⏳ Processing`, videoUrl);
        const resp = await fetch(`${baseUrl}/api/process-video`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl }),
        });
        const json = await resp.json();
        processedResults.push({ videoUrl, ok: resp.ok, json });
        console.log(`🎬 [Orchestrator][${requestId}] ✅ Finished`, { videoUrl, ok: resp.ok });
      } catch (err: any) {
        processedResults.push({ videoUrl, ok: false, json: { error: err?.message ?? "unknown" } });
      }
    }

    return NextResponse.json({ success: true, videos: recommendations, processedResults });
  } catch (error) {
    console.error("[inspiration-orchestrator]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
