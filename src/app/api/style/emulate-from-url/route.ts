import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { UnifiedVideoScraper } from "@/lib/unified-video-scraper";

type SupportedPlatform = "instagram" | "tiktok";

interface EmulateFromUrlBody {
  sourceUrl?: string;
  idea?: string; // user-provided idea/topic description
}

interface TranscribeResponse {
  transcript?: string;
}

interface AnalyzeResponse {
  success: boolean;
  analysis?: string;
  error?: string;
}

interface ScriptResponse {
  success: boolean;
  script?: { hook: string; bridge: string; goldenNugget: string; wta: string };
  error?: string;
}

function getBaseUrl(): string {
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;

    const { sourceUrl, idea }: EmulateFromUrlBody = await request.json();
    if (!sourceUrl || typeof sourceUrl !== "string" || sourceUrl.trim().length === 0) {
      return NextResponse.json({ success: false, error: "sourceUrl is required" }, { status: 400 });
    }
    if (!idea || typeof idea !== "string" || idea.trim().length === 0) {
      return NextResponse.json({ success: false, error: "idea is required" }, { status: 400 });
    }

    console.log("🎬 [EMULATE_FROM_URL] Start → URL:", sourceUrl);

    const base = getBaseUrl();

    // Build auth headers for internal calls
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["authorization"] = authHeader;

    // 1) Detect platform and transcribe via internal service
    const detectedPlatform = UnifiedVideoScraper.detectPlatform(sourceUrl);
    if (detectedPlatform === "unsupported") {
      return NextResponse.json(
        { success: false, error: "Only TikTok and Instagram video URLs are supported" },
        { status: 400 },
      );
    }
    const transcribeRes = await fetch(`${base}/api/video/transcribe`, {
      method: "POST",
      headers,
      body: JSON.stringify({ videoUrl: sourceUrl, platform: detectedPlatform as SupportedPlatform }),
    });
    if (!transcribeRes.ok) {
      return NextResponse.json(
        { success: false, error: `Transcription failed: ${transcribeRes.status}` },
        { status: 500 },
      );
    }
    const transcribed: TranscribeResponse = await transcribeRes.json();
    const transcript = (transcribed.transcript ?? "").trim();
    if (!transcript) {
      return NextResponse.json(
        { success: false, error: "No transcript returned from transcription service" },
        { status: 500 },
      );
    }
    console.log("📝 [EMULATE_FROM_URL] Transcript acquired (length):", transcript.length);

    // 2) Analyze style using dedicated analysis service
    const analyzeRes = await fetch(`${base}/api/analyze/style`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        transcript,
        sourceUrl,
        platform: detectedPlatform === "tiktok" ? "TikTok" : "Instagram",
      }),
    });
    if (!analyzeRes.ok) {
      return NextResponse.json(
        { success: false, error: `Analyze service failed: ${analyzeRes.status}` },
        { status: 500 },
      );
    }
    const analysis: AnalyzeResponse = await analyzeRes.json();
    if (!analysis.success || !analysis.analysis) {
      return NextResponse.json(
        { success: false, error: analysis.error ?? "Missing analysis from Analyze service" },
        { status: 500 },
      );
    }
    console.log("🔎 [EMULATE_FROM_URL] Style analysis ready (chars):", analysis.analysis.length);

    // 3) Generate script using speed writing methodology + style guidance
    const emulatePrompt = `Using the following style profile, write a new short-form video script on the topic: "${idea.trim()}".
Keep the same tone, rhythm, rhetorical devices, and sentence complexity.

STYLE PROFILE:
${analysis.analysis}

Deliver a script with Hook, Bridge, Golden Nugget, and Call to Action sections.`;

    const scriptRes = await fetch(`${base}/api/script/generate-from-prompt`, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt: emulatePrompt, preferJson: true }),
    });
    if (!scriptRes.ok) {
      return NextResponse.json(
        { success: false, error: `Script generation failed: ${scriptRes.status}` },
        { status: 500 },
      );
    }
    const script: ScriptResponse = await scriptRes.json();
    if (!script.success || !script.script) {
      return NextResponse.json(
        { success: false, error: script.error ?? "Script generation returned no result" },
        { status: 500 },
      );
    }

    console.log("✅ [EMULATE_FROM_URL] Script generated successfully");

    return NextResponse.json({
      success: true,
      platform: detectedPlatform,
      transcript,
      analysis: analysis.analysis,
      script: script.script,
    });
  } catch (error) {
    console.error("❌ [EMULATE_FROM_URL] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
