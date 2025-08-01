import { NextRequest, NextResponse } from "next/server";

/**
 * Browse AI webhook endpoint.
 * The Browse AI robot must be configured to POST its task.completed payload here.
 * Payload example (simplified):
 * {
 *   "type": "task.completed",
 *   "data": {
 *     "taskId": "...",
 *     "status": "successful",
 *     "capturedData": [ { "url": "https://..." }, ... ]
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  const reqId = Math.random().toString(36).substring(2, 9);
  try {
    const payload = await request.json();
    console.log(`📡 [BrowseAI-Webhook][${reqId}] Received`, payload?.type);

    const captured: Array<{ url?: string; videoUrl?: string }> =
      payload?.data?.capturedData ?? payload?.data?.output ?? [];

    if (!Array.isArray(captured) || captured.length === 0) {
      console.log(`📡 [BrowseAI-Webhook][${reqId}] No captured items ➜ exit`);
      return NextResponse.json({ success: true });
    }

    // Process sequentially via existing /api/process-video route
    const baseUrl = new URL("../..", request.url).origin;

    for (const item of captured) {
      const videoUrl = item.url ?? item.videoUrl;
      if (!videoUrl) continue;

      console.log(`📡 [BrowseAI-Webhook][${reqId}] ⏳ Processing`, videoUrl);
      try {
        const resp = await fetch(`${baseUrl}/api/process-video`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl }),
        });
        const json = await resp.json();
        console.log(`📡 [BrowseAI-Webhook][${reqId}] ✅ Done`, {
          videoUrl,
          ok: resp.ok,
          requestId: json?.requestId,
        });
      } catch (err) {
        console.error(`📡 [BrowseAI-Webhook][${reqId}] ❌ Failed`, err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`📡 [BrowseAI-Webhook][${reqId}] Error`, error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
