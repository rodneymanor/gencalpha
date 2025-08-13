import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

interface EmulateBody {
  transcript?: string;
  newTopic?: string;
  sourceUrl?: string;
  platform?: "TikTok" | "Instagram" | "Unknown";
}

async function callAnalyzeService(headers: HeadersInit, body: Omit<EmulateBody, "newTopic">) {
  const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
  const res = await fetch(`${base}/api/analyze/style`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Analyze service failed: ${res.status}`);
  return res.json() as Promise<{ success: boolean; analysis: string }>;
}

async function callScriptGenerator(headers: HeadersInit, emulatePrompt: string) {
  const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
  const res = await fetch(`${base}/api/script/generate-from-prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ prompt: emulatePrompt, preferJson: true }),
  });
  if (!res.ok) throw new Error(`Script generation failed: ${res.status}`);
  return res.json() as Promise<{ success: boolean; script?: any; error?: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.user.uid;

    const { transcript, newTopic, sourceUrl, platform = "Unknown" }: EmulateBody = await request.json();
    if (!transcript || !newTopic) {
      return NextResponse.json({ success: false, error: "transcript and newTopic are required" }, { status: 400 });
    }

    const headers: HeadersInit = {};
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["authorization"] = authHeader;

    // 1) Analyze
    const analyzePromise = callAnalyzeService(headers, { transcript, sourceUrl, platform });

    // 2) Prepare prompt for style emulation using the analysis
    const analyzeResult = await analyzePromise;
    const styleProfile = analyzeResult.analysis;
    const emulatePrompt = `Using the following style profile, write a new short-form video script on the topic: "${newTopic}". Keep the same tone, rhythm, rhetorical devices, and sentence complexity.\n\nSTYLE PROFILE:\n${styleProfile}\n\nDeliver a script with Hook, Bridge, Golden Nugget, and Call to Action sections.`;

    const scriptResult = await callScriptGenerator(headers, emulatePrompt);
    if (!scriptResult.success || !scriptResult.script) {
      return NextResponse.json(
        { success: false, error: scriptResult.error ?? "Script generation failed" },
        { status: 500 },
      );
    }

    // Persist to Firestore
    const adminDb = getAdminDb();
    if (!isAdminInitialized || adminDb == null) {
      return NextResponse.json({ success: false, error: "Admin SDK not configured" }, { status: 500 });
    }

    const ref = await adminDb.collection("styleEmulations").add({
      userId,
      sourceUrl: sourceUrl ?? null,
      platform,
      transcript,
      analysis: styleProfile,
      newTopic,
      script: scriptResult.script,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      emulationId: ref.id,
      analysis: styleProfile,
      script: scriptResult.script,
    });
  } catch (error) {
    console.error("❌ [STYLE_EMULATE] Error:", error);
    return NextResponse.json({ success: false, error: "Style emulation failed" }, { status: 500 });
  }
}
