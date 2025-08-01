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

    // recommendations will be processed asynchronously via webhook
    return NextResponse.json({ success: true, queued: true, taskId: recJson.taskId ?? undefined });
  } catch (error) {
    console.error("[inspiration-orchestrator]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}