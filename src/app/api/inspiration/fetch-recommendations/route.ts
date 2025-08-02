import { NextRequest, NextResponse } from "next/server";

/**
 * Fetch personalized video recommendations from Browse AI
 * Expects JSON body: { interest: string; limit?: number; robotId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { interest, limit = 10, robotId } = await request.json();

    if (!interest) {
      return NextResponse.json({ error: "`interest` is required" }, { status: 400 });
    }

    const apiKey =
      process.env.BROWSE_AI_API_KEY ?? "9ee4ab75-87bc-4324-a08e-72bc069c4697:06f085de-7569-435d-ae05-da6a0bba1ba5";
    const robot = robotId ?? process.env.BROWSE_AI_ROBOT_ID;

    if (!robot) {
      return NextResponse.json({ error: "Browse AI robot ID not provided" }, { status: 400 });
    }

    // 1. Trigger Browse AI robot
    const reqId = Math.random().toString(36).substring(2, 9);
    const requestPayload = {
      inputParameters: {
        query: interest,
      },
    };
    console.log(`🤖 [BrowseAI][${reqId}] Triggering robot`, { robot, interest, limit });
    console.log(`🤖 [BrowseAI][${reqId}] Request payload:`, JSON.stringify(requestPayload, null, 2));

    const triggerRes = await fetch(`https://api.browse.ai/v2/robots/${robot}/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    console.log(`🤖 [BrowseAI][${reqId}] Trigger response status`, triggerRes.status);
    if (!triggerRes.ok) {
      const text = await triggerRes.text();
      console.error(`🤖 [BrowseAI][${reqId}] Error response:`, text);
      return NextResponse.json({ error: "Failed to trigger Browse AI task", details: text }, { status: 500 });
    }

    const triggerJson = await triggerRes.json();
    const taskId = triggerJson.result?.id ?? triggerJson.id;
    console.log(`🤖 [BrowseAI][${reqId}] TaskId`, taskId);

    // 2. Quick check - try once with short timeout, then return task ID for async processing
    try {
      await new Promise((r) => setTimeout(r, 5000)); // Wait 5 seconds
      const statusRes = await fetch(`https://api.browse.ai/v2/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const taskData = await statusRes.json();

      console.log(`🤖 [BrowseAI][${reqId}] Quick check status`, taskData?.result?.status);

      if (taskData?.result?.status === "successful") {
        const capturedData = taskData.result?.capturedData ?? taskData.result?.output ?? [];
        console.log(`🤖 [BrowseAI][${reqId}] Captured items`, capturedData.length);
        return NextResponse.json({ success: true, data: capturedData });
      }
    } catch (pollError) {
      console.log(`🤖 [BrowseAI][${reqId}] Poll error (continuing):`, pollError);
    }

    // Return task ID for async processing
    console.log(`🤖 [BrowseAI][${reqId}] Task initiated, returning task ID for async processing`);
    return NextResponse.json({
      success: true,
      taskId,
      message: "Task initiated - check back later for results",
      data: [], // Return empty array as fallback
    });
  } catch (error) {
    console.error("[fetch-recommendations]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
