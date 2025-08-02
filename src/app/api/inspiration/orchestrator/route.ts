import { NextRequest, NextResponse } from "next/server";

/**
 * Helper ­– poll Browse AI until a task is finished (or times-out).
 */
async function pollBrowseAITask(taskId: string, apiKey: string, maxAttempts = 20, intervalMs = 10_000): Promise<any[]> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const teamId = process.env.BROWSE_AI_TEAM_ID;
      const url = teamId
        ? `https://api.browse.ai/v2/tasks/${taskId}?teamId=${teamId}`
        : `https://api.browse.ai/v2/tasks/${taskId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      // Browse AI sometimes returns 403/404 for a task that is still
      // being provisioned. Treat any non-200 as "still processing" and retry.
      if (!res.ok) {
        const errText = await res.text().catch(() => "<no-body>");
        console.warn(`⏳ [BrowseAI-Poll] Task ${taskId} – HTTP ${res.status} – ${errText}`);
        await new Promise((r) => setTimeout(r, intervalMs));
        continue;
      }

      const json = await res.json();
      const status = json.result?.status;
      console.log(`🔄 [BrowseAI-Poll] Attempt ${attempt}/${maxAttempts} – status: ${status}`);

      if (status === "successful") {
        return json.result?.capturedData ?? json.result?.output ?? [];
      }

      if (status === "failed") {
        throw new Error("Browse AI task failed");
      }
    } catch (err) {
      console.error("❌ [BrowseAI-Poll] Error while polling", err);
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error("Browse AI polling timeout");
}

/**
 * Orchestrator service for personalized inspiration.
 *
 * 1. Trigger Browse AI robot via /api/inspiration/fetch-recommendations.
 * 2. DEVELOPMENT (local) – poll Browse AI directly because the public webhook
 *    is not reachable. When the task completes, forward each captured video to
 *    /api/process-video and return a minimal processedResults array so the UI
 *    can render immediately while heavy processing continues in the background.
 * 3. PRODUCTION – fire-and-forget; the Browse AI dashboard is configured to hit
 *    /api/inspiration/browseai-webhook, which in turn starts the processing
 *    workflow.
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

    // Build absolute URLs to sibling services (stays inside current origin)
    const baseUrl = new URL("../..", request.url).origin; // → /api

    // Step 1 – Trigger Browse AI
    const recRes = await fetch(`${baseUrl}/api/inspiration/fetch-recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interest, limit, robotId }),
    });

    const recJson = await recRes.json();
    if (!recRes.ok || !recJson.success) {
      return NextResponse.json({ error: "Failed to trigger Browse AI", details: recJson }, { status: 500 });
    }

    // When running locally we cannot receive external webhooks → poll instead
    const devMode = process.env.NODE_ENV !== "production";
    if (!devMode) {
      // Production – let the webhook handle everything
      return NextResponse.json({ success: true, queued: true, taskId: recJson.taskId });
    }

    /* -------------------------------------------------------------------- */
    /* Local development – poll Browse AI until the robot finishes           */
    /* -------------------------------------------------------------------- */

    const apiKey =
      process.env.BROWSE_AI_API_KEY ?? "9ee4ab75-87bc-4324-a08e-72bc069c4697:06f085de-7569-435d-ae05-da6a0bba1ba5";

    let capturedData: any[] = [];
    try {
      capturedData = await pollBrowseAITask(recJson.taskId, apiKey, 15, 5_000); // ≈ 75 s max
    } catch {
      return NextResponse.json({ error: "Browse AI polling timed out" }, { status: 504 });
    }

    if (!Array.isArray(capturedData) || capturedData.length === 0) {
      return NextResponse.json({ success: true, processedResults: [] });
    }

    // Fire /api/process-video for each video (do not await completion)
    await Promise.allSettled(
      capturedData.map((item) => {
        const videoUrl = item.url ?? item.videoUrl;
        if (!videoUrl) return null;
        return fetch(`${baseUrl}/api/process-video`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl }),
        });
      }),
    );

    // Minimal payload for the UI while heavy processing continues
    const processedResults = capturedData.map((item) => ({
      videoUrl: item.url ?? item.videoUrl,
      videoData: {
        title: item.title ?? "",
        author: item.author ?? "",
        platform: undefined,
      },
      cdnUrls: undefined,
    }));

    return NextResponse.json({ success: true, processedResults });
  } catch (error) {
    console.error("[inspiration-orchestrator]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
