import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";

export async function POST(request: NextRequest) {
  console.log("🧩 [VOICE_ORCHESTRATOR] Start");
  try {
    const auth = await authenticateApiKey(request);
    if (auth instanceof NextResponse) return auth;

    const { url, platform, creatorName } = (await request.json()) as {
      url: string;
      platform?: "instagram" | "tiktok" | "unknown";
      creatorName?: string;
    };

    if (!url) return NextResponse.json({ success: false, error: "url is required" }, { status: 400 });

    // 1) Transcribe via existing endpoint
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      authorization: request.headers.get("authorization") ?? "",
    };
    const tRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/video/transcribe`, {
      method: "POST",
      headers,
      body: JSON.stringify({ videoUrl: url, platform: platform ?? "unknown" }),
    });
    if (!tRes.ok) {
      return NextResponse.json({ success: false, error: `Transcription failed: ${tRes.status}` }, { status: 500 });
    }
    const tJson = await tRes.json();
    const transcript: string | undefined = tJson?.transcript;
    if (!transcript) return NextResponse.json({ success: false, error: "No transcript returned" }, { status: 500 });

    // 2) Analyze
    const aRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/voice/analyze`, {
      method: "POST",
      headers,
      body: JSON.stringify({ transcript, sourceUrl: url, platform: platform ?? "unknown", creatorName }),
    });
    if (!aRes.ok) {
      return NextResponse.json({ success: false, error: `Analysis failed: ${aRes.status}` }, { status: 500 });
    }
    const aJson = await aRes.json();

    return NextResponse.json({ success: true, transcript, analysis: aJson.analysis });
  } catch (error) {
    console.error("❌ [VOICE_ORCHESTRATOR] Unexpected error", error);
    return NextResponse.json({ success: false, error: "Orchestration failed" }, { status: 500 });
  }
}
